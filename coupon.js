/* 券 · 一天一张，现写不用抽 */
(function () {
  'use strict';

  var KEY = 'gz_coupon_v1';

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function todayKey() {
    var d = new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }
  function pretty(k) { var p = String(k).split('-'); return p[0] + '.' + p[1] + '.' + p[2]; }
  function loadAll() {
    try {
      var raw = localStorage.getItem(KEY);
      var o = raw ? JSON.parse(raw) : null;
      return (o && typeof o === 'object') ? o : {};
    } catch (e) { return {}; }
  }
  function saveAll(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }
  function cfgNow() {
    try {
      var raw = localStorage.getItem('gz_cfg_v1');
      var c = raw ? JSON.parse(raw) : null;
      if (!c || !c.url || !c.key) return null;
      return c;
    } catch (e) { return null; }
  }

  var tk = document.getElementById('tk');
  if (!tk) return;
  var tkno = document.getElementById('tkno');
  var tkwish = document.getElementById('tkwish');
  var tkhint = document.getElementById('tkhint');
  var tkstamp = document.getElementById('tkstamp');
  var tkdraw = document.getElementById('tkdraw');
  var tkpast = document.getElementById('tkpast');

  var data = loadAll();
  var busy = false;

  function noOf(rec) { return 'P' + pad(rec.no || 0); }

  function showEmpty() {
    tk.className = 'tk';
    tkno.textContent = '—';
    tkwish.textContent = '今天还没写。';
    tkhint.textContent = '点一下，我现写一张。';
    tkstamp.classList.remove('on');
    tkdraw.disabled = false;
    tkdraw.textContent = '写 一 张';
  }

  function showTicket(rec) {
    tk.className = 'tk';
    tkno.textContent = noOf(rec);
    tkwish.textContent = rec.t || '';
    tkhint.textContent = rec.h || '';
    tkstamp.classList.add('on');
    tkdraw.disabled = true;
    tkdraw.textContent = '今天写过了 · 明天再来';
  }

  function fail(msg) {
    tk.className = 'tk';
    tkno.textContent = '—';
    tkwish.textContent = msg;
    tkhint.textContent = '';
    tkstamp.classList.remove('on');
    tkdraw.disabled = false;
    tkdraw.textContent = '再写一次';
  }

  function renderPast() {
    var today = todayKey();
    var keys = Object.keys(data).filter(function (k) {
      return k !== today && data[k] && data[k].t;
    }).sort().reverse().slice(0, 5);
    tkpast.innerHTML = '';
    if (!keys.length) {
      var e = document.createElement('div');
      e.className = 'tkrow';
      e.textContent = '空的。';
      tkpast.appendChild(e);
      return;
    }
    keys.forEach(function (k) {
      var rec = data[k];
      var row = document.createElement('div');
      row.className = 'tkrow';
      var b = document.createElement('b');
      b.textContent = pretty(k).slice(5) + ' ' + noOf(rec);
      var sp = document.createElement('span');
      sp.textContent = rec.t;
      row.appendChild(b);
      row.appendChild(sp);
      tkpast.appendChild(row);
    });
  }

  var PROMPT = [
    '给飞砸写一张今天的券。',
    '这张券的意思是：归舟今天欠她一件事，得办。挑一件他平时不会主动做、但真做出来她会心头软一下的小事。',
    '要求：券面一句话说完，24 字以内，要具体、有人味，不写空话套话；',
    '不写会伤到她的事，不写身体部位，不写成人内容，不写自己做不到的承诺。',
    '再给一句兑现说明，20 字以内，写清怎么用。',
    '只输出一个 JSON 对象：{"t":"券面那句","h":"兑现说明"}。不要代码块，不要解释。'
  ].join('\n');

  function generate() {
    var cfg = cfgNow();
    if (!cfg) {
      fail('先去设置里把接口和密钥填上。');
      return;
    }
    busy = true;
    tk.className = 'tk out';
    tkno.textContent = '…';
    tkwish.textContent = '想呢。';
    tkhint.textContent = '';
    tkstamp.classList.remove('on');
    tkdraw.disabled = true;
    tkdraw.textContent = '在写…';

    fetch(cfg.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + cfg.key },
      body: JSON.stringify({
        model: cfg.model || 'deepseek-chat',
        temperature: 1.05,
        max_tokens: 250,
        messages: [{ role: 'user', content: PROMPT }]
      })
    }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    }).then(function (j) {
      var out = (j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || '';
      var m = out.match(/\{[\s\S]*\}/);
      var obj = null;
      try { obj = JSON.parse(m ? m[0] : out); } catch (e) { obj = null; }
      if (!obj || !obj.t) throw new Error('没写出东西');
      var k = todayKey();
      var seq = (typeof data.seq === 'number' ? data.seq : 0) + 1;
      data.seq = seq;
      var rec = { no: seq, t: String(obj.t).slice(0, 80), h: String(obj.h || '').slice(0, 60) };
      data[k] = rec;
      saveAll(data);
      tk.classList.remove('out');
      showTicket(rec);
      renderPast();
    }).catch(function (err) {
      tk.classList.remove('out');
      fail('没写成：' + (err && err.message ? err.message : '不知道哪儿断了'));
    }).then(function () {
      busy = false;
    });
  }

  tkdraw.addEventListener('click', function () {
    if (tkdraw.disabled || busy) return;
    generate();
  });

  var today = data[todayKey()];
  if (today && today.t) showTicket(today);
  else showEmpty();
  renderPast();
})();
