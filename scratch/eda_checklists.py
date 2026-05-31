#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
from collections import Counter

def run_eda():
    json_path = "/home/jumasi/RiskHunter/data/oe_req_to_audit_checklist.json"
    
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"[!] Error reading JSON: {e}")
        return
        
    total_records = len(data)
    print("=" * 60)
    print(f"📊 EXPLORATORY DATA ANALYSIS (EDA) - AUDIT CHECKLISTS DATABASE")
    print("=" * 60)
    print(f"• Total Audit Checklist Records: {total_records}")
    print("-" * 60)
    
    # helper for breakdowns
    def print_breakdown(field_name, title):
        values = [item.get(field_name, "N/A") for item in data]
        counts = Counter(values)
        print(f"\n📈 Breakdown by {title}:")
        print(f"  {'Value':<20} | {'Count':<10} | {'Percentage':<10}")
        print("  " + "-" * 50)
        for val, count in counts.most_common():
            pct = (count / total_records) * 100
            print(f"  {str(val):<20} | {count:<10} | {pct:>8.2f}%")
            
    print_breakdown("customer", "OEM Customer")
    print_breakdown("process_category", "Manufacturing Process Category")
    print_breakdown("priority", "Risk Priority")
    print_breakdown("related_4m", "4M Factors")
    print_breakdown("audit_method", "Audit Verification Method")
    
    # Doc code analysis
    doc_counts = Counter([item.get("doc_code", "N/A") for item in data])
    print(f"\n📄 Top Standard Documents (Doc Codes):")
    for doc, count in doc_counts.most_common(10):
        print(f"  - {doc:<15}: {count} clauses")
        
    print("=" * 60)

if __name__ == "__main__":
    run_eda()
