/* 药盒 · 配色与字体照 pilulier demo 那一套 · 改样式只动这里 */
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

  var SERIF = '"Noto Serif SC","Songti SC","STSong","SimSun",serif';

  var CSS = [
    '.pb-layer{position:fixed;inset:0;z-index:80;display:none;overflow-y:auto;-webkit-overflow-scrolling:touch;',
    'padding:calc(20px + env(safe-area-inset-top)) 20px calc(32px + env(safe-area-inset-bottom));',
    'background:radial-gradient(120% 60% at 15% 0%,#fbfcfe 0%,rgba(251,252,254,0) 60%),#F4F5F8;',
    'color:#2C2D34;-webkit-font-smoothing:antialiased;font-family:', SERIF, ';font-weight:300;}',
    '.pb-layer.on{display:block;animation:pbIn .5s cubic-bezier(.2,.8,.2,1) both}',
    '@keyframes pbIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}',
    '.pb-wrap{position:relative;max-width:520px;margin:0 auto}',
    '.pb-head{display:flex;align-items:baseline;justify-content:space-between;margin:0 0 6px}',
    '.pb-title{font-size:20px;letter-spacing:.34em;color:#2C2D34;font-weight:400}',
    '.pb-close{font:inherit;font-size:11px;letter-spacing:.08em;color:#6A6C77;background:none;border:1px solid #DBDEE5;border-radius:999px;padding:4px 13px}',
    '.pb-sub{font-size:11px;color:#A4A6B0;letter-spacing:.09em;line-height:2;margin:0 0 24px}',
    '.pb-taken{display:flex;align-items:center;gap:12px;margin:0 0 24px;padding:13px 15px;border-radius:14px;',
    'background:rgba(255,255,255,.72);box-shadow:0 0 0 1px rgba(255,255,255,.9) inset}',
    '.pb-taken .t{flex:1;font-size:12.5px;line-height:1.7;color:#6A6C77;letter-spacing:.04em}',
    '.pb-taken .t b{font-weight:400;color:#2C2D34;letter-spacing:.06em}',
    '.pb-antidote{font:inherit;font-size:11.5px;letter-spacing:.08em;color:#2C2D34;background:none;border:1px solid #DBDEE5;border-radius:999px;padding:6px 15px;flex:none}',
    '.pb-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:30px 16px;padding:4px 0 16px}',
    '.pb-pill{display:flex;flex-direction:column;align-items:center;gap:12px;background:none;border:0;padding:0;color:inherit;font:inherit}',
    '.pb-cap{width:100%;aspect-ratio:.56;border-radius:999px;position:relative;overflow:hidden;',
    'box-shadow:0 1px 2px rgba(44,45,52,.04),0 16px 30px -18px rgba(44,45,52,.35),0 0 0 1px rgba(255,255,255,.95) inset;',
    'animation:pbFloat 7s ease-in-out infinite}',
    '.pb-cap::after{content:"";position:absolute;left:14%;top:8%;width:26%;height:19%;border-radius:50%;',
    'background:rgba(255,255,255,.98);filter:blur(4px)}',
    '@keyframes pbFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}',
    '.pb-code{font-size:9.5px;letter-spacing:.26em;color:#A4A6B0}',
    '.pb-name{font-size:11.5px;color:#2C2D34;letter-spacing:.12em;line-height:1.5;text-align:center}',
    '.pb-pill.sel .pb-cap{box-shadow:0 0 0 1px #B9BEC9 inset,0 16px 32px -18px rgba(44,45,52,.45)}',
    '.pb-pill.sel .pb-code{color:#2C2D34}',
    '.pb-detail{position:fixed;left:16px;right:16px;bottom:calc(16px + env(safe-area-inset-bottom));z-index:81;',
    'background:#FBFCFD;border-radius:16px;',
    'padding:22px 20px 18px;box-shadow:0 -2px 50px -14px rgba(44,45,52,.28),0 0 0 1px #DBDEE5;',
    'animation:pbUp .34s cubic-bezier(.2,.8,.2,1) both;max-height:74vh;overflow-y:auto}',
    '@keyframes pbUp{from{transform:translateY(16px);opacity:0}to{transform:none;opacity:1}}',
    '.pb-detail .dcode{font-size:9.5px;letter-spacing:.28em;color:#A4A6B0}',
    '.pb-detail .dname{font-size:19px;letter-spacing:.16em;margin:9px 0 16px;color:#2C2D34;font-weight:400}',
    '.pb-detail .dtext{font-size:12.5px;line-height:2.1;color:#6A6C77;white-space:pre-wrap;word-break:break-word;max-height:36vh;overflow-y:auto;letter-spacing:.02em}',
    '.pb-acts{display:flex;gap:10px;margin-top:18px}',
    '.pb-acts button{flex:1;font:inherit;font-size:12.5px;letter-spacing:.12em;border-radius:999px;padding:12px 0;',
    'border:1px solid #DBDEE5;background:none;color:#6A6C77}',
    '.pb-acts .main{background:#2C2D34;color:#F4F5F8;border-color:#2C2D34}',
    '.pb-err{font-size:12px;color:#8a7a72;line-height:2;grid-column:1 / -1;letter-spacing:.04em}',
    '.pb-err button{font:inherit;font-size:12px;color:#2C2D34;background:none;border:1px solid #DBDEE5;border-radius:999px;padding:6px 14px;margin-top:12px}'
  ].join('');

  var st = document.createElement('style');
  st.textContent = CSS;
  document.head.appendChild(st);

  var layer = document.createElement('div');
  layer.className = 'pb-layer';
  layer.innerHTML = '<div class="pb-wrap">' +
    '<div class="pb-head"><div class="pb-title">药盒</div><button class="pb-close">收起来</button></div>' +
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
      btn.innerHTML = '<div class="pb-cap" style="background:linear-gradient(158deg,#ffffff 0%,hsl(' + h + ',12%,97%) 54%,hsl(' + h + ',11%,93.5%) 100%);animation-delay:' + ((i % 5) * 0.5) + 's"></div>' +
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
