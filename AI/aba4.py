import logging
import requests
import pandas as pd
from sentence_transformers import SentenceTransformer, util
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from dotenv import load_dotenv
import os

load_dotenv()
logging.basicConfig(filename="api_errors.log", level=logging.ERROR)

base_url = os.getenv("API_BASE_URL")
api_key = os.getenv("API_KEY")
default_model = os.getenv("DEFAULT_MODEL")

default_temperature = 0.7
default_max_tokens = 512

database_path = r"./abataskdata.xlsx"
data = pd.read_excel(database_path)

# 对几个关键列进行空值填充与类型转换
data['Domain'] = data['Domain'].fillna('').astype(str)
data['Task'] = data['Task'].fillna('').astype(str)
data['Sub-Task'] = data['Sub-Task'].fillna('').astype(str)

# 将这几列合并为一列，后续用于语义搜索
data['Combined'] = data.apply(
    lambda row: f"Domain: {row['Domain']}; Task: {row['Task']}; Sub-Task: {row['Sub-Task']}",
    axis=1
)

# 加载 Other Tasklist
othertasklist_path = r"./othertasklist.txt"
with open(othertasklist_path, 'r', encoding='utf-8') as f:
    othertasklist = [line.strip() for line in f if line.strip()]

# ---------------------------
# 加载 Sentence Transformer 模型 & 事先计算嵌入
# ---------------------------
try:
    model = SentenceTransformer('all-MiniLM-L6-v2')
    semantic_embeddings_db = model.encode(data['Combined'].tolist(), convert_to_tensor=True)
    semantic_embeddings_other = model.encode(othertasklist, convert_to_tensor=True)
except Exception as e:
    logging.error(f"Error during model loading or embeddings calculation: {str(e)}")
    raise e

def calculate_percentages(task_sum):
    total = sum(task_sum.values())
    if total == 0:
        return {key: 0 for key in task_sum}
    
    percentages = {key: (float(value) / total) * 100 for key, value in task_sum.items()}
    return percentages
    
# ---------------------------
# 语义搜索函数（未更改）——返回搜索结果的字符串
# ---------------------------
def semantic_search(query, embeddings, dataset, top_k=3, is_other=False):
    """
    执行语义搜索并将结果作为字符串返回。
      - query: 用于搜索的文本
      - embeddings: 预计算的语义向量
      - dataset: 若 is_other=False，则这里是 data(DataFrame)；若 is_other=True，则这里是 othertasklist(列表)
      - top_k: 返回的结果数量
      - is_other: 是否在 other tasklist 中搜索
    返回:
      - str: 包含搜索结果的字符串
    """
    query_embedding = model.encode(query, convert_to_tensor=True)
    scores = util.pytorch_cos_sim(query_embedding, embeddings)[0]

    results_str = []
    if is_other:
        results_str.append(f"Semantic Search Results in Other Tasklist for '{query}':")
    else:
        results_str.append(f"Semantic Search Results in ABA Task Dataset for '{query}':")

    found_any = False
    top_indices = scores.topk(k=top_k).indices.tolist()
    for i, idx in enumerate(top_indices):
        score = scores[idx].item()
        if score > 0.3:  # 相关性阈值，可自定义
            if is_other:
                # 直接从 othertasklist 取
                text = othertasklist[idx]
                results_str.append(f"{i+1}. {text} (Score: {score:.4f})")
            else:
                # 从 DataFrame 中取
                row = dataset.iloc[idx]
                text = f"Domain: {row['Domain']}; Task: {row['Task']}; Sub-Task: {row['Sub-Task']}"
                results_str.append(f"{i+1}. {text} (Score: {score:.4f})")
            found_any = True

    if not found_any:
        results_str.append("No matching results found.")

    return "\n".join(results_str)

# ---------------------------
# 组装给 API 的 prompt (精简成 5 个字段)
# ---------------------------
def build_prompt(retrieved_content: str) -> str:
    """
    根据检索到的内容，生成新的 prompt 格式。
    """
    return (
        f"{retrieved_content}. Combine all the information above. Create a new customized task for Applied Behavior Analysis (ABA) therapy. Do not give me any other word expaniation or any extra word, like Here is the customized task for Applied Behavior Analysis (ABA) therapy:, except the nessary json data! Use ONLY the json format, which have field task, subtask, description, reason, to generate the response. I don't need any change line symbol, I just need a json format response."
    )

# ---------------------------
# 调用新的 API
# ---------------------------
def call_new_api(prompt, model=default_model, temperature=default_temperature, max_tokens=default_max_tokens):
    """
    调用新的 API 并返回结果文本。
    """
    try:
        payload = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": temperature,
            "max_tokens": max_tokens
        }

        headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }

        print("API Call Start")
        response = requests.post(base_url, json=payload, headers=headers)
        print("API Call End successfully")
        if response.status_code == 200:
            output = response.json().get('choices', [{}])[0].get('message', {}).get('content', '')
            
            return output
        else:
            logging.error(f"API call failed with status code {response.status_code}, response: {response.text}")
            return f"Error: {response.text}"

    except Exception as e:
        logging.error(f"Error during API call: {str(e)}")
        return f"Error: {str(e)}"

# ---------------------------
# 定义 Pydantic 模型以匹配请求数据
# ---------------------------

class PassTask(BaseModel):
    task: str
    subtask: str
    trialresult: str

class PassGeneratedTask(BaseModel):
    task: str
    subtask: str
    description: str
    trialresult: str

class LastTask(BaseModel):
    task: str
    subtask: str
    timestamp: str
    trialresult: str
    bvp: float
    gsr: Optional[float]
    wristtemp: Optional[float]
    acceleration_x: Optional[float]
    acceleration_y: Optional[float]
    acceleration_z: Optional[float]
    acceleration: Optional[float]
    description: str

class TaskSum(BaseModel):
    plus_sum: int
    minus_sum: int
    p_sum: int
    ot_sum: int

class GenTaskSum(BaseModel):
    plus_sum: int
    minus_sum: int
    p_sum: int
    ot_sum: int

class RequestModel(BaseModel):
    student_id: int
    domain: str = ""
    additionalNeed: str = ""
    pass_tasks: Optional[List[PassTask]] = []
    pass_generated_task: Optional[List[PassGeneratedTask]] = []
    last_task: Optional[List[LastTask]] = []
    task_sum: TaskSum = TaskSum(plus_sum=0, minus_sum=0, p_sum=0, ot_sum=0)
    gen_task_sum: GenTaskSum = GenTaskSum(plus_sum=0, minus_sum=0, p_sum=0, ot_sum=0)

class ResponseModel(BaseModel):
    status: str
    model_response: str
    
# ---------------------------
# 主入口函数：给外部（例如 Node/Express）调用
# ---------------------------
def handle_request(req_json: RequestModel) -> dict:
    """
    根据接收的 JSON，执行语义检索与 API 调用。
    然后返回一个 JSON 对象给上层。
    """
    # 1) 从 Pydantic 模型中取出需要的字段
    domain_query = req_json.domain.strip()

    if not domain_query:
        raise ValueError("Missing 'domain' field in the request.")

    # 2) 执行语义搜索（在 ABA task dataset）
    results_in_db = semantic_search(domain_query, semantic_embeddings_db, data, top_k=5, is_other=False)

    # 3) 执行语义搜索（在 Other Tasklist）
    results_in_other = semantic_search(domain_query, semantic_embeddings_other, othertasklist, top_k=3, is_other=True)

    # 4) 计算任务总结的百分比
    task_sum_percent = calculate_percentages(req_json.task_sum.dict())
    gen_task_sum_percent = calculate_percentages(req_json.gen_task_sum.dict())

    # 5) 组织其他信息为字符串
    pass_tasks_str = "\n".join([
        f"{idx + 1}. Task: {task.task}, Subtask: {task.subtask}, Trial Result: {task.trialresult}"
        for idx, task in enumerate(req_json.pass_tasks)
    ]) if req_json.pass_tasks else "No Pass Tasks"

    pass_generated_tasks_str = "\n".join([
        f"{idx + 1}. Task: {task.task}, Subtask: {task.subtask}, Description: {task.description}, Trial Result: {task.trialresult}"
        for idx, task in enumerate(req_json.pass_generated_task)
    ]) if req_json.pass_generated_task else "No Pass Generated Tasks"

    last_tasks_str = "\n".join([
        f"{idx + 1}. Task: {task.task}, Subtask: {task.subtask}, Timestamp: {task.timestamp}, Trial Result: {task.trialresult}, Description: {task.description}"
        for idx, task in enumerate(req_json.last_task)
    ]) if req_json.last_task else "No Last Tasks"

    # 6) 拼接检索结果和其他信息
    retrieved_content = (
        results_in_db + "\n\n" +
        results_in_other + "\n\n" +
        f"Task Sum Percentages: {task_sum_percent}\n\n" +
        f"Generated Task Sum Percentages: {gen_task_sum_percent}\n\n" +
        f"Pass Tasks:\n{pass_tasks_str}\n\n" +
        f"Pass Generated Tasks:\n{pass_generated_tasks_str}\n\n" +
        f"Last Tasks:\n{last_tasks_str}"
    )

    # 7) 组装 prompt
    api_prompt = build_prompt(retrieved_content)

    # 8) 调用新的 API 获取结果
    api_result = call_new_api(api_prompt)

    # 9) 返回给上层调用方，最好统一成 JSON 格式
    return {
        "status": "ok",
        "model_response": api_result
    }

# ---------------------------
# 定义 FastAPI 应用和请求模型
# ---------------------------
app = FastAPI(
    title="ABA Task API",
    description="API for handling ABA tasks and semantic search",
    version="1.0"
)

@app.post("/service/generate", response_model=ResponseModel)
async def process_request(request: RequestModel):
    """
    接收 POST 请求，包含详细的学生数据，返回 API 处理结果。
    """
    try:
        print("收到Request")
        response = handle_request(request)
        print("處理完成")
        return response
    except ValueError as ve:
        logging.error(f"ValueError: {str(ve)}")
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logging.error(f"Unhandled exception: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.get("/")
async def root():
    return {"message": "ABA Task API is running. Use /service/generate endpoint to submit requests."}
