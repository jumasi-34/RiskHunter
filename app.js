/**
 * ==========================================================================
 * ⚙️ RiskHunter App Engine (Core JavaScript)
 * Phase 6: Library & Floating Assistant Integration Engine
 * ==========================================================================
 */

const app = {
  // 전역 애플리케이션 상태 (Global State)
  state: {
    currentTab: 'dashboard',
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
      plantSelected: null // Doughnut 차트 전환 시 선택된 공장 코드 보존용 (e.g. 'DP')
    },

    // 글로벌 공통 필터 상태 값 (Plant, Customer, Process)
    selectedPlant: 'ALL',
    selectedCustomer: 'ALL',
    selectedProcess: 'ALL',
    
    // 라이브러리 인터랙션용 필터 및 상태 값
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
  init() {
    console.log("🏁 RiskHunter Phase 6 Core Engine Initializing...");
    
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
    
    // 4. 권한 기반 UI 요소 상태 제어 및 탭 동기화
    this.applyPermissionToUI();
    this.switchTab(this.state.currentTab);

    // 5. 비동기 정적 데이터 로딩 및 가상 데이터베이스 초기화
    this.initDatabase();
    
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
        fetch('data/audit_checklists.json').then(r => {
          if (!r.ok) throw new Error("Checklist file (audit_checklists.json) not found");
          return r.json();
        }),
        fetch('data/document_library.json').then(r => {
          if (!r.ok) throw new Error("Document library file (document_library.json) not found");
          return r.json();
        }),
        fetch('data/common_codes.json').then(r => {
          if (!r.ok) throw new Error("Common codes file (common_codes.json) not found");
          return r.json();
        }),
        fetch('data/audit_findings.json').then(r => {
          if (!r.ok) throw new Error("Audit findings file (audit_findings.json) not found");
          return r.json();
        }),
        fetch('data/change_history_4m.json').then(r => {
          if (!r.ok) throw new Error("4M change history file (change_history_4m.json) not found");
          return r.json();
        }),
        fetch('data/quality_issues_qi.json').then(r => {
          if (!r.ok) throw new Error("Quality issues file (quality_issues_qi.json) not found");
          return r.json();
        }),
        fetch('data/users.json').then(r => {
          if (!r.ok) throw new Error("Users file (users.json) not found");
          return r.json();
        }),
        fetch('data/oe_quality_assessment_details.json').then(r => {
          if (!r.ok) throw new Error("OE Quality assessment file (oe_quality_assessment_details.json) not found");
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
      
      // 글로벌 필터 동적 생성 (Phase 1)
      this.initGlobalFilters();

      // 데이터 사전 가공 및 공정-4M 매핑 (Phase 2)
      this.preProcessData();

      // 라이브러리 탭 내 데이터 바인딩 및 이벤트 초기화
      this.initLibraryTab();

      // Phase 3 감사 일정 및 체크리스트 상태 초기 로딩
      this.loadAuditPlanningData();

      // 대시보드 실시간 입체 렌더링 및 차트 마운트 (Phase 2)
      this.renderDashboard();
      
    } catch (err) {
      console.error("❌ Failed to load static resources:", err);
      this.showToast("정적 리소스를 로딩할 수 없습니다. 로컬 data/ 폴더 및 파일명을 확인해 주십시오.", "warning");
      
      // 에러 바운더리 오버레이 표출 (Glassmorphism Error Overlay)
      const errorBoundary = document.getElementById('error-boundary');
      const errorDetailsText = document.getElementById('error-details-text');
      if (errorBoundary) {
        errorBoundary.classList.remove('hidden');
        if (errorDetailsText) {
          errorDetailsText.textContent = `상세 오류 내용: ${err.message || err}`;
        }
      }
    }
  },

  // 🛠️ 글로벌 공통 필터 바 동적 생성 (Phase 1)
  initGlobalFilters() {
    console.log("🛠️ Initializing Global Filters...");
    
    // 1. 대상 공장 (filter-plant) 생성
    const filterPlantSelect = document.getElementById('filter-plant');
    if (filterPlantSelect && this.state.commonCodes && this.state.commonCodes.plants) {
      filterPlantSelect.innerHTML = '';
      
      // 'ALL'을 첫 번째 옵션으로 처리하기 위해 분리 정렬
      const plants = this.state.commonCodes.plants.filter(p => p.is_active);
      const allPlant = plants.find(p => p.code === 'ALL');
      const regularPlants = plants.filter(p => p.code !== 'ALL');
      
      // "ALL" (전체 공장) 배치
      const allOption = document.createElement('option');
      allOption.value = 'ALL';
      allOption.textContent = allPlant ? `${allPlant.name} (ALL)` : '전체 공장 (ALL)';
      filterPlantSelect.appendChild(allOption);
      
      // 나머지 공장들 배치
      regularPlants.forEach(plant => {
        const opt = document.createElement('option');
        opt.value = plant.code;
        opt.textContent = `${plant.name} (${plant.code})`;
        filterPlantSelect.appendChild(opt);
      });
    }

    // 2. 완성차 고객사 (filter-customer) 생성
    const filterCustomerSelect = document.getElementById('filter-customer');
    if (filterCustomerSelect) {
      filterCustomerSelect.innerHTML = '';
      
      const allOpt = document.createElement('option');
      allOpt.value = 'ALL';
      allOpt.textContent = '전체 고객사 (ALL)';
      filterCustomerSelect.appendChild(allOpt);

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

      // 알파벳 순 정렬
      const sortedCustomers = Array.from(customerSet).sort();
      sortedCustomers.forEach(cust => {
        const opt = document.createElement('option');
        opt.value = cust;
        opt.textContent = cust;
        filterCustomerSelect.appendChild(opt);
      });
    }

    // 3. 대상 제조 공정 (filter-process) 생성
    const filterProcessSelect = document.getElementById('filter-process');
    if (filterProcessSelect && this.state.commonCodes) {
      filterProcessSelect.innerHTML = '';
      
      // 기본 "전체 공정" 옵션
      const allOpt = document.createElement('option');
      allOpt.value = 'ALL';
      allOpt.textContent = '전체 공정 (ALL)';
      filterProcessSelect.appendChild(allOpt);

      // 제조 공정 (Processes) optgroup
      if (this.state.commonCodes.processes && this.state.commonCodes.processes.length > 0) {
        const mfgGroup = document.createElement('optgroup');
        mfgGroup.label = '제조 공정 (Processes)';
        this.state.commonCodes.processes.forEach(proc => {
          const opt = document.createElement('option');
          opt.value = proc.code;
          opt.textContent = `${proc.name} (${proc.code})`;
          mfgGroup.appendChild(opt);
        });
        filterProcessSelect.appendChild(mfgGroup);
      }

      // 관리 영역 (System Categories) optgroup
      if (this.state.commonCodes.categories && this.state.commonCodes.categories.length > 0) {
        const systemGroup = document.createElement('optgroup');
        systemGroup.label = '관리 영역 (Categories)';
        this.state.commonCodes.categories.forEach(cat => {
          const opt = document.createElement('option');
          opt.value = cat.code;
          opt.textContent = `${cat.name} (${cat.code})`;
          systemGroup.appendChild(opt);
        });
        filterProcessSelect.appendChild(systemGroup);
      }
    }

    // 초기 필터 선택값 반영
    if (filterPlantSelect) filterPlantSelect.value = this.state.selectedPlant;
    if (filterCustomerSelect) filterCustomerSelect.value = this.state.selectedCustomer;
    if (filterProcessSelect) filterProcessSelect.value = this.state.selectedProcess;
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

    // 특정 탭으로 이동 시 재렌더링
    if (subTabId === 'master-checklist') {
      this.renderChecklistTable();
    } else if (subTabId === 'customer-reqs') {
      this.renderDocumentLibrary();
    } else if (subTabId === 'req-mapping') {
      this.renderRequirementMapping();
    }
  },

  // ==========================================================================
  // 📅 2. Audit Planning (사전 일정 및 준비 항목 관리 핵심 구현 - Phase 3)
  // ==========================================================================

  // 1) 로컬 저장소(localStorage) 영속성 데이터 로드 및 초기 세팅
  loadAuditPlanningData() {
    console.log("📅 Initializing Audit Planning local data...");
    
    // 기본 일정 정의 (저장소가 비어있을 때 불러옴)
    const defaultAudits = [
      {
        id: "audit_1",
        title: "BMW 대전공장 VDA 6.3 정기 수검",
        plantCode: "DP",
        customer: "BMW",
        date: "2026-06-15",
        leadAuditor: "박정호 수석",
        project: "G60 EV LCI",
        desc: "VDA 6.3 정기 품질 프로세스 심사 - 전 공정 (배합, 압출, 성형, 가류)"
      },
      {
        id: "audit_2",
        title: "Audi 헝가리공장 신차 실사 (IATF 16949)",
        plantCode: "MP",
        customer: "Audi",
        date: "2026-06-25",
        leadAuditor: "이현우 책임",
        project: "PPE Platform SUV",
        desc: "신규 완성차 장착용 고성능 타이어 공급선 특수공정 심사"
      },
      {
        id: "audit_3",
        title: "GM 테네시공장 공급선 정기 평가",
        plantCode: "TP",
        customer: "GM",
        date: "2026-06-08",
        leadAuditor: "박정호 수석",
        project: "Lyriq EV",
        desc: "북미향 전기차 전용 타이어 흡음재(Form) 공정 및 완성도 감사"
      }
    ];

    // audits 로딩
    const storedAudits = localStorage.getItem('riskhunter_audits');
    if (storedAudits) {
      try {
        this.state.audits = JSON.parse(storedAudits);
      } catch (e) {
        console.error("Failed to parse audits from localStorage", e);
        this.state.audits = defaultAudits;
      }
    } else {
      this.state.audits = defaultAudits;
      localStorage.setItem('riskhunter_audits', JSON.stringify(defaultAudits));
    }

    // selectedAuditId 로딩
    const storedSelectedId = localStorage.getItem('riskhunter_selected_audit_id');
    if (storedSelectedId && this.state.audits.some(a => a.id === storedSelectedId)) {
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
      // 초기 목업 데이터 세련되게 세팅
      this.state.planningChecklistStates = {
        "audit_1": {
          "task_1": "completed",
          "task_2": "completed",
          "task_3": "in_progress",
          "task_4": "pending",
          "task_5": "pending"
        },
        "audit_2": {
          "task_1": "completed",
          "task_2": "in_progress"
        },
        "audit_3": {
          "task_1": "completed",
          "task_2": "completed",
          "task_3": "completed",
          "task_4": "completed",
          "task_5": "in_progress",
          "task_6": "in_progress"
        }
      };
      localStorage.setItem('riskhunter_checklist_states', JSON.stringify(this.state.planningChecklistStates));
    }
  },

  // 2) Audit Planning 탭 구동 시 초기화 및 리스너 등록
  initAuditPlanning() {
    console.log("📅 Initializing Audit Planning Tab...");
    
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

    // 화면 렌더링 기동
    this.renderPlanningScreen();
  },

  // 3) 감사 계획 화면 동적 드로잉 (KPI 카드, 마일스톤 타임라인, 태스크 테이블)
  renderPlanningScreen() {
    const audit = this.state.audits.find(a => a.id === this.state.selectedAuditId);
    if (!audit) {
      console.warn("No active audit schedule found.");
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

      // 지연(Delayed) 판단 조건:
      // D-Day가 많이 부족한 상태(예: 10일 이하)에서 여전히 대기(pending) 상태인 테스크
      // 혹은 특정 시점 마일스톤에 부합하지 못하는 미비 사항
      if (state === "pending") {
        const milestoneDays = parseInt(task.milestone.replace("D-", "")) || 0;
        // 남은 일수가 해당 마일스톤 기준일보다 작으면 지연된 것으로 고도의 품질 일정 계산
        if (diffDays <= milestoneDays) {
          delayedCount++;
        }
      }
    });

    const completionRate = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;

    // [3] KPI 카드 바인딩
    const ddayValNode = document.getElementById('planning-kpi-dday');
    const ddaySubNode = document.getElementById('planning-kpi-dday-sub');
    if (ddayValNode && ddaySubNode) {
      ddayValNode.innerHTML = `<span class="kpi-val ${dDayClass}" style="font-size: 32px; font-weight: 800; font-family: monospace;">${dDayText}</span>`;
      ddaySubNode.innerHTML = `<span style="font-size: 11.5px; color: var(--text-muted);">수검 확정일: <strong>${audit.date}</strong></span>`;
    }

    const totalValNode = document.getElementById('planning-kpi-total');
    if (totalValNode) {
      totalValNode.innerHTML = `<span class="kpi-val" style="font-size: 32px; font-weight: 800; font-family: monospace;">${totalTasks}</span><span style="font-size: 13px; color: var(--text-secondary); margin-left: 4px;">개</span>`;
    }

    const completedValNode = document.getElementById('planning-kpi-completed');
    const completedSubNode = document.getElementById('planning-kpi-completed-sub');
    if (completedValNode && completedSubNode) {
      completedValNode.innerHTML = `<span class="kpi-val" style="font-size: 32px; font-weight: 800; color: #10b981; font-family: monospace;">${completedCount}</span><span style="font-size: 13px; color: var(--text-secondary); margin-left: 4px;">개</span>`;
      completedSubNode.innerHTML = `<span style="font-size: 11.5px; color: var(--text-muted);">대비 달성율: <strong style="color: #10b981;">${completionRate.toFixed(0)}%</strong></span>`;
    }

    const progressValNode = document.getElementById('planning-kpi-progress');
    const progressSubNode = document.getElementById('planning-kpi-progress-sub');
    if (progressValNode && progressSubNode) {
      progressValNode.innerHTML = `<span class="kpi-val" style="font-size: 32px; font-weight: 800; color: #3b82f6; font-family: monospace;">${inProgressCount}</span><span style="font-size: 13px; color: var(--text-secondary); margin-left: 4px;">개</span>`;
      progressSubNode.innerHTML = `<span style="font-size: 11.5px; color: var(--text-muted);">부서 조치 및 검토 단계</span>`;
    }

    const delayedValNode = document.getElementById('planning-kpi-delayed');
    const delayedSubNode = document.getElementById('planning-kpi-delayed-sub');
    if (delayedValNode && delayedSubNode) {
      delayedValNode.innerHTML = `<span class="kpi-val" style="font-size: 32px; font-weight: 800; color: ${delayedCount > 0 ? '#ef4444' : 'var(--text-muted)'}; font-family: monospace;">${delayedCount}</span><span style="font-size: 13px; color: var(--text-secondary); margin-left: 4px;">개</span>`;
      delayedSubNode.innerHTML = `<span style="font-size: 11.5px; color: var(--text-muted);">${delayedCount > 0 ? '<strong style="color: #ef4444;">조치 지연 리스크 감지</strong>' : '일정 지연 없음 (양호)'}</span>`;
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
      timelineHTML += `<div style="position: absolute; top: 8px; left: 11px; width: 2px; height: calc(100% - 16px); background: linear-gradient(180deg, #00c8ff, var(--border-card) 70%, rgba(255,255,255,0.05)); z-index: 0;"></div>`;

      milestones.forEach(m => {
        // 이 마일스톤에 속한 태스크 분석
        const mTasks = this.state.planningTasks.filter(t => t.milestone === m.key);
        const mTotal = mTasks.length;
        const mCompleted = mTasks.filter(t => (taskStates[t.id] || "pending") === "completed").length;
        const mPercent = mTotal > 0 ? Math.round((mCompleted / mTotal) * 100) : 0;

        const isCurrentActive = m.key === activeMilestoneKey;
        const isAllDone = mPercent === 100;

        // 노드 상태 클래스 결정
        let nodeClass = "pending";
        let nodeStyle = "background: rgba(15, 23, 42, 0.9); border: 2px solid var(--border-card); color: var(--text-muted);";
        
        if (isAllDone) {
          nodeClass = "completed";
          nodeStyle = "background: #10b981; border: 2px solid #059669; color: white;";
        } else if (isCurrentActive) {
          nodeClass = "active";
          nodeStyle = "background: #00c8ff; border: 2px solid #0284c7; color: white; box-shadow: 0 0 12px #00c8ff;";
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
            <div class="card-solid milestone-card ${isCurrentActive ? 'active-glow' : ''}" style="background: rgba(255, 255, 255, ${isCurrentActive ? '0.04' : '0.02'}); border: 1px solid ${isCurrentActive ? 'rgba(0, 200, 255, 0.25)' : 'rgba(255, 255, 255, 0.05)'}; padding: 14px 18px; border-radius: 8px; transition: all 0.2s ease-in-out;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px; margin-bottom: 6px;">
                <div>
                  <span style="font-size: 11px; font-weight: 800; font-family: monospace; color: ${isCurrentActive ? '#00c8ff' : 'var(--text-secondary)'}; text-transform: uppercase;">
                    ${m.key} ${isCurrentActive ? '• 현재 실행 마일스톤' : ''}
                  </span>
                  <h4 style="font-size: 13.5px; font-weight: 700; color: var(--text-light); margin: 2px 0 0 0;">${m.title}</h4>
                </div>
                <div style="text-align: right;">
                  <span style="font-size: 11px; font-weight: 700; font-family: monospace; color: ${isAllDone ? '#10b981' : (isCurrentActive ? '#00c8ff' : 'var(--text-muted)')}; background: ${isAllDone ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.03)'}; border: 1px solid ${isAllDone ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)'}; padding: 2px 8px; border-radius: 4px;">
                    ${mPercent}% (${mCompleted}/${mTotal})
                  </span>
                </div>
              </div>
              <p style="font-size: 12px; color: var(--text-secondary); margin: 0 0 8px 0; line-height: 1.5; font-weight: 500;">${m.desc}</p>
              
              <!-- 쁘띠 미니 프로그레스바 -->
              <div style="width: 100%; height: 3px; background: rgba(255,255,255,0.03); border-radius: 1.5px; overflow: hidden; border: 1px solid rgba(255,255,255,0.02);">
                <div style="width: ${mPercent}%; height: 100%; background: ${isAllDone ? '#10b981' : 'linear-gradient(90deg, #3b82f6, #00c8ff)'}; transition: width 0.3s ease;"></div>
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
            <tr style="border-bottom: 1px solid var(--border-card); background: rgba(255,255,255,0.01);">
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
          statusBadge = `<span class="badge" style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); color: #10b981; font-weight: 700; display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px;">완료</span>`;
          rowStyle = "opacity: 0.85; background: rgba(16, 185, 129, 0.01);";
        } else if (state === "in_progress") {
          statusBadge = `<span class="badge" style="background: rgba(59, 130, 246, 0.08); border: 1px solid rgba(59, 130, 246, 0.25); color: #3b82f6; font-weight: 700; display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; animation: pulse-blue 1.5s infinite;">진행 중</span>`;
          rowStyle = "background: rgba(59, 130, 246, 0.01);";
        } else {
          statusBadge = `<span class="badge" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); color: var(--text-secondary); font-weight: 600; display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px;">대기</span>`;
        }

        // 지연(Delayed) 여부에 따라 행 테두리나 텍스트 컬러 강조
        let delayBadgeHTML = "";
        const milestoneDays = parseInt(task.milestone.replace("D-", "")) || 0;
        if (state === "pending" && diffDays <= milestoneDays) {
          delayBadgeHTML = `<span style="margin-left: 6px; font-size: 10px; font-weight: 700; background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.2); color: #ef4444; padding: 1px 4px; border-radius: 3px; vertical-align: middle;">지연 위험</span>`;
        }

        tableHTML += `
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.03); ${rowStyle} transition: background 0.15s;">
            <!-- 마일스톤 기준일 -->
            <td style="padding: 12px; font-family: monospace; font-weight: 800; color: var(--brand-blue);">${task.milestone}</td>
            
            <!-- 태스크 제목 -->
            <td style="padding: 12px; font-weight: 700; color: var(--text-light); line-height: 1.4;">
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
              <button class="btn-toggle-task" data-id="${task.id}" style="padding: 5px 10px; font-size: 11px; font-weight: 700; border-radius: 4px; cursor: pointer; transition: all 0.2s; border: 1px solid var(--border-card); background: rgba(255,255,255,0.03); color: var(--text-primary); display: inline-flex; align-items: center; gap: 4px;">
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
    const newId = "audit_" + (Date.now()); // 안전한 타임스탬프 ID
    const newAudit = {
      id: newId,
      title: title,
      plantCode: plant,
      customer: customer,
      date: date,
      leadAuditor: lead,
      project: project || "전사 신규 품질 실사",
      desc: desc || "정적 MVP 기반 수검 계획 등록"
    };

    // 3. 전역 State 및 LocalStorage 에 세션 보존 영속화
    this.state.audits.push(newAudit);
    localStorage.setItem('riskhunter_audits', JSON.stringify(this.state.audits));

    // 신규 등록 일정을 즉시 활성 감사 일정으로 격상 선택
    this.state.selectedAuditId = newId;
    localStorage.setItem('riskhunter_selected_audit_id', newId);

    // 해당 감사 체크리스트 초기상태 빈 객체 배당
    this.state.planningChecklistStates[newId] = {};
    localStorage.setItem('riskhunter_checklist_states', JSON.stringify(this.state.planningChecklistStates));

    // 4. 모달 숨기기 및 알림
    document.getElementById('audit-registration-modal').classList.add('hidden');
    this.showToast(`'${title}' 수검 일정이 성공적으로 등록되었으며, 실시간 체크리스트가 기동되었습니다!`, "success");

    // 5. 화면 동기화 리렌더링
    this.initAuditPlanning();
  },

  // ==========================================================================
  // 📁 5. Library (통합 감사 지식 라이브러리 핵심 구현)
  // ==========================================================================
  initLibraryTab() {
    // 1. 수검 공정별 전체 현황 카드 렌더링
    this.renderProcessSummary();

    // 2. 마스터 체크리스트 테이블 그리드 렌더링 및 페이지네이션 초기화
    this.renderChecklistTable();

    // 3. OE 기술 사양서 리스트 렌더링
    this.renderDocumentLibrary();

    // 4. 규격-리스크 매핑 구조 렌더링
    this.renderRequirementMapping();

    // 5. 체크리스트 검색바 실시간 바인딩 (이벤트 디바운싱 대체용)
    const checklistSearch = document.getElementById('checklist-search-input');
    if (checklistSearch) {
      checklistSearch.addEventListener('input', (e) => {
        this.state.checklistSearchQuery = e.target.value.trim();
        this.state.checklistCurrentPage = 1; // 검색 시 1페이지로 리턴
        this.renderChecklistTable();
      });
    }

    // 6. CSV 내보내기 액션 핸들러 바인딩
    const btnCsvExport = document.getElementById('btn-checklist-csv-export');
    if (btnCsvExport) {
      btnCsvExport.addEventListener('click', () => {
        this.exportChecklistToCSV();
      });
    }

    // 7. 이전 / 다음 페이지네이션 버튼 바인딩
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

    // 8. 서브 상세 드로어 닫기 버튼 핸들러
    const btnCloseDrawer = document.getElementById('btn-close-drawer');
    if (btnCloseDrawer) {
      btnCloseDrawer.addEventListener('click', () => {
        const drawer = document.getElementById('checklist-drawer');
        if (drawer) drawer.classList.remove('active');
      });
    }

    // 9. OE 요약본 검색 필드 바인딩
    const libSearch = document.getElementById('lib-search-input');
    if (libSearch) {
      libSearch.addEventListener('input', (e) => {
        this.state.libSearchQuery = e.target.value.trim();
        this.renderDocumentLibrary();
      });
    }

    // 10. 가상 원본 다운로드 트리거 바인딩
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

    container.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; gap: 16px; flex-wrap: wrap;">
        <!-- 좌측: 드롭다운 선택상자 -->
        <div style="display: flex; align-items: center; gap: 10px;">
          <select id="checklist-process-dropdown" class="filter-select" style="min-width: 280px; font-size: 13px; background: rgba(255,255,255,0.05); border: 1px solid var(--border-card); border-radius: 6px; padding: 6px 12px; color: var(--text-primary); cursor: pointer; outline: none;">
            ${optionsHTML}
          </select>
        </div>
        
        <!-- 우측: 선택된 공정의 요약 지표 보드 -->
        <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
          <div style="font-size: 12px; color: var(--text-secondary);">
            <strong style="color: var(--brand-blue);">${dispLabel}</strong> 실시간 수검 현황:
          </div>
          
          <!-- 총 수검 조항 수 배지 -->
          <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-card); border-radius: 6px; padding: 6px 14px; display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 11px; color: var(--text-secondary);">총 규격 반영 수</span>
            <span style="font-size: 13px; font-weight: 700; color: var(--text-primary); font-family: monospace;">${dispTotal}건</span>
          </div>

          <!-- 고위험 핵심 조항 수 배지 -->
          <div style="background: rgba(239, 68, 68, 0.03); border: 1px solid rgba(239, 68, 68, 0.15); border-radius: 6px; padding: 6px 14px; display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 11px; color: #ef4444; font-weight: 600;">고위험 핵심 규격 (High)</span>
            <span style="font-size: 13px; font-weight: 700; color: #f87171; font-family: monospace; display: flex; align-items: center; gap: 4px;">
              <i data-lucide="alert-triangle" style="width: 13px; height: 13px;"></i>
              ${dispHigh}건
            </span>
          </div>
        </div>
      </div>
    `;

    if (typeof lucide !== 'undefined') lucide.createIcons();

    // 드롭다운 변경 리스너 연계
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
  },

  // 📝 공정/검색 통합 필터 적용된 데이터 셋 슬라이스
  getFilteredChecklist() {
    let list = this.state.auditChecklists || [];
    
    // 글로벌 필터 적용 (Phase 1)
    if (this.state.selectedPlant && this.state.selectedPlant !== 'ALL') {
      const plant = this.state.selectedPlant.toLowerCase();
      list = list.filter(item => (item.plant_code || '').toLowerCase() === plant || (item.plant_code || '').toLowerCase() === 'all');
    }
    
    if (this.state.selectedCustomer && this.state.selectedCustomer !== 'ALL') {
      const customer = this.state.selectedCustomer.toLowerCase();
      list = list.filter(item => (item.customer || '').toLowerCase() === customer);
    }

    if (this.state.selectedProcess && this.state.selectedProcess !== 'ALL') {
      const process = this.state.selectedProcess.toLowerCase();
      list = list.filter(item => (item.process_category || '').toLowerCase() === process);
    }
    
    // 1. 공정 분류 로컬 필터 (Process & Category 스펙 반영)
    if (this.state.checklistFilterProcess !== 'ALL') {
      const selected = this.state.checklistFilterProcess.toLowerCase();
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

    if (paginatedItems.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="padding: 40px; text-align: center; color: var(--text-secondary); font-size: 13px;">
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

      // 중요도 배지 정의
      let priorityBadge = '';
      if (item.priority && item.priority.toUpperCase() === 'HIGH') {
        priorityBadge = `<span style="padding: 2px 6px; font-size: 10px; font-weight: 700; background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 4px;">High</span>`;
      } else if (item.priority && item.priority.toUpperCase() === 'MEDIUM') {
        priorityBadge = `<span style="padding: 2px 6px; font-size: 10px; font-weight: 700; background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 4px;">Med</span>`;
      } else {
        priorityBadge = `<span style="padding: 2px 6px; font-size: 10px; font-weight: 700; background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 4px;">Low</span>`;
      }

      // 고객사별 커스텀 배지 색상 매핑
      const customer = item.customer || 'OEM';
      let custBg = 'rgba(255, 255, 255, 0.05)';
      let custCol = 'var(--text-primary)';
      if (customer.toUpperCase().includes('BMW')) { custBg = 'rgba(29, 78, 216, 0.15)'; custCol = '#60a5fa'; }
      else if (customer.toUpperCase().includes('AUDI')) { custBg = 'rgba(220, 38, 38, 0.15)'; custCol = '#f87171'; }
      else if (customer.toUpperCase().includes('HYUNDAI') || customer.toUpperCase().includes('HKMC')) { custBg = 'rgba(16, 185, 129, 0.15)'; custCol = '#34d399'; }

      tr.innerHTML = `
        <td style="padding: 12px; font-size: 13px; font-family: monospace; color: var(--text-secondary);">${item.id}</td>
        <td style="padding: 12px; font-size: 12px; font-weight: 600;">
          <span style="padding: 2px 6px; background: ${custBg}; color: ${custCol}; border-radius: 4px;">${customer}</span>
        </td>
        <td style="padding: 12px; font-size: 12px; font-family: monospace; font-weight: 500; color: var(--text-light); text-overflow: ellipsis; white-space: nowrap; overflow: hidden; max-width: 130px;" title="${item.doc_code}">${item.doc_code}</td>
        <td style="padding: 12px; font-size: 12px; font-weight: 500;"><span class="badge" style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-card); font-size: 11px;">${item.process_category}</span></td>
        <td style="padding: 12px; text-align: center;">${priorityBadge}</td>
        <td style="padding: 12px; font-size: 13px; color: var(--text-primary); text-overflow: ellipsis; white-space: nowrap; overflow: hidden; max-width: 400px;" title="${item.audit_question}">${item.audit_question}</td>
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
    const grid = document.getElementById('lib-document-grid');
    if (!grid) return;

    let list = this.state.documentLibrary || [];
    
    // 글로벌 고객사 필터 적용 (Phase 1)
    if (this.state.selectedCustomer && this.state.selectedCustomer !== 'ALL') {
      const customer = this.state.selectedCustomer.toLowerCase();
      list = list.filter(d => (d.customer || '').toLowerCase() === customer);
    }
    
    // 로컬 검색어 필터
    if (this.state.libSearchQuery) {
      const q = this.state.libSearchQuery;
      list = list.filter(d => {
        return this.matchesSearchQuery(d.filename, q) ||
               this.matchesSearchQuery(d.customer, q) ||
               this.matchesSearchQuery(d.doc_code, q) ||
               this.matchesSearchQuery(d.doc_name, q) ||
               (d.doc_type && this.matchesSearchQuery(d.doc_type, q));
      });
    }

    grid.innerHTML = '';

    if (list.length === 0) {
      grid.innerHTML = `
        <div style="padding: 40px; text-align: center; color: var(--text-secondary); width: 100%;">
          <i data-lucide="alert-circle" style="width: 28px; height: 24px; margin-bottom: 8px; opacity: 0.5; color: var(--brand-blue);"></i>
          <p style="font-size: 13px;">일치하는 규격 문서가 라이브러리에 없습니다.</p>
        </div>
      `;
      if (typeof lucide !== 'undefined') lucide.createIcons();
      return;
    }

    list.forEach(doc => {
      const card = document.createElement('div');
      
      const isSelected = this.state.selectedDoc && this.state.selectedDoc.id === doc.id;
      
      // 고객사 로고 가상 설정
      let logoHTML = '';
      const cust = doc.customer.toUpperCase();
      if (cust.includes('BMW')) {
        logoHTML = '<div class="oem-profile-logo" style="color: #60a5fa; background: rgba(29, 78, 216, 0.1);"><i data-lucide="compass"></i></div>';
      } else if (cust.includes('AUDI')) {
        logoHTML = '<div class="oem-profile-logo" style="color: #f87171; background: rgba(220, 38, 38, 0.1);"><i data-lucide="chrome"></i></div>';
      } else {
        logoHTML = '<div class="oem-profile-logo" style="color: #34d399; background: rgba(16, 185, 129, 0.1);"><i data-lucide="cpu"></i></div>';
      }

      card.className = `popover-item table-row-hover ${isSelected ? 'active' : ''}`;
      card.style.background = isSelected ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.02)';
      card.style.border = isSelected ? '1px solid var(--brand-blue)' : '1px solid var(--border-card)';
      card.style.borderRadius = '8px';
      card.style.padding = '14px';
      card.style.display = 'flex';
      card.style.gap = '14px';
      card.style.alignItems = 'flex-start';
      card.style.cursor = 'pointer';
      card.style.transition = 'all 0.2s';

      card.innerHTML = `
        ${logoHTML}
        <div style="flex: 1; min-width: 0;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
            <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); background: rgba(255,255,255,0.05); padding: 1px 6px; border-radius: 4px;">${doc.doc_type || '품질 규격'}</span>
            <span style="font-size: 11px; font-family: monospace; color: var(--text-secondary);">${doc.file_size || 'N/A'}</span>
          </div>
          <h4 style="font-size: 13px; font-weight: 700; color: var(--text-primary); margin: 6px 0 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${doc.doc_name}">${doc.doc_name}</h4>
          <p style="font-size: 11px; font-family: monospace; color: var(--text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${doc.filename}">${doc.filename}</p>
          <div style="display: flex; gap: 8px; margin-top: 8px; font-size: 11px; color: var(--text-secondary);">
            <span>고객: <strong style="color: var(--text-light);">${doc.customer}</strong></span>
            <span>•</span>
            <span>코드: <strong style="color: var(--text-light);">${doc.doc_code}</strong></span>
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        this.state.selectedDoc = doc;
        this.renderDocumentLibrary(); // 활성 상태 렌더 업데이트
        this.renderDocSummary(doc);
      });

      grid.appendChild(card);
    });

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
    const procChips = processes.map(p => `<span class="badge" style="background: rgba(59,130,246,0.08); border: 1px solid rgba(59,130,246,0.2); font-size: 10px; font-weight: 600; padding: 2px 6px; color: #60a5fa;">${p}</span>`).join(' ');

    // 중요 조항 목록 카드 구성
    const clauses = sum.key_clauses || [];
    let clausesHTML = '';
    if (clauses.length > 0) {
      clauses.forEach(c => {
        clausesHTML += `
          <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-card); border-radius: 6px; padding: 10px 12px;">
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
            <span>고객사: <strong style="color: var(--text-light);">${doc.customer}</strong></span>
            <span>|</span>
            <span>코드: <strong style="color: var(--text-light);">${doc.doc_code}</strong></span>
            <span>|</span>
            <span>최종 개정일: <strong style="color: var(--text-light);">${doc.revision_date}</strong></span>
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
          <div style="background: rgba(255,255,255,0.01); border: 1px solid var(--border-card); border-radius: 8px; padding: 14px;">
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
                <p style="margin: 0; line-height: 1.5; color: #ef4444; font-weight: 500;">${trans.quality_defect_risk || '원재료 가황 미달 시 타이어 기포 및 고속 주행 시 외관 버스트(Burst) 유발 위험성 급증.'}</p>
              </div>
              <div style="border-top: 1px dashed var(--border-card); padding-top: 8px;">
                <strong style="color: var(--text-primary); display: block; margin-bottom: 3px;">작업표준 개정 가이드라인 (SOP Action Guide):</strong>
                <p style="margin: 0; line-height: 1.5; color: var(--text-light);">${trans.action_sop_guide || '공장 가황 공정 표준서(SOP-CUR-04) 상의 가열 압력 한계 조건 범위 개정 반영.'}</p>
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
      this.state.auditFindings.forEach(item => {
        const text = [
          item.POINT_OUT || '',
          item.ROOT_CAUSE_ANALYSIS || '',
          item.COUNTER_MEASURE || '',
          item.SUBJECT || ''
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

    // Findings 미결: STATUS === 'On-going'
    const findingsUnresolved = (this.state.auditFindings || []).filter(item => {
      if (plantCode !== 'ALL' && item.PLANT !== plantCode) return false;
      if (customer !== 'ALL' && (item.CAR_MAKER || '').toLowerCase() !== customer.toLowerCase()) return false;
      if (process !== 'ALL' && item._mappedProcess !== process) return false;
      return item.STATUS === 'On-going';
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
    console.log("📊 Rendering Premium Risk Dashboard...");
    
    // ------------------------------------------------------------------------
    // [1] 필터링 기반 KPI 연산 및 수려한 게이지 바 동적 렌더링
    // ------------------------------------------------------------------------
    const qiFiltered = this.getFilteredEvents('qi');
    const qiUnresolved = qiFiltered.filter(item => item.STATUS === 'On-going').length;
    const qiResolved = qiFiltered.filter(item => item.STATUS === 'Closed').length;
    const qiTotal = qiFiltered.length;
    const qiRate = qiTotal > 0 ? (qiResolved / qiTotal) * 100 : 100;

    const m4Filtered = this.getFilteredEvents('4m');
    const m4Unresolved = m4Filtered.filter(item => item.PROGRESS === 'On-going').length;
    const m4Resolved = m4Filtered.filter(item => item.PROGRESS === 'Complete').length;
    const m4Total = m4Filtered.length;
    const m4Rate = m4Total > 0 ? (m4Resolved / m4Total) * 100 : 100;

    const findingsFiltered = this.getFilteredEvents('findings');
    const findingsUnresolved = findingsFiltered.filter(item => item.STATUS === 'On-going').length;
    const findingsResolved = findingsFiltered.filter(item => item.STATUS === 'Closed').length;
    const findingsTotal = findingsFiltered.length;
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
          <span style="font-size: 32px; font-weight: 800; color: var(--text-light); font-family: monospace;">${totalUnresolved}</span>
          <span style="font-size: 13px; color: var(--text-secondary); font-weight: 500;">건 미결</span>
        </div>
        <div style="margin-top: 10px; width: 100%;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; font-size: 11px;">
            <span style="color: var(--text-muted); font-weight: 500;">종합 종결 관리 진행률</span>
            <span style="color: #00c8ff; font-weight: 700;">${totalRate.toFixed(1)}%</span>
          </div>
          <div style="width: 100%; height: 5px; background: rgba(255,255,255,0.04); border-radius: 3px; overflow: hidden; border: 1px solid var(--border-card);">
            <div style="width: ${totalRate}%; height: 100%; background: linear-gradient(90deg, #3b82f6, #00c8ff); border-radius: 3px;"></div>
          </div>
        </div>
      `;
      kpiTotalSub.innerHTML = `
        <span style="color: var(--text-muted); font-size: 12px;">전체 누적 건수: <strong>${totalCount}건</strong> (해결 완료 ${totalResolved}건)</span>
      `;
    }

    // ② KPI 2: 미해결 품질 이슈 (QI)
    const kpiQiVal = document.getElementById('kpi-qi-unresolved-val');
    const kpiQiSub = document.getElementById('kpi-qi-unresolved-sub');
    if (kpiQiVal && kpiQiSub) {
      kpiQiVal.innerHTML = `
        <div style="display: flex; align-items: baseline; gap: 4px;">
          <span style="font-size: 32px; font-weight: 800; color: var(--text-light); font-family: monospace;">${qiUnresolved}</span>
          <span style="font-size: 13px; color: var(--text-secondary); font-weight: 500;">건 미결</span>
        </div>
        <div style="margin-top: 10px; width: 100%;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; font-size: 11px;">
            <span style="color: var(--text-muted); font-weight: 500;">품질 이슈 해결 처리율</span>
            <span style="color: #ef4444; font-weight: 700;">${qiRate.toFixed(1)}%</span>
          </div>
          <div style="width: 100%; height: 5px; background: rgba(255,255,255,0.04); border-radius: 3px; overflow: hidden; border: 1px solid var(--border-card);">
            <div style="width: ${qiRate}%; height: 100%; background: linear-gradient(90deg, #ef4444, #ff7b72); border-radius: 3px;"></div>
          </div>
        </div>
      `;
      kpiQiSub.innerHTML = `
        <span style="color: var(--text-muted); font-size: 12px;">품질 이슈 총량: <strong>${qiTotal}건</strong> (종결완료 ${qiResolved}건)</span>
      `;
    }

    // ③ KPI 3: 미점검 4M 변경점
    const kpi4mVal = document.getElementById('kpi-4m-unresolved-val');
    const kpi4mSub = document.getElementById('kpi-4m-unresolved-sub');
    if (kpi4mVal && kpi4mSub) {
      kpi4mVal.innerHTML = `
        <div style="display: flex; align-items: baseline; gap: 4px;">
          <span style="font-size: 32px; font-weight: 800; color: var(--text-light); font-family: monospace;">${m4Unresolved}</span>
          <span style="font-size: 13px; color: var(--text-secondary); font-weight: 500;">건 On-going</span>
        </div>
        <div style="margin-top: 10px; width: 100%;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; font-size: 11px;">
            <span style="color: var(--text-muted); font-weight: 500;">공정 변경 안정화 점검률</span>
            <span style="color: #f59e0b; font-weight: 700;">${m4Rate.toFixed(1)}%</span>
          </div>
          <div style="width: 100%; height: 5px; background: rgba(255,255,255,0.04); border-radius: 3px; overflow: hidden; border: 1px solid var(--border-card);">
            <div style="width: ${m4Rate}%; height: 100%; background: linear-gradient(90deg, #f59e0b, #fbbf24); border-radius: 3px;"></div>
          </div>
        </div>
      `;
      kpi4mSub.innerHTML = `
        <span style="color: var(--text-muted); font-size: 12px;">공정 변경 신청: <strong>${m4Total}건</strong> (점검완료 ${m4Resolved}건)</span>
      `;
    }

    // ④ KPI 4: 과거 감사 미해결 지적
    const kpiAuditVal = document.getElementById('kpi-audit-unresolved-val');
    const kpiAuditSub = document.getElementById('kpi-audit-unresolved-sub');
    if (kpiAuditVal && kpiAuditSub) {
      kpiAuditVal.innerHTML = `
        <div style="display: flex; align-items: baseline; gap: 4px;">
          <span style="font-size: 32px; font-weight: 800; color: var(--text-light); font-family: monospace;">${findingsUnresolved}</span>
          <span style="font-size: 13px; color: var(--text-secondary); font-weight: 500;">건 미결</span>
        </div>
        <div style="margin-top: 10px; width: 100%;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; font-size: 11px;">
            <span style="color: var(--text-muted); font-weight: 500;">지적 대책 수립 조치율</span>
            <span style="color: #a855f7; font-weight: 700;">${findingsRate.toFixed(1)}%</span>
          </div>
          <div style="width: 100%; height: 5px; background: rgba(255,255,255,0.04); border-radius: 3px; overflow: hidden; border: 1px solid var(--border-card);">
            <div style="width: ${findingsRate}%; height: 100%; background: linear-gradient(90deg, #a855f7, #c084fc); border-radius: 3px;"></div>
          </div>
        </div>
      `;
      kpiAuditSub.innerHTML = `
        <span style="color: var(--text-muted); font-size: 12px;">지적 조항 수량: <strong>${findingsTotal}건</strong> (조치종결 ${findingsResolved}건)</span>
      `;
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

        const scoreDetails = this.calculatePlantRiskScore(activePlantCode, this.state.selectedCustomer, this.state.selectedProcess);
        
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
                  color: 'rgba(255, 255, 255, 0.8)',
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
        const scores = plants.map(p => this.calculatePlantRiskScore(p, this.state.selectedCustomer, this.state.selectedProcess).score);

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
                ticks: { color: 'rgba(255,255,255,0.6)', font: { size: 11, family: 'Pretendard' } }
              },
              y: {
                min: 0,
                max: 5.0,
                grid: { color: 'rgba(255,255,255,0.04)' },
                ticks: { color: 'rgba(255,255,255,0.6)', font: { size: 10, family: 'monospace' }, stepSize: 1 }
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
        const res = this.calculatePlantRiskScore(this.state.selectedPlant, this.state.selectedCustomer, proc.code);
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
              grid: { color: 'rgba(255,255,255,0.04)' },
              ticks: { color: 'rgba(255,255,255,0.6)', font: { size: 10, family: 'monospace' } }
            },
            y: {
              grid: { display: false },
              ticks: { color: 'rgba(255,255,255,0.8)', font: { size: 11, family: 'Pretendard', weight: '600' } }
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
        // 만약 특정 공장 필터가 켜져 있으면 해당 공장만 스캔
        if (this.state.selectedPlant !== 'ALL' && pCode !== this.state.selectedPlant) return;

        allProcessEntities.forEach(proc => {
          // 만약 특정 공정 필터가 켜져 있으면 해당 공정만 스캔
          if (this.state.selectedProcess !== 'ALL' && proc.code !== this.state.selectedProcess) return;

          const res = this.calculatePlantRiskScore(pCode, this.state.selectedCustomer, proc.code);
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
    inputNode.value = '';
    
    // 자동 스크롤 하단 안착
    msgContainer.scrollTop = msgContainer.scrollHeight;

    // 2. 우아한 3도트 타이핑 로딩 애니메이션 (Typing Indicator) 연출
    const typingId = `typing-${Date.now()}`;
    const typingHTML = `
      <div class="message message-bot" id="${typingId}">
        <div class="message-content" style="display: flex; align-items: center; gap: 4px; padding: 10px 14px;">
          <span style="font-size: 12px; color: var(--text-secondary); font-style: italic;">추론 중</span>
          <span class="typing-dot" style="width: 4px; height: 4px; background: var(--brand-blue); border-radius: 50%; animation: pulse 1s infinite 0s;"></span>
          <span class="typing-dot" style="width: 4px; height: 4px; background: var(--brand-blue); border-radius: 50%; animation: pulse 1s infinite 0.2s;"></span>
          <span class="typing-dot" style="width: 4px; height: 4px; background: var(--brand-blue); border-radius: 50%; animation: pulse 1s infinite 0.4s;"></span>
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

    // 7. 글로벌 필터 조작 이벤트 바인딩 (Phase 1)
    const filterPlant = document.getElementById('filter-plant');
    const filterCustomer = document.getElementById('filter-customer');
    const filterProcess = document.getElementById('filter-process');
    const btnResetFilters = document.getElementById('btn-reset-filters');

    if (filterPlant) {
      filterPlant.addEventListener('change', (e) => {
        this.state.selectedPlant = e.target.value;
        console.log(`[Global Filter] Plant Changed: ${this.state.selectedPlant}`);
        this.showToast(`대상 공장이 ${e.target.options[e.target.selectedIndex].text}(으)로 필터링되었습니다.`);
        this.onGlobalFilterChange();
      });
    }

    if (filterCustomer) {
      filterCustomer.addEventListener('change', (e) => {
        this.state.selectedCustomer = e.target.value;
        console.log(`[Global Filter] Customer Changed: ${this.state.selectedCustomer}`);
        this.showToast(`고객사가 ${e.target.value === 'ALL' ? '전체 고객사' : e.target.value}(으)로 필터링되었습니다.`);
        this.onGlobalFilterChange();
      });
    }

    if (filterProcess) {
      filterProcess.addEventListener('change', (e) => {
        this.state.selectedProcess = e.target.value;
        console.log(`[Global Filter] Process Changed: ${this.state.selectedProcess}`);
        this.showToast(`제조 공정이 ${e.target.options[e.target.selectedIndex].text}(으)로 필터링되었습니다.`);
        this.onGlobalFilterChange();
      });
    }

    if (btnResetFilters) {
      btnResetFilters.addEventListener('click', () => {
        this.state.selectedPlant = 'ALL';
        this.state.selectedCustomer = 'ALL';
        this.state.selectedProcess = 'ALL';
        
        if (filterPlant) filterPlant.value = 'ALL';
        if (filterCustomer) filterCustomer.value = 'ALL';
        if (filterProcess) filterProcess.value = 'ALL';
        
        console.log(`[Global Filter] Filters Reset to ALL`);
        this.showToast('모든 글로벌 필터가 초기화되었습니다.', 'success');
        this.onGlobalFilterChange();
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
      this.renderProcessSummary();
      this.renderChecklistTable();
      this.renderDocumentLibrary();
      this.renderRequirementMapping();
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
  }
};

// 브라우저 DOM 로드 완료 시 구동
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
