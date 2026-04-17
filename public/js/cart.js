(function (w) {
  'use strict';

  /** @type {string} */
  var KEY = 'ui_shop_cart_v2';
  var LEGACY_KEY = 'ui_shop_cart_v1';
  var didMigrate = false;

  function migrateLegacyOnce() {
    if (didMigrate) return;
    didMigrate = true;
    try {
      if (localStorage.getItem(KEY)) return;
      var raw = localStorage.getItem(LEGACY_KEY);
      if (!raw) return;
      var arr = JSON.parse(raw);
      if (!Array.isArray(arr)) return;
      var lines = arr
        .map(function (it) {
          if (!it || typeof it !== 'object') return null;
          return normalizeLine({
            id: it.id,
            name: it.name,
            price: it.price,
            qty: it.qty,
          });
        })
        .filter(Boolean);
      if (lines.length) {
        localStorage.setItem(KEY, JSON.stringify(lines));
        w.dispatchEvent(new CustomEvent('ui-cart-changed', { detail: { count: sumQty(lines) } }));
      }
      localStorage.removeItem(LEGACY_KEY);
    } catch {
      /* ignore */
    }
  }

  /**
   * Cart line format stored in localStorage:
   * [{ id, name, price, qty }, ...]
   * @typedef {{ id: string, name: string, price: number, qty: number }} CartLine
   */

  /**
   * @param {unknown} it
   * @returns {CartLine | null}
   */
  function normalizeLine(it) {
    if (!it || typeof it !== 'object') return null;
    var o = /** @type {Record<string, unknown>} */ (it);
    var id = o.id != null ? String(o.id) : '';
    var name = o.name != null ? String(o.name) : '';
    var price = Number(o.price);
    var qty = Math.max(0, Math.floor(Number(o.qty)) || 0);
    if (!id || qty < 1 || !Number.isFinite(price)) return null;
    return { id: id, name: name, price: price, qty: qty };
  }

  /**
   * @returns {CartLine[]}
   */
  function readRaw() {
    migrateLegacyOnce();
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return [];
      var arr = JSON.parse(raw);
      if (!Array.isArray(arr)) return [];
      return arr.map(normalizeLine).filter(Boolean);
    } catch {
      return [];
    }
  }

  /**
   * @param {CartLine[]} items
   */
  function writeRaw(items) {
    var clean = items.map(normalizeLine).filter(Boolean);
    localStorage.setItem(KEY, JSON.stringify(clean));
    w.dispatchEvent(new CustomEvent('ui-cart-changed', { detail: { count: sumQty(clean) } }));
  }

  /**
   * @param {CartLine[]} items
   */
  function sumQty(items) {
    return items.reduce(function (n, it) {
      return n + (Number(it.qty) || 0);
    }, 0);
  }

  function getCart() {
    return readRaw();
  }

  /**
   * @param {CartLine[]} items
   */
  function setCart(items) {
    writeRaw(Array.isArray(items) ? items : []);
  }

  /**
   * Add item to cart (qty +1 if same id exists).
   * @param {{ id: string, name: string, price: number }} product
   */
  function addItem(product) {
    var id = String(product.id);
    var name = String(product.name);
    var price = Number(product.price);
    if (!id || !Number.isFinite(price)) return;

    var items = readRaw();
    var found = items.find(function (x) {
      return x.id === id;
    });
    if (found) {
      found.qty = (Number(found.qty) || 0) + 1;
    } else {
      items.push({ id: id, name: name, price: price, qty: 1 });
    }
    writeRaw(items);
  }

  /**
   * Increase quantity by 1.
   * @param {string} id
   */
  function increaseQty(id) {
    updateQty(String(id), 1);
  }

  /**
   * Decrease quantity by 1; removes line when qty reaches 0.
   * @param {string} id
   */
  function decreaseQty(id) {
    updateQty(String(id), -1);
  }

  /**
   * @param {string} id
   * @param {number} delta
   */
  function updateQty(id, delta) {
    var items = readRaw();
    var found = items.find(function (x) {
      return x.id === id;
    });
    if (!found) return;
    found.qty = Math.max(0, (Number(found.qty) || 0) + delta);
    writeRaw(
      items.filter(function (x) {
        return x.qty > 0;
      })
    );
  }

  /**
   * Remove item completely.
   * @param {string} id
   */
  function remove(id) {
    writeRaw(
      readRaw().filter(function (x) {
        return x.id !== String(id);
      })
    );
  }

  function clear() {
    writeRaw([]);
  }

  /** Sum of (price * qty) for all lines. */
  function getTotal() {
    return readRaw().reduce(function (sum, it) {
      return sum + (Number(it.price) || 0) * (Number(it.qty) || 0);
    }, 0);
  }

  function totalPrice() {
    return getTotal();
  }

  w.CartStore = {
    KEY: KEY,
    getCart: getCart,
    setCart: setCart,
    addItem: addItem,
    increaseQty: increaseQty,
    decreaseQty: decreaseQty,
    updateQty: updateQty,
    remove: remove,
    clear: clear,
    getTotal: getTotal,
    totalPrice: totalPrice,
    sumQty: function () {
      return sumQty(readRaw());
    },
  };
})(window);
