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

file_path = 'iotreaddata.xlsx'
df = pd.read_excel(file_path)

print(df.head())
print(df.info())
print(df.describe())

print(df.isnull().sum())

numerical_cols = ['BVP', 'GSR', 'wrist temp', 'acceleration_x', 'acceleration_y', 'acceleration_z']
# numerical_cols = ['GSR', 'wrist temp', 'acceleration_x', 'acceleration_y', 'acceleration_z']
numerical_cols = ['GSR']

from sklearn.impute import SimpleImputer

imputer = SimpleImputer(strategy='mean')
df[numerical_cols] = imputer.fit_transform(df[numerical_cols])

le = LabelEncoder()
df['Trial_Result_Encoded'] = le.fit_transform(df['Trial Reuslt'])

print(df[['Trial Reuslt', 'Trial_Result_Encoded']].head())

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

df_eda = pd.concat([X_scaled, y.rename('Trial_Result')], axis=1)

plt.figure(figsize=(18, 12))
for i, feature in enumerate(features):
    plt.subplot(2, 3, i+1)
    sns.boxplot(x='Trial_Result', y=feature, data=df_eda)
    plt.title(f'Boxplot of {feature} by Trial Result')
plt.tight_layout()
plt.show()

corr = df_eda.corr()

plt.figure(figsize=(10, 8))
sns.heatmap(corr, annot=True, cmap='coolwarm', fmt=".2f")
plt.title('Correlation Matrix')
plt.show()

sns.pairplot(df_eda, hue='Trial_Result', vars=features, palette='viridis')
plt.show()

X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.2, random_state=42, stratify=y
)

print(f'\nTraining samples: {X_train.shape[0]}')
print(f'Testing samples: {X_test.shape[0]}')

models = {
    'Logistic Regression': LogisticRegression(random_state=42, max_iter=1000),
    'Decision Tree': DecisionTreeClassifier(random_state=42),
    'Random Forest': RandomForestClassifier(random_state=42),
    'Support Vector Machine - Linear': SVC(kernel='linear', random_state=42, probability=True),
}

X_train = imputer.fit_transform(X_train)
X_test = imputer.transform(X_test)

for name, model in models.items():
    model.fit(X_train, y_train)
    print(f'{name} Training Completed.')

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

lr_model = models['Logistic Regression']
coefficients = lr_model.coef_[0]
feature_coefficients = pd.Series(coefficients, index=features).sort_values(ascending=False)

plt.figure(figsize=(8, 6))
sns.barplot(x=feature_coefficients, y=feature_coefficients.index, palette='viridis')
plt.title('Logistic Regression - Feature coefficients')
plt.xlabel('Coefficient')
plt.ylabel('Feature')
plt.show()

dt_model = models['Decision Tree']
dt_importances = dt_model.feature_importances_
dt_feature_importance = pd.Series(dt_importances, index=features).sort_values(ascending=False)

plt.figure(figsize=(8, 6))
sns.barplot(x=dt_feature_importance, y=dt_feature_importance.index, palette='viridis')
plt.title('Decision Tree Feature Importance')
plt.xlabel('Importance')
plt.ylabel('Feature')
plt.show()

rf_model = models['Random Forest']
importances = rf_model.feature_importances_
feature_importance = pd.Series(importances, index=features).sort_values(ascending=False)

plt.figure(figsize=(8, 6))
sns.barplot(x=feature_importance, y=feature_importance.index, palette='viridis')
plt.title('Random Forest Feature Importance')
plt.xlabel('Importance')
plt.ylabel('Feature')
plt.show()

svm_l = models['Support Vector Machine - Linear']
svm_coefficients = svm_l.coef_[0]
svm_feature_coefficients = pd.Series(svm_coefficients, index=features).sort_values(ascending=False)

plt.figure(figsize=(8, 6))
sns.barplot(x=svm_feature_coefficients, y=svm_feature_coefficients.index, palette='viridis')
plt.title('SVM (Linear Kernel) Feature Coefficients')
plt.xlabel('Coefficient')
plt.ylabel('Feature')
plt.show()

#%%