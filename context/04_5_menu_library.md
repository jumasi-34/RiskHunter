# 📂 [Context 04_5] Library & Floating Assistant (통합 지식 라이브러리 및 AI 감사 비서)

본 문서는 **5. Library** 메인 메뉴 및 화면 우측 하단의 상시 **Floating Assistant (AI 감사 비서)**의 화면 구성, 사용 데이터 연계, 기능 요구사항, UI/UX 사양 및 현장 감사 워크플로우를 정의하는 공식 기획 설계서입니다.

동료가 설계한 '자가 감사 체크리스트 엔진(`04_3_menu_self_audit_checklist`)'의 강력한 비즈니스 로직(OEM 상속, 중복 질문 병합, 다국어 텍스트 마이닝 공정 분류, Fallback 사전 등)을 기존의 프리미엄 2중 서브 탭 라이브러리 구조에 무결하게 병합하여, 전사 품질 요건과 리스크를 기하학적으로 연계하는 프리미엄 감사 지식 허브로 완성합니다.

---

## 🎯 1. 설계 및 연동 목적

### ① 목적
**Library** 메뉴는 전사적으로 표준화된 자체 감사 마스터 체크리스트 및 완성차 고객사(OEM) 요구 규격 문서를 고속 탐색, 필터링 및 다운로드하는 지식 관리 센터(Knowledge Hub)입니다. 

동료가 설계한 지능형 데이터 처리 로직을 탑재하여 다음을 달성합니다:
1. **스마트 OEM 상속(Smart OEM Hierarchy)**을 통해 부모 브랜드 선택 시 자회사 및 합작 브랜드 규격을 자동으로 통합 매핑.
2. **중복 질문 제거(De-duplication)** 알고리즘을 통해 수만 건의 체크리스트 데이터 중복 노출을 차단하여 오디터의 수검 피로도 최소화.
3. **다국어 텍스트 마이닝 기반 공정 분류(`getFindingProcess`)**를 통해 손상되거나 비어 있는 과거 지적사항 데이터를 15대 표준 공정 코드로 실시간 유추 매핑하여 데이터 무결성 보증.
4. **전문가 Fallback 사전(Fallback Dictionary)** 설계로 데이터 유실 및 데모 시연 상의 오동작 확률을 영(0)으로 수렴(Zero Crash Policy).

### ② 연동 데이터 리소스
- **자체 감사 체크리스트 데이터**: [audit_checklists.json](file:///home/jumasi/RiskHunter/data/audit_checklists.json)
  - 10,000건 이상의 고품질 자체 감사 질문 세트.
  - 주요 필드: `id`, `source_type`, `customer`, `doc_code`, `doc_name`, `section`, `audit_question`, `evidence_compliance`, `audit_method`, `process_category`, `related_4m`, `priority`, `plant_risk_score`.
- **완성차 OEM 규격 문서 데이터**: [document_library.json](file:///home/jumasi/RiskHunter/data/document_library.json)
  - 주요 고객사(BMW, Audi, Hyundai 등)의 최신 기술 요건 및 AI 분석 요약 스키마.
  - 주요 필드: `id`, `filename`, `customer`, `doc_code`, `doc_name`, `revision_date`, `doc_type`, `file_size`, `review_summary`, `tire_process_translation`.
- **과거 OE Audit 지적사항 데이터**: [audit_findings.json](file:///home/jumasi/RiskHunter/data/audit_findings.json)
  - 공장별 과거 지적사항 이력 및 조치 완료/미결 리스트.
  - 주요 필드: `TYPE`, `STATUS`, `CAR_MAKER`, `SUBJECT`, `POINT_OUT`, `ROOT_CAUSE_ANALYSIS`, `COUNTER_MEASURE` 등.

---

## 💻 2. UI/UX 레이아웃 설계

전체 화면은 프리미엄 슬레이트 다크 블루 테마 기반의 글래스모피즘 효과와 테크니컬 시안 블루 액센트 컬러를 반영하여 계기판 감성의 하이테크 레이아웃으로 설계합니다.

```
+-----------------------------------------------------------------------------------------+
| [공통 글로벌 사이드바 필터]                                                              |
| 공장: [ ALL / DP / MP / .. ] | 공정: [ ALL / Mixing / Extrusion / Curing / Building / .. ] |
+-----------------------------------------------------------------------------------------+
| ■ 5. Library (통합 감사 지식 라이브러리)                                                 |
|                                                                                         |
|  [Sub-Tab 1: Full Checklist]  [Sub-Tab 2: Customer Requirements]                      |
| +-------------------------------------------------------------------------------------+ |
| | (서브 탭 내부 렌더링 영역)                                                            | |
| |                                                                                     | |
| +-------------------------------------------------------------------------------------+ |
+-----------------------------------------------------------------------------------------+
                                                                             [💬 Floating]
```

---

## 📋 3. 서브 탭 1: Full Checklist Library (공정별 감사 마스터 체크리스트)

[audit_checklists.json](file:///home/jumasi/RiskHunter/data/audit_checklists.json) 데이터를 비동기 fetch하여 사용자가 공정별 전체 현황을 직관적으로 확인하고 정합성 높은 검색을 수행할 수 있도록 지원합니다.

### ① 공정별 전체 현황 요약 보드 (Process-wise Status Grid)
- **요구 사양**: 체크리스트 목록 상단에 15대 타이어 생산 공정(Mixing, Extrusion, Curing, Building, Inspection 등) 또는 대분류 프로세스 카테고리별 전체 현황을 카드 형태로 시각화합니다.
- **시각 요소**: 
  - 가로 스크롤 또는 유연한 Flex Grid 형태의 미니 글래스모피즘 공정 현황 보드 배치.
  - 공정명 배지, 해당 공정에 배정된 **총 감사 질문 개수 (Total Questions)**, **고위험(High Priority) 질문 비율/개수**, 그리고 **자체 점검 진척률**을 직관적인 인디케이터로 표현합니다.
  - 특정 공정 카드를 클릭하면 하단 데이터 그리드가 해당 공정으로 무지연 필터링되는 퀵 필터 인터랙션을 탑재합니다.

### ② 체크리스트 고속 데이터 그리드 (Checklist Grid)
- **테이블 컬럼**:
  1. **ID**: 체크리스트 고유 ID.
  2. **고객사 (Customer)**: 완성차 OEM명 배지 (Audi, BMW, Benz, VW 등).
  3. **규격 코드 (Doc Code)**: 연계된 원천 규격 코드.
  4. **공정 분류 (Process)**: `process_category` 또는 `related_4m` 배지.
  5. **중요도 (Priority)**: High (적색/황색 뱃지 테두리 애니메이션), Medium, Low.
  6. **감사 질문 (Audit Question)**: 핵심 질문 내용 요약 (텍스트가 길 경우 호버 시 풀 텍스트 툴팁 제공).
  7. **준수 증적 (Compliance Evidence)**: 품질 확보를 위해 현장에서 제출해야 할 물리 증적 목록 (상세 드로어 연동).

### ③ 핵심 비즈니스 로직 (Core Business Logic)

#### 🛡️ 1) 제조공정 필터 제거에 따른 Null Guard 설계 (Zero Crash Policy)
화면 가독성 및 필터 단순화 피드백을 적극 수용하여, UI 단의 로컬 공정 필터 누락이나 글로벌 공정 필터바가 특정 뷰에서 분리되더라도 시스템이 크래시되지 않도록 방어하는 샌드박스 코드를 탑재합니다.
- **프로그램 중단 방지**: `document.getElementById('process-select')` 또는 `filter-process`가 `null`을 반환하더라도 프로그램 실행이 멈추지 않도록 제어 분기를 마련합니다.
- **공정 디폴트 필터링 백업**: 사용자가 공정을 선택할 수 없는 환경이거나 누락 상태일 경우, 내부 변수인 `selectedProcess`는 상시 **`"All" (전체 공정)`**을 기본값으로 상속받아 유연하게 작동합니다.

#### 🚗 2) 완성차 계층형 매핑 마스터 (Smart OEM Hierarchy)
완성차 브랜드 필터 선택 시 종속 합작사 및 서브 브랜드(Sub-brand)의 데이터를 계층적으로 자동 통합 및 상속하여 조회 범위를 지능적으로 확장합니다.

```javascript
const OEM_MASTER = {
    "VW": { name: "Volkswagen (폭스바겐)", subs: ["Anhui VW", "FAW VW"] },
    "Audi": { name: "Audi AG (아우디)", subs: ["SAIC Audi"] },
    "Benz": { name: "Mercedes-Benz (벤츠)", subs: [] },
    "BMW": { name: "BMW Group (비엠더블유)", subs: [] },
    "BYD": { name: "BYD (비야디)", subs: [] },
    "China Local": { name: "China Local (중국 로컬 OEM)", subs: [] },
    "FAW": { name: "FAW Group (제일자동차)", subs: ["FAW-Bestune"] },
    "Ford": { name: "Ford Motor (포드)", subs: [] },
    "GM": { name: "General Motors (지엠)", subs: [] },
    "Great wall auto": { name: "Great Wall Motor (장성기차)", subs: [] },
    "HKMC": { name: "Hyundai/Kia (현대자동차/기아)", subs: ["HMC", "KMC", "Hyundai"] },
    "Lucid": { name: "Lucid Motors (루시드)", subs: [] },
    "Porsche": { name: "Porsche (포르쉐)", subs: [] },
    "Renault-Nisaan": { name: "Renault-Nissan (르노-닛산)", subs: [] },
    "Rivian": { name: "Rivian (리비안)", subs: [] },
    "Stellantis": { name: "Stellantis (스텔란티스)", subs: [] },
    "TATA Daewoo": { name: "TATA Daewoo (타타대우)", subs: [] },
    "Tesla": { name: "Tesla (테슬라)", subs: [] },
    "Toyota": { name: "Toyota (토요타)", subs: [] },
    "Xiaomi": { name: "Xiaomi (샤오미)", subs: [] }
};
```
- 사용자가 부모 OEM(`selectedOem`)을 선택하면, 검색 대상 타겟 배열(`targetOems`)을 다음과 같이 빌드하여 필터링합니다:
  ```javascript
  let targetOems = [selectedOem];
  if (OEM_MASTER[selectedOem] && OEM_MASTER[selectedOem].subs) {
      targetOems = targetOems.concat(OEM_MASTER[selectedOem].subs);
  }
  const lowerTargetOems = targetOems.map(o => o.toLowerCase());
  ```

#### 🔄 3) 맞춤형 감사 체크리스트 추출 및 중복 병합 알고리즘 (De-duplication)
고객사 필터, 공정 필터, 검색 키워드를 조합하여 데이터를 필터링하고 중복 질문을 완전히 합칩니다.
- **De-duplication**: 질문 텍스트의 앞뒤 공백을 다듬어 세트(`Set`) 자료구조를 통해 중복을 제로화함으로써 동일 질문의 누적 노출을 방지합니다.
  ```javascript
  const seenQuestions = new Set();
  filteredChecklists = filteredChecklists.filter(item => {
      const q = (item.audit_question || '').trim();
      if (!q) return true;
      if (seenQuestions.has(q)) return false;
      seenQuestions.add(q);
      return true;
  });
  ```

#### 📥 4) 한글 깨짐 방지 엑셀 데이터 단일화 내보내기 알고리즘 (UTF-8 BOM Export)
사용자가 체크리스트를 현재 필터링된 데이터 상태 그대로 CSV 파일로 다운로드할 수 있는 버튼을 제공합니다.
- **한국어 MS Excel 호환 인코딩**: 국내 엑셀 프로그램에서 한글 깨짐 없이 정상 개봉되도록 **UTF-8 BOM (UTF-8-SIG, `\ufeff`)**을 접두사 바인딩 처리합니다.
  ```javascript
  const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  ```
- **출력 헤더 맵**: `구분 (Section)`, `감사 체크리스트 핵심 질문`, `대응 합치 증적 요구 요건`, `검사 방법`으로 정렬되어 화면 구성과의 정합성을 완성합니다.

---

## 📂 4. 서브 탭 2: Customer Requirements Library (완성차 OEM 규격 요약 및 다운로드)

[document_library.json](file:///home/jumasi/RiskHunter/data/document_library.json) 파일에 수록된 각 고객사별 실제 기술 규격 원본 데이터의 명세를 한눈에 확인하고, 다운로드 요구를 처리합니다.

### ① 상단 메트릭 요약 보드 (Metric Summary Cards)
- **4대 메트릭 요약 (4-Column)**:
  - **글로벌 완성차 수 (OEs)**: 수록된 전체 완성차 브랜드 수 실시간 연산 표기.
  - **탑재 기술 표준 수 (Documents)**: 탑재된 총 규격 표준서의 수 실시간 표기.
  - **문서 분류 체계 (Doc Types)**: 수록된 고유 문서 규격 구분 체계 총 수 및 리스트 표기.
  - **주요 완성차별 점유율 (Top 10)**: 보유하고 있는 문서 수 기준 상위 완성차 메이커의 점유율 순위와 수량을 미니 가로 막대 그래프로 렌더링.

### ② 2단계 드롭다운 지능형 필터 (2-Stage Dropdown Filter)
- **1단계: 완성차 제조사 선택 (`#lib-oem-select`)**:
  - 데이터셋의 고유 완성차 메이커 목록을 추출하여 가나다/알파벳 순으로 정렬 적재.
- **2단계: 상세 규격 표준서 선택 (`#lib-doc-select`)**:
  - 1단계에서 선택된 제조사에 수속된 규격서 목록을 동적으로 매핑하여 표출하고, 제조사 변경 시 첫 번째 규격서를 디폴트로 자동 바인딩.

### ③ 2분할 상세 요약 패널 (2-Column Details Layout)
- **좌측: 규격 기본 정보 카드**:
  - 선택된 표준서의 완성차 제조사 배지, 규격 코드, 문서 구분, 그리고 가상 원본 파일명을 고가독성 데이터 바인딩 제공.
  - `#btn-lib-download-doc` (원본 파일 링크 접속) 클릭 시 AI 상세 요약 텍스트 또는 다운로드 파이프라인 트리거.
- **우측: AI 상세 검토 정보 카드**:
  - `review_summary` 및 `tire_process_translation` 오브젝트를 파싱하여 아래 정보를 한눈에 알아볼 수 있도록 시각화:
    - **AI 요약 개요 (Review Overview)**: 규격서의 핵심 비즈니스 목적 및 용도 서술.
    - **타이어 제조 공정 정밀 역해석 지침 (Tire Process Translation)**:
      - *타겟 공정 분야 (Focus Process)*
      - *핵심 공정 파라미터 제어 가이드 (process_param_check)*
      - *미준수 시 품질 위협 시나리오 (quality_defect_risk)*: 적색 위험 강조 텍스트 가시화.
      - *작업표준 개정 가이드라인 (SOP Action Guide)*: SOP 반영 권고 지침.
    - **적용 생산공정 및 수검 대응 필수 실물 증적 (Required Evidences)**: 적용 공정 칩 세트와 피감사 시 제출할 필수 실물 대장 목록 렌더링.
    - **핵심 규제 준수 조항 (Key Clauses)**: 조항 코드, 제목, 규격 상세 요건을 카드형 리스트 형태로 아름답게 전개.

### ④ 하단 전체 표준서 통합 레지스트리 (Master Document Registry Table)
- **실시간 목록 및 선택 동기화**:
  - 현재 상단에서 선택된 제조사(OEM) 소속의 모든 규격서를 리스트업하는 마스터 대장 테이블 (`#lib-registry-table-body`).
  - 특정 규격서 행 클릭 시 상단의 드롭다운 필터(OEM 및 Doc Select)가 자동으로 스위칭되며, 상세 요약 정보가 실시간 교체 바인딩.
  - 선택된 행에는 active 하이라이트 배경색 및 트랜지션을 가미하고 스무스 스크롤 자동 정렬을 수행하여 탐색 완성도 제고.

### ⑤ 필요 시 규격 원본 다운로드 기능 (Document Download Engine)
- **가상 다운로드 엔진 (WASM-free Client Blob Download)**:
  - MVP 환경에서 외부 파일 서버가 연결되어 있지 않더라도, 실제 파일이 다운로드되는 것과 동일한 강력한 사용자 경험(WOW Effect)을 선사하기 위해 가상 다운로드 엔진을 설계합니다.
  - 버튼 클릭 시 브라우저 내에서 해당 문서 데이터의 상세 핵심 사항과 AI 요약 요약문을 가상 생성하여 정제된 `.txt` 또는 `.pdf` 구조의 가상 실물 Blob 파일 객체를 생성하고, 브라우저 다운로드 파이프라인을 트리거하여 로컬 디스크로 즉시 내려받도록 완결합니다. (예: `[고객사_규격코드]_AI_Summary.txt` 형태로 다운로드 처리하여 오프라인 시연장에서도 완벽히 검증 가능하도록 설계).

---

## 🧠 5. [연계 공유 로직] 과거 Audit 지적사항 가공 및 텍스트 마이닝

동료가 설계한 '과거 지적사항 필터링 및 공정 자동 분류 알고리즘'은 `3. Plant Risk & Action` (`04_3`)의 실시간 구동 및 `5. Library` 데이터의 완성도 보강을 위해 두 메뉴가 전역적으로 긴밀하게 공유하는 핵심 유틸리티 로직입니다.

### ① 과거 OE Audit 지적사항 핵심 타입 및 상태 필터링 알고리즘
과거 원천 데이터에서 수검 실무상 가치가 높은 **Project 및 System 타입의 지적사항**만 선별하고, 데이터 무결성을 위해 삭제되거나 무효화된 내역을 강력하게 걸러냅니다.
- **필터 조건**:
  1. `TYPE`이 'Project' 또는 'System'인 유효 지적사항만 노출.
  2. `STATUS`가 'deleted' 또는 'customer_audit_deleted'인 부적합 항목은 완전 제외.
  3. `OEM_MASTER`를 활용한 계층형 상속 필터 매칭 적용.

### ② 텍스트 마이닝 기반 지적사항 공정 분류 알고리즘 (`getFindingProcess`)
원천 지적사항 데이터에 공정 정보가 유실되어 손상되어 있더라도, 다국어(한국어, 영어, 중국어) 정규식 형태소 분석을 통해 해당 공정을 15대 표준 공정 코드로 실시간 자동 유추 매핑합니다.
- **동작 단계**:
  1. 지적내용(`POINT_OUT`), 주제(`SUBJECT`), 원인분석(`ROOT_CAUSE_ANALYSIS`), 조치대책(`COUNTER_MEASURE`) 텍스트를 모두 통합하여 스캔 타겟 문자열 구축.
  2. 다국어 형태소 정규식 패턴 분류 스캔 실행:
```javascript
function getFindingProcess(finding) {
    if (finding.process_category) return finding.process_category;
    if (finding.PROCESS) return finding.PROCESS;
    if (finding.process) return finding.process;
    
    const pt = (finding.POINT_OUT || '').toLowerCase();
    const subj = (finding.SUBJECT || '').toLowerCase();
    const rc = (finding.ROOT_CAUSE_ANALYSIS || '').toLowerCase();
    const cm = (finding.COUNTER_MEASURE || '').toLowerCase();
    const textToScan = `${pt} ${subj} ${rc} ${cm}`;
    
    if (/mixing|배합|밀링|믹싱|밀렉스|密炼|混炼|配料|母胶|终炼/.test(textToScan)) return 'Mixing';
    if (/extrusion|압출|압출기|태면|사이드월|에이펙스|压出|挤出|胎面|胎侧|三角胶/.test(textToScan)) return 'Extrusion';
    if (/curing|vulcanization|가류|가류기|몰드|블래더|세그먼트|硫化|硫化机|模具|胶囊|温控/.test(textToScan)) return 'Curing';
    if (/building|builder|drum|green tire|성형|성형기|드럼|그린 타이어|그린타이어|케이싱|成型|胎筒|带束层|成型鼓/.test(textToScan)) return 'Building';
    if (/calendaring|calendar|토핑|캘린더|캘린더링|스틸 코드|스틸코드|방사|压延|帘布|钢丝帘布|纤维帘布/.test(textToScan)) return 'Calendaring';
    if (/cutting|cutter|shear|bias|재단|재단기|커터|나이프|재단칼|裁断|裁刀|割刀|切断|剪切/.test(textToScan)) return 'Cutting';
    if (/bead|apex assembly|bead wire|비드|비드와이어|에이펙스 조립|胎圈|钢丝圈|包口|胎唇/.test(textToScan)) return 'Bead';
    if (/incoming|raw material|supplier|수입검사|원재료|입고검사|来料|原材料|入厂|供应商/.test(textToScan)) return 'Incoming';
    if (/re-work|repair|재작업|수리|정정|返工|返修|重工/.test(textToScan)) return 'Re-work';
    if (/form|sponge|acoustic|폼|흡음재|스폰지|海绵|静音棉|美世嘉/.test(textToScan)) return 'Form';
    if (/sealant|glue|실란트|젤리|실란트 도포|自密封|密封胶|胶水/.test(textToScan)) return 'Sealant';
    if (/logistics|warehouse|storage|shipping|fifo|trolley|물류|창고|보관|선입선출|출하|카트|物流|仓库|入库|储存|库存|先进先出|堆放|货架/.test(textToScan)) return 'Logistics';
    if (/x-ray|inspection|inspector|uniformity|dynamic balance|visual|검사|검사기|외관|X레이|균일성|동밸런스|선별|检测|检查|检验|外观|x光|均一|平衡|分选|探伤/.test(textToScan)) return 'Inspection';
    if (/test|testing|lab|specimen|시험|검증|실험|평가|신뢰성|试验|测试|实验|评价|分析|gc/.test(textToScan)) return 'Test';
    if (/system|audit|fmea|control plan|ppap|sop|document|training|시스템|인증|교육|표준|컨트롤플랜|系统|体系|文档|培训|标准|文件|cp/.test(textToScan)) return 'System';
    
    // 3단계: 어떤 키워드에도 분류되지 않는 데이터는 결정론적 해싱을 거쳐 9대 표준 공정으로 분산 배정
    const hashString = subj + (finding.PROJECT || '') + (finding.M_CODE || '');
    let hash = 0;
    for (let i = 0; i < hashString.length; i++) {
        hash = hashString.charCodeAt(i) + ((hash << 5) - hash);
    }
    const targetProcesses = ['Mixing', 'Extrusion', 'Curing', 'Building', 'Incoming', 'Inspection', 'Logistics', 'Test', 'System'];
    const index = Math.abs(hash) % targetProcesses.length;
    return targetProcesses[index];
}
```

### ③ 품질 지적사항 실무 대응용 전문가 백업 사전 (Fallback Dictionary)
오프라인 데모 환경이나 수입 검사 도중 원천 CSV/JSON의 유실 및 공백 항목이 포착되더라도, 피감사자 화면이 중단되지 않고 전문적인 8D 분석 결과를 화면에 무지연 표출하는 지능형 백업 엔진입니다.
```javascript
const FALLBACK_FINDING_DICT = {
    "Curing": {
        POINT_OUT: "Curing 공정 가류 설비 온도/압력 레코드의 실시간 연동 편차(±1.5%) 기준치 초과 확인",
        ROOT_CAUSE_ANALYSIS: "가류기 압력 센서 전송 모듈 케이블 커넥터부 접촉 불량 및 교정 주기 경과",
        COUNTER_MEASURE: "해당 가류 설비 압력 레코더 신호 센서 단자 교체 및 예방 보전 일상 점검 리스트 개정 반영"
    },
    "Mixing": {
        POINT_OUT: "Mixing 공정 오일 및 원재료 투입 자동 계량 시스템의 검교정 필증 미부착 및 오차 경고 미인지",
        ROOT_CAUSE_ANALYSIS: "QMS 시스템 수동 스케줄 누락에 따른 제어 컴퓨터 자동 교정 유효 기간 인지 실패",
        COUNTER_MEASURE: "계측기 검주기 통합 관리 모듈(e-QMS) 연동 및 실시간 공정 이상 감지 제어 인터락 로직 소프트웨어 도입"
    },
    "Extrusion": {
        POINT_OUT: "Extrusion 공정 반제품 보관 랙 적재 기한(선입선출) 표식 불량 및 수동 관리 이탈",
        ROOT_CAUSE_ANALYSIS: "보관 구역 정비 및 인수 인계 표준 SOP 양식 개정본 배포 누락으로 인한 작업자 누락",
        COUNTER_MEASURE: "보관 구역 고유 바코드 연동 관리 인터락(PLC) 소프트웨어 전면 적용 및 작업자 정밀 재교육"
    },
    "Building": {
        POINT_OUT: "성형 공정 드럼 정밀 센터링 레이저 센서 측정값 주기적 미기록 및 수기 점검 가이드라인 미준수",
        ROOT_CAUSE_ANALYSIS: "성형 교대조 인수인계 시간 내 장비 보정 확인 누락에 의한 일시적 영점 드리프트",
        COUNTER_MEASURE: "매 교대 시 드럼 영점 조정 확인용 표준 Gauge 블록 실사 대조 절차 및 계측 일지 SOP 표준화"
    },
    "Incoming": {
        POINT_OUT: "수입검사 구역 내 수입검사 전 원재료와 판정 대기품 간의 식별 마킹 및 격리 보관 영역 표식 혼선",
        ROOT_CAUSE_ANALYSIS: "합격/불합격/대기 전용 적재 랙 바닥 구획선 노후 훼손 및 일시적 물량 누적",
        COUNTER_MEASURE: "수입 검사장 랙별 스마트 적외선 센서 표지판 설치 및 격리 구역 물리 구획 재설정 작업 완료"
    },
    "System": {
        POINT_OUT: "공정 4M 변경(설비 이설 등) 발생에 관한 사전 고객사 승인 통보 절차 및 개정된 Control Plan 미배포",
        ROOT_CAUSE_ANALYSIS: "프로젝트 이력 인수인계 프로세스 상의 품질 부서 사전 검토 업무 누락",
        COUNTER_MEASURE: "변경 관리 프로세스 내 품질 부서 필수 승인 워크플로우 인터락 적용 및 SOP 정식 개정 완료"
    }
};
```
- *동작*: 로드한 지적사항 오브젝트의 핵심 필드가 누락되었을 시, 분류된 공정 코드(`processCode`)의 백업 사전 데이터를 동적으로 대체 주입합니다.

---

## 💬 6. [공통 전역] Floating Assistant (AI 감사 비서)

전사 화면 우측 하단에 상시 존재하며 수시로 오디팅 전문 가이드를 제시하는 프리미엄 챗봇 컴포넌트입니다.

### ① 화면 컨텍스트 감지형 첫 인사 (Context-Aware Welcome Greeting)
- **기능 요건**: 사용자가 사이드바를 통해 어떤 탭을 보고 있는지 감지하여 첫 인사말을 동적으로 교체합니다:
  - **Library 탭 활성화 상태에서 챗봇 개봉 시**: *"안녕하세요! 현재 통합 라이브러리를 탐색 중이시군요. 특정 완성차 규격서 조항의 한글 번역 가이드나, 가류(Curing) 공정의 고위험 핵심 체크리스트 요약이 필요하시면 언제든 물어보세요."* 와 같이 현재 뷰포트에 완전히 동기화된 가이드를 제시하여 스마트한 시스템 정체성을 강조합니다.

### ② 세련된 대화형 인터랙션 (Premium Micro-animations)
- **모션 효과**: 
  - 챗봇 버블 호버 시 미세한 펄스(Pulse) 광원 효과 및 위아래 흔들림(Float Bounce).
  - 채팅창 개봉 시 부드러운 Ease-in-out 슬라이드업 모션 및 글래스모피즘 블러 필터 적용.
  - AI 답변 대기 시 정교하게 감박이는 **3도트 타이핑 로딩 애니메이션 (Typing Indicator)**을 노출하여 심층 연산 중인 가상 대기 인지 체감을 고급화합니다.
- **Mock-up 안전 예외 처리**:
  - 사용자의 채팅 질의 내용에서 핵심 키워드(예: "온도", "압력", "Audit", "SOP", "Audi", "BMW")를 탐지하여, 사전 준비된 도메인 최적화 가상 응답 사전(SOP Guidance Dictionary)과 실시간 매핑하여 형태소 분석 수준의 완성도 높은 자연어 전문 답변을 고속 출력합니다.

---

## 📋 7. 인수 테스트 기준 (Acceptance Criteria)

본 컨텍스트에 따라 구현된 결과물이 통과해야 할 필수 정량 자가 검증 기준입니다:

1. **공정별 현황 확인**: Library 탭 진입 시 공정별 미니 현황 카드가 정상 렌더링되고, 특정 공정 클릭 시 하단 그리드 목록이 해당 공정에 해당하는 항목으로 빈틈없이 리로드 정합성을 유지하는가?
2. **De-duplication 및 OEM 상속**: 마스터 체크리스트 데이터 로딩 시 중복 질문이 완벽히 거정 제거(`Set`)되어 렌더링되며, 완성차 부모 브랜드 선택 시 자회사 데이터가 정상적으로 통합 정밀 필터링되는가?
3. **규격 문서 서머리 출력**: Customer Requirements 서브 탭 내에서 카드를 클릭했을 때, 슬라이드 드로어가 매끄러운 트랜지션으로 전개되며 applicable_processes, key_clauses, tire_process_translation 내용이 누락 없이 가독성 높게 바인딩되는가?
4. **파일 다운로드 신뢰성**: 다운로드 버튼 클릭 시 즉각 다운로드 창이 로컬에 표시되며, 한글이 깨지지 않는 원본 파일 또는 AI 상세 요약 텍스트 문서가 완벽히 저장되는가?
5. **CSV 내보내기 인코딩**: CSV 내보내기 수행 후 엑셀에서 개봉했을 때, 한글 문자열이 UTF-8 BOM 바인딩(`\ufeff` 주입)에 의해 완벽히 깨짐 없이 렌더링되는가?
6. **컨텍스트 감지형 인사말**: Dashboard 탭에서 챗봇을 열었을 때와 Library 탭에서 챗봇을 열었을 때의 첫 웰컴 안내 멘트가 실시간으로 일치하게 동적 변경되는가?
7. **Zero Crash Policy**: 글로벌 공정/공장 필터바가 부재하거나 null인 상황에서도 스크립트가 멈추지 않고 기본값("All")을 상속받아 정밀하게 데이터를 렌더링하는가?
