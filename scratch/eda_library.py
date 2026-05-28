import json
from collections import Counter, defaultdict

# Load database
json_path = "/home/jumasi/RiskHunter/data/document_library.json"
with open(json_path, "r", encoding="utf-8") as f:
    data = json.load(f)

print(f"==================================================")
print(f"📊 [EDA] RiskHunter Document Library Database")
print(f"==================================================")
print(f"• Total Documents Processed: {len(data)}\n")

# 1. Distribution by Customer (OEM)
customer_counter = Counter(doc["customer"] for doc in data)
print("1. 🏢 Distribution by Customer (OEM)")
print("-" * 40)
for cust, count in sorted(customer_counter.items(), key=lambda x: x[1], reverse=True):
    percentage = (count / len(data)) * 100
    print(f"  - {cust:<15} : {count:>3} files ({percentage:.1f}%)")
print()

# 2. Distribution by Document Type
type_counter = Counter(doc["doc_type"] for doc in data)
print("2. 📄 Distribution by Document Type")
print("-" * 40)
for dtype, count in sorted(type_counter.items(), key=lambda x: x[1], reverse=True):
    percentage = (count / len(data)) * 100
    print(f"  - {dtype:<35} : {count:>3} files ({percentage:.1f}%)")
print()

# 3. Distribution by Focus Process (Tire Manufacturing Process Translation)
process_counter = Counter(doc["tire_process_translation"]["focus_process"] for doc in data)
print("3. ⚙️ Distribution by Focus Process (Tire Process Translation)")
print("-" * 40)
for proc, count in sorted(process_counter.items(), key=lambda x: x[1], reverse=True):
    percentage = (count / len(data)) * 100
    print(f"  - {proc:<45} : {count:>3} files ({percentage:.1f}%)")
print()

# 4. Applicable Processes Multi-label Distribution
all_applicable = []
for doc in data:
    all_applicable.extend(doc["review_summary"]["applicable_processes"])
app_counter = Counter(all_applicable)
print("4. 🔄 Applicable Processes (Multi-label Occurrences in Checklists)")
print("-" * 40)
for proc, count in sorted(app_counter.items(), key=lambda x: x[1], reverse=True):
    percentage = (count / len(data)) * 100
    print(f"  - {proc:<15} : {count:>3} matches ({percentage:.1f}% of docs have this process marked)")
print()

# 5. Cross Tabulation: Customer (OEM) vs Focus Process
print("5. 🎛️ Cross-Tabulation: OEM vs Focus Process")
print("-" * 65)
cross_tab = defaultdict(lambda: defaultdict(int))
for doc in data:
    cross_tab[doc["customer"]][doc["tire_process_translation"]["focus_process"]] += 1

# Header
processes = sorted(list(set(doc["tire_process_translation"]["focus_process"] for doc in data)))
print(f"{'OEM':<12} | " + " | ".join(f"{p[:15]}..." for p in processes))
print("-" * 120)
for cust in sorted(customer_counter.keys()):
    row_str = f"{cust:<12} | "
    row_vals = []
    for p in processes:
        row_vals.append(f"{cross_tab[cust][p]:^18}")
    row_str += " | ".join(row_vals)
    print(row_str)
print()
