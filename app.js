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

      // 라이브러리 탭 내 데이터 바인딩 및 이벤트 초기화
      this.initLibraryTab();
      
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
    
    // 만약 Library 탭이 활성화되어 있다면, 서브 컴포넌트들을 재렌더링하여 실시간 동기화
    if (this.state.currentTab === 'library') {
      this.state.checklistCurrentPage = 1; // 필터 변경 시 첫 페이지로 리셋
      this.renderProcessSummary();
      this.renderChecklistTable();
      this.renderDocumentLibrary();
      this.renderRequirementMapping();
    }
    
    // (앞으로 Phase 2 ~ Phase 7 진행 시 각 탭별 리스크 동적 갱신 코드가 여기에 순차 배치될 것입니다)
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
