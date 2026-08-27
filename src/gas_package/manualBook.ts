/**
 * Panduan Lengkap Manual Book CBT SMK (Bagian A - V)
 * Serta Panduan Custom Domain Sekolah Tanpa VPS Berbayar
 */

export const MANUAL_BOOK_MARKDOWN = `# BUKU PANDUAN LENGKAP & MANUAL OPERASIONAL CBT SMK
**Sistem Ujian Berbasis Komputer (CBT) Profesional untuk SMK**
*Database: Google Sheets | Backend: Google Apps Script Web App | Frontend: HTML5/Tailwind/React*
*Tagline: Aman, Ringan, Gratis Tanpa Langganan. 30 Siswa Serempak, Lebih Banyak Pakai Session. Tinggal Deploy, Gassss! 🚀*

---

## DAFTAR ISI
1. [BAGIAN A: Instalasi & Kebutuhan Sistem](#bagian-a-instalasi--kebutuhan-sistem)
2. [BAGIAN B: Membuat Google Spreadsheet Database](#bagian-b-membuat-google-spreadsheet-database)
3. [BAGIAN C: Membuat Proyek Google Apps Script](#bagian-c-membuat-proyek-google-apps-script)
4. [BAGIAN D: Memasukkan 14 File .gs](#bagian-d-memasukkan-14-file-gs)
5. [BAGIAN E: Memasukkan 16 File .html](#bagian-e-memasukkan-16-file-html)
6. [BAGIAN F: Menjalankan setupDatabase()](#bagian-f-menjalankan-setupdatabase)
7. [BAGIAN G: Konfigurasi Akun Guru & Pengawas](#bagian-g-konfigurasi-akun-guru--pengawas)
8. [BAGIAN H: Deployment Web App Google Apps Script](#bagian-h-deployment-web-app-google-apps-script)
9. [BAGIAN I: Panduan Custom Domain Sekolah (cbt.sekolah.sch.id)](#bagian-i-panduan-custom-domain-sekolah)
10. [BAGIAN J: Manajemen Siswa & Import NISN Massal](#bagian-j-manajemen-siswa--import-nisn-massal)
11. [BAGIAN K: Manajemen Rombel & Kelas](#bagian-k-manajemen-rombel--kelas)
12. [BAGIAN L: Manajemen Bank Soal (5 Model Soal)](#bagian-l-manajemen-bank-soal-5-model-soal)
13. [BAGIAN M: Manajemen Jadwal Ujian & Parameter KKM](#bagian-m-manajemen-jadwal-ujian--parameter-kkm)
14. [BAGIAN N: Session Mode (Optimasi 30 Siswa Serempak)](#bagian-n-session-mode-optimasi-30-siswa-serempak)
15. [BAGIAN O: Manajemen Token CBT](#bagian-o-manajemen-token-cbt)
16. [BAGIAN P: Pelaksanaan Ujian Siswa (Anti-Reset & Autosave)](#bagian-p-pelaksanaan-ujian-siswa)
17. [BAGIAN Q: Live Monitoring Guru & Penanganan Pelanggaran](#bagian-q-live-monitoring-guru)
18. [BAGIAN R: Koreksi Otomatis & Penilaian Manual Isian](#bagian-r-koreksi-otomatis--penilaian-manual-isian)
19. [BAGIAN S: Analisis Butir Soal & Tingkat Kesukaran](#bagian-s-analisis-butir-soal--tingkat-kesukaran)
20. [BAGIAN T: Cetak Kartu Peserta, Berita Acara & Rekap Nilai](#bagian-t-cetak-kartu-peserta-berita-acara--rekap-nilai)
21. [BAGIAN U: Mode Darurat Offline (Cetak Naskah Kertas) & Backup](#bagian-u-mode-darurat-offline-dan-backup)
22. [BAGIAN V: Troubleshooting & Optimalisasi Quota Google](#bagian-v-troubleshooting--optimalisasi-quota-google)

---

### BAGIAN A: Instalasi & Kebutuhan Sistem
Aplikasi CBT SMK dirancang dengan prinsip **Zero Server Cost** (tanpa perlu sewa VPS bulanan).
- **Akun Google**: Akun Google biasa (Gmail) atau Google Workspace for Education (\`@guru.smk.belajar.id\` / \`@sekolah.sch.id\`).
- **Browser Klien (Siswa & Guru)**: Google Chrome, Microsoft Edge, Mozilla Firefox, atau Safari versi terbaru pada Komputer PC Lab, Laptop, Tablet, maupun Smartphone Android/iOS.
- **Koneksi Jaringan**: Jaringan Lab Sekolah (WiFi/LAN) dengan bandwidth minimal 512 Kbps per siswa (sangat ringan karena data soal dan jawaban dibatch secara efisien).

---

### BAGIAN B: Membuat Google Spreadsheet Database
1. Buka [Google Spreadsheet](https://sheets.new) di browser Anda.
2. Beri nama file: \`DATABASE_CBT_SMK_2026\`.
3. Salin **Spreadsheet ID** dari URL browser:
   \`https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID_ANDA]/edit\`
4. Simpan Spreadsheet ID ini untuk konfigurasi.

---

### BAGIAN C: Membuat Proyek Google Apps Script
1. Pada Spreadsheet yang baru dibuat, klik menu **Ekstensi (Extensions)** > **Apps Script**.
2. Beri nama proyek: \`BACKEND_CBT_SMK\`.

---

### BAGIAN D: Memasukkan 14 File .gs
Buat file Script (\`.gs\`) satu per satu di Apps Script Editor dengan mengklik ikon **+** di samping Files > **Script**:
1. \`01_Config.gs\`
2. \`02_Database.gs\`
3. \`03_Auth.gs\`
4. \`04_User.gs\`
5. \`05_Siswa.gs\`
6. \`06_Kelas.gs\`
7. \`07_BankSoal.gs\`
8. \`08_Ujian.gs\`
9. \`09_TokenSession.gs\`
10. \`10_Jawaban.gs\`
11. \`11_Penilaian.gs\`
12. \`12_Monitoring.gs\`
13. \`13_LogSystem.gs\`
14. \`14_Laporan.gs\`

*(Seluruh kode sumber 14 file ini telah disediakan lengkap pada menu Deployment Hub di aplikasi ini dan dapat dicopy atau diunduh sebagai ZIP dalam satu klik).*

---

### BAGIAN E: Memasukkan 16 File .html
Buat file HTML satu per satu di Apps Script Editor dengan mengklik ikon **+** > **HTML**:
1. \`Index.html\`
2. \`Login.html\`
3. \`DashboardGuru.html\`
4. \`DashboardSiswa.html\`
5. \`Layout.html\`
6. \`Navbar.html\`
7. \`Sidebar.html\`
8. \`BankSoal.html\`
9. \`FormSoal.html\`
10. \`Ujian.html\`
11. \`Exam.html\`
12. \`Monitoring.html\`
13. \`Nilai.html\`
14. \`Laporan.html\`
15. \`Print.html\`
16. \`Style.html\`

---

### BAGIAN F: Menjalankan setupDatabase()
1. Pada editor Apps Script, pilih file \`02_Database.gs\`.
2. Di toolbar atas, pilih fungsi \`setupDatabase\` lalu klik **Run (Jalankan)**.
3. Berikan izin akses (Review Permissions) ke akun Google Anda.
4. Buka kembali Google Spreadsheet Anda: 18 Sheet (\`CONFIG\`, \`USERS\`, \`GURU\`, \`SISWA\`, \`KELAS\`, \`MAPEL\`, \`JADWAL\`, \`BANK_SOAL\`, \`PILIHAN_SOAL\`, \`UJIAN\`, \`PESERTA_UJIAN\`, \`TOKEN\`, \`JAWABAN\`, \`NILAI\`, \`PELANGGARAN\`, \`LOG_SYSTEM\`, \`HASIL_ANALISIS\`, \`BERITA_ACARA\`) telah dibuat otomatis dengan header profesional!

---

### BAGIAN G: Konfigurasi Akun Guru & Pengawas
Di sheet \`USERS\`, default akun administrator/guru awal:
- **Username**: \`admin\` / \`guru\`
- **Password**: \`123456\` (Dapat diganti kapan saja)
- **Role**: \`GURU\`

---

### BAGIAN H: Deployment Web App Google Apps Script
1. Di editor Apps Script, klik tombol biru **Deploy** (Terapkan) > **New Deployment** (Penerapan Baru).
2. Pilih jenis: **Web App**.
3. Isi konfigurasi:
   - **Description**: \`CBT SMK v2.5\`
   - **Execute as**: \`Me\` (Akun Anda)
   - **Who has access**: \`Anyone\` (Siapa saja, termasuk pengguna anonim/siswa tanpa login akun Google)
4. Klik **Deploy** dan salin **Web App URL** (\`https://script.google.com/macros/s/.../exec\`).

---

### BAGIAN I: Panduan Custom Domain Sekolah
*Menghubungkan CBT ke Domain Resmi Sekolah (contoh: \`https://cbt.smkn1sekolah.sch.id\` atau \`https://ujian.sekolah.sch.id\`).*

#### Mengapa Google Apps Script Membutuhkan Proxy / CNAME?
Google Apps Script Web App berjalan di domain \`script.google.com\`. Google melarang framing HTTP tanpa HTTPS dan tidak menyediakan menu Custom Domain bawaan. Namun, kita dapat menghubungkannya **100% GRATIS dan LEGAL** menggunakan **Cloudflare Workers** (tanpa sewa VPS).

#### Langkah Setup Custom Domain dengan Cloudflare Worker (Gratis):
1. Masuk ke dashboard [Cloudflare](https://dash.cloudflare.com/) untuk domain sekolah Anda (\`sekolah.sch.id\`).
2. Buat Subdomain DNS:
   - Type: \`CNAME\`
   - Name: \`cbt\` (menjadi \`cbt.sekolah.sch.id\`)
   - Target: \`1.1.1.1\` atau dummy IP (Proxy Status: **Proxied (Orange Cloud ON)**).
3. Buka menu **Workers & Pages** > **Create Worker**.
4. Beri nama worker: \`cbt-smk-proxy\`.
5. Tempelkan kode Worker berikut:
\`\`\`javascript
export default {
  async fetch(request) {
    const GAS_URL = "https://script.google.com/macros/s/[GANTI_DENGAN_DEPLOYMENT_ID_ANDA]/exec";
    const url = new URL(request.url);
    const targetUrl = GAS_URL + url.search;
    
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: request.method !== "GET" && request.method !== "HEAD" ? await request.text() : undefined,
      redirect: "follow"
    });

    const newHeaders = new Headers(response.headers);
    newHeaders.set("Access-Control-Allow-Origin", "*");
    newHeaders.set("X-Frame-Options", "ALLOWALL");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    });
  }
};
\`\`\`
6. Hubungkan Worker ke Custom Domain: Masuk ke Worker > **Triggers** / **Custom Domains** > Tambahkan \`cbt.sekolah.sch.id\`.
7. SSL/HTTPS otomatis aktif dalam 1-2 menit! Siswa sekarang dapat mengakses ujian di \`https://cbt.sekolah.sch.id\`.

---

### BAGIAN J: Manajemen Siswa & Import NISN Massal
- Guru dapat menambahkan siswa satu per satu melalui formulir atau import file Excel/CSV.
- Format kolom: \`NISN\`, \`NIS\`, \`Nama Siswa\`, \`Kelas\`, \`Jurusan\`.
- Siswa login menggunakan NISN sebagai username dan password standar (bisa disetel oleh guru).

---

### BAGIAN K: Manajemen Rombel & Kelas
- Dukungan seluruh jurusan SMK: RPL, TKJ, DKV, Otomotif (TKRO/TBSM), Akuntansi (AKL), Otomatisasi Perkantoran (OTKP), dll.
- Filter otomatis peserta ujian berdasarkan kelas target (contoh: \`X RPL 1\`, \`X RPL 2\`).

---

### BAGIAN L: Manajemen Bank Soal (5 Model Soal)
Aplikasi mendukung 5 model soal asesmen modern:
1. **PG (Pilihan Ganda)**: 1 jawaban benar (opsi A sampai E).
2. **PGK (Pilihan Ganda Kompleks)**: Jawaban benar lebih dari satu (checkbox).
3. **BENAR - SALAH**: Pernyataan dengan opsi Benar atau Salah.
4. **PENJODOHAN**: Menghubungkan premis di kolom kiri dengan respon di kolom kanan.
5. **ISIAN SINGKAT**: Jawaban teks pendek atau angka dengan pencocokan kata kunci otomatis.
- Dilengkapi fitur **AI Ready** (Google Gemini) untuk membuat draft soal SMK otomatis sesuai capaian pembelajaran.

---

### BAGIAN M: Manajemen Jadwal Ujian & Parameter KKM
Guru dapat mengatur:
- Waktu mulai & selesai, durasi ujian (menit).
- Nilai KKM (Kriteria Ketuntasan Minimal, cth: 75).
- Pengacakan nomor soal (Random Soal ON/OFF) dan opsi pilihan (Random Opsi ON/OFF).
- Kebijakan tampilkan nilai dan pembahasan setelah siswa submit.

---

### BAGIAN N: Session Mode (Optimasi 30 Siswa Serempak)
Untuk menjaga batas quota dan performa Google Apps Script tanpa lag:
- Atur kapasitas per sesi: **30 Siswa**.
- Buat Sesi 1 (07.30 - 09.00), Sesi 2 (09.30 - 11.00), Sesi 3 (12.30 - 14.00).
- Setiap sesi memiliki Token dan Jadwal terpisah, mengisolasi data jawaban tanpa risiko tercampur.

---

### BAGIAN O: Manajemen Token CBT
- Generate token otomatis (format: \`CBT-XDKV-8261\`) atau input manual.
- Token dapat dibagikan di papan tulis lab 5 menit sebelum ujian dimulai.

---

### BAGIAN P: Pelaksanaan Ujian Siswa
- **Anti-Reset & Auto-Save**: Jawaban tersimpan otomatis setiap 15 detik, saat berganti soal, dan sebelum submit.
- **Server Clock Synchronization**: Waktu ujian dihitung dari selisih waktu server, sehingga siswa tidak dapat memanipulasi jam lokal di laptop/HP.
- Jika browser refresh, mati listrik sementara, atau internet terputus, siswa cukup login kembali: seluruh jawaban dan posisi soal langsung kembali utuh!

---

### BAGIAN Q: Live Monitoring Guru
- Pengawas memantau status seluruh siswa: 🟢 Aktif, 🟡 Terputus/Idle, 🔵 Sudah Submit, 🔴 Pelanggaran.
- Deteksi kecurangan otomatis (pindah tab, keluar halaman ujian, tombol devtools/inspect) dicatat ke log pelanggaran.

---

### BAGIAN R: Koreksi Otomatis & Penilaian Manual Isian
- Soal PG, PGK, Benar-Salah, dan Penjodohan dikoreksi 100% instan oleh sistem.
- Soal Isian disediakan antarmuka koreksi manual cepat untuk guru memberi nilai dan catatan umpan balik.

---

### BAGIAN S: Analisis Butir Soal & Tingkat Kesukaran
- Menghitung rata-rata, nilai tertinggi, terendah, persentase kelulusan/ketuntasan.
- Analisis tingkat kesukaran soal (Mudah, Sedang, Sulit) dan daya pembeda butir soal.

---

### BAGIAN T: Cetak Kartu Peserta, Berita Acara & Rekap Nilai
- **Kartu Peserta Ujian**: Layout kartu resmi per siswa lengkap dengan jadwal, NISN, dan foto/barcode.
- **Berita Acara Ujian**: Dokumen resmi pengawas lab SMK dengan data kehadiran dan kolom tanda tangan pengawas.
- **Rekapitulasi Nilai**: Format nilai per kelas siap cetak atau ekspor ke format Excel/PDF.

---

### BAGIAN U: Mode Darurat Offline (Cetak Naskah Kertas) & Backup
Jika terjadi kendala listrik padam total di lab:
- Guru dapat langsung mencetak **Naskah Soal Ujian Kertas** dan **Lembar Jawaban Komputer (LJK)** langsung dari bank soal yang sudah diinput.
- Fitur **Backup Database** menyalin spreadsheet secara berkala dalam 1 klik.

---

### BAGIAN V: Troubleshooting & Optimalisasi Quota Google
- **Error Quota Exceeded**: Gunakan Session Mode 30 siswa agar eksekusi Apps Script tetap di bawah batas Google (20.000 urlfetch/hari).
- **Siswa Tidak Bisa Login**: Pastikan NISN sudah terdaftar di sheet \`SISWA\` dan role dipilih dengan benar.
- **Token Tidak Valid**: Periksa kesesuaian huruf besar/kecil dan pastikan sesi ujian berstatus Aktif.
`;
