import pandas as pd
from sqlalchemy import create_engine, Integer, Float, BigInteger, String, Date
import pymysql
import numpy as np
import sys

# 配置 MySQL 連接參數
username = 'root'     # 替換為您的 MySQL 用戶名
password = ''     # 替換為您的 MySQL 密碼
host = 'localhost'             # MySQL 伺服器地址，通常是 'localhost'
port = '3306'                  # MySQL 端口，默認為 3306
database = 'student_data'     # 替換為您的數據庫名稱
table_name = 'student_sessions'  # 目標資料表名稱

# CSV 文件路徑
csv_file_path = 'Overall_data.csv'  # 替換為您的 CSV 文件路徑

# 讀取 CSV 文件
try:
    df = pd.read_csv(csv_file_path)
    print("CSV 文件成功讀取。")
except Exception as e:
    print(f"讀取 CSV 文件時出現錯誤: {e}")
    sys.exit(1)

# 查看數據表的前幾行
print("原始數據前5行：")
print(df.head())

# 轉換 'date' 列的日期格式從 'DD/MM/YYYY' 到 'YYYY-MM-DD'
try:
    df['date'] = pd.to_datetime(df['date'], format='%d/%m/%Y').dt.strftime('%Y-%m-%d')
    print("'date' 列日期格式轉換成功。")
except Exception as e:
    print(f"轉換日期格式時出現錯誤: {e}")
    sys.exit(1)

# 查看轉換後的 'date' 列
print("轉換後的 'date' 列前5行：")
print(df['date'].head())

# 處理 'nan' 值，將字串 'nan' 轉換為 NaN，再轉換為 None，以便插入 MySQL 時為 NULL
df.replace('nan', np.nan, inplace=True)

# 創建 SQLAlchemy 引擎
try:
    engine = create_engine(f'mysql+pymysql://{username}:{password}@{host}:{port}/{database}')
    print("成功創建 SQLAlchemy 引擎。")
except Exception as e:
    print(f"創建 SQLAlchemy 引擎時出現錯誤: {e}")
    sys.exit(1)

# 定義資料型別對應
dtype_mapping = {
    'student_id': Integer(),
    'date': Date(),
    'session_id': Integer(),
    'domain': String(255),
    'task': String(255),
    'subtask': String(255),
    'trialresult': String(10),
    'score': Integer(),
    'noofP': Integer(),
    'noof_negative': Integer(),
    'noof_positive': Integer(),
    'noofOT': Integer(),
    'noofUndo': Integer(),
    'timestamp': BigInteger(),
    'light': Float(),
    'co2': Float(),
    'RH': Float(),
    'ambienttemp': Float(),
    'bvp': Float(),
    'gsr': Float(),
    'wristtemp': Float(),
    'ibi': Float(),
    'acceleration_x': Float(),
    'acceleration_y': Float(),
    'acceleration_z': Float(),
    'acceleration': Float(),
}

try:
    df.to_sql(name=table_name, con=engine, if_exists='append', index=False, chunksize=1000, dtype=dtype_mapping, method='multi')
    print(f"數據成功導入到 '{table_name}' 資料表中。")
except Exception as e:
    print(f"導入數據時出現錯誤: {e}")
    sys.exit(1)