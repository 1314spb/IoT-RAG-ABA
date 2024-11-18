import pandas as pd
from rank_bm25 import BM25Okapi

# Step 1: Load Database_cleanup data
database_path = r"C:\Users\harmi\Desktop\Database_cleanup.xlsx"
data = pd.read_excel(database_path)

# Load Overall_data
overall_data_path = r"C:\Users\harmi\Desktop\Overall_data.xlsx"
overall_data = pd.read_excel(overall_data_path)

# Preprocess Database_cleanup - Combine Domain, Task, and Sub-Task columns
data['Domain'] = data['Domain'].fillna('').astype(str)
data['Task'] = data['Task'].fillna('').astype(str)
data['Sub-Task'] = data['Sub-Task'].fillna('').astype(str)
data['combined_text'] = data['Domain'] + ' ' + data['Task'] + ' ' + data['Sub-Task']

# Tokenize task texts
tokenized_tasks = [task.split() for task in data['combined_text']]
bm25 = BM25Okapi(tokenized_tasks)

# Function to filter Overall_data by student ID
def filter_by_student_id(student_id):
    """
    Filters Overall_data based on student ID and a selected Trial Result feature.
    Parameters:
    - student_id: The student ID provided by the user.

    Returns:
    - prompt_lines: Filtered rows containing Domain, Task, and Sub-Task information.
    """
    # Filter rows matching the student ID
    filtered_rows = overall_data[overall_data['student_id'] == student_id]

    # Ask the user to specify the Trial Result feature to filter by
    valid_results = ['+', '-', 'P', 'OT']
    while True:
        trial_result = input(f"Enter the Trial Result feature to filter by ({', '.join(valid_results)}): ").strip()
        if trial_result in valid_results:
            break
        print("Invalid input. Please enter one of the following: +, -, P, OT.")

    # Filter rows by the specified Trial Result feature
    filtered_rows = filtered_rows[filtered_rows['Trial Reuslt'] == trial_result]

    # Extract Domain, Task, and Sub-Task columns
    prompt_lines = filtered_rows[['Domain', 'Task ', 'Sub-Task']].dropna()

    # Write the filtered rows to a file
    with open('retrieved_tasks.txt', 'a', encoding='utf-8') as f:
        if not prompt_lines.empty:
            f.write("\nFiltered Prompt Content:\n")
            for _, row in prompt_lines.iterrows():
                result_text = f"Domain: {row['Domain']}, Task: {row['Task ']}, Sub-Task: {row['Sub-Task']}\n"
                print(result_text)
                f.write(result_text)
        else:
            print("\nNo matching records found.")
            f.write("\nNo matching records found.\n")

    return prompt_lines

# BM25 search function for Database_cleanup
def bm25_search(query, n=5):
    """
    Perform BM25-based search on Database_cleanup data.
    Parameters:
    - query: Search keywords provided by the user.
    - n: Number of top results to return (default is 5).

    Returns:
    - Results of the search.
    """
    # Tokenize query text
    tokenized_query = query.split()

    # Get the top N most relevant tasks using BM25
    results = bm25.get_top_n(tokenized_query, data['combined_text'], n=n)

    # Write the search results to a file
    with open('retrieved_tasks.txt', 'a', encoding='utf-8') as f:
        f.write(f"\nBM25 Search Results for '{query}':\n")
        for i, result in enumerate(results, 1):
            row = data[data['combined_text'] == result].iloc[0]
            result_text = f"{i}. Domain: {row['Domain']}; Task: {row['Task']}; Sub-Task: {row['Sub-Task']}\n"
            print(result_text)
            f.write(result_text)

# Main program
if __name__ == "__main__":
    # Ask the user whether to input a student ID
    use_student_id = input("Do you want to input a student ID? (yes or no): ").strip().lower()

    if use_student_id == 'yes':
        # User chooses to input a student ID
        student_id = int(input("Please enter the student ID: ").strip())
        filter_by_student_id(student_id)

        # After filtering, perform BM25 search on Database_cleanup
        query = input("Please enter the most relevant domain you want to search: ").strip()
        bm25_search(query, n=5)
    elif use_student_id == 'no':
        # User chooses not to input a student ID, directly perform BM25 search
        query = input("Please enter the most relevant domain you want to search: ").strip()
        bm25_search(query, n=5)
    else:
        print("Invalid input. Please restart the program and enter 'yes' or 'no'.")
