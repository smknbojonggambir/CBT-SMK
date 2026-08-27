// Types for CBT SMK Profesional

export type Role = "GURU" | "SISWA" | "ADMIN";

export type QuestionType = "PG" | "PGK" | "BENAR_SALAH" | "PENJODOHAN" | "ISIAN";

export type DifficultyLevel = "Mudah" | "Sedang" | "Sulit" | "Easy" | "Medium" | "Hard";

export type DifficultyFilterMode =
  | "ALL"
  | "MUDAH_ONLY"
  | "SEDANG_ONLY"
  | "SULIT_ONLY"
  | "CUSTOM_DISTRIBUTION";

export interface DifficultyDistribution {
  mudahPercent: number; // e.g. 30 (%)
  sedangPercent: number; // e.g. 50 (%)
  sulitPercent: number; // e.g. 20 (%)
}

export type ExamStatus = "DRAFT" | "AKTIF" | "SELESAI" | "ARSIP";

export type StudentExamStatus =
  | "BELUM_MULAI"
  | "SEDANG_MENGERJAKAN"
  | "TERPUTUS_SEMENTARA"
  | "SELESAI_SUBMIT"
  | "AUTO_SUBMIT"
  | "DISKUALIFIKASI";

export interface User {
  id: string; // USR-2026-0001
  username: string;
  name: string;
  email?: string;
  role: Role;
  nisn?: string;
  nip?: string;
  kelasId?: string;
  jurusan?: string;
  avatar?: string;
  isActive: boolean;
}

export interface Kelas {
  id: string; // KLS-2026-0001
  kode: string; // X-RPL-1
  nama: string; // X Rekayasa Perangkat Lunak 1
  tingkat: "X" | "XI" | "XII";
  jurusan: string; // RPL, TKJ, DKV, TBSM, TKRO, AKL, OTKP
  waliKelas?: string;
  jumlahSiswa: number;
}

export interface Mapel {
  id: string; // MPL-2026-0001
  kode: string; // INF-X
  nama: string; // Informatika
  jurusan?: string; // Umum / Kejuruan
  kkm: number; // 75
}

export interface QuestionOption {
  key: string; // "A", "B", "C", "D", "E"
  text: string;
  image?: string;
}

export interface MatchPair {
  premise: string; // Kolom kiri
  match: string; // Kolom kanan
}

export interface Question {
  id: string; // SOAL-2026-0001
  bankId: string; // BNK-2026-0001
  type: QuestionType;
  question: string;
  mediaType?: "none" | "image" | "video" | "youtube";
  mediaUrl?: string;
  options?: QuestionOption[]; // Untuk PG & PGK
  correctAnswer: any; // PG: "A", PGK: ["A", "C"], BENAR_SALAH: "BENAR" | "SALAH", PENJODOHAN: MatchPair[], ISIAN: string
  pairs?: MatchPair[]; // Untuk Penjodohan
  score: number; // Bobot nilai (cth: 10)
  difficulty: DifficultyLevel;
  topic: string; // Materi
  learningObjective?: string; // Tujuan pembelajaran
  explanation?: string; // Pembahasan soal
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BankSoal {
  id: string; // BNK-2026-0001
  kode: string; // BNK-INF-X-2026
  nama: string; // Bank Soal Pemrograman Dasar X RPL
  mapelId: string;
  mapelNama: string;
  tingkat: "X" | "XI" | "XII";
  jurusan: string;
  guruId: string;
  guruNama: string;
  totalSoal: number;
  totalBobot: number;
  soalList: Question[];
  createdAt: string;
}

export interface ExamSession {
  id: string; // SES-2026-0001
  nama: string; // Sesi 1
  nomorSesi: number;
  kapasitas: number; // Cth: 30 siswa
  waktuMulai: string; // ISO string / time
  waktuSelesai: string;
  token: string; // CBT-XDKV-8261
  status: "BELUM_MULAI" | "BERLANGSUNG" | "SELESAI";
  pesertaIds?: string[]; // Jika peserta dialokasikan ke sesi ini
}

export interface Ujian {
  id: string; // UJ-2026-0001
  kode: string; // PAS-GENAP-2026-INF
  nama: string; // Penilaian Akhir Semester - Informatika X
  mapelId: string;
  mapelNama: string;
  kelasTarget: string[]; // ["X-RPL-1", "X-RPL-2"]
  guruId: string;
  guruNama: string;
  tanggal: string; // YYYY-MM-DD
  jamMulai: string; // HH:mm
  jamSelesai: string; // HH:mm
  durasiMenit: number; // 90 menit
  jumlahSoal: number;
  kkm: number; // 75
  randomSoal: boolean;
  randomJawaban: boolean;
  tampilkanNilai: boolean;
  tampilkanPembahasan: boolean;
  tokenGlobal?: string;
  sessions: ExamSession[];
  status: ExamStatus;
  bankSoalId: string;
  difficultyMode?: DifficultyFilterMode; // "ALL" | "MUDAH_ONLY" | "SEDANG_ONLY" | "SULIT_ONLY" | "CUSTOM_DISTRIBUTION"
  difficultyDistribution?: DifficultyDistribution; // { mudahPercent: 30, sedangPercent: 50, sulitPercent: 20 }
  createdAt: string;
}

export interface StudentAnswer {
  questionId: string;
  type: QuestionType;
  answer: any; // "A" | ["A", "C"] | "BENAR" | MatchPair[] | "teks isian"
  isFlagged?: boolean; // Ragu-ragu
  scoreAwarded?: number;
  isCorrect?: boolean;
  gradedBy?: string;
  gradeComment?: string;
  timestamp: string;
}

export interface AuditKoreksiLog {
  guruId: string;
  guruNama: string;
  nilaiLama: number;
  nilaiBaru: number;
  catatan: string;
  timestamp: string;
}

export interface ExamSessionState {
  examId: string;
  studentId: string;
  sessionId?: string;
  tokenUsed?: string;
  serverStartTime: number; // Timestamp ms
  serverEndTime: number; // Timestamp ms
  durationMinutes: number;
  currentIndex?: number;
  currentQuestionIndex?: number;
  answers: Record<string, any>; // key: questionId
  flagged?: Record<string, boolean>;
  status: StudentExamStatus | string;
  lastActiveTimestamp: number;
  questionOrder?: string[]; // Order of question IDs for this student (if randomized)
  violationCount?: number;
  violationsCount?: number;
  scoreFinal?: number;
  isAutoSubmitted?: boolean;
}

export interface PelanggaranLog {
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  kelas?: string;
  jenis: "PINDAH_TAB" | "KELUAR_HALAMAN" | "REFRESH" | "LOGIN_GANDA" | "RECONNECT" | "DEVTOOLS_KEY" | "BLUR_WINDOW" | "DEVTOOLS_ATTEMPT" | string;
  keterangan: string;
  timestamp?: string;
  waktu?: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  role: Role | string;
  aktivitas: string;
  modul: string;
  detail: string;
  ipSession?: string;
}

export interface NilaiSiswa {
  id: string; // NIL-2026-0001
  examId: string;
  examName: string;
  studentId: string;
  studentName: string;
  nisn: string;
  kelas: string;
  sesi: string;
  nilaiPG: number;
  nilaiPGK: number;
  nilaiBenarSalah: number;
  nilaiPenjodohan: number;
  nilaiIsian: number;
  nilaiTotal: number;
  kkm: number;
  isLulus: boolean;
  statusKoreksi: "OTOMATIS" | "SELESAI_KOREKSI_MANUAL" | "PERLU_KOREKSI_ISIAN" | "MANUAL_TERVERIFIKASI" | string;
  nilaiAwal: number;
  nilaiKoreksi?: number;
  guruKorektor?: string;
  catatanGuru?: string;
  timestampKoreksi?: string;
  waktuMulai: string;
  waktuSubmit: string;
  tipeSubmit: "MANUAL" | "AUTO_SUBMIT" | "AUTO_TIMEOUT" | "FORCE_PENGAWAS" | string;
  totalPelanggaran: number;
  answersSummary?: Record<string, any>;
  riwayatKoreksi?: AuditKoreksiLog[];
}

export interface BeritaAcara {
  id: string; // BA-2026-0001
  examId: string;
  examName: string;
  namaSekolah: string;
  mapel: string;
  kelas: string;
  sesi: string;
  tanggal: string;
  jamMulai: string;
  jamSelesai: string;
  jumlahDaftar: number;
  jumlahHadir: number;
  jumlahTidakHadir: number;
  siswaTidakHadir: string[];
  guruPengawas: string;
  nipPengawas?: string;
  catatanKejadian: string;
  createdAt: string;
}

export interface SchoolConfig {
  namaSekolah: string;
  npsn: string;
  alamat: string;
  kabupatenKota: string;
  provinsi: string;
  kepalaSekolah: string;
  nipKepalaSekolah: string;
  tahunAjaran: string;
  semester: "Ganjil" | "Genap";
  logoUrl?: string;
  gasWebAppUrl?: string; // Google Apps Script URL
  useRealGasBackend: boolean;
}
