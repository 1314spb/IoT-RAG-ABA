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
# IoT_Data_Processing_And_Classification.py
# ====================================================
# This script reads IoT data from a CSV file, cleans and standardizes it,
# encodes labels, trains a simple neural network to classify emotional/behavioral states,
# and performs optional threshold-based post-processing for a specific class (e.g., "P").
# It aligns with the preprocessing and classification steps described in our paper.

# =======================================
# 1. Data Reading and Preprocessing
# =======================================
file_path = "PATH_TO_YOUR_CSV_FILE.csv"  # Replace with your actual CSV path
df = pd.read_csv(file_path)

# Only keep relevant columns for this task: data_type, data_x, data_y, data_z, score
df = df[['data_type', 'data_x', 'data_y', 'data_z', 'score']]
print("Initial data shape:", df.shape)

# Remove rows with NaN in critical columns
df.dropna(subset=['data_type', 'data_x', 'data_y', 'data_z', 'score'], inplace=True)
print("Shape after dropping NaN:", df.shape)

# Apply 3-sigma filtering on numeric columns (data_x, data_y, data_z)
numeric_cols = ['data_x', 'data_y', 'data_z']
z_scores = np.abs((df[numeric_cols] - df[numeric_cols].mean()) / df[numeric_cols].std())
df = df[(z_scores < 3.0).all(axis=1)]
print("Shape after 3-sigma outlier removal:", df.shape)

# Check if there is any remaining data
if df.shape[0] == 0:
    raise ValueError("All data has been filtered out. Please check your data or adjust the threshold.")

# Encode the 'score' column (e.g., '+', '-', 'P', etc.) using LabelEncoder
label_encoder = LabelEncoder()
df['label_encoded'] = label_encoder.fit_transform(df['score'])
print("Label mapping (score -> encoded):", dict(zip(label_encoder.classes_, range(len(label_encoder.classes_)))))

# Apply one-hot encoding to the 'data_type' column
df_ohe = pd.get_dummies(df['data_type'], prefix='type')
print("One-hot encoded columns:", df_ohe.columns.tolist())

# Standardize the numeric columns
scaler = StandardScaler()
xyz_scaled = scaler.fit_transform(df[numeric_cols])  # shape [N,3]

# Merge one-hot features and scaled numeric features to form final X
X = np.hstack([
    df_ohe.values,    # one-hot encoded columns
    xyz_scaled        # scaled [data_x, data_y, data_z]
])
y = df['label_encoded'].values

print("Final X shape:", X.shape)
print("Final y shape:", y.shape)

# =======================================
# 2. Train/Test Split
# =======================================
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
print("Training set size:", len(X_train), "Testing set size:", len(X_test))

# =======================================
# 3. Dataset & DataLoader
# =======================================
class IOTDataset(Dataset):
    def __init__(self, X_data, y_data):
        self.X_data = torch.tensor(X_data, dtype=torch.float32)
        self.y_data = torch.tensor(y_data, dtype=torch.long)

    def __len__(self):
        return len(self.X_data)

    def __getitem__(self, idx):
        return self.X_data[idx], self.y_data[idx]

train_dataset = IOTDataset(X_train, y_train)
test_dataset = IOTDataset(X_test, y_test)

# If the dataset is imbalanced, use WeightedRandomSampler
class_counts = np.bincount(y_train)
weights = 1.0 / class_counts
sample_weights = weights[y_train]
sampler = WeightedRandomSampler(
    sample_weights,
    num_samples=len(sample_weights),
    replacement=True
)

batch_size = 32
train_loader = DataLoader(
    train_dataset,
    batch_size=batch_size,
    sampler=sampler,
    drop_last=False
)

test_loader = DataLoader(
    test_dataset,
    batch_size=batch_size,
    shuffle=False,
    drop_last=False
)

# =======================================
# 4. Simple Neural Network
# =======================================
class SimpleNN(nn.Module):
    def __init__(self, input_dim, num_classes):
        super(SimpleNN, self).__init__()
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

input_dim = X.shape[1]  # total features after one-hot + 3 numeric
num_classes = len(label_encoder.classes_)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

model = SimpleNN(input_dim, num_classes).to(device)

# =======================================
# 5. Training
# =======================================
criterion = nn.CrossEntropyLoss()
optimizer = AdamW(model.parameters(), lr=1e-3, weight_decay=1e-4)

epochs = 30
for epoch in range(1, epochs + 1):
    model.train()
    total_loss = 0.0
    correct = 0
    total_samples = 0

    for X_batch, y_batch in train_loader:
        X_batch, y_batch = X_batch.to(device), y_batch.to(device)

        optimizer.zero_grad()
        outputs = model(X_batch)
        loss = criterion(outputs, y_batch)
        loss.backward()
        optimizer.step()

        total_loss += loss.item()
        _, predicted = outputs.max(1)
        correct += predicted.eq(y_batch).sum().item()
        total_samples += y_batch.size(0)

    avg_loss = total_loss / len(train_loader)
    accuracy = 100.0 * correct / total_samples
    print(f"Epoch [{epoch}/{epochs}] | Loss: {avg_loss:.4f} | Training Accuracy: {accuracy:.2f}%")

# =======================================
# 6. Evaluation (Argmax)
# =======================================
model.eval()
all_preds_argmax = []
all_targets = []

with torch.no_grad():
    for X_batch, y_batch in test_loader:
        X_batch = X_batch.to(device)
        logits = model(X_batch)
        preds = logits.argmax(dim=1).cpu().numpy()

        all_preds_argmax.extend(preds)
        all_targets.extend(y_batch.numpy())

print("\n=== Baseline (Argmax) Evaluation ===")
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
# 7. Threshold-Based Post-Processing for "P" Class (Optional)
# =======================================
p_str = "P"
if p_str not in label_encoder.classes_:
    print(f"Warning: '{p_str}' label is not found in the dataset.")
else:
    p_idx = label_encoder.transform([p_str])[0]
    softmax = nn.Softmax(dim=1)

    # Collect probabilities for test set
    all_probs = []
    with torch.no_grad():
        for X_batch, _ in test_loader:
            X_batch = X_batch.to(device)
            logits = model(X_batch)
            probs = softmax(logits)
            all_probs.append(probs.cpu().numpy())

    all_probs = np.concatenate(all_probs, axis=0)  # shape=[N, num_classes]
    all_targets_arr = np.array(all_targets)
    p_prob = all_probs[:, p_idx]

    # Vary threshold from 0.0 to 1.0
    thresholds = np.linspace(0, 1, 101)
    p_prec_list, p_rec_list = [], []

    for th in thresholds:
        predicted_labels = []
        for i in range(len(p_prob)):
            if p_prob[i] >= th:
                predicted_labels.append(p_idx)
            else:
                predicted_labels.append(all_probs[i].argmax())

        cm_th = confusion_matrix(all_targets_arr, predicted_labels, labels=range(num_classes))
        TP = cm_th[p_idx, p_idx]
        FN = cm_th[p_idx, :].sum() - TP
        FP = cm_th[:, p_idx].sum() - TP

        precision_p = TP / (TP + FP) if (TP + FP) > 0 else 0
        recall_p = TP / (TP + FN) if (TP + FN) > 0 else 0

        p_prec_list.append(precision_p)
        p_rec_list.append(recall_p)

    # Demonstration: show the first few thresholds achieving recall >= 0.95
    recall_target = 0.95
    found = [
        (th, pc, rc) for th, pc, rc in zip(thresholds, p_prec_list, p_rec_list)
        if rc >= recall_target
    ]
    if not found:
        print(f"\nNo thresholds achieve recall >= {recall_target} for class '{p_str}'.")
    else:
        print(f"\nThresholds that achieve '{p_str}' recall >= {recall_target} (showing up to 5):")
        for th, pc, rc in found[:5]:
            print(f" Threshold={th:.2f}, Precision={pc:.3f}, Recall={rc:.3f}")

    # Plot the Precision/Recall vs. threshold for "P"
    plt.figure(figsize=(7, 5))
    plt.plot(thresholds, p_prec_list, label="Precision(P)")
    plt.plot(thresholds, p_rec_list, label="Recall(P)")
    plt.axhline(y=recall_target, color='r', linestyle='--', label=f'Recall={recall_target}')
    plt.xlabel("Threshold for 'P'")
    plt.ylabel("Score")
    plt.title("Precision & Recall for 'P' vs. Threshold")
    plt.legend()
    plt.show()
