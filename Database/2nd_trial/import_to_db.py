import csv
import math
from datetime import datetime
import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

host = os.getenv("DB_HOST")
user = os.getenv("DB_USER")
password = os.getenv("DB_PASSWORD")
database = os.getenv("DB_DATABASE")


# 資料庫連線設定
db_config = {
    "host": host,
    "user": user,
    "password": password,
    "database": database
}

try:
    cnx = mysql.connector.connect(**db_config)
    cursor = cnx.cursor()
    print("資料庫連線成功!")
except mysql.connector.Error as err:
    print(f"資料庫連線錯誤: {err}")
    exit(1)

# CSV 檔案名稱
csv_filename = "./Data/Merged_IoT_Data_with_Scores.csv"

with open(csv_filename, "r", encoding="utf-8") as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        try:
            client_time = int(row["client_time"])
        except ValueError:
            print(f"client_time 格式錯誤: {row['client_time']}")
            continue

        # 根據 client_time 轉換日期 (YYYY-MM-DD)
        date_str = datetime.fromtimestamp(client_time / 1000).strftime("%Y-%m-%d")
        trialresult = row["score"].strip() if row["score"] is not None else None
        
        # 清理data_type (刪除可能出現的單引號)
        data_type = row["data_type"].strip().strip("'").upper()

        # 根據不同的 data_type 建立要插入的欄位與值
        if data_type == "ACCELERATION":
            try:
                ax = float(row["data_x"]) if row["data_x"] != "" else None
                ay = float(row["data_y"]) if row["data_y"] != "" else None
                az = float(row["data_z"]) if row["data_z"] != "" else None
                
                if ax is not None and ay is not None and az is not None:
                    acceleration_value = math.sqrt(ax * ax + ay * ay + az * az)
                else:
                    acceleration_value = None
            except Exception as e:
                print(f"解析 ACCELERATION 失敗: {e}, row: {row}")
                continue

            insert_query = """
                INSERT INTO student_sessions
                (timestamp, date, trialresult, acceleration_x, acceleration_y, acceleration_z, acceleration)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """
            values = (client_time, date_str, trialresult, ax, ay, az, acceleration_value)

        elif data_type == "BVP":
            try:
                bvp_value = float(row["data_value"]) if row["data_value"] != "" else None
            except Exception as e:
                print(f"解析 BVP 失敗: {e}, row: {row}")
                continue

            insert_query = """
                INSERT INTO student_sessions
                (timestamp, date, trialresult, bvp)
                VALUES (%s, %s, %s, %s)
            """
            values = (client_time, date_str, trialresult, bvp_value)

        elif data_type == "GSR":
            try:
                gsr_value = float(row["data_value"]) if row["data_value"] != "" else None
            except Exception as e:
                print(f"解析 GSR 失敗: {e}, row: {row}")
                continue

            insert_query = """
                INSERT INTO student_sessions
                (timestamp, date, trialresult, gsr)
                VALUES (%s, %s, %s, %s)
            """
            values = (client_time, date_str, trialresult, gsr_value)

        elif data_type == "TEMPERATURE":
            try:
                wristtemp_value = float(row["data_value"]) if row["data_value"] != "" else None
            except Exception as e:
                print(f"解析 TEMPERATURE 失敗: {e}, row: {row}")
                continue

            insert_query = """
                INSERT INTO student_sessions
                (timestamp, date, trialresult, wristtemp)
                VALUES (%s, %s, %s, %s)
            """
            values = (client_time, date_str, trialresult, wristtemp_value)
        
        else:
            print(f"未知的 data_type: {data_type}")
            continue

        try:
            cursor.execute(insert_query, values)
        except mysql.connector.Error as err:
            print(f"執行 INSERT 失敗: {err}, row: {row}")
            continue

# commit 資料
cnx.commit()

# 關閉連線
cursor.close()
cnx.close()

print("資料輸入完成!")