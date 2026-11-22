/* 聊天背景：自己挑一张图 */
(function () {
  'use strict';

  var KEY = 'gz_bg_v1';
  var chat = document.getElementById('page-chat');
  var setPage = document.getElementById('page-set');
  if (!chat || !setPage) return;

  var st = document.createElement('style');
  st.textContent = [
    '#page-chat.hasbg{position:relative;background-size:cover;background-position:center;background-repeat:no-repeat}',
    '#page-chat.hasbg .bgshade{position:absolute;inset:0;background:var(--bg);opacity:.8;pointer-events:none;z-index:0}',
    '#page-chat.hasbg #msgs{position:relative;z-index:1}',
    '.bgprev{width:100%;height:130px;border-radius:10px;border:1px solid var(--line);background:var(--fill) center/cover no-repeat;margin:0 0 12px;display:flex;align-items:center;justify-content:center;font-size:12px;color:var(--sub)}',
    '.bgprev.has{color:transparent}'
  ].join('\n');
  document.head.appendChild(st);

  var shade = document.createElement('div');
  shade.className = 'bgshade';
  chat.insertBefore(shade, chat.firstChild);

  function apply(url) {
    if (!url) {
      chat.classList.remove('hasbg');
      chat.style.backgroundImage = '';
      return;
    }
    chat.classList.add('hasbg');
    chat.style.backgroundImage = 'url("' + url + '")';
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

  /* ---------- 设置页里的那一块 ---------- */
  var sep = document.createElement('div');
  sep.className = 'sep';
  setPage.appendChild(sep);

  var h = document.createElement('p');
  h.className = 'title';
  h.textContent = '聊 天 背 景';
  setPage.appendChild(h);

  var prev = document.createElement('div');
  prev.className = 'bgprev';
  prev.textContent = '还没有图';
  setPage.appendChild(prev);

  var btns = document.createElement('div');
  btns.className = 'btns';
  setPage.appendChild(btns);

  var pick = document.createElement('button');
  pick.className = 'btn solid';
  pick.textContent = '选一张图';
  btns.appendChild(pick);

  var clr = document.createElement('button');
  clr.className = 'btn';
  clr.textContent = '清掉';
  btns.appendChild(clr);

  var tip = document.createElement('p');
  tip.className = 'hint';
  tip.style.marginTop = '12px';
  tip.textContent = '图只存在这台手机里，存之前会先压小。聊天的时候图片上面会盖一层底色，字才不会看不清。';
  setPage.appendChild(tip);

  var input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.style.display = 'none';
  setPage.appendChild(input);

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
