/* 顶栏：⋯ 横向展开 + 选中块滑动 */
(function () {
  'use strict';

  var tabs = document.getElementById('tabs');
  if (!tabs) return;
  var btn = document.getElementById('moreBtn');

  /* 选中块：先插进去，再让它跟着走 */
  var glider = document.createElement('span');
  glider.className = 'glider';
  tabs.insertBefore(glider, tabs.firstChild);

  function currentTab() {
    var list = tabs.querySelectorAll('.tab');
    for (var i = 0; i < list.length; i++) {
      if (list[i].classList.contains('on') && list[i].offsetParent) return list[i];
    }
    return null;
  }

  function place(instant) {
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
  }

  function shut() {
    tabs.classList.remove('open');
    if (btn) btn.textContent = '⋯';
    place(false);
  }

  if (btn) {
    btn.addEventListener('click', function () {
      var open = tabs.classList.toggle('open');
      btn.textContent = open ? '×' : '⋯';
      setTimeout(function () { place(true); }, 20);
    });
  }

  /* 点了菜单里那两项，切完页就把菜单收回去 */
  tabs.addEventListener('click', function (e) {
    var t = e.target;
    if (t && t.classList && t.classList.contains('more-tab')) setTimeout(shut, 0);
  });

  /* 点任何一个 tab，选中块就滑过去 */
  tabs.addEventListener('click', function () {
    setTimeout(function () { place(false); }, 0);
  });

  window.addEventListener('resize', function () { place(true); });
  window.addEventListener('orientationchange', function () {
    setTimeout(function () { place(true); }, 200);
  });

  setTimeout(function () { place(true); }, 40);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { place(true); });
  }
  window.addEventListener('load', function () { place(true); });
})();
