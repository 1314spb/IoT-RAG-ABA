import pandas as pd
from rank_bm25 import BM25Okapi

# Step 1: 加载 Excel 文件
file_path = "C:\\Users\\harmi\\Desktop\\Database_cleanup.xlsx"  # 更新路径为正确的文件路径
data = pd.read_excel(file_path)

# Step 2: 数据预处理 - 合并Domain、Task和Sub-Task字段
# 确保所有字段都转换为字符串，以避免拼接错误
data['Domain'] = data['Domain'].fillna('').astype(str)
data['Task'] = data['Task'].fillna('').astype(str)
data['Sub-Task'] = data['Sub-Task'].fillna('').astype(str)

# 将Domain、Task和Sub-Task合并为一列
data['combined_text'] = data['Domain'] + ' ' + data['Task'] + ' ' + data['Sub-Task']

# Step 3: 将任务文本分词
# 使用空格将每个任务分词
tokenized_tasks = [task.split() for task in data['combined_text']]

# Step 4: 初始化BM25模型
bm25 = BM25Okapi(tokenized_tasks)

# Step 5: 定义检索函数
def bm25_search(query, n=5):
    """
    使用BM25进行检索的函数
    参数:
    - query: 查询关键词 (字符串)
    - n: 返回结果的数量 (默认返回前5个最相关的任务)

    返回:
    - 检索到的最相关任务
    """
    # 对查询文本进行分词
    tokenized_query = query.split()

    # 使用BM25模型获取前n个最相关的任务
    results = bm25.get_top_n(tokenized_query, data['combined_text'], n=n)

    # 打开一个文本文件用于写入结果
    with open('retrieved_tasks.txt', 'w', encoding='utf-8') as f:
        f.write(f"检索到的与'{query}'最相关的前{n}个任务：\n")
        
        # 打印和保存结果
        for i, result in enumerate(results, 1):
            # 获取对应的完整行数据，包括Domain, Task, Sub-Task
            row = data[data['combined_text'] == result].iloc[0]
            result_text = f"{i}. Domain: {row['Domain']}; Task: {row['Task']}; Sub-Task: {row['Sub-Task']}\n"
            
            # 打印到控制台
            print(result_text)
            
            # 写入文件
            f.write(result_text)

# Step 6: 使用BM25检索
if __name__ == "__main__":
    # 输入查询关键词
    query = input("请输入要检索的Domain词条：")
    bm25_search(query, n=5)  # 调用检索函数，返回前5个结果
