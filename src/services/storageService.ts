/**
 * Service Penyimpanan Data CBT SMK
 * Mendukung penyimpanan lokal reaktif (Offline-first / Simulated DB)
 * dan sinkronisasi langsung ke Google Apps Script Web App Backend via REST/POST.
 */

import {
  User,
  Kelas,
  Mapel,
  BankSoal,
  Question,
  Ujian,
  NilaiSiswa,
  PelanggaranLog,
  SystemLog,
  BeritaAcara,
  SchoolConfig,
  ExamSessionState,
} from "../types/cbt";

const STORAGE_KEYS = {
  USERS: "CBT_SMK_USERS_V2",
  KELAS: "CBT_SMK_KELAS_V2",
  MAPEL: "CBT_SMK_MAPEL_V2",
  BANK_SOAL: "CBT_SMK_BANK_SOAL_V2",
  UJIAN: "CBT_SMK_UJIAN_V2",
  NILAI: "CBT_SMK_NILAI_V2",
  PELANGGARAN: "CBT_SMK_PELANGGARAN_V2",
  LOGS: "CBT_SMK_LOGS_V2",
  BERITA_ACARA: "CBT_SMK_BERITA_ACARA_V2",
  CONFIG: "CBT_SMK_CONFIG_V2",
  ACTIVE_EXAM_STATES: "CBT_SMK_ACTIVE_EXAM_STATES_V2",
  AUTH_USER: "CBT_SMK_AUTH_USER_V2",
};

// Seed Data Awal SMK Profesional
export const INITIAL_SCHOOL_CONFIG: SchoolConfig = {
  namaSekolah: "SMK NEGERI 1 INDONESIA",
  npsn: "20108999",
  alamat: "Jl. Pendidikan Kejuruan No. 45, Kompleks Pendidikan Teknologi",
  kabupatenKota: "Kota Jakarta Pusat",
  provinsi: "DKI Jakarta",
  kepalaSekolah: "Drs. H. Ahmad Sudrajat, M.Pd",
  nipKepalaSekolah: "19680512 199403 1 005",
  tahunAjaran: "2025/2026",
  semester: "Genap",
  gasWebAppUrl: "",
  useRealGasBackend: false,
};

export const INITIAL_USERS: User[] = [
  {
    id: "USR-2026-0001",
    username: "guru",
    name: "Budi Santoso, S.Kom",
    email: "budi.santoso@guru.smk.belajar.id",
    role: "GURU",
    nip: "19850115 201001 1 012",
    jurusan: "Rekayasa Perangkat Lunak",
    isActive: true,
  },
  {
    id: "USR-2026-0002",
    username: "guru_tkj",
    name: "Siti Rahmawati, M.T",
    email: "siti.rahmawati@guru.smk.belajar.id",
    role: "GURU",
    nip: "19890320 201402 2 003",
    jurusan: "Teknik Komputer dan Jaringan",
    isActive: true,
  },
  // 30 Siswa Seed untuk Ujian Serempak
  ...Array.from({ length: 30 }, (_, i) => {
    const num = i + 1;
    const padNum = num < 10 ? `0${num}` : `${num}`;
    const nisn = `00812345${padNum}`;
    const names = [
      "Aditya Pratama", "Anisa Rahmawati", "Bayu Saputra", "Citra Lestari", "Dimas Pratama",
      "Eka Nurul Hidayah", "Fajar Nugraha", "Gita Permata", "Hadi Prasetyo", "Indah Puspitasari",
      "Joko Susilo", "Kartika Putri", "Lukman Hakim", "Mega Utami", "Naufal Azhar",
      "Oki Setiawan", "Putri Anggraini", "Rian Hidayat", "Siti Nurhaliza", "Teguh Wibowo",
      "Umar Bakri", "Vina Panduwinata", "Wahyu Ramadhan", "Xavier Hendra", "Yoga Pratama",
      "Zahra Amelia", "Bambang Pamungkas", "Dewi Sartika", "Farhan Maulana", "Halimah Tusyadiah"
    ];
    return {
      id: `SIS-2026-${1000 + num}`,
      username: nisn,
      name: names[i] || `Siswa RPL ${num}`,
      role: "SISWA" as const,
      nisn: nisn,
      kelasId: "KLS-2026-0001",
      jurusan: "Rekayasa Perangkat Lunak",
      isActive: true,
    };
  }),
];

export const INITIAL_CLASSES: Kelas[] = [
  {
    id: "KLS-2026-0001",
    kode: "X-RPL-1",
    nama: "X Rekayasa Perangkat Lunak 1",
    tingkat: "X",
    jurusan: "Rekayasa Perangkat Lunak",
    waliKelas: "Budi Santoso, S.Kom",
    jumlahSiswa: 30,
  },
  {
    id: "KLS-2026-0002",
    kode: "X-TKJ-1",
    nama: "X Teknik Komputer dan Jaringan 1",
    tingkat: "X",
    jurusan: "Teknik Komputer dan Jaringan",
    waliKelas: "Siti Rahmawati, M.T",
    jumlahSiswa: 30,
  },
  {
    id: "KLS-2026-0003",
    kode: "XI-DKV-1",
    nama: "XI Desain Komunikasi Visual 1",
    tingkat: "XI",
    jurusan: "Desain Komunikasi Visual",
    waliKelas: "Hendra Wijaya, S.Sn",
    jumlahSiswa: 28,
  },
];

export const INITIAL_MAPEL: Mapel[] = [
  {
    id: "MPL-2026-0001",
    kode: "INF-X",
    nama: "Informatika & Pemrograman Dasar",
    jurusan: "Rekayasa Perangkat Lunak",
    kkm: 75,
  },
  {
    id: "MPL-2026-0002",
    kode: "TKJ-X",
    nama: "Dasar Jaringan Komputer & Telekomunikasi",
    jurusan: "Teknik Komputer dan Jaringan",
    kkm: 75,
  },
  {
    id: "MPL-2026-0003",
    kode: "BIND-SMK",
    nama: "Bahasa Indonesia SMK",
    jurusan: "Semua Jurusan",
    kkm: 70,
  },
];

export const INITIAL_QUESTIONS: Question[] = [
  {
    id: "SOAL-2026-0001",
    bankId: "BNK-2026-0001",
    type: "PG",
    question: "Dalam pemrograman web modern berbasis JavaScript (ES6+), kata kunci manakah yang digunakan untuk mendeklarasikan variabel dengan cakupan blok (block-scope) yang nilainya dapat diubah kembali?",
    options: [
      { key: "A", text: "let" },
      { key: "B", text: "const" },
      { key: "C", text: "var" },
      { key: "D", text: "define" },
      { key: "E", text: "static" },
    ],
    correctAnswer: "A",
    score: 10,
    difficulty: "Mudah",
    topic: "Dasar Pemrograman JavaScript",
    learningObjective: "Memahami scope dan deklarasi variabel ES6",
    explanation: "Keyword 'let' memiliki block scope dan nilainya bersifat re-assignable (dapat diubah kembali), sedangkan 'const' nilainya tidak dapat diubah.",
    tags: ["JavaScript", "Variables", "RPL"],
    createdAt: "2026-08-20T08:00:00Z",
    updatedAt: "2026-08-20T08:00:00Z",
  },
  {
    id: "SOAL-2026-0002",
    bankId: "BNK-2026-0001",
    type: "PGK",
    question: "Pilihlah tag HTML5 semantik berikut yang tepat digunakan untuk menyusun struktur dokumen web profesional! (Pilih lebih dari satu jawaban benar)",
    options: [
      { key: "A", text: "<header> untuk bagian kop/navigasi atas" },
      { key: "B", text: "<article> untuk konten independen/artikel" },
      { key: "C", text: "<blink> untuk membuat teks berkedip secara otomatis" },
      { key: "D", text: "<section> untuk pengelompokan tematik konten" },
      { key: "E", text: "<marquee> untuk menjalankan teks berjalan" },
    ],
    correctAnswer: ["A", "B", "D"],
    score: 15,
    difficulty: "Sedang",
    topic: "HTML5 Semantic Elements",
    learningObjective: "Mengidentifikasi tag semantik HTML5 standar W3C",
    explanation: "<header>, <article>, dan <section> adalah tag semantik resmi HTML5. Tag <blink> dan <marquee> sudah deprecated/usang dan dilarang digunakan.",
    tags: ["HTML5", "Frontend", "RPL"],
    createdAt: "2026-08-20T08:00:00Z",
    updatedAt: "2026-08-20T08:00:00Z",
  },
  {
    id: "SOAL-2026-0003",
    bankId: "BNK-2026-0001",
    type: "BENAR_SALAH",
    question: "Pada model basis data relasional, sebuah tabel hanya diperbolehkan memiliki satu Primary Key utama, namun dapat memiliki lebih dari satu Foreign Key yang merujuk ke tabel lain.",
    correctAnswer: "BENAR",
    score: 10,
    difficulty: "Mudah",
    topic: "Sistem Basis Data Relasional",
    learningObjective: "Memahami konsep kunci integritas basis data",
    explanation: "Pernyataan BENAR. Setiap relasi hanya memiliki satu Primary Key unik, namun dapat menampung multiple Foreign Key untuk menghubungkan relasi data.",
    tags: ["Database", "SQL", "RPL"],
    createdAt: "2026-08-20T08:00:00Z",
    updatedAt: "2026-08-20T08:00:00Z",
  },
  {
    id: "SOAL-2026-0004",
    bankId: "BNK-2026-0001",
    type: "PENJODOHAN",
    question: "Pasangkan istilah arsitektur komputer & jaringan berikut dengan fungsinya yang paling tepat!",
    pairs: [
      { premise: "HTTP Status 200", match: "Request berhasil diproses oleh server (OK)" },
      { premise: "HTTP Status 404", match: "Halaman/Resource tidak ditemukan di server" },
      { premise: "HTTP Status 500", match: "Internal Server Error pada pemrosesan backend" },
    ],
    correctAnswer: [
      { premise: "HTTP Status 200", match: "Request berhasil diproses oleh server (OK)" },
      { premise: "HTTP Status 404", match: "Halaman/Resource tidak ditemukan di server" },
      { premise: "HTTP Status 500", match: "Internal Server Error pada pemrosesan backend" },
    ],
    score: 20,
    difficulty: "Sedang",
    topic: "HTTP Protocol & Web Architecture",
    learningObjective: "Menguasai kode status HTTP dalam komunikasi klien-server",
    explanation: "200 = Success OK, 404 = Not Found, 500 = Internal Server Error.",
    tags: ["HTTP", "Networking", "Web"],
    createdAt: "2026-08-20T08:00:00Z",
    updatedAt: "2026-08-20T08:00:00Z",
  },
  {
    id: "SOAL-2026-0005",
    bankId: "BNK-2026-0001",
    type: "ISIAN",
    question: "Sebutkan nama sistem kontrol versi (Version Control System) terdistribusi paling populer yang diciptakan oleh Linus Torvalds dan digunakan secara luas di industri software!",
    correctAnswer: "Git",
    score: 15,
    difficulty: "Sedang",
    topic: "Version Control System",
    learningObjective: "Mengenal perangkat kolaborasi software development",
    explanation: "Kunci Jawaban: Git (atau GIT). Git adalah DVCS standar industri.",
    tags: ["Git", "VCS", "DevOps"],
    createdAt: "2026-08-20T08:00:00Z",
    updatedAt: "2026-08-20T08:00:00Z",
  },
  {
    id: "SOAL-2026-0006",
    bankId: "BNK-2026-0001",
    type: "PG",
    question: "Perhatikan cuplikan kode JavaScript asynchronous berikut:\n\nconsole.log('A');\nsetTimeout(() => console.log('B'), 0);\nPromise.resolve().then(() => console.log('C'));\nconsole.log('D');\n\nUrutan output yang tepat pada console browser adalah?",
    options: [
      { key: "A", text: "A, D, C, B" },
      { key: "B", text: "A, B, C, D" },
      { key: "C", text: "A, D, B, C" },
      { key: "D", text: "A, C, D, B" },
      { key: "E", text: "C, A, D, B" },
    ],
    correctAnswer: "A",
    score: 15,
    difficulty: "Sulit",
    topic: "JavaScript Event Loop & Microtask Queue",
    learningObjective: "Menganalisis alur eksekusi Event Loop dan Microtask vs Macrotask",
    explanation: "Call stack mengeksekusi sinkron (A lalu D). Microtask queue (Promise C) diproses sebelum Macrotask queue (setTimeout B). Maka urutan output adalah A, D, C, B.",
    tags: ["JavaScript", "EventLoop", "Advanced", "HOTS"],
    createdAt: "2026-08-20T08:00:00Z",
    updatedAt: "2026-08-20T08:00:00Z",
  },
  {
    id: "SOAL-2026-0007",
    bankId: "BNK-2026-0001",
    type: "PGK",
    question: "Manakah teknik optimasi performa basis data SQL berikut yang efektif untuk menangani query pada tabel dengan jutaan baris data? (Pilih lebih dari satu jawaban benar)",
    options: [
      { key: "A", text: "Membuat indeks B-Tree pada kolom yang sering digunakan di klausul WHERE dan JOIN" },
      { key: "B", text: "Menjalankan SELECT * pada setiap query tanpa membatasi kolom yang dibutuhkan" },
      { key: "C", text: "Menerapkan partisi tabel (Table Partitioning) berdasarkan rentang tanggal atau ID" },
      { key: "D", text: "Menggunakan Connection Pooling untuk mengurangi overhead pembukaan koneksi baru" },
      { key: "E", text: "Menghapus semua Foreign Key agar tidak terjadi pengecekan integritas referensial" },
    ],
    correctAnswer: ["A", "C", "D"],
    score: 20,
    difficulty: "Sulit",
    topic: "Optimasi Query & Arsitektur Database",
    learningObjective: "Mengevaluasi strategi skalabilitas dan indeksasi database",
    explanation: "Indeks B-Tree, Table Partitioning, dan Connection Pooling adalah strategi optimasi standar industri. SELECT * dan penghapusan constraint tanpa alasan justru membahayakan performa dan integritas data.",
    tags: ["SQL", "Performance", "Optimization", "HOTS"],
    createdAt: "2026-08-20T08:00:00Z",
    updatedAt: "2026-08-20T08:00:00Z",
  },
  {
    id: "SOAL-2026-0008",
    bankId: "BNK-2026-0001",
    type: "ISIAN",
    question: "Dalam prinsip clean code SOLID, huruf 'O' merujuk pada prinsip 'Open-Closed Principle' yang menyatakan bahwa sebuah entitas perangkat lunak harus 'open for extension, but closed for ...' (Tuliskan satu kata dalam bahasa Inggris)",
    correctAnswer: "modification",
    score: 15,
    difficulty: "Sulit",
    topic: "SOLID Design Principles",
    learningObjective: "Menguasai prinsip perancangan arsitektur berorientasi objek",
    explanation: "Open-Closed Principle: Open for extension (dapat diperluas), but closed for modification (tertutup untuk modifikasi kode sumber inti).",
    tags: ["SOLID", "CleanCode", "SoftwareEngineering", "HOTS"],
    createdAt: "2026-08-20T08:00:00Z",
    updatedAt: "2026-08-20T08:00:00Z",
  },
  {
    id: "SOAL-2026-0009",
    bankId: "BNK-2026-0001",
    type: "BENAR_SALAH",
    question: "Protokol HTTPS menggunakan enkripsi TLS/SSL pada port standar 443 untuk mengamankan data yang ditransmisikan antara browser dan web server dari serangan Man-In-The-Middle (MITM).",
    correctAnswer: "BENAR",
    score: 10,
    difficulty: "Mudah",
    topic: "Keamanan Jaringan & Web Security",
    learningObjective: "Memahami prinsip enkripsi protokol HTTPS",
    explanation: "BENAR. HTTPS berjalan pada port 443 dengan lapisan keamanan TLS/SSL.",
    tags: ["Security", "HTTPS", "Network"],
    createdAt: "2026-08-20T08:00:00Z",
    updatedAt: "2026-08-20T08:00:00Z",
  },
];

export const INITIAL_BANK_SOAL: BankSoal[] = [
  {
    id: "BNK-2026-0001",
    kode: "BNK-INF-X-2026",
    nama: "Bank Soal Informatika & Pemrograman Dasar X RPL",
    mapelId: "MPL-2026-0001",
    mapelNama: "Informatika & Pemrograman Dasar",
    tingkat: "X",
    jurusan: "Rekayasa Perangkat Lunak",
    guruId: "USR-2026-0001",
    guruNama: "Budi Santoso, S.Kom",
    totalSoal: 9,
    totalBobot: 125,
    soalList: INITIAL_QUESTIONS,
    createdAt: "2026-08-20T08:00:00Z",
  },
];

export const INITIAL_EXAMS: Ujian[] = [
  {
    id: "UJ-2026-0001",
    kode: "PAS-INF-X-2026",
    nama: "Penilaian Akhir Semester (PAS) - Informatika X",
    mapelId: "MPL-2026-0001",
    mapelNama: "Informatika & Pemrograman Dasar",
    kelasTarget: ["X-RPL-1", "X-TKJ-1"],
    guruId: "USR-2026-0001",
    guruNama: "Budi Santoso, S.Kom",
    tanggal: new Date().toISOString().split("T")[0],
    jamMulai: "07:30",
    jamSelesai: "12:00",
    durasiMenit: 60,
    jumlahSoal: 5,
    kkm: 75,
    randomSoal: true,
    randomJawaban: true,
    tampilkanNilai: true,
    tampilkanPembahasan: true,
    tokenGlobal: "CBT-XDKV-8261",
    bankSoalId: "BNK-2026-0001",
    difficultyMode: "ALL",
    difficultyDistribution: {
      mudahPercent: 40,
      sedangPercent: 40,
      sulitPercent: 20,
    },
    status: "AKTIF",
    sessions: [
      {
        id: "SES-2026-0001",
        nomorSesi: 1,
        nama: "Sesi 1 (Lab Komputer 1)",
        kapasitas: 30,
        waktuMulai: "07:30",
        waktuSelesai: "09:00",
        token: "CBT-XDKV-8261",
        status: "BERLANGSUNG",
      },
      {
        id: "SES-2026-0002",
        nomorSesi: 2,
        nama: "Sesi 2 (Lab Komputer 1)",
        kapasitas: 30,
        waktuMulai: "09:30",
        waktuSelesai: "11:00",
        token: "CBT-TKJ1-9420",
        status: "BELUM_MULAI",
      },
    ],
    createdAt: "2026-08-22T08:00:00Z",
  },
];

// Initial mock nilai
export const INITIAL_NILAI: NilaiSiswa[] = [
  {
    id: "NIL-2026-0001",
    examId: "UJ-2026-0001",
    examName: "Penilaian Akhir Semester (PAS) - Informatika X",
    studentId: "SIS-2026-1001",
    studentName: "Aditya Pratama",
    nisn: "0081234501",
    kelas: "X-RPL-1",
    sesi: "Sesi 1",
    nilaiPG: 10,
    nilaiPGK: 15,
    nilaiBenarSalah: 10,
    nilaiPenjodohan: 20,
    nilaiIsian: 15,
    nilaiTotal: 100,
    kkm: 75,
    isLulus: true,
    statusKoreksi: "OTOMATIS",
    nilaiAwal: 100,
    waktuMulai: "2026-08-26T07:30:00Z",
    waktuSubmit: "2026-08-26T08:15:00Z",
    tipeSubmit: "MANUAL",
    totalPelanggaran: 0,
  },
  {
    id: "NIL-2026-0002",
    examId: "UJ-2026-0001",
    examName: "Penilaian Akhir Semester (PAS) - Informatika X",
    studentId: "SIS-2026-1002",
    studentName: "Anisa Rahmawati",
    nisn: "0081234502",
    kelas: "X-RPL-1",
    sesi: "Sesi 1",
    nilaiPG: 10,
    nilaiPGK: 15,
    nilaiBenarSalah: 10,
    nilaiPenjodohan: 20,
    nilaiIsian: 10,
    nilaiTotal: 93,
    kkm: 75,
    isLulus: true,
    statusKoreksi: "OTOMATIS",
    nilaiAwal: 93,
    waktuMulai: "2026-08-26T07:30:00Z",
    waktuSubmit: "2026-08-26T08:20:00Z",
    tipeSubmit: "MANUAL",
    totalPelanggaran: 1,
  },
];

// Helper Functions untuk Local Storage
function getItem<T>(key: string, defaultVal: T): T {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
}

function setItem<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error("Storage error:", e);
  }
}

export const StorageService = {
  // Config
  getConfig: (): SchoolConfig => getItem(STORAGE_KEYS.CONFIG, INITIAL_SCHOOL_CONFIG),
  getSchoolConfig: (): SchoolConfig => getItem(STORAGE_KEYS.CONFIG, INITIAL_SCHOOL_CONFIG),
  saveConfig: (cfg: SchoolConfig) => setItem(STORAGE_KEYS.CONFIG, cfg),
  saveSchoolConfig: (cfg: SchoolConfig) => setItem(STORAGE_KEYS.CONFIG, cfg),

  // Auth
  getCurrentUser: (): User | null => {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
      if (val === "null") return null;
      if (val) return JSON.parse(val);
      return INITIAL_USERS[0];
    } catch {
      return INITIAL_USERS[0];
    }
  },
  setCurrentUser: (u: User | null) => setItem(STORAGE_KEYS.AUTH_USER, u),

  // Users & Students
  getUsers: (): User[] => getItem(STORAGE_KEYS.USERS, INITIAL_USERS),
  getStudents: (): User[] => {
    const users = getItem<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    return users.filter((u) => u.role === "SISWA");
  },
  saveUsers: (users: User[]) => setItem(STORAGE_KEYS.USERS, users),
  saveStudents: (students: User[]) => {
    const allUsers = getItem<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    const nonStudents = allUsers.filter((u) => u.role !== "SISWA");
    setItem(STORAGE_KEYS.USERS, [...nonStudents, ...students]);
  },
  addUser: (user: User) => {
    const list = StorageService.getUsers();
    list.push(user);
    StorageService.saveUsers(list);
    StorageService.logActivity(user.id, user.name, user.role, "CREATE_USER", "USER", `User baru: ${user.name}`);
  },

  // Classes
  getClasses: (): Kelas[] => getItem(STORAGE_KEYS.KELAS, INITIAL_CLASSES),
  saveClasses: (kls: Kelas[]) => setItem(STORAGE_KEYS.KELAS, kls),

  // Subjects
  getSubjects: (): Mapel[] => getItem(STORAGE_KEYS.MAPEL, INITIAL_MAPEL),
  saveSubjects: (mpl: Mapel[]) => setItem(STORAGE_KEYS.MAPEL, mpl),

  // Bank Soal
  getBankSoalList: (): BankSoal[] => getItem(STORAGE_KEYS.BANK_SOAL, INITIAL_BANK_SOAL),
  saveBankSoalList: (banks: BankSoal[]) => setItem(STORAGE_KEYS.BANK_SOAL, banks),
  getBankSoalById: (id: string): BankSoal | undefined => {
    return StorageService.getBankSoalList().find((b) => b.id === id);
  },
  saveBankSoal: (bank: BankSoal) => {
    const list = StorageService.getBankSoalList();
    const idx = list.findIndex((b) => b.id === bank.id);
    if (idx >= 0) {
      list[idx] = bank;
    } else {
      list.push(bank);
    }
    StorageService.saveBankSoalList(list);
  },

  // Exams
  getExams: (): Ujian[] => getItem(STORAGE_KEYS.UJIAN, INITIAL_EXAMS),
  saveExams: (exams: Ujian[]) => setItem(STORAGE_KEYS.UJIAN, exams),
  getExamById: (id: string): Ujian | undefined => {
    return StorageService.getExams().find((e) => e.id === id);
  },
  saveExam: (exam: Ujian) => {
    const list = StorageService.getExams();
    const idx = list.findIndex((e) => e.id === exam.id);
    if (idx >= 0) {
      list[idx] = exam;
    } else {
      list.push(exam);
    }
    StorageService.saveExams(list);
  },

  // Student Active Session State (Anti-Reset)
  getExamState: (examId: string, studentId: string): ExamSessionState | null => {
    const allStates: Record<string, ExamSessionState> = getItem(STORAGE_KEYS.ACTIVE_EXAM_STATES, {});
    const key = `${examId}_${studentId}`;
    return allStates[key] || null;
  },
  saveExamState: (state: ExamSessionState) => {
    const allStates: Record<string, ExamSessionState> = getItem(STORAGE_KEYS.ACTIVE_EXAM_STATES, {});
    const key = `${state.examId}_${state.studentId}`;
    allStates[key] = {
      ...state,
      lastActiveTimestamp: Date.now(),
    };
    setItem(STORAGE_KEYS.ACTIVE_EXAM_STATES, allStates);
  },
  clearExamState: (examId: string, studentId: string) => {
    const allStates: Record<string, ExamSessionState> = getItem(STORAGE_KEYS.ACTIVE_EXAM_STATES, {});
    const key = `${examId}_${studentId}`;
    delete allStates[key];
    setItem(STORAGE_KEYS.ACTIVE_EXAM_STATES, allStates);
  },

  // Nilai / Results
  getNilaiList: (): NilaiSiswa[] => getItem(STORAGE_KEYS.NILAI, INITIAL_NILAI),
  saveNilaiList: (list: NilaiSiswa[]) => setItem(STORAGE_KEYS.NILAI, list),
  addNilai: (item: NilaiSiswa) => {
    const list = StorageService.getNilaiList();
    const idx = list.findIndex((n) => n.id === item.id || (n.examId === item.examId && n.studentId === item.studentId));
    if (idx >= 0) {
      list[idx] = item;
    } else {
      list.push(item);
    }
    StorageService.saveNilaiList(list);
  },

  // Pelanggaran / Anti-Cheat
  getPelanggaranList: (): PelanggaranLog[] => getItem(STORAGE_KEYS.PELANGGARAN, []),
  recordPelanggaran: (log: PelanggaranLog) => {
    const list = StorageService.getPelanggaranList();
    list.unshift(log);
    setItem(STORAGE_KEYS.PELANGGARAN, list);
    StorageService.logActivity(log.studentId, log.studentName, "SISWA", "PELANGGARAN", "ANTI_CHEAT", `${log.jenis}: ${log.keterangan}`);
  },

  // System Logs
  getLogs: (): SystemLog[] => getItem(STORAGE_KEYS.LOGS, [
    {
      id: "LOG-2026-0001",
      timestamp: new Date().toISOString(),
      userId: "USR-2026-0001",
      userName: "Budi Santoso, S.Kom",
      role: "GURU",
      aktivitas: "INIT_SYSTEM",
      modul: "SETUP",
      detail: "Sistem CBT SMK berhasil diinisialisasi",
      ipSession: "192.168.1.10",
    }
  ]),
  logActivity: (
    userId: string,
    userName: string,
    role: any,
    aktivitas: string,
    modul: string,
    detail: string
  ) => {
    const logs = StorageService.getLogs();
    const newLog: SystemLog = {
      id: `LOG-2026-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      userId,
      userName,
      role,
      aktivitas,
      modul,
      detail,
      ipSession: "SESSION-WEB",
    };
    logs.unshift(newLog);
    if (logs.length > 500) logs.pop();
    setItem(STORAGE_KEYS.LOGS, logs);
  },

  // Theme Preference
  getThemePreference: (): boolean => {
    try {
      const saved = localStorage.getItem("cbt_dark_mode");
      if (saved !== null) {
        return saved === "true";
      }
      return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch {
      return false;
    }
  },
  setThemePreference: (isDark: boolean) => {
    try {
      localStorage.setItem("cbt_dark_mode", String(isDark));
    } catch (e) {
      console.warn("Could not save theme preference", e);
    }
  },

  // Reset to default
  resetToFactoryDefaults: () => {
    localStorage.clear();
    window.location.reload();
  },
  resetDatabase: () => {
    localStorage.clear();
    window.location.reload();
  },
};
