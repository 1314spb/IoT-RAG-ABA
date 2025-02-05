#%%
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.cluster import KMeans
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.decomposition import PCA
from sklearn.metrics import silhouette_score
from sklearn.pipeline import Pipeline

# 步驟 1: 讀取數據
file_path = 'iotreaddata.xlsx'
df = pd.read_excel(file_path)

# 步驟 2a: 處理日期和時間戳
df['Date'] = pd.to_datetime(df['Date'], format='%Y-%m-%d')
df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
df['DayOfWeek'] = df['Date'].dt.dayofweek
df['Month'] = df['Date'].dt.month
df['Hour'] = df['timestamp'].dt.hour

# 步驟 2b: 清理列名
df.columns = df.columns.str.strip()

# 確認所有分類列是否存在
categorical_cols = ['Domain', 'Task', 'Sub-Task', 'Trial Reuslt']
missing_cols = [col for col in categorical_cols if col not in df.columns]
if missing_cols:
    print(f"以下分類列在 DataFrame 中未找到: {missing_cols}")
    # 根據實際情況調整 categorical_cols，例如：
    # categorical_cols.remove('Task')  # 如果真的沒有 'Task' 列
else:
    print("所有分類列均存在。")

# 步驟 2c: 編碼分類變量
df_encoded = pd.get_dummies(df, columns=categorical_cols, drop_first=True)
print("\n編碼後的列名:")
print(df_encoded.columns.tolist())

# 步驟 2d: 處理數值特徵
numerical_cols = [
    'Score(%)', 'no. of P', 'no. of -', 'no. of +', 'no. of OT', 'no. of Undo',
    'BVP', 'GSR', 'wrist temp', 'acceleration_x', 'acceleration_y',
    'acceleration_z', 'acceleration', 'DayOfWeek', 'Month', 'Hour'
]
# 初始化 SimpleImputer，使用均值策略
imputer = SimpleImputer(missing_values=np.nan, strategy='mean')

# 擬合並轉換數據
X_imputed = imputer.fit_transform(df_encoded[numerical_cols])

# 將填補後的數據轉換回 DataFrame
X_imputed = pd.DataFrame(X_imputed, columns=numerical_cols)

# 替換原數據中的數值特徵
df_encoded[numerical_cols] = X_imputed

# 驗證是否仍有缺失值
print("\n填補後的缺失值情況:")
print(df_encoded[numerical_cols].isnull().sum())

# 步驟 3: 特徵選擇
feature_cols = df_encoded.columns.tolist()
columns_to_drop = ['student_id', 'Date', 'session_id', 'timestamp']
for col in columns_to_drop:
    if col in feature_cols:
        feature_cols.remove(col)
X = df_encoded[feature_cols]
print("\n最終用於聚類的特徵:")
print(X.head())

# 步驟 4: 確定最佳聚類數量 (肘部法)
sse = []
k_range = range(1, 11)
for k in k_range:
    kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
    kmeans.fit(X)
    sse.append(kmeans.inertia_)

plt.figure(figsize=(8, 5))
plt.plot(k_range, sse, marker='o')
plt.xlabel('Cluster number (k)')
plt.ylabel('SSE')
plt.title('Elbow method to determine best cluster number')
plt.xticks(k_range)
plt.show()

# 步驟 5: 確定最佳聚類數量 (輪廓係數法)
silhouette_scores = []
k_range_sil = range(2, 11)
for k in k_range_sil:
    kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
    labels = kmeans.fit_predict(X)
    score = silhouette_score(X, labels)
    silhouette_scores.append(score)

plt.figure(figsize=(8, 5))
plt.plot(k_range_sil, silhouette_scores, marker='o', color='green')
plt.xlabel('Cluster number (k)')
plt.ylabel('Silhouette Score')
plt.title('Silhouette analysis to determine best cluster number')
plt.xticks(k_range_sil)
plt.show()

# 假設根據肘部法和輪廓係數法選擇 k=3
k = 3
kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
df_encoded['Cluster'] = kmeans.fit_predict(X)
print("\n各聚類中的樣本數:")
print(df_encoded['Cluster'].value_counts())

# 步驟 6: PCA 降維並可視化
pca = PCA(n_components=2, random_state=42)
principal_components = pca.fit_transform(X)
df_encoded['PC1'] = principal_components[:, 0]
df_encoded['PC2'] = principal_components[:, 1]

pca_components = pca.components_

# 創建負載的 DataFrame
loadings = pd.DataFrame(pca_components.T, columns=['PC1', 'PC2'], index=X.columns)

print("PCA負載（各特徵在主成分中的權重）:")
print(loadings)

threshold = 0.3

# 篩選對 PC1 貢獻較大的特徵
high_loading_features_pc1 = loadings[abs(loadings['PC1']) > threshold].index.tolist()
high_loading_features_pc2 = loadings[abs(loadings['PC2']) > threshold].index.tolist()

print(f"PC1 高負載特徵: {high_loading_features_pc1}")
print(f"PC2 高負載特徵: {high_loading_features_pc2}")

plt.figure(figsize=(10, 7))
sns.scatterplot(data=df_encoded, x='PC1', y='PC2', hue='Cluster', palette='viridis', s=100, alpha=0.7)
plt.title('Clustering result (PCA to 2D)')
plt.xlabel('Principal components 1')
plt.ylabel('Principal components 2')
plt.legend(title='Cluster')
plt.show()

# 步驟 7: 評估聚類質量
score = silhouette_score(X, df_encoded['Cluster'])
print(f'\n輪廓係數: {score:.2f}')

# 步驟 8: 分析聚類平均值
cluster_means = df_encoded.groupby('Cluster').mean()
print("\n每個聚類的特徵平均值:")
print(cluster_means[['Score(%)', 'no. of P', 'no. of -', 'no. of +', 'no. of OT', 'no. of Undo',
                    'BVP', 'GSR', 'wrist temp', 'acceleration_x', 'acceleration_y',
                    'acceleration_z', 'acceleration'] +
                   [col for col in cluster_means.columns 
                    if col.startswith('Domain_') or 
                       col.startswith('Task_') or 
                       col.startswith('Sub-Task_') or 
                       col.startswith('Trial Reuslt_')]])

df_encoded.to_csv('clustered_data.csv', index=False)
# %%
