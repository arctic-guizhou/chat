/* 聊天背景：接上设置页里那块（界面是写死在 HTML 里的） */
(function () {
  'use strict';

  var KEY = 'gz_bg_v1';
  var chat = document.getElementById('page-chat');
  var prev = document.getElementById('bgprev');
  var pick = document.getElementById('bgpick');
  var clr = document.getElementById('bgclear');
  var input = document.getElementById('bgfile');
  if (!chat || !prev || !pick || !clr || !input) return;

  if (!document.querySelector('#page-chat .bgshade')) {
    var shade = document.createElement('div');
    shade.className = 'bgshade';
    chat.insertBefore(shade, chat.firstChild);
  }

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

  function readSaved() {
    try { return localStorage.getItem(KEY) || ''; } catch (e) { return ''; }
  }

  function shrink(file, cb) {
    var reader = new FileReader();
    reader.onload = function (e) {
      var raw = e.target.result;
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
        try { cb(c.toDataURL('image/jpeg', 0.72)); } catch (err) { cb(raw); }
      };
      img.onerror = function () { cb(raw); };
      img.src = raw;
    };
    reader.onerror = function () { cb(''); };
    reader.readAsDataURL(file);
  }

  var saved = readSaved();
  apply(saved);
  paint(saved);

  pick.addEventListener('click', function () { input.click(); });

  input.addEventListener('change', function (e) {
    var f = e.target.files && e.target.files[0];
    if (!f) return;
    shrink(f, function (url) {
      if (!url) { alert('这张图读不了。'); return; }
      try {
        localStorage.setItem(KEY, url);
      } catch (err) {
        alert('存不下了。换个小的，或者先去窗口列表删几个旧的。');
        return;
      }
      apply(url);
      paint(url);
    });
    e.target.value = '';
  });

  clr.addEventListener('click', function () {
    try { localStorage.removeItem(KEY); } catch (e) {}
    apply('');
    paint('');
  });
})();
