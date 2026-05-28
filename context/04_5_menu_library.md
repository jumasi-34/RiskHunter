# 📂 [Context 04_5] Library & Floating Assistant (통합 지식 라이브러리 및 AI 감사 비서)

본 문서는 **5. Library** 메인 메뉴 및 화면 우측 하단의 상시 **Floating Assistant (AI 감사 비서)**의 화면 구성, 사용 데이터 연계, 기능 요구사항, UI/UX 사양 및 현장 감사 워크플로우를 정의하는 공식 기획 설계서입니다.

---

## 🎯 1. 설계 및 연동 목적

### ① 목적

**Library** 메뉴는 전사적으로 표준화된 자체 감사 마스터 체크리스트 및 완성차 고객사(OEM) 요구 규격 문서를 고속 탐색, 필터링 및 다운로드하고, 이들 규격 조항이 공정 리스크와 어떻게 맵핑되어 작동하는지 직관적으로 제공하는 지식 관리 센터(Knowledge Hub)입니다. 

### ② 연동 데이터 리소스

- **자체 감사 체크리스트 데이터**: [audit_checklists.json](file:///home/jumasi/RiskHunter/data/audit_checklists.json)
  - 10,000건 이상의 고품질 자체 감사 질문 세트.
  - 주요 필드: `id`, `source_type`, `customer`, `doc_code`, `doc_name`, `section`, `audit_question`, `evidence_compliance`, `audit_method`, `process_category`, `related_4m`, `priority`, `plant_risk_score`.
- **완성차 OEM 규격 문서 데이터**: [document_library.json](file:///home/jumasi/RiskHunter/data/document_library.json)
  - 주요 고객사(BMW, Audi, Hyundai 등)의 최신 기술 요건 및 AI 분석 요약 스키마.
  - 주요 필드: `id`, `filename`, `customer`, `doc_code`, `doc_name`, `revision_date`, `doc_type`, `file_size`, `review_summary` (overview, key_clauses, applicable_processes, required_evidences), `tire_process_translation` (focus_process, process_param_check, quality_defect_risk, action_sop_guide).

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
|  [Sub-Tab 1: Full Checklist]  [Sub-Tab 2: Customer Requirements]  [Sub-Tab 3: Mapping]  |
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
  2. **고객사 (Customer)**: 완성차 OEM명 배지 (Audi, BMW 등).
  3. **규격 코드 (Doc Code)**: 연계된 원천 규격 코드.
  4. **공정 분류 (Process)**: `process_category` 또는 `related_4m` 배지.
  5. **중요도 (Priority)**: High (적색/황색 뱃지 테두리 애니메이션), Medium, Low.
  6. **감사 질문 (Audit Question)**: 핵심 질문 내용 요약 (텍스트가 길 경우 호버 시 풀 텍스트 툴팁 제공).
  7. **준수 증적 (Compliance Evidence)**: 품질 확보를 위해 현장에서 제출해야 할 물리 증적 목록.
- **사용자 조작 장치**:
  - **통합 키워드 검색바 (Search Bar)**: 질문 내용, 증적 목록, 규격서 문서명을 통합 검색하는 지능형 실시간 자동 필터.
  - **공정별/중요도별 드롭다운 필터 (Multi-Filters)**: 글로벌 필터 외에도 라이브러리 내에서 세밀하게 조절 가능한 로컬 필터 제공.
- **엑셀 호환 CSV 내보내기 (UTF-8 BOM Export)**:
  - **[CSV 다운로드]** 버튼 제공. 
  - 클릭 시 현재 사용자가 필터링한 데이터 상태 그대로 CSV 파일을 다운로드하며, 국내 엑셀 프로그램에서 한글 깨짐 없이 정상 개봉되도록 **UTF-8 BOM (UTF-8-SIG, `\ufeff`)**을 접두사 바인딩 처리합니다.

---

## 📂 4. 서브 탭 2: Customer Requirements Library (완성차 OEM 규격 요약 및 다운로드)

[document_library.json](file:///home/jumasi/RiskHunter/data/document_library.json) 파일에 수록된 각 고객사별 실제 기술 규격 원본 데이터의 명세를 한눈에 확인하고, 다운로드 요구를 처리합니다.

### ① 규격 문서 리스트 카드 그리드 (Document Card Grid)

- **카드 레이아웃**:
  - 문서별 개별 프리미엄 글래스모피즘 카드 형태로 목록을 구성합니다.
  - 문서명, 규격 코드, 최종 개정일, 파일 크기 및 문서 속성 배지가 미려하게 표현됩니다.
- **상세 요약 보기 (Slide-in Drawer)**:
  - 특정 카드 영역을 클릭하면 화면 우측에서 우아하게 **슬라이드인 드로어(Slide-in Details Panel)** 또는 모달이 열립니다.
  - 드로어 내부에는 `review_summary` 오브젝트를 파싱하여 아래 정보를 체계적으로 시각화합니다:
    - **문서 기본 정보**: 개정일, 문서 종류, 적용 공정 배지 칩 세트 (`applicable_processes`).
    - **AI 요약 개요 (Overview)**: 고도로 정제된 비즈니스 개요 요약 서술.
    - **핵심 통제 조항 (Key Clauses)**: 각 기술 조항명(`clause`), 타이틀(`title`), 그리고 규격이 지시하는 상세 요건(`summary`)을 아름다운 타임라인이나 리스트 카드로 표현.
    - **타이어 공정 번역 지침 (Tire Process Translation)**: 공장 현장에서 바로 적용할 수 있는 `focus_process` 지표, `process_param_check` 핵심 매개변수 점검 기준, 무단 변경 시 유발될 수 있는 `quality_defect_risk` 위험 시나리오, 그리고 `action_sop_guide`인 구체적 SOP 개정 가이드라인을 전문가 계기판 스타일로 제공하여 AI 분석의 정교함을 부각시킵니다.
    - **필수 준수 증적 (Required Evidences)**: 해당 규격을 수검하기 위해 오디터에게 보여주어야 할 실물 대장 목록.

### ② 필요 시 규격 원본 다운로드 기능 (Document Download Engine)

- **요구 사양**: 상세 드로어 및 메인 카드 내부에 **[규격 원본 다운로드 (Download Original Document)]** 버튼을 배치합니다.
- **동작 매커니즘 (WASM-free Client Blob Download)**:
  - MVP 환경에서 외부 파일 서버가 연결되어 있지 않더라도, 실제 파일이 다운로드되는 것과 동일한 강력한 사용자 경험(WOW Effect)을 선사하기 위해 가상 다운로드 엔진을 설계합니다.
  - 버튼 클릭 시 브라우저 내에서 해당 문서 데이터의 상세 핵심 사항과 AI 요약 요약문을 가상 생성하여 정제된 `.txt` 또는 `.pdf` 구조의 가상 실물 Blob 파일 객체를 생성하고, 브라우저 다운로드 파이프라인을 트리거하여 로컬 디스크로 즉시 내려받도록 완결합니다. (예: `[고객사_규격코드]_AI_Summary.txt` 형태로 다운로드 처리하여 오프라인 시연장에서도 완벽히 검증 가능하도록 설계).

---

## 🔗 5. 서브 탭 3: Requirement Mapping Matrix (규격-리스크 맵핑 뷰)

- **요구 사양**: 완성차 OEM 규격 조항이 공장의 15대 표준 공정 및 4M 요인(Man, Machine, Material, Method)과 어떻게 유기적으로 연계되어 있는지 입체적으로 조회하는 대화형 매트릭스 뷰를 제공합니다.
- **인터랙션**:
  - 특정 OEM(예: BMW)과 공정(예: Curing)을 교차 선택하면, 해당 접점에 매핑되는 마스터 체크리스트 항목과 공장의 과거 위험 이력 수치가 기하학적 맵 형태로 렌더링되어, 리스크 기반 감사 설계의 타당성을 시각적으로 증명합니다.

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
2. **규격 문서 서머리 출력**: Customer Requirements 서브 탭 내에서 카드를 클릭했을 때, 슬라이드 드로어가 매끄러운 트랜지션으로 전개되며 applicable_processes, key_clauses, tire_process_translation 내용이 누락 없이 가독성 높게 바인딩되는가?
3. **파일 다운로드 신뢰성**: 다운로드 버튼 클릭 시 즉각 다운로드 창이 로컬에 표시되며, 한글이 깨지지 않는 원본 파일 또는 AI 상세 요약 텍스트 문서가 완벽히 저장되는가?
4. **CSV 내보내기 인코딩**: CSV 내보내기 수행 후 엑셀에서 개봉했을 때, 한글 문자열이 UTF-8 BOM 바인딩에 의해 완벽히 깨짐 없이 렌더링되는가?
5. **컨텍스트 감지형 인사말**: Dashboard 탭에서 챗봇을 열었을 때와 Library 탭에서 챗봇을 열었을 때의 첫 웰컴 안내 멘트가 실시간으로 일치하게 동적 변경되는가?

