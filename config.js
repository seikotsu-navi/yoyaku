/*
 * 院の設定（ここだけ書き換えれば、予約ページ・会員証・問診票・評価ナビ・通い方ナビ・ケガのページ・アンケートに反映されます）
 * 書き換えたら、GitHub にこのファイルだけ上げ直してください（ほかのファイルはそのまま）。
 * ※予約の返事・前日のお知らせの文に入る院名は、予約台帳の「設定」シートの「院名」で変えます（こちらとは別）。
 */
window.CLINIC_CONFIG = {
  name: '千早駅整骨院',                 // 院名（画面の院名がすべてこれに変わります）
  tel: '092-672-6640',                  // 電話番号（空 '' にすると、電話のボタン・表示を出しません）
  address: '',                          // 院の住所（今は画面に出していません。将来の表示用）
  addressExample: '福岡県福岡市東区千早◯-◯-◯ ◯◯マンション101',  // 問診票の住所欄に薄く出す例
  lineId: '@715gkvje',                  // 公式LINEのID（@から）

  // 予約台帳（Apps Script）のウェブアプリのURL（…/exec）
  gasUrl: 'https://script.google.com/macros/s/AKfycbxzSuZtADnU2dx7UCerXzRdf3JAaXN06e51kO7iij-Ovj-8BKG8KPdpGnC5CqepxBTo/exec',

  // LINE Developers の LIFF ID
  liff: {
    booking: '2012705384-LmlyZald',     // Web予約
    card: '2012705384-GfhJVuom',        // 会員証
    monshin: ''                         // 来院時の問診票（使うときだけ）
  },

  // ほかのページへのリンク
  links: {
    booking: 'https://liff.line.me/2012705384-LmlyZald',   // 予約ページ（LINEの中で開くURL）
    navi: 'https://seikotsu-navi.github.io/yoyaku/navi.html',
    price: 'https://claude.ai/artifact/3GhvKtop8ovhNpkKCjFgza',   // 料金表
    instagram: ''
  }
};

/* ===== ここから下は書き換えなくて大丈夫です =====
 * ページの中に書かれている院名・電話番号・住所の例を、上の設定に置き換える。
 * 画面があとから書き換わっても（問診票のページ送りなど）、そのたびに置き換える。
 * 入力欄に患者さんが入れた文字は書き換えない。 */
(function () {
  var C = window.CLINIC_CONFIG;
  var BASE = [['千早駅整骨院', C.name], ['092-672-6640', C.tel], ['福岡県福岡市東区千早◯-◯-◯ ◯◯マンション101', C.addressExample]];
  var MAP = BASE.filter(function (p) { return p[1] && p[0] !== p[1]; });
  if (!MAP.length) return;
  var done = typeof WeakSet === 'function' ? new WeakSet() : null;
  function fix(s) {
    MAP.forEach(function (p) { if (s.indexOf(p[0]) >= 0) s = s.split(p[0]).join(p[1]); });
    return s;
  }
  var ATTRS = ['placeholder', 'title', 'aria-label', 'alt'];
  var SKIP = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, NOSCRIPT: 1 };
  function walk(n) {
    if (!n || (done && done.has(n))) return;
    if (n.nodeType === 3) {
      var v = n.nodeValue, w = fix(v);
      if (w !== v) n.nodeValue = w;
      if (done) done.add(n);
      return;
    }
    if (n.nodeType !== 1 || SKIP[n.nodeName]) return;
    ATTRS.forEach(function (a) { var v = n.getAttribute(a); if (v) { var w = fix(v); if (w !== v) n.setAttribute(a, w); } });
    if (done) done.add(n);
    for (var c = n.firstChild; c; c = c.nextSibling) walk(c);
  }
  function fixTitle() { var t = fix(document.title); if (t !== document.title) document.title = t; }
  function start() {
    fixTitle();
    walk(document.body);
    new MutationObserver(function (ms) {
      ms.forEach(function (m) { for (var i = 0; i < m.addedNodes.length; i++) walk(m.addedNodes[i]); });
      fixTitle();
    }).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
