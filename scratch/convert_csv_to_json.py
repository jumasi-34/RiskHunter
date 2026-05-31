#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import csv
import json
from datetime import datetime

def convert_csv_to_json():
    csv_file_path = "/home/jumasi/RiskHunter/documents/audit_checklists.csv"
    json_file_path = "/home/jumasi/RiskHunter/data/oe_req_to_audit_checklist.json"
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(json_file_path), exist_ok=True)
    
    print(f"[*] Reading source: {csv_file_path}")
    if not os.path.exists(csv_file_path):
        print(f"[!] Error: {csv_file_path} does not exist.")
        return False
        
    records = []
    
    with open(csv_file_path, mode='r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for idx, row in enumerate(reader, start=1):
            record = {
                "id": idx,
                "source_type": "DOCUMENT",
                "source_id": row.get("doc_code", "N/A"),
                "plant_code": "ALL",
                "customer": row.get("customer", "").strip(),
                "doc_code": row.get("doc_code", "").strip(),
                "doc_name": row.get("doc_name", "").strip(),
                "section": row.get("section", "").strip(),
                "requirement": row.get("requirement", "").strip(),
                "audit_question": row.get("audit_question", "").strip(),
                "evidence_compliance": row.get("evidence_compliance", "").strip(),
                "audit_method": row.get("audit_method", "").strip(),
                "requirement_type": row.get("requirement_type", "").strip(),
                "process_category": row.get("process_category", "").strip(),
                "related_4m": row.get("related_4m", "").strip(),
                "priority": row.get("priority", "").strip(),
                "plant_risk_score": 0.0,
                "processed_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
            records.append(record)
            
    print(f"[*] Parsed {len(records)} records from CSV.")
    
    # Write to JSON
    with open(json_file_path, mode='w', encoding='utf-8') as f:
        json.dump(records, f, ensure_ascii=False, indent=2)
        
    print(f"[+] Successfully saved structured JSON database: {json_file_path}")
    return True

if __name__ == "__main__":
    convert_csv_to_json()
