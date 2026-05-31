#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import csv
import json
import urllib.request
import urllib.parse
import time

def clean_str(val):
    if val is None:
        return None
    val = val.strip()
    if val == '' or val.lower() == 'null':
        return None
    return val

def translate_batch(batch, target_lang):
    """
    Translates a list of strings to target_lang using Google Translate free API.
    """
    joined_text = "\n___\n".join(batch)
    try:
        url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=' + target_lang + '&dt=t&q=' + urllib.parse.quote(joined_text)
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req, timeout=10) as response:
            res = response.read().decode('utf-8')
        data = json.loads(res)
        translated_text = "".join([x[0] for x in data[0] if x[0]])
        
        # Split back by ___
        parts = [p.strip() for p in translated_text.split('___')]
        if len(parts) == len(batch):
            return parts
        else:
            # Try to see if length mismatch is due to minor formatting
            print(f"[!] Batch size mismatch for {target_lang} (expected {len(batch)}, got {len(parts)}).")
            return None
    except Exception as e:
        print(f"[!] Error translating batch to {target_lang}: {e}")
        return None

def translate_single(text, target_lang):
    try:
        url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=' + target_lang + '&dt=t&q=' + urllib.parse.quote(text)
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req, timeout=5) as response:
            res = response.read().decode('utf-8')
        data = json.loads(res)
        return "".join([x[0] for x in data[0] if x[0]]).strip()
    except Exception as e:
        print(f"[!] Error translating single text to {target_lang}: {e}")
        return text

def convert_audit_findings_v2():
    csv_file_path = "/home/jumasi/RiskHunter/documents/audit_risk_hunter.csv"
    json_file_path = "/home/jumasi/RiskHunter/data/cqms_customer_audit_db.json"
    cache_file_path = "/home/jumasi/RiskHunter/scratch/translation_cache.json"
    
    # Load cache if exists
    cache = {"ko": {}, "en": {}, "zh-CN": {}}
    if os.path.exists(cache_file_path):
        try:
            with open(cache_file_path, 'r', encoding='utf-8') as f:
                loaded = json.load(f)
                for lang in cache:
                    if lang in loaded:
                        cache[lang] = loaded[lang]
            print(f"[*] Loaded translation cache with {len(cache['ko'])} KO, {len(cache['en'])} EN, {len(cache['zh-CN'])} ZH entries.")
        except Exception as e:
            print(f"[!] Failed to load cache: {e}")

    print(f"[*] Reading source: {csv_file_path}")
    if not os.path.exists(csv_file_path):
        print(f"[!] Error: {csv_file_path} does not exist.")
        return False
        
    records_raw = []
    with open(csv_file_path, mode='r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            records_raw.append(row)
            
    print(f"[*] Parsed {len(records_raw)} records from CSV.")
    
    # Gather unique strings for translation
    unique_texts = set()
    for row in records_raw:
        for col in ["POINT_OUT", "ROOT_CAUSE_ANALYSIS", "COUNTER_MEASURE"]:
            val = clean_str(row.get(col))
            if val and val not in ('', '-', '~', 'null', 'N/A'):
                unique_texts.add(val)
                
    print(f"[*] Identified {len(unique_texts)} unique text fields to translate.")
    
    # Translate unique texts for each language if not cached
    for lang, lang_code in [("ko", "ko"), ("en", "en"), ("zh-CN", "zh-CN")]:
        to_translate = [t for p in unique_texts if (t := p) not in cache[lang]]
        if to_translate:
            print(f"[*] Translating {len(to_translate)} new texts to {lang_code}...")
            
            # Batch items
            batches = []
            current_batch = []
            current_len = 0
            for item in to_translate:
                if current_len + len(item) > 3000 or len(current_batch) >= 40:
                    batches.append(current_batch)
                    current_batch = [item]
                    current_len = len(item)
                else:
                    current_batch.append(item)
                    current_len += len(item)
            if current_batch:
                batches.append(current_batch)
                
            for idx, b in enumerate(batches, start=1):
                print(f"    -> Progress: Batch {idx}/{len(batches)} ({len(b)} items)...")
                translated_parts = translate_batch(b, lang_code)
                if translated_parts:
                    for s, t in zip(b, translated_parts):
                        cache[lang][s] = t
                else:
                    # Fallback to single translation for each in the batch
                    print("    [!] Falling back to single translation for this batch...")
                    for s in b:
                        cache[lang][s] = translate_single(s, lang_code)
                        time.sleep(0.05)
                # Polite sleep to respect API
                time.sleep(0.1)
                
            # Save cache after each language
            try:
                with open(cache_file_path, 'w', encoding='utf-8') as f:
                    json.dump(cache, f, ensure_ascii=False, indent=2)
            except Exception as e:
                print(f"[!] Failed to save cache: {e}")
        else:
            print(f"[*] All texts for {lang_code} are already translated in cache!")

    # Build final records with translations
    records_final = []
    for idx, row in enumerate(records_raw, start=1):
        owner_id = row.get('OWNER_ID', '').strip()
        if owner_id.isdigit():
            owner_id = int(owner_id)
        elif owner_id == '' or owner_id.lower() == 'null':
            owner_id = None
            
        po = clean_str(row.get("POINT_OUT"))
        rc = clean_str(row.get("ROOT_CAUSE_ANALYSIS"))
        cm = clean_str(row.get("COUNTER_MEASURE"))
        
        # Lookups helper
        def get_trans(val, lang):
            if val is None or val in ('', '-', '~', 'null', 'N/A'):
                return val
            return cache[lang].get(val, val)
            
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
            
            # Original raw fields
            "POINT_OUT": po,
            "ROOT_CAUSE_ANALYSIS": rc,
            "COUNTER_MEASURE": cm,
            
            # Multilingual translations
            "POINT_OUT_KO": get_trans(po, "ko"),
            "POINT_OUT_EN": get_trans(po, "en"),
            "POINT_OUT_ZH": get_trans(po, "zh-CN"),
            
            "ROOT_CAUSE_KO": get_trans(rc, "ko"),
            "ROOT_CAUSE_EN": get_trans(rc, "en"),
            "ROOT_CAUSE_ZH": get_trans(rc, "zh-CN"),
            
            "COUNTER_MEASURE_KO": get_trans(cm, "ko"),
            "COUNTER_MEASURE_EN": get_trans(cm, "en"),
            "COUNTER_MEASURE_ZH": get_trans(cm, "zh-CN"),
            
            "URL": clean_str(row.get("URL"))
        }
        records_final.append(record)
        
    # Write to final JSON DB
    with open(json_file_path, mode='w', encoding='utf-8') as f:
        json.dump(records_final, f, ensure_ascii=False, indent=2)
        
    print(f"[+] Successfully saved fully translated JSON database: {json_file_path}")
    return True

if __name__ == "__main__":
    convert_audit_findings_v2()
