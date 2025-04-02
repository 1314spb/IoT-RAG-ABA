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

file_path = 'iotreaddata.xlsx'
df = pd.read_excel(file_path)

df['Date'] = pd.to_datetime(df['Date'], format='%Y-%m-%d')
df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
df['DayOfWeek'] = df['Date'].dt.dayofweek
df['Month'] = df['Date'].dt.month
df['Hour'] = df['timestamp'].dt.hour

df.columns = df.columns.str.strip()

categorical_cols = ['Domain', 'Task', 'Sub-Task', 'Trial Reuslt']
missing_cols = [col for col in categorical_cols if col not in df.columns]
if missing_cols:
    print(f"Not found: {missing_cols}")
else:
    print("All categorical columns found")

df_encoded = pd.get_dummies(df, columns=categorical_cols, drop_first=True)
print(df_encoded.columns.tolist())

numerical_cols = [
    'Score(%)', 'no. of P', 'no. of -', 'no. of +', 'no. of OT', 'no. of Undo',
    'BVP', 'GSR', 'wrist temp', 'acceleration_x', 'acceleration_y',
    'acceleration_z', 'acceleration', 'DayOfWeek', 'Month', 'Hour'
]
imputer = SimpleImputer(missing_values=np.nan, strategy='mean')

X_imputed = imputer.fit_transform(df_encoded[numerical_cols])

X_imputed = pd.DataFrame(X_imputed, columns=numerical_cols)

df_encoded[numerical_cols] = X_imputed

print(df_encoded[numerical_cols].isnull().sum())

feature_cols = df_encoded.columns.tolist()
columns_to_drop = ['student_id', 'Date', 'session_id', 'timestamp']
for col in columns_to_drop:
    if col in feature_cols:
        feature_cols.remove(col)
X = df_encoded[feature_cols]
print(X.head())

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

k = 3
kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
df_encoded['Cluster'] = kmeans.fit_predict(X)
print(df_encoded['Cluster'].value_counts())

pca = PCA(n_components=2, random_state=42)
principal_components = pca.fit_transform(X)
df_encoded['PC1'] = principal_components[:, 0]
df_encoded['PC2'] = principal_components[:, 1]

pca_components = pca.components_

loadings = pd.DataFrame(pca_components.T, columns=['PC1', 'PC2'], index=X.columns)

print(loadings)

threshold = 0.3

# 篩選對 PC1 貢獻較大的特徵
high_loading_features_pc1 = loadings[abs(loadings['PC1']) > threshold].index.tolist()
high_loading_features_pc2 = loadings[abs(loadings['PC2']) > threshold].index.tolist()

plt.figure(figsize=(10, 7))
sns.scatterplot(data=df_encoded, x='PC1', y='PC2', hue='Cluster', palette='viridis', s=100, alpha=0.7)
plt.title('Clustering result (PCA to 2D)')
plt.xlabel('Principal components 1')
plt.ylabel('Principal components 2')
plt.legend(title='Cluster')
plt.show()

score = silhouette_score(X, df_encoded['Cluster'])

cluster_means = df_encoded.groupby('Cluster').mean()
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
