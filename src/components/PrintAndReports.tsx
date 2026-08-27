import React, { useState } from "react";
import {
  Ujian,
  NilaiSiswa,
  SchoolConfig,
  User,
  BankSoal,
} from "../types/cbt";
import {
  Printer,
  FileText,
  CreditCard,
  ClipboardList,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  FileDown,
  Building,
  School
} from "lucide-react";

interface PrintAndReportsProps {
  schoolConfig: SchoolConfig;
  exams: Ujian[];
  students: User[];
  nilaiList: NilaiSiswa[];
  bankSoalList: BankSoal[];
}

export const PrintAndReports: React.FC<PrintAndReportsProps> = ({
  schoolConfig,
  exams,
  students,
  nilaiList,
  bankSoalList,
}) => {
  const [selectedReportType, setSelectedReportType] = useState<
    "KARTU_PESERTA" | "BERITA_ACARA" | "REKAP_NILAI" | "DAFTAR_HADIR" | "NASKAH_DARURAT"
  >("KARTU_PESERTA");

  const [selectedExamId, setSelectedExamId] = useState<string>(exams[0]?.id || "");
  const selectedExam = exams.find((e) => e.id === selectedExamId) || exams[0];
  const selectedBank = bankSoalList.find((b) => b.id === selectedExam?.bankSoalId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Cetak Administrasi & Naskah Kertas Darurat
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-black bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              Format Standar SMK
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cetak kartu peserta, berita acara, daftar hadir, dan naskah soal kertas jika terjadi pemadaman listrik/kondisi darurat.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center space-x-2 shadow-md transition-all self-start sm:self-auto"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Dokumen Sekarang</span>
        </button>
      </div>

      {/* Report Type Selector Tabs (Hidden in Print) */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 scrollbar-none no-print">
        {[
          { key: "KARTU_PESERTA", label: "🎫 Kartu Peserta Ujian", icon: CreditCard },
          { key: "BERITA_ACARA", label: "📋 Berita Acara Ujian", icon: ClipboardList },
          { key: "DAFTAR_HADIR", label: "📝 Daftar Hadir Peserta", icon: FileText },
          { key: "REKAP_NILAI", label: "📊 Rekap Nilai per Kelas", icon: FileSpreadsheet },
          { key: "NASKAH_DARURAT", label: "📄 Naskah Soal Kertas (Darurat)", icon: FileDown },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = selectedReportType === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setSelectedReportType(tab.key as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-2 border ${
                isActive
                  ? "bg-slate-900 text-white dark:bg-indigo-600 border-slate-900 dark:border-indigo-600 shadow-sm"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Exam Selector Toolbar (Hidden in Print) */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-3 text-xs no-print">
        <div className="flex items-center space-x-2">
          <label className="font-bold uppercase text-slate-400">Pilih Paket Ujian:</label>
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
          >
            {exams.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.nama} ({ex.kode})
              </option>
            ))}
          </select>
        </div>
        <p className="text-slate-500 hidden sm:block">
          Gunakan tombol <strong>Cetak Dokumen</strong> atau Ctrl+P di browser.
        </p>
      </div>

      {/* ================= PRINT PREVIEW CONTAINER ================= */}
      <div className="bg-white text-black p-6 sm:p-10 rounded-2xl border border-slate-300 shadow-lg min-h-[600px] print:p-0 print:border-none print:shadow-none font-serif">
        {/* ================= 1. KARTU PESERTA UJIAN ================= */}
        {selectedReportType === "KARTU_PESERTA" && (
          <div className="space-y-6">
            <div className="text-center border-b-2 border-black pb-3 mb-6">
              <h1 className="text-base font-bold uppercase tracking-wider">{schoolConfig.namaSekolah}</h1>
              <p className="text-xs font-sans text-gray-600">{schoolConfig.alamat}</p>
              <h2 className="text-sm font-bold uppercase mt-2 font-sans tracking-wide">
                KARTU PESERTA PENILAIAN AKHIR SEMESTER (PAS)
              </h2>
              <p className="text-xs font-sans">Tahun Pelajaran: {schoolConfig.tahunAjaran} • Semester: {schoolConfig.semester}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2">
              {students.slice(0, 4).map((s, idx) => (
                <div
                  key={s.id}
                  className="p-4 border-2 border-dashed border-gray-400 rounded-xl space-y-3 font-sans text-xs bg-gray-50/50 print:bg-white break-inside-avoid"
                >
                  <div className="flex justify-between items-center border-b pb-1 font-bold text-[11px]">
                    <span>{schoolConfig.namaSekolah}</span>
                    <span className="text-indigo-700 font-mono">RUANG LAB 1</span>
                  </div>

                  <div className="flex space-x-3 items-center">
                    <div className="w-16 h-20 border-2 border-gray-400 bg-gray-100 flex items-center justify-center text-[10px] text-gray-500 font-bold">
                      FOTO 3x4
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Nama Siswa:</span>
                        <span className="font-bold">{s.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">NISN / User:</span>
                        <span className="font-mono font-bold">{s.nisn}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Kelas / Jurusan:</span>
                        <span className="font-bold">X RPL 1</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Sesi Ujian:</span>
                        <span className="font-bold">Sesi 1 (07:30 - 09:00)</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t flex justify-between items-center text-[10px]">
                    <span className="font-mono text-gray-400">ID: {s.id}</span>
                    <span className="italic text-gray-600">Kepala Sekolah: {schoolConfig.kepalaSekolah}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= 2. BERITA ACARA UJIAN ================= */}
        {selectedReportType === "BERITA_ACARA" && (
          <div className="space-y-5 font-serif text-xs">
            {/* Kop Surat */}
            <div className="text-center border-b-2 border-black pb-3 space-y-1">
              <h1 className="text-base font-bold uppercase">{schoolConfig.namaSekolah}</h1>
              <p className="text-xs font-sans text-gray-600">{schoolConfig.alamat}</p>
              <p className="text-xs font-sans font-bold">NPSN: {schoolConfig.npsn} • Kab/Kota: {schoolConfig.kabupatenKota}</p>
            </div>

            <div className="text-center my-4">
              <h2 className="text-sm font-bold uppercase underline">
                BERITA ACARA PELAKSANAAN UJIAN CBT
              </h2>
              <p className="text-xs font-sans">Nomor: 421.5 / BA-CBT / SMK / {new Date().getFullYear()}</p>
            </div>

            <p className="leading-relaxed font-sans text-justify">
              Pada hari ini, <strong>{new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</strong>,
              telah diselenggarakan Penilaian Asesmen Berbasis Komputer (CBT) untuk:
            </p>

            <table className="w-full font-sans text-xs my-2">
              <tbody>
                <tr>
                  <td className="w-48 py-1 font-bold">Mata Pelajaran</td>
                  <td className="w-4">:</td>
                  <td>{selectedExam?.mapelNama}</td>
                </tr>
                <tr>
                  <td className="py-1 font-bold">Paket / Kode Ujian</td>
                  <td>:</td>
                  <td className="font-mono">{selectedExam?.kode} - {selectedExam?.nama}</td>
                </tr>
                <tr>
                  <td className="py-1 font-bold">Sesi & Ruang Ujian</td>
                  <td>:</td>
                  <td>Sesi 1 • Ruang Laboratorium Komputer 1</td>
                </tr>
                <tr>
                  <td className="py-1 font-bold">Waktu Pelaksanaan</td>
                  <td>:</td>
                  <td>{selectedExam?.jamMulai} s.d {selectedExam?.jamSelesai} WIB ({selectedExam?.durasiMenit} Menit)</td>
                </tr>
                <tr>
                  <td className="py-1 font-bold">Jumlah Peserta Seharusnya</td>
                  <td>:</td>
                  <td>30 Orang Siswa</td>
                </tr>
                <tr>
                  <td className="py-1 font-bold">Jumlah Peserta Hadir</td>
                  <td>:</td>
                  <td>30 Orang Siswa</td>
                </tr>
                <tr>
                  <td className="py-1 font-bold">Jumlah Peserta Tidak Hadir</td>
                  <td>:</td>
                  <td>0 Orang Siswa</td>
                </tr>
                <tr>
                  <td className="py-1 font-bold">Catatan Selama Pelaksanaan</td>
                  <td>:</td>
                  <td>Ujian berlangsung tertib, aman, dan seluruh sesi berhasil disubmit tanpa kendala server.</td>
                </tr>
              </tbody>
            </table>

            {/* Signature Box */}
            <div className="pt-10 grid grid-cols-2 gap-8 font-sans text-xs text-center">
              <div className="space-y-16">
                <p>Pengawas Ruang Ujian,</p>
                <div>
                  <p className="font-bold underline">Budi Santoso, S.Kom</p>
                  <p className="text-[11px] text-gray-500">NIP. 19850115 201001 1 012</p>
                </div>
              </div>

              <div className="space-y-16">
                <p>Kepala {schoolConfig.namaSekolah},</p>
                <div>
                  <p className="font-bold underline">{schoolConfig.kepalaSekolah}</p>
                  <p className="text-[11px] text-gray-500">NIP. {schoolConfig.nipKepalaSekolah}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= 3. DAFTAR HADIR PESERTA ================= */}
        {selectedReportType === "DAFTAR_HADIR" && (
          <div className="space-y-4 font-sans text-xs">
            <div className="text-center border-b-2 border-black pb-2 space-y-0.5">
              <h1 className="text-base font-bold uppercase font-serif">{schoolConfig.namaSekolah}</h1>
              <h2 className="text-xs font-bold uppercase">
                DAFTAR HADIR PESERTA UJIAN BERBASIS KOMPUTER (CBT)
              </h2>
              <p className="text-[11px] text-gray-600">
                Ujian: {selectedExam?.nama} • Kelas: X RPL 1 • Sesi 1
              </p>
            </div>

            <table className="w-full border-collapse border border-black text-left text-xs my-3">
              <thead>
                <tr className="bg-gray-100 border border-black font-bold">
                  <th className="p-2 border border-black text-center w-10">No</th>
                  <th className="p-2 border border-black">NISN</th>
                  <th className="p-2 border border-black">Nama Siswa</th>
                  <th className="p-2 border border-black text-center w-28">No. Komputer</th>
                  <th className="p-2 border border-black text-center w-36">Tanda Tangan</th>
                </tr>
              </thead>
              <tbody>
                {students.slice(0, 15).map((s, idx) => (
                  <tr key={s.id} className="border border-black">
                    <td className="p-2 border border-black text-center font-mono">{idx + 1}</td>
                    <td className="p-2 border border-black font-mono">{s.nisn}</td>
                    <td className="p-2 border border-black font-bold">{s.name}</td>
                    <td className="p-2 border border-black text-center font-mono">PC-{idx + 1 < 10 ? `0${idx + 1}` : idx + 1}</td>
                    <td className="p-2 border border-black">
                      <div className="text-[10px] text-gray-400">{idx + 1}. ................</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pt-4 flex justify-end font-sans text-xs text-center">
              <div className="w-64 space-y-16">
                <p>Pengawas Ujian,</p>
                <div>
                  <p className="font-bold underline">Budi Santoso, S.Kom</p>
                  <p className="text-[11px] text-gray-500">NIP. 19850115 201001 1 012</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= 4. REKAP NILAI PER KELAS ================= */}
        {selectedReportType === "REKAP_NILAI" && (
          <div className="space-y-4 font-sans text-xs">
            <div className="text-center border-b-2 border-black pb-2 space-y-0.5">
              <h1 className="text-base font-bold uppercase font-serif">{schoolConfig.namaSekolah}</h1>
              <h2 className="text-xs font-bold uppercase">
                REKAPITULASI HASIL PENILAIAN AKHIR SEMESTER (PAS)
              </h2>
              <p className="text-[11px] text-gray-600">
                Mata Pelajaran: {selectedExam?.mapelNama} • KKM: {selectedExam?.kkm || 75}
              </p>
            </div>

            <table className="w-full border-collapse border border-black text-left text-xs my-3">
              <thead>
                <tr className="bg-gray-100 border border-black font-bold">
                  <th className="p-2 border border-black text-center w-10">No</th>
                  <th className="p-2 border border-black">NISN</th>
                  <th className="p-2 border border-black">Nama Siswa</th>
                  <th className="p-2 border border-black text-center">Kelas</th>
                  <th className="p-2 border border-black text-center">Nilai Total</th>
                  <th className="p-2 border border-black text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {nilaiList.map((n, idx) => (
                  <tr key={n.id} className="border border-black">
                    <td className="p-2 border border-black text-center font-mono">{idx + 1}</td>
                    <td className="p-2 border border-black font-mono">{n.nisn}</td>
                    <td className="p-2 border border-black font-bold">{n.studentName}</td>
                    <td className="p-2 border border-black text-center">{n.kelas}</td>
                    <td className="p-2 border border-black text-center font-bold">{n.nilaiTotal}</td>
                    <td className="p-2 border border-black text-center font-bold">
                      {n.isLulus ? "TUNTAS" : "REMEDIAL"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pt-6 grid grid-cols-2 gap-8 font-sans text-xs text-center">
              <div className="space-y-16">
                <p>Guru Pengampu Mata Pelajaran,</p>
                <div>
                  <p className="font-bold underline">Budi Santoso, S.Kom</p>
                  <p className="text-[11px] text-gray-500">NIP. 19850115 201001 1 012</p>
                </div>
              </div>

              <div className="space-y-16">
                <p>Kepala {schoolConfig.namaSekolah},</p>
                <div>
                  <p className="font-bold underline">{schoolConfig.kepalaSekolah}</p>
                  <p className="text-[11px] text-gray-500">NIP. {schoolConfig.nipKepalaSekolah}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= 5. NASKAH SOAL KERTAS DARURAT ================= */}
        {selectedReportType === "NASKAH_DARURAT" && (
          <div className="space-y-5 font-sans text-xs">
            <div className="text-center border-b-2 border-black pb-3 space-y-1">
              <h1 className="text-base font-bold uppercase font-serif">{schoolConfig.namaSekolah}</h1>
              <h2 className="text-xs font-bold uppercase font-sans">
                NASKAH SOAL UJIAN KERTAS (CADANGAN DARURAT / BLACKOUT)
              </h2>
              <div className="flex justify-center space-x-6 text-[11px] text-gray-600 font-sans">
                <span>Mata Pelajaran: <strong>{selectedExam?.mapelNama}</strong></span>
                <span>Waktu: <strong>{selectedExam?.durasiMenit} Menit</strong></span>
                <span>Kode: <strong>{selectedExam?.kode}</strong></span>
              </div>
            </div>

            <div className="p-3 bg-gray-50 border border-gray-300 rounded font-sans text-[11px] space-y-1">
              <p className="font-bold">PETUNJUK UMUM:</p>
              <ol className="list-decimal list-inside space-y-0.5 text-gray-700">
                <li>Tuliskan nama dan nomor peserta pada lembar jawaban yang tersedia.</li>
                <li>Periksa dan bacalah butir soal dengan teliti sebelum menjawab.</li>
                <li>Gunakan pensil 2B atau pulpen hitam sesuai instruksi pengawas.</li>
              </ol>
            </div>

            {/* Questions list for paper printing */}
            <div className="space-y-6 pt-2 font-serif">
              {(selectedBank?.soalList || []).map((q, idx) => (
                <div key={q.id} className="space-y-2 break-inside-avoid">
                  <div className="flex items-start space-x-2">
                    <span className="font-bold font-sans">{idx + 1}.</span>
                    <div className="flex-1 space-y-2">
                      <p className="leading-relaxed">{q.question}</p>

                      {q.type === "PG" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 font-sans text-xs pl-2">
                          {q.options?.map((opt) => (
                            <div key={opt.key} className="flex space-x-1.5">
                              <span className="font-bold">{opt.key}.</span>
                              <span>{opt.text}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {q.type === "BENAR_SALAH" && (
                        <div className="font-sans text-xs pl-2 flex space-x-4">
                          <span>[ &nbsp; ] BENAR</span>
                          <span>[ &nbsp; ] SALAH</span>
                        </div>
                      )}

                      {q.type === "ISIAN" && (
                        <div className="font-sans text-xs pl-2 pt-2 border-b border-gray-400 w-64 pb-1 text-gray-400">
                          Jawaban: ...........................................................
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
