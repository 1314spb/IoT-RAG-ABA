import pandas as pd
import numpy as np
import torch
import torch.nn as nn
from torch.optim import AdamW
from torch.utils.data import Dataset, DataLoader, WeightedRandomSampler
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import confusion_matrix, classification_report

# ====================================================
# IoT_Transformer_Improved_Classification.py
# ====================================================
# This script demonstrates a transformer-improved deep learning model training approach,
# but here it's presented in a feed-forward network structure by default.
# It follows similar steps of data reading, cleaning, 3-sigma filtering, label encoding,
# WeightedRandomSampler usage, classification, and threshold-based post-processing for a specific class.

# =======================================
# 1. Data Loading and Preprocessing
# =======================================
file_path = "PATH_TO_YOUR_DATA.xlsx"  # Replace with your actual Excel file path
sheet_name = "SHEET_NAME"            # Replace with the target sheet name in your Excel file

df = pd.read_excel(file_path, sheet_name=sheet_name)

# Specify the feature columns and label column
features = [
    'BVP', 'GSR', 'wrist temp',
    'acceleration_x', 'acceleration_y', 'acceleration_z',
    'acceleration'
]
label_col = 'Trial Reuslt'  # Replace if your column name differs

# Drop rows with NaN values in specified columns
df.dropna(subset=features + [label_col], inplace=True)

# Remove extreme outliers using 3-sigma filtering on numeric columns
z_scores = np.abs((df[features] - df[features].mean()) / df[features].std())
df = df[(z_scores < 3.0).all(axis=1)]

# Encode the label column
label_encoder = LabelEncoder()
df['label_encoded'] = label_encoder.fit_transform(df[label_col])

# Standardize the feature columns
scaler = StandardScaler()
X = scaler.fit_transform(df[features])
y = df['label_encoded'].values

# Split the data into training and testing sets
# We also keep the original indices if needed for advanced usage
X_train, X_test, y_train, y_test, idx_train, idx_test = train_test_split(
    X, y, df.index, test_size=0.2, random_state=42, stratify=y
)
print("Training set size:", len(X_train), "Testing set size:", len(X_test))

# =======================================
# 2. Custom Dataset
# =======================================
class IOTDataset(Dataset):
    def __init__(self, X_data, y_data, indices):
        self.X_data = torch.tensor(X_data, dtype=torch.float32)
        self.y_data = torch.tensor(y_data, dtype=torch.long)
        self.indices = torch.tensor(indices, dtype=torch.long)  # May be used for tracking

    def __len__(self):
        return len(self.X_data)

    def __getitem__(self, idx):
        return self.X_data[idx], self.y_data[idx], self.indices[idx]

train_dataset = IOTDataset(X_train, y_train, idx_train)
test_dataset  = IOTDataset(X_test,  y_test,  idx_test)

# =======================================
# 3. WeightedRandomSampler 
# =======================================
# If the dataset is highly imbalanced, WeightedRandomSampler can help.
# If you want to see the effect of normal training first, you can comment out the sampler and use shuffle=True.

class_counts = np.bincount(y_train)       # E.g., [count_class_0, count_class_1, ...]
weights = 1.0 / class_counts             # Weights inversely proportional to class counts
sample_weights = weights[y_train]        # Assign each sample a weight

sampler = WeightedRandomSampler(
    sample_weights,
    num_samples=len(sample_weights),
    replacement=True
)

batch_size = 32
train_loader = DataLoader(
    train_dataset,
    batch_size=batch_size,
    sampler=sampler,  # For balanced sampling
    drop_last=False
)

test_loader = DataLoader(
    test_dataset,
    batch_size=batch_size,
    shuffle=False,  # Keep deterministic order in testing
    drop_last=False
)

# =======================================
# 4. Define Network
# =======================================
class SimpleNN(nn.Module):
    def __init__(self, input_dim, num_classes):
        super(SimpleNN, self).__init__()
        # This can be replaced or extended with a transformer-based architecture if desired
        self.net = nn.Sequential(
            nn.Linear(input_dim, 128),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Linear(64, num_classes)
        )

    def forward(self, x):
        return self.net(x)

num_classes = len(label_encoder.classes_)
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

clf_model = SimpleNN(len(features), num_classes).to(device)

# =======================================
# 5. Training Configuration
# =======================================
criterion = nn.CrossEntropyLoss()
optimizer = AdamW(clf_model.parameters(), lr=1e-3, weight_decay=1e-4)

epochs = 30
for epoch in range(1, epochs + 1):
    clf_model.train()
    total_loss = 0.0
    total_samples = 0
    correct = 0

    for data_batch, target_batch, _ in train_loader:
        data_batch, target_batch = data_batch.to(device), target_batch.to(device)
        optimizer.zero_grad()

        outputs = clf_model(data_batch)
        loss = criterion(outputs, target_batch)
        loss.backward()
        optimizer.step()

        total_loss += loss.item()
        _, predicted = outputs.max(1)
        correct += predicted.eq(target_batch).sum().item()
        total_samples += target_batch.size(0)

    train_acc = 100.0 * correct / total_samples
    avg_loss = total_loss / len(train_loader)
    print(f"Epoch [{epoch}/{epochs}] | Loss: {avg_loss:.4f} | Train Accuracy: {train_acc:.2f}%")

# =======================================
# 6. Testing (Argmax)
# =======================================
clf_model.eval()
all_preds_argmax = []
all_targets = []

with torch.no_grad():
    for data_batch, target_batch, _ in test_loader:
        data_batch = data_batch.to(device)
        outputs = clf_model(data_batch)
        preds = outputs.argmax(dim=1).cpu().numpy()
        
        all_preds_argmax.extend(preds)
        all_targets.extend(target_batch.numpy())

print("\n=== Baseline (Argmax) Classification Report ===")
print(classification_report(
    all_targets,
    all_preds_argmax,
    target_names=label_encoder.classes_
))

cm = confusion_matrix(all_targets, all_preds_argmax)
plt.figure(figsize=(6, 5))
sns.heatmap(
    cm,
    annot=True,
    fmt='d',
    cmap='Blues',
    xticklabels=label_encoder.classes_,
    yticklabels=label_encoder.classes_
)
plt.title("Confusion Matrix (Argmax)")
plt.xlabel("Predicted Label")
plt.ylabel("Actual Label")
plt.show()

# =======================================
# 7. Threshold Search for the "+" Class
# =======================================
# This section shows how to improve the recall of a particular class (e.g., "+")
# by applying a probability threshold rather than argmax.
# =======================================
plus_class_str = "+"
if plus_class_str not in label_encoder.classes_:
    print(f"Warning: '+' class is not found in the dataset. Check label_encoder.classes_: {label_encoder.classes_}")
else:
    plus_idx = label_encoder.transform([plus_class_str])[0]
    softmax = nn.Softmax(dim=1)

    # Collect probabilities for the test set
    all_probs_list = []
    with torch.no_grad():
        for data_batch, target_batch, _ in test_loader:
            data_batch = data_batch.to(device)
            logits = clf_model(data_batch)
            probs = softmax(logits)
            all_probs_list.append(probs.cpu().numpy())

    all_probs = np.concatenate(all_probs_list, axis=0)  # shape = [N, num_classes]
    all_plus_prob = all_probs[:, plus_idx]

    all_targets = np.array(all_targets)

    thresholds = np.linspace(0, 1, 101)
    plus_prec_list = []
    plus_rec_list = []

    for th in thresholds:
        predicted_labels = []
        for i in range(len(all_plus_prob)):
            if all_plus_prob[i] >= th:
                predicted_labels.append(plus_idx)
            else:
                predicted_labels.append(all_probs[i].argmax())

        predicted_labels = np.array(predicted_labels)
        cm_th = confusion_matrix(all_targets, predicted_labels, labels=range(num_classes))

        TP = cm_th[plus_idx, plus_idx]
        FN = cm_th[plus_idx, :].sum() - TP
        FP = cm_th[:, plus_idx].sum() - TP

        precision_plus = TP / (TP + FP) if (TP + FP) > 0 else 0.0
        recall_plus = TP / (TP + FN) if (TP + FN) > 0 else 0.0

        plus_prec_list.append(precision_plus)
        plus_rec_list.append(recall_plus)

    # Print the first few thresholds achieving recall >= 0.95 for the "+" class
    recall_target = 0.95
    found_thresholds = [
        (th, pp, rr) for th, pp, rr in zip(thresholds, plus_prec_list, plus_rec_list) if rr >= recall_target
    ]

    if len(found_thresholds) == 0:
        print(f"\nNo threshold in [0,1] achieves '+' recall >= {recall_target}")
    else:
        print(f"\nThresholds that achieve '+' recall >= {recall_target}, showing up to 5 entries:")
        for th, pp, rr in found_thresholds[:5]:
            print(f" Threshold={th:.2f} | Precision={pp:.3f} | Recall={rr:.3f}")
        print(f"Found {len(found_thresholds)} thresholds meeting recall >= {recall_target}.")

    # Plot the Precision/Recall curve for "+"
    plt.figure(figsize=(7, 5))
    plt.plot(thresholds, plus_prec_list, label="Precision(+)")
    plt.plot(thresholds, plus_rec_list, label="Recall(+)")
    plt.axhline(y=recall_target, color='r', linestyle='--', label=f'Recall={recall_target}')
    plt.xlabel("Threshold for '+'")
    plt.ylabel("Score")
    plt.title("Precision & Recall for '+' vs. Threshold")
    plt.legend()
    plt.show()
