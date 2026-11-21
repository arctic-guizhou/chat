/* 顶栏：选中那块会滑过去 */
(function () {
  'use strict';

  var tabs = document.getElementById('tabs');
  if (!tabs) return;

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
})();
