/* ==========================================================================
   KONFIGURASI UNDANGAN
   Semua isi undangan diatur dari file ini — tidak perlu mengubah HTML/JS lain.

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

  /* Sapaan bila link dibuka tanpa ?to=Nama */
  defaultGuest: "Bapak/Ibu/Saudara/i",

  /* true = nama mempelai wanita ditulis lebih dulu */
  brideFirst: true,

  groom: {
    nickname: "Fazri",
    fullName: "Fazri", // nama lengkap + gelar, mis. "Fazri Pratama, S.T."
    parents: "Putra pertama dari Bapak Hendra Wijaya & Ibu Sri Lestari",
    instagram: "", // tanpa @ — kosongkan bila tidak ingin ditampilkan
    photo: "assets/img/pria.jpg"
  },

  bride: {
    nickname: "Citra",
    fullName: "Citra", // nama lengkap + gelar, mis. "Citra Lestari, S.Psi."
    parents: "Putri kedua dari Bapak Ahmad Fauzi & Ibu Ratna Dewi",
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
    text: "Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan pernikahan putra-putri kami:",
    quote: "Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.",
    quoteSource: "QS. Ar-Rum: 21"
  },

  /* Acara pertama dipakai untuk hitung mundur */
  events: [
    {
      title: "Akad Nikah",
      start: "2026-12-19T08:00:00+07:00",
      end: "2026-12-19T10:00:00+07:00", // isi "" untuk menampilkan "Selesai"
      venue: "Masjid Raya Al-Ikhlas",
      address: "Jl. Kenanga Raya No. 8, Kebayoran Baru, Jakarta Selatan",
      mapsUrl: "",   // link dari Google Maps (Bagikan → Salin link). Kosong = dicari dari nama & alamat
      showMap: false // true = tampilkan peta di dalam kartu
    },
    {
      title: "Resepsi",
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
    note: "Kami akan senang bila Anda berkenan mengenakan warna-warna berikut di hari bahagia kami.",
    colors: [
      { name: "Krem", hex: "#EFE4CC" },
      { name: "Merah Maroon", hex: "#7A1F2B" },
      { name: "Hitam", hex: "#1C1C1C" }
    ]
  },

  /* Kosongkan story: [] untuk menyembunyikan bagian Kisah Kami */
  story: [
    {
      year: "2019",
      title: "Awal Bertemu",
      text: "Kami pertama kali bertemu di sebuah kelas fotografi akhir pekan di Bandung. Obrolan singkat soal lensa berlanjut menjadi kopi sore yang tak terasa berjam-jam."
    },
    {
      year: "2021",
      title: "Menjalin Kisah",
      text: "Jarak Jakarta–Surabaya tidak membuat kami menyerah. Panggilan video setiap malam dan perjalanan kereta di akhir bulan mengajarkan kami arti sabar dan percaya."
    },
    {
      year: "2025",
      title: "Lamaran",
      text: "Di hadapan kedua keluarga, Fazri menyampaikan niat baiknya. Hari itu kami sepakat untuk melangkah ke jenjang yang lebih serius."
    },
    {
      year: "2026",
      title: "Hari Bahagia",
      text: "Dengan restu orang tua dan doa dari orang-orang terkasih, kami memulai babak baru sebagai pasangan suami istri."
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
  galleryQuote: "Hari-hari biasa terasa lebih hangat sejak ada kamu.",

  rsvp: {
    /* URL Web App Google Apps Script (lihat README di folder undangan-catatan).
       Kosong = mode demo: ucapan hanya tersimpan di browser masing-masing tamu. */
    endpoint: "",
    pageSize: 8
  },

  gift: {
    text: "Doa restu Anda merupakan karunia yang sangat berarti bagi kami. Namun, jika Anda ingin memberikan tanda kasih, dapat melalui:",
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
    text: "Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu. Atas kehadiran dan doanya, kami ucapkan terima kasih.",
    greeting: "Wassalamu'alaikum Warahmatullahi Wabarakatuh",
    families: "Keluarga Besar Bapak Hendra Wijaya & Keluarga Besar Bapak Ahmad Fauzi"
  },

  /* Musik latar — mulai saat tamu menekan "Buka Undangan".
     Taruh file MP3 di assets/music. Pastikan Anda berhak memakai lagunya.
     Kosongkan src: "" untuk undangan tanpa musik. */
  music: {
    src: "assets/music/lagu.mp3"
  }
};
