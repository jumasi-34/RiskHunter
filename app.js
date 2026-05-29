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
    plantRiskActivePlant: 'DP', // Phase 4 활성 공장 기본값
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

      // Phase 4 공장별 지적사항 데이터 복구 및 영속 세팅
      this.loadPlantRiskActionData();

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
    } else if (tabId === 'admin-settings') {
      this.initAdminSettings();
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
      ddaySubNode.innerHTML = `<span style="font-size: 11.5px; color: var(--text-muted-light);">수검 확정일: <strong>${audit.date}</strong></span>`;
    }

    const totalValNode = document.getElementById('planning-kpi-total');
    if (totalValNode) {
      totalValNode.innerHTML = `<span class="kpi-val" style="font-size: 32px; font-weight: 800; font-family: monospace;">${totalTasks}</span><span style="font-size: 13px; color: var(--text-secondary); margin-left: 4px;">개</span>`;
    }

    const completedValNode = document.getElementById('planning-kpi-completed');
    const completedSubNode = document.getElementById('planning-kpi-completed-sub');
    if (completedValNode && completedSubNode) {
      completedValNode.innerHTML = `<span class="kpi-val" style="font-size: 32px; font-weight: 800; color: #10b981; font-family: monospace;">${completedCount}</span><span style="font-size: 13px; color: var(--text-secondary); margin-left: 4px;">개</span>`;
      completedSubNode.innerHTML = `<span style="font-size: 11.5px; color: var(--text-muted-light);">대비 달성율: <strong style="color: #10b981;">${completionRate.toFixed(0)}%</strong></span>`;
    }

    const progressValNode = document.getElementById('planning-kpi-progress');
    const progressSubNode = document.getElementById('planning-kpi-progress-sub');
    if (progressValNode && progressSubNode) {
      progressValNode.innerHTML = `<span class="kpi-val" style="font-size: 32px; font-weight: 800; color: #3b82f6; font-family: monospace;">${inProgressCount}</span><span style="font-size: 13px; color: var(--text-secondary); margin-left: 4px;">개</span>`;
      progressSubNode.innerHTML = `<span style="font-size: 11.5px; color: var(--text-muted-light);">부서 조치 및 검토 단계</span>`;
    }

    const delayedValNode = document.getElementById('planning-kpi-delayed');
    const delayedSubNode = document.getElementById('planning-kpi-delayed-sub');
    if (delayedValNode && delayedSubNode) {
      delayedValNode.innerHTML = `<span class="kpi-val" style="font-size: 32px; font-weight: 800; color: ${delayedCount > 0 ? '#ef4444' : 'var(--text-muted-light)'}; font-family: monospace;">${delayedCount}</span><span style="font-size: 13px; color: var(--text-secondary); margin-left: 4px;">개</span>`;
      delayedSubNode.innerHTML = `<span style="font-size: 11.5px; color: var(--text-muted-light);">${delayedCount > 0 ? '<strong style="color: #ef4444;">조치 지연 리스크 감지</strong>' : '일정 지연 없음 (양호)'}</span>`;
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

    const plantName = (this.state.commonCodes?.plants || []).find(p => p.code === plant)?.name || plant;
    this.logAction(null, `신규 Audit 일정 등록: [${plantName}] ${title} (${date}, 담당: ${lead})`, 'action');

    // 5. 화면 동기화 리렌더링
    this.initAuditPlanning();
  },

  // ==========================================================================
  // 🏭 3. Plant Risk & Action (공장별 Risk 및 사후 조치 입력 핵심 구현 - Phase 4)
  // ==========================================================================

  // 1) 로컬 저장소(localStorage)에서 Findings 상태 복구 및 데이터 보존
  loadPlantRiskActionData() {
    console.log("🏭 Initializing Plant Risk & Action local data...");
    const storedFindings = localStorage.getItem('riskhunter_findings');
    if (storedFindings) {
      try {
        this.state.auditFindings = JSON.parse(storedFindings);
        console.log(`🏭 Restored ${this.state.auditFindings.length} findings from localStorage.`);
      } catch (e) {
        console.error("Failed to parse findings from localStorage", e);
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

    // 신규 지적사항 등록 버튼 바인딩 (이벤트 누적 방지용 onclick 오버라이트)
    const btnSaveFinding = document.getElementById('btn-save-finding');
    if (btnSaveFinding) {
      btnSaveFinding.onclick = (e) => {
        e.preventDefault();
        this.saveFinding();
      };
    }

    // 화면 첫 렌더링
    this.renderPlantRiskScreen();
  },

  // 3) 전체 리스크 화면 통합 렌더러
  renderPlantRiskScreen() {
    console.log("🏭 Rendering Plant Risk Screen...");

    // 글로벌 필터 selectedPlant가 'ALL'이 아니면 해당 공장을 강제 활성 공장으로 싱크
    if (this.state.selectedPlant && this.state.selectedPlant !== 'ALL') {
      this.state.plantRiskActivePlant = this.state.selectedPlant;
    }

    const activePlantCode = this.state.plantRiskActivePlant || 'DP';

    // 1. 공장별 리스크 매트릭스 카드 리스트 렌더링
    this.renderPlantRiskMatrix(activePlantCode);

    // 2. 과거 3개년 오디트 이력 타임라인 렌더링
    this.renderPlantAuditHistory(activePlantCode);

    // 3. 부적합 및 지적사항 조치 현황 보드 테이블 렌더링
    this.renderCorrectiveActionBoard(activePlantCode);

    // 4. 아이콘 다시 드로잉
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  },

  // ① 공장별 리스크 매트릭스 리스트 렌더링 함수
  renderPlantRiskMatrix(activePlantCode) {
    const listContainer = document.getElementById('plant-risk-matrix-list');
    if (!listContainer) return;

    listContainer.innerHTML = '';
    const actualPlants = (this.state.commonCodes.plants || []).filter(p => p.code !== 'ALL');

    actualPlants.forEach(plant => {
      const scoreDetails = this.calculatePlantRiskScore(plant.code, 'ALL', 'ALL');
      const totalUnresolved = scoreDetails.qiCount + scoreDetails.m4Count + scoreDetails.findingsCount;
      const isSelected = plant.code === activePlantCode;

      // 점수별 프리미엄 HSL 테마 매칭
      let barColor = 'var(--brand-blue)';
      let shadowGlow = 'none';

      if (scoreDetails.score >= 3.5) {
        barColor = 'var(--accent-red)';
        shadowGlow = '0 0 12px rgba(239, 68, 68, 0.2)';
      } else if (scoreDetails.score >= 2.0) {
        barColor = 'var(--accent-orange)';
        shadowGlow = '0 0 8px rgba(249, 115, 22, 0.15)';
      }

      const card = document.createElement('div');
      card.className = `card-clickable flex-row ${isSelected ? 'active-card' : ''}`;
      card.style.cssText = `
        padding: 12px 16px;
        border-radius: 8px;
        background: ${isSelected ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.03)'};
        border: 1px solid ${isSelected ? 'var(--accent-red)' : 'var(--border-card)'};
        cursor: pointer;
        transition: all 0.2s ease-in-out;
        box-shadow: ${isSelected ? shadowGlow : 'none'};
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 15px;
      `;

      const barPercent = Math.min(100, Math.round(scoreDetails.score * 20));

      card.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 4px; flex-grow: 1;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 14px; font-weight: 700; color: var(--text-primary);">${plant.name}</span>
              <span style="font-size: 10px; font-weight: 700; color: var(--text-secondary); background: rgba(255,255,255,0.06); padding: 2px 6px; border-radius: 4px;">${plant.code}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 11px; color: var(--text-secondary);">미결 리스크: <strong style="color: ${totalUnresolved > 0 ? '#ef4444' : 'var(--text-secondary)'}; font-weight: 700;">${totalUnresolved}</strong>건</span>
            </div>
          </div>
          <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.08); border-radius: 3px; overflow: hidden; margin-top: 4px;">
            <div style="width: ${barPercent}%; height: 100%; background: ${barColor}; border-radius: 3px; transition: width 0.4s ease;"></div>
          </div>
        </div>
        <div style="text-align: right; min-width: 65px; display: flex; flex-direction: column; align-items: flex-end; justify-content: center;">
          <span style="font-size: 10px; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Risk Score</span>
          <span style="font-size: 20px; font-weight: 800; color: ${barColor}; font-family: monospace; line-height: 1.1;">${scoreDetails.score.toFixed(1)}</span>
        </div>
      `;

      card.onclick = () => {
        this.state.plantRiskActivePlant = plant.code;
        this.state.selectedPlant = plant.code;

        // 글로벌 드롭다운 필터 요소에도 값 매핑
        const filterPlant = document.getElementById('filter-plant');
        if (filterPlant) {
          filterPlant.value = plant.code;
        }

        this.showToast(`활성 공장이 ${plant.name}(으)로 전환되었습니다.`, 'info');
        this.onGlobalFilterChange();
      };

      listContainer.appendChild(card);
    });
  },

  // ② 공장 과거 3개년 감사 이력 연대기 렌더링 함수
  renderPlantAuditHistory(activePlantCode) {
    const timelineBox = document.getElementById('plant-history-timeline-box');
    const titleNode = document.getElementById('plant-history-title');
    if (!timelineBox) return;

    const plantName = (this.state.commonCodes.plants || []).find(p => p.code === activePlantCode)?.name || activePlantCode;
    if (titleNode) {
      titleNode.textContent = `${plantName} 과거 감사 이력 (Plant Audit History)`;
    }

    timelineBox.innerHTML = '';

    const histories = {
      "DP": [
        { year: "2025", grade: "A Grade", score: "94점", title: "BMW VDA 6.3 정기 양산 수검 통과", desc: "배합 및 가류 특수 공정 관리 상태 실사 우수 판정. 벤트핀 세정 지침 우수 가동 확인." },
        { year: "2024", grade: "B Grade", score: "86점", title: "Audi 신차 인증 프로세스 감사 수검", desc: "2건의 미결 시정조치 조건부 통과. 그린타이어 드럼 정밀 세정 주기 누락 지적 후 종결." },
        { year: "2023", grade: "A Grade", score: "92점", title: "Mercedes-Benz 공급선 특별 실사", desc: "혼련 공정 원재료 선입선출 자동 모니터링 시스템 최고 등급 부여 합격." }
      ],
      "KP": [
        { year: "2025", grade: "B Grade", score: "88점", title: "Porsche 초고성능 타이어 공급선 수검", desc: "비드 권취 와이어 장력 관리 오차 개선 권고 수령. 1건 미결 상태로 보완 진행 중." },
        { year: "2024", grade: "A Grade", score: "95점", title: "Hyundai/Kia 전사 품질 정기 평가 수검", desc: "성형 공정 이설 관련 4M 변경 관리 절차 완벽 준수 통과 및 벤치마킹 우수 사례 선정." },
        { year: "2023", grade: "B Grade", score: "84점", title: "제3자 IATF 16949 사후 프로세스 수검", desc: "검사 공정 불합격 타이어 물리 격리 및 라벨 누락 지적 사항 수령 후 보완 완료." }
      ],
      "JP": [
        { year: "2025", grade: "A Grade", score: "91점", title: "Tesla 아시아 서플라이어 품질 실사", desc: "실란트 도포 공정 두께 제어 모니터링 및 실시간 비전 검사 정합성 우수 판정 통과." },
        { year: "2024", grade: "A Grade", score: "93점", title: "BMW 중국 내수 합작사 현장 프로세스 감사", desc: "재작업(Re-work) 표준 게시 및 오퍼레이터 이력 이관 절차 승인 획득 통과." },
        { year: "2023", grade: "B Grade", score: "87점", title: "Hyundai 중국 생산공장 합동 점검", desc: "재단 공정 반제품 보존 온도 센서 관리 미흡 지적 수령 후 SOP 긴급 보완 종결." }
      ],
      "HP": [
        { year: "2025", grade: "A Grade", score: "92점", title: "Volkswagen 친환경 전용 타이어 프로세스 감사", desc: "가류기 블래더 가열 압력 기록 자동화 정밀 관리 상태 우수 합격." },
        { year: "2024", grade: "B Grade", score: "85점", title: "Kia 아시아 공장 정기 프로세스 수검", desc: "배합 컴파운드 보관 습도 센서 오차 보정 지연 지적에 따라 검교정 성적서 이관 후 보완 통과." },
        { year: "2023", grade: "A Grade", score: "90점", title: "제3자 VDA 6.3 정기 인증 획득 수검", desc: "인장 강도 정밀 시험실 온습도 자동 통제 시스템 신규 장착으로 최고 등급 달성." }
      ],
      "CP": [
        { year: "2025", grade: "B Grade", score: "86점", title: "Ford 중국 공업지구 정기 사후 감사", desc: "원재료 수입검사 실물 COA 이관 정합성 확인. 1건 미결 지적사항 대응 조치 가동 중." },
        { year: "2024", grade: "A Grade", score: "90점", title: "Hyundai 중경 합작사 신차 수검 통과", desc: "트레드 압출 온도 자동 로깅 프로파일 장치 수검 우수 판정." },
        { year: "2023", grade: "B Grade", score: "83점", title: "중국 내수 유통 공급 품질 정기 심사", desc: "완제품 물류창고 선입선출 바코드 리더 오동작 지적 수령 후 시스템 일제 교체 종결." }
      ],
      "MP": [
        { year: "2025", grade: "A Grade", score: "96점", title: "BMW 헝가리공장 신규 EV 납품 수검", desc: "폼(Foam) 흡음재 접착 공정 자동 모니터링 및 실시간 비전 정밀 매칭 우수 사례 선정 최고 등급 통과." },
        { year: "2024", grade: "A Grade", score: "94점", title: "Audi 유럽 본사 특별 공정 프로세스 감사", desc: "가류 벤트핀 정밀 점검 및 금형 주간 세정 자동 일지 연동 최고 등급 통과." },
        { year: "2023", grade: "B Grade", score: "89점", title: "Mercedes-Benz 유럽공장 프로세스 심사", desc: "배합 평량실 투입 오일 필터 막힘 모니터링 가이드 지적 수령 후 영구 개선안 종결." }
      ],
      "IP": [
        { year: "2025", grade: "B Grade", score: "87점", title: "Toyota 아시아 공장 정기 종합 감사", desc: "수입검사 자재 샘플링 검증 프로세스 이관 누락 지적 수령 후 OCAP 보완 조치 조건부 통과." },
        { year: "2024", grade: "A Grade", score: "91점", title: "제3자 ISO 9001 정기 갱신 프로세스 심사", desc: "품질 보증 교육 훈련 일지 및 사내 오디터 R&R 자격 정합성 우수 판정 통과." },
        { year: "2023", grade: "B Grade", score: "85점", title: "동남아 현지 완성차 정기 감사 수검", desc: "압출 반제품 표면 이물질 블로어 센서 오작동 지적 수령 후 설비 보전 완료." }
      ],
      "TP": [
        { year: "2025", grade: "A Grade", score: "93점", title: "Tesla 북미향 전기차 전용 타이어 실사", desc: "폼(Foam) 흡음재 자동 정밀 도포 공정 및 인장 강도 접착 정밀 센서 모니터링 우수 판정 통과." },
        { year: "2024", grade: "B Grade", score: "88점", title: "GM 북미 본사 정기 공급선 실사 수검", desc: "Mixing 공정 투입 오일 레벨 센서 오차 지적 수령 후 자동 체크리스트 보완으로 통과." },
        { year: "2023", grade: "A Grade", score: "92점", title: "제3자 VDA 6.3 정기 심사 통과", desc: "검사 공정 균일도(Uniformity) 시험 장비 일일 정밀 검교정 프로세스 우수 판정." }
      ]
    };

    const data = histories[activePlantCode] || [];

    if (data.length === 0) {
      timelineBox.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--text-secondary); font-size: 13px;">
          <i data-lucide="calendar-off" style="width: 28px; height: 28px; margin-bottom: 8px;"></i>
          <span>선택한 공장의 과거 감사 데이터가 존재하지 않습니다.</span>
        </div>
      `;
      return;
    }

    const timelineList = document.createElement('div');
    timelineList.style.cssText = `
      position: relative;
      padding-left: 20px;
      margin-left: 8px;
      border-left: 1.5px solid rgba(255, 255, 255, 0.08);
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding-top: 10px;
      padding-bottom: 10px;
    `;

    data.forEach((item, index) => {
      const node = document.createElement('div');
      node.style.cssText = `position: relative;`;

      const dotColor = index === 0 ? 'var(--brand-blue)' : 'rgba(255,255,255,0.2)';
      const dotGlow = index === 0 ? 'box-shadow: 0 0 10px var(--brand-blue); border: 2px solid var(--text-primary);' : 'border: 2px solid rgba(255,255,255,0.1);';

      node.innerHTML = `
        <div style="
          position: absolute;
          left: -27px;
          top: 3px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: ${dotColor};
          ${dotGlow}
          z-index: 2;
        "></div>
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 4px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 15px; font-weight: 800; color: var(--text-primary); font-family: monospace;">${item.year}</span>
              <span style="font-size: 12.5px; font-weight: 700; color: var(--brand-blue);">${item.title}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 10px; font-weight: 700; background: rgba(0, 200, 255, 0.08); color: var(--brand-blue); border: 1px solid rgba(0, 200, 255, 0.2); padding: 1px 6px; border-radius: 4px;">${item.score}</span>
              <span style="font-size: 10px; font-weight: 700; background: rgba(239, 68, 68, 0.08); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); padding: 1px 6px; border-radius: 4px;">${item.grade}</span>
            </div>
          </div>
          <p style="font-size: 11.5px; color: var(--text-secondary); line-height: 1.5; margin: 2px 0 0 0;">${item.desc}</p>
        </div>
      `;
      timelineList.appendChild(node);
    });

    timelineBox.appendChild(timelineList);
  },

  // ③ 활성 공장 지적사항 테이블 렌더링 함수
  renderCorrectiveActionBoard(activePlantCode) {
    const tableBox = document.getElementById('action-board-table-box');
    const badgeNode = document.getElementById('action-board-plant-badge');
    if (!tableBox) return;

    const plantName = (this.state.commonCodes.plants || []).find(p => p.code === activePlantCode)?.name || activePlantCode;
    if (badgeNode) {
      badgeNode.textContent = `활성 공장: ${plantName} (${activePlantCode})`;
    }

    tableBox.innerHTML = '';

    const filteredFindings = (this.state.auditFindings || []).filter(item => item.PLANT === activePlantCode);

    if (filteredFindings.length === 0) {
      tableBox.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 250px; color: var(--text-secondary); font-size: 13px; border: 1px dashed var(--border-card); border-radius: 8px; margin: 15px; background: rgba(255,255,255,0.01);">
          <i data-lucide="shield-check" style="width: 32px; height: 32px; color: var(--brand-blue); margin-bottom: 8px;"></i>
          <span style="font-weight: 700; color: var(--text-primary);">지적사항 및 부적합 사항이 존재하지 않습니다.</span>
          <span style="font-size: 11px; margin-top: 4px;">해당 공장은 완벽히 안전 등급의 수검 상태를 유지하고 있습니다.</span>
        </div>
      `;
      return;
    }

    const tableWrapper = document.createElement('div');
    tableWrapper.className = 'table-responsive';
    tableWrapper.style.cssText = 'overflow-y: auto; max-height: 400px; padding: 2px;';

    const table = document.createElement('table');
    table.className = 'data-table';
    table.style.cssText = 'width: 100%; border-collapse: collapse; font-size: 12px;';

    table.innerHTML = `
      <thead>
        <tr style="border-bottom: 1px solid var(--border-card); background: rgba(255,255,255,0.02); position: sticky; top: 0; z-index: 10;">
          <th style="padding: 10px; font-weight: 600; color: var(--text-secondary); width: 140px;">관리번호</th>
          <th style="padding: 10px; font-weight: 600; color: var(--text-secondary); width: 85px;">고객사</th>
          <th style="padding: 10px; font-weight: 600; color: var(--text-secondary); width: 110px;">감사 구분</th>
          <th style="padding: 10px; font-weight: 600; color: var(--text-secondary); width: 110px;">연계 공정</th>
          <th style="padding: 10px; font-weight: 600; color: var(--text-secondary);">지적사항 제목 & 코멘트</th>
          <th style="padding: 10px; font-weight: 600; color: var(--text-secondary); width: 105px;">담당자</th>
          <th style="padding: 10px; font-weight: 600; color: var(--text-secondary); width: 95px; text-align: center;">조치 상태</th>
          <th style="padding: 10px; font-weight: 600; color: var(--text-secondary); width: 100px; text-align: center;">수동 제어</th>
        </tr>
      </thead>
      <tbody id="action-board-tbody"></tbody>
    `;

    tableWrapper.appendChild(table);
    tableBox.appendChild(tableWrapper);

    const tbody = table.querySelector('#action-board-tbody');

    filteredFindings.forEach((item, index) => {
      const isOngoing = item.STATUS === 'On-going';
      const tr = document.createElement('tr');
      tr.style.cssText = `
        border-bottom: 1px solid rgba(255,255,255,0.03);
        transition: background 0.15s;
        background: ${index % 2 === 1 ? 'rgba(255,255,255,0.005)' : 'none'};
      `;
      tr.onmouseenter = () => { tr.style.background = 'rgba(255,255,255,0.02)'; };
      tr.onmouseleave = () => { tr.style.background = index % 2 === 1 ? 'rgba(255,255,255,0.005)' : 'none'; };

      const fNo = item.DOC_NO || `FINDING-${index + 1}`;

      let statusBadge = '';
      if (isOngoing) {
        statusBadge = `
          <span class="badge badge-danger text-center animate-pulse" style="
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
            padding: 3px 8px;
            border-radius: 4px;
            font-weight: 700;
            background: rgba(239, 68, 68, 0.12);
            color: #ef4444;
            border: 1px solid rgba(239, 68, 68, 0.2);
            font-size: 11px;
          ">
            <span style="width: 6px; height: 6px; background: #ef4444; border-radius: 50%; display: inline-block;"></span>
            On-going
          </span>
        `;
      } else {
        statusBadge = `
          <span class="badge badge-success text-center" style="
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
            padding: 3px 8px;
            border-radius: 4px;
            font-weight: 700;
            background: rgba(16, 185, 129, 0.12);
            color: #10b981;
            border: 1px solid rgba(16, 185, 129, 0.2);
            font-size: 11px;
          ">
            <span style="width: 6px; height: 6px; background: #10b981; border-radius: 50%; display: inline-block;"></span>
            Closed
          </span>
        `;
      }

      let actionBtn = '';
      if (isOngoing) {
        actionBtn = `
          <button class="btn btn-secondary" style="
            padding: 4px 8px;
            font-size: 11px;
            display: inline-flex;
            align-items: center;
            gap: 4px;
            border-radius: 4px;
            cursor: pointer;
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.3);
            color: #10b981;
            transition: all 0.2s;
          " onmouseover="this.style.background='rgba(16, 185, 129, 0.2)'" onmouseout="this.style.background='rgba(16, 185, 129, 0.1)'">
            <i data-lucide="check-circle" style="width: 12px; height: 12px;"></i>
            조치 종결
          </button>
        `;
      } else {
        actionBtn = `
          <button class="btn btn-secondary" style="
            padding: 4px 8px;
            font-size: 11px;
            display: inline-flex;
            align-items: center;
            gap: 4px;
            border-radius: 4px;
            cursor: pointer;
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            color: #ef4444;
            transition: all 0.2s;
          " onmouseover="this.style.background='rgba(239, 68, 68, 0.2)'" onmouseout="this.style.background='rgba(239, 68, 68, 0.1)'">
            <i data-lucide="rotate-ccw" style="width: 12px; height: 12px;"></i>
            재오픈
          </button>
        `;
      }

      const procCode = item._mappedProcess || 'System';
      const procObj = (this.state.commonCodes.processes || []).find(p => p.code === procCode);
      const procName = procObj ? `${procObj.name} (${procCode})` : procCode;

      tr.innerHTML = `
        <td style="padding: 10px; font-weight: 700; color: var(--text-primary); font-family: monospace;">${fNo}</td>
        <td style="padding: 10px; font-weight: 600; color: var(--text-primary);">${item.CAR_MAKER || '-'}</td>
        <td style="padding: 10px; color: var(--text-secondary);">${item.TYPE || '-'}</td>
        <td style="padding: 10px;"><span style="font-size:11px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); padding:2px 6px; border-radius:4px; color:var(--text-primary);">${procName}</span></td>
        <td style="padding: 10px; line-height: 1.4;">
          <div style="font-weight: 700; color: var(--text-primary);">${item.SUBJECT || '-'}</div>
          <div style="font-size: 11px; color: var(--text-secondary); margin-top: 2px;">${item.POINT_OUT || '-'}</div>
        </td>
        <td style="padding: 10px; color: var(--text-primary); font-weight: 600;">${item.OWNER_ID || '-'}</td>
        <td style="padding: 10px; text-align: center;">${statusBadge}</td>
        <td style="padding: 10px; text-align: center;">${actionBtn}</td>
      `;

      const btn = tr.querySelector('button');
      if (btn) {
        btn.onclick = (e) => {
          e.preventDefault();
          this.toggleFindingStatus(fNo);
        };
      }

      tbody.appendChild(tr);
    });
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
      POINT_OUT: pointout,
      ROOT_CAUSE_ANALYSIS: rootcause,
      COUNTER_MEASURE: countermeasure
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

    this.showToast(`[${newDocNo}] 신규 지적사항이 기입되었으며, ${plant} 공장의 리스크가 즉시 상승 주입되었습니다!`, "success");
    
    const pName = (this.state.commonCodes?.plants || []).find(p => p.code === plant)?.name || plant;
    this.logAction(null, `신규 지적사항 등록: [${pName}] [${newDocNo}] ${subject} (담당: ${owner})`, 'action');

    this.onGlobalFilterChange();
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
        ? `border: 1.5px solid var(--brand-blue); box-shadow: 0 0 12px rgba(59, 130, 246, 0.25); background: rgba(59, 130, 246, 0.05);` 
        : `border: 1px solid var(--border-card); background: rgba(255, 255, 255, 0.01);`;

      const iconColor = isCardActive ? 'var(--brand-blue)' : 'var(--text-secondary)';

      cardsHTML += `
        <div class="process-summary-card" data-process-code="${cp.code}" style="min-width: 195px; width: 195px; flex-shrink: 0; padding: 12px; border-radius: 8px; cursor: pointer; transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1); ${cardStyle} display: flex; flex-direction: column; gap: 6px;">
          <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
            <span style="font-size: 11px; font-weight: 700; color: ${isCardActive ? 'var(--text-light)' : 'var(--text-secondary)'}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 125px;">${cp.label}</span>
            <i data-lucide="${cp.icon}" style="width: 14px; height: 14px; color: ${iconColor};"></i>
          </div>
          
          <div style="display: flex; align-items: baseline; gap: 4px; margin-top: 2px;">
            <span style="font-size: 18px; font-weight: 800; font-family: monospace; color: var(--text-primary);">${total}</span>
            <span style="font-size: 10px; color: var(--text-secondary);">개 조항</span>
          </div>

          <!-- 고위험 비중 정보 -->
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 10px;">
            <span style="color: #f87171; display: flex; align-items: center; gap: 2px;">
              <i data-lucide="alert-triangle" style="width: 10px; height: 10px;"></i>
              High ${high}건
            </span>
            <span style="color: var(--text-secondary); font-family: monospace;">비중 ${highRate}%</span>
          </div>

          <!-- 진척률 게이지 바 (기획 인디케이터 요건 준수) -->
          <div style="margin-top: 4px;">
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 9px; color: var(--text-secondary); margin-bottom: 3px;">
              <span>자체 점검 진척</span>
              <span style="font-weight: 700; color: var(--brand-blue);">${cp.progress}%</span>
            </div>
            <div style="width: 100%; height: 3px; background: rgba(255,255,255,0.05); border-radius: 2px; overflow: hidden;">
              <div style="width: ${cp.progress}%; height: 100%; background: ${isCardActive ? 'var(--brand-blue)' : '#10b981'}; border-radius: 2px; transition: width 0.3s ease;"></div>
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; width: 100%; gap: 14px;">
        
        <!-- 1. 상단 조정 행: 드롭다운 선택 필터 & 요약 수치 -->
        <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; gap: 16px; flex-wrap: wrap; border-bottom: 1px dashed rgba(255,255,255,0.05); padding-bottom: 12px;">
          <!-- 좌측: 드롭다운 선택상자 -->
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 12px; color: var(--text-secondary); font-weight: 600;">공정 빠른 탐색:</span>
            <select id="checklist-process-dropdown" class="filter-select" style="min-width: 250px; font-size: 12px; background: rgba(255,255,255,0.03); border: 1px solid var(--border-card); border-radius: 6px; padding: 5px 10px; color: var(--text-primary); cursor: pointer; outline: none; transition: border-color 0.2s;">
              ${optionsHTML}
            </select>
          </div>
          
          <!-- 우측: 선택된 공정의 요약 지표 보드 -->
          <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            <div style="font-size: 11px; color: var(--text-secondary);">
              현재 선택: <strong style="color: var(--brand-blue); font-size: 12px;">${dispLabel}</strong>
            </div>
            
            <div style="background: rgba(255, 255, 255, 0.01); border: 1px solid var(--border-card); border-radius: 4px; padding: 4px 10px; display: flex; align-items: center; gap: 6px; font-size: 11px;">
              <span style="color: var(--text-secondary);">총 반영 조항 수</span>
              <span style="font-weight: 700; color: var(--text-primary); font-family: monospace;">${dispTotal}건</span>
            </div>

            <div style="background: rgba(239, 68, 68, 0.02); border: 1px solid rgba(239, 68, 68, 0.12); border-radius: 4px; padding: 4px 10px; display: flex; align-items: center; gap: 6px; font-size: 11px;">
              <span style="color: #ef4444; font-weight: 500;">고위험 (High)</span>
              <span style="font-weight: 700; color: #f87171; font-family: monospace; display: flex; align-items: center; gap: 3px;">
                <i data-lucide="alert-triangle" style="width: 11px; height: 11px;"></i>
                ${dispHigh}건
              </span>
            </div>
          </div>
        </div>

        <!-- 2. 하단 조정 행: 미학적 가로 스크롤 글래스모피즘 공정 요약 보드 (수치 및 진척 인디케이터 장착) -->
        <div id="checklist-horizontal-scroll-board" style="display: flex; gap: 12px; overflow-x: auto; width: 100%; padding-bottom: 6px; scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.08) transparent;">
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
    this.logAction(null, `플로팅 AI 챗봇 비서 질의: "${message.substring(0, 30)}${message.length > 30 ? '...' : ''}"`, 'action');
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
        'admin': `<span class="popover-badge" style="background-color: #ff3b3015; color: #ff3b30; border: 1px solid #ff3b3030; font-size: 11px; padding: 2px 6px;">ADMIN</span>`,
        'manager': `<span class="popover-badge" style="background-color: #00c8ff15; color: #00c8ff; border: 1px solid #00c8ff30; font-size: 11px; padding: 2px 6px;">MANAGER</span>`,
        'viewer': `<span class="popover-badge" style="background-color: #a1a1a115; color: #a1a1a1; border: 1px solid #a1a1a130; font-size: 11px; padding: 2px 6px;">VIEWER</span>`
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
        <td style="padding: 14px 18px; font-weight: 600; color: var(--text-light); vertical-align: middle;">${row.category}</td>
        <td style="padding: 14px 18px; color: var(--text-primary); vertical-align: middle;">${row.detail}</td>
        <td style="padding: 14px 18px; text-align: center; vertical-align: middle;">
          <span style="font-weight: 700; color: ${row.admin === 'O' ? '#10b981' : '#ef4444'}; font-size: 15px;">${row.admin}</span>
        </td>
        <td style="padding: 14px 18px; text-align: center; vertical-align: middle;">
          <span style="font-weight: 700; color: ${row.manager === 'O' ? '#10b981' : '#ef4444'}; font-size: 15px;">${row.manager}</span>
        </td>
        <td style="padding: 14px 18px; text-align: center; vertical-align: middle;">
          <span style="font-weight: 700; color: ${row.user === 'O' ? '#10b981' : '#ef4444'}; font-size: 15px;">${row.user}</span>
        </td>
        <td style="padding: 14px 18px; text-align: center; vertical-align: middle;">
          <span style="font-weight: 700; color: ${row.viewer === 'O' ? '#10b981' : '#ef4444'}; font-size: 15px;">${row.viewer}</span>
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
        sql: 'SELECT DOC_NO, PLANT, PURPOSE, SUBJECT, STATUS, PROGRESS, REG_DATE, CHANGE_ITEM\nFROM change_history_4m\nWHERE PROGRESS = \'양산 적용 및 검증\'\nLIMIT 50;'
      },
      'T5': {
        title: '품질 실패 QI 미결(On-going) 이슈 조회',
        sql: 'SELECT DOC_NO, PLANT, OEM, VEH, OCC_DATE, STATUS, TYPE_NAME\nFROM quality_issues_qi\nWHERE STATUS = \'On-going\'\nLIMIT 50;'
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
    } else if (tableName === 'change_history_4m' || tableName === 'changehistory4m') {
      sourceData = this.state.changeHistory4m || [];
    } else if (tableName === 'document_library' || tableName === 'documentlibrary') {
      sourceData = this.state.documentLibrary || [];
    } else if (tableName === 'quality_issues_qi' || tableName === 'qualityissues') {
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

// 브라우저 DOM 로드 완료 시 구동
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
