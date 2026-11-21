/* 顶栏选中块 + 窗口改名（左滑才出来） */
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

  /* ---------- 窗口：左滑露出改名 / 删 ---------- */
  var box = document.getElementById('winlist');
  if (!box) return;

  var KEY_S = 'gz_sessions_v1';
  var KEY_A = 'gz_alias_v1';
  var SLOT = 96;

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

  function parts(row) {
    return { txt: row.querySelector('.txt'), acts: row.querySelector('.acts') };
  }

  function settle(row, open) {
    var p = parts(row);
    if (!p.txt || !p.acts) return;
    p.txt.style.transform = open ? 'translateX(-' + SLOT + 'px)' : '';
    p.acts.style.transform = open ? 'translateX(0)' : '';
    if (open) row.dataset.gzOpen = '1'; else delete row.dataset.gzOpen;
  }

  function closeAll(except) {
    var rows = box.querySelectorAll('.win');
    for (var i = 0; i < rows.length; i++) {
      if (rows[i] !== except && rows[i].dataset.gzOpen) settle(rows[i], false);
    }
  }

  function addBtn(row, id, nameEl, truth) {
    var p = parts(row);
    if (!p.acts || p.acts.querySelector('.ren')) return;
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
      settle(row, false);
    });
    p.acts.appendChild(b);
  }

  function bindSwipe(row) {
    if (row.dataset.gzSwipe) return;
    row.dataset.gzSwipe = '1';

    var startX = 0, startY = 0, base = 0, cur = 0;
    var dragging = false, decided = false, leaked = false;

    function paint(v) {
      var p = parts(row);
      if (!p.txt || !p.acts) return;
      p.txt.style.transform = 'translateX(' + v + 'px)';
      p.acts.style.transform = 'translateX(' + (SLOT + v) + 'px)';
    }

    function freeze() {
      var p = parts(row);
      if (p.txt) p.txt.style.transition = 'none';
      if (p.acts) p.acts.style.transition = 'none';
    }

    function thaw() {
      var p = parts(row);
      if (p.txt) p.txt.style.transition = '';
      if (p.acts) p.acts.style.transition = '';
    }

    row.addEventListener('touchstart', function (e) {
      if (e.target && e.target.closest && e.target.closest('.acts')) return;
      closeAll(row);
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      base = row.dataset.gzOpen ? -SLOT : 0;
      cur = base;
      dragging = true;
      decided = false;
      leaked = false;
      freeze();
    }, { passive: true });

    row.addEventListener('touchmove', function (e) {
      if (!dragging) return;
      var dx = e.touches[0].clientX - startX;
      var dy = e.touches[0].clientY - startY;
      if (!decided) {
        if (Math.abs(dx) < 6) return;
        /* 竖着明显多于横着，就当作在滚页面，不抢 */
        if (Math.abs(dy) > Math.abs(dx) * 1.8 && Math.abs(dy) > 12) {
          dragging = false;
          thaw();
          return;
        }
        decided = true;
        leaked = true;
      }
      var v = base + dx;
      if (v > 0) v = 0;
      if (v < -SLOT) v = -SLOT;
      cur = v;
      paint(v);
      if (e.cancelable) e.preventDefault();
    }, { passive: false });

    function end() {
      if (!dragging && !decided) return;
      dragging = false;
      thaw();
      if (decided) settle(row, cur < -SLOT * 0.35);
      decided = false;
    }
    row.addEventListener('touchend', end);
    row.addEventListener('touchcancel', end);

    row.addEventListener('click', function (e) {
      if (leaked) {
        e.stopPropagation();
        e.preventDefault();
        leaked = false;
        return;
      }
      if (row.dataset.gzOpen) {
        if (e.target && e.target.closest && e.target.closest('.acts')) return;
        e.stopPropagation();
        e.preventDefault();
        settle(row, false);
      }
    }, true);
  }

  function decorate() {
    var list = sortedSessions();
    var rows = box.querySelectorAll('.win');
    if (!rows.length) return;
    var al = readAlias();
    var sameCount = rows.length === list.length;
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      bindSwipe(row);
      if (!sameCount) continue;
      var nameEl = row.querySelector('.name');
      if (!nameEl) continue;
      var truth = list[i].title || '空窗口';
      var alias = al[list[i].id];
      if (nameEl.textContent !== truth && nameEl.textContent !== alias) continue;
      if (alias) nameEl.textContent = alias;
      addBtn(row, list[i].id, nameEl, truth);
    }
  }

  document.addEventListener('touchstart', function (e) {
    var rows = box.querySelectorAll('.win');
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].dataset.gzOpen && !rows[i].contains(e.target)) settle(rows[i], false);
    }
  }, { passive: true });

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
