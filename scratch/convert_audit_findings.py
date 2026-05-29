#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import csv
import json

def convert_audit_findings():
    csv_file_path = "/home/jumasi/RiskHunter/documents/audit_risk_hunter.csv"
    json_file_path = "/home/jumasi/RiskHunter/data/audit_findings.json"
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(json_file_path), exist_ok=True)
    
    print(f"[*] Reading source: {csv_file_path}")
    if not os.path.exists(csv_file_path):
        print(f"[!] Error: {csv_file_path} does not exist.")
        return False
        
    records = []
    
    def clean_str(val):
        if val is None:
            return None
        val = val.strip()
        if val == '' or val.lower() == 'null':
            return None
        return val

    with open(csv_file_path, mode='r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for idx, row in enumerate(reader, start=1):
            owner_id = row.get('OWNER_ID', '').strip()
            if owner_id.isdigit():
                owner_id = int(owner_id)
            elif owner_id == '' or owner_id.lower() == 'null':
                owner_id = None
            
            record = {
                "TYPE": clean_str(row.get("TYPE")),
                "SUBJECT": clean_str(row.get("SUBJECT")),
                "START_DT": clean_str(row.get("START_DT")),
                "END_DT": clean_str(row.get("END_DT")),
                "OWNER_ID": owner_id,
                "REG_DT": clean_str(row.get("REG_DT")),
                "COMP_DT": clean_str(row.get("COMP_DT")),
                "STATUS": clean_str(row.get("STATUS")),
                "PLANT": clean_str(row.get("PLANT")),
                "CAR_MAKER": clean_str(row.get("CAR_MAKER")),
                "PROJECT": clean_str(row.get("PROJECT")),
                "M_CODE": clean_str(row.get("M_CODE")),
                "PROCESS": clean_str(row.get("Process")),
                "POINT_OUT": clean_str(row.get("POINT_OUT")),
                "ROOT_CAUSE_ANALYSIS": clean_str(row.get("ROOT_CAUSE_ANALYSIS")),
                "COUNTER_MEASURE": clean_str(row.get("COUNTER_MEASURE")),
                "URL": clean_str(row.get("URL"))
            }
            records.append(record)
            
    print(f"[*] Parsed {len(records)} records from CSV.")
    
    # Write to JSON
    with open(json_file_path, mode='w', encoding='utf-8') as f:
        json.dump(records, f, ensure_ascii=False, indent=2)
        
    print(f"[+] Successfully saved structured JSON database: {json_file_path}")
    return True

if __name__ == "__main__":
    convert_audit_findings()
