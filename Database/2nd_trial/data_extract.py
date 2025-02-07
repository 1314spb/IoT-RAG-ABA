import pandas as pd
import os

def extract_data_from_csv(file_path='./Data/2021_11_22_wb.csv'):
    try:
        df = pd.read_csv(file_path, sep=",", na_values='NULL')
        
        print(f"Read {file_path} successfully. It has {len(df)} records.")
        
        df['client_time'] = pd.to_numeric(df['client_time'], errors='coerce').astype('Int64')
        
        df['device_time'] = pd.to_numeric(df['device_time'], errors='coerce')
        
        df['data_type'] = df['data_type'].astype(str).str.strip("'")
        
        for col in ['data_x', 'data_y', 'data_z']:
            df[col] = pd.to_numeric(df[col], errors='coerce')
        
        df['data_value'] = pd.to_numeric(df['data_value'], errors='coerce')
        
        return df
    
    except FileNotFoundError:
        print(f"ERROR : File '{file_path}' can not be found.")
        return None
    except Exception as e:
        print(f"ERROR : {e}")
        return None

def write_data_to_csv(df, output_file, include_index=False):
    try:
        df_clean = df.dropna(axis=1, how='all')
        output_dir = os.path.dirname(output_file)
        
        if output_dir and not os.path.exists(output_dir):
            os.makedirs(output_dir, exist_ok=True)
            print(f"Create directory: '{output_dir}'。")
        
        df_clean.to_csv(output_file, index=include_index, encoding='utf-8-sig')
        print(f"Data write into '{output_file} successfully'。")
    except Exception as e:
        print(f"ERROR : '{output_file}' - {e}")


if __name__ == "__main__":
    csv_file = './Data/2021_11_22_wb.csv'
    
    df = extract_data_from_csv(csv_file)
    
    if df is not None:
        print("\nPreview of the data:")
        print(df.head())
        
        acceleration_df = df[df['data_type'] == 'ACCELERATION']
        bvp_df = df[df['data_type'] == 'BVP']
        gsr_df = df[df['data_type'] == 'GSR']
        temperature_df = df[df['data_type'] == 'TEMPERATURE']
        
        # print("\nAcceleration Data:")
        # print(acceleration_df)
        
        # print("\nBVP Data:")
        # print(bvp_df)
        
        output_file_acc = './Data/use/acceleration_data.csv'
        output_file_bvp = './Data/use/bvp_data.csv'
        output_file_gsr = './Data/use/gsr_data.csv'
        output_file_temp = './Data/use/temperature_data.csv'
        
        write_data_to_csv(acceleration_df, output_file_acc)
        write_data_to_csv(bvp_df, output_file_bvp)
        write_data_to_csv(gsr_df, output_file_gsr)
        write_data_to_csv(temperature_df, output_file_temp)