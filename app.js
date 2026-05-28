/**
 * ==========================================================================
 * ⚙️ RiskHunter App Engine (Core JavaScript)
 * Phase 0: Static Project Scaffold Base Engine
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
    ]
  },

  // 초기화 핸들러 (Initialization)
  init() {
    console.log("🏁 RiskHunter Phase 0 Core Engine Initializing...");
    
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
    
    console.log("🚀 Phase 0: Static Project Scaffold Engine Initialized!");
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
      'audit-planning': {
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
        assistantDrawer.classList.toggle('hidden');
      });
    }
    
    if (assistantClose && assistantDrawer) {
      assistantClose.addEventListener('click', (e) => {
        e.stopPropagation();
        assistantDrawer.classList.add('hidden');
      });
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
