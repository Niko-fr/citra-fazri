/* ==========================================================================
   KONFIGURASI UNDANGAN
   Semua isi undangan diatur dari file ini — tidak perlu mengubah HTML/JS lain.
   Teks undangan memakai bahasa Inggris (komentar petunjuk tetap bahasa Indonesia).

   - Teks      : ganti langsung di antara tanda kutip "...".
   - Tanggal   : format "TAHUN-BULAN-TANGGALTJAM:MENIT:00+07:00"
                 (+07:00 = WIB, +08:00 = WITA, +09:00 = WIT).
   - Foto      : simpan di folder assets/img lalu sesuaikan nama filenya di sini.
                 Selama foto belum ada, halaman menampilkan placeholder.
   ========================================================================== */
window.UNDANGAN = {
  /* Zona waktu untuk menampilkan jam acara */
  timeZone: "Asia/Jakarta", // "Asia/Makassar" untuk WITA, "Asia/Jayapura" untuk WIT
  timeZoneLabel: "WIB",

  /* Sapaan di sampul bila link dibuka tanpa ?to=Nama */
  defaultGuest: "Our Honoured Guest",

  /* true = nama mempelai wanita ditulis lebih dulu */
  brideFirst: true,

  groom: {
    nickname: "Fazri",
    fullName: "Fazri", // nama lengkap + gelar, mis. "Fazri Pratama, S.T."
    parents: "First son of Mr. Hendra Wijaya & Mrs. Sri Lestari",
    instagram: "", // tanpa @ — kosongkan bila tidak ingin ditampilkan
    photo: "assets/img/pria.jpg"
  },

  bride: {
    nickname: "Citra",
    fullName: "Citra", // nama lengkap + gelar, mis. "Citra Lestari, S.Psi."
    parents: "Second daughter of Mr. Ahmad Fauzi & Mrs. Ratna Dewi",
    instagram: "",
    photo: "assets/img/wanita.jpg"
  },

  /* Gambar preview WhatsApp = assets/img/preview.jpg (diatur di <head> index.html) */
  photos: {
    hero: "assets/img/hero.jpg"   // polaroid kiri di beranda (di bawah nama)
  },

  /* Salam & kutipan pembuka — ganti sesuai keyakinan/selera (boleh dikosongkan) */
  opening: {
    greeting: "Assalamu'alaikum Warahmatullahi Wabarakatuh",
    text: "By the grace and blessing of Allah SWT, we joyfully announce the marriage of our beloved children:",
    quote: "And of His signs is that He created for you from yourselves mates that you may find tranquillity in them; and He placed between you affection and mercy. Indeed in that are signs for a people who give thought.",
    quoteSource: "Surah Ar-Rum: 21"
  },

  /* Acara pertama dipakai untuk hitung mundur */
  events: [
    {
      title: "Marriage Ceremony",
      start: "2026-12-19T08:00:00+07:00",
      end: "2026-12-19T10:00:00+07:00", // isi "" untuk menampilkan "... onwards"
      venue: "Masjid Raya Al-Ikhlas",
      address: "Jl. Kenanga Raya No. 8, Kebayoran Baru, Jakarta Selatan",
      mapsUrl: "",   // link dari Google Maps (Bagikan → Salin link). Kosong = dicari dari nama & alamat
      showMap: false // true = tampilkan peta di dalam kartu
    },
    {
      title: "Wedding Reception",
      start: "2026-12-19T11:00:00+07:00",
      end: "2026-12-19T14:00:00+07:00",
      venue: "Gedung Serbaguna Pandawa",
      address: "Jl. Melati No. 21, Cilandak, Jakarta Selatan",
      mapsUrl: "",
      showMap: true
    }
  ],

  /* Kosongkan colors: [] untuk menyembunyikan bagian Dress Code */
  dressCode: {
    note: "We would be delighted if you could wear the following colours on our special day.",
    colors: [
      { name: "Cream", hex: "#EFE4CC" },
      { name: "Maroon", hex: "#7A1F2B" },
      { name: "Black", hex: "#1C1C1C" }
    ]
  },

  /* Kosongkan story: [] untuk menyembunyikan bagian Our Journey */
  story: [
    {
      year: "2019",
      title: "How We Met",
      text: "We first met at a weekend photography class in Bandung. A short chat about camera lenses turned into an afternoon coffee that lasted for hours."
    },
    {
      year: "2021",
      title: "Growing Together",
      text: "The distance between Jakarta and Surabaya never made us give up. Video calls every night and train rides at the end of each month taught us patience and trust."
    },
    {
      year: "2025",
      title: "The Proposal",
      text: "In front of both our families, Fazri asked for Citra's hand. That day, we agreed to take the next step together."
    },
    {
      year: "2026",
      title: "Our Wedding Day",
      text: "With our parents' blessing and the prayers of our loved ones, we begin a new chapter as husband and wife."
    }
  ],

  /* Urutan galeri: foto 1 polaroid besar · foto 2–3 instax berlabel ·
     foto 4–5 strip foto (cocok untuk foto masa kecil) · foto 6 lebar · sisanya kisi.
     Foto 1 juga tampil sebagai polaroid kanan di beranda. */
  gallery: [
    "assets/img/galeri-1.jpg",
    "assets/img/galeri-2.jpg",
    "assets/img/galeri-3.jpg",
    "assets/img/galeri-4.jpg",
    "assets/img/galeri-5.jpg",
    "assets/img/galeri-6.jpg"
  ],

  /* Foto untuk tumpukan stop-motion di akhir galeri, maksimal 5.
     Kosong [] = memakai 5 foto pertama galeri. */
  photoStack: [],

  /* Kutipan di samping strip foto. Kosongkan "" bila tidak dipakai. */
  galleryQuote: "Ordinary days have felt warmer ever since you came along.",

  rsvp: {
    /* URL Web App Google Apps Script (lihat README di folder undangan-catatan).
       Kosong = mode demo: ucapan hanya tersimpan di browser masing-masing tamu. */
    endpoint: "",
    pageSize: 8
  },

  gift: {
    text: "Your prayers and blessings mean the world to us. However, if you wish to give a token of love, you may do so through:",
    accounts: [
      { bank: "BCA", number: "1234567890", holder: "Fazri" },
      { bank: "GoPay", number: "081200001111", holder: "Citra" }
    ],
    /* Hapus blok address (atau isi null) bila tidak menerima kiriman kado */
    address: {
      recipient: "Citra",
      phone: "0812-0000-1111",
      text: "Jl. Melati No. 21, Cilandak, Jakarta Selatan 12430"
    }
  },

  closing: {
    text: "It would be an honour and a joy for us if you could attend and give us your blessings. Thank you for your presence and your prayers.",
    greeting: "Wassalamu'alaikum Warahmatullahi Wabarakatuh",
    families: "The families of Mr. Hendra Wijaya & Mr. Ahmad Fauzi"
  },

  /* Musik latar — mulai saat tamu menekan "Open Invitation".
     Taruh file MP3 di assets/music. Pastikan Anda berhak memakai lagunya.
     Kosongkan src: "" untuk undangan tanpa musik. */
  music: {
    src: "assets/music/lagu.mp3"
  }
};
