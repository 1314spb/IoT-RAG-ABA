import os
import json
import random
import torch
from torch.utils.data import DataLoader
from torch.nn.utils.rnn import pad_sequence

from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig, TrainingArguments, Trainer, default_data_collator
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training, PeftModel
import evaluate
import sacrebleu

# Ensure we are using bfloat16 precision and 4-bit quantization for QLoRA
# Configure bitsandbytes 4-bit quantization (NF4 quantization with double quantization for stability)
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_use_double_quant=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.bfloat16  # computations in bfloat16 for speed and stability
)

# Script configuration (could be replaced by argparse for flexibility)
BASE_MODEL = "path_or_hf_id_to_llama3_70b_model"  
DATA_PATH = "path_to_dataset.json"               
OUTPUT_DIR = "lora-ga-finetune-checkpoint"       
NUM_TRAIN_EPOCHS = 3                             
TRAIN_BATCH_SIZE = 4                             
GRADIENT_ACCUMULATION_STEPS = 8                  
LEARNING_RATE = 2e-4                             
# Generation/Evaluation settings
EVAL_BATCH_SIZE = 4                              
MAX_NEW_TOKENS = 200                             
USE_SAMPLING = False                             
TEMPERATURE = 1.0                                
TOP_P = 0.9                                      

# Load the tokenizer
tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL, use_fast=False)
# For LLaMA models, set the pad token to the EOS token (to avoid undefined pad token issues)
if tokenizer.pad_token_id is None:
    tokenizer.pad_token_id = tokenizer.eos_token_id

# Load the pretrained model with 4-bit precision and FlashAttention-2 (if available)
try:
    model = AutoModelForCausalLM.from_pretrained(
        BASE_MODEL,
        device_map="auto",              # automatically distribute the model across available GPUs
        torch_dtype=torch.bfloat16,     # use bfloat16 precision for model weights
        quantization_config=bnb_config, # apply 4-bit quantization (QLoRA)
        use_flash_attention_2=True,     # enable FlashAttention-2 for faster training (requires flash_attn library)
        trust_remote_code=True          # allow custom code (needed if model is from HF Hub with custom implementation)
    )
except Exception as e:
    print(f"[Warning] Model loading with FlashAttention-2 failed: {e}")
    print("Retrying model load without FlashAttention-2...")
    model = AutoModelForCausalLM.from_pretrained(
        BASE_MODEL,
        device_map="auto",
        torch_dtype=torch.bfloat16,
        quantization_config=bnb_config,
        trust_remote_code=True
    )

# Prepare model for 4-bit LoRA training
# This freezes the base model's weights and fixes any layers (e.g., norm layers) to be in float32 for stability.
model = prepare_model_for_kbit_training(model)

# Set up LoRA configuration (Low-Rank Adaptation parameters)
lora_config = LoraConfig(
    r=8,              # LoRA rank (trade-off between capacity and efficiency)
    lora_alpha=16,    # LoRA scaling factor
    target_modules=["q_proj", "v_proj"],  # target attention projection matrices to adapt (query and value)&#8203;:contentReference[oaicite:2]{index=2}
    lora_dropout=0.05, # slight dropout on LoRA layers for regularization
    bias="none",      # do not add bias terms
    task_type="CAUSAL_LM"  # type of task
)

# Inject LoRA adapters into the model
model = get_peft_model(model, lora_config)
model.print_trainable_parameters()  # log how many parameters will be updated (LoRA parameters)

# If using LoRA-GA initialization:
# LoRA-GA (Gradient Approximation) aligns low-rank updates with the model's initial gradient directions for faster convergence&#8203;:contentReference[oaicite:3]{index=3}.
# Implementing LoRA-GA would involve a custom initialization of the LoRA layers using a gradient snapshot.
# (This step is complex and requires computing gradients on a batch to initialize LoRA weights, so it's omitted here for brevity.)

# Split the dataset into training and validation sets (e.g., 90/10 split)
print("Loading and splitting dataset...")
with open(DATA_PATH, 'r') as f:
    data_list = json.load(f)  # expecting a JSON file that contains a list of examples (dicts)
# Shuffle data before splitting to ensure random distribution between train/val
random.seed(42)
random.shuffle(data_list)
split_idx = int(len(data_list) * 0.1)  # 10% for validation
val_data = data_list[:split_idx]
train_data = data_list[split_idx:]
print(f"Total examples: {len(data_list)} | Training: {len(train_data)} | Validation: {len(val_data)}")

# Define a function to tokenize and format examples for causal LM fine-tuning
def preprocess_example(example):
    """
    Convert a raw example from the dataset into model input and target tensors.
    Each example is expected to have an input prompt and a reference response.
    """
    # Example assumes keys "prompt" and "response" in the JSON. Adjust if your dataset uses different keys.
    prompt_text = example.get("prompt") or example.get("instruction") or example.get("input") or ""
    response_text = example.get("response") or example.get("output") or example.get("answer") or ""
    # Add a prefix or special formatting if needed (e.g., for instruction-based prompts). Here we keep it simple.
    # Ensure the prompt and response are separated. We'll use the BOS token at start and EOS at end of response.
    bos = tokenizer.bos_token_id
    eos = tokenizer.eos_token_id
    # Encode prompt and response separately
    prompt_ids = tokenizer.encode(prompt_text, add_special_tokens=False)
    response_ids = tokenizer.encode(response_text, add_special_tokens=False)
    # Build combined sequence: [BOS] prompt tokens || response tokens || [EOS]
    if bos is not None:
        input_ids = [bos] + prompt_ids + response_ids + ([eos] if eos is not None else [])
        # Label: mask prompt part, only include response (and EOS) for loss
        labels = [-100] * (1 + len(prompt_ids)) + response_ids + ([eos] if eos is not None else [])
    else:
        # If bos_token_id is not defined (unlikely for LLaMA), just concatenate
        input_ids = prompt_ids + response_ids + ([eos] if eos is not None else [])
        labels = [-100] * len(prompt_ids) + response_ids + ([eos] if eos is not None else [])
    # Truncate sequences that are too long (to fit model's context window)
    if len(input_ids) > model.config.max_position_embeddings:
        # If input is too long, truncate from the beginning of the prompt (keep last part of prompt and all of response)
        over_length = len(input_ids) - model.config.max_position_embeddings
        input_ids = input_ids[over_length:]
        labels = labels[over_length:]
        # Ensure the prompt portion in labels is still masked after truncation
        prompt_cut = max(0, len(labels) - len(response_ids) - (1 if eos is not None else 0) - len(prompt_ids))
        for i in range(prompt_cut):
            labels[i] = -100
    return {"input_ids": input_ids, "labels": labels}

# Tokenize and preprocess the training and validation sets
train_dataset = [preprocess_example(ex) for ex in train_data]
val_dataset   = [preprocess_example(ex) for ex in val_data]

# Define a custom data collator to pad sequences to the same length in a batch
def collate_fn(batch):
    # Convert list of dicts to dict of tensors, with padding
    input_tensors = [torch.tensor(item["input_ids"], dtype=torch.long) for item in batch]
    label_tensors = [torch.tensor(item["labels"], dtype=torch.long) for item in batch]
    # Pad sequences to the longest sequence in the batch
    input_ids_padded = pad_sequence(input_tensors, batch_first=True, padding_value=tokenizer.pad_token_id)
    labels_padded = pad_sequence(label_tensors, batch_first=True, padding_value=-100)
    # Create attention mask (1 for real tokens, 0 for padding)
    attention_mask = (input_ids_padded != tokenizer.pad_token_id).long()
    return {
        "input_ids": input_ids_padded,
        "attention_mask": attention_mask,
        "labels": labels_padded
    }

# Set up training arguments for the Hugging Face Trainer
training_args = TrainingArguments(
    output_dir=OUTPUT_DIR,
    overwrite_output_dir=True,
    num_train_epochs=NUM_TRAIN_EPOCHS,
    per_device_train_batch_size=TRAIN_BATCH_SIZE,
    per_device_eval_batch_size=1,  # not used in our manual eval, but required by Trainer
    gradient_accumulation_steps=GRADIENT_ACCUMULATION_STEPS,
    evaluation_strategy="no",      # we'll do evaluation after training manually
    save_strategy="no",            # disable automatic checkpoint saves to focus on final checkpoint
    learning_rate=LEARNING_RATE,
    fp16=False,                    # we use bf16, not fp16 (fp16 can be disabled if bf16 is available)
    bf16=torch.cuda.is_available(),# enable bfloat16 training if supported by GPU
    optim="adamw_torch",           # optimizer
    logging_steps=50,
    lr_scheduler_type="cosine",    # scheduler (cosine decay as an example)
    warmup_ratio=0.03,             # warmup for a small portion of training
    dataloader_pin_memory=True
)

# Initialize the Trainer with our model and data
trainer = Trainer(
    model=model,
    train_dataset=train_dataset,
    # No separate eval_dataset here since we'll handle evaluation manually for more control
    args=training_args,
    data_collator=collate_fn,         # use our custom collator for padding
)

# Begin fine-tuning
print("Starting training...")
trainer.train()
print("Training complete.")

# Save the final LoRA-adapted model (adapter weights)
print(f"Saving LoRA adapter to {OUTPUT_DIR}...")
os.makedirs(OUTPUT_DIR, exist_ok=True)
model.save_pretrained(OUTPUT_DIR)  # this saves the LoRA weights and configuration

# Switch model to evaluation mode
model.eval()
# Disable gradient calculations for inference
torch.set_grad_enabled(False)

# Perform batched inference on the validation set
print("Running inference on validation set...")
predictions = []
references = []
total_batches = (len(val_dataset) + EVAL_BATCH_SIZE - 1) // EVAL_BATCH_SIZE
for i in range(total_batches):
    batch_start = i * EVAL_BATCH_SIZE
    batch_end = min(len(val_dataset), (i+1) * EVAL_BATCH_SIZE)
    batch = val_dataset[batch_start:batch_end]
    # Prepare input batch for generation
    batch_prompts = []
    for item in batch:
        # Reconstruct the prompt text from input_ids by removing the response part and special tokens
        # Find where prompt tokens end (first -100 in labels indicates start of response)
        labels = item["labels"]
        # If -100 is in labels, the prompt length = index of first non -100 label
        if -100 in labels:
            prompt_length = labels.index(next(filter(lambda x: x != -100, labels))) if any(x != -100 for x in labels) else len(labels)
        else:
            prompt_length = len(labels) - len(tokenizer.encode(item["labels"]))  # fallback (not expected to happen with -100 present)
        prompt_ids = item["input_ids"][:prompt_length]  # this should include BOS + prompt tokens
        prompt_text = tokenizer.decode(prompt_ids, skip_special_tokens=True)
        batch_prompts.append(prompt_text)
    # Tokenize batch prompts (with padding) for generation
    enc = tokenizer(batch_prompts, return_tensors='pt', padding=True, truncation=True, max_length=model.config.max_position_embeddings)
    input_ids = enc["input_ids"].to(model.device)  # move to same device(s) as model
    attention_mask = enc["attention_mask"].to(model.device)
    # Configure generation parameters
    gen_kwargs = {
        "max_new_tokens": MAX_NEW_TOKENS,
        "do_sample": USE_SAMPLING,
        "eos_token_id": tokenizer.eos_token_id,
        "pad_token_id": tokenizer.pad_token_id,
        "attention_mask": attention_mask
    }
    if USE_SAMPLING:
        gen_kwargs.update({"temperature": TEMPERATURE, "top_p": TOP_P, "top_k": 0})
    # Generate outputs for the batch
    generated_outputs = model.generate(input_ids=input_ids, **gen_kwargs)
    # Decode and post-process each generated sequence
    for j, output_ids in enumerate(generated_outputs):
        # Separate the prompt portion from generated portion in the output sequence
        prompt_len = (attention_mask[j] == 1).sum().item()  # length of prompt (number of non-pad tokens in input)
        gen_tokens = output_ids[prompt_len:]  # skip the prompt tokens in the output
        pred_text = tokenizer.decode(gen_tokens, skip_special_tokens=True)
        # Retrieve the reference output text corresponding to this prompt
        ref_text = val_data[batch_start + j].get("response") or val_data[batch_start + j].get("output") or val_data[batch_start + j].get("answer") or ""
        predictions.append(pred_text.strip())
        references.append(ref_text.strip())

# Compute evaluation metrics: ROUGE and BLEU
print("Calculating ROUGE and BLEU scores...")
rouge = evaluate.load('rouge')
rouge_scores = rouge.compute(predictions=predictions, references=references)
bleu_score = sacrebleu.corpus_bleu(predictions, [references]).score

print("ROUGE scores:", rouge_scores)
print(f"BLEU score: {bleu_score:.2f}")

# Save predictions and references to a file for inspection
results_path = os.path.join(OUTPUT_DIR, "predictions.json")
with open(results_path, "w", encoding="utf-8") as f:
    results = [
        {"prompt": (val_data[idx].get("prompt") or val_data[idx].get("instruction") or val_data[idx].get("input") or "").strip(),
         "reference": references[idx],
         "prediction": predictions[idx]}
        for idx in range(len(predictions))
    ]
    json.dump(results, f, indent=2, ensure_ascii=False)

print(f"Saved predictions and references to {results_path}")
print("Evaluation complete. You can now review the generated outputs and metrics.")
