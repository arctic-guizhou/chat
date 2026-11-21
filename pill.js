/* 药盒 · 照 pilulier 的泡罩铝板重做 · 改样子只动这里 */
(function () {
  'use strict';

  var KEY = 'gz_pill_v1';

  /* 药方的源，按顺序试。国内 raw.githubusercontent.com 经常连不上，所以先走镜像。 */
  var SOURCES = [
    'https://fastly.jsdelivr.net/gh/ceshihaox-dotcom/pilulier@main/pills/pills.json',
    'https://gcore.jsdelivr.net/gh/ceshihaox-dotcom/pilulier@main/pills/pills.json',
    'https://cdn.jsdelivr.net/gh/ceshihaox-dotcom/pilulier@main/pills/pills.json',
    'https://testingcf.jsdelivr.net/gh/ceshihaox-dotcom/pilulier@main/pills/pills.json',
    'https://raw.githubusercontent.com/ceshihaox-dotcom/pilulier/main/pills/pills.json'
  ];

  var items = [];
  var state = 'idle';
  var errMsg = '';

  function cur() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY) || 'null');
      return (v && v.code) ? v : null;
    } catch (e) { return null; }
  }
  function setCur(v) {
    try {
      if (v && v.code) localStorage.setItem(KEY, JSON.stringify(v));
      else localStorage.removeItem(KEY);
    } catch (e) {}
  }

  var CJK = '"Noto Serif SC","Songti SC","STSong",serif';
  var SERIF = '"Cormorant Garamond",Georgia,"Noto Serif SC",serif';

  var CSS = [
    '.pbx{position:fixed;inset:0;z-index:80;pointer-events:none}',
    '.pbx-veil{position:absolute;inset:0;background:rgba(244,245,248,.5);-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px);opacity:0;transition:opacity .35s}',
    '.pbx.open .pbx-veil{opacity:1;pointer-events:auto}',
    '.pbx-sheet{position:absolute;left:0;right:0;bottom:0;margin:0 auto;max-width:520px;height:76vh;max-height:640px;',
    'border-radius:24px 24px 0 0;display:flex;flex-direction:column;overflow:hidden;pointer-events:auto;',
    'padding-bottom:env(safe-area-inset-bottom);',
    'background:linear-gradient(180deg,rgba(249,250,254,.98) 0%,rgba(242,243,247,.99) 45%,rgba(234,235,239,1) 100%);',
    'box-shadow:0 -24px 54px -28px rgba(20,20,30,.5),inset 0 1px 0 #fff,inset 0 0 0 1px rgba(255,255,255,.55);',
    'transform:translateY(104%);transition:transform .5s cubic-bezier(.2,.85,.2,1);',
    'font-family:', CJK, ';font-weight:300;color:#2C2D34;-webkit-font-smoothing:antialiased}',
    '.pbx.open .pbx-sheet{transform:none}',
    '.pbx-h{display:flex;align-items:center;gap:10px;padding:16px 18px 8px;position:relative;flex:none}',
    '.pbx-h::before{content:"";position:absolute;left:50%;top:6px;width:34px;height:4px;border-radius:2px;background:#C6C8D0;transform:translateX(-50%)}',
    '.pbx-ttl{font-family:', SERIF, ';font-size:22px;line-height:1;color:#6A6C77;letter-spacing:.16em;flex:none;padding-top:8px}',
    '.pbx-cap{flex:1;font-style:italic;color:#A4A6B0;font-size:11.5px;font-family:', SERIF, ';text-align:center}',
    '.pbx-ok{border:1px solid rgba(164,166,176,.6);border-radius:999px;background:none;padding:3px 14px 3px calc(14px + .14em);font:inherit;font-size:11px;letter-spacing:.14em;color:#A4A6B0;flex:none;margin-top:6px}',
    '.pbx-stage{flex:1;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:4px 18px 14px}',
    '.pbx-stage::-webkit-scrollbar{display:none}',
    '.pbx-board{position:relative;border-radius:20px;padding:14px 12px 12px;',
    'background:linear-gradient(135deg,#f7f8fa 0%,#d9dce3 36%,#eef0f4 54%,#d9dce3 78%,#f7f8fa 100%);',
    'box-shadow:inset 0 1px 0 rgba(255,255,255,.85),inset 0 -1px 0 rgba(0,0,0,.07),0 14px 26px -20px rgba(20,20,30,.45)}',
    '.pbx-board::before{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;',
    'background:repeating-linear-gradient(115deg,transparent 0 7px,rgba(255,255,255,.09) 7px 8px)}',
    '.pbx-brand{position:absolute;right:12px;top:2px;font-family:', SERIF, ';font-style:italic;font-size:11px;color:#8f929e;opacity:.7;letter-spacing:.04em}',
    '.pbx-grid{position:relative;display:grid;grid-template-columns:repeat(3,1fr);gap:14px 12px;padding-top:12px}',
    '.pbx-cell{display:flex;flex-direction:column;align-items:center;background:none;border:0;padding:0;font:inherit;color:inherit}',
    '.pbx-dome{display:block;width:100%;height:42px;border-radius:21px;position:relative;',
    'background:radial-gradient(ellipse 72% 62% at 30% 22%,#ffffff 0%,#f8f9fc 32%,#eef0f5 70%,#e5e8ef 100%);',
    'box-shadow:inset 0 -5px 9px rgba(60,62,74,.1),inset 0 2px 3px #fff,0 5px 9px -4px rgba(60,62,74,.32),0 0 0 1px rgba(255,255,255,.62);',
    'transition:transform .28s cubic-bezier(.3,1.6,.5,1),box-shadow .4s}',
    '.pbx-cell:active .pbx-dome{transform:scale(.94,.9)}',
    '.pbx-cell.sel .pbx-dome{box-shadow:inset 0 -5px 9px rgba(60,62,74,.1),inset 0 2px 3px #fff,0 0 16px 1px rgba(255,255,255,.95),0 0 0 1px #9aa0ae}',
    '.pbx-cell.lev .pbx-dome{animation:pbxLev .56s cubic-bezier(.35,.1,.3,1) forwards}',
    '@keyframes pbxLev{0%{transform:none}35%{transform:translateY(-4px) rotate(-2.5deg)}70%{transform:translateY(-10px) rotate(2deg) scale(1.03)}100%{transform:translateY(-16px) rotate(3deg) scale(1.05)}}',
    '.pbx-lb{display:block;width:100%;margin-top:7px;font-size:9.5px;letter-spacing:.08em;color:#5c5e6a;text-align:center;',
    'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 0 rgba(255,255,255,.7)}',
    '.pbx-lb i{font-family:', SERIF, ';font-style:normal;color:#7d808c;margin-left:3px;font-size:9px}',
    '.pbx-cell.sel .pbx-lb{color:#2C2D34}',
    '.pbx-foot{flex:none;display:flex;align-items:center;gap:12px;padding:10px 20px 16px;font-size:11px;letter-spacing:.1em;color:#A4A6B0}',
    '.pbx-foot .t{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.pbx-foot .t b{font-weight:400;color:#2C2D34}',
    '.pbx-antidote{font:inherit;font-size:10.5px;letter-spacing:.14em;color:#6A6C77;background:none;',
    'border:1px solid #DBDEE5;border-radius:999px;padding:3px 13px;flex:none}',
    '.pdx{position:fixed;inset:0;z-index:81;pointer-events:none;visibility:hidden;transition:visibility 0s .45s}',
    '.pdx.open{pointer-events:auto;visibility:visible;transition:none}',
    '.pdx-veil{position:absolute;inset:0;opacity:0;transition:opacity .4s ease;',
    'background:linear-gradient(180deg,#F4F5F8 0,#F4F5F8 6px,rgba(244,245,248,0) 70px),radial-gradient(60% 34% at 50% 20%,rgba(22,23,30,.1),transparent 70%),#F4F5F8}',
    '.pdx.open .pdx-veil{opacity:1}',
    '.pdx-stage{position:absolute;left:0;right:0;top:calc(26px + env(safe-area-inset-top));height:190px;display:flex;align-items:center;justify-content:center;pointer-events:none}',
    '.pdx-stage::before{content:"";position:absolute;left:50%;top:50%;width:250px;height:250px;margin:-125px 0 0 -125px;border-radius:50%;',
    'background:radial-gradient(closest-side,rgba(22,23,30,.1),rgba(22,23,30,.05) 45%,transparent 72%);opacity:0;transition:opacity .7s .15s}',
    '.pdx.open .pdx-stage::before{opacity:1}',
    '.pdx-dome{width:150px;height:74px;border-radius:37px;position:relative;',
    'background:radial-gradient(ellipse 70% 62% at 30% 22%,#ffffff 0%,#f8f9fc 34%,#eceef4 72%,#e2e5ed 100%);',
    'box-shadow:inset 0 -6px 10px rgba(60,62,74,.1),inset 0 2px 4px #fff,0 8px 18px -6px rgba(60,62,74,.35),0 0 0 1px rgba(255,255,255,.7);',
    'animation:pexPop .6s cubic-bezier(.3,1.6,.5,1) both}',
    '@keyframes pexPop{0%{transform:scale(.6) rotate(-8deg);opacity:0}60%{opacity:1}100%{transform:none}}',
    '.pdx-top{position:absolute;right:14px;top:calc(14px + env(safe-area-inset-top));z-index:3}',
    '.pdx-top button{width:30px;height:30px;border-radius:15px;border:1px solid #DBDEE5;background:rgba(255,255,255,.55);',
    'color:#6A6C77;font:inherit;font-family:', SERIF, ';font-size:18px;line-height:1}',
    '.pdx-rx{position:absolute;left:0;right:0;top:calc(218px + env(safe-area-inset-top));bottom:0;',
    'padding:6px 30px calc(34px + env(safe-area-inset-bottom));overflow-y:auto;-webkit-overflow-scrolling:touch;',
    'opacity:0;transform:translateY(10px);transition:opacity .5s cubic-bezier(.2,.7,.2,1),transform .6s cubic-bezier(.2,.7,.2,1);',
    'font-family:', CJK, ';font-weight:300;color:#2C2D34}',
    '.pdx.open .pdx-rx{opacity:1;transform:none}',
    '.pdx-h{display:flex;align-items:baseline;gap:10px}',
    '.pdx-h .r{font-family:', SERIF, ';font-style:italic;font-size:26px;line-height:1;color:#2C2D34}',
    '.pdx-h b{font-weight:400;font-size:18px;letter-spacing:.2em}',
    '.pdx-h i{font-family:', SERIF, ';font-style:normal;font-size:12px;color:#A4A6B0;margin-left:auto}',
    '.pdx-body{font-size:12.5px;line-height:2;color:#6A6C77;margin-top:14px;white-space:pre-wrap;word-break:break-word}',
    '.pdx-acts{display:flex;gap:10px;margin-top:22px}',
    '.pdx-acts button{flex:1;font:inherit;font-size:11.5px;letter-spacing:.14em;border-radius:999px;padding:11px 0;',
    'border:1px solid #C6C8D0;background:none;color:#6A6C77}',
    '.pdx-acts .main{background:#2C2D34;color:#F4F5F8;border-color:#2C2D34}',
    '.pb-err{font-size:12px;color:#8a7a72;line-height:2;grid-column:1 / -1;letter-spacing:.04em;text-align:center;padding:20px 0}',
    '.pb-err button{font:inherit;font-size:11.5px;color:#6A6C77;background:none;border:1px solid #DBDEE5;border-radius:999px;padding:5px 14px;margin-top:10px}',
    '@media (prefers-reduced-motion:reduce){.pbx-dome,.pbx-sheet,.pdx-dome{animation:none!important;transition:none!important}}'
  ].join('');

  var st = document.createElement('style');
  st.textContent = CSS;
  document.head.appendChild(st);

  var root = document.createElement('div');
  root.className = 'pbx';
  root.innerHTML = '<div class="pbx-veil"></div>' +
    '<div class="pbx-sheet">' +
      '<div class="pbx-h"><span class="pbx-ttl">药盒</span><span class="pbx-cap" id="pbCap">十八颗</span><button class="pbx-ok">收起</button></div>' +
      '<div class="pbx-stage"><div class="pbx-board"><div class="pbx-brand">Pilulier</div><div class="pbx-grid" id="pbGrid"></div></div></div>' +
      '<div class="pbx-foot" id="pbFoot"></div>' +
    '</div>';
  document.body.appendChild(root);

  var pdx = document.createElement('div');
  pdx.className = 'pdx';
  pdx.innerHTML = '<div class="pdx-veil"></div>' +
    '<div class="pdx-stage"><div class="pdx-dome" id="pdxDome"></div></div>' +
    '<div class="pdx-top"><button id="pdxX">×</button></div>' +
    '<div class="pdx-rx" id="pdxRx"></div>';
  document.body.appendChild(pdx);

  var grid = root.querySelector('#pbGrid');
  var foot = root.querySelector('#pbFoot');
  var capEl = root.querySelector('#pbCap');
  var rx = pdx.querySelector('#pdxRx');

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>]/g, function (c) {
      return c === '&' ? '&amp;' : c === '<' ? '&lt;' : '&gt;';
    });
  }

  function notify() {
    if (typeof window.__pillChanged === 'function') window.__pillChanged();
  }

  function renderFoot() {
    var p = cur();
    if (!p) {
      foot.innerHTML = '<span class="t">还没吃。挑一颗。</span>';
      return;
    }
    foot.innerHTML = '<span class="t">正在服 <b>' + esc(p.code) + ' · ' + esc(p.name) + '</b></span>' +
      '<button class="pbx-antidote" id="pbAnti">解药</button>';
    foot.querySelector('#pbAnti').addEventListener('click', function () {
      setCur(null);
      renderFoot();
      renderGrid();
      notify();
    });
  }

  function closeDetail() {
    pdx.classList.remove('open');
  }

  function openDetail(p) {
    rx.innerHTML = '<div class="pdx-h"><span class="r">' + esc(p.code) + '</span><b>' + esc(p.name) + '</b>' +
      '<i>' + (cur() && cur().code === p.code ? '在服' : '') + '</i></div>' +
      '<div class="pdx-body">' + esc(p.text || '（这颗还没写药方）') + '</div>' +
      '<div class="pdx-acts"><button class="main" id="pdxTake">吃下去</button><button id="pdxBack">放回去</button></div>';
    rx.querySelector('#pdxBack').addEventListener('click', closeDetail);
    rx.querySelector('#pdxTake').addEventListener('click', function () {
      setCur({ code: p.code, name: p.name, text: p.text });
      closeDetail();
      renderFoot();
      renderGrid();
      notify();
    });
    pdx.classList.add('open');
    rx.scrollTop = 0;
  }

  function renderGrid() {
    grid.innerHTML = '';
    if (state === 'loading') {
      grid.innerHTML = '<p class="pb-err">药方正从仓库里取……</p>';
      return;
    }
    if (state === 'error') {
      grid.innerHTML = '<p class="pb-err">' + esc(errMsg) + '<br><button id="pbRetry">再取一次</button></p>';
      grid.querySelector('#pbRetry').addEventListener('click', load);
      return;
    }
    if (!items.length) {
      grid.innerHTML = '<p class="pb-err">仓库里没读到药。</p>';
      return;
    }
    var curP = cur();
    items.forEach(function (p, i) {
      var cell = document.createElement('button');
      cell.className = 'pbx-cell' + (curP && curP.code === p.code ? ' sel' : '');
      cell.innerHTML = '<span class="pbx-dome"></span>' +
        '<span class="pbx-lb">' + esc(p.code || ('P' + (i + 1))) + '<i>' + esc(p.name || '') + '</i></span>';
      cell.addEventListener('click', function () {
        cell.classList.add('lev');
        setTimeout(function () { openDetail(p); }, 120);
        setTimeout(function () { cell.classList.remove('lev'); }, 700);
      });
      grid.appendChild(cell);
    });
    capEl.textContent = items.length + ' 颗';
  }

  function tryFetch(i) {
    if (i >= SOURCES.length) {
      state = 'error';
      errMsg = '药方没取到：这几个地址都连不上。';
      renderGrid();
      return;
    }
    fetch(SOURCES[i], { cache: 'no-store' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (j) {
        var arr = (j && j.items) || [];
        if (!Array.isArray(arr)) arr = [];
        if (!arr.length) throw new Error('empty');
        items = arr.filter(function (x) { return x && (x.code || x.id); });
        items.forEach(function (x) { if (!x.code) x.code = x.id; });
        state = 'ready';
        renderGrid();
      })
      .catch(function () {
        tryFetch(i + 1);
      });
  }

  function load() {
    state = 'loading';
    renderGrid();
    tryFetch(0);
  }

  function open() {
    root.classList.add('open');
    renderFoot();
    if (state === 'idle') load();
    else renderGrid();
  }

  function close() {
    closeDetail();
    root.classList.remove('open');
  }

  root.querySelector('.pbx-ok').addEventListener('click', close);
  root.querySelector('.pbx-veil').addEventListener('click', close);
  pdx.querySelector('#pdxX').addEventListener('click', closeDetail);
  pdx.querySelector('.pdx-veil').addEventListener('click', closeDetail);

  window.PillBox = {
    open: open,
    close: close,
    current: cur,
    clear: function () { setCur(null); renderFoot(); renderGrid(); notify(); }
  };
})();
