# 🚗 [Context 1] 시스템 전체 개요 문서 (System Overview)

본 문서는 완성차 고객사(OEM) 완제품 규격서(OE Requirements) 및 생산 공장별 품질 이력 데이터를 기반으로, 현장 맞춤형 감사 대응 질문을 자동 생성하는 **차세대 위험 기반 감사(Risk-Based Auditing) 지원 시스템**의 전사적 개요와 아키텍처를 정의한 최상위 컨텍스트 문서입니다.

---

## 🌟 1. 시스템 개발 목표 및 배경

글로벌 완성차 고객사(BMW, GM, Audi, 현대/기아 등)의 수검 요구조건은 점차 다양화되고 정교화되는 반면, 실제 생산 현장에서는 표준화된 규격 점검 수준의 수동 감사에 그치고 있습니다. 

본 플랫폼은 **단순한 규격서 텍스트 뷰어**를 넘어, 자동차 완성차 규격 요구사항과 제조 현장의 과거 품질 리스크(품질 실패 이력, 4M 변경점, 과거 지적사항)를 유기적으로 융합하여, **공장별 위험도(Plant Risk)가 반영된 완성도 높은 Audit Checklist를 자동으로 도출**하는 것을 개발 목표로 합니다.

```mermaid
graph LR
    A["📄 완제품 규격서 (OEM Standards)"] -->|"원칙 중심 (Standard)"| Unified["🌟 통합 Audit Checklist\n(unified_audit_checklists)"]
    B["🗄️ 현장 품질/변경 이력 (4M, QI, AUDIT)"] -->|"실패/변경점 중심 (Risk)"| Unified
    Unified --> Dashboard["📊 실시간 위험 기반 감사 모니터링 및 대응"]
```

---

## 🧭 2. 시스템 범위 및 대상 영역

### ① 대상 제조사 및 공장 범위
*   **자사 공장 자원**: 전 세계 8개 생산 거점 (`DP`, `KP`, `JP`, `HP`, `CP`, `MP`, `IP`, `TP`)
*   **분석 관점**:
    *   **전사 현황 관점**: 8개 공장 전체의 Checklist 생성 건수, 항목 분포, 소스 누락 여부 모니터링.
    *   **공장별 현황 관점**: 특정 공장의 공정/카테고리별 세부 위험도 점수 및 집중 검증 대상 조항 식별.

### ② 대상 제조공정 및 카테고리 범위
감사 질문 및 요구 조건의 성격에 따라 **물리적 제조 공정(Process)**과 **시스템 보조 영역(Category)**을 분리하여 일관성 있게 관리합니다.

```
[제조 부문 - Process]
Incoming (수입검사) ➔ Mixing (배합) ➔ Extrusion (압출) ➔ Calendaring (캘린더링) ➔ Cutting (재단) ➔
Bead (비드) ➔ Building (성형) ➔ Curing (가류) ➔ Re-work (재작업) ➔ Inspection (검사) ➔ Special (Form/Sealant)

[시스템 부문 - Category]
Design (설계/개발) ➔ Test (신뢰성시험) ➔ System (품질보증/교육/4M변경) ➔ Logistics (물류/외주창고)
```

---

## 💻 3. 대시보드 메뉴 구성 및 사용자 경험

HTML5, CSS3, Vanilla JavaScript 기반의 고성능 싱글 페이지 애플리케이션(SPA) 인터랙티브 웹 UI는 공장별 Audit 준비상태를 첫눈에 인지할 수 있는 프리미엄 디자인 요소를 제공합니다.

| 메뉴 번호 | 메뉴 명칭 | 주요 제공 기능 | 실무 활용 시나리오 |
| :---: | :--- | :--- | :--- |
| **01** | **Dashboard** | 공장별 품질 이슈(QI), 4M 변경점, 과거 감사 지적사항(Audit Findings) 데이터를 종합 연산하여 공정별 실시간 리스크 및 완성도 시각화 출력 | 대시보드 진입 시 전사 및 개별 공장의 취약 공정과 위협 요인을 한눈에 식별하고 선제 수검 대응 체계 마련 |
| **02** | **Audit Planning** | 예정된 Audit 일정을 등록 관리하고, 수검 준비 10대 마일스톤 태스크 및 사전 준비 필수 체크리스트의 진행률을 실시간 추적 제어 | 신규 감사 수검 계획을 모달창으로 기입해 등록하고 마감 역산 타임라인 피드를 따라 실무 수검 준비 진척도 트래킹 |
| **03** | **Plant Risk & Action** | 공장별 Audit 이력 및 리스크 Breakdown 비중 보드 조회, 과거 품질 실패(Claim, 불량) 지적사항 실시간 Close 조치 입력 | 특정 취약 공장의 품질 및 변경 변동 사건 연대기를 역산해 조회하고, 미결 부적합 조치사항을 현장 보완 후 Close 처리 |
| **04** | **AI Action Advisor** | 8D Report 및 형태소 유사도 사전 매퍼를 기반으로 부적합 상황의 근본 원인 가설, SOP 개정 및 합치 증적 가이드라인 자동 제안 | 오디트 수검 후 지적받은 현장 불합리를 드롭다운에서 선택하거나 직접 입력해 최고 전문가 수준의 8D 재발방지 SOP 대응책 확보 |
| **05** | **Library** | 마스터 체크리스트 및 글로벌 완성차 OEM별 기술 규격 조항 수직 스크롤 뷰 조회, AI 규격 검토 요약 패널 및 원본 문서 가상 다운로드 | 신규 규격서의 제약 조건을 빠르게 확인 및 요약하고 실물 PDF/DOC 규격 원본을 다운로드하거나 통합 점검 리스트를 CSV로 내보내기 |
| **06** | **Audit Assistant (챗봇)** | 화면 하단 플로팅 원형 버블 형태로 배치되어, 현재 사용자가 보고 있는 탭 화면의 업무 컨텍스트를 감지한 지능형 챗 가이던스 제공 | 체크리스트 작성 도중 조작 의문이 생길 시 플로팅 챗창을 열어 현재 공정에 어울리는 수석 품질 오디터의 자연어 가이드 수신 |
| **07** | **Admin Settings** | 로그인 사용자 프로필 상태에 따른 3단계 접근 권한 제어, 시스템 종합 룰 변경 기록 감사 로그 및 SELECT 전용 가상 SQL 콘솔 운영 | 시스템 관리 및 검정 목적의 역할 전환, 이력 타임라인 추적 및 데이터 엔지니어를 위한 안전 샌드박스 기반의 원시 JSON 데이터 가상 쿼리 |

---

## 🔄 4. 업무 프로세스 흐름 (Business Workflow)

시스템을 통한 표준적이고 자동화된 감사 Checklist 구축의 주기적인 흐름입니다.

```mermaid
sequenceDiagram
    autonumber
    actor User as "품질 담당자 (User)"
    participant Browser as "브라우저 (Browser)"
    participant AppJS as "클라이언트 엔진 (app.js)"
    participant StaticData as "정적 데이터 (data/)"

    User->>Browser: 대시보드 URL 접속 (Live Server / index.html 기동)
    Browser->>AppJS: app.js 초기화 및 CDN 리소스 로드 (Chart.js / Plotly.js)
    AppJS->>StaticData: JSON 데이터 비동기 Fetch 요청
    StaticData-->>AppJS: 정적 마스터 데이터 반환 (Checklist, QI, 4M, Findings 등)
    AppJS->>AppJS: 클라이언트 메모리 적재 및 전역 상태 최적화
    AppJS->>AppJS: 실시간 공장별 위험 점수(Risk Score) 가중 연산 실행
    AppJS->>Browser: 프리미엄 다크 테마 기반 동적 차트 및 KPI 카드 렌더링
    User->>Browser: 사이드바 필터(공장/OEM/공정) 변경 및 조회
    AppJS->>Browser: 무지연 실시간 필터링 및 UI 컴포넌트 렌더링
    User->>Browser: 통합 체크리스트 CSV 추출 요청
    AppJS->>User: UTF-8 BOM 인코딩 한글 깨짐 방지 CSV 즉시 다운로드 제공
```

---

## ⚙️ 5. 플랫폼 시스템 아키텍처 및 강점

### ① 아키텍처 구성 요소
*   **HTML5 & Semantic Markup**: 대시보드의 골격과 각 기능별 워크스페이스 레이아웃을 구성하는 모던 웹 표준 시멘틱 태그 사용.
*   **Vanilla CSS3 (Design System)**: HSL 글로벌 컬러 변수 시스템, 프리미엄 글래스모피즘(Glassmorphism) 효과, 이징(Easing) 트랜지션 및 완벽한 레이아웃 구조 설계.
*   **Vanilla JavaScript (Client-side Engine)**: 비동기 Fetch 데이터 파이프라인, 전역 셀렉터 상태 동적 관리, 클라이언트 브라우저 단에서의 고속 연산(공장 리스크 가중치 연산 및 3중 필터링 알고리즘).
*   **Static Database Engine**: `data/` 디렉토리에 적재된 모의 데이터를 기반으로, 물리적인 데이터 파괴 명령어 및 DB 오버헤드를 배제하고 브라우저 온디맨드 메모리 단에서 작동하는 초정밀 샌드박스 데이터 환경.
*   **CDN Charts & AI Sandbox**: 무거운 프레임워크나 외부 REST API 오류 상황에서도 중단되지 않고 즉시 가상 응답을 제어하는 `Mock AI Response Engine` 및 최적화된 시각화 차트 연동.

### ② 시스템의 차별화된 강점 (Technical Excellence)
1.  **제로 의존성 (Zero External Overhead)**: Node.js, Python 백엔드, Webpack 번들러 등의 복잡한 인프라가 필요 없으며, 브라우저가 직접 로드하여 무지연(Zero-latency)으로 즉각 기동합니다.
2.  **보안 샌드박스 장착**: 클라이언트 단에서 파괴성 명령어(`INSERT`, `UPDATE`, `DELETE` 등)를 사전 감지 및 차단하는 SELECT 전용 SQL 모의 에뮬레이터를 탑재하여 원천 자원 무결성을 보존합니다.
3.  **한글 깨짐 없는 완벽한 내보내기**: Excel 실행 시 한국어가 깨지는 레거시 브라우저 인코딩 문제를 해결하기 위해, CSV 바이트 스트림 앞에 UTF-8 BOM(`\uFEFF`) 마커를 주입하는 지능형 내보내기 모듈이 장착되어 있습니다.
