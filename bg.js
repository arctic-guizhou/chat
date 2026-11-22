/* 设置页里的东西：聊天背景 + 正文字号 */
(function () {
  'use strict';

  /* ---------- 聊天背景 ---------- */
  var KEY_BG = 'gz_bg_v1';
  var chat = document.getElementById('page-chat');
  var prev = document.getElementById('bgprev');
  var pick = document.getElementById('bgpick');
  var clr = document.getElementById('bgclear');
  var input = document.getElementById('bgfile');

  if (chat && prev && pick && clr && input) {
    function apply(url) {
      if (!url) {
        chat.classList.remove('hasbg');
        chat.style.backgroundImage = '';
        return;
      }
      chat.classList.add('hasbg');
      chat.style.backgroundImage = 'url("' + url + '")';
    }

    function paint(url) {
      if (url) {
        prev.classList.add('has');
        prev.textContent = '';
        prev.style.backgroundImage = 'url("' + url + '")';
      } else {
        prev.classList.remove('has');
        prev.textContent = '还没有图';
        prev.style.backgroundImage = '';
      }
    }

    var saved = '';
    try { saved = localStorage.getItem(KEY_BG) || ''; } catch (e) { saved = ''; }
    apply(saved);
    paint(saved);

    pick.addEventListener('click', function () { input.click(); });

    input.addEventListener('change', function (e) {
      var f = e.target.files && e.target.files[0];
      if (!f) return;
      var reader = new FileReader();
      reader.onload = function (ev) {
        var raw = ev.target.result;
        var img = new Image();
        img.onload = function () {
          var max = 1000;
          var w = img.width, h = img.height;
          if (w > max || h > max) {
            var k = Math.min(max / w, max / h);
            w = Math.round(w * k);
            h = Math.round(h * k);
          }
          var c = document.createElement('canvas');
          c.width = w;
          c.height = h;
          c.getContext('2d').drawImage(img, 0, 0, w, h);
          var url = raw;
          try { url = c.toDataURL('image/jpeg', 0.72); } catch (err) { url = raw; }
          try {
            localStorage.setItem(KEY_BG, url);
          } catch (err2) {
            alert('存不下了。换个小的，或者先去窗口列表删几个旧的。');
            return;
          }
          apply(url);
          paint(url);
        };
        img.onerror = function () { alert('这张图读不了。'); };
        img.src = raw;
      };
      reader.onerror = function () { alert('这张图读不了。'); };
      reader.readAsDataURL(f);
      e.target.value = '';
    });

    clr.addEventListener('click', function () {
      try { localStorage.removeItem(KEY_BG); } catch (e) {}
      apply('');
      paint('');
    });
  }

  /* ---------- 正文字号 ---------- */
  var KEY_F = 'gz_font_v1';
  var SIZES = { s: '14px', m: '15px', l: '17px' };
  var btn = {
    s: document.getElementById('fss'),
    m: document.getElementById('fsm'),
    l: document.getElementById('fsl')
  };

  function applyFont(v) {
    var key = SIZES[v] ? v : 'm';
    try {
      document.documentElement.style.setProperty('--gz-fs', SIZES[key]);
    } catch (e) {}
    ['s', 'm', 'l'].forEach(function (k) {
      if (btn[k]) btn[k].classList.toggle('solid', k === key);
    });
  }

  if (btn.s || btn.m || btn.l) {
    var cur = 'm';
    try { cur = localStorage.getItem(KEY_F) || 'm'; } catch (e) { cur = 'm'; }
    applyFont(cur);

    ['s', 'm', 'l'].forEach(function (k) {
      if (!btn[k]) return;
      btn[k].addEventListener('click', function () {
        try { localStorage.setItem(KEY_F, k); } catch (e) {}
        applyFont(k);
      });
    });
  }
})();
