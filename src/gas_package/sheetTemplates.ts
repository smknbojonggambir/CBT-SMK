/**
 * Definisi 18 Sheet Google Sheets dan Template CSV/Spreadsheet
 */

export interface SheetDefinition {
  name: string;
  description: string;
  headers: string[];
  sampleRow: any[];
}

export const SHEETS_18_DATABASE: SheetDefinition[] = [
  {
    name: "CONFIG",
    description: "Pengaturan umum instansi sekolah, nama kepala sekolah, NPSN, tahun ajaran aktif.",
    headers: ["Key", "Value", "Keterangan", "UpdatedAt"],
    sampleRow: ["NAMA_SEKOLAH", "SMK NEGERI 1 INDONESIA", "Nama resmi sekolah", "2026-08-26T00:00:00Z"],
  },
  {
    name: "USERS",
    description: "Tabel kredensial login akun Guru dan Administrator pengawas ujian.",
    headers: ["id", "username", "password_hash", "name", "role", "email", "isActive", "createdAt"],
    sampleRow: ["USR-2026-0001", "guru_rpl", "123456", "Budi Santoso, S.Kom", "GURU", "budi@guru.smk.belajar.id", true, "2026-08-26T00:00:00Z"],
  },
  {
    name: "GURU",
    description: "Data profil guru pengampu mata pelajaran dan pengawas ujian.",
    headers: ["id", "nip", "name", "email", "mapelAjar", "noHp", "createdAt"],
    sampleRow: ["GUR-2026-0001", "198501152010011012", "Budi Santoso, S.Kom", "budi@guru.smk.belajar.id", "Informatika / RPL", "081234567890", "2026-08-26T00:00:00Z"],
  },
  {
    name: "SISWA",
    description: "Daftar peserta didik SMK beserta NISN, NIS, kelas, dan kompetensi keahlian.",
    headers: ["id", "nisn", "nis", "name", "kelasId", "kelasKode", "jurusan", "isActive", "createdAt"],
    sampleRow: ["SIS-2026-0001", "0081234567", "20260101", "Aditya Pratama", "KLS-2026-0001", "X-RPL-1", "Rekayasa Perangkat Lunak", true, "2026-08-26T00:00:00Z"],
  },
  {
    name: "KELAS",
    description: "Data rombongan belajar (rombel) dan wali kelas.",
    headers: ["id", "kode", "nama", "tingkat", "jurusan", "waliKelas", "createdAt"],
    sampleRow: ["KLS-2026-0001", "X-RPL-1", "X Rekayasa Perangkat Lunak 1", "X", "RPL", "Budi Santoso, S.Kom", "2026-08-26T00:00:00Z"],
  },
  {
    name: "MAPEL",
    description: "Daftar mata pelajaran umum dan kejuruan SMK beserta standar KKM.",
    headers: ["id", "kode", "nama", "kkm", "jurusan", "createdAt"],
    sampleRow: ["MPL-2026-0001", "INF-X", "Informatika & Pemrograman Dasar", 75, "RPL", "2026-08-26T00:00:00Z"],
  },
  {
    name: "JADWAL",
    description: "Jadwal alokasi ruang ujian, sesi, dan pengawas lab.",
    headers: ["id", "ujianId", "sesiId", "tanggal", "jamMulai", "jamSelesai", "ruang", "pengawasId"],
    sampleRow: ["JAD-2026-0001", "UJ-2026-0001", "SES-2026-0001", "2026-08-28", "07:30", "09:00", "Lab Komputer 1", "USR-2026-0001"],
  },
  {
    name: "BANK_SOAL",
    description: "Koleksi bank soal yang disusun oleh guru mata pelajaran.",
    headers: ["id", "kode", "nama", "mapelId", "tingkat", "jurusan", "guruId", "totalSoal", "createdAt"],
    sampleRow: ["BNK-2026-0001", "BNK-INF-X", "Bank Soal Pemrograman Dasar X RPL", "MPL-2026-0001", "X", "RPL", "USR-2026-0001", 30, "2026-08-26T00:00:00Z"],
  },
  {
    name: "PILIHAN_SOAL",
    description: "Butir soal 5 model (PG, PGK, Benar-Salah, Penjodohan, Isian) beserta media dan kunci jawaban.",
    headers: ["id", "bankId", "type", "question", "mediaType", "mediaUrl", "optionsJson", "correctAnswer", "pairsJson", "score", "difficulty", "topic", "learningObjective", "explanation", "tags", "createdAt"],
    sampleRow: ["SOAL-2026-0001", "BNK-2026-0001", "PG", "Manakah sintaks yang benar untuk mendeklarasikan variabel di JavaScript?", "none", "", '[{"key":"A","text":"let x = 10;"},{"key":"B","text":"variable x = 10;"},{"key":"C","text":"v x = 10;"},{"key":"D","text":"dim x as integer"}]', "A", "[]", 10, "Sedang", "Variabel JS", "Mampu menulis variabel", "Keyword let digunakan pada ES6", '["JS","Dasar"]', "2026-08-26T00:00:00Z"],
  },
  {
    name: "UJIAN",
    description: "Paket ujian CBT, durasi, KKM, setting pengacakan, dan konfigurasi sesi.",
    headers: ["id", "kode", "nama", "mapelId", "kelasTargetJson", "guruId", "tanggal", "jamMulai", "jamSelesai", "durasiMenit", "jumlahSoal", "kkm", "randomSoal", "randomJawaban", "tampilkanNilai", "tampilkanPembahasan", "sessionsJson", "status", "bankSoalId", "createdAt"],
    sampleRow: ["UJ-2026-0001", "PAS-INF-X", "Penilaian Akhir Semester - Informatika X", "MPL-2026-0001", '["X-RPL-1"]', "USR-2026-0001", "2026-08-28", "07:30", "12:00", 90, 25, 75, true, true, true, false, '[{"id":"SES-1","nama":"Sesi 1","kapasitas":30,"token":"CBT-XDKV-8261"}]', "AKTIF", "BNK-2026-0001", "2026-08-26T00:00:00Z"],
  },
  {
    name: "PESERTA_UJIAN",
    description: "Status keikutsertaan siswa di ruang ujian secara realtime.",
    headers: ["id", "ujianId", "sesiId", "siswaId", "nisn", "namaSiswa", "kelas", "status", "serverStartTime", "serverEndTime", "scoreFinal", "isAutoSubmitted"],
    sampleRow: ["PS-2026-0001", "UJ-2026-0001", "SES-1", "SIS-2026-0001", "0081234567", "Aditya Pratama", "X-RPL-1", "SEDANG_MENGERJAKAN", 1724716800000, 1724722200000, null, false],
  },
  {
    name: "TOKEN",
    description: "Daftar token ujian aktif per sesi dan masa berlaku.",
    headers: ["id", "tokenCode", "ujianId", "sesiId", "validUntil", "isUsed", "createdAt"],
    sampleRow: ["TOK-2026-0001", "CBT-XDKV-8261", "UJ-2026-0001", "SES-1", "2026-08-28T12:00:00Z", false, "2026-08-26T00:00:00Z"],
  },
  {
    name: "JAWABAN",
    description: "Rekaman autosave jawaban siswa per butir soal (anti-reset).",
    headers: ["id", "ujianId", "siswaId", "sesiId", "questionId", "type", "answerJson", "isFlagged", "scoreAwarded", "isCorrect", "timestamp"],
    sampleRow: ["ANS-2026-0001", "UJ-2026-0001", "SIS-2026-0001", "SES-1", "SOAL-2026-0001", "PG", '"A"', false, 10, true, "2026-08-26T08:15:30Z"],
  },
  {
    name: "NILAI",
    description: "Hasil penilaian akhir ujian siswa, breakdown nilai tiap model soal, dan status kelulusan KKM.",
    headers: ["id", "ujianId", "siswaId", "nisn", "namaSiswa", "kelas", "sesi", "nilaiPG", "nilaiPGK", "nilaiBS", "nilaiJodoh", "nilaiIsian", "nilaiTotal", "kkm", "isLulus", "statusKoreksi", "nilaiAwal", "nilaiKoreksi", "guruKorektor", "timestampKoreksi", "waktuSubmit", "tipeSubmit"],
    sampleRow: ["NIL-2026-0001", "UJ-2026-0001", "SIS-2026-0001", "0081234567", "Aditya Pratama", "X-RPL-1", "Sesi 1", 40, 20, 10, 15, 10, 95, 75, true, "OTOMATIS", 95, 95, "SISTEM", "", "2026-08-28T09:00:00Z", "MANUAL"],
  },
  {
    name: "PELANGGARAN",
    description: "Catatan pelanggaran kecurangan ujian (pindah tab, keluar layar, devtools).",
    headers: ["id", "ujianId", "siswaId", "siswaNama", "kelas", "jenis", "keterangan", "timestamp"],
    sampleRow: ["PLG-2026-0001", "UJ-2026-0001", "SIS-2026-0001", "Aditya Pratama", "X-RPL-1", "PINDAH_TAB", "Meninggalkan tab ujian selama 4 detik", "2026-08-28T08:22:15Z"],
  },
  {
    name: "LOG_SYSTEM",
    description: "Audit trail pencatatan seluruh aktivitas sistem CBT.",
    headers: ["id", "timestamp", "userId", "userName", "role", "aktivitas", "modul", "detail", "ipSession"],
    sampleRow: ["LOG-2026-0001", "2026-08-26T08:00:00Z", "USR-2026-0001", "Budi Santoso", "GURU", "LOGIN", "AUTH", "Login berhasil", "192.168.1.50"],
  },
  {
    name: "HASIL_ANALISIS",
    description: "Analisis butir soal, tingkat kesukaran (P-value), dan daya pembeda (D-value).",
    headers: ["id", "ujianId", "questionId", "tingkatKesukaran", "dayaPembeda", "persenBenar", "persenSalah", "keterangan", "updatedAt"],
    sampleRow: ["ANL-2026-0001", "UJ-2026-0001", "SOAL-2026-0001", "Sedang (0.65)", "Baik (0.42)", 65, 35, "Soal memiliki daya beda yang valid", "2026-08-28T10:00:00Z"],
  },
  {
    name: "BERITA_ACARA",
    description: "Dokumen berita acara resmi pelaksanaan ujian pengawas SMK.",
    headers: ["id", "ujianId", "namaSekolah", "mapel", "kelas", "sesi", "tanggal", "jamMulai", "jamSelesai", "jumlahDaftar", "jumlahHadir", "jumlahTidakHadir", "siswaTidakHadirJson", "guruPengawas", "nipPengawas", "catatanKejadian", "createdAt"],
    sampleRow: ["BA-2026-0001", "UJ-2026-0001", "SMK NEGERI 1 INDONESIA", "Informatika X", "X-RPL-1", "Sesi 1", "2026-08-28", "07:30", "09:00", 30, 30, 0, "[]", "Budi Santoso, S.Kom", "198501152010011012", "Ujian berlangsung tertib dan lancar tanpa kendala teknis.", "2026-08-28T09:10:00Z"],
  }
];

export const CSV_IMPORT_SOAL_TEMPLATE = `Tipe,Pertanyaan,OpsiA,OpsiB,OpsiC,OpsiD,OpsiE,KunciJawaban,Bobot,TingkatKesulitan,Materi,Pembahasan
PG,"Komponen komputer yang berfungsi sebagai otak pemroses instruksi data adalah?","CPU / Processor","RAM","Harddisk","Power Supply","Keyboard","A",10,"Mudah","Arsitektur Komputer","CPU (Central Processing Unit) merupakan otak utama pemroses data pada sistem komputer."
PGK,"Manakah di antara protokol berikut yang beroperasi pada Application Layer dalam model TCP/IP? (Pilih lebih dari satu)","HTTP","DNS","IP","SMTP","Ethernet","A;B;D",15,"Sedang","Jaringan Komputer","HTTP, DNS, dan SMTP berada pada layer aplikasi, sedangkan IP pada layer internet/network."
BENAR_SALAH,"Sistem operasi Linux bersifat Open Source dan bebas dimodifikasi oleh siapa saja.","","","","","","BENAR",10,"Mudah","Sistem Operasi","Linux didistribusikan di bawah lisensi GNU GPL yang bersifat open source."
PENJODOHAN,"Pasangkan perangkat jaringan dengan fungsinya: [Router = Menghubungkan jaringan berbeda subnet] ; [Switch = Menghubungkan perangkat dalam LAN] ; [Access Point = Memancarkan sinyal WiFi nirkabel]","","","","","","Router:Menghubungkan jaringan berbeda subnet;Switch:Menghubungkan perangkat dalam LAN;Access Point:Memancarkan sinyal WiFi nirkabel",20,"Sedang","Jaringan Komputer","Pasangan perangkat jaringan dan fungsinya sesuai standar kurikulum TKJ."
ISIAN,"Sebutkan nama port standar yang digunakan oleh protokol HTTP!","","","","","","80",10,"Mudah","Protokol Jaringan","Port standar HTTP adalah 80, sedangkan HTTPS adalah 443."
`;

export const CSV_IMPORT_SISWA_TEMPLATE = `NISN,NIS,Nama,KelasKode,Jurusan
0081234501,260101,Ahmad Fauzi,X-RPL-1,Rekayasa Perangkat Lunak
0081234502,260102,Anisa Rahmawati,X-RPL-1,Rekayasa Perangkat Lunak
0081234503,260103,Bayu Saputra,X-RPL-1,Rekayasa Perangkat Lunak
0081234504,260104,Citra Lestari,X-RPL-1,Rekayasa Perangkat Lunak
0081234505,260105,Dimas Pratama,X-RPL-1,Rekayasa Perangkat Lunak
0081234506,260106,Eka Nurul Hidayah,X-RPL-1,Rekayasa Perangkat Lunak
0081234507,260107,Fajar Nugraha,X-RPL-1,Rekayasa Perangkat Lunak
0081234508,260108,Gita Permata,X-RPL-1,Rekayasa Perangkat Lunak
0081234509,260109,Hadi Prasetyo,X-RPL-1,Rekayasa Perangkat Lunak
0081234510,260110,Indah Puspitasari,X-RPL-1,Rekayasa Perangkat Lunak
0081234511,260111,Joko Susilo,X-RPL-1,Rekayasa Perangkat Lunak
0081234512,260112,Kartika Putri,X-RPL-1,Rekayasa Perangkat Lunak
0081234513,260113,Lukman Hakim,X-RPL-1,Rekayasa Perangkat Lunak
0081234514,260114,Mega Utami,X-RPL-1,Rekayasa Perangkat Lunak
0081234515,260115,Naufal Azhar,X-RPL-1,Rekayasa Perangkat Lunak
0081234516,260116,Oki Setiawan,X-RPL-1,Rekayasa Perangkat Lunak
0081234517,260117,Putri Anggraini,X-RPL-1,Rekayasa Perangkat Lunak
0081234518,260118,Rian Hidayat,X-RPL-1,Rekayasa Perangkat Lunak
0081234519,260119,Siti Nurhaliza,X-RPL-1,Rekayasa Perangkat Lunak
0081234520,260120,Teguh Wibowo,X-RPL-1,Rekayasa Perangkat Lunak
0081234521,260121,Umar Bakri,X-RPL-1,Rekayasa Perangkat Lunak
0081234522,260122,Vina Panduwinata,X-RPL-1,Rekayasa Perangkat Lunak
0081234523,260123,Wahyu Ramadhan,X-RPL-1,Rekayasa Perangkat Lunak
0081234524,260124,Xavier Hendra,X-RPL-1,Rekayasa Perangkat Lunak
0081234525,260125,Yoga Pratama,X-RPL-1,Rekayasa Perangkat Lunak
0081234526,260126,Zahra Amelia,X-RPL-1,Rekayasa Perangkat Lunak
0081234527,260127,Bambang Pamungkas,X-RPL-1,Rekayasa Perangkat Lunak
0081234528,260128,Dewi Sartika,X-RPL-1,Rekayasa Perangkat Lunak
0081234529,260129,Farhan Maulana,X-RPL-1,Rekayasa Perangkat Lunak
0081234530,260130,Halimah Tusyadiah,X-RPL-1,Rekayasa Perangkat Lunak
`;
