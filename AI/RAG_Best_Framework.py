import json
import logging
import pandas as pd
from sentence_transformers import SentenceTransformer, util

# ====================================================
# RAG_Best_Framework.py
# ====================================================
# This script demonstrates a "best RAG" approach for generating
# tailored ABA tasks by combining:
# 1) Semantic search in an ABA task dataset + additional task list
# 2) IoT data integration into the prompt
# 3) A mock function to simulate communication with a remote fine-tuned LLM server

logging.basicConfig(filename="rag_errors.log", level=logging.ERROR)

# ---------------------------
# Load local data: ABA tasks + other tasks
# ---------------------------
database_path = "PATH_TO_ABA_DATA.xlsx"  # Replace with your actual path to ABA dataset
data = pd.read_excel(database_path)

# Fill NaN and convert to string in important columns
data['Domain'] = data['Domain'].fillna('').astype(str)
data['Task'] = data['Task'].fillna('').astype(str)
data['Sub-Task'] = data['Sub-Task'].fillna('').astype(str)

# Merge the key columns for semantic searching
data['Combined'] = data.apply(
    lambda row: f"Domain: {row['Domain']}; Task: {row['Task']}; Sub-Task: {row['Sub-Task']}",
    axis=1
)

othertasklist_path = "PATH_TO_OTHER_TASKLIST.txt"  # Replace with your actual path
with open(othertasklist_path, 'r', encoding='utf-8') as f:
    othertasklist = [line.strip() for line in f if line.strip()]

# ---------------------------
# Load SentenceTransformer model & precompute embeddings
# ---------------------------
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
semantic_embeddings_db = embedding_model.encode(data['Combined'].tolist(), convert_to_tensor=True)
semantic_embeddings_other = embedding_model.encode(othertasklist, convert_to_tensor=True)

# ---------------------------
# Semantic search function
# ---------------------------
def semantic_search(query, embeddings, dataset, top_k=3, is_other=False):
    """
    Performs semantic search and returns results as a formatted string.
      - query: user query text
      - embeddings: precomputed embedding vectors
      - dataset: either the ABA dataframe or the 'othertasklist' list
      - top_k: number of top results to return
      - is_other: boolean indicating if it's for the additional task list
    """
    query_embedding = embedding_model.encode(query, convert_to_tensor=True)
    scores = util.pytorch_cos_sim(query_embedding, embeddings)[0]

    results_str_list = []
    if is_other:
        results_str_list.append(f"Search results in 'Other Tasklist' for: {query}")
    else:
        results_str_list.append(f"Search results in 'ABA Task Dataset' for: {query}")

    found_any = False
    top_indices = scores.topk(k=top_k).indices.tolist()
    for i, idx in enumerate(top_indices):
        score = scores[idx].item()
        # You can adjust this threshold as needed
        if score > 0.3:
            if is_other:
                text = othertasklist[idx]
                results_str_list.append(f"{i+1}. {text} (Score: {score:.4f})")
            else:
                row = dataset.iloc[idx]
                text = f"Domain: {row['Domain']}; Task: {row['Task']}; Sub-Task: {row['Sub-Task']}"
                results_str_list.append(f"{i+1}. {text} (Score: {score:.4f})")
            found_any = True

    if not found_any:
        results_str_list.append("No matching results found.")

    return "\n".join(results_str_list)

# ---------------------------
# Build final prompt with retrieved content + IoT data
# ---------------------------
def build_prompt(retrieved_content: str, iot_data: dict) -> str:
    """
    Constructs a prompt by combining semantic retrieval results and IoT data.
      - retrieved_content: textual results from semantic searches
      - iot_data: a dictionary containing sensor outputs or emotional predictions
    """
    # Convert IoT data dict into a readable string
    iot_data_str = "IoT data:\n"
    for key, value in iot_data.items():
        iot_data_str += f"  {key}: {value}\n"

    # Generate the final prompt
    prompt = (
        f"{retrieved_content}\n\n"
        f"{iot_data_str}\n"
        "Combine the above information to create a new customized ABA task.\n"
        "Use ONLY the following format to generate the response:\n"
        "domain:\n"
        "task:\n"
        "subtask:\n"
        "description:\n"
        "reason:"
    )
    return prompt

# ---------------------------
# Mock function simulating LLM server call
# ---------------------------
def call_finetuned_llm_server(prompt: str):
    """
    Simulates sending the prompt to a remote fine-tuned LLM server
    and receiving a generated text response.
    In a real scenario, you would use something like requests.post(...).
    """
    print("=== Mock LLM Server ===")
    print("Prompt sent to remote model:\n", prompt)
    # Here we just return a placeholder response
    response_text = (
        "domain: Social Emotion\n"
        "task: Turn-Taking Game\n"
        "subtask: Encourage reciprocal interaction\n"
        "description: Provide a simple turn-taking puzzle to promote joint attention.\n"
        "reason: IoT data shows partial engagement, so we use a moderately challenging but fun activity.\n"
    )
    return response_text

# ---------------------------
# Main function to handle RAG + IoT + LLM
# ---------------------------
def handle_best_rag_request(request_json: dict) -> dict:
    """
    Orchestrates the best RAG flow:
      1) Extract domain or user query from request_json
      2) Perform semantic searches in both ABA dataset and other task list
      3) Combine results
      4) Include IoT data in the prompt
      5) Call the mock fine-tuned LLM server
      6) Return the generated content
    """
    # 1) Extract user query and IoT data
    user_query = request_json.get("query", "").strip()
    iot_data = request_json.get("iot_data", {})

    # 2) Semantic search in ABA dataset
    results_in_aba = semantic_search(
        user_query,
        semantic_embeddings_db,
        data,
        top_k=5,
        is_other=False
    )

    # 3) Semantic search in 'other tasklist'
    results_in_other = semantic_search(
        user_query,
        semantic_embeddings_other,
        othertasklist,
        top_k=3,
        is_other=True
    )

    # 4) Combine retrieved results
    retrieved_content = results_in_aba + "\n\n" + results_in_other

    # 5) Build prompt (with IoT data)
    final_prompt = build_prompt(retrieved_content, iot_data)

    # 6) Simulate call to the fine-tuned LLM server
    llm_response = call_finetuned_llm_server(final_prompt)

    # 7) Return as JSON-like dictionary
    return {
        "status": "ok",
        "model_response": llm_response
    }


# ===========================
# Example usage (for testing)
# ===========================
if __name__ == "__main__":
    test_request = {
        "query": "communication skill building",
        "iot_data": {
            "emotional_state": "partially_compliant",
            "stress_level": 0.4,
            "heart_rate": 85
        }
    }

    result = handle_best_rag_request(test_request)
    print("\n=== Final Output ===")
    print(json.dumps(result, indent=2))
