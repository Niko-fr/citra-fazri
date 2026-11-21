/* ==========================================================================
   Stiker ucapan — gambar sendiri (SVG), kotak 100 × 100.
   Disimpan di Google Sheets sebagai kode di awal ucapan, mis. "[sticker:rings] Selamat!".
   Garis default: tinta 3px (diatur oleh js/main.js); warna isian memakai palet di bawah.
   Menambah stiker: tambahkan { id, label, svg } — id huruf kecil/angka/tanda hubung.
   ========================================================================== */
(function () {
  'use strict';

  const K = '#1E1E1C';  /* tinta */
  const C = '#FFFDF6';  /* krem */
  const P = '#F6C6CC';  /* merah muda */
  const M = '#A12C3E';  /* maroon */
  const G = '#F0CF86';  /* emas */
  const Y = '#FFE08A';  /* kuning wajah */
  const B = '#BFE3F2';  /* biru muda */
  const S = '#C9D8B6';  /* hijau daun */
  const T = '#D8A878';  /* cokelat beruang */
  const W = '#E8E2D6';  /* abu kucing */

  const HEART = 'M0 9C-7 4-11 0-11-4.5C-11-8.3-8.3-10.6-5.3-10.6C-2.9-10.6-1.1-9.1 0-7C1.1-9.1 2.9-10.6 5.3-10.6C8.3-10.6 11-8.3 11-4.5C11 0 7 4 0 9Z';
  const heart = (x, y, s, fill) =>
    '<path transform="translate(' + x + ' ' + y + ') scale(' + s + ')" stroke-width="' + (3 / s).toFixed(2) + '" fill="' + fill + '" d="' + HEART + '"/>';
  const spark = (x, y, s, fill) =>
    '<path transform="translate(' + x + ' ' + y + ') scale(' + s + ')" stroke-width="' + (2.4 / s).toFixed(2) + '" fill="' + (fill || G) + '" d="M0-7L1.8-1.8 7 0 1.8 1.8 0 7-1.8 1.8-7 0-1.8-1.8Z"/>';
  const text = (x, y, str, size, fill, len) =>
    '<text x="' + x + '" y="' + y + '" text-anchor="middle" font-family="\'Dancing Script\', cursive" font-weight="700" font-size="' + size +
    '" fill="' + fill + '" stroke="none" textLength="' + len + '" lengthAdjust="spacingAndGlyphs">' + str + '</text>';
  const face = (fill) => '<circle cx="50" cy="54" r="34" fill="' + (fill || Y) + '"/>';
  const dot = (x, y, r, fill) => '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + fill + '" stroke="none"/>';

  /* Burung kecil (menghadap kanan, kaki di 0,0) — sama dengan ilustrasi taman */
  const bird = (x, y, sx, s, fill) =>
    '<g transform="translate(' + x + ' ' + y + ') scale(' + sx * s + ' ' + s + ')" stroke-width="' + (3 / s).toFixed(2) + '">' +
    '<path fill="' + fill + '" d="M-7-8L-19-2-18-9Z"/>' +
    '<path fill="' + fill + '" d="M-11-9C-11-16-4-19 2-18C8-17 11-13 11-8C11-3 6 0 0 0C-6 0-11-4-11-9Z"/>' +
    '<path fill="' + C + '" d="M-7-12C-3-14.5 3-13.5 6-9.5C2-7-4-7.5-7-12Z"/>' +
    '<circle fill="' + fill + '" cx="7" cy="-19" r="5.5"/>' +
    '<path fill="' + G + '" d="M12.3-20.6L16.6-18.7 12.3-16.9Z"/>' +
    '<path d="M-2 0V3M3 0V3"/>' + dot(8.7, -20, 1.1, K) + '</g>';

  /* Kuncup mawar: lingkaran + pusaran kelopak */
  const rose = (x, y, r, fill) =>
    '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + fill + '"/>' +
    '<path stroke-width="2" d="M' + x + ' ' + (y - r * 0.45) + 'C' + (x - r * 0.55) + ' ' + (y - r * 0.45) + ' ' + (x - r * 0.55) + ' ' + (y + r * 0.35) + ' ' + x + ' ' + (y + r * 0.35) +
    'C' + (x + r * 0.45) + ' ' + (y + r * 0.35) + ' ' + (x + r * 0.45) + ' ' + (y - r * 0.1) + ' ' + (x + r * 0.05) + ' ' + (y - r * 0.1) + '"/>';

  /* Ledakan bintang bergerigi untuk latar tulisan */
  const burst = (cx, cy, r1, r2, n, fill) => {
    let d = '';
    for (let i = 0; i < n * 2; i++) {
      const a = (i * Math.PI) / n - Math.PI / 2;
      const r = i % 2 ? r2 : r1;
      d += (i ? 'L' : 'M') + (cx + Math.cos(a) * r).toFixed(1) + ' ' + (cy + Math.sin(a) * r).toFixed(1);
    }
    return '<path fill="' + fill + '" d="' + d + 'Z"/>';
  };

  const list = [
    /* ---------- Wajah ---------- */
    { id: 'heart-eyes', label: 'Heart eyes', svg:
      face() + heart(37, 47, 0.95, M) + heart(63, 47, 0.95, M) +
      '<path fill="' + K + '" d="M34 61C38 75 62 75 66 61Z"/>' +
      '<path fill="' + P + '" stroke="none" d="M43 69.5C46.5 66.5 53.5 66.5 57 69.5C54 72 46 72 43 69.5Z"/>' },
    { id: 'joy', label: 'Tears of joy', svg:
      face() + '<path d="M33 49C36 44 41 44 44 49M56 49C59 44 64 44 67 49"/>' +
      '<path fill="' + B + '" d="M29 52C25 58 23 62 26 65.5C29 68.5 34 66 33 61.5C32.5 58 30.5 55 29 52Z"/>' +
      '<path fill="' + B + '" d="M71 52C75 58 77 62 74 65.5C71 68.5 66 66 67 61.5C67.5 58 69.5 55 71 52Z"/>' +
      '<path fill="' + K + '" d="M36 59C40 74 60 74 64 59Z"/>' +
      '<path fill="' + P + '" stroke="none" d="M43 67.5C46.5 64.5 53.5 64.5 57 67.5C54 70 46 70 43 67.5Z"/>' },
    { id: 'blush', label: 'Blushing', svg:
      face() + '<path d="M33 48C36 52 41 52 44 48M56 48C59 52 64 52 67 48"/>' +
      '<ellipse cx="32" cy="59" rx="6.5" ry="3.8" fill="' + P + '" stroke="none"/><ellipse cx="68" cy="59" rx="6.5" ry="3.8" fill="' + P + '" stroke="none"/>' +
      '<path d="M40 62C45 69 55 69 60 62"/>' + heart(84, 26, 0.72, M) + heart(16, 30, 0.6, M) + heart(84, 82, 0.55, M) },
    { id: 'party', label: 'Party', svg:
      '<circle cx="50" cy="58" r="31" fill="' + Y + '"/>' +
      '<path fill="' + M + '" d="M34 36L46 6L62 32Z"/><path stroke="' + C + '" stroke-width="2.6" d="M40 24L56 22M43 15L53 14"/>' + dot(46, 6, 4.5, G) +
      '<path d="M35 56C38 52 42 52 45 56M55 56C58 52 62 52 65 56"/>' +
      '<path fill="' + K + '" d="M44 67C46 74 54 74 56 67Z"/>' +
      '<path stroke="' + M + '" d="M57 72L78 76"/><path stroke="' + M + '" d="M78 76C87 77 90 68 84 66C80 65 78 70 82 71"/>' +
      '<path fill="' + G + '" stroke="none" d="M14 22l6-2 1.5 5-6 2z"/><path fill="' + P + '" stroke="none" d="M80 22l5 3-3 4.5-5-3z"/>' +
      dot(20, 44, 2.5, M) + dot(86, 42, 2.5, G) + dot(14, 70, 2.5, B) },
    { id: 'kiss-face', label: 'Blowing a kiss', svg:
      face() + '<path d="M33 48C36 51 41 51 44 48"/>' + '<ellipse cx="61" cy="47" rx="3" ry="4" fill="' + K + '" stroke="none"/>' +
      '<path d="M47 60C53 59.5 53.5 64 48.5 64C53.5 64 53.5 68.5 47 68"/>' +
      '<ellipse cx="33" cy="60" rx="5.5" ry="3.2" fill="' + P + '" stroke="none"/>' + heart(76, 66, 0.85, M) },

    /* ---------- Cinta ---------- */
    { id: 'love', label: 'Big heart', svg:
      '<path fill="' + M + '" d="M50 86C26 68 12 54 12 37C12 24 21 15 33 15C41 15 47 20 50 27C53 20 59 15 67 15C79 15 88 24 88 37C88 54 74 68 50 86Z"/>' +
      '<path stroke="' + C + '" stroke-width="4" d="M25 35C26 29 30 26 35 26"/>' + spark(86, 12, 0.9) + spark(14, 78, 0.7) },
    { id: 'hearts', label: 'Hearts', svg:
      heart(38, 58, 2.2, M) + heart(70, 34, 1.45, P) + heart(74, 76, 1.0, C) +
      '<path stroke="' + C + '" stroke-width="3.5" d="M25 50C26 46 29 44 32 44"/>' + '<path d="M14 26l6 4M12 38h7M86 54l-6 2"/>' },
    { id: 'kiss', label: 'Kiss', svg:
      '<path fill="' + M + '" d="M14 50C22 37 37 33 50 43C63 33 78 37 86 50C78 67 63 75 50 75C37 75 22 67 14 50Z"/>' +
      '<path d="M14 50C30 57 70 57 86 50"/>' + '<path stroke="' + C + '" stroke-width="3.5" d="M29 44C33 41 37 40 41 42M55 63C60 63 64 62 68 59"/>' +
      spark(88, 20, 0.8) + spark(12, 78, 0.6) },
    { id: 'balloons', label: 'Heart balloons', svg:
      '<path d="M38 56C40 66 46 74 50 86M62 46C60 60 54 72 50 86"/>' +
      heart(38, 36, 2.0, M) + heart(63, 28, 1.7, P) +
      '<path stroke="' + C + '" stroke-width="3" d="M25 30C26 26 28 24 31 24M53 22C54 19 56 17.5 58 17.5"/>' +
      '<path fill="' + M + '" d="M50 86C44 80 39 86 43 90C46 92 50 88 50 86ZM50 86C56 80 61 86 57 90C54 92 50 88 50 86Z"/>' },
    { id: 'lock', label: 'Love lock', svg:
      '<path stroke-width="6" d="M35 52V38C35 28 41 21 50 21C59 21 65 28 65 38V52"/>' +
      heart(50, 64, 2.7, M) + dot(50, 58, 4, C) + '<path stroke="' + C + '" stroke-width="4" d="M50 61V69"/>' +
      '<circle cx="84" cy="80" r="6" fill="' + G + '"/><path d="M79 76L66 66M70 69l-3 4M74 72l-3 4"/>' + spark(16, 22, 0.7) },
    { id: 'forever', label: 'Forever', svg:
      '<path stroke-width="10" d="M50 44C42 31 21 31 21 44C21 57 42 57 50 44C58 31 79 31 79 44C79 57 58 57 50 44Z"/>' +
      '<path stroke="' + M + '" stroke-width="5" d="M50 44C42 31 21 31 21 44C21 57 42 57 50 44C58 31 79 31 79 44C79 57 58 57 50 44Z"/>' +
      text(50, 82, 'forever', 22, K, 62) + heart(50, 18, 0.7, P) },
    { id: 'letter', label: 'Love letter', svg:
      heart(40, 16, 0.7, M) + heart(60, 10, 0.55, P) +
      '<path fill="' + C + '" d="M24 26H76V60H24Z"/><path stroke-width="2" d="M32 35H68M32 43H60"/>' +
      '<path fill="' + C + '" d="M14 38H86V82H14Z"/><path d="M14 38L50 62L86 38M14 82L42 58M86 82L58 58"/>' + heart(50, 62, 1.1, M) },
    { id: 'rose', label: 'Rose', svg:
      '<path d="M50 52C50 66 48 78 50 92"/>' +
      '<path fill="' + S + '" d="M50 72C40 63 29 66 26 73C35 78 44 76 50 72Z"/><path fill="' + S + '" d="M50 80C60 71 71 73 74 80C65 85 56 84 50 80Z"/>' +
      '<path fill="' + M + '" d="M50 16C37 16 29 27 31 39C33 50 41 55 50 55C59 55 67 50 69 39C71 27 63 16 50 16Z"/>' +
      '<path stroke="' + C + '" stroke-width="2.4" d="M50 29C43 29 41 36 45 40C49 44 56 41 54 35M38 41C42 48 57 48 62 41M37 29C41 23 48 21 53 23"/>' + spark(80, 22, 0.7) },

    /* ---------- Pernikahan ---------- */
    { id: 'rings', label: 'Rings', svg:
      '<path fill="' + G + '" fill-rule="evenodd" d="M41 62a21 21 0 1 0 42 0a21 21 0 1 0-42 0ZM46 62a16 16 0 1 0 32 0a16 16 0 1 0-32 0Z"/>' +
      '<path fill="' + G + '" fill-rule="evenodd" d="M17 62a21 21 0 1 0 42 0a21 21 0 1 0-42 0ZM22 62a16 16 0 1 0 32 0a16 16 0 1 0-32 0Z"/>' +
      '<path fill="' + B + '" d="M38 42L30 34L34 27H42L46 34Z"/><path stroke-width="1.8" d="M30 34H46M34 27L38 42L42 27"/>' + spark(72, 24, 0.9) + spark(20, 20, 0.6) },
    { id: 'diamond', label: 'Diamond', svg:
      '<path fill="' + B + '" d="M20 38L35 20H65L80 38L50 84Z"/>' +
      '<path stroke-width="2.2" d="M20 38H80M35 20L44 38L50 84M65 20L56 38L50 84M44 38L50 20L56 38"/>' +
      '<path stroke="' + C + '" stroke-width="3" d="M30 36L38 26"/>' + spark(84, 18, 0.9) + spark(14, 66, 0.7) + spark(82, 70, 0.55) },
    { id: 'lovebirds', label: 'Lovebirds', svg:
      '<path d="M6 76C30 80 70 80 94 74"/><path fill="' + S + '" d="M16 77C14 70 18 66 22 66C24 71 20 76 16 77Z"/><path fill="' + S + '" d="M84 76C86 69 82 65 78 65C76 70 80 75 84 76Z"/>' +
      bird(28, 72, 1, 1.4, P) + bird(72, 72, -1, 1.4, C) + heart(50, 24, 1.1, M) },
    { id: 'cheers', label: 'Cheers', svg:
      '<path fill="' + G + '" d="M20 34l22-6 4 16c2 8-3 14-10 15-7 1-12-4-14-11z"/><path d="M37 59l5 20M34 82l14-4"/>' +
      '<path fill="' + G + '" d="M80 34l-22-6-4 16c-2 8 3 14 10 15 7 1 12-4 14-11z"/><path d="M63 59l-5 20M66 82l-14-4"/>' +
      '<path stroke="' + C + '" stroke-width="2.5" d="M25 38l14-4M75 38l-14-4"/>' +
      '<path d="M50 6v10M42 10l4 5M58 10l-4 5"/>' + dot(36, 48, 1.8, C) + dot(64, 50, 1.8, C) },
    { id: 'champagne', label: 'Champagne', svg:
      '<g transform="rotate(-18 50 62)"><path fill="#3F5B45" d="M42 92V58C42 50 46 46 46 40V26H54V40C54 46 58 50 58 58V92Z"/>' +
      '<path fill="' + C + '" d="M42 64H58V78H42Z"/>' + heart(50, 71, 0.45, M) + '<path fill="' + G + '" d="M46 26H54V36H46Z"/></g>' +
      '<circle cx="36" cy="18" r="5" fill="' + C + '"/><circle cx="28" cy="12" r="3.5" fill="' + C + '"/><circle cx="44" cy="10" r="3" fill="' + C + '"/>' +
      '<path fill="' + G + '" d="M18 4l7 3-3 7-7-3z"/>' + dot(60, 14, 2.5, M) + dot(70, 26, 2.5, G) + dot(14, 30, 2, P) },
    { id: 'cake', label: 'Wedding cake', svg:
      '<path d="M14 88H86"/>' +
      '<path fill="' + C + '" d="M24 66H76V86H24Z"/><path fill="' + C + '" d="M32 48H68V66H32Z"/><path fill="' + C + '" d="M40 33H60V48H40Z"/>' +
      '<path fill="' + P + '" d="M24 66H76V71C72 75 70 69 66 72C62 75 60 69 56 72C52 75 50 69 46 72C42 75 40 69 36 72C32 75 30 69 24 72Z"/>' +
      '<path fill="' + P + '" d="M32 48H68V52C64 56 62 50 58 53C54 56 52 50 48 53C44 56 42 50 38 53C36 55 34 51 32 53Z"/>' +
      dot(32, 80, 1.8, M) + dot(44, 80, 1.8, M) + dot(56, 80, 1.8, M) + dot(68, 80, 1.8, M) + dot(44, 60, 1.6, M) + dot(56, 60, 1.6, M) +
      '<path d="M50 33V27"/>' + heart(50, 20, 1.0, M) },
    { id: 'bouquet', label: 'Bouquet', svg:
      '<path fill="' + S + '" d="M30 50C23 44 23 37 27 33C33 37 34 45 30 50Z"/><path fill="' + S + '" d="M70 50C77 44 77 37 73 33C67 37 66 45 70 50Z"/>' +
      '<path d="M36 40L48 78M50 36V78M64 40L52 78"/>' +
      rose(36, 37, 11, P) + rose(64, 37, 11, P) + rose(50, 26, 12, M) +
      '<path fill="' + C + '" d="M31 54L50 92L69 54Z"/><path stroke-width="2" d="M40 54L50 78L60 54"/>' +
      '<path fill="' + M + '" d="M50 66C42 58 34 64 40 70C44 73 48 68 50 66ZM50 66C58 58 66 64 60 70C56 73 52 68 50 66Z"/><path d="M50 66L45 78M50 66L55 78"/>' },
    { id: 'bells', label: 'Wedding bells', svg:
      '<g transform="translate(36 50) rotate(-14)"><path fill="' + G + '" d="M0-20C-9-20-13-11-13-2C-13 6-16 10-19 14H19C16 10 13 6 13-2C13-11 9-20 0-20Z"/><circle cx="0" cy="18" r="4" fill="' + G + '"/></g>' +
      '<g transform="translate(64 50) rotate(14)"><path fill="' + G + '" d="M0-20C-9-20-13-11-13-2C-13 6-16 10-19 14H19C16 10 13 6 13-2C13-11 9-20 0-20Z"/><circle cx="0" cy="18" r="4" fill="' + G + '"/></g>' +
      '<path fill="' + M + '" d="M50 24C42 14 32 18 38 26C42 30 48 26 50 24ZM50 24C58 14 68 18 62 26C58 30 52 26 50 24Z"/><path d="M50 24L44 36M50 24L56 36"/>' +
      '<path d="M14 40l-6-3M86 40l6-3M16 54l-7 1M84 54l7 1"/>' },
    { id: 'dress', label: 'Wedding dress', svg:
      '<path d="M50 6C54 6 54 11 50 12V15M36 21L50 15L64 21"/>' +
      '<path fill="' + C + '" d="M41 20H59L57 33L62 41C74 51 80 69 82 90H18C20 69 26 51 38 41L43 33Z"/>' +
      '<path d="M43 33H57M38 41C46 45 54 45 62 41"/><path stroke-width="2" d="M30 80C36 76 42 82 50 78C58 82 64 76 70 80"/>' +
      dot(44, 56, 1.6, M) + dot(56, 56, 1.6, M) + dot(50, 64, 1.6, M) + dot(38, 68, 1.6, M) + dot(62, 68, 1.6, M) + spark(84, 26, 0.7) },
    { id: 'bowtie', label: 'Bow tie', svg:
      '<path fill="' + K + '" d="M50 50L20 34C15 42 15 58 20 66Z"/><path fill="' + K + '" d="M50 50L80 34C85 42 85 58 80 66Z"/>' +
      '<rect x="42" y="41" width="16" height="18" rx="4" fill="' + K + '"/>' +
      '<path stroke="' + C + '" stroke-width="2.5" d="M24 42C22 46 22 52 24 56M76 42C78 46 78 52 76 56"/>' + spark(84, 20, 0.8) + spark(16, 80, 0.6) },
    { id: 'car', label: 'Wedding car', svg:
      heart(34, 16, 0.75, M) + heart(62, 10, 0.55, P) +
      '<g transform="translate(50 84) scale(1.75)" stroke-width="1.7">' +
      '<ellipse cx="0" cy="0" rx="25" ry="3.6" fill="' + K + '" opacity=".15" stroke="none"/>' +
      '<path fill="' + K + '" d="M-21-7h7v8a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2zM14-7h7v8a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2z"/>' +
      '<path fill="' + C + '" d="M-16-21C-15-31-10-35 0-35C10-35 15-31 16-21Z"/>' +
      '<path fill="' + B + '" d="M-12.5-22C-12-29-8-32 0-32C8-32 12-29 12.5-22Z"/>' +
      '<path fill="' + K + '" d="M-8.6-22.5C-9.6-28-7.6-31.3-5-31.3C-2.4-31.3-.6-28-1.6-22.5Z"/>' +
      '<circle fill="' + C + '" cx="-5" cy="-27.4" r="2.5"/><circle fill="' + C + '" cx="5" cy="-27.4" r="2.6"/>' +
      '<path fill="' + K + '" d="M2.3-28C2.4-31 7.6-31 7.7-28C6.4-29.2 3.6-29.2 2.3-28Z"/>' +
      '<path fill="' + M + '" d="M-22-6C-23-14-21-19-17-21H17C21-19 23-14 22-6C22-3 20-2 17-2H-17C-20-2-22-3-22-6Z"/>' +
      '<path stroke="' + C + '" d="M-14-20.5C-8-17.5 8-17.5 14-20.5"/><path d="M-20-5H20M-17-19.5l-3.5-1.5M17-19.5l3.5-1.5"/>' +
      '<circle fill="' + C + '" cx="-14" cy="-11.5" r="3.4"/><circle fill="' + C + '" cx="14" cy="-11.5" r="3.4"/>' +
      '<path transform="translate(0 -12) scale(.42)" fill="' + C + '" stroke-width="3" d="' + HEART + '"/></g>' },
    { id: 'gift', label: 'Gift', svg:
      '<path fill="' + P + '" d="M22 46H78V86H22Z"/><path fill="' + P + '" d="M18 34H82V48H18Z"/>' +
      '<path fill="' + M + '" d="M45 34H55V86H45Z"/>' +
      '<path fill="' + M + '" d="M50 34C44 20 30 20 34 29C36 34 46 35 50 34ZM50 34C56 20 70 20 66 29C64 34 54 35 50 34Z"/>' + spark(86, 18, 0.8) + spark(12, 60, 0.6) },

    /* ---------- Lucu ---------- */
    { id: 'teddy', label: 'Teddy bear', svg:
      '<circle cx="34" cy="24" r="8" fill="' + T + '"/><circle cx="66" cy="24" r="8" fill="' + T + '"/>' + dot(34, 24, 3.5, P) + dot(66, 24, 3.5, P) +
      '<path fill="' + T + '" d="M30 88C26 72 34 57 50 57C66 57 74 72 70 88Z"/>' +
      '<circle cx="50" cy="39" r="20" fill="' + T + '"/><ellipse cx="50" cy="45" rx="8.5" ry="6.5" fill="' + C + '"/>' +
      '<path fill="' + K + '" d="M47 42h6l-3 3.2z"/>' + dot(42, 35, 2.3, K) + dot(58, 35, 2.3, K) +
      '<path d="M47.5 48C49 49.5 51 49.5 52.5 48"/>' + heart(50, 71, 1.5, M) + '<path d="M33 64C37 71 41 73 45 71M67 64C63 71 59 73 55 71"/>' },
    { id: 'cat', label: 'Kitty', svg:
      '<path fill="' + W + '" d="M28 38L25 13L43 28Z"/><path fill="' + W + '" d="M72 38L75 13L57 28Z"/>' +
      '<path fill="' + P + '" stroke="none" d="M30 30L28.5 19L37 27Z"/><path fill="' + P + '" stroke="none" d="M70 30L71.5 19L63 27Z"/>' +
      '<path fill="' + W + '" d="M22 50C22 34 31 25 50 25C69 25 78 34 78 50C78 67 66 77 50 77C34 77 22 67 22 50Z"/>' +
      '<path d="M35 48C37.5 45 41.5 45 44 48M56 48C58.5 45 62.5 45 65 48"/>' +
      '<path fill="' + P + '" d="M47.5 55h5l-2.5 3z"/><path d="M50 58C50 62 46 63 43.5 60.5M50 58C50 62 54 63 56.5 60.5"/>' +
      '<path stroke-width="2" d="M20 54l12 1.5M20 61l12-1M80 54l-12 1.5M80 61l-12-1"/>' +
      '<ellipse cx="34" cy="58" rx="4.5" ry="2.6" fill="' + P + '" stroke="none"/><ellipse cx="66" cy="58" rx="4.5" ry="2.6" fill="' + P + '" stroke="none"/>' +
      heart(80, 84, 0.8, M) },
    { id: 'camera', label: 'Camera', svg:
      '<path fill="' + C + '" d="M34 34L40 25H60L66 34Z"/>' +
      '<rect x="14" y="33" width="72" height="48" rx="9" fill="' + C + '"/>' +
      '<circle cx="50" cy="57" r="16" fill="' + C + '"/><circle cx="50" cy="57" r="10.5" fill="' + K + '"/>' + heart(50, 57.5, 0.55, P) +
      '<rect x="70" y="40" width="9" height="6" rx="2" fill="' + G + '"/>' + spark(86, 16, 0.85) + spark(14, 20, 0.6) },
    { id: 'honeymoon', label: 'Honeymoon', svg:
      '<path stroke-dasharray="2 7" d="M12 84C24 74 22 60 38 57"/>' + heart(12, 86, 0.6, M) +
      '<path fill="' + C + '" d="M30 56L90 20L70 80L54 62Z"/><path fill="' + B + '" d="M54 62L90 20L58 78Z"/><path d="M54 62L90 20"/>' + spark(30, 22, 0.7) },
    { id: 'home', label: 'Home', svg:
      '<path fill="' + C + '" d="M62 32V20H70V40Z"/>' + heart(73, 11, 0.5, P) +
      '<path fill="' + C + '" d="M22 52L50 28L78 52V86H22Z"/>' +
      '<path fill="' + M + '" d="M12 56L50 22L88 56L80 56L50 30L20 56Z"/>' +
      '<path fill="' + P + '" d="M43 86V68C43 62 57 62 57 68V86Z"/>' + heart(33, 64, 0.7, M) + heart(67, 64, 0.7, M) + '<path d="M14 86H86"/>' },
    { id: 'music', label: 'Love song', svg:
      '<path fill="' + K + '" d="M36 30L72 21V30L36 39Z"/><path stroke-width="4" d="M37 32V70M71 23V62"/>' +
      '<ellipse cx="30" cy="72" rx="8" ry="6" transform="rotate(-20 30 72)" fill="' + K + '"/><ellipse cx="64" cy="64" rx="8" ry="6" transform="rotate(-20 64 64)" fill="' + K + '"/>' +
      heart(84, 36, 0.7, M) + heart(16, 36, 0.55, P) + heart(86, 82, 0.5, P) },

    /* ---------- Tulisan ---------- */
    { id: 'congrats', label: 'Congrats!', svg:
      '<path fill="' + M + '" d="M14 46H3L9 55L3 64H14Z"/><path fill="' + M + '" d="M86 46H97L91 55L97 64H86Z"/>' +
      '<path fill="' + M + '" d="M13 40H87V64H13Z"/>' + text(50, 58, 'Congrats!', 19, C, 64) +
      spark(28, 22, 0.8) + spark(74, 18, 0.95) + dot(50, 20, 2.4, M) + dot(18, 80, 2.4, G) + dot(82, 82, 2.4, P) },
    { id: 'happy-wedding', label: 'Happy Wedding!', svg:
      '<circle cx="50" cy="52" r="40" fill="' + C + '"/><circle cx="50" cy="52" r="34" stroke-width="1.6" stroke-dasharray="3 4"/>' +
      text(50, 48, 'Happy', 20, K, 46) + text(50, 69, 'Wedding!', 19, M, 60) + heart(50, 24, 0.6, M) },
    { id: 'barakallah', label: 'Barakallah', svg:
      '<path fill="' + G + '" d="M38 8C26 12 21 25 25 36C29 47 42 52 53 47C42 47 33 39 33 28C33 20 36 13 43 8C41 7.5 40 7.5 38 8Z"/>' + spark(58, 18, 0.95) + spark(70, 34, 0.55) +
      '<rect x="6" y="56" width="88" height="28" rx="14" fill="' + C + '"/>' + text(50, 75.5, 'Barakallah', 18, K, 70) },
    { id: 'samawa', label: 'Samawa', svg:
      '<path fill="' + P + '" d="M50 88C25 70 10 56 10 38C10 25 20 15 32 15C41 15 47 20 50 27C53 20 59 15 68 15C80 15 90 25 90 38C90 56 75 70 50 88Z"/>' +
      text(50, 52, 'Samawa', 19, M, 56) + spark(86, 12, 0.8) + spark(14, 80, 0.6) },
    { id: 'just-married', label: 'Just Married', svg:
      '<path d="M50 10L16 42M50 10L84 42"/>' + dot(50, 10, 3.2, K) +
      '<rect x="8" y="40" width="84" height="44" rx="10" fill="' + C + '"/>' +
      text(50, 59, 'Just', 18, K, 34) + text(50, 77, 'Married', 18, M, 58) + heart(16, 48, 0.42, M) + heart(84, 48, 0.42, M) },
    { id: 'mr-mrs', label: 'Mr & Mrs', svg:
      '<ellipse cx="50" cy="50" rx="44" ry="31" fill="' + C + '"/><ellipse cx="50" cy="50" rx="38" ry="25" stroke-width="1.6" stroke-dasharray="3 4"/>' +
      text(50, 58, 'Mr &amp; Mrs', 21, K, 66) + heart(50, 20, 0.55, M) + heart(50, 82, 0.45, P) },
    { id: 'love-you', label: 'Love you!', svg:
      '<path fill="' + C + '" d="M20 18H80Q88 18 88 26V56Q88 64 80 64H46L30 80L33 64H20Q12 64 12 56V26Q12 18 20 18Z"/>' +
      text(50, 47, 'Love you!', 19, M, 62) + heart(86, 14, 0.6, M) + heart(78, 80, 0.45, P) },
    { id: 'selamat', label: 'Selamat!', svg:
      burst(50, 50, 44, 34, 16, G) + text(50, 57, 'Selamat!', 20, K, 62) + dot(14, 14, 2.4, M) + dot(88, 86, 2.4, M) },
    { id: 'aamiin', label: 'Aamiin', svg:
      '<rect x="10" y="30" width="80" height="40" rx="20" fill="' + B + '"/><rect x="15" y="35" width="70" height="30" rx="15" stroke-width="1.6" stroke-dasharray="3 4"/>' +
      text(50, 57, 'Aamiin', 21, K, 50) + spark(18, 18, 0.8) + spark(84, 84, 0.7) + spark(86, 20, 0.5) },
    { id: 'best-wishes', label: 'Best Wishes', svg:
      '<path d="M79 50C89 50 95 40 92 30"/>' +
      '<path fill="' + P + '" d="M10 28H68L86 50L68 72H10Z"/>' + dot(75, 50, 3.6, C) +
      text(40, 47, 'Best', 17, K, 32) + text(40, 64, 'Wishes', 17, M, 46) + spark(16, 16, 0.6) }
  ];

  const map = {};
  list.forEach(s => { map[s.id] = s; });
  window.UndanganStickers = { list: list, map: map };
})();
