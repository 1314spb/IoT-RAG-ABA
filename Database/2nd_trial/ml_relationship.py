#%%
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.svm import SVC, LinearSVC
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import warnings

warnings.filterwarnings('ignore')

data = pd.read_csv("Data/Merged_IoT_Data_with_Scores.csv")

print("原始資料筆數：", data.shape[0])
print(data.head())

for col in ['data_x', 'data_y', 'data_z', 'data_value']:
    data[col] = pd.to_numeric(data[col], errors='coerce')

data['score'] = data['score'].astype(str).str.strip()

data = data.fillna(0)

X = data[['data_x', 'data_y', 'data_z', 'data_value']]
y = data['score']

le = LabelEncoder()
y_encoded = le.fit_transform(y)

print("\n標籤種類：", le.classes_)
print("轉換後的標籤 (前 10 筆)：", y_encoded[:10])

X_train, X_test, y_train, y_test = train_test_split(
    X, 
    y_encoded, 
    test_size=0.2, 
    random_state=42, 
    stratify=y_encoded
    )
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled  = scaler.transform(X_test)

svc = LinearSVC()
print("\n開始訓練 SVC 模型...")
svc.fit(X_train_scaled, y_train)
print("SVC 模型訓練完成。")

# 9. 預測與評估結果
y_pred = svc.predict(X_test_scaled)

print("\n分類結果評估:")
print("Accuracy: {:.2f}%".format(accuracy_score(y_test, y_pred)*100))
# print("\nClassification Report:")
# print(classification_report(y_test, y_pred, target_names=le.classes_))

# %%
