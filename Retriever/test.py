# 完整的 BM25 检索脚本
import pandas as pd
from rank_bm25 import BM25Okapi

# Step 1: 加载 Excel 文件
file_path = '"\Users\harmi\Desktop\Database_cleanup.xlsx"'
data = pd.read_excel(file_path)

# Step 2: 数据预处理 - 合并Task和Sub-Task字段
# 将Task和Sub-Task合并为一列，并填充缺失值
data['combined_text'] = data['Task'].fillna('') + ' ' + data['Sub-Task'].fillna('')

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

    # 打印结果
    print(f"检索到的与'{query}'最相关的前{n}个任务：")
    for i, result in enumerate(results, 1):
        print(f"{i}. {result}")

# Step 6: 使用BM25检索
# 这里我们可以输入检索关键词，模拟实时输入的情感或行为线索
if __name__ == "__main__":
    # 示例查询
    query = "焦虑"  # 输入要检索的关键词
    bm25_search(query, n=5)  # 调用检索函数，返回前5个结果
