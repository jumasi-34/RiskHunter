/**
 * ==========================================================================
 * ⚙️ RiskHunter App Engine (Core JavaScript)
 * Phase 6: Library & Floating Assistant Integration Engine
 * ==========================================================================
 */


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

const app = {
  // 전역 애플리케이션 상태 (Global State)
  state: {
    currentTab: 'dashboard',
    currentLang: 'KO', // 글로벌 다국어 서비스 상태 기본값 ('KO' | 'EN' | 'ZH')
    plantRiskActivePlant: 'DP', // Phase 4 활성 공장 기본값
    activePlantRiskSubtab: 'risk-compass', // 기본 서브 탭
    currentUser: { name: '박정호 수석', role: 'admin', dept: '품질보증부', badge: 'ADMIN', color: '#ef4444' },
    currentRole: 'admin', // 기본 역할: 최고관리자 (admin)
    users: [
      { name: '박정호 수석', role: 'admin', dept: '품질보증부', badge: 'ADMIN', color: '#ef4444' },
      { name: '이현우 책임', role: 'manager', dept: '생산관리부', badge: 'MANAGER', color: '#3b82f6' },
      { name: '김민지 사원', role: 'viewer', dept: '자재팀', badge: 'VIEWER', color: '#10b981' }
    ],

    // Phase 1 글로벌 공통 자원 및 리스크 이력 상태 데이터셋
    auditChecklists: [],
    documentLibrary: [],
    commonCodes: { plants: [], categories: [], processes: [], dimensions_4m: [], source_types: [] },
    auditFindings: [],
    changeHistory4m: [],
    qualityIssues: [],
    oeQualityAssessmentDetails: [],

    // Phase 3 Audit Planning 상태 및 모의 일정 기본 데이터셋
    audits: [],
    selectedAuditId: null,
    planningChecklistStates: {}, // {[auditId]: {[taskId]: 'pending'|'in_progress'|'completed'}}
    planningTaskAssignments: {}, // {[auditId]: {[taskId]: {team, lead, dueDate}}}
    selectedCalendarDate: null,  // 현재 달력에서 클릭 선택된 날짜 (예: '2026-06-15')
    checklistManagerStates: {},  // {[checklistItemId]: boolean} - Checklist Manager 체크 상태
    activePlanningSubtab: 'planning-timeline', // 현재 활성화된 서브탭
    calendarYear: undefined,     // 달력 표시 연도
    calendarMonth: undefined,    // 달력 표시 월 (0-indexed)
    activeChecklistType: 'Project', // Checklist Manager 감사 유형
    activeChecklistScope: 'ALL',    // Checklist Manager 세부 공정/영역
    activeChecklistPriority: 'ALL', // Checklist Manager 중요도
    activeChecklistSearch: '',      // Checklist Manager 검색어
    planningTasks: [
      { id: "task_1", milestone: "D-30", title: "OEM 고객 요구 규격서(CSR) 개정판 확보 및 내부 대조", desc: "고객사 최신 품질 요구사항과 당사 SOP 매핑 정합성 확인" },
      { id: "task_2", milestone: "D-30", title: "감사 TF 조직 구성 및 오디터 자격 검증", desc: "내부 VDA 6.3 오디터 자격 보유자 중심 TF 배치 및 R&R 지정" },
      { id: "task_3", milestone: "D-15", title: "대상 공장 과거 3개년 품질 실패(QI) 및 고객 불만 이력 추출", desc: "유사 불량 방지를 위한 과거 QI 근본 원인 대책 현장 보완 상태 확인" },
      { id: "task_4", milestone: "D-15", title: "주요 공정별 OEM 표준 체크리스트 한글화 및 기입 템플릿 배포", desc: "현장 오퍼레이터 대면 수검을 위한 15대 공정별 템플릿 배포" },
      { id: "task_5", milestone: "D-7", title: "대상 공장 최근 1년 4M 변경점(설비/재료/작업자/방법) 이력 분석", desc: "SOP 무단 변경점 사전 추적 및 이상 조치(OCAP) 가동 상태 확인" },
      { id: "task_6", milestone: "D-7", title: "과거 제3자 및 OEM 감사 지적사항(Findings) 종결 조치 유효성 검증", desc: "이전 감사 지적사항 중 미결(Open) 건에 대한 현장 물리적 보완 실사" },
      { id: "task_7", milestone: "D-3", title: "수검 증적 유형별 디지털 공유 폴더(Evidences) 최종 동기화 검사", desc: "원재료 COA, 계측기 검교정 성적서, 작업자 교육일지 실물 매칭" },
      { id: "task_8", milestone: "D-3", title: "핵심 취약 공정(성형/가류 등) 오퍼레이터 가상 인터뷰 리허설", desc: "현장 오퍼레이터 대상 작업 표준(SOP) 및 고장 대책 인지 상태 인터뷰" },
      { id: "task_9", milestone: "D-Day", title: "현장 오디팅 수행 및 지적 사항(Live Finding) 실시간 기록", desc: "오디터 동선 밀착 밀수 수행 및 돌발 지적사항 시스템 실시간 등록" },
      { id: "task_10", milestone: "D-Day", title: "부적합 지적사항에 대한 AI 시정조치안(8D) 및 긴급 피드백 확보", desc: "AI Action Advisor 활용 8D 보고서 초안 및 SOP 개정 가이드라인 즉각 도출" }
    ],

    // Phase 2 차트 캐시 및 인터랙션 상태
    charts: {
      plantRisk: null,
      processRisk: null,
      plantSelected: null, // Doughnut 차트 전환 시 선택된 공장 코드 보존용 (e.g. 'DP')
      radarRiskCompass: null, // Sub-Tab 1
      scatterSystemMap: null, // Sub-Tab 2
      barCompliance: null // Sub-Tab 2
    },

    // 글로벌 공통 필터 상태 값 (Plant, Customer, Process) -> Dashboard용 필터 상태 값으로 사용
    selectedPlant: 'ALL',
    selectedCustomer: 'ALL',
    selectedProcess: 'ALL',
    
    // 라이브러리 인터랙션용 필터 및 상태 값
    librarySelectedPlant: 'ALL',
    librarySelectedCustomer: 'ALL',
    checklistFilterProcess: 'ALL',
    checklistSearchQuery: '',
    checklistCurrentPage: 1,
    checklistPageSize: 10,
    selectedChecklistItem: null,

    libSearchQuery: '',
    selectedDoc: null,

    // 플로팅 비서 채팅 기록
    chatHistory: []
  },

  // 초기화 핸들러 (Initialization)
  async init() {
    window.antigravity = this;
    console.log("🏁 RiskHunter Phase 6 Core Engine Initializing...");
    
    // 로컬스토리지에서 다국어 세팅 복구
    const storedLang = localStorage.getItem('riskhunter_language');
    if (storedLang) {
      this.state.currentLang = storedLang;
      console.log(`[*] Restored default language: ${this.state.currentLang}`);
    } else {
      this.state.currentLang = 'KO';
    }

    // 1. Lucide SVG 아이콘 생성 및 바인딩
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    } else {
      console.warn("Lucide Icons Library is not loaded.");
    }

    // 2. 역할 전환 팝오버 프로필 리스트 렌더링
    this.renderProfileSwitcher();

    // 3. 이벤트 리스너 바인딩
    this.bindEvents();
    
    // 글로벌 다국어 선택기 엘리먼트 값 동기화
    const globalLangSelect = document.getElementById('global-lang-select');
    if (globalLangSelect) {
      globalLangSelect.value = this.state.currentLang;
    }
    
    // 4. 비동기 정적 데이터 로딩 및 가상 데이터베이스 초기화 (순서 변경 및 await 적용)
    await this.initDatabase();

    // 5. 권한 기반 UI 요소 상태 제어 및 탭 동기화
    this.applyPermissionToUI();
    this.switchTab(this.state.currentTab);
    
    console.log("🚀 Phase 6: Library & Floating Assistant Engine Initialized!");
  },

  // 📂 비동기 데이터 Fetch 엔진 및 가상 DB 전역화
  async initDatabase() {
    console.log("📂 Loading RiskHunter Datasets from data/ ...");
    try {
      const [
        checklistsRes, 
        docsRes, 
        commonCodesRes, 
        findingsRes, 
        changeHistoryRes, 
        qualityIssuesRes, 
        usersRes, 
        oeQualityRes
      ] = await Promise.all([
        fetch('data/oe_req_to_audit_checklist.json').then(r => {
          if (!r.ok) throw new Error("Checklist file (oe_req_to_audit_checklist.json) not found");
          return r.json();
        }),
        fetch('data/oe_req_to_doc_summary.json').then(r => {
          if (!r.ok) throw new Error("Document library file (oe_req_to_doc_summary.json) not found");
          return r.json();
        }),
        fetch('data/common_codes.json').then(r => {
          if (!r.ok) throw new Error("Common codes file (common_codes.json) not found");
          return r.json();
        }),
        fetch('data/cqms_customer_audit_db.json').then(r => {
          if (!r.ok) throw new Error("Audit findings file (cqms_customer_audit_db.json) not found");
          return r.json();
        }),
        fetch('data/cqms_4m_db.json').then(r => {
          if (!r.ok) throw new Error("4M change history file (cqms_4m_db.json) not found");
          return r.json();
        }),
        fetch('data/cqms_qualityissue_db.json').then(r => {
          if (!r.ok) throw new Error("Quality issues file (cqms_qualityissue_db.json) not found");
          return r.json();
        }),
        fetch('data/users.json').then(r => {
          if (!r.ok) throw new Error("Users file (users.json) not found");
          return r.json();
        }),
        fetch('data/internal_assessment_result.json').then(r => {
          if (!r.ok) throw new Error("Internal assessment result file (internal_assessment_result.json) not found");
          return r.json();
        })
      ]);

      // State에 데이터 할당
      this.state.auditChecklists = checklistsRes;
      this.state.documentLibrary = docsRes;
      this.state.commonCodes = commonCodesRes;
      this.state.auditFindings = findingsRes;
      this.state.changeHistory4m = changeHistoryRes;
      this.state.qualityIssues = qualityIssuesRes;
      this.state.oeQualityAssessmentDetails = oeQualityRes;

      // users 데이터 바인딩 및 매핑 (Profile Switcher 호환성 유지)
      if (usersRes && Array.isArray(usersRes)) {
        this.state.users = usersRes.map(u => ({
          id: u.id,
          username: u.username,
          password: u.password,
          name: u.name,
          role: u.role,
          roleName: u.role_name || u.role.toUpperCase(),
          badge: u.badge || u.role.toUpperCase(),
          color: u.avatar_color || '#ef4444',
          dept: u.department || '품질보증부'
        }));
        
        // 현재 유저도 새로 매핑된 목록에 맞춰 동기화
        const matchingUser = this.state.users.find(u => u.role === this.state.currentRole) || this.state.users[0];
        if (matchingUser) {
          this.state.currentUser = matchingUser;
          this.switchUser(matchingUser);
        }
      }

      console.log(`✅ Loaded ${this.state.auditChecklists.length} checklists, ${this.state.documentLibrary.length} documents, ${this.state.auditFindings.length} findings, ${this.state.changeHistory4m.length} 4M changes, ${this.state.qualityIssues.length} quality issues, and common master resources.`);
      
      // 로컬 필터 동적 생성 (Dashboard, Library)
      this.initLocalFilters();

      // 데이터 사전 가공 및 공정-4M 매핑 (Phase 2)
      this.preProcessData();

      // 라이브러리 탭 내 데이터 바인딩 및 이벤트 초기화
      this.initLibraryTab();

      // Phase 3 감사 일정 및 체크리스트 상태 초기 로딩
      this.loadAuditPlanningData();

      // Phase 4 공장별 지적사항 데이터 복구 및 영속 세팅
      this.loadPlantRiskActionData();

      // 대시보드 실시간 입체 렌더링 및 차트 마운트 (Phase 2)
      this.renderDashboard();
      
    } catch (err) {
      console.error("❌ Failed to load static resources:", err);
      this.showToast("정적 리소스를 로딩할 수 없습니다. 모의 데이터셋으로 대체 구동합니다.", "warning");
      
      // 스켈레톤 상태에 갇히지 않도록 즉시 모의 데이터셋 로드 및 렌더링 실행
      this.loadMockFallbacks();
      
      // 에러 바운더리 오버레이 표출 (Glassmorphism Error Overlay)
      const errorBoundary = document.getElementById('error-boundary');
      const errorDetailsText = document.getElementById('error-details-text');
      if (errorBoundary) {
        errorBoundary.classList.remove('hidden');
        if (errorDetailsText) {
          errorDetailsText.textContent = `상세 오류 내용: ${err.message || err}`;
        }
      }

      // 모의 데이터 강제 구동 버튼 이벤트 바인딩 (클릭 시 오버레이 닫고 렌더링 최종 보장)
      const btnMockFallback = document.getElementById('btn-run-mock-fallback');
      if (btnMockFallback) {
        btnMockFallback.onclick = (e) => {
          e.preventDefault();
          this.loadMockFallbacks();
          if (errorBoundary) {
            errorBoundary.classList.add('hidden');
          }
        };
      }
    }
  },

  // 📦 CORS 우회 및 로컬 파일 구동 보안용 프리미엄 인메모리 백업 엔진
  loadMockFallbacks() {
    console.log("⚠️ Activating premium local mock fallback data engine...");
    
    // 1. commonCodes
    this.state.commonCodes = {
      "plants": [
        { "code": "DP", "name": "대전공장", "location": "대한민국 대전", "desc": "국내 주요 생산 거점, 전 공정 및 특수 공정 포함", "is_active": true },
        { "code": "KP", "name": "금산공장", "location": "대한민국 금산", "desc": "초고성능 및 특수 타이어 주력 생산 거점", "is_active": true },
        { "code": "JP", "name": "가흥공장", "location": "중국 가흥", "desc": "중국 내수 및 아시아 수출용 제품 생산", "is_active": true },
        { "code": "HP", "name": "강소공장", "location": "중국 강소", "desc": "중국 시장 공략 및 주요 글로벌 수출용 친환경 타이어 거점", "is_active": true },
        { "code": "CP", "name": "중경공장", "location": "중국 중경", "desc": "중국 서부 지역 생산 거점", "is_active": true },
        { "code": "MP", "name": "헝가리공장", "location": "헝가리 라첼마스", "desc": "유럽 완성차(BMW, Audi 등) 납품용 핵심 기지", "is_active": true },
        { "code": "IP", "name": "인도네시아공장", "location": "인도네시아", "desc": "동남아시아 시장 및 글로벌 수출 기지", "is_active": true },
        { "code": "TP", "name": "테네시공장", "location": "미국 테네시 클락스빌", "desc": "북미 완성차 시장 대응 핵심 거점", "is_active": true },
        { "code": "ALL", "name": "전사 공통", "location": "-", "desc": "특정 공장에 종속되지 않고 전 공장에 일괄 적용되는 표준 자료", "is_active": true }
      ],
      "categories": [
        { "code": "Design", "name": "설계/개발", "english_name": "Design & Development", "desc": "도면 관리, 제품 설계 표준, 특수 특성 지정 및 타당성 검증" },
        { "code": "Test", "name": "시험/검증", "english_name": "Lab Test & Verification", "desc": "신뢰성 시험, 치수 측정, 재료 물리적/화학적 성능 시험" },
        { "code": "System", "name": "품질 시스템", "english_name": "Quality System", "desc": "문서 관리, 변경 관리, 사내 변경 승인(4M), 교육 및 자격 부여" },
        { "code": "Logistics", "name": "물류/외주창고", "english_name": "Logistics & Warehouse", "desc": "자사 완제품 창고, 원재료 창고 및 제3자 외주 물류 창고 관리" }
      ],
      "processes": [
        { "code": "Incoming", "name": "수입검사", "english_name": "Incoming Inspection", "desc": "원재료/원단 입고 검사, 성적서(COA) 검증 및 부적합품 격리" },
        { "code": "Mixing", "name": "배합", "english_name": "Mixing", "desc": "고무 가공 전 원재료 평량, 고무 컴파운드 배합 및 가공성 확인" },
        { "code": "Extrusion", "name": "압출", "english_name": "Extrusion", "desc": "트레드, 사이드월 등 반제품 가공, 치수 및 온도 실시간 프로파일링" },
        { "code": "Calendaring", "name": "캘린더링", "english_name": "Calendaring", "desc": "스틸/텍스타일 코드 고무 토핑, 인장강도 및 접착력 검사" },
        { "code": "Cutting", "name": "재단", "english_name": "Cutting", "desc": "반제품 지정 각도/폭 절단, 카카스 및 벨트 반제품 가공" },
        { "code": "Bead", "name": "비드", "english_name": "Bead", "desc": "와이어 권취, 에이프런 부착 및 비드 링 성형성 관리" },
        { "code": "Building", "name": "성형", "english_name": "Building", "desc": "드럼상 반제품 조립, 성형 중 Air 배출 유무 및 그린타이어 외관 관리" },
        { "code": "Curing", "name": "가류", "english_name": "Curing", "desc": "금형 가열/가압, 가류 온도/압력 프로파일 및 벤트핀 막힘 관리" },
        { "code": "Re-work", "name": "재작업", "english_name": "Re-work", "desc": "승인된 작업 표준서에 따른 재작업 프로세스 및 승인 경로 확보" },
        { "code": "Inspection", "name": "검사", "english_name": "Inspection", "desc": "외관 검사, 기하학적 치수 검사(Uniformity, Runout) 및 불합격품 격리" },
        { "code": "Shipping", "name": "물류출하", "english_name": "Shipping & Logistics", "desc": "제품 포장 상태, 바코드 스캔, 적재 정비 및 출하 시 수송 안전성 검사" }
      ]
    };

    // 2. users
    this.state.users = [
      { id: 1, username: "admin", password: "admin123", name: "박정호 수석", role: "admin", roleName: "Lead Auditor", badge: "ADMIN", color: "#ff3b30", dept: "품질보증그룹" },
      { id: 2, username: "manager", password: "manager123", name: "이현우 책임", role: "manager", roleName: "Quality Manager", badge: "MANAGER", color: "#00c8ff", dept: "품질기획팀" },
      { id: 3, username: "viewer", password: "viewer123", name: "최선미 연구원", role: "viewer", roleName: "Quality Viewer", badge: "VIEWER", color: "#4cd964", dept: "가류생산기술팀" }
    ];
    this.state.currentUser = this.state.users[0];

    // 3. auditChecklists
    this.state.auditChecklists = [
      { id: 1, source_type: "DOCUMENT", source_id: "LAH 893 010", plant_code: "ALL", customer: "Audi", doc_code: "LAH 893 010", doc_name: "Audi Q Lastenheft", section: "Clause 1.0 (General Specifications)", requirement: "제품의 치수 정밀도 및 설계 도면의 중요 공차 요건 검증 성적서", audit_question: "제품의 치수 정밀도 및 설계 도면의 중요 공차 요건이 정기적인 치수 측정 성적서를 통해 확인 및 관리되고 있는가?", evidence_compliance: "Audi 승인 최신 도면 원본, 부품 풀레이아웃(Full Layout) 정밀 치수 측정 성적서.", audit_method: "치수 측정 성적서 대조 검토", requirement_type: "검사", process_category: "Inspection", related_4m: "Method", priority: "Medium", plant_risk_score: 3.2, processed_at: "2026-05-28 15:19:56" },
      { id: 2, source_type: "DOCUMENT", source_id: "BMW GS 95001", plant_code: "ALL", customer: "BMW", doc_code: "BMW GS 95001", doc_name: "BMW GS 95001 Standard", section: "Clause 3.1 (Mixing Specifications)", requirement: "배합 컴파운드 점도 및 물성 검사 주기 준수", audit_question: "배합 컴파운드의 점도(Mooney Viscosity) 및 가류 특성이 주기적으로 모니터링되고 있으며 표준 범위를 이탈할 시 OCAP에 따라 처리되는가?", evidence_compliance: "무니 점도 측정 원본 기록지, 배합 조건 관리 일지 및 OCAP 대응서", audit_method: "배합 점도계 기록 및 OCAP 이력 확인", requirement_type: "공정", process_category: "Mixing", related_4m: "Method", priority: "High", plant_risk_score: 4.1, processed_at: "2026-05-28 15:19:56" },
      { id: 3, source_type: "DOCUMENT", source_id: "VDA 6.3", plant_code: "ALL", customer: "Hyundai", doc_code: "VDA 6.3", doc_name: "VDA 6.3 Process Audit", section: "P6.4.4 (Maintenance of Resources)", requirement: "가류 설비의 벤트 홀 및 금형 세정 주기 수립", audit_question: "가류 금형의 벤트 홀(Vent Hole) 막힘이나 벤트핀(Vent Pin) 오작동 방지를 위한 세정 주기 및 예방 보전 일지가 주기적으로 작성되고 현장에서 준수되고 있는가?", evidence_compliance: "금형 예방 세정 주기 기준서, 벤트홀 청소 체크리스트 및 가류 조작 표준", audit_method: "현장 가류 금형 벤트홀 상태 실사 및 보전 카드 검토", requirement_type: "설비", process_category: "Curing", related_4m: "Machine", priority: "High", plant_risk_score: 4.8, processed_at: "2026-05-28 15:19:56" }
    ];

    // 4. documentLibrary
    this.state.documentLibrary = [
      { id: 1, doc_code: "LAH 893 010", doc_name: "Audi LAH 893 010 Q Lastenheft", customer: "Audi", register_date: "2026-01-15", version: "Rev.12", file_size: "1.4MB", file_type: "PDF" },
      { id: 2, doc_code: "BMW GS 95001", doc_name: "BMW GS 95001 General Specifications", customer: "BMW", register_date: "2026-02-20", version: "Rev.05", file_size: "2.1MB", file_type: "PDF" },
      { id: 3, doc_code: "VDA 6.3", doc_name: "VDA 6.3 Quality Standard for Automotive Industry", customer: "Hyundai", register_date: "2025-11-10", version: "2023 Edition", file_size: "4.8MB", file_type: "PDF" }
    ];

    // 5. auditFindings (모의 5대 공정별 지적사항 및 28개 미래 예정 감사 일정 목록 통합)
    this.state.auditFindings = [
      // 기존 모의 지적사항 실적 데이터
      { TYPE: "Project", SUBJECT: "2026 BMW Spezial Audit", START_DT: "2026-05-10", END_DT: "2026-05-12", OWNER_ID: 1024, REG_DT: "2026-05-10", COMP_DT: "2026-05-14", STATUS: "Complete", PLANT: "DP", CAR_MAKER: "BMW", PROJECT: "G30", M_CODE: "1033501", PROCESS: "Curing", POINT_OUT_KO: "가류공정 벤트 홀(Vent Hole) 막힘 및 금형 청소 불량으로 타이어 기포 발생 우려.", ROOT_CAUSE_KO: "금형 세정 주기가 규정된 가류 횟수(500회)보다 지연된 650회 시점에 수행되어 이물질 누적.", COUNTER_MEASURE_KO: "금형 세정 주기를 최대 400회로 단축 개정하고, 벤트 핀 작동 확인용 전용 센서 설치 완료.", POINT_OUT_EN: "Risk of tire air bubbles due to blocked curing vent holes and poor mold cleaning.", ROOT_CAUSE_EN: "Mold cleaning was performed at 650 heats, delaying from the regulated 500 heats, causing residue accumulation.", COUNTER_MEASURE_EN: "Shortened mold cleaning interval to 400 heats, and installed a dedicated sensor for checking vent pin operations.", URL: "#" },
      { TYPE: "Project", SUBJECT: "2026 Audi Audit Finding", START_DT: "2026-04-18", END_DT: "2026-04-20", OWNER_ID: 1025, REG_DT: "2026-04-19", COMP_DT: null, STATUS: "On-going", PLANT: "DP", CAR_MAKER: "Audi", PROJECT: "B10", M_CODE: "1033502", PROCESS: "Building", POINT_OUT_KO: "성형 반제품(그린타이어)의 최대 보관 허용 시간인 24시간을 초과하여 장기 체화된 자재 방치.", ROOT_CAUSE_KO: "성형 공정 입구 자재 거치 공간의 FIFO(선입선출) 구조 결여 및 식별 바코드 스캔 누락.", COUNTER_MEASURE_KO: "경사형 중력 롤러 랙을 현장에 도입하여 물리적 FIFO를 강제하고 초과 시 경보등 울리도록 인프라 개편 중.", POINT_OUT_EN: "Excessive storage of green tires on-site exceeding the maximum allowable 24 hours.", ROOT_CAUSE_EN: "Lack of physical FIFO racks at the entrance of building process and omission of barcode scanning.", COUNTER_MEASURE_EN: "Introducing inclined gravity roller racks to enforce physical FIFO, with alarm system installation in progress.", URL: "#" },
      { TYPE: "Project", SUBJECT: "2026 Hyundai Regular Audit", START_DT: "2026-05-02", END_DT: "2026-05-03", OWNER_ID: 1026, REG_DT: "2026-05-02", COMP_DT: "2026-05-05", STATUS: "Complete", PLANT: "DP", CAR_MAKER: "Hyundai", PROJECT: "NX4", M_CODE: "1033503", PROCESS: "Mixing", POINT_OUT_KO: "정련 배합 평량(Weighing) 단계에서 오일 원재료 투입 오차(초과율 2.5%) 상한 이탈 방치.", ROOT_CAUSE_KO: "오일 정량 주입 밸브 패킹 노후화로 정지 신호 후 추가 리크 발생.", COUNTER_MEASURE_KO: "오일 투입 정량 제어 전자 밸브 교체 및 초과 시 배합 가동을 인터락(Interlock) 차단하도록 PLC 로직 개정.", POINT_OUT_EN: "Oil weighing deviation exceeded upper tolerance limit (2.5%) during mixing process.", ROOT_CAUSE_EN: "Valve packing aging in oil supply line caused leakage after stop signal.", COUNTER_MEASURE_EN: "Replaced oil electronic valve and modified PLC block to interlock and pause mixing operation if oil exceeds tolerance.", URL: "#" },

      // data/cqms_customer_audit_db.json 마스터 파일과 100% 동일한 28개 오픈 미래 예정 감사 데이터 (CORS 폴백 안전장치)
      { TYPE: "Project", SUBJECT: "2026-Audi 대전공장 신규 친환경 타이어 공급사 실사", START_DT: "2026-11-20", END_DT: "2026-11-22", OWNER_ID: 81706381, REG_DT: "2026-05-31", COMP_DT: "", STATUS: "Open", PLANT: "DP", CAR_MAKER: "Audi", PROJECT: "e-tron GT Facelift", M_CODE: "1035055", PROCESS: "Curing", POINT_OUT: "", ROOT_CAUSE_ANALYSIS: "", COUNTER_MEASURE: "", URL: "https://egqms.hankooktech.com/CUSTOMER_AUDIT_LIST/customerAuditReportPopup.html?cqmsCustomerAuditSeq=FUTURE_DP_AUDI" },
      { TYPE: "Project", SUBJECT: "2026-기아자동차 금산공장 EV9 신제품 특별 품질 수검", START_DT: "2026-12-05", END_DT: "2026-12-07", OWNER_ID: 81706381, REG_DT: "2026-05-31", COMP_DT: "", STATUS: "Open", PLANT: "KP", CAR_MAKER: "Kia", PROJECT: "EV9 GT-Line", M_CODE: "1035055", PROCESS: "Mixing", POINT_OUT: "", ROOT_CAUSE_ANALYSIS: "", COUNTER_MEASURE: "", URL: "https://egqms.hankooktech.com/CUSTOMER_AUDIT_LIST/customerAuditReportPopup.html?cqmsCustomerAuditSeq=FUTURE_KP_KIA" },
      { TYPE: "Project", SUBJECT: "2026-Xiaomi 강소공장 스마트 전기차 타이어 공급사 정기 평가", START_DT: "2026-11-05", END_DT: "2026-11-07", OWNER_ID: 81706381, REG_DT: "2026-05-31", COMP_DT: "", STATUS: "Open", PLANT: "HP", CAR_MAKER: "Xiaomi", PROJECT: "SU7 Ultra", M_CODE: "1035055", PROCESS: "Building", POINT_OUT: "", ROOT_CAUSE_ANALYSIS: "", COUNTER_MEASURE: "", URL: "https://egqms.hankooktech.com/CUSTOMER_AUDIT_LIST/customerAuditReportPopup.html?cqmsCustomerAuditSeq=FUTURE_HP_XIAOMI" },
      { TYPE: "Project", SUBJECT: "2026-Changan 중경공장 품질 보증 정기 점검", START_DT: "2026-12-15", END_DT: "2026-12-17", OWNER_ID: 81706381, REG_DT: "2026-05-31", COMP_DT: "", STATUS: "Open", PLANT: "CP", CAR_MAKER: "Changan", PROJECT: "Deepal S7", M_CODE: "1035055", PROCESS: "Extrusion", POINT_OUT: "", ROOT_CAUSE_ANALYSIS: "", COUNTER_MEASURE: "", URL: "https://egqms.hankooktech.com/CUSTOMER_AUDIT_LIST/customerAuditReportPopup.html?cqmsCustomerAuditSeq=FUTURE_CP_CHANGAN" },
      { TYPE: "Project", SUBJECT: "2026-현대자동차 인도네시아공장 아세안 시장용 타이어 특별 실사", START_DT: "2026-11-25", END_DT: "2026-11-27", OWNER_ID: 81706381, REG_DT: "2026-05-31", COMP_DT: "", STATUS: "Open", PLANT: "IP", CAR_MAKER: "Hyundai", PROJECT: "Creta EV", M_CODE: "1035055", PROCESS: "Inspection", POINT_OUT: "", ROOT_CAUSE_ANALYSIS: "", COUNTER_MEASURE: "", URL: "https://egqms.hankooktech.com/CUSTOMER_AUDIT_LIST/customerAuditReportPopup.html?cqmsCustomerAuditSeq=FUTURE_IP_HYUNDAI_ASEAN" },
      { TYPE: "Project", SUBJECT: "2026-Volvo 헝가리공장 신규 플랫폼용 친환경 타이어 ESG 및 품질 정합성 심사", START_DT: "2026-12-01", END_DT: "2026-12-03", OWNER_ID: 81706381, REG_DT: "2026-05-31", COMP_DT: "", STATUS: "Open", PLANT: "MP", CAR_MAKER: "Volvo", PROJECT: "EX90 EV", M_CODE: "1035055", PROCESS: "Logistics", POINT_OUT: "", ROOT_CAUSE_ANALYSIS: "", COUNTER_MEASURE: "", URL: "https://egqms.hankooktech.com/CUSTOMER_AUDIT_LIST/customerAuditReportPopup.html?cqmsCustomerAuditSeq=FUTURE_MP_VOLVO" },
      { TYPE: "Project", SUBJECT: "2027-Stellantis 헝가리공장 유럽 전략 차량 공급 품질 보증 수검", START_DT: "2027-01-15", END_DT: "2027-01-17", OWNER_ID: 81706381, REG_DT: "2026-05-31", COMP_DT: "", STATUS: "Open", PLANT: "MP", CAR_MAKER: "Stellantis", PROJECT: "Peugeot e-3008", M_CODE: "1035055", PROCESS: "Calendaring", POINT_OUT: "", ROOT_CAUSE_ANALYSIS: "", COUNTER_MEASURE: "", URL: "https://egqms.hankooktech.com/CUSTOMER_AUDIT_LIST/customerAuditReportPopup.html?cqmsCustomerAuditSeq=FUTURE_MP_STELLANTIS" },
      { TYPE: "Project", SUBJECT: "2026-Nissan 가흥공장 글로벌 최고 공급망 품질 실사", START_DT: "2026-11-18", END_DT: "2026-11-20", OWNER_ID: 81706381, REG_DT: "2026-05-31", COMP_DT: "", STATUS: "Open", PLANT: "JP", CAR_MAKER: "Nissan", PROJECT: "Ariya EV", M_CODE: "1035055", PROCESS: "Cutting", POINT_OUT: "", ROOT_CAUSE_ANALYSIS: "", COUNTER_MEASURE: "", URL: "https://egqms.hankooktech.com/CUSTOMER_AUDIT_LIST/customerAuditReportPopup.html?cqmsCustomerAuditSeq=FUTURE_JP_NISSAN" },
      { TYPE: "Project", SUBJECT: "2027-Toyota 가흥공장 프리미엄 완성차 공급 정기 보증 감사", START_DT: "2027-02-10", END_DT: "2027-02-12", OWNER_ID: 81706381, REG_DT: "2026-05-31", COMP_DT: "", STATUS: "Open", PLANT: "JP", CAR_MAKER: "Toyota", PROJECT: "bZ4X EV", M_CODE: "1035055", PROCESS: "Bead", POINT_OUT: "", ROOT_CAUSE_ANALYSIS: "", COUNTER_MEASURE: "", URL: "https://egqms.hankooktech.com/CUSTOMER_AUDIT_LIST/customerAuditReportPopup.html?cqmsCustomerAuditSeq=FUTURE_JP_TOYOTA" },
      { TYPE: "Project", SUBJECT: "2026-Tesla 테네시공장 기가팩토리 전용 타이어 스펙 특별 감사", START_DT: "2026-11-30", END_DT: "2026-12-02", OWNER_ID: 81706381, REG_DT: "2026-05-31", COMP_DT: "", STATUS: "Open", PLANT: "TP", CAR_MAKER: "Tesla", PROJECT: "Cybertruck Tri-Motor", M_CODE: "1035055", PROCESS: "Building", POINT_OUT: "", ROOT_CAUSE_ANALYSIS: "", COUNTER_MEASURE: "", URL: "https://egqms.hankooktech.com/CUSTOMER_AUDIT_LIST/customerAuditReportPopup.html?cqmsCustomerAuditSeq=FUTURE_TP_TESLA" },
      { TYPE: "Project", SUBJECT: "2027-현대자동차 테네시공장 메타플랜트 전용 타이어 양산 정합성 실사", START_DT: "2027-03-05", END_DT: "2027-03-07", OWNER_ID: 81706381, REG_DT: "2026-05-31", COMP_DT: "", STATUS: "Open", PLANT: "TP", CAR_MAKER: "Hyundai", PROJECT: "IONIQ 7 EV", M_CODE: "1035055", PROCESS: "Curing", POINT_OUT: "", ROOT_CAUSE_ANALYSIS: "", COUNTER_MEASURE: "", URL: "https://egqms.hankooktech.com/CUSTOMER_AUDIT_LIST/customerAuditReportPopup.html?cqmsCustomerAuditSeq=FUTURE_TP_HYUNDAI" },
      { TYPE: "Project", SUBJECT: "2026-BMW 대전공장 VDA 6.3 정기 수검", START_DT: "2026-06-15", END_DT: "2026-06-17", OWNER_ID: 81706381, REG_DT: "2026-05-30", COMP_DT: "", STATUS: "Open", PLANT: "DP", CAR_MAKER: "BMW", PROJECT: "G60 EV LCI", M_CODE: "1035055", PROCESS: "Mixing", POINT_OUT: "", ROOT_CAUSE_ANALYSIS: "", COUNTER_MEASURE: "", URL: "https://egqms.hankooktech.com/CUSTOMER_AUDIT_LIST/customerAuditReportPopup.html?cqmsCustomerAuditSeq=FUTURE_DP_BMW" },
      { TYPE: "Project", SUBJECT: "2026-현대자동차 금산공장 SQ 마크 인증 심사", START_DT: "2026-07-12", END_DT: "2026-07-14", OWNER_ID: 81706381, REG_DT: "2026-05-30", COMP_DT: "", STATUS: "Open", PLANT: "KP", CAR_MAKER: "Hyundai", PROJECT: "IONIQ 9 EV", M_CODE: "1035055", PROCESS: "Extrusion", POINT_OUT: "", ROOT_CAUSE_ANALYSIS: "", COUNTER_MEASURE: "", URL: "https://egqms.hankooktech.com/CUSTOMER_AUDIT_LIST/customerAuditReportPopup.html?cqmsCustomerAuditSeq=FUTURE_KP_HYUNDAI" },
      { TYPE: "Project", SUBJECT: "2026-Tesla 강소공장 신차 부품 정기 감사", START_DT: "2026-08-05", END_DT: "2026-08-07", OWNER_ID: 81706381, REG_DT: "2026-05-30", COMP_DT: "", STATUS: "Open", PLANT: "HP", CAR_MAKER: "Tesla", PROJECT: "Model Y LCI", M_CODE: "1035055", PROCESS: "Building", POINT_OUT: "", ROOT_CAUSE_ANALYSIS: "", COUNTER_MEASURE: "", URL: "https://egqms.hankooktech.com/CUSTOMER_AUDIT_LIST/customerAuditReportPopup.html?cqmsCustomerAuditSeq=FUTURE_HP_TESLA" },
      { TYPE: "Project", SUBJECT: "2026-BYD 중경공장 신공정 공급선 품질 심사", START_DT: "2026-09-20", END_DT: "2026-09-22", OWNER_ID: 81706381, REG_DT: "2026-05-30", COMP_DT: "", STATUS: "Open", PLANT: "CP", CAR_MAKER: "BYD", PROJECT: "Sea Lion EV", M_CODE: "1035055", PROCESS: "Curing", POINT_OUT: "", ROOT_CAUSE_ANALYSIS: "", COUNTER_MEASURE: "", URL: "https://egqms.hankooktech.com/CUSTOMER_AUDIT_LIST/customerAuditReportPopup.html?cqmsCustomerAuditSeq=FUTURE_CP_BYD" },
      { TYPE: "Project", SUBJECT: "2026-Toyota 인도네시아공장 현지 정기 감사", START_DT: "2026-10-18", END_DT: "2026-10-20", OWNER_ID: 81706381, REG_DT: "2026-05-30", COMP_DT: "", STATUS: "Open", PLANT: "IP", CAR_MAKER: "Toyota", PROJECT: "Innova Hybrid", M_CODE: "1035055", PROCESS: "Inspection", POINT_OUT: "", ROOT_CAUSE_ANALYSIS: "", COUNTER_MEASURE: "", URL: "https://egqms.hankooktech.com/CUSTOMER_AUDIT_LIST/customerAuditReportPopup.html?cqmsCustomerAuditSeq=FUTURE_IP_TOYOTA" },
      { TYPE: "Project", SUBJECT: "2026-Mercedes-Benz 헝가리공장 정기 프로세스 실사", START_DT: "2026-06-20", END_DT: "2026-06-22", OWNER_ID: 81706381, REG_DT: "2026-05-30", COMP_DT: "", STATUS: "Open", PLANT: "MP", CAR_MAKER: "Mercedes-Benz", PROJECT: "EQA Facelift", M_CODE: "1035055", PROCESS: "Calendaring", POINT_OUT: "", ROOT_CAUSE_ANALYSIS: "", COUNTER_MEASURE: "", URL: "https://egqms.hankooktech.com/CUSTOMER_AUDIT_LIST/customerAuditReportPopup.html?cqmsCustomerAuditSeq=FUTURE_MP_BENZ" },
      { TYPE: "Project", SUBJECT: "2026-Porsche 헝가리공장 프리미엄 공급사 심사", START_DT: "2026-07-25", END_DT: "2026-07-27", OWNER_ID: 81706381, REG_DT: "2026-05-30", COMP_DT: "", STATUS: "Open", PLANT: "MP", CAR_MAKER: "Porsche", PROJECT: "Macan EV", M_CODE: "1035055", PROCESS: "Bead", POINT_OUT: "", ROOT_CAUSE_ANALYSIS: "", COUNTER_MEASURE: "", URL: "https://egqms.hankooktech.com/CUSTOMER_AUDIT_LIST/customerAuditReportPopup.html?cqmsCustomerAuditSeq=FUTURE_MP_PORSCHE" },
      { TYPE: "Project", SUBJECT: "2026-Volkswagen 헝가리공장 IATF 16949 보완 심사", START_DT: "2026-08-30", END_DT: "2026-09-01", OWNER_ID: 81706381, REG_DT: "2026-05-30", COMP_DT: "", STATUS: "Open", PLANT: "MP", CAR_MAKER: "Volkswagen", PROJECT: "ID.7 EV", M_CODE: "1035055", PROCESS: "Re-work", POINT_OUT: "", ROOT_CAUSE_ANALYSIS: "", COUNTER_MEASURE: "", URL: "https://egqms.hankooktech.com/CUSTOMER_AUDIT_LIST/customerAuditReportPopup.html?cqmsCustomerAuditSeq=FUTURE_MP_VW" },
      { TYPE: "Project", SUBJECT: "2026-BMW 헝가리공장 차세대 EV 공급 정합성 감사", START_DT: "2026-10-10", END_DT: "2026-10-12", OWNER_ID: 81706381, REG_DT: "2026-05-30", COMP_DT: "", STATUS: "Open", PLANT: "MP", CAR_MAKER: "BMW", PROJECT: "Neue Klasse EV", M_CODE: "1035055", PROCESS: "Form", POINT_OUT: "", ROOT_CAUSE_ANALYSIS: "", COUNTER_MEASURE: "", URL: "https://egqms.hankooktech.com/CUSTOMER_AUDIT_LIST/customerAuditReportPopup.html?cqmsCustomerAuditSeq=FUTURE_MP_BMW_EV" },
      { TYPE: "Project", SUBJECT: "2026-Geely 가흥공장 고성능 타이어 공급 정기 실사", START_DT: "2026-06-10", END_DT: "2026-06-12", OWNER_ID: 81706381, REG_DT: "2026-05-30", COMP_DT: "", STATUS: "Open", PLANT: "JP", CAR_MAKER: "Geely", PROJECT: "Zeekr 001", M_CODE: "1035055", PROCESS: "Mixing", POINT_OUT: "", ROOT_CAUSE_ANALYSIS: "", COUNTER_MEASURE: "", URL: "https://egqms.hankooktech.com/CUSTOMER_AUDIT_LIST/customerAuditReportPopup.html?cqmsCustomerAuditSeq=FUTURE_JP_GEELY" },
      { TYPE: "Project", SUBJECT: "2026-NIO 가흥공장 차세대 공급망 품질 실사", START_DT: "2026-07-15", END_DT: "2026-07-17", OWNER_ID: 81706381, REG_DT: "2026-05-30", COMP_DT: "", STATUS: "Open", PLANT: "JP", CAR_MAKER: "NIO", PROJECT: "ET5 Touring", M_CODE: "1035055", PROCESS: "Cutting", POINT_OUT: "", ROOT_CAUSE_ANALYSIS: "", COUNTER_MEASURE: "", URL: "https://egqms.hankooktech.com/CUSTOMER_AUDIT_LIST/customerAuditReportPopup.html?cqmsCustomerAuditSeq=FUTURE_JP_NIO" },
      { TYPE: "Project", SUBJECT: "2026-Honda 가흥공장 부품 인증 평가 심사", START_DT: "2026-09-05", END_DT: "2026-09-07", OWNER_ID: 81706381, REG_DT: "2026-05-30", COMP_DT: "", STATUS: "Open", PLANT: "JP", CAR_MAKER: "Honda", PROJECT: "e:NP2 EV", M_CODE: "1035055", PROCESS: "Incoming", POINT_OUT: "", ROOT_CAUSE_ANALYSIS: "", COUNTER_MEASURE: "", URL: "https://egqms.hankooktech.com/CUSTOMER_AUDIT_LIST/customerAuditReportPopup.html?cqmsCustomerAuditSeq=FUTURE_JP_HONDA" },
      { TYPE: "Project", SUBJECT: "2026-SAIC Audi 가흥공장 품질 프로세스 검사", START_DT: "2026-11-12", END_DT: "2026-11-14", OWNER_ID: 81706381, REG_DT: "2026-05-30", COMP_DT: "", STATUS: "Open", PLANT: "JP", CAR_MAKER: "SAIC Audi", PROJECT: "Q6 e-tron", M_CODE: "1035055", PROCESS: "Inspection", POINT_OUT: "", ROOT_CAUSE_ANALYSIS: "", COUNTER_MEASURE: "", URL: "https://egqms.hankooktech.com/CUSTOMER_AUDIT_LIST/customerAuditReportPopup.html?cqmsCustomerAuditSeq=FUTURE_JP_SAIC_AUDI" },
      { TYPE: "Project", SUBJECT: "2026-GM 테네시공장 QSB+ 정기 공급선 감사", START_DT: "2026-06-05", END_DT: "2026-06-07", OWNER_ID: 81706381, REG_DT: "2026-05-30", COMP_DT: "", STATUS: "Open", PLANT: "TP", CAR_MAKER: "GM", PROJECT: "Lyriq EV", M_CODE: "1035055", PROCESS: "Form", POINT_OUT: "", ROOT_CAUSE_ANALYSIS: "", COUNTER_MEASURE: "", URL: "https://egqms.hankooktech.com/CUSTOMER_AUDIT_LIST/customerAuditReportPopup.html?cqmsCustomerAuditSeq=FUTURE_TP_GM" },
      { TYPE: "Project", SUBJECT: "2026-Ford 테네시공장 전동화 타이어 스펙 점검", START_DT: "2026-07-20", END_DT: "2026-07-22", OWNER_ID: 81706381, REG_DT: "2026-05-30", COMP_DT: "", STATUS: "Open", PLANT: "TP", CAR_MAKER: "Ford", PROJECT: "F-150 Lightning", M_CODE: "1035055", PROCESS: "Sealant", POINT_OUT: "", ROOT_CAUSE_ANALYSIS: "", COUNTER_MEASURE: "", URL: "https://egqms.hankooktech.com/CUSTOMER_AUDIT_LIST/customerAuditReportPopup.html?cqmsCustomerAuditSeq=FUTURE_TP_FORD" },
      { TYPE: "Project", SUBJECT: "2026-Rivian 테네시공장 공급사 특별 실사 심사", START_DT: "2026-08-15", END_DT: "2026-08-17", OWNER_ID: 81706381, REG_DT: "2026-05-30", COMP_DT: "", STATUS: "Open", PLANT: "TP", CAR_MAKER: "Rivian", PROJECT: "R1S EV", M_CODE: "1035055", PROCESS: "Building", POINT_OUT: "", ROOT_CAUSE_ANALYSIS: "", COUNTER_MEASURE: "", URL: "https://egqms.hankooktech.com/CUSTOMER_AUDIT_LIST/customerAuditReportPopup.html?cqmsCustomerAuditSeq=FUTURE_TP_RIVIAN" },
      { TYPE: "Project", SUBJECT: "2026-Stellantis 테네시공장 정기 프로세스 감사", START_DT: "2026-10-05", END_DT: "2026-10-07", OWNER_ID: 81706381, REG_DT: "2026-05-30", COMP_DT: "", STATUS: "Open", PLANT: "TP", CAR_MAKER: "Stellantis", PROJECT: "Ram 1500 EV", M_CODE: "1035055", PROCESS: "Curing", POINT_OUT: "", ROOT_CAUSE_ANALYSIS: "", COUNTER_MEASURE: "", URL: "https://egqms.hankooktech.com/CUSTOMER_AUDIT_LIST/customerAuditReportPopup.html?cqmsCustomerAuditSeq=FUTURE_TP_STELLANTIS" }
    ];

    // 6. changeHistory4m (4M 공정 변경점 이력)
    this.state.changeHistory4m = [
      { DOC_NO: "4M-2026-0001", PLANT: "DP", PURPOSE: "Improve Process", SUBJECT: "가류 공정 전자 스팀 밸브 교체 및 제어 로직 PLC 변경", STATUS: "Complete", PROGRESS: "Complete", REG_DATE: "2026-05-15", COMP_DATE: "2026-05-15", CHANGE_ITEM: "Machine", CHANGE_CONTENT: "스팀 제어 밸브 규격 최적화 및 PLC 응답 속도 보정", URL: "#" },
      { DOC_NO: "4M-2026-0002", PLANT: "DP", PURPOSE: "Cost Down", SUBJECT: "성형 공정 비드 부착 오퍼레이터 표준 작업(SOP) 개정 및 작업자 교육", STATUS: "Complete", PROGRESS: "Complete", REG_DATE: "2026-05-10", COMP_DATE: "2026-05-12", CHANGE_ITEM: "Man", CHANGE_CONTENT: "SOP-BLD-042 가이드 개정 및 신입 오퍼레이터 특별 재교육 훈련", URL: "#" }
    ];

    // 7. qualityIssues
    this.state.qualityIssues = [
      { DOC_NO: "QI-2026-0010", PLANT: "DP", STAGE: "Mass Production", OEM: "BMW", VEH: "5 Series", PJT: "G30", OCC_DATE: "2026-05-18", REG_DATE: "2026-05-18", RETURN_YN: "Y", STATUS: "On-going", LOCATION: "Field", TYPE_NAME: "Appearance", CAT_NAME: "Curing Bubble", D2_PROBLEM: "타이어 숄더부 가류 기포 발생으로 외관 불량 클레임 2건 접수.", URL: "#" }
    ];

    // 8. oeQualityAssessmentDetails (실제 10대 공정별 득점 및 벤치마킹 데이터)
    this.state.oeQualityAssessmentDetails = [];
    const mockProcesses = ['Incoming', 'Mixing', 'Extruding', 'Calendering', 'Cutting', 'Bead', 'Building', 'Curing', 'Inspection', 'Shipping'];
    const mockPlants = ['DP', 'KP', 'JP', 'HP', 'CP', 'MP', 'IP', 'TP'];
    
    // 글로벌 8대 공장 x 10대 공정에 대해 모의 득점 및 벤치마킹 가이드 자동 벌크 생성
    let detailId = 1;
    mockPlants.forEach(p => {
      mockProcesses.forEach(proc => {
        let scoreVal = 9; // Good
        if (p === 'DP') {
          if (proc === 'Curing') scoreVal = 5; // 취약 (최우선 준비)
          else if (proc === 'Building') scoreVal = 6; // 취약 (최우선 준비)
          else if (proc === 'Mixing') scoreVal = 10; // 우수
          else scoreVal = 8;
        } else if (p === 'MP') {
          scoreVal = 10; // 헝가리공장은 10점 만점 모범 사례로 다수 세팅
        } else {
          scoreVal = Math.floor(Math.random() * 3) + 8; // 8~10점대 분배
        }

        // Infra 카테고리 하나
        this.state.oeQualityAssessmentDetails.push({
          id: detailId++,
          plant: p,
          process: proc,
          section_no: 1,
          category: "Infra",
          item_no: 1,
          area: "Equipment & Tooling",
          check_item: `${proc} 공정의 품질 모니터링 인프라 구축도 검토`,
          guidance: `- ${proc} 공정의 실시간 센서 데이터 및 한계 관리(Specification Upper/Lower Limits) 모니터링 상태 점검`,
          findings: p === 'DP' && proc === 'Curing' ? "실시간 온도 기록 편차 제어 하드웨어 미흡 점검" : "표준 모니터링 실시간 연동 가동 중",
          score: scoreVal.toString()
        });

        // Process 카테고리 하나
        this.state.oeQualityAssessmentDetails.push({
          id: detailId++,
          plant: p,
          process: proc,
          section_no: 2,
          category: "Process",
          item_no: 2,
          area: "SOP & Compliance",
          check_item: `${proc} 공정 작업 표준(SOP) 및 선입선출(FIFO) 실천 수위`,
          guidance: `- 표준 작업 이행률 및 입구/출구 현장 체화 리스크 관리 상태 진단`,
          findings: p === 'DP' && proc === 'Building' ? "그린타이어 선입선출 물리적 가이드라인 실사 미흡 적발" : "현장 표준 대비 95% 이상 준수 이행 중",
          score: p === 'DP' && proc === 'Curing' ? "5" : (scoreVal - 1 > 3 ? scoreVal - 1 : 8).toString()
        });
      });
    });

    console.log(`✅ Loaded fallbacks: ${this.state.auditChecklists.length} checklists, ${this.state.documentLibrary.length} documents, ${this.state.auditFindings.length} findings.`);
    
    // 데이터 로딩 성공 후, 나머지 초기화 과정 재실행
    this.initLocalFilters();
    this.preProcessData();
    this.initLibraryTab();
    this.loadAuditPlanningData();
    this.loadPlantRiskActionData();
    
    // 대시보드 및 첫 화면 렌더링
    this.renderDashboard();
    
    // 토스트 알림 노출
    this.showToast("모의(Mock) 데이터셋이 정상 활성화되었습니다. 모든 메뉴를 100% 체험하실 수 있습니다.", "success");
  },

  // 🛠️ 대시보드 및 라이브러리 로컬 필터 바 동적 생성
  initLocalFilters() {
    console.log("🛠️ Initializing Local Filters for Dashboard and Library...");

    // 1. 공장 목록 생성 헬퍼 함수
    const populatePlants = (selectEl) => {
      if (!selectEl || !this.state.commonCodes || !this.state.commonCodes.plants) return;
      selectEl.innerHTML = '';
      
      const plants = this.state.commonCodes.plants.filter(p => p.is_active);
      const allPlant = plants.find(p => p.code === 'ALL');
      const regularPlants = plants.filter(p => p.code !== 'ALL');
      
      const allOption = document.createElement('option');
      allOption.value = 'ALL';
      allOption.textContent = allPlant ? `${allPlant.name} (ALL)` : '전체 공장 (ALL)';
      selectEl.appendChild(allOption);
      
      regularPlants.forEach(plant => {
        const opt = document.createElement('option');
        opt.value = plant.code;
        opt.textContent = `${plant.name} (${plant.code})`;
        selectEl.appendChild(opt);
      });
    };

    // 2. 완성차 고객사 생성 헬퍼 함수
    const populateCustomers = (selectEl) => {
      if (!selectEl) return;
      selectEl.innerHTML = '';
      
      const allOpt = document.createElement('option');
      allOpt.value = 'ALL';
      allOpt.textContent = '전체 고객사 (ALL)';
      selectEl.appendChild(allOpt);

      const customerSet = new Set();
      if (this.state.documentLibrary) {
        this.state.documentLibrary.forEach(doc => {
          if (doc.customer && doc.customer.trim()) {
            customerSet.add(doc.customer.trim());
          }
        });
      }
      if (this.state.auditChecklists) {
        this.state.auditChecklists.forEach(item => {
          if (item.customer && item.customer.trim()) {
            customerSet.add(item.customer.trim());
          }
        });
      }

      const sortedCustomers = Array.from(customerSet).sort();
      sortedCustomers.forEach(cust => {
        const opt = document.createElement('option');
        opt.value = cust;
        opt.textContent = cust;
        selectEl.appendChild(opt);
      });
    };

    // 3. 대상 제조 공정 생성 헬퍼 함수
    const populateProcesses = (selectEl) => {
      if (!selectEl || !this.state.commonCodes || !this.state.commonCodes.processes) return;
      selectEl.innerHTML = '';

      const allOpt = document.createElement('option');
      allOpt.value = 'ALL';
      allOpt.textContent = '전체 공정 (ALL)';
      selectEl.appendChild(allOpt);

      const mfgProcs = this.state.commonCodes.processes || [];
      mfgProcs.forEach(proc => {
        const opt = document.createElement('option');
        opt.value = proc.code;
        opt.textContent = `${proc.name} (${proc.code})`;
        selectEl.appendChild(opt);
      });
    };

    // 라이브러리 필터 엘리먼트 바인딩 및 생성
    const libPlantSelect = document.getElementById('library-filter-plant');
    const libCustomerSelect = document.getElementById('library-filter-customer');
    populatePlants(libPlantSelect);
    populateCustomers(libCustomerSelect);

    // 초기 필터 선택값 반영 (상태값 연동)
    if (libPlantSelect) libPlantSelect.value = this.state.librarySelectedPlant || 'ALL';
    if (libCustomerSelect) libCustomerSelect.value = this.state.librarySelectedCustomer || 'ALL';
  },

  // 👥 역할 계정 전환 팝오버 리스트 렌더링
  renderProfileSwitcher() {
    const popoverList = document.getElementById('popover-user-list');
    if (!popoverList) return;

    popoverList.innerHTML = '';
    this.state.users.forEach(user => {
      const item = document.createElement('div');
      item.className = `popover-item ${user.role === this.state.currentRole ? 'active' : ''}`;
      item.innerHTML = `
        <div class="popover-avatar" style="background-color: ${user.color};">
          <i data-lucide="user" style="width: 14px; height: 14px; color: white;"></i>
        </div>
        <div class="popover-info">
          <div class="popover-name">${user.name}</div>
          <div class="popover-dept">${user.dept} • ${user.role.toUpperCase()}</div>
        </div>
        <span class="popover-badge" style="background-color: ${user.color}15; color: ${user.color}; border: 1px solid ${user.color}30;">
          ${user.badge}
        </span>
      `;
      
      // 클릭 시 해당 유저로 실시간 세션 가상 전환
      item.addEventListener('click', () => {
        this.switchUser(user);
        document.getElementById('profile-popover').classList.add('hidden');
      });

      popoverList.appendChild(item);
    });

    if (typeof lucide !== 'undefined') {
      lucide.createIcons({ attrs: { class: 'popover-icon' } });
    }
  },

  // 🔄 실제 사용자 역할 동적 스위칭 (Simulate Session)
  switchUser(user) {
    this.state.currentUser = user;
    this.state.currentRole = user.role;
    
    console.log(`🔄 Session Simulating: ${user.name} (${user.role.toUpperCase()})`);
    
    // 1. 사이드바 메인 프로필 UI 바인딩 업데이트
    const avatarNode = document.getElementById('profile-avatar-node');
    const nameNode = document.getElementById('profile-name-node');
    const roleNode = document.getElementById('profile-role-node');
    const badgeNode = document.getElementById('profile-badge-node');
    
    if (avatarNode) avatarNode.style.backgroundColor = user.color;
    if (nameNode) nameNode.textContent = user.name;
    if (roleNode) roleNode.textContent = user.role === 'admin' ? 'Lead Auditor' : (user.role === 'manager' ? 'Quality Manager' : 'Guest Viewer');
    if (badgeNode) {
      badgeNode.textContent = user.badge;
      badgeNode.style.backgroundColor = `${user.color}15`;
      badgeNode.style.color = user.color;
      badgeNode.style.borderColor = `${user.color}30`;
    }
    
    // 2. 팝오버 활성 상태 동기화 및 권한 UI 필터
    this.renderProfileSwitcher();
    this.applyPermissionToUI();
    
    // 3. 토스트 알림 송출
    this.showToast(`${user.name} (${user.badge}) 계정 역할로 전환되었습니다.`);
  },

  // 🔐 3단계 역할별 메뉴 접근 제어 가드 (RBAC Guard)
  applyPermissionToUI() {
    const adminSettingsBtn = document.getElementById('nav-item-admin-settings');
    if (!adminSettingsBtn) return;
    
    if (this.state.currentRole === 'admin') {
      adminSettingsBtn.classList.remove('hidden');
    } else {
      adminSettingsBtn.classList.add('hidden');
      // 만약 권한이 없는 사용자가 Admin Settings 탭에 머물러 있는 상태라면 대시보드로 튕김
      if (this.state.currentTab === 'admin-settings') {
        this.switchTab('dashboard');
        this.showToast('접근 권한이 제한되어 Dashboard로 이동하였습니다.', 'warning');
      }
    }
  },

  // 🗂️ 전사 공통 탭 스위칭 엔진 (Single Page Tab Engine)
  switchTab(tabId) {
    console.log(`📂 Switching main active tab: ${tabId}`);
    
    // 1. 예외 가드: 비로그인 상태이거나 비정상 접근 시 차단
    if (tabId === 'admin-settings' && this.state.currentRole !== 'admin') {
      this.showToast('Lead Auditor (ADMIN) 권한 전용 메뉴입니다.', 'warning');
      this.switchTab('dashboard');
      return;
    }

    this.state.currentTab = tabId;

    // 2. 사이드바 Nav 버튼 활성 상태 동기화
    document.querySelectorAll('.sidebar-nav-item').forEach(btn => {
      if (btn.getAttribute('data-tab') === tabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // 3. 탭 콘텐츠 영역 Show/Hide 토글
    document.querySelectorAll('.tab-pane').forEach(pane => {
      if (pane.id === `tab-${tabId}`) {
        pane.classList.add('active');
      } else {
        pane.classList.remove('active');
      }
    });

    // 4. 페이지 헤더 타이틀 및 설명 싱크
    this.updateHeader(tabId);

    // 대시보드 로드 시 실시간 데이터 입체 드로잉 (Phase 2)
    if (tabId === 'dashboard') {
      this.renderDashboard();
    } else if (tabId === 'audit-planning') {
      this.initAuditPlanning();
    } else if (tabId === 'plant-risk-action') {
      this.initPlantRiskAction();
    } else if (tabId === 'ai-action-advisor') {
      this.initAIActionAdvisor();
    } else if (tabId === 'library') {
      this.initLibraryTab();
    } else if (tabId === 'admin-settings') {
      this.initAdminSettings();
    }

    // 5. 🤖 플로팅 AI 감사 비서 웰컴 메시지 실시간 갱신 (열려 있을 때)
    const assistantDrawer = document.getElementById('assistant-chat-drawer');
    const msgContainer = document.getElementById('assistant-chat-messages');
    if (assistantDrawer && !assistantDrawer.classList.contains('hidden') && msgContainer) {
      let welcomeMsg = '';
      if (tabId === 'library') {
        welcomeMsg = `안녕하세요! 현재 <strong>통합 라이브러리(Library)</strong>를 탐색 중이시군요. 특정 완성차 규격서 조항의 한글 번역 가이드나, 가류(Curing) 공정의 고위험 핵심 체크리스트 요약이 필요하시면 언제든 물어보세요.`;
      } else {
        welcomeMsg = `안녕하세요! RiskHunter 수석 품질 감사 AI 비서입니다. 공장 감사 준비 일정 기획, OEM 규격 충족 조치, 혹은 VDA 6.3/8D 기반 대응 전략에 대해 무엇이든 질문하십시오.`;
      }
      const welcomeBubble = msgContainer.querySelector('.message-bot .message-content');
      if (welcomeBubble) {
        welcomeBubble.innerHTML = welcomeMsg;
      }
    }
  },

  // 📝 탭별 헤더 텍스트 실시간 업데이트
  updateHeader(tabId) {
    const titleNode = document.getElementById('page-title');
    const subtitleNode = document.getElementById('page-subtitle');
    if (!titleNode || !subtitleNode) return;

    const headerTexts = {
      'dashboard': {
        title: 'Dashboard',
        sub: '공장별 실시간 품질 리스크 현황 및 예정 감사 일정 모니터링'
      },
      'audit-planning': { // ID 매핑
        title: 'Audit Planning',
        sub: '신규 감사 수검 등록 및 단계별 준비 체크리스트 일정 관리'
      },
      'plant-risk-action': {
        title: 'Plant Risk & Action',
        sub: '공장별 감사 이력 조회, 품질 실패 리스크 입체 매핑 및 지적사항 수검 관리'
      },
      'ai-action-advisor': {
        title: 'AI Action Advisor',
        sub: '부적합 지적 조항에 특화된 실시간 8D 시정조치 및 SOP 표준 수정안 자동 가이드 도출'
      },
      'library': {
        title: 'Library',
        sub: '전사 공통 마스터 체크리스트, OEM 기술 사양 및 요구규격 연계 매핑 데이터 보관소'
      },
      'admin-settings': {
        title: 'Admin Settings',
        sub: 'Lead Auditor 최고 관리자 설정 (사용자 세션 시뮬레이션, 권한 통제 매트릭스, 감사 이력 로그)'
      }
    };

    const text = headerTexts[tabId] || { title: 'RiskHunter', sub: 'Audit Control Console' };
    titleNode.textContent = text.title;
    subtitleNode.textContent = text.sub;
  },

  // 📁 서브 탭 스위칭 엔진 (Sub-Tabs Toggle)
  switchSubTab(subTabId, containerSelector, paneSelectorClass) {
    console.log(`📁 Switching sub-tab inside container: ${subTabId}`);
    
    // 1. 서브 탭 버튼 헤더 동기화
    const container = document.querySelector(containerSelector);
    if (!container) return;

    container.querySelectorAll('.sub-tab-btn').forEach(btn => {
      if (btn.getAttribute('data-sub-tab') === subTabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // 2. 서브 탭 본문 페인 Show/Hide 토글
    document.querySelectorAll(paneSelectorClass).forEach(pane => {
      if (pane.id === `sub-tab-content-${subTabId}`) {
        pane.classList.add('active-sub-pane');
      } else {
        pane.classList.remove('active-sub-pane');
      }
    });

    // 특정 탭으로 이동 시 재렌더링 및 라이브러리 상단 필터바 가시성 제어
    if (subTabId === 'master-checklist') {
      const filterBar = document.getElementById('library-filter-bar');
      if (filterBar) filterBar.style.display = 'flex';
      this.renderChecklistTable();
      this.renderFindingsTable();
    } else if (subTabId === 'customer-reqs') {
      const filterBar = document.getElementById('library-filter-bar');
      if (filterBar) filterBar.style.display = 'none'; // 공장 선택 필터가 필요 없으므로 숨김!
      this.renderDocumentLibrary();
    } else if (subTabId === 'req-mapping') {
      this.renderRequirementMapping();
    } else if (subTabId === 'user-management') {
      this.renderUserManagement();
    } else if (subTabId === 'role-permission') {
      this.renderRolePermissionMatrix();
    } else if (subTabId === 'audit-log') {
      this.renderAuditLogTimeline();
    } else if (subTabId === 'sql-explorer') {
      this.initSQLExplorer();
    }
  },

  // ==========================================================================
  // 📅 2. Audit Planning (사전 일정 및 준비 항목 관리 핵심 구현 - Phase 3)
  // ==========================================================================

  // 1) 로컬 저장소(localStorage) 영속성 데이터 로드 및 초기 세팅
  loadAuditPlanningData() {
    console.log("📅 Initializing Audit Planning local data...");
    
    // cqms_customer_audit_db.json (this.state.auditFindings) 로드된 실데이터로부터 고유 감사 일정 목록 동적 생성
    const defaultAudits = [];
    if (this.state.auditFindings && Array.isArray(this.state.auditFindings) && this.state.auditFindings.length > 0) {
      // START_DT 기준 최신순 정렬 (유효성 검사를 통해 Invalid Date 정렬 붕괴 방지)
      const sortedFindings = [...this.state.auditFindings].sort((a, b) => {
        const tA = a.START_DT ? new Date(a.START_DT).getTime() : 0;
        const tB = b.START_DT ? new Date(b.START_DT).getTime() : 0;
        const vA = isNaN(tA) ? 0 : tA;
        const vB = isNaN(tB) ? 0 : tB;
        return vB - vA;
      });
      
      // STATUS가 'Open' 상태인 실시간 예정 미래 감사 데이터만 정밀 추출
      const openFindings = sortedFindings.filter(f => f.STATUS === 'Open');
      
      const uniqueSubjects = {};
      openFindings.forEach(f => {
        if (f.SUBJECT && !uniqueSubjects[f.SUBJECT]) {
          uniqueSubjects[f.SUBJECT] = f;
        }
      });
      
      let index = 1;
      // slice 제약을 과감히 확장하여 시딩된 모든 미래 예정 일정이 누락 없이 드롭다운에 정렬 바인딩되도록 유도 (최대 50개)
      const subjectsArray = Object.keys(uniqueSubjects).slice(0, 50); 
      subjectsArray.forEach(subject => {
        const item = uniqueSubjects[subject];
        defaultAudits.push({
          id: `audit_db_${index}`, // 중복 ID 방지를 위해 고유 프리픽스 audit_db_ 적용
          title: item.SUBJECT,
          plantCode: item.PLANT || "DP",
          customer: item.CAR_MAKER || "BMW",
          date: item.START_DT || "2026-06-15",
          leadAuditor: index % 2 === 0 ? "이현우 책임" : "박정호 수석",
          project: item.PROJECT || "전사 신규 품질 실사",
          type: item.TYPE || "Project",
          typeName: item.TYPE === "Project" ? "VDA 6.3 Process Audit" : "IATF 16949 Standard Audit",
          desc: `${item.SUBJECT} 수검 및 사전 대응 체크리스트 준비`,
          STATUS: item.STATUS || "Open" // 대시보드 및 타 기능 연동을 위해 STATUS 명시 주입
        });
        index++;
      });
    }

    // 예외 Fallback 보장 (데이터가 유실되거나 비었을 때)
    if (defaultAudits.length === 0) {
      defaultAudits.push(
        {
          id: "audit_db_1",
          title: "BMW 대전공장 VDA 6.3 정기 수검",
          plantCode: "DP",
          customer: "BMW",
          date: "2026-06-15",
          leadAuditor: "박정호 수석",
          project: "G60 EV LCI",
          type: "Project",
          typeName: "VDA 6.3 Process Audit",
          desc: "VDA 6.3 정기 품질 프로세스 심사 - 전 공정 (배합, 압출, 성형, 가류)"
        },
        {
          id: "audit_db_2",
          title: "Audi 헝가리공장 신차 실사 (IATF 16949)",
          plantCode: "MP",
          customer: "Audi",
          date: "2026-06-25",
          leadAuditor: "이현우 책임",
          project: "PPE Platform SUV",
          type: "System",
          typeName: "IATF 16949 Standard Audit",
          desc: "신규 완성차 장착용 고성능 타이어 공급선 특수공정 심사"
        }
      );
    }

    // audits 로딩 (로컬스토리지 캐시 잠김 문제를 해소하는 스마트 병합 탑재)
    const storedAudits = localStorage.getItem('cqms_customer_audit_db');
    if (storedAudits) {
      try {
        const parsedStored = JSON.parse(storedAudits);
        
        // 캐시 데이터의 하위 호환성 및 정규화 보정 적용
        parsedStored.forEach(sa => {
          if (!sa.STATUS) sa.STATUS = "Open"; // 과거 캐시 데이터 정합성 보정 (STATUS 주입)
          if (sa.type === "VDA 6.3 Process Audit") {
            sa.type = "Project";
            if (!sa.typeName) sa.typeName = "VDA 6.3 Process Audit";
          } else if (sa.type === "IATF 16949 Standard Audit") {
            sa.type = "System";
            if (!sa.typeName) sa.typeName = "IATF 16949 Standard Audit";
          }
          if (sa.type === "Project" && !sa.typeName) {
            sa.typeName = "VDA 6.3 Process Audit";
          } else if (sa.type === "System" && !sa.typeName) {
            sa.typeName = "IATF 16949 Standard Audit";
          }
        });

        // 로컬 캐시 데이터 중 과거 하드코딩 mock audits(BMW 대전공장, Audi 헝가리공장)는 과감히 차단하여
        // 최신 data/cqms_customer_audit_db.json 데이터가 캐시에 가려 누락되는 현상을 완벽히 해소
        const manualAdded = parsedStored.filter(sa => {
          const isMock = sa.title === "BMW 대전공장 VDA 6.3 정기 수검" || 
                         sa.title === "Audi 헝가리공장 신차 실사 (IATF 16949)" ||
                         sa.id === "audit_1" || 
                         sa.id === "audit_2";
          return !isMock && !defaultAudits.some(da => da.title === sa.title);
        });
        this.state.audits = [...defaultAudits, ...manualAdded];
        localStorage.setItem('cqms_customer_audit_db', JSON.stringify(this.state.audits));
      } catch (e) {
        console.error("Failed to parse audits from localStorage", e);
        this.state.audits = defaultAudits;
      }
    } else {
      this.state.audits = defaultAudits;
      localStorage.setItem('cqms_customer_audit_db', JSON.stringify(defaultAudits));
    }
    // 활성 감사 일정을 가까운 시일(오름차순) 순으로 정렬
    this.state.audits.sort((a, b) => a.date.localeCompare(b.date));

    // selectedAuditId 로딩 (캐시 잠김 해소를 위해 과거 mock ID인 audit_1, audit_2 등은 최신 고유 ID로 스마트 마이그레이션 적용)
    const storedSelectedId = localStorage.getItem('riskhunter_selected_audit_id');
    const isMockId = storedSelectedId === "audit_1" || storedSelectedId === "audit_2" || !storedSelectedId;
    if (!isMockId && this.state.audits.some(a => a.id === storedSelectedId)) {
      this.state.selectedAuditId = storedSelectedId;
    } else {
      this.state.selectedAuditId = this.state.audits[0]?.id || null;
      if (this.state.selectedAuditId) {
        localStorage.setItem('riskhunter_selected_audit_id', this.state.selectedAuditId);
      }
    }

    // checklist states 로딩
    const storedStates = localStorage.getItem('riskhunter_checklist_states');
    if (storedStates) {
      try {
        this.state.planningChecklistStates = JSON.parse(storedStates);
      } catch (e) {
        console.error("Failed to parse checklist states", e);
        this.state.planningChecklistStates = {};
      }
    } else {
      // 초기 진행 상태를 동적으로 매핑 생성 (목업 하드코딩 제거)
      this.state.planningChecklistStates = {};
      this.state.audits.forEach((audit, i) => {
        this.state.planningChecklistStates[audit.id] = {
          "task_1": i % 3 === 0 ? "completed" : "in_progress",
          "task_2": i % 3 === 0 ? "completed" : "pending",
          "task_3": i % 2 === 0 ? "in_progress" : "pending",
          "task_4": "pending",
          "task_5": "pending"
        };
      });
      localStorage.setItem('riskhunter_checklist_states', JSON.stringify(this.state.planningChecklistStates));
    }

    // Checklist Manager 체크 상태 복구
    const storedChecklistManagerStates = localStorage.getItem('riskhunter_checklist_manager_states');
    if (storedChecklistManagerStates) {
      try {
        this.state.checklistManagerStates = JSON.parse(storedChecklistManagerStates);
      } catch (e) {
        console.error("Failed to parse checklist manager states", e);
        this.state.checklistManagerStates = {};
      }
    } else {
      this.state.checklistManagerStates = {};
    }

    // planningTaskAssignments 로딩
    const storedAssignments = localStorage.getItem('riskhunter_planning_task_assignments');
    if (storedAssignments) {
      try {
        this.state.planningTaskAssignments = JSON.parse(storedAssignments);
      } catch (e) {
        console.error("Failed to parse planning task assignments", e);
        this.state.planningTaskAssignments = {};
      }
    } else {
      this.state.planningTaskAssignments = {};
    }
  },

  // 2) Audit Planning 탭 구동 시 초기화 및 리스너 등록
  initAuditPlanning() {
    console.log("📅 Initializing Audit Planning Tab...");
    
    // 대상 공장 필터 목록 동적 로드
    const filterPlant = document.getElementById('planning-filter-plant');
    if (filterPlant && this.state.commonCodes?.plants) {
      filterPlant.innerHTML = '';
      const allOpt = document.createElement('option');
      allOpt.value = 'ALL';
      allOpt.textContent = '전체 공장 (ALL)';
      filterPlant.appendChild(allOpt);
      
      const activePlants = this.state.commonCodes.plants.filter(p => p.is_active && p.code !== 'ALL');
      activePlants.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.code;
        opt.textContent = `${p.name} (${p.code})`;
        filterPlant.appendChild(opt);
      });
    }

    // 완성차 고객사 필터 목록 동적 로드
    const filterCustomer = document.getElementById('planning-filter-customer');
    if (filterCustomer) {
      filterCustomer.innerHTML = '';
      const allOpt = document.createElement('option');
      allOpt.value = 'ALL';
      allOpt.textContent = '전체 고객사 (ALL)';
      filterCustomer.appendChild(allOpt);
      
      const customerSet = new Set();
      this.state.audits.forEach(a => {
        if (a.customer) customerSet.add(a.customer.trim());
      });
      if (this.state.documentLibrary) {
        this.state.documentLibrary.forEach(doc => {
          if (doc.customer && doc.customer.trim()) customerSet.add(doc.customer.trim());
        });
      }
      Array.from(customerSet).sort().forEach(cust => {
        const opt = document.createElement('option');
        opt.value = cust;
        opt.textContent = cust;
        filterCustomer.appendChild(opt);
      });
    }

    // 실시간 필터링 엔진 바인딩
    const applyPlanningFilters = () => {
      const selectedPlant = document.getElementById('planning-filter-plant')?.value || 'ALL';
      const selectedCustomer = document.getElementById('planning-filter-customer')?.value || 'ALL';
      const selectedType = document.getElementById('planning-filter-audit-type')?.value || 'ALL';
      
      const filteredAudits = this.state.audits.filter(audit => {
        const matchPlant = selectedPlant === 'ALL' || audit.plantCode === selectedPlant;
        const matchCustomer = selectedCustomer === 'ALL' || audit.customer === selectedCustomer;
        const matchType = selectedType === 'ALL' || (audit.type || 'Project') === selectedType;
        return matchPlant && matchCustomer && matchType;
      });
      
      const selectNode = document.getElementById('planning-audit-select');
      if (selectNode) {
        selectNode.innerHTML = '';
        if (filteredAudits.length === 0) {
          const opt = document.createElement('option');
          opt.value = '';
          opt.textContent = '조건에 맞는 일정이 없습니다.';
          selectNode.appendChild(opt);
          this.state.selectedAuditId = null;
        } else {
          filteredAudits.forEach(audit => {
            const opt = document.createElement('option');
            opt.value = audit.id;
            opt.textContent = `${audit.title} (${audit.date})`;
            if (audit.id === this.state.selectedAuditId) {
              opt.selected = true;
            }
            selectNode.appendChild(opt);
          });
          
          if (!filteredAudits.some(a => a.id === this.state.selectedAuditId)) {
            this.state.selectedAuditId = filteredAudits[0].id;
            localStorage.setItem('riskhunter_selected_audit_id', filteredAudits[0].id);
          }
        }
      }
      
      this.renderPlanningScreen();
      this.showToast("선택된 필터 조건으로 감사 일정이 실시간 필터링되었습니다.", "success");
    };

    // 실시간 onchange 이벤트 등록
    const selectPlant = document.getElementById('planning-filter-plant');
    const selectCustomer = document.getElementById('planning-filter-customer');
    const selectType = document.getElementById('planning-filter-audit-type');
    
    if (selectPlant) selectPlant.onchange = applyPlanningFilters;
    if (selectCustomer) selectCustomer.onchange = applyPlanningFilters;
    if (selectType) selectType.onchange = applyPlanningFilters;

    // 드롭다운 셀렉터 세팅
    const selectNode = document.getElementById('planning-audit-select');
    if (selectNode) {
      selectNode.innerHTML = '';
      this.state.audits.forEach(audit => {
        const opt = document.createElement('option');
        opt.value = audit.id;
        opt.textContent = `${audit.title} (${audit.date})`;
        if (audit.id === this.state.selectedAuditId) {
          opt.selected = true;
        }
        selectNode.appendChild(opt);
      });

      // 셀렉터 변경 이벤트 (onchange 재바인딩으로 중복 방지)
      selectNode.onchange = (e) => {
        this.state.selectedAuditId = e.target.value;
        localStorage.setItem('riskhunter_selected_audit_id', e.target.value);
        
        // 활성 감사 일정이 변경되었을 때, 달력 연/월을 해당 감사일 기준으로 자동 전환
        const audit = this.state.audits.find(a => a.id === e.target.value);
        if (audit) {
          const aDate = new Date(audit.date);
          this.state.calendarYear = aDate.getFullYear();
          this.state.calendarMonth = aDate.getMonth();
        }

        this.renderPlanningScreen();
        this.showToast("활성 감사 일정이 전환되었습니다.");
      };
    }

    // 모달 관련 버튼 바인딩
    const btnOpenModal = document.getElementById('btn-open-audit-modal');
    if (btnOpenModal) {
      btnOpenModal.onclick = () => this.openScheduleModal();
    }

    const btnCloseModal = document.getElementById('btn-close-audit-modal');
    if (btnCloseModal) {
      btnCloseModal.onclick = () => {
        document.getElementById('audit-registration-modal').classList.add('hidden');
      };
    }

    const btnCancelModal = document.getElementById('btn-cancel-audit-modal');
    if (btnCancelModal) {
      btnCancelModal.onclick = () => {
        document.getElementById('audit-registration-modal').classList.add('hidden');
      };
    }

    const btnSaveModal = document.getElementById('btn-save-audit-modal');
    if (btnSaveModal) {
      btnSaveModal.onclick = () => this.saveSchedule();
    }

    // 3개 서브탭 버튼 (.sub-tab-btn) 바인딩
    const subTabButtons = document.querySelectorAll('#tab-audit-planning .sub-tab-btn');
    subTabButtons.forEach(btn => {
      btn.onclick = (e) => {
        const targetTab = btn.getAttribute('data-subtab');
        this.state.activePlanningSubtab = targetTab;
        
        // 버튼 active 클래스 토글
        subTabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Pane 보이기/숨기기
        const panes = document.querySelectorAll('#tab-audit-planning .sub-tab-pane');
        panes.forEach(pane => {
          pane.style.display = 'none';
          pane.classList.remove('active-sub-pane');
        });

        const targetPane = document.getElementById(`subtab-${targetTab}`);
        if (targetPane) {
          targetPane.style.display = 'block';
          targetPane.classList.add('active-sub-pane');
        }

        this.renderPlanningScreen();
      };
    });

    // 달력 제어 버튼 (btn-calendar-prev, btn-calendar-next, btn-calendar-today) 바인딩
    const btnCalPrev = document.getElementById('btn-calendar-prev');
    if (btnCalPrev) {
      btnCalPrev.onclick = () => {
        if (this.state.calendarMonth === 0) {
          this.state.calendarMonth = 11;
          this.state.calendarYear -= 1;
        } else {
          this.state.calendarMonth -= 1;
        }
        this.renderCalendarTab();
      };
    }

    const btnCalNext = document.getElementById('btn-calendar-next');
    if (btnCalNext) {
      btnCalNext.onclick = () => {
        if (this.state.calendarMonth === 11) {
          this.state.calendarMonth = 0;
          this.state.calendarYear += 1;
        } else {
          this.state.calendarMonth += 1;
        }
        this.renderCalendarTab();
      };
    }

    const btnCalToday = document.getElementById('btn-calendar-today');
    if (btnCalToday) {
      btnCalToday.onclick = () => {
        const today = new Date("2026-05-29");
        this.state.calendarYear = today.getFullYear();
        this.state.calendarMonth = today.getMonth();
        this.renderCalendarTab();
      };
    }

    // 자동 생성 및 CSV 내보내기/가져오기 버튼 바인딩
    const btnGenerate = document.getElementById('btn-planning-checklist-generate');
    if (btnGenerate) {
      btnGenerate.onclick = () => this.generateDefaultAssignmentsForActiveAudit();
    }

    const btnExport = document.getElementById('btn-planning-checklist-export-csv');
    if (btnExport) {
      btnExport.onclick = () => this.exportPlanningTasksToCSV();
    }

    const fileImport = document.getElementById('file-planning-checklist-import-csv');
    if (fileImport) {
      fileImport.onchange = (e) => this.importPlanningTasksFromCSV(e);
    }

    // 화면 렌더링 기동
    this.renderPlanningScreen();
  },

  // 3) 감사 계획 화면 동적 드로잉 (KPI 카드, 마일스톤 타임라인, 태스크 테이블)
  renderPlanningScreen() {
    const audit = this.state.audits.find(a => a.id === this.state.selectedAuditId);
    if (!audit) {
      console.warn("No active audit schedule found.");
      
      // Update monitoring headers to placeholder values when no audit is matched (Safety design)
      const circularProgressBar = document.getElementById('circular-progress-bar');
      if (circularProgressBar) circularProgressBar.style.strokeDashoffset = '163.36';
      
      const circularProgressText = document.getElementById('circular-progress-text');
      if (circularProgressText) circularProgressText.textContent = "0%";
      
      const leftSummaryText = document.getElementById('left-summary-text');
      if (leftSummaryText) leftSummaryText.innerHTML = "조회 조건에 부합하는 일정이 없습니다.";
      
      const ddayValNode = document.getElementById('planning-kpi-dday') || document.getElementById('panel-kpi-dday');
      if (ddayValNode) {
        ddayValNode.textContent = "-";
        ddayValNode.style.color = "var(--text-secondary)";
      }
      
      const totalValNode = document.getElementById('planning-kpi-total') || document.getElementById('panel-kpi-total');
      if (totalValNode) totalValNode.textContent = "-";
      
      const completedValNode = document.getElementById('planning-kpi-completed') || document.getElementById('panel-kpi-completed');
      if (completedValNode) completedValNode.textContent = "-";
      
      const progressValNode = document.getElementById('planning-kpi-progress') || document.getElementById('panel-kpi-progress');
      if (progressValNode) progressValNode.textContent = "-";
      
      const delayedValNode = document.getElementById('planning-kpi-delayed') || document.getElementById('panel-kpi-delayed');
      if (delayedValNode) {
        delayedValNode.textContent = "-";
        delayedValNode.style.color = "var(--text-secondary)";
      }
      
      const targetBadgeNode = document.getElementById('planning-target-badge');
      if (targetBadgeNode) targetBadgeNode.textContent = "등록된 감사 일정 없음";
      
      const subTabs = ['timeline', 'calendar', 'checklist'];
      subTabs.forEach(tab => {
        const pane = document.getElementById(`subtab-planning-${tab}`);
        if (pane) {
          pane.innerHTML = `
            <div style="padding: 40px; text-align: center; color: var(--text-muted-light); font-weight: 500;">
              <i data-lucide="info" style="width: 24px; height: 24px; display: block; margin: 0 auto 10px auto; color: var(--text-muted-light);"></i>
              해당하는 감사 일정이 없습니다. 상단에서 필터를 조정하거나 신규 감사 일정을 등록해 주십시오.
            </div>
          `;
        }
      });
      if (typeof lucide !== 'undefined') lucide.createIcons();
      return;
    }

    // [1] D-Day 및 날짜 차이 동적 연산
    const todayStr = "2026-05-29"; // 고정된 실시간 현재 기준일
    const today = new Date(todayStr);
    const auditDate = new Date(audit.date);
    const diffTime = auditDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let dDayText = "";
    let dDayClass = "info";
    if (diffDays > 0) {
      dDayText = `D-${diffDays}`;
      if (diffDays <= 7) dDayClass = "high-risk blink"; // 마감 7일 이내 깜빡이는 모션
    } else if (diffDays === 0) {
      dDayText = "D-DAY";
      dDayClass = "high-risk blink";
    } else {
      dDayText = `D+${Math.abs(diffDays)}`;
      dDayClass = "low-risk";
    }

    // [2] 태스크 진행도 통계 집계
    const taskStates = this.state.planningChecklistStates[audit.id] || {};
    const totalTasks = this.state.planningTasks.length;
    
    let completedCount = 0;
    let inProgressCount = 0;
    let delayedCount = 0;

    this.state.planningTasks.forEach(task => {
      const state = taskStates[task.id] || "pending";
      if (state === "completed") {
        completedCount++;
      } else if (state === "in_progress") {
        inProgressCount++;
      }

      // 지연(Delayed) 판단 조건
      if (state === "pending") {
        const milestoneDays = parseInt(task.milestone.replace("D-", "")) || 0;
        if (diffDays <= milestoneDays) {
          delayedCount++;
        }
      }
    });

    const completionRate = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;

    // [3] KPI 카드 바인딩 및 실시간 감사 준비 현황 모니터링 계기판 정밀 반영
    
    // (1) 원형 게이지 및 왼쪽 요약 텍스트
    const circularProgressBar = document.getElementById('circular-progress-bar');
    if (circularProgressBar) {
      const circumference = 163.36;
      const offset = circumference - (completionRate / 100) * circumference;
      circularProgressBar.style.strokeDashoffset = offset;
    }
    
    const circularProgressText = document.getElementById('circular-progress-text');
    if (circularProgressText) {
      circularProgressText.textContent = `${completionRate.toFixed(0)}%`;
    }
    
    const leftSummaryText = document.getElementById('left-summary-text');
    if (leftSummaryText) {
      leftSummaryText.innerHTML = `총 <strong>${totalTasks}</strong>개 중 <strong>${completedCount}</strong>개 완료 (${completionRate.toFixed(0)}%)`;
    }
    
    // (2) 디테일 인포 2x2 카드 영역
    const infoOem = document.getElementById('info-oem');
    if (infoOem) {
      infoOem.textContent = audit.customer || '-';
      infoOem.title = audit.customer || '';
    }
    
    const infoPlant = document.getElementById('info-plant');
    if (infoPlant) {
      const plantObj = (this.state.commonCodes?.plants || []).find(p => p.code === audit.plantCode);
      const plantName = plantObj ? plantObj.name : audit.plantCode;
      infoPlant.textContent = plantName || '-';
      infoPlant.title = plantName || '';
    }
    
    const infoDate = document.getElementById('info-date');
    if (infoDate) {
      infoDate.textContent = audit.date || '-';
    }
    
    const infoType = document.getElementById('info-type');
    if (infoType) {
      const selectedType = audit.type || 'Project';
      const typeName = audit.typeName || (selectedType === 'Project' ? 'VDA 6.3 Process Audit' : 'IATF 16949 Standard Audit');
      if (selectedType === 'Project') {
        infoType.textContent = `${typeName} (제조공정)`;
      } else if (selectedType === 'System') {
        infoType.textContent = `${typeName} (시스템)`;
      } else {
        infoType.textContent = typeName;
      }
    }
    
    // (3) 모니터링 활성 프로젝트 배지
    const monitoringBadge = document.getElementById('monitoring-badge');
    if (monitoringBadge) {
      monitoringBadge.textContent = audit.project || '전사 신규 품질 실사';
    }

    // (4) 우측 5대 가로 KPI 카드들 바인딩 (planning- 및 panel- 양방향 바인딩 지원으로 정합성 극대화)
    const ddayValNode = document.getElementById('planning-kpi-dday') || document.getElementById('panel-kpi-dday');
    const ddaySubNode = document.getElementById('planning-kpi-dday-sub') || document.getElementById('panel-kpi-dday-sub');
    if (ddayValNode && ddaySubNode) {
      ddayValNode.textContent = dDayText;
      if (diffDays <= 7 && diffDays >= 0) {
        ddayValNode.style.color = '#ef4444';
        ddayValNode.classList.add('blink');
      } else if (diffDays < 0) {
        ddayValNode.style.color = '#64748b';
        ddayValNode.classList.remove('blink');
      } else {
        ddayValNode.style.color = 'var(--brand-blue)';
        ddayValNode.classList.remove('blink');
      }
      ddaySubNode.innerHTML = `심사일: <strong>${audit.date}</strong>`;
    }

    const totalValNode = document.getElementById('planning-kpi-total') || document.getElementById('panel-kpi-total');
    if (totalValNode) {
      totalValNode.textContent = totalTasks;
    }

    const completedValNode = document.getElementById('planning-kpi-completed') || document.getElementById('panel-kpi-completed');
    const completedSubNode = document.getElementById('planning-kpi-completed-sub') || document.getElementById('panel-kpi-completed-sub');
    if (completedValNode && completedSubNode) {
      completedValNode.textContent = completedCount;
      completedSubNode.innerHTML = `대비 달성율: <strong style="color: #10b981;">${completionRate.toFixed(0)}%</strong>`;
    }

    const progressValNode = document.getElementById('planning-kpi-progress') || document.getElementById('panel-kpi-progress');
    const progressSubNode = document.getElementById('planning-kpi-progress-sub') || document.getElementById('panel-kpi-progress-sub');
    if (progressValNode && progressSubNode) {
      progressValNode.textContent = inProgressCount;
      progressSubNode.innerHTML = `대기/미시작: <strong>${totalTasks - completedCount - inProgressCount}</strong>개`;
    }

    const delayedValNode = document.getElementById('planning-kpi-delayed') || document.getElementById('panel-kpi-delayed');
    const delayedSubNode = document.getElementById('planning-kpi-delayed-sub') || document.getElementById('panel-kpi-delayed-sub');
    if (delayedValNode && delayedSubNode) {
      delayedValNode.textContent = delayedCount;
      delayedValNode.style.color = delayedCount > 0 ? '#ef4444' : 'var(--text-muted-light)';
      delayedSubNode.innerHTML = delayedCount > 0 ? '<strong style="color: #ef4444;">조치 지연 리스크 감지</strong>' : '일정 지연 없음 (양호)';
    }

    // [4] 타겟 정보 뱃지 및 카드 헤더 동기화
    const targetBadgeNode = document.getElementById('planning-target-badge');
    if (targetBadgeNode) {
      const plantObj = (this.state.commonCodes.plants || []).find(p => p.code === audit.plantCode);
      const plantName = plantObj ? plantObj.name : audit.plantCode;
      targetBadgeNode.textContent = `${plantName} (${audit.plantCode}) / ${audit.customer} 심사`;
    }

    const timelineTitleNode = document.getElementById('timeline-audit-title');
    if (timelineTitleNode) {
      timelineTitleNode.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="color: var(--brand-blue);"><i data-lucide="shield-check" style="width: 18px; height: 18px; vertical-align: middle;"></i></span>
          <span>[${audit.customer}] ${audit.project || '신규수검'} 로드맵</span>
        </div>
      `;
    }

    // 서브탭 상태에 따른 화면 보이기/숨기기 및 분기 렌더링
    const tabTimeline = document.getElementById('subtab-planning-timeline');
    const tabCalendar = document.getElementById('subtab-planning-calendar');
    const tabChecklist = document.getElementById('subtab-planning-checklist');

    const activeTab = this.state.activePlanningSubtab || 'planning-timeline';

    if (activeTab === 'planning-calendar') {
      if (tabTimeline) tabTimeline.style.display = 'none';
      if (tabCalendar) tabCalendar.style.display = 'block';
      if (tabChecklist) tabChecklist.style.display = 'none';
      this.renderCalendarTab();
      if (typeof lucide !== 'undefined') lucide.createIcons();
      return; // 캘린더 렌더링 완료 후 조기 리턴
    } else if (activeTab === 'planning-checklist') {
      if (tabTimeline) tabTimeline.style.display = 'none';
      if (tabCalendar) tabCalendar.style.display = 'none';
      if (tabChecklist) tabChecklist.style.display = 'block';
      this.renderChecklistTab();
      if (typeof lucide !== 'undefined') lucide.createIcons();
      return; // 체크리스트 렌더링 완료 후 조기 리턴
    }

    // 기본 Timeline 탭 활성화 상태
    if (tabTimeline) tabTimeline.style.display = 'block';
    if (tabCalendar) tabCalendar.style.display = 'none';
    if (tabChecklist) tabChecklist.style.display = 'none';

    // [5] Milestone Timeline 렌더링
    const milestoneTrackerNode = document.getElementById('planning-milestone-tracker');
    if (milestoneTrackerNode) {
      const milestones = [
        { key: "D-30", title: "Pre-Planning 단계", subtitle: "고객 규격 대조 및 TF 구성", desc: "고객사의 특수품질 사양서(CSR)를 확보하여 내부 작업 표준과 정합성을 매핑하고 자체 수검 TF를 정렬합니다." },
        { key: "D-15", title: "Checklist Matching 단계", subtitle: "과거 리스크 분석 및 체크리스트 도출", desc: "공장의 최근 3개년 품질 실패 QI 데이터와 고객 불만 이력을 역추적하여 수검 맞춤형 현장 가이드를 배포합니다." },
        { key: "D-7", title: "Pre-Verification 단계", subtitle: "4M 변경 검증 및 미결 보완", desc: "현장의 4M 변경점과 과거 감사 지적사항의 종결 상태를 오디터 가용 수준으로 종결 및 사전 예방 보완을 마무리합니다." },
        { key: "D-3", title: "Simulation 단계", subtitle: "가상 인터뷰 및 최종 증적 수렴", desc: "수검용 디지털 공유 폴더에 증빙 실물을 최종 매칭하고 현장 오퍼레이터들과 SOP 인지 가상 모의 인터뷰를 전개합니다." },
        { key: "D-Day", title: "Auditing (본 감사 수검)", subtitle: "현장 오디트 및 돌발 지적 즉각 대응", desc: "고객사 오디터 밀착 수검을 진행하며, 실시간 검출된 돌발 부적합에 대한 AI Action Advisor 개입 SOP 대책서를 완성합니다." }
      ];

      // 현재 Active 마일스톤 탐색
      let activeMilestoneKey = "D-30";
      if (diffDays <= 0) {
        activeMilestoneKey = "D-Day";
      } else if (diffDays <= 3) {
        activeMilestoneKey = "D-3";
      } else if (diffDays <= 7) {
        activeMilestoneKey = "D-7";
      } else if (diffDays <= 15) {
        activeMilestoneKey = "D-15";
      } else {
        activeMilestoneKey = "D-30";
      }

      let timelineHTML = `<div class="milestone-timeline" style="position: relative; padding-left: 32px; display: flex; flex-direction: column; gap: 24px;">`;
      
      // 세로 은은한 그라데이션 라인
      timelineHTML += `<div style="position: absolute; top: 8px; left: 11px; width: 2px; height: calc(100% - 16px); background: linear-gradient(180deg, var(--brand-blue), var(--border-card) 70%, #e2e8f0); z-index: 0;"></div>`;

      milestones.forEach(m => {
        // 이 마일스톤에 속한 태스크 분석
        const mTasks = this.state.planningTasks.filter(t => t.milestone === m.key);
        const mTotal = mTasks.length;
        const mCompleted = mTasks.filter(t => (taskStates[t.id] || "pending") === "completed").length;
        const mPercent = mTotal > 0 ? Math.round((mCompleted / mTotal) * 100) : 0;

        const isCurrentActive = m.key === activeMilestoneKey;
        const isAllDone = mPercent === 100;

        // 노드 상태 결정
        let nodeClass = "pending";
        let nodeStyle = "background: #f1f5f9; border: 2px solid var(--border-card); color: var(--text-muted-light);";
        
        if (isAllDone) {
          nodeClass = "completed";
          nodeStyle = "background: #10b981; border: 2px solid #059669; color: white;";
        } else if (isCurrentActive) {
          nodeClass = "active";
          nodeStyle = "background: var(--brand-blue); border: 2px solid var(--brand-blue-hover); color: white; box-shadow: 0 0 10px rgba(37, 99, 235, 0.4);";
        }

        const iconHTML = isAllDone 
          ? `<i data-lucide="check" style="width: 12px; height: 12px; stroke-width: 3px;"></i>` 
          : (isCurrentActive ? `<i data-lucide="activity" style="width: 12px; height: 12px;" class="animate-pulse"></i>` : `<span style="font-size: 10px; font-weight: 700; font-family: monospace;">-</span>`);

        timelineHTML += `
          <div class="milestone-item ${isCurrentActive ? 'active' : ''}" style="position: relative; z-index: 1;">
            <!-- 마일스톤 불렛 노드 -->
            <div class="milestone-node ${nodeClass}" style="position: absolute; left: -32px; top: 4px; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; ${nodeStyle}">
              ${iconHTML}
            </div>

            <!-- 마일스톤 내용 카드 -->
            <div class="card-solid milestone-card ${isCurrentActive ? 'active-glow' : ''}" style="background: #ffffff; border: 1px solid ${isCurrentActive ? 'var(--brand-blue)' : 'var(--border-card)'}; box-shadow: ${isCurrentActive ? 'var(--shadow-md)' : 'var(--shadow-sm)'}; padding: 14px 18px; border-radius: 8px; transition: all 0.2s ease-in-out;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px; margin-bottom: 6px;">
                <div>
                  <span style="font-size: 11px; font-weight: 800; font-family: monospace; color: ${isCurrentActive ? 'var(--brand-blue)' : 'var(--text-muted-light)'}; text-transform: uppercase;">
                    ${m.key} ${isCurrentActive ? '• 현재 실행 마일스톤' : ''}
                  </span>
                  <h4 style="font-size: 13.5px; font-weight: 700; color: var(--text-primary); margin: 2px 0 0 0;">${m.title}</h4>
                </div>
                <div style="text-align: right;">
                  <span style="font-size: 11px; font-weight: 700; font-family: monospace; color: ${isAllDone ? '#10b981' : (isCurrentActive ? 'var(--brand-blue)' : 'var(--text-muted-light)')}; background: ${isAllDone ? 'var(--bg-status-low)' : '#f1f5f9'}; border: 1px solid ${isAllDone ? 'var(--border-status-low)' : 'var(--border-card)'}; padding: 2px 8px; border-radius: 4px;">
                    ${mPercent}% (${mCompleted}/${mTotal})
                  </span>
                </div>
              </div>
              <p style="font-size: 12px; color: var(--text-secondary); margin: 0 0 8px 0; line-height: 1.5; font-weight: 500;">${m.desc}</p>
              
              <!-- 쁘띠 미니 프로그레스바 -->
              <div style="width: 100%; height: 4px; background: #e2e8f0; border-radius: 2px; overflow: hidden; border: 1px solid var(--border-card);">
                <div style="width: ${mPercent}%; height: 100%; background: ${isAllDone ? '#10b981' : 'linear-gradient(90deg, #3b82f6, var(--brand-blue))'}; transition: width 0.3s ease;"></div>
              </div>
            </div>
          </div>
        `;
      });

      timelineHTML += `</div>`;
      milestoneTrackerNode.innerHTML = timelineHTML;
    }

    // [6] 상세 준비 과제 체크리스트 테이블 렌더링
    const taskListNode = document.getElementById('planning-task-list');
    if (taskListNode) {
      let tableHTML = `
        <table class="data-table" style="width: 100%; border-collapse: collapse; font-size: 12.5px;">
          <thead>
            <tr style="border-bottom: 1px solid var(--border-card); background: #f8fafc;">
              <th style="padding: 10px 12px; text-align: left; width: 70px; color: var(--text-secondary); font-weight: 700;">단계</th>
              <th style="padding: 10px 12px; text-align: left; color: var(--text-secondary); font-weight: 700;">검증 준비 과제</th>
              <th style="padding: 10px 12px; text-align: left; color: var(--text-secondary); font-weight: 700; width: 42%;">세부 검증 설명</th>
              <th style="padding: 10px 12px; text-align: center; width: 100px; color: var(--text-secondary); font-weight: 700;">준비 상태</th>
              <th style="padding: 10px 12px; text-align: center; width: 90px; color: var(--text-secondary); font-weight: 700;">상태 전환</th>
            </tr>
          </thead>
          <tbody>
      `;

      this.state.planningTasks.forEach(task => {
        const state = taskStates[task.id] || "pending";
        
        let statusBadge = "";
        let rowStyle = "";
        if (state === "completed") {
          statusBadge = `<span class="badge" style="background: var(--bg-status-low); border: 1px solid var(--border-status-low); color: var(--text-status-low); font-weight: 700; display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px;">완료</span>`;
          rowStyle = "opacity: 0.85; background: rgba(16, 185, 129, 0.01);";
        } else if (state === "in_progress") {
          statusBadge = `<span class="badge" style="background: var(--bg-status-info); border: 1px solid var(--border-status-info); color: var(--text-status-info); font-weight: 700; display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; animation: pulse-blue 1.5s infinite;">진행 중</span>`;
          rowStyle = "background: rgba(59, 130, 246, 0.01);";
        } else {
          statusBadge = `<span class="badge" style="background: #f1f5f9; border: 1px solid var(--border-card); color: var(--text-muted-light); font-weight: 600; display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px;">대기</span>`;
        }

        // 지연(Delayed) 여부에 따라 행 테두리나 텍스트 컬러 강조
        let delayBadgeHTML = "";
        const milestoneDays = parseInt(task.milestone.replace("D-", "")) || 0;
        if (state === "pending" && diffDays <= milestoneDays) {
          delayBadgeHTML = `<span style="margin-left: 6px; font-size: 10px; font-weight: 700; background: var(--bg-status-high); border: 1px solid var(--border-status-high); color: var(--text-status-high); padding: 1px 4px; border-radius: 3px; vertical-align: middle;">지연 위험</span>`;
        }

        tableHTML += `
          <tr style="border-bottom: 1px solid var(--border-card); ${rowStyle} transition: background 0.15s;">
            <!-- 마일스톤 기준일 -->
            <td style="padding: 12px; font-family: monospace; font-weight: 800; color: var(--brand-blue);">${task.milestone}</td>
            
            <!-- 태스크 제목 -->
            <td style="padding: 12px; font-weight: 700; color: var(--text-primary); line-height: 1.4;">
              <div style="display: flex; align-items: center; flex-wrap: wrap;">
                <span>${task.title}</span>
                ${delayBadgeHTML}
              </div>
            </td>
            
            <!-- 태스크 설명 -->
            <td style="padding: 12px; color: var(--text-secondary); font-weight: 500; line-height: 1.5;">${task.desc}</td>
            
            <!-- 현재 상태 뱃지 -->
            <td style="padding: 12px; text-align: center;">${statusBadge}</td>
            
            <!-- 상태 전환 버튼 -->
            <td style="padding: 12px; text-align: center;">
              <button class="btn-toggle-task" data-id="${task.id}" style="padding: 5px 10px; font-size: 11px; font-weight: 700; border-radius: 4px; cursor: pointer; transition: all 0.2s; border: 1px solid var(--border-card); background: #ffffff; color: var(--text-primary); display: inline-flex; align-items: center; gap: 4px;">
                <i data-lucide="refresh-cw" style="width: 10px; height: 10px;"></i>
                <span>전환</span>
              </button>
            </td>
          </tr>
        `;
      });

      tableHTML += `
          </tbody>
        </table>
      `;
      taskListNode.innerHTML = tableHTML;

      // 상세 과제 상태 전환 토글 액션 바인딩
      taskListNode.querySelectorAll('.btn-toggle-task').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const taskId = btn.getAttribute('data-id');
          this.toggleTaskState(taskId);
        });
      });
    }

    // Lucide Icons 리프레시 바인딩
    if (typeof lucide !== 'undefined') lucide.createIcons();
  },

  // 4) 준비 과제 상태 전환 3단 루프 토글 핸들러
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

    // 상태 전환별 미학적 토스트 알림 발신
    const task = this.state.planningTasks.find(t => t.id === taskId);
    const taskTitle = task ? `'${task.title.substring(0, 15)}...'` : "준비 과제";
    
    let stateLabel = "대기";
    let stateType = "info";
    if (nextState === "in_progress") {
      stateLabel = "진행 중";
    } else if (nextState === "completed") {
      stateLabel = "완료됨";
      stateType = "success";
    }

    this.showToast(`${taskTitle} 준비 과제 상태가 [${stateLabel}]으로 변경되었습니다.`, stateType);
    this.logAction(null, `준비 과제 상태 변경: ${taskTitle} -> [${stateLabel}]`, 'action');
  },

  // 5) 감사 일정 등록 모달 기동 및 폼 프리세팅
  openScheduleModal() {
    console.log("📅 Opening Audit Registration Modal...");
    
    const modal = document.getElementById('audit-registration-modal');
    if (!modal) return;

    // 모달 내 공장 드롭다운 동적 충진 (마스터 자원과 연동)
    const plantSelect = document.getElementById('modal-audit-plant');
    if (plantSelect && this.state.commonCodes?.plants) {
      plantSelect.innerHTML = '';
      // 'ALL'을 제외한 실제 가용 공장 목록 로딩
      const realPlants = this.state.commonCodes.plants.filter(p => p.code !== 'ALL' && p.is_active);
      realPlants.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.code;
        opt.textContent = `${p.name} (${p.code})`;
        plantSelect.appendChild(opt);
      });
    }

    // 기본 담당자를 현재 세션 로그인 유저명으로 기입하는 스마트함 연출
    const leadInput = document.getElementById('modal-audit-lead');
    if (leadInput) {
      leadInput.value = this.state.currentUser?.name || "박정호 수석";
    }

    // 예정일 기본값 기입 (미래의 특정일 2026-06-15)
    const dateInput = document.getElementById('modal-audit-date');
    if (dateInput) {
      dateInput.value = "2026-06-15";
    }

    // 기타 폼 비우기
    const titleInput = document.getElementById('modal-audit-title');
    if (titleInput) titleInput.value = "";
    
    const projInput = document.getElementById('modal-audit-project');
    if (projInput) projInput.value = "";

    const descInput = document.getElementById('modal-audit-desc');
    if (descInput) descInput.value = "";

    // 표출
    modal.classList.remove('hidden');
    if (typeof lucide !== 'undefined') lucide.createIcons();
  },

  // 6) 신규 감사 일정 정밀 유효성 확인 및 저장
  saveSchedule() {
    console.log("📅 Saving New Audit Schedule...");

    const title = document.getElementById('modal-audit-title')?.value.trim();
    const plant = document.getElementById('modal-audit-plant')?.value;
    const customer = document.getElementById('modal-audit-customer')?.value;
    const date = document.getElementById('modal-audit-date')?.value;
    const lead = document.getElementById('modal-audit-lead')?.value.trim();
    const project = document.getElementById('modal-audit-project')?.value.trim();
    const desc = document.getElementById('modal-audit-desc')?.value.trim();

    // 1. 유효성 검사 (Validation)
    if (!title) {
      this.showToast("감사 수검명을 올바르게 입력하십시오.", "warning");
      document.getElementById('modal-audit-title')?.focus();
      return;
    }
    if (!date) {
      this.showToast("수검 예정일을 지정하십시오.", "warning");
      document.getElementById('modal-audit-date')?.focus();
      return;
    }
    if (!lead) {
      this.showToast("담당 수석 감사원(Lead Auditor)을 입력하십시오.", "warning");
      document.getElementById('modal-audit-lead')?.focus();
      return;
    }

    // 2. 신규 감사 오브젝트 구성
    const auditType = document.getElementById('modal-audit-type')?.value || 'Project';
    const newId = "audit_" + (Date.now()); // 안전한 타임스탬프 ID
    const newAudit = {
      id: newId,
      title: title,
      plantCode: plant,
      customer: customer,
      date: date,
      type: auditType, // Audit Type 저장
      typeName: auditType === "Project" ? "VDA 6.3 Process Audit" : "IATF 16949 Standard Audit",
      leadAuditor: lead,
      project: project || "전사 신규 품질 실사",
      desc: desc || "정적 MVP 기반 수검 계획 등록"
    };

    // 3. 전역 State 및 LocalStorage 에 세션 보존 영속화
    this.state.audits.push(newAudit);
    this.state.audits.sort((a, b) => a.date.localeCompare(b.date));
    localStorage.setItem('cqms_customer_audit_db', JSON.stringify(this.state.audits));

    // 신규 등록 일정을 즉시 활성 감사 일정으로 격상 선택
    this.state.selectedAuditId = newId;
    localStorage.setItem('riskhunter_selected_audit_id', newId);

    // 해당 감사 체크리스트 초기상태 빈 객체 배당
    this.state.planningChecklistStates[newId] = {};
    localStorage.setItem('riskhunter_checklist_states', JSON.stringify(this.state.planningChecklistStates));

    // 4. 모달 숨기기 및 알림
    document.getElementById('audit-registration-modal').classList.add('hidden');
    this.showToast(`'${title}' 수검 일정이 성공적으로 등록되었으며, 실시간 체크리스트가 기동되었습니다!`, "success");

    const plantName = (this.state.commonCodes?.plants || []).find(p => p.code === plant)?.name || plant;
    this.logAction(null, `신규 Audit 일정 등록: [${plantName}] ${title} (${date}, 담당: ${lead})`, 'action');

    // 5. 화면 동기화 리렌더링
    this.initAuditPlanning();
  },

  // ==========================================================================
  // 📅 Audit Planning 3대 서브탭 전용 핵심 렌더러 및 헬퍼 모듈 (Phase 3 Redesign)
  // ==========================================================================

  // [1] 달력 서브탭 렌더러
  renderCalendarTab() {
    const audit = this.state.audits.find(a => a.id === this.state.selectedAuditId);
    if (!audit) return;

    // 선택된 달력 날짜가 없는 경우 기본적으로 해당 감사 예정일(D-Day)을 선택 상태로 설정
    if (!this.state.selectedCalendarDate) {
      this.state.selectedCalendarDate = audit.date;
    }

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

    // 3. UI DOM 요소 갱신 및 고대비 동적 색상 매퍼 적용
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
        calPrepDday.style.color = '#2563eb'; // 안전 권역
        calPrepDday.classList.remove('blink');
      }
    }
    
    if (calPrepSummary) {
      calPrepSummary.innerHTML = `총 <strong>${totalT}</strong>건 중 <strong>${completedT}</strong>건 완료`;
    }

    // 4. 년/월 타이틀 바인딩 및 달력 날짜 7x6 그리드 그리기
    if (this.state.calendarYear === undefined || this.state.calendarMonth === undefined) {
      const aDate = new Date(audit.date);
      this.state.calendarYear = aDate.getFullYear();
      this.state.calendarMonth = aDate.getMonth();
    }

    const monthTitle = document.getElementById('calendar-month-title');
    if (monthTitle) {
      monthTitle.innerHTML = `
        <i data-lucide="calendar" style="width: 20px; height: 20px; color: #00c8ff; vertical-align: middle;"></i>
        <span style="vertical-align: middle; margin-left: 6px;">${this.state.calendarYear}년 ${this.state.calendarMonth + 1}월</span>
      `;
    }

    const gridBox = document.getElementById('calendar-grid-box');
    if (!gridBox) return;
    gridBox.innerHTML = '';

    const year = this.state.calendarYear;
    const month = this.state.calendarMonth;

    // 1일의 요일과 이번 달 총 일수
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    // 이전 달의 마지막 일수
    const prevLastDate = new Date(year, month, 0).getDate();

    // 42셀 그리기
    let html = '';

    // 이전 달 날짜 채우기
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = prevLastDate - i;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      html += this.renderCalendarCellHTML(prevYear, prevMonth, d, true, audit, today, taskStates);
    }

    // 이번 달 날짜 채우기
    for (let d = 1; d <= lastDate; d++) {
      html += this.renderCalendarCellHTML(year, month, d, false, audit, today, taskStates);
    }

    // 다음 달 날짜 채우기
    const totalFilled = firstDay + lastDate;
    const remaining = 42 - totalFilled;
    for (let d = 1; d <= remaining; d++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      html += this.renderCalendarCellHTML(nextYear, nextMonth, d, true, audit, today, taskStates);
    }

    gridBox.innerHTML = html;

    // Lucide Icons 리프레시
    if (typeof lucide !== 'undefined') lucide.createIcons();

    // 달력 셀 클릭 이벤트 바인딩
    gridBox.querySelectorAll('.calendar-cell').forEach(cell => {
      cell.onclick = () => {
        const clickedDate = cell.getAttribute('data-date');
        if (clickedDate) {
          this.state.selectedCalendarDate = clickedDate;
          this.renderCalendarTab(); // 선택된 테두리 반영을 위해 전체 재컴파일 및 렌더링
        }
      };
    });

    // 달력 셀 내부의 과제 배지 클릭 시 즉각 상태전환
    gridBox.querySelectorAll('.calendar-task-badge').forEach(badge => {
      badge.onclick = (e) => {
        e.stopPropagation();
        const taskId = badge.getAttribute('data-task-id');
        if (taskId) {
          this.toggleTaskState(taskId);
        }
      };
    });

    // 우측 기한 과제 목록 동적 리렌더링 연동
    this.renderCalendarSelectedTasks();
  },

  // [2] 달력 셀 렌더러 HTML 생성 헬퍼
  renderCalendarCellHTML(year, month, day, isOtherMonth, activeAudit, today, taskStates) {
    const cellDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    let classes = ['calendar-cell'];
    if (isOtherMonth) {
      classes.push('other-month');
    }

    // 오늘 날짜 대조 (2026-05-29)
    const isToday = cellDateStr === "2026-05-29";
    if (isToday) {
      classes.push('today');
    }

    // 감사 예정일 대조
    const isAuditDay = cellDateStr === activeAudit.date;
    if (isAuditDay) {
      classes.push('audit-day');
    }

    // 선택된 날짜 대조 (블루 테두리 하이라이트 및 줌 효과)
    const isSelected = cellDateStr === this.state.selectedCalendarDate;
    if (isSelected) {
      classes.push('selected');
    }

    // 오늘, 감사예정일, 선택여부 등 테두리 및 효과 다이내믹 주입
    let inlineStyle = "";
    if (isSelected) {
      inlineStyle = "border: 2.5px solid #2563eb !important; background: #f0f6ff !important; box-shadow: 0 4px 12px rgba(37,99,235,0.15) !important; transform: scale(1.02); z-index: 10;";
    } else if (isAuditDay) {
      inlineStyle = "border: 1.5px solid #ef4444 !important; background: #fef2f2 !important; box-shadow: inset 0 0 8px rgba(239,68,68,0.05);";
    } else if (isToday) {
      inlineStyle = "border: 1.5px solid #ffd700 !important; background: #fffbeb !important; box-shadow: inset 0 0 8px rgba(255,215,0,0.1);";
    } else {
      inlineStyle = `background: ${isOtherMonth ? '#f8fafc' : '#ffffff'} !important; border: 1px solid ${isOtherMonth ? '#f1f5f9' : '#e2e8f0'} !important;`;
    }

    // 일자 텍스트 컬러 설정
    let dayTextColor = "var(--text-primary)";
    if (isOtherMonth) dayTextColor = "#94a3b8";
    else if (isSelected) dayTextColor = "#2563eb";
    else if (isToday) dayTextColor = "#d97706";
    else if (isAuditDay) dayTextColor = "#ef4444";

    let cellHTML = `
      <div class="${classes.join(' ')}" data-date="${cellDateStr}" style="position: relative; min-height: 105px; padding: 8px; border-radius: 6px; display: flex; flex-direction: column; gap: 4px; cursor: pointer; transition: all 0.2s; ${inlineStyle}">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11.5px; font-weight: ${isToday || isAuditDay || isSelected ? '900' : '700'}; color: ${dayTextColor};">${day}</span>
          ${isToday ? '<span style="font-size: 8px; font-weight: 800; color: #d97706; background: rgba(217,119,6,0.08); padding: 1px 3px; border-radius: 3px; font-family: \'Inter\', sans-serif;">TODAY</span>' : ''}
          ${isAuditDay ? '<span style="font-size: 8px; font-weight: 800; color: #ef4444; background: rgba(239,68,68,0.08); padding: 1px 3px; border-radius: 3px; font-family: \'Inter\', sans-serif;">AUDIT</span>' : ''}
        </div>
        <div class="calendar-events-container" style="flex-grow: 1; overflow: hidden; display: flex; flex-direction: column; gap: 4px; justify-content: flex-end; padding-top: 2px;">
    `;

    // 감사 당일이면 화려한 고객 감사 일정 배지 추가
    if (isAuditDay) {
      cellHTML += `
        <div style="font-size: 10px; font-weight: 800; color: #ef4444; background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.2); padding: 4px; border-radius: 4px; text-align: center; display: flex; align-items: center; justify-content: center; gap: 3px; width: 100%; box-sizing: border-box;" title="${activeAudit.title}">
          <span>★ 본감사 수검</span>
        </div>
      `;
    } else {
      // 10대 마일스톤 태스크들의 Due Date 체크 및 뱃지 그리기 (그룹화 방식)
      const dueTasksInCell = [];
      this.state.planningTasks.forEach(task => {
        const dueDStr = this.getTaskDueDate(activeAudit, task);
        if (cellDateStr === dueDStr) {
          dueTasksInCell.push(task);
        }
      });

      if (dueTasksInCell.length > 0) {
        let completedCount = 0;
        let inProgressCount = 0;
        let pendingCount = 0;
        let delayedCount = 0;

        dueTasksInCell.forEach(task => {
          const state = taskStates[task.id] || "pending";
          if (state === "completed") {
            completedCount++;
          } else if (state === "in_progress") {
            inProgressCount++;
          } else {
            const todayDateObj = new Date("2026-05-29");
            const dueD = new Date(cellDateStr);
            if (todayDateObj >= dueD) {
              delayedCount++;
            } else {
              pendingCount++;
            }
          }
        });

        if (completedCount > 0) {
          cellHTML += `
            <div class="calendar-task-badge" style="font-size: 9.5px; font-weight: 700; background: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d; padding: 2.5px 5px; border-radius: 4px; display: flex; align-items: center; justify-content: center; gap: 3px; max-width: 100%;" title="완료된 과제 ${completedCount}건">
              <span>● 완료 ${completedCount}</span>
            </div>
          `;
        }
        if (inProgressCount > 0) {
          cellHTML += `
            <div class="calendar-task-badge" style="font-size: 9.5px; font-weight: 700; background: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; padding: 2.5px 5px; border-radius: 4px; display: flex; align-items: center; justify-content: center; gap: 3px; max-width: 100%;" title="진행 중 과제 ${inProgressCount}건">
              <span>▶ 진행 ${inProgressCount}</span>
            </div>
          `;
        }
        if (delayedCount > 0) {
          cellHTML += `
            <div class="calendar-task-badge" style="font-size: 9.5px; font-weight: 700; background: #fef2f2; border: 1px solid #fca5a5; color: #ef4444; padding: 2.5px 5px; border-radius: 4px; display: flex; align-items: center; justify-content: center; gap: 3px; max-width: 100%;" title="지연 위험 과제 ${delayedCount}건">
              <span>⚠ 지연 ${delayedCount}</span>
            </div>
          `;
        }
        if (pendingCount > 0) {
          cellHTML += `
            <div class="calendar-task-badge" style="font-size: 9.5px; font-weight: 700; background: #f8fafc; border: 1px solid #cbd5e1; color: #475569; padding: 2.5px 5px; border-radius: 4px; display: flex; align-items: center; justify-content: center; gap: 3px; max-width: 100%;" title="대기 중 과제 ${pendingCount}건">
              <span>○ 대기 ${pendingCount}</span>
            </div>
          `;
        }
      }
    }

    cellHTML += `
        </div>
      </div>
    `;
    return cellHTML;
  },

  // [3] 과제 완료 기한(Due Date) 탐색 및 디폴트 자동 역산 헬퍼
  getTaskDueDate(audit, task) {
    const auditId = audit.id;
    const assignments = this.state.planningTaskAssignments[auditId] || {};
    const taskAssign = assignments[task.id] || {};
    
    if (taskAssign.dueDate) {
      return taskAssign.dueDate; // 맞춤 기한이 있으면 최우선 반환
    }

    // 지정되지 않은 경우 D-Day 로드맵 기준 기본 역산 처리
    let subtractDays = 0;
    if (task.milestone === "D-30") subtractDays = 30;
    else if (task.milestone === "D-15") subtractDays = 15;
    else if (task.milestone === "D-7") subtractDays = 7;
    else if (task.milestone === "D-3") subtractDays = 3;
    else if (task.milestone === "D-Day") subtractDays = 0;

    const dObj = new Date(audit.date);
    dObj.setDate(dObj.getDate() - subtractDays);
    return `${dObj.getFullYear()}-${String(dObj.getMonth() + 1).padStart(2, '0')}-${String(dObj.getDate()).padStart(2, '0')}`;
  },

  // [4] 달력 우측 선택 일자 상세 태스크 목록 패널 렌더링
  renderCalendarSelectedTasks() {
    const titleNode = document.getElementById('calendar-selected-date-title');
    const listNode = document.getElementById('calendar-selected-tasks-list');
    if (!listNode) return;

    listNode.innerHTML = '';

    const audit = this.state.audits.find(a => a.id === this.state.selectedAuditId);
    if (!audit) return;

    const selectedDate = this.state.selectedCalendarDate || audit.date;
    
    if (titleNode) {
      titleNode.innerHTML = `
        <i data-lucide="calendar-check" style="width: 15px; height: 15px; color: var(--brand-blue); vertical-align: middle;"></i>
        <span style="vertical-align: middle; margin-left: 4px;">${selectedDate} 기한 과제</span>
      `;
    }

    const taskStates = this.state.planningChecklistStates[audit.id] || {};
    const assignments = this.state.planningTaskAssignments[audit.id] || {};

    const dueTasks = this.state.planningTasks.filter(task => {
      const taskDue = this.getTaskDueDate(audit, task);
      return taskDue === selectedDate;
    });

    if (dueTasks.length === 0) {
      listNode.innerHTML = `
        <div style="padding: 24px 16px; text-align: center; color: var(--text-muted-light); border: 1px dashed var(--border-card); border-radius: 8px; font-weight: 500; font-size: 11.5px; background: #ffffff;">
          <i data-lucide="info" style="width: 18px; height: 18px; display: block; margin: 0 auto 8px auto; opacity: 0.6; color: var(--brand-blue);"></i>
          해당 일자에 예정된 감사 준비 태스크가 없습니다. 달력의 마일스톤이나 스케줄러 일정을 확인해 주십시오.
        </div>
      `;
    } else {
      dueTasks.forEach(task => {
        const state = taskStates[task.id] || "pending";
        const assign = assignments[task.id] || {};
        
        // Fallback realistic defaults to match screenshots
        const team = assign.team || (task.id === "task_2" ? "인사교육과" : (task.id === "task_5" ? "생산기술팀" : (task.id === "task_8" ? "성형품질과" : "품질보증부")));
        const lead = assign.lead || "박정호 수석";

        let stateBadge = '';

        if (state === "completed") {
          stateBadge = `<span style="font-size: 10px; font-weight: 800; color: #15803d; background: #dcfce7; border: 1px solid #bbf7d0; padding: 2px 6px; border-radius: 4px; cursor: pointer;">완료</span>`;
        } else if (state === "in_progress") {
          stateBadge = `<span style="font-size: 10px; font-weight: 800; color: #1d4ed8; background: #dbeafe; border: 1px solid #bfdbfe; padding: 2px 6px; border-radius: 4px; cursor: pointer;">진행</span>`;
        } else {
          // 지연 판단 (2026-05-29 기준)
          const todayDateObj = new Date("2026-05-29");
          const dueD = new Date(selectedDate);
          if (todayDateObj >= dueD) {
            stateBadge = `<span class="blink" style="font-size: 10px; font-weight: 800; color: #ef4444; background: #fee2e2; border: 1px solid #fca5a5; padding: 2px 6px; border-radius: 4px; cursor: pointer;">지연</span>`;
          } else {
            stateBadge = `<span style="font-size: 10px; font-weight: 800; color: #475569; background: #f1f5f9; border: 1px solid #cbd5e1; padding: 2px 6px; border-radius: 4px; cursor: pointer;">대기</span>`;
          }
        }

        listNode.innerHTML += `
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; display: flex; flex-direction: column; gap: 8px; transition: all 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.02);" class="selected-task-card">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 11.5px; font-weight: 800; color: #2563eb; font-family: monospace;">${task.id.toUpperCase()}</span>
              <div onclick="window.antigravity.toggleTaskState('${task.id}')" title="클릭 시 상태 전환">
                ${stateBadge}
              </div>
            </div>
            
            <div style="font-size: 12.5px; font-weight: 800; color: #0f172a; line-height: 1.4;">${task.title}</div>
            
            <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 6px; border-top: 1px dashed #e2e8f0; padding-top: 8px;">
              <span style="font-size: 11px; color: #64748b;">
                배치팀: <strong style="color: #334155; font-weight: 700;">${team}</strong>
              </span>
              <span style="font-size: 11px; color: #64748b;">
                담당: <strong style="color: #334155; font-weight: 700;">${lead}</strong>
              </span>
            </div>
          </div>
        `;
      });
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
  },

  // [5] 10-Day Task Deployment Scheduler (체크리스트 서브탭 바닐라 데이터 시트 렌더러)
  renderChecklistTab() {
    console.log("📋 Rendering Checklist 10-Day Task Deployment Scheduler...");
    
    const tableBox = document.getElementById('planning-checklist-table-box');
    if (!tableBox) return;

    const audit = this.state.audits.find(a => a.id === this.state.selectedAuditId);
    if (!audit) {
      tableBox.innerHTML = `
        <div style="padding: 40px; text-align: center; color: var(--text-muted-light); font-weight: 500;">
          <i data-lucide="info" style="width: 24px; height: 24px; display: block; margin: 0 auto 10px auto; color: var(--text-muted-light);"></i>
          활성 감사 일정을 먼저 등록하거나 선택해 주십시오.
        </div>
      `;
      return;
    }

    const auditId = audit.id;
    const taskStates = this.state.planningChecklistStates[auditId] || {};
    const assignments = this.state.planningTaskAssignments[auditId] || {};

    let tableHTML = `
      <table class="data-table" style="width: 100%; border-collapse: collapse; font-size: 12.5px; background: #ffffff;">
        <thead>
          <tr style="border-bottom: 2px solid #cbd5e1; background: #f1f5f9;">
            <th style="padding: 12px 10px; text-align: left; width: 90px; color: #334155; font-weight: 800; border-top: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1;">Task ID</th>
            <th style="padding: 12px 10px; text-align: center; width: 85px; color: #334155; font-weight: 800; border-top: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1; line-height: 1.2;">추진 마일<br>스톤</th>
            <th style="padding: 12px 10px; text-align: left; color: #334155; font-weight: 800; border-top: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1;">검증 준비 과제 (체크리스트)</th>
            <th style="padding: 12px 10px; text-align: left; width: 150px; color: #334155; font-weight: 800; border-top: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1;">배치팀 (Team)</th>
            <th style="padding: 12px 10px; text-align: left; width: 110px; color: #334155; font-weight: 800; border-top: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1;">담당 실무자</th>
            <th style="padding: 12px 10px; text-align: left; width: 140px; color: #334155; font-weight: 800; border-top: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1;">조치 기한 (Due Date)</th>
            <th style="padding: 12px 10px; text-align: center; width: 100px; color: #334155; font-weight: 800; border-top: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1;">준비 상태</th>
            <th style="padding: 12px 10px; text-align: center; width: 150px; color: #334155; font-weight: 800; border-top: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1;">작업</th>
          </tr>
        </thead>
        <tbody>
    `;

    this.state.planningTasks.forEach(task => {
      const state = taskStates[task.id] || "pending";
      const assign = assignments[task.id] || {};
      
      // Fallback defaults to match screenshots/calendar panel before generation
      const teamVal = assign.team || (task.id === "task_2" ? "인사교육과" : (task.id === "task_5" ? "생산기술팀" : (task.id === "task_8" ? "성형품질과" : "품질보증부")));
      const leadVal = assign.lead || "박정호 수석";
      
      // 기한 계산 (커스텀 값이 없을 시 디폴트 마일스톤 D-Day 기반 역산값 자동 매핑)
      let dueVal = assign.dueDate || "";
      if (!dueVal) {
        dueVal = this.getTaskDueDate(audit, task);
      }

      // 상태 배지 HTML 분기 (Static badges with light rounded borders)
      let stateBadgeHTML = '';
      if (state === "completed") {
        stateBadgeHTML = `<span style="font-size: 11px; font-weight: 800; color: #15803d; background: #f0fdf4; border: 1px solid #bbf7d0; padding: 4px 8px; border-radius: 4px; display: inline-block; width: 80px; text-align: center;">완료</span>`;
      } else if (state === "in_progress") {
        stateBadgeHTML = `<span style="font-size: 11px; font-weight: 800; color: #1d4ed8; background: #eff6ff; border: 1px solid #bfdbfe; padding: 4px 8px; border-radius: 4px; display: inline-block; width: 80px; text-align: center;">진행</span>`;
      } else {
        // 지연 감지 (2026-05-29 기준 기한 초과 여부 확인)
        const todayDateObj = new Date("2026-05-29");
        const dueD = new Date(dueVal);
        if (todayDateObj >= dueD) {
          stateBadgeHTML = `<span class="blink" style="font-size: 11px; font-weight: 800; color: #ef4444; background: #fef2f2; border: 1px solid #fca5a5; padding: 4px 8px; border-radius: 4px; display: inline-block; width: 80px; text-align: center;">지연 위험</span>`;
        } else {
          stateBadgeHTML = `<span style="font-size: 11px; font-weight: 800; color: #475569; background: #f8fafc; border: 1px solid #cbd5e1; padding: 4px 8px; border-radius: 4px; display: inline-block; width: 80px; text-align: center;">대기</span>`;
        }
      }

      // 입력란 텍스트 박스는 검정 색상(#0f172a)과 순수 흰색(#ffffff)을 매핑하여 가독성 대비율(Contrast Ratio) 극대화 (WCAG 2.1 AA)
      tableHTML += `
        <tr style="border-bottom: 1px solid #e2e8f0; background: #ffffff; transition: background 0.15s;" id="row-${task.id}" onmouseenter="this.style.background='#f8fafc'" onmouseleave="this.style.background='#ffffff'">
          <td style="padding: 12px 10px; font-family: monospace; font-weight: 700; color: #334155;">${task.id.toUpperCase()}</td>
          <td style="padding: 12px 10px; text-align: center; color: #2563eb; font-weight: 800; font-family: monospace; font-size: 13px;">
            ${task.milestone}
          </td>
          <td style="padding: 12px 10px; line-height: 1.4; text-align: left;">
            <div style="font-weight: 800; color: #0f172a; margin-bottom: 4px; font-size: 12.5px;">${task.title}</div>
            <div style="font-size: 11px; color: #64748b; line-height: 1.3;">${task.desc}</div>
          </td>
          <td style="padding: 12px 10px;">
            <input type="text" id="input-team-${task.id}" value="${teamVal}" placeholder="예: 품질보증부" style="width: 100%; background: #ffffff !important; border: 1px solid #cbd5e1 !important; color: #0f172a !important; padding: 6px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; outline: none; box-sizing: border-box;">
          </td>
          <td style="padding: 12px 10px;">
            <input type="text" id="input-lead-${task.id}" value="${leadVal}" placeholder="예: 박정호 수석" style="width: 100%; background: #ffffff !important; border: 1px solid #cbd5e1 !important; color: #0f172a !important; padding: 6px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; outline: none; box-sizing: border-box;">
          </td>
          <td style="padding: 12px 10px;">
            <input type="date" id="input-due-${task.id}" value="${dueVal}" style="width: 100%; background: #ffffff !important; border: 1px solid #cbd5e1 !important; color: #0f172a !important; padding: 5px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; font-family: monospace; outline: none; box-sizing: border-box;">
          </td>
          <td style="padding: 12px 10px; text-align: center;">
            ${stateBadgeHTML}
          </td>
          <td style="padding: 12px 10px; text-align: center;">
            <div style="display: flex; gap: 6px; justify-content: center; align-items: center;">
              <button onclick="window.antigravity.toggleTaskStateInChecklist('${task.id}')" style="background: #ffffff; border: 1px solid #cbd5e1; color: #0f172a; padding: 6px 10px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; gap: 4px;" onmouseenter="this.style.background='#f1f5f9'" onmouseleave="this.style.background='#ffffff'">
                <i data-lucide="refresh-cw" style="width: 11px; height: 11px;"></i> 상태
              </button>
              <button onclick="window.antigravity.saveTaskRowAssignment('${task.id}')" style="background: #2563eb; border: none; color: white; padding: 6px 10px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; transition: all 0.2s; box-shadow: 0 1px 3px rgba(37,99,235,0.2);" onmouseenter="this.style.background='#1d4ed8'" onmouseleave="this.style.background='#2563eb'">
                <i data-lucide="save" style="width: 11px; height: 11px;"></i> 저장
              </button>
            </div>
          </td>
        </tr>
      `;
    });

    tableHTML += `
        </tbody>
      </table>
    `;

    tableBox.innerHTML = tableHTML;

    // 아이콘 새로고침
    if (typeof lucide !== 'undefined') lucide.createIcons();
  },

  // [6] 개별 태스크 배정 저장 핵심 로직
  saveTaskRowAssignment(taskId) {
    const auditId = this.state.selectedAuditId;
    if (!auditId) return;

    const teamInput = document.getElementById(`input-team-${taskId}`);
    const leadInput = document.getElementById(`input-lead-${taskId}`);
    const dueInput = document.getElementById(`input-due-${taskId}`);

    if (!teamInput || !leadInput || !dueInput) return;

    if (!this.state.planningTaskAssignments[auditId]) {
      this.state.planningTaskAssignments[auditId] = {};
    }

    this.state.planningTaskAssignments[auditId][taskId] = {
      team: teamInput.value.trim(),
      lead: leadInput.value.trim(),
      dueDate: dueInput.value
    };

    localStorage.setItem('riskhunter_planning_task_assignments', JSON.stringify(this.state.planningTaskAssignments));
    
    this.showToast(`${taskId.toUpperCase()} 과제 배정 정보가 완벽히 저장되었습니다.`, "success");
    this.logAction(null, `체크리스트 과제 배정 변경 (과제: ${taskId}, 감사 ID: ${auditId})`, 'action');
    
    // UI 동시 리프레시
    this.renderPlanningScreen();
  },

  // [7] 체크리스트 서브탭 진행 상태 토글 핸들러
  toggleTaskStateInChecklist(taskId) {
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

    this.renderPlanningScreen();
  },

  // [8] ASM-01-EN-OE 감사 기준 스케줄러 자동 계산 및 기본 배정 수립
  generateDefaultAssignmentsForActiveAudit() {
    const audit = this.state.audits.find(a => a.id === this.state.selectedAuditId);
    if (!audit) {
      this.showToast("활성 감사 일정을 먼저 지정하거나 선택해 주십시오.", "warning");
      return;
    }

    const auditId = audit.id;
    if (!this.state.planningTaskAssignments[auditId]) {
      this.state.planningTaskAssignments[auditId] = {};
    }
    if (!this.state.planningChecklistStates[auditId]) {
      this.state.planningChecklistStates[auditId] = {};
    }

    const auditDateObj = new Date(audit.date); // 기준일 (예: 2026-06-15)

    this.state.planningTasks.forEach(task => {
      // 마일스톤 오프셋 일수 파싱
      let subtractDays = 0;
      if (task.milestone === "D-30") subtractDays = 30;
      else if (task.milestone === "D-15") subtractDays = 15;
      else if (task.milestone === "D-7") subtractDays = 7;
      else if (task.milestone === "D-3") subtractDays = 3;
      else if (task.milestone === "D-Day") subtractDays = 0;

      const dueDateObj = new Date(auditDateObj);
      dueDateObj.setDate(dueDateObj.getDate() - subtractDays);
      const dueDateStr = `${dueDateObj.getFullYear()}-${String(dueDateObj.getMonth() + 1).padStart(2, '0')}-${String(dueDateObj.getDate()).padStart(2, '0')}`;

      // 기획서 의무 지정 디폴트 부서 및 담당인력 매핑
      let team = "품질보증부";
      let lead = "박정호 수석";
      
      if (task.id === "task_2") {
        team = "인사교육과";
        lead = "김민지 사원";
      } else if (task.id === "task_5") {
        team = "생산기술팀";
        lead = "이현우 책임";
      } else if (task.id === "task_8") {
        team = "성형품질과";
        lead = "정성훈 책임";
      }

      this.state.planningTaskAssignments[auditId][task.id] = {
        team: team,
        lead: lead,
        dueDate: dueDateStr
      };

      if (!this.state.planningChecklistStates[auditId][task.id]) {
        this.state.planningChecklistStates[auditId][task.id] = "pending";
      }
    });

    // 로컬스토리지 영속 보존 동기화
    localStorage.setItem('riskhunter_planning_task_assignments', JSON.stringify(this.state.planningTaskAssignments));
    localStorage.setItem('riskhunter_checklist_states', JSON.stringify(this.state.planningChecklistStates));

    this.renderPlanningScreen();
    this.showToast("ASM-01-EN-OE 감사 가이드라인 기준 일정이 자동 생성 및 배정되었습니다!", "success");
    this.logAction(null, `감사 준비 태스크 자동 역산 매핑 실행 (감사 ID: ${auditId})`, 'action');
  },

  // [9] Excel/CSV 내보내기 구현 (UTF-8 BOM 준수 한글 깨짐 방지 완벽 대응)
  exportPlanningTasksToCSV() {
    const audit = this.state.audits.find(a => a.id === this.state.selectedAuditId);
    if (!audit) {
      this.showToast("내보낼 수 있는 활성 감사가 존재하지 않습니다.", "warning");
      return;
    }

    const auditId = audit.id;
    const taskStates = this.state.planningChecklistStates[auditId] || {};
    const assignments = this.state.planningTaskAssignments[auditId] || {};

    const headers = ["ID", "Milestone", "Title", "Description", "Assigned Team", "Lead", "Due Date", "Status"];
    
    let csvContent = "\ufeff"; // MS Excel 한글 보호용 BOM
    csvContent += headers.map(h => `"${h.replace(/"/g, '""')}"`).join(",") + "\n";

    this.state.planningTasks.forEach(task => {
      const state = taskStates[task.id] || "pending";
      const assign = assignments[task.id] || {};
      
      const team = assign.team || "";
      const lead = assign.lead || "";
      const dueDate = assign.dueDate || this.getTaskDueDate(audit, task);

      const row = [
        task.id,
        task.milestone,
        task.title,
        task.desc,
        team,
        lead,
        dueDate,
        state
      ];

      csvContent += row.map(cell => {
        const str = String(cell);
        return `"${str.replace(/"/g, '""')}"`;
      }).join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    link.setAttribute("href", url);
    link.setAttribute("download", `RiskHunter_AuditPrepTasks_${audit.customer}_${auditId}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.showToast("감사 준비 태스크 추진 계획 목록이 엑셀(CSV)로 정상 추출되어 다운로드되었습니다.", "success");
    this.logAction(null, `감사 준비 태스크 CSV 백업 내보내기 실행 (감사 ID: ${auditId})`, 'action');
  },

  // [10] Excel/CSV 가져오기 구현 (양방향 완벽 동기화 복원)
  importPlanningTasksFromCSV(e) {
    const file = e.target.files[0];
    if (!file) return;

    const audit = this.state.audits.find(a => a.id === this.state.selectedAuditId);
    if (!audit) {
      this.showToast("감사 일정을 먼저 활성화 또는 생성한 후 가공하십시오.", "warning");
      return;
    }

    const auditId = audit.id;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split(/\r?\n/);
      if (lines.length < 2) {
        this.showToast("업로드한 파일에 유효한 정보 조항이 존재하지 않습니다.", "warning");
        return;
      }

      const headerLine = lines[0];
      const headers = this.parseCSVLine(headerLine);
      const idIdx = headers.findIndex(h => h.trim().toUpperCase() === "ID");
      const teamIdx = headers.findIndex(h => h.trim().toUpperCase().includes("TEAM") || h.trim().includes("부서"));
      const leadIdx = headers.findIndex(h => h.trim().toUpperCase().includes("LEAD") || h.trim().includes("리더"));
      const dueIdx = headers.findIndex(h => h.trim().toUpperCase().includes("DUE") || h.trim().includes("기한"));
      const statusIdx = headers.findIndex(h => h.trim().toUpperCase().includes("STATUS") || h.trim().includes("상태"));

      if (idIdx === -1 || statusIdx === -1) {
        this.showToast("올바른 양식이 아닙니다. 필수 칼럼(ID, Status)을 포함한 CSV 양식을 활용해 주십시오.", "warning");
        return;
      }

      if (!this.state.planningTaskAssignments[auditId]) {
        this.state.planningTaskAssignments[auditId] = {};
      }
      if (!this.state.planningChecklistStates[auditId]) {
        this.state.planningChecklistStates[auditId] = {};
      }

      let updateCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const cells = this.parseCSVLine(line);
        if (cells.length <= Math.max(idIdx, statusIdx)) continue;

        const rawId = cells[idIdx].trim().toLowerCase();
        const exists = this.state.planningTasks.find(t => t.id === rawId);
        if (!exists) continue;

        let teamVal = teamIdx !== -1 && cells[teamIdx] ? cells[teamIdx].trim() : "";
        let leadVal = leadIdx !== -1 && cells[leadIdx] ? cells[leadIdx].trim() : "";
        let dueVal = dueIdx !== -1 && cells[dueIdx] ? cells[dueIdx].trim() : "";
        let statusVal = cells[statusIdx].trim().toLowerCase();

        // 상태값 정규 표준화
        let state = "pending";
        if (statusVal.includes("completed") || statusVal.includes("완료") || statusVal === "true") {
          state = "completed";
        } else if (statusVal.includes("in_progress") || statusVal.includes("진행")) {
          state = "in_progress";
        }

        this.state.planningChecklistStates[auditId][rawId] = state;
        this.state.planningTaskAssignments[auditId][rawId] = {
          team: teamVal || (this.state.planningTaskAssignments[auditId][rawId]?.team || ""),
          lead: leadVal || (this.state.planningTaskAssignments[auditId][rawId]?.lead || ""),
          dueDate: dueVal || (this.state.planningTaskAssignments[auditId][rawId]?.dueDate || "")
        };

        updateCount++;
      }

      if (updateCount > 0) {
        localStorage.setItem('riskhunter_planning_task_assignments', JSON.stringify(this.state.planningTaskAssignments));
        localStorage.setItem('riskhunter_checklist_states', JSON.stringify(this.state.planningChecklistStates));
        
        this.renderPlanningScreen();
        this.showToast(`CSV 파싱 성실 통과! 총 ${updateCount}개 계획 항목의 담당자 및 상태가 동기화되었습니다.`, "success");
        this.logAction(null, `계획 체크리스트 CSV 일괄 가져오기 (감사 ID: ${auditId}, 반영: ${updateCount}건)`, 'action');
      } else {
        this.showToast("가져온 데이터 중 시스템의 10대 태스크 ID와 매칭되는 유효 항목이 검출되지 않았습니다.", "warning");
      }

      e.target.value = ''; // 파일 인풋 캐시 리셋
    };

    reader.onerror = () => {
      this.showToast("파일을 복사하여 읽는 도중 디코딩 에러가 발생했습니다.", "danger");
    };

    reader.readAsText(file, "UTF-8");
  },

  // [11] 견고한 CSV 토큰화 해석 헬퍼
  parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  },

  // ==========================================================================
  // 🏭 3. Plant Risk & Action (공장별 Risk 및 사후 조치 입력 핵심 구현 - Phase 4)
  // ==========================================================================

  // 1) 로컬 저장소(localStorage)에서 Findings 상태 복구 및 데이터 보존
  loadPlantRiskActionData() {
    console.log("🏭 Initializing Plant Risk & Action local data...");
    
    // 마스터 데이터 세트에 고유 식별자(DOC_NO)가 부여되어 있는지 확실히 검증하고, 누락된 조항에 고유 ID 자동 수여 (toggling 용)
    if (this.state.auditFindings && Array.isArray(this.state.auditFindings)) {
      this.state.auditFindings.forEach((item, index) => {
        if (!item.DOC_NO) {
          item.DOC_NO = `FINDING-${index + 1}`;
        }
      });
    }

    const storedFindings = localStorage.getItem('riskhunter_findings');
    if (storedFindings) {
      try {
        const parsed = JSON.parse(storedFindings);
        if (Array.isArray(parsed)) {
          // 1. 사용자가 "Finding Logger"에서 수동으로 신규 등록한 커스텀 지적사항만 정밀 추출 (DOC_NO 규격: FINDING-<timestamp>)
          const customFindings = parsed.filter(item => {
            if (!item.DOC_NO) return false;
            const parts = item.DOC_NO.split('-');
            if (parts.length === 2 && parts[0] === 'FINDING') {
              const timestampVal = parseInt(parts[1], 10);
              // timestamp-based ID는 항상 아주 큰 정수값(1000000 초과)
              return !isNaN(timestampVal) && timestampVal > 1000000;
            }
            return false;
          });

          // 2. 정적 지적사항 항목에 가해진 사용자 상태 편집 정보(종결/재오픈 등)를 compound key 기반 매핑 정보로 수집
          // (SUBJECT + START_DT + PLANT 조합을 유니크 식별자로 적용해 데이터 파일 갱신 시에도 어긋나지 않는 초강력 내진설계 탑재)
          const statusEditMap = {};
          parsed.forEach(item => {
            const isCustom = item.DOC_NO && item.DOC_NO.startsWith('FINDING-') && parseInt(item.DOC_NO.split('-')[1], 10) > 1000000;
            if (!isCustom && item.SUBJECT) {
              const compKey = `${item.SUBJECT}_${item.START_DT}_${item.PLANT}`;
              statusEditMap[compKey] = {
                STATUS: item.STATUS,
                COMP_DT: item.COMP_DT
              };
            }
          });

          // 3. 파일 DB(this.state.auditFindings) 로드 원본에 사용자의 기존 필드 편집 내용을 대조 덮어쓰기 병합
          if (this.state.auditFindings && this.state.auditFindings.length > 0) {
            this.state.auditFindings.forEach(item => {
              const compKey = `${item.SUBJECT}_${item.START_DT}_${item.PLANT}`;
              if (statusEditMap[compKey]) {
                item.STATUS = statusEditMap[compKey].STATUS;
                item.COMP_DT = statusEditMap[compKey].COMP_DT;
              }
            });
          }

          // 4. 추출해둔 수동 커스텀 지적사항 목록을 파일 DB 데이터 앞단에 중복 없이 안전 프리펜드(Prepend) 병합
          const masterDocIds = new Set((this.state.auditFindings || []).map(f => f.DOC_NO));
          const uniqueCustoms = customFindings.filter(f => !masterDocIds.has(f.DOC_NO));
          
          this.state.auditFindings = [...uniqueCustoms, ...(this.state.auditFindings || [])];
          
          console.log(`🏭 Smart merging: ${uniqueCustoms.length} custom user findings merged and status adjustments restored.`);
          
          // 동기화 완료된 깨끗한 데이터를 캐시에 즉시 영속 리셋
          localStorage.setItem('riskhunter_findings', JSON.stringify(this.state.auditFindings));
        }
      } catch (e) {
        console.error("Failed to parse and merge findings from localStorage", e);
      }
    } else {
      if (this.state.auditFindings && this.state.auditFindings.length > 0) {
        localStorage.setItem('riskhunter_findings', JSON.stringify(this.state.auditFindings));
        console.log(`🏭 Initialized localStorage with ${this.state.auditFindings.length} fetched findings.`);
      }
    }
  },

  // 2) Plant Risk & Action 탭 기동 시 초기화 및 리스너 등록
  initPlantRiskAction() {
    console.log("🏭 Initializing Plant Risk & Action Tab...");

    // 대상 공장 드롭다운 옵션 세팅 (ALL 제외 실제 8대 공장만)
    const loggerPlantSelect = document.getElementById('action-logger-plant');
    if (loggerPlantSelect) {
      loggerPlantSelect.innerHTML = '';
      const actualPlants = (this.state.commonCodes.plants || []).filter(p => p.code !== 'ALL');
      actualPlants.forEach(plant => {
        const opt = document.createElement('option');
        opt.value = plant.code;
        opt.textContent = `${plant.name} (${plant.code})`;
        loggerPlantSelect.appendChild(opt);
      });
    }

    // 💡 컨트롤 패널의 공장지 선택 세팅 및 이벤트 바인딩
    const plantSelect = document.getElementById('tab3-plant-select');
    if (plantSelect) {
      plantSelect.innerHTML = '';
      const actualPlants = (this.state.commonCodes.plants || []).filter(p => p.code !== 'ALL');
      actualPlants.forEach(plant => {
        const opt = document.createElement('option');
        opt.value = plant.code;
        opt.textContent = `${plant.name} (${plant.code})`;
        plantSelect.appendChild(opt);
      });
      // 현재 활성 공장 설정 동기화
      plantSelect.value = this.state.plantRiskActivePlant || 'DP';
      plantSelect.onchange = (e) => {
        const val = e.target.value;
        this.state.plantRiskActivePlant = val;
        this.state.selectedPlant = val;
        const globalPlantFilter = document.getElementById('filter-plant');
        if (globalPlantFilter) globalPlantFilter.value = val;
        this.renderPlantRiskScreen();
      };
    }

    // 💡 완성차 고객사 셀렉터 세팅 및 이벤트 바인딩
    const customerSelect = document.getElementById('tab3-customer-select');
    if (customerSelect) {
      customerSelect.innerHTML = '';
      
      const allOpt = document.createElement('option');
      allOpt.value = 'ALL';
      allOpt.textContent = '전체 고객사 (All Customers)';
      customerSelect.appendChild(allOpt);

      const makers = new Set();
      (this.state.auditFindings || []).forEach(item => {
        if (item.CAR_MAKER) {
          makers.add(item.CAR_MAKER.trim().toUpperCase());
        }
      });
      ['BMW', 'FORD', 'HYUNDAI', 'GM', 'VW', 'RENAULT', 'TOYOTA', 'VOLVO'].forEach(m => makers.add(m));
      
      const sortedMakers = Array.from(makers).sort();
      
      const specialOpts = [
        { value: 'HQ', text: 'HQ (본사 주관 종합감사)' },
        { value: 'Internal', text: 'Internal (사내 보증 자가진단)' }
      ];
      
      specialOpts.forEach(opt => {
        const o = document.createElement('option');
        o.value = opt.value;
        o.textContent = opt.text;
        customerSelect.appendChild(o);
      });
      
      sortedMakers.forEach(m => {
        if (m !== 'HQ' && m !== 'INTERNAL') {
          const o = document.createElement('option');
          o.value = m;
          o.textContent = m;
          customerSelect.appendChild(o);
        }
      });

      if (this.state.tab3Customer === undefined) this.state.tab3Customer = 'ALL';
      customerSelect.value = this.state.tab3Customer;
      customerSelect.onchange = (e) => {
        this.state.tab3Customer = e.target.value;
        this.renderPlantRiskScreen();
      };
    }

    // 💡 감사 목적 셀렉터 이벤트 바인딩
    const purposeSelect = document.getElementById('tab3-purpose-select');
    if (purposeSelect) {
      if (!this.state.tab3Purpose) this.state.tab3Purpose = 'ALL';
      purposeSelect.value = this.state.tab3Purpose;
      purposeSelect.onchange = (e) => {
        this.state.tab3Purpose = e.target.value;
        this.renderPlantRiskScreen();
      };
    }

    // 💡 날짜 선택 피커 기본값 세팅 및 이벤트 바인딩
    const startDateInput = document.getElementById('tab3-start-date');
    if (startDateInput) {
      if (this.state.tab3StartDate === undefined) {
        this.state.tab3StartDate = '';
      }
      startDateInput.value = this.state.tab3StartDate;
      startDateInput.onchange = (e) => {
        this.state.tab3StartDate = e.target.value;
        this.renderPlantRiskScreen();
      };
    }

    const endDateInput = document.getElementById('tab3-end-date');
    if (endDateInput) {
      if (this.state.tab3EndDate === undefined) {
        this.state.tab3EndDate = '';
      }
      endDateInput.value = this.state.tab3EndDate;
      endDateInput.onchange = (e) => {
        this.state.tab3EndDate = e.target.value;
        this.renderPlantRiskScreen();
      };
    }

    // 💡 초기화 (RESET) 버튼 이벤트 바인딩
    const resetBtn = document.getElementById('tab3-reset-btn');
    if (resetBtn) {
      resetBtn.onclick = (e) => {
        e.preventDefault();
        this.state.tab3Customer = 'ALL';
        this.state.tab3Purpose = 'ALL';
        this.state.tab3StartDate = '';
        this.state.tab3EndDate = '';
        this.state.tab3Process = 'ALL';

        if (customerSelect) customerSelect.value = 'ALL';
        if (purposeSelect) purposeSelect.value = 'ALL';
        if (startDateInput) startDateInput.value = '';
        if (endDateInput) endDateInput.value = '';

        this.renderPlantRiskScreen();
        this.showToast("자체 감사 검색 필터가 초기화되었습니다.", "info");
      };
    }

    // 💡 등록 모달 여닫기 버튼 이벤트 누적 방지용 바인딩
    const btnTrigger = document.getElementById('btn-trigger-register-finding');
    const modal = document.getElementById('modal-register-finding');
    const modalClose = document.getElementById('modal-register-close');
    
    if (btnTrigger && modal) {
      btnTrigger.onclick = (e) => {
        e.preventDefault();
        modal.style.display = 'flex';
      };
    }
    if (modalClose && modal) {
      modalClose.onclick = (e) => {
        e.preventDefault();
        modal.style.display = 'none';
      };
    }

    // 신규 지적사항 등록 버튼 바인딩 (이벤트 누적 방지용 onclick 오버라이트)
    const btnSaveFinding = document.getElementById('btn-save-finding');
    if (btnSaveFinding) {
      btnSaveFinding.onclick = (e) => {
        e.preventDefault();
        this.saveFinding();
      };
    }

    // 💡 다운로드 버튼 이벤트 핸들러 바인딩
    const btnExportCustomerAudit = document.getElementById('btn-export-customer-audit');
    if (btnExportCustomerAudit) {
      btnExportCustomerAudit.onclick = (e) => {
        e.preventDefault();
        this.exportCustomerAuditChecklist();
      };
    }

    const btnExportPriorityPrep = document.getElementById('btn-export-priority-prep');
    if (btnExportPriorityPrep) {
      btnExportPriorityPrep.onclick = (e) => {
        e.preventDefault();
        this.exportPriorityPrepItems();
      };
    }

    const btnExportRemaining = document.getElementById('btn-export-remaining');
    if (btnExportRemaining) {
      btnExportRemaining.onclick = (e) => {
        e.preventDefault();
        this.exportEntirePlantChecklist();
      };
    }

    // 💡 3중 서브 탭 클릭 이벤트 바인딩
    const subTabButtons = document.querySelectorAll('#tab-plant-risk-action .sub-tab-btn');
    subTabButtons.forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        const subtabId = btn.getAttribute('data-subtab');
        this.state.activePlantRiskSubtab = subtabId;
        this.renderPlantRiskScreen();
      };
    });

    // 화면 첫 렌더링
    this.renderPlantRiskScreen();
  },

    // 3) 전체 리스크 화면 통합 렌더러
  renderPlantRiskScreen() {
    console.log("🏭 Rendering Plant Risk Screen...");

    const activePlantCode = this.state.plantRiskActivePlant || 'DP';
    const activeSubtab = this.state.activePlantRiskSubtab || 'risk-compass';

    // 1. 서브 탭 버튼 스타일 및 활성화 상태 싱크
    const subTabButtons = document.querySelectorAll('#tab-plant-risk-action .sub-tab-btn');
    subTabButtons.forEach(btn => {
      if (btn.getAttribute('data-subtab') === activeSubtab) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // 2. 서브 탭 본문 패널 노출 싱크
    const subPanes = document.querySelectorAll('#tab-plant-risk-action .sub-tab-pane');
    subPanes.forEach(pane => {
      const paneSubtabId = pane.id.replace('subtab-', '');
      if (paneSubtabId === activeSubtab) {
        pane.classList.add('active-sub-pane');
      } else {
        pane.classList.remove('active-sub-pane');
      }
    });

    // 2.5. 글로벌 컨트롤 패널 값 동기화 (어느 서브 탭에서나 일관된 UI 유지)
    const activeCustomer = this.state.tab3Customer || 'ALL';
    const plantSelect = document.getElementById('tab3-plant-select');
    if (plantSelect) plantSelect.value = activePlantCode;

    const customerSelect = document.getElementById('tab3-customer-select');
    if (customerSelect) customerSelect.value = activeCustomer;

    const purposeSelect = document.getElementById('tab3-purpose-select');
    if (purposeSelect) purposeSelect.value = this.state.tab3Purpose || 'ALL';

    const startDateInput = document.getElementById('tab3-start-date');
    if (startDateInput) startDateInput.value = this.state.tab3StartDate || '';

    const endDateInput = document.getElementById('tab3-end-date');
    if (endDateInput) endDateInput.value = this.state.tab3EndDate || '';

    // 2.9. 상단 4 Summary Cards (KPI Widgets) 동적 집계 렌더링
    this.updatePlantRiskSummaryCards();

    // 3. 서브 탭별 화면 분기 렌더링
    if (activeSubtab === 'risk-compass') {
      this.renderRiskCompassTab(activePlantCode);
    } else if (activeSubtab === 'system-level') {
      this.renderSystemLevelTab(activePlantCode);
    } else if (activeSubtab === 'custom-audit') {
      this.renderCustomAuditTab(activePlantCode);
    }

    // 4. Lucide 아이콘 다시 드로잉
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  },

  // 🌟 상단 4 Summary Cards (KPI Widgets) 동적 집계 렌더링
  updatePlantRiskSummaryCards() {
    console.log("🚥 Updating Plant Risk Top 4 Summary Cards...");

    let plants = (this.state.commonCodes.plants || []).filter(p => p.code !== 'ALL' && p.is_active);
    if (plants.length === 0) {
      plants = [
        { code: 'KP', name: '한국금산' },
        { code: 'DP', name: '한국대전' },
        { code: 'JP', name: '중국가흥' },
        { code: 'CP', name: '중국중경' },
        { code: 'HP', name: '중국강소' },
        { code: 'IP', name: '인도네시아' },
        { code: 'MP', name: '헝가리' },
        { code: 'TP', name: '미국테네시' }
      ];
    }

    const allDetails = this.state.oeQualityAssessmentDetails || [];
    const allIssues = (this.state.qualityIssues || []).filter(item => item.REG_DATE && item.REG_DATE.startsWith('2026') && item.HK_FAULT_YN === 'Y');

    let criticalCount = 0;
    let moderateCount = 0;
    let lowCount = 0;

    plants.forEach(plant => {
      const plantItems = allDetails.filter(item => item.plant === plant.code);
      
      // System Level 계산
      const validSystemItems = plantItems.filter(item => {
        if (item.category === 'Process') return false;
        if (!item.score || item.score.toString().trim().toUpperCase() === 'N/A') return false;
        return true;
      });
      let systemLevel = 100.0;
      if (validSystemItems.length > 0) {
        const sumScores = validSystemItems.reduce((sum, item) => sum + parseFloat(item.score), 0);
        systemLevel = (sumScores / (validSystemItems.length * 10)) * 100;
      }
      
      // Assessment Score 계산
      const validAssessmentItems = plantItems.filter(item => {
        if (item.category !== 'Process') return false;
        if (!item.score || item.score.toString().trim().toUpperCase() === 'N/A') return false;
        return true;
      });
      let assessmentScore = 100.0;
      if (validAssessmentItems.length > 0) {
        const sumScores = validAssessmentItems.reduce((sum, item) => sum + parseFloat(item.score), 0);
        assessmentScore = (sumScores / (validAssessmentItems.length * 10)) * 100;
      }
      
      // Issues Penalty
      const plantIssuesCount = allIssues.filter(item => item.PLANT === plant.code).length;
      const issuesPenalty = Math.min(100, plantIssuesCount * 10);
      
      // Composite Risk Index (CRI)
      const cri = 0.4 * (100 - systemLevel) + 0.3 * (100 - assessmentScore) + 0.3 * issuesPenalty;

      // 등급 집계
      if (cri >= 20.0) {
        criticalCount++;
      } else if (cri >= 6.0) {
        moderateCount++;
      } else {
        lowCount++;
      }
    });

    const totalIssuesCount = allIssues.length;

    // DOM 업데이트
    const criticalNode = document.getElementById('summary-critical-count');
    const moderateNode = document.getElementById('summary-moderate-count');
    const lowNode = document.getElementById('summary-low-count');
    const issuesNode = document.getElementById('summary-issues-count');

    if (criticalNode) criticalNode.textContent = criticalCount;
    if (moderateNode) moderateNode.textContent = moderateCount;
    if (lowNode) lowNode.textContent = lowCount;
    if (issuesNode) issuesNode.textContent = totalIssuesCount;
  },

  // ================= Sub-Tab 1: Integrated Risk Compass 렌더링 =================
  renderRiskCompassTab(activePlantCode) {
    console.log(`🧭 Rendering Risk Compass sub-tab for plant: ${activePlantCode}`);

    // ① 품질 인프라 수위 (System Level) 계산
    const plantItems = (this.state.oeQualityAssessmentDetails || []).filter(item => item.plant === activePlantCode);
    const validSystemItems = plantItems.filter(item => {
      if (item.category === 'Process') return false;
      if (!item.score || item.score.toString().trim().toUpperCase() === 'N/A') return false;
      return true;
    });
    let systemLevel = 100.0;
    if (validSystemItems.length > 0) {
      const sumScores = validSystemItems.reduce((sum, item) => sum + parseFloat(item.score), 0);
      systemLevel = (sumScores / (validSystemItems.length * 10)) * 100;
    }

    // ② 현장 실사 합격률 (Assessment Score) 계산
    const validAssessmentItems = plantItems.filter(item => {
      if (item.category !== 'Process') return false;
      if (!item.score || item.score.toString().trim().toUpperCase() === 'N/A') return false;
      return true;
    });
    let assessmentScore = 100.0;
    if (validAssessmentItems.length > 0) {
      const sumScores = validAssessmentItems.reduce((sum, item) => sum + parseFloat(item.score), 0);
      assessmentScore = (sumScores / (validAssessmentItems.length * 10)) * 100;
    }

    // ③ 품질 불만 이슈 패널티 (Issues Penalty Score) 계산
    const plantIssuesCount = (this.state.qualityIssues || []).filter(item => item.PLANT === activePlantCode && item.REG_DATE && item.REG_DATE.startsWith('2026') && item.HK_FAULT_YN === 'Y').length;
    const issuesPenalty = Math.min(100, plantIssuesCount * 10);

    // ④ 종합 품질 리스크 지수 (CRI) 계산
    const cri = 0.4 * (100 - systemLevel) + 0.3 * (100 - assessmentScore) + 0.3 * issuesPenalty;

    // UI LCD 패널 노티스 및 값 세팅 (SELECTED TARGET Panel 및 기존 패널 동시 지원)
    const plantObj = (this.state.commonCodes.plants || []).find(p => p.code === activePlantCode);
    const plantName = plantObj ? plantObj.name : activePlantCode;

    const targetPlantNode = document.getElementById('target-plant-code');
    const targetCriValueNode = document.getElementById('target-cri-value');
    const targetCriStatusNode = document.getElementById('target-cri-status');
    const targetSystemNode = document.getElementById('target-system-value');
    const targetAssessmentNode = document.getElementById('target-assessment-value');

    if (targetPlantNode) targetPlantNode.textContent = plantName;
    if (targetCriValueNode) targetCriValueNode.textContent = cri.toFixed(1);
    if (targetSystemNode) targetSystemNode.textContent = systemLevel.toFixed(1) + '%';
    if (targetAssessmentNode) targetAssessmentNode.textContent = assessmentScore.toFixed(1) + '%';

    // 기존 LCD 노드 (하위 호환성 유지)
    const criValueNode = document.getElementById('cri-value');
    const criStatusNode = document.getElementById('cri-status');
    const criSystemNode = document.getElementById('cri-system');
    const criAssessmentNode = document.getElementById('cri-assessment');
    const criIssuesNode = document.getElementById('cri-issues');
    const criLcdCard = document.getElementById('cri-lcd-card');

    if (criValueNode) criValueNode.textContent = cri.toFixed(1);
    if (criSystemNode) criSystemNode.textContent = systemLevel.toFixed(1) + '%';
    if (criAssessmentNode) criAssessmentNode.textContent = assessmentScore.toFixed(1) + '%';
    if (criIssuesNode) criIssuesNode.textContent = issuesPenalty.toFixed(0) + '점';

    let statusText = 'LOW RISK';
    let textColor = 'var(--text-status-low)';
    let borderColor = 'var(--border-status-low)';
    let bgColor = 'var(--bg-status-low)';

    if (cri >= 20.0) {
      statusText = 'CRITICAL HIGH RISK';
      textColor = 'var(--text-status-high)';
      borderColor = 'var(--border-status-high)';
      bgColor = 'var(--bg-status-high)';
    } else if (cri >= 6.0) {
      statusText = 'MODERATE RISK';
      textColor = 'var(--text-status-medium)';
      borderColor = 'var(--border-status-medium)';
      bgColor = 'var(--bg-status-medium)';
    }

    if (targetCriStatusNode) {
      targetCriStatusNode.textContent = statusText;
      targetCriStatusNode.style.color = textColor;
    }
    if (targetCriValueNode) {
      targetCriValueNode.style.color = textColor;
    }

    if (criStatusNode) {
      criStatusNode.textContent = statusText;
      criStatusNode.style.color = textColor;
    }
    if (criValueNode) {
      criValueNode.style.color = textColor;
      criValueNode.style.textShadow = 'none';
    }
    if (criLcdCard) {
      criLcdCard.style.borderColor = borderColor;
      criLcdCard.style.backgroundColor = bgColor;
      criLcdCard.style.boxShadow = 'var(--shadow-base)';
    }

    // ⑤ 10대 공정 진단 레이더 차트 렌더링
    const processList = ['Incoming', 'Mixing', 'Extruding', 'Calendering', 'Cutting', 'Bead', 'Building', 'Curing', 'Inspection', 'Shipping'];
    const plantData = [];
    const globalData = [];
    const allAssessmentItems = this.state.oeQualityAssessmentDetails || [];

    processList.forEach(proc => {
      const factoryItems = allAssessmentItems.filter(item => 
        item.plant === activePlantCode && 
        (item.process || '').toLowerCase() === proc.toLowerCase() &&
        item.score && item.score.toString().trim().toUpperCase() !== 'N/A'
      );
      let factoryScore = 0;
      if (factoryItems.length > 0) {
        const sum = factoryItems.reduce((total, item) => total + parseFloat(item.score), 0);
        factoryScore = (sum / (factoryItems.length * 10)) * 100;
      }
      plantData.push(factoryScore);

      const globalItems = allAssessmentItems.filter(item => 
        (item.process || '').toLowerCase() === proc.toLowerCase() &&
        item.score && item.score.toString().trim().toUpperCase() !== 'N/A'
      );
      let globalScore = 0;
      if (globalItems.length > 0) {
        const sum = globalItems.reduce((total, item) => total + parseFloat(item.score), 0);
        globalScore = (sum / (globalItems.length * 10)) * 100;
      }
      globalData.push(globalScore);
    });

    const ctxRadar = document.getElementById('chart-radar-risk-compass');
    if (ctxRadar && typeof Chart !== 'undefined') {
      if (this.state.charts.radarRiskCompass) {
        this.state.charts.radarRiskCompass.destroy();
        this.state.charts.radarRiskCompass = null;
      }

      const plantObj = (this.state.commonCodes.plants || []).find(p => p.code === activePlantCode);
      const plantName = plantObj ? plantObj.name : activePlantCode;

      this.state.charts.radarRiskCompass = new Chart(ctxRadar, {
        type: 'radar',
        data: {
          labels: processList.map(p => {
            const koName = {
              'Incoming': '수입검사',
              'Mixing': '정련',
              'Extruding': '압출',
              'Calendering': '압연',
              'Cutting': '재단',
              'Bead': '비드',
              'Building': '성형',
              'Curing': '가류',
              'Inspection': '완성검사',
              'Shipping': '물류출하'
            }[p] || p;
            return `${koName} (${p})`;
          }),
          datasets: [
            {
              label: `${plantName} 공장 수준`,
              data: plantData,
              fill: true,
              backgroundColor: 'rgba(37, 99, 235, 0.15)',
              borderColor: '#2563eb',
              pointBackgroundColor: '#2563eb',
              pointBorderColor: '#fff',
              pointHoverBackgroundColor: '#fff',
              pointHoverBorderColor: '#2563eb',
              borderWidth: 2
            },
            {
              label: '글로벌 8대 공장 평균',
              data: globalData,
              fill: true,
              backgroundColor: 'rgba(148, 163, 184, 0.10)',
              borderColor: '#94a3b8',
              pointBackgroundColor: '#94a3b8',
              pointBorderColor: '#fff',
              pointHoverBackgroundColor: '#fff',
              pointHoverBorderColor: '#94a3b8',
              borderWidth: 1.5,
              borderDash: [4, 4]
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: '#475569',
                font: { family: 'Inter', size: 11, weight: '600' }
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `${context.dataset.label}: ${context.raw.toFixed(1)}%`;
                }
              }
            }
          },
          scales: {
            r: {
              angleLines: {
                color: 'rgba(15, 23, 42, 0.08)'
              },
              grid: {
                color: 'rgba(15, 23, 42, 0.08)'
              },
              pointLabels: {
                color: '#475569',
                font: { family: 'Inter', size: 10, weight: '600' }
              },
              ticks: {
                color: '#475569',
                backdropColor: 'transparent',
                font: { family: 'Inter', size: 9 },
                stepSize: 20
              },
              min: 0,
              max: 100
            }
          }
        }
      });
    }

    // ⑥ 10대 공정별 품질 매트릭스 히트맵 렌더링
    const plantCodes = ['KP', 'DP', 'JP', 'CP', 'HP', 'IP', 'MP', 'TP'];
    const matrix = {};
    processList.forEach(proc => {
      matrix[proc] = {};
      plantCodes.forEach(plt => {
        const items = allAssessmentItems.filter(item => 
          item.plant === plt && 
          (item.process || '').toLowerCase() === proc.toLowerCase() &&
          item.score && item.score.toString().trim().toUpperCase() !== 'N/A'
        );
        if (items.length > 0) {
          const sum = items.reduce((total, item) => total + parseFloat(item.score), 0);
          matrix[proc][plt] = (sum / (items.length * 10)) * 100;
        } else {
          matrix[proc][plt] = 'N/A';
        }
      });
    });

    const heatmapBox = document.getElementById('heatmap-matrix-box');
    if (heatmapBox) {
      let html = `
        <table class="data-table" style="width: 100%; border-collapse: separate; border-spacing: 4px; font-size: 11.5px; text-align: center;">
          <thead>
            <tr>
              <th style="padding: 8px; text-align: left; color: var(--text-secondary); background: #f8fafc; border-radius: 4px; border: 1px solid var(--border-card);">제조 공정</th>
      `;
      
      plantCodes.forEach(plt => {
        const isSelected = plt === activePlantCode;
        const highlightStyle = isSelected ? 'border: 1px solid var(--brand-blue); color: var(--brand-blue); background: var(--bg-status-info); font-weight: 800;' : 'color: var(--text-secondary); border: 1px solid var(--border-card);';
        html += `<th style="padding: 8px; ${highlightStyle} border-radius: 4px;">${plt}</th>`;
      });
      html += `</tr></thead><tbody>`;
      
      processList.forEach(proc => {
        const koName = {
          'Incoming': '수입검사',
          'Mixing': '정련',
          'Extruding': '압출',
          'Calendering': '압연',
          'Cutting': '재단',
          'Bead': '비드',
          'Building': '성형',
          'Curing': '가류',
          'Inspection': '완성검사',
          'Shipping': '물류출하'
        }[proc] || proc;
        
        html += `
          <tr>
            <td style="padding: 8px; text-align: left; font-weight: 700; color: var(--text-primary); background: #f8fafc; border: 1px solid var(--border-card); border-radius: 4px; width: 120px;">
              ${koName} <span style="font-size: 9px; color: var(--text-muted-light); font-weight: 400; display: block;">${proc}</span>
            </td>
        `;
        
        plantCodes.forEach(plt => {
          const isSelected = plt === activePlantCode;
          const val = matrix[proc][plt];
          
          let cellStyle = '';
          let cellText = '';
          
          if (val === 'N/A') {
            cellStyle = 'background: #f1f5f9; color: var(--text-muted); border: 1px solid var(--border-card);';
            cellText = 'N/A';
          } else {
            cellText = val.toFixed(0) + '%';
            if (val >= 95) {
              cellStyle = 'background: var(--bg-status-low); color: var(--text-status-low); border: 1px solid var(--border-status-low);';
            } else if (val >= 90) {
              cellStyle = 'background: var(--bg-status-info); color: var(--text-status-info); border: 1px solid var(--border-status-info);';
            } else if (val >= 85) {
              cellStyle = 'background: var(--bg-status-medium); color: var(--text-status-medium); border: 1px solid var(--border-status-medium);';
            } else {
              cellStyle = 'background: var(--bg-status-high); color: var(--text-status-high); border: 1px solid var(--border-status-high);';
            }
          }
          
          if (isSelected) {
            cellStyle += ' outline: 2px solid var(--brand-blue); outline-offset: -2px; border-color: var(--brand-blue) !important; font-weight: 800;';
          }
          
          html += `<td style="padding: 8px; ${cellStyle} border-radius: 4px;">${cellText}</td>`;
        });
        html += `</tr>`;
      });
      
      html += `</tbody></table>`;
      heatmapBox.innerHTML = html;
    }

    // ⑦ 공장별 종합 리스크 랭킹 (Leaderboard) 동적 렌더링
    const leaderboardList = document.getElementById('tab3-leaderboard-list');
    if (leaderboardList) {
      let plants = (this.state.commonCodes.plants || []).filter(p => p.code !== 'ALL' && p.is_active);
      if (plants.length === 0) {
        plants = [
          { code: 'KP', name: '한국금산' },
          { code: 'DP', name: '한국대전' },
          { code: 'JP', name: '중국가흥' },
          { code: 'CP', name: '중국중경' },
          { code: 'HP', name: '중국강소' },
          { code: 'IP', name: '인도네시아' },
          { code: 'MP', name: '헝가리' },
          { code: 'TP', name: '미국테네시' }
        ];
      }

      const allDetails = this.state.oeQualityAssessmentDetails || [];
      const allIssues = (this.state.qualityIssues || []).filter(item => item.REG_DATE && item.REG_DATE.startsWith('2026') && item.HK_FAULT_YN === 'Y');

      const rankings = plants.map(plant => {
        const plantItems = allDetails.filter(item => item.plant === plant.code);
        
        // 🌟 [소통 보완장치 - 용어 및 물리 매핑 일치 가이드]
        // 기획서 상의 "oe_system_map" 데이터는 실제 물리 DB인 "internal_assessment_result.json" 내에서 category !== 'Process' 요건으로 필터링되어 구현됩니다.
        // 공식명칭: "품질 시스템 인프라 평가 데이터 (Quality Infrastructure Assessment Data)"
        const validSystemItems = plantItems.filter(item => {
          if (item.category === 'Process') return false;
          if (!item.score || item.score.toString().trim().toUpperCase() === 'N/A') return false;
          return true;
        });
        let systemLevel = 100.0;
        if (validSystemItems.length > 0) {
          const sumScores = validSystemItems.reduce((sum, item) => sum + parseFloat(item.score), 0);
          systemLevel = (sumScores / (validSystemItems.length * 10)) * 100;
        }
        
        // 🌟 [소통 보완장치 - 용어 및 물리 매핑 일치 가이드]
        // 기획서 상의 "oe_quality_assessment_summary" 데이터는 실제 물리 DB인 "internal_assessment_result.json" 내에서 category === 'Process' 요건으로 필터링되어 구현됩니다.
        // 공식명칭: "품질 현장 실사 평가 데이터 (Actual Quality Assessment Data)"
        const validAssessmentItems = plantItems.filter(item => {
          if (item.category !== 'Process') return false;
          if (!item.score || item.score.toString().trim().toUpperCase() === 'N/A') return false;
          return true;
        });
        let assessmentScore = 100.0;
        if (validAssessmentItems.length > 0) {
          const sumScores = validAssessmentItems.reduce((sum, item) => sum + parseFloat(item.score), 0);
          assessmentScore = (sumScores / (validAssessmentItems.length * 10)) * 100;
        }
        
        // Issues Penalty
        const plantIssuesCount = allIssues.filter(item => item.PLANT === plant.code).length;
        const issuesPenalty = Math.min(100, plantIssuesCount * 10);
        
        // Composite Risk Index (CRI)
        const cri = 0.4 * (100 - systemLevel) + 0.3 * (100 - assessmentScore) + 0.3 * issuesPenalty;
        
        return {
          code: plant.code,
          name: plant.name,
          cri: cri,
          systemLevel: systemLevel,
          assessmentScore: assessmentScore,
          issuesPenalty: issuesPenalty,
          issuesCount: plantIssuesCount
        };
      });

      // CRI 기준 내림차순 정렬
      rankings.sort((a, b) => b.cri - a.cri);

      let lbHtml = '';
      rankings.forEach((item, idx) => {
        const rank = idx + 1;
        const isSelected = item.code === activePlantCode;

        // Rank Badge Style
        let rankBadgeStyle = 'width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 11px;';
        if (rank === 1) {
          rankBadgeStyle += ' background: linear-gradient(135deg, #f59e0b, #d97706); color: #ffffff; text-shadow: 0 1px 2px rgba(0,0,0,0.2); font-weight: 800;';
        } else if (rank === 2) {
          rankBadgeStyle += ' background: linear-gradient(135deg, #94a3b8, #475569); color: #ffffff; font-weight: 800;';
        } else if (rank === 3) {
          rankBadgeStyle += ' background: linear-gradient(135deg, #b45309, #78350f); color: #ffffff; font-weight: 800;';
        } else {
          rankBadgeStyle += ' background: #f1f5f9; color: var(--text-secondary); border: 1px solid var(--border-card); font-weight: 600;';
        }

        // HSL Risk Badge Style
        let riskBadgeText = 'LOW';
        let riskBadgeStyle = 'font-size: 9px; padding: 2px 6px; border-radius: 4px; font-weight: 700;';
        let progressBarColor = '#10b981'; // LOW: Green
        
        if (item.cri >= 20.0) {
          riskBadgeText = 'CRITICAL';
          riskBadgeStyle += ' color: #dc2626; background: #fee2e2; border: 1px solid #fecaca;';
          progressBarColor = '#ef4444'; // CRITICAL: Red
        } else if (item.cri >= 6.0) {
          riskBadgeText = 'MODERATE';
          riskBadgeStyle += ' color: #b45309; background: #fef3c7; border: 1px solid #fde68a;';
          progressBarColor = '#f59e0b'; // MODERATE: Amber
        } else {
          riskBadgeStyle += ' color: #15803d; background: #d1fae5; border: 1px solid #a7f3d0;';
        }

        // Active Card Style
        let cardStyle = 'padding: 12px 14px; border-radius: 8px; border: 1px solid var(--border-card); background: #ffffff; display: flex; flex-direction: column; justify-content: center; gap: 6px; cursor: pointer; transition: all 0.2s ease-in-out; flex: 1; min-height: 52px;';
        if (isSelected) {
          cardStyle = 'padding: 12px 14px; border-radius: 8px; border: 2px solid var(--brand-blue); background: rgba(37, 99, 235, 0.04); display: flex; flex-direction: column; justify-content: center; gap: 6px; cursor: pointer; transition: all 0.2s ease-in-out; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1); flex: 1; min-height: 52px;';
        }

        lbHtml += `
          <div class="leaderboard-row" data-plant="${item.code}" style="${cardStyle}" onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 8px rgba(15, 23, 42, 0.05)';" onmouseout="this.style.transform='none'; this.style.boxShadow='${isSelected ? '0 4px 12px rgba(37, 99, 235, 0.1)' : 'none'}';">
            <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <div style="${rankBadgeStyle}">${rank}</div>
                <div style="display: flex; flex-direction: column;">
                  <span style="font-weight: 700; color: var(--text-primary); font-size: 12.5px; line-height: 1.2;">${item.name}</span>
                  <span style="font-size: 10px; color: var(--text-muted-light); font-weight: 600; text-transform: uppercase;">${item.code}</span>
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 14px; color: var(--text-primary);">${item.cri.toFixed(1)}</span>
                <span style="${riskBadgeStyle}">${riskBadgeText}</span>
              </div>
            </div>
            
            <!-- Micro Progress Bar -->
            <div style="width: 100%; height: 4px; background: #f1f5f9; border-radius: 2px; overflow: hidden; margin-top: 2px;">
              <div style="width: ${item.cri.toFixed(1)}%; height: 100%; background: ${progressBarColor}; border-radius: 2px; transition: width 0.4s ease-in-out;"></div>
            </div>
          </div>
        `;
      });

      leaderboardList.innerHTML = lbHtml;

      // Click Event binding
      const rows = leaderboardList.querySelectorAll('.leaderboard-row');
      rows.forEach(row => {
        row.addEventListener('click', (e) => {
          const plantCode = row.getAttribute('data-plant');
          console.log(`🏆 Leaderboard clicked: switching active plant to ${plantCode}`);
          
          this.state.plantRiskActivePlant = plantCode;
          this.state.selectedPlant = plantCode;

          // Sync Dropdowns & Filters
          const tabSelect = document.getElementById('tab3-plant-select');
          if (tabSelect) tabSelect.value = plantCode;

          const systemSelect = document.getElementById('system-factory-select');
          if (systemSelect) systemSelect.value = plantCode;

          const globalFilter = document.getElementById('filter-plant');
          if (globalFilter) globalFilter.value = plantCode;

          // Re-render
          this.renderPlantRiskScreen();
          this.showToast(`${plantCode} 공장으로 리스크 돋보기가 전환되었습니다.`, "success");
        });
      });
    }
  },

  // ================= Sub-Tab 2: OE Quality System Level 렌더링 =================
  renderSystemLevelTab(activePlantCode) {
    console.log(`📈 Rendering System Level sub-tab for plant: ${activePlantCode}`);

    // Sync Dropdown Value & Bind Event Listener for seamless chart connection
    const systemFactorySelect = document.getElementById('system-factory-select');
    if (systemFactorySelect) {
      systemFactorySelect.value = activePlantCode;
      if (!systemFactorySelect.dataset.listenerBound) {
        systemFactorySelect.addEventListener('change', (e) => {
          const plantCode = e.target.value;
          console.log(`🏭 system-factory-select changed to ${plantCode}`);
          
          this.state.plantRiskActivePlant = plantCode;
          this.state.selectedPlant = plantCode;
          
          // Sync other related dropdowns & filter elements
          const tabSelect = document.getElementById('tab3-plant-select');
          if (tabSelect) tabSelect.value = plantCode;

          const globalFilter = document.getElementById('filter-plant');
          if (globalFilter) globalFilter.value = plantCode;
          
          // Re-render
          this.renderPlantRiskScreen();
          this.showToast(`${plantCode} 공장으로 리스크 돋보기가 전환되었습니다.`, "success");
        });
        systemFactorySelect.dataset.listenerBound = 'true';
      }
    }

    const processList = ['Incoming', 'Mixing', 'Extruding', 'Calendering', 'Cutting', 'Bead', 'Building', 'Curing', 'Inspection', 'Shipping'];
    const allAssessmentItems = this.state.oeQualityAssessmentDetails || [];

    const perfectData = [];
    const warningData = [];
    const criticalData = [];
    const complianceData = [];

    processList.forEach(p => {
      const pItems = allAssessmentItems.filter(item => 
        item.plant === activePlantCode && 
        (item.process || '').toLowerCase() === p.toLowerCase() &&
        item.score && item.score.toString().trim().toUpperCase() !== 'N/A'
      );
      
      const infraItems = pItems.filter(item => item.category !== 'Process');
      let infraScore = 100.0;
      if (infraItems.length > 0) {
        const sum = infraItems.reduce((total, item) => total + parseFloat(item.score), 0);
        infraScore = (sum / (infraItems.length * 10)) * 100;
      }
      
      const procItems = pItems.filter(item => item.category === 'Process');
      let procScore = 100.0;
      if (procItems.length > 0) {
        const sum = procItems.reduce((total, item) => total + parseFloat(item.score), 0);
        procScore = (sum / (procItems.length * 10)) * 100;
      }
      
      const koName = {
        'Incoming': '수입검사',
        'Mixing': '정련',
        'Extruding': '압출',
        'Calendering': '압연',
        'Cutting': '재단',
        'Bead': '비드',
        'Building': '성형',
        'Curing': '가류',
        'Inspection': '완성검사',
        'Shipping': '물류출하'
      }[p] || p;
      
      const pt = { x: infraScore, y: procScore, label: `${koName} (${p})` };
      
      if (infraScore >= 80 && procScore >= 80) {
        perfectData.push(pt);
      } else if (infraScore >= 60 && procScore >= 60) {
        warningData.push(pt);
      } else {
        criticalData.push(pt);
      }

      // Bar Chart compliance
      let overallScore = 0;
      if (pItems.length > 0) {
        const sum = pItems.reduce((total, item) => total + parseFloat(item.score), 0);
        overallScore = (sum / (pItems.length * 10)) * 100;
      }
      complianceData.push(overallScore);
    });

    // 1. 2D Scatter Chart (System Map)
    const ctxScatter = document.getElementById('chart-scatter-system-map');
    if (ctxScatter && typeof Chart !== 'undefined') {
      if (this.state.charts.scatterSystemMap) {
        this.state.charts.scatterSystemMap.destroy();
        this.state.charts.scatterSystemMap = null;
      }

      const leaderLinePlugin = {
        id: 'leaderLinePlugin',
        afterDatasetsDraw(chart, args, options) {
          const { ctx, scales: { x, y } } = chart;
          ctx.save();
          
          chart.data.datasets.forEach((dataset, datasetIndex) => {
            const meta = chart.getDatasetMeta(datasetIndex);
            meta.data.forEach((point, index) => {
              const dataPoint = dataset.data[index];
              if (!dataPoint) return;
              const label = dataPoint.label;
              const { x: px, y: py } = point;
              
              const chartCenterX = (x.min + x.max) / 2;
              const isLeftHemisphere = dataPoint.x < chartCenterX;
              
              const dx = isLeftHemisphere ? 40 : -40;
              const dy = 25;
              const tx = px + dx;
              const ty = py + dy;
              
              ctx.strokeStyle = 'rgba(15, 23, 42, 0.15)';
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(px, py);
              ctx.lineTo(tx, ty);
              ctx.stroke();
              
              ctx.fillStyle = '#334155';
              ctx.font = 'bold 10px Inter, "맑은 고딕"';
              ctx.textAlign = isLeftHemisphere ? 'left' : 'right';
              ctx.textBaseline = 'middle';
              ctx.fillText(label, tx + (isLeftHemisphere ? 4 : -4), ty);
            });
          });
          ctx.restore();
        }
      };

      this.state.charts.scatterSystemMap = new Chart(ctxScatter, {
        type: 'scatter',
        plugins: [leaderLinePlugin],
        data: {
          datasets: [
            {
              label: 'Perfect (안정 우수)',
              data: perfectData,
              backgroundColor: '#10b981',
              borderColor: '#10b981',
              pointRadius: 6,
              pointHoverRadius: 8
            },
            {
              label: 'Warning (보완 필요)',
              data: warningData,
              backgroundColor: '#f59e0b',
              borderColor: '#f59e0b',
              pointRadius: 6,
              pointHoverRadius: 8
            },
            {
              label: 'Critical (고위험 취약)',
              data: criticalData,
              backgroundColor: '#ef4444',
              borderColor: '#ef4444',
              pointRadius: 6,
              pointHoverRadius: 8
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: '#475569',
                font: { family: 'Inter', size: 11, weight: '600' }
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `${context.raw.label}: Infra ${context.raw.x.toFixed(1)}%, Compliance ${context.raw.y.toFixed(1)}%`;
                }
              }
            }
          },
          scales: {
            x: {
              min: 30,
              max: 110,
              grid: { color: 'rgba(15, 23, 42, 0.05)' },
              ticks: {
                color: '#475569',
                font: { family: 'Inter', size: 10 },
                callback: function(value) {
                  return value > 100 ? '' : value + '%';
                }
              },
              title: {
                display: true,
                text: 'Infrastructure Score (%)',
                color: '#475569',
                font: { family: 'Inter', size: 11, weight: 'bold' }
              }
            },
            y: {
              min: 30,
              max: 110,
              grid: { color: 'rgba(15, 23, 42, 0.05)' },
              ticks: {
                color: '#475569',
                font: { family: 'Inter', size: 10 },
                callback: function(value) {
                  return value > 100 ? '' : value + '%';
                }
              },
              title: {
                display: true,
                text: 'Process Compliance (%)',
                color: '#475569',
                font: { family: 'Inter', size: 11, weight: 'bold' }
              }
            }
          }
        }
      });
    }

    // 2. Bar Chart (Process Compliance)
    const barColors = complianceData.map(val => {
      if (val >= 95) return 'rgba(16, 185, 129, 0.7)'; // Perfect HSL Low
      if (val >= 85) return 'rgba(245, 158, 11, 0.7)'; // Warning HSL Medium
      return 'rgba(239, 68, 68, 0.7)'; // Critical HSL High
    });
    
    const barBorders = complianceData.map(val => {
      if (val >= 95) return '#10b981';
      if (val >= 85) return '#f59e0b';
      return '#ef4444';
    });

    const ctxBar = document.getElementById('chart-bar-compliance');
    if (ctxBar && typeof Chart !== 'undefined') {
      if (this.state.charts.barCompliance) {
        this.state.charts.barCompliance.destroy();
        this.state.charts.barCompliance = null;
      }
      
      this.state.charts.barCompliance = new Chart(ctxBar, {
        type: 'bar',
        data: {
          labels: processList.map(p => {
            return {
              'Incoming': '수입검사',
              'Mixing': '정련',
              'Extruding': '압출',
              'Calendering': '압연',
              'Cutting': '재단',
              'Bead': '비드',
              'Building': '성형',
              'Curing': '가류',
              'Inspection': '완성검사',
              'Shipping': '물류출하'
            }[p] || p;
          }),
          datasets: [{
            label: '현장 실사 부합도 (%)',
            data: complianceData,
            backgroundColor: barColors,
            borderColor: barBorders,
            borderWidth: 1.5,
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `부합도: ${context.raw.toFixed(1)}%`;
                }
              }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: {
                color: '#475569',
                font: { family: 'Inter', size: 10, weight: '600' }
              }
            },
            y: {
              min: 30,
              max: 100,
              grid: { color: 'rgba(15, 23, 42, 0.05)' },
              ticks: {
                color: '#475569',
                font: { family: 'Inter', size: 10 },
                stepSize: 10,
                callback: function(value) { return value + '%'; }
              }
            }
          }
        }
      });
    }

    // 3. 260-item Quality Matrix Table & Integrated Filter Bar 렌더링 및 바인딩
    if (!this.state.systemFilters) {
      this.state.systemFilters = {
        process: 'ALL',
        category: 'ALL',
        keyword: ''
      };
    }

    // 공정 필터 이벤트 바인딩
    const processFilterSelect = document.getElementById('system-process-filter');
    if (processFilterSelect) {
      processFilterSelect.value = this.state.systemFilters.process;
      if (!processFilterSelect.dataset.listenerBound) {
        processFilterSelect.addEventListener('change', (e) => {
          this.state.systemFilters.process = e.target.value;
          this.renderSystemMatrixTable(activePlantCode);
        });
        processFilterSelect.dataset.listenerBound = 'true';
      }
    }

    // 구분 필터 (버튼 그룹) 이벤트 바인딩
    const catButtons = document.querySelectorAll('.system-cat-btn');
    catButtons.forEach(btn => {
      const cat = btn.getAttribute('data-category');
      
      // 현재 상태에 맞게 active 클래스 동기화
      if (cat === this.state.systemFilters.category) {
        btn.classList.add('active');
        btn.style.background = 'var(--brand-blue)';
        btn.style.color = '#ffffff';
      } else {
        btn.classList.remove('active');
        btn.style.background = 'transparent';
        btn.style.color = 'var(--text-secondary)';
      }

      if (!btn.dataset.listenerBound) {
        btn.addEventListener('click', () => {
          this.state.systemFilters.category = cat;
          
          catButtons.forEach(b => {
            if (b === btn) {
              b.classList.add('active');
              b.style.background = 'var(--brand-blue)';
              b.style.color = '#ffffff';
            } else {
              b.classList.remove('active');
              b.style.background = 'transparent';
              b.style.color = 'var(--text-secondary)';
            }
          });

          this.renderSystemMatrixTable(activePlantCode);
        });
        btn.dataset.listenerBound = 'true';
      }
    });

    // 키워드 검색 이벤트 바인딩
    const kwInput = document.getElementById('system-keyword-search');
    if (kwInput) {
      kwInput.value = this.state.systemFilters.keyword;
      if (!kwInput.dataset.listenerBound) {
        let debounceTimer;
        kwInput.addEventListener('input', (e) => {
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            this.state.systemFilters.keyword = e.target.value.trim();
            this.renderSystemMatrixTable(activePlantCode);
          }, 200);
        });
        kwInput.dataset.listenerBound = 'true';
      }
    }

    // 첫 테이블 드로잉
    this.renderSystemMatrixTable(activePlantCode);
  },

  // ================= 260-item Quality Matrix Table 렌더링 엔진 =================
  renderSystemMatrixTable(activePlantCode) {
    console.log(`🗂️ Rendering System Matrix Table for active plant: ${activePlantCode}`);
    const tableBox = document.getElementById('system-matrix-table-box');
    if (!tableBox) {
      console.warn('⚠️ system-matrix-table-box element not found in DOM.');
      return;
    }

    const allAssessmentItems = this.state.oeQualityAssessmentDetails || [];
    const plants = ['KP', 'DP', 'JP', 'CP', 'HP', 'IP', 'MP', 'TP'];

    // 1. 고유 항목 맵 생성 (Union)
    const uniqueItemsMap = {};
    allAssessmentItems.forEach(item => {
      const key = `${item.process}_${item.category}_${item.item_no}`;
      if (!uniqueItemsMap[key]) {
        uniqueItemsMap[key] = {
          process: item.process,
          category: item.category,
          item_no: parseInt(item.item_no) || item.item_no,
          area: item.area || '',
          check_item: item.check_item || '',
          scores: {}
        };
      }
      if (item.plant) {
        uniqueItemsMap[key].scores[item.plant] = item.score;
      }
    });

    const uniqueItems = Object.values(uniqueItemsMap);

    // 2. 동적 정렬 (Sorted Matrix Grid Flow)
    // 10대 표준 공정 순서 배치 -> 각 공정 내에서 Infra 요건 상단, Process 이행 요건 하단 -> 항목 번호 오름차순
    const processOrder = [
      'Incoming', 'Mixing', 'Extruding', 'Calendering', 'Cutting', 
      'Bead', 'Building', 'Curing', 'Inspection', 'Shipping'
    ];

    uniqueItems.sort((a, b) => {
      const idxA = processOrder.indexOf(a.process);
      const idxB = processOrder.indexOf(b.process);
      if (idxA !== idxB) return idxA - idxB;
      
      const isInfraA = a.category !== 'Process' ? 1 : 0;
      const isInfraB = b.category !== 'Process' ? 1 : 0;
      if (isInfraA !== isInfraB) {
        return isInfraB - isInfraA; // Infra 요건이 먼저 오도록 내림차순
      }
      
      return a.item_no - b.item_no;
    });

    // 3. 필터 복합 연동
    if (!this.state.systemFilters) {
      this.state.systemFilters = {
        process: 'ALL',
        category: 'ALL',
        keyword: ''
      };
    }

    const filteredItems = uniqueItems.filter(item => {
      // 공정 필터링
      if (this.state.systemFilters.process !== 'ALL') {
        if (item.process !== this.state.systemFilters.process) return false;
      }
      
      // 구분 필터링
      if (this.state.systemFilters.category === 'Infra') {
        if (item.category === 'Process') return false;
      } else if (this.state.systemFilters.category === 'Process') {
        if (item.category !== 'Process') return false;
      }
      
      // 키워드 필터링 (대소문자 무관)
      if (this.state.systemFilters.keyword) {
        const kw = this.state.systemFilters.keyword.toLowerCase();
        const matchCheckItem = (item.check_item || '').toLowerCase().includes(kw);
        const matchProcess = (item.process || '').toLowerCase().includes(kw);
        const matchArea = (item.area || '').toLowerCase().includes(kw);
        if (!matchCheckItem && !matchProcess && !matchArea) return false;
      }
      
      return true;
    });

    // 4. 점수 변환 뱃지 헬퍼
    const getScoreBadge = (scoreVal) => {
      const naStyle = `display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; border-radius: 50%; background: #cbd5e1; color: #475569; font-size: 9px; font-weight: bold;`;
      if (scoreVal === undefined || scoreVal === null) {
        return `<span style="${naStyle}" title="해당없음 (N/A)">-</span>`;
      }
      const strScore = scoreVal.toString().trim().toUpperCase();
      if (strScore === 'N/A' || strScore === '') {
        return `<span style="${naStyle}" title="해당없음 (N/A)">-</span>`;
      }
      
      const score = parseFloat(strScore);
      if (isNaN(score)) {
        return `<span style="${naStyle}" title="해당없음 (N/A)">-</span>`;
      }
      
      if (score >= 9.0) {
        return `<span style="display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; border-radius: 50%; background: #10b981; color: #ffffff; font-size: 11px; font-weight: bold;" title="우수 (9점 이상)">3</span>`;
      } else if (score >= 7.0) {
        return `<span style="display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; border-radius: 50%; background: #3b82f6; color: #ffffff; font-size: 11px; font-weight: bold;" title="양호 (7점~9점 미만)">2</span>`;
      } else if (score >= 5.0) {
        return `<span style="display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; border-radius: 50%; background: #f59e0b; color: #ffffff; font-size: 11px; font-weight: bold;" title="보완 (5점~7점 미만)">1</span>`;
      } else {
        return `<span style="display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; border-radius: 50%; background: #ec4899; color: #ffffff; font-size: 11px; font-weight: bold;" title="취약 (5점 미만)">0</span>`;
      }
    };

    // 5. 테이블 드로잉
    if (filteredItems.length === 0) {
      tableBox.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 50px 20px; text-align: center; background: #ffffff; border-radius: 8px;">
          <i data-lucide="info" style="width: 32px; height: 32px; color: var(--text-muted-light); margin-bottom: 12px;"></i>
          <span style="font-size: 13.5px; font-weight: bold; color: var(--text-secondary); margin-bottom: 4px;">일치하는 점검 요건 없음</span>
          <span style="font-size: 12px; color: var(--text-muted-light);">조건에 부합하는 품질 인프라 평가 데이터가 존재하지 않습니다. 필터링 조건을 변경해보십시오.</span>
        </div>
      `;
      if (typeof lucide !== 'undefined') lucide.createIcons();
      return;
    }

    // 헤더 렌더링
    const plantHeaders = plants.map(p => {
      const isActive = (p === activePlantCode);
      const cellStyle = isActive 
        ? `background: #eef2ff; color: var(--brand-blue); border-left: 2px solid var(--brand-blue); border-right: 2px solid var(--brand-blue); border-top: 2px solid var(--brand-blue); border-bottom: 2px solid var(--brand-blue); position: sticky; top: 0; z-index: 11; font-weight: 800;` 
        : `background: #f8fafc; color: var(--text-secondary); position: sticky; top: 0; z-index: 10;`;
      return `<th class="plant-col ${isActive ? 'active-col' : ''}" style="${cellStyle} text-align: center; font-size: 11.5px; padding: 10px 6px; width: 56px; border-bottom: 1px solid var(--border-card);">${p}</th>`;
    }).join('');

    let tableHtml = `
      <table style="width: 100%; border-collapse: separate; border-spacing: 0; text-align: left; font-family: 'Inter', sans-serif; table-layout: fixed;">
        <thead>
          <tr style="background: #f8fafc;">
            <th style="position: sticky; top: 0; z-index: 10; background: #f8fafc; font-size: 11.5px; font-weight: bold; color: var(--text-secondary); padding: 10px 12px; border-bottom: 1px solid var(--border-card); width: 100px;">공정</th>
            <th style="position: sticky; top: 0; z-index: 10; background: #f8fafc; font-size: 11.5px; font-weight: bold; color: var(--text-secondary); padding: 10px 4px; border-bottom: 1px solid var(--border-card); width: 50px; text-align: center;">구분</th>
            <th style="position: sticky; top: 0; z-index: 10; background: #f8fafc; font-size: 11.5px; font-weight: bold; color: var(--text-secondary); padding: 10px 4px; border-bottom: 1px solid var(--border-card); width: 50px; text-align: center;">번호</th>
            <th style="position: sticky; top: 0; z-index: 10; background: #f8fafc; font-size: 11.5px; font-weight: bold; color: var(--text-secondary); padding: 10px 12px; border-bottom: 1px solid var(--border-card); width: auto; min-width: 250px;">점검 요건 (Check Item)</th>
            ${plantHeaders}
          </tr>
        </thead>
        <tbody>
    `;

    // 행 렌더링
    filteredItems.forEach((item, idx) => {
      const processKo = {
        'Incoming': '수입검사',
        'Mixing': '정련',
        'Extruding': '압출',
        'Calendering': '압연',
        'Cutting': '재단',
        'Bead': '비드',
        'Building': '성형',
        'Curing': '가류',
        'Inspection': '완성검사',
        'Shipping': '물류출하'
      }[item.process] || item.process;

      const categoryBadge = item.category === 'Process' 
        ? `<span style="display: inline-block; padding: 2px 6px; font-size: 10px; font-weight: bold; background: #eff6ff; color: #1d4ed8; border-radius: 4px; border: 1px solid #bfdbfe;">P</span>`
        : `<span style="display: inline-block; padding: 2px 6px; font-size: 10px; font-weight: bold; background: #f0fdf4; color: #15803d; border-radius: 4px; border: 1px solid #86efac;">I</span>`;

      const rowBg = idx % 2 === 1 ? '#fafafa' : '#ffffff';
      
      const plantCells = plants.map(p => {
        const isActive = (p === activePlantCode);
        const scoreVal = item.scores[p];
        const badgeHtml = getScoreBadge(scoreVal);
        
        const isLastRow = (idx === filteredItems.length - 1);
        const bottomBorder = isLastRow 
          ? `border-bottom: 2px solid var(--brand-blue);` 
          : `border-bottom: 1px solid #f1f5f9;`;

        const cellStyle = isActive 
          ? `background: #f5f8ff; border-left: 2px solid var(--brand-blue); border-right: 2px solid var(--brand-blue); ${bottomBorder} text-align: center; vertical-align: middle; padding: 8px 6px; width: 56px;` 
          : `text-align: center; vertical-align: middle; padding: 8px 6px; border-bottom: 1px solid #f1f5f9; width: 56px;`;
        return `<td class="plant-cell ${isActive ? 'active-cell' : ''}" style="${cellStyle}">${badgeHtml}</td>`;
      }).join('');

      tableHtml += `
        <tr class="matrix-row" style="background: ${rowBg};">
          <td style="font-size: 11px; font-weight: 600; color: var(--text-primary); padding: 10px 12px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${processKo}">${processKo}</td>
          <td style="text-align: center; padding: 10px 4px; border-bottom: 1px solid #f1f5f9; vertical-align: middle;">${categoryBadge}</td>
          <td style="text-align: center; font-size: 11px; font-weight: bold; color: var(--text-muted-light); padding: 10px 4px; border-bottom: 1px solid #f1f5f9; vertical-align: middle;">${item.item_no}</td>
          <td style="font-size: 11.5px; color: var(--text-primary); padding: 10px 14px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; white-space: normal; word-break: break-word; line-height: 1.45;" title="${item.check_item.replace(/"/g, '&quot;')}">${item.check_item}</td>
          ${plantCells}
        </tr>
      `;
    });

    tableHtml += `
        </tbody>
      </table>
    `;

    tableBox.innerHTML = tableHtml;
    if (typeof lucide !== 'undefined') lucide.createIcons();
  },

  // ================= Sub-Tab 3: AI Custom Audit 렌더링 =================
  renderCustomAuditTab(activePlantCode) {
    console.log(`🤖 Rendering AI Custom Audit sub-tab for plant: ${activePlantCode}`);

    const activeCustomer = this.state.tab3Customer || 'ALL';
    const activeProcess = this.state.tab3Process || 'ALL';

    // 컨트롤 패널의 엘리먼트 값 동기화 유지
    const plantSelect = document.getElementById('tab3-plant-select');
    if (plantSelect) plantSelect.value = activePlantCode;

    const customerSelect = document.getElementById('tab3-customer-select');
    if (customerSelect) customerSelect.value = activeCustomer;

    const purposeSelect = document.getElementById('tab3-purpose-select');
    if (purposeSelect) purposeSelect.value = this.state.tab3Purpose;

    const startDateInput = document.getElementById('tab3-start-date');
    if (startDateInput) startDateInput.value = this.state.tab3StartDate;

    const endDateInput = document.getElementById('tab3-end-date');
    if (endDateInput) endDateInput.value = this.state.tab3EndDate;

    // ① 11대 공정 리본 필터 렌더링
    this.renderProcessRibbon();

    // ② 상단 테이블: 완성차 고객사 감사 지적 이력 기반 맞춤형 체크시트 렌더링
    this.renderCustomerAuditChecklist(activePlantCode, activeCustomer, activeProcess);

    // ③ 하단 실사 취약점 & 우수 조항 테이블 렌더링 (6점 이하 / 8점 이상 구조)
    this.renderQualityAssessmentDetails(activePlantCode, activeProcess);

    // ④ AI 권고 Operational Actions 피드 렌더링 (CRI 및 8D 요약본 매칭)
    this.renderTab3AIRecommendations(activePlantCode, activeProcess);
  },

  // ① 상단 테이블: 완성차 고객사 감사 지적 이력 기반 맞춤형 체크시트 렌더링
  renderCustomerAuditChecklist(activePlantCode, activeCustomer, activeProcess) {
    const customerTableBox = document.getElementById('tab3-customer-audit-table-box');
    const noticeBanner = document.getElementById('tab3-fallback-notice');
    if (!customerTableBox) return;

    customerTableBox.innerHTML = '';

    let fallbackLevel = 1; // 1순위: 지정 공장 지정 고객사, 2순위: 타공장 해당 고객사, 3순위: 글로벌 대표 3대사 표준
    let targetFindings = [];

    // Filter helper function applying all active filters
    const getFiltered = (plantFilter, customerFilter) => {
      return (this.state.auditFindings || []).filter(item => {
        // Plant Match
        let isPlantMatch = true;
        if (plantFilter !== 'ALL') {
          isPlantMatch = item.PLANT === plantFilter;
        }

        // Customer Match
        let isCustomerMatch = true;
        if (customerFilter !== 'ALL') {
          isCustomerMatch = (item.CAR_MAKER || '').toLowerCase() === customerFilter.toLowerCase();
        }

        // Process Match
        let isProcMatch = true;
        if (activeProcess !== 'ALL') {
          const procCode = item._mappedProcess || this.getFindingProcess(item);
          isProcMatch = (procCode === activeProcess);
        }

        // Date Match
        let isDateMatch = true;
        const itemDate = item.REG_DT || item.START_DT || '';
        if (itemDate) {
          if (this.state.tab3StartDate && itemDate < this.state.tab3StartDate) {
            isDateMatch = false;
          }
          if (this.state.tab3EndDate && itemDate > this.state.tab3EndDate) {
            isDateMatch = false;
          }
        }

        return isPlantMatch && isCustomerMatch && isProcMatch && isDateMatch;
      });
    };

    // 💡 1순위: 선택한 공장 + 지정 고객사
    targetFindings = getFiltered(activePlantCode, activeCustomer);

    // 💡 2순위 (대안 참조): 1순위 전무할 시, 타 공장 전수 조사 후 해당 고객사 실제 감사 지적 이력 로드
    if (targetFindings.length === 0 && activeCustomer !== 'ALL') {
      fallbackLevel = 2;
      targetFindings = getFiltered('ALL', activeCustomer);
    }

    // 💡 3순위 (표준 오딧): 2순위 데이터마저 부재 시, 글로벌 대표 3대사 (Ford, BMW, Hyundai) 종합 지적 이력 결합
    if (targetFindings.length === 0 && activeCustomer !== 'ALL') {
      fallbackLevel = 3;
      targetFindings = (this.state.auditFindings || []).filter(item => {
        const isCustomerMatch = ['bmw', 'ford', 'hyundai'].includes((item.CAR_MAKER || '').toLowerCase());
        
        let isProcMatch = true;
        if (activeProcess !== 'ALL') {
          const procCode = item._mappedProcess || this.getFindingProcess(item);
          isProcMatch = (procCode === activeProcess);
        }

        let isDateMatch = true;
        const itemDate = item.REG_DT || item.START_DT || '';
        if (itemDate) {
          if (this.state.tab3StartDate && itemDate < this.state.tab3StartDate) {
            isDateMatch = false;
          }
          if (this.state.tab3EndDate && itemDate > this.state.tab3EndDate) {
            isDateMatch = false;
          }
        }

        return isCustomerMatch && isProcMatch && isDateMatch;
      });
    }

    // Dynamic Counts Calculation
    const totalCount = targetFindings.length;
    const localCount = targetFindings.filter(item => item.PLANT === activePlantCode).length;
    const otherCount = totalCount - localCount;

    // Update external count node if present
    const countNode = document.getElementById('tab3-customer-audit-count');
    if (countNode) {
      countNode.textContent = `${totalCount}개 항목`;
    }

    // ⚠️ 교차 참조 폴백 지능형 노티스 배너 노출 상태 동적 제어
    if (noticeBanner) {
      if (totalCount === 0) {
        noticeBanner.style.display = 'none';
      } else {
        noticeBanner.style.display = 'flex';
        noticeBanner.style.background = 'rgba(15, 23, 42, 0.94)';
        noticeBanner.style.borderColor = 'rgba(15, 23, 42, 0.94)';
        noticeBanner.style.borderLeft = '4px solid #0ea5e9';
        noticeBanner.style.color = '#ffffff';
        noticeBanner.style.borderRadius = '6px';
        noticeBanner.style.padding = '12px 16px';
        noticeBanner.style.fontSize = '11.5px';
        noticeBanner.style.lineHeight = '1.5';
        noticeBanner.style.marginBottom = '15px';
        noticeBanner.style.alignItems = 'center';
        noticeBanner.style.gap = '10px';
        noticeBanner.style.boxShadow = 'var(--shadow-sm)';

        let bannerHtml = '';
        if (fallbackLevel === 1) {
          bannerHtml = `
            <span style="font-size: 13px; color: #0ea5e9; flex-shrink: 0;">⚫</span>
            <span><strong>[지적 이력 교차분석 완료]</strong> 선택하신 공장(<strong>${activePlantCode}</strong>) 및 고객사(<strong>${activeCustomer === 'ALL' ? '전체 고객사' : activeCustomer}</strong>) 조회 조건에 따라 총 <strong>${totalCount}</strong>건의 감사 지적 이력이 연계 분석되었습니다. (본 공장 실적: <strong>${localCount}</strong>건, 타 공장 벤치마킹: <strong>${otherCount}</strong>건)</span>
          `;
        } else if (fallbackLevel === 2) {
          bannerHtml = `
            <span style="font-size: 13px; color: #0ea5e9; flex-shrink: 0;">⚫</span>
            <span><strong>[교차 참조 폴백 모드 가동]</strong> <u>${activePlantCode}</u> 공장에는 <strong>${activeCustomer}</strong>의 과거 감사 이력이 부재하여, <strong>타 생산 공정 및 공장 전수 실제 감사 지적 이력 (${totalCount}건)</strong>을 동적으로 수평 맵핑하여 벤치마킹 대안으로 노출 중입니다. (타 공장 벤치마킹: <strong>${otherCount}</strong>건)</span>
          `;
        } else {
          bannerHtml = `
            <span style="font-size: 13px; color: #f43f5e; flex-shrink: 0;">⚫</span>
            <span><strong>[글로벌 표준 참조 모드 가동]</strong> 당사 공정 전반에 <strong>${activeCustomer}</strong> 관련 과거 오딧 지적 이력이 완전히 부재하여, <strong>글로벌 대표 3대 완성차(BMW, Ford, Hyundai)</strong>의 종합 부적합 이력(<strong>${totalCount}</strong>건)을 표준 체크시트로 안전 탑재하여 교차 표출 중입니다.</span>
          `;
        }
        noticeBanner.innerHTML = bannerHtml;
      }
    }

    if (totalCount === 0) {
      customerTableBox.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 200px; color: var(--text-secondary); font-size: 13px; border: 1px dashed var(--border-card); border-radius: 8px;">
          <i data-lucide="shield-check" style="width: 32px; height: 32px; color: var(--color-status-low); margin-bottom: 8px;"></i>
          <span style="font-weight: 700; color: var(--text-primary);">조회 조건에 해당하는 감사 지적사항이 전혀 없습니다.</span>
          <span style="font-size: 11px; margin-top: 4px;">지정 공장 및 공정 품질 표준 준수율이 완벽히 안정적 상태입니다.</span>
        </div>
      `;
      return;
    }

    const table = document.createElement('table');
    table.className = 'data-table';
    table.style.cssText = 'width: 100%; border-collapse: collapse; font-size: 12px;';
    table.innerHTML = `
      <thead>
        <tr style="border-bottom: 1px solid var(--border-card); background: #f8fafc; position: sticky; top: 0; z-index: 10;">
          <th style="padding: 10px; font-weight: 700; color: var(--text-secondary); width: 110px; text-align: center;">구분 (TYPE)</th>
          <th style="padding: 10px; font-weight: 700; color: var(--text-secondary); width: 80px; text-align: center;">공장 (PLANT)</th>
          <th style="padding: 10px; font-weight: 700; color: var(--text-secondary); width: 90px; text-align: center;">고객사 (OEM)</th>
          <th style="padding: 10px; font-weight: 700; color: var(--text-secondary); width: 90px; text-align: center;">차종 (VEHICLE)</th>
          <th style="padding: 10px; font-weight: 700; color: var(--text-secondary); width: 100px; text-align: center;">발생일 (OCC DATE)</th>
          <th style="padding: 10px; font-weight: 700; color: var(--text-secondary); width: 115px; text-align: center;">조치예정일 (TARGET DATE)</th>
          <th style="padding: 10px; font-weight: 700; color: var(--text-secondary); text-align: left;">지적 사항 (POINT OUT)</th>
          <th style="padding: 10px; font-weight: 700; color: var(--text-secondary); text-align: left;">원인 분석 및 대책 (ROOT CAUSE & COUNTERMEASURE)</th>
          <th style="padding: 10px; font-weight: 700; color: var(--text-secondary); width: 100px; text-align: center;">상태 (STATUS)</th>
          <th style="padding: 10px; font-weight: 700; color: var(--text-secondary); width: 90px; text-align: center;">E-QMS LINK</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;

    const tbody = table.querySelector('tbody');

    targetFindings.forEach((item, index) => {
      const isOngoing = item.STATUS === 'On-going';
      const tr = document.createElement('tr');
      tr.style.cssText = `
        border-bottom: 1px solid var(--border-card);
        transition: background 0.15s;
        background: ${index % 2 === 1 ? '#f8fafc' : '#ffffff'};
      `;
      tr.onmouseenter = () => { tr.style.background = '#f1f5f9'; };
      tr.onmouseleave = () => { tr.style.background = index % 2 === 1 ? '#f8fafc' : '#ffffff'; };

      const fNo = item.DOC_NO || `FINDING-${index + 1}`;

      // Col 1 Badge
      const isLocal = item.PLANT === activePlantCode;
      const typeBadge = isLocal ? `
        <span style="
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 700;
          background: var(--bg-status-low);
          color: var(--text-status-low);
          border: 1px solid var(--border-status-low);
          white-space: nowrap;
        ">본공장 실적</span>
      ` : `
        <span style="
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 700;
          background: var(--bg-status-medium);
          color: var(--text-status-medium);
          border: 1px solid var(--border-status-medium);
          white-space: nowrap;
        ">타공장 벤치마킹</span>
      `;

      // Col 9 Status Badge (Outlined style, with high contrast colors conforming to WCAG 2.1 AA)
      const statusBadge = isOngoing ? `
        <span class="status-toggle-badge text-center" style="
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: 3px 8px;
          border-radius: 4px;
          font-weight: 700;
          background: var(--bg-status-high);
          color: var(--text-status-high);
          border: 1px solid var(--border-status-high);
          font-size: 11px;
          cursor: pointer;
          transition: all 0.15s ease-in-out;
          user-select: none;
        " onmouseover="this.style.background='rgba(239, 68, 68, 0.15)'" onmouseout="this.style.background='var(--bg-status-high)'">
          <span style="width: 6px; height: 6px; background: var(--text-status-high); border-radius: 50%; display: inline-block;"></span>
          On-going
        </span>
      ` : `
        <span class="status-toggle-badge text-center" style="
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: 3px 8px;
          border-radius: 4px;
          font-weight: 700;
          background: var(--bg-status-low);
          color: var(--text-status-low);
          border: 1px solid var(--border-status-low);
          font-size: 11px;
          cursor: pointer;
          transition: all 0.15s ease-in-out;
          user-select: none;
        " onmouseover="this.style.background='rgba(16, 185, 129, 0.15)'" onmouseout="this.style.background='var(--bg-status-low)'">
          <span style="width: 6px; height: 6px; background: var(--text-status-low); border-radius: 50%; display: inline-block;"></span>
          Closed
        </span>
      `;

      // 1. Process Code Mapping
      let procCode = item.PROCESS || item.process_category || item.process || item._mappedProcess;
      if (!procCode) {
        procCode = this.getFindingProcess(item);
        item._mappedProcess = procCode;
      } else {
        item._mappedProcess = procCode;
      }

      // 2. Multilingual values or fallback dictionary mapping
      if (!item.POINT_OUT || !item.ROOT_CAUSE_ANALYSIS || !item.COUNTER_MEASURE) {
        const fb = FALLBACK_FINDING_DICT[procCode] || FALLBACK_FINDING_DICT["System"];
        if (!item.POINT_OUT) {
          item.POINT_OUT = fb.POINT_OUT;
          item.POINT_OUT_KO = fb.POINT_OUT;
          item.POINT_OUT_EN = fb.POINT_OUT;
          item.POINT_OUT_ZH = fb.POINT_OUT;
        }
        if (!item.ROOT_CAUSE_ANALYSIS) item.ROOT_CAUSE_ANALYSIS = fb.ROOT_CAUSE_ANALYSIS;
        if (!item.COUNTER_MEASURE) item.COUNTER_MEASURE = fb.COUNTER_MEASURE;
      }

      // Multilingual Point Out text
      let pointOutText = item.POINT_OUT || '-';
      if (this.state.currentLang === 'KO' && (item.POINT_OUT_KO || item.POINT_OUT)) {
        pointOutText = item.POINT_OUT_KO || item.POINT_OUT;
      } else if (this.state.currentLang === 'EN' && (item.POINT_OUT_EN || item.POINT_OUT)) {
        pointOutText = item.POINT_OUT_EN || item.POINT_OUT;
      } else if (this.state.currentLang === 'ZH' && (item.POINT_OUT_ZH || item.POINT_OUT)) {
        pointOutText = item.POINT_OUT_ZH || item.POINT_OUT;
      }

      // Multilingual Root Cause text
      let rootCauseText = item.ROOT_CAUSE_ANALYSIS || '-';
      if (this.state.currentLang === 'KO' && (item.ROOT_CAUSE_KO || item.ROOT_CAUSE_ANALYSIS)) {
        rootCauseText = item.ROOT_CAUSE_KO || item.ROOT_CAUSE_ANALYSIS;
      } else if (this.state.currentLang === 'EN' && (item.ROOT_CAUSE_EN || item.ROOT_CAUSE_ANALYSIS)) {
        rootCauseText = item.ROOT_CAUSE_EN || item.ROOT_CAUSE_ANALYSIS;
      } else if (this.state.currentLang === 'ZH' && (item.ROOT_CAUSE_ZH || item.ROOT_CAUSE_ANALYSIS)) {
        rootCauseText = item.ROOT_CAUSE_ZH || item.ROOT_CAUSE_ANALYSIS;
      }

      // Multilingual Countermeasure text
      let counterMeasureText = item.COUNTER_MEASURE || '-';
      if (this.state.currentLang === 'KO' && (item.COUNTER_MEASURE_KO || item.COUNTER_MEASURE)) {
        counterMeasureText = item.COUNTER_MEASURE_KO || item.COUNTER_MEASURE;
      } else if (this.state.currentLang === 'EN' && (item.COUNTER_MEASURE_EN || item.COUNTER_MEASURE)) {
        counterMeasureText = item.COUNTER_MEASURE_EN || item.COUNTER_MEASURE;
      } else if (this.state.currentLang === 'ZH' && (item.COUNTER_MEASURE_ZH || item.COUNTER_MEASURE)) {
        counterMeasureText = item.COUNTER_MEASURE_ZH || item.COUNTER_MEASURE;
      }

      tr.innerHTML = `
        <td style="padding: 10px; text-align: center;">${typeBadge}</td>
        <td style="padding: 10px; text-align: center; font-weight: 700; color: var(--text-primary);">${item.PLANT || '-'}</td>
        <td style="padding: 10px; text-align: center; font-weight: 700; color: var(--brand-blue);">${item.CAR_MAKER || '-'}</td>
        <td style="padding: 10px; text-align: center; font-weight: 600; color: var(--text-primary); font-family: monospace;">${item.PROJECT || '-'}</td>
        <td style="padding: 10px; text-align: center; color: var(--text-secondary); font-family: monospace;">${item.REG_DT || item.START_DT || '-'}</td>
        <td style="padding: 10px; text-align: center; color: var(--text-secondary); font-family: monospace;">${item.COMP_DT || item.END_DT || '-'}</td>
        <td style="padding: 10px; line-height: 1.4; text-align: left;">
          <div style="font-weight: 700; color: var(--text-primary);">${item.SUBJECT || '-'}</div>
          <div style="font-size: 11px; color: var(--text-secondary); margin-top: 2px;">${pointOutText}</div>
        </td>
        <td style="padding: 10px; line-height: 1.4; text-align: left;">
          <div style="margin-bottom: 4px;">
            <strong style="color: var(--text-status-high);">[원인]</strong> 
            <span style="color: var(--text-primary); font-weight: 500;">${rootCauseText}</span>
          </div>
          <div>
            <strong style="color: var(--text-status-low);">[대책]</strong> 
            <span style="color: var(--text-primary); font-weight: 500;">${counterMeasureText}</span>
          </div>
        </td>
        <td style="padding: 10px; text-align: center;">${statusBadge}</td>
        <td style="padding: 10px; text-align: center;">
          <a href="${item.URL || item.url || '#'}" target="_blank" style="
            display: inline-flex;
            align-items: center;
            gap: 4px;
            color: var(--brand-blue);
            text-decoration: none;
            font-weight: 700;
            transition: color 0.15s;
          " onmouseover="this.style.color='#1d4ed8'" onmouseout="this.style.color='var(--brand-blue)'">
            <i data-lucide="external-link" style="width: 12px; height: 12px;"></i>
            열기
          </a>
        </td>
      `;

      // Bind click handler directly to status badge inside the row
      const badge = tr.querySelector('.status-toggle-badge');
      if (badge) {
        badge.onclick = (e) => {
          e.preventDefault();
          this.toggleFindingStatus(fNo);
        };
      }

      tbody.appendChild(tr);
    });

    customerTableBox.appendChild(table);
  },

  // ④ 지적사항 종결/재오픈 상태 토글 함수
  toggleFindingStatus(findingNo) {
    console.log(`🏭 Toggling Finding Status: ${findingNo}`);

    const finding = (this.state.auditFindings || []).find(item => item.DOC_NO === findingNo);
    if (!finding) {
      this.showToast("지적사항 식별자를 찾을 수 없습니다.", "warning");
      return;
    }

    const oldStatus = finding.STATUS;
    const newStatus = oldStatus === 'On-going' ? 'Closed' : 'On-going';

    finding.STATUS = newStatus;
    const today = new Date().toISOString().slice(0, 10);
    finding.COMP_DT = newStatus === 'Closed' ? today : '';

    // 로컬스토리지 즉각 동기화
    localStorage.setItem('riskhunter_findings', JSON.stringify(this.state.auditFindings));

    // 화면 갱신
    this.renderPlantRiskScreen();

    const plantName = (this.state.commonCodes.plants || []).find(p => p.code === finding.PLANT)?.name || finding.PLANT;
    if (newStatus === 'Closed') {
      this.showToast(`[${findingNo}] 조치 종결되었습니다. ${plantName} 공장 리스크 점수가 즉시 하락 적용되었습니다!`, "success");
    } else {
      this.showToast(`[${findingNo}] 지적사항이 재오픈되었습니다. ${plantName} 공장 리스크 점수가 다시 반영되었습니다.`, "warning");
    }
    this.logAction(null, `지적사항 상태 변경: [${findingNo}] ${finding.SUBJECT} -> [${newStatus}]`, 'action');
  },

  // ⑤ 신규 지적사항 등록 및 실시간 리스크 주입 함수
  saveFinding() {
    console.log("🏭 Registering New Field Finding...");

    const subjectNode = document.getElementById('action-logger-subject');
    const plantNode = document.getElementById('action-logger-plant');
    const customerNode = document.getElementById('action-logger-customer');
    const typeNode = document.getElementById('action-logger-type');
    const ownerNode = document.getElementById('action-logger-owner');
    const pointoutNode = document.getElementById('action-logger-pointout');
    const rootcauseNode = document.getElementById('action-logger-rootcause');
    const countermeasureNode = document.getElementById('action-logger-countermeasure');

    if (!subjectNode || !plantNode || !customerNode || !typeNode || !ownerNode || !pointoutNode) return;

    const subject = subjectNode.value.trim();
    const plant = plantNode.value;
    const customer = customerNode.value;
    const type = typeNode.value;
    const owner = ownerNode.value.trim();
    const pointout = pointoutNode.value.trim();
    const rootcause = rootcauseNode.value.trim() || '현장 정밀 근본원인 재분석 계획 수립';
    const countermeasure = countermeasureNode.value.trim() || 'SOP 개정 및 설비 보완 프로세스 보완 예정';

    if (!subject) {
      this.showToast("지적사항 제목(Subject)을 기입하십시오.", "warning");
      subjectNode.focus();
      return;
    }
    if (!owner) {
      this.showToast("조치 담당자(Owner)를 기입하십시오.", "warning");
      ownerNode.focus();
      return;
    }
    if (!pointout) {
      this.showToast("오디터 지적 코멘트(Point Out)를 기입하십시오.", "warning");
      pointoutNode.focus();
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const timestamp = new Date().getTime();
    const newDocNo = `FINDING-${timestamp}`;

    const newFinding = {
      DOC_NO: newDocNo,
      TYPE: type,
      SUBJECT: subject,
      START_DT: today,
      END_DT: '',
      OWNER_ID: owner,
      REG_DT: today,
      COMP_DT: '',
      STATUS: 'On-going',
      PLANT: plant,
      CAR_MAKER: customer,
      PROJECT: 'General',
      M_CODE: 'General-Spec',
      
      // 원문 컬럼
      POINT_OUT: pointout,
      ROOT_CAUSE_ANALYSIS: rootcause,
      COUNTER_MEASURE: countermeasure,
      
      // 🌐 다국어 지원 대응 초기화 맵핑
      POINT_OUT_KO: pointout,
      POINT_OUT_EN: pointout,
      POINT_OUT_ZH: pointout,
      ROOT_CAUSE_KO: rootcause,
      ROOT_CAUSE_EN: rootcause,
      ROOT_CAUSE_ZH: rootcause,
      COUNTER_MEASURE_KO: countermeasure,
      COUNTER_MEASURE_EN: countermeasure,
      COUNTER_MEASURE_ZH: countermeasure
    };

    if (!this.state.auditFindings) {
      this.state.auditFindings = [];
    }
    this.state.auditFindings.unshift(newFinding);

    // 공정 정규식 매핑 엔진 실행
    this.preProcessData();

    // 로컬스토리지 영속 저장
    localStorage.setItem('riskhunter_findings', JSON.stringify(this.state.auditFindings));

    // 신규 등록된 공장을 활성 공장으로 픽스하여 사용자 확인 편의성 극대화
    this.state.plantRiskActivePlant = plant;
    this.state.selectedPlant = plant;

    const filterPlant = document.getElementById('filter-plant');
    if (filterPlant) {
      filterPlant.value = plant;
    }

    // 입력 폼 비우기
    subjectNode.value = '';
    ownerNode.value = '';
    pointoutNode.value = '';
    rootcauseNode.value = '';
    countermeasureNode.value = '';

    // 입력 모달 닫기
    const modal = document.getElementById('modal-register-finding');
    if (modal) {
      modal.style.display = 'none';
    }

    this.showToast(`[${newDocNo}] 신규 지적사항이 기입되었으며, ${plant} 공장의 리스크가 즉시 상승 주입되었습니다!`, "success");
    
    const pName = (this.state.commonCodes?.plants || []).find(p => p.code === plant)?.name || plant;
    this.logAction(null, `신규 지적사항 등록: [${pName}] [${newDocNo}] ${subject} (담당: ${owner})`, 'action');

    this.renderPlantRiskScreen();
    this.renderDashboard();
  },

  // 💡 ⑤ 11대 공정 리본 필터 렌더러
  renderProcessRibbon() {
    const ribbon = document.getElementById('tab3-process-ribbon');
    if (!ribbon) return;

    const processes = [
      { code: 'ALL', name: '전체 (ALL)' },
      { code: 'Incoming', name: 'INCOMING (수입검사)' },
      { code: 'Mixing', name: 'MIXING (정련)' },
      { code: 'Extruding', name: 'EXTRUDING (압출)' },
      { code: 'Calendering', name: 'CALENDERING (압연)' },
      { code: 'Cutting', name: 'CUTTING (재단)' },
      { code: 'Bead', name: 'BEAD (비드)' },
      { code: 'Building', name: 'BUILDING (성형)' },
      { code: 'Curing', name: 'CURING (가류)' },
      { code: 'Inspection', name: 'INSPECTION (완성검사)' },
      { code: 'Shipping', name: 'SHIPPING (물류 출하)' }
    ];

    const activeProcess = this.state.tab3Process || 'ALL';
    ribbon.innerHTML = '';

    processes.forEach(proc => {
      const btn = document.createElement('button');
      btn.className = 'btn';
      const isActive = proc.code === activeProcess;
      
      btn.style.cssText = `
        padding: 8px 16px;
        font-size: 11.5px;
        font-weight: 700;
        border-radius: 6px;
        white-space: nowrap;
        cursor: pointer;
        transition: all 0.2s ease-in-out;
        border: 1px solid ${isActive ? 'var(--brand-blue)' : 'var(--border-input)'};
        background: ${isActive ? 'var(--bg-status-info)' : 'var(--bg-card)'};
        color: ${isActive ? 'var(--brand-blue)' : 'var(--text-secondary)'};
        box-shadow: var(--shadow-sm);
      `;

      btn.onmouseover = () => {
        if (!isActive) {
          btn.style.background = '#f1f5f9';
          btn.style.borderColor = 'var(--border-input)';
          btn.style.color = 'var(--text-primary)';
        }
      };
      btn.onmouseout = () => {
        if (!isActive) {
          btn.style.background = 'var(--bg-card)';
          btn.style.borderColor = 'var(--border-input)';
          btn.style.color = 'var(--text-secondary)';
        }
      };

      btn.onclick = () => {
        this.state.tab3Process = proc.code;
        this.renderPlantRiskScreen();
      };

      btn.textContent = proc.name;
      ribbon.appendChild(btn);
    });
  },

  // 💡 ⑥ 하단 실사 취약점 및 우수 조항 테이블 렌더링
  renderQualityAssessmentDetails(activePlantCode, activeProcess) {
    const prepTableBox = document.getElementById('tab3-priority-prep-table-box');
    const excellentTableBox = document.getElementById('tab3-excellent-items-table-box');
    if (!prepTableBox || !excellentTableBox) return;

    prepTableBox.innerHTML = '';
    excellentTableBox.innerHTML = '';

    const allAssessmentItems = this.state.oeQualityAssessmentDetails || [];

    // 활성 공장의 데이터만 필터링
    const plantItems = allAssessmentItems.filter(item => item.plant === activePlantCode);

    // 공정 필터링
    let filteredItems = plantItems;
    if (activeProcess !== 'ALL') {
      filteredItems = plantItems.filter(item => {
        const procCode = item.process || '';
        return procCode.toLowerCase() === activeProcess.toLowerCase();
      });
    }

    // N/A 제외 대상만 점수 숫자로 파싱
    const validItems = filteredItems.filter(item => {
      if (!item.score || item.score.toString().trim().toUpperCase() === 'N/A') return false;
      return true;
    });

    // 🚨 A. 최우선 준비 아이템 (Score <= 6)
    const prepItems = validItems.filter(item => parseFloat(item.score) <= 6);

    // 공정 순서 및 점수 낮은 순(Worst Score)으로 정렬
    const processOrder = ['Incoming', 'Mixing', 'Extruding', 'Calendering', 'Cutting', 'Bead', 'Building', 'Curing', 'Inspection', 'Shipping'];
    prepItems.sort((a, b) => {
      const orderA = processOrder.indexOf(a.process);
      const orderB = processOrder.indexOf(b.process);
      if (orderA !== orderB) return orderA - orderB;
      return parseFloat(a.score) - parseFloat(b.score); // 오름차순 (Worst Score 최상단)
    });

    // 🌟 B. 표준 우수 관리 항목 (Score >= 8)
    const excellentItems = validItems.filter(item => parseFloat(item.score) >= 8);

    // A. 최우선 준비 아이템 테이블 채우기
    if (prepItems.length === 0) {
      prepTableBox.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding:30px; color:var(--text-secondary); border:1px dashed rgba(255,255,255,0.05); border-radius:6px; font-size:12px;">
          <i data-lucide="shield-check" style="width:24px; height:24px; color:#00ff66; margin-bottom:6px;"></i>
          <span style="font-weight:700; color:var(--text-primary);">6점 이하 취약 항목이 없습니다.</span>
          <span>현장 공정이 안정적인 안전 제어 영역에 도달했습니다.</span>
        </div>
      `;
    } else {
      const table = document.createElement('table');
      table.className = 'data-table';
      table.style.cssText = 'width: 100%; border-collapse: collapse; font-size: 12px;';
      table.innerHTML = `
        <thead>
          <tr style="border-bottom: 1px solid var(--border-card); background: #f8fafc; position: sticky; top: 0; z-index: 10;">
            <th style="padding: 10px; font-weight: 700; color: var(--text-secondary); width: 100px;">공정</th>
            <th style="padding: 10px; font-weight: 700; color: var(--text-secondary); width: 150px;">체크 요건 (항목)</th>
            <th style="padding: 10px; font-weight: 700; color: var(--text-secondary); width: 60px; text-align: center;">점수</th>
            <th style="padding: 10px; font-weight: 700; color: var(--text-secondary);">현장 실사 지적</th>
            <th style="padding: 10px; font-weight: 700; color: var(--text-secondary); width: 220px;">💡 우수 공장 Peer 벤치마킹</th>
          </tr>
        </thead>
        <tbody></tbody>
      `;
      const tbody = table.querySelector('tbody');

      prepItems.forEach((item, index) => {
        // Peer Benchmarking: 타 공장 중 해당 check_item에 대해 10점 득점한 공장 검색
        const peers = allAssessmentItems.filter(pItem => 
          pItem.check_item === item.check_item && 
          parseFloat(pItem.score) === 10 && 
          pItem.plant !== activePlantCode
        );

        let peerHtml = '';
        if (peers.length > 0) {
          const plantList = peers.map(p => p.plant).join(', ');
          const bestPractice = peers[0].findings || peers[0].guidance || 'SOP 정량 준수 및 디지털 실시간 모니터링 적용';
          peerHtml = `
            <div style="background: var(--bg-status-info); border: 1px solid var(--border-status-info); border-radius: 4px; padding: 6px 10px; font-size: 11px; color: var(--text-status-info); line-height: 1.4;">
              <div style="font-weight:800; display:flex; align-items:center; gap:4px; margin-bottom:2px;">
                <span style="display:inline-block; width:4px; height:4px; background:var(--color-status-info); border-radius:50%;"></span>
                모범: ${plantList}공장 (10점 만점)
              </div>
              <div style="color:var(--text-primary); text-overflow:ellipsis; overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;">
                ${bestPractice}
              </div>
            </div>
          `;
        } else {
          peerHtml = `
            <div style="background: var(--bg-app); border: 1px solid var(--border-card); border-radius: 4px; padding: 6px 10px; font-size: 11px; color: var(--text-muted-light); line-height: 1.4;">
              <div style="font-weight:700; color:var(--text-secondary);">글로벌 대표 3대사 표준</div>
              <div>Standard SOP 지침 준수 및 계측기 이상 한계 관리 적용</div>
            </div>
          `;
        }

        const tr = document.createElement('tr');
        tr.style.cssText = `
          border-bottom: 1px solid var(--border-card);
          transition: background 0.15s;
          background: ${index % 2 === 1 ? '#f8fafc' : '#ffffff'};
        `;
        tr.onmouseenter = () => { tr.style.background = '#f1f5f9'; };
        tr.onmouseleave = () => { tr.style.background = index % 2 === 1 ? '#f8fafc' : '#ffffff'; };

        tr.innerHTML = `
          <td style="padding: 10px;"><span style="font-size:11px; font-weight:700; background:var(--bg-status-high); border:1px solid var(--border-status-high); padding:2px 6px; border-radius:4px; color:var(--text-status-high);">${item.process}</span></td>
          <td style="padding: 10px; font-weight:600; color:var(--text-primary); max-width:180px; word-break:break-all;">${item.check_item}</td>
          <td style="padding: 10px; text-align:center;"><span style="font-size:11.5px; font-weight:800; color:var(--text-status-high); background:var(--bg-status-high); padding:3px 8px; border-radius:4px; border:1px solid var(--border-status-high);">${item.score}</span></td>
          <td style="padding: 10px; line-height:1.4; color:var(--text-secondary); max-width:200px; word-break:break-all;">
            <div style="font-weight:700; color:var(--text-primary); font-size:11.5px; margin-bottom:2px;">[현장 실사 피드백]</div>
            ${item.findings || '-'}
            <div style="font-size:11px; color:var(--text-status-medium); font-weight:700; margin-top:4px;">
              [SOP 개량권고] ${item.guidance || '정량적 점검 기준서 재정립'}
            </div>
          </td>
          <td style="padding: 10px;">${peerHtml}</td>
        `;
        tbody.appendChild(tr);
      });
      prepTableBox.appendChild(table);
    }

    // B. 표준 우수 관리 항목 테이블 채우기
    if (excellentItems.length === 0) {
      excellentTableBox.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding:30px; color:var(--text-secondary); border:1px dashed var(--border-card); border-radius:6px; font-size:12px;">
          <i data-lucide="shield-alert" style="width:24px; height:24px; color:var(--color-status-medium); margin-bottom:6px;"></i>
          <span>8점 이상 우수 관리 항목이 없습니다.</span>
        </div>
      `;
    } else {
      const table = document.createElement('table');
      table.className = 'data-table';
      table.style.cssText = 'width: 100%; border-collapse: collapse; font-size: 12px;';
      table.innerHTML = `
        <thead>
          <tr style="border-bottom: 1px solid var(--border-card); background: #f8fafc; position: sticky; top: 0; z-index: 10;">
            <th style="padding: 10px; font-weight: 700; color: var(--text-secondary); width: 80px;">공정</th>
            <th style="padding: 10px; font-weight: 700; color: var(--text-secondary);">안정 관리 항목</th>
            <th style="padding: 10px; font-weight: 700; color: var(--text-secondary); width: 60px; text-align: center;">점수</th>
            <th style="padding: 10px; font-weight: 700; color: var(--text-secondary); width: 100px; text-align: center;">안정 상태</th>
          </tr>
        </thead>
        <tbody></tbody>
      `;
      const tbody = table.querySelector('tbody');

      excellentItems.forEach((item, index) => {
        const tr = document.createElement('tr');
        tr.style.cssText = `
          border-bottom: 1px solid var(--border-card);
          transition: background 0.15s;
          background: ${index % 2 === 1 ? '#f8fafc' : '#ffffff'};
        `;
        tr.onmouseenter = () => { tr.style.background = '#f1f5f9'; };
        tr.onmouseleave = () => { tr.style.background = index % 2 === 1 ? '#f8fafc' : '#ffffff'; };

        tr.innerHTML = `
          <td style="padding: 10px;"><span style="font-size:11px; font-weight:700; background:var(--bg-status-low); border:1px solid var(--border-status-low); padding:2px 6px; border-radius:4px; color:var(--text-status-low);">${item.process}</span></td>
          <td style="padding: 10px;">
            <div style="font-weight:700; color:var(--text-primary);">${item.check_item}</div>
            <div style="font-size:11px; color:var(--text-muted-light); margin-top:2px;">실적: ${item.findings || 'SOP 완벽 준수 및 이력 확인 만족'}</div>
          </td>
          <td style="padding: 10px; text-align:center;"><span style="font-size:11px; font-weight:800; color:var(--text-status-low); background:var(--bg-status-low); padding:2px 6px; border-radius:4px; border:1px solid var(--border-status-low);">${item.score}</span></td>
          <td style="padding: 10px; text-align:center;">
            <span style="display:inline-flex; align-items:center; gap:3px; font-size:10.5px; font-weight:700; background:var(--bg-status-low); color:var(--text-status-low); border:1px solid var(--border-status-low); padding:2px 6px; border-radius:4px;">
              <span style="width:5px; height:5px; background:var(--color-status-low); border-radius:50%;"></span>
              만족 (Excellent)
            </span>
          </td>
        `;
        tbody.appendChild(tr);
      });
      excellentTableBox.appendChild(table);
    }

    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  },

  // 💡 ⑦ AI 권고 Operational Actions 피드 렌더링 (CRI 및 8D 요약본 매칭)
  renderTab3AIRecommendations(activePlantCode, activeProcess) {
    const recBox = document.getElementById('tab3-top20-recommendations');
    const aiActionBox = document.getElementById('tab3-ai-recommended-actions');
    if (!recBox || !aiActionBox) return;

    recBox.innerHTML = '';
    aiActionBox.innerHTML = '';

    const allAssessmentItems = this.state.oeQualityAssessmentDetails || [];
    const plantItems = allAssessmentItems.filter(item => item.plant === activePlantCode);

    // 1. 공장 종합 등급 (CRI) 연산
    const validItems = plantItems.filter(item => item.score && item.score.toString().trim().toUpperCase() !== 'N/A');
    let criScore = 100.0;
    let averageScore = 10.0;
    if (validItems.length > 0) {
      const sumScores = validItems.reduce((sum, item) => sum + parseFloat(item.score), 0);
      averageScore = sumScores / validItems.length;
      criScore = averageScore * 10;
    }
    
    // On-going findings가 있을 시 CRI 차감 패널티 적용
    const ongoingFindingsCount = (this.state.auditFindings || []).filter(item => item.PLANT === activePlantCode && item.STATUS === 'On-going').length;
    criScore = Math.max(0, Math.min(100, criScore - ongoingFindingsCount * 1.5));
    const formattedCri = criScore.toFixed(1);

    let criGrade = 'A';
    let criColor = 'var(--color-status-low)';
    let criBg = 'var(--bg-status-low)';
    let criDesc = '최고 수준의 안전 공정 표준 상태입니다. 완성차 고객 수검 시 최상위 등급(VDA 6.3 A등급) 확보가 기대됩니다.';
    
    if (criScore < 60) {
      criGrade = 'E';
      criColor = 'var(--color-status-high)';
      criBg = 'var(--bg-status-high)';
      criDesc = '🚨 초고위험 취약 공정 단계입니다. 즉시 비상대책 위원회(TF)를 가동하고 수검 조치 사항 전반을 긴급 보강해야 합니다.';
    } else if (criScore < 70) {
      criGrade = 'D';
      criColor = 'var(--color-status-medium)';
      criBg = 'var(--bg-status-medium)';
      criDesc = '⚠️ 고위험 공정 단계입니다. 다수의 지적사항이 방치되어 있어 OEM 실사 통과가 불투명합니다. 최우선 조치가 강력 권고됩니다.';
    } else if (criScore < 80) {
      criGrade = 'C';
      criColor = 'var(--color-status-medium)';
      criBg = 'var(--bg-status-medium)';
      criDesc = '보통 수준의 공정 상태입니다. 일부 취약 공정의 SOP 정량 수치 미준수가 관측되므로 벤치마킹 개량이 필요합니다.';
    } else if (criScore < 90) {
      criGrade = 'B';
      criColor = 'var(--color-status-info)';
      criBg = 'var(--bg-status-info)';
      criDesc = '양호하고 안정적인 상태입니다. 상시 보완과 4M 변경 관리 프로세스 보더라인 점검을 통해 안정율을 유지하고 있습니다.';
    }

    // Top 20 개선 권고 과제 (Score <= 6인 항목)
    let prepItems = validItems.filter(item => parseFloat(item.score) <= 6);
    if (activeProcess !== 'ALL') {
      prepItems = prepItems.filter(item => item.process.toLowerCase() === activeProcess.toLowerCase());
    }

    const processOrder = ['Incoming', 'Mixing', 'Extruding', 'Calendering', 'Cutting', 'Bead', 'Building', 'Curing', 'Inspection', 'Shipping'];
    prepItems.sort((a, b) => {
      const orderA = processOrder.indexOf(a.process);
      const orderB = processOrder.indexOf(b.process);
      if (orderA !== orderB) return orderA - orderB;
      return parseFloat(a.score) - parseFloat(b.score);
    });

    const top20Items = prepItems.slice(0, 20);

    if (top20Items.length === 0) {
      recBox.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding:40px; color:var(--text-secondary); height:100%; border:1px dashed rgba(255,255,255,0.05); border-radius:6px; font-size:12.5px;">
          <i data-lucide="shield-check" style="width:32px; height:32px; color:#00ff66; margin-bottom:8px;"></i>
          <span style="font-weight:700; color:var(--text-primary);">선결 요건 및 개선 과제 0건</span>
          <span style="font-size:11px; margin-top:2px;">모든 품질 지표가 최상의 합격 등급을 충족하고 있습니다.</span>
        </div>
      `;
    } else {
      top20Items.forEach((item, idx) => {
        const card = document.createElement('div');
        card.style.cssText = `
          background: #f8fafc;
          border: 1px solid var(--border-card);
          border-left: 3px solid var(--color-status-medium);
          border-radius: 6px;
          padding: 10px 12px;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          transition: all 0.2s;
        `;
        card.onmouseenter = () => {
          card.style.borderColor = 'var(--border-input)';
          card.style.background = '#f1f5f9';
        };
        card.onmouseout = () => {
          card.style.borderColor = 'var(--border-card)';
          card.style.background = '#f8fafc';
        };

        card.innerHTML = `
          <i data-lucide="alert-triangle" style="width:16px; height:16px; color:var(--color-status-medium); flex-shrink:0; margin-top:2px;"></i>
          <div style="flex:1;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:3px;">
              <span style="font-size:11px; font-weight:800; color:var(--text-status-medium); background:var(--bg-status-medium); padding:2px 6px; border-radius:4px;">
                #${idx + 1} 과제 - ${item.process}
              </span>
              <span style="font-size:11px; font-weight:800; color:var(--text-status-high);">진단 점수: ${item.score}/10</span>
            </div>
            <div style="font-size:12px; font-weight:700; color:var(--text-primary); margin-bottom:4px;">${item.check_item}</div>
            <div style="font-size:11px; color:var(--text-secondary); line-height:1.4;">
              <strong>지적 요약:</strong> ${item.findings || '-'}
            </div>
            <div style="font-size:11.5px; color:var(--brand-blue); font-weight:700; margin-top:5px; display:flex; align-items:center; gap:4px;">
              <i data-lucide="arrow-right" style="width:12px; height:12px;"></i>
              대책: ${item.guidance || 'SOP 수립 및 계측 신뢰성 인터락 보완 고도화'}
            </div>
          </div>
        `;
        recBox.appendChild(card);
      });
    }

    // AI Recommended Operational Actions 피드 조립
    const pName = (this.state.commonCodes.plants || []).find(p => p.code === activePlantCode)?.name || activePlantCode;
    
    const processesScores = {};
    validItems.forEach(item => {
      if (!processesScores[item.process]) {
        processesScores[item.process] = { sum: 0, count: 0 };
      }
      processesScores[item.process].sum += parseFloat(item.score);
      processesScores[item.process].count++;
    });

    let worstProcess = 'Building (성형)';
    let lowestAvg = 10.0;
    Object.keys(processesScores).forEach(proc => {
      const avg = processesScores[proc].sum / processesScores[proc].count;
      if (avg < lowestAvg) {
        lowestAvg = avg;
        worstProcess = proc;
      }
    });

    const aiActionHtml = `
      <div style="display: flex; align-items: center; gap: 15px; background: #f8fafc; border: 1px solid var(--border-card); border-radius: 8px; padding: 15px; margin-bottom: 20px; box-shadow: var(--shadow-sm);">
        <div style="width: 55px; height: 55px; border-radius: 50%; background: ${criBg}; border: 2px solid ${criColor}; display: flex; align-items: center; justify-content: center; font-size: 26px; font-weight: 900; color: ${criColor}; flex-shrink: 0; font-family: 'Inter', sans-serif;">
          ${criGrade}
        </div>
        <div style="flex:1;">
          <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:4px;">
            <span style="font-size:14px; font-weight:800; color:var(--text-primary); font-family: 'Inter', sans-serif;">
              ${pName} 공장 CRI (Compliance Risk Index)
            </span>
            <span style="font-size:16px; font-weight:900; color:${criColor}; font-family: 'Inter', sans-serif;">
              ${formattedCri}%
            </span>
          </div>
          <div style="font-size:11.5px; color:var(--text-secondary); line-height:1.4;">
            ${criDesc}
          </div>
        </div>
      </div>

      <div style="display:flex; align-items:center; gap:6px; color:var(--brand-blue); font-size:13px; font-weight:800; margin-bottom:12px; font-family: 'Inter', sans-serif;">
        <i data-lucide="sparkles" style="width:16px; height:16px;"></i>
        <span>AI REAL-TIME AUDIT ADVISORY FEED</span>
      </div>

      <div style="display: flex; flex-direction: column; gap: 15px; line-height: 1.6; font-size:12px;">
        <div>
          <div style="font-weight: 800; color: var(--text-status-high); font-size: 12.5px; margin-bottom: 4px; display:flex; align-items:center; gap:4px;">
            <span style="display:inline-block; width:6px; height:6px; background:var(--color-status-high); border-radius:50%;"></span>
            1. Risk Summary (종합 취약점 진단)
          </div>
          <div style="color: var(--text-primary); padding-left: 10px; border-left: 2px solid var(--border-card);">
            현재 ${pName} 공장의 실시간 데이터 분석 결과, 과거 OEM 오딧 지적 이력 및 사내 진단 데이터 상 
            <strong>${worstProcess}</strong> 공정이 품질 관리 실사 측면에서 가장 높은 재발방지 취약 노드(점수 ${lowestAvg.toFixed(1)}/10)로 탐지되었습니다. 
            CRI 지수 수준은 <strong>${formattedCri}% (${criGrade} 등급)</strong>으로 수검 오딧 이전에 즉각적인 시정 조치(Corrective Actions) 및 SOP 개정이 강력히 요구됩니다.
          </div>
        </div>

        <div>
          <div style="font-weight: 800; color: var(--text-status-medium); font-size: 12.5px; margin-bottom: 4px; display:flex; align-items:center; gap:4px;">
            <span style="display:inline-block; width:6px; height:6px; background:var(--color-status-medium); border-radius:50%;"></span>
            2. Root Cause Hypothesis (원천 원인 분석 가설)
          </div>
          <div style="color: var(--text-primary); padding-left: 10px; border-left: 2px solid var(--border-card);">
            - <strong>4M 변경 관리 절차 불이행 가설</strong>: ${worstProcess} 공정 내의 핵심 금형 및 자재 규격 대체 적용 시 품질 부서의 사전 승인(FMEA) 및 검증(MSA) 워크플로우 통제 인터락 부재.<br>
            - <strong>정량적 모니링 주기 한계 가설</strong>: 생산 작업자 가상 인터뷰 결과, 온도/가압 프로파일 한계 관리선 이탈 시 이상 조치 가이드(OCAP) 작동 유효성 검증 체계 미흡.
          </div>
        </div>

        <div>
          <div style="font-weight: 800; color: var(--text-status-low); font-size: 12.5px; margin-bottom: 4px; display:flex; align-items:center; gap:4px;">
            <span style="display:inline-block; width:6px; height:6px; background:var(--color-status-low); border-radius:50%;"></span>
            3. Corrective Action (현장 즉각 8D 대책안)
          </div>
          <div style="color: var(--text-primary); padding-left: 10px; border-left: 2px solid var(--border-card);">
            - <strong>D3 (임시 대책)</strong>: 취약 공정 작업자 대상 온도 제어 표준 및 금형 클리닝 주기 가이드라인 긴급 직무 교육 시행 및 교대조별 100% 점검 보증.<br>
            - <strong>D4 (근본 원인 조치)</strong>: 생산 작업 단계에서 SOP 외 조건 투입 시 생산 가동이 자동 차단(Poka-Yoke)되는 전산 제어 코드 긴급 업그레이드 적용.<br>
            - <strong>D5 (영구 대책 검증)</strong>: 8D 조치 담당자 지정 하에 3개 배치 연속 품질 안정성(Cpk 1.67 이상) 데이터 수집 및 실증 데이터 수립.
          </div>
        </div>

        <div>
          <div style="font-weight: 800; color: var(--brand-blue); font-size: 12.5px; margin-bottom: 4px; display:flex; align-items:center; gap:4px;">
            <span style="display:inline-block; width:6px; height:6px; background:var(--brand-blue); border-radius:50%;"></span>
            4. Required Evidence (수검 필수 현장 증적)
          </div>
          <div style="color: var(--text-primary); padding-left: 10px; border-left: 2px solid var(--border-card);">
            - ${worstProcess} 공정 온도 조절기 계측기 교정 검교정 성적서 원본 공유 폴더(Evidences) 동기화 보존.<br>
            - D3 교육 이행 확인을 위한 작업자 자필 서명 서약 교육 일지 확보.<br>
            - 공정 제어 한계(UCL/LCL) 개정 검증을 입증하는 최신 한계 관리 스탯 일지 보관.
          </div>
        </div>

        <div>
          <div style="font-weight: 800; color: var(--text-status-info); font-size: 12.5px; margin-bottom: 4px; display:flex; align-items:center; gap:4px;">
            <span style="display:inline-block; width:6px; height:6px; background:var(--color-status-info); border-radius:50%;"></span>
            5. SOP Revision Guide (표준 작업 지침서 개정안)
          </div>
          <div style="color: var(--text-primary); padding-left: 10px; border-left: 2px solid var(--border-card);">
            - <strong>문서번호 SOP-${activePlantCode}-${worstProcess.substring(0,3).toUpperCase()}-2026 개정</strong>: '가압 온도 이상 3분 이상 지속 시 부적합 격리창고(MR Zone) 전산 강제 이송 및 4M 특별 변경 이력 즉시 보고' 제6항 조항 신설 개정 추진.<br>
            - 현장 오퍼레이팅 보드에 실사 대조용 한글/영문 개정판 SOP 코멘트 명시 부착.
          </div>
        </div>
      </div>
    `;
    aiActionBox.innerHTML = aiActionHtml;

    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  },

  // 💡 ⑧ CSV 다운로드 통합 보조 엔진
  downloadCSV(filename, csvContent) {
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.showToast(`Excel 한글 깨짐 방지 BOM이 포함된 CSV 다운로드가 완료되었습니다. (${filename})`, "success");
  },

  // 💡 ⑨ 고객사 감사 지적 이력 내보내기 (Customer Audit Checklist Export)
  exportCustomerAuditChecklist() {
    const activePlantCode = this.state.plantRiskActivePlant || 'DP';
    const activeCustomer = this.state.tab3Customer || 'BMW';
    const activeProcess = this.state.tab3Process || 'ALL';

    console.log(`🏭 Exporting Customer Audit Checklist CSV: Plant=${activePlantCode}, Cust=${activeCustomer}, Proc=${activeProcess}`);

    let fallbackLevel = 1;
    let targetFindings = [];

    // Filter helper function applying all active filters
    const getFiltered = (plantFilter, customerFilter) => {
      return (this.state.auditFindings || []).filter(item => {
        // Plant Match
        let isPlantMatch = true;
        if (plantFilter !== 'ALL') {
          isPlantMatch = item.PLANT === plantFilter;
        }

        // Customer Match
        let isCustomerMatch = true;
        if (customerFilter !== 'ALL') {
          isCustomerMatch = (item.CAR_MAKER || '').toLowerCase() === customerFilter.toLowerCase();
        }

        // Process Match
        let isProcMatch = true;
        if (activeProcess !== 'ALL') {
          const procCode = item._mappedProcess || this.getFindingProcess(item);
          isProcMatch = (procCode === activeProcess);
        }

        // Date Match
        let isDateMatch = true;
        const itemDate = item.REG_DT || item.START_DT || '';
        if (itemDate) {
          if (this.state.tab3StartDate && itemDate < this.state.tab3StartDate) {
            isDateMatch = false;
          }
          if (this.state.tab3EndDate && itemDate > this.state.tab3EndDate) {
            isDateMatch = false;
          }
        }

        return isPlantMatch && isCustomerMatch && isProcMatch && isDateMatch;
      });
    };

    // 💡 1순위: 선택한 공장 + 지정 고객사
    targetFindings = getFiltered(activePlantCode, activeCustomer);

    // 💡 2순위 (대안 참조): 1순위 전무할 시, 타 공장 전수 조사 후 해당 고객사 실제 감사 지적 이력 로드
    if (targetFindings.length === 0 && activeCustomer !== 'ALL') {
      fallbackLevel = 2;
      targetFindings = getFiltered('ALL', activeCustomer);
    }

    // 💡 3순위 (표준 오딧): 2순위 데이터마저 부재 시, 글로벌 대표 3대사 (Ford, BMW, Hyundai) 종합 지적 이력 결합
    if (targetFindings.length === 0 && activeCustomer !== 'ALL') {
      fallbackLevel = 3;
      targetFindings = (this.state.auditFindings || []).filter(item => {
        const isCustomerMatch = ['bmw', 'ford', 'hyundai'].includes((item.CAR_MAKER || '').toLowerCase());
        
        let isProcMatch = true;
        if (activeProcess !== 'ALL') {
          const procCode = item._mappedProcess || this.getFindingProcess(item);
          isProcMatch = (procCode === activeProcess);
        }

        let isDateMatch = true;
        const itemDate = item.REG_DT || item.START_DT || '';
        if (itemDate) {
          if (this.state.tab3StartDate && itemDate < this.state.tab3StartDate) {
            isDateMatch = false;
          }
          if (this.state.tab3EndDate && itemDate > this.state.tab3EndDate) {
            isDateMatch = false;
          }
        }

        return isCustomerMatch && isProcMatch && isDateMatch;
      });
    }

    if (targetFindings.length === 0) {
      this.showToast("다운로드할 감사 지적 이력 데이터가 없습니다.", "warning");
      return;
    }

    // Header exactly matching: 구분 (TYPE), 공장 (PLANT), 고객사 (OEM), 차종 (VEHICLE), 발생일 (OCC DATE), 조치예정일 (TARGET DATE), 지적 사항 (POINT OUT), 원인 분석 및 대책 (ROOT CAUSE & COUNTERMEASURE), 상태 (STATUS), E-QMS LINK
    let csv = '구분 (TYPE),공장 (PLANT),고객사 (OEM),차종 (VEHICLE),발생일 (OCC DATE),조치예정일 (TARGET DATE),지적 사항 (POINT OUT),원인 분석 및 대책 (ROOT CAUSE & COUNTERMEASURE),상태 (STATUS),E-QMS LINK\n';
    
    targetFindings.forEach(item => {
      // 1. Process Code Mapping
      let procCode = item.PROCESS || item.process_category || item.process || item._mappedProcess;
      if (!procCode) {
        procCode = this.getFindingProcess(item);
        item._mappedProcess = procCode;
      } else {
        item._mappedProcess = procCode;
      }

      // 2. Multilingual values or fallback dictionary mapping
      if (!item.POINT_OUT || !item.ROOT_CAUSE_ANALYSIS || !item.COUNTER_MEASURE) {
        const fb = FALLBACK_FINDING_DICT[procCode] || FALLBACK_FINDING_DICT["System"];
        if (!item.POINT_OUT) {
          item.POINT_OUT = fb.POINT_OUT;
          item.POINT_OUT_KO = fb.POINT_OUT;
          item.POINT_OUT_EN = fb.POINT_OUT;
          item.POINT_OUT_ZH = fb.POINT_OUT;
        }
        if (!item.ROOT_CAUSE_ANALYSIS) item.ROOT_CAUSE_ANALYSIS = fb.ROOT_CAUSE_ANALYSIS;
        if (!item.COUNTER_MEASURE) item.COUNTER_MEASURE = fb.COUNTER_MEASURE;
      }

      // Multilingual Point Out text
      let pointOutText = item.POINT_OUT || '-';
      if (this.state.currentLang === 'KO' && (item.POINT_OUT_KO || item.POINT_OUT)) {
        pointOutText = item.POINT_OUT_KO || item.POINT_OUT;
      } else if (this.state.currentLang === 'EN' && (item.POINT_OUT_EN || item.POINT_OUT)) {
        pointOutText = item.POINT_OUT_EN || item.POINT_OUT;
      } else if (this.state.currentLang === 'ZH' && (item.POINT_OUT_ZH || item.POINT_OUT)) {
        pointOutText = item.POINT_OUT_ZH || item.POINT_OUT;
      }

      // Multilingual Root Cause text
      let rootCauseText = item.ROOT_CAUSE_ANALYSIS || '-';
      if (this.state.currentLang === 'KO' && (item.ROOT_CAUSE_KO || item.ROOT_CAUSE_ANALYSIS)) {
        rootCauseText = item.ROOT_CAUSE_KO || item.ROOT_CAUSE_ANALYSIS;
      } else if (this.state.currentLang === 'EN' && (item.ROOT_CAUSE_EN || item.ROOT_CAUSE_ANALYSIS)) {
        rootCauseText = item.ROOT_CAUSE_EN || item.ROOT_CAUSE_ANALYSIS;
      } else if (this.state.currentLang === 'ZH' && (item.ROOT_CAUSE_ZH || item.ROOT_CAUSE_ANALYSIS)) {
        rootCauseText = item.ROOT_CAUSE_ZH || item.ROOT_CAUSE_ANALYSIS;
      }

      // Multilingual Countermeasure text
      let counterMeasureText = item.COUNTER_MEASURE || '-';
      if (this.state.currentLang === 'KO' && (item.COUNTER_MEASURE_KO || item.COUNTER_MEASURE)) {
        counterMeasureText = item.COUNTER_MEASURE_KO || item.COUNTER_MEASURE;
      } else if (this.state.currentLang === 'EN' && (item.COUNTER_MEASURE_EN || item.COUNTER_MEASURE)) {
        counterMeasureText = item.COUNTER_MEASURE_EN || item.COUNTER_MEASURE;
      } else if (this.state.currentLang === 'ZH' && (item.COUNTER_MEASURE_ZH || item.COUNTER_MEASURE)) {
        counterMeasureText = item.COUNTER_MEASURE_ZH || item.COUNTER_MEASURE;
      }

      // Formatted fields matching the 10 target columns
      const type = (item.PLANT === activePlantCode) ? '본공장 실적' : '타공장 벤치마킹';
      const plant = item.PLANT || '-';
      const maker = item.CAR_MAKER || '-';
      const vehicle = item.PROJECT || '-';
      const occDate = item.REG_DT || item.START_DT || '-';
      const targetDate = item.COMP_DT || item.END_DT || '-';
      
      // Combine title and point out for the POINT OUT column, matching UI aesthetics
      const pointOutColRaw = `[제목] ${item.SUBJECT || '-'} \n[지적 코멘트] ${pointOutText}`;
      const pointOutColEscaped = pointOutColRaw.replace(/"/g, '""');

      // Combine root cause and countermeasure
      const rootCauseColRaw = `[원인] ${rootCauseText} \n[대책] ${counterMeasureText}`;
      const rootCauseColEscaped = rootCauseColRaw.replace(/"/g, '""');

      const status = item.STATUS || '-';
      const eqmsLink = item.URL || item.url || '#';

      csv += `"${type}","${plant}","${maker}","${vehicle}","${occDate}","${targetDate}","${pointOutColEscaped}","${rootCauseColEscaped}","${status}","${eqmsLink}"\n`;
    });

    const filename = `Customer_Audit_Checklist_${activePlantCode}_${activeCustomer}_${activeProcess}.csv`;
    this.downloadCSV(filename, csv);
  },

  // 💡 ⑩ 최우선 준비 항목 내보내기 (Priority Prep Items Export)
  exportPriorityPrepItems() {
    const activePlantCode = this.state.plantRiskActivePlant || 'DP';
    const activeProcess = this.state.tab3Process || 'ALL';

    console.log(`🏭 Exporting Priority Prep Items CSV: Plant=${activePlantCode}, Proc=${activeProcess}`);

    const allAssessmentItems = this.state.oeQualityAssessmentDetails || [];
    const plantItems = allAssessmentItems.filter(item => item.plant === activePlantCode);

    let filteredItems = plantItems;
    if (activeProcess !== 'ALL') {
      filteredItems = plantItems.filter(item => (item.process || '').toLowerCase() === activeProcess.toLowerCase());
    }

    const validItems = filteredItems.filter(item => item.score && item.score.toString().trim().toUpperCase() !== 'N/A');
    const prepItems = validItems.filter(item => parseFloat(item.score) <= 6);

    const processOrder = ['Incoming', 'Mixing', 'Extruding', 'Calendering', 'Cutting', 'Bead', 'Building', 'Curing', 'Inspection', 'Shipping'];
    prepItems.sort((a, b) => {
      const orderA = processOrder.indexOf(a.process);
      const orderB = processOrder.indexOf(b.process);
      if (orderA !== orderB) return orderA - orderB;
      return parseFloat(a.score) - parseFloat(b.score);
    });

    if (prepItems.length === 0) {
      this.showToast("다운로드할 최우선 준비 항목이 없습니다.", "warning");
      return;
    }

    let csv = '공정,체크 영역,점검 요건 (체크 항목),진단 점수,현장 실사 피드백,SOP 개량권고,💡 우수 공장 Peer 벤치마킹\n';

    prepItems.forEach(item => {
      const proc = item.process || '';
      const area = item.area || '';
      const checkItem = (item.check_item || '').replace(/"/g, '""');
      const score = item.score || '';
      const findings = (item.findings || '').replace(/"/g, '""');
      const guidance = (item.guidance || '').replace(/"/g, '""');

      const peers = allAssessmentItems.filter(pItem => 
        pItem.check_item === item.check_item && 
        parseFloat(pItem.score) === 10 && 
        pItem.plant !== activePlantCode
      );
      let peerText = 'HQ Standard SOP 지침 준수';
      if (peers.length > 0) {
        const plantList = peers.map(p => p.plant).join(', ');
        const bp = peers[0].findings || peers[0].guidance || '';
        peerText = `모범공장 [${plantList}] : ${bp}`;
      }
      peerText = peerText.replace(/"/g, '""');

      csv += `"${proc}","${area}","${checkItem}","${score}","${findings}","${guidance}","${peerText}"\n`;
    });

    const filename = `Priority_Prep_Items_${activePlantCode}_${activeProcess}.csv`;
    this.downloadCSV(filename, csv);
  },

  // 💡 ⑪ 공장 전체 체크리스트 내보내기 (Entire Plant Checklist Export)
  exportEntirePlantChecklist() {
    const activePlantCode = this.state.plantRiskActivePlant || 'DP';
    const activeProcess = this.state.tab3Process || 'ALL';

    console.log(`🏭 Exporting Entire Plant Checklist CSV: Plant=${activePlantCode}, Proc=${activeProcess}`);

    const allAssessmentItems = this.state.oeQualityAssessmentDetails || [];
    const plantItems = allAssessmentItems.filter(item => item.plant === activePlantCode);

    let filteredItems = plantItems;
    if (activeProcess !== 'ALL') {
      filteredItems = plantItems.filter(item => (item.process || '').toLowerCase() === activeProcess.toLowerCase());
    }

    const validItems = filteredItems.filter(item => item.score && item.score.toString().trim().toUpperCase() !== 'N/A');

    if (validItems.length === 0) {
      this.showToast("다운로드할 전체 체크시트 데이터가 없습니다.", "warning");
      return;
    }

    let csv = 'ID,공장 코드,공정,분류,체크 요건 (체크 항목),진단 영역,진단 점수,현장 실사 피드백,개량 권고 표준 (Guidance)\n';

    validItems.forEach(item => {
      const id = item.id || '';
      const plant = item.plant || '';
      const proc = item.process || '';
      const cat = item.category || '';
      const checkItem = (item.check_item || '').replace(/"/g, '""');
      const area = item.area || '';
      const score = item.score || '';
      const findings = (item.findings || '').replace(/"/g, '""');
      const guidance = (item.guidance || '').replace(/"/g, '""');

      csv += `"${id}","${plant}","${proc}","${cat}","${checkItem}","${area}","${score}","${findings}","${guidance}"\n`;
    });

    const filename = `Entire_Plant_Checklist_${activePlantCode}_${activeProcess}.csv`;
    this.downloadCSV(filename, csv);
  },

  // ==========================================================================
  // 🤖 4. AI Action Advisor (부적합 대응 및 8D 시정안 가이드 핵심 구현 - Phase 5)
  // ==========================================================================

  // 1) AI Action Advisor 탭 초기화 및 이벤트 리스너 바인딩
  initAIActionAdvisor() {
    console.log("🤖 Initializing AI Action Advisor Tab...");

    // 1. 초기 UI 상태 정렬
    const emptyBox = document.getElementById('ai-advisory-empty');
    const loadingBox = document.getElementById('ai-advisory-loading');
    const resultBox = document.getElementById('ai-advisory-result');
    const textarea = document.getElementById('ai-advisor-textarea');

    if (emptyBox) emptyBox.style.display = 'flex';
    if (loadingBox) loadingBox.style.display = 'none';
    if (resultBox) resultBox.style.display = 'none';
    if (textarea) textarea.value = '';

    // 2. 빠른 시나리오 프리셋 버튼 바인딩 (이벤트 중복 방지용 클릭 오버라이트)
    const presetContainer = document.getElementById('ai-preset-container');
    if (presetContainer) {
      presetContainer.querySelectorAll('.preset-btn').forEach(btn => {
        btn.onclick = (e) => {
          e.preventDefault();
          const presetType = btn.getAttribute('data-preset');
          this.loadAIPresetScenario(presetType);
        };
      });
    }

    // 3. AI 가이드라인 생성 버튼 바인딩
    const btnGenerate = document.getElementById('btn-generate-ai-action');
    if (btnGenerate) {
      btnGenerate.onclick = (e) => {
        e.preventDefault();
        this.generateAIAdvisory();
      };
    }

    // 4. 아이콘 다시 드로잉
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  },

  // 2) 데모 시나리오 프리셋 텍스트 이관 복사 함수
  loadAIPresetScenario(presetType) {
    const textarea = document.getElementById('ai-advisor-textarea');
    if (!textarea) return;

    const presets = {
      "curing-vent": "가류 공정 벤트 홀 막힘 현상이 발생하여 가류 압력 가압 과정에서 잔류 공기 배출되지 못해 타이어 트레드 표면 기포(Air Bubble) 및 외관 불량 발생 리스크가 노출되었습니다. 금형 예방보전 주기(VDA 6.3 6.4.4항) 미준수로 보완 지적을 수령하였습니다.",
      "green-tire": "성형 공정 내 반제품인 그린타이어(Green Tire) 적재 보관 시간이 표준 보존 기한(24시간)을 초과하여 장기 방치되었습니다. 이로 인해 고무의 점착성(Tackiness)이 손상되고 표면 이물이 유입될 가능성이 극대화되었습니다. IATF 16949 8.5.4항(반제품 보존 및 수명)에 부적합 지적되었습니다.",
      "oil-sensor": "배합 공정에서 투입 오일 평량용 정밀 탱크의 레벨 제어 센서 오정렬 및 검교정 지연으로 인해 매 배치별 공급되는 유제 투입 배합량에 누적 미세 오차가 발견되었습니다. VDA 6.3 6.4.5항(감시 및 계측 장치 검교정 기준) 위배 우려가 제기되었습니다.",
      "compounding-temp": "배합 혼련 공정 중 냉각 배관 밸브 고착으로 챔버 실온도가 가이드 기준(125℃)을 전격 돌입 초과한 135℃ 고온 상황에 일시 노출되었습니다. 고무 스코치 조기 반응에 따른 물리 강도 미달 리스크가 감지되었습니다. IATF 16949 8.5.1항(공정 제어 통제) 위배 상태입니다.",
      "extrusion-thickness": "압출 공정에서 트레드 압출 프로파일의 중심 두께가 허용 공차 범위를 초과(+0.8mm 편차)하여 압출 성형되었습니다. 실시간 레이저 두께 측정 센서의 교정 드리프트와 다이(Die) 마모 모니터링 주기가 느슨하여 발생한 것으로 IATF 16949 8.5.1.1항 표준 위반 우려가 지적되었습니다."
    };

    if (presets[presetType]) {
      textarea.value = presets[presetType];
      this.showToast("시연용 부적합 시나리오 프리셋 문장이 즉시 이관 로드되었습니다.", "info");
      textarea.focus();
    }
  },

  // 3) AI 개선 조치 가이드라인 실시간 생성 및 인간-AI 대기 시뮬레이션
  generateAIAdvisory() {
    console.log("🤖 Generating AI Advisory Action Plan...");

    const textarea = document.getElementById('ai-advisor-textarea');
    if (!textarea) return;

    const textInput = textarea.value.trim();
    if (!textInput) {
      this.showToast("지적 사항 또는 부적합 상황을 상세히 기입하거나 프리셋을 선택하십시오.", "warning");
      textarea.focus();
      return;
    }

    const emptyBox = document.getElementById('ai-advisory-empty');
    const loadingBox = document.getElementById('ai-advisory-loading');
    const resultBox = document.getElementById('ai-advisory-result');
    const progressbar = document.getElementById('ai-advisory-progressbar');
    const statusText = document.getElementById('ai-advisory-status');

    if (!emptyBox || !loadingBox || !resultBox || !progressbar || !statusText) return;

    // 1. 레이아웃 리셋 및 로딩 개시
    emptyBox.style.display = 'none';
    resultBox.style.display = 'none';
    loadingBox.style.display = 'flex';
    progressbar.style.width = '0%';
    statusText.textContent = "의무 규격 조항 추출 엔진(Requirement Extractor) 구동 중...";

    // 2. 우아한 단계별 프로그레스 로딩 시뮬레이션 (인간-AI 대기 연출 효과 극대화)
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      if (progress > 100) progress = 100;
      progressbar.style.width = `${progress}%`;

      if (progress < 25) {
        statusText.textContent = "의무 규격 조항 추출 엔진(Requirement Extractor) 구동 중... [1/4]";
      } else if (progress < 50) {
        statusText.textContent = "품질 보증 질문 및 합치 증적 자료 설계 중... [2/4]";
      } else if (progress < 75) {
        statusText.textContent = "공정 품질 실패(QI) 및 변경이력(4M) 유사 원인 분석 중... [3/4]";
      } else if (progress < 95) {
        statusText.textContent = "SOP 개정 보완 표준안 및 영구 시정 대책(8D) 매핑 중... [4/4]";
      } else {
        statusText.textContent = "AI 종합 품질 가이드라인 피드 전개 중... 완료";
      }

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          loadingBox.style.display = 'none';
          this.renderAIAdvisoryResult(textInput);
          this.logAction(null, `AI 조치 가이드라인 도출 성공: "${textInput.substring(0, 30)}${textInput.length > 30 ? '...' : ''}"`, 'action');
        }, 300);
      }
    }, 80); // 총 약 1.6초 대기 연출
  },

  // 4) 키워드 형태소 스캔 기반 도메인 매핑 및 5대 폼 렌더러
  renderAIAdvisoryResult(userInput) {
    const resultBox = document.getElementById('ai-advisory-result');
    if (!resultBox) return;

    // 대소문자 무관 정규식 의미 분석 사전 (SOP Mapper)
    const curingRegex = /curing|가류|벤트|vent|금형|기포/i;
    const storageRegex = /green|그린|성형|보관|시간|fifo|선입선출/i;
    const sensorRegex = /오일|레벨|센서|평량|배합|계측|sensor|level/i;
    const compoundingRegex = /혼련|온도|컴파운드|오버|temp|135/i;
    const thicknessRegex = /압출|두께|레이저|다이|die|thickness/i;

    let selectedDomain = 'general';

    if (curingRegex.test(userInput)) {
      selectedDomain = 'curing';
    } else if (storageRegex.test(userInput)) {
      selectedDomain = 'storage';
    } else if (sensorRegex.test(userInput)) {
      selectedDomain = 'sensor';
    } else if (compoundingRegex.test(userInput)) {
      selectedDomain = 'compounding';
    } else if (thicknessRegex.test(userInput)) {
      selectedDomain = 'thickness';
    }

    const aiAdvisoryDatabase = {
      "curing": {
        subject: "가류 공정 벤트 홀 막힘에 따른 Air Bubble 기포 결함 억제 시정 방안",
        summary: "가류 공정 중 잔류 공기 배출용 벤트 홀(Vent Hole) 및 벤트핀(Air Vent Pin)의 가류 분진 누적으로 인한 수축 배출 불능 리스크 발생. 고압 가온 가류 시 표면 기포(Air Bubble) 외관 불량을 유발하여 타이어 고속 주행 시 트레드 균열 파손으로 치명적 품질 재해로 확산될 가능성 존재. VDA 6.3 6.4.4항(제조 시설 및 금형 주기적 보전 관리)을 심각하게 위배 중.",
        rootcause: "일일 가동전 예방 보전 일지에 벤트핀 동작 자유도(Movement Clearance) 및 오염 밀도 상태 체크 항목의 누락 확인. 금형 세정 주기가 컴파운드 배치별 배출 분진 누적도와 연동되지 않고 단순 가동 타임 단위로 고정 설정되어, 고점도 배합 고무 유입 시 조기 막힘 현상을 선제 방어하지 못한 인적/방법적 요소의 오류가 원인임.",
        action: [
          "[D3 임시 조치] 생산 완료 반제품에 대한 전수 육안 검사 및 압착 잔류 공기 벤트 점검 특별 배치 운영.",
          "[D5 영구 대책] 초음파 금형 세정 주기를 현행 3000회에서 2000회로 전격 단축 개정하고, 일일 가동 전 점검 일지에 '벤트핀 작동 자유도' 전산 입력 항목 추가.",
          "[D7 재발 방지] 가류 온도 프로파일 실시간 모니터링 시스템과 가압 그래프(Pressurization Profile) 자동 분석 경고 인터록(Interlock)을 전산망에 최종 연동하여 압력 강하 감지 시 긴급 셧다운 조치."
        ],
        evidence: [
          "개정된 가류 금형 일일 시동 전 표준 일지 및 서명서",
          "금형 초음파 세정 일지 및 정기 교체 예방 보전 성적서",
          "현장 설비 보전원 및 가류 라인 오퍼레이터 대상 표준 교육 훈련 수료 일지"
        ],
        sop: "가류 공정 설비 가동 표준지침서 <code>SOP-CUR-04</code> 제3조 2항 개정: '가류 설비 가압 투입 전 작업자는 벤트핀 공압 가동 상태를 수동 테스트하여 압력 지시계 지침이 4.5~5.0 bar 범위에 안착함을 확인한 후 전산 승인 코드를 서명 인서트하고 가동을 트리거할 것.'"
      },
      "storage": {
        subject: "성형 그린타이어 표준 보관 한계 시간 초과에 따른 선입선출 개선 방안",
        summary: "성형 공정 완료 후 가류 투입 전 전 단계인 그린타이어(Green Tire)가 규정 보관 한계 시점(24시간)을 전격 초과하여 현장 장기 거치 방치됨. 고무 내 함유된 고유 점착 성분(Tackiness)의 대기 노출 증발 유실 및 이물 입자 흡착에 따라 가류 성형 시 층간 접착 불량(Separation) 결함 리스크가 매우 팽창함. IATF 16949 8.5.4항(반제품 보존 및 제품 수명 관리 규칙) 위배 사항.",
        rootcause: "그린타이어 적재 전용 랙(Rack) 구역 내에 실시간 식별 바코드 또는 RFID 기반의 FIFO(선입선출) 모니터링 수단이 미비하여 육안에 전적으로 의존한 이관 작업 실시. 조대점 전환 시 미사용 반제품 잔류 관리가 시스템적으로 제어되지 않고, 정체 타이어 경보 알림 채널 부재에 따른 인적 누락 현상이 기인함.",
        action: [
          "[D3 임시 조치] 보관 랙에 20시간 초과 대기 중인 그린타이어에 대해 야광 형광 마벨 스티커 긴급 부착 및 가류 투입 전 전담 품질 검사원에 의한 점착 샘플링 점검 100% 강화.",
          "[D5 영구 대책] 보관 랙에 전자 잉크 태그(E-Ink Display) 및 자동 컬러 LED 인디케이터 장치를 전격 장착하여 적재 후 18시간 경과 시 황색 점멸, 24시간 도과 시 적색 점등 및 가류 투입 차단 인터록 가동.",
          "[D7 재발 방지] 성형 자동 이송 AGV 스케줄러 시스템과 생산 이력을 1대1 매핑하여 가류 대기 큐(Queue) 자동 할당 체계를 전산화하여 인적 간섭 소지 원천 제거."
        ],
        evidence: [
          "그린타이어 점착 성능 경과 시간에 따른 성능 실험 원천 데이터 보고서",
          "E-Ink 디스플레이 태그 도입 및 전산 모니터링 시스템 정합성 승인서",
          "개정된 반제품 창고 관리 지침서 및 실물 FIFO 체크 게시판"
        ],
        sop: "성형 반제품 보존 절차 표준서 <code>SOP-BLD-07</code> 제5조 개정: '그린타이어 적재 보관 한계는 최대 24시간으로 타이트하게 제한하며, 20시간 도과 시 전용 스마트 태그 알람이 관리 콘솔에 전산 팝업되고, 긴급 투입 승인 절차가 완료된 반제품에 한해서만 바코드 인터록이 강제 해제되어 가류 공정 공급을 보장할 것.'"
      },
      "sensor": {
        subject: "배합 공정 오일 평량용 센서 오정렬 및 검교정 누락에 대한 긴급 교정 대책",
        summary: "배합 공정 내 고무 컴파운드 물성을 좌우하는 배합 오일 평량 탱크 레벨 센서의 오정렬 및 마운팅 브래킷의 물리적 헐거움으로 계측 정합성에 오차 누적. 매 배치별 설정 투입량 오차 발생으로 완제품 고무 경도 편차 및 고속주행 내구 불량 위험성 잠재. VDA 6.3 6.4.5항(모니터링 장비의 정기적 교정 및 소급성 보장)에 부합하지 않음.",
        rootcause: "레벨 센서의 일상 검교정(Calibration) 루틴이 6개월 단위로 매우 느슨하게 수립되어 누적된 기계적 진동으로 인한 센서 편차 드리프트 검출 불능. 검교정 과정에서 공인 마스터 표준 분동을 사용한 다점 교정 방식을 사용하지 않고 단순 점동 가동 수치 매칭으로 간소 대체한 것이 센서 신뢰성 하락을 유도함.",
        action: [
          "[D3 임시 조치] 매 생산 교대점 전 오일 탱크의 실중량 배출 샘플 테스트 평량 계측 검토 보강.",
          "[D5 영구 대책] 오일 레벨 제어 센서의 기계적 보강 지그 장착 및 실시간 자이로 영점 드리프트 추적 기능이 내장된 듀얼 레이더 타입 레벨 센서로 개조 교체.",
          "[D7 재발 방지] 평량 탱크 일상 검교정 주기를 기존 6개월에서 1개월로 급격히 단축하고, 일일 배합기 가동 전 체크리스트에 '오일 평량 영점 자동 보정 완료' 승인 기록 인터록 구성."
        ],
        evidence: [
          "신규 설치 듀얼 레이더 오일 레벨 센서 검교정 공인 성적서",
          "배합 배치별 오일 실중량 자동 수동 오차 전산 로깅 시트",
          "개정된 배합실 계측 장비 표준 캘리브레이션 지침서 및 이행 확인 서명서"
        ],
        sop: "배합 공정 평량 제어 절차서 <code>SOP-MIX-02</code> 제4조 개정: '배합 오일 정밀 자동 평량 오차 한계는 ±0.1% 이내로 엄격 규율하며, 일일 가동 전 오퍼레이터는 50kg 표준 마스터 분동을 활용한 영점 캘리브레이션 테스트를 자동 실시하고, 편차가 0.05% 초과 시 설비 자동 연동 잠금 장치가 가동되도록 현장 인터록을 적용할 것.'"
      },
      "compounding": {
        subject: "혼련 공정 냉각수 배관 밸브 고착 및 챔버 고온 스코치 발생 대응 방안",
        summary: "혼련 믹싱 공정 가동 중 온도 급상승을 제어하는 냉각용 워터 재킷(Water Jacket) 정밀 조절 밸브의 물리적 고착으로 인해 냉각 유량 하락 발생. 챔버 실온도가 타겟 관리 기준(125℃)을 크게 돌파한 135℃ 고온에 방치되어 고무 컴파운드 내에서 스코치(조기 가류)가 촉발됨. 완제품 인장 강도 저하 및 기계적 성능 유실 리스크 극대화. IATF 16949 8.5.1항(생산 설비 실시간 통제) 저촉 위기 상태.",
        rootcause: "냉각수 펌프 및 밸브 배관 라인의 고형 침전물 필터 막힘 상태 예방 보전 항목 누락. 설비 원격 감시 제어(SCADA) 내에 밸브 개폐 피드백 오차 알림 시스템이 장착되지 않아 고온 경보 전 수선 차단 타이밍 유실이 근본 원인임.",
        action: [
          "[D3 임시 조치] 130℃ 이상 고온 발생 배치 고무 컴파운드 즉각 수동 식별 태그 부착 및 비파괴 기계적 인장 정밀 강도 특별 전수 테스트 진행.",
          "[D5 영구 대책] 냉각수 주요 유입 밸브를 자동 피드백 스마트 밸브로 100% 개체하고 실시간 유량 흐름 모니터링 압력 경보 디지털 센서 빌딩 장착.",
          "[D7 재발 방지] 냉각 라인 세정 필터 분기별 정기 보전 표준을 수립하고, SCADA 시스템 상 믹서 최고 상상 온도가 125℃에 근접 시 배합 투입 암(Arm)을 잠그는 하드웨어 연동 인터록 최종 안착."
        ],
        evidence: [
          "고온 노출 배치 컴파운드 파괴 강도 시험 성적 이력서",
          "SCADA 온도 인터록 전산 릴리즈 승인 문서 및 시운전 성공 일지",
          "냉각 배관 계통 3중 스마트 자동 밸브 도면 및 시험 성적서"
        ],
        sop: "혼련 공정 온도 통제 지침서 <code>SOP-MIX-05</code> 제8조 1항 보완: '혼련 작업 최고 온도는 125℃ 이하로 타이트하게 제한하며, 냉각 워터 배관 유량이 30L/min 이하로 급강하 시 배합 SCADA 시스템에 실시간 하드 인터록 경보를 표출하고 믹싱 장치 가동을 3초 이내 강제 정지할 것.'"
      },
      "thickness": {
        subject: "압출 트레드 프로파일 중심 두께 레이저 센서 오차 및 다이 마모 보완 대책",
        summary: "압출 공정에서 고압 출사되는 트레드 및 사이드월 컴파운드의 프로파일 중심 두께가 관리 규격 허용 오차를 심하게 이탈(+0.8mm 편차)하여 연속 생산 발생. 이로 인해 완성차 조립 완료 후 좌우 타이어 물리 밸런스 붕괴 및 고속주행 신뢰성 진동(Uniformity / Runout) 결함 전이 리스크 극대화. VDA 6.3 6.4.1항 및 IATF 16949 8.5.1.1항 위배 중.",
        rootcause: "실시간 레이저 두께 스캐너(Laser Profile Scanner)의 장기간 작동에 따른 열 변형 캘리브레이션 영점 드리프트 미감지. 또한 가압 압출 금형 다이(Die Wear) 헤드의 마모 추이를 정밀 체크하는 모니터링 주기가 수동 방식으로 느슨하게 운영되어 교체 소요 임계치 분석 실패.",
        action: [
          "[D3 임시 조치] 압출 가동 라인 말단 매 10m 구역 통과 시 작업자가 정밀 마이크로미터를 활용해 압출 반제품 삼점 두께 측정 기록 추가 이행.",
          "[D5 영구 대책] 레이저 스캐너 하단에 자동 에어 와이핑(Air Wiping) 지그를 장착해 분진 흡착을 방지하고 매 교대 시 스마트 캘리브레이터 철제 블록으로 자동 캘리브레이션 구동 프로그램 이식.",
          "[D7 재발 방지] 다이(Die) 압출 볼트와 레이저 중심 두께 피드백 오프셋 제어 모터 회로(Automatic Bolt Actuator)를 전격 동조 통합하여 편차 감지 시 금형 다이 볼트를 실시간 마이크로 제어 보정 자동화."
        ],
        evidence: [
          "트레드 프로파일 실시간 레이저 정밀 두께 데이터 분포 분석 시트",
          "레이저 두께 스캐너 검교정 공인 성적서 및 소프트웨어 구동 패치 이력",
          "다이(Die) 예방 교체 기준 설정 리서치 보고서"
        ],
        sop: "압출 공정 정밀 프로파일 제어 지침서 <code>SOP-EXT-01</code> 제2조 개정: '압출 트레드 중심 정밀 두께 공차는 ±0.3mm 범위 내로 클램핑 제어하며, 일일 가동 전 오퍼레이터는 캘리브레이션 전용 지그 블록을 통과시켜 영점 정밀 드리프트를 0.05mm 이내로 리셋 체크하고 그 이력을 전산 로깅 저장할 것.'"
      },
      "general": {
        subject: "품질 지적 조항에 특화된 실시간 8D 대응 방안 및 프로세스 보완 가이드",
        summary: "외부 수검 부적합 사항에 따른 전사 품질 등급 저하 방지 및 완성차 OEM 공급 요건 미합치 리스크 감지. 제조 라인 내 4M 관리 결손 부재를 우아하고 견고하게 보완하여 잠재 실패 파급을 원천 차단하기 위한 VDA 6.3 기준 준용 시정 조치 구현 필수 상태.",
        rootcause: "공정 입력 및 제어 루틴 상의 일상 모니터링 신뢰성 누적 오차, 그리고 오퍼레이터의 작업 표준 미준수 및 검교정 지침 미수립 등 관련 4M 요소(Man, Machine, Material, Method)의 입체 정합성 검토 부재가 잠재 원인으로 분석됨.",
        action: [
          "[D3 임시 조치] 부적합 제기 라인에서 생산된 유동 반제품/완제품 긴급 격리 전수 육안/기능 검증 강화.",
          "[D5 영구 대책] 대상 설비/지침의 전면 특수 검교정 및 캘리브레이션을 즉시 집행하고 공정 담당자 및 품질 보증 팀장을 소집해 8D 원인 분석 회의 및 SOP 긴급 승인 개정안 상정.",
          "[D7 재발 방지] 현장 오조작 예방용 포카요케(Poka-Yoke) 디지털 인터록을 설비 콘솔 전산에 신규 개발 이식하여 불완전 행위 원천 차단."
        ],
        evidence: [
          "품질 위기 극대화 8D 시정조치 보고서 초안",
          "보완 설비 예방 보전 일지 및 교정 공인 검증 승인서",
          "변경 SOP 작업자 전원 교육 서명 이력부"
        ],
        sop: "제조 공정 공통 표준가동 가이드라인 제1조 보완: '동일 부적합 재발을 원천 봉쇄하기 위해 각 파트 리더는 매주 예방 보전 로그를 분석하여 계측 오차 편차의 범위를 통계 제어(SPC) 기법으로 트래킹하고 한계 초과 전 선제적 예방 부품 대체를 적극 실행할 것.'"
      }
    };

    const data = aiAdvisoryDatabase[selectedDomain];

    // 5대 폼 마크업 동적 조립 렌더링
    let actionsHTML = '';
    data.action.forEach(act => {
      actionsHTML += `<li style="margin-bottom: 8px; line-height: 1.5; color: var(--text-primary); font-size: 12.5px; list-style-type: none; position: relative; padding-left: 15px;">
        <span style="position: absolute; left: 0; color: var(--brand-blue); font-weight: 900;">•</span>
        ${act}
      </li>`;
    });

    let evidenceHTML = '';
    data.evidence.forEach(ev => {
      evidenceHTML += `<div style="display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.02); border: 1px solid var(--border-card); padding: 8px 12px; border-radius: 6px;">
        <i data-lucide="file-check" style="width: 15px; height: 15px; color: var(--color-status-low); flex-shrink: 0;"></i>
        <span style="font-size: 12px; color: var(--text-primary); font-weight: 600;">${ev}</span>
      </div>`;
    });

    resultBox.innerHTML = `
      <!-- 1. Risk Summary 카드 -->
      <div class="glass-subcard" style="border: 1px solid var(--border-card); border-left: 4px solid var(--color-status-high); background: rgba(255,255,255,0.01); border-radius: 0 8px 8px 0; padding: 12px 16px; margin-bottom: 4px;">
        <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: var(--color-status-high); margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
          <i data-lucide="shield-alert" style="width: 14px; height: 14px;"></i>
          <span>1. Risk Summary (위험 요약 및 규격 저촉 분석)</span>
        </div>
        <div style="font-size: 13px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px;">${data.subject}</div>
        <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.5; margin: 0;">${data.summary}</p>
      </div>

      <!-- 2. Root Cause Hypothesis 카드 -->
      <div class="glass-subcard" style="border: 1px solid var(--border-card); border-left: 4px solid var(--color-status-medium); background: rgba(255,255,255,0.01); border-radius: 0 8px 8px 0; padding: 12px 16px; margin-bottom: 4px;">
        <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: var(--color-status-medium); margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
          <i data-lucide="help-circle" style="width: 14px; height: 14px;"></i>
          <span>2. Root Cause Hypothesis (인과 관계 가설 분석)</span>
        </div>
        <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.5; margin: 0;">${data.rootcause}</p>
      </div>

      <!-- 3. Corrective Action 카드 -->
      <div class="glass-subcard" style="border: 1px solid var(--border-card); border-left: 4px solid var(--brand-blue); background: rgba(255,255,255,0.01); border-radius: 0 8px 8px 0; padding: 12px 16px; margin-bottom: 4px;">
        <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: var(--brand-blue); margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
          <i data-lucide="clipboard-check" style="width: 14px; height: 14px;"></i>
          <span>3. Corrective Action (8D 영구 시정 조치 계획)</span>
        </div>
        <ul style="padding: 0; margin: 0;">${actionsHTML}</ul>
      </div>

      <!-- 4. Required Evidence 카드 -->
      <div class="glass-subcard" style="border: 1px solid var(--border-card); border-left: 4px solid var(--color-status-low); background: rgba(255,255,255,0.01); border-radius: 0 8px 8px 0; padding: 12px 16px; margin-bottom: 4px;">
        <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: var(--color-status-low); margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
          <i data-lucide="files" style="width: 14px; height: 14px;"></i>
          <span>4. Required Evidence (감사 합치 증빙 실물 요구 문서)</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 6px;">${evidenceHTML}</div>
      </div>

      <!-- 5. SOP Revision Guide 카드 -->
      <div class="glass-subcard" style="border: 1px solid var(--border-card); border-left: 4px solid var(--color-status-info); background: rgba(37, 99, 235, 0.02); border-radius: 0 8px 8px 0; padding: 12px 16px;">
        <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: var(--color-status-info); margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
          <i data-lucide="book-open" style="width: 14px; height: 14px;"></i>
          <span>5. SOP Revision Guide (연계 표준 작업 지침서 보완 권고)</span>
        </div>
        <div style="font-size: 12px; color: var(--text-primary); line-height: 1.5; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 6px; border: 1px solid rgba(255,255,255,0.04); font-family: monospace;">
          ${data.sop}
        </div>
      </div>
    `;

    // 서서히 드러나도록 CSS 트랜지션 적용 효과 부여
    resultBox.style.opacity = '0';
    resultBox.style.display = 'flex';
    setTimeout(() => {
      resultBox.style.transition = 'opacity 0.4s ease-out';
      resultBox.style.opacity = '1';
    }, 50);

    this.showToast("AI 8D 대응 조치 및 SOP 개정 표준안이 즉각 완결 도출되었습니다!", "success");

    // 아이콘 드로잉
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  },

  // ==========================================================================
  // 📁 5. Library (통합 감사 지식 라이브러리 핵심 구현)
  // ==========================================================================
  initLibraryTab() {
    // 1. 상태 변수 초기화
    if (!this.state.libraryInnerTab) this.state.libraryInnerTab = 'custom';
    if (!this.state.findingsCurrentPage) this.state.findingsCurrentPage = 1;
    if (!this.state.findingsPageSize) this.state.findingsPageSize = 10;

    // 2. 수검 공정별 전체 현황 카드 렌더링 (null-guarded)
    this.renderProcessSummary();

    // 3. 양대 테이블 렌더링
    this.renderChecklistTable();
    this.renderFindingsTable();

    // 4. OE 기술 사양서 리스트 및 매핑 렌더링
    this.renderDocumentLibrary();
    this.renderRequirementMapping();

    // 5. 로컬 출력 언어 필터 초기 설정 및 바인딩
    const langSelect = document.getElementById('library-filter-lang');
    if (langSelect) {
      langSelect.value = this.state.currentLang || 'KO';
      langSelect.addEventListener('change', (e) => {
        this.state.currentLang = e.target.value;
        localStorage.setItem('riskhunter_language', this.state.currentLang);
        
        // 상단 글로벌 셀렉터 동기화
        const globalLang = document.getElementById('global-lang-select');
        if (globalLang) globalLang.value = this.state.currentLang;

        this.showToast(`시스템 언어가 [${e.target.options[e.target.selectedIndex].text}](으)로 변경되었습니다.`, 'success');
        this.onLanguageChange();
      });
    }

    // 6. 내측 서브 탭 (Check List 1 / Check List 2) 스위칭 바인딩
    const tabCustom = document.getElementById('tab-checklist-custom');
    const tabFindings = document.getElementById('tab-checklist-findings');
    const panelCustom = document.getElementById('panel-checklist-custom');
    const panelFindings = document.getElementById('panel-checklist-findings');

    if (tabCustom && tabFindings && panelCustom && panelFindings) {
      tabCustom.addEventListener('click', () => {
        this.state.libraryInnerTab = 'custom';
        
        tabCustom.classList.add('active');
        tabCustom.style.background = 'var(--brand-blue)';
        tabCustom.style.color = 'var(--text-light)';
        tabCustom.style.fontWeight = '600';

        tabFindings.classList.remove('active');
        tabFindings.style.background = 'transparent';
        tabFindings.style.color = 'var(--text-secondary)';
        tabFindings.style.fontWeight = '500';

        panelCustom.style.display = 'flex';
        panelFindings.style.display = 'none';

        this.renderChecklistTable();
      });

      tabFindings.addEventListener('click', () => {
        this.state.libraryInnerTab = 'findings';

        tabFindings.classList.add('active');
        tabFindings.style.background = 'var(--brand-blue)';
        tabFindings.style.color = 'var(--text-light)';
        tabFindings.style.fontWeight = '600';

        tabCustom.classList.remove('active');
        tabCustom.style.background = 'transparent';
        tabCustom.style.color = 'var(--text-secondary)';
        tabCustom.style.fontWeight = '500';

        panelCustom.style.display = 'none';
        panelFindings.style.display = 'flex';

        this.renderFindingsTable();
      });
    }

    // 7. 실시간 통합 검색바 바인딩
    const checklistSearch = document.getElementById('checklist-search-input');
    if (checklistSearch) {
      checklistSearch.addEventListener('input', (e) => {
        this.state.checklistSearchQuery = e.target.value.trim();
        this.state.checklistCurrentPage = 1; 
        this.state.findingsCurrentPage = 1;
        
        this.renderChecklistTable();
        this.renderFindingsTable();
      });
    }

    // 8. 엑셀 추출 액션 핸들러 바인딩
    const btnCsvExport = document.getElementById('btn-checklist-csv-export');
    if (btnCsvExport) {
      btnCsvExport.addEventListener('click', () => {
        if (this.state.libraryInnerTab === 'custom') {
          this.exportChecklistToCSV();
        } else {
          this.exportFindingsToCSV();
        }
      });
    }

    // 9. Check List 1 페이지네이션 버튼 바인딩
    const btnPrevPage = document.getElementById('btn-checklist-prev-page');
    const btnNextPage = document.getElementById('btn-checklist-next-page');
    if (btnPrevPage) {
      btnPrevPage.addEventListener('click', () => {
        if (this.state.checklistCurrentPage > 1) {
          this.state.checklistCurrentPage--;
          this.renderChecklistTable();
        }
      });
    }
    if (btnNextPage) {
      btnNextPage.addEventListener('click', () => {
        const totalItems = this.getFilteredChecklist().length;
        const totalPages = Math.ceil(totalItems / this.state.checklistPageSize);
        if (this.state.checklistCurrentPage < totalPages) {
          this.state.checklistCurrentPage++;
          this.renderChecklistTable();
        }
      });
    }

    // 10. Check List 2 페이지네이션 버튼 바인딩
    const btnFindingsPrev = document.getElementById('btn-findings-prev-page');
    const btnFindingsNext = document.getElementById('btn-findings-next-page');
    if (btnFindingsPrev) {
      btnFindingsPrev.addEventListener('click', () => {
        if (this.state.findingsCurrentPage > 1) {
          this.state.findingsCurrentPage--;
          this.renderFindingsTable();
        }
      });
    }
    if (btnFindingsNext) {
      btnFindingsNext.addEventListener('click', () => {
        const totalItems = this.getFilteredFindings().length;
        const totalPages = Math.ceil(totalItems / this.state.findingsPageSize);
        if (this.state.findingsCurrentPage < totalPages) {
          this.state.findingsCurrentPage++;
          this.renderFindingsTable();
        }
      });
    }

    // 11. 서브 상세 드로어 닫기 버튼 핸들러
    const btnCloseDrawer = document.getElementById('btn-close-drawer');
    if (btnCloseDrawer) {
      btnCloseDrawer.addEventListener('click', () => {
        const drawer = document.getElementById('checklist-drawer');
        if (drawer) drawer.classList.remove('active');
      });
    }

    // 12. OE 요약본 검색 필드 바인딩
    const libSearch = document.getElementById('lib-search-input');
    if (libSearch) {
      libSearch.addEventListener('input', (e) => {
        this.state.libSearchQuery = e.target.value.trim();
        this.renderDocumentLibrary();
      });
    }

    // 13. 가상 원본 다운로드 트리거 바인딩
    const btnDownloadDoc = document.getElementById('btn-lib-download-doc');
    if (btnDownloadDoc) {
      btnDownloadDoc.addEventListener('click', () => {
        this.downloadDocSummary();
      });
    }
  },

  // 📊 공정별 요약 통계 정보 연산 및 상단 렌더링 (드롭다운 & 스코어보드 뷰)
  renderProcessSummary() {
    const container = document.getElementById('checklist-process-summary');
    if (!container) return;

    const checklists = this.state.auditChecklists;
    if (!checklists || checklists.length === 0) return;

    // 공정 및 카테고리 정의 마스터 목록을 data/common_codes.json 으로부터 동적으로 구성
    const rawProcesses = this.state.commonCodes?.processes || [];
    const manufacturingProcesses = [];
    
    // Form 과 Sealant 는 UI 상에서 'Special (Form/Sealant)' 하나로 병합 표시하므로 병합 처리
    let hasSpecial = false;
    rawProcesses.forEach(p => {
      if (p.code === 'Form' || p.code === 'Sealant' || p.code === 'Special') {
        hasSpecial = true;
      } else {
        manufacturingProcesses.push({ value: p.code, label: `${p.code} (${p.name})` });
      }
    });
    if (hasSpecial) {
      manufacturingProcesses.push({ value: 'Special', label: 'Special (Form/Sealant)' });
    }

    const systemCategories = (this.state.commonCodes?.categories || []).map(c => ({
      value: c.code,
      label: `${c.code} (${c.name})`
    }));

    // 실시간 각 분류별 통계 미리 연산
    const stats = { ALL: { total: 0, high: 0 } };
    
    // 소문자 키로 통계 초기화
    manufacturingProcesses.forEach(p => stats[p.value.toLowerCase()] = { total: 0, high: 0 });
    systemCategories.forEach(c => stats[c.value.toLowerCase()] = { total: 0, high: 0 });

    checklists.forEach(item => {
      const itemProc = (item.process_category || '').toLowerCase();
      const isHigh = item.priority && item.priority.toUpperCase() === 'HIGH';

      // ALL 누적
      stats.ALL.total++;
      if (isHigh) stats.ALL.high++;

      // 특정 공정 매핑 누적
      if (stats[itemProc] !== undefined) {
        stats[itemProc].total++;
        if (isHigh) stats[itemProc].high++;
      } else if (itemProc === 'form' || itemProc === 'sealant') {
        // Special 공정 하위 카테고리 누적 처리
        if (stats['special']) {
          stats['special'].total++;
          if (isHigh) stats['special'].high++;
        }
      }
    });

    // 드롭다운 옵션 빌드 (optgroup 사용으로 극상의 심미성 확보)
    let optionsHTML = `<option value="ALL" ${this.state.checklistFilterProcess === 'ALL' ? 'selected' : ''}>전체 공정 및 카테고리 (ALL)</option>`;
    
    optionsHTML += `<optgroup label="⚙️ 제조 부문 - Process" style="background: var(--bg-card); color: var(--brand-blue); font-weight: 600;">`;
    manufacturingProcesses.forEach(p => {
      const pStats = stats[p.value.toLowerCase()] || { total: 0, high: 0 };
      optionsHTML += `<option value="${p.value}" ${this.state.checklistFilterProcess === p.value ? 'selected' : ''} style="color: var(--text-primary); font-weight: normal;">${p.label} (${pStats.total}건)</option>`;
    });
    optionsHTML += `</optgroup>`;

    optionsHTML += `<optgroup label="📋 시스템 부문 - Category" style="background: var(--bg-card); color: var(--brand-blue); font-weight: 600;">`;
    systemCategories.forEach(c => {
      const cStats = stats[c.value.toLowerCase()] || { total: 0, high: 0 };
      optionsHTML += `<option value="${c.value}" ${this.state.checklistFilterProcess === c.value ? 'selected' : ''} style="color: var(--text-primary); font-weight: normal;">${c.label} (${cStats.total}건)</option>`;
    });
    optionsHTML += `</optgroup>`;

    // 선택된 공정 기준 실시간 통계 산정
    const selected = this.state.checklistFilterProcess;
    let dispTotal = 0;
    let dispHigh = 0;
    let dispLabel = '';

    if (selected === 'ALL') {
      dispTotal = stats.ALL.total;
      dispHigh = stats.ALL.high;
      dispLabel = '전체 공정 및 카테고리';
    } else {
      const key = selected.toLowerCase();
      const matchProcess = manufacturingProcesses.find(p => p.value === selected);
      const matchCategory = systemCategories.find(c => c.value === selected);
      dispLabel = matchProcess ? matchProcess.label : (matchCategory ? matchCategory.label : selected);
      
      if (stats[key]) {
        dispTotal = stats[key].total;
        dispHigh = stats[key].high;
      }
    }

    // 💡 미학적 가로 스크롤 카드 리스트 구축 (기획 3.① 준수)
    // 주요 공정 목록 및 아이콘, 가상 진척률 정의
    const cardProcesses = [
      { code: 'ALL', label: '전체 (ALL)', icon: 'layers', progress: 78 },
      { code: 'Incoming', label: '수입검사', icon: 'package-open', progress: 85 },
      { code: 'Mixing', label: '배합 (Mixing)', icon: 'blend', progress: 90 },
      { code: 'Extrusion', label: '압출 (Extrusion)', icon: 'chevrons-right', progress: 75 },
      { code: 'Building', label: '성형 (Building)', icon: 'hammer', progress: 65 },
      { code: 'Curing', label: '가류 (Curing)', icon: 'flame', progress: 95 },
      { code: 'Inspection', label: '검사 (Inspection)', icon: 'eye', progress: 88 },
      { code: 'Special', label: 'Special (공정)', icon: 'award', progress: 50 }
    ];

    let cardsHTML = '';
    cardProcesses.forEach(cp => {
      const isCardActive = selected === cp.code;
      const cpStats = stats[cp.code.toLowerCase()] || stats[cp.code] || { total: 0, high: 0 };
      const total = cp.code === 'ALL' ? stats.ALL.total : cpStats.total;
      const high = cp.code === 'ALL' ? stats.ALL.high : cpStats.high;
      const highRate = total > 0 ? ((high / total) * 100).toFixed(0) : 0;

      // 카드 개별 스타일 정의
      const cardStyle = isCardActive 
        ? `border: 1.5px solid var(--brand-blue); box-shadow: 0 4px 12px rgba(37, 99, 235, 0.12); background: #eff6ff;` 
        : `border: 1px solid var(--border-card); background: var(--bg-app);`;

      const iconColor = isCardActive ? 'var(--brand-blue)' : 'var(--text-secondary)';

      cardsHTML += `
        <div class="process-summary-card" data-process-code="${cp.code}" style="min-width: 195px; width: 195px; flex-shrink: 0; padding: 12px; border-radius: 8px; cursor: pointer; transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1); ${cardStyle} display: flex; flex-direction: column; gap: 6px;">
          <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
            <span style="font-size: 11px; font-weight: 700; color: ${isCardActive ? 'var(--brand-blue)' : 'var(--text-secondary)'}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 125px;">${cp.label}</span>
            <i data-lucide="${cp.icon}" style="width: 14px; height: 14px; color: ${iconColor};"></i>
          </div>
          
          <div style="display: flex; align-items: baseline; gap: 4px; margin-top: 2px;">
            <span style="font-size: 18px; font-weight: 800; font-family: monospace; color: var(--text-primary);">${total}</span>
            <span style="font-size: 10px; color: var(--text-secondary);">개 조항</span>
          </div>

          <!-- 고위험 비중 정보 -->
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 10px;">
            <span style="color: #ef4444; display: flex; align-items: center; gap: 2px; font-weight: 500;">
              <i data-lucide="alert-triangle" style="width: 10px; height: 10px;"></i>
              High ${high}건
            </span>
            <span style="color: var(--text-muted-light); font-family: monospace; font-weight: 500;">비중 ${highRate}%</span>
          </div>

          <!-- 진척률 게이지 바 (기획 인디케이터 요건 준수) -->
          <div style="margin-top: 4px;">
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 9px; color: var(--text-secondary); margin-bottom: 3px;">
              <span>자체 점검 진척</span>
              <span style="font-weight: 700; color: var(--brand-blue);">${cp.progress}%</span>
            </div>
            <div style="width: 100%; height: 3px; background: rgba(0,0,0,0.05); border-radius: 2px; overflow: hidden;">
              <div style="width: ${cp.progress}%; height: 100%; background: ${isCardActive ? 'var(--brand-blue)' : '#10b981'}; border-radius: 2px; transition: width 0.3s ease;"></div>
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; width: 100%; gap: 14px;">
        
        <!-- 1. 상단 조정 행: 드롭다운 선택 필터 & 요약 수치 -->
        <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; gap: 16px; flex-wrap: wrap; border-bottom: 1px dashed var(--border-card); padding-bottom: 12px;">
          <!-- 좌측: 드롭다운 선택상자 -->
          <div style="display: flex; align-items: center; gap: 10px; flex-wrap: nowrap;">
            <span style="font-size: 12px; color: var(--text-primary); font-weight: 600; white-space: nowrap;">공정 빠른 탐색:</span>
            <select id="checklist-process-dropdown" class="filter-select" style="min-width: 250px; font-size: 12px; background: var(--bg-card); border: 1px solid var(--border-card); border-radius: 6px; padding: 5px 10px; color: var(--text-primary); cursor: pointer; outline: none; transition: border-color 0.2s;">
              ${optionsHTML}
            </select>
          </div>
          
          <!-- 우측: 선택된 공정의 요약 지표 보드 -->
          <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap; flex-shrink: 0;">
            <div style="font-size: 11px; color: var(--text-secondary); white-space: nowrap; display: flex; align-items: center; gap: 4px;">
              현재 선택: <strong style="color: var(--text-status-info); font-size: 12px; font-weight: 700; white-space: nowrap;">${dispLabel}</strong>
            </div>
            
            <div style="background: var(--bg-app); border: 1px solid var(--border-card); border-radius: 4px; padding: 4px 10px; display: flex; align-items: center; gap: 6px; font-size: 11px; white-space: nowrap; flex-shrink: 0;">
              <span style="color: var(--text-secondary); white-space: nowrap;">총 반영 조항 수</span>
              <span style="font-weight: 700; color: var(--text-primary); font-family: monospace; white-space: nowrap;">${dispTotal}건</span>
            </div>

            <div style="background: var(--bg-status-high); border: 1px solid var(--border-status-high); border-radius: 4px; padding: 4px 10px; display: flex; align-items: center; gap: 6px; font-size: 11px; white-space: nowrap; flex-shrink: 0;">
              <span style="color: var(--text-status-high); font-weight: 600; white-space: nowrap;">고위험 (High)</span>
              <span style="font-weight: 700; color: var(--color-status-high); font-family: monospace; display: flex; align-items: center; gap: 3px; white-space: nowrap; flex-shrink: 0;">
                <i data-lucide="alert-triangle" style="width: 11px; height: 11px;"></i>
                ${dispHigh}건
              </span>
            </div>
          </div>
        </div>

        <!-- 2. 하단 조정 행: 미학적 가로 스크롤 글래스모피즘 공정 요약 보드 (수치 및 진척 인디케이터 장착) -->
        <div id="checklist-horizontal-scroll-board" style="display: flex; gap: 12px; overflow-x: auto; width: 100%; padding-bottom: 6px; scrollbar-width: thin; scrollbar-color: rgba(0,0,0,0.15) transparent;">
          ${cardsHTML}
        </div>

      </div>
    `;

    if (typeof lucide !== 'undefined') lucide.createIcons();

    // 1. 드롭다운 변경 리스너 연계
    const selectEl = document.getElementById('checklist-process-dropdown');
    if (selectEl) {
      selectEl.addEventListener('change', (e) => {
        const proc = e.target.value;
        this.state.checklistFilterProcess = proc;
        this.state.checklistCurrentPage = 1;
        this.renderProcessSummary();
        this.renderChecklistTable();
      });
    }

    // 2. 가로 스크롤 카드 클릭 리스너 연계 (무지연 퀵 필터 인터랙션)
    container.querySelectorAll('.process-summary-card').forEach(card => {
      card.addEventListener('click', () => {
        const proc = card.getAttribute('data-process-code');
        this.state.checklistFilterProcess = proc;
        this.state.checklistCurrentPage = 1;
        this.renderProcessSummary();
        this.renderChecklistTable();
      });
    });
  },

  // 🧠 텍스트 마이닝 기반 지적사항 공정 분류 알고리즘
  getFindingProcess(finding) {
    if (finding.process_category) return finding.process_category;
    if (finding.PROCESS) return finding.PROCESS;
    if (finding.process) return finding.process;
    if (finding._mappedProcess) return finding._mappedProcess;
    
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
  },

  // 📝 공정/검색 통합 필터 적용된 데이터 셋 슬라이스
  getFilteredChecklist() {
    let list = this.state.auditChecklists || [];
    
    // 🛡️ 제조공정 필터 제거에 따른 Null Guard 설계 (Zero Crash Policy)
    const selectedPlant = this.state.librarySelectedPlant || 'ALL';
    const selectedCustomer = this.state.librarySelectedCustomer || 'ALL';
    const filterProcess = this.state.checklistFilterProcess || 'ALL';

    // 라이브러리 로컬 필터 적용 (Plant)
    if (selectedPlant !== 'ALL') {
      const plant = selectedPlant.toLowerCase();
      list = list.filter(item => (item.plant_code || '').toLowerCase() === plant || (item.plant_code || '').toLowerCase() === 'all');
    }
    
    // 완성차 계층형 매핑 마스터 (Smart OEM Hierarchy) 반영 (Customer)
    if (selectedCustomer !== 'ALL') {
      let targetOems = [selectedCustomer];
      if (OEM_MASTER[selectedCustomer] && OEM_MASTER[selectedCustomer].subs) {
        targetOems = targetOems.concat(OEM_MASTER[selectedCustomer].subs);
      }
      const lowerTargetOems = targetOems.map(o => o.toLowerCase());
      list = list.filter(item => lowerTargetOems.includes((item.customer || '').toLowerCase()));
    }
    
    // 1. 공정 분류 로컬 필터 (Process & Category 스펙 반영)
    if (filterProcess !== 'ALL') {
      const selected = filterProcess.toLowerCase();
      list = list.filter(item => {
        const itemProc = (item.process_category || '').toLowerCase();
        
        // Special 공정에 대한 하위 물리 카테고리 매핑 (Form/Sealant)
        if (selected === 'special') {
          return itemProc === 'special' || itemProc === 'form' || itemProc === 'sealant';
        }
        
        return itemProc === selected;
      });
    }

    // 2. 통합 검색어 필터
    if (this.state.checklistSearchQuery) {
      const q = this.state.checklistSearchQuery.toLowerCase();
      list = list.filter(item => {
        return (item.audit_question && item.audit_question.toLowerCase().includes(q)) ||
               (item.evidence_compliance && item.evidence_compliance.toLowerCase().includes(q)) ||
               (item.doc_code && item.doc_code.toLowerCase().includes(q)) ||
               (item.doc_name && item.doc_name.toLowerCase().includes(q)) ||
               (item.requirement && item.requirement.toLowerCase().includes(q));
      });
    }

    // 🔄 맞춤형 감사 체크리스트 추출 및 중복 병합 알고리즘 (De-duplication)
    const seenQuestions = new Set();
    list = list.filter(item => {
      const q = (item.audit_question || '').trim();
      if (!q) return true;
      if (seenQuestions.has(q)) return false;
      seenQuestions.add(q);
      return true;
    });

    return list;
  },

  // 📋 마스터 체크리스트 데이터 테이블 및 페이지네이션 렌더러
  renderChecklistTable() {
    const tbody = document.getElementById('checklist-table-body');
    const pagInfo = document.getElementById('checklist-pagination-info');
    if (!tbody || !pagInfo) return;

    const filtered = this.getFilteredChecklist();
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / this.state.checklistPageSize) || 1;

    // 현재 슬라이스 한계 클램핑
    if (this.state.checklistCurrentPage > totalPages) this.state.checklistCurrentPage = totalPages;

    const startIdx = (this.state.checklistCurrentPage - 1) * this.state.checklistPageSize;
    const endIdx = Math.min(startIdx + this.state.checklistPageSize, totalItems);
    const paginatedItems = filtered.slice(startIdx, endIdx);

    tbody.innerHTML = '';

    const processTranslations = {
      'Mixing': { KO: '정련', EN: 'Mixing', ZH: '混炼' },
      'Extrusion': { KO: '압출', EN: 'Extrusion', ZH: '挤出' },
      'Curing': { KO: '가류', EN: 'Curing', ZH: '硫化' },
      'Building': { KO: '성형', EN: 'Building', ZH: '成型' },
      'Calendaring': { KO: '압연', EN: 'Calendaring', ZH: '压延' },
      'Cutting': { KO: '재단', EN: 'Cutting', ZH: '裁断' },
      'Bead': { KO: '비드', EN: 'Bead', ZH: '胎圈' },
      'Incoming': { KO: '수입검사', EN: 'Incoming', ZH: '来料' },
      'Re-work': { KO: '재작업', EN: 'Re-work', ZH: '返工' },
      'Form': { KO: '폼', EN: 'Form', ZH: '海绵' },
      'Sealant': { KO: '실란트', EN: 'Sealant', ZH: '密封胶' },
      'Logistics': { KO: '물류', EN: 'Logistics', ZH: '物流' },
      'Inspection': { KO: '외관검사', EN: 'Inspection', ZH: '检测' },
      'Test': { KO: '시험', EN: 'Test', ZH: '测试' },
      'System': { KO: '시스템', EN: 'System', ZH: '体系' },
      'General': { KO: '일반', EN: 'General', ZH: '通用' }
    };
    const currentLang = this.state.currentLang || 'KO';

    if (paginatedItems.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" style="padding: 40px; text-align: center; color: var(--text-secondary); font-size: 13px;">
            <i data-lucide="info" style="width: 24px; height: 24px; margin-bottom: 8px; opacity: 0.5;"></i>
            <p>검색 조건 및 선택 공정에 해당되는 표준 감사 체크리스트가 없습니다.</p>
          </td>
        </tr>
      `;
      pagInfo.textContent = `0 - 0 / 총 0건`;
      if (typeof lucide !== 'undefined') lucide.createIcons();
      return;
    }

    paginatedItems.forEach(item => {
      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid var(--border-card)';
      tr.style.cursor = 'pointer';
      tr.className = 'table-row-hover';
      if (this.state.selectedChecklistItem && this.state.selectedChecklistItem.id === item.id) {
        tr.style.background = 'rgba(59, 130, 246, 0.08)';
      }

      const rawProcess = item.process_category || 'General';
      const processName = (processTranslations[rawProcess] && processTranslations[rawProcess][currentLang]) || rawProcess;

      tr.innerHTML = `
        <td style="padding: 12px; font-size: 12px; font-weight: 500;">
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <span class="badge" style="background: rgba(255, 255, 255, 0.04); border: 1px solid var(--border-card); font-size: 11px; align-self: flex-start;">${processName}</span>
            <span style="font-size: 10px; color: var(--text-secondary); max-width: 110px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${item.section}">${item.section}</span>
          </div>
        </td>
        <td style="padding: 12px; font-size: 13px; color: var(--text-primary); max-width: 400px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${item.audit_question}">${item.audit_question}</td>
        <td style="padding: 12px; font-size: 12px; color: var(--text-secondary); max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${item.evidence_compliance}">${item.evidence_compliance}</td>
        <td style="padding: 12px; font-size: 12px; color: var(--text-secondary); max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${item.audit_method}">${item.audit_method}</td>
      `;

      // 행 클릭 이벤트 수립 -> 세부 드로어 열기 및 데이터 바인딩
      tr.addEventListener('click', () => {
        this.state.selectedChecklistItem = item;
        this.renderChecklistTable(); // 배경 행 색상 싱크
        this.openChecklistDrawer(item);
      });

      tbody.appendChild(tr);
    });

    pagInfo.textContent = `${startIdx + 1} - ${endIdx} / 총 ${totalItems}건`;
    if (typeof lucide !== 'undefined') lucide.createIcons();
  },

  // 📂 우측 상세 수검 슬라이드 드로어 오픈 및 내용 렌더링
  openChecklistDrawer(item) {
    const drawer = document.getElementById('checklist-drawer');
    const drawerBody = document.getElementById('checklist-drawer-body');
    if (!drawer || !drawerBody) return;

    // 드로어 활성화 클래스 투척
    drawer.classList.add('active');

    // 내용 렌더링
    drawerBody.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <!-- 문서 세션 타이틀 -->
        <div style="background: rgba(59,130,246,0.05); border-left: 3px solid var(--brand-blue); padding: 12px; border-radius: 4px;">
          <div style="font-size: 11px; text-transform: uppercase; color: var(--text-secondary); font-weight: 700; margin-bottom: 4px;">원천 규격서 정보</div>
          <div style="font-weight: 700; font-size: 14px; color: var(--text-primary);">${item.doc_name || item.doc_code}</div>
          <div style="font-size: 11px; font-family: monospace; color: var(--text-secondary); margin-top: 4px; display: flex; justify-content: space-between;">
            <span>Code: ${item.doc_code}</span>
            <span>Section: ${item.section || 'General'}</span>
          </div>
        </div>

        <!-- 원래 요구조건 (Requirement) -->
        <div>
          <div style="font-size: 12px; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px; display: flex; align-items: center; gap: 4px;">
            <i data-lucide="scroll" style="width: 14px; height: 14px;"></i>
            <span>OEM 규격 원문 제약요건 (Requirement)</span>
          </div>
          <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-card); padding: 12px; border-radius: 6px; font-size: 12px; line-height: 1.6; color: var(--text-secondary); font-style: italic;">
            "${item.requirement || 'N/A'}"
          </div>
        </div>

        <!-- 국문화 번역 감사 핵심 질문 -->
        <div>
          <div style="font-size: 12px; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px; display: flex; align-items: center; gap: 4px;">
            <i data-lucide="help-circle" style="width: 14px; height: 14px; color: var(--brand-blue);"></i>
            <span>한글 감사 핵심 질문 (Audit Question)</span>
          </div>
          <div style="background: rgba(59,130,246,0.02); border: 1px solid rgba(59, 130, 246, 0.15); padding: 14px; border-radius: 6px; font-size: 13px; font-weight: 500; line-height: 1.6; color: var(--text-primary);">
            ${item.audit_question}
          </div>
        </div>

        <!-- 준수 증빙 자료 가이드 (Evidence compliance) -->
        <div>
          <div style="font-size: 12px; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px; display: flex; align-items: center; gap: 4px;">
            <i data-lucide="file-check-2" style="width: 14px; height: 14px; color: #10b981;"></i>
            <span>필수 확보 준수 증적 실물 가이드 (Evidence)</span>
          </div>
          <div style="background: rgba(16,185,129,0.02); border: 1px solid rgba(16, 185, 129, 0.15); padding: 12px; border-radius: 6px; font-size: 12px; line-height: 1.6; color: var(--text-light);">
            ${item.evidence_compliance || '현장 승인 공정 관리 계획서 및 승인 성적서 대조'}
          </div>
        </div>

        <!-- 감사 점검 방법 (Audit Method) -->
        <div>
          <div style="font-size: 12px; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px; display: flex; align-items: center; gap: 4px;">
            <i data-lucide="eye" style="width: 14px; height: 14px; color: #f59e0b;"></i>
            <span>현장 감사 검증 방법 (Audit Method)</span>
          </div>
          <div style="background: rgba(245,158,11,0.02); border: 1px solid rgba(245, 158, 11, 0.15); padding: 12px; border-radius: 6px; font-size: 12px; line-height: 1.6; color: var(--text-secondary);">
            ${item.audit_method || 'N/A'}
          </div>
        </div>

        <!-- 하이테크 스펙 메타 표 -->
        <div style="margin-top: 10px; border: 1px solid var(--border-card); border-radius: 6px; overflow: hidden; font-size: 11px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; border-bottom: 1px solid var(--border-card); background: rgba(255,255,255,0.02);">
            <div style="padding: 8px 12px; border-right: 1px solid var(--border-card); color: var(--text-secondary); font-weight: 600;">공정 카테고리</div>
            <div style="padding: 8px 12px; color: var(--text-primary); font-weight: 600;">${item.process_category}</div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; border-bottom: 1px solid var(--border-card);">
            <div style="padding: 8px 12px; border-right: 1px solid var(--border-card); color: var(--text-secondary); font-weight: 600;">연계 4M 구성 요소</div>
            <div style="padding: 8px 12px; color: var(--text-primary); font-weight: 600;"><span class="badge" style="font-size: 10px; background: rgba(255,255,255,0.05);">${item.related_4m || 'Method'}</span></div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; border-bottom: 1px solid var(--border-card); background: rgba(255,255,255,0.02);">
            <div style="padding: 8px 12px; border-right: 1px solid var(--border-card); color: var(--text-secondary); font-weight: 600;">품질 의무 조항 중요도</div>
            <div style="padding: 8px 12px; color: var(--text-primary); font-weight: 600;">${item.priority}</div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr;">
            <div style="padding: 8px 12px; border-right: 1px solid var(--border-card); color: var(--text-secondary); font-weight: 600;">가중치 리스크 스코어</div>
            <div style="padding: 8px 12px; color: #ef4444; font-weight: 700; font-family: monospace;">${parseFloat(item.plant_risk_score).toFixed(1)} 점</div>
          </div>
        </div>
      </div>
    `;

    if (typeof lucide !== 'undefined') lucide.createIcons();
  },

  // 📥 한글 안깨지는 엑셀 호환 UTF-8 BOM CSV 내보내기 엔진
  exportChecklistToCSV() {
    const list = this.getFilteredChecklist();
    if (list.length === 0) {
      this.showToast("내보낼 데이터가 존재하지 않습니다.", "warning");
      return;
    }

    console.log(`📥 Compiling CSV for ${list.length} rows with UTF-8 BOM...`);

    // 1. CSV 헤더 구성
    const headers = ["ID", "고객사(OEM)", "규격 코드", "규격서 명칭", "조항(Section)", "원문 요구조건(Requirement)", "감사 질문(Audit Question)", "필수 증적가이드(Evidence)", "감사 방법(Audit Method)", "공정분류", "연계4M", "중요도", "리스크 가중치"];
    
    // 2. 값 이스케이프 함수 (쉼표나 따옴표 등 방어)
    const escapeCsvValue = (val) => {
      if (val === null || val === undefined) return "";
      let str = String(val).replace(/"/g, '""'); // 쌍따옴표 더블링 이스케이프
      if (str.includes(",") || str.includes("\n") || str.includes('"')) {
        str = `"${str}"`;
      }
      return str;
    };

    // 3. 행 구성
    const rows = list.map(item => [
      item.id,
      item.customer,
      item.doc_code,
      item.doc_name,
      item.section || "",
      item.requirement,
      item.audit_question,
      item.evidence_compliance,
      item.audit_method || "",
      item.process_category,
      item.related_4m || "",
      item.priority,
      item.plant_risk_score
    ]);

    // 4. CSV 버퍼 구성
    const csvContent = [headers.map(escapeCsvValue).join(",")]
      .concat(rows.map(row => row.map(escapeCsvValue).join(",")))
      .join("\n");

    // 5. UTF-8 BOM 마커 (\ufeff) 삽입하여 엑셀 한국어 안 깨지도록 조작
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8;' });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    
    // 파일명 형식화
    const dateStr = new Date().toISOString().slice(0,10);
    link.setAttribute("download", `RiskHunter_Master_Checklist_${this.state.checklistFilterProcess}_${dateStr}.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    this.showToast(`체크리스트 ${list.length}건이 성공적으로 다운로드되었습니다.`, 'success');
  },

  // 📋 [Check List 2] 과거 OE Audit 지적사항 필터 데이터 추출
  getFilteredFindings() {
    let list = this.state.auditFindings || [];
    
    // 🛡️ 완성차 계층형 매핑 마스터 (Smart OEM Hierarchy) 반영 (Customer)
    const selectedCustomer = this.state.librarySelectedCustomer || 'ALL';
    if (selectedCustomer !== 'ALL') {
      let targetOems = [selectedCustomer];
      if (OEM_MASTER[selectedCustomer] && OEM_MASTER[selectedCustomer].subs) {
        targetOems = targetOems.concat(OEM_MASTER[selectedCustomer].subs);
      }
      const lowerTargetOems = targetOems.map(o => o.toLowerCase());
      list = list.filter(item => lowerTargetOems.includes((item.CAR_MAKER || '').toLowerCase()));
    }
    
    // 2. 통합 검색어 필터
    if (this.state.checklistSearchQuery) {
      const q = this.state.checklistSearchQuery.toLowerCase();
      list = list.filter(item => {
        const pointOutKo = (item.POINT_OUT_KO || item.POINT_OUT || '').toLowerCase();
        const pointOutEn = (item.POINT_OUT_EN || '').toLowerCase();
        const rootCauseKo = (item.ROOT_CAUSE_KO || item.ROOT_CAUSE_ANALYSIS || '').toLowerCase();
        const rootCauseEn = (item.ROOT_CAUSE_EN || '').toLowerCase();
        const counterMeasureKo = (item.COUNTER_MEASURE_KO || item.COUNTER_MEASURE || '').toLowerCase();
        const counterMeasureEn = (item.COUNTER_MEASURE_EN || '').toLowerCase();
        const process = (item.PROCESS || '').toLowerCase();
        const project = (item.PROJECT || '').toLowerCase();
        const carMaker = (item.CAR_MAKER || '').toLowerCase();
        
        return pointOutKo.includes(q) ||
               pointOutEn.includes(q) ||
               rootCauseKo.includes(q) ||
               rootCauseEn.includes(q) ||
               counterMeasureKo.includes(q) ||
               counterMeasureEn.includes(q) ||
               process.includes(q) ||
               project.includes(q) ||
               carMaker.includes(q);
      });
    }

    return list;
  },

  // 👥 다국어 번역 헬퍼
  getTranslatedField(item, field) {
    const lang = this.state.currentLang || 'KO';
    if (field === 'POINT_OUT') {
      if (lang === 'KO') return item.POINT_OUT_KO || item.POINT_OUT || 'N/A';
      if (lang === 'EN') return item.POINT_OUT_EN || item.POINT_OUT || 'N/A';
      if (lang === 'ZH') return item.POINT_OUT_ZH || item.POINT_OUT_EN || item.POINT_OUT || 'N/A';
    }
    if (field === 'ROOT_CAUSE') {
      if (lang === 'KO') return item.ROOT_CAUSE_KO || item.ROOT_CAUSE_ANALYSIS || 'N/A';
      if (lang === 'EN') return item.ROOT_CAUSE_EN || item.ROOT_CAUSE_ANALYSIS || 'N/A';
      if (lang === 'ZH') return item.ROOT_CAUSE_ZH || item.ROOT_CAUSE_EN || item.ROOT_CAUSE_ANALYSIS || 'N/A';
    }
    if (field === 'COUNTER_MEASURE') {
      if (lang === 'KO') return item.COUNTER_MEASURE_KO || item.COUNTER_MEASURE || 'N/A';
      if (lang === 'EN') return item.COUNTER_MEASURE_EN || item.COUNTER_MEASURE || 'N/A';
      if (lang === 'ZH') return item.COUNTER_MEASURE_ZH || item.COUNTER_MEASURE_EN || item.COUNTER_MEASURE || 'N/A';
    }
    return 'N/A';
  },

  // 📋 [Check List 2] 과거 OE Audit 지적사항 데이터 테이블 및 페이지네이션 렌더러
  renderFindingsTable() {
    const tbody = document.getElementById('findings-table-body');
    const pagInfo = document.getElementById('findings-pagination-info');
    if (!tbody || !pagInfo) return;

    const filtered = this.getFilteredFindings();
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / this.state.findingsPageSize) || 1;

    // 현재 슬라이스 한계 클램핑
    if (this.state.findingsCurrentPage > totalPages) this.state.findingsCurrentPage = totalPages;

    const startIdx = (this.state.findingsCurrentPage - 1) * this.state.findingsPageSize;
    const endIdx = Math.min(startIdx + this.state.findingsPageSize, totalItems);
    const paginatedItems = filtered.slice(startIdx, endIdx);

    tbody.innerHTML = '';

    const processTranslations = {
      'Mixing': { KO: '정련', EN: 'Mixing', ZH: '混炼' },
      'Extrusion': { KO: '압출', EN: 'Extrusion', ZH: '挤出' },
      'Curing': { KO: '가류', EN: 'Curing', ZH: '硫化' },
      'Building': { KO: '성형', EN: 'Building', ZH: '成型' },
      'Calendaring': { KO: '압연', EN: 'Calendaring', ZH: '压延' },
      'Cutting': { KO: '재단', EN: 'Cutting', ZH: '裁断' },
      'Bead': { KO: '비드', EN: 'Bead', ZH: '胎圈' },
      'Incoming': { KO: '수입검사', EN: 'Incoming', ZH: '来料' },
      'Re-work': { KO: '재작업', EN: 'Re-work', ZH: '返工' },
      'Form': { KO: '폼', EN: 'Form', ZH: '海绵' },
      'Sealant': { KO: '실란트', EN: 'Sealant', ZH: '密封胶' },
      'Logistics': { KO: '물류', EN: 'Logistics', ZH: '物流' },
      'Inspection': { KO: '외관검사', EN: 'Inspection', ZH: '检测' },
      'Test': { KO: '시험', EN: 'Test', ZH: '测试' },
      'System': { KO: '시스템', EN: 'System', ZH: '体系' },
      'General': { KO: '일반', EN: 'General', ZH: '通用' }
    };
    const currentLang = this.state.currentLang || 'KO';

    if (paginatedItems.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="padding: 40px; text-align: center; color: var(--text-secondary); font-size: 13px;">
            <i data-lucide="info" style="width: 24px; height: 24px; margin-bottom: 8px; opacity: 0.5;"></i>
            <p>검색 조건에 해당되는 과거 OE Audit 지적사항이 없습니다.</p>
          </td>
        </tr>
      `;
      pagInfo.textContent = `0 - 0 / 총 0건`;
      if (typeof lucide !== 'undefined') lucide.createIcons();
      return;
    }

    paginatedItems.forEach(item => {
      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid var(--border-card)';
      tr.style.cursor = 'pointer';
      tr.className = 'table-row-hover';
      if (this.state.selectedFindingItem && this.state.selectedFindingItem === item) {
        tr.style.background = 'rgba(59, 130, 246, 0.08)';
      }

      const rawProcess = item.PROCESS || item.process || this.getFindingProcess(item) || 'General';
      const processName = (processTranslations[rawProcess] && processTranslations[rawProcess][currentLang]) || rawProcess;

      const projectText = item.PROJECT || '-';
      const pointOut = this.getTranslatedField(item, 'POINT_OUT');
      const rootCause = this.getTranslatedField(item, 'ROOT_CAUSE');
      const counterMeasure = this.getTranslatedField(item, 'COUNTER_MEASURE');

      tr.innerHTML = `
        <td style="padding: 12px; font-size: 12px; font-weight: 600; color: #3b82f6; vertical-align: middle;">
          ${processName}
        </td>
        <td style="padding: 12px; font-size: 11px; font-weight: 700; color: var(--text-primary); text-align: center; vertical-align: middle; line-height: 1.2; letter-spacing: 0.05em;">
          ${(item.PLANT || 'MP').split('').join('<br>')}
        </td>
        <td style="padding: 12px; font-size: 12px; color: var(--text-secondary); text-align: center; vertical-align: middle;">
          ${projectText}
        </td>
        <td style="padding: 12px; font-size: 12px; font-weight: 500; color: #dc2626; max-width: 320px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; vertical-align: middle;" title="${pointOut}">
          ${pointOut}
        </td>
        <td style="padding: 12px; font-size: 12px; color: var(--text-secondary); max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; vertical-align: middle;" title="${rootCause}">
          ${rootCause || '-'}
        </td>
        <td style="padding: 12px; font-size: 12px; color: var(--text-secondary); max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; vertical-align: middle;" title="${counterMeasure}">
          ${counterMeasure || '-'}
        </td>
        <td style="padding: 12px; text-align: center; vertical-align: middle;">
          <span class="badge" style="font-size: 11px; padding: 2px 8px; border-radius: 4px; display: inline-block; background: ${item.STATUS === 'Closed' || item.STATUS === 'Complete' ? 'rgba(16,185,129,0.06)' : 'rgba(245,158,11,0.06)'}; color: ${item.STATUS === 'Closed' || item.STATUS === 'Complete' ? '#10b981' : '#f59e0b'}; border: 1px solid ${item.STATUS === 'Closed' || item.STATUS === 'Complete' ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.25)'};">
            ${item.STATUS || 'On-going'}
          </span>
        </td>
        <td style="padding: 12px; text-align: center; vertical-align: middle; font-size: 11px; font-weight: 600; color: #16a34a; font-family: monospace;">
          ${item.REG_DT || item.START_DT || '-'}
        </td>
      `;

      // 행 클릭 이벤트 수립 -> 세부 드로어 열기 및 데이터 바인딩
      tr.addEventListener('click', () => {
        this.state.selectedFindingItem = item;
        this.renderFindingsTable(); // 배경 행 색상 싱크
        this.openFindingsChecklistDrawer(item);
      });

      tbody.appendChild(tr);
    });

    pagInfo.textContent = `${startIdx + 1} - ${endIdx} / total ${totalItems}건`;
    if (typeof lucide !== 'undefined') lucide.createIcons();
  },

  // 📂 과거 지적사항 상세 수검 슬라이드 드로어 오픈 및 내용 렌더링
  openFindingsChecklistDrawer(item) {
    const drawer = document.getElementById('checklist-drawer');
    const drawerBody = document.getElementById('checklist-drawer-body');
    if (!drawer || !drawerBody) return;

    drawer.classList.add('active');

    const pointOut = this.getTranslatedField(item, 'POINT_OUT');
    const rootCause = this.getTranslatedField(item, 'ROOT_CAUSE');
    const counterMeasure = this.getTranslatedField(item, 'COUNTER_MEASURE');
    const processName = item.PROCESS || item.process || this.getFindingProcess(item) || 'General';
    const projectText = `${item.CAR_MAKER || ''} ${item.PROJECT || ''}`.trim() || 'General';

    drawerBody.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <!-- 문서 세션 타이틀 -->
        <div style="background: rgba(239, 68, 68, 0.05); border-left: 3px solid #ef4444; padding: 12px; border-radius: 4px;">
          <div style="font-size: 11px; text-transform: uppercase; color: var(--text-secondary); font-weight: 700; margin-bottom: 4px;">과거 OE Audit 지적사항 정보</div>
          <div style="font-weight: 700; font-size: 14px; color: var(--text-primary);">${item.SUBJECT || 'Audit Finding'}</div>
          <div style="font-size: 11px; font-family: monospace; color: var(--text-secondary); margin-top: 4px; display: flex; justify-content: space-between;">
            <span>OEM: ${item.CAR_MAKER || 'N/A'}</span>
            <span>Project: ${projectText}</span>
          </div>
        </div>

        <!-- 지적사항 (Point Out) -->
        <div>
          <div style="font-size: 12px; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px; display: flex; align-items: center; gap: 4px;">
            <i data-lucide="alert-triangle" style="width: 14px; height: 14px; color: #ef4444;"></i>
            <span>지적사항 (Point Out)</span>
          </div>
          <div style="background: rgba(239,68,68,0.02); border: 1px solid rgba(239, 68, 68, 0.15); padding: 14px; border-radius: 6px; font-size: 13px; font-weight: 500; line-height: 1.6; color: var(--text-primary);">
            ${pointOut}
          </div>
        </div>

        <!-- 원인 분석 (Root Cause) -->
        <div>
          <div style="font-size: 12px; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px; display: flex; align-items: center; gap: 4px;">
            <i data-lucide="help-circle" style="width: 14px; height: 14px; color: #f59e0b;"></i>
            <span>원인 분석 (Root Cause)</span>
          </div>
          <div style="background: rgba(245,158,11,0.02); border: 1px solid rgba(245, 158, 11, 0.15); padding: 12px; border-radius: 6px; font-size: 12px; line-height: 1.6; color: var(--text-secondary);">
            ${rootCause}
          </div>
        </div>

        <!-- 조치 대책 (Counter Measure) -->
        <div>
          <div style="font-size: 12px; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px; display: flex; align-items: center; gap: 4px;">
            <i data-lucide="check-circle" style="width: 14px; height: 14px; color: #10b981;"></i>
            <span>조치 대책 (Counter Measure)</span>
          </div>
          <div style="background: rgba(16,185,129,0.02); border: 1px solid rgba(16, 185, 129, 0.15); padding: 12px; border-radius: 6px; font-size: 12px; line-height: 1.6; color: var(--text-light);">
            ${counterMeasure}
          </div>
        </div>

        <!-- 하이테크 스펙 메타 표 -->
        <div style="margin-top: 10px; border: 1px solid var(--border-card); border-radius: 6px; overflow: hidden; font-size: 11px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; border-bottom: 1px solid var(--border-card); background: rgba(255,255,255,0.02);">
            <div style="padding: 8px 12px; border-right: 1px solid var(--border-card); color: var(--text-secondary); font-weight: 600;">공정 카테고리</div>
            <div style="padding: 8px 12px; color: var(--text-primary); font-weight: 600;">${processName}</div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; border-bottom: 1px solid var(--border-card);">
            <div style="padding: 8px 12px; border-right: 1px solid var(--border-card); color: var(--text-secondary); font-weight: 600;">등록일 / 완료일</div>
            <div style="padding: 8px 12px; color: var(--text-primary); font-weight: 600;">${item.REG_DT || 'N/A'} / ${item.COMP_DT || '진행중'}</div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; border-bottom: 1px solid var(--border-card); background: rgba(255,255,255,0.02);">
            <div style="padding: 8px 12px; border-right: 1px solid var(--border-card); color: var(--text-secondary); font-weight: 600;">진행 상태</div>
            <div style="padding: 8px 12px; color: var(--text-primary); font-weight: 600;">
              <span class="badge" style="font-size: 10px; background: ${item.STATUS === 'Complete' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)'}; color: ${item.STATUS === 'Complete' ? '#10b981' : '#f59e0b'}; border: 1px solid ${item.STATUS === 'Complete' ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'};">
                ${item.STATUS || 'On-going'}
              </span>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr;">
            <div style="padding: 8px 12px; border-right: 1px solid var(--border-card); color: var(--text-secondary); font-weight: 600;">차량 정보 / 자재 코드</div>
            <div style="padding: 8px 12px; color: var(--text-primary); font-weight: 600; font-family: monospace;">${item.PROJECT || 'N/A'} / ${item.M_CODE || 'N/A'}</div>
          </div>
        </div>
      </div>
    `;

    if (typeof lucide !== 'undefined') lucide.createIcons();
  },

  // 📥 과거 지적사항 Excel(CSV) 다운로드 엔진
  exportFindingsToCSV() {
    const list = this.getFilteredFindings();
    if (list.length === 0) {
      this.showToast("내보낼 데이터가 존재하지 않습니다.", "warning");
      return;
    }

    console.log(`📥 Compiling CSV for ${list.length} findings with UTF-8 BOM...`);

    // 1. CSV 헤더 구성
    const headers = ["구분(PROCESS)", "고객사(OEM)", "프로젝트(PROJECT)", "자재코드(M-CODE)", "지적사항(POINT OUT)", "원인 분석(ROOT CAUSE)", "조치 대책(COUNTER MEASURE)", "등록일(REG_DT)", "완료일(COMP_DT)", "진행 상태(STATUS)"];
    
    // 2. 값 이스케이프 함수
    const escapeCsvValue = (val) => {
      if (val === null || val === undefined) return "";
      let str = String(val).replace(/"/g, '""');
      if (str.includes(",") || str.includes("\n") || str.includes('"')) {
        str = `"${str}"`;
      }
      return str;
    };

    // 3. 행 구성
    const rows = list.map(item => {
      const processName = item.PROCESS || item.process || this.getFindingProcess(item) || 'General';
      const pointOut = this.getTranslatedField(item, 'POINT_OUT');
      const rootCause = this.getTranslatedField(item, 'ROOT_CAUSE');
      const counterMeasure = this.getTranslatedField(item, 'COUNTER_MEASURE');
      
      return [
        processName,
        item.CAR_MAKER || "",
        item.PROJECT || "",
        item.M_CODE || "",
        pointOut,
        rootCause,
        counterMeasure,
        item.REG_DT || "",
        item.COMP_DT || "",
        item.STATUS || ""
      ];
    });

    // 4. CSV 버퍼 구성
    const csvContent = [headers.map(escapeCsvValue).join(",")]
      .concat(rows.map(row => row.map(escapeCsvValue).join(",")))
      .join("\n");

    // 5. UTF-8 BOM 마커 (\ufeff) 삽입
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8;' });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    
    const dateStr = new Date().toISOString().slice(0,10);
    const lang = this.state.currentLang || 'KO';
    link.setAttribute("download", `RiskHunter_Past_Findings_${lang}_${dateStr}.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    this.showToast(`지적사항 이력 ${list.length}건이 성공적으로 다운로드되었습니다.`, 'success');
  },

  // 🔍 단어 경계 감지형 검색 매칭 헬퍼 (Word-Boundary aware search matcher)
  matchesSearchQuery(text, query) {
    if (!text || !query) return false;
    const target = text.toLowerCase();
    const q = query.toLowerCase();
    
    const idx = target.indexOf(q);
    if (idx === -1) return false;
    
    // 앞쪽에 영문자/숫자가 없는지 확인 (즉, 단어의 시작점인지 검증하여 중간 문자열 기하 매칭 방지)
    const isStartOfWord = idx === 0 || !/[a-z0-9]/i.test(target.charAt(idx - 1));
    return isStartOfWord;
  },

  // 📂 완성차 OEM 규격 문서 그리드 렌더러
  renderDocumentLibrary() {
    const oemSelect = document.getElementById('lib-oem-select');
    const docSelect = document.getElementById('lib-doc-select');
    if (!oemSelect || !docSelect) return;

    const list = this.state.documentLibrary || [];
    if (list.length === 0) return;

    // 1. 완성차 고유 OEM 목록 추출 및 정렬 (가나다/알파벳 순)
    const uniqueOems = [...new Set(list.map(d => d.customer))].sort();

    // 2. OEM 드롭다운 초기 채움 (한 번만 실행되도록 보호)
    if (oemSelect.options.length === 0) {
      oemSelect.innerHTML = '';
      uniqueOems.forEach(oem => {
        const opt = document.createElement('option');
        opt.value = oem;
        opt.textContent = oem;
        oemSelect.appendChild(opt);
      });
      
      // 초기 기본값 선택
      if (uniqueOems.length > 0) {
        this.state.selectedLibraryOem = uniqueOems[0];
        oemSelect.value = uniqueOems[0];
      }
    }

    // 3. 상태 안전성 확보 (selectedLibraryOem 디폴트 설정)
    if (!this.state.selectedLibraryOem && uniqueOems.length > 0) {
      this.state.selectedLibraryOem = uniqueOems[0];
    }
    const selectedOem = this.state.selectedLibraryOem;
    oemSelect.value = selectedOem;

    // 4. 선택된 OEM 소속 표준서 목록 필터링
    const oemDocs = list.filter(d => d.customer === selectedOem);

    // 5. 상세 규격 표준서 드롭다운 동적 매핑
    docSelect.innerHTML = '';
    oemDocs.forEach(doc => {
      const opt = document.createElement('option');
      opt.value = doc.id;
      opt.textContent = `${doc.doc_code} : ${doc.doc_name}`;
      docSelect.appendChild(opt);
    });

    // 6. 현재 선택된 문서 (selectedDoc) 가 없거나 다른 OEM 문서인 경우 첫 번째 문서 자동 바인딩
    let currentDoc = this.state.selectedDoc;
    if (!currentDoc || currentDoc.customer !== selectedOem) {
      currentDoc = oemDocs[0] || null;
      this.state.selectedDoc = currentDoc;
    }

    if (currentDoc) {
      docSelect.value = currentDoc.id;
      
      // 7. 좌측: 규격 기본 정보 카드 렌더링
      const infoOe = document.getElementById('lib-info-oe');
      const infoCode = document.getElementById('lib-info-code');
      const infoType = document.getElementById('lib-info-type');
      const infoFile = document.getElementById('lib-info-file');
      
      if (infoOe) infoOe.textContent = currentDoc.customer;
      if (infoCode) infoCode.textContent = currentDoc.doc_code;
      if (infoType) infoType.textContent = currentDoc.doc_type || '품질 사양서';
      if (infoFile) infoFile.textContent = currentDoc.filename;
      
      // 8. 우측: AI 상세 검토 정보 카드 렌더링
      this.renderDocSummary(currentDoc);
    }

    // 9. 하단 전체 표준서 통합 레지스트리 테이블 실시간 목록 및 선택 동기화
    const tableBody = document.getElementById('lib-registry-table-body');
    const tableCount = document.getElementById('lib-registry-count');
    
    if (tableBody) {
      tableBody.innerHTML = '';
      oemDocs.forEach(doc => {
        const tr = document.createElement('tr');
        const isSelected = currentDoc && currentDoc.id === doc.id;
        
        tr.style.cursor = 'pointer';
        tr.style.borderBottom = '1px solid var(--border-card)';
        tr.style.transition = 'background 0.2s';
        if (isSelected) {
          tr.style.background = 'rgba(59, 130, 246, 0.15)';
        } else {
          tr.style.background = 'transparent';
        }
        
        tr.className = isSelected ? 'active-row' : 'table-row-hover';
        
        tr.innerHTML = `
          <td style="padding: 10px 14px; font-weight: 600; color: ${isSelected ? 'var(--brand-blue)' : 'var(--text-secondary)'};">${doc.id}</td>
          <td style="padding: 10px 14px; font-weight: 700; color: var(--text-primary);">${doc.customer}</td>
          <td style="padding: 10px 14px; font-family: monospace; color: var(--brand-blue); font-weight: 700;">${doc.doc_code}</td>
          <td style="padding: 10px 14px; color: var(--text-primary); font-weight: 600;">${doc.doc_name}</td>
          <td style="padding: 10px 14px;"><span class="badge" style="background: rgba(168, 85, 247, 0.08); border: 1px solid rgba(168, 85, 247, 0.2); color: #7c3aed; font-size: 11px; font-weight: 600; padding: 2px 6px; border-radius: 4px;">${doc.doc_type || 'N/A'}</span></td>
        `;
        
        tr.addEventListener('click', () => {
          this.state.selectedDoc = doc;
          this.renderDocumentLibrary();
        });
        
        tableBody.appendChild(tr);
      });
    }
    
    if (tableCount) {
      tableCount.textContent = `선택된 제조사 ${selectedOem} 소속 총 ${oemDocs.length}개 문서가 목록에 정렬되었습니다. (클릭 시 상세 조회 연동)`;
    }

    // 10. 상단 메트릭 요약 보드 실시간 연산 업데이트
    const statOes = document.getElementById('lib-stat-oes');
    const statDocs = document.getElementById('lib-stat-docs');
    
    if (statOes) {
      statOes.textContent = `${uniqueOems.length}개`;
    }
    if (statDocs) {
      statDocs.textContent = `${list.length}건`;
    }

    const docTypesList = document.getElementById('lib-doc-types-list');
    if (docTypesList) {
      const uniqueTypes = [...new Set(list.map(d => d.doc_type || '기타 품질 사양'))].filter(Boolean);
      docTypesList.innerHTML = '';
      uniqueTypes.slice(0, 4).forEach((type, idx) => {
        const itemDiv = document.createElement('div');
        itemDiv.style.display = 'flex';
        itemDiv.style.alignItems = 'center';
        itemDiv.style.gap = '4px';
        itemDiv.style.marginBottom = '2px';
        itemDiv.innerHTML = `<span style="color: var(--brand-blue); font-weight: 700;">${idx + 1}.</span> ${type}`;
        docTypesList.appendChild(itemDiv);
      });
    }

    const shareChart = document.getElementById('lib-share-chart');
    if (shareChart) {
      const oemDocCounts = {};
      list.forEach(d => {
        oemDocCounts[d.customer] = (oemDocCounts[d.customer] || 0) + 1;
      });
      const sortedOems = Object.entries(oemDocCounts).sort((a, b) => b[1] - a[1]);
      const maxCount = sortedOems[0]?.[1] || 1;
      
      shareChart.innerHTML = '';
      sortedOems.slice(0, 3).forEach(([oem, count]) => {
        const pct = Math.round((count / maxCount) * 100);
        const itemDiv = document.createElement('div');
        itemDiv.style.display = 'flex';
        itemDiv.style.alignItems = 'center';
        itemDiv.style.fontSize = '10px';
        itemDiv.style.gap = '6px';
        itemDiv.innerHTML = `
          <span style="width: 50px; font-family: monospace; font-weight: 700; color: var(--text-primary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${oem}</span>
          <div style="flex: 1; height: 5px; background: var(--border-card); border-radius: 10px; overflow: hidden;">
            <div style="width: ${pct}%; height: 100%; background: #3b82f6; border-radius: 10px;"></div>
          </div>
          <span style="width: 15px; text-align: right; color: var(--text-secondary);">${count}</span>
        `;
        shareChart.appendChild(itemDiv);
      });
    }

    // 11. 이벤트 리스너 동적 바인딩 (최초 1회 실행 보장)
    if (!this.state.libraryOemDocListenersBound) {
      oemSelect.addEventListener('change', (e) => {
        this.state.selectedLibraryOem = e.target.value;
        this.state.selectedDoc = null;
        this.renderDocumentLibrary();
      });
      
      docSelect.addEventListener('change', (e) => {
        const docId = parseInt(e.target.value);
        const doc = this.state.documentLibrary.find(d => d.id === docId);
        if (doc) {
          this.state.selectedDoc = doc;
          this.renderDocumentLibrary();
        }
      });
      
      this.state.libraryOemDocListenersBound = true;
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
  },

  // 📝 특정 OE 요구규격서의 AI Review Summary 우측 요약 보드 표출
  renderDocSummary(doc) {
    const summaryBody = document.getElementById('lib-summary-body');
    const downloadBtn = document.getElementById('btn-lib-download-doc');
    if (!summaryBody || !downloadBtn) return;

    // 가상 다운로드 기동 장치 버튼 노출
    downloadBtn.style.display = 'flex';

    const sum = doc.review_summary || {};
    const trans = doc.tire_process_translation || {};

    // 적용 공정 배지 칩스 구성
    const processes = sum.applicable_processes || [];
    const procChips = processes.map(p => `<span class="badge" style="background: rgba(37, 99, 235, 0.08); border: 1px solid rgba(37, 99, 235, 0.2); font-size: 10px; font-weight: 600; padding: 2px 6px; color: var(--brand-blue);">${p}</span>`).join(' ');

    // 중요 조항 목록 카드 구성
    const clauses = sum.key_clauses || [];
    let clausesHTML = '';
    if (clauses.length > 0) {
      clauses.forEach(c => {
        clausesHTML += `
          <div style="background: var(--bg-app); border: 1px solid var(--border-card); border-radius: 6px; padding: 10px 12px;">
            <div style="font-size: 11px; font-family: monospace; font-weight: 700; color: var(--brand-blue);">${c.clause}</div>
            <div style="font-weight: 700; font-size: 12px; color: var(--text-primary); margin: 3px 0 2px;">${c.title}</div>
            <div style="font-size: 11px; line-height: 1.5; color: var(--text-secondary);">${c.summary}</div>
          </div>
        `;
      });
    } else {
      clausesHTML = '<div style="font-size: 12px; color: var(--text-secondary); font-style: italic;">추출된 세부 절 조항이 없습니다.</div>';
    }

    // 준수 실증 목록
    const evidences = sum.required_evidences || [];
    const evidenceList = evidences.map(e => `<li style="margin-bottom: 4px;">${e}</li>`).join('');

    summaryBody.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 20px; font-size: 13px;">
        <!-- 문서 메타 정보 요약 -->
        <div>
          <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 4px;">규격 문서 원 메타데이터</div>
          <h3 style="font-size: 16px; font-weight: 800; color: var(--text-primary); margin-bottom: 8px;">${doc.doc_name}</h3>
          <div style="display: flex; gap: 10px; flex-wrap: wrap; font-size: 11px; color: var(--text-secondary);">
            <span>고객사: <strong style="color: var(--text-primary);">${doc.customer}</strong></span>
            <span>|</span>
            <span>코드: <strong style="color: var(--text-primary);">${doc.doc_code}</strong></span>
            <span>|</span>
            <span>최종 개정일: <strong style="color: var(--text-primary);">${doc.revision_date}</strong></span>
          </div>
        </div>

        <!-- AI 핵심 요약 개요 -->
        <div>
          <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 6px;">AI 요약 개요 (Review Overview)</div>
          <p style="background: rgba(59,130,246,0.03); border: 1px solid rgba(59, 130, 246, 0.1); padding: 12px; border-radius: 6px; line-height: 1.6; color: var(--text-secondary);">
            ${sum.overview || '가동중인 오디트 규격서의 핵심 목적 및 프로세스별 준수 의무 조약에 대한 AI 개요를 제공합니다.'}
          </p>
        </div>

        <!-- 2분할 윈도우 (조항 및 타이어 공정 해석) -->
        <div style="display: grid; grid-template-columns: 1fr; gap: 16px;">
          <!-- 적용 공정 및 필수 실물 증적 -->
          <div style="background: var(--bg-app); border: 1px solid var(--border-card); border-radius: 8px; padding: 14px;">
            <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 8px;">규격 적용 생산공정 및 실증가이드</div>
            <div style="display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 12px;">${procChips}</div>
            
            <div style="font-size: 12px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px; display: flex; align-items: center; gap: 4px;">
              <i data-lucide="file-text" style="width: 14px; height: 14px; color: #10b981;"></i>
              <span>수검 대응 필수 실물 증적 (Required Evidences)</span>
            </div>
            <ul style="padding-left: 18px; margin: 0; line-height: 1.5; font-size: 12px; color: var(--text-secondary);">
              ${evidenceList || '<li>현장 작업 표준서 개정 이력서</li>'}
            </ul>
          </div>

          <!-- 타이어 제조 공정 전문 번역 해석 패널 -->
          <div style="background: rgba(59, 130, 246, 0.02); border: 1px solid rgba(59, 130, 246, 0.15); border-radius: 8px; padding: 16px; border-left: 4px solid var(--brand-blue);">
            <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--brand-blue); margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
              <i data-lucide="cpu" style="width: 14px; height: 14px;"></i>
              <span>Tire Manufacturing Translation (타이어 공정별 정밀 역해석 지침)</span>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 10px; font-size: 12px;">
              <div>
                <strong style="color: var(--text-primary);">타겟 공정 분야 (Focus Process):</strong>
                <span class="badge" style="font-size: 10px; background: rgba(59, 130, 246, 0.1); color: var(--brand-blue); border-radius: 4px; padding: 1px 6px; margin-left: 6px;">${trans.focus_process || '전체 품질 시스템'}</span>
              </div>
              <div style="border-top: 1px dashed var(--border-card); padding-top: 8px;">
                <strong style="color: var(--text-primary); display: block; margin-bottom: 3px;">핵심 공정 파라미터 제어 가이드:</strong>
                <p style="margin: 0; line-height: 1.5; color: var(--text-secondary);">${trans.process_param_check || '가류 시간 및 가압 압력 밸브 누적 편차 자동 검검 교정.'}</p>
              </div>
              <div style="border-top: 1px dashed var(--border-card); padding-top: 8px;">
                <strong style="color: var(--text-primary); display: block; margin-bottom: 3px;">미준수 시 품질 위협 시나리오 (Quality Defect Risk):</strong>
                <p style="margin: 0; line-height: 1.5; color: var(--text-status-high); font-weight: 500;">${trans.quality_defect_risk || '원재료 가황 미달 시 타이어 기포 및 고속 주행 시 외관 버스트(Burst) 유발 위험성 급증.'}</p>
              </div>
              <div style="border-top: 1px dashed var(--border-card); padding-top: 8px;">
                <strong style="color: var(--text-primary); display: block; margin-bottom: 3px;">작업표준 개정 가이드라인 (SOP Action Guide):</strong>
                <p style="margin: 0; line-height: 1.5; color: var(--text-secondary);">${trans.action_sop_guide || '공장 가황 공정 표준서(SOP-CUR-04) 상의 가열 압력 한계 조건 범위 개정 반영.'}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 세부 절 및 조항 (Key Clauses) -->
        <div>
          <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 8px;">핵심 규제 준수 조항 (Key Clauses)</div>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${clausesHTML}
          </div>
        </div>
      </div>
    `;

    if (typeof lucide !== 'undefined') lucide.createIcons();
  },

  // 📥 클라이언트 사이드 가상 다운로드 구동 엔진 (Blob-based TXT Generator)
  downloadDocSummary() {
    const doc = this.state.selectedDoc;
    if (!doc) return;

    console.log(`📥 Initiating virtual download engine for ${doc.doc_code}...`);

    const sum = doc.review_summary || {};
    const trans = doc.tire_process_translation || {};

    const txtContent = `=========================================================
📝 [RISKHUNTER AI SUMMARY] ${doc.customer} Technical Spec
Document Code: ${doc.doc_code}
Document Name: ${doc.doc_name}
File Size: ${doc.file_size} | Revision Date: ${doc.revision_date}
=========================================================

1. AI REVIEW SUMMARY OVERVIEW:
---------------------------------------------------------
${sum.overview || '가동중인 오디트 규격서의 핵심 목적으로서 가치사슬 전반의 품질 이정표를 가이드합니다.'}

2. KEY REGULATORY CLAUSES:
---------------------------------------------------------
${(sum.key_clauses || []).map(c => `[Clause ${c.clause}] ${c.title}\n- ${c.summary}`).join('\n\n')}

3. TIRE MANUFACTURING PROCESS TRANSLATION (전문 역해석):
---------------------------------------------------------
- Focus Process: ${trans.focus_process || '품질 시스템 전반'}
- Process Parameter Checklist: ${trans.process_param_check || '가황 온도 프레스 압력 및 혼련 배합 가공 검증.'}
- Quality Defect Risks: ${trans.quality_defect_risk || '원천 규격 불일치 시 버(Burr) 조인트 접합부 크랙 발생 및 실주행 버스트 위험 유발.'}
- Action SOP Guideline: ${trans.action_sop_guide || '가류 공정 SOP 표준 작업 가이드라인 내 프레스 포인트 온도 계측 주기 한계점 개정 명문화.'}

4. REQUIRED AUDIT COMPLIANCE EVIDENCES:
---------------------------------------------------------
${(sum.required_evidences || []).map((e, i) => `${i+1}. ${e}`).join('\n')}

---------------------------------------------------------
* Generated At: ${new Date().toISOString()}
* Security Sandbox Status: Select-Only Read-Only Verified
* RiskHunter Dashboard Quality Assurance System.
=========================================================`;

    // 텍스트 blob 생성
    const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${doc.customer}_${doc.doc_code}_AI_Analysis_Summary.txt`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    this.showToast(`${doc.doc_code} 규격 분석 요약본 다운로드가 성공했습니다.`, 'success');
    this.logAction(null, `기술 규격서 원본 AI 분석요약본 다운로드: ${doc.doc_code} (${doc.doc_name})`, 'action');
  },

  // 🔗 서브 탭 3: 규격-리스크 맵핑 보드 입체 렌더러
  renderRequirementMapping() {
    const container = document.getElementById('req-mapping-body');
    if (!container) return;

    const checklists = this.state.auditChecklists;
    if (!checklists || checklists.length === 0) {
      container.innerHTML = `<div style="text-align: center; padding: 40px; color: var(--text-secondary);">마스터 데이터 적재 후 맵핑이 가시화됩니다.</div>`;
      return;
    }

    // 고객사(OEM)별로 그룹바이하고, 하부에 공정별 감사 질문 수 및 리스크 요인 맵핑 수치 계량
    const map = {};
    checklists.forEach(item => {
      const cust = item.customer || 'Other';
      const proc = item.process_category || 'Other';
      
      if (!map[cust]) {
        map[cust] = {};
      }
      if (!map[cust][proc]) {
        map[cust][proc] = { count: 0, high: 0, sumRisk: 0 };
      }
      map[cust][proc].count++;
      if (item.priority && item.priority.toUpperCase() === 'HIGH') {
        map[cust][proc].high++;
      }
      map[cust][proc].sumRisk += parseFloat(item.plant_risk_score || 0);
    });

    let mappingHTML = `
      <div style="display: flex; flex-direction: column; gap: 20px;">
        <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.6;">
          완성차 고객사(OEM) 요구 규격과 공장의 생산공정, 그리고 축적된 리스크의 가중치를 입체적으로 융합 분석한 연계 매트릭스 맵입니다. 
          특정 접점을 클릭하면, 해당 규격이 어떤 공정의 통제 한계를 지탱하고 있는지 한눈에 알 수 있습니다.
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px;">
    `;

    Object.keys(map).sort().forEach(cust => {
      // 고객사별 카드 구성
      let customerCard = `
        <div class="card-solid" style="padding: 16px; border: 1px solid var(--border-card); border-radius: 8px; background: rgba(255,255,255,0.01);">
          <div style="display: flex; align-items: center; gap: 10px; border-bottom: 1px solid var(--border-card); padding-bottom: 10px; margin-bottom: 12px;">
            <div style="width: 32px; height: 32px; background: rgba(59,130,246,0.1); border-radius: 6px; display: flex; align-items: center; justify-content: center; color: var(--brand-blue);">
              <i data-lucide="git-branch" style="width: 16px; height: 16px;"></i>
            </div>
            <div>
              <strong style="font-size: 15px; color: var(--text-primary); font-family: 'Outfit', sans-serif;">${cust} Requirements</strong>
              <div style="font-size: 11px; color: var(--text-secondary);">총 ${Object.values(map[cust]).reduce((a, b) => a + b.count, 0)}개 핵심 조항 바인딩</div>
            </div>
          </div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
      `;

      Object.keys(map[cust]).sort().forEach(proc => {
        const item = map[cust][proc];
        customerCard += `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; background: rgba(255,255,255,0.02); border: 1px solid var(--border-card); border-radius: 6px; font-size: 12px;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-weight: 700; color: var(--text-light);">${proc}</span>
              <span style="font-size: 10px; color: var(--text-secondary);">(${item.count}개 조항)</span>
            </div>
            <div style="display: flex; gap: 6px; align-items: center;">
              <span style="font-size: 10px; padding: 1px 5px; background: rgba(239, 68, 68, 0.1); color: #ef4444; border-radius: 4px; font-weight: 700;">${item.high} High</span>
              <span style="font-size: 10px; font-family: monospace; padding: 1px 5px; background: rgba(59, 130, 246, 0.1); color: var(--brand-blue); border-radius: 4px; font-weight: 700;">위험 ${item.sumRisk.toFixed(1)}점</span>
            </div>
          </div>
        `;
      });

      customerCard += `
          </div>
        </div>
      `;
      mappingHTML += customerCard;
    });

    mappingHTML += `
        </div>
      </div>
    `;

    container.innerHTML = mappingHTML;
    if (typeof lucide !== 'undefined') lucide.createIcons();
  },

  // ==========================================================================
  // 📈 [Phase 2] 대시보드 리스크 연산 및 차트/경고판 인터랙션 엔진
  // ==========================================================================
  
  /**
   * 🧠 1. 데이터 사전 가공 및 정규식 기반 공정-4M 매핑 엔진
   * 품질실패(QI), 변경점(4M), 감사지적(Findings) 텍스트를 형태소 분석하여 공정 및 4M 요소를 일관되게 바인딩합니다.
   */
  preProcessData() {
    console.log("🧠 Pre-processing raw issues for process & 4M mapping...");
    
    // 15대 표준 공정 및 4M 매핑 정규식 사전 (Special 공정 내 Form, Sealant 포용 준수)
    const processKeywords = {
      'Incoming': [/incoming/i, /수입/, /입고/, /자재검사/],
      'Mixing': [/mixing/i, /배합/, /밀링/, /컴파운드/, /밀리/, /투입 오일/],
      'Extrusion': [/extrusion/i, /압출/, /트레드/, /사이드월/, /프로파일/],
      'Calendaring': [/calendar/i, /캘린더/, /토핑/, /스틸코드/, /텍스타일/],
      'Cutting': [/cutting/i, /재단/, /절단/, /슬리팅/],
      'Bead': [/bead/i, /비드/, /와이어/, /에이프런/],
      'Building': [/building/i, /성형/, /그린타이어/, /조립/, /드럼/],
      'Curing': [/curing/i, /가류/, /금형/, /벤트핀/, /가류기/, /블래더/, /세정 주기/],
      'Re-work': [/re-work/i, /rework/i, /재작업/, /수정작업/],
      'Inspection': [/inspection/i, /검사/, /외관/, /uniformity/i, /runout/i, /불합격/],
      'Special': [/special/i, /form/i, /sealant/i, /폼/, /실란트/, /흡음재/, /스폰지/]
    };

    const m4Keywords = {
      'Man': [/man/i, /작업자/, /인적/, /교육/, /자격/, /교대/, /수동/],
      'Machine': [/machine/i, /설비/, /금형/, /센서/, /장비/, /롤러/, /계측기/, /장치/],
      'Material': [/material/i, /재료/, /자재/, /고무/, /오일/, /컴파운드/, /원재료/, /타이어/],
      'Method': [/method/i, /sop/i, /방법/, /지침/, /기준/, /프로세스/, /주기/, /절차/]
    };

    // ① 품질 이슈 (QI) 매핑
    if (this.state.qualityIssues) {
      this.state.qualityIssues.forEach(item => {
        const text = [
          item.D2_PROBLEM || '',
          item.D4_ROOT_CAUSE || '',
          item.CAT_NAME || '',
          item.SUB_CAT_NAME || '',
          item.TYPE_NAME || ''
        ].join(' ').toLowerCase();

        let matchedProc = 'System'; // 기본 보조 영역
        for (const [proc, regexes] of Object.entries(processKeywords)) {
          if (regexes.some(rx => rx.test(text))) {
            matchedProc = proc;
            break;
          }
        }
        item._mappedProcess = matchedProc;

        let matched4M = 'Method';
        for (const [m4, regexes] of Object.entries(m4Keywords)) {
          if (regexes.some(rx => rx.test(text))) {
            matched4M = m4;
            break;
          }
        }
        item._mapped4M = matched4M;
      });
    }

    // ② 4M 변경 이력 매핑
    if (this.state.changeHistory4m) {
      this.state.changeHistory4m.forEach(item => {
        const text = [
          item.SUBJECT || '',
          item.CHANGE_ITEM || '',
          item.CHANGE_CONTENT || '',
          item.PURPOSE || ''
        ].join(' ').toLowerCase();

        let matchedProc = 'System';
        for (const [proc, regexes] of Object.entries(processKeywords)) {
          if (regexes.some(rx => rx.test(text))) {
            matchedProc = proc;
            break;
          }
        }
        item._mappedProcess = matchedProc;

        let matched4M = 'Method';
        if (item.CHANGE_ITEM) {
          const ci = item.CHANGE_ITEM.toLowerCase();
          if (ci.includes('machine') || ci.includes('설비') || ci.includes('tool') || ci.includes('롤러')) matched4M = 'Machine';
          else if (ci.includes('material') || ci.includes('재료') || ci.includes('rubber') || ci.includes('원단')) matched4M = 'Material';
          else if (ci.includes('man') || ci.includes('작업') || ci.includes('인원')) matched4M = 'Man';
          else if (ci.includes('method') || ci.includes('공정') || ci.includes('지침') || ci.includes('standard')) matched4M = 'Method';
        } else {
          for (const [m4, regexes] of Object.entries(m4Keywords)) {
            if (regexes.some(rx => rx.test(text))) {
              matched4M = m4;
              break;
            }
          }
        }
        item._mapped4M = matched4M;
      });
    }

    // ③ 과거 감사 지적사항 매핑
    if (this.state.auditFindings) {
      this.state.auditFindings.forEach((item, index) => {
        if (!item.DOC_NO) {
          item.DOC_NO = `FINDING-${index + 1}`;
        }
        const text = [
          item.POINT_OUT || '',
          item.ROOT_CAUSE_ANALYSIS || '',
          item.COUNTER_MEASURE || '',
          item.SUBJECT || ''
        ].join(' ').toLowerCase();

        let matchedProc = 'System';
        if (item.PROCESS) {
          matchedProc = item.PROCESS;
        } else {
          for (const [proc, regexes] of Object.entries(processKeywords)) {
            if (regexes.some(rx => rx.test(text))) {
              matchedProc = proc;
              break;
            }
          }
        }
        item._mappedProcess = matchedProc;

        let matched4M = 'Method';
        for (const [m4, regexes] of Object.entries(m4Keywords)) {
          if (regexes.some(rx => rx.test(text))) {
            matched4M = m4;
            break;
          }
        }
        item._mapped4M = matched4M;
      });
    }

    console.log("✅ Raw issues pre-processing completed!");
  },

  /**
   * 🔍 2. 글로벌 공통 필터 적용된 이벤트 추출기
   */
  getFilteredEvents(type) {
    let list = [];
    if (type === 'qi') {
      list = this.state.qualityIssues || [];
    } else if (type === '4m') {
      list = this.state.changeHistory4m || [];
    } else if (type === 'findings') {
      list = this.state.auditFindings || [];
    } else {
      return [];
    }

    return list.filter(item => {
      // ① 공장 필터
      if (this.state.selectedPlant !== 'ALL') {
        const p = (item.PLANT || item.plant_code || '').trim().toUpperCase();
        if (p !== this.state.selectedPlant) return false;
      }

      // ② 고객사 필터
      if (this.state.selectedCustomer !== 'ALL') {
        const cust = this.state.selectedCustomer.trim().toLowerCase();
        if (type === 'qi') {
          const itemCust = (item.OEM || '').trim().toLowerCase();
          if (itemCust !== cust) return false;
        } else if (type === 'findings') {
          const itemCust = (item.CAR_MAKER || '').trim().toLowerCase();
          if (itemCust !== cust) return false;
        } else if (type === '4m') {
          const subject = (item.SUBJECT || '').trim().toLowerCase();
          if (!subject.includes(cust)) return false;
        }
      }

      // ③ 공정 필터
      if (this.state.selectedProcess !== 'ALL') {
        if (item._mappedProcess !== this.state.selectedProcess) return false;
      }

      return true;
    });
  },

  /**
   * 📐 3. 특정 공장 및 공정의 가중 리스크 스코어 계산 엔진
   * $R_{P,C} = \min \left( 5.0, \;\; 0.3 \times N_{QI}(P, C) + 0.1 \times N_{4M}(P, C) + 0.2 \times N_{Audit}(P, C) \right)$ (미결 unresolved 기준 적용)
   */
  calculatePlantRiskScore(plantCode, customer, process) {
    // QI 미결: STATUS === 'On-going'
    const qiUnresolved = (this.state.qualityIssues || []).filter(item => {
      if (plantCode !== 'ALL' && item.PLANT !== plantCode) return false;
      if (customer !== 'ALL' && (item.OEM || '').toLowerCase() !== customer.toLowerCase()) return false;
      if (process !== 'ALL' && item._mappedProcess !== process) return false;
      return item.STATUS === 'On-going';
    }).length;

    // 4M 미결: PROGRESS === 'On-going'
    const m4Unresolved = (this.state.changeHistory4m || []).filter(item => {
      if (plantCode !== 'ALL' && item.PLANT !== plantCode) return false;
      if (customer !== 'ALL' && !(item.SUBJECT || '').toLowerCase().includes(customer.toLowerCase())) return false;
      if (process !== 'ALL' && item._mappedProcess !== process) return false;
      return item.PROGRESS === 'On-going';
    }).length;

    // Findings 미결: STATUS === 'On-going' 또는 'Open'
    const findingsUnresolved = (this.state.auditFindings || []).filter(item => {
      if (plantCode !== 'ALL' && item.PLANT !== plantCode) return false;
      if (customer !== 'ALL' && (item.CAR_MAKER || '').toLowerCase() !== customer.toLowerCase()) return false;
      if (process !== 'ALL' && item._mappedProcess !== process) return false;
      return item.STATUS === 'On-going' || item.STATUS === 'Open';
    }).length;

    const rawScore = 0.3 * qiUnresolved + 0.1 * m4Unresolved + 0.2 * findingsUnresolved;
    const clampedScore = Math.min(5.0, Math.round(rawScore * 100) / 100);

    return {
      score: clampedScore,
      qiCount: qiUnresolved,
      m4Count: m4Unresolved,
      findingsCount: findingsUnresolved
    };
  },

  /**
   * 📊 4. 대시보드 메인 렌더러
   * 4대 요약 KPI, 진행도 게이지바, Chart.js 2개 차트, Live Risk Alert Board 갱신을 총지휘합니다.
   */
  renderDashboard() {
    console.log("📊 Rendering Premium HQ Risk Dashboard...");
    
    // ------------------------------------------------------------------------
    // [1] 전체 마스터 데이터 기반 KPI 연산 및 수려한 게이지 바 동적 렌더링 (HQ 종합 관점)
    // ------------------------------------------------------------------------
    const qiFiltered = this.state.qualityIssues || [];
    const qiUnresolved = qiFiltered.filter(item => item.STATUS === 'On-going').length;
    const qiResolved = qiFiltered.filter(item => item.STATUS === 'Complete' || item.STATUS === 'Closed').length;
    const qiTotal = qiUnresolved + qiResolved;
    const qiRate = qiTotal > 0 ? (qiResolved / qiTotal) * 100 : 100;

    const m4Filtered = this.state.changeHistory4m || [];
    const m4Unresolved = m4Filtered.filter(item => item.PROGRESS === 'On-going').length;
    const m4Resolved = m4Filtered.filter(item => item.PROGRESS === 'Complete').length;
    const m4Total = m4Unresolved + m4Resolved;
    const m4Rate = m4Total > 0 ? (m4Resolved / m4Total) * 100 : 100;

    const findingsFiltered = this.state.auditFindings || [];
    const findingsUnresolved = findingsFiltered.filter(item => item.STATUS === 'On-going' || item.STATUS === 'Open').length;
    const findingsResolved = findingsFiltered.filter(item => item.STATUS === 'Complete' || item.STATUS === 'Closed').length;
    const findingsTotal = findingsUnresolved + findingsResolved;
    const findingsRate = findingsTotal > 0 ? (findingsResolved / findingsTotal) * 100 : 100;

    const totalUnresolved = qiUnresolved + m4Unresolved + findingsUnresolved;
    const totalResolved = qiResolved + m4Resolved + findingsResolved;
    const totalCount = qiTotal + m4Total + findingsTotal;
    const totalRate = totalCount > 0 ? (totalResolved / totalCount) * 100 : 100;

    // ① KPI 1: 총 누적 리스크 건수 (미결 총합)
    const kpiTotalVal = document.getElementById('kpi-total-risks-val');
    const kpiTotalSub = document.getElementById('kpi-total-risks-sub');
    if (kpiTotalVal && kpiTotalSub) {
      kpiTotalVal.innerHTML = `
        <div style="display: flex; align-items: baseline; gap: 4px;">
          <span style="font-size: 32px; font-weight: 800; color: var(--text-primary); font-family: monospace;">${totalUnresolved}</span>
          <span style="font-size: 13px; color: var(--text-secondary); font-weight: 500;">건 미결</span>
        </div>
        <div style="margin-top: 10px; width: 100%;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; font-size: 11px;">
            <span style="color: var(--text-muted-light); font-weight: 500;">종합 종결 관리 진행률</span>
            <span style="color: var(--brand-blue); font-weight: 700;">${totalRate.toFixed(1)}%</span>
          </div>
          <div style="width: 100%; height: 5px; background: rgba(15, 23, 42, 0.08); border-radius: 3px; overflow: hidden; border: 1px solid var(--border-card);">
            <div style="width: ${totalRate}%; height: 100%; background: linear-gradient(90deg, #3b82f6, #00c8ff); border-radius: 3px;"></div>
          </div>
        </div>
      `;
      kpiTotalSub.innerHTML = `
        <span style="color: var(--text-muted-light); font-size: 12px;">전체 누적 건수: <strong style="color: var(--text-primary);">${totalCount}건</strong> (해결 완료 ${totalResolved}건)</span>
      `;
    }

    // ② KPI 2: 미해결 품질 이슈 (QI)
    const kpiQiVal = document.getElementById('kpi-qi-unresolved-val');
    const kpiQiSub = document.getElementById('kpi-qi-unresolved-sub');
    if (kpiQiVal && kpiQiSub) {
      kpiQiVal.innerHTML = `
        <div style="display: flex; align-items: baseline; gap: 4px;">
          <span style="font-size: 32px; font-weight: 800; color: var(--text-primary); font-family: monospace;">${qiUnresolved}</span>
          <span style="font-size: 13px; color: var(--text-secondary); font-weight: 500;">건 미결</span>
        </div>
        <div style="margin-top: 10px; width: 100%;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; font-size: 11px;">
            <span style="color: var(--text-muted-light); font-weight: 500;">품질 이슈 해결 처리율</span>
            <span style="color: var(--text-status-high); font-weight: 700;">${qiRate.toFixed(1)}%</span>
          </div>
          <div style="width: 100%; height: 5px; background: rgba(15, 23, 42, 0.08); border-radius: 3px; overflow: hidden; border: 1px solid var(--border-card);">
            <div style="width: ${qiRate}%; height: 100%; background: linear-gradient(90deg, #ef4444, #ff7b72); border-radius: 3px;"></div>
          </div>
        </div>
      `;
      kpiQiSub.innerHTML = `
        <span style="color: var(--text-muted-light); font-size: 12px;">품질 이슈 총량: <strong style="color: var(--text-primary);">${qiTotal}건</strong> (종결완료 ${qiResolved}건)</span>
      `;
    }

    // ③ KPI 3: 미점검 4M 변경점
    const kpi4mVal = document.getElementById('kpi-4m-unresolved-val');
    const kpi4mSub = document.getElementById('kpi-4m-unresolved-sub');
    if (kpi4mVal && kpi4mSub) {
      kpi4mVal.innerHTML = `
        <div style="display: flex; align-items: baseline; gap: 4px;">
          <span style="font-size: 32px; font-weight: 800; color: var(--text-primary); font-family: monospace;">${m4Unresolved}</span>
          <span style="font-size: 13px; color: var(--text-secondary); font-weight: 500;">건 On-going</span>
        </div>
        <div style="margin-top: 10px; width: 100%;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; font-size: 11px;">
            <span style="color: var(--text-muted-light); font-weight: 500;">공정 변경 안정화 점검률</span>
            <span style="color: var(--text-status-medium); font-weight: 700;">${m4Rate.toFixed(1)}%</span>
          </div>
          <div style="width: 100%; height: 5px; background: rgba(15, 23, 42, 0.08); border-radius: 3px; overflow: hidden; border: 1px solid var(--border-card);">
            <div style="width: ${m4Rate}%; height: 100%; background: linear-gradient(90deg, #f59e0b, #fbbf24); border-radius: 3px;"></div>
          </div>
        </div>
      `;
      kpi4mSub.innerHTML = `
        <span style="color: var(--text-muted-light); font-size: 12px;">공정 변경 신청: <strong style="color: var(--text-primary);">${m4Total}건</strong> (점검완료 ${m4Resolved}건)</span>
      `;
    }

    // ④ KPI 4: 과거 감사 미해결 지적
    const kpiAuditVal = document.getElementById('kpi-audit-unresolved-val');
    const kpiAuditSub = document.getElementById('kpi-audit-unresolved-sub');
    if (kpiAuditVal && kpiAuditSub) {
      kpiAuditVal.innerHTML = `
        <div style="display: flex; align-items: baseline; gap: 4px;">
          <span style="font-size: 32px; font-weight: 800; color: var(--text-primary); font-family: monospace;">${findingsUnresolved}</span>
          <span style="font-size: 13px; color: var(--text-secondary); font-weight: 500;">건 미결</span>
        </div>
        <div style="margin-top: 10px; width: 100%;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; font-size: 11px;">
            <span style="color: var(--text-muted-light); font-weight: 500;">지적 대책 수립 조치율</span>
            <span style="color: #7c3aed; font-weight: 700;">${findingsRate.toFixed(1)}%</span>
          </div>
          <div style="width: 100%; height: 5px; background: rgba(15, 23, 42, 0.08); border-radius: 3px; overflow: hidden; border: 1px solid var(--border-card);">
            <div style="width: ${findingsRate}%; height: 100%; background: linear-gradient(90deg, #a855f7, #c084fc); border-radius: 3px;"></div>
          </div>
        </div>
      `;
      kpiAuditSub.innerHTML = `
        <span style="color: var(--text-muted-light); font-size: 12px;">지적 조항 수량: <strong style="color: var(--text-primary);">${findingsTotal}건</strong> (조치종결 ${findingsResolved}건)</span>
      `;
    }

    // ------------------------------------------------------------------------
    // [1-2] 향후 예정된 Audit 일정 및 준비현황 요약 동적 렌더링 (메뉴 2 연동)
    // ------------------------------------------------------------------------
    const upcomingAuditsGrid = document.getElementById('dashboard-upcoming-audits-grid');
    if (upcomingAuditsGrid) {
      // 1. 미래 예정 감사 (STATUS가 'Open'이거나 과거 캐시 등의 이유로 누락되어 완료가 아닌 것) 필터링 후 날짜 순 정렬
      const openAudits = (this.state.audits || [])
        .filter(audit => {
          const status = audit.STATUS || "Open";
          return status === 'Open' || status === 'On-going';
        })
        .sort((a, b) => {
          const dateA = a.date || a.START_DT || '';
          const dateB = b.date || b.START_DT || '';
          return dateA.localeCompare(dateB);
        });

      // 최대 3개만 추출
      const targetAudits = openAudits.slice(0, 3);

      if (targetAudits.length === 0) {
        upcomingAuditsGrid.innerHTML = `
          <div style="grid-column: 1 / -1; padding: 30px; text-align: center; color: var(--text-muted-light); background: rgba(15, 23, 42, 0.03); border: 1px dashed var(--border-card); border-radius: 6px;">
            <i data-lucide="info" style="width: 20px; height: 20px; margin-bottom: 8px; vertical-align: middle; color: var(--text-muted-light);"></i>
            <span style="font-size: 13px; font-weight: 500;">현재 예정된 Audit 일정이 없습니다.</span>
          </div>
        `;
      } else {
        const currentDate = new Date('2026-05-29'); // 기준일 상수
        
        upcomingAuditsGrid.innerHTML = targetAudits.map(audit => {
          // D-Day 계산
          const targetDate = new Date(audit.date || audit.START_DT);
          const diffTime = targetDate - currentDate;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          let dDayText = '';
          let dDayClass = '';
          if (diffDays > 0) {
            dDayText = `D-${diffDays}`;
            dDayClass = diffDays <= 7 ? 'badge-danger blink' : 'badge-info';
          } else if (diffDays === 0) {
            dDayText = 'D-DAY';
            dDayClass = 'badge-danger blink';
          } else {
            dDayText = `D+${Math.abs(diffDays)}`;
            dDayClass = 'badge-success';
          }

          // 태스크 완료율 계산
          const taskStates = this.state.planningChecklistStates[audit.id] || {};
          const totalTasks = (this.state.planningTasks || []).length;
          
          let completedCount = 0;
          (this.state.planningTasks || []).forEach(task => {
            if (taskStates[task.id] === 'completed') {
              completedCount++;
            }
          });
          const completionRate = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;

          // 공장 이름 찾기
          const plantObj = (this.state.commonCodes.plants || []).find(p => p.code === audit.PLANT);
          const plantName = plantObj ? plantObj.name : audit.PLANT;

          return `
            <div class="card-solid" style="padding: 16px; background: rgba(30, 41, 59, 0.03); border: 1px solid var(--border-card); border-radius: 8px; display: flex; flex-direction: column; justify-content: space-between; gap: 12px; transition: all 0.2s ease-in-out;" onmouseover="this.style.transform='translateY(-2px)'; this.style.borderColor='rgba(37, 99, 235, 0.35)'; this.style.boxShadow='0 8px 20px rgba(37, 99, 235, 0.08)';" onmouseout="this.style.transform='none'; this.style.borderColor='var(--border-card)'; this.style.boxShadow='none';">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span class="badge" style="background: rgba(37, 99, 235, 0.08); color: var(--brand-blue); border: 1px solid rgba(37, 99, 235, 0.15); font-weight: 700; font-size: 11px;">
                    ${plantName} (${audit.PLANT})
                  </span>
                  <span class="badge" style="background: rgba(15, 23, 42, 0.04); color: var(--text-primary); border: 1px solid var(--border-card); font-weight: 700; font-size: 11px;">
                    ${audit.OEM || audit.CAR_MAKER || 'OEM'}
                  </span>
                </div>
                <span class="badge ${dDayClass}" style="font-weight: 800; font-family: monospace; font-size: 11px;">
                  ${dDayText}
                </span>
              </div>
              
              <div style="display: flex; flex-direction: column; gap: 4px;">
                <h4 style="font-size: 13.5px; font-weight: 700; color: var(--text-primary); margin: 0; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis;" title="${audit.subject || audit.SUBJECT || ''}">
                  ${audit.subject || audit.SUBJECT || ''}
                </h4>
                <div style="font-size: 11.5px; color: var(--text-muted-light); display: flex; align-items: center; gap: 4px;">
                  <i data-lucide="calendar-days" style="width: 12px; height: 12px;"></i>
                  <span>예정 기간: ${audit.date || audit.START_DT}</span>
                </div>
              </div>

              <div style="display: flex; flex-direction: column; gap: 5px; margin-top: 5px;">
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px;">
                  <span style="color: var(--text-muted-light); font-weight: 500;">D-30 준비 완료도</span>
                  <span style="color: var(--brand-blue); font-weight: 800; font-family: monospace;">${completionRate.toFixed(0)}%</span>
                </div>
                <div style="width: 100%; height: 5px; background: rgba(15, 23, 42, 0.06); border-radius: 3px; overflow: hidden; border: 1px solid var(--border-card);">
                  <div style="width: ${completionRate}%; height: 100%; background: linear-gradient(90deg, #2563eb, #00c8ff); border-radius: 3px; transition: width 0.3s ease;"></div>
                </div>
                <span style="font-size: 10.5px; color: var(--text-muted-light); margin-top: 2px;">
                  완료 <strong style="color: var(--text-primary);">${completedCount}건</strong> / 대기 <strong style="color: var(--text-primary);">${totalTasks - completedCount}건</strong>
                </span>
              </div>
            </div>
          `;
        }).join('');
      }
      
      // lucide 아이콘 동적 갱신
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }

    // ------------------------------------------------------------------------
    // [2] Chart 1: 공장별 실시간 위험 점수 (Plant Risk Score - Bar / Doughnut)
    // ------------------------------------------------------------------------
    const ctxPlant = document.getElementById('chart-plant-risk');
    const plantTitleNode = document.getElementById('chart-plant-risk-title');
    
    if (ctxPlant && typeof Chart !== 'undefined') {
      // 기존 차트 존재 시 파괴 (메모리 릭 및 잔상 제거)
      if (this.state.charts.plantRisk) {
        this.state.charts.plantRisk.destroy();
        this.state.charts.plantRisk = null;
      }

      const activePlantCode = this.state.charts.plantSelected;

      if (activePlantCode) {
        // [Doughnut 모드] 특정 공장 선택 시 리스크 요인 3대 성분 세분화 시각화
        const plantObj = (this.state.commonCodes.plants || []).find(p => p.code === activePlantCode);
        const plantName = plantObj ? plantObj.name : activePlantCode;
        
        if (plantTitleNode) {
          plantTitleNode.innerHTML = `
            <span style="color: #ef4444;"><i data-lucide="shield-alert"></i> ${plantName} 요인별 기여도</span>
            <button id="btn-restore-plant-chart" style="margin-left: 10px; font-size: 11px; padding: 2px 8px; background: var(--bg-app); border: 1px solid var(--border-card); color: var(--text-secondary); border-radius: 4px; cursor: pointer; font-weight: 700;">
              목록 복귀 ↩
            </button>
          `;
          
          // 복귀 버튼 이벤트 수동 추가
          setTimeout(() => {
            const btnRestore = document.getElementById('btn-restore-plant-chart');
            if (btnRestore) {
              btnRestore.addEventListener('click', (e) => {
                e.stopPropagation();
                this.state.charts.plantSelected = null;
                this.renderDashboard();
              });
            }
            if (typeof lucide !== 'undefined') lucide.createIcons();
          }, 50);
        }

        const scoreDetails = this.calculatePlantRiskScore(activePlantCode, 'ALL', 'ALL');
        
        const qiWeight = Math.round(0.3 * scoreDetails.qiCount * 10) / 10;
        const m4Weight = Math.round(0.1 * scoreDetails.m4Count * 10) / 10;
        const findingsWeight = Math.round(0.2 * scoreDetails.findingsCount * 10) / 10;

        this.state.charts.plantRisk = new Chart(ctxPlant, {
          type: 'doughnut',
          data: {
            labels: [
              `품질실패 QI 기여분 (${scoreDetails.qiCount}건 • ${qiWeight}점)`,
              `공정변경 4M 기여분 (${scoreDetails.m4Count}건 • ${m4Weight}점)`,
              `감사지적 Findings 기여분 (${scoreDetails.findingsCount}건 • ${findingsWeight}점)`
            ],
            datasets: [{
              data: [qiWeight, m4Weight, findingsWeight],
              backgroundColor: [
                'rgba(239, 68, 68, 0.75)',  // Red
                'rgba(245, 158, 11, 0.75)',  // Amber
                'rgba(168, 85, 247, 0.75)'   // Purple
              ],
              borderColor: [
                '#ef4444',
                '#f59e0b',
                '#a855f7'
              ],
              borderWidth: 1.5,
              hoverOffset: 6
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  color: '#475569',
                  font: { family: 'Pretendard', size: 11, weight: '500' },
                  boxWidth: 10
                }
              },
              tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                titleColor: '#fff',
                bodyColor: 'rgba(255,255,255,0.85)',
                borderColor: 'rgba(255,255,255,0.1)',
                borderWidth: 1,
                callbacks: {
                  label: function(context) {
                    return ` ${context.label}`;
                  }
                }
              }
            },
            onClick: () => {
              // 차트 클릭 시에도 복귀 지원
              this.state.charts.plantSelected = null;
              this.renderDashboard();
            }
          }
        });

      } else {
        // [Bar 모드] 전체 8개 공장별 리스크 계량화 비교
        if (plantTitleNode) {
          plantTitleNode.textContent = "공장별 실시간 위험 점수 (Plant Risk Score)";
        }

        const plants = ['DP', 'KP', 'JP', 'HP', 'CP', 'MP', 'IP', 'TP'];
        const plantNames = ['대전(DP)', '금산(KP)', '가흥(JP)', '강소(HP)', '중경(CP)', '헝가리(MP)', '인니(IP)', '테네시(TP)'];
        const scores = plants.map(p => this.calculatePlantRiskScore(p, 'ALL', 'ALL').score);

        // 점수가 3.5를 넘어가면 Warning/Danger 색상 부여
        const barColors = scores.map(s => s >= 3.5 ? 'rgba(239, 68, 68, 0.75)' : 'rgba(59, 130, 246, 0.75)');
        const borderColors = scores.map(s => s >= 3.5 ? '#ef4444' : '#3b82f6');

        this.state.charts.plantRisk = new Chart(ctxPlant, {
          type: 'bar',
          data: {
            labels: plantNames,
            datasets: [{
              label: '공장별 리스크 지수',
              data: scores,
              backgroundColor: barColors,
              borderColor: borderColors,
              borderWidth: 1.5,
              borderRadius: 4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                grid: { display: false },
                ticks: { color: '#475569', font: { size: 11, family: 'Pretendard', weight: '500' } }
              },
              y: {
                min: 0,
                max: 5.0,
                grid: { color: '#e2e8f0' },
                ticks: { color: '#475569', font: { size: 10, family: 'monospace' }, stepSize: 1 }
              }
            },
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                callbacks: {
                  label: function(context) {
                    return ` 위험 점수: ${context.parsed.y} / 5.0 (클릭 시 원인분석)`;
                  }
                }
              }
            },
            onClick: (event, activeElements) => {
              if (activeElements && activeElements.length > 0) {
                const idx = activeElements[0].index;
                const targetCode = plants[idx];
                this.state.charts.plantSelected = targetCode;
                this.renderDashboard();
                this.showToast(`${plantNames[idx]} 리스크 성분 정밀 요인 분석으로 스위칭합니다.`);
              }
            }
          }
        });
      }
    }

    // ------------------------------------------------------------------------
    // [3] Chart 2: 취약 공정별 리스크 누적 분포 (Vulnerable Process - Horiz Bar)
    // ------------------------------------------------------------------------
    const ctxProcess = document.getElementById('chart-process-risk');
    if (ctxProcess && typeof Chart !== 'undefined') {
      if (this.state.charts.processRisk) {
        this.state.charts.processRisk.destroy();
        this.state.charts.processRisk = null;
      }

      // 공정 및 카테고리 정보 마스터 구성
      const mfgProcs = this.state.commonCodes.processes || [];
      const systemCats = this.state.commonCodes.categories || [];
      const allProcessEntities = [...mfgProcs, ...systemCats];

      // 전 공정별 위험점수를 연산 후 내림차순 정렬
      const computedProcessScores = allProcessEntities.map(proc => {
        const res = this.calculatePlantRiskScore('ALL', 'ALL', proc.code);
        return {
          code: proc.code,
          name: proc.name,
          score: res.score,
          details: res
        };
      });

      // 점수 내림차순 정렬
      computedProcessScores.sort((a, b) => b.score - a.score);

      // 상위 6개만 슬라이싱
      const topVulnerable = computedProcessScores.slice(0, 6);

      const labels = topVulnerable.map(x => `${x.name} (${x.code})`);
      const dataValues = topVulnerable.map(x => x.score);

      // 수평 바 차트 컬러 그라데이션 기법 (위험도가 높을수록 더 짙게 처리)
      const backgroundColors = dataValues.map(s => {
        if (s >= 3.5) return 'rgba(239, 68, 68, 0.7)'; // Red
        if (s >= 2.0) return 'rgba(245, 158, 11, 0.7)'; // Amber
        return 'rgba(59, 130, 246, 0.7)'; // Blue
      });
      const borderColors = dataValues.map(s => {
        if (s >= 3.5) return '#ef4444';
        if (s >= 2.0) return '#f59e0b';
        return '#3b82f6';
      });

      this.state.charts.processRisk = new Chart(ctxProcess, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            data: dataValues,
            backgroundColor: backgroundColors,
            borderColor: borderColors,
            borderWidth: 1.5,
            borderRadius: 4
          }]
        },
        options: {
          indexAxis: 'y', // 가로 막대 차트 선언
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              min: 0,
              max: 5.0,
              grid: { color: '#e2e8f0' },
              ticks: { color: '#475569', font: { size: 10, family: 'monospace' } }
            },
            y: {
              grid: { display: false },
              ticks: { color: '#0f172a', font: { size: 11, family: 'Pretendard', weight: '600' } }
            }
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              callbacks: {
                label: function(context) {
                  return ` 공정 위험도 점수: ${context.parsed.x} / 5.0`;
                }
              }
            }
          }
        }
      });
    }

    // ------------------------------------------------------------------------
    // [4] Live Risk Alert Board (임계치 3.5 초과 공정 실시간 자동 진단 경고 알림판)
    // ------------------------------------------------------------------------
    const alertBoard = document.getElementById('live-risk-alerts');
    if (alertBoard) {
      alertBoard.innerHTML = '';

      const plants = ['DP', 'KP', 'JP', 'HP', 'CP', 'MP', 'IP', 'TP'];
      const plantNamesMapping = {
        'DP': '대전공장', 'KP': '금산공장', 'JP': '가흥공장',
        'HP': '강소공장', 'CP': '중경공장', 'MP': '헝가리공장',
        'IP': '인도네시아공장', 'TP': '테네시공장'
      };

      const mfgProcs = this.state.commonCodes.processes || [];
      const systemCats = this.state.commonCodes.categories || [];
      const allProcessEntities = [...mfgProcs, ...systemCats];

      const highRisks = [];

      // 전 공장 및 전 공정에 대해 3.5 이상 위험 조합 스캔 추출
      plants.forEach(pCode => {
        allProcessEntities.forEach(proc => {
          const res = this.calculatePlantRiskScore(pCode, 'ALL', proc.code);
          if (res.score >= 3.5) {
            highRisks.push({
              plantCode: pCode,
              plantName: plantNamesMapping[pCode] || pCode,
              procCode: proc.code,
              procName: proc.name,
              score: res.score,
              details: res
            });
          }
        });
      });

      // 위험 지수 내림차순 정렬
      highRisks.sort((a, b) => b.score - a.score);

      if (highRisks.length > 0) {
        // 고위험 공정 경고 알림 리스트 렌더링
        highRisks.forEach(risk => {
          const item = document.createElement('div');
          // 계기판 감성의 미려한 글래스모피즘 형태 카드 렌더
          item.className = 'alert-item';
          item.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 16px;
            background: rgba(239, 68, 68, 0.04);
            border-left: 4px solid #ef4444;
            border-right: 1px solid rgba(239, 68, 68, 0.15);
            border-top: 1px solid rgba(239, 68, 68, 0.15);
            border-bottom: 1px solid rgba(239, 68, 68, 0.15);
            border-radius: 6px;
            transition: all 0.2s ease-in-out;
          `;
          
          // 호버 시 살짝 밝아지는 마이크로 인터랙션
          item.addEventListener('mouseover', () => {
            item.style.background = 'rgba(239, 68, 68, 0.08)';
            item.style.transform = 'translateX(2px)';
          });
          item.addEventListener('mouseout', () => {
            item.style.background = 'rgba(239, 68, 68, 0.04)';
            item.style.transform = 'translateX(0)';
          });

          // 전문 수석 오디터의 정밀 가이드 어드바이저리 출력
          let advisoryText = '';
          if (risk.procCode === 'Curing') {
            advisoryText = `가류 세정 프로세스 및 벤트핀(Air Vent Pin) 막힘 모니터링 체크리스트 최우선 집중 현장 투어 검증을 강력히 권장합니다.`;
          } else if (risk.procCode === 'Building') {
            advisoryText = `드럼 및 권취 롤러 기구 교대점 및 작업자 성형 에어 배출(Air Trapped) 표준 미준수 여부 밀착 오디팅이 긴요합니다.`;
          } else if (risk.procCode === 'Mixing') {
            advisoryText = `원재료 COA 검정, 탱크 레벨 센서 및 배합 오일 정밀 교정 이력을 집중 검토하여 재발을 미연에 봉쇄하십시오.`;
          } else {
            advisoryText = `과거 지적 시정안 준수 여부 및 작업자 SOP 교육 가동 상태의 현장 긴급 오디팅을 실시하십시오.`;
          }

          item.innerHTML = `
            <div style="display: flex; align-items: center; gap: 14px; flex: 1; padding-right: 15px;">
              <div style="display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; background: rgba(239,68,68,0.15); border-radius: 50%; color: #ef4444; flex-shrink: 0;">
                <i data-lucide="alert-triangle" style="width: 18px; height: 18px;"></i>
              </div>
              <div>
                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                  <span style="font-weight: 700; color: #fff; font-size: 13.5px;">${risk.plantName} (${risk.plantCode})</span>
                  <span style="font-size: 10px; font-weight: 700; padding: 2px 6px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); color: var(--text-light); border-radius: 4px;">
                    ${risk.procName} 공정
                  </span>
                </div>
                <p style="font-size: 12px; color: var(--text-secondary); margin-top: 5px; line-height: 1.45;">
                  <strong>[Advisory]</strong> ${advisoryText} <span style="color: var(--text-muted);">(${risk.details.qiCount}QI / ${risk.details.m4Count}4M / ${risk.details.findingsCount}Audit Findings)</span>
                </p>
              </div>
            </div>
            <div style="text-align: right; flex-shrink: 0; display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
              <div style="font-size: 10px; font-weight: 700; color: #ef4444; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25); padding: 1px 6px; border-radius: 4px; display: inline-flex; align-items: center; gap: 3px;">
                <span class="blink" style="width: 4px; height: 4px; background: #ef4444; border-radius: 50%;"></span>
                HIGH RISK
              </div>
              <div style="font-size: 18px; font-weight: 900; color: #ef4444; font-family: monospace;">
                ${risk.score.toFixed(1)} <span style="font-size: 10px; color: var(--text-muted); font-weight: 500;">/ 5.0</span>
              </div>
            </div>
          `;
          alertBoard.appendChild(item);
        });

      } else {
        // [Normal Status] 임계치를 초과하는 리스크가 전혀 없는 완벽한 안심 상태일 때
        const cleanPanel = document.createElement('div');
        cleanPanel.style.cssText = `
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 30px 20px;
          background: rgba(16, 185, 129, 0.02);
          border: 1px dashed rgba(16, 185, 129, 0.25);
          border-radius: 8px;
          text-align: center;
          gap: 12px;
          margin-top: 10px;
        `;
        cleanPanel.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: center; width: 48px; height: 44px; background: rgba(16,185,129,0.08); border-radius: 50%; color: #10b981; margin-bottom: 2px;">
            <i data-lucide="shield-check" style="width: 24px; height: 24px;"></i>
          </div>
          <h3 style="font-size: 14.5px; font-weight: 700; color: var(--text-light);">공정 위험도 감지 안심 상태 (Safe Stable Status)</h3>
          <p style="font-size: 12px; color: var(--text-secondary); max-width: 500px; line-height: 1.5;">
            현재 지정된 전사 글로벌 필터 기준 하에 실시간 임계값(<span style="color: #ef4444; font-weight: 600;">3.5점</span>)을 초과하여 누적된 품질실패(QI) / 4M 변경지연 / 감사 지적사항(Findings) 위해 요인이 전혀 식별되지 않은 완벽한 <strong>정상(Stable) 운영 환경</strong>입니다.
          </p>
        `;
        alertBoard.appendChild(cleanPanel);
      }
      
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }
  },

  // ==========================================================================
  // 💬 6. [전 화면 공통] Audit Assistant (플로팅 AI 챗봇 비서 구현)
  // ==========================================================================
  handleChat() {
    const inputNode = document.getElementById('assistant-chat-input');
    const sendBtn = document.getElementById('assistant-chat-send-btn');
    const msgContainer = document.getElementById('assistant-chat-messages');
    
    if (!inputNode || !sendBtn || !msgContainer) return;

    const message = inputNode.value.trim();
    if (!message) return;

    // 1. 사용자 대화 버블 추가
    const userMsgHTML = `
      <div class="message message-user">
        <div class="message-content">${message}</div>
      </div>
    `;
    msgContainer.insertAdjacentHTML('beforeend', userMsgHTML);
    this.logAction(null, `플로팅 AI 챗봇 비서 질의: "${message.substring(0, 30)}${message.length > 30 ? '...' : ''}"`, 'action');
    inputNode.value = '';
    
    // 자동 스크롤 하단 안착
    msgContainer.scrollTop = msgContainer.scrollHeight;

    // 2. 우아한 3도트 타이핑 로딩 애니메이션 (Typing Indicator) 연출
    const typingId = `typing-${Date.now()}`;
    const typingHTML = `
      <div class="message message-bot" id="${typingId}">
        <div class="message-content" style="display: flex; align-items: center; gap: 6px; padding: 10px 14px;">
          <span style="font-size: 12px; color: #cbd5e1; font-style: italic;">추론 중</span>
          <span class="typing-dot" style="width: 4px; height: 4px; background: #38bdf8; border-radius: 50%; animation: pulse 1s infinite 0s;"></span>
          <span class="typing-dot" style="width: 4px; height: 4px; background: #38bdf8; border-radius: 50%; animation: pulse 1s infinite 0.2s;"></span>
          <span class="typing-dot" style="width: 4px; height: 4px; background: #38bdf8; border-radius: 50%; animation: pulse 1s infinite 0.4s;"></span>
        </div>
      </div>
    `;
    msgContainer.insertAdjacentHTML('beforeend', typingHTML);
    msgContainer.scrollTop = msgContainer.scrollHeight;

    // 3. 전문 수석 오디터 지식 기반 딕셔너리 키워드 분석 매핑 (750ms 딜레이 시뮬레이션)
    setTimeout(() => {
      // 타이핑 로더 소멸
      const typingIndicator = document.getElementById(typingId);
      if (typingIndicator) typingIndicator.remove();

      let botAnswer = '';
      const lower = message.toLowerCase();

      // 수석 오디터 지식 기반 맞춤 응답 분기
      if (lower.includes('온도') || lower.includes('가열') || lower.includes('가류') || lower.includes('가황')) {
        botAnswer = `<strong>가황(Curing) 공정 온도 관리</strong>에 대한 수석 오디터 대응 가이드라인입니다.
        <br><br>
        완성차 규격(Audi LAH 893 010 등) 및 IATF 16949 기준 상, 가류 몰드 온도는 가열 질소/스팀 프레스 상한 <strong>170°C±2°C</strong>를 반드시 실시간 모니터링 기록 보존해야 합니다.
        <br><br>
        SOP 표준 개정 및 대응 증빙 권장 사항:
        <ul>
          <li><strong>작업표준서 SOP 개정</strong>: 몰드 탈착 및 교체 시 '3개 포인트 열화상 계측 센서 정밀 보정 주기 명문화'</li>
          <li><strong>필수 수검 증적</strong>: 전산 자동 기록 압력 그래프 일지, 검교정 공인 시험 성적서</li>
        </ul>`;
      } else if (lower.includes('압력') || lower.includes('배합') || lower.includes('혼련') || lower.includes('mixing')) {
        botAnswer = `<strong>혼련(Mixing) 및 고무 배합 공정 압력/SOP 관리</strong>에 대한 AI 감사 조언입니다.
        <br><br>
        원재료 정밀 고무 혼합(Mixing) 시 가해지는 램(Ram) 가압 실시간 오차는 <strong>±0.5 bar</strong> 미만이어야 배합 점도(Mooney Viscosity) 불량을 방지할 수 있습니다.
        <br><br>
        <strong>SOP 개정안 권고:</strong> 배합 기준서 내 '초물 합격 가류 가공 검증 기록 보존 의무 규칙'을 제정 삽입하여, 수검 감사 시 SQA 오디터에게 제출해야 페널티 등급 하락을 예방합니다.`;
      } else if (lower.includes('audi') || lower.includes('아우디') || lower.includes('lah')) {
        botAnswer = `<strong>Audi LAH 893 010 규격 요건</strong> 분석 답변입니다.
        <br><br>
        해당 규격의 핵심 조약은 <strong>Formel Q Neuteile Integral</strong>로서, 신규 개발 부품 납품 시 EMPB (VDA 2 초도품 승인서) 합격 통지를 받기 위한 이정표가 수록되어 있습니다.
        <br><br>
        현장 감사 수검 시 <em>'가황 스팀 프레스 공정의 신뢰성 가속 가열 테스트 성적서'</em>가 부재할 경우 High 등급 부적합을 지적받게 되므로, 라이브러리의 해당 요약본 및 증적 목록을 검토해 주십시오.`;
      } else if (lower.includes('bmw')) {
        botAnswer = `<strong>BMW 기술 규격 수검 가이드</strong>입니다.
        <br><br>
        BMW GS 95024 규격 및 감사 지침에 따르면 공정 4M 변경(설비 이설, 재료 대체 등) 발생 시 <strong>사전 SQA 변경 통제 승인</strong>을 획득하지 않고 출하하는 행위를 최고 위험(Critical Block) 페널티로 간주합니다.
        <br><br>
        현재 예정된 BMW Audit 계획이 존재한다면, 4M 승인 대장과 고객사 서면 회신 이력을 최우선 점검 하십시오.`;
      } else if (lower.includes('check') || lower.includes('체크리스트') || lower.includes('질문')) {
        botAnswer = `RiskHunter가 제공하는 <strong>Smart Checklist 활용 팁</strong>입니다.
        <br><br>
        현재 라이브러리 내에는 <strong>${this.state.auditChecklists.length}건</strong>의 고객사 연계 체크리스트가 준비되어 있습니다.
        <br>
        상단 공정별 현황판에서 취약 공정을 선택하여 필터링하신 후, <strong>'CSV 내보내기'</strong>를 클릭하시면 엑셀에서 바로 열어 점검할 수 있는 한글 무결성 보존 규격이 즉시 다운로드됩니다.`;
      } else {
        botAnswer = `안녕하십니까! 수석 감사 비서입니다. 입력하신 <strong>"${message}"</strong> 주제와 연동된 완성차 규격 및 공장 리스크 정보를 종합 추론 중입니다.
        <br><br>
        품질 실패 이력(QI), 공정 4M 변경 요건, 혹은 IATF 16949 / VDA 6.3 수검 증적 제출 기준에 대해 물어보시면 더욱 정교하게 답변드릴 수 있습니다. 
        <br><br>
        <em>Tip: '온도', '압력', 'Audi', 'BMW', '체크리스트' 등의 키워드를 넣으시면 도메인 맞춤 가이드가 출력됩니다.</em>`;
      }

      const botMsgHTML = `
        <div class="message message-bot">
          <div class="message-content">${botAnswer}</div>
        </div>
      `;
      msgContainer.insertAdjacentHTML('beforeend', botMsgHTML);
      msgContainer.scrollTop = msgContainer.scrollHeight;

      if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 750);
  },

  // ⚡ 이벤트 바인딩 핸들러 (Event Listeners)
  bindEvents() {
    // 1. 사이드바 네비게이션 메인 탭 클릭 이벤트
    document.querySelectorAll('.sidebar-nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const tabId = btn.getAttribute('data-tab');
        this.switchTab(tabId);
      });
    });

    // 2. Library 탭 내부 서브 탭 네비게이션 클릭 이벤트
    document.querySelectorAll('#tab-library .sub-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const subTabId = btn.getAttribute('data-sub-tab');
        this.switchSubTab(subTabId, '#tab-library .sub-tabs-container', '#tab-library .sub-tab-pane');
      });
    });

    // 3. Admin Settings 탭 내부 서브 탭 네비게이션 클릭 이벤트
    document.querySelectorAll('#tab-admin-settings .sub-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const subTabId = btn.getAttribute('data-sub-tab');
        this.switchSubTab(subTabId, '#tab-admin-settings .sub-tabs-container', '#tab-admin-settings .sub-tab-pane');
      });
    });

    // 4. 프로필 영역 클릭 시 가상 계정 스위처 팝오버 토글
    const profileTrigger = document.getElementById('profile-trigger');
    const profilePopover = document.getElementById('profile-popover');
    if (profileTrigger && profilePopover) {
      profileTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        profilePopover.classList.toggle('hidden');
      });
    }

    // 바깥 영역 터치 시 프로필 팝오버 닫기
    document.addEventListener('click', () => {
      if (profilePopover) {
        profilePopover.classList.add('hidden');
      }
    });

    // 5. 🤖 플로팅 AI 감사 비서 버블 및 드로어 인터랙션
    const assistantTrigger = document.getElementById('assistant-trigger-btn');
    const assistantDrawer = document.getElementById('assistant-chat-drawer');
    const assistantClose = document.getElementById('btn-close-chat');
    
    if (assistantTrigger && assistantDrawer) {
      assistantTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // 화면 컨텍스트 감지형 동적 인사말 적용
        const msgContainer = document.getElementById('assistant-chat-messages');
        if (msgContainer && assistantDrawer.classList.contains('hidden')) {
          let welcomeMsg = '';
          if (this.state.currentTab === 'library') {
            welcomeMsg = `안녕하세요! 현재 <strong>통합 라이브러리(Library)</strong>를 탐색 중이시군요. 특정 완성차 규격서 조항의 한글 번역 가이드나, 가류(Curing) 공정의 고위험 핵심 체크리스트 요약이 필요하시면 언제든 물어보세요.`;
          } else {
            welcomeMsg = `안녕하세요! RiskHunter 수석 품질 감사 AI 비서입니다. 공장 감사 준비 일정 기획, OEM 규격 충족 조치, 혹은 VDA 6.3/8D 기반 대응 전략에 대해 무엇이든 질문하십시오.`;
          }

          // 첫 번째 웰컴 메시지 본문 업데이트
          const welcomeBubble = msgContainer.querySelector('.message-bot .message-content');
          if (welcomeBubble) {
            welcomeBubble.innerHTML = welcomeMsg;
          }
        }

        assistantDrawer.classList.toggle('hidden');
      });
    }
    
    if (assistantClose && assistantDrawer) {
      assistantClose.addEventListener('click', (e) => {
        e.stopPropagation();
        assistantDrawer.classList.add('hidden');
      });
    }

    // 6. 챗봇 전송 클릭 및 엔터 키 바인딩
    const btnSend = document.getElementById('assistant-chat-send-btn');
    const chatInput = document.getElementById('assistant-chat-input');
    if (btnSend) {
      btnSend.addEventListener('click', () => this.handleChat());
    }
    if (chatInput) {
      chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this.handleChat();
        }
      });
    }

    // 7. 대시보드 및 라이브러리 로컬 필터 조작 이벤트 바인딩
    // [A] 대시보드 로컬 필터 제거 (HQ 종합 관점 고정)

    // [B] 라이브러리 로컬 필터
    const libFilterPlant = document.getElementById('library-filter-plant');
    const libFilterCustomer = document.getElementById('library-filter-customer');
    const btnResetLibFilters = document.getElementById('btn-reset-library-filters');

    if (libFilterPlant) {
      libFilterPlant.addEventListener('change', (e) => {
        this.state.librarySelectedPlant = e.target.value;
        this.state.checklistCurrentPage = 1;
        this.state.findingsCurrentPage = 1;
        console.log(`[Library Filter] Plant Changed: ${this.state.librarySelectedPlant}`);
        this.showToast(`[라이브러리] 대상 공장이 ${e.target.options[e.target.selectedIndex].text}(으)로 필터링되었습니다.`);
        
        this.renderProcessSummary();
        this.renderChecklistTable();
        this.renderFindingsTable();
        this.renderDocumentLibrary();
        this.renderRequirementMapping();
      });
    }

    if (libFilterCustomer) {
      libFilterCustomer.addEventListener('change', (e) => {
        this.state.librarySelectedCustomer = e.target.value;
        this.state.checklistCurrentPage = 1;
        this.state.findingsCurrentPage = 1;
        console.log(`[Library Filter] Customer Changed: ${this.state.librarySelectedCustomer}`);
        this.showToast(`[라이브러리] 고객사가 ${e.target.value === 'ALL' ? '전체 고객사' : e.target.value}(으)로 필터링되었습니다.`);
        
        this.renderProcessSummary();
        this.renderChecklistTable();
        this.renderFindingsTable();
        this.renderDocumentLibrary();
        this.renderRequirementMapping();
      });
    }

    if (btnResetLibFilters) {
      btnResetLibFilters.addEventListener('click', () => {
        this.state.librarySelectedPlant = 'ALL';
        this.state.librarySelectedCustomer = 'ALL';
        this.state.checklistCurrentPage = 1;
        this.state.findingsCurrentPage = 1;
        
        if (libFilterPlant) libFilterPlant.value = 'ALL';
        if (libFilterCustomer) libFilterCustomer.value = 'ALL';
        
        console.log(`[Library Filter] Filters Reset to ALL`);
        this.showToast('[라이브러리] 필터가 전체(ALL)로 초기화되었습니다.', 'success');
        
        this.renderProcessSummary();
        this.renderChecklistTable();
        this.renderFindingsTable();
        this.renderDocumentLibrary();
        this.renderRequirementMapping();
      });
    }

    // 8. 🔐 권한 제한 안내 모달 닫기 이벤트 바인딩
    const btnClosePermissionModal = document.getElementById('btn-close-permission-modal');
    const permissionModal = document.getElementById('permission-modal');
    if (btnClosePermissionModal && permissionModal) {
      btnClosePermissionModal.addEventListener('click', () => {
        permissionModal.classList.add('hidden');
      });
    }

    // 9. 🌐 글로벌 다국어 선택기 이벤트 바인딩
    const globalLangSelect = document.getElementById('global-lang-select');
    if (globalLangSelect) {
      globalLangSelect.addEventListener('change', (e) => {
        this.state.currentLang = e.target.value;
        console.log(`[Global Language] Language Switched: ${this.state.currentLang}`);
        this.showToast(`시스템 언어가 [${e.target.options[e.target.selectedIndex].text}](으)로 스위칭되었습니다.`, 'success');
        
        // 영속 저장
        localStorage.setItem('riskhunter_language', this.state.currentLang);
        
        // 다국어 렌더링 트리거
        this.onLanguageChange();
      });
    }
  },

  // ⚡ 글로벌 공통 필터 변경 이벤트 핸들러 (Phase 1)
  onGlobalFilterChange() {
    console.log(`[Global Filter Changed] Plant: ${this.state.selectedPlant}, Customer: ${this.state.selectedCustomer}, Process: ${this.state.selectedProcess}`);
    
    // 대시보드 탭 실시간 갱신 (Phase 2)
    if (this.state.currentTab === 'dashboard') {
      this.renderDashboard();
    }

    // 만약 Library 탭이 활성화되어 있다면, 서브 컴포넌트들을 재렌더링하여 실시간 동기화
    if (this.state.currentTab === 'library') {
      this.state.checklistCurrentPage = 1; // 필터 변경 시 첫 페이지로 리셋
      this.state.findingsCurrentPage = 1;
      this.renderProcessSummary();
      this.renderChecklistTable();
      this.renderFindingsTable();
      this.renderDocumentLibrary();
      this.renderRequirementMapping();
    }

    // 만약 Plant Risk & Action 탭이 활성화되어 있다면, 해당 공장을 싱크하고 실시간 화면 갱신
    if (this.state.currentTab === 'plant-risk-action') {
      if (this.state.selectedPlant && this.state.selectedPlant !== 'ALL') {
        this.state.plantRiskActivePlant = this.state.selectedPlant;
      }
      this.renderPlantRiskScreen();
    }
  },

  // 🌐 글로벌 다국어 언어 변경 이벤트 핸들러
  onLanguageChange() {
    console.log(`[Language Changed Update] Target Language: ${this.state.currentLang}`);
    
    // 1. Plant Risk & Action 탭이 활성화되어 있다면 지적사항 테이블 재렌더링
    if (this.state.currentTab === 'plant-risk-action') {
      this.renderPlantRiskScreen();
    }
    
    // 2. Dashboard 탭이 활성화되어 있다면 실시간 리스크 보드 등 갱신을 위해 재렌더링
    if (this.state.currentTab === 'dashboard') {
      this.renderDashboard();
    }

    // 3. Library 탭이 활성화되어 있다면 테이블들 재렌더링 (다국어 갱신)
    if (this.state.currentTab === 'library') {
      this.renderChecklistTable();
      this.renderFindingsTable();
    }
  },

  // 🍞 우아한 B2B 토스트 알림 송출 (Toast Message System)
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconHTML = '<i data-lucide="info" style="width: 16px; height: 16px;"></i>';
    if (type === 'success') iconHTML = '<i data-lucide="check-circle" style="width: 16px; height: 16px;"></i>';
    if (type === 'warning') iconHTML = '<i data-lucide="alert-triangle" style="width: 16px; height: 16px;"></i>';
    
    toast.innerHTML = `
      <div class="toast-content">
        ${iconHTML}
        <span>${message}</span>
      </div>
    `;

    container.appendChild(toast);
    
    if (typeof lucide !== 'undefined') {
      lucide.createIcons({ attrs: { class: 'toast-icon' } });
    }

    // 3초 후 페이드 아웃 소멸
    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3000);
  },

  // ==========================================================================
  // ⚙️ 7. Admin Settings & Demo Polishing (어드민 설정 및 데모 피니싱 - Phase 7)
  // ==========================================================================

  // 📜 Chronological Audit Logger (감사 및 활동 로그 시스템)
  logAction(user, action, type = 'action') {
    if (!user) {
      user = this.state.currentUser ? this.state.currentUser.name : 'System';
    }
    
    const now = new Date();
    const formattedDate = now.getFullYear() + '-' + 
      String(now.getMonth() + 1).padStart(2, '0') + '-' + 
      String(now.getDate()).padStart(2, '0') + ' ' + 
      String(now.getHours()).padStart(2, '0') + ':' + 
      String(now.getMinutes()).padStart(2, '0') + ':' + 
      String(now.getSeconds()).padStart(2, '0');

    const newLog = {
      timestamp: formattedDate,
      user: user,
      action: action,
      type: type
    };

    let logs = [];
    try {
      const stored = localStorage.getItem('audit_logs');
      logs = stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Failed to parse audit logs", e);
    }

    logs.unshift(newLog); // 최신 로그가 맨 앞으로 가도록 unshift
    
    if (logs.length > 1000) {
      logs = logs.slice(0, 1000);
    }

    localStorage.setItem('audit_logs', JSON.stringify(logs));
    
    // 현재 Audit Log 서브 탭이 열려 있다면 즉시 실시간 갱신
    if (this.state.currentTab === 'admin-settings' && document.getElementById('sub-tab-content-audit-log') && document.getElementById('sub-tab-content-audit-log').classList.contains('active-sub-pane')) {
      this.renderAuditLogTimeline();
    }
  },

  // ⚙️ Admin Settings 모듈 초기화
  initAdminSettings() {
    console.log("⚙️ Admin Settings initializing...");
    
    // 로컬 스토리지에 유저 목록이 없는 경우 복사/초기화 진행
    if (!localStorage.getItem('audit_users')) {
      const userList = this.state.users.map(u => ({
        id: u.id,
        username: u.username,
        password: u.password,
        name: u.name,
        role: u.role,
        role_name: u.roleName,
        badge: u.badge,
        avatar_color: u.color,
        department: u.dept,
        status: 'Active',
        lastActive: '방금 전'
      }));
      localStorage.setItem('audit_users', JSON.stringify(userList));
    }

    // 기본 로그가 없을 때 기본 로그 시드 주입
    if (!localStorage.getItem('audit_logs')) {
      const seedLogs = [
        { timestamp: '2026-05-29 09:00:00', user: 'System', action: 'RiskHunter 차세대 통합 Audit 엔진 기동 완료', type: 'system' },
        { timestamp: '2026-05-29 09:00:05', user: 'System', action: '8대 공장 실시간 품질 실패(QI) 및 4M 데이터 연계 완료', type: 'system' },
        { timestamp: '2026-05-29 09:01:12', user: '박정호 수석', action: 'Lead Auditor 최고 관리자 세션 로그인 성공', type: 'auth' }
      ];
      localStorage.setItem('audit_logs', JSON.stringify(seedLogs));
    }

    // 1. 첫 렌더링 시 현재 서브 탭에 맞춰 화면 채우기
    const activeSubTabBtn = document.querySelector('#tab-admin-settings .sub-tab-btn.active');
    const activeSubTab = activeSubTabBtn ? activeSubTabBtn.getAttribute('data-sub-tab') : 'user-management';
    
    if (activeSubTab === 'user-management') {
      this.renderUserManagement();
    } else if (activeSubTab === 'role-permission') {
      this.renderRolePermissionMatrix();
    } else if (activeSubTab === 'audit-log') {
      this.renderAuditLogTimeline();
    } else if (activeSubTab === 'sql-explorer') {
      this.initSQLExplorer();
    }

    // 2. 신규 유저 모달 이벤트 바인딩
    const btnOpenUserModal = document.getElementById('btn-open-user-modal');
    const btnCloseUserModal = document.getElementById('btn-close-user-modal');
    const btnCancelUserModal = document.getElementById('btn-cancel-user-modal');
    const btnSaveUserModal = document.getElementById('btn-save-user-modal');
    const userModal = document.getElementById('user-registration-modal');

    if (btnOpenUserModal && userModal) {
      btnOpenUserModal.onclick = () => {
        userModal.classList.remove('hidden');
      };
    }

    const closeUserModal = () => {
      if (userModal) {
        userModal.classList.add('hidden');
        // 폼 초기화
        document.getElementById('modal-user-name').value = '';
        document.getElementById('modal-user-dept').value = '';
        document.getElementById('modal-user-username').value = '';
        document.getElementById('modal-user-password').value = '';
      }
    };

    if (btnCloseUserModal) btnCloseUserModal.onclick = closeUserModal;
    if (btnCancelUserModal) btnCancelUserModal.onclick = closeUserModal;

    if (btnSaveUserModal) {
      btnSaveUserModal.onclick = () => {
        const name = document.getElementById('modal-user-name').value.trim();
        const dept = document.getElementById('modal-user-dept').value.trim();
        const role = document.getElementById('modal-user-role').value;
        const status = document.getElementById('modal-user-status').value;
        const username = document.getElementById('modal-user-username').value.trim();
        const password = document.getElementById('modal-user-password').value.trim();

        if (!name || !dept || !username || !password) {
          this.showToast('모든 필수 정보를 입력해 주십시오.', 'warning');
          return;
        }

        let usersList = JSON.parse(localStorage.getItem('audit_users')) || [];
        
        if (usersList.some(u => u.username === username)) {
          this.showToast('이미 존재하는 사용자 ID입니다.', 'warning');
          return;
        }

        const avatarColors = ['#ff3b30', '#00c8ff', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
        const randomColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];

        const roleNames = {
          'admin': 'Lead Auditor',
          'manager': 'Quality Manager',
          'viewer': 'Quality Viewer'
        };

        const badges = {
          'admin': 'ADMIN',
          'manager': 'MANAGER',
          'viewer': 'VIEWER'
        };

        const newUser = {
          id: Date.now(),
          username,
          password,
          name,
          role,
          role_name: roleNames[role],
          badge: badges[role],
          avatar_color: randomColor,
          department: dept,
          status,
          lastActive: '방금 가입함'
        };

        usersList.push(newUser);
        localStorage.setItem('audit_users', JSON.stringify(usersList));

        this.state.users = usersList.map(u => ({
          id: u.id,
          username: u.username,
          password: u.password,
          name: u.name,
          role: u.role,
          roleName: u.role_name,
          badge: u.badge,
          color: u.avatar_color,
          dept: u.department
        }));

        this.logAction(this.state.currentUser ? this.state.currentUser.name : 'System', `신규 사용자 추가: ${name} (${dept}, ${role.toUpperCase()})`, 'system');
        this.showToast(`${name} 오디터가 성공적으로 등록되었습니다.`, 'success');
        
        closeUserModal();
        this.renderUserManagement();
        this.renderProfileSwitcher();
      };
    }

    // 3. 로그 검색창 실시간 이벤트 바인딩
    const logSearchInput = document.getElementById('audit-log-search');
    if (logSearchInput) {
      logSearchInput.oninput = () => {
        this.renderAuditLogTimeline();
      };
    }

    // 4. 로그 초기화 버튼 바인딩
    const btnClearLogs = document.getElementById('btn-clear-audit-logs');
    if (btnClearLogs) {
      btnClearLogs.onclick = () => {
        if (confirm("정말 모든 감사 로그를 삭제하시겠습니까? (복구할 수 없습니다)")) {
          const clearedSeed = [
            { timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19), user: 'System', action: '최고 관리자에 의한 Audit Trail 전체 초기화 실행 완료', type: 'security' }
          ];
          localStorage.setItem('audit_logs', JSON.stringify(clearedSeed));
          this.logAction(this.state.currentUser.name, '감사 로그 전체 수동 삭제', 'security');
          this.showToast('모든 감사 로그가 소멸되었습니다.', 'success');
          this.renderAuditLogTimeline();
        }
      };
    }
  },

  // 👥 서브 탭 1: 사용자 계정 관리 렌더링
  renderUserManagement() {
    const userSummaryContainer = document.getElementById('admin-user-summary-container');
    const userRegistryTable = document.getElementById('admin-user-registry-table');
    if (!userRegistryTable) return;

    let usersList = [];
    try {
      usersList = JSON.parse(localStorage.getItem('audit_users')) || [];
    } catch(e) {
      usersList = this.state.users;
    }

    // 1. 요약 정보 카드 그리기
    if (userSummaryContainer) {
      const totalCount = usersList.length;
      const adminCount = usersList.filter(u => u.role === 'admin').length;
      const managerCount = usersList.filter(u => u.role === 'manager').length;
      const viewerCount = usersList.filter(u => u.role === 'viewer').length;

      userSummaryContainer.innerHTML = `
        <div class="user-summary-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="summary-card" style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-card); border-radius: 6px; padding: 12px; display: flex; align-items: center; gap: 12px;">
            <div style="background: var(--brand-blue); width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white;">
              <i data-lucide="users" style="width: 18px; height: 18px;"></i>
            </div>
            <div>
              <div style="font-size: 11px; color: var(--text-muted); font-weight: 500;">총 계정 수</div>
              <div style="font-size: 18px; font-weight: 700; color: var(--text-light);">${totalCount}명</div>
            </div>
          </div>
          <div class="summary-card" style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-card); border-radius: 6px; padding: 12px; display: flex; align-items: center; gap: 12px;">
            <div style="background: #ff3b30; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white;">
              <i data-lucide="shield-check" style="width: 18px; height: 18px;"></i>
            </div>
            <div>
              <div style="font-size: 11px; color: var(--text-muted); font-weight: 500;">Lead Auditor</div>
              <div style="font-size: 18px; font-weight: 700; color: var(--text-light);">${adminCount}명</div>
            </div>
          </div>
          <div class="summary-card" style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-card); border-radius: 6px; padding: 12px; display: flex; align-items: center; gap: 12px;">
            <div style="background: #00c8ff; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white;">
              <i data-lucide="user-check" style="width: 18px; height: 18px;"></i>
            </div>
            <div>
              <div style="font-size: 11px; color: var(--text-muted); font-weight: 500;">Quality Manager</div>
              <div style="font-size: 18px; font-weight: 700; color: var(--text-light);">${managerCount}명</div>
            </div>
          </div>
          <div class="summary-card" style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-card); border-radius: 6px; padding: 12px; display: flex; align-items: center; gap: 12px;">
            <div style="background: #a1a1a1; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white;">
              <i data-lucide="eye" style="width: 18px; height: 18px;"></i>
            </div>
            <div>
              <div style="font-size: 11px; color: var(--text-muted); font-weight: 500;">Quality Viewer</div>
              <div style="font-size: 18px; font-weight: 700; color: var(--text-light);">${viewerCount}명</div>
            </div>
          </div>
        </div>
      `;
    }

    // 2. 사용자 테이블 바인딩
    userRegistryTable.innerHTML = '';
    usersList.forEach(u => {
      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid rgba(255,255,255,0.03)';
      tr.style.transition = 'background 0.2s';
      
      const lastActive = u.lastActive || '최근 30분 내';
      const statusBadge = u.status === 'Active' ? '<span class="badge badge-success">활성</span>' : '<span class="badge badge-danger">잠금</span>';

      const roleBadges = {
        'admin': `<span class="popover-badge" style="background-color: #ef444415; color: #dc2626; border: 1px solid #ef444430; font-size: 11px; padding: 2px 6px;">ADMIN</span>`,
        'manager': `<span class="popover-badge" style="background-color: #0284c715; color: #0369a1; border: 1px solid #0284c730; font-size: 11px; padding: 2px 6px;">MANAGER</span>`,
        'viewer': `<span class="popover-badge" style="background-color: #64748b15; color: #475569; border: 1px solid #64748b30; font-size: 11px; padding: 2px 6px;">VIEWER</span>`
      };

      tr.innerHTML = `
        <td style="padding: 12px 14px; display: flex; align-items: center; gap: 10px;">
          <div class="popover-avatar" style="background-color: ${u.avatar_color || '#3b82f6'}; width: 28px; height: 28px; font-size: 11px; display: flex; align-items: center; justify-content: center; border-radius: 50%;">
            <i data-lucide="user" style="width: 12px; height: 12px; color: white;"></i>
          </div>
          <div>
            <div style="font-weight: 600; color: var(--text-light);">${u.name}</div>
            <div style="font-size: 11px; color: var(--text-muted); font-family: monospace;">@${u.username}</div>
          </div>
        </td>
        <td style="padding: 12px 14px; color: var(--text-primary); vertical-align: middle;">${u.department || u.dept}</td>
        <td style="padding: 12px 14px; vertical-align: middle;">${roleBadges[u.role] || u.role.toUpperCase()}</td>
        <td style="padding: 12px 14px; color: var(--text-muted); vertical-align: middle;">${lastActive}</td>
        <td style="padding: 12px 14px; vertical-align: middle;">${statusBadge}</td>
        <td style="padding: 12px 14px; text-align: right; vertical-align: middle;">
          <button class="btn btn-outline btn-simulate" style="padding: 4px 10px; font-size: 11.5px; border-radius: 4px; border: 1px solid var(--border-card); background: transparent; color: var(--text-light); cursor: pointer; transition: all 0.2s;">
            <i data-lucide="user-check" style="width: 12px; height: 12px; display: inline; margin-right: 4px; vertical-align: middle;"></i>사용자 전환
          </button>
        </td>
      `;

      const btnSimulate = tr.querySelector('.btn-simulate');
      if (btnSimulate) {
        btnSimulate.onclick = () => {
          const targetUser = {
            id: u.id,
            username: u.username,
            password: u.password,
            name: u.name,
            role: u.role,
            roleName: u.role_name || u.role.toUpperCase(),
            badge: u.badge || u.role.toUpperCase(),
            color: u.avatar_color || '#3b82f6',
            dept: u.department || u.dept || '품질그룹'
          };
          this.switchUser(targetUser);
          this.logAction(targetUser.name, `사용자 세션 전환: ${targetUser.name} (${targetUser.role.toUpperCase()})`, 'auth');
        };
      }

      userRegistryTable.appendChild(tr);
    });

    if (typeof lucide !== 'undefined') {
      lucide.createIcons({ attrs: { class: 'table-icon' } });
    }
  },

  // 🔐 서브 탭 2: 역할 및 권한 맵 렌더링 (Matrix)
  renderRolePermissionMatrix() {
    const tableBody = document.getElementById('admin-role-matrix-table');
    if (!tableBody) return;

    const matrixData = [
      {
        category: '시스템 관리',
        detail: '글로벌 환경설정 및 공통 마스터 코드 일괄 제어',
        admin: 'O', manager: 'X', user: 'X', viewer: 'X',
        tooltip: '전사 공통 마스터 설정 변경 권한입니다. 오직 최고 관리자(Lead Auditor)만 수정할 수 있습니다.'
      },
      {
        category: 'SQL Console',
        detail: '모의 SELECT 실행 및 유용 분석 쿼리 템플릿 탐색',
        admin: 'O', manager: 'O', user: 'X', viewer: 'X',
        tooltip: '데이터 정밀 분석을 위해 원천 데이터베이스 테이블을 SELECT 조회하는 기능 권한입니다.'
      },
      {
        category: 'OE Library',
        detail: '완성차 고객사 기술 규격 원본 파일 다운로드 및 AI 분석',
        admin: 'O', manager: 'O', user: 'X', viewer: 'X',
        tooltip: '완성차 고객사 기술 규격 원본 PDF 파일 다운로드 및 AI 지표 요약에 대한 접근 권한입니다.'
      },
      {
        category: 'AI Action Plan',
        detail: '부적합 조항 맞춤형 AI 시정조치 가이드라인 자동 생성',
        admin: 'O', manager: 'O', user: 'X', viewer: 'X',
        tooltip: '감사 수검 지적사항 발생 시 Gemini 인공지능을 통해 작업표준(SOP) 수정안을 도출하는 권한입니다.'
      },
      {
        category: 'Self-Audit Checklist',
        detail: '3중 필터 기반 감사 체크리스트 질문 조회, 편집 및 저장',
        admin: 'O', manager: 'O', user: 'O', viewer: 'X',
        tooltip: '현장 감사 체크리스트 항목을 조건부 조회하고, 직접 내용을 수정하거나 상태를 확정하는 권한입니다.'
      },
      {
        category: 'Risk Assessment',
        detail: '공장별 실시간 품질 실패(QI)/4M 변경점 현황 모니터링',
        admin: 'O', manager: 'O', user: 'O', viewer: 'O',
        tooltip: '전사 공장의 리스크 계량 지표 및 취약 공정 경고판을 실시간 관측할 수 있는 기본 권한입니다.'
      },
      {
        category: '데이터 추출 (BOM CSV)',
        detail: '조회 및 실행 결과의 한글 깨짐 방지 CSV 엑셀 내보내기',
        admin: 'O', manager: 'O', user: 'O', viewer: 'O',
        tooltip: '체크리스트나 SQL 분석 데이터를 엑셀에서 즉각 활용할 수 있도록 UTF-8 BOM CSV 파일로 변환 다운로드하는 권한입니다.'
      }
    ];

    tableBody.innerHTML = '';
    matrixData.forEach(row => {
      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid rgba(255,255,255,0.03)';
      tr.style.transition = 'background 0.2s';
      tr.style.cursor = 'help';
      tr.title = row.tooltip; // 마우스 호버 시 툴팁 제공

      tr.innerHTML = `
        <td style="padding: 14px 18px; font-weight: 600; color: var(--text-primary); vertical-align: middle;">${row.category}</td>
        <td style="padding: 14px 18px; color: var(--text-primary); vertical-align: middle;">${row.detail}</td>
        <td style="padding: 14px 18px; text-align: center; vertical-align: middle;">
          <span style="font-weight: 700; color: ${row.admin === 'O' ? '#059669' : '#dc2626'}; font-size: 15px;">${row.admin}</span>
        </td>
        <td style="padding: 14px 18px; text-align: center; vertical-align: middle;">
          <span style="font-weight: 700; color: ${row.manager === 'O' ? '#059669' : '#dc2626'}; font-size: 15px;">${row.manager}</span>
        </td>
        <td style="padding: 14px 18px; text-align: center; vertical-align: middle;">
          <span style="font-weight: 700; color: ${row.user === 'O' ? '#059669' : '#dc2626'}; font-size: 15px;">${row.user}</span>
        </td>
        <td style="padding: 14px 18px; text-align: center; vertical-align: middle;">
          <span style="font-weight: 700; color: ${row.viewer === 'O' ? '#059669' : '#dc2626'}; font-size: 15px;">${row.viewer}</span>
        </td>
      `;

      tr.addEventListener('mouseenter', () => {
        tr.style.backgroundColor = 'rgba(255,255,255,0.02)';
      });
      tr.addEventListener('mouseleave', () => {
        tr.style.backgroundColor = 'transparent';
      });

      tableBody.appendChild(tr);
    });
  },

  // 📜 서브 탭 3: 크로놀로지 타임라인 로그 렌더링
  renderAuditLogTimeline() {
    const terminal = document.getElementById('audit-log-terminal');
    const searchInput = document.getElementById('audit-log-search');
    if (!terminal) return;

    let logs = [];
    try {
      logs = JSON.parse(localStorage.getItem('audit_logs')) || [];
    } catch(e) {
      logs = [];
    }

    const searchQuery = searchInput ? searchInput.value.trim().toLowerCase() : '';
    
    const filteredLogs = logs.filter(l => {
      if (!searchQuery) return true;
      return l.user.toLowerCase().includes(searchQuery) || 
             l.action.toLowerCase().includes(searchQuery) || 
             l.type.toLowerCase().includes(searchQuery);
    });

    terminal.innerHTML = '';
    
    if (filteredLogs.length === 0) {
      terminal.innerHTML = `<div style="color: #64748b; font-style: italic;">$ No matching logs found.</div>`;
      return;
    }

    filteredLogs.forEach(l => {
      const line = document.createElement('div');
      line.style.marginBottom = '6px';
      line.style.display = 'flex';
      line.style.gap = '10px';
      
      let typeColor = '#f59e0b';
      if (l.type === 'security') typeColor = '#f43f5e';
      if (l.type === 'system') typeColor = '#10b981';
      if (l.type === 'auth') typeColor = '#00c8ff';

      const badge = `[${l.type.toUpperCase()}]`;

      line.innerHTML = `
        <span style="color: #64748b; font-weight: 500; font-size: 11.5px; white-space: nowrap;">[${l.timestamp}]</span>
        <span style="color: ${typeColor}; font-weight: 700; font-size: 11.5px; white-space: nowrap; width: 85px; display: inline-block;">${badge}</span>
        <span style="color: #e2e8f0; font-weight: 600; white-space: nowrap;">${l.user}:</span>
        <span style="color: #94a3b8; font-weight: 400; word-break: break-all;">${l.action}</span>
      `;
      
      terminal.appendChild(line);
    });
  },

  // 💻 서브 탭 4: SELECT 안전 샌드박스 쿼리 에디터 초기화 및 이벤트 바인딩
  initSQLExplorer() {
    console.log("💻 SQL Explorer initializing...");
    const btnRun = document.getElementById('btn-run-sql');
    const btnLoadTemplate = document.getElementById('btn-load-sql-template');
    const popover = document.getElementById('sql-template-popover');
    const templateList = document.getElementById('sql-template-list');
    const btnExportCSV = document.getElementById('btn-sql-export-csv');

    if (btnLoadTemplate && popover) {
      btnLoadTemplate.onclick = (e) => {
        e.stopPropagation();
        popover.classList.toggle('hidden');
      };
      
      document.addEventListener('click', () => {
        popover.classList.add('hidden');
      });
    }

    const templates = {
      'T1': {
        title: '전체 체크리스트 100건 조회',
        sql: 'SELECT id, source_type, plant_code, customer, section, audit_question, priority, plant_risk_score\nFROM audit_checklists\nLIMIT 100;'
      },
      'T2': {
        title: '공장별 고위험(High) 리스크 체크리스트 조회',
        sql: 'SELECT id, plant_code, customer, section, requirement, audit_question, priority, plant_risk_score\nFROM audit_checklists\nWHERE priority = \'High\'\nLIMIT 50;'
      },
      'T3': {
        title: '특정 고객사(BMW) 기술 규격서 목록 분석',
        sql: 'SELECT id, customer, doc_code, doc_name, revision_date, doc_type, status\nFROM document_library\nWHERE customer = \'BMW\'\nLIMIT 50;'
      },
      'T4': {
        title: '4M 변경승인 단계 중 \'양산 검증\' 항목 추적',
        sql: 'SELECT DOC_NO, PLANT, PURPOSE, SUBJECT, STATUS, PROGRESS, REG_DATE, CHANGE_ITEM\nFROM cqms_4m_db\nWHERE PROGRESS = \'양산 적용 및 검증\'\nLIMIT 50;'
      },
      'T5': {
        title: '품질 실패 QI 미결(On-going) 이슈 조회',
        sql: 'SELECT DOC_NO, PLANT, OEM, VEH, OCC_DATE, STATUS, TYPE_NAME\nFROM cqms_qualityissue_db\nWHERE STATUS = \'On-going\'\nLIMIT 50;'
      },
      'T6': {
        title: '사내 오디터 계정 권한 리스트 감사',
        sql: 'SELECT id, name, department, role, lastActive, status\nFROM users\nLIMIT 50;'
      }
    };

    if (templateList) {
      templateList.innerHTML = '';
      Object.entries(templates).forEach(([key, t]) => {
        const item = document.createElement('div');
        item.className = 'popover-item';
        item.style.padding = '8px 12px';
        item.style.cursor = 'pointer';
        item.style.borderRadius = '4px';
        item.style.fontSize = '12px';
        item.style.color = 'var(--text-primary)';
        item.style.transition = 'background 0.2s';
        
        item.innerHTML = `
          <div style="font-weight: 600; color: var(--text-light); margin-bottom: 2px;">${t.title}</div>
          <div style="font-family: monospace; font-size: 11px; color: var(--text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${t.sql.split('\n').join(' ')}</div>
        `;

        item.addEventListener('mouseenter', () => {
          item.style.backgroundColor = 'rgba(255,255,255,0.04)';
        });
        item.addEventListener('mouseleave', () => {
          item.style.backgroundColor = 'transparent';
        });

        item.onclick = (e) => {
          e.stopPropagation();
          const editor = document.getElementById('sql-editor');
          if (editor) {
            editor.value = t.sql;
            this.showToast(`템플릿 쿼리 '${t.title}' 가 완벽 로드되었습니다.`);
          }
          popover.classList.add('hidden');
        };

        templateList.appendChild(item);
      });
    }

    if (btnRun) {
      btnRun.onclick = () => {
        this.runSQLExplorer();
      };
    }

    if (btnExportCSV) {
      btnExportCSV.onclick = () => {
        this.exportSQLResultToCSV();
      };
    }

    if (!this.state.lastSQLResult) {
      this.runSQLExplorer();
    }
  },

  // 💻 SQL SELECT 모의 실행 및 차단기
  runSQLExplorer() {
    const queryArea = document.getElementById('sql-editor');
    if (!queryArea) return;
    const rawQuery = queryArea.value.trim();
    
    // 1. 보안 샌드박스 검사 (INSERT, UPDATE, DELETE, DROP, ALTER, CREATE, REPLACE 등 차단)
    const isWrite = /(insert|update|delete|drop|alter|create|replace)/i.test(rawQuery);
    if (isWrite) {
      this.logAction(
        this.state.currentUser ? this.state.currentUser.name : 'System',
        `SQL 보안 차단 감지: 허가되지 않은 쓰기 구문 실행 시도 [${rawQuery.substring(0, 50)}...]`,
        'security'
      );
      
      const permissionModal = document.getElementById('permission-modal');
      const modalTitle = document.getElementById('permission-modal-title');
      const modalDesc = document.getElementById('permission-modal-desc');
      if (permissionModal && modalTitle && modalDesc) {
        modalTitle.innerHTML = `<span style="color: var(--danger-red);">⚠️ SQL 보안 샌드박스 위반 탐지</span>`;
        modalDesc.innerHTML = `
          SELECT 전용 안전 샌드박스 상태입니다.<br>
          원천 마스터 데이터의 무결성 보존을 위해 쓰기 및 변경 행위(INSERT, UPDATE, DELETE, DROP 등)는 전면 금지됩니다.<br><br>
          <span style="color: var(--text-muted); font-size: 12px; font-family: monospace;">탐지 구문: ${rawQuery.match(/(insert|update|delete|drop|alter|create|replace)/i)[0].toUpperCase()}</span>
        `;
        permissionModal.classList.remove('hidden');
      } else {
        alert("SELECT 전용 안전 샌드박스 상태입니다. 원천 마스터 데이터의 보존을 위해 쓰기 행위는 전면 금지됩니다.");
      }
      return;
    }

    // 2. SELECT 쿼리 파싱 및 실행
    let results = [];
    let tableName = '';
    
    const fromMatch = rawQuery.match(/from\s+([a-zA-Z0-9_]+)/i);
    if (fromMatch && fromMatch[1]) {
      tableName = fromMatch[1].toLowerCase();
    }

    let sourceData = [];
    if (tableName === 'audit_checklists') {
      sourceData = this.state.auditChecklists || [];
    } else if (tableName === 'audit_findings') {
      sourceData = this.state.auditFindings || [];
    } else if (tableName === 'cqms_4m_db' || tableName === 'cqms4mdb' || tableName === 'change_history_4m' || tableName === 'changehistory4m') {
      sourceData = this.state.changeHistory4m || [];
    } else if (tableName === 'document_library' || tableName === 'documentlibrary') {
      sourceData = this.state.documentLibrary || [];
    } else if (tableName === 'cqms_qualityissue_db' || tableName === 'cqms_qualityissue' || tableName === 'quality_issues_qi' || tableName === 'qualityissues') {
      sourceData = this.state.qualityIssues || [];
    } else if (tableName === 'users') {
      try {
        sourceData = JSON.parse(localStorage.getItem('audit_users')) || this.state.users;
      } catch (e) {
        sourceData = this.state.users || [];
      }
    } else {
      this.showToast('알 수 없는 테이블입니다. FROM 뒤의 테이블명을 확인해 주십시오.', 'warning');
      return;
    }

    results = [...sourceData];
    
    const whereMatch = rawQuery.match(/where\s+([a-zA-Z0-9_]+)\s*=\s*['"]?([^'"]+)['"]/i);
    if (whereMatch && whereMatch[1] && whereMatch[2]) {
      const col = whereMatch[1];
      const val = whereMatch[2];
      
      results = results.filter(item => {
        let itemVal = item[col];
        if (itemVal === undefined) itemVal = item[col.toUpperCase()];
        if (itemVal === undefined) itemVal = item[col.toLowerCase()];
        return itemVal != null && String(itemVal).toLowerCase() === val.toLowerCase();
      });
    }

    const limitMatch = rawQuery.match(/limit\s+(\d+)/i);
    let limit = 100;
    if (limitMatch && limitMatch[1]) {
      limit = parseInt(limitMatch[1], 10);
    }
    
    results = results.slice(0, limit);

    this.renderSQLResults(results, tableName);
    
    this.logAction(
      this.state.currentUser ? this.state.currentUser.name : 'System',
      `SQL SELECT 쿼리 실행 완료 (테이블: ${tableName}, 결과: ${results.length}건)`,
      'action'
    );
    this.showToast(`쿼리가 성공적으로 실행되었습니다. (총 ${results.length}건 조회됨)`, 'success');
  },

  // 💻 SQL 결과 그리드 테이블 렌더링
  renderSQLResults(results, tableName) {
    const tableHeader = document.getElementById('sql-table-header');
    const tableBody = document.getElementById('sql-table-body');
    const resultCount = document.getElementById('sql-result-count');
    
    if (!tableHeader || !tableBody) return;
    
    tableHeader.innerHTML = '';
    tableBody.innerHTML = '';
    
    if (resultCount) {
      resultCount.textContent = results.length;
    }

    this.state.lastSQLResult = results;
    this.state.lastSQLTable = tableName;

    if (results.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="100%" style="padding: 20px; text-align: center; color: var(--text-muted);">조회된 데이터가 없습니다.</td></tr>`;
      return;
    }

    const firstRow = results[0];
    const columns = Object.keys(firstRow).filter(k => k !== 'URL' && k !== 'password');
    
    columns.forEach(col => {
      const th = document.createElement('th');
      th.textContent = col.toUpperCase();
      th.style.padding = '10px 14px';
      th.style.fontSize = '12px';
      th.style.color = 'var(--text-secondary)';
      th.style.borderBottom = '1px solid var(--border-card)';
      th.style.whiteSpace = 'nowrap';
      th.style.fontWeight = '600';
      tableHeader.appendChild(th);
    });

    results.forEach(row => {
      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid rgba(255,255,255,0.03)';
      
      columns.forEach(col => {
        const td = document.createElement('td');
        let val = row[col];
        if (val === null || val === undefined) val = '-';
        
        td.textContent = typeof val === 'object' ? JSON.stringify(val) : val;
        td.style.padding = '10px 14px';
        td.style.fontSize = '12.5px';
        td.style.color = 'var(--text-primary)';
        td.style.whiteSpace = 'nowrap';
        td.style.maxWidth = '300px';
        td.style.overflow = 'hidden';
        td.style.textOverflow = 'ellipsis';
        
        if (col.toLowerCase() === 'priority') {
          const badgeClass = val === 'High' ? 'badge-danger' : (val === 'Medium' ? 'badge-warning' : 'badge-success');
          td.innerHTML = `<span class="badge ${badgeClass}">${val}</span>`;
        } else if (col.toLowerCase() === 'status') {
          if (val === 'Active' || val === 'Complete') {
            td.innerHTML = `<span class="badge badge-success">${val}</span>`;
          } else if (val === 'On-going' || val === 'Under Review') {
            td.innerHTML = `<span class="badge badge-warning">${val}</span>`;
          } else {
            td.innerHTML = `<span class="badge" style="background: rgba(255,255,255,0.08); color: var(--text-muted); border: 1px solid var(--border-card);">${val}</span>`;
          }
        }
        
        tr.appendChild(td);
      });
      tableBody.appendChild(tr);
    });
  },

  // 💻 SQL 결과 셋 CSV 다운로드
  exportSQLResultToCSV() {
    const results = this.state.lastSQLResult;
    const tableName = this.state.lastSQLTable || 'query_result';
    
    if (!results || results.length === 0) {
      this.showToast('다운로드할 결과 셋이 존재하지 않습니다.', 'warning');
      return;
    }

    try {
      const firstRow = results[0];
      const columns = Object.keys(firstRow).filter(k => k !== 'URL' && k !== 'password');
      
      const csvRows = [];
      csvRows.push(columns.join(','));

      results.forEach(row => {
        const values = columns.map(col => {
          let val = row[col];
          if (val === null || val === undefined) val = '';
          const valStr = String(val).replace(/"/g, '""');
          return `"${valStr}"`;
        });
        csvRows.push(values.join(','));
      });

      const csvString = '\ufeff' + csvRows.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `RiskHunter_SQL_${tableName}_${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      this.logAction(this.state.currentUser.name, `SQL 결과 CSV 내보내기 실행 (테이블: ${tableName})`, 'action');
      this.showToast(`CSV 내보내기가 완료되었습니다. (파일명: RiskHunter_SQL_${tableName}.csv)`, 'success');
    } catch (e) {
      console.error("SQL CSV Export error", e);
      this.showToast('CSV 추출에 실패하였습니다. 콘솔 에러를 확인하십시오.', 'danger');
    }
  }
};

window.antigravity = app;

// 브라우저 DOM 로드 완료 시 구동
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
