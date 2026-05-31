import json
import os

def filter_quality_issues():
    file_path = 'data/cqms_qualityissue_db.json'
    if not os.path.exists(file_path):
        print(f"Error: {file_path} not found.")
        return
        
    print(f"Reading {file_path}...")
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    original_count = len(data)
    
    # Filter only "Mass Production"
    filtered_data = [item for item in data if item.get('STAGE') == 'Mass Production']
    filtered_count = len(filtered_data)
    
    print(f"Filtering complete. Original: {original_count} records. Filtered: {filtered_count} records.")
    
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(filtered_data, f, ensure_ascii=False, indent=2)
        
    print("Successfully saved filtered data back to the file.")

if __name__ == '__main__':
    filter_quality_issues()
