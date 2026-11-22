/* 让 system 的开头稳下来：把「现在是…」从最前面挪到最后 */
(function () {
  'use strict';

  if (typeof window.fetch !== 'function') return;

  var orig = window.fetch;
  var RE = /^现在是[\s\S]*?北京时间。\n\n/;

  function reorder(text) {
    if (typeof text !== 'string') return text;
    var m = text.match(RE);
    if (!m) return text;
    var rest = text.slice(m[0].length);
    var moved = m[0].replace(/\n\n$/, '');
    return rest + '\n\n' + moved;
  }

  window.fetch = function (url, opts) {
    try {
      if (opts && typeof opts.body === 'string' && opts.body.indexOf('"role":"system"') >= 0) {
        var j = JSON.parse(opts.body);
        if (j && Array.isArray(j.messages) && j.messages.length) {
          var sys = j.messages[0];
          if (sys && sys.role === 'system' && typeof sys.content === 'string') {
            var before = sys.content;
            sys.content = reorder(before);
            if (sys.content !== before) opts.body = JSON.stringify(j);
          }
        }
      }
    } catch (e) {
      /* 改不动就原样发出去，不挡请求 */
    }
    return orig.apply(this, arguments);
  };
})();
