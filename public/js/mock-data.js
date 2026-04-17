(function (w) {
  'use strict';

  /** @type {Record<string, string>} */
  var AGENTS = {
    GOLD: '金牌特約 · 北區',
    VIP: '尊榮代理 · 線上',
    NODE: '節點夥伴 · 海外',
    '888': '黑卡特許 · 核心',
  };

  function resolveAgent(code) {
    var c = String(code || '').trim().toUpperCase();
    if (!c) return null;
    if (AGENTS[c]) return { code: c, name: AGENTS[c] };
    return { code: c, name: '特約夥伴 · ' + c };
  }

  function productThumb(label) {
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="280">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
      '<stop stop-color="#050505"/><stop offset="0.45" stop-color="#d4af37"/><stop offset="1" stop-color="#0a0a0a"/></linearGradient>' +
      '<filter id="f"><feGaussianBlur stdDeviation="24" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>' +
      '<rect width="100%" height="100%" fill="url(#g)"/>' +
      '<text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" fill="#f5e6a8" font-size="42" font-family="Inter,system-ui,sans-serif" font-weight="800" filter="url(#f)" opacity="0.35">' +
      label +
      '</text>' +
      '<text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" fill="#f5e6a8" font-size="42" font-family="Inter,system-ui,sans-serif" font-weight="800">' +
      label +
      '</text></svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  /** @type {{id:string,name:string,price:number,image:string}[]} */
  var PRODUCTS = [
    { id: 'p1', name: 'Genesis 主機 · 曜金', price: 12800, image: productThumb('G') },
    { id: 'p2', name: 'Apex 主機 · 霧黑', price: 11800, image: productThumb('A') },
    { id: 'p3', name: '煙彈組 · 冷萃薄荷', price: 980, image: productThumb('M') },
    { id: 'p4', name: '煙彈組 · 烏龍拿鐵', price: 980, image: productThumb('U') },
    { id: 'p5', name: '限量禮盒 · 黑金', price: 28800, image: productThumb('★') },
    { id: 'p6', name: '便攜充電底座', price: 1680, image: productThumb('C') },
  ];

  var MOCK_USERS = [
    { id: 'u1', name: '陳昱廷', phone: '0912-345-678', status: '待審核' },
    { id: 'u2', name: '林佳穎', phone: '0922-888-001', status: '已開通' },
    { id: 'u3', name: '黃柏仁', phone: '0933-221-900', status: '待審核' },
    { id: 'u4', name: '吳思涵', phone: '0988-100-200', status: '已開通' },
  ];

  var MOCK_ORDERS = [
    { id: 'ORD-9F2A1C', user: '陳昱廷', status: '處理中' },
    { id: 'ORD-8B11D0', user: '林佳穎', status: '已出貨' },
    { id: 'ORD-7C90EE', user: '黃柏仁', status: '處理中' },
    { id: 'ORD-6D33A2', user: '吳思涵', status: '待付款' },
  ];

  w.MockData = {
    AGENTS: AGENTS,
    resolveAgent: resolveAgent,
    PRODUCTS: PRODUCTS,
    MOCK_USERS: MOCK_USERS,
    MOCK_ORDERS: MOCK_ORDERS,
  };
})(window);
