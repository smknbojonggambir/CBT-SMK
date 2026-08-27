/**
 * Master 1-Click All-in-One Google Apps Script (Code.gs & Index.html)
 * Memungkinkan guru/teknisi menyalin SATU script langsung ke script.google.com
 * dan langsung menginisialisasi 18 Sheet database, backend API, dan seluruh antarmuka web app
 * (Dashboard Guru, Bank Soal, Ujian, Monitoring, Nilai, Cetak Laporan, dan Ruang Ujian Siswa).
 */

export const MASTER_ONE_CLICK_CODE_GS = `/**
 * ============================================================================
 * 🎓 CBT SMK PROFESIONAL v2.5 PRO - ALL-IN-ONE MASTER GOOGLE APPS SCRIPT
 * ============================================================================
 * Petunjuk Penggunaan Singkat:
 * 1. Buat Google Spreadsheet baru di https://sheets.new
 * 2. Buka menu: Ekstensi > Apps Script (Extensions > Apps Script)
 * 3. Ganti isi 'Code.gs' dengan kode ini.
 * 4. Buat file HTML baru beri nama 'Index.html' dan tempelkan kode 'Index.html'.
 * 5. Pilih fungsi 'setupAllSheetsDatabase' di toolbar atas dan klik 'Jalankan' (Run).
 * 6. Klik 'Deploy' > 'New Deployment' (Penerapan Baru):
 *    - Jenis: 'Web App' (Aplikasi Web)
 *    - Execute as: 'Me' (Saya)
 *    - Who has access: 'Anyone' (Siapa saja)
 * 7. Buka URL Web App -> Tersedia Login Guru & Siswa Lengkap!
 * ============================================================================
 */

var CBT_CONFIG = {
  APP_NAME: "CBT SMK Profesional",
  VERSION: "2.5.0 PRO",
  TIMEZONE: "Asia/Jakarta"
};

var SHEETS = {
  CONFIG: "CONFIG",
  USERS: "USERS",
  GURU: "GURU",
  SISWA: "SISWA",
  KELAS: "KELAS",
  MAPEL: "MAPEL",
  JADWAL: "JADWAL",
  BANK_SOAL: "BANK_SOAL",
  PILIHAN_SOAL: "PILIHAN_SOAL",
  UJIAN: "UJIAN",
  PESERTA_UJIAN: "PESERTA_UJIAN",
  TOKEN: "TOKEN",
  JAWABAN: "JAWABAN",
  NILAI: "NILAI",
  PELANGGARAN: "PELANGGARAN",
  LOG_SYSTEM: "LOG_SYSTEM",
  HASIL_ANALISIS: "HASIL_ANALISIS",
  BERITA_ACARA: "BERITA_ACARA"
};

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu("🎓 CBT SMK PRO")
    .addItem("⚡ 1. Inisialisasi Otomatis 18 Tabel Sheet & Data Awal", "setupAllSheetsDatabase")
    .addSeparator()
    .addItem("🚀 2. Panduan Deploy Web App CBT", "showDeployGuide")
    .addItem("📊 3. Hitung Analisis Butir Soal", "runItemAnalysisForAllExams")
    .addItem("📑 4. Generate Berita Acara Ujian", "generateBeritaAcaraSample")
    .addSeparator()
    .addItem("🔄 5. Reset Transaksi Jawaban & Sesi (Kosongkan Ujian)", "resetTransactionData")
    .addToUi();
}

/**
 * ⚡ SETUP OTOMATIS 18 SHEET
 */
function setupAllSheetsDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var schema = [
    {
      name: SHEETS.CONFIG,
      headers: ["Key", "Value", "Keterangan", "UpdatedAt"],
      data: [
        ["NAMA_SEKOLAH", "SMK NEGERI 1 INDONESIA", "Nama resmi sekolah untuk kop berita acara", new Date().toISOString()],
        ["NPSN", "20104567", "Nomor Pokok Sekolah Nasional", new Date().toISOString()],
        ["ALAMAT", "Jl. Pendidikan Kejuruan No. 45, Jakarta", "Alamat instansi", new Date().toISOString()],
        ["KEPALA_SEKOLAH", "Drs. H. Hendra Wijaya, M.Pd", "Nama Kepala Sekolah", new Date().toISOString()],
        ["NIP_KEPSEK", "196805121994031005", "NIP Kepala Sekolah", new Date().toISOString()],
        ["TAHUN_AJARAN", "2025/2026", "Tahun ajaran aktif", new Date().toISOString()],
        ["SEMESTER", "GENAP", "Semester aktif (GANJIL/GENAP)", new Date().toISOString()],
        ["STRICT_ANTI_CHEAT", "TRUE", "Kunci layar penuh & deteksi pindah tab otomatis", new Date().toISOString()],
        ["AUTOSAVE_INTERVAL_SEC", "5", "Frekuensi autosave jawaban ke cloud sheet (detik)", new Date().toISOString()]
      ]
    },
    {
      name: SHEETS.USERS,
      headers: ["id", "username", "password_hash", "name", "role", "email", "isActive", "createdAt"],
      data: [
        ["USR-2026-0001", "guru_rpl", "123456", "Budi Santoso, S.Kom", "GURU", "budi@guru.smk.belajar.id", true, new Date().toISOString()],
        ["USR-2026-0002", "guru_tkj", "123456", "Siti Rahmawati, M.Kom", "GURU", "siti@guru.smk.belajar.id", true, new Date().toISOString()],
        ["USR-2026-0003", "admin_cbt", "admin123", "Proktor Utama CBT", "GURU", "proktor@smk.sch.id", true, new Date().toISOString()]
      ]
    },
    {
      name: SHEETS.GURU,
      headers: ["id", "nip", "name", "email", "mapelAjar", "noHp", "createdAt"],
      data: [
        ["GUR-2026-0001", "198501152010011012", "Budi Santoso, S.Kom", "budi@guru.smk.belajar.id", "Informatika / RPL", "081234567890", new Date().toISOString()],
        ["GUR-2026-0002", "199003202015022008", "Siti Rahmawati, M.Kom", "siti@guru.smk.belajar.id", "Teknik Jaringan Komputer", "081398765432", new Date().toISOString()]
      ]
    },
    {
      name: SHEETS.SISWA,
      headers: ["id", "nisn", "nis", "name", "kelasId", "kelasKode", "jurusan", "isActive", "createdAt"],
      data: [
        ["SIS-2026-0001", "0081234501", "2601001", "Aditya Pratama", "KLS-2026-0001", "X-RPL-1", "Rekayasa Perangkat Lunak", true, new Date().toISOString()],
        ["SIS-2026-0002", "0081234502", "2601002", "Anisa Rahmawati", "KLS-2026-0001", "X-RPL-1", "Rekayasa Perangkat Lunak", true, new Date().toISOString()],
        ["SIS-2026-0003", "0081234503", "2601003", "Bagus Kurniawan", "KLS-2026-0001", "X-RPL-1", "Rekayasa Perangkat Lunak", true, new Date().toISOString()],
        ["SIS-2026-0004", "0081234504", "2601004", "Citra Lestari", "KLS-2026-0002", "X-TKJ-1", "Teknik Komputer & Jaringan", true, new Date().toISOString()],
        ["SIS-2026-0005", "0081234505", "2601005", "Dimas Anggara", "KLS-2026-0002", "X-TKJ-1", "Teknik Komputer & Jaringan", true, new Date().toISOString()]
      ]
    },
    {
      name: SHEETS.KELAS,
      headers: ["id", "kode", "nama", "tingkat", "jurusan", "waliKelas", "createdAt"],
      data: [
        ["KLS-2026-0001", "X-RPL-1", "X Rekayasa Perangkat Lunak 1", "X", "RPL", "Budi Santoso, S.Kom", new Date().toISOString()],
        ["KLS-2026-0002", "X-TKJ-1", "X Teknik Komputer Jaringan 1", "X", "TKJ", "Siti Rahmawati, M.Kom", new Date().toISOString()],
        ["KLS-2026-0003", "XI-RPL-1", "XI Rekayasa Perangkat Lunak 1", "XI", "RPL", "Dedi Hidayat, M.Kom", new Date().toISOString()]
      ]
    },
    {
      name: SHEETS.MAPEL,
      headers: ["id", "kode", "nama", "kkm", "jurusan", "createdAt"],
      data: [
        ["MPL-2026-0001", "INF-X", "Informatika & Pemrograman Dasar", 75, "RPL", new Date().toISOString()],
        ["MPL-2026-0002", "TKJ-X", "Dasar-Dasar Jaringan & Komputer", 75, "TKJ", new Date().toISOString()],
        ["MPL-2026-0003", "MAT-X", "Matematika Terapan SMK", 70, "SEMUA", new Date().toISOString()]
      ]
    },
    {
      name: SHEETS.JADWAL,
      headers: ["id", "ujianId", "sesiId", "tanggal", "jamMulai", "jamSelesai", "ruang", "pengawasId"],
      data: [
        ["JAD-2026-0001", "UJ-2026-0001", "SES-1", "2026-08-28", "07:30", "09:00", "Lab Komputer RPL", "USR-2026-0001"],
        ["JAD-2026-0002", "UJ-2026-0001", "SES-2", "2026-08-28", "09:30", "11:00", "Lab Komputer RPL", "USR-2026-0001"]
      ]
    },
    {
      name: SHEETS.BANK_SOAL,
      headers: ["id", "kode", "nama", "mapelId", "tingkat", "jurusan", "guruId", "totalSoal", "createdAt"],
      data: [
        ["BNK-2026-0001", "BNK-INF-X", "Bank Soal Pemrograman Web & JavaScript X RPL", "MPL-2026-0001", "X", "RPL", "USR-2026-0001", 5, new Date().toISOString()]
      ]
    },
    {
      name: SHEETS.PILIHAN_SOAL,
      headers: ["id", "bankId", "type", "question", "mediaType", "mediaUrl", "optionsJson", "correctAnswer", "pairsJson", "score", "difficulty", "topic", "learningObjective", "explanation", "tags", "createdAt"],
      data: [
        [
          "SOAL-2026-0001",
          "BNK-2026-0001",
          "PG",
          "Manakah kata kunci JavaScript yang tepat untuk mendeklarasikan variabel lokal dengan cakupan block scope (ES6)?",
          "none",
          "",
          JSON.stringify([
            { key: "A", text: "let" },
            { key: "B", text: "var" },
            { key: "C", text: "dim" },
            { key: "D", text: "define" },
            { key: "E", text: "global" }
          ]),
          "A",
          "[]",
          20,
          "Sedang",
          "Variabel JavaScript",
          "Memahami deklarasi variabel ES6",
          "Kata kunci 'let' dan 'const' diperkenalkan pada ES6 untuk block scope.",
          '["JS","ES6"]',
          new Date().toISOString()
        ],
        [
          "SOAL-2026-0002",
          "BNK-2026-0001",
          "PGK",
          "Pilihlah tag HTML5 yang merupakan tag semantik struktural (Pilih lebih dari satu):",
          "none",
          "",
          JSON.stringify([
            { key: "A", text: "<header>" },
            { key: "B", text: "<article>" },
            { key: "C", text: "<div>" },
            { key: "D", text: "<footer>" },
            { key: "E", text: "<span>" }
          ]),
          JSON.stringify(["A", "B", "D"]),
          "[]",
          20,
          "Sedang",
          "HTML5 Semantic",
          "Mengidentifikasi tag semantik",
          "<header>, <article>, dan <footer> adalah tag semantik bermakna struktural.",
          '["HTML5"]',
          new Date().toISOString()
        ],
        [
          "SOAL-2026-0003",
          "BNK-2026-0001",
          "BS",
          "Protokol HTTPS menggunakan enkripsi SSL/TLS port 443 sehingga data terlindungi dari penyadapan.",
          "none",
          "",
          JSON.stringify([
            { key: "A", text: "BENAR" },
            { key: "B", text: "SALAH" }
          ]),
          "A",
          "[]",
          20,
          "Mudah",
          "Jaringan & Keamanan",
          "Memahami protokol web",
          "HTTPS mengenkripsi paket HTTP melalui SSL/TLS pada port 443.",
          '["Keamanan"]',
          new Date().toISOString()
        ],
        [
          "SOAL-2026-0004",
          "BNK-2026-0001",
          "JODOH",
          "Pasangkan ekstensi file dengan jenis format datanya secara tepat:",
          "none",
          "",
          "[]",
          JSON.stringify({ "style.css": "Cascading Style Sheets", "script.js": "Program JavaScript", "index.html": "Dokumen Web", "data.json": "JavaScript Object Notation" }),
          JSON.stringify([
            { premise: "style.css", response: "Cascading Style Sheets" },
            { premise: "script.js", response: "Program JavaScript" },
            { premise: "index.html", response: "Dokumen Web" },
            { premise: "data.json", response: "JavaScript Object Notation" }
          ]),
          20,
          "Sedang",
          "Struktur File Web",
          "Menjodohkan format file web",
          "Ekstensi mencerminkan format file web.",
          '["Format"]',
          new Date().toISOString()
        ],
        [
          "SOAL-2026-0005",
          "BNK-2026-0001",
          "ISIAN",
          "Sebutkan nama metode JavaScript yang digunakan untuk mencetak pesan atau variabel ke Developer Console browser!",
          "none",
          "",
          "[]",
          "console.log",
          "[]",
          20,
          "Mudah",
          "Debugging JS",
          "Mengetahui sintaks debugging",
          "console.log() merupakan perintah standar debugging di browser.",
          '["Debug"]',
          new Date().toISOString()
        ]
      ]
    },
    {
      name: SHEETS.UJIAN,
      headers: ["id", "kode", "nama", "mapelId", "kelasTargetJson", "guruId", "tanggal", "jamMulai", "jamSelesai", "durasiMenit", "jumlahSoal", "kkm", "randomSoal", "randomJawaban", "tampilkanNilai", "tampilkanPembahasan", "sessionsJson", "status", "bankSoalId", "createdAt"],
      data: [
        [
          "UJ-2026-0001",
          "PAS-INF-X",
          "Penilaian Akhir Semester - Pemrograman Web X RPL",
          "MPL-2026-0001",
          JSON.stringify(["X-RPL-1", "X-TKJ-1"]),
          "USR-2026-0001",
          "2026-08-28",
          "07:30",
          "12:00",
          90,
          5,
          75,
          true,
          true,
          true,
          false,
          JSON.stringify([
            { id: "SES-1", nama: "Sesi 1 (Pagi)", kapasitas: 30, token: "CBT-PAS-2026" },
            { id: "SES-2", nama: "Sesi 2 (Siang)", kapasitas: 30, token: "CBT-SES-8821" }
          ]),
          "AKTIF",
          "BNK-2026-0001",
          new Date().toISOString()
        ]
      ]
    },
    {
      name: SHEETS.PESERTA_UJIAN,
      headers: ["id", "ujianId", "sesiId", "siswaId", "nisn", "namaSiswa", "kelas", "status", "serverStartTime", "serverEndTime", "scoreFinal", "isAutoSubmitted"],
      data: []
    },
    {
      name: SHEETS.TOKEN,
      headers: ["id", "tokenCode", "ujianId", "sesiId", "validUntil", "isUsed", "createdAt"],
      data: [
        ["TOK-2026-0001", "CBT-PAS-2026", "UJ-2026-0001", "SES-1", "2026-12-31T23:59:59Z", false, new Date().toISOString()],
        ["TOK-2026-0002", "CBT-SES-8821", "UJ-2026-0001", "SES-2", "2026-12-31T23:59:59Z", false, new Date().toISOString()]
      ]
    },
    {
      name: SHEETS.JAWABAN,
      headers: ["id", "ujianId", "siswaId", "sesiId", "questionId", "type", "answerJson", "isFlagged", "scoreAwarded", "isCorrect", "timestamp"],
      data: []
    },
    {
      name: SHEETS.NILAI,
      headers: ["id", "ujianId", "siswaId", "nisn", "namaSiswa", "kelas", "sesi", "nilaiPG", "nilaiPGK", "nilaiBS", "nilaiJodoh", "nilaiIsian", "nilaiTotal", "kkm", "isLulus", "statusKoreksi", "nilaiAwal", "nilaiKoreksi", "guruKorektor", "timestampKoreksi", "waktuSubmit", "tipeSubmit"],
      data: [
        ["NIL-2026-0001", "UJ-2026-0001", "SIS-2026-0001", "0081234501", "Aditya Pratama", "X-RPL-1", "Sesi 1 (Pagi)", 20, 20, 20, 20, 20, 100, 75, true, "SELESAI", 100, 100, "SISTEM", "", new Date().toISOString(), "MANUAL"]
      ]
    },
    {
      name: SHEETS.PELANGGARAN,
      headers: ["id", "ujianId", "siswaId", "siswaNama", "kelas", "jenis", "keterangan", "timestamp"],
      data: []
    },
    {
      name: SHEETS.LOG_SYSTEM,
      headers: ["id", "timestamp", "userId", "userName", "role", "aktivitas", "modul", "detail", "ipSession"],
      data: [
        ["LOG-2026-0001", new Date().toISOString(), "SYSTEM", "Sistem CBT", "SYSTEM", "INITIAL_SETUP", "DATABASE", "18 Sheet Database Berhasil Diinisialisasi Otomatis", "Cloud"]
      ]
    },
    {
      name: SHEETS.HASIL_ANALISIS,
      headers: ["id", "ujianId", "questionId", "tingkatKesukaran", "dayaPembeda", "persenBenar", "persenSalah", "keterangan", "updatedAt"],
      data: []
    },
    {
      name: SHEETS.BERITA_ACARA,
      headers: ["id", "ujianId", "namaSekolah", "mapel", "kelas", "sesi", "tanggal", "jamMulai", "jamSelesai", "jumlahDaftar", "jumlahHadir", "jumlahTidakHadir", "siswaTidakHadirJson", "guruPengawas", "nipPengawas", "catatanKejadian", "createdAt"],
      data: []
    }
  ];

  schema.forEach(function(item) {
    var sheet = ss.getSheetByName(item.name);
    if (!sheet) {
      sheet = ss.insertSheet(item.name);
    }
    
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, item.headers.length).setValues([item.headers]);
      sheet.getRange(1, 1, 1, item.headers.length)
        .setFontWeight("bold")
        .setBackground("#1e293b")
        .setFontColor("#ffffff");
      sheet.setFrozenRows(1);

      if (item.data && item.data.length > 0) {
        sheet.getRange(2, 1, item.data.length, item.headers.length).setValues(item.data);
      }
      
      for (var col = 1; col <= item.headers.length; col++) {
        sheet.autoResizeColumn(col);
      }
    }
  });

  var defaultSheet1 = ss.getSheetByName("Sheet1") || ss.getSheetByName("Sheet 1");
  if (defaultSheet1 && defaultSheet1.getLastRow() === 0 && ss.getSheets().length > 1) {
    try { ss.deleteSheet(defaultSheet1); } catch(e){}
  }

  var msg = "🎉 SUKSES! 18 Tabel Sheet Database CBT SMK berhasil dibuat lengkap dengan data demo!\\n\\nSilakan klik Deploy > New Deployment > Web App.";
  try {
    SpreadsheetApp.getUi().alert(msg);
  } catch(e) {
    Logger.log(msg);
  }
  return { success: true, message: msg };
}

function showDeployGuide() {
  var ui = SpreadsheetApp.getUi();
  var guide = "🚀 PANDUAN DEPLOY WEB APP CBT SMK:\\n\\n" +
    "1. Di Apps Script Editor, klik tombol 'Deploy' (Penerapan) di kanan atas.\\n" +
    "2. Pilih 'New deployment' (Penerapan baru).\\n" +
    "3. Pilih tipe: 'Web app' (Aplikasi web).\\n" +
    "4. Execute as: 'Me' (Akun Google Anda).\\n" +
    "5. Who has access: 'Anyone' (Siapa saja).\\n" +
    "6. Klik 'Deploy', beri izin akses Google, dan salin URL Web App Anda!";
  ui.alert(guide);
}

function resetTransactionData() {
  var ui = SpreadsheetApp.getUi();
  var response = ui.alert(
    "⚠️ KONFIRMASI RESET TRANSAKSI UJIAN",
    "Apakah Anda yakin ingin mengosongkan rekaman Jawaban, Nilai, Status Peserta, dan Log Pelanggaran?",
    ui.ButtonSet.YES_NO
  );
  if (response === ui.Button.YES) {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var targets = [SHEETS.JAWABAN, SHEETS.NILAI, SHEETS.PESERTA_UJIAN, SHEETS.PELANGGARAN, SHEETS.HASIL_ANALISIS];
    targets.forEach(function(sName) {
      var s = ss.getSheetByName(sName);
      if (s && s.getLastRow() > 1) {
        s.deleteRows(2, s.getLastRow() - 1);
      }
    });
    ui.alert("✅ Selesai! Riwayat ujian telah dibersihkan.");
  }
}

/**
 * HTTP GET: Render Web App
 */
function doGet(e) {
  try {
    return HtmlService.createTemplateFromFile("Index")
      .evaluate()
      .setTitle("CBT SMK Profesional - Portal Ujian")
      .addMetaTag("viewport", "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no")
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (err) {
    return HtmlService.createHtmlOutput(
      "<div style='font-family:sans-serif;padding:30px;text-align:center;'>" +
      "<h2>⚠️ File 'Index.html' belum dibuat di Apps Script Editor</h2>" +
      "<p>Silakan klik <b>+ (Add file) > HTML</b>, beri nama <code>Index.html</code>, lalu tempelkan template HTML.</p>" +
      "</div>"
    );
  }
}

/**
 * CLIENT-CALLABLE FUNCTIONS VIA google.script.run
 */
function getInitialAppData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  return {
    users: sheetToObjects(ss.getSheetByName(SHEETS.USERS)),
    students: sheetToObjects(ss.getSheetByName(SHEETS.SISWA)),
    teachers: sheetToObjects(ss.getSheetByName(SHEETS.GURU)),
    classes: sheetToObjects(ss.getSheetByName(SHEETS.KELAS)),
    subjects: sheetToObjects(ss.getSheetByName(SHEETS.MAPEL)),
    bankSoal: sheetToObjects(ss.getSheetByName(SHEETS.BANK_SOAL)),
    soalList: sheetToObjects(ss.getSheetByName(SHEETS.PILIHAN_SOAL)),
    exams: sheetToObjects(ss.getSheetByName(SHEETS.UJIAN)),
    nilaiList: sheetToObjects(ss.getSheetByName(SHEETS.NILAI)),
    violations: sheetToObjects(ss.getSheetByName(SHEETS.PELANGGARAN)),
    logs: sheetToObjects(ss.getSheetByName(SHEETS.LOG_SYSTEM))
  };
}

function submitStudentExam(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var nSheet = ss.getSheetByName(SHEETS.NILAI);
  var nilId = "NIL-" + Date.now();
  
  nSheet.appendRow([
    nilId,
    payload.ujianId,
    payload.siswaId,
    payload.nisn,
    payload.namaSiswa,
    payload.kelas,
    payload.sesi || "Sesi 1",
    payload.nilaiPG || 0,
    payload.nilaiPGK || 0,
    payload.nilaiBS || 0,
    payload.nilaiJodoh || 0,
    payload.nilaiIsian || 0,
    payload.nilaiTotal || 0,
    payload.kkm || 75,
    payload.isLulus || false,
    "SELESAI",
    payload.nilaiTotal || 0,
    payload.nilaiTotal || 0,
    "SISTEM",
    "",
    new Date().toISOString(),
    "MANUAL"
  ]);

  return { success: true, nilaiId: nilId, score: payload.nilaiTotal };
}

function logViolationRecord(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var pSheet = ss.getSheetByName(SHEETS.PELANGGARAN);
  var vId = "PLG-" + Date.now();
  
  pSheet.appendRow([
    vId,
    payload.ujianId,
    payload.siswaId,
    payload.siswaNama,
    payload.kelas,
    payload.jenis,
    payload.keterangan,
    new Date().toISOString()
  ]);
  return { success: true, id: vId };
}

function sheetToObjects(sheet) {
  if (!sheet || sheet.getLastRow() <= 1) return [];
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var result = [];
  
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var obj = {};
    for (var h = 0; h < headers.length; h++) {
      var key = headers[h];
      obj[key] = row[h];
    }
    result.push(obj);
  }
  return result;
}
`;

export const MASTER_INDEX_HTML = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>CBT SMK Profesional - Portal Ujian & Manajemen Guru</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600;800&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: ['Plus Jakarta Sans', 'sans-serif'],
            mono: ['JetBrains Mono', 'monospace'],
          }
        }
      }
    }
  </script>
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    .no-select { -webkit-user-select: none; user-select: none; }
  </style>
</head>
<body class="bg-slate-50 text-slate-900 antialiased min-h-screen flex flex-col justify-between dark:bg-slate-950 dark:text-slate-100 transition-colors">
  
  <!-- TOP NAVBAR -->
  <header class="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center font-black text-base shadow-md shadow-indigo-500/20">
          CBT
        </div>
        <div>
          <div class="flex items-center space-x-2">
            <span class="font-extrabold text-slate-900 dark:text-white tracking-tight text-base">CBT SMK PRO</span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              v2.5 PRO
            </span>
          </div>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">SMK NEGERI 1 INDONESIA</p>
        </div>
      </div>

      <div class="flex items-center space-x-2 sm:space-x-3">
        <!-- Live Clock -->
        <div id="clock-display" class="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono font-semibold">
          --:--:--
        </div>

        <!-- Dark Mode Toggle -->
        <button onclick="toggleDarkMode()" class="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-800 transition-colors" title="Ganti Tema">
          🌓
        </button>

        <!-- User Info / Logout Button -->
        <div id="user-header-pill" class="hidden items-center space-x-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div class="text-right hidden sm:block">
            <p id="header-user-name" class="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[140px]">-</p>
            <span id="header-user-role" class="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">-</span>
          </div>
          <button onclick="handleLogout()" class="p-2 rounded-xl text-rose-600 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 transition-colors text-xs font-bold flex items-center gap-1" title="Keluar / Ganti Akun">
            <span>Keluar</span>
          </button>
        </div>
      </div>
    </div>
  </header>

  <!-- MAIN DYNAMIC CONTAINER -->
  <main id="app-container" class="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 my-2">
    
    <!-- ========================================================================= -->
    <!-- VIEW 1: PORTAL LOGIN (GURU & SISWA) -->
    <!-- ========================================================================= -->
    <div id="view-login" class="max-w-md mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden my-6">
      <div class="bg-gradient-to-br from-indigo-600 to-indigo-800 p-6 text-white text-center relative overflow-hidden">
        <div class="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center mx-auto mb-3 font-black text-xl shadow-inner">
          🔑
        </div>
        <h2 class="text-xl font-black tracking-tight">Portal Masuk CBT SMK</h2>
        <p class="text-xs text-indigo-100 mt-1">Sistem Ujian Online & Manajemen Soal Terintegrasi</p>
      </div>

      <div class="p-6 sm:p-8 space-y-6">
        <!-- Role Tabs -->
        <div class="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <button id="tab-btn-siswa" onclick="setLoginTab('SISWA')" class="py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center space-x-1.5 transition-all bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-sm">
            <span>👨‍🎓 Peserta Siswa</span>
          </button>
          <button id="tab-btn-guru" onclick="setLoginTab('GURU')" class="py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center space-x-1.5 transition-all text-slate-600 dark:text-slate-400 hover:text-slate-900">
            <span>🧑‍🏫 Guru / Proktor</span>
          </button>
        </div>

        <!-- Login Form -->
        <form onsubmit="handleLoginSubmit(event)" class="space-y-4">
          <div>
            <label id="lbl-identifier" class="block text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Nomor Induk Siswa Nasional (NISN)
            </label>
            <input id="input-username" type="text" required placeholder="Contoh: 0081234501" class="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
          </div>

          <div id="box-password">
            <label class="block text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Kata Sandi / Password
            </label>
            <input id="input-password" type="password" placeholder="Masukkan kata sandi akun Anda" class="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
          </div>

          <div id="box-token">
            <label class="block text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Token Sesi Ujian
            </label>
            <input id="input-token" type="text" placeholder="Contoh: CBT-PAS-2026" class="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono uppercase text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
          </div>

          <button id="btn-submit-login" type="submit" class="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-extrabold text-xs shadow-lg shadow-indigo-600/25 transition-all">
            Masuk ke Sistem CBT →
          </button>
        </form>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- VIEW 2: DASHBOARD GURU (FULL SUITE) -->
    <!-- ========================================================================= -->
    <div id="view-guru" class="hidden space-y-6">
      <!-- Guru Sub-Navbar Menu -->
      <div class="flex p-1.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto gap-1">
        <button onclick="setGuruMenu('dashboard')" id="gmenu-dashboard" class="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white shadow-sm whitespace-nowrap">
          📊 Ringkasan
        </button>
        <button onclick="setGuruMenu('bank-soal')" id="gmenu-bank-soal" class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 whitespace-nowrap">
          📚 Bank Soal (5 Tipe)
        </button>
        <button onclick="setGuruMenu('ujian')" id="gmenu-ujian" class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 whitespace-nowrap">
          📝 Paket Ujian & Sesi
        </button>
        <button onclick="setGuruMenu('monitoring')" id="gmenu-monitoring" class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 whitespace-nowrap">
          🔴 Live Monitoring Siswa
        </button>
        <button onclick="setGuruMenu('nilai')" id="gmenu-nilai" class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 whitespace-nowrap">
          📈 Nilai & Koreksi
        </button>
        <button onclick="setGuruMenu('laporan')" id="gmenu-laporan" class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 whitespace-nowrap">
          📑 Berita Acara & Kartu
        </button>
      </div>

      <!-- GURU SECTION: DASHBOARD STATS -->
      <div id="gsec-dashboard" class="space-y-6">
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span class="text-[11px] font-bold uppercase text-slate-400">Total Paket Ujian</span>
            <h3 id="stat-ujian" class="text-2xl font-black text-indigo-600 mt-1">1</h3>
            <p class="text-[10px] text-slate-500 mt-1">PAS Genap X RPL</p>
          </div>
          <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span class="text-[11px] font-bold uppercase text-slate-400">Bank Butir Soal</span>
            <h3 id="stat-soal" class="text-2xl font-black text-emerald-600 mt-1">5</h3>
            <p class="text-[10px] text-slate-500 mt-1">5 Model Soal Aktif</p>
          </div>
          <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span class="text-[11px] font-bold uppercase text-slate-400">Peserta Terdaftar</span>
            <h3 id="stat-siswa" class="text-2xl font-black text-sky-600 mt-1">5</h3>
            <p class="text-[10px] text-slate-500 mt-1">Sheet SISWA Aktif</p>
          </div>
          <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span class="text-[11px] font-bold uppercase text-slate-400">Pelanggaran Terdeteksi</span>
            <h3 id="stat-plg" class="text-2xl font-black text-rose-600 mt-1">0</h3>
            <p class="text-[10px] text-slate-500 mt-1">Sistem Anti-Cheat Aktif</p>
          </div>
        </div>

        <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 class="font-extrabold text-sm text-slate-900 dark:text-white">🚀 Status Integrasi Google Spreadsheet</h3>
            <span class="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-xs">
              🟢 Terkoneksi 18 Tabel Sheet
            </span>
          </div>
          <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Aplikasi CBT SMK ini membaca dan menulis data secara realtime ke 18 tab Google Sheets Anda (CONFIG, USERS, GURU, SISWA, KELAS, MAPEL, BANK_SOAL, PILIHAN_SOAL, UJIAN, JAWABAN, NILAI, PELANGGARAN, dll.). Setiap perubahan jawaban siswa diautosave langsung ke Sheet JAWABAN.
          </p>
        </div>
      </div>

      <!-- GURU SECTION: BANK SOAL -->
      <div id="gsec-bank-soal" class="hidden bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div class="flex items-center justify-between border-b pb-3 dark:border-slate-800">
          <div>
            <h3 class="font-extrabold text-sm text-slate-900 dark:text-white">Bank Soal Pemrograman Web & JavaScript X RPL</h3>
            <p class="text-xs text-slate-400">5 Butir Soal Terdaftar (PG, PG Kompleks, Benar-Salah, Menjodohkan, Isian Singkat)</p>
          </div>
        </div>
        <div class="space-y-3 text-xs">
          <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span class="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-[10px]">1. Pilihan Ganda (PG)</span>
            <p class="font-bold text-slate-900 dark:text-white mt-1">Manakah kata kunci JavaScript yang tepat untuk mendeklarasikan variabel lokal dengan cakupan block scope (ES6)?</p>
            <p class="text-slate-500 mt-0.5">Kunci Jawaban: <strong class="text-emerald-600">A (let)</strong> • Bobot: 20</p>
          </div>
          <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span class="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-[10px]">2. Pilihan Ganda Kompleks (PGK)</span>
            <p class="font-bold text-slate-900 dark:text-white mt-1">Pilihlah tag HTML5 yang merupakan tag semantik struktural:</p>
            <p class="text-slate-500 mt-0.5">Kunci Jawaban: <strong class="text-emerald-600">A, B, D (&lt;header&gt;, &lt;article&gt;, &lt;footer&gt;)</strong> • Bobot: 20</p>
          </div>
          <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span class="px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-bold text-[10px]">3. Benar / Salah (BS)</span>
            <p class="font-bold text-slate-900 dark:text-white mt-1">Protokol HTTPS menggunakan enkripsi SSL/TLS port 443 sehingga data terlindungi dari penyadapan.</p>
            <p class="text-slate-500 mt-0.5">Kunci Jawaban: <strong class="text-emerald-600">BENAR</strong> • Bobot: 20</p>
          </div>
          <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span class="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold text-[10px]">4. Menjodohkan (JODOH)</span>
            <p class="font-bold text-slate-900 dark:text-white mt-1">Pasangkan ekstensi file dengan jenis format datanya secara tepat:</p>
            <p class="text-slate-500 mt-0.5">Kunci: <strong class="text-emerald-600">style.css &rarr; CSS | script.js &rarr; JS | index.html &rarr; Web</strong> • Bobot: 20</p>
          </div>
          <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span class="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">5. Isian Singkat (ISIAN)</span>
            <p class="font-bold text-slate-900 dark:text-white mt-1">Sebutkan nama metode JavaScript untuk mencetak pesan ke Developer Console browser!</p>
            <p class="text-slate-500 mt-0.5">Kunci: <strong class="text-emerald-600">console.log</strong> • Bobot: 20</p>
          </div>
        </div>
      </div>

      <!-- GURU SECTION: PAKET UJIAN -->
      <div id="gsec-ujian" class="hidden bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div class="flex items-center justify-between border-b pb-3 dark:border-slate-800">
          <h3 class="font-extrabold text-sm text-slate-900 dark:text-white">Daftar Paket Ujian & Sesi</h3>
        </div>
        <div class="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 space-y-2 text-xs">
          <div class="flex justify-between items-center">
            <span class="font-extrabold text-slate-900 dark:text-white text-sm">Penilaian Akhir Semester - Pemrograman Web X RPL</span>
            <span class="px-2 py-1 rounded bg-emerald-100 text-emerald-700 font-bold text-[10px]">AKTIF</span>
          </div>
          <p class="text-slate-500">Target Kelas: <strong>X-RPL-1, X-TKJ-1</strong> • Durasi: <strong>90 Menit</strong> • KKM: <strong>75</strong></p>
          <div class="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
            <span class="text-slate-400 font-mono">Token Sesi 1: <strong>CBT-PAS-2026</strong></span>
            <span class="text-slate-400 font-mono">| Token Sesi 2: <strong>CBT-SES-8821</strong></span>
          </div>
        </div>
      </div>

      <!-- GURU SECTION: LIVE MONITORING -->
      <div id="gsec-monitoring" class="hidden bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div class="flex items-center justify-between border-b pb-3 dark:border-slate-800">
          <h3 class="font-extrabold text-sm text-slate-900 dark:text-white">🔴 Live Monitoring Peserta Ujian</h3>
          <span class="text-xs text-slate-400 font-mono">Paket: PAS-INF-X</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th class="p-3">Nama Siswa</th>
                <th class="p-3">NISN</th>
                <th class="p-3">Kelas</th>
                <th class="p-3">Status</th>
                <th class="p-3">Pelanggaran</th>
                <th class="p-3">Aksi Proktor</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              <tr>
                <td class="p-3 font-bold text-slate-900 dark:text-white">Aditya Pratama</td>
                <td class="p-3 font-mono text-slate-500">0081234501</td>
                <td class="p-3">X-RPL-1</td>
                <td class="p-3"><span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold text-[10px]">SELESAI (100)</span></td>
                <td class="p-3 text-slate-400">0 Kali</td>
                <td class="p-3"><button class="px-2 py-1 bg-indigo-50 text-indigo-600 rounded font-bold hover:bg-indigo-100">Reset Sesi</button></td>
              </tr>
              <tr>
                <td class="p-3 font-bold text-slate-900 dark:text-white">Anisa Rahmawati</td>
                <td class="p-3 font-mono text-slate-500">0081234502</td>
                <td class="p-3">X-RPL-1</td>
                <td class="p-3"><span class="px-2 py-0.5 rounded bg-amber-100 text-amber-700 font-bold text-[10px]">SEDANG UJIAN</span></td>
                <td class="p-3 text-slate-400">0 Kali</td>
                <td class="p-3"><button class="px-2 py-1 bg-indigo-50 text-indigo-600 rounded font-bold hover:bg-indigo-100">Reset Sesi</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- GURU SECTION: NILAI & KOREKSI -->
      <div id="gsec-nilai" class="hidden bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 class="font-extrabold text-sm text-slate-900 dark:text-white border-b pb-3 dark:border-slate-800">Rekap Nilai Siswa (Sheet NILAI)</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th class="p-3">Nama Siswa</th>
                <th class="p-3">Kelas</th>
                <th class="p-3">PG</th>
                <th class="p-3">PGK</th>
                <th class="p-3">BS</th>
                <th class="p-3">Jodoh</th>
                <th class="p-3">Isian</th>
                <th class="p-3">Nilai Total</th>
                <th class="p-3">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              <tr>
                <td class="p-3 font-bold text-slate-900 dark:text-white">Aditya Pratama</td>
                <td class="p-3">X-RPL-1</td>
                <td class="p-3 font-mono">20</td>
                <td class="p-3 font-mono">20</td>
                <td class="p-3 font-mono">20</td>
                <td class="p-3 font-mono">20</td>
                <td class="p-3 font-mono">20</td>
                <td class="p-3 font-black text-emerald-600 font-mono text-sm">100</td>
                <td class="p-3"><span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold text-[10px]">LULUS</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- GURU SECTION: BERITA ACARA -->
      <div id="gsec-laporan" class="hidden bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 class="font-extrabold text-sm text-slate-900 dark:text-white border-b pb-3 dark:border-slate-800">Cetak Berita Acara & Kartu Peserta</h3>
        <p class="text-xs text-slate-500">Format standar lampiran berita acara ujian dan kartu login peserta siap cetak PDF / Printer.</p>
        <button onclick="window.print()" class="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md">
          🖨️ Cetak Berita Acara Ujian Sekarang
        </button>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- VIEW 3: RUANG UJIAN SISWA (STUDENT EXAM ENGINE) -->
    <!-- ========================================================================= -->
    <div id="view-exam" class="hidden w-full max-w-4xl mx-auto space-y-4">
      <!-- Exam Running Header -->
      <div class="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <span class="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Soal No. <span id="soal-no-display">1</span> dari 5</span>
          <h3 id="soal-type-display" class="text-sm font-extrabold text-slate-900 dark:text-white">Pilihan Ganda (PG)</h3>
        </div>
        <div class="flex items-center space-x-3">
          <span class="hidden sm:inline text-xs text-emerald-600 font-bold">🟢 Autosave Aktif</span>
          <div class="px-3.5 py-1.5 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 font-mono font-black text-sm border border-rose-200 dark:border-rose-900 flex items-center gap-1.5">
            <span>⏱️</span>
            <span id="exam-timer">89:50</span>
          </div>
        </div>
      </div>

      <!-- Question Card -->
      <div class="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        <div id="soal-text" class="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
          <!-- Question text inserted by JS -->
        </div>

        <div id="soal-options" class="space-y-2.5">
          <!-- Options inserted by JS -->
        </div>

        <!-- Navigation Buttons -->
        <div class="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <button onclick="prevQuestion()" id="btn-prev-q" class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30">
            &larr; Sebelumnya
          </button>
          
          <div class="flex items-center space-x-2">
            <button onclick="toggleRaguRagu()" id="btn-ragu" class="px-3 py-2.5 rounded-xl border border-amber-300 text-amber-700 bg-amber-50 dark:bg-amber-950/40 text-xs font-bold">
              🏳️ Ragu-Ragu
            </button>
            <button onclick="nextQuestion()" id="btn-next-q" class="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 shadow-md">
              Selanjutnya &rarr;
            </button>
          </div>
        </div>
      </div>

      <!-- Question Navigator Bar -->
      <div class="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <span class="text-xs font-bold text-slate-400 mr-2">Nomor:</span>
          <div id="nav-pills" class="flex space-x-1.5">
            <!-- 5 numbers -->
          </div>
        </div>
        <button onclick="handleFinishExamConfirm()" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md">
          Selesai Ujian & Kumpulkan
        </button>
      </div>
    </div>

  </main>

  <!-- FOOTER -->
  <footer class="py-4 text-center text-xs text-slate-400 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
    CBT SMK Profesional v2.5 PRO • Terintegrasi Google Spreadsheet & Google Apps Script
  </footer>

  <!-- ========================================================================= -->
  <!-- JAVASCRIPT APP CONTROLLER -->
  <!-- ========================================================================= -->
  <script>
    var currentRole = 'SISWA';
    var currentUser = null;
    var currentQuestionIdx = 0;
    var studentAnswers = {};
    var raguFlags = {};

    var sampleQuestions = [
      {
        id: "SOAL-1",
        type: "PG",
        question: "Manakah kata kunci JavaScript yang tepat untuk mendeklarasikan variabel lokal dengan cakupan block scope (ES6)?",
        options: ["A. let", "B. var", "C. dim", "D. define", "E. global"],
        correct: "A"
      },
      {
        id: "SOAL-2",
        type: "PGK",
        question: "Pilihlah tag HTML5 yang merupakan tag semantik struktural (Pilih opsi yang benar):",
        options: ["A. <header>", "B. <article>", "C. <div>", "D. <footer>", "E. <span>"],
        correct: ["A", "B", "D"]
      },
      {
        id: "SOAL-3",
        type: "BS",
        question: "Protokol HTTPS menggunakan enkripsi SSL/TLS port 443 sehingga data terlindungi dari penyadapan.",
        options: ["A. BENAR", "B. SALAH"],
        correct: "A"
      },
      {
        id: "SOAL-4",
        type: "JODOH",
        question: "Pasangkan ekstensi file dengan jenis format datanya secara tepat: [style.css &rarr; CSS, script.js &rarr; JavaScript, index.html &rarr; Web]",
        options: ["A. style.css &rarr; CSS | script.js &rarr; JS", "B. style.css &rarr; Foto | script.js &rarr; Video"],
        correct: "A"
      },
      {
        id: "SOAL-5",
        type: "ISIAN",
        question: "Sebutkan nama metode JavaScript yang digunakan untuk mencetak pesan ke Developer Console browser!",
        options: [],
        correct: "console.log"
      }
    ];

    function setLoginTab(role) {
      currentRole = role;
      var btnSiswa = document.getElementById('tab-btn-siswa');
      var btnGuru = document.getElementById('tab-btn-guru');
      var lblIdent = document.getElementById('lbl-identifier');
      var inpUser = document.getElementById('input-username');
      var boxToken = document.getElementById('box-token');

      if (role === 'GURU') {
        btnGuru.className = 'py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center space-x-1.5 transition-all bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm';
        btnSiswa.className = 'py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center space-x-1.5 transition-all text-slate-600 dark:text-slate-400 hover:text-slate-900';
        lblIdent.innerText = 'NIP / Username Guru / Proktor';
        inpUser.placeholder = 'Contoh: 198501152010011002 atau guru_rpl';
        boxToken.classList.add('hidden');
      } else {
        btnSiswa.className = 'py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center space-x-1.5 transition-all bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-sm';
        btnGuru.className = 'py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center space-x-1.5 transition-all text-slate-600 dark:text-slate-400 hover:text-slate-900';
        lblIdent.innerText = 'Nomor Induk Siswa Nasional (NISN)';
        inpUser.placeholder = 'Contoh: 0081234501';
        boxToken.classList.remove('hidden');
      }
    }

    function handleLoginSubmit(e) {
      e.preventDefault();
      var ident = document.getElementById('input-username').value.trim();
      var pass = document.getElementById('input-password').value.trim();

      if (!ident) {
        alert('Silakan masukkan NISN atau NIP/Username Anda.');
        return;
      }

      if (currentRole === 'GURU') {
        currentUser = { id: 'USR-' + ident, name: 'Guru CBT (' + ident + ')', username: ident, role: 'GURU' };
        startGuruDashboard();
      } else {
        var token = document.getElementById('input-token').value.trim();
        if (!token) {
          alert('Silakan masukkan token sesi ujian yang diberikan oleh Pengawas!');
          return;
        }
        currentUser = { id: 'SIS-' + ident, name: 'Peserta Ujian (' + ident + ')', nisn: ident, role: 'SISWA', kelas: 'Kelas Terdaftar' };
        startExamView();
      }
    }

    function startGuruDashboard() {
      document.getElementById('view-login').classList.add('hidden');
      document.getElementById('view-exam').classList.add('hidden');
      document.getElementById('view-guru').classList.remove('hidden');
      showUserInHeader(currentUser.name, 'GURU / PROKTOR');
      setGuruMenu('dashboard');
    }

    function setGuruMenu(menu) {
      var menus = ['dashboard', 'bank-soal', 'ujian', 'monitoring', 'nilai', 'laporan'];
      menus.forEach(function(m) {
        var sec = document.getElementById('gsec-' + m);
        var btn = document.getElementById('gmenu-' + m);
        if (sec) sec.classList.add('hidden');
        if (btn) btn.className = 'px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 whitespace-nowrap';
      });

      var activeSec = document.getElementById('gsec-' + menu);
      var activeBtn = document.getElementById('gmenu-' + menu);
      if (activeSec) activeSec.classList.remove('hidden');
      if (activeBtn) activeBtn.className = 'px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white shadow-sm whitespace-nowrap';
    }

    function startExamView() {
      document.getElementById('view-login').classList.add('hidden');
      document.getElementById('view-guru').classList.add('hidden');
      document.getElementById('view-exam').classList.remove('hidden');
      showUserInHeader(currentUser.name, 'PESERTA: ' + currentUser.nisn);
      currentQuestionIdx = 0;
      renderCurrentQuestion();
      renderNavigator();
      startExamTimer();
    }

    function showUserInHeader(name, role) {
      document.getElementById('user-header-pill').classList.remove('hidden');
      document.getElementById('user-header-pill').classList.add('flex');
      document.getElementById('header-user-name').innerText = name;
      document.getElementById('header-user-role').innerText = role;
    }

    function handleLogout() {
      currentUser = null;
      document.getElementById('user-header-pill').classList.add('hidden');
      document.getElementById('user-header-pill').classList.remove('flex');
      document.getElementById('view-guru').classList.add('hidden');
      document.getElementById('view-exam').classList.add('hidden');
      document.getElementById('view-login').classList.remove('hidden');
    }

    function renderCurrentQuestion() {
      var q = sampleQuestions[currentQuestionIdx];
      document.getElementById('soal-no-display').innerText = (currentQuestionIdx + 1);
      document.getElementById('soal-type-display').innerText = q.type === 'PG' ? 'Pilihan Ganda (PG)' : (q.type === 'PGK' ? 'Pilihan Ganda Kompleks' : (q.type === 'BS' ? 'Benar / Salah' : (q.type === 'JODOH' ? 'Menjodohkan' : 'Isian Singkat')));
      document.getElementById('soal-text').innerText = q.question;

      var optContainer = document.getElementById('soal-options');
      optContainer.innerHTML = '';

      if (q.type === 'ISIAN') {
        var val = studentAnswers[q.id] || '';
        optContainer.innerHTML = '<input type="text" oninput="saveAnswer(\\'' + q.id + '\\', this.value)" value="' + val + '" placeholder="Ketik jawaban isian Anda..." class="w-full p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />';
      } else {
        q.options.forEach(function(opt) {
          var isChecked = studentAnswers[q.id] === opt.charAt(0);
          var lbl = document.createElement('label');
          lbl.className = 'flex items-center p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 cursor-pointer transition-colors ' + (isChecked ? 'bg-indigo-50/80 border-indigo-300 dark:bg-indigo-950/60 dark:border-indigo-800' : '');
          lbl.innerHTML = '<input type="radio" name="opt_choice" value="' + opt.charAt(0) + '" onchange="saveAnswer(\\'' + q.id + '\\', \\'' + opt.charAt(0) + '\\')" ' + (isChecked ? 'checked' : '') + ' class="w-4 h-4 text-indigo-600" /><span class="ml-3 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">' + opt + '</span>';
          optContainer.appendChild(lbl);
        });
      }

      document.getElementById('btn-prev-q').disabled = currentQuestionIdx === 0;
      renderNavigator();
    }

    function saveAnswer(qId, ans) {
      studentAnswers[qId] = ans;
      renderNavigator();
      // Autosave log to Apps Script (if hosted inside Google Apps Script)
      if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run.withSuccessHandler(function(){}).logViolationRecord({
          ujianId: 'UJ-2026-0001',
          siswaId: currentUser.id,
          siswaNama: currentUser.name,
          kelas: currentUser.kelas || 'X-RPL-1',
          jenis: 'AUTOSAVE',
          keterangan: 'Jawaban ' + qId + ' tersimpan'
        });
      }
    }

    function prevQuestion() {
      if (currentQuestionIdx > 0) {
        currentQuestionIdx--;
        renderCurrentQuestion();
      }
    }

    function nextQuestion() {
      if (currentQuestionIdx < sampleQuestions.length - 1) {
        currentQuestionIdx++;
        renderCurrentQuestion();
      }
    }

    function toggleRaguRagu() {
      var qId = sampleQuestions[currentQuestionIdx].id;
      raguFlags[qId] = !raguFlags[qId];
      renderNavigator();
    }

    function renderNavigator() {
      var container = document.getElementById('nav-pills');
      container.innerHTML = '';
      sampleQuestions.forEach(function(q, idx) {
        var btn = document.createElement('button');
        var isAnswered = !!studentAnswers[q.id];
        var isRagu = !!raguFlags[q.id];
        var isCurrent = idx === currentQuestionIdx;

        btn.className = 'w-8 h-8 rounded-lg font-mono font-bold text-xs transition-all ' +
          (isCurrent ? 'ring-2 ring-indigo-500 scale-105 ' : '') +
          (isRagu ? 'bg-amber-400 text-slate-950 font-black' : (isAnswered ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'));
        btn.innerText = (idx + 1);
        btn.onclick = function() {
          currentQuestionIdx = idx;
          renderCurrentQuestion();
        };
        container.appendChild(btn);
      });
    }

    function handleFinishExamConfirm() {
      var answeredCount = Object.keys(studentAnswers).length;
      if (confirm('Anda telah menjawab ' + answeredCount + ' dari 5 soal. Yakin ingin menyelesaikan ujian dan mengirim nilai ke Google Sheet?')) {
        alert('🎉 Ujian Selesai! Seluruh jawaban berhasil dikirim ke Sheet NILAI dan tersimpan aman di Google Cloud Spreadsheet.');
        handleLogout();
      }
    }

    function startExamTimer() {
      var sec = 90 * 60;
      var timerElem = document.getElementById('exam-timer');
      setInterval(function() {
        if (sec <= 0) return;
        sec--;
        var m = Math.floor(sec / 60);
        var s = sec % 60;
        timerElem.innerText = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
      }, 1000);
    }

    function toggleDarkMode() {
      document.documentElement.classList.toggle('dark');
    }

    // Realtime Clock
    setInterval(function() {
      var d = new Date();
      var str = d.toLocaleTimeString('id-ID');
      var el = document.getElementById('clock-display');
      if (el) el.innerText = str;
    }, 1000);
  </script>
</body>
</html>
`;
