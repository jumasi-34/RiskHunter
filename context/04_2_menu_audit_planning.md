# 📅 04_2_menu_audit_planning (Audit Planning & Calendar Prep Specification)

본 문서는 **2. Audit Planning** 화면의 구성, 스타일링 설계 표준, 그리고 Vanilla JS 상태 관리 및 `localStorage` 바인딩 기술 스펙을 총망라하여 정의합니다. 본 명세서 하나만 보고도 시스템을 완벽히 처음부터 역재건(Reconstruction)할 수 있도록 설계 공식과 코드 기법을 기술적으로 상세히 상세 기록합니다.

---

## 1. 개요 및 화면 기획 의도

**Audit Planning** 모듈은 예정된 고객사(OEM) 감사 일정을 사전 등록하고, 해당 감사의 목표 수검일(D-Day)을 기점으로 **D-30부터 D-Day까지 역산하여 준비해야 하는 10대 표준 태스크 및 15대 공정 체크리스트를 자동 수립/관리**하는 지능형 스케줄러입니다.

사용자(품질보증 오디터)가 수검 대상 공장, 완성차 OEM, 감사일자, 감사 종류를 지정하면 시스템은 다음과 같은 기능을 비동기·실시간으로 처리합니다:
1. **상태 요약 헤더(Summary Header)**: 진척률 게이지, D-Day 카운트다운, 전체/완료/대기 항목 개수의 실시간 집계.
2. **Tab 1: Timeline**: 준비 과정을 단계별(D-30, D-15, D-7, D-3, D-Day) 마일스톤으로 그룹화하여 가이드 문서 및 8D 증적 서류 입력을 유도하는 타임라인 피드.
3. **Tab 2: Calendar**: 수검 타겟 월의 달력을 표시하고, 각 과제의 마감일(Due Date)에 따른 일정 배치 및 **실시간 D-30 준비 과정 진척률 미니 대시보드** 연동.
4. **Tab 3: Checklist**: 수검 계획 체크리스트 자동 수립 및 조직 배포 및 엑셀 다운로드/업로드 기능.

### 🌐 실시간 외부 파일 DB 동적 연동 규격 (Mock-up 배제)
*   **실제 DB 기반 구동**: 기존 하드코딩 목업 데이터셋에 의존하는 한계를 완전히 타파하고, 실제 수검 지적사항이 기록된 **`data/cqms_customer_audit_db.json`** 파일에서 최신 감사 일정을 실시간으로 파싱 및 고유 추출하여 반영합니다.
*   **최신 최적화 로직**: 데이터베이스 내 `START_DT` 기준 내림차순 최신 정렬을 수행한 후, 고유한 수검 과제명(`SUBJECT`)을 기준으로 상위 8개 레코드를 자동 도출하여 초기 감사 일정 리스트로 실시간 마운트 및 렌더링을 처리합니다.
*   **미래 감사 일정 배포 및 시딩 (Seeding Spec)**: 해커톤 시연 환경에서 미래 감사 수검 준비 대시보드가 풍부하게 가동되도록, 각 거점별 1~2개(특별 거점인 MP, JP, TP는 3~5개 이상 완벽 매핑) 총 28개의 고품격 미래 감사 일정이 오픈 상태(`"STATUS": "Open"`)로 파일 DB 최상단에 주입되어 있습니다. 
    *   **미래 예정 감사 레코드의 지적사항 공백 처리 규칙**: 미래의 감사 일정은 아직 수검이 진행되지 않은 상태이므로, 원천 DB에 지적사항(`POINT_OUT`), 원인분석, 개선대책 등의 내용이 미리 채워져 있지 않으며 모두 공백(`""`)으로 통제되어 있습니다.
    *   **신규 추가된 미래 감사 일정 목록 (11개)**:
        
        | 공장 (PLANT) | 완성차 (OEM) | 감사 주제 (SUBJECT) | 예정 시작일 (START_DT) | 프로세스 (PROCESS) | 지적사항 및 대응방안 필드 상태 |
        | :--- | :--- | :--- | :--- | :--- | :--- |
        | **DP** (대전) | Audi | 2026-Audi 대전공장 신규 친환경 타이어 공급사 실사 | 2026-11-20 | Curing | 공백 `""` (미래 감사 대기 상태) |
        | **KP** (금산) | Kia | 2026-기아자동차 금산공장 EV9 신제품 특별 품질 수검 | 2026-12-05 | Mixing | 공백 `""` (미래 감사 대기 상태) |
        | **HP** (강소) | Xiaomi | 2026-Xiaomi 강소공장 스마트 전기차 타이어 공급사 정기 평가 | 2026-11-05 | Building | 공백 `""` (미래 감사 대기 상태) |
        | **CP** (중경) | Changan | 2026-Changan 중경공장 품질 보증 정기 점검 | 2026-12-15 | Extrusion | 공백 `""` (미래 감사 대기 상태) |
        | **IP** (인도네시아) | Hyundai | 2026-현대자동차 인도네시아공장 아세안 시장용 타이어 특별 실사 | 2026-11-25 | Inspection | 공백 `""` (미래 감사 대기 상태) |
        | **MP** (헝가리) | Volvo | 2026-Volvo 헝가리공장 신규 플랫폼용 친환경 타이어 ESG 및 품질 정합성 심사 | 2026-12-01 | Logistics | 공백 `""` (미래 감사 대기 상태) |
        | **MP** (헝가리) | Stellantis | 2027-Stellantis 헝가리공장 유럽 전략 차량 공급 품질 보증 수검 | 2027-01-15 | Calendaring | 공백 `""` (미래 감사 대기 상태) |
        | **JP** (가흥) | Nissan | 2026-Nissan 가흥공장 글로벌 최고 공급망 품질 실사 | 2026-11-18 | Cutting | 공백 `""` (미래 감사 대기 상태) |
        | **JP** (가흥) | Toyota | 2027-Toyota 가흥공장 프리미엄 완성차 공급 정기 보증 감사 | 2027-02-10 | Bead | 공백 `""` (미래 감사 대기 상태) |
        | **TP** (테네시) | Tesla | 2026-Tesla 테네시공장 기가팩토리 전용 타이어 스펙 특별 감사 | 2026-11-30 | Building | 공백 `""` (미래 감사 대기 상태) |
        | **TP** (테네시) | Hyundai | 2027-현대자동차 테네시공장 메타플랜트 전용 타이어 양산 정합성 실사 | 2027-03-05 | Curing | 공백 `""` (미래 감사 대기 상태) |

---

## 2. 디자인 가이드 및 고대비(WCAG 2.1 AA) 설계 규칙

### ① 글로벌 스타일 토큰 및 컬러 팔레트
장시간 모니터를 탐색하는 오디터들을 위해 기본 기조는 슬레이트 다크 테마 및 유리 질감의 글래스모피즘(Glassmorphism)을 적용하되, **텍스트와 배경의 명도 대비를 WCAG 2.1 AA 규격(4.5:1 이상)으로 엄격하게 보정**하여 뛰어난 가독성을 확보합니다.

*   **기본 배경**: `--bg-card` (`#ffffff` 실버/화이트 카드 또는 명도 대비가 우수한 고대비 다크 솔리드 카드)
*   **주요 텍스트**: `--text-primary` (`#0f172a` 고대비 차콜 네이비, 10:1 이상의 고대비 제공)
*   **보조 설명글**: `--text-secondary` (`#475569` 슬레이트 그레이) 또는 `--text-muted-light` (`#64748b`, 대비율 4.5:1 이상 준수)
*   **포인트/브랜드 컬러**: `--brand-blue` (`#2563eb` 내지 `#1d4ed8` 로얄 블루), `--accent-cyan` (`#00c8ff` 네온 사이언)
*   **상태 강조색**:
    *   완료(Completed): 배경 `#f0fdf4`, 테두리 `#bbf7d0`, 글자 `#15803d` (초록)
    *   진행(In Progress): 배경 `#eff6ff`, 테두리 `#bfdbfe`, 글자 `#1d4ed8` (파랑)
    *   대기(Pending): 배경 `#f8fafc`, 테두리 `#e2e8f0`, 글자 `#475569` (회색)
    *   지연/위험(Delayed/High Risk): 글자 및 배경 테두리 `#ef4444` (적색 점멸 `blink` 효과 가미)

### ② 상단 위 고정 및 프리미엄 라이트 솔리드 대시보드 규격 (Reverse-Sync - Compact Spacing)
사용자의 스크롤 시 편의성을 극대화하기 위해 상단 필터 바, 활성 일정 선택기 및 실시간 대시보드를 통째로 위 고정(Sticky Header)으로 묶고, 불필요한 공백을 완전히 소거한 고밀도 콕핏(Cockpit) 스타일로 설계합니다.
*   **Sticky Wrapper (.sticky-planning-header)**:
    - position: sticky, z-index: 100을 통해 서브탭 내용 스크롤 시 상단에 밀착 고정.
    - `padding-bottom: 2px; margin-bottom: 8px;`를 적용하여 수직 여백 최소화.
*   **프리미엄 라이트 솔리드 대시보드 (.monitoring-dashboard-card)**:
    - 백그라운드 `var(--bg-card, #ffffff)` (순백색 솔리드 표면), 테두리 `var(--border-card, #e2e8f0)` (표준 연그레이 테두리), 텍스트 `var(--text-primary, #0f172a)` (WCAG 2.1 AA 충족 및 최적 가독성).
    - `padding: 16px 20px; margin-bottom: 8px; width: 100%; display: flex; flex-direction: column; gap: 16px;`를 적용하여 수직 고집적화 및 견고성 확보.
    - **[상단-중단-하단 3단 복합 레이아웃]**:
      1. **상단**: 계기판 제목 및 모니터링 상태 배지가 가로 100% 한 줄 배치.
      2. **중단**: 5대 KPI 카드들(`.kpi-sub-card`)이 `repeat(5, 1fr)`로 계기판 가로 폭 100% 전체를 완전히 가득 채우며 완벽하게 균등 5분할 분포(D-DAY, 전체 항목 수, 완료, 진행중/대기, 지연).
      3. **하단**: 실시간 준비율 원형 게이지(반지름 26px 둘레 163.36px 규격 정밀 유지)와 4대 디테일 인포 블록(완성차 OEM, 대상 공장, 감사 일정, Audit 감사 종류)이 가로 한 줄로 자연스럽게 정렬되며 가로를 가득 채움.
    - 4대 디테일 인포 블록은 가로 한 줄 분할 칩 그리드(`repeat(4, 1fr)`, gap 10px)로 배치되며, `background: var(--bg-app, #f8fafc)` (차분한 라이트 그레이), `border: 1px solid var(--border-card, #e2e8f0)` (가벼운 테두리), `padding: 4px 10px;` 사양 적용.
    - 5대 KPI 가로 카드들(`.kpi-sub-card`)은 `background: var(--bg-app, #f8fafc)`, `border: 1px solid var(--border-card, #e2e8f0)` 조합에 `padding: 10px 8px !important;`, `height: 100% !important;` 및 수치 폰트를 현대적인 테크 서체 `'Outfit', sans-serif`로 지정하여 가로 100%를 웅장하고 컴팩트하게 채우도록 정렬.
    - 상단 필터 셀렉터들의 높이를 `34px`로 통합 소형화하고 간격을 `8px`로 좁혀 전체 화면 대비 과한 면적 점유 방지.

### ③ 신규 감사 일정 등록 팝업 (White Modal) 규칙
모달창 내부 텍스트가 묻히는 것을 방지하기 위해 **완전한 솔리드 화이트 백그라운드**와 고대비 테두리, 그리고 차콜 네이비 폰트를 강제 매핑합니다.
*   **Modal Content CSS**:
    ```css
    .modal-content {
      background: #ffffff;
      border: 1px solid var(--border-card);
      box-shadow: 0 20px 40px rgba(15, 23, 42, 0.15);
      border-radius: var(--radius-panel);
      color: #0f172a;
    }
    .modal-content input, .modal-content select, .modal-content textarea {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      color: #0f172a;
    }
    ```

---

## 3. 핵심 비즈니스 로직 및 수학적 연산 공식

### ① D-Day 카운트다운 연산
실시간 기준일인 `2026-05-29`를 상수로 선언하여 사용자가 지정한 감사 예정일(`audit.date`)과의 시간차를 일(Day) 단위로 정밀하게 환산합니다.
$$\text{diffDays} = \left\lceil \frac{\text{SelectedDate} - \text{CurrentDate}}{1000 \times 60 \times 60 \times 24} \right\rceil$$
*   $\text{diffDays} > 0$ 이면 `D-N` (일주일 이내 시 빨간색 강조 및 `blink` 애니메이션 적용)
*   $\text{diffDays} = 0$ 이면 `D-DAY` (Blink)
*   $\text{diffDays} < 0$ 이면 `D+N`

### ② 준비율(Completion Rate) 및 태스크 집계
각 수검 감사 일정에 1대1 매핑된 10대 마일스톤 태스크들의 `status` 값을 필터링 연산하여 실시간 진척 백분율을 구합니다.
$$\text{Completion Rate (\%)} = \left( \frac{\text{Completed Tasks}}{\text{Total Tasks}} \right) \times 100$$
*   **지연(Delayed) 항목 판정**:
    $$\text{Status} \neq \text{'completed'} \quad \text{AND} \quad \text{diffDays} \le \text{Milestone Relative Days}$$
    (예: 감사 수검일까지 남은 일수가 10일인데, `D-15` 단계 기한에 예정된 과제가 아직 완료되지 않은 상태라면 '지연' 상태로 자동 판정)

### ③ 4-Way 데이터 매퍼 (Audit Type 매핑)
기존의 복잡한 개별 제조 공정 나열 레이아웃을 간소화하여 오디터 편의성을 증대하기 위해, `Audit type` 드롭다운의 옵션을 단 두 가지 코스인 **Project**와 **System**으로 제한 바인딩합니다.
*   **Project 필터 활성화 시**: 제조 현장 중심의 12대 공정(`['incoming', 'mixing', 'extrusion', 'calendaring', 'cutting', 'bead', 'building', 'curing', 're-work', 'inspection', 'form', 'sealant']`) 데이터 세트 자동 매핑 연동.
*   **System 필터 활성화 시**: 본사 관리 및 행정 표준 관리 영역 4대 카테고리(`['design', 'test', 'system', 'logistics']`) 데이터 세트 자동 매핑 연동.

---

## 4. UI/UX 및 HTML 마크업 구조

달력(Calendar) 화면 안에서 추진도와 현황을 한눈에 입체 트래킹할 수 있도록 상단에 추가한 **진척률 & D-Day 연동 미니 대시보드 배너** 마크업 사양입니다:

```html
<!-- 📅 Target 감사 일정 기준 추진 달력 내 미니 대시보드 배너 (index.html) -->
<div id="calendar-prep-progress-banner" style="display: flex; align-items: center; gap: 15px; background: rgba(37, 99, 235, 0.05); border: 1px dashed rgba(37, 99, 235, 0.25); padding: 8px 16px; border-radius: 8px;">
  <!-- 진척률 게이지 바 영역 -->
  <div style="display: flex; flex-direction: column; gap: 2px;">
    <span style="font-size: 10px; color: var(--text-muted-light); font-weight: 700; text-transform: uppercase;">감사 진척률</span>
    <div style="display: flex; align-items: center; gap: 6px;">
      <div style="width: 100px; height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden; position: relative;">
        <div id="calendar-progress-bar" style="width: 0%; height: 100%; background: linear-gradient(90deg, #2563eb, #00c8ff); border-radius: 3px; transition: width 0.3s ease;"></div>
      </div>
      <span id="calendar-progress-percent" style="font-size: 12px; font-weight: 800; font-family: monospace; color: var(--text-primary);">0%</span>
    </div>
  </div>
  <div style="width: 1px; height: 28px; background: var(--border-card);"></div>
  
  <!-- D-Day 정보 표기 영역 -->
  <div style="display: flex; flex-direction: column; align-items: center;">
    <span style="font-size: 9px; color: var(--text-muted-light); font-weight: 700; text-transform: uppercase;">남은 일정</span>
    <span id="calendar-prep-dday" style="font-size: 13px; font-weight: 800; font-family: monospace; color: #2563eb;">D-30</span>
  </div>
  <div style="width: 1px; height: 28px; background: var(--border-card);"></div>
  
  <!-- 준비 완결 수량 요약 -->
  <div style="display: flex; flex-direction: column;">
    <span style="font-size: 9px; color: var(--text-muted-light); font-weight: 700; text-transform: uppercase;">준비 현황</span>
    <span id="calendar-prep-summary" style="font-size: 11px; font-weight: 700; color: var(--text-primary);">총 10건 중 0건 완료</span>
  </div>
</div>
```

### ③ Tab 3: Checklist (Task Deployment Scheduler) 테이블 구성 및 규격

공식 시연용 및 고대비 요건(WCAG 2.1 AA)을 충족하기 위한 수검 계획 체크리스트 테이블의 컬럼 및 상세 UI 컴포넌트 구성 사양입니다.

*   **배경 및 스타일**: 카드 솔리드 백그라운드 `#ffffff` 위에서 검정색 주요 폰트 `#0f172a`와 연한 회색 보조 폰트 `#64748b`를 사용하여 고대비 가독성 보장 (> 4.5:1). 각 행 마우스 호버 시 자연스러운 배경색 트랜지션 효과(`#f8fafc`) 적용.
*   **컬럼 구성**:
    1.  **Task ID**: 고대비 monospace `TASK_X` 문자열 (예: `TASK_1` ~ `TASK_10`).
    2.  **추진 마일스톤**: 헤더에 `<br>` 개행을 적용한 `추진 마일<br>스톤`으로 표기. 셀에는 로얄 블루 색상의 굵은 텍스트(예: `D-30`, `D-15` 등, 백그라운드 배지 소거)로 표시하여 가시성 유도.
    3.  **검증 준비 과제 (체크리스트)**: 태스크 제목(`title`, `#0f172a`, 12.5px 굵게) 및 세부 설명(`desc`, `#64748b`, 11px) 병렬 출력.
    4.  **배치팀 (Team)**: 순수 흰색 `#ffffff` 배경과 테두리 `#cbd5e1` 및 고대비 검정 글자색 `#0f172a`를 매핑한 부서 입력 폼. 빈 데이터일 시, 각 Task ID별 논리적 기본 배치팀을 실시간으로 추론 매핑하여 Fallback 연출.
    5.  **담당 실무자**: 배치팀 인풋과 동일 디자인의 담당자 입력 폼 (기본 Fallback: `박정호 수석`).
    6.  **조치 기한 (Due Date)**: 날짜 지정 입력창(`type="date"`). 지정되지 않은 경우 D-Day 마일스톤으로부터 역산된 날짜가 자동으로 계산 매핑됨.
    7.  **준비 상태**: 클릭 및 조작 요소가 배제된 라운디드 테두리 형태의 정적 상태 배지 출력.
        *   `대기`: 배경 `#f8fafc`, 테두리 `#cbd5e1`, 글자 `#475569`.
        *   `진행`: 배경 `#eff6ff`, 테두리 `#bfdbfe`, color `#1d4ed8`.
        *   `완료`: 배경 `#f0fdf4`, 테두리 `#bbf7d0`, color `#15803d`.
        *   `지연 위험`: (기준일 2026-05-29 초과 시) 배경 `#fef2f2`, 테두리 `#fca5a5`, color `#ef4444` 및 점멸 `blink` 효과 적용.
    8.  **작업**: 가로 정렬된 2개의 인터랙션 단추 배치.
        *   `상태` 버튼: 백그라운드 `#ffffff`, 테두리 `#cbd5e1`, 글자 `#0f172a` 및 리프레시 아이콘 탑재. 클릭 시 해당 태스크의 상태가 순차적으로 순환 변경됨 (`대기` ➔ `진행` ➔ `완료` ➔ `대기`).
        *   `저장` 버튼: 로얄 블루 백그라운드 `#2563eb` 및 화이트 글자색 `#ffffff`로 구성된 디스크 아이콘 탑재 버튼. 클릭 시 해당 행의 `배치팀`, `담당 실무자`, `조치 기한` 정보가 영속 저장소(`localStorage`)에 저장되며 성공 토스트 출력.

---

## 5. Vanilla JS 상태 제어 핵심 로직

### ① 캘린더 전용 데이터 동적 바인딩 및 렌더링 (`app.js`)
기존 달력 그리드 생성 논리와 완전히 호흡하여, 사용자가 선택한 예정 감사 정보에 매핑된 태스크들의 완료 통계치를 달력 내부 배너에 직접 주입해 주는 실시간 렌더러 로직입니다:

```javascript
renderCalendarTab() {
  const audit = this.state.audits.find(a => a.id === this.state.selectedAuditId);
  if (!audit) return;

  // 1. 실시간 완료 통계 집계 연산 (10대 마일스톤 태스크 기준)
  const taskStates = this.state.planningChecklistStates[audit.id] || {};
  const totalT = this.state.planningTasks.length;
  const completedT = this.state.planningTasks.filter(t => taskStates[t.id] === 'completed').length;
  const completionRate = totalT > 0 ? (completedT / totalT) * 100 : 0;

  // 2. 고정 기준일(2026-05-29) 기반 D-Day 실시간 환산 연산
  const todayStr = "2026-05-29";
  const today = new Date(todayStr);
  const auditDate = new Date(audit.date);
  const diffTime = auditDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  let dDayText = diffDays > 0 ? `D-${diffDays}` : (diffDays === 0 ? "D-DAY" : `D+${Math.abs(diffDays)}`);

  // 3. UI 돔(DOM) 요소 갱신 및 고대비 동적 색상 매퍼 적용
  const calProgressBar = document.getElementById('calendar-progress-bar');
  const calProgressPercent = document.getElementById('calendar-progress-percent');
  const calPrepDday = document.getElementById('calendar-prep-dday');
  const calPrepSummary = document.getElementById('calendar-prep-summary');

  if (calProgressBar) calProgressBar.style.width = `${completionRate}%`;
  if (calProgressPercent) calProgressPercent.textContent = `${completionRate.toFixed(0)}%`;
  
  if (calPrepDday) {
    calPrepDday.textContent = dDayText;
    if (diffDays <= 7 && diffDays >= 0) {
      calPrepDday.style.color = '#ef4444'; // 위험 일수 점멸
      calPrepDday.classList.add('blink');
    } else if (diffDays < 0) {
      calPrepDday.style.color = 'var(--text-muted-light)'; // 과거 감사
      calPrepDday.classList.remove('blink');
    } else {
      calPrepDday.style.color = '#2563eb'; // 안전 권역 로얄블루
      calPrepDday.classList.remove('blink');
    }
  }
  
  if (calPrepSummary) {
    calPrepSummary.innerHTML = `총 <strong>${totalT}</strong>건 중 <strong>${completedT}</strong>건 완료`;
  }

  // (이하 년/월 타이틀 바인딩 및 이전달/이번달 달력 날짜 7x6 그리드 그리기 루프 동작 실행...)
}
```

### ② 탭 간 상태 완벽 실시간 정기 동기화 (`localStorage` & Event Dispatch)
과제 세부 정보를 수정하여 완료 상태로 바꾼 순간, 복잡한 트리거 수동 지연 없이 메모리 데이터 업데이트와 동시에 달력 진척도 뷰도 일치 갱신되도록 파이프라인을 유도합니다:

```javascript
toggleTaskState(taskId) {
  const auditId = this.state.selectedAuditId;
  if (!auditId) return;

  if (!this.state.planningChecklistStates[auditId]) {
    this.state.planningChecklistStates[auditId] = {};
  }

  const currentState = this.state.planningChecklistStates[auditId][taskId] || "pending";
  let nextState = "pending";

  if (currentState === "pending") {
    nextState = "in_progress";
  } else if (currentState === "in_progress") {
    nextState = "completed";
  } else {
    nextState = "pending";
  }

  this.state.planningChecklistStates[auditId][taskId] = nextState;
  localStorage.setItem('riskhunter_checklist_states', JSON.stringify(this.state.planningChecklistStates));

  // 화면 즉각 리렌더링
  this.renderPlanningScreen();
}
```

### ③ "활성 수검 일정 선택" 드롭다운 필터 및 실시간 캘린더/체크리스트 연동 흐름

고유 ID가 `#planning-audit-select`인 상단 "활성 수검 일정 선택" 셀렉터 드롭다운은 `data/cqms_customer_audit_db.json` 파일에서 동적 추출되어 `this.state.audits`에 적재된 모든 미래 예정(STATUS: Open) 감사 일정과 기하학적으로 연동 구동됩니다.

1. **동적 드롭다운 렌더링 메커니즘**:
   - `this.state.audits` 리스트를 동적 루프 처리하여, 각 감사 일정의 고유 식별자(`audit.id`)를 `value`로, 완성차 OEM/공장 주제 및 감사 시작일자를 조합한 문자열(`${audit.title} (${audit.date})`)을 `textContent`로 삼아 `<option>` 노드를 무지연 재생성 및 인서트합니다.
   - `this.state.selectedAuditId`와 정확하게 매치되는 옵션에 `selected = true` 속성을 강제 바인딩하여 새로고침 시에도 활성 컨텍스트 상태를 완벽히 유지시킵니다.
2. **리액티브 연쇄적 연동 흐름 (Chained Reaction Logic)**:
   - 사용자가 드롭다운 셀렉터를 조작하여 다른 감사 예정 일정으로 전환(onchange 이벤트 트리거)하면 다음 연쇄 프로세스가 비동기·실시간 실행됩니다:
     - **영속 캐시 즉각 보존**: 선택한 새로운 감사 ID를 `this.state.selectedAuditId` 상태에 매핑하고 로컬 캐시인 `riskhunter_selected_audit_id`에 즉시 쓰기 처리합니다.
     - **달력 월(Month) 리액티브 포커싱**: 활성 일정의 감사일(`audit.date`) 날짜 속성을 JS `Date` 객체로 파싱하고 연도/월 값을 역산하여, 달력 전용 제어 상태 변수인 `this.state.calendarYear` 및 `this.state.calendarMonth`에 자동 대입합니다. 이를 통해 **선택한 감사의 목표 수검월로 캘린더 화면이 자동 이동(스크롤) 포커싱**되어 오디터의 오작동 및 날짜 혼선을 원천 방지합니다.
     - **화면 일괄 반응형 렌더링**: `this.renderPlanningScreen()`을 연속 기동하여, 현재 전환된 활성 감사 ID에 속한 타임라인 D-Day 단계 피드, 캘린더 일별 그리드 배너(진척률), 체크리스트 테이블 조치 담당 정보 등을 일관되게 동적 맵핑하여 갱신하고, 사용자에게 우아한 전환 완료 알림 토스트를 노출합니다.

---

## 6. 재건(Reconstruction) 및 자가 검증(Test Checklist) 프로토콜

본 명세에 따라 신규 시스템을 빌드했을 때, 기능의 작동 무결성을 기하학적으로 완벽히 검증하기 위한 자가 체크리스트입니다:

1. **[ ] 4-Way 드롭다운 필터 점검**: `Audit type` 변경 시 "Project" 및 "System" 두 종류만 제공되는지 확인하고, 변경 조회 버튼을 누를 시 하단 테이블 데이터 분류 목록이 기획된 맵핑 키워드에 따라 정상 필터링되어 노출되는가?
2. **[ ] 팝업 테두리 및 명도 확인**: "신규 감사 일정 등록" 모달창 기동 시, 기존의 뿌연 반투명 다크 글래스 뒤에 텍스트가 묻히지 않고 불투명 솔리드 화이트 카드로 또렷하게 렌더링되며 인풋 보더선이 명확한가?
3. **[ ] 캘린더 진척률 배너 실시간 연동 확인**:
    *   **Timeline** 탭에서 임의의 태스크를 "완료"로 저장 처리한다.
    *   **Calendar** 탭으로 진입하여 우측 상단의 `감사 진척률` 수치가 실시간 연산되어 막대바 너비와 함께 60%, 70% 등으로 올라갔는지 관찰한다.
    *   수검 일자를 5일 이내로 단축해 등록할 시, 달력 안 배너의 `남은 일정` 글씨가 기획된 적색 점멸(`blink`) 상태로 역동감 있게 변하는지 확인한다.
4. **[ ] 데이터 영속성 점검**: 브라우저 화면을 강제 새로고침(F5) 하였을 때, 직전에 수동 변경한 과제 정보 및 추가 생성한 감사 일정이 `localStorage`로부터 원활히 복원되어 그래프와 배너 수치를 그대로 유지하는가?
