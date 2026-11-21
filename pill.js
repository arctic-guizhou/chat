/* 药盒 · 独立一文件，改样式只动这里 */
(function () {
  'use strict';

  var REPO = 'ceshihaox-dotcom/pilulier';
  var PATH = 'pills/pills.json';
  var BRANCHES = ['main', 'master'];
  var KEY = 'gz_pill_v1';

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

  var CSS = [
    '.pb-layer{position:fixed;inset:0;z-index:80;display:none;overflow-y:auto;-webkit-overflow-scrolling:touch;',
    'padding:calc(18px + env(safe-area-inset-top)) 16px calc(30px + env(safe-area-inset-bottom));',
    'background:radial-gradient(140% 95% at 50% -12%,#34366e 0%,#1b1b3d 44%,#0a0a18 100%);',
    'color:#ecebff;font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Helvetica Neue",sans-serif;}',
    '.pb-layer.on{display:block;animation:pbIn .32s ease both}',
    '@keyframes pbIn{from{opacity:0;transform:scale(.99)}to{opacity:1;transform:none}}',
    '.pb-stars{position:fixed;inset:0;pointer-events:none;',
    'background-image:radial-gradient(1.6px 1.6px at 18% 16%,#fff,transparent),radial-gradient(1.2px 1.2px at 74% 10%,#cfe0ff,transparent),radial-gradient(1.4px 1.4px at 42% 26%,#ffe9ff,transparent),radial-gradient(1px 1px at 90% 26%,#fff,transparent),radial-gradient(1.3px 1.3px at 9% 36%,#d6e4ff,transparent),radial-gradient(1px 1px at 60% 40%,#fff,transparent);',
    'background-size:100% 46%;opacity:.7;animation:pbTw 7s ease-in-out infinite alternate}',
    '@keyframes pbTw{from{opacity:.32}to{opacity:.9}}',
    '.pb-wrap{position:relative}',
    '.pb-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}',
    '.pb-title{font-size:13px;letter-spacing:.42em;color:#cfd0ff;text-shadow:0 0 14px rgba(150,160,255,.8)}',
    '.pb-close{font:inherit;font-size:12px;color:#a9aadb;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.14);border-radius:14px;padding:6px 12px}',
    '.pb-sub{font-size:11px;color:#8e8fc4;letter-spacing:.04em;margin:0 0 18px;line-height:1.75}',
    '.pb-taken{display:flex;align-items:center;gap:10px;margin:0 0 16px;padding:11px 13px;border-radius:14px;',
    'background:linear-gradient(120deg,rgba(140,150,255,.22),rgba(255,160,220,.14));border:1px solid rgba(180,190,255,.28)}',
    '.pb-taken .t{flex:1;font-size:12.5px;line-height:1.5}',
    '.pb-taken .t b{font-weight:500;color:#fff}',
    '.pb-antidote{font:inherit;font-size:12px;color:#0d0d1c;background:linear-gradient(120deg,#e7ecff,#ffd9f0);border:0;border-radius:14px;padding:7px 13px;flex:none}',
    '.pb-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px 12px;padding:6px 2px 10px}',
    '.pb-pill{position:relative;display:flex;flex-direction:column;align-items:center;gap:8px;background:none;border:0;padding:0;color:inherit;font:inherit}',
    '.pb-cap{width:100%;aspect-ratio:.62;border-radius:999px;position:relative;overflow:hidden;',
    'box-shadow:0 8px 20px rgba(90,100,220,.35),inset 0 8px 12px rgba(255,255,255,.75),inset 0 -10px 16px rgba(60,70,160,.28);',
    'animation:pbFloat 4.6s ease-in-out infinite}',
    '.pb-cap::after{content:"";position:absolute;left:18%;top:9%;width:30%;height:24%;border-radius:50%;background:rgba(255,255,255,.85);filter:blur(3px)}',
    '@keyframes pbFloat{0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-6px) rotate(3deg)}}',
    '.pb-code{font-size:10px;letter-spacing:.14em;color:#b7b8ee}',
    '.pb-name{font-size:11px;color:#e3e3ff;opacity:.92;line-height:1.3;text-align:center}',
    '.pb-pill.sel .pb-cap{box-shadow:0 0 0 2px rgba(255,220,255,.9),0 10px 26px rgba(120,130,255,.5)}',
    '.pb-detail{position:fixed;left:14px;right:14px;bottom:calc(14px + env(safe-area-inset-bottom));z-index:81;',
    'background:linear-gradient(165deg,rgba(48,49,96,.98),rgba(22,22,48,.98));border:1px solid rgba(180,190,255,.26);',
    'border-radius:20px;padding:18px 18px 16px;box-shadow:0 20px 60px rgba(0,0,0,.55);',
    'animation:pbUp .28s ease both;max-height:74vh;overflow-y:auto}',
    '@keyframes pbUp{from{transform:translateY(18px);opacity:0}to{transform:none;opacity:1}}',
    '.pb-detail .dcode{font-size:10px;letter-spacing:.18em;color:#9a9bd8}',
    '.pb-detail .dname{font-size:16px;letter-spacing:.06em;margin:6px 0 12px;color:#fff}',
    '.pb-detail .dtext{font-size:12.5px;line-height:1.85;color:#cfd0f2;white-space:pre-wrap;word-break:break-word;max-height:38vh;overflow-y:auto}',
    '.pb-acts{display:flex;gap:10px;margin-top:16px}',
    '.pb-acts button{flex:1;font:inherit;font-size:13px;border-radius:16px;padding:11px 0;border:1px solid rgba(190,200,255,.35);background:rgba(255,255,255,.06);color:#e8e8ff}',
    '.pb-acts .main{background:linear-gradient(120deg,#d9e2ff,#f3d9ff);color:#15152b;border:0;box-shadow:0 8px 22px rgba(150,160,255,.35)}',
    '.pb-err{font-size:12px;color:#ffb3c8;line-height:1.9;grid-column:1 / -1}',
    '.pb-err button{font:inherit;font-size:12px;color:#fff;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);border-radius:12px;padding:6px 12px;margin-top:10px}'
  ].join('');

  var st = document.createElement('style');
  st.textContent = CSS;
  document.head.appendChild(st);

  var layer = document.createElement('div');
  layer.className = 'pb-layer';
  layer.innerHTML = '<div class="pb-stars"></div><div class="pb-wrap">' +
    '<div class="pb-head"><div class="pb-title">药 盒</div><button class="pb-close">收起来</button></div>' +
    '<p class="pb-sub">十八颗。挑一颗吃下去，我下一句就带着它的味道说话。不想了，点解药。</p>' +
    '<div id="pbTaken"></div><div class="pb-grid" id="pbGrid"></div></div>';
  document.body.appendChild(layer);

  var grid = layer.querySelector('#pbGrid');
  var takenBox = layer.querySelector('#pbTaken');
  var detail = null;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>]/g, function (c) {
      return c === '&' ? '&amp;' : c === '<' ? '&lt;' : '&gt;';
    });
  }

  function closeDetail() {
    if (detail) { detail.remove(); detail = null; }
  }

  function notify() {
    if (typeof window.__pillChanged === 'function') window.__pillChanged();
  }

  function renderTaken() {
    var p = cur();
    if (!p) { takenBox.innerHTML = ''; return; }
    takenBox.innerHTML = '<div class="pb-taken"><div class="t">正在服 <b>' + esc(p.code) + ' · ' + esc(p.name) + '</b></div>' +
      '<button class="pb-antidote" id="pbAnti">解药</button></div>';
    takenBox.querySelector('#pbAnti').addEventListener('click', function () {
      setCur(null);
      renderTaken();
      renderGrid();
      notify();
    });
  }

  function openDetail(p) {
    closeDetail();
    detail = document.createElement('div');
    detail.className = 'pb-detail';
    detail.innerHTML = '<div class="dcode">' + esc(p.code) + '</div>' +
      '<div class="dname">' + esc(p.name) + '</div>' +
      '<div class="dtext">' + esc(p.text || '（这颗还没写药方）') + '</div>' +
      '<div class="pb-acts"><button class="main" id="pbTake">吃下去</button><button id="pbBack">放回去</button></div>';
    layer.appendChild(detail);
    detail.querySelector('#pbBack').addEventListener('click', closeDetail);
    detail.querySelector('#pbTake').addEventListener('click', function () {
      setCur({ code: p.code, name: p.name, text: p.text });
      closeDetail();
      renderTaken();
      renderGrid();
      notify();
    });
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
      var h = (i * 23 + 202) % 360;
      var btn = document.createElement('button');
      btn.className = 'pb-pill' + (curP && curP.code === p.code ? ' sel' : '');
      btn.innerHTML = '<div class="pb-cap" style="background:linear-gradient(168deg,hsl(' + h + ',92%,90%),hsl(' + ((h + 18) % 360) + ',72%,68%))"></div>' +
        '<div class="pb-code">' + esc(p.code || ('P' + (i + 1))) + '</div>' +
        '<div class="pb-name">' + esc(p.name || '') + '</div>';
      btn.addEventListener('click', function () { openDetail(p); });
      grid.appendChild(btn);
    });
  }

  function tryFetch(i) {
    if (i >= BRANCHES.length) {
      state = 'error';
      errMsg = '没取到药方：仓库连不上。';
      renderGrid();
      return;
    }
    var url = 'https://raw.githubusercontent.com/' + REPO + '/' + BRANCHES[i] + '/' + PATH;
    fetch(url, { cache: 'no-store' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (j) {
        var arr = (j && j.items) || [];
        if (!Array.isArray(arr)) arr = [];
        items = arr.filter(function (x) { return x && (x.code || x.id); });
        items.forEach(function (x) { if (!x.code) x.code = x.id; });
        state = 'ready';
        renderGrid();
      })
      .catch(function (e) {
        if (i + 1 < BRANCHES.length) { tryFetch(i + 1); return; }
        state = 'error';
        errMsg = '没取到药方：' + (e && e.message ? e.message : e);
        renderGrid();
      });
  }

  function load() {
    state = 'loading';
    renderGrid();
    tryFetch(0);
  }

  function open() {
    layer.classList.add('on');
    renderTaken();
    if (state === 'idle') load();
    else renderGrid();
  }

  layer.querySelector('.pb-close').addEventListener('click', function () {
    closeDetail();
    layer.classList.remove('on');
  });

  window.PillBox = {
    open: open,
    current: cur,
    clear: function () { setCur(null); renderTaken(); renderGrid(); notify(); }
  };
})();
