/* ==========================================================================
   Inti undangan — data dari config, RSVP, musik, hitung mundur, galeri, sampul.
   Isi undangan diatur di js/config.js. File ini tidak perlu diubah.
   ========================================================================== */
(function () {
  'use strict';

  const C = window.UNDANGAN;
  if (!C) {
    console.error('[undangan] js/config.js belum dimuat.');
    return;
  }

  /* Undangan selalu dimulai dari sampul: jangan pulihkan posisi scroll lama saat
     halaman di-reload (kalau dipulihkan, animasi di posisi itu terlanjur diputar
     di balik sampul dan tamu tidak melihatnya). */
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  /* Folder proyek = satu tingkat di atas js/core.js, jadi path foto di
     config.js selalu dihitung dari folder utama undangan. */
  const scriptSrc = document.currentScript && document.currentScript.src;
  const ROOT = new URL('../', scriptSrc || location.href);
  const TZ = C.timeZone || 'Asia/Jakarta';
  const TZ_LABEL = C.timeZoneLabel || 'WIB';
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  /* ------------------------------------------------------------------ */
  /* DOM                                                                 */
  /* ------------------------------------------------------------------ */

  function h(tag, props, ...children) {
    const el = document.createElement(tag);
    if (props) {
      Object.keys(props).forEach(key => {
        const val = props[key];
        if (val == null || val === false) return;
        if (key === 'class') el.className = val;
        else if (key.slice(0, 2) === 'on') el.addEventListener(key.slice(2), val);
        else el.setAttribute(key, val === true ? '' : val);
      });
    }
    children.flat(Infinity).forEach(child => {
      if (child == null || child === false || child === '') return;
      el.append(child instanceof Node ? child : document.createTextNode(String(child)));
    });
    return el;
  }

  function icon(name, cls) {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', cls || 'icon');
    svg.setAttribute('aria-hidden', 'true');
    const use = document.createElementNS(SVG_NS, 'use');
    use.setAttribute('href', '#' + (name.indexOf('i-') === 0 ? name : 'i-' + name));
    svg.appendChild(use);
    return svg;
  }

  function removeSection(id) {
    const section = document.getElementById(id);
    if (section) section.remove();
    $$('[data-nav="' + id + '"]').forEach(link => {
      const item = link.closest('li');
      (item || link).remove();
    });
  }

  /* ------------------------------------------------------------------ */
  /* Foto & placeholder                                                  */
  /* ------------------------------------------------------------------ */

  function asset(path) {
    if (!path) return '';
    if (/^([a-z][a-z\d+.-]*:|\/)/i.test(path)) return path;
    return new URL(path, ROOT).href;
  }

  /* Warna placeholder — diatur js/main.js sebelum render */
  const placeholderStyle = { from: '#E9E3D4', to: '#C3CDB6', ink: '#46573F' };

  function placeholder(label) {
    const s = placeholderStyle;
    const safe = String(label || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const mark = safe
      ? '<g fill="none" stroke="' + s.ink + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity=".55" transform="translate(255 330)">' +
        '<rect x="0" y="14" width="90" height="64" rx="10"/><circle cx="45" cy="46" r="17"/><path d="M28 14l8-12h18l8 12"/></g>' +
        '<text x="300" y="465" text-anchor="middle" font-family="Georgia, serif" font-size="30" fill="' + s.ink + '" opacity=".8">' + safe + '</text>'
      : '';
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="' + s.from + '"/><stop offset="1" stop-color="' + s.to + '"/></linearGradient></defs>' +
      '<rect width="600" height="800" fill="url(#g)"/>' + mark + '</svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  function setPhoto(img, src, label) {
    if (!img) return;
    img.addEventListener('error', function onError() {
      img.removeEventListener('error', onError);
      img.src = placeholder(label);
    });
    img.src = src ? asset(src) : placeholder(label);
  }

  /* ------------------------------------------------------------------ */
  /* Tanggal                                                             */
  /* ------------------------------------------------------------------ */

  /* Bahasa tanggal & jam di undangan (en-GB: "Saturday, 19 December 2026", "08:00") */
  const LOCALE = 'en-GB';

  function fmt(iso, opts) {
    return new Intl.DateTimeFormat(LOCALE, Object.assign({ timeZone: TZ }, opts)).format(new Date(iso));
  }
  const longDate = iso => fmt(iso, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const timeOf = iso => fmt(iso, { hour: '2-digit', minute: '2-digit', hour12: false });
  const pad2 = n => String(n).padStart(2, '0');

  function dateParts(iso) {
    const d = new Date(iso);
    const part = (opts, type) => {
      const parts = new Intl.DateTimeFormat(LOCALE, Object.assign({ timeZone: TZ }, opts)).formatToParts(d);
      return (parts.find(p => p.type === type) || {}).value || '';
    };
    return {
      weekday: part({ weekday: 'long' }, 'weekday'),
      day: part({ day: '2-digit' }, 'day'),
      month: part({ month: 'long' }, 'month'),
      monthShort: part({ month: 'short' }, 'month').replace('.', ''),
      monthNum: part({ month: '2-digit' }, 'month'),
      year: part({ year: 'numeric' }, 'year')
    };
  }

  function dotDate(iso, sep) {
    const p = dateParts(iso);
    const s = sep == null ? ' · ' : sep;
    return p.day + s + p.monthNum + s + p.year;
  }

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  function timeAgo(iso) {
    const t = new Date(iso).getTime();
    if (isNaN(t)) return '';
    const sec = Math.round((t - Date.now()) / 1000);
    const units = [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60]];
    for (const [unit, size] of units) {
      if (Math.abs(sec) >= size) return rtf.format(Math.round(sec / size), unit);
    }
    return 'just now';
  }

  /* ------------------------------------------------------------------ */
  /* Data turunan dari config                                            */
  /* ------------------------------------------------------------------ */

  const people = C.brideFirst ? [C.bride, C.groom] : [C.groom, C.bride];
  const names = people.map(p => p.nickname).join(' & ');
  const initials = people.map(p => p.nickname.charAt(0)).join('&');
  const events = C.events || [];
  const mainEvent = events[0];
  const roleLabel = p => (p === C.groom ? 'The Groom' : 'The Bride');

  function timeRange(ev) {
    return ev.end
      ? timeOf(ev.start) + ' – ' + timeOf(ev.end) + ' ' + TZ_LABEL
      : timeOf(ev.start) + ' ' + TZ_LABEL + ' onwards';
  }
  const placeQuery = ev => [ev.venue, ev.address].filter(Boolean).join(', ');
  const mapsLink = ev => ev.mapsUrl || 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(placeQuery(ev));
  const mapEmbedUrl = ev => 'https://maps.google.com/maps?q=' + encodeURIComponent(placeQuery(ev)) + '&z=15&output=embed';

  function calendarUrl() {
    if (!mainEvent) return '';
    const last = events[events.length - 1];
    const end = last.end ? new Date(last.end) : new Date(new Date(last.start).getTime() + 2 * 3600e3);
    const stamp = d => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const details = events.map(ev => ev.title + ': ' + timeOf(ev.start) + ' ' + TZ_LABEL + ' — ' + ev.venue).join('\n');
    return 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
      '&text=' + encodeURIComponent('Wedding of ' + names) +
      '&dates=' + stamp(new Date(mainEvent.start)) + '/' + stamp(end) +
      '&details=' + encodeURIComponent(details) +
      '&location=' + encodeURIComponent(placeQuery(last));
  }

  function guestFromUrl() {
    const params = new URLSearchParams(location.search);
    const raw = params.get('to') || params.get('kepada') || '';
    return raw.replace(/\s+/g, ' ').trim().slice(0, 80);
  }

  /* Isi elemen bertanda data-* (nama, inisial, tanggal) */
  function bindText() {
    document.title = 'The Wedding of ' + names;
    $$('[data-names]').forEach(el => { el.textContent = names; });
    $$('[data-name1]').forEach(el => { el.textContent = people[0].nickname; });
    $$('[data-name2]').forEach(el => { el.textContent = people[1].nickname; });
    $$('[data-initials]').forEach(el => { el.textContent = initials; });
    if (mainEvent) {
      $$('[data-date-long]').forEach(el => { el.textContent = longDate(mainEvent.start); });
      $$('[data-date-dots]').forEach(el => { el.textContent = dotDate(mainEvent.start); });
    }
  }

  /* ------------------------------------------------------------------ */
  /* Toast & salin                                                       */
  /* ------------------------------------------------------------------ */

  let toastTimer;
  function toast(message) {
    let el = document.getElementById('toast');
    if (!el) {
      el = h('div', { id: 'toast', class: 'toast', role: 'status', 'aria-live': 'polite' });
      document.body.append(el);
    }
    el.textContent = message;
    el.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-show'), 2600);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      const ta = h('textarea', { readonly: true, style: 'position:fixed;top:0;left:0;opacity:0' });
      ta.value = text;
      document.body.append(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (_) { /* abaikan */ }
      ta.remove();
      return ok;
    }
  }

  async function copyWithToast(text, done) {
    const ok = await copyText(text);
    toast(ok ? done : 'Copy failed, please copy it manually');
  }

  /* ------------------------------------------------------------------ */
  /* RSVP & ucapan                                                       */
  /* ------------------------------------------------------------------ */

  const RSVP = C.rsvp || {};
  const endpoint = (RSVP.endpoint || '').trim();
  const PAGE = RSVP.pageSize || 8;
  const STORE_KEY = 'undangan-ucapan';
  /* Nilai yang disimpan tetap "Hadir/Tidak Hadir/Ragu" (cocok dengan Code.gs & data lama);
     yang tampil ke tamu memakai label bahasa Inggris. */
  const ATTENDANCE = {
    'Hadir': { kind: 'yes', label: 'Attending' },
    'Tidak Hadir': { kind: 'no', label: 'Not Attending' },
    'Ragu': { kind: 'maybe', label: 'Not Sure' }
  };

  const localStore = {
    read() {
      try { return JSON.parse(localStorage.getItem(STORE_KEY)) || []; } catch (e) { return []; }
    },
    write(list) {
      try { localStorage.setItem(STORE_KEY, JSON.stringify(list.slice(0, 200))); } catch (e) { /* abaikan */ }
    }
  };

  async function fetchWishes() {
    if (!endpoint) return localStore.read();
    const url = endpoint + (endpoint.indexOf('?') >= 0 ? '&' : '?') + 'action=list&t=' + Date.now();
    const res = await fetch(url);
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || 'Gagal memuat ucapan');
    return json.data;
  }

  async function sendWish(entry) {
    if (!endpoint) {
      const item = Object.assign({ timestamp: new Date().toISOString() }, entry);
      const all = localStore.read();
      all.unshift(item);
      localStore.write(all);
      return item;
    }
    /* text/plain menghindari preflight CORS ke Google Apps Script */
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(entry)
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || 'Gagal mengirim ucapan');
    return json.data;
  }

  /**
   * Formulir RSVP + daftar ucapan. js/main.js menyediakan:
   *   view.item(wish, attendance) → <li> satu ucapan
   *   view.stats(count, total)    → (opsional) tampilkan rekap {yes, no, maybe}
   * Elemen yang dipakai: #rsvpForm #rsvpName #rsvpMessage #rsvpGuests #guestCountField
   *   #msgCount #rsvpError #rsvpSubmit(.btn__label) #wishList #moreWishes
   */
  function initRsvp(view) {
    const form = $('#rsvpForm');
    if (!form) return;
    const nameInput = $('#rsvpName');
    const msgInput = $('#rsvpMessage');
    const errorEl = $('#rsvpError');
    const submit = $('#rsvpSubmit');
    const submitLabel = $('.btn__label', submit);
    const idleLabel = submitLabel.textContent;
    let wishes = [];
    let shown = PAGE;

    function render() {
      const count = { yes: 0, no: 0, maybe: 0 };
      wishes.forEach(w => { const a = ATTENDANCE[w.attendance]; if (a) count[a.kind]++; });
      if (view.stats) view.stats(count, wishes.length);
      const list = $('#wishList');
      list.textContent = '';
      if (!wishes.length) {
        list.append(h('li', { class: 'wishes__empty' }, 'No wishes yet. Be the first to send us your wishes.'));
      }
      wishes.slice(0, shown).forEach(w => list.append(view.item(w, ATTENDANCE[w.attendance] || null)));
      $('#moreWishes').hidden = shown >= wishes.length;
    }

    const guest = guestFromUrl();
    if (guest) nameInput.value = guest;

    form.addEventListener('change', e => {
      if (e.target.name === 'attendance') $('#guestCountField').hidden = e.target.value !== 'Hadir';
    });
    msgInput.addEventListener('input', () => { $('#msgCount').textContent = msgInput.value.length; });

    const showError = msg => { errorEl.textContent = msg; errorEl.hidden = !msg; };

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const checked = form.querySelector('input[name="attendance"]:checked');
      const entry = {
        name: nameInput.value.replace(/\s+/g, ' ').trim(),
        attendance: checked ? checked.value : '',
        guests: 0,
        message: msgInput.value.trim()
      };
      if (!entry.name) { showError('Please enter your name.'); nameInput.focus(); return; }
      if (!entry.attendance) { showError('Please choose your attendance.'); return; }
      if (!entry.message) { showError('Please write your wishes.'); msgInput.focus(); return; }
      if (entry.attendance === 'Hadir') entry.guests = Number($('#rsvpGuests').value) || 1;
      showError('');

      submit.disabled = true;
      submitLabel.textContent = 'Sending…';
      try {
        const saved = await sendWish(entry);
        wishes.unshift(saved || Object.assign({ timestamp: new Date().toISOString() }, entry));
        render();
        msgInput.value = '';
        $('#msgCount').textContent = '0';
        toast('Thank you for your wishes and prayers!');
      } catch (err) {
        console.error('[undangan]', err);
        showError('Sorry, your wishes could not be sent. Please check your connection and try again.');
      } finally {
        submit.disabled = false;
        submitLabel.textContent = idleLabel;
      }
    });

    $('#moreWishes').addEventListener('click', () => { shown += PAGE; render(); });

    if (!endpoint) {
      console.info('[undangan] RSVP mode demo: ucapan hanya tersimpan di browser ini. Isi rsvp.endpoint di js/config.js (lihat README di folder undangan-catatan).');
    }
    fetchWishes()
      .then(list => { wishes = Array.isArray(list) ? list : []; render(); })
      .catch(err => {
        console.error('[undangan]', err);
        const list = $('#wishList');
        list.textContent = '';
        list.append(h('li', { class: 'wishes__empty' }, 'Wishes could not be loaded. Please reload the page.'));
      });
  }

  /* ------------------------------------------------------------------ */
  /* Musik (#bgm + #musicBtn) — memutar file dari config.music.src       */
  /* ------------------------------------------------------------------ */

  function initMusic() {
    const audio = $('#bgm');
    const btn = $('#musicBtn');
    const src = (C.music || {}).src;
    if (!btn || !audio || !src) return { play() {} };
    let wanted = false;

    const setState = playing => {
      btn.classList.toggle('is-playing', playing);
      btn.setAttribute('aria-pressed', String(playing));
      btn.setAttribute('aria-label', playing ? 'Pause music' : 'Play music');
    };
    audio.src = asset(src);

    const play = () => {
      wanted = true;
      audio.play()
        .then(() => { btn.hidden = false; setState(true); })
        .catch(err => {
          wanted = false;
          setState(false);
          /* NotAllowedError = diblokir browser → tampilkan tombol agar tamu bisa memutar sendiri.
             Error lain (mis. file tidak ada) → sembunyikan tombol musik. */
          btn.hidden = !(err && err.name === 'NotAllowedError');
        });
    };
    const pause = () => {
      wanted = false;
      audio.pause();
      setState(false);
    };

    btn.addEventListener('click', () => (btn.getAttribute('aria-pressed') === 'true' ? pause() : play()));
    document.addEventListener('visibilitychange', () => {
      if (!wanted) return;
      if (document.hidden) audio.pause();
      else audio.play().catch(() => {});
    });
    return { play };
  }

  /* ------------------------------------------------------------------ */
  /* Animasi masuk (.reveal → .is-in)                                    */
  /* ------------------------------------------------------------------ */

  /* opts.repeat = true: animasi diputar ulang setiap kali elemen masuk layar lagi */
  function initReveal(opts) {
    const repeat = !!(opts && opts.repeat);
    const items = $$('.reveal:not(.is-in)');
    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(el => el.classList.add('is-in'));
      return;
    }
    if (!repeat) {
      const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
      items.forEach(el => io.observe(el));
      return;
    }
    /* Tampil saat ≥15% terlihat; disembunyikan lagi hanya setelah benar-benar keluar layar,
       jadi tidak berkedip di tepi layar dan reset-nya tidak terlihat tamu. */
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.15) entry.target.classList.add('is-in');
        else if (!entry.isIntersecting) entry.target.classList.remove('is-in');
      });
    }, { threshold: [0, 0.15] });
    items.forEach(el => io.observe(el));
  }

  /* Lompat ke atas seketika (abaikan scroll-behavior: smooth).
     Catatan: mengganti style.scrollBehavior lalu langsung scrollTo() TIDAK cukup —
     Chrome belum menerapkan style baru sehingga tetap bergulir halus. */
  function scrollToTopNow() {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      return;
    } catch (e) { /* browser lama tidak mengenal 'instant' — pakai cara cadangan */ }
    const root = document.documentElement;
    const previous = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    void getComputedStyle(root).scrollBehavior; /* paksa style baru diterapkan dulu */
    window.scrollTo(0, 0);
    root.style.scrollBehavior = previous;
  }

  /* ------------------------------------------------------------------ */
  /* Foto berayun ([data-swing] → .is-swinging)                          */
  /* Diulang setiap kali elemen masuk layar lagi. Gerakannya diatur CSS  */
  /* tema (keyframes untuk .is-swinging).                                */
  /* ------------------------------------------------------------------ */

  function initSwing(selector) {
    const items = $$(selector || '[data-swing]');
    if (reduceMotion || !items.length || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        /* Mulai saat ≥20% terlihat, reset hanya saat benar-benar keluar layar
           — agar tidak berulang-ulang di tepi layar karena foto ikut miring. */
        if (!entry.isIntersecting) entry.target.classList.remove('is-swinging');
        else if (entry.intersectionRatio >= 0.2) entry.target.classList.add('is-swinging');
      });
    }, { threshold: [0, 0.2] });
    items.forEach(el => io.observe(el));
  }

  /* ------------------------------------------------------------------ */
  /* Hitung mundur ke acara pertama                                      */
  /* ------------------------------------------------------------------ */

  function countdown(onTick, onDone) {
    if (!mainEvent) return false;
    const target = new Date(mainEvent.start).getTime();
    let timer = null;
    let finished = false;
    function tick() {
      let diff = target - Date.now();
      if (diff <= 0) {
        finished = true;
        if (timer) clearInterval(timer);
        onDone();
        return;
      }
      const d = Math.floor(diff / 864e5); diff -= d * 864e5;
      const hr = Math.floor(diff / 36e5); diff -= hr * 36e5;
      const m = Math.floor(diff / 6e4); diff -= m * 6e4;
      onTick({ d: d, h: hr, m: m, s: Math.floor(diff / 1e3) });
    }
    tick();
    if (!finished) timer = setInterval(tick, 1000);
    return true;
  }

  /* ------------------------------------------------------------------ */
  /* Lightbox galeri (#lightbox #lbImg #lbCount #lbClose #lbPrev #lbNext) */
  /* ------------------------------------------------------------------ */

  function initLightbox(images) {
    const lb = $('#lightbox');
    if (!lb || !images.length) return { open() {} };
    const img = $('#lbImg');
    const first = $('#lbClose');
    const last = $('#lbNext');
    let index = 0;
    let returnFocus = null;

    function show(i) {
      const n = images.length;
      index = (i + n) % n;
      const source = images[index];
      img.src = source.currentSrc || source.src;
      img.alt = source.alt;
      $('#lbCount').textContent = (index + 1) + ' / ' + n;
    }
    function open(i) {
      returnFocus = document.activeElement;
      lb.hidden = false;
      requestAnimationFrame(() => lb.classList.add('is-open'));
      document.body.classList.add('is-lb');
      show(i);
      first.focus();
    }
    function close() {
      lb.classList.remove('is-open');
      document.body.classList.remove('is-lb');
      setTimeout(() => { lb.hidden = true; }, reduceMotion ? 0 : 250);
      if (returnFocus) returnFocus.focus();
    }

    img.addEventListener('error', () => {
      if (img.src.indexOf('data:') !== 0) img.src = placeholder('Gallery ' + (index + 1));
    });
    first.addEventListener('click', close);
    $('#lbPrev').addEventListener('click', () => show(index - 1));
    last.addEventListener('click', () => show(index + 1));
    lb.addEventListener('click', e => { if (e.target === lb) close(); });

    document.addEventListener('keydown', e => {
      if (lb.hidden) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') show(index - 1);
      else if (e.key === 'ArrowRight') show(index + 1);
      else if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });

    let startX = null;
    lb.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', e => {
      if (startX == null) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) show(index + (dx < 0 ? 1 : -1));
      startX = null;
    });
    return { open };
  }

  /* ------------------------------------------------------------------ */
  /* Navigasi: [data-nav] (ditandai aktif) dan [data-scroll]             */
  /* ------------------------------------------------------------------ */

  function initNav(opts) {
    opts = opts || {};
    const go = id => {
      const target = document.getElementById(id);
      if (target) target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    };
    /* Tanpa mengubah hash URL agar link ?to=Nama tetap bersih */
    $$('[data-nav], [data-scroll]').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        if (opts.onNavigate) opts.onNavigate();
        go(a.getAttribute('href').slice(1));
      });
    });

    if (!('IntersectionObserver' in window)) return;
    const links = $$('[data-nav]');
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        links.forEach(a => {
          const active = a.dataset.nav === entry.target.id;
          a.classList.toggle('is-active', active);
          if (active) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Array.from(new Set(links.map(a => a.dataset.nav))).forEach(id => {
      const section = document.getElementById(id);
      if (section) io.observe(section);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Sampul & loader                                                     */
  /* ------------------------------------------------------------------ */

  /* Elemen [data-locked] tidak bisa diakses sebelum undangan dibuka */
  function initCover(opts) {
    opts = opts || {};
    const cover = $('#cover');
    const locked = $$('[data-locked]');
    locked.forEach(el => { el.inert = true; });
    $('#guestName').textContent = guestFromUrl() || C.defaultGuest || 'Our Honoured Guest';
    scrollToTopNow();

    $('#openBtn').addEventListener('click', () => {
      if (opts.music) opts.music.play();
      /* Harus seketika: kalau di-scroll halus, pemantau animasi di bawah sempat
         mengira bagian di posisi lama sedang terlihat lalu memutarnya di balik sampul. */
      scrollToTopNow();
      locked.forEach(el => { el.inert = false; });
      document.body.classList.remove('is-locked');
      document.body.classList.add('is-opened');
      cover.classList.add('is-open');
      initReveal({ repeat: !!opts.revealRepeat });
      const firstSection = $('[data-first]');
      if (firstSection) firstSection.focus({ preventScroll: true });
      if (opts.onOpen) opts.onOpen();
      setTimeout(() => { cover.hidden = true; }, reduceMotion ? 0 : (opts.duration || 1150));
    }, { once: true });
  }

  function initLoader() {
    const loader = $('#loader');
    if (!loader) return;
    let done = false;
    const hide = () => {
      if (done) return;
      done = true;
      loader.classList.add('is-done');
      setTimeout(() => loader.remove(), 700);
    };
    if (document.readyState === 'complete') setTimeout(hide, 300);
    else window.addEventListener('load', () => setTimeout(hide, 300));
    setTimeout(hide, 5000); /* batas maksimal bila ada aset yang lambat */
  }

  window.UndanganCore = {
    C, TZ, TZ_LABEL, reduceMotion, $, $$, h, icon, removeSection,
    asset, placeholderStyle, placeholder, setPhoto,
    longDate, timeOf, pad2, dateParts, dotDate, timeAgo,
    people, names, initials, events, mainEvent, roleLabel,
    timeRange, mapsLink, mapEmbedUrl, calendarUrl, guestFromUrl, bindText,
    toast, copyText, copyWithToast,
    initRsvp, initMusic, initReveal, initSwing, countdown, initLightbox, initNav, initCover, initLoader
  };
})();
