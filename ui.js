/* 顶栏选中块 + 窗口改名（长按行才出来） */
(function () {
  'use strict';

  /* ---------- 顶栏：选中那块会滑 ---------- */
  var tabs = document.getElementById('tabs');
  if (tabs) {
    var glider = document.createElement('span');
    glider.className = 'glider';
    tabs.insertBefore(glider, tabs.firstChild);

    var currentTab = function () {
      var list = tabs.querySelectorAll('.tab');
      for (var i = 0; i < list.length; i++) {
        if (list[i].classList.contains('on') && list[i].offsetParent) return list[i];
      }
      return null;
    };

    var place = function (instant) {
      var el = currentTab();
      if (!el) { glider.classList.add('hide'); return; }
      glider.classList.remove('hide');
      var tr = tabs.getBoundingClientRect();
      var r = el.getBoundingClientRect();
      if (instant) glider.style.transition = 'none';
      glider.style.width = r.width + 'px';
      glider.style.height = r.height + 'px';
      glider.style.transform = 'translate(' + (r.left - tr.left) + 'px,' + (r.top - tr.top) + 'px)';
      if (instant) {
        requestAnimationFrame(function () { glider.style.transition = ''; });
      }
    };

    tabs.addEventListener('click', function () {
      setTimeout(function () { place(false); }, 0);
    });
    window.addEventListener('resize', function () { place(true); });
    window.addEventListener('orientationchange', function () {
      setTimeout(function () { place(true); }, 220);
    });
    setTimeout(function () { place(true); }, 40);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { place(true); });
    }
    window.addEventListener('load', function () { place(true); });
  }

  /* ---------- 窗口改名 ---------- */
  var box = document.getElementById('winlist');
  if (!box) return;

  var KEY_S = 'gz_sessions_v1';
  var KEY_A = 'gz_alias_v1';

  function loadJSON(k, d) {
    try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; }
  }
  function saveJSON(k, v) {
    try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; }
  }
  function sortedSessions() {
    var s = loadJSON(KEY_S, null);
    if (!Array.isArray(s)) return [];
    return s.slice().sort(function (a, b) { return (b.t || 0) - (a.t || 0); });
  }
  function readAlias() {
    var a = loadJSON(KEY_A, {});
    return (a && typeof a === 'object') ? a : {};
  }

  function addBtn(row, id, nameEl, truth) {
    var acts = row.querySelector('.acts');
    if (!acts || acts.querySelector('.ren')) return;
    var b = document.createElement('button');
    b.className = 'ren';
    b.textContent = '改名';
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      var al = readAlias();
      var cur = al[id] || truth || '';
      var name = window.prompt('给它起个名字（留空就改回原来的）', cur);
      if (name === null) return;
      name = String(name).replace(/\s+/g, ' ').trim().slice(0, 24);
      if (name) al[id] = name; else delete al[id];
      saveJSON(KEY_A, al);
      nameEl.textContent = name || truth;
      row.classList.remove('showacts');
    });
    acts.appendChild(b);
  }

  /* 长按一行，右边才冒出「改名 / 删」；点别处收回去 */
  function bindPress(row) {
    if (row.dataset.gzPress) return;
    row.dataset.gzPress = '1';
    var timer = null;

    function cancel() {
      clearTimeout(timer);
      timer = null;
    }
    function start(e) {
      if (e.target && e.target.closest && e.target.closest('.acts')) return;
      cancel();
      timer = setTimeout(function () {
        timer = null;
        var all = box.querySelectorAll('.win.showacts');
        for (var i = 0; i < all.length; i++) all[i].classList.remove('showacts');
        row.classList.add('showacts');
        try { if (navigator.vibrate) navigator.vibrate(8); } catch (err) {}
      }, 550);
    }

    row.addEventListener('pointerdown', start, { passive: true });
    row.addEventListener('pointermove', cancel, { passive: true });
    row.addEventListener('pointerup', cancel, { passive: true });
    row.addEventListener('pointercancel', cancel, { passive: true });
    row.addEventListener('pointerleave', cancel, { passive: true });

    /* 冒出来的时候，点行本身不算打开窗口 */
    row.addEventListener('click', function (e) {
      if (!row.classList.contains('showacts')) return;
      if (e.target && e.target.closest && e.target.closest('.acts')) return;
      e.stopPropagation();
      e.preventDefault();
      row.classList.remove('showacts');
    }, true);
  }

  var busy = false;
  function decorate() {
    if (busy) return;
    busy = true;
    try {
      var list = sortedSessions();
      var rows = box.querySelectorAll('.win');
      if (!rows.length || rows.length !== list.length) return;
      var al = readAlias();
      for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var nameEl = row.querySelector('.name');
        if (!nameEl) return;
        var truth = list[i].title || '空窗口';
        var alias = al[list[i].id];
        if (nameEl.textContent !== truth && nameEl.textContent !== alias) return;
        if (alias) nameEl.textContent = alias;
        addBtn(row, list[i].id, nameEl, truth);
        bindPress(row);
      }
    } finally {
      busy = false;
    }
  }

  document.addEventListener('click', function (e) {
    var all = box.querySelectorAll('.win.showacts');
    for (var i = 0; i < all.length; i++) {
      if (!all[i].contains(e.target)) all[i].classList.remove('showacts');
    }
  });

  var timer = null;
  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(decorate, 40);
  }

  if (window.MutationObserver) {
    new MutationObserver(schedule).observe(box, { childList: true, subtree: true });
  }
  setTimeout(decorate, 300);
  window.addEventListener('load', decorate);
})();
