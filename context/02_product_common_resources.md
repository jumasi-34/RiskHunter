# 🌐 [Context 2] 공통 Resource 컨텍스트 문서

본 문서는 완성차 고객사(OEM) 완제품 규격서 및 공장 현장 이력 관리 플랫폼에서 여러 메뉴와 화면이 공유하여 사용하는 **참조 표준 데이터(Reference & Master Data)와 공통 자원(Resource)**을 정의한 공통 컨텍스트 문서입니다.

이 참조 데이터들은 시스템 전반의 필터링, 데이터 매핑, 대시보드 통계 및 데이터 일관성 유지를 위한 핵심 기준 데이터셋(Standard Vocabulary) 역할을 수행합니다.

---

## 🌟 1. 공통 Resource 및 참조 데이터 개요

본 플랫폼에서 다루는 모든 데이터(완제품 규격서, 4M 변경점, 품질 실패 이력, 과거 감사 지적사항) 및 생성되는 모든 체크리스트는 반드시 아래에 정의된 공통 코드 및 카테고리 자원에 매핑되어 처리됩니다.

```mermaid
graph TD
    classDef root fill:#1f3a52,stroke:#00c8ff,stroke-width:2.5px,color:#fff;
    classDef branch fill:#2c3e50,stroke:#bdc3c7,stroke-width:1.5px,color:#fff;
    classDef leaf fill:#34495e,stroke:#7f8c8d,stroke-width:1px,color:#ecf0f1;

    root["🌐 공통 Resource"] :::root
    
    plant["🏢 공장 자원 (Plant)"] :::branch
    process_category["⚙️ 제조 공정 및 카테고리 (Process/Category)"] :::branch
    customer["🚗 완성차 고객사 (Customer/OEM)"] :::branch
    m4["🛠️ 4M 요소 (4M Dimensions)"] :::branch
    source["📊 데이터 원천 (Source Type)"] :::branch

    root --> plant
    root --> process_category
    root --> customer
    root --> m4
    root --> source

    plant --> dp["DP 대전공장"] :::leaf
    plant --> kp["KP 금산공장"] :::leaf
    plant --> jp["JP 중국 가흥공장"] :::leaf
    plant --> hp["HP 중국 강소공장"] :::leaf
    plant --> cp["CP 중국 중경공장"] :::leaf
    plant --> mp["MP 헝가리공장"] :::leaf
    plant --> ip["IP 인도네시아공장"] :::leaf
    plant --> tp["TP 미국 테네시공장"] :::leaf

    process_category --> category["Category (Design, Test, System)"] :::leaf
    process_category --> process["Process (Incoming, Mixing, Extrusion, Calendaring, Cutting, Bead, Building, Curing, Re-work, Inspection, Form, Sealant)"] :::leaf
    process_category --> extended["Extended (Logistics)"] :::leaf

    customer --> bmw["BMW"] :::leaf
    customer --> audi["Audi"] :::leaf
    customer --> hyundai["Hyundai/HKMC"] :::leaf
    customer --> gm["GM"] :::leaf
    customer --> other["기타 글로벌 OEM"] :::leaf

    m4 --> man["Man (작업자/인적요소)"] :::leaf
    m4 --> machine["Machine (설비/금형)"] :::leaf
    m4 --> material["Material (재료/부품)"] :::leaf
    m4 --> method["Method (SOP/공정방법)"] :::leaf

    source --> doc["DOCUMENT (규격서 기반)"] :::leaf
    source --> qi["DATABASE_QI (품질 이슈)"] :::leaf
    source --> m4_db["DATABASE_4M (4M 변경점)"] :::leaf
    source --> audit["DATABASE_AUDIT (감사 지적)"] :::leaf
```

---

## 🏢 2. 자사 공장 자원 (Plant Resource)

품질 실패 이력(QI), 공정 변경 이력(4M), 과거 지적 사항은 공장별로 완전히 독립적으로 누적되는 반면, 완성차 고객사 규격서(OEM Standard)는 전사 공통으로 적용됩니다. 이를 효과적으로 매핑하기 위해 다음과 같은 자사 공장 코드를 공통 리소스로 관리합니다.

> [!NOTE]
> 체크리스트 생성 시 전사 공통 조항은 `ALL`로 매핑되며, 특정 공장에 귀속된 실패 이력 기반 질문들은 개별 공장 코드(`DP`, `KP` 등)로 매핑되어 제공됩니다.

### 📊 공장 코드 마스터 리스트

| 공장 코드 | 공장 명칭 | 위치 (Location) | 주요 특징 및 대상 공정 |
| :---: | :--- | :--- | :--- |
| **`DP`** | 대전공장 | 대한민국 대전 | 국내 주요 생산 거점, 전 공정 및 특수 공정 포함 |
| **`KP`** | 금산공장 | 대한민국 금산 | 초고성능 및 특수 타이어 주력 생산 거점 |
| **`JP`** | 가흥공장 | 중국 가흥 | 중국 내수 및 아시아 수출용 제품 생산 |
| **`HP`** | 강소공장 | 중국 강소 | 중국 시장 공략 및 주요 글로벌 수출용 친환경 타이어 거점 |
| **`CP`** | 중경공장 | 중국 중경 | 중국 서부 지역 생산 거점 |
| **`MP`** | 헝가리공장 | 헝가리 라첼마스 | 유럽 완성차(BMW, Audi 등) 납품용 핵심 기지 |
| **`IP`** | 인도네시아공장 | 인도네시아 | 동남아시아 시장 및 글로벌 수출 기지 |
| **`TP`** | 테네시공장 | 미국 테네시 클락스빌 | 북미 완성차 시장 대응 핵심 거점 |
| **`ALL`** | 전사 공통 | - | 특정 공장에 종속되지 않고 전 공장에 일괄 적용되는 표준 자료 |

---

## ⚙️ 3. 제조 공정 및 카테고리 자원 (Process & Category)

모든 체크리스트 조항 및 원천 데이터는 감사 범위의 정확한 필터링과 정렬을 위해 1개의 **공정 및 카테고리**와 연계됩니다. 이는 실제 물리적인 제조 단계인 **Process**, 시스템 영역이나 기능에 해당하는 **Category**, 그리고 물류 등 보조/확장 영역을 뜻하는 **Extended Scope**로 구분됩니다.

### 📋 공정 및 카테고리 표준 마스터

| 분류 (Type) | 공정/카테고리 코드 | 표준 명칭 (국문/영문) | 세부 업무 내용 및 범위 |
| :---: | :--- | :--- | :--- |
| **Category** | `Design` | 설계/개발 (Design & Development) | 도면 관리, 제품 설계 표준, 특수 특성 지정 및 타당성 검증 |
| **Category** | `Test` | 시험/검증 (Lab Test & Verification) | 신뢰성 시험, 치수 측정, 재료 물리적/화학적 성능 시험 |
| **Process** | `Incoming` | 수입검사 (Incoming Inspection) | 원재료/원단 입고 검사, 성적서(COA) 검증 및 부적합품 격리 |
| **Process** | `Mixing` | 배합 (Mixing) | 고무 가공 전 원재료 평량, 고무 컴파운드 배합 및 가공성 확인 |
| **Process** | `Extrusion` | 압출 (Extrusion) | 트레드, 사이드월 등 반제품 가공, 치수 및 온도 실시간 프로파일링 |
| **Process** | `Calendaring` | 캘린더링 (Calendaring) | 스틸/텍스타일 코드 고무 토핑, 인장강도 및 접착력 검사 |
| **Process** | `Cutting` | 재단 (Cutting) | 반제품 지정 각도/폭 절단, 카카스 및 벨트 반제품 가공 |
| **Process** | `Bead` | 비드 (Bead) | 와이어 권취, 에이프런 부착 및 비드 링 성형성 관리 |
| **Process** | `Building` | 성형 (Building) | 드럼상 반제품 조립, 성형 중 Air 배출 유무 및 그린타이어 외관 관리 |
| **Process** | `Curing` | 가류 (Curing) | 금형 가열/가압, 가류 온도/압력 프로파일 및 벤트핀 막힘 관리 |
| **Process** | `Re-work` | 재작업 (Re-work) | 승인된 작업 표준서에 따른 재작업 프로세스 및 승인 경로 확보 |
| **Process** | `Inspection` | 검사 (Inspection) | 외관 검사, 기하학적 치수 검사(Uniformity, Runout) 및 불합격품 격리 |
| **Process** | `Form` | 폼 (Form) | 타이어 흡음재(Polyurethane Foam) 접착 가공 및 제어 프로세스 |
| **Process** | `Sealant` | 실란트 (Sealant) | 펑크 방지용 점성 실란트 도포 공정 및 두께 균일도 모니터링 |
| **Extended** | `Logistics` | 물류/외주창고 (Logistics & Warehouse) | 자사 완제품 창고, 원재료 창고 및 제3자 외주 물류 창고 관리 |
| **Category** | `System` | 품질 시스템 (Quality System) | 문서 관리, 변경 관리, 사내 변경 승인(4M), 교육 및 자격 부여 |

---

## 🚗 4. 완성차 고객사 자원 (Customer/OEM Resource)

완제품 규격서(OE Requirements)는 완성차 브랜드별로 고유하게 발행됩니다. AI 체크리스트 추출 및 규격서 뷰어의 메인 필터링 조건으로 사용되는 대표 OEM 마스터입니다.

### 🚘 완성차 고객사 표준 마스터

| 고객사 코드/명칭 | 대표 규격 유형 | VDA 6.3 필수 매핑 영역 | 비고 |
| :--- | :--- | :--- | :--- |
| **`BMW`** | GS 표준 (e.g., GS 90018-1, GS 91011) | P6 (Process Analysis) 중심 | BMW 품질 관리 보증 표준 |
| **`Audi`** | LA 표준, VW 표준 | P5 / P6 공정 관리 감사 | 폭스바겐 그룹 표준 가이드 준용 |
| **`Hyundai`** / **`HKMC`** | MS 표준, ES 표준, 5-Star 감사 표준 | P6 성형/가류 및 신뢰성 평가 | 현대자동차/기아 기술 표준 |
| **`GM`** | GMW 표준, BIQS 자격 표준 | P5 공급업체 관리 / P6 제조 | 제너럴 모터스 글로벌 표준 |
| **`Tesla`** | TS 표준 | P6 특수 공정 및 소프트웨어/센서 관리 | 친환경/전기차 특수 규격 포함 |
| **`Mercedes-Benz`**| DBL 표준, MB 표준 | P6 가류 및 완제품 정밀 검사 | 다임러 벤츠 품질 요구사항 적용 |

---

## 🛠️ 5. 4M 관리 요소 및 소스 유형 자원

### ① 4M 핵심 차원 (4M Dimensions)
제조 리스크 분석과 변경 관리의 표준 원인 구분을 위한 공통 기준입니다.

*   **`Man` (작업자/인적요소)**: 작업 표준 교육 이력, 특수 작업자 자격 부여, 공정 교대 시 인수인계 및 안전 수칙 준수 여부.
*   **`Machine` (설비/금형)**: 설비 일일/주간/월간 점검표, 계측기 검교정 성적서, 금형 세정 주기 및 예방 보전 이력.
*   **`Material` (재료/부품)**: 원재료 COA 검증, 부품 보관 조건(온/습도) 준수, 선입선출(FIFO) 현황 및 부적합 자재 격리.
*   **`Method` (SOP/공정방법)**: 작업 표준서(SOP) 현장 게시 여부, 제/개정 관리 이력, 이상 발생 시 조치 가이드(OCAP) 구축 현황.

### ② 데이터 소스 유형 (Source Type)
통합 체크리스트 테이블(`unified_audit_checklists`)에서 질문의 원천이 무엇인지를 나타내는 핵심 필터 구분자입니다.

> [!TIP]
> **Source Type에 따른 감사 접근법**
> - `DOCUMENT`: 규격서 표준 기반이므로 원칙 중심의 **시스템 및 표준 프로세스** 감사에 활용합니다.
> - `DATABASE_QI`/`4M`/`AUDIT`: 현장 실패/변경 사건 기반이므로 **실제 리스크 제거 여부를 집중 검증**하는 추적 감사에 활용합니다.

*   **`DOCUMENT`**: 완성차 OEM 규격서 텍스트에서 AI가 직접 도출한 표준 요구사항 체크리스트.
*   **`DATABASE_QI`**: 자사 공장별 과거 품질 이슈(QI) 분석 데이터에서 AI가 도출한 재발 방지용 체크리스트.
*   **`DATABASE_4M`**: 설비/공정 변경 이력(4M)에서 발생 리스크 검증을 위해 AI가 도출한 검증용 체크리스트.
*   **`DATABASE_AUDIT`**: 과거 완성차 및 제3자 감사에서 지적된 사항(Audit Findings)과 시정 대책을 기반으로 AI가 도출한 재발 검증용 체크리스트.

---

## 📈 6. 중요도 및 리스크 점수 자원 (Priority & Risk Score)

*   **중요도 등급 (`Priority`)**:
    *   **`High`**: 완성차 보안/안전 관련 특수 특성 조항, 다빈도/치명적 품질 이슈 유발 공정, 미해결 감사 지적사항 연계 항목.
    *   **`Medium`**: 일반 품질 보증 및 표준 프로세스 준수 점검 항목, 경미한 변경점 검증 항목.
    *   **`Low`**: 단순 문서 개정 사항 및 간접 지원 프로세스 확인 항목.
*   **공장별 공정 위험도 점수 (`plant_risk_score`)**:
    *   이전 1년간 공장별 공정 카테고리에서 축적된 이벤트(QI 발생 건수, 4M 변경 건수, 지적사항 건수)를 바탕으로 동적으로 계산되는 계량적 가중치입니다.
    *   **값의 범위**: `0.0` (안정) ~ `5.0` (초고위험)
    *   **연산 기준**: 품질 실패 가중치 `0.3`, 4M 변경 가중치 `0.1`, 과거 지적사항 가중치 `0.2`를 곱하여 합산한 후 최대 5.0으로 제한(Clamping)합니다.

---

## 📝 7. 감사 기법 및 대응 증적 가이드 (Audit Methods & Evidences)

플랫폼의 핵심 목적인 **현장 감사 대응력 강화**를 위해 오디터 감사 기법 및 피감사자의 합치 증적 리스트를 표준 리소스로 연계합니다.

### ① 공통 감사 기법 (Audit Methods)
*   **`현장 실사 (Plant Tour / Physical Audit)`**: 설비 매개변수 세팅값 현장 매칭, 가류 온도 그래프 실시간 확인, 금형 벤트핀 상태 직접 육안 확인.
*   **`문서 검토 (Document Review)`**: 작업 표준서(SOP), 계측기 검교정 성적서, 원자재 COA, 설비 보전 주기 일지 검증.
*   **`인터뷰 (Interview)`**: 설비 이상 발생 시 OCAP(이상조치가이드) 인지 여부, 교대 조 시 이력 인수인계 프로세스 확인 등 현장 작업자 직접 질의.

### ② 필수 공통 증적자료 유형 (Core Evidences)
1.  **작업표준서 (SOP)** 및 관리 계획서 (Control Plan)
2.  **공정 FMEA (PFMEA)** 및 특수특성 관리 대장
3.  설비 **예방보전 일지** 및 부품/금형 세정 성적서
4.  작업자 교육 훈련 이수 기록 및 **특수 직무 자격 인증 대장**
5.  계측기 및 센서 **검교정 성적서** (Calibration Log)
6.  4M 변경 이력 신청서 및 **변경점 타당성 검증/승인 완료 리포트**
7.  품질 이슈 **시정조치 및 재발방지 보고서** (8D Report)
8.  창고 보관 조건 **온습도 일일 트래킹 대장** 및 선입선출 식별 태그
