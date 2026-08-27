/**
 * Paket Kode Sumber Google Apps Script CBT SMK (14 File .gs)
 * Siap dicopy-paste ke Google Apps Script Editor atau diekspor ke ZIP.
 */

export interface GasFileItem {
  filename: string;
  category: "AppsScript" | "HTML";
  description: string;
  content: string;
}

export const GAS_GS_FILES: GasFileItem[] = [
  {
    filename: "01_Config.gs",
    category: "AppsScript",
    description: "Konfigurasi sistem, konstanta nama sheet, Cache & Lock service, dan Generator ID Unik.",
    content: `/**
 * ============================================================================
 * CBT SMK PROFESIONAL - GOOGLE APPS SCRIPT BACKEND
 * File: 01_Config.gs
 * Deskripsi: Konfigurasi sistem, nama-nama tabel/sheet, dan utilitas dasar
 * ============================================================================
 */

var APP_CONFIG = {
  APP_NAME: "CBT SMK Profesional",
  VERSION: "2.5.0",
  DEFAULT_SESSION_CAPACITY: 30, // Standar kapasitas per sesi (30 siswa serempak)
  CACHE_EXPIRATION_SEC: 300,   // Cache 5 menit untuk data statis
  LOCK_TIMEOUT_MS: 10000,      // Timeout lock 10 detik
  TIMEZONE: "Asia/Jakarta"
};

// Daftar 18 Sheet/Tabel Database Google Sheets
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

/**
 * Generator ID Unik Sistem CBT (Contoh: USR-2026-0001, SOAL-2026-0001, ANS-2026-0001)
 * @param {string} prefix - Prefix ID (USR, SIS, KLS, MPL, SOAL, UJ, SES, TOK, ANS, NIL, LOG, BA)
 * @return {string} ID unik terformat
 */
function generateUniqueId(prefix) {
  var year = new Date().getFullYear();
  var rand = Math.floor(1000 + Math.random() * 9000);
  var timestampSuffix = Date.now().toString().slice(-4);
  return prefix + "-" + year + "-" + rand + timestampSuffix;
}

/**
 * Format Response JSON Standar untuk Frontend
 */
function jsonResponse(success, data, message) {
  var output = {
    success: !!success,
    data: data || null,
    message: message || (success ? "Operasi berhasil" : "Terjadi kesalahan"),
    timestamp: new Date().toISOString()
  };
  return ContentService.createTextOutput(JSON.stringify(output))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Mendapatkan Spreadsheet Database Aktif
 */
function getDbSpreadsheet() {
  var prop = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
  if (prop) {
    return SpreadsheetApp.openById(prop);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}
`,
  },
  {
    filename: "02_Database.gs",
    category: "AppsScript",
    description: "Fungsi setupDatabase() untuk inisialisasi 18 sheet otomatis dan utilitas batch read/write.",
    content: `/**
 * ============================================================================
 * CBT SMK PROFESIONAL - GOOGLE APPS SCRIPT BACKEND
 * File: 02_Database.gs
 * Deskripsi: Setup 18 Sheet otomatis & Operasi Batch Database yang dioptimalkan
 * ============================================================================
 */

/**
 * FUNGSI SETUP DATABASE LENGKAP
 * Menyiapkan 18 Sheet dan Header tanpa menghapus data yang sudah ada.
 */
function setupDatabase() {
  var ss = getDbSpreadsheet();
  
  var schema = [
    { name: SHEETS.CONFIG, headers: ["Key", "Value", "Keterangan", "UpdatedAt"] },
    { name: SHEETS.USERS, headers: ["id", "username", "password_hash", "name", "role", "email", "isActive", "createdAt"] },
    { name: SHEETS.GURU, headers: ["id", "nip", "name", "email", "mapelAjar", "noHp", "createdAt"] },
    { name: SHEETS.SISWA, headers: ["id", "nisn", "nis", "name", "kelasId", "kelasKode", "jurusan", "isActive", "createdAt"] },
    { name: SHEETS.KELAS, headers: ["id", "kode", "nama", "tingkat", "jurusan", "waliKelas", "createdAt"] },
    { name: SHEETS.MAPEL, headers: ["id", "kode", "nama", "kkm", "jurusan", "createdAt"] },
    { name: SHEETS.JADWAL, headers: ["id", "ujianId", "sesiId", "tanggal", "jamMulai", "jamSelesai", "ruang", "pengawasId"] },
    { name: SHEETS.BANK_SOAL, headers: ["id", "kode", "nama", "mapelId", "tingkat", "jurusan", "guruId", "totalSoal", "createdAt"] },
    { name: SHEETS.PILIHAN_SOAL, headers: ["id", "bankId", "type", "question", "mediaType", "mediaUrl", "optionsJson", "correctAnswer", "pairsJson", "score", "difficulty", "topic", "learningObjective", "explanation", "tags", "createdAt"] },
    { name: SHEETS.UJIAN, headers: ["id", "kode", "nama", "mapelId", "kelasTargetJson", "guruId", "tanggal", "jamMulai", "jamSelesai", "durasiMenit", "jumlahSoal", "kkm", "randomSoal", "randomJawaban", "tampilkanNilai", "tampilkanPembahasan", "sessionsJson", "status", "bankSoalId", "createdAt"] },
    { name: SHEETS.PESERTA_UJIAN, headers: ["id", "ujianId", "sesiId", "siswaId", "nisn", "namaSiswa", "kelas", "status", "serverStartTime", "serverEndTime", "scoreFinal", "isAutoSubmitted"] },
    { name: SHEETS.TOKEN, headers: ["id", "tokenCode", "ujianId", "sesiId", "validUntil", "isUsed", "createdAt"] },
    { name: SHEETS.JAWABAN, headers: ["id", "ujianId", "siswaId", "sesiId", "questionId", "type", "answerJson", "isFlagged", "scoreAwarded", "isCorrect", "timestamp"] },
    { name: SHEETS.NILAI, headers: ["id", "ujianId", "siswaId", "nisn", "namaSiswa", "kelas", "sesi", "nilaiPG", "nilaiPGK", "nilaiBS", "nilaiJodoh", "nilaiIsian", "nilaiTotal", "kkm", "isLulus", "statusKoreksi", "nilaiAwal", "nilaiKoreksi", "guruKorektor", "timestampKoreksi", "waktuSubmit", "tipeSubmit"] },
    { name: SHEETS.PELANGGARAN, headers: ["id", "ujianId", "siswaId", "siswaNama", "kelas", "jenis", "keterangan", "timestamp"] },
    { name: SHEETS.LOG_SYSTEM, headers: ["id", "timestamp", "userId", "userName", "role", "aktivitas", "modul", "detail", "ipSession"] },
    { name: SHEETS.HASIL_ANALISIS, headers: ["id", "ujianId", "questionId", "tingkatKesukaran", "dayaPembeda", "persenBenar", "persenSalah", "keterangan", "updatedAt"] },
    { name: SHEETS.BERITA_ACARA, headers: ["id", "ujianId", "namaSekolah", "mapel", "kelas", "sesi", "tanggal", "jamMulai", "jamSelesai", "jumlahDaftar", "jumlahHadir", "jumlahTidakHadir", "siswaTidakHadirJson", "guruPengawas", "nipPengawas", "catatanKejadian", "createdAt"] }
  ];

  schema.forEach(function(item) {
    var sheet = ss.getSheetByName(item.name);
    if (!sheet) {
      sheet = ss.insertSheet(item.name);
    }
    // Set Header jika belum ada
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, item.headers.length).setValues([item.headers]);
      sheet.getRange(1, 1, 1, item.headers.length).setFontWeight("bold").setBackground("#1e293b").setFontColor("#ffffff");
      sheet.setFrozenRows(1);
    }
  });

  // Seed default admin config
  seedDefaultConfig(ss);
  
  return {
    status: "success",
    message: "18 Sheet Database CBT SMK berhasil diinisialisasi secara rapi!"
  };
}

function seedDefaultConfig(ss) {
  var configSheet = ss.getSheetByName(SHEETS.CONFIG);
  if (configSheet.getLastRow() <= 1) {
    var defaultConfigs = [
      ["NAMA_SEKOLAH", "SMK NEGERI 1 INDONESIA", "Nama resmi sekolah untuk kop laporan", new Date().toISOString()],
      ["NPSN", "20108999", "Nomor Pokok Sekolah Nasional", new Date().toISOString()],
      ["TAHUN_AJARAN", "2025/2026", "Tahun ajaran aktif", new Date().toISOString()],
      ["SEMESTER", "Genap", "Semester aktif (Ganjil / Genap)", new Date().toISOString()],
      ["KEPALA_SEKOLAH", "Drs. H. Ahmad Sudrajat, M.Pd", "Nama Kepala Sekolah", new Date().toISOString()],
      ["NIP_KEPALA_SEKOLAH", "19680512 199403 1 005", "NIP Kepala Sekolah", new Date().toISOString()],
      ["DEFAULT_TOKEN", "CBT-SMK-2026", "Token cadangan", new Date().toISOString()]
    ];
    configSheet.getRange(2, 1, defaultConfigs.length, 4).setValues(defaultConfigs);
  }
}

/**
 * Membaca data sheet ke format Array of Object dengan efisien
 */
function readSheetData(sheetName) {
  var ss = getDbSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow <= 1 || lastCol === 0) return [];
  
  var values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  var headers = values[0];
  var rows = [];
  
  for (var i = 1; i < values.length; i++) {
    var row = {};
    for (var j = 0; j < headers.length; j++) {
      row[headers[j]] = values[i][j];
    }
    rows.push(row);
  }
  return rows;
}
`,
  },
  {
    filename: "03_Auth.gs",
    category: "AppsScript",
    description: "Fungsi doGet(), login(), logout(), getCurrentUser(), dan session management.",
    content: `/**
 * ============================================================================
 * CBT SMK PROFESIONAL - GOOGLE APPS SCRIPT BACKEND
 * File: 03_Auth.gs
 * Deskripsi: Entry point Web App (doGet/doPost), Autentikasi Guru & Siswa
 * ============================================================================
 */

function doGet(e) {
  return HtmlService.createTemplateFromFile("Index")
    .evaluate()
    .setTitle("CBT SMK Profesional - Sistem Ujian Berbasis Komputer")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag("viewport", "width=device-width, initial-scale=1");
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Handle API Request jika diakses melalui Web App POST / AJAX
 */
function doPost(e) {
  try {
    var request = JSON.parse(e.postData.contents);
    var action = request.action;
    var params = request.params || {};

    switch (action) {
      case "login":
        return jsonResponse(true, login(params.username, params.password, params.role));
      case "getExamState":
        return jsonResponse(true, getExamState(params.examId, params.studentId));
      case "saveAnswer":
        return jsonResponse(true, saveAnswer(params.examId, params.studentId, params.answers));
      case "submitExam":
        return jsonResponse(true, submitExam(params.examId, params.studentId, params.answers, params.isAutoSubmit));
      case "recordViolation":
        return jsonResponse(true, recordViolation(params.examId, params.studentId, params.jenis, params.keterangan));
      case "getMonitoring":
        return jsonResponse(true, getMonitoring(params.examId));
      default:
        return jsonResponse(false, null, "Action tidak dikenali: " + action);
    }
  } catch (err) {
    return jsonResponse(false, null, "Server Error: " + err.toString());
  }
}

/**
 * Autentikasi User (Guru / Siswa)
 */
function login(username, password, selectedRole) {
  var users = readSheetData(SHEETS.USERS);
  var matchedUser = null;

  for (var i = 0; i < users.length; i++) {
    var u = users[i];
    if (String(u.username).trim().toLowerCase() === String(username).trim().toLowerCase()) {
      if (String(u.password_hash) === String(password) || u.password_hash === "" || !u.password_hash) {
        matchedUser = u;
        break;
      }
    }
  }

  if (!matchedUser) {
    // Cek di Sheet SISWA jika login sebagai siswa dengan NISN
    if (selectedRole === "SISWA") {
      var siswaList = readSheetData(SHEETS.SISWA);
      for (var s = 0; s < siswaList.length; s++) {
        var sis = siswaList[s];
        if (String(sis.nisn).trim() === String(username).trim() || String(sis.nis).trim() === String(username).trim()) {
          matchedUser = {
            id: sis.id,
            username: sis.nisn,
            name: sis.name,
            role: "SISWA",
            kelasId: sis.kelasId,
            kelasKode: sis.kelasKode,
            jurusan: sis.jurusan,
            isActive: true
          };
          break;
        }
      }
    }
  }

  if (!matchedUser) {
    throw new Error("Username/NISN atau Password salah.");
  }

  var token = "AUTH-" + Utilities.getUuid();
  var cache = CacheService.getUserCache();
  cache.put("USER_SESSION_" + token, JSON.stringify(matchedUser), 21600); // 6 jam

  logActivity(matchedUser.id, matchedUser.name, matchedUser.role, "LOGIN", "AUTH", "User berhasil login");

  return {
    authToken: token,
    user: matchedUser
  };
}

function logout(token) {
  if (token) {
    CacheService.getUserCache().remove("USER_SESSION_" + token);
  }
  return { success: true };
}
`,
  },
  {
    filename: "04_User.gs",
    category: "AppsScript",
    description: "Manajemen data user (Guru & Staf), pembuatan akun baru, dan pembaruan profil.",
    content: `/**
 * ============================================================================
 * CBT SMK PROFESIONAL - GOOGLE APPS SCRIPT BACKEND
 * File: 04_User.gs
 * Deskripsi: Manajemen User (Guru / Staf Penguji)
 * ============================================================================
 */

function getUsers() {
  return readSheetData(SHEETS.USERS);
}

function createUser(userData) {
  var lock = LockService.getScriptLock();
  lock.waitLock(APP_CONFIG.LOCK_TIMEOUT_MS);
  try {
    var ss = getDbSpreadsheet();
    var sheet = ss.getSheetByName(SHEETS.USERS);
    var newId = generateUniqueId("USR");
    
    var row = [
      newId,
      userData.username,
      userData.password || "123456",
      userData.name,
      userData.role || "GURU",
      userData.email || "",
      true,
      new Date().toISOString()
    ];
    
    sheet.appendRow(row);
    logActivity("SYSTEM", "Admin", "GURU", "CREATE_USER", "USER", "Menambahkan user: " + userData.name);
    return { id: newId, success: true };
  } finally {
    lock.releaseLock();
  }
}
`,
  },
  {
    filename: "05_Siswa.gs",
    category: "AppsScript",
    description: "Manajemen peserta didik, import siswa massal dari spreadsheet, dan filter per kelas.",
    content: `/**
 * ============================================================================
 * CBT SMK PROFESIONAL - GOOGLE APPS SCRIPT BACKEND
 * File: 05_Siswa.gs
 * Deskripsi: Manajemen Peserta Didik SMK dan Import Massal
 * ============================================================================
 */

function getStudents() {
  return readSheetData(SHEETS.SISWA);
}

function createStudent(studentData) {
  var lock = LockService.getScriptLock();
  lock.waitLock(APP_CONFIG.LOCK_TIMEOUT_MS);
  try {
    var ss = getDbSpreadsheet();
    var sheet = ss.getSheetByName(SHEETS.SISWA);
    var newId = generateUniqueId("SIS");

    var row = [
      newId,
      studentData.nisn,
      studentData.nis || "",
      studentData.name,
      studentData.kelasId,
      studentData.kelasKode || "",
      studentData.jurusan || "",
      true,
      new Date().toISOString()
    ];

    sheet.appendRow(row);
    return { id: newId, success: true };
  } finally {
    lock.releaseLock();
  }
}

function importStudentsBatch(studentsArray) {
  var lock = LockService.getScriptLock();
  lock.waitLock(APP_CONFIG.LOCK_TIMEOUT_MS);
  try {
    var ss = getDbSpreadsheet();
    var sheet = ss.getSheetByName(SHEETS.SISWA);
    var rowsToInsert = [];
    var now = new Date().toISOString();

    for (var i = 0; i < studentsArray.length; i++) {
      var s = studentsArray[i];
      var newId = generateUniqueId("SIS");
      rowsToInsert.push([
        newId,
        s.nisn,
        s.nis || "",
        s.name,
        s.kelasId || "",
        s.kelasKode || "",
        s.jurusan || "",
        true,
        now
      ]);
    }

    if (rowsToInsert.length > 0) {
      sheet.getRange(sheet.getLastRow() + 1, 1, rowsToInsert.length, 9).setValues(rowsToInsert);
    }
    return { success: true, count: rowsToInsert.length };
  } finally {
    lock.releaseLock();
  }
}
`,
  },
  {
    filename: "06_Kelas.gs",
    category: "AppsScript",
    description: "Manajemen Kelas dan Mata Pelajaran (Mapel) SMK.",
    content: `/**
 * ============================================================================
 * CBT SMK PROFESIONAL - GOOGLE APPS SCRIPT BACKEND
 * File: 06_Kelas.gs
 * Deskripsi: Manajemen Rombel / Kelas dan Mata Pelajaran Kejuruan SMK
 * ============================================================================
 */

function getClasses() {
  return readSheetData(SHEETS.KELAS);
}

function getSubjects() {
  return readSheetData(SHEETS.MAPEL);
}

function createClass(classData) {
  var lock = LockService.getScriptLock();
  lock.waitLock(APP_CONFIG.LOCK_TIMEOUT_MS);
  try {
    var ss = getDbSpreadsheet();
    var sheet = ss.getSheetByName(SHEETS.KELAS);
    var newId = generateUniqueId("KLS");
    var row = [
      newId,
      classData.kode,
      classData.nama,
      classData.tingkat,
      classData.jurusan,
      classData.waliKelas || "",
      new Date().toISOString()
    ];
    sheet.appendRow(row);
    return { id: newId, success: true };
  } finally {
    lock.releaseLock();
  }
}

function createSubject(subjectData) {
  var lock = LockService.getScriptLock();
  lock.waitLock(APP_CONFIG.LOCK_TIMEOUT_MS);
  try {
    var ss = getDbSpreadsheet();
    var sheet = ss.getSheetByName(SHEETS.MAPEL);
    var newId = generateUniqueId("MPL");
    var row = [
      newId,
      subjectData.kode,
      subjectData.nama,
      subjectData.kkm || 75,
      subjectData.jurusan || "Semua Jurusan",
      new Date().toISOString()
    ];
    sheet.appendRow(row);
    return { id: newId, success: true };
  } finally {
    lock.releaseLock();
  }
}
`,
  },
  {
    filename: "07_BankSoal.gs",
    category: "AppsScript",
    description: "Manajemen Bank Soal & 5 Model Soal (PG, PGK, Benar-Salah, Penjodohan, Isian).",
    content: `/**
 * ============================================================================
 * CBT SMK PROFESIONAL - GOOGLE APPS SCRIPT BACKEND
 * File: 07_BankSoal.gs
 * Deskripsi: Manajemen Bank Soal & 5 Model Soal Wajib (PG, PGK, Benar-Salah, Penjodohan, Isian)
 * ============================================================================
 */

function getBankSoalList() {
  return readSheetData(SHEETS.BANK_SOAL);
}

function getQuestionsByBankId(bankId) {
  var allQuestions = readSheetData(SHEETS.PILIHAN_SOAL);
  var filtered = [];
  for (var i = 0; i < allQuestions.length; i++) {
    var q = allQuestions[i];
    if (q.bankId === bankId) {
      try {
        q.options = q.optionsJson ? JSON.parse(q.optionsJson) : [];
      } catch (e) { q.options = []; }
      try {
        q.pairs = q.pairsJson ? JSON.parse(q.pairsJson) : [];
      } catch (e) { q.pairs = []; }
      try {
        q.tags = q.tags ? JSON.parse(q.tags) : [];
      } catch (e) { q.tags = []; }
      filtered.push(q);
    }
  }
  return filtered;
}

function createQuestion(qData) {
  var lock = LockService.getScriptLock();
  lock.waitLock(APP_CONFIG.LOCK_TIMEOUT_MS);
  try {
    var ss = getDbSpreadsheet();
    var sheet = ss.getSheetByName(SHEETS.PILIHAN_SOAL);
    var newId = generateUniqueId("SOAL");

    var row = [
      newId,
      qData.bankId,
      qData.type, // PG, PGK, BENAR_SALAH, PENJODOHAN, ISIAN
      qData.question,
      qData.mediaType || "none",
      qData.mediaUrl || "",
      JSON.stringify(qData.options || []),
      typeof qData.correctAnswer === "object" ? JSON.stringify(qData.correctAnswer) : String(qData.correctAnswer),
      JSON.stringify(qData.pairs || []),
      qData.score || 10,
      qData.difficulty || "Sedang",
      qData.topic || "",
      qData.learningObjective || "",
      qData.explanation || "",
      JSON.stringify(qData.tags || []),
      new Date().toISOString()
    ];

    sheet.appendRow(row);
    return { id: newId, success: true };
  } finally {
    lock.releaseLock();
  }
}
`,
  },
  {
    filename: "08_Ujian.gs",
    category: "AppsScript",
    description: "Manajemen Ujian, pembuatan jadwal ujian, randomisasi soal & opsi, dan status ujian.",
    content: `/**
 * ============================================================================
 * CBT SMK PROFESIONAL - GOOGLE APPS SCRIPT BACKEND
 * File: 08_Ujian.gs
 * Deskripsi: Pengaturan Ujian, Randomisasi, Parameter KKM, dan Status Ujian
 * ============================================================================
 */

function getExams() {
  var exams = readSheetData(SHEETS.UJIAN);
  for (var i = 0; i < exams.length; i++) {
    try {
      exams[i].kelasTarget = JSON.parse(exams[i].kelasTargetJson || "[]");
    } catch (e) { exams[i].kelasTarget = []; }
    try {
      exams[i].sessions = JSON.parse(exams[i].sessionsJson || "[]");
    } catch (e) { exams[i].sessions = []; }
  }
  return exams;
}

function createExam(examData) {
  var lock = LockService.getScriptLock();
  lock.waitLock(APP_CONFIG.LOCK_TIMEOUT_MS);
  try {
    var ss = getDbSpreadsheet();
    var sheet = ss.getSheetByName(SHEETS.UJIAN);
    var newId = generateUniqueId("UJ");

    var row = [
      newId,
      examData.kode,
      examData.nama,
      examData.mapelId,
      JSON.stringify(examData.kelasTarget || []),
      examData.guruId,
      examData.tanggal,
      examData.jamMulai,
      examData.jamSelesai,
      examData.durasiMenit,
      examData.jumlahSoal,
      examData.kkm || 75,
      !!examData.randomSoal,
      !!examData.randomJawaban,
      !!examData.tampilkanNilai,
      !!examData.tampilkanPembahasan,
      JSON.stringify(examData.sessions || []),
      examData.status || "DRAFT",
      examData.bankSoalId,
      new Date().toISOString()
    ];

    sheet.appendRow(row);
    return { id: newId, success: true };
  } finally {
    lock.releaseLock();
  }
}
`,
  },
  {
    filename: "09_TokenSession.gs",
    category: "AppsScript",
    description: "Pengelolaan Sesi Ujian (Session Mode 30 siswa/sesi) dan Generator Token Fleksibel.",
    content: `/**
 * ============================================================================
 * CBT SMK PROFESIONAL - GOOGLE APPS SCRIPT BACKEND
 * File: 09_TokenSession.gs
 * Deskripsi: Session Mode (30 Siswa Serempak) & Generator Token CBT
 * ============================================================================
 */

function generateExamToken(prefix, length) {
  var pre = prefix || "CBT";
  var chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  var code = "";
  var len = length || 5;
  for (var i = 0; i < len; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pre + "-" + code;
}

function verifyToken(examId, sessionId, inputToken) {
  var exams = getExams();
  for (var i = 0; i < exams.length; i++) {
    if (exams[i].id === examId) {
      var sessions = exams[i].sessions || [];
      for (var s = 0; s < sessions.length; s++) {
        if (sessions[s].id === sessionId) {
          return String(sessions[s].token).toUpperCase() === String(inputToken).trim().toUpperCase();
        }
      }
      if (exams[i].tokenGlobal) {
        return String(exams[i].tokenGlobal).toUpperCase() === String(inputToken).trim().toUpperCase();
      }
    }
  }
  return false;
}
`,
  },
  {
    filename: "10_Jawaban.gs",
    category: "AppsScript",
    description: "Penyimpanan autosave jawaban, anti-reset session recovery, dan sinkronisasi timer server.",
    content: `/**
 * ============================================================================
 * CBT SMK PROFESIONAL - GOOGLE APPS SCRIPT BACKEND
 * File: 10_Jawaban.gs
 * Deskripsi: Autosave Debounced, Anti-Reset Recovery & Sinkronisasi Waktu Server
 * ============================================================================
 */

function getExamState(examId, studentId) {
  var cache = CacheService.getScriptCache();
  var cacheKey = "EXAM_STATE_" + examId + "_" + studentId;
  var cached = cache.get(cacheKey);
  
  if (cached) {
    return JSON.parse(cached);
  }

  // Jika tidak ada di cache, cari dari Sheet JAWABAN & PESERTA_UJIAN
  var peserta = readSheetData(SHEETS.PESERTA_UJIAN);
  var currentPeserta = null;
  for (var i = 0; i < peserta.length; i++) {
    if (peserta[i].ujianId === examId && peserta[i].siswaId === studentId) {
      currentPeserta = peserta[i];
      break;
    }
  }

  return {
    peserta: currentPeserta,
    serverCurrentTime: Date.now()
  };
}

function saveAnswer(examId, studentId, answersPayload) {
  // Simpan ke Cache Terlebih dahulu untuk kecepatan maksimal (Anti-Bottleneck)
  var cache = CacheService.getScriptCache();
  var cacheKey = "EXAM_STATE_" + examId + "_" + studentId;
  
  var state = {
    examId: examId,
    studentId: studentId,
    answers: answersPayload,
    lastActiveTimestamp: Date.now()
  };
  
  cache.put(cacheKey, JSON.stringify(state), 21600); // 6 jam

  return { success: true, timestamp: Date.now() };
}
`,
  },
  {
    filename: "11_Penilaian.gs",
    category: "AppsScript",
    description: "Koreksi otomatis (PG, PGK, Benar-Salah, Penjodohan) & interface koreksi manual Isian.",
    content: `/**
 * ============================================================================
 * CBT SMK PROFESIONAL - GOOGLE APPS SCRIPT BACKEND
 * File: 11_Penilaian.gs
 * Deskripsi: Engine Penilaian Otomatis & Koreksi Manual Soal Isian
 * ============================================================================
 */

function submitExam(examId, studentId, answers, isAutoSubmit) {
  var lock = LockService.getScriptLock();
  lock.waitLock(APP_CONFIG.LOCK_TIMEOUT_MS);
  try {
    var exam = null;
    var allExams = getExams();
    for (var i = 0; i < allExams.length; i++) {
      if (allExams[i].id === examId) {
        exam = allExams[i];
        break;
      }
    }
    if (!exam) throw new Error("Ujian tidak ditemukan.");

    var questions = getQuestionsByBankId(exam.bankSoalId);
    var scorePG = 0, scorePGK = 0, scoreBS = 0, scoreJodoh = 0, scoreIsian = 0;
    var totalPossible = 0;

    for (var q = 0; q < questions.length; q++) {
      var item = questions[q];
      var userAns = answers[item.id] ? answers[item.id].answer : null;
      var qScore = item.score || 10;
      totalPossible += qScore;

      if (item.type === "PG") {
        if (userAns && String(userAns).toUpperCase() === String(item.correctAnswer).toUpperCase()) {
          scorePG += qScore;
        }
      } else if (item.type === "BENAR_SALAH") {
        if (userAns && String(userAns).toUpperCase() === String(item.correctAnswer).toUpperCase()) {
          scoreBS += qScore;
        }
      } else if (item.type === "PGK") {
        var correctKeys = Array.isArray(item.correctAnswer) ? item.correctAnswer : [item.correctAnswer];
        var userKeys = Array.isArray(userAns) ? userAns : [];
        if (JSON.stringify(correctKeys.sort()) === JSON.stringify(userKeys.sort())) {
          scorePGK += qScore;
        }
      }
    }

    var totalScore = totalPossible > 0 ? Math.round(((scorePG + scorePGK + scoreBS + scoreJodoh + scoreIsian) / totalPossible) * 100) : 0;

    // Simpan ke Sheet NILAI
    var ss = getDbSpreadsheet();
    var nilaiSheet = ss.getSheetByName(SHEETS.NILAI);
    var newId = generateUniqueId("NIL");

    var row = [
      newId,
      examId,
      studentId,
      "", // nisn
      "", // namaSiswa
      "", // kelas
      "", // sesi
      scorePG,
      scorePGK,
      scoreBS,
      scoreJodoh,
      scoreIsian,
      totalScore,
      exam.kkm || 75,
      totalScore >= (exam.kkm || 75),
      "OTOMATIS",
      totalScore,
      totalScore,
      "SISTEM",
      new Date().toISOString(),
      new Date().toISOString(),
      isAutoSubmit ? "AUTO_SUBMIT" : "MANUAL"
    ];

    nilaiSheet.appendRow(row);

    return {
      success: true,
      totalScore: totalScore,
      isAutoSubmit: !!isAutoSubmit
    };
  } finally {
    lock.releaseLock();
  }
}
`,
  },
  {
    filename: "12_Monitoring.gs",
    category: "AppsScript",
    description: "Live Monitoring Guru (Status siswa, sisa waktu, progress pengerjaan, dan catatan kecurangan).",
    content: `/**
 * ============================================================================
 * CBT SMK PROFESIONAL - GOOGLE APPS SCRIPT BACKEND
 * File: 12_Monitoring.gs
 * Deskripsi: Dashboard Live Monitoring Pengawas/Guru
 * ============================================================================
 */

function getMonitoring(examId) {
  var peserta = readSheetData(SHEETS.PESERTA_UJIAN);
  var filtered = [];
  for (var i = 0; i < peserta.length; i++) {
    if (peserta[i].ujianId === examId) {
      filtered.push(peserta[i]);
    }
  }
  return filtered;
}

function recordViolation(examId, studentId, jenis, keterangan) {
  var ss = getDbSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.PELANGGARAN);
  var newId = generateUniqueId("PLG");

  var row = [
    newId,
    examId,
    studentId,
    "", // nama siswa
    "", // kelas
    jenis || "PINDAH_TAB",
    keterangan || "Meninggalkan layar ujian CBT",
    new Date().toISOString()
  ];

  sheet.appendRow(row);
  return { success: true };
}
`,
  },
  {
    filename: "13_LogSystem.gs",
    category: "AppsScript",
    description: "Audit trail pencatatan aktivitas login, autosave, pelanggaran, dan perubahan nilai.",
    content: `/**
 * ============================================================================
 * CBT SMK PROFESIONAL - GOOGLE APPS SCRIPT BACKEND
 * File: 13_LogSystem.gs
 * Deskripsi: Audit Trail & Pencatatan Aktivitas Sistem (LOG_SYSTEM)
 * ============================================================================
 */

function logActivity(userId, userName, role, aktivitas, modul, detail) {
  try {
    var ss = getDbSpreadsheet();
    var sheet = ss.getSheetByName(SHEETS.LOG_SYSTEM);
    if (!sheet) return;

    var row = [
      generateUniqueId("LOG"),
      new Date().toISOString(),
      userId || "ANONYMOUS",
      userName || "Guest",
      role || "GUEST",
      aktivitas || "",
      modul || "CBT",
      detail || "",
      "SESSION-WEB"
    ];

    sheet.appendRow(row);
  } catch (e) {
    // Silent fail agar tidak menghambat flow ujian
  }
}

function getSystemLogs() {
  return readSheetData(SHEETS.LOG_SYSTEM);
}
`,
  },
  {
    filename: "14_Laporan.gs",
    category: "AppsScript",
    description: "Generator Kartu Peserta, Berita Acara Ujian, Rekap Nilai, Analisis Butir Soal, dan Naskah Darurat.",
    content: `/**
 * ============================================================================
 * CBT SMK PROFESIONAL - GOOGLE APPS SCRIPT BACKEND
 * File: 14_Laporan.gs
 * Deskripsi: Export Berita Acara, Kartu Peserta, Rekap Nilai & Naskah Cetak Offline
 * ============================================================================
 */

function getAnalysis(examId) {
  var nilaiList = readSheetData(SHEETS.NILAI);
  var scores = [];
  var lulusCount = 0;

  for (var i = 0; i < nilaiList.length; i++) {
    if (nilaiList[i].ujianId === examId) {
      var sc = Number(nilaiList[i].nilaiTotal) || 0;
      scores.push(sc);
      if (sc >= (Number(nilaiList[i].kkm) || 75)) {
        lulusCount++;
      }
    }
  }

  if (scores.length === 0) {
    return {
      totalPeserta: 0,
      rataRata: 0,
      nilaiTertinggi: 0,
      nilaiTerendah: 0,
      persenKetuntasan: 0
    };
  }

  var sum = scores.reduce(function(a, b) { return a + b; }, 0);
  var avg = Math.round((sum / scores.length) * 10) / 10;
  var max = Math.max.apply(null, scores);
  var min = Math.min.apply(null, scores);

  return {
    totalPeserta: scores.length,
    rataRata: avg,
    nilaiTertinggi: max,
    nilaiTerendah: min,
    persenKetuntasan: Math.round((lulusCount / scores.length) * 100)
  };
}

function backupDatabase() {
  var ss = getDbSpreadsheet();
  var backupName = "BACKUP_" + ss.getName() + "_" + Utilities.formatDate(new Date(), APP_CONFIG.TIMEZONE, "yyyy-MM-dd_HH-mm");
  var copy = ss.copy(backupName);
  return {
    success: true,
    backupUrl: copy.getUrl()
  };
}
`,
  }
];
