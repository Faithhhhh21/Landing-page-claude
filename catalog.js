(function () {
  'use strict';
  var C = window.CATALOG;
  if (!C) return;

  var ICON = '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/></svg>';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var grid = $('#grid'), count = $('#count'), search = $('#search');
  var overlay = $('#overlay'), lastFocus = null;

  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function src(u) { return esc(encodeURI(u)); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  // Page text
  $('#eyebrow').textContent = C.eyebrow;
  $('#title').textContent = C.title;
  $('#intro').textContent = C.intro;

  // Reveal on scroll
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.08 }) : null;

  function render(list) {
    if (!list.length) { grid.innerHTML = '<p class="empty">Produk tidak ditemukan. Coba kata kunci lain.</p>'; count.innerHTML = '<b>0</b> produk'; return; }
    grid.innerHTML = list.map(function (p, i) {
      return '<button class="card" type="button" data-i="' + p.i + '" style="transition-delay:' + Math.min(i % 8, 7) * 45 + 'ms" aria-haspopup="dialog">' +
        '<div class="thumb">' + (p.img ? '<img loading="lazy" decoding="async" src="' + src(p.img) + '" alt="' + esc(p.name) + '">' : ICON) + '<span class="num">' + pad(p.i + 1) + '</span></div>' +
        '<div class="body"><h3>' + esc(p.name) + '</h3><p>' + esc(p.desc) + '</p><span class="more">Lihat detail <i>→</i></span></div></button>';
    }).join('');
    count.innerHTML = 'Menampilkan <b>' + list.length + '</b> dari ' + C.items.length + ' produk';
    var cards = grid.querySelectorAll('.card');
    cards.forEach(function (c) { io ? io.observe(c) : c.classList.add('in'); });
  }

  var items = C.items.map(function (it, i) { return { i: i, name: it[0], desc: it[1], img: it[2] || '' }; });
  render(items);

  search.addEventListener('input', function () {
    var q = search.value.trim().toLowerCase();
    render(items.filter(function (p) { return (p.name + ' ' + p.desc).toLowerCase().indexOf(q) > -1; }));
  });

  // Modal
  function open(i, trigger) {
    var p = items[i]; lastFocus = trigger;
    $('#m-title').textContent = p.name;
    $('#m-desc').textContent = p.desc + ' Deskripsi ini adalah placeholder — ganti dengan informasi lengkap produk: bahan, keunggulan, dan kegunaan.';
    $('#m-visual').innerHTML = (p.img ? '<img src="' + src(p.img) + '" alt="' + esc(p.name) + '">' : ICON);
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lock');
    $('#m-close').focus();
  }
  function close() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lock');
    if (lastFocus) lastFocus.focus();
  }

  grid.addEventListener('click', function (e) {
    var card = e.target.closest('.card');
    if (card) open(+card.dataset.i, card);
  });
  overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
  $('#m-close').addEventListener('click', close);
  $('#m-back').addEventListener('click', close);
  document.addEventListener('keydown', function (e) {
    if (!overlay.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') { // simple focus trap
      var f = overlay.querySelectorAll('button,a[href]');
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // Header shadow on scroll
  var hdr = $('.site-header');
  window.addEventListener('scroll', function () { hdr.classList.toggle('scrolled', window.scrollY > 8); }, { passive: true });
})();
