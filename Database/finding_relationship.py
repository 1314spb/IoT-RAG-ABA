#%%
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.inspection import permutation_importance
from sklearn.svm import SVC
from sklearn.metrics import (accuracy_score, precision_score, recall_score, 
                             f1_score, classification_report)
import matplotlib.pyplot as plt
import seaborn as sns

# 步驟 1: 讀取數據
file_path = 'iotreaddata.xlsx'
df = pd.read_excel(file_path)

# 步驟 1.1: 查看數據結構
print(df.head())
print(df.info())
print(df.describe())

# 步驟 2: 數據預處理

# 2.1 檢查缺失值
print("\n缺失值情況:")
print(df.isnull().sum())

# 2.2 處理缺失值（如有）
numerical_cols = ['BVP', 'GSR', 'wrist temp', 'acceleration_x', 'acceleration_y', 'acceleration_z']
# numerical_cols = ['GSR', 'wrist temp', 'acceleration_x', 'acceleration_y', 'acceleration_z']
numerical_cols = ['GSR']

from sklearn.impute import SimpleImputer

imputer = SimpleImputer(strategy='mean')
df[numerical_cols] = imputer.fit_transform(df[numerical_cols])

# 2.3 編碼目標變量
le = LabelEncoder()
df['Trial_Result_Encoded'] = le.fit_transform(df['Trial Reuslt'])

print("\n編碼後的 'Trial Result':")
print(df[['Trial Reuslt', 'Trial_Result_Encoded']].head())

# 2.4 選擇特徵並標準化
features = ['BVP', 'GSR', 'wrist temp', 'acceleration_x', 'acceleration_y', 'acceleration_z']
# features = ['GSR', 'wrist temp', 'acceleration_x', 'acceleration_y', 'acceleration_z']
# features = ['GSR']

X = df[features]
y = df['Trial_Result_Encoded']

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
X_scaled = pd.DataFrame(X_scaled, columns=features)

print("\nNormalized features:")
print(X_scaled.head())

# 步驟 3: 探索性數據分析（EDA）

# 3.1 箱線圖
df_eda = pd.concat([X_scaled, y.rename('Trial_Result')], axis=1)

plt.figure(figsize=(18, 12))
for i, feature in enumerate(features):
    plt.subplot(2, 3, i+1)
    sns.boxplot(x='Trial_Result', y=feature, data=df_eda)
    plt.title(f'Boxplot of {feature} by Trial Result')
plt.tight_layout()
plt.show()

# 3.2 相關性熱圖
corr = df_eda.corr()

plt.figure(figsize=(10, 8))
sns.heatmap(corr, annot=True, cmap='coolwarm', fmt=".2f")
plt.title('Correlation Matrix')
plt.show()

# 3.3 散點圖矩陣
sns.pairplot(df_eda, hue='Trial_Result', vars=features, palette='viridis')
plt.show()

# 步驟 4: 建立和評估分類模型

# 4.1 切分訓練集與測試集
X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.2, random_state=42, stratify=y
)

print(f'\nTraining samples: {X_train.shape[0]}')
print(f'Testing samples: {X_test.shape[0]}')

# 4.2 建立並訓練模型
models = {
    # 'Logistic Regression': LogisticRegression(random_state=42, max_iter=1000),
    # 'Decision Tree': DecisionTreeClassifier(random_state=42),
    # 'Random Forest': RandomForestClassifier(random_state=42),
    'Support Vector Machine - Linear': SVC(kernel='linear', random_state=42, probability=True),
}

for name, model in models.items():
    model.fit(X_train, y_train)
    print(f'{name} Training Completed.')

# 4.3 模型評估
for name, model in models.items():
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, average='weighted', zero_division=0)
    rec = recall_score(y_test, y_pred, average='weighted', zero_division=0)
    f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)
    print(f'\n{name} Evaluation:')
    print(f'Accuracy: {acc:.2f}')
    print(f'Precision: {prec:.2f}')
    print(f'Recall: {rec:.2f}')
    print(f'F1-score: {f1:.2f}')
    print('Report:')
    print(classification_report(y_test, y_pred, zero_division=0))

# 4.4 繪製邏輯回歸係數
# lr_model = models['Logistic Regression']
# coefficients = lr_model.coef_[0]
# feature_coefficients = pd.Series(coefficients, index=features).sort_values(ascending=False)

# plt.figure(figsize=(8, 6))
# sns.barplot(x=feature_coefficients, y=feature_coefficients.index, palette='viridis')
# plt.title('Logistic Regression - Feature coefficients')
# plt.xlabel('Coefficient')
# plt.ylabel('Feature')
# plt.show()

# 4.4 繪製決策樹特徵重要性
# dt_model = models['Decision Tree']
# dt_importances = dt_model.feature_importances_
# dt_feature_importance = pd.Series(dt_importances, index=features).sort_values(ascending=False)

# plt.figure(figsize=(8, 6))
# sns.barplot(x=dt_feature_importance, y=dt_feature_importance.index, palette='viridis')
# plt.title('Decision Tree Feature Importance')
# plt.xlabel('Importance')
# plt.ylabel('Feature')
# plt.show()

# 4.4 隨機森林特徵重要性
# rf_model = models['Random Forest']
# importances = rf_model.feature_importances_
# feature_importance = pd.Series(importances, index=features).sort_values(ascending=False)

# plt.figure(figsize=(8, 6))
# sns.barplot(x=feature_importance, y=feature_importance.index, palette='viridis')
# plt.title('Random Forest Feature Importance')
# plt.xlabel('Importance')
# plt.ylabel('Feature')
# plt.show()

svm_l = models['Support Vector Machine - Linear']
svm_coefficients = svm_l.coef_[0]
svm_feature_coefficients = pd.Series(svm_coefficients, index=features).sort_values(ascending=False)

# 繪製係數
plt.figure(figsize=(8, 6))
sns.barplot(x=svm_feature_coefficients, y=svm_feature_coefficients.index, palette='viridis')
plt.title('SVM (Linear Kernel) Feature Coefficients')
plt.xlabel('Coefficient')
plt.ylabel('Feature')
plt.show()

#%%