(function (root) {
  'use strict';
  var SALT = 'ar-exam-2026|';
  var MAX = 28;
  var MERGE = { 'عبد': 1, 'ابو': 1, 'ام': 1, 'ابن': 1, 'بن': 1, 'ذو': 1 };

  // ---------- SHA-256 (pure JS, works on file:// and http) ----------
  var K = [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
  function utf8(str) {
    var s = unescape(encodeURIComponent(str)), a = new Array(s.length);
    for (var i = 0; i < s.length; i++) a[i] = s.charCodeAt(i);
    return a;
  }
  function sha256hex(str) {
    var m = utf8(str), l = m.length, h = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
    m.push(0x80);
    while (m.length % 64 !== 56) m.push(0);
    var hi = Math.floor(l * 8 / 4294967296), lo = (l * 8) >>> 0;
    m.push((hi >>> 24) & 255, (hi >>> 16) & 255, (hi >>> 8) & 255, hi & 255, (lo >>> 24) & 255, (lo >>> 16) & 255, (lo >>> 8) & 255, lo & 255);
    for (var o = 0; o < m.length; o += 64) {
      var w = new Array(64), i;
      for (i = 0; i < 16; i++) w[i] = (m[o+4*i] << 24) | (m[o+4*i+1] << 16) | (m[o+4*i+2] << 8) | m[o+4*i+3];
      for (i = 16; i < 64; i++) {
        var a15 = w[i-15], a2 = w[i-2];
        var s0 = ((a15 >>> 7) | (a15 << 25)) ^ ((a15 >>> 18) | (a15 << 14)) ^ (a15 >>> 3);
        var s1 = ((a2 >>> 17) | (a2 << 15)) ^ ((a2 >>> 19) | (a2 << 13)) ^ (a2 >>> 10);
        w[i] = (w[i-16] + s0 + w[i-7] + s1) | 0;
      }
      var a = h[0], b = h[1], c = h[2], d = h[3], e = h[4], f = h[5], g = h[6], hh = h[7];
      for (i = 0; i < 64; i++) {
        var S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
        var ch = (e & f) ^ (~e & g);
        var t1 = (hh + S1 + ch + K[i] + w[i]) | 0;
        var S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
        var mj = (a & b) ^ (a & c) ^ (b & c);
        var t2 = (S0 + mj) | 0;
        hh = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
      }
      h[0] = (h[0] + a) | 0; h[1] = (h[1] + b) | 0; h[2] = (h[2] + c) | 0; h[3] = (h[3] + d) | 0;
      h[4] = (h[4] + e) | 0; h[5] = (h[5] + f) | 0; h[6] = (h[6] + g) | 0; h[7] = (h[7] + hh) | 0;
    }
    var out = '';
    for (var j = 0; j < 8; j++) out += ('00000000' + (h[j] >>> 0).toString(16)).slice(-8);
    return out;
  }
  function H(x) { return sha256hex(SALT + x).slice(0, 20); }

  // ---------- Arabic name normalisation ----------
  function norm(s) {
    s = String(s).normalize('NFKC')
      .replace(/[\u064B-\u065F\u0670\u0640\u200e\u200f\u202a-\u202e]/g, '')
      .replace(/[إأآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي')
      .replace(/[^\u0621-\u064A ]/g, ' ');
    return s.split(/\s+/).filter(Boolean);
  }
  function tokens(s) {
    var w = norm(s), out = [], i = 0;
    while (i < w.length) {
      if (MERGE[w[i]] && i + 1 < w.length) { out.push(w[i] + w[i + 1]); i += 2; }
      else { out.push(w[i]); i += 1; }
    }
    return out;
  }

  // ---------- lookup ----------
  // returns {status:'ok',score} | 'blocked' | 'ambiguous' | 'notfound' | 'short'
  function lookup(name, section, data) {
    var t = tokens(name);
    if (t.length < 3) return { status: 'short' };
    var joined = t.join(' ');
    if (data.b.indexOf(H('B|' + joined)) !== -1) return { status: 'blocked' };
    var exact = data.s[H('F|' + section + '|' + joined)];
    if (exact !== undefined) return exact === -1 ? { status: 'ambiguous' } : { status: 'ok', score: exact };
    var v = data.s[H(section + '|' + joined)];
    if (v === undefined) return { status: 'notfound' };
    if (v === -1) return { status: 'ambiguous' };
    return { status: 'ok', score: v };
  }
  root.Core = { lookup: lookup, tokens: tokens, sha256hex: sha256hex, MAX: MAX };

  // ---------- UI ----------
  if (typeof document === 'undefined') return;
  var LABELS = { a: 'أ', b: 'ب', c: 'ج', d: 'د', e: 'هـ', f: 'و' };
  var form = document.getElementById('form'), nameEl = document.getElementById('name'),
      msg = document.getElementById('msg'), card = document.getElementById('card'),
      sectionVal = '';
  var chips = document.querySelectorAll('.chip');
  Array.prototype.forEach.call(chips, function (c) {
    c.addEventListener('click', function () {
      Array.prototype.forEach.call(chips, function (x) { x.setAttribute('aria-checked', 'false'); });
      c.setAttribute('aria-checked', 'true'); sectionVal = c.getAttribute('data-v'); hide();
    });
  });
  function hide() { msg.hidden = true; card.hidden = true; }
  function showMsg(t, kind) { card.hidden = true; msg.className = 'msg ' + (kind || 'err'); msg.textContent = t; msg.hidden = false; }
  nameEl.addEventListener('input', hide);
  form.addEventListener('submit', function (ev) {
    ev.preventDefault(); hide();
    var name = nameEl.value.replace(/\s+/g, ' ').trim();
    if (!name) return showMsg('اكتب اسمك ثلاثي أو رباعي.');
    if (!sectionVal) return showMsg('اختر الشعبة.');
    var r = lookup(name, sectionVal, root.RESULTS);
    if (r.status === 'blocked') return showMsg('شو دخلك', 'fun');
    if (r.status === 'short') return showMsg('اكتب اسمك ثلاثي أو رباعي على الأقل.');
    if (r.status === 'ambiguous') return showMsg('يوجد أكثر من اسم مطابق في هذه الشعبة. اكتب اسمك الرباعي كاملاً.');
    if (r.status === 'notfound') return showMsg('لا توجد نتيجة بهذا الاسم في الشعبة المختارة. تأكد من كتابة الاسم كما في حسابك المدرسي ومن اختيار شعبتك الصحيحة.');
    document.getElementById('r-name').textContent = name;
    document.getElementById('r-sec').textContent = 'الشعبة ' + LABELS[sectionVal];
    document.getElementById('r-score').textContent = r.score;
    document.getElementById('r-max').textContent = 'من ' + MAX;
    var pct = Math.round(r.score / MAX * 100);
    document.getElementById('r-pct').textContent = 'النسبة ' + pct + '%';
    var ring = document.getElementById('ring');
    ring.style.setProperty('--p', 0);
    card.hidden = false;
    setTimeout(function () { ring.style.setProperty('--p', r.score / MAX * 100); }, 60);
    if (card.scrollIntoView) card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
})(typeof window !== 'undefined' ? window : globalThis);
