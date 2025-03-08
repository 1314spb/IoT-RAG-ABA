import json

allowed_keys = [
    "acceleration", "acceleration_x", "acceleration_y", "acceleration_z", 
    "bvp", "date", "domain", "gsr", "id", "noofOT", "noofP", "noofUndo", 
    "noof_negative", "noof_positive", "session_id", "student_id", 
    "subtask", "task", "timestamp", "trialresult", "wristtemp"
]

with open("temp.json", "r", encoding="utf-8") as infile:
    data = json.load(infile)

filtered_sessions = []
for session in data.get("sessions", []):
    filtered_session = {key: session[key] for key in allowed_keys if key in session}
    filtered_sessions.append(filtered_session)

filtered_data = {"sessions": filtered_sessions}

with open("temp_filter.json", "w", encoding="utf-8") as outfile:
    json.dump(filtered_data, outfile, indent=4, ensure_ascii=False)

print("已成功產生過濾後的 JSON 檔案：temp_filter.json")