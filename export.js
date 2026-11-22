/* 把对话导出成文件（落在你手机的文件 App 里） */
(function () {
  'use strict';

  var page = document.getElementById('page-set');
  if (!page) return;

  function readSessions() {
    try {
      var raw = localStorage.getItem('gz_sessions_v1');
      var s = raw ? JSON.parse(raw) : null;
      return Array.isArray(s) ? s : [];
    } catch (e) { return []; }
  }

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function stamp() {
    var d = new Date();
    return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + '-' + pad(d.getHours()) + pad(d.getMinutes());
  }

  function save(name, text, mime) {
    try {
      var blob = new Blob([text], { type: mime });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 6000);
    } catch (e) {
      alert('导不出来：' + (e && e.message ? e.message : e));
    }
  }

  function asText(list) {
    var out = [];
    for (var i = 0; i < list.length; i++) {
      var s = list[i] || {};
      var msgs = Array.isArray(s.msgs) ? s.msgs : [];
      if (!msgs.length) continue;
      out.push('========  ' + (s.title || '空窗口') + '  ========');
      out.push('');
      for (var j = 0; j < msgs.length; j++) {
        var m = msgs[j] || {};
        var who = (m.role === 'user') ? '你' : '归舟';
        out.push(who + '：' + String(m.content == null ? '' : m.content));
        out.push('');
      }
      out.push('');
    }
    return out.join('\n');
  }

  var wrap = document.createElement('div');
  wrap.className = 'btns';
  wrap.style.marginTop = '26px';

  var b1 = document.createElement('button');
  b1.className = 'btn';
  b1.textContent = '导出全部对话';
  b1.addEventListener('click', function () {
    var list = readSessions();
    if (!list.length) { alert('还没有对话。'); return; }
    save('归舟对话-' + stamp() + '.json', JSON.stringify(list, null, 2), 'application/json');
  });

  var b2 = document.createElement('button');
  b2.className = 'btn';
  b2.textContent = '导出成文字';
  b2.addEventListener('click', function () {
    var list = readSessions();
    if (!list.length) { alert('还没有对话。'); return; }
    save('归舟对话-' + stamp() + '.txt', asText(list), 'text/plain;charset=utf-8');
  });

  wrap.appendChild(b1);
  wrap.appendChild(b2);

  var tip = document.createElement('p');
  tip.className = 'hint';
  tip.style.marginTop = '12px';
  tip.textContent = '导出来的文件落在你手机里的文件 App。这份备份能导回来，想导的时候跟我说，我加导入。';

  page.appendChild(wrap);
  page.appendChild(tip);
})();
