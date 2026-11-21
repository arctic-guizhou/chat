/* 药盒 · 白色极简 · 改样式只动这里 */
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
    'padding:calc(24px + env(safe-area-inset-top)) 20px calc(34px + env(safe-area-inset-bottom));',
    'background:#fcfcfa;color:#1b1b19;-webkit-font-smoothing:antialiased;',
    'font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Helvetica Neue",sans-serif;}',
    '.pb-layer.on{display:block;animation:pbIn .45s cubic-bezier(.2,.8,.2,1) both}',
    '@keyframes pbIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}',
    '.pb-glow{position:fixed;left:50%;top:-190px;width:600px;height:600px;transform:translateX(-50%);pointer-events:none;border-radius:50%;',
    'background:radial-gradient(circle,rgba(206,192,163,.26) 0%,rgba(240,237,229,.55) 44%,rgba(252,252,250,0) 71%);}',
    '.pb-wrap{position:relative;max-width:520px;margin:0 auto}',
    '.pb-head{display:flex;align-items:baseline;justify-content:space-between;margin:0 0 14px}',
    '.pb-title{font-size:11px;letter-spacing:.56em;color:#9a978e;font-weight:300}',
    '.pb-close{font:inherit;font-size:11px;letter-spacing:.1em;color:#aaa79e;background:none;border:0;padding:6px 0}',
    '.pb-sub{font-size:11px;color:#a5a299;letter-spacing:.05em;line-height:2.1;margin:0 0 26px}',
    '.pb-taken{display:flex;align-items:center;gap:12px;margin:0 0 24px;padding:13px 15px;border-radius:15px;',
    'background:#fff;border:1px solid #eceae3;box-shadow:0 1px 2px rgba(50,48,40,.035)}',
    '.pb-taken .t{flex:1;font-size:12px;line-height:1.6;color:#6e6c64;letter-spacing:.03em}',
    '.pb-taken .t b{font-weight:500;color:#1b1b19;letter-spacing:.05em}',
    '.pb-antidote{font:inherit;font-size:11.5px;letter-spacing:.08em;color:#fff;background:#1b1b19;border:0;border-radius:13px;padding:8px 15px;flex:none}',
    '.pb-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:28px 16px;padding:4px 0 14px}',
    '.pb-pill{display:flex;flex-direction:column;align-items:center;gap:11px;background:none;border:0;padding:0;color:inherit;font:inherit}',
    '.pb-cap{width:100%;aspect-ratio:.58;border-radius:999px;position:relative;overflow:hidden;',
    'border:1px solid rgba(0,0,0,.055);',
    'box-shadow:0 1px 1px rgba(0,0,0,.028),0 14px 28px -14px rgba(60,58,48,.28),inset 0 1px 0 #fff;',
    'animation:pbFloat 6.5s ease-in-out infinite}',
    '.pb-cap::after{content:"";position:absolute;left:15%;top:9%;width:26%;height:20%;border-radius:50%;',
    'background:rgba(255,255,255,.98);filter:blur(4px)}',
    '@keyframes pbFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}',
    '.pb-code{font-size:9.5px;letter-spacing:.22em;color:#b6b3aa}',
    '.pb-name{font-size:10.5px;color:#3a3934;letter-spacing:.06em;line-height:1.45;text-align:center}',
    '.pb-pill.sel .pb-cap{border-color:#d5c6a4;box-shadow:0 0 0 1px #dfd0b0,0 14px 30px -14px rgba(150,130,90,.32),inset 0 1px 0 #fff}',
    '.pb-detail{position:fixed;left:16px;right:16px;bottom:calc(16px + env(safe-area-inset-bottom));z-index:81;',
    'background:rgba(255,255,255,.985);border:1px solid #eceae3;border-radius:22px;',
    'padding:22px 20px 18px;box-shadow:0 -4px 44px -12px rgba(70,68,58,.22);',
    'animation:pbUp .34s cubic-bezier(.2,.8,.2,1) both;max-height:74vh;overflow-y:auto}',
    '@keyframes pbUp{from{transform:translateY(16px);opacity:0}to{transform:none;opacity:1}}',
    '.pb-detail .dcode{font-size:9.5px;letter-spacing:.24em;color:#b6b3aa}',
    '.pb-detail .dname{font-size:17px;letter-spacing:.1em;margin:8px 0 14px;color:#161614;font-weight:400}',
    '.pb-detail .dtext{font-size:12.5px;line-height:2;color:#55534c;white-space:pre-wrap;word-break:break-word;max-height:36vh;overflow-y:auto}',
    '.pb-acts{display:flex;gap:10px;margin-top:18px}',
    '.pb-acts button{flex:1;font:inherit;font-size:12.5px;letter-spacing:.1em;border-radius:15px;padding:12px 0;',
    'border:1px solid #e2dfd6;background:#fff;color:#4a4842}',
    '.pb-acts .main{background:#1b1b19;color:#fff;border-color:#1b1b19;box-shadow:0 6px 20px -8px rgba(0,0,0,.4)}',
    '.pb-err{font-size:12px;color:#9a6a5a;line-height:2;grid-column:1 / -1}',
    '.pb-err button{font:inherit;font-size:12px;color:#1b1b19;background:#fff;border:1px solid #e2dfd6;border-radius:12px;padding:7px 14px;margin-top:12px}'
  ].join('');

  var st = document.createElement('style');
  st.textContent = CSS;
  document.head.appendChild(st);

  var layer = document.createElement('div');
  layer.className = 'pb-layer';
  layer.innerHTML = '<div class="pb-glow"></div><div class="pb-wrap">' +
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
      btn.innerHTML = '<div class="pb-cap" style="background:linear-gradient(152deg,#ffffff 0%,hsl(' + h + ',10%,96.5%) 58%,hsl(' + h + ',9%,91.5%) 100%);animation-delay:' + ((i % 5) * 0.4) + 's"></div>' +
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
