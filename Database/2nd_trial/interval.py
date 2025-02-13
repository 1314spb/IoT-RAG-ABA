import pandas as pd

def assign_scores(task_data_path: str, iot_data_path: str, output_path: str = None):
    """
    Assigns scores to IoT data based on the Training Session data.

    Parameters:
    - task_data_path: Path to the TrainingSession.csv file.
    - iot_data_path: Path to the 2021_11_22_wb.csv file.
    - output_path: (Optional) Path to save the merged DataFrame as a CSV.
    """
    
    # ============================
    # 1. Load Task Data
    # ============================
    try:
        task_df = pd.read_csv(task_data_path, sep='|')
        print(f"Loaded Task Data from {task_data_path} successfully.")
    except FileNotFoundError:
        print(f"Error: The file {task_data_path} was not found.")
        return
    except Exception as e:
        print(f"An error occurred while reading {task_data_path}: {e}")
        return

    # Ensure 'training_time_stamp' is of integer type
    task_df['training_time_stamp'] = pd.to_numeric(task_df['training_time_stamp'], errors='coerce')
    task_df = task_df.dropna(subset=['training_time_stamp'])
    task_df['training_time_stamp'] = task_df['training_time_stamp'].astype(int)
    
    # Sort Task Data by 'training_time_stamp'
    task_df_sorted = task_df.sort_values('training_time_stamp').reset_index(drop=True)
    
    # ============================
    # 2. Load IoT Data
    # ============================
    try:
        iot_df = pd.read_csv(iot_data_path)
        print(f"Loaded IoT Data from {iot_data_path} successfully.")
    except FileNotFoundError:
        print(f"Error: The file {iot_data_path} was not found.")
        return
    except Exception as e:
        print(f"An error occurred while reading {iot_data_path}: {e}")
        return

    # Ensure 'client_time' is of integer type
    iot_df['client_time'] = pd.to_numeric(iot_df['client_time'], errors='coerce')
    iot_df = iot_df.dropna(subset=['client_time'])
    iot_df['client_time'] = iot_df['client_time'].astype(int)
    
    # Sort IoT Data by 'client_time'
    iot_df_sorted = iot_df.sort_values('client_time').reset_index(drop=True)
    
    # ============================
    # 3. Merge Data with As-Of Join
    # ============================
    # Perform an as-of merge to find the latest task score before each client_time
    merged_df = pd.merge_asof(
        iot_df_sorted,
        task_df_sorted[['training_time_stamp', 'score']],
        left_on='client_time',
        right_on='training_time_stamp',
        direction='backward'
    )
    
    # Assign '-' where there is no preceding training_time_stamp
    merged_df['score'] = merged_df['score'].fillna('-')
    
    # Optionally, drop the 'training_time_stamp' column as it's no longer needed
    merged_df = merged_df.drop(columns=['training_time_stamp'])
    
    # ============================
    # 4. (Optional) Save Merged Data
    # ============================
    if output_path:
        try:
            merged_df.to_csv(output_path, index=False)
            print(f"Merged data saved to {output_path}.")
        except Exception as e:
            print(f"An error occurred while saving to {output_path}: {e}")
    
    # ============================
    # 5. Display Sample Output
    # ============================
    print("\nSample of Merged Data:")
    print(merged_df.head())

    return merged_df

# ============================
# Execution Example
# ============================

if __name__ == "__main__":
    # Define the paths to your CSV files
    task_data_file = 'Data/TrainingSession.csv'
    iot_data_file = 'Data/2021_11_22_wb.csv'
    output_file = 'Data/Merged_IoT_Data_with_Scores.csv'  # Change or set to None if not needed
    
    # Call the function to assign scores
    merged_data = assign_scores(task_data_file, iot_data_file, output_file)