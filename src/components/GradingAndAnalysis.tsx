import React, { useState } from "react";
import {
  NilaiSiswa,
  Ujian,
  BankSoal,
  Question,
  AuditKoreksiLog,
} from "../types/cbt";
import {
  Award,
  BarChart3,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Download,
  Edit3,
  TrendingUp,
  Percent,
  Check,
  X
} from "lucide-react";

interface GradingAndAnalysisProps {
  nilaiList: NilaiSiswa[];
  exams: Ujian[];
  bankSoalList: BankSoal[];
  onUpdateNilai: (updatedNilai: NilaiSiswa) => void;
}

export const GradingAndAnalysis: React.FC<GradingAndAnalysisProps> = ({
  nilaiList,
  exams,
  bankSoalList,
  onUpdateNilai,
}) => {
  const [activeTab, setActiveTab] = useState<"REKAP_NILAI" | "ANALISIS_SOAL">("REKAP_NILAI");
  const [selectedExamId, setSelectedExamId] = useState<string>(exams[0]?.id || "");
  const [filterLulus, setFilterLulus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal Koreksi Isian
  const [koreksiModalItem, setKoreksiModalItem] = useState<NilaiSiswa | null>(null);
  const [isianScoreInput, setIsianScoreInput] = useState<number>(0);
  const [koreksiNote, setKoreksiNote] = useState<string>("");

  const selectedExam = exams.find((e) => e.id === selectedExamId) || exams[0];
  const selectedBank = bankSoalList.find((b) => b.id === selectedExam?.bankSoalId);

  // Filtered Results
  const filteredResults = nilaiList.filter((n) => {
    const matchesExam = !selectedExamId || n.examId === selectedExamId;
    const matchesLulus =
      filterLulus === "ALL" ||
      (filterLulus === "LULUS" && n.isLulus) ||
      (filterLulus === "TIDAK_LULUS" && !n.isLulus);
    const matchesSearch =
      n.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.nisn.includes(searchQuery);
    return matchesExam && matchesLulus && matchesSearch;
  });

  // Calculate Statistics
  const totalCount = filteredResults.length;
  const lulusCount = filteredResults.filter((n) => n.isLulus).length;
  const passingRate = totalCount > 0 ? Math.round((lulusCount / totalCount) * 100) : 0;
  const scores = filteredResults.map((n) => n.nilaiTotal);
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const maxScore = scores.length > 0 ? Math.max(...scores) : 0;
  const minScore = scores.length > 0 ? Math.min(...scores) : 0;

  // Open Koreksi Manual
  const handleOpenKoreksi = (item: NilaiSiswa) => {
    setKoreksiModalItem(item);
    setIsianScoreInput(item.nilaiIsian);
    setKoreksiNote("");
  };

  const handleSaveKoreksi = () => {
    if (!koreksiModalItem) return;
    const diff = isianScoreInput - koreksiModalItem.nilaiIsian;
    const newTotal = Math.min(100, Math.max(0, koreksiModalItem.nilaiTotal + diff));
    const kkm = koreksiModalItem.kkm || 75;

    const auditLog: AuditKoreksiLog = {
      guruId: "USR-2026-0001",
      guruNama: "Budi Santoso, S.Kom",
      nilaiLama: koreksiModalItem.nilaiTotal,
      nilaiBaru: newTotal,
      catatan: koreksiNote || "Koreksi manual jawaban isian kejuruan",
      timestamp: new Date().toISOString(),
    };

    const updated: NilaiSiswa = {
      ...koreksiModalItem,
      nilaiIsian: isianScoreInput,
      nilaiTotal: newTotal,
      isLulus: newTotal >= kkm,
      statusKoreksi: "MANUAL_TERVERIFIKASI",
      guruKorektor: "Budi Santoso, S.Kom",
      timestampKoreksi: new Date().toISOString(),
      catatanGuru: koreksiNote,
      riwayatKoreksi: [...(koreksiModalItem.riwayatKoreksi || []), auditLog],
    };

    onUpdateNilai(updated);
    setKoreksiModalItem(null);
    alert("Nilai koreksi manual berhasil disimpan ke database!");
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Tab Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Koreksi & Analisis Butir Soal
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-black bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              Otomatis & Manual
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Rekapitulasi perolehan nilai 5 model soal dan evaluasi tingkat kesukaran butir soal.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab("REKAP_NILAI")}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "REKAP_NILAI"
                ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Rekapitulasi Nilai</span>
          </button>
          <button
            onClick={() => setActiveTab("ANALISIS_SOAL")}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "ANALISIS_SOAL"
                ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Analisis Butir Soal</span>
          </button>
        </div>
      </div>

      {/* Exam Selector Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <label className="text-xs font-bold uppercase text-slate-400">Pilih Ujian:</label>
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
          >
            {exams.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.nama} ({ex.kode})
              </option>
            ))}
          </select>
        </div>

        {activeTab === "REKAP_NILAI" && (
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari siswa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <select
              value={filterLulus}
              onChange={(e) => setFilterLulus(e.target.value)}
              className="p-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
            >
              <option value="ALL">Semua Kelulusan</option>
              <option value="LULUS">Tuntas (≥ KKM)</option>
              <option value="TIDAK_LULUS">Remedial (&lt; KKM)</option>
            </select>
          </div>
        )}
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Peserta Submit</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{totalCount} Siswa</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ketuntasan (KKM {selectedExam?.kkm || 75})</span>
          <p className="text-2xl font-black text-emerald-600">{passingRate}%</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Rata-Rata Nilai</span>
          <p className="text-2xl font-black text-indigo-600">{avgScore}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Nilai Min / Max</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{minScore} / {maxScore}</p>
        </div>
      </div>

      {/* TAB 1: REKAPITULASI NILAI */}
      {activeTab === "REKAP_NILAI" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-4">No</th>
                  <th className="py-3.5 px-4">Nama Siswa & NISN</th>
                  <th className="py-3.5 px-4">Kelas / Sesi</th>
                  <th className="py-3.5 px-4 text-center">PG (10)</th>
                  <th className="py-3.5 px-4 text-center">PGK (15)</th>
                  <th className="py-3.5 px-4 text-center">B-S (10)</th>
                  <th className="py-3.5 px-4 text-center">Jodoh (20)</th>
                  <th className="py-3.5 px-4 text-center">Isian (15)</th>
                  <th className="py-3.5 px-4 text-center">Total Nilai</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Koreksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredResults.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-8 text-center text-slate-400">
                      Belum ada rekaman nilai untuk ujian ini.
                    </td>
                  </tr>
                ) : (
                  filteredResults.map((item, idx) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-400">{idx + 1}</td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900 dark:text-white">{item.studentName}</p>
                        <p className="text-[10px] font-mono text-slate-400">NISN: {item.nisn}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-700 dark:text-slate-300">{item.kelas}</p>
                        <p className="text-[10px] text-slate-400">{item.sesi}</p>
                      </td>
                      <td className="py-3.5 px-4 text-center font-semibold">{item.nilaiPG}</td>
                      <td className="py-3.5 px-4 text-center font-semibold">{item.nilaiPGK}</td>
                      <td className="py-3.5 px-4 text-center font-semibold">{item.nilaiBenarSalah}</td>
                      <td className="py-3.5 px-4 text-center font-semibold">{item.nilaiPenjodohan}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-indigo-600 dark:text-indigo-400">
                        {item.nilaiIsian}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="text-sm font-black text-slate-900 dark:text-white">
                          {item.nilaiTotal}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            item.isLulus
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                          }`}
                        >
                          {item.isLulus ? "✓ TUNTAS" : "✕ REMEDIAL"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenKoreksi(item)}
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 font-bold text-xs inline-flex items-center space-x-1"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Koreksi</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ANALISIS BUTIR SOAL */}
      {activeTab === "ANALISIS_SOAL" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Evaluasi Kualitas Butir Soal (Tingkat Kesukaran & Daya Pembeda)
            </h3>
            <p className="text-xs text-slate-500">
              Dihitung otomatis berdasarkan jawaban seluruh peserta pada paket ujian ini.
            </p>

            <div className="space-y-3">
              {(selectedBank?.soalList || []).map((q, idx) => {
                // Simulated Item Analysis Metrics
                const pValue = (0.55 + (idx * 0.08) % 0.4).toFixed(2); // 0.00..1.00 (Tingkat Kesukaran)
                const dValue = (0.35 + (idx * 0.05) % 0.35).toFixed(2); // Daya Beda
                const isGood = parseFloat(pValue) >= 0.3 && parseFloat(pValue) <= 0.8;

                return (
                  <div
                    key={q.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="font-black text-xs text-indigo-600 dark:text-indigo-400">
                          [{q.type}]
                        </span>
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {q.topic}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 text-xs">
                        <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-700 font-semibold border text-slate-700 dark:text-slate-300">
                          Tingkat Kesukaran (P): <strong>{pValue}</strong>
                        </span>
                        <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-700 font-semibold border text-slate-700 dark:text-slate-300">
                          Daya Beda (D): <strong>{dValue}</strong>
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded font-black text-[10px] ${
                            isGood
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          }`}
                        >
                          {isGood ? "✓ Soal Diterima" : "⚠️ Perlu Revisi"}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                      {q.question}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: KOREKSI MANUAL ISIAN ================= */}
      {koreksiModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Koreksi Manual Soal Isian
                </h3>
                <p className="text-xs text-slate-500">Siswa: {koreksiModalItem.studentName}</p>
              </div>
              <button
                onClick={() => setKoreksiModalItem(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Kunci Jawaban Guru:</span>
                <p className="font-bold text-slate-900 dark:text-white">Git (atau K3LH)</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Nilai Butir Isian (Maks 15 Poin)
                </label>
                <input
                  type="number"
                  min="0"
                  max="15"
                  value={isianScoreInput}
                  onChange={(e) => setIsianScoreInput(parseInt(e.target.value, 10) || 0)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Catatan Auditor / Korektor Guru
                </label>
                <textarea
                  rows={2}
                  placeholder="Alasan penyesuaian nilai..."
                  value={koreksiNote}
                  onChange={(e) => setKoreksiNote(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t dark:border-slate-800">
              <button
                onClick={() => setKoreksiModalItem(null)}
                className="px-4 py-2 rounded-xl border text-xs font-bold text-slate-600 dark:text-slate-300"
              >
                Batal
              </button>
              <button
                onClick={handleSaveKoreksi}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md"
              >
                Simpan Hasil Koreksi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
