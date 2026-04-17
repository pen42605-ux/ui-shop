(function (w) {
  'use strict';

  var K_USERS = 'ui_shop_admin_users';
  var K_ORDERS = 'ui_shop_admin_orders';

  function parseArr(key) {
    try {
      var r = localStorage.getItem(key);
      if (!r) return null;
      var a = JSON.parse(r);
      return Array.isArray(a) ? a : null;
    } catch {
      return null;
    }
  }

  /**
   * @returns {{ id: string, name: string, phone: string, status: string }[]}
   */
  function getUsers() {
    var a = parseArr(K_USERS);
    if (a) return a;
    if (!w.MockData || !MockData.MOCK_USERS) return [];
    a = MockData.MOCK_USERS.map(function (u) {
      return {
        id: u.id,
        name: u.name,
        phone: u.phone,
        status: u.status === '已開通' ? 'active' : 'pending',
      };
    });
    localStorage.setItem(K_USERS, JSON.stringify(a));
    return a;
  }

  function saveUsers(users) {
    localStorage.setItem(K_USERS, JSON.stringify(users));
    try {
      w.dispatchEvent(new CustomEvent('admin-data-changed'));
    } catch {
      /* ignore */
    }
  }

  function userStatusLabel(status) {
    return status === 'active' ? '已開通' : '待審核';
  }

  /** 開通 → status `active`（畫面顯示已開通） */
  function activateUser(id) {
    var users = getUsers();
    var u = users.find(function (x) {
      return x.id === id;
    });
    if (!u || u.status === 'active') return false;
    u.status = 'active';
    saveUsers(users);
    return true;
  }

  /**
   * @returns {{ id: string, user: string, status: string }[]}
   */
  function getOrders() {
    var a = parseArr(K_ORDERS);
    if (a) return a;
    if (!w.MockData || !MockData.MOCK_ORDERS) return [];
    a = MockData.MOCK_ORDERS.map(function (o) {
      return { id: o.id, user: o.user, status: o.status };
    });
    localStorage.setItem(K_ORDERS, JSON.stringify(a));
    return a;
  }

  function saveOrders(orders) {
    localStorage.setItem(K_ORDERS, JSON.stringify(orders));
    try {
      w.dispatchEvent(new CustomEvent('admin-data-changed'));
    } catch {
      /* ignore */
    }
  }

  /** 已出貨 → status 已出貨 */
  function markOrderShipped(orderId) {
    var orders = getOrders();
    var o = orders.find(function (x) {
      return x.id === orderId;
    });
    if (!o || o.status === '已出貨') return false;
    o.status = '已出貨';
    saveOrders(orders);
    return true;
  }

  w.AdminData = {
    getUsers: getUsers,
    saveUsers: saveUsers,
    userStatusLabel: userStatusLabel,
    activateUser: activateUser,
    getOrders: getOrders,
    saveOrders: saveOrders,
    markOrderShipped: markOrderShipped,
  };
})(window);
