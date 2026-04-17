(function (w) {
  'use strict';

  /**
   * 前端模擬狀態（localStorage）：
   * - ui_shop_agent_code / ui_shop_agent_name  代理驗證
   * - ui_shop_user                             LINE 登入後的會員（JSON）
   * - ui_shop_cart_v2                          購物車（cart.js）
   * - ui_shop_last_order                       最近一次訂單編號
   * - ui_shop_is_admin                        後台登入（'true' = 已登入）
   */

  (function bootPreloader() {
    if (!document.body) {
      document.addEventListener('DOMContentLoaded', bootPreloader);
      return;
    }
    if (document.querySelector('.ui-preloader')) return;

    if (w.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.documentElement.classList.add('ui-ready');
      return;
    }

    var pre = document.createElement('div');
    pre.className = 'ui-preloader';
    pre.setAttribute('aria-hidden', 'true');
    pre.innerHTML =
      '<div class="ui-preloader__panel" role="status" aria-live="polite">' +
      '<div class="ui-preloader__ring"></div>' +
      '<span class="ui-preloader__brand">PRIVATE</span>' +
      '</div>';
    document.body.insertBefore(pre, document.body.firstChild);

    var t0 = Date.now();
    function finish() {
      var wait = Math.max(0, 340 - (Date.now() - t0));
      w.setTimeout(function () {
        pre.classList.add('ui-preloader--out');
        w.setTimeout(function () {
          if (pre.parentNode) pre.parentNode.removeChild(pre);
          document.documentElement.classList.add('ui-ready');
        }, 480);
      }, wait);
    }

    if (document.readyState === 'complete') finish();
    else w.addEventListener('load', finish);
  })();

  var LS_AGENT_CODE = 'ui_shop_agent_code';
  var LS_AGENT_NAME = 'ui_shop_agent_name';
  var LS_USER = 'ui_shop_user';
  var LS_ORDER = 'ui_shop_last_order';
  var LS_IS_ADMIN = 'ui_shop_is_admin';
  var SS_ADMIN = 'ui_shop_admin';
  var SS_LEGACY_AGENT = 'ui_shop_agent';
  var SS_LEGACY_ORDER = 'ui_shop_last_order';

  var didMigrateAgent = false;

  function migrateAgentFromSessionOnce() {
    if (didMigrateAgent) return;
    didMigrateAgent = true;
    try {
      if (localStorage.getItem(LS_AGENT_CODE)) return;
      var raw = sessionStorage.getItem(SS_LEGACY_AGENT);
      if (!raw) return;
      var o = JSON.parse(raw);
      sessionStorage.removeItem(SS_LEGACY_AGENT);
      if (o && o.code) {
        localStorage.setItem(LS_AGENT_CODE, String(o.code));
        localStorage.setItem(LS_AGENT_NAME, String(o.name || o.code));
      }
    } catch {
      /* ignore */
    }
  }

  function migrateOrderFromSessionOnce() {
    try {
      if (localStorage.getItem(LS_ORDER)) return;
      var s = sessionStorage.getItem(SS_LEGACY_ORDER);
      if (s) {
        localStorage.setItem(LS_ORDER, String(s));
        sessionStorage.removeItem(SS_LEGACY_ORDER);
      }
    } catch {
      /* ignore */
    }
  }

  /** @param {{ code: string, name: string } | null} agent */
  function setAgent(agent) {
    if (!agent) {
      localStorage.removeItem(LS_AGENT_CODE);
      localStorage.removeItem(LS_AGENT_NAME);
      try {
        sessionStorage.removeItem(SS_LEGACY_AGENT);
      } catch {
        /* ignore */
      }
      return;
    }
    localStorage.setItem(LS_AGENT_CODE, String(agent.code));
    localStorage.setItem(LS_AGENT_NAME, String(agent.name || agent.code));
    try {
      sessionStorage.removeItem(SS_LEGACY_AGENT);
    } catch {
      /* ignore */
    }
  }

  function getAgent() {
    migrateAgentFromSessionOnce();
    try {
      var code = localStorage.getItem(LS_AGENT_CODE);
      var name = localStorage.getItem(LS_AGENT_NAME);
      if (!code) return null;
      return { code: code, name: name || code };
    } catch {
      return null;
    }
  }

  function getAgentCode() {
    var a = getAgent();
    return a ? a.code : '';
  }

  function requireAgentOr(redirectTo) {
    var a = getAgent();
    if (!a && redirectTo) {
      location.href = redirectTo;
    }
    return a;
  }

  /** @param {unknown} raw */
  function normalizeUser(raw) {
    if (!raw || typeof raw !== 'object') return null;
    var u = /** @type {Record<string, unknown>} */ (raw);
    return {
      id: String(u.id || 'user'),
      displayName: String(u.displayName || 'Member'),
      loginAt: typeof u.loginAt === 'string' ? u.loginAt : new Date().toISOString(),
      provider: String(u.provider || 'line'),
    };
  }

  /** @param {{ id?: string, displayName: string, loginAt?: string, provider?: string }} user */
  function setUser(user) {
    var n = normalizeUser({
      id: user.id,
      displayName: user.displayName,
      loginAt: user.loginAt,
      provider: user.provider,
    });
    if (!n) return;
    localStorage.setItem(LS_USER, JSON.stringify(n));
  }

  function getUser() {
    try {
      var raw = localStorage.getItem(LS_USER);
      return raw ? normalizeUser(JSON.parse(raw)) : null;
    } catch {
      return null;
    }
  }

  function clearUser() {
    localStorage.removeItem(LS_USER);
  }

  /** 模擬 LINE OAuth 完成後寫入會員資料 */
  function simulateLineLogin(optDisplayName) {
    var name = optDisplayName || 'LINE 會員';
    setUser({
      id: 'LINE-' + Math.random().toString(36).slice(2, 12).toUpperCase(),
      displayName: name,
      loginAt: new Date().toISOString(),
      provider: 'line',
    });
  }

  /** 僅登出會員（保留代理與購物車）→ 回到 LINE 登入 */
  function signOutCustomer() {
    clearUser();
    location.href = 'login.html';
  }

  /** 清除代理 + 會員（購物車保留，除非另行清空） */
  function clearAgent() {
    setAgent(null);
  }

  var didMigrateAdmin = false;

  function migrateAdminFromSessionOnce() {
    if (didMigrateAdmin) return;
    didMigrateAdmin = true;
    try {
      if (localStorage.getItem(LS_IS_ADMIN) === 'true') return;
      if (sessionStorage.getItem(SS_ADMIN) === '1') {
        localStorage.setItem(LS_IS_ADMIN, 'true');
        sessionStorage.removeItem(SS_ADMIN);
      }
    } catch {
      /* ignore */
    }
  }

  /** 後台登入：isAdmin = true 寫入 localStorage */
  function setAdmin(ok) {
    if (ok) {
      localStorage.setItem(LS_IS_ADMIN, 'true');
    } else {
      localStorage.removeItem(LS_IS_ADMIN);
    }
    try {
      sessionStorage.removeItem(SS_ADMIN);
    } catch {
      /* ignore */
    }
  }

  function isAdmin() {
    migrateAdminFromSessionOnce();
    return localStorage.getItem(LS_IS_ADMIN) === 'true';
  }

  function requireAdminOr(redirectTo) {
    if (!isAdmin()) {
      location.href = redirectTo;
      return false;
    }
    return true;
  }

  function setLastOrder(id) {
    migrateOrderFromSessionOnce();
    if (id) localStorage.setItem(LS_ORDER, String(id));
    else localStorage.removeItem(LS_ORDER);
    try {
      sessionStorage.removeItem(SS_LEGACY_ORDER);
    } catch {
      /* ignore */
    }
  }

  function getLastOrder() {
    migrateOrderFromSessionOnce();
    try {
      return localStorage.getItem(LS_ORDER) || '';
    } catch {
      return '';
    }
  }

  /**
   * 商城／購物車／結帳頁：須已完成代理驗證 + LINE 登入
   * @returns {boolean}
   */
  function ensureMemberSession(loginUrl, indexUrl) {
    if (!getAgent()) {
      location.replace(indexUrl);
      return false;
    }
    if (!getUser()) {
      location.replace(loginUrl);
      return false;
    }
    return true;
  }

  function formatMoney(n) {
    return (
      'NT$ ' +
      (Number(n) || 0).toLocaleString('zh-TW', {
        maximumFractionDigits: 0,
      })
    );
  }

  function bindCartBadge(el) {
    if (!el) return;
    function sync() {
      if (typeof w.CartStore === 'undefined') return;
      el.textContent = String(CartStore.sumQty());
    }
    sync();
    w.addEventListener('ui-cart-changed', sync);
  }

  w.UISession = {
    setAgent: setAgent,
    getAgent: getAgent,
    getAgentCode: getAgentCode,
    clearAgent: clearAgent,
    requireAgentOr: requireAgentOr,
    setUser: setUser,
    getUser: getUser,
    clearUser: clearUser,
    simulateLineLogin: simulateLineLogin,
    signOutCustomer: signOutCustomer,
    ensureMemberSession: ensureMemberSession,
    setAdmin: setAdmin,
    isAdmin: isAdmin,
    requireAdminOr: requireAdminOr,
    setLastOrder: setLastOrder,
    getLastOrder: getLastOrder,
    formatMoney: formatMoney,
    bindCartBadge: bindCartBadge,
  };
})(window);
