# 🎯 10 MVP Scope and Non-Goals

## 1. 문서 목적

본 문서는 **Risk-Based Audit Checklist System**의 사내 해커톤 MVP(Minimum Viable Product) 개발 과정에서 구현해야 할 필수 기능 범위와 의도적으로 배제해야 할 범위(Non-Goals)를 명확히 정의하는 **경계 관리 지침서**입니다.

바이브코딩 AI 에이전트(Gemini)가 전체 시스템을 한 번에 과도하게 엔지니어링하지 않도록 예방하며, 클라이언트 브라우저 상에서 독립적으로 기동되는 HTML5, Vanilla CSS3, Vanilla JS 기반 고성능 단일 페이지 애플리케이션(SPA) 아키텍처 및 `localStorage` 기반 상태 영속성 모델의 완성도 및 시연 안정성을 보장하도록 통제하는 것을 목적으로 합니다.

---

## 2. MVP 목표 (MVP Goals)

*   **고성능 정적 프론트엔드 아키텍처 (HTML5 + CSS3 + Vanilla JS SPA)**: 무거운 자바스크립트 빌드 툴체인(Vite, Webpack 등)이나 별도의 백엔드 서버 없이 크롬 브라우저에서 독립적으로 기동되는 HTML5, Vanilla CSS3, Vanilla JS 기반 완결형 싱글 페이지 애플리케이션(SPA) 아키텍처를 수립합니다.
*   **클라이언트 인메모리 DB 및 localStorage 영속화**: 물리 데이터베이스 연결 대신 `data/` 디렉토리의 정적 JSON 리소스를 fetch 로드하여 메모리에 적재하고, 체크리스트 체크 상태, 작성 메모리 등은 브라우저 `localStorage`에 정형 객체로 보존하여 새로고침 시에도 영속화됩니다.
*   **온디맨드 AI 파이프라인 및 Mock 이중화**: 규격서 자동 감시 watchdog 데몬 대신, 프론트엔드 내에서 온디맨드로 실제 Gemini API 호출을 처리하고, API Key가 누락되었거나 오프라인인 경우에도 완벽히 동적인 AI 리스폰스 연출을 수행하는 최고 품질 가상 응답 사전(Mock Dictionary) 시스템을 갖춥니다.
*   **시각적 극대화 (Aesthetic WOW)**: 프리미엄 HSL 다크 테마, 반투명 글래스모피즘(Glassmorphic Translucency), 정교한 2D 데이터 시각화 및 세련된 마이크로 트랜지션을 도입하여 완성차(OEM) 오디팅 대시보드만의 고급스러운 사용자 경험을 극대화합니다.
*   **무설정 로컬 이식성 (Zero-Configuration Portability)**: 복잡한 Docker 컨테이너 설정이나 클라우드 배포 인프라 대신, 파일 압축 해제 후 Chrome 브라우저에서 `index.html`을 Live Server로 즉시 실행할 수 있는 초경량·고안전 시연 구동 환경을 제공합니다.

---

## 3. MVP 사용자 (MVP Users)

1.  **완성차 고객사 감사 위원 (OEM Technical Auditor)**: 공장 실사 전 기술 규격 조항 및 공장별 취약 리스크 요인을 조회하고 자체 체크리스트의 정합성을 최종 확인하는 오디터.
2.  **공장 품질 관리자 (Factory QA Manager)**: 사내 4M 공정 변경점 및 과거 오디트 지적 사항을 추적하고 수검 증빙 자료를 사전 준비하며 AI 대응 방안을 출력하는 실무자.
3.  **해커톤 평가 심사위원 (Hackathon Judges)**: 수려한 대시보드 UI 디자인과 데이터 정합성이 물 흐르듯 유기적으로 맞물려 구동되는 시연 흐름을 평가하는 심사위원.

---

## 4. 반드시 구현할 기능 (Must-Have Goals)

*   **Static App Shell**: 좌측 네비게이션 사이드바와 우측 메인 콘텐츠 뷰포트로 구분된 2컬럼 앱 셸. 브라우저 리로드 없이 Vanilla JS DOM 교체(탭 전환)를 통해 페이지 간 초고속 이동을 보장합니다.
*   **In-Memory Virtual DB & JSON Fetch Engine**: `data/` 디렉토리의 정적 JSON 리소스를 fetch API로 비동기 로딩하여 브라우저 메모리에 가상 데이터 테이블셋으로 적재하고, 실시간 정렬 및 오프셋 필터링 연산을 무지연으로 수행합니다.
*   **Virtual SQL Engine & localStorage Broker**: SQL-like Data Explorer 패널과 연계하여, 입력된 SELECT 구문을 정규식 및 자바스크립트 객체 매핑(Map)을 통해 가상으로 조회 가공하고, 사용자의 체크 상태나 대책 피드백 결과물 등 영구 보존이 필요한 객체는 `localStorage`에 자동 보관합니다.
*   **Client On-Demand AI Pipeline**: 신규 문서 추가 감시 데몬을 제거하고, 사용자가 화면 내에서 직접 'AI 분석' 또는 'AI 대책 도출'을 트리거할 때, 클라이언트 브라우저 단에서 Gemini API 엔드포인트를 호출하거나 Mock 가상 사전을 연동하여 실시간 질문 및 요약을 추출하는 파이프라인을 완성합니다.
*   **Risk Assessment Dashboard**: 4개 핵심 KPI 카드, `Chart.js` 또는 `Plotly.js` 기반 2D 리스크 비율 도넛 차트 및 공정별 위험도 비교 가로 바 차트, 위험 공정 알림을 팝업하는 실시간 경고 보드 패널을 완성합니다. (수치 정보는 인메모리 상태 및 localStorage에 저장된 사용자 체크율에 따라 실시간 반영)
*   **OE Requirement Library**: 완성차 고객사 필터 바(OEM, 규격유형 등), 기술 규격서 고용량 테이블 그리드, 조항 클릭 시 가시화되는 하단 AI 핵심 검토 요약 패널, 규격서 원본 PDF/DOC 파일 가상 다운로드 기능을 포함합니다.
*   **Self-Audit Checklist**: 스마트 체크리스트 상단 4열 통합 AI 분석 요약 보드(OEM 프로필, focus area 리스트, 공장 risk 요약, 준비 우선순위 도넛 차트), 퀵 공정 전환 탭바, 라이브 검색창, 원형 준비율 게이지(`Readiness Circular Progress Gauge`)와 AI Risk 등급 뱃지가 탑재된 프리미엄 테이블, 행 클릭 시 우측에서 슬라이드인되는 상세 서랍 패널(Detail Drawer), UTF-8 BOM 필수 적용된 CSV 내보내기 칩을 구축합니다.
*   **AI Action Plan**: 지적 질문의 드롭다운 선택 및 사용자 직접 입력창, 지능형 숙고 대기를 표현하는 글로우 로딩 스피너 및 진행 바, `Risk Summary`, `Corrective Action`, `Required Evidence`, `SOP Revision Guide`로 정형화된 고품질 조치 대책 피드백 보드를 구현합니다. (Gemini API 실시간 생성 및 Mock fallbacks 이중화)
*   **SQL-like Data Explorer**: 핵심 SELECT 쿼리 템플릿 로더, 터미널 콘솔 감성의 다중 라인 SQL 텍스트 에디터, 쿼리 결과 프레임 그리드 출력창, 쓰기 파괴형 명령어 유입 차단용 정규식 보안 샌드박스 경고 팝업 모달을 완성합니다. (인메모리 테이블 JSON 뷰에 대한 가상 SQL 매퍼 탐색 수행)
*   **Zero-Configuration Portability**: 어떠한 로컬 컴파일, Docker 가상 환경, 혹은 백엔드 실행 의존성 없이 index.html 파일 실행만으로 동일하게 구동 및 복제되는 극대화된 가상 포터빌리티를 보장합니다.
*   **Demo Flow**: 해커톤 시연 스토리텔링에 따라 5대 핵심 화면의 필터와 상세 패널 데이터가 유기적이고 완벽한 일관성(Data Consistency)을 띠며 흐르도록 데이터를 프리세팅합니다.

---

## 5. 구현하지 않을 기능 (Non-Goals)

해커톤 시연 안정성 및 단일 프론트엔드 구동 환경의 단순성을 유지하기 위해 MVP 범위에서 **의도적이고 철저하게 제외(Out of Scope)**하는 대상입니다.

1.  **서버 사이드 로그인 및 세션 관리 (No Server-side Session)**: 백엔드 데이터베이스 기반 회원가입, 실인증 토큰, 비밀번호 암호화 및 영속 세션 관리 백엔드 서버는 구현하지 않으며, 클라이언트 사이드 프로필 선택기 및 `data/users.json` 데이터 바인딩을 통해 프론트엔드 모의 세션 상태로 전환 및 동기화합니다.
2.  **완전한 엔터프라이즈 물리 RBAC (No Enterprise physical RBAC)**: 3단계 권한(Admin, Manager, Viewer)에 따른 실시간 메뉴 잠금, 탭 가드, 쓰기 작업 차단 알림 인터랙션은 클라이언트 단에서 보장하되, 실제 다중 조직도 결재선 승인, AD(Active Directory) 연동 및 네트워크 소켓 수준의 데이터 무단 접근 차단은 제외합니다.
3.  **실시간 협업 편집 시스템 (Multi-user Collaborative Editing)**: 웹소켓 등을 활용하여 체크리스트 진행률이나 대응 문서를 다자간 실시간 공유하며 공동 편집하는 동적 협업 모듈은 구현 대상에서 제외합니다.
4.  **운영 배포용 전용 보안 조치 (Production Security)**: 데이터 양방향 암호화, API 라우트 프록시 암호화, CORS 방어 대책 등 실제 상용 프로덕션 수준의 고도화된 보안 설계는 제외합니다.
5.  **AI 대책 최종 승인 결재선 워크플로우 (Draft Approval Workflow)**: AI가 도출한 대책에 대해 여러 부서장의 결재 승인을 득해 배포하는 ERP 수준의 복잡한 워크플로우는 제외하며, 단일 클릭 승인 연출 및 localStorage 영속화로 단순화하여 종결합니다.
6.  **물리 데이터베이스 파일 쓰기 및 WASM SQL 엔진 탑재 (No Physical DB or Client SQL WASM)**: SQLite 바이너리 파일(`.db`)에 실제 로컬 소켓으로 접근하여 직접 트랜잭션을 실행하거나, 브라우저 단에서 대형 WASM 기반의 SQL 디코딩 엔진(SQL.js 등)을 로드하여 실행하는 복잡하고 불안정한 물리 SQL 구동 행위는 전면 배제합니다.
7.  **백엔드 API 서버 구동 및 실시간 물리 감시 데몬 가동 (No Python Backend & Watchdog)**: FastAPI, Flask 등 별도의 Python 프로세스를 구동하거나 백그라운드 watchdog 데몬을 통해 실시간 로컬 디렉토리 변경을 추적하는 인프라 컴포넌트는 전면 배제합니다.
8.  **컨테이너 가상화 및 클라우드 배포 스크립트 구축 (No Docker & Cloud Deployment)**: Dockerfile 구성, gcloud 배포 파이프라인 수립 등 복잡한 클라우드 아키텍처 설정을 영구 제외합니다.

---

## 6. MVP 데이터 범위 (Data Scope)

*   **정적 JSON/CSV 데이터셋 지향**: 전사 공장 정보, 15대 표준 공정, 공통 증적 유형 마스터 및 OEM 규격서 셋은 정밀 전처리되어 `data/` 내부에 미리 저장된 파일만 활용합니다.
*   **사전 JOIN 완료 데이터**: 런타임 시에 브라우저 자바스크립트로 수만 줄의 비정형 규격 데이터와 품질 QI 이력을 과도하게 결합 연산하는 오버헤드를 막기 위해, 주요 관계 데이터는 사전에 JOIN 가공하여 정적 뷰 파일로 export 적재해 둔 데이터를 조회 비동기 로딩합니다.
*   **클라이언트 배열 연산**: 공정 분류 매핑, 검색어 검색, 준비 점수 가중치 산출 및 위험도 뱃지 적용 등은 100% 브라우저 메모리상에서 자바스크립트 배열 필터(`filter`, `map`, `reduce`) 및 정렬(`sort`) 메서드로 즉각 고속 연산 처리합니다.

---

## 7. MVP AI 범위 (AI Scope)

*   **AI Action Plan 중심 가동**: 감사 지적 질문을 바탕으로 8D Report 규격 영구 개선 시정 대책과 현장 SOP 보완안 및 증적 확보 방법을 세련되게 도출하는 핵심 기능에 생성형 AI 기술을 집중 연계합니다.
*   **가상 응답 사전 (Mock Dictionary)의 철저한 준비**: Gemini API Key 누락이나 네트워크 단절 등으로 AI API 호출이 불가능할 경우에 대비하여, 자주 묻는 질문 8종 이상의 실제 최고 전문가 수준 SOP 대책과 조치 계획 데이터 세트를 사전에 자바스크립트 사전 형태로 준비해 둡니다. API 오류 포착 즉시 가상 사전이 바인딩되도록 예외 설계를 장착해 시연 중단(White-out)을 완벽히 방어합니다.
*   **가상 숙고 연출 (Visual Delay Effect)**: Mock 응답 출력 시에도 우아한 로딩 스피너와 깜박이는 프로그레스 바를 1.0~1.5초간 노출하여, AI가 실시간으로 수검 데이터를 분석하는 듯한 협업 대기 감성을 미학적으로 극대화합니다.

---

## 8. 메뉴별 MVP 범위 (Menu-Specific Scope)

### ① Risk Assessment (실시간 리스크 대시보드)
*   **구현 범위**: 전사/공장/공정/데이터기준 공통 필터 바 조작 시, 사전에 정의된 위험 가중치 연산 공식이 Vanilla JS에서 실행되어 대시보드 수치가 동적 갱신됩니다. Chart.js/Plotly.js 2D 차트가 물 흐르듯 실시간 리렌더링되며, 3.5점 이상 고위험 공정 경보 및 위급 4M 변경 발생 시 적색 글로우 펄스 애니메이션 경고 패널이 팝업됩니다.

### ② OE Requirement Library (기술 규격서 보관소)
*   **구현 범위**: OEM/규격유형 다중 필터링 테이블 그리드를 고용량 수직 스크롤 뷰로 로드합니다. 특정 행을 클릭하면 하단에 AI 핵심 검토 요약 패널이 부드럽게 위로 확장되며 나타납니다. 다운로드 버튼 클릭 시 `documents/` 디렉토리에 정적으로 수납되어 있는 실제 규격 PDF/DOC 파일이 사용자 로컬 PC로 안전히 가상 다운로드됩니다.

### ③ Self-Audit Checklist (현장 맞춤형 체크리스트)
*   **구현 범위**: 상단 4열 통합 AI 분석 요약 보드를 배치하고, Mixing/Curing 등 공정 탭 전환 시 DOM 바인딩으로 무지연 고속 교체합니다. 각 행에 원형 준비율 게이지와 AI Risk 배지를 렌더링하고, 클릭 시 우측에서 기한·담당자·증빙 체크리스트·AI 가이드라인이 집약된 디테일 드로어(Detail Drawer)가 슬라이드인 출현합니다. CSV Export 단추 클릭 시 한글 인코딩 깨짐이 방지된 UTF-8 BOM CSV 파일이 정상 생성되어 다운로드됩니다.

### ④ AI Action Plan (AI 대책 수립 보드)
*   **구현 범위**: 자주 지적되는 현장 불합리 및 오디트 지적 사항을 담은 퀵 셀렉트 드롭다운 및 자유 기입형 사용자 입력 보드를 제공합니다. 개선 대책 도출 버튼 터치 시 로딩 진행을 시각화하고 최종 AI 대책 가이드라인 피드를 `Risk Summary`, `Corrective Action`, `Required Evidence` 등의 수려한 그리드 보드로 정밀 출력합니다.

### ⑤ SQL-like Data Explorer (정적 안전 SQL 콘솔)
*   **구현 범위**: 유용한 SQL 템플릿 로딩 단추(SELECT 전용)를 제공하여 에디터에 모범 쿼리 구문을 원클릭 출력합니다. 텍스트 에디터는 JetBrains Mono 서체의 다크 콘솔 테마를 유지하며, `UPDATE`, `DELETE`, `DROP` 등 쓰기 및 파괴성 SQL 명령어 포착 시 정규식 스캔으로 원천 차단하고 적색의 보안 샌드박스 경고 모달을 가시화합니다. 쿼리 실행 시 JS 매퍼가 정적 JOIN 테이블 뷰 데이터를 탐색하여 데이터프레임으로 하단에 안전하고 빠르게 뿌려줍니다.

---

## 9. 우선순위 (Prioritization)

### 🔴 P0: 필수 구현 (데모 핵심 블록)
*   Grid App Shell 및 DOM 기반 무지연 메뉴 전환 탭바 구축.
*   `data/` 폴더 내 정적 JSON 리소스의 비동기 fetch 적재 및 `localStorage` 연동 상태 보존 마운터 구현.
*   Risk Assessment 대시보드 리스크 점수 가중치 JS 공식 구현 및 2D 차트 동적 리렌더링.
*   Self-Audit Checklist of 공정 탭바, 원형 준비율 게이지, 우측 슬라이드 Detail Drawer 구축.
*   AI Action Plan의 Mock 가상 응답 사전 매퍼 및 숙고 시간을 표현하는 감박이는 로딩 진행 연출 피드 구현.
*   SQL Console의 SELECT 전용 안전 템플릿 로더, 인메모리 데이터 셋 기반 SQL-like 뷰어 출력 및 쓰기 구문 스캔 차단 보안 모달.

### 🟡 P1: 가능하면 구현 (완성도 극대화)
*   체크리스트의 점검 체크박스 선택 및 메모 입력값 저장 시 `localStorage` 즉시 동기화 및 대시보드 진행률/준비율 실시간 반영.
*   Self-Audit Checklist의 MS Excel 한글 깨짐이 방지된 UTF-8 BOM CSV 내보내기 다운로드 모듈.
*   실제 온라인 환경 시 AI Action Plan에서 Gemini API 실시간 fetch 호출 시도 및 장애/Key 유실 시 Mock 사전으로의 중단 없는 fallback 예외 복원.

### 🟢 P2: 시간 남으면 구현 (디테일 폴리싱)
*   체크리스트 드로어 내 신규 증빙 자료 파일 업로드 드래그 앤 드롭 가상 연출 (업로드 배지 표시 및 100% 가상 프로그레스 진행).
*   각 페이지 전환 및 드로어 슬라이드인 시 부드러운 가속 이징(cubic-bezier) 인터랙션 튜닝.

### 🚫 Out of Scope: 구현 배제
*   서버 기반 로그인인증, 회원가입 및 원격 데이터베이스 실시간 연동 (단, 브라우저 localStorage 기반 모의 세션 전환 및 복원은 허용).
*   다중 사용자 실시간 협업 공동 편집 및 채팅 서버 개설.
*   실제 Python 백엔드(FastAPI) 구축, 파일 시스템 실시간 감시 watchdog 가동 및 Docker 컨테이너 클라우드 배포 파이프라인.

---

## 10. 범위 판단 원칙 (Scope Principles)

1.  **안정성 최우선 (Stability Over Complexity)**: 시연 중 단 1%의 에러 유발 확률이라도 감지되는 난잡한 실시간 3D 기법이나 드래그 앤 드롭 정렬 대신, 검증된 마우스 호버와 클릭 기반의 CSS 글래스모피즘 인터랙션으로 완결합니다.
2.  **외관의 프리미엄화 (Fake it till you make it)**: 기능적으로는 정적이며 모의(Mock) 처리된 단순 데이터 바인딩일지라도, 사용자에게 노출되는 레이아웃, 상태 배지, 아이콘, 폰트 및 트랜지션의 외관 마감 완성도는 글로벌 프리미엄 SaaS 수준을 무조건 충족해야 합니다.
3.  **데이터 무결성 일치 (Semantic Consistency)**: 대시보드 차트의 수치, 공장별 4M 변경 통계, 체크리스트 상세 서랍 패널 내의 담당자 정보와 증빙 유형 등은 서로 충돌하지 않고 인과 관계가 완벽히 매칭되도록 데이터 정합성을 철저히 보존합니다.

---

## 11. 관련 문서

*   [00_context_index_and_build_order.md](file:///home/jumasi/risk_hunter/context/00_context_index_and_build_order.md) (프로젝트 인덱스 마스터)
*   [04_0_product_menu_workspace.md](file:///home/jumasi/risk_hunter/context/04_0_product_menu_workspace.md) (전체 메뉴 통합 및 화면/업무 상세 설계 개요)
*   [09_design_system_and_ui_guidelines.md](file:///home/jumasi/risk_hunter/context/09_design_system_and_ui_guidelines.md) (프리미엄 디자인 토큰 및 HSL CSS 명세서)
*   [15_acceptance_criteria.md](file:///home/jumasi/risk_hunter/context/15_acceptance_criteria.md) (자가 검증 확인용 인수 조건서)

---

## 12. Definition of Done

본 MVP 범위 정의 가이드라인이 최종적으로 완결되어 빌드 과정에 정식 적용될 수 있는 승인 판단 기준입니다.

*   **금지 범위(Non-Goals)의 구체적 명시**: 로그인, 실시간 WASM SQL 실행기, 파서 파이프라인 등 구현에서 완벽히 배제해야 할 8개 이상의 제외 장벽이 개발자가 오해 없이 회피할 수 있도록 정확하게 한글로 선언되어 있어야 합니다.
*   **우선순위(P0/P1/P2/Out of Scope)의 완전한 정렬**: 해커톤 제한 시간 내에 반드시 코딩해야 할 코어 컴포넌트 기능과 뒤로 미루어야 할 세부 조절 요소가 우선순위 규칙에 따라 명시되어 있어야 합니다.
*   **AI 및 데이터 모의 범위의 명문화**: Gemini API 및 정적 JSON 비동기 fetch 오프라인 대책(Mock Dictionary 가상 응답)의 실행 약속이 세부적으로 정형화되어 정의서 내에 안전하게 박제되어 있어야 합니다.
