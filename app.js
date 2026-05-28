/**
 * ==========================================================================
 * ⚙️ RiskHunter App Engine (Core JavaScript)
 * Phase 1: Data Loading & Common Resources Engine
 * ==========================================================================
 */

const app = {
  // 전역 애플리케이션 상태 (Global State)
  state: {
    currentTab: 'risk-assessment',
    currentUser: null,
    currentRole: 'admin', // 기본 역할: 최고관리자
    filters: {
      plant: 'ALL',
      customer: 'ALL',
      process: 'ALL'
    },
    // 가상 데이터베이스 (In-Memory Tables)
    db: {
      checklists: null,
      findings: null,
      changeHistory4m: null,
      documentLibrary: null,
      qualityIssues: null,
      users: null // 👥 사용자 마스터 DB 추가
    }
  },

  // 역할별 허용 메뉴 매핑 정의
  permissions: {
    admin: ['risk-assessment', 'oe-library', 'self-audit', 'ai-action', 'sql-console', 'audit-timeline'],
    manager: ['risk-assessment', 'oe-library', 'self-audit', 'ai-action', 'sql-console', 'audit-timeline'],
    viewer: ['risk-assessment', 'self-audit'] // 뷰어는 리스크 평가와 체크리스트만 접근 가능
  },

  // 초기화 핸들러 (Initialization)
  async init() {
    console.log("🏁 RiskHunter Core Engine Initializing...");
    
    // 1. Lucide SVG 아이콘 생성 및 바인딩
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    } else {
      console.warn("Lucide Icons Library is not loaded.");
    }

    // 2. [RBAC] 로컬 데이터 및 사용자 설정 초기화 선행
    await this.loadData();
    this.initUserSession();

    // 3. 이벤트 리스너 기본 바인딩
    this.bindEvents();
    
    // 4. 초기 탭 타이틀 싱크 및 롤 기반 메뉴 가드 렌더링
    this.applyPermissionToUI();
    this.updateHeader(this.state.currentTab);
    
    console.log("🚀 Phase 1 + RBAC: Core Engine Initialized!");
  },

  // 비동기 데이터 로딩 엔진 (Asynchronous Fetch Engine)
  async loadData() {
    console.log("🔄 Fetching static JSON data files into memory...");
    try {
      // 로컬 data/ 폴더 아래의 마스터 파일 경로 지정
      const paths = {
        checklists: 'data/audit_checklists.json',
        findings: 'data/audit_findings.json',
        changeHistory4m: 'data/change_history_4m.json',
        documentLibrary: 'data/document_library.json',
        qualityIssues: 'data/quality_issues_qi.json',
        users: 'data/users.json' // 👥 사용자 마스터 추가
      };

      // 6개 자원 병렬 비동기 fetch
      const [checklists, findings, changeHistory4m, documentLibrary, qualityIssues, users] = await Promise.all([
        fetch(paths.checklists).then(res => { 
          if (!res.ok) throw new Error(`[${res.status}] ${paths.checklists} 로드 실패`);
          return res.json(); 
        }),
        fetch(paths.findings).then(res => { 
          if (!res.ok) throw new Error(`[${res.status}] ${paths.findings} 로드 실패`);
          return res.json(); 
        }),
        fetch(paths.changeHistory4m).then(res => { 
          if (!res.ok) throw new Error(`[${res.status}] ${paths.changeHistory4m} 로드 실패`);
          return res.json(); 
        }),
        fetch(paths.documentLibrary).then(res => { 
          if (!res.ok) throw new Error(`[${res.status}] ${paths.documentLibrary} 로드 실패`);
          return res.json(); 
        }),
        fetch(paths.qualityIssues).then(res => { 
          if (!res.ok) throw new Error(`[${res.status}] ${paths.qualityIssues} 로드 실패`);
          return res.json(); 
        }),
        fetch(paths.users).then(res => { 
          if (!res.ok) throw new Error(`[${res.status}] ${paths.users} 로드 실패`);
          return res.json(); 
        })
      ]);

      // 클라이언트 메모리 가상 DB에 캐싱 적재
      this.state.db.checklists = checklists;
      this.state.db.findings = findings;
      this.state.db.changeHistory4m = changeHistory4m;
      this.state.db.documentLibrary = documentLibrary;
      this.state.db.qualityIssues = qualityIssues;
      this.state.db.users = users;

      console.log("✅ Client virtual DB cache loaded successfully!");
      console.log(` - Master Checklists: ${checklists.length} items`);
      console.log(` - Past Audit Findings: ${findings.length} items`);
      console.log(` - 4M Changes History: ${changeHistory4m.length} items`);
      console.log(` - OEM Document Library: ${documentLibrary.length} items`);
      console.log(` - Quality Failure (QI): ${qualityIssues.length} items`);
      console.log(` - User Registry DB: ${users.length} profiles`);

      // 글로벌 다이내믹 필터 셀렉터 옵션 초기화
      this.initFilters();

    } catch (error) {
      console.error("❌ Critical Resource Load Error:", error);
      this.showErrorBoundary(error);
    }
  },

  // 무장애 에러 바운더리 폴백 (Fallback Boundary UI)
  showErrorBoundary(error) {
    const errorOverlay = document.getElementById('error-boundary');
    const errorDetails = document.getElementById('error-details-text');
    if (errorOverlay && errorDetails) {
      errorDetails.textContent = error.toString() + "\n- 로컬 data/ 폴더 및 파일 명칭과 정합성을 대조해 주십시오.";
      errorOverlay.classList.remove('hidden');
    }
  },

  // 글로벌 공통 필터 동적 생성 (Common Resources Binding)
  initFilters() {
    console.log("⚙️ Binding common master resources to dynamic filters...");

    // [Context 2] 공통 Resource 컨텍스트 문서의 마스터 데이터 선언부
    const plants = [
      { code: 'ALL', name: 'ALL (전사 공통)' },
      { code: 'DP', name: 'DP (대전공장)' },
      { code: 'KP', name: 'KP (금산공장)' },
      { code: 'JP', name: 'JP (중국 가흥공장)' },
      { code: 'HP', name: 'HP (중국 강소공장)' },
      { code: 'CP', name: 'CP (중국 중경공장)' },
      { code: 'MP', name: 'MP (헝가리공장)' },
      { code: 'IP', name: 'IP (인도네시아공장)' },
      { code: 'TP', name: 'TP (미국 테네시공장)' }
    ];

    const customers = [
      { code: 'ALL', name: 'ALL (전체 OEM)' },
      { code: 'BMW', name: 'BMW' },
      { code: 'Audi', name: 'Audi' },
      { code: 'Hyundai', name: 'Hyundai / HKMC' },
      { code: 'GM', name: 'GM' },
      { code: 'Tesla', name: 'Tesla' },
      { code: 'Mercedes-Benz', name: 'Mercedes-Benz' }
    ];

    const processes = [
      { code: 'ALL', name: 'ALL (전체 공정)' },
      { code: 'Design', name: 'Design (설계/개발)' },
      { code: 'Test', name: 'Test (시험/검증)' },
      { code: 'Incoming', name: 'Incoming (수입검사)' },
      { code: 'Mixing', name: 'Mixing (배합)' },
      { code: 'Extrusion', name: 'Extrusion (압출)' },
      { code: 'Calendaring', name: 'Calendaring (캘린더링)' },
      { code: 'Cutting', name: 'Cutting (재단)' },
      { code: 'Bead', name: 'Bead (비드)' },
      { code: 'Building', name: 'Building (성형)' },
      { code: 'Curing', name: 'Curing (가류)' },
      { code: 'Re-work', name: 'Re-work (재작업)' },
      { code: 'Inspection', name: 'Inspection (검사)' },
      { code: 'Form', name: 'Form (폼)' },
      { code: 'Sealant', name: 'Sealant (실란트)' },
      { code: 'Logistics', name: 'Logistics (물류/창고)' },
      { code: 'System', name: 'System (품질 시스템)' }
    ];

    const plantSelect = document.getElementById('filter-plant');
    const customerSelect = document.getElementById('filter-customer');
    const processSelect = document.getElementById('filter-process');

    if (plantSelect) {
      plantSelect.innerHTML = plants.map(p => `<option value="${p.code}">${p.name}</option>`).join('');
      plantSelect.value = this.state.filters.plant;
    }

    if (customerSelect) {
      customerSelect.innerHTML = customers.map(c => `<option value="${c.code}">${c.name}</option>`).join('');
      customerSelect.value = this.state.filters.customer;
    }

    if (processSelect) {
      processSelect.innerHTML = processes.map(p => `<option value="${p.code}">${p.name}</option>`).join('');
      processSelect.value = this.state.filters.process;
    }
    
    // Lucide 아이콘 재생성 (필터에 새로 주입된 렌더링 동기화)
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  },

  // 이벤트 바인딩 (Event Listeners)
  bindEvents() {
    // 1) 사이드바 네비게이션 탭 전환 이벤트
    const navItems = document.querySelectorAll('.sidebar-nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const targetTab = e.currentTarget.getAttribute('data-tab');
        if (targetTab) {
          this.switchTab(targetTab);
        }
      });
    });

    // 2) [Phase 1 글로벌 필터 조작 이벤트]
    const plantSelect = document.getElementById('filter-plant');
    const customerSelect = document.getElementById('filter-customer');
    const processSelect = document.getElementById('filter-process');

    if (plantSelect) {
      plantSelect.addEventListener('change', (e) => {
        this.state.filters.plant = e.target.value;
        this.onFilterChange();
      });
    }

    if (customerSelect) {
      customerSelect.addEventListener('change', (e) => {
        this.state.filters.customer = e.target.value;
        this.onFilterChange();
      });
    }

    if (processSelect) {
      processSelect.addEventListener('change', (e) => {
        this.state.filters.process = e.target.value;
        this.onFilterChange();
      });
    }

    // 3) 글로벌 필터 초기화 버튼 바인딩
    const btnResetFilters = document.getElementById('btn-reset-filters');
    if (btnResetFilters) {
      btnResetFilters.addEventListener('click', () => {
        this.state.filters.plant = 'ALL';
        this.state.filters.customer = 'ALL';
        this.state.filters.process = 'ALL';
        
        if (plantSelect) plantSelect.value = 'ALL';
        if (customerSelect) customerSelect.value = 'ALL';
        if (processSelect) processSelect.value = 'ALL';
        
        this.onFilterChange();
      });
    }

    // 4) 체크리스트 디테일 드로어 테스트용 트리거 이벤트 (스켈레톤 테이블 클릭 시 활성화 시연)
    const checklistTable = document.querySelector('#tab-self-audit .skeleton-table');
    if (checklistTable) {
      checklistTable.addEventListener('click', () => {
        this.toggleDrawer(true);
      });
    }

    const btnCloseDrawer = document.getElementById('btn-close-drawer');
    if (btnCloseDrawer) {
      btnCloseDrawer.addEventListener('click', () => {
        this.toggleDrawer(false);
      });
    }

    // 5) SQL 샌드박스 경고 모달 테스트용 에디터 클릭 트리거
    const sqlEditor = document.querySelector('.skeleton-editor');
    if (sqlEditor) {
      sqlEditor.addEventListener('click', () => {
        this.toggleSqlModal(true);
      });
    }

    const btnCloseSqlModal = document.getElementById('btn-close-sql-modal');
    if (btnCloseSqlModal) {
      btnCloseSqlModal.addEventListener('click', () => {
        this.toggleSqlModal(false);
      });
    }

    // 6) 👥 [RBAC 추가] 프로필 선택 트리거 바인딩
    const profileTrigger = document.getElementById('profile-trigger');
    if (profileTrigger) {
      profileTrigger.addEventListener('click', (e) => {
        if (e.target.closest('#profile-popover')) return; // 내부 클릭 시 무시
        this.toggleProfilePopover();
      });
    }

    // 팝오버 외부 영역 클릭 시 자동으로 팝오버를 닫습니다.
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#profile-trigger')) {
        this.toggleProfilePopover(false);
      }
    });

    // 7) 👥 [RBAC 추가] 권한 제한 모달 닫기
    const btnClosePermissionModal = document.getElementById('btn-close-permission-modal');
    if (btnClosePermissionModal) {
      btnClosePermissionModal.addEventListener('click', () => {
        this.togglePermissionModal(false);
      });
    }
  },

  // 👥 사용자 및 권한 세션 초기화 (Initialize User Session)
  initUserSession() {
    console.log("⚙️ Setting up RBAC session...");
    const storedUsername = localStorage.getItem('riskhunter_user') || 'admin';
    const users = this.state.db.users;
    
    // 현재 유저 설정
    let user = users.find(u => u.username === storedUsername);
    if (!user) {
      user = users[0]; // fallback to admin
    }
    
    this.state.currentUser = user;
    this.state.currentRole = user.role;
    
    this.renderPopoverUsers();
    this.updateProfileUI();
  },

  // 롤 체인저 팝오버 사용자 목록 렌더링
  renderPopoverUsers() {
    const popoverList = document.getElementById('popover-user-list');
    if (!popoverList) return;
    
    popoverList.innerHTML = this.state.db.users.map(u => `
      <div class="popover-item ${u.username === this.state.currentUser.username ? 'active' : ''}" data-username="${u.username}">
        <div class="popover-avatar" style="background-color: ${u.avatar_color};">
          ${u.name[0]}
        </div>
        <div class="popover-info">
          <div class="popover-name">${u.name}</div>
          <div class="popover-role">${u.role_name}</div>
        </div>
        <span class="popover-badge">${u.badge}</span>
      </div>
    `).join('');
    
    // 클릭 이벤트 리스너 바인딩
    popoverList.querySelectorAll('.popover-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const username = e.currentTarget.getAttribute('data-username');
        this.switchUser(username);
      });
    });
  },

  // 유저 스위칭 엔진
  switchUser(username) {
    const user = this.state.db.users.find(u => u.username === username);
    if (!user) return;
    
    console.log(`👤 Switching user to: ${user.name} (${user.role_name})`);
    
    this.state.currentUser = user;
    this.state.currentRole = user.role;
    localStorage.setItem('riskhunter_user', username);
    
    this.updateProfileUI();
    this.renderPopoverUsers();
    this.applyPermissionToUI();
    this.toggleProfilePopover(false);
    
    this.showToast(`역할이 ${user.name}(${user.role_name})님으로 전환되었습니다.`, 'success');
    
    // 현재 탭이 바뀐 역할에서 허용되지 않는다면 기본 허용 탭인 'risk-assessment'로 강제 이동
    if (!this.permissions[user.role].includes(this.state.currentTab)) {
      this.switchTab('risk-assessment');
    }
  },

  // 프로필 메인 UI 정보 동적 바인딩
  updateProfileUI() {
    const nameNode = document.getElementById('profile-name-node');
    const roleNode = document.getElementById('profile-role-node');
    const badgeNode = document.getElementById('profile-badge-node');
    const avatarNode = document.getElementById('profile-avatar-node');
    
    if (nameNode) nameNode.textContent = this.state.currentUser.name;
    if (roleNode) roleNode.textContent = this.state.currentUser.role_name;
    if (badgeNode) {
      badgeNode.textContent = this.state.currentUser.badge;
    }
    if (avatarNode) {
      avatarNode.style.backgroundColor = this.state.currentUser.avatar_color;
    }
  },

  // 프로필 팝오버 토글
  toggleProfilePopover(show) {
    const popover = document.getElementById('profile-popover');
    const trigger = document.getElementById('profile-trigger');
    if (!popover || !trigger) return;
    
    const isHidden = popover.classList.contains('hidden');
    const shouldShow = show !== undefined ? show : isHidden;
    
    if (shouldShow) {
      popover.classList.remove('hidden');
      trigger.classList.add('popover-open');
    } else {
      popover.classList.add('hidden');
      trigger.classList.remove('popover-open');
    }
  },

  // UI 권한 잠금 적용 엔진
  applyPermissionToUI() {
    const activeRole = this.state.currentRole;
    const allowedTabs = this.permissions[activeRole];
    
    console.log(`🔐 Applying permission limits for role: ${activeRole}`);
    
    // 사이드바 모든 메뉴 순회하며 잠금 클래스 제어
    const navItems = document.querySelectorAll('.sidebar-nav-item');
    navItems.forEach(item => {
      const tabId = item.getAttribute('data-tab');
      if (allowedTabs.includes(tabId)) {
        item.classList.remove('locked');
      } else {
        item.classList.add('locked');
      }
    });

    // 뷰어 모드일 때, 쓰기 및 수정 성격의 요소들을 가상 비활성화 처리
    const writeActions = document.querySelectorAll('.viewer-write-target');
    writeActions.forEach(el => {
      if (activeRole === 'viewer') {
        el.classList.add('disabled-action');
        el.setAttribute('title', '일반조회(Viewer) 권한은 데이터 수정이 제한됩니다.');
      } else {
        el.classList.remove('disabled-action');
        el.removeAttribute('title');
      }
    });
  },

  // 권한 에러 알림 모달 토글
  togglePermissionModal(show, attemptedTabId = '') {
    const modal = document.getElementById('permission-modal');
    if (!modal) return;
    
    if (show) {
      // 시도한 탭에 따른 동적 메시지 가공
      const titleEl = document.getElementById('permission-modal-title');
      const descEl = document.getElementById('permission-modal-desc');
      
      let tabName = attemptedTabId;
      if (attemptedTabId === 'ai-action') tabName = 'AI Action Plan';
      if (attemptedTabId === 'sql-console') tabName = 'SQL Console';
      if (attemptedTabId === 'oe-library') tabName = 'OE Requirement Library';
      if (attemptedTabId === 'audit-timeline') tabName = 'Audit Timeline';
      
      if (titleEl && descEl) {
        titleEl.textContent = `[${tabName}] 메뉴는 현재 권한에서 접근이 제한되어 있습니다.`;
        descEl.innerHTML = `현재 계정 역할은 <strong>'${this.state.currentUser.role_name} (${this.state.currentUser.badge})'</strong> 입니다.<br>해당 메뉴를 사용하시려면 상위 권한 이상의 계정으로 우측 하단 프로필 영역에서 역할을 전환해 주십시오.`;
      }
      modal.classList.remove('hidden');
    } else {
      modal.classList.add('hidden');
    }
  },

  // 우아한 가상 토스트 푸시 알림
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconName = 'info';
    if (type === 'success') iconName = 'check-circle';
    if (type === 'warning') iconName = 'alert-triangle';
    if (type === 'danger') iconName = 'shield-alert';
    
    toast.innerHTML = `
      <div class="toast-icon"><i data-lucide="${iconName}"></i></div>
      <div class="toast-message">${message}</div>
    `;
    
    container.appendChild(toast);
    
    // Lucide 아이콘 적용
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
    
    // 3.5초 후 제거 애니메이션
    setTimeout(() => {
      toast.classList.add('fade-out');
      toast.addEventListener('transitionend', () => {
        toast.remove();
      });
    }, 3500);
  },

  // 글로벌 필터 변경 발생 시 사이드 이펙트 트리거
  onFilterChange() {
    console.log("🔮 Global Filters Updated:", JSON.stringify(this.state.filters));
    
    // [Phase 1 범위 확정] 필터 상태 변경 결과를 콘솔에 정상 출력하여 연동성을 검증합니다.
    // 향후 페이즈(Phase 2~6)에서 본 이벤트가 동작할 때 실시간 수치 연산 및 테이블 동적 필터링을 로딩합니다.
  },

  // 탭 전환 메커니즘 (SPA Tab Switch)
  switchTab(tabId) {
    // 👥 [RBAC 추가] 롤 기반 권한 제어 검사 (RBAC Security Guard)
    if (!this.permissions[this.state.currentRole].includes(tabId)) {
      console.warn(`⛔ Access Denied to tab: ${tabId} for role: ${this.state.currentRole}`);
      this.togglePermissionModal(true, tabId);
      return;
    }

    if (this.state.currentTab === tabId) return;

    console.log(`🔄 Switching tab to: ${tabId}`);
    this.state.currentTab = tabId;

    // 1) 사이드바 버튼 active 갱신
    document.querySelectorAll('.sidebar-nav-item').forEach(item => {
      if (item.getAttribute('data-tab') === tabId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // 2) 메인 콘텐츠 패널 display hidden/active 전환
    const panes = document.querySelectorAll('.tab-pane');
    panes.forEach(pane => {
      if (pane.id === `tab-${tabId}`) {
        pane.classList.add('active');
      } else {
        pane.classList.remove('active');
      }
    });

    // 3) 탭 전환에 맞추어 헤더 타이틀 및 서브타이틀 동적 업데이트
    this.updateHeader(tabId);
    
    // 4) 다른 탭으로 이동 시 드로어 자동 닫기
    this.toggleDrawer(false);
  },

  // 페이지 헤더 정보 동적 싱크
  updateHeader(tabId) {
    const titleEl = document.getElementById('page-title');
    const subtitleEl = document.getElementById('page-subtitle');
    
    if (!titleEl || !subtitleEl) return;

    let title = '';
    let subtitle = '';

    switch (tabId) {
      case 'risk-assessment':
        title = 'Risk Assessment';
        subtitle = '공장 현장 실시간 리스크 연산 및 취약 공정 선제 진단 모니터링';
        break;
      case 'oe-library':
        title = 'OE Requirement Library';
        subtitle = '완성차 고객사(OEM) 표준 기술 규격서 보관소 및 주요 조항 탐색';
        break;
      case 'self-audit':
        title = 'Self-Audit Checklist';
        subtitle = '리스크 이력과 OEM 규격이 유기 연계된 현장 맞춤형 감사 체크리스트';
        break;
      case 'ai-action':
        title = 'AI Action Plan';
        subtitle = 'VDA 6.3 및 8D 대응 논리 기반 AI 즉각 조치 계획 및 SOP 개정 가이드';
        break;
      case 'sql-console':
        title = 'SQL Console';
        subtitle = 'SELECT 전용 안전 샌드박스가 적용된 대용량 이력 데이터 탐색기';
        break;
      case 'audit-timeline':
        title = 'Audit Timeline';
        subtitle = 'D-30 대비 마일스톤 및 과제 추진 현황 및 증빙 진척도 트래킹';
        break;
      default:
        title = 'Dashboard';
        subtitle = 'Risk-Based Audit Checklist Dashboard';
    }

    titleEl.textContent = title;
    subtitleEl.textContent = subtitle;
  },

  // 디테일 드로어 토글 (Checklist Detail Drawer Toggle)
  toggleDrawer(show) {
    const drawer = document.getElementById('checklist-drawer');
    if (drawer) {
      if (show) {
        drawer.classList.add('active');
      } else {
        drawer.classList.remove('active');
      }
    }
  },

  // SQL 보안 모달 토글 (SQL Security Alert Modal Toggle)
  toggleSqlModal(show) {
    const modal = document.getElementById('sql-security-modal');
    if (modal) {
      if (show) {
        modal.classList.remove('hidden');
      } else {
        modal.classList.add('hidden');
      }
    }
  }
};

// DOM 로딩 완료 시 앱 구동
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
