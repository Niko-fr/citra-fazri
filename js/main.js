/* ==========================================================================
   Tampilan undangan "Monokrom 3D": menyusun halaman, ilustrasi bergerak, galeri,
   lalu (bagian kedua file) efek 3D. Isi undangan diatur di js/config.js,
   fungsi dasar (RSVP, musik, sampul, dll.) ada di js/core.js
   ========================================================================== */
(function () {
  'use strict';

  const U = window.UndanganCore;
  if (!U) return;
  const { C, $, $$, h, icon, setPhoto } = U;
  const SVG_NS = 'http://www.w3.org/2000/svg';

  /* Placeholder krem selama foto belum ada */
  Object.assign(U.placeholderStyle, { from: '#E7E2D4', to: '#CFC9B9', ink: '#2B2A27' });

  let uid = 0;
  function svg(tag, attrs, ...children) {
    const el = document.createElementNS(SVG_NS, tag);
    Object.keys(attrs || {}).forEach(k => el.setAttribute(k, attrs[k]));
    children.forEach(c => { if (c) el.append(c); });
    return el;
  }
  const doodle = (id, cls) => svg('svg', { class: cls, 'aria-hidden': 'true' }, svg('use', { href: '#' + id }));
  /* Wadah ilustrasi bergerak (isi SVG ditulis sebagai teks, bukan data tamu) */
  const sceneBox = (cls, markup) => { const el = h('div', { class: cls, 'aria-hidden': 'true' }); el.innerHTML = markup; return el; };
  const shortDate = () => (U.mainEvent ? U.dotDate(U.mainEvent.start, '.') : '');

  /* ------------------------------------------------------------------ */
  /* Teks melingkar, teks melengkung, bingkai oval, polaroid              */
  /* ------------------------------------------------------------------ */

  /* Teks melingkar penuh — ukuran huruf menyesuaikan panjang nama */
  function ringSvg(text) {
    const r = 128;
    const id = 'ring-path-' + (++uid);
    const circ = 2 * Math.PI * r;
    const size = Math.min(12.5, (circ * 0.92) / (text.length * 0.8));
    const tp = svg('textPath', { href: '#' + id, textLength: (circ * 0.995).toFixed(1), lengthAdjust: 'spacing' });
    tp.textContent = text;
    return svg('svg', { class: 'ring__svg', viewBox: '0 0 300 300', 'aria-hidden': 'true' },
      svg('path', { id: id, d: 'M150,150 m-' + r + ',0 a' + r + ',' + r + ' 0 1,1 ' + 2 * r + ',0 a' + r + ',' + r + ' 0 1,1 -' + 2 * r + ',0', fill: 'none' }),
      svg('text', { class: 'ring__text', style: 'font-size:' + size.toFixed(2) + 'px' }, tp)
    );
  }

  /* Satu atau dua baris teks melengkung */
  function arcSvg(line1, line2) {
    const id1 = 'arc-path-' + (++uid);
    const id2 = 'arc-path-' + (++uid);
    const tp1 = svg('textPath', { href: '#' + id1, startOffset: '50%' });
    tp1.textContent = line1;
    if (!line2) {
      return svg('svg', { viewBox: '0 0 320 80', 'aria-hidden': 'true' },
        svg('path', { id: id1, d: 'M10,74 Q160,4 310,74', fill: 'none' }),
        svg('text', { 'text-anchor': 'middle' }, tp1));
    }
    const tp2 = svg('textPath', { href: '#' + id2, startOffset: '50%' });
    tp2.textContent = line2;
    return svg('svg', { viewBox: '0 0 320 104', 'aria-hidden': 'true' },
      svg('path', { id: id1, d: 'M14,64 Q160,-4 306,64', fill: 'none' }),
      svg('path', { id: id2, d: 'M44,98 Q160,42 276,98', fill: 'none' }),
      svg('text', { 'text-anchor': 'middle' }, tp1),
      svg('text', { 'text-anchor': 'middle', class: 'arc__small' }, tp2));
  }

  /* Bingkai oval bergerigi bergaya cermin antik — garisnya "tergambar" saat muncul */
  function ovalFrame() {
    const cx = 100, cy = 130, rx = 92, ry = 122, n = 34;
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const t = (i / n) * Math.PI * 2;
      pts.push([cx + rx * Math.cos(t), cy + ry * Math.sin(t)]);
    }
    let d = 'M' + pts[0][0].toFixed(2) + ' ' + pts[0][1].toFixed(2);
    for (let i = 1; i <= n; i++) {
      const [x0, y0] = pts[i - 1];
      const [x1, y1] = pts[i];
      const r = (Math.hypot(x1 - x0, y1 - y0) * 0.62).toFixed(2);
      d += ' A' + r + ' ' + r + ' 0 0 1 ' + x1.toFixed(2) + ' ' + y1.toFixed(2);
    }
    const dots = svg('g', { fill: 'currentColor', class: 'draw-late' });
    for (let i = 0; i < n; i++) {
      const t = ((i + 0.5) / n) * Math.PI * 2;
      dots.append(svg('circle', { cx: (cx + (rx - 6) * Math.cos(t)).toFixed(2), cy: (cy + (ry - 6) * Math.sin(t)).toFixed(2), r: '1.1' }));
    }
    return svg('svg', { viewBox: '0 0 200 260', class: 'draw', 'aria-hidden': 'true' },
      svg('path', { d: d + 'Z', pathLength: '1', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.4' }),
      svg('ellipse', { cx: cx, cy: cy, rx: rx - 11, ry: ry - 11, pathLength: '1', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.6' }),
      dots,
      svg('path', { class: 'draw-late', d: 'M100 -13l4 5-4 5-4-5z M100 263l4 5-4 5-4-5z', fill: 'currentColor' })
    );
  }

  /* Polaroid berselotip: berayun saat masuk layar & "tercetak" perlahan */
  function polaroid(src, label, caption, rot) {
    const img = h('img', { alt: label, loading: 'lazy', decoding: 'async' });
    setPhoto(img, src, label);
    const el = h('figure', { class: 'polaroid', style: '--r:' + rot + 'deg', 'data-swing': true, 'data-develop': true },
      img,
      caption ? h('figcaption', null, caption) : null
    );
    return { el: el, img: img };
  }

  /* Bintang berkelip di posisi tetap (persen dari wadah) */
  const TWINKLES = [[7, 9], [88, 7], [12, 80], [91, 68], [48, 3], [80, 38], [5, 45], [64, 92]];
  function twinkles(container, count) {
    TWINKLES.slice(0, count).forEach(([x, y], i) => {
      container.append(h('span', {
        class: 'twinkle',
        'aria-hidden': 'true',
        style: 'left:' + x + '%;top:' + y + '%;--delay:' + (i * 0.6).toFixed(1) + 's;--size:' + (10 + (i % 3) * 4) + 'px'
      }, ['✦', '✧', '⋆'][i % 3]));
    });
  }

  /* ------------------------------------------------------------------ */
  /* Render                                                              */
  /* ------------------------------------------------------------------ */

  function renderBasics() {
    U.bindText();
    const ringText = (['The Wedding of', U.names, 'Save the Date', shortDate()].filter(Boolean).join(' · ') + ' · ').toUpperCase();
    $('#coverRing').prepend(ringSvg(ringText));
    $('#heroArc').append(arcSvg('dua hati, satu cerita', 'selamanya bersama'));
    $('#closingArc').append(arcSvg('telah menjadi bagian dari kisah kami'));
    twinkles($('#coverCard'), 8);
    twinkles($('#penutup'), 6);

    const photos = C.photos || {};
    const second = (C.gallery || [])[0];
    const a = polaroid(photos.hero, 'Foto Utama', '', -4);
    const b = polaroid(second, 'Foto Kedua', '', 3.5);
    a.el.classList.add('reveal', 'reveal--left');
    b.el.classList.add('reveal', 'reveal--right');
    b.el.style.setProperty('--d', '.12s');
    $('#heroPair').append(a.el, b.el);
  }

  /* ------------------------------------------------------------------ */
  /* Potongan gambar garis yang dipakai beberapa ilustrasi                */
  /* (garis di dalam grup .draw memakai pathLength="1" agar tergambar)    */
  /* ------------------------------------------------------------------ */
  const f = n => String(Math.round(n * 10) / 10);
  const HEART = 'M0 4C-5 .5-6.5-2.5-4-5C-2.4-6.6 0-5.6 0-3.4C0-5.6 2.4-6.6 4-5C6.5-2.5 5 .5 0 4Z';
  const daisy = (x, y, r) => {
    let out = '';
    for (let i = 0; i < 5; i++) {
      const a = (i * 72 - 90) * Math.PI / 180;
      out += '<circle class="fill-bg" pathLength="1" cx="' + f(x + Math.cos(a) * r) + '" cy="' + f(y + Math.sin(a) * r) + '" r="' + f(r * 0.85) + '"/>';
    }
    return out + '<circle class="dot" cx="' + x + '" cy="' + y + '" r="' + f(r * 0.5) + '"/>';
  };
  const stem = (delay, d, bloom) => '<g class="stem" style="animation-delay:-' + delay + 's"><path pathLength="1" d="' + d + '"/>' + bloom + '</g>';
  const flyer = (y, sc, dur, delay, flap) =>
    '<g class="fly" style="animation-duration:' + dur + 's;animation-delay:-' + delay + 's">' +
    '<g transform="translate(0 ' + y + ') scale(' + sc + ')"><path class="flap" style="animation-duration:' + flap + 's" d="M-9 1C-6-4-3-4 0 0C3-4 6-4 9 1"/></g></g>';
  const spark = (x, y, delay) => '<path class="spark" style="animation-delay:-' + delay + 's" d="M' + x + ' ' + (y - 5) + 'l1.4 3.6 3.6 1.4-3.6 1.4-1.4 3.6-1.4-3.6-3.6-1.4 3.6-1.4z"/>';

  /* ------------------------------------------------------------------ */
  /* Ilustrasi taman di bagian pembuka (gambar garis buatan sendiri):    */
  /* gapura bersulur, sepasang burung, burung terbang, lentera, meja     */
  /* dengan lilin & bunga, kupu-kupu. Garisnya tergambar saat muncul,    */
  /* lalu bagian-bagian kecilnya terus bergerak.                          */
  /* ------------------------------------------------------------------ */
  function gardenScene() {
    /* Titik di tepi luar gapura: tiang kiri (naik) → lengkung → tiang kanan (turun) */
    const R = 55, CX = 150, CY = 112, POST = 113, ARC = Math.PI * R;
    const archAt = s => {
      if (s < POST) return { x: 95, y: 225 - s, nx: -1, ny: 0, tx: 0, ty: -1 };
      if (s < POST + ARC) {
        const t = Math.PI - (s - POST) / R;
        return { x: CX + R * Math.cos(t), y: CY - R * Math.sin(t), nx: Math.cos(t), ny: -Math.sin(t), tx: Math.sin(t), ty: Math.cos(t) };
      }
      return { x: 205, y: CY + (s - POST - ARC), nx: 1, ny: 0, tx: 0, ty: 1 };
    };
    const wave = s => 2.6 * Math.sin(s / 9);
    const along = s => { const p = archAt(s), o = wave(s); return [p.x + p.nx * o, p.y + p.ny * o, p]; };

    /* Sulur & daun (sebagian daun terisi tinta) */
    const s0 = 28, s1 = POST * 2 + ARC - 64;
    const vine = [];
    for (let s = s0; s <= s1; s += 3) { const [x, y] = along(s); vine.push(f(x) + ' ' + f(y)); }
    let leaves = '';
    let k = 0;
    for (let s = s0 + 5; s < s1 - 3; s += 9) {
      const [x, y, p] = along(s);
      if (p.y < 70 && Math.abs(p.x - CX) < 30) continue; /* ruang untuk sepasang burung */
      k++;
      const inward = k % 3 === 0;
      const ang = Math.atan2(p.ty, p.tx) * 180 / Math.PI + (inward ? 50 : -55);
      const sc = inward ? 0.7 : 0.8 + (k * 7 % 5) / 10;
      leaves += '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(ang) + ') scale(' + sc + ')">' +
        '<path class="leaf' + (k % 2 ? ' leaf--ink' : '') + '" style="animation-delay:-' + f(k * 0.41 % 3.6) + 's" pathLength="1" d="M0 0C3-4.5 9-5 13 0C9 5 3 4.5 0 0Z"/></g>';
    }

    /* Bunga tulip */
    const tulip = (x, y) => '<path class="fill-bg" pathLength="1" transform="translate(' + x + ' ' + y + ')" d="M-4 0C-5-5-4-9-3-10L-1.5-7 0-11 1.5-7 3-10C4-9 5-5 4 0C2 2-2 2-4 0Z"/>';

    /* Burung bertengger (menghadap kanan, kaki di titik 0,0) */
    const bird =
      '<g class="lean">' +
      '<path class="fill-bg" pathLength="1" d="M-7-8L-19-2-18-9Z"/>' +
      '<path class="fill-bg" pathLength="1" d="M-11-9C-11-16-4-19 2-18C8-17 11-13 11-8C11-3 6 0 0 0C-6 0-11-4-11-9Z"/>' +
      '<path pathLength="1" d="M-7-12C-3-14.5 3-13.5 6-9.5C2-7-4-7.5-7-12Z"/>' +
      '<circle class="fill-bg" pathLength="1" cx="7" cy="-19" r="5.5"/>' +
      '<path pathLength="1" d="M12.3-20.6L16.6-18.7 12.3-16.9"/>' +
      '<path pathLength="1" d="M-2 0V3M3 0V3"/>' +
      '<circle class="dot" cx="8.7" cy="-20" r="1"/>' +
      '</g>';
    /* Kupu-kupu & daun gugur */
    const butterfly = (x, y, sc, cls) =>
      '<g transform="translate(' + x + ' ' + y + ') scale(' + sc + ')"><g class="bfly ' + cls + '">' +
      '<path class="wings fill-bg" d="M0 0C-5-8-11-7-10-2C-9 1-4 1.5 0 0ZM0 0C5-8 11-7 10-2C9 1 4 1.5 0 0ZM0 0C-4 2-7 6-4 7.5C-2 8.5-.5 4 0 0ZM0 0C4 2 7 6 4 7.5C2 8.5 .5 4 0 0Z"/>' +
      '<path d="M0-3V4M0-3L-2.5-7.5M0-3L2.5-7.5"/></g></g>';
    const petal = (x, y, dur, delay) =>
      '<g transform="translate(' + x + ' ' + y + ')"><path class="petal" style="animation-duration:' + dur + 's;animation-delay:-' + delay + 's" d="M0 0C2-3 6.5-3 8.5 0C6.5 3 2 3 0 0Z"/></g>';

    return '<svg viewBox="0 0 300 246" aria-hidden="true" focusable="false">' +
      /* langit: bintang & burung terbang */
      '<g class="draw-late">' + spark(40, 62, 0) + spark(262, 74, 1.1) + spark(30, 132, 2) + spark(272, 138, .6) + '</g>' +
      '<g class="draw-late">' + flyer(13, .9, 15, 2, .5) + flyer(23, .7, 19, 9, .42) + flyer(33, .55, 23, 16, .36) + '</g>' +
      '<g class="draw">' +
        /* gapura */
        '<path pathLength="1" d="M95 233V112A55 55 0 0 1 205 112V233"/>' +
        '<path pathLength="1" d="M102 233V112A48 48 0 0 1 198 112V233"/>' +
        '<path pathLength="1" d="M95 145h7M95 180h7M95 214h7M198 145h7M198 180h7M198 214h7M91 233.5v-5h15v5M194 233.5v-5h15v5"/>' +
        '<path pathLength="1" d="M' + vine.join('L') + '"/>' + leaves +
        /* lentera berayun */
        '<g class="lantern">' +
          '<path pathLength="1" d="M150 64V80M146 80h8M144 83h12"/>' +
          '<path class="fill-bg" pathLength="1" d="M145 83C142 90 142 98 145 104H155C158 98 158 90 155 83Z"/>' +
          '<path pathLength="1" d="M148.5 84C147 90 147 97 148.5 103M151.5 84C153 90 153 97 151.5 103M146 104h8M150 104v4"/>' +
          '<path class="flame draw-late" d="M150 100c-2.4-1.7-2.2-4.8 0-7.8 2.2 3 2.4 6.1 0 7.8z"/>' +
        '</g>' +
        /* meja kecil: vas bunga, lilin, dua gelas */
        '<ellipse class="fill-bg" pathLength="1" cx="150" cy="190" rx="33" ry="5.5"/>' +
        '<path pathLength="1" d="M117 190v2.5C117 195.5 132 197.5 150 197.5S183 195.5 183 192.5V190"/>' +
        '<path pathLength="1" d="M150 197.5V233.5M147 203h6M150 223C147 228 141 231 137 231C134 231 133 228 135.5 227.5M150 223C153 228 159 231 163 231C166 231 167 228 164.5 227.5"/>' +
        stem(.4, 'M133 177C131 169 128 164 124 159', daisy(124, 157, 2.2)) +
        stem(1.3, 'M135 177C135.5 168 137 162 140 156', daisy(140, 154, 2.4)) +
        stem(2.1, 'M134 177C133 171 133 167 134 163', '<circle class="fill-bg" pathLength="1" cx="134" cy="161" r="2"/>') +
        '<path class="fill-bg" pathLength="1" d="M130 190C127.5 186 128 181 131 178.5V176H137V178.5C140 181 140.5 186 138 190Z"/>' +
        '<path pathLength="1" d="M159 190h12M162.5 188V173H167.5V188M165 173v-2.5"/>' +
        '<g class="draw-late"><circle class="glow" cx="165" cy="166" r="7.5"/><path class="flame" d="M165 170.5c-2.6-1.8-2.4-5.2 0-8.5 2.4 3.3 2.6 6.7 0 8.5z"/></g>' +
        '<path pathLength="1" d="M175 190h6M178 190v-6M174.5 178c0 4 1.5 6 3.5 6s3.5-2 3.5-6zM119 190h6M122 190v-6M118.5 178c0 4 1.5 6 3.5 6s3.5-2 3.5-6z"/>' +
        /* semak bunga kiri (aster) & kanan (tulip) */
        stem(0, 'M47 234C46 222 43 210 39 200M45.5 220c-5-.5-8.5-3.5-9.5-8 5 .3 8.5 3.3 9.5 8z', daisy(39, 196, 3.2)) +
        stem(1.1, 'M55 234C56 218 59 206 63 192M57 214c4.5-1 7.5-4.5 8-9-4.5 1-7.5 4.5-8 9z', daisy(63, 188, 3.6)) +
        stem(2.2, 'M64 234C67 226 72 219 79 214', daisy(81, 212, 2.8)) +
        stem(.7, 'M224 234C224 222 221 212 218 204', tulip(218, 203)) +
        stem(1.8, 'M236 234C237 220 239 210 241 198M237 222c-4-2-6-6-6-10 4 2 6 6 6 10z', tulip(241, 197)) +
        stem(2.6, 'M248 234C251 226 256 220 262 216', tulip(263, 215)) +
        /* tanah & rumput */
        '<path pathLength="1" d="M14 234.5C60 232 100 236 150 234S240 232 286 235"/>' +
        '<path pathLength="1" d="M28 234c0-5-2-8-4-10M31 234c0-6 1-10 3-12M88 234c0-4-1-7-3-9M91 234c0-5 1-8 3-10M118 234c0-4-1-6-3-8M182 234c0-4 1-6 3-8M210 234c0-5 2-8 4-10M266 234c0-4-1-7-3-9M269 234c0-5 2-8 4-10"/>' +
        /* sepasang burung di puncak gapura */
        '<g transform="translate(131 57.4)">' + bird + '</g>' +
        '<g transform="translate(169 57.4) scale(-1 1)">' + bird + '</g>' +
      '</g>' +
      '<g transform="translate(150 33)"><path class="heart" d="M0 4C-5 .5-6.5-2.5-4-5C-2.4-6.6 0-5.6 0-3.4C0-5.6 2.4-6.6 4-5C6.5-2.5 5 .5 0 4Z"/></g>' +
      '<g class="draw-late">' + butterfly(236, 205, .8, 'bfly--a') + butterfly(52, 186, .65, 'bfly--b') + '</g>' +
      /* daun gugur pelan dari sulur */
      '<g class="draw-late">' + petal(86, 118, 8, 0) + petal(128, 84, 9.5, 3.4) + petal(196, 98, 8.5, 6.1) + '</g>' +
      '</svg>';
  }

  /* ------------------------------------------------------------------ */
  /* Ilustrasi perjalanan menuju lokasi acara (gambar garis buatan sendiri): */
  /* desa di atas bukit, jalan berkelok yang melebar mendekati tamu, cemara,  */
  /* matahari, awan, bunga di tepi jalan. Mobil pengantin berangkat dari desa, */
  /* menyusuri jalan (makin besar saat mendekat), berhenti di depan, lalu      */
  /* pasangan melambai & hati beterbangan. Posisi mobil dihitung di JS.       */
  /* ------------------------------------------------------------------ */
  /* Garis tengah jalan (kurva Bézier kubik), dari desa (jauh) ke depan (dekat) */
  const ROAD = [
    [[162, 119], [156, 128], [138, 134], [136, 146]],
    [[136, 146], [134, 160], [184, 164], [184, 184]],
    [[184, 184], [184, 200], [160, 212], [152, 236]],
    [[152, 236], [148, 248], [146, 258], [144, 272]]
  ];
  const ROAD_STOP_Y = 238; /* mobil berhenti di sini (tepi bawah mobil) */

  function roadPath() {
    const bez = (s, t) => {
      const m = 1 - t, a = m * m * m, b = 3 * m * m * t, c = 3 * m * t * t, d = t * t * t;
      return [a * s[0][0] + b * s[1][0] + c * s[2][0] + d * s[3][0], a * s[0][1] + b * s[1][1] + c * s[2][1] + d * s[3][1]];
    };
    const pts = [];
    ROAD.forEach((s, i) => { for (let k = i ? 1 : 0; k <= 50; k++) pts.push(bez(s, k / 50)); });
    const len = [0];
    for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const total = len[len.length - 1];
    /* Titik & arah jalan pada posisi u (0 = desa, 1 = paling depan), dengan kecepatan rata */
    const at = u => {
      const L = Math.max(0, Math.min(1, u)) * total;
      let i = 1;
      while (i < len.length - 1 && len[i] < L) i++;
      const p0 = pts[i - 1], p1 = pts[i];
      const dx = p1[0] - p0[0], dy = p1[1] - p0[1], d = Math.hypot(dx, dy) || 1;
      const k = Math.min(1, (L - len[i - 1]) / d);
      return { x: p0[0] + dx * k, y: p0[1] + dy * k, tx: dx / d, ty: dy / d };
    };
    const half = u => 1.5 + 30 * Math.pow(u, 1.7); /* setengah lebar jalan (perspektif) */
    let stop = 0;
    for (let u = 0; u <= 1; u += 0.002) if (at(u).y <= ROAD_STOP_Y) stop = u;
    return { at, half, stop };
  }

  function roadScene(road) {
    /* Tepi jalan = garis tengah digeser ke kiri & kanan selebar jalan */
    const left = [], right = [];
    for (let i = 0; i <= 90; i++) {
      const u = i / 90, p = road.at(u), w = road.half(u);
      left.push(f(p.x - p.ty * w) + ' ' + f(p.y + p.tx * w));
      right.push(f(p.x + p.ty * w) + ' ' + f(p.y - p.tx * w));
    }
    const stopAt = road.at(road.stop);
    const cypress = (x, y, s, delay) => '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')">' +
      '<path class="cypress ink" style="animation-delay:-' + delay + 's" pathLength="1" d="M0 0C-3.6-5-4.2-15-1.8-25C-1.2-28.5 1.2-28.5 1.8-25C4.2-15 3.6-5 0 0Z"/></g>';
    const cloud = (x, y, s, dur) => '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')">' +
      '<path class="cloud fill-bg" style="animation-duration:' + dur + 's" d="M-26 2C-29-2-23-5-17-3C-13-8-3-8 1-4C7-8 17-7 20-2C26-3 30 1 25 4C11 6-13 6-26 2Z"/></g>';
    let rays = '';
    for (let i = 0; i < 10; i++) {
      const a = i * Math.PI / 5;
      rays += 'M' + f(214 + Math.cos(a) * 9.5) + ' ' + f(40 + Math.sin(a) * 9.5) + 'L' + f(214 + Math.cos(a) * 13.5) + ' ' + f(40 + Math.sin(a) * 13.5);
    }
    const pop = (dx, delay) => '<path class="pop" style="--dx:' + dx + 'px;animation-delay:' + delay + 's" d="' + HEART + '"/>';

    /* Mobil kecil tampak depan (titik 0,0 = tengah bawah), pasangan di balik kaca */
    const car =
      '<g class="road-car" style="opacity:0" transform="translate(162 119) scale(.06)">' +
        '<ellipse class="dot" opacity=".16" cx="0" cy="0" rx="25" ry="3.6"/>' +
        '<path class="dot" d="M-21-7h7v8a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2zM14-7h7v8a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2z"/>' +
        '<g class="wave-arm"><path d="M-15.5-23.5C-19.5-25.5-22-28.5-22.5-32"/><circle class="fill-bg" cx="-22.7" cy="-34.4" r="2.3"/></g>' +
        '<path class="fill-bg" d="M-16-21C-15-31-10-35 0-35C10-35 15-31 16-21Z"/>' +
        '<path class="fill-bg" d="M-12.5-22C-12-29-8-32 0-32C8-32 12-29 12.5-22Z"/>' +
        '<path d="M-9.5-22C-9.5-24.5-1-24.5-1-22M1-22C1-24.5 9.5-24.5 9.5-22"/>' +
        '<path class="dot" d="M-8.6-22.5C-9.6-28-7.6-31.3-5-31.3C-2.4-31.3-.6-28-1.6-22.5Z"/>' +
        '<circle class="fill-bg" cx="-5" cy="-27.4" r="2.5"/>' +
        '<circle class="fill-bg" cx="5" cy="-27.4" r="2.6"/>' +
        '<path class="dot" d="M2.3-28C2.4-31 7.6-31 7.7-28C6.4-29.2 3.6-29.2 2.3-28Z"/>' +
        '<path class="fill-bg" d="M-22-6C-23-14-21-19-17-21H17C21-19 23-14 22-6C22-3 20-2 17-2H-17C-20-2-22-3-22-6Z"/>' +
        '<path d="M-14-20.5C-8-17.5 8-17.5 14-20.5M-9-14.5C-5-12.5 5-12.5 9-14.5M-20-5H20M-4-8.5h8M-17-19.5l-3.5-1.5M17-19.5l3.5-1.5"/>' +
        '<circle class="fill-bg" cx="-14" cy="-11.5" r="3.4"/><circle class="fill-bg" cx="14" cy="-11.5" r="3.4"/>' +
        '<circle class="dot" cx="-14" cy="-11.5" r="1.2"/><circle class="dot" cx="14" cy="-11.5" r="1.2"/>' +
        '<path class="dot" transform="translate(0 -17.4) scale(.36)" d="' + HEART + '"/>' +
      '</g>';

    return '<svg viewBox="0 22 320 240" aria-hidden="true" focusable="false">' +
      '<g class="draw-late">' +
        '<path class="rays" d="' + rays + '"/>' +
        cloud(96, 72, 1, 13) + cloud(250, 62, .8, 16) + cloud(282, 98, .62, 11) +
        flyer(40, .7, 17, 3, .45) + flyer(52, .55, 22, 12, .38) +
      '</g>' +
      '<g class="draw">' +
        '<circle class="fill-bg" pathLength="1" cx="214" cy="40" r="6"/>' +
        /* bukit */
        '<path pathLength="1" d="M18 140C44 130 70 126 92 130M220 112C244 104 272 102 304 108"/>' +
        '<path pathLength="1" d="M10 168C46 160 76 146 104 128C124 116 146 110 166 112C190 114 212 126 236 138C258 148 284 154 312 156"/>' +
        /* cemara */
        cypress(42, 166, 1.1, 0) + cypress(53, 163, .85, 1.2) + cypress(88, 138, .8, 2.1) + cypress(98, 133, .65, .5) +
        cypress(108, 127, .55, 1.7) + cypress(127, 113, .6, 2.6) + cypress(212, 125, .7, .9) + cypress(226, 134, 1, 1.9) +
        cypress(240, 140, .8, .3) + cypress(268, 150, 1.2, 1.4) + cypress(281, 152, .95, 2.3) + cypress(296, 154, 1.1, .8) +
        /* desa: menara & rumah-rumah */
        '<path class="fill-bg" pathLength="1" d="M134 110V70H146V110Z"/>' +
        '<path class="fill-bg" pathLength="1" d="M132.5 70L140 52L147.5 70Z"/>' +
        '<path class="ink" pathLength="1" d="M138.5 77h3v6h-3zM138 96a2 2 0 0 1 4 0v5h-4z"/>' +
        '<path class="fill-bg" pathLength="1" d="M114 118V104H132V118ZM132 104L138 101V115L132 118Z"/>' +
        '<path class="fill-bg" pathLength="1" d="M112 104L118 98H134L138 101L132 104Z"/>' +
        '<path class="fill-bg" pathLength="1" d="M146 116V96H172V116ZM172 96L182 91V111L172 116Z"/>' +
        '<path class="fill-bg" pathLength="1" d="M143 96L151 88H180L182 91L172 96Z"/>' +
        '<path class="fill-bg" pathLength="1" d="M180 122V106H198V122ZM198 106L205 102V118L198 122Z"/>' +
        '<path class="fill-bg" pathLength="1" d="M177 106L183 99H202L205 102L198 106Z"/>' +
        '<path class="ink" pathLength="1" d="M119 108h3v4h-3zM125 108h3v4h-3zM151 100h3.5v4.5H151zM163 100h3.5v4.5H163zM185 110h3v4h-3zM192 110h3v4h-3z"/>' +
        '<path pathLength="1" d="M157 116v-6.5h5V116"/>' +
        /* jalan berkelok */
        '<path class="fill-bg" stroke="none" d="M' + left.join('L') + 'L' + right.slice().reverse().join('L') + 'Z"/>' +
        '<path pathLength="1" d="M' + left.join('L') + '"/>' +
        '<path pathLength="1" d="M' + right.join('L') + '"/>' +
      '</g>' +
      car +
      '<g transform="translate(' + f(stopAt.x) + ' ' + (ROAD_STOP_Y - 44) + ')">' + pop(-12, 0) + pop(0, .15) + pop(12, .3) + '</g>' +
      /* bunga di tepi jalan (di depan mobil) */
      '<g class="draw">' +
        stem(0, 'M84 262C84 250 82 240 84 230M84 248c-5 0-8-3-9-7 5 0 8 3 9 7z', daisy(84, 227, 3.2)) +
        stem(1, 'M74 262C73 254 70 246 66 240', daisy(65, 237, 2.8)) +
        stem(1.8, 'M94 262C95 252 98 244 102 238', daisy(103, 235, 2.6)) +
        stem(.3, 'M206 262C206 250 208 240 206 230M206 248c5 0 8-3 9-7-5 0-8 3-9 7z', daisy(206, 227, 3.2)) +
        stem(1.4, 'M218 262C219 254 222 246 227 241', daisy(228, 238, 2.8)) +
        stem(2.2, 'M196 262C195 254 192 248 188 244', daisy(187, 241, 2.5)) +
        '<path pathLength="1" d="M48 262c0-6-2-9-4-11M52 262c0-7 1-11 3-13M232 262c0-5-1-8-3-10M236 262c0-6 2-9 4-11"/>' +
      '</g>' +
      '</svg>';
  }

  /* Gerak mobil: 0–7 dtk menyusuri jalan (melambat sampai berhenti), 7–10 dtk berhenti
     (pasangan melambai, hati beterbangan), lalu memudar dan mulai lagi dari desa.
     Hanya berjalan selama ilustrasi terlihat di layar. */
  function animateRoad(wrap, road) {
    const car = wrap.querySelector('.road-car');
    if (!car) return;
    const wStop = road.half(road.stop);
    const place = (u, squash, lift) => {
      const p = road.at(u);
      const s = road.half(u) / wStop;
      const rot = Math.max(-12, Math.min(12, -Math.asin(p.tx) * 57.3 * 0.35));
      car.setAttribute('transform', 'translate(' + f(p.x) + ' ' + f(p.y - lift * s) + ') rotate(' + f(rot) + ') scale(' +
        (s * (1 + squash)).toFixed(3) + ' ' + (s * (1 - squash)).toFixed(3) + ')');
    };
    if (U.reduceMotion) { place(road.stop, 0, 0); car.style.opacity = 1; return; }
    const DRIVE = 7000, PERIOD = 11000, FADE = 10200;
    let elapsed = 0, last = 0, raf = 0, arrived = false;
    const frame = now => {
      elapsed += last ? Math.min(now - last, 64) : 0;
      last = now;
      const t = elapsed % PERIOD;
      let u = road.stop, squash = 0, lift = 0;
      if (t < DRIVE) {
        u = road.stop * (1 - Math.pow(1 - t / DRIVE, 1.7));
        lift = Math.abs(Math.sin(t / 110)) * 0.9;
      } else if (t - DRIVE < 450) {
        squash = 0.06 * Math.sin(Math.PI * (t - DRIVE) / 450);
      }
      place(u, squash, lift);
      car.style.opacity = t < 400 ? t / 400 : t > FADE ? Math.max(0, 1 - (t - FADE) / 700) : 1;
      if ((t >= DRIVE) !== arrived) { arrived = !arrived; wrap.classList.toggle('is-arrived', arrived); }
      raf = requestAnimationFrame(frame);
    };
    new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
      else if (raf) { cancelAnimationFrame(raf); raf = 0; }
    }).observe(wrap);
  }

  function roadBox() {
    const road = roadPath();
    const el = sceneBox('scene scene--road reveal reveal--zoom', roadScene(road));
    setTimeout(() => animateRoad(el, road)); /* setelah wadah masuk ke halaman */
    return el;
  }

  function renderOpening() {
    const o = C.opening || {};
    if (!o.greeting && !o.quote) { U.removeSection('pembuka'); return; }
    const garden = $('#scene');
    if (garden) garden.innerHTML = gardenScene();
    $('#greeting').textContent = o.greeting || '';
    $('#greeting').hidden = !o.greeting;
    if (o.quote) {
      $('#quoteText').textContent = o.quote;
      $('#quoteSource').textContent = o.quoteSource || '';
    } else {
      $('#quote').hidden = true;
    }
  }

  /* Mempelai pertama: foto → nama. Mempelai kedua dibalik: nama → foto. */
  function person(p, reversed) {
    const handle = (p.instagram || '').replace(/^@/, '').trim();
    const img = h('img', { alt: p.fullName, loading: 'lazy', decoding: 'async' });
    setPhoto(img, p.photo, U.roleLabel(p));
    /* Gelar setelah koma (mis. ", S.T.") ditulis terpisah: huruf sambung sulit dibaca untuk singkatan */
    const parts = String(p.fullName || '').split(',');
    const degree = parts.slice(1).join(',').trim();

    const oval = h('div', { class: 'oval reveal reveal--zoom', 'data-swing': true, 'data-develop': true }, ovalFrame(), img);
    const text = [
      h('h3', { class: 'person__name reveal' }, parts[0].trim()),
      degree ? h('p', { class: 'person__degree reveal' }, degree) : null,
      h('span', { class: 'dots reveal', 'aria-hidden': 'true' }),
      h('p', { class: 'person__parents reveal' }, p.parents),
      handle ? h('a', {
        class: 'link-ink reveal',
        href: 'https://instagram.com/' + encodeURIComponent(handle),
        target: '_blank',
        rel: 'noopener'
      }, icon('instagram'), '@' + handle) : null
    ];
    return h('article', { class: 'person' + (reversed ? ' person--reversed' : '') },
      reversed ? [text, oval] : [oval, text]);
  }

  function renderCouple() {
    const intro = (C.opening || {}).text;
    if (intro) $('#coupleIntro').textContent = intro;
    else $('#coupleIntro').remove();
    $('#coupleList').append(
      person(U.people[0], false),
      doodle('doodle-heart', 'doodle doodle--heart draw reveal reveal--zoom'),
      person(U.people[1], true)
    );
  }

  /* Acara yang tempatnya sama digabung dalam satu blok */
  function renderEvents() {
    if (!U.mainEvent) return;
    const main = U.dateParts(U.mainEvent.start);
    $('#eventDate').append(main.weekday + ',', h('br'), main.day.replace(/^0/, '') + ' ' + main.month + ' ' + main.year);
    const sameDay = ev => {
      const p = U.dateParts(ev.start);
      return p.day === main.day && p.monthNum === main.monthNum && p.year === main.year;
    };

    const groups = [];
    U.events.forEach(ev => {
      const key = ((ev.venue || '') + '|' + (ev.address || '')).toLowerCase();
      let group = groups.find(g => g.key === key);
      if (!group) { group = { key: key, events: [] }; groups.push(group); }
      group.events.push(ev);
    });

    groups.forEach((g, gi) => {
      const first = g.events[0];
      const mapEvent = g.events.find(ev => ev.showMap);
      $('#eventList').append(h('div', { class: 'venue-block' },
        h('div', { class: 'event-cols reveal' }, g.events.map(ev => h('div', { class: 'event-col' },
          h('h3', null, ev.title),
          sameDay(ev) ? null : h('p', { class: 'event-col__date' }, U.longDate(ev.start)),
          h('p', null, U.timeRange(ev))
        ))),
        gi === 0 ? roadBox() : null,
        h('p', { class: 'venue reveal' }, first.venue),
        h('p', { class: 'address reveal' }, first.address),
        mapEvent ? h('iframe', {
          class: 'event-map reveal',
          title: 'Peta lokasi ' + first.venue,
          loading: 'lazy',
          referrerpolicy: 'no-referrer-when-downgrade',
          src: U.mapEmbedUrl(first)
        }) : null,
        h('a', { class: 'btn-ink reveal reveal--zoom', href: U.mapsLink(mapEvent || first), target: '_blank', rel: 'noopener' }, icon('pin'), 'Lihat Lokasi')
      ));
    });
  }

  function initCountdown() {
    const out = {};
    ['d', 'h', 'm', 's'].forEach(u => { out[u] = $('[data-unit="' + u + '"]'); });
    const running = U.countdown(
      t => {
        out.d.textContent = t.d;
        out.h.textContent = U.pad2(t.h);
        out.m.textContent = U.pad2(t.m);
        out.s.textContent = U.pad2(t.s);
      },
      () => {
        $('#countdown').hidden = true;
        $('#countdownDone').hidden = false;
      }
    );
    if (!running) { $('#countdown').remove(); $('#calendarWrap').remove(); return; }
    $('#calendarBtn').href = U.calendarUrl();
  }

  function renderDressCode() {
    const dc = C.dressCode;
    if (!dc || !dc.colors || !dc.colors.length) { U.removeSection('dresscode'); return; }
    if (dc.note) $('#dressNote').textContent = dc.note;
    else $('#dressNote').remove();
    const list = $('#swatches');
    list.setAttribute('aria-hidden', 'true'); /* nama warna dibacakan dari teks di bawahnya */
    dc.colors.forEach(c => list.append(h('li', { style: '--c:' + c.hex, title: c.name })));
    const labels = dc.colors.map(c => c.name);
    $('#dressNames').textContent = (labels.length > 1
      ? labels.slice(0, -1).join(', ') + ' & ' + labels[labels.length - 1]
      : labels[0]) + '.';
  }

  /* ---------- Kisah ---------- */

  /* Paragraf dipecah per kata agar bisa muncul bergantian.
     Teks utuh tetap tersedia untuk pembaca layar. */
  function wordsBlock(cls, text) {
    const wrap = h('span', { class: 'words', 'aria-hidden': 'true' });
    String(text || '').split(/\s+/).filter(Boolean).forEach((w, i) => {
      if (i) wrap.append(' ');
      wrap.append(h('span', { class: 'w', style: '--i:' + i }, w));
    });
    return h('p', { class: cls }, h('span', { class: 'sr-only' }, text), wrap);
  }

  /* Garis bawah bergelombang yang tergambar sendiri */
  const squiggle = () => svg('svg', { class: 'chapter__squiggle draw', viewBox: '0 0 120 12', 'aria-hidden': 'true' },
    svg('path', { d: 'M2 7C14 2 22 11 36 6S60 2 74 7 100 11 118 4', pathLength: '1', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.6', 'stroke-linecap': 'round' }));

  /* Pemisah antarbab: benang titik-titik + bintang & bulan yang meletup */
  function separator() {
    const el = h('p', { class: 'chapter-sep reveal', 'aria-hidden': 'true' });
    Array.from('⋆˚✧ ☾ ✧˚⋆').forEach((c, i) => {
      el.append(c === ' ' ? ' ' : h('span', { class: 'sep__c' + (c === '☾' ? ' sep__moon' : ''), style: '--i:' + i }, c));
    });
    return el;
  }

  /* Kisah: rata kanan & kiri bergantian, masuk dari arah yang berlawanan */
  function renderStory() {
    if (!C.story || !C.story.length) { U.removeSection('kisah'); return; }
    const box = $('#timeline');
    let prevYear = null;
    C.story.forEach((s, i) => {
      const side = i % 2 === 0 ? 'right' : 'left';
      const from = side === 'right' ? 'left' : 'right';
      if (i > 0) box.append(separator());

      /* Tahun 4 digit dihitung naik dari tahun bab sebelumnya (bab pertama: mundur 6 tahun) */
      const year = String(s.year || '');
      const yearNum = /^\d{4}$/.test(year) ? Number(year) : null;
      const start = yearNum ? (prevYear && prevYear < yearNum ? prevYear : yearNum - 6) : null;
      if (yearNum) prevYear = yearNum;

      box.append(h('article', { class: 'chapter chapter--' + side + ' reveal reveal--' + from, 'data-chapter': true },
        h('p', { class: 'chapter__year' },
          h('span', { class: 'sr-only' }, year),
          h('span', { 'aria-hidden': 'true', 'data-year': yearNum, 'data-from': start }, year)
        ),
        h('h3', { class: 'chapter__title' }, h('span', { class: 'chapter__ink' }, s.title)),
        squiggle(),
        wordsBlock('chapter__text', s.text)
      ));
    });
  }

  /* Judul bagian: huruf dibungkus satu per satu agar bisa naik bergantian */
  function splitTitles() {
    $$('.main .title').forEach(title => {
      let i = 0;
      const textNodes = Array.from(title.childNodes).filter(n => n.nodeType === 3);
      title.setAttribute('aria-label', textNodes.map(n => n.textContent).join('').replace(/\s+/g, ' ').trim());
      textNodes.forEach(node => {
        const frag = document.createDocumentFragment();
        Array.from(node.textContent).forEach(ch => {
          frag.append(/\s/.test(ch) ? document.createTextNode(ch) : h('span', { class: 'ch', style: '--i:' + (i++) }, ch));
        });
        node.replaceWith(frag);
      });
    });
  }

  /* Galeri:
     1) polaroid besar → 2) dua instax berselotip bening + tulisan bertangga →
     3) strip foto berselotip kertas + kutipan + lingkaran nama mengintip dari tepi →
     4) foto lebar tanpa bingkai → 5) sisanya polaroid kecil */
  function renderGallery() {
    const list = C.gallery || [];
    if (!list.length) { U.removeSection('galeri'); return; }
    const box = $('#gallery');
    const images = [];
    let lightbox = null;
    let next = 0;
    const remaining = () => list.length - next;

    const zoom = (i, cls, child, extra) => h('button', Object.assign({
      type: 'button',
      class: cls,
      'aria-label': 'Perbesar foto ' + (i + 1),
      onclick: () => lightbox.open(i)
    }, extra || {}), child);
    const photo = i => {
      const img = h('img', { alt: 'Foto ' + (i + 1), loading: 'lazy', decoding: 'async' });
      setPhoto(img, list[i], 'Galeri ' + (i + 1));
      images[i] = img;
      return img;
    };
    const framed = (i, rot, cls) => {
      const p = polaroid(list[i], 'Galeri ' + (i + 1), '', rot);
      images[i] = p.img;
      return zoom(i, 'gallery__btn ' + (cls || ''), p.el);
    };
    /* Instax: bingkai putih dengan sisi bawah lebar, ditempel selotip plastik bening */
    const instax = (i, kind, rot) => h('figure', {
      class: 'instax instax--' + kind,
      style: '--r:' + rot + 'deg',
      'data-swing': true,
      'data-develop': true
    }, h('span', { class: 'tape tape--clear', 'aria-hidden': 'true' }), photo(i));

    /* 1. Polaroid besar */
    box.append(h('div', { class: 'g-feature reveal reveal--zoom' }, framed(0, 0)));
    next = 1;

    /* 2. Dua instax + tulisan bertangga */
    if (remaining() >= 2) {
      const a = next;
      const b = next + 1;
      box.append(h('div', { class: 'g-instax' },
        h('p', { class: 'g-word g-word--we reveal reveal--right' }, 'We are'),
        h('p', { class: 'g-word g-word--married reveal reveal--right', style: '--d:.15s' }, 'Getting', h('br'), 'married'),
        zoom(a, 'g-instax__photo g-instax__photo--a reveal reveal--left', instax(a, 'square', -1.5)),
        zoom(b, 'g-instax__photo g-instax__photo--b reveal reveal--right', instax(b, 'mini', 2)),
        h('p', { class: 'g-word g-word--n1 reveal reveal--left' }, U.people[0].nickname),
        h('p', { class: 'g-word g-word--amp reveal reveal--left', style: '--d:.12s' }, '&'),
        h('p', { class: 'g-word g-word--n2 reveal reveal--left', style: '--d:.24s' }, U.people[1].nickname),
        h('p', { class: 'g-word g-word--date reveal reveal--left', style: '--d:.36s' }, shortDate(), h('br'), 'Save the date')
      ));
      next += 2;
    }

    /* 3. Strip foto + kutipan + lingkaran nama */
    if (remaining() >= 2) {
      const a = next;
      const b = next + 1;
      const quote = String(C.galleryQuote || '').trim();
      const ring = h('div', { class: 'ring ring--peek', 'aria-hidden': 'true' });
      /* Nama diulang secukupnya (~70 huruf) agar melingkar rapat, tidak renggang */
      const unit = (U.names + ' · ').toUpperCase();
      ring.append(ringSvg(unit.repeat(Math.max(2, Math.round(70 / unit.length)))));
      box.append(h('div', { class: 'g-strip' + (quote ? '' : ' g-strip--solo') },
        ring,
        quote ? h('p', { class: 'g-strip__quote reveal reveal--left' }, quote) : null,
        h('div', { class: 'g-strip__wrap reveal reveal--right' },
          h('figure', { class: 'strip', style: '--r:2deg', 'data-swing': true, 'data-develop': true },
            h('span', { class: 'tape tape--washi', 'aria-hidden': 'true' }),
            zoom(a, 'strip__photo', photo(a)),
            zoom(b, 'strip__photo', photo(b))
          )
        )
      ));
      next += 2;
    }

    /* 4. Foto lebar tanpa bingkai */
    if (remaining() >= 1) {
      const i = next;
      box.append(zoom(i, 'g-wide reveal reveal--zoom', photo(i), { 'data-develop': true }));
      next += 1;
    }

    /* 5. Sisanya: polaroid kecil berpasangan */
    if (remaining() >= 1) {
      const grid = h('div', { class: 'g-grid' });
      for (let i = next; i < list.length; i++) {
        grid.append(framed(i, i % 2 ? 2.5 : -2.5, 'reveal ' + (i % 2 ? 'reveal--right' : 'reveal--left')));
      }
      box.append(grid);
    }

    /* 6. Tumpukan foto stop-motion (penutup galeri) */
    renderStack(box);
    lightbox = U.initLightbox(images);
  }

  /* ---------- Tumpukan foto stop-motion ----------
     Foto "dijatuhkan" satu per satu ke atas meja, bergetar halus seperti
     animasi stop-motion, lalu terus bergoyang selama terlihat di layar. */

  /* Posisi tiap foto (persen panggung), kemiringan, dan bentuk bingkai */
  const STACK_LAYOUT = [
    { x: 3, y: 2, w: 50, r: -3, kind: 'land' },
    { x: 46, y: 0, w: 50, r: 5, kind: 'land' },
    { x: 13, y: 30, w: 40, r: -2, kind: 'square' },
    { x: 5, y: 56, w: 54, r: -4, kind: 'land' },
    { x: 52, y: 40, w: 36, r: 5, kind: 'port' }
  ];
  let stack = null;

  function renderStack(box) {
    const own = Array.isArray(C.photoStack) && C.photoStack.length ? C.photoStack : null;
    const sources = (own || C.gallery || []).slice(0, STACK_LAYOUT.length);
    if (sources.length < 2) return;

    const photos = sources.map((src, i) => {
      const p = STACK_LAYOUT[i];
      const img = h('img', { alt: '', loading: 'lazy', decoding: 'async' });
      setPhoto(img, src, 'Galeri ' + (i + 1));
      return h('figure', {
        class: 'stack-photo stack-photo--' + p.kind,
        style: '--x:' + p.x + ';--y:' + p.y + ';--w:' + p.w + ';--r:' + p.r + 'deg'
      }, img);
    });

    const stage = h('div', { class: 'g-stack', 'aria-hidden': 'true' }, photos);
    box.append(h('div', { class: 'g-stack-wrap reveal reveal--zoom' }, stage));
    stack = { stage: stage, photos: photos };
  }

  function initStack() {
    if (!stack) return;
    const { stage, photos } = stack;
    if (U.reduceMotion || !('IntersectionObserver' in window)) {
      photos.forEach(p => p.classList.add('is-on'));
      return;
    }
    const TICK = 120;   /* ±8 gambar per detik — terasa seperti stop-motion */
    const STEP = 550;   /* jeda antarfoto */
    const wobble = amount => ((Math.random() * 2 - 1) * amount).toFixed(2);
    const jitter = el => {
      el.style.setProperty('--jx', wobble(0.8) + '%');
      el.style.setProperty('--jy', wobble(0.8) + '%');
      el.style.setProperty('--jr', wobble(0.7) + 'deg');
    };
    let timer = null;
    let t0 = 0;
    let inView = false;

    function frame() {
      /* Foto muncul satu per satu, lalu semuanya tetap tampil dan terus bergoyang */
      const shown = Math.min(photos.length, Math.floor((performance.now() - t0) / STEP) + 1);
      photos.forEach((p, i) => {
        const on = i < shown;
        /* Foto yang baru muncul tampil sedikit lebih besar selama satu "gambar" — kesan dijatuhkan */
        p.classList.toggle('is-drop', on && !p.classList.contains('is-on'));
        p.classList.toggle('is-on', on);
        if (on) jitter(p);
      });
    }
    const start = () => {
      if (timer || document.hidden || !inView) return;
      t0 = performance.now();
      frame();
      timer = setInterval(frame, TICK);
    };
    const stop = () => { clearInterval(timer); timer = null; };

    new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      if (inView) start(); else stop();
    }).observe(stage);
    document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else start(); });
  }

  /* Tanda kasih: ketuk nomor untuk menyalin */
  function renderGift() {
    const g = C.gift;
    const accounts = (g && g.accounts) || [];
    if (!accounts.length && !(g && g.address)) { U.removeSection('hadiah'); return; }
    if (g.text) $('#giftText').textContent = g.text;
    else $('#giftText').remove();
    const list = $('#giftList');

    accounts.forEach(a => {
      const digits = String(a.number).replace(/[\s-]/g, '');
      list.append(h('div', { class: 'gift' },
        h('p', { class: 'gift__bank' }, a.bank),
        h('button', {
          type: 'button',
          class: 'copy-num',
          'aria-label': 'Salin nomor ' + a.bank + ' ' + a.number,
          onclick: () => U.copyWithToast(digits, 'Nomor ' + a.bank + ' disalin')
        }, '[' + a.number + ']', icon('copy')),
        h('p', { class: 'copy-hint' }, 'ketuk nomor untuk menyalin'),
        h('p', { class: 'gift__holder' }, 'A.N : ' + a.holder)
      ));
    });

    const ad = g.address;
    if (ad) {
      const full = [ad.recipient, ad.phone].filter(Boolean).join(' · ') + '\n' + ad.text;
      list.append(h('div', { class: 'gift' },
        h('p', { class: 'gift__bank' }, 'Kirim Kado'),
        h('p', { class: 'gift__address' },
          h('strong', null, ad.recipient), ad.phone ? ' · ' + ad.phone : '', h('br'), ad.text),
        h('button', { type: 'button', class: 'link-ink', onclick: () => U.copyWithToast(full, 'Alamat disalin') }, icon('copy'), 'Salin alamat')
      ));
    }
  }

  function renderClosing() {
    const cl = C.closing || {};
    [['#closingText', cl.text], ['#closingGreeting', cl.greeting], ['#closingFamilies', cl.families]].forEach(([sel, text]) => {
      $(sel).textContent = text || '';
      $(sel).hidden = !text;
    });

    /* Huruf "SAMPAI JUMPA" berserakan & bergelombang */
    const offsets = [0, 9, -5, 12, -2, 7, 0, 10, -6, 4, 11, -3];
    const box = $('#scatter');
    box.append(h('span', { class: 'sr-only' }, 'Sampai jumpa'));
    Array.from('SAMPAI JUMPA').forEach((ch, i) => {
      box.append(ch === ' '
        ? h('span', { class: 'gap', 'aria-hidden': 'true' })
        : h('span', { 'aria-hidden': 'true', style: '--y:' + offsets[i % offsets.length] + 'px;--i:' + i }, ch));
    });
  }

  /* ------------------------------------------------------------------ */
  /* Ucapan                                                              */
  /* ------------------------------------------------------------------ */

  function wishItem(w, att) {
    return h('li', { class: 'wish' },
      h('p', { class: 'wish__head' },
        h('span', { class: 'wish__name' }, String(w.name || 'Tamu')),
        att ? h('span', { class: 'badge badge--' + att.kind }, att.label) : null
      ),
      h('p', { class: 'wish__msg' }, String(w.message || '')),
      h('time', { class: 'wish__time', datetime: w.timestamp }, U.timeAgo(w.timestamp))
    );
  }

  function wishStats(count, total) {
    const box = $('#wishStats');
    box.textContent = '';
    if (!total) return;
    box.append(
      h('b', null, String(total)), ' ucapan · ',
      h('b', null, String(count.yes)), ' hadir · ',
      h('b', null, String(count.no)), ' tidak hadir · ',
      h('b', null, String(count.maybe)), ' ragu'
    );
  }

  /* ------------------------------------------------------------------ */
  /* Interaksi                                                           */
  /* ------------------------------------------------------------------ */

  function initTopButton() {
    const btn = $('#topBtn');
    const update = () => btn.classList.toggle('is-visible', window.scrollY > 700);
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* Foto "tercetak" sekali saat pertama kali terlihat */
  function initDevelop() {
    const items = $$('[data-develop]');
    if (U.reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(el => el.classList.add('is-developed'));
      return;
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.3) return;
        entry.target.classList.add('is-developed');
        io.unobserve(entry.target);
      });
    }, { threshold: [0, 0.3] });
    items.forEach(el => io.observe(el));
  }

  /* Mode baca: halaman bergulir sendiri, berhenti saat tamu menyentuh layar */
  function initReadMode() {
    const btn = $('#readBtn');
    const SPEED = 45; /* piksel per detik */
    let active = false;
    let raf = 0;
    let last = 0;
    let carry = 0;

    function step(now) {
      if (!active) return;
      const dt = last ? Math.min(now - last, 100) : 16;
      last = now;
      carry += (SPEED * dt) / 1000;
      const px = Math.floor(carry);
      if (px >= 1) { carry -= px; window.scrollBy(0, px); }
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) { stop(); return; }
      raf = requestAnimationFrame(step);
    }
    function start() {
      active = true;
      last = 0;
      carry = 0;
      document.documentElement.style.scrollBehavior = 'auto';
      btn.classList.add('is-active');
      btn.setAttribute('aria-pressed', 'true');
      btn.setAttribute('aria-label', 'Hentikan mode baca');
      U.toast('Mode baca aktif — sentuh layar untuk berhenti');
      raf = requestAnimationFrame(step);
    }
    function stop() {
      if (!active) return;
      active = false;
      cancelAnimationFrame(raf);
      document.documentElement.style.scrollBehavior = '';
      btn.classList.remove('is-active');
      btn.setAttribute('aria-pressed', 'false');
      btn.setAttribute('aria-label', 'Mode baca: gulir otomatis');
    }

    btn.addEventListener('click', () => (active ? stop() : start()));
    ['wheel', 'touchstart', 'mousedown', 'keydown'].forEach(type => {
      window.addEventListener(type, e => {
        if (active && !(e.target instanceof Node && btn.contains(e.target))) stop();
      }, { passive: true });
    });
  }

  /* Bab kisah dimainkan saat ≥35% terlihat: tahun berputar, judul tertulis, kata muncul.
     Diputar ulang setiap kali bab masuk layar lagi. */
  function countYear(el) {
    const to = Number(el.dataset.year);
    const from = Number(el.dataset.from);
    if (!(to > from)) return;
    const token = (el._count = (el._count || 0) + 1);
    const duration = 1100;
    const t0 = performance.now();
    el.textContent = String(from);
    const tick = now => {
      if (el._count !== token) return; /* dibatalkan: bab sudah keluar layar */
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(from + (to - from) * eased));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  function initStory() {
    const chapters = $$('[data-chapter]');
    const yearOf = el => $('[data-year]', el);
    const play = el => {
      if (el.classList.contains('is-play')) return;
      el.classList.add('is-play');
      const year = yearOf(el);
      if (year && !U.reduceMotion) countYear(year);
    };
    /* Kembali ke keadaan awal saat bab sudah tidak terlihat (tamu tidak melihat reset-nya) */
    const reset = el => {
      el.classList.remove('is-play');
      const year = yearOf(el);
      if (year && year.dataset.from) {
        year._count = (year._count || 0) + 1;
        year.textContent = year.dataset.from;
      }
    };
    if (U.reduceMotion || !('IntersectionObserver' in window)) { chapters.forEach(play); return; }
    chapters.forEach(reset);
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.35) play(entry.target);
        else if (!entry.isIntersecting) reset(entry.target);
      });
    }, { threshold: [0, 0.35] });
    chapters.forEach(el => io.observe(el));
  }

  /* Lingkaran nama di sampul berayun sekali saat undangan selesai dimuat */
  function swingCoverRing() {
    if (U.reduceMotion) return;
    const go = () => setTimeout(() => $('#coverRing').classList.add('is-swinging'), 650);
    if (document.readyState === 'complete') go();
    else window.addEventListener('load', go);
  }

  /* ------------------------------------------------------------------ */

  renderBasics();
  renderOpening();
  renderCouple();
  renderEvents();
  initCountdown();
  renderDressCode();
  renderStory();
  renderGallery();
  renderGift();
  renderClosing();
  splitTitles();
  U.initRsvp({ item: wishItem, stats: wishStats });
  U.initNav();
  initTopButton();
  initReadMode();
  swingCoverRing();
  /* Ayunan & efek cetak baru dipantau setelah sampul terbuka */
  U.initCover({
    music: U.initMusic(),
    duration: 1100,
    revealRepeat: true, /* animasi diulang setiap bagian masuk layar */
    onOpen: () => { U.initSwing(); initDevelop(); initStory(); initStack(); }
  });
  U.initLoader();
})();

/* ==========================================================================
   Efek 3D: komidi putar foto, angka hitung mundur terbalik, kemiringan
   mengikuti mouse / gerakan HP / scroll. Berjalan setelah halaman di atas tersusun.
   ========================================================================== */
(function () {
  'use strict';

  const U = window.UndanganCore;
  if (!U) return;
  const { C, $, $$, h, setPhoto } = U;
  const root = document.documentElement;
  const clamp = (v, max) => Math.max(-max, Math.min(max, v));

  /* ---------- Komidi putar foto 3D (sebelum tumpukan foto) ---------- */
  function buildOrbit() {
    const box = $('#gallery');
    const list = (C.gallery || []).slice(0, 10);
    if (!box || list.length < 3) return;
    const n = list.length;
    const orbit = h('div', { class: 'orbit', style: '--n:' + n });
    list.forEach((src, i) => {
      const img = h('img', { alt: '', loading: 'lazy', decoding: 'async' });
      setPhoto(img, src, 'Galeri ' + (i + 1));
      orbit.append(h('figure', { class: 'orbit__item', style: '--i:' + i }, img));
    });
    orbit.append(h('span', { class: 'orbit__floor' }));
    const wrap = h('div', { class: 'g-orbit reveal reveal--zoom', 'aria-hidden': 'true' }, orbit);
    const stack = $('.g-stack-wrap', box);
    if (stack) box.insertBefore(wrap, stack); else box.append(wrap);

    /* Ukuran foto & jari-jari disesuaikan lebar layar dan jumlah foto */
    const size = () => {
      const avail = Math.min(box.clientWidth || 340, 560);
      const tan = Math.tan(Math.PI / n);
      const w = Math.max(70, Math.min(170, Math.floor((avail / 2.3 - 12) * 2 * tan)));
      wrap.style.setProperty('--w', w + 'px');
      wrap.style.setProperty('--rad', Math.round(w / 2 / tan + 12) + 'px');
    };
    size();
    window.addEventListener('resize', size);
  }

  /* ---------- Angka hitung mundur terbalik saat berganti ---------- */
  function initFlip() {
    $$('.countdown__num').forEach(el => {
      new MutationObserver(() => {
        el.classList.remove('is-flip');
        void el.offsetWidth;
        el.classList.add('is-flip');
      }).observe(el, { childList: true, characterData: true, subtree: true });
    });
  }

  /* ---------- Miring mengikuti mouse (laptop) ---------- */
  function initPointerTilt() {
    const bind = (zone, target, max) => {
      zone.addEventListener('pointermove', e => {
        if (e.pointerType !== 'mouse') return;
        const r = zone.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        target.style.setProperty('--ry', (px * 2 * max).toFixed(1) + 'deg');
        target.style.setProperty('--rx', (-py * 2 * max).toFixed(1) + 'deg');
      });
      zone.addEventListener('pointerleave', () => {
        target.style.removeProperty('--rx');
        target.style.removeProperty('--ry');
      });
    };
    $$('.gallery__btn .polaroid, .instax, .strip, .box').forEach(el => bind(el, el, 14));
    $$('.scene').forEach(el => bind(el, el, 12));
    const cover = $('#cover');
    const inner = $('.cover__inner');
    if (cover && inner) bind(cover, inner, 9);
  }

  /* ---------- Miring mengikuti gerakan HP (giroskop) ---------- */
  function initGyro() {
    if (!('DeviceOrientationEvent' in window)) return;
    let base = null;
    let pending = false;
    const onMove = e => {
      if (e.beta == null || e.gamma == null) return;
      if (!base) base = { b: e.beta, g: e.gamma };
      const gx = clamp((e.beta - base.b) * -0.45, 11);
      const gy = clamp((e.gamma - base.g) * 0.45, 11);
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        pending = false;
        root.style.setProperty('--gx', gx.toFixed(1) + 'deg');
        root.style.setProperty('--gy', gy.toFixed(1) + 'deg');
      });
    };
    const listen = () => window.addEventListener('deviceorientation', onMove);
    /* iPhone meminta izin, dan hanya boleh diminta di dalam ketukan tamu */
    const ask = window.DeviceOrientationEvent.requestPermission;
    if (typeof ask === 'function') {
      $('#openBtn').addEventListener('click', () => {
        ask.call(window.DeviceOrientationEvent).then(state => { if (state === 'granted') listen(); }).catch(() => {});
      }, { once: true });
    } else listen();
  }

  /* ---------- Miring mengikuti kecepatan scroll ---------- */
  function initScrollTilt() {
    let lastY = window.scrollY;
    let target = 0;
    let value = 0;
    let running = false;
    const step = () => {
      value += (target - value) * 0.22;
      target *= 0.82;
      if (Math.abs(value) < 0.05 && Math.abs(target) < 0.05) {
        value = 0;
        running = false;
        root.style.removeProperty('--sv');
        return;
      }
      root.style.setProperty('--sv', value.toFixed(2) + 'deg');
      requestAnimationFrame(step);
    };
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      target = clamp((y - lastY) * 0.5, 16);
      lastY = y;
      if (!running && Math.abs(target) > 0.6) { running = true; requestAnimationFrame(step); }
    }, { passive: true });
  }

  buildOrbit();
  initFlip();
  if (!U.reduceMotion) {
    initPointerTilt();
    initGyro();
    initScrollTilt();
  }
})();
