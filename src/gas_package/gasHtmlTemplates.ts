/**
 * Paket 16 File HTML/Template Google Apps Script Web App CBT SMK
 */

import { GasFileItem } from "./gasSourceCode";

export const GAS_HTML_FILES: GasFileItem[] = [
  {
    filename: "Index.html",
    category: "HTML",
    description: "File index utama Google Apps Script Web App yang merender seluruh komponen CBT secara modular.",
    content: `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CBT SMK Profesional - Ujian Berbasis Komputer</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <?!= include('Style'); ?>
</head>
<body class="bg-slate-50 text-slate-900 antialiased font-sans min-h-screen dark:bg-slate-950 dark:text-slate-100">
  <div id="app-root">
    <!-- Navbar & App Frame -->
    <?!= include('Navbar'); ?>
    
    <div class="flex">
      <!-- Sidebar Desktop -->
      <?!= include('Sidebar'); ?>
      
      <!-- Main Content Container -->
      <main id="main-content" class="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        <div id="view-container">
          <!-- Dynamic Views Loaded Here (Login, Dashboard, Exam, etc) -->
        </div>
      </main>
    </div>
  </div>

  <script>
    // Inisialisasi State Aplikasi
    var AppState = {
      currentUser: null,
      currentRole: null,
      activeExam: null,
      currentView: 'login'
    };
  </script>
</body>
</html>
`,
  },
  {
    filename: "Login.html",
    category: "HTML",
    description: "Halaman login responsif untuk Guru dan Siswa (menggunakan NISN atau NIP/Username).",
    content: `<div class="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8 bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
    <div class="text-center">
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 text-white font-bold text-2xl shadow-lg mb-4">
        CBT
      </div>
      <h2 class="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
        CBT SMK Profesional
      </h2>
      <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">
        Sistem Ujian Berbasis Komputer & Google Apps Script
      </p>
    </div>

    <!-- Role Switcher -->
    <div class="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
      <button id="btn-role-siswa" class="flex-1 py-2 text-sm font-semibold rounded-lg bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400">
        Siswa
      </button>
      <button id="btn-role-guru" class="flex-1 py-2 text-sm font-semibold rounded-lg text-slate-600 dark:text-slate-400">
        Guru / Pengawas
      </button>
    </div>

    <!-- Login Form -->
    <form class="mt-6 space-y-4" id="form-login">
      <div>
        <label id="label-username" class="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
          NISN / Username
        </label>
        <input id="input-username" type="text" required class="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="Masukkan NISN Anda...">
      </div>

      <div>
        <label class="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
          Password / Kode Akses
        </label>
        <input id="input-password" type="password" required class="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="••••••••">
      </div>

      <button type="submit" id="btn-submit-login" class="w-full py-3.5 px-4 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 font-bold shadow-md transition-all">
        Masuk ke Sistem CBT
      </button>
    </form>
  </div>
</div>
`,
  },
  {
    filename: "DashboardGuru.html",
    category: "HTML",
    description: "Dashboard statistik dan ringkasan manajemen ujian untuk Guru.",
    content: `<div class="space-y-6">
  <!-- Header Banner -->
  <div class="bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg">
    <h1 class="text-2xl font-bold">Selamat Datang di Portal CBT Guru</h1>
    <p class="text-indigo-200 text-sm mt-1">Kelola bank soal, jadwalkan ujian bersesi, monitoring serempak 30 siswa, dan analisa nilai otomatis.</p>
  </div>

  <!-- Quick Metric Cards -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
      <p class="text-xs font-semibold text-slate-500 uppercase">Bank Soal Aktif</p>
      <p class="text-2xl font-black text-indigo-600 mt-1" id="dash-total-bank">12</p>
    </div>
    <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
      <p class="text-xs font-semibold text-slate-500 uppercase">Ujian Berlangsung</p>
      <p class="text-2xl font-black text-emerald-600 mt-1" id="dash-active-exam">3</p>
    </div>
    <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
      <p class="text-xs font-semibold text-slate-500 uppercase">Siswa Terdaftar</p>
      <p class="text-2xl font-black text-blue-600 mt-1" id="dash-total-students">240</p>
    </div>
    <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
      <p class="text-xs font-semibold text-slate-500 uppercase">Perlu Koreksi Isian</p>
      <p class="text-2xl font-black text-amber-600 mt-1" id="dash-need-grading">8</p>
    </div>
  </div>
</div>
`,
  },
  {
    filename: "DashboardSiswa.html",
    category: "HTML",
    description: "Lobby ujian siswa, verifikasi token, dan daftar ujian yang aktif.",
    content: `<div class="max-w-4xl mx-auto space-y-6">
  <!-- Student Profile Card -->
  <div class="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
    <div class="flex items-center space-x-4">
      <div class="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-black text-xl">
        SIS
      </div>
      <div>
        <h2 class="text-lg font-bold text-slate-900 dark:text-white" id="siswa-nama">Nama Peserta Didik</h2>
        <p class="text-xs text-slate-500" id="siswa-nisn-kelas">NISN: 0081234567 | Kelas: X RPL 1</p>
      </div>
    </div>
    <span class="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">Sesi Ujian Aktif</span>
  </div>

  <!-- Available Exams List -->
  <div class="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
    <h3 class="text-base font-bold text-slate-900 dark:text-white">Daftar Ujian Tersedia</h3>
    <div id="list-ujian-siswa" class="space-y-3">
      <!-- Item Ujian -->
    </div>
  </div>
</div>
`,
  },
  {
    filename: "Layout.html",
    category: "HTML",
    description: "Layout wrapper untuk template responsive.",
    content: `<!-- Layout Container Wrapper -->
<div class="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
  <div class="flex-1 flex flex-col">
    <!-- Navbar injected here -->
    <div id="layout-content" class="flex-1"></div>
  </div>
</div>
`,
  },
  {
    filename: "Navbar.html",
    category: "HTML",
    description: "Top bar dengan logo sekolah, waktu server, dan menu profil.",
    content: `<nav class="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-4 py-3">
  <div class="max-w-7xl mx-auto flex items-center justify-between">
    <div class="flex items-center space-x-3">
      <div class="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">CBT</div>
      <span class="font-extrabold text-slate-900 dark:text-white tracking-tight">CBT SMK</span>
    </div>
    <div class="flex items-center space-x-3 text-xs font-medium">
      <span id="server-clock" class="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 font-mono">08:00:00 WIB</span>
      <button id="btn-logout" class="px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 font-bold">Keluar</button>
    </div>
  </div>
</nav>
`,
  },
  {
    filename: "Sidebar.html",
    category: "HTML",
    description: "Menu navigasi samping untuk dashboard Guru.",
    content: `<aside class="w-64 hidden md:block bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 min-h-[calc(100vh-61px)] p-4 space-y-1">
  <a href="#dashboard" class="flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">Dashboard</a>
  <a href="#bank-soal" class="flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:text-slate-400">Bank Soal (5 Model)</a>
  <a href="#ujian" class="flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:text-slate-400">Jadwal & Sesi Ujian</a>
  <a href="#monitoring" class="flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:text-slate-400">Live Monitoring</a>
  <a href="#nilai" class="flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:text-slate-400">Koreksi & Nilai</a>
  <a href="#laporan" class="flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:text-slate-400">Analisis & Laporan</a>
  <a href="#cetak" class="flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:text-slate-400">Cetak & Naskah Offline</a>
</aside>
`,
  },
  {
    filename: "BankSoal.html",
    category: "HTML",
    description: "Tampilan daftar bank soal dan tombol pembuatan soal.",
    content: `<div class="space-y-6">
  <div class="flex justify-between items-center">
    <div>
      <h2 class="text-xl font-bold">Bank Soal Kejuruan SMK</h2>
      <p class="text-xs text-slate-500">Mendukung PG, PGK, Benar-Salah, Penjodohan, dan Isian</p>
    </div>
    <div class="flex space-x-2">
      <button id="btn-import-soal" class="px-4 py-2 text-xs font-bold rounded-xl border border-slate-300 hover:bg-slate-50">Import Excel</button>
      <button id="btn-tambah-soal" class="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700">+ Buat Soal Baru</button>
    </div>
  </div>
  <div id="grid-bank-soal" class="grid grid-cols-1 md:grid-cols-3 gap-4"></div>
</div>
`,
  },
  {
    filename: "FormSoal.html",
    category: "HTML",
    description: "Formulir interaktif untuk membuat/mengedit 5 tipe soal CBT.",
    content: `<div class="max-w-3xl mx-auto bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
  <h3 class="text-lg font-bold">Editor Soal CBT</h3>
  <div>
    <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Model Soal</label>
    <select id="select-tipe-soal" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800">
      <option value="PG">Pilihan Ganda (PG)</option>
      <option value="PGK">Pilihan Ganda Kompleks (PGK)</option>
      <option value="BENAR_SALAH">Benar / Salah</option>
      <option value="PENJODOHAN">Penjodohan (Matching Pairs)</option>
      <option value="ISIAN">Isian Singkat</option>
    </select>
  </div>
  <div>
    <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Pertanyaan</label>
    <textarea id="input-pertanyaan" rows="4" class="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700" placeholder="Tuliskan butir soal..."></textarea>
  </div>
  <div id="editor-jawaban-container" class="space-y-2"></div>
</div>
`,
  },
  {
    filename: "Ujian.html",
    category: "HTML",
    description: "Pengaturan ujian, session mode (30 siswa serempak), dan token.",
    content: `<div class="space-y-6">
  <div class="flex justify-between items-center">
    <h2 class="text-xl font-bold">Manajemen Pelaksanaan Ujian</h2>
    <button class="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 text-white">+ Buat Jadwal Ujian</button>
  </div>
  <div id="list-ujian-container" class="grid grid-cols-1 md:grid-cols-2 gap-4"></div>
</div>
`,
  },
  {
    filename: "Exam.html",
    category: "HTML",
    description: "Ruang ujian siswa: anti-reset, server timer, autosave, nomor navigasi, dan pencegah curang.",
    content: `<div class="max-w-6xl mx-auto space-y-4">
  <!-- Top Exam Status Bar -->
  <div class="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex justify-between items-center shadow-sm">
    <div>
      <h3 class="font-bold text-sm" id="exam-title-display">Ujian Kompetensi Kejuruan</h3>
      <span class="text-xs text-slate-500" id="autosave-status">💾 Autosave: Tersimpan</span>
    </div>
    <div class="flex items-center space-x-3">
      <span class="text-xs font-bold text-slate-500 uppercase">Sisa Waktu:</span>
      <div id="exam-timer" class="px-4 py-2 bg-indigo-600 text-white font-mono font-black text-lg rounded-xl shadow">00:00:00</div>
    </div>
  </div>

  <!-- Main Question & Options Workspace -->
  <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
    <div class="lg:col-span-3 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
      <div class="flex justify-between items-center border-b pb-4">
        <span class="text-xs font-black uppercase text-indigo-600" id="q-number-badge">Soal Nomor 1</span>
        <span class="text-xs px-2.5 py-1 bg-slate-100 rounded-md font-bold" id="q-type-badge">Pilihan Ganda</span>
      </div>
      <div id="q-text-container" class="text-base font-medium leading-relaxed"></div>
      <div id="q-media-container"></div>
      <div id="q-interactive-answers" class="space-y-3 pt-2"></div>
      <div class="flex justify-between items-center pt-6 border-t">
        <button id="btn-prev-q" class="px-4 py-2 rounded-xl border text-xs font-bold">← Sebelumnya</button>
        <button id="btn-flag-q" class="px-4 py-2 rounded-xl bg-amber-50 text-amber-600 text-xs font-bold">Ragu-ragu</button>
        <button id="btn-next-q" class="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold">Berikutnya →</button>
      </div>
    </div>

    <!-- Question Number Palette Navigator -->
    <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
      <h4 class="text-xs font-bold uppercase text-slate-500">Navigasi Soal</h4>
      <div id="palette-grid" class="grid grid-cols-5 gap-2"></div>
      <button id="btn-submit-exam" class="w-full py-3 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow hover:bg-emerald-700">Selesai & Kumpulkan Ujian</button>
    </div>
  </div>
</div>
`,
  },
  {
    filename: "Monitoring.html",
    category: "HTML",
    description: "Live Monitoring Pengawas Ujian dengan indikator realtime 30 siswa serempak.",
    content: `<div class="space-y-4">
  <div class="flex justify-between items-center">
    <h2 class="text-xl font-bold">Live Monitoring Siswa</h2>
    <span class="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">● Realtime Sync</span>
  </div>
  <div class="overflow-x-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
    <table class="w-full text-left text-xs">
      <thead class="bg-slate-50 dark:bg-slate-800 font-bold">
        <tr>
          <th class="p-3">Siswa</th>
          <th class="p-3">Kelas</th>
          <th class="p-3">Sesi</th>
          <th class="p-3">Status</th>
          <th class="p-3">Progress</th>
          <th class="p-3">Pelanggaran</th>
          <th class="p-3">Aksi</th>
        </tr>
      </thead>
      <tbody id="table-monitoring-body" class="divide-y divide-slate-100 dark:divide-slate-800"></tbody>
    </table>
  </div>
</div>
`,
  },
  {
    filename: "Nilai.html",
    category: "HTML",
    description: "Daftar hasil nilai ujian dan antarmuka koreksi manual soal isian.",
    content: `<div class="space-y-6">
  <div class="flex justify-between items-center">
    <h2 class="text-xl font-bold">Rekapitulasi Nilai & Koreksi</h2>
    <button id="btn-export-nilai" class="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl">Export Spreadsheet</button>
  </div>
  <div id="nilai-table-container"></div>
</div>
`,
  },
  {
    filename: "Laporan.html",
    category: "HTML",
    description: "Analisis butir soal (tingkat kesukaran, daya beda, % ketuntasan).",
    content: `<div class="space-y-6">
  <h2 class="text-xl font-bold">Analisis Butir Soal & Ketuntasan</h2>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4" id="analisis-summary-cards"></div>
  <div id="analisis-chart-container" class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800"></div>
</div>
`,
  },
  {
    filename: "Print.html",
    category: "HTML",
    description: "Template cetak Kartu Peserta, Berita Acara, LJK, dan Naskah Soal Darurat Offline.",
    content: `<div class="p-8 print:p-0 space-y-8" id="print-container">
  <!-- Container cetak otomatis diformat CSS @media print -->
</div>
`,
  },
  {
    filename: "Style.html",
    category: "HTML",
    description: "Custom stylesheet untuk typography, print styling, animation, dan dark mode.",
    content: `<style>
  @media print {
    body {
      background: white !important;
      color: black !important;
    }
    nav, aside, #btn-logout, #autosave-status, button {
      display: none !important;
    }
    .print-sheet {
      page-break-after: always;
      padding: 20mm;
      width: 100%;
    }
  }
  
  .q-badge-answered {
    background-color: #10b981 !important;
    color: white !important;
  }
  .q-badge-flagged {
    background-color: #f59e0b !important;
    color: white !important;
  }
  .q-badge-unanswered {
    background-color: #f1f5f9;
    color: #475569;
  }
</style>
`,
  }
];
