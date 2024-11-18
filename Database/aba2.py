import pandas as pd
from sentence_transformers import SentenceTransformer, util

# Load the SentenceTransformer model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Step 1: Load Database_cleanup data
database_path = r"C:\Users\harmi\Desktop\abataskdata.xlsx"
data = pd.read_excel(database_path)

# Load Overall_data
overall_data_path = r"C:\Users\harmi\Desktop\iotreaddata.xlsx"
overall_data = pd.read_excel(overall_data_path)

# Preprocess Database_cleanup - Combine Domain, Task, and Sub-Task columns for semantic search
data['Domain'] = data['Domain'].fillna('').astype(str)
data['Task'] = data['Task'].fillna('').astype(str)
data['Sub-Task'] = data['Sub-Task'].fillna('').astype(str)
data['Combined'] = data.apply(lambda row: f"Domain: {row['Domain']}; Task: {row['Task']}; Sub-Task: {row['Sub-Task']}", axis=1)

# Create embeddings for the combined texts
semantic_embeddings_db = model.encode(data['Combined'].tolist(), convert_to_tensor=True)

# Step 2: Load and preprocess othertasklist data
othertasklist_path = r"C:\Users\harmi\Desktop\othertasklist.txt"
with open(othertasklist_path, 'r', encoding='utf-8') as f:
    othertasklist = [line.strip() for line in f if line.strip()]

# Create embeddings for the othertasklist data
semantic_embeddings_other = model.encode(othertasklist, convert_to_tensor=True)

# Function to filter Overall_data by student ID
def filter_by_student_id(student_id):
    filtered_rows = overall_data[overall_data['student_id'] == student_id]

    # Ask the user to specify the Trial Result feature to filter by
    valid_results = ['+', '-', 'P', 'OT', 'Undo']
    while True:
        trial_result = input(f"Enter the Trial Result feature to filter by ({', '.join(valid_results)}): ").strip().lower()
        if trial_result in map(str.lower, valid_results):
            break
        print(f"Invalid input. Please enter one of the following: {', '.join(valid_results)}.")

    filtered_rows = filtered_rows[filtered_rows['Trial Reuslt'].str.lower() == trial_result]

    prompt_lines = filtered_rows[['Domain', 'Task ', 'Sub-Task']].dropna()

    with open('retrieved_tasks.txt', 'a', encoding='utf-8') as f:
        if not prompt_lines.empty:
            f.write("\nFiltered Custom Prompt Content:\n")
            for _, row in prompt_lines.iterrows():
                result_text = f"Domain: {row['Domain']}, Task: {row['Task ']}, Sub-Task: {row['Sub-Task']}\n"
                print(result_text)
                f.write(result_text)
        else:
            print("\nNo matching records found.")
            f.write("\nNo matching records found.\n")

    return prompt_lines

def semantic_search(query, embeddings, data, n=3, is_other=False):
    """
    Perform semantic search on a given dataset.
    Parameters:
    - query: Search keywords provided by the user.
    - embeddings: Precomputed embeddings for the dataset.
    - data: The dataset (text or DataFrame).
    - n: Number of top results to return (default is 3).
    - is_other: Boolean indicating if searching othertasklist.

    Returns:
    - Results of the search.
    """
    query_embedding = model.encode(query, convert_to_tensor=True)
    scores = util.pytorch_cos_sim(query_embedding, embeddings)[0]

    with open('retrieved_tasks.txt', 'a', encoding='utf-8') as f:
        if is_other:
            f.write(f"\nSemantic Search Results in Other Tasklist for '{query}':\n")
        else:
            f.write(f"\nSemantic Search Results in ABA Task Dataset for '{query}':\n")

        found_results = False
        for i, idx in enumerate(scores.topk(k=n).indices.tolist()):  # Convert indices to integers
            score = scores[idx].item()
            if score > 0.3:  # Threshold for relevance
                if is_other:
                    result_text = othertasklist[idx]
                else:
                    row = data.iloc[idx]
                    result_text = f"Domain: {row['Domain']}; Task: {row['Task']}; Sub-Task: {row['Sub-Task']}"
                print(f"{i+1}. {result_text} (Score: {score:.4f})")
                f.write(f"{i+1}. {result_text} (Score: {score:.4f})\n")
                found_results = True

        if not found_results:
            print("\nNo matching results found.")
            f.write("\nNo matching results found.\n")

# Main program
if __name__ == "__main__":
    while True:
        use_student_id = input("Do you want to input a student ID? (yes or no): ").strip().lower()
        if use_student_id in ['yes', 'no']:
            break
        print("Invalid input. Please enter 'yes' or 'no'.")

    if use_student_id == 'yes':
        student_id = int(input("Please enter the student ID: ").strip())
        filter_by_student_id(student_id)

    query = input("Please enter the most relevant domain you want to search: ").strip()
    print("\nSearching in ABA Task Dataset...")
    semantic_search(query, semantic_embeddings_db, data, n=5)

    print("\nSearching in Other Tasklist...")
    semantic_search(query, semantic_embeddings_other, othertasklist, n=3, is_other=True)
