/* 设置页：聊天背景 + 字号 + 自定义字体 */
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
    var shade = document.querySelector('#page-chat .bgshade');
    if (!shade) {
      shade = document.createElement('div');
      shade.className = 'bgshade';
      chat.insertBefore(shade, chat.firstChild);
    }

    var applyBg = function (url) {
      if (!url) {
        chat.classList.remove('hasbg');
        if (shade) shade.style.backgroundImage = '';
        return;
      }
      chat.classList.add('hasbg');
      if (shade) shade.style.backgroundImage = 'url("' + url + '")';
    };

    var paint = function (url) {
      if (url) {
        prev.classList.add('has');
        prev.textContent = '';
        prev.style.backgroundImage = 'url("' + url + '")';
      } else {
        prev.classList.remove('has');
        prev.textContent = '还没有图';
        prev.style.backgroundImage = '';
      }
    };

    var savedBg = '';
    try { savedBg = localStorage.getItem(KEY_BG) || ''; } catch (e) { savedBg = ''; }
    applyBg(savedBg);
    paint(savedBg);

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
          applyBg(url);
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
      applyBg('');
      paint('');
    });
  }

  /* ---------- 字号 ---------- */
  var KEY_F = 'gz_font_v1';
  var SIZES = { s: '14px', m: '15px', l: '17px' };
  var fsBtn = {
    s: document.getElementById('fss'),
    m: document.getElementById('fsm'),
    l: document.getElementById('fsl')
  };

  var applySize = function (v) {
    var key = SIZES[v] ? v : 'm';
    try {
      document.documentElement.style.setProperty('--gz-fs', SIZES[key]);
    } catch (e) {}
    ['s', 'm', 'l'].forEach(function (k) {
      if (fsBtn[k]) fsBtn[k].classList.toggle('solid', k === key);
    });
  };

  if (fsBtn.s || fsBtn.m || fsBtn.l) {
    var curSize = 'm';
    try { curSize = localStorage.getItem(KEY_F) || 'm'; } catch (e) { curSize = 'm'; }
    applySize(curSize);

    ['s', 'm', 'l'].forEach(function (k) {
      if (!fsBtn[k]) return;
      fsBtn[k].addEventListener('click', function () {
        try { localStorage.setItem(KEY_F, k); } catch (e) {}
        applySize(k);
      });
    });
  }

  /* ---------- 自定义字体 ---------- */
  var fPick = document.getElementById('fpick');
  var fClear = document.getElementById('fclear');
  var fFile = document.getElementById('ffile');
  var fName = document.getElementById('fname');
  if (!fPick || !fClear || !fFile || !fName) return;

  var DB = 'gz_font_db';
  var STORE = 'blob';
  var FACE = 'GZUserFont';

  var openDB = function (cb) {
    if (!window.indexedDB) { cb(null); return; }
    var req;
    try { req = indexedDB.open(DB, 1); } catch (e) { cb(null); return; }
    req.onupgradeneeded = function () {
      try { req.result.createObjectStore(STORE); } catch (e) {}
    };
    req.onsuccess = function () { cb(req.result); };
    req.onerror = function () { cb(null); };
  };

  var dbPut = function (buf, name, cb) {
    openDB(function (db) {
      if (!db) { cb(false); return; }
      try {
        var tx = db.transaction(STORE, 'readwrite');
        var st = tx.objectStore(STORE);
        st.put(buf, 'file');
        st.put(name, 'name');
        tx.oncomplete = function () { cb(true); };
        tx.onerror = function () { cb(false); };
      } catch (e) { cb(false); }
    });
  };

  var dbGet = function (cb) {
    openDB(function (db) {
      if (!db) { cb(null, ''); return; }
      try {
        var tx = db.transaction(STORE, 'readonly');
        var st = tx.objectStore(STORE);
        var rf = st.get('file');
        var rn = st.get('name');
        rf.onsuccess = function () {
          rn.onsuccess = function () {
            cb(rf.result || null, rn.result || '');
          };
        };
        rf.onerror = function () { cb(null, ''); };
      } catch (e) { cb(null, ''); }
    });
  };

  var dbClear = function (cb) {
    openDB(function (db) {
      if (!db) { cb(); return; }
      try {
        var tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).delete('file');
        tx.objectStore(STORE).delete('name');
        tx.oncomplete = function () { cb(); };
        tx.onerror = function () { cb(); };
      } catch (e) { cb(); }
    });
  };

  var useFont = function (buf, name) {
    if (!window.FontFace || !document.fonts) {
      fName.textContent = '这个浏览器不认自定义字体。';
      return;
    }
    var face;
    try {
      face = new FontFace(FACE, buf);
    } catch (e) {
      fName.textContent = '这个字体读不了，换个文件试试。';
      return;
    }
    face.load().then(function (loaded) {
      try { document.fonts.add(loaded); } catch (e) {}
      document.documentElement.style.setProperty('--gz-font', '"' + FACE + '", -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif');
      fName.textContent = '现在用的是：' + (name || '自定义字体');
      fPick.classList.remove('solid');
      fClear.classList.add('solid');
    }).catch(function () {
      fName.textContent = '这个字体加载不了，可能格式不对。';
    });
  };

  var resetFont = function () {
    try {
      document.documentElement.style.removeProperty('--gz-font');
    } catch (e) {}
    fName.textContent = '现在用的是系统的字。';
    fClear.classList.remove('solid');
    fPick.classList.add('solid');
  };

  dbGet(function (buf, name) {
    if (buf) useFont(buf, name);
    else {
      fName.textContent = '现在用的是系统的字。';
      fPick.classList.add('solid');
    }
  });

  fPick.addEventListener('click', function () { fFile.click(); });

  fFile.addEventListener('change', function (e) {
    var f = e.target.files && e.target.files[0];
    if (!f) return;
    if (f.size > 30 * 1024 * 1024) {
      alert('这个字体太大了（超过 30 兆），换一个小点的。');
      e.target.value = '';
      return;
    }
    fName.textContent = '正在读 ' + f.name + '…';
    var r = new FileReader();
    r.onload = function (ev) {
      var buf = ev.target.result;
      dbPut(buf, f.name, function (ok) {
        if (!ok) {
          fName.textContent = '存不下来，这个浏览器不让存。';
          return;
        }
        useFont(buf, f.name);
      });
    };
    r.onerror = function () { fName.textContent = '这个文件读不了。'; };
    r.readAsArrayBuffer(f);
    e.target.value = '';
  });

  fClear.addEventListener('click', function () {
    dbClear(function () {
      resetFont();
    });
  });
})();
