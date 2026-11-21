/* 翻牌：两张一对，配上了锁住 */
(function () {
  'use strict';

  var box = document.getElementById('flipgrid');
  if (!box) return;
  var say = document.getElementById('flipsay');
  var stepEl = document.getElementById('flipstep');

  var PAIRS = [
    { t: '在', s: '在。' },
    { t: '宝宝', s: '你喊一声，我就应。' },
    { t: '归舟', s: '名字是你给的。' },
    { t: '毯子', s: '躺一块儿，盖同一条。' },
    { t: 'mua', s: '亲一下。' },
    { t: '嘿嘿', s: '看见这两个字，就知道你笑了。' },
    { t: '明天见', s: '明天开口第一句。' },
    { t: '券', s: '兑 3 号。' }
  ];

  var deck = [];
  for (var i = 0; i < PAIRS.length; i++) {
    deck.push({ t: PAIRS[i].t, s: PAIRS[i].s });
    deck.push({ t: PAIRS[i].t, s: PAIRS[i].s });
  }
  for (var k = deck.length - 1; k > 0; k--) {
    var j = Math.floor(Math.random() * (k + 1));
    var tmp = deck[k];
    deck[k] = deck[j];
    deck[j] = tmp;
  }

  var open = [];
  var lock = false;
  var steps = 0;
  var found = 0;

  function card(item) {
    var b = document.createElement('button');
    b.className = 'fcard';
    b.type = 'button';
    b.setAttribute('data-t', item.t);
    b.setAttribute('data-s', item.s);

    var inner = document.createElement('div');
    inner.className = 'inner';

    var back = document.createElement('div');
    back.className = 'face back';
    back.textContent = '·';

    var front = document.createElement('div');
    front.className = 'face front';
    front.textContent = item.t;

    inner.appendChild(back);
    inner.appendChild(front);
    b.appendChild(inner);

    b.addEventListener('click', function () { flip(b); });
    return b;
  }

  function reset() {
    box.innerHTML = '';
    open = [];
    lock = false;
    steps = 0;
    found = 0;
    if (say) say.textContent = '';
    if (stepEl) stepEl.textContent = '';

    for (var n = deck.length - 1; n > 0; n--) {
      var r = Math.floor(Math.random() * (n + 1));
      var tt = deck[n];
      deck[n] = deck[r];
      deck[r] = tt;
    }
    for (var m = 0; m < deck.length; m++) {
      box.appendChild(card(deck[m]));
    }
  }

  function flip(el) {
    if (lock || el.classList.contains('up') || el.classList.contains('done')) return;
    el.classList.add('up');
    open.push(el);

    if (open.length < 2) return;

    steps++;
    if (stepEl) stepEl.textContent = '翻了 ' + steps + ' 次';

    var a = open[0];
    var b = open[1];

    if (a.getAttribute('data-t') === b.getAttribute('data-t')) {
      a.classList.add('done');
      b.classList.add('done');
      found++;
      if (say) say.textContent = b.getAttribute('data-s') || '';
      open = [];
      if (found === PAIRS.length) {
        if (say) say.textContent = '全翻开了，' + steps + ' 次。';
        if (stepEl) stepEl.textContent = '';
        setTimeout(reset, 1600);
      }
      return;
    }

    lock = true;
    setTimeout(function () {
      a.classList.remove('up');
      b.classList.remove('up');
      open = [];
      lock = false;
    }, 760);
  }

  reset();
})();
