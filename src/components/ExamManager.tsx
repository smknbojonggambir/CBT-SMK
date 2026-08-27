import React, { useState } from "react";
import {
  Ujian,
  ExamSession,
  BankSoal,
  Kelas,
  Mapel,
  DifficultyFilterMode,
  DifficultyDistribution,
} from "../types/cbt";
import {
  Plus,
  Calendar,
  Clock,
  KeyRound,
  Users,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Edit,
  Play,
  RotateCcw,
  Sparkles,
  Shuffle,
  ToggleLeft,
  ToggleRight,
  Layers,
  AlertCircle,
  BarChart3,
  Sliders,
} from "lucide-react";

interface ExamManagerProps {
  exams: Ujian[];
  bankSoalList: BankSoal[];
  classes: Kelas[];
  subjects?: Mapel[];
  onSaveExam?: (exam: Ujian) => void;
  onSaveExams?: (exams: Ujian[]) => void;
  onNavigateToMonitoring?: (examId: string) => void;
}

export const ExamManager: React.FC<ExamManagerProps> = ({
  exams,
  bankSoalList,
  classes,
  subjects = [],
  onSaveExam,
  onSaveExams,
  onNavigateToMonitoring,
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingExam, setEditingExam] = useState<Partial<Ujian> | null>(null);

  // Generate random token format CBT-XXXX-XXXX
  const generateNewToken = (): string => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let token1 = "";
    let token2 = "";
    for (let i = 0; i < 4; i++) {
      token1 += chars.charAt(Math.floor(Math.random() * chars.length));
      token2 += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `CBT-${token1}-${token2}`;
  };

  const handleOpenNewExam = () => {
    const defaultBank = bankSoalList[0];
    const initialToken = generateNewToken();
    const today = new Date().toISOString().split("T")[0];

    const newSessions: ExamSession[] = [
      {
        id: `SES-2026-${Date.now().toString().slice(-4)}-1`,
        nomorSesi: 1,
        nama: "Sesi 1 (Lab 1)",
        kapasitas: 30,
        waktuMulai: "07:30",
        waktuSelesai: "09:00",
        token: initialToken,
        status: "BELUM_MULAI",
      },
      {
        id: `SES-2026-${Date.now().toString().slice(-4)}-2`,
        nomorSesi: 2,
        nama: "Sesi 2 (Lab 1)",
        kapasitas: 30,
        waktuMulai: "09:30",
        waktuSelesai: "11:00",
        token: generateNewToken(),
        status: "BELUM_MULAI",
      },
    ];

    setEditingExam({
      id: `UJ-2026-${Date.now().toString().slice(-4)}`,
      kode: `PAS-${defaultBank?.kode?.slice(4) || "SMK"}-${Date.now().toString().slice(-3)}`,
      nama: "Penilaian Akhir Semester (PAS) SMK",
      mapelId: defaultBank?.mapelId || subjects[0]?.id || "",
      mapelNama: defaultBank?.mapelNama || subjects[0]?.nama || "",
      kelasTarget: ["X-RPL-1", "X-TKJ-1"],
      guruId: "USR-2026-0001",
      guruNama: "Budi Santoso, S.Kom",
      tanggal: today,
      jamMulai: "07:30",
      jamSelesai: "12:00",
      durasiMenit: 60,
      jumlahSoal: defaultBank?.soalList?.length || 5,
      kkm: 75,
      randomSoal: true,
      randomJawaban: true,
      tampilkanNilai: true,
      tampilkanPembahasan: true,
      tokenGlobal: initialToken,
      bankSoalId: defaultBank?.id || "",
      difficultyMode: "ALL",
      difficultyDistribution: {
        mudahPercent: 30,
        sedangPercent: 50,
        sulitPercent: 20,
      },
      status: "AKTIF",
      sessions: newSessions,
    });
    setIsModalOpen(true);
  };

  const handleEditExam = (exam: Ujian) => {
    setEditingExam({
      ...exam,
      difficultyMode: exam.difficultyMode || "ALL",
      difficultyDistribution: exam.difficultyDistribution || {
        mudahPercent: 30,
        sedangPercent: 50,
        sulitPercent: 20,
      },
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!editingExam || !editingExam.nama || !editingExam.bankSoalId) {
      alert("Harap lengkapi nama ujian dan pilih Bank Soal!");
      return;
    }
    const bank = bankSoalList.find((b) => b.id === editingExam.bankSoalId);
    const fullExam: Ujian = {
      id: editingExam.id || `UJ-2026-${Date.now()}`,
      kode: editingExam.kode || `UJ-${Date.now().toString().slice(-4)}`,
      nama: editingExam.nama,
      mapelId: bank?.mapelId || editingExam.mapelId || "",
      mapelNama: bank?.mapelNama || editingExam.mapelNama || "",
      kelasTarget: editingExam.kelasTarget || ["Semua Kelas"],
      guruId: editingExam.guruId || "USR-2026-0001",
      guruNama: editingExam.guruNama || "Guru Pembina",
      tanggal: editingExam.tanggal || new Date().toISOString().split("T")[0],
      jamMulai: editingExam.jamMulai || "07:30",
      jamSelesai: editingExam.jamSelesai || "12:00",
      durasiMenit: editingExam.durasiMenit || 60,
      jumlahSoal: editingExam.jumlahSoal || bank?.soalList?.length || 5,
      kkm: editingExam.kkm || 75,
      randomSoal: editingExam.randomSoal ?? true,
      randomJawaban: editingExam.randomJawaban ?? true,
      tampilkanNilai: editingExam.tampilkanNilai ?? true,
      tampilkanPembahasan: editingExam.tampilkanPembahasan ?? true,
      tokenGlobal: editingExam.tokenGlobal || generateNewToken(),
      bankSoalId: editingExam.bankSoalId,
      difficultyMode: editingExam.difficultyMode || "ALL",
      difficultyDistribution: editingExam.difficultyDistribution || {
        mudahPercent: 30,
        sedangPercent: 50,
        sulitPercent: 20,
      },
      status: editingExam.status || "AKTIF",
      sessions: editingExam.sessions || [],
      createdAt: editingExam.createdAt || new Date().toISOString(),
    };

    if (onSaveExam) {
      onSaveExam(fullExam);
    }
    if (onSaveExams) {
      const idx = exams.findIndex((e) => e.id === fullExam.id);
      let updated: Ujian[];
      if (idx >= 0) {
        updated = exams.map((e) => (e.id === fullExam.id ? fullExam : e));
      } else {
        updated = [...exams, fullExam];
      }
      onSaveExams(updated);
    }

    setIsModalOpen(false);
    setEditingExam(null);
  };

  // Toggle status shortcut
  const handleToggleStatus = (exam: Ujian) => {
    const nextStatus: "DRAFT" | "AKTIF" | "SELESAI" =
      exam.status === "AKTIF" ? "SELESAI" : exam.status === "SELESAI" ? "DRAFT" : "AKTIF";
    const updated = { ...exam, status: nextStatus };
    if (onSaveExam) onSaveExam(updated);
    if (onSaveExams) {
      onSaveExams(exams.map((e) => (e.id === exam.id ? updated : e)));
    }
  };

  // Calculate difficulty count previews in modal
  const selectedBankForModal = bankSoalList.find((b) => b.id === editingExam?.bankSoalId);
  const totalQuestionsInBank = selectedBankForModal?.soalList?.length || 0;
  const targetExamQuestionCount = editingExam?.jumlahSoal || totalQuestionsInBank || 10;
  const customDistribution = editingExam?.difficultyDistribution || {
    mudahPercent: 30,
    sedangPercent: 50,
    sulitPercent: 20,
  };
  const distributionSum =
    (customDistribution.mudahPercent || 0) +
    (customDistribution.sedangPercent || 0) +
    (customDistribution.sulitPercent || 0);

  const approxMudah = Math.round((customDistribution.mudahPercent / 100) * targetExamQuestionCount);
  const approxSulit = Math.round((customDistribution.sulitPercent / 100) * targetExamQuestionCount);
  const approxSedang = Math.max(0, targetExamQuestionCount - approxMudah - approxSulit);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Manajemen Jadwal & Paket Ujian
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-black bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              SMK Concurrency Control
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Pengaturan sesi 30 peserta per lab, token otomatis, dan distribusi tingkat kesukaran soal.
          </p>
        </div>

        <button
          onClick={handleOpenNewExam}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs flex items-center space-x-1.5 shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Buat Jadwal Ujian Baru</span>
        </button>
      </div>

      {/* Info Concurrency SMK */}
      <div className="bg-indigo-50/70 dark:bg-indigo-950/40 p-4 rounded-2xl border border-indigo-200/70 dark:border-indigo-900/60">
        <div className="flex items-start space-x-3">
          <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <p className="text-xs font-black text-indigo-950 dark:text-indigo-200">
              Session-Based Concurrency Control (30 Peserta / Sesi) & Distribusi Tingkat Kesulitan
            </p>
            <p className="text-indigo-700 dark:text-indigo-400 text-[11px]">
              Setiap sesi memiliki token terenkripsi dan isolasi cache. Anda dapat mengatur komposisi soal Mudah, Sedang, dan Sulit (HOTS) secara otomatis.
            </p>
          </div>
        </div>
      </div>

      {/* Exams Grid */}
      <div className="grid grid-cols-1 gap-4">
        {exams.map((exam) => (
          <div
            key={exam.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 sm:p-6 space-y-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
          >
            {/* Header & Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <span className="font-mono text-xs font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-0.5 rounded">
                    {exam.kode}
                  </span>
                  <button
                    onClick={() => handleToggleStatus(exam)}
                    className={`px-3 py-0.5 rounded-full text-xs font-black transition-all ${
                      exam.status === "AKTIF"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-200"
                        : exam.status === "DRAFT"
                        ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                    }`}
                  >
                    ● Status: {exam.status} (Klik ganti)
                  </button>
                  <span className="text-xs text-slate-500 font-semibold">
                    📅 {exam.tanggal} ({exam.jamMulai} - {exam.jamSelesai})
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                  {exam.nama}
                </h3>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onNavigateToMonitoring && onNavigateToMonitoring(exam.id)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Live Monitor</span>
                </button>
                <button
                  onClick={() => handleEditExam(exam)}
                  className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Edit Pengaturan Ujian"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Exam Parameters Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Mata Pelajaran</span>
                <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{exam.mapelNama}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Durasi & KKM</span>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  ⏱️ {exam.durasiMenit} Menit • KKM {exam.kkm}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Tingkat Kesulitan</span>
                <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1">
                  {exam.difficultyMode === "MUDAH_ONLY" && (
                    <span className="text-emerald-600 dark:text-emerald-400 font-black">🟢 Khusus Mudah</span>
                  )}
                  {exam.difficultyMode === "SEDANG_ONLY" && (
                    <span className="text-amber-600 dark:text-amber-400 font-black">🟡 Khusus Sedang</span>
                  )}
                  {exam.difficultyMode === "SULIT_ONLY" && (
                    <span className="text-rose-600 dark:text-rose-400 font-black">🔴 Khusus Sulit (HOTS)</span>
                  )}
                  {exam.difficultyMode === "CUSTOM_DISTRIBUTION" && (
                    <span className="text-indigo-600 dark:text-indigo-400 font-black">
                      🎯 {exam.difficultyDistribution?.mudahPercent}% M / {exam.difficultyDistribution?.sedangPercent}% S / {exam.difficultyDistribution?.sulitPercent}% H
                    </span>
                  )}
                  {(!exam.difficultyMode || exam.difficultyMode === "ALL") && (
                    <span className="text-slate-700 dark:text-slate-300">🌟 Semua Tingkat</span>
                  )}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Target Kelas</span>
                <p className="font-bold text-slate-800 dark:text-slate-200 truncate">
                  {(exam.kelasTarget || []).join(", ") || "Semua Kelas"}
                </p>
              </div>
            </div>

            {/* Sessions Breakdown Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Daftar Sesi Ujian (Kapasitas Maksimal 30 Siswa / Sesi)
                </h4>
                <span className="text-xs text-indigo-600 font-bold">
                  {exam.sessions?.length || 1} Sesi Terjadwal
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {(exam.sessions || []).map((ses) => (
                  <div
                    key={ses.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {ses.nama}
                      </span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                        Max {ses.kapasitas} Siswa
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>🕒 {ses.waktuMulai} - {ses.waktuSelesai}</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center space-x-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                          {ses.token}
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-600">Aktif</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ================= MODAL: EDIT / CREATE EXAM ================= */}
      {isModalOpen && editingExam && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-5 my-8">
            <div className="flex items-center justify-between border-b pb-4 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Pengaturan Jadwal & Sesi Ujian
                </h3>
                <p className="text-xs text-slate-500">
                  Konfigurasi paket tes, durasi, KKM, pembagian sesi, dan tingkat kesulitan soal
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              {/* Exam Title & Code */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                    Nama Paket Ujian
                  </label>
                  <input
                    type="text"
                    required
                    value={editingExam.nama || ""}
                    onChange={(e) => setEditingExam({ ...editingExam, nama: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                    Kode Ujian
                  </label>
                  <input
                    type="text"
                    value={editingExam.kode || ""}
                    onChange={(e) => setEditingExam({ ...editingExam, kode: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Bank Soal Linkage & Question Count */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                    Pilih Bank Soal Sumber
                  </label>
                  <select
                    value={editingExam.bankSoalId}
                    onChange={(e) => {
                      const selectedB = bankSoalList.find((b) => b.id === e.target.value);
                      setEditingExam({
                        ...editingExam,
                        bankSoalId: e.target.value,
                        mapelId: selectedB?.mapelId,
                        mapelNama: selectedB?.mapelNama,
                        jumlahSoal: selectedB?.soalList?.length || 5,
                      });
                    }}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                  >
                    {bankSoalList.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.nama} ({b.soalList?.length || 0} Soal Tersedia)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                    Jumlah Soal Diambil
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={totalQuestionsInBank || 100}
                    value={editingExam.jumlahSoal || totalQuestionsInBank || 5}
                    onChange={(e) =>
                      setEditingExam({
                        ...editingExam,
                        jumlahSoal: parseInt(e.target.value, 10) || 5,
                      })
                    }
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                  />
                </div>
              </div>

              {/* ================= DIFFICULTY SELECTION & DISTRIBUTION ================= */}
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xs font-black uppercase text-slate-900 dark:text-white">
                      Komposisi Tingkat Kesukaran Soal (Difficulty Level)
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                    Bank: {totalQuestionsInBank} Soal Total
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
                  {/* Mode 1: All */}
                  <button
                    type="button"
                    onClick={() => setEditingExam({ ...editingExam, difficultyMode: "ALL" })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      editingExam.difficultyMode === "ALL" || !editingExam.difficultyMode
                        ? "bg-white dark:bg-slate-800 border-indigo-600 ring-2 ring-indigo-500/20 shadow-sm"
                        : "bg-white/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">🌟 Semua Tingkat</span>
                      {editingExam.difficultyMode === "ALL" && (
                        <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Mengambil seluruh soal secara acak tanpa filter tingkat
                    </p>
                  </button>

                  {/* Mode 2: Mudah Only */}
                  <button
                    type="button"
                    onClick={() => setEditingExam({ ...editingExam, difficultyMode: "MUDAH_ONLY" })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      editingExam.difficultyMode === "MUDAH_ONLY"
                        ? "bg-white dark:bg-slate-800 border-emerald-600 ring-2 ring-emerald-500/20 shadow-sm"
                        : "bg-white/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-700 dark:text-emerald-300">
                        🟢 Khusus Mudah (Easy)
                      </span>
                      {editingExam.difficultyMode === "MUDAH_ONLY" && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Cocok untuk asesmen diagnostik awal / tes remedial
                    </p>
                  </button>

                  {/* Mode 3: Sedang Only */}
                  <button
                    type="button"
                    onClick={() => setEditingExam({ ...editingExam, difficultyMode: "SEDANG_ONLY" })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      editingExam.difficultyMode === "SEDANG_ONLY"
                        ? "bg-white dark:bg-slate-800 border-amber-600 ring-2 ring-amber-500/20 shadow-sm"
                        : "bg-white/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-700 dark:text-amber-300">
                        🟡 Khusus Sedang (Medium)
                      </span>
                      {editingExam.difficultyMode === "SEDANG_ONLY" && (
                        <CheckCircle2 className="w-4 h-4 text-amber-600" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Standar ulangan harian dan penilaian formatif reguler
                    </p>
                  </button>

                  {/* Mode 4: Sulit Only */}
                  <button
                    type="button"
                    onClick={() => setEditingExam({ ...editingExam, difficultyMode: "SULIT_ONLY" })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      editingExam.difficultyMode === "SULIT_ONLY"
                        ? "bg-white dark:bg-slate-800 border-rose-600 ring-2 ring-rose-500/20 shadow-sm"
                        : "bg-white/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-700 dark:text-rose-300">
                        🔴 Khusus Sulit (HOTS)
                      </span>
                      {editingExam.difficultyMode === "SULIT_ONLY" && (
                        <CheckCircle2 className="w-4 h-4 text-rose-600" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Untuk seleksi kejuruan, olimpiade, atau tes pengayaan
                    </p>
                  </button>

                  {/* Mode 5: Custom Distribution */}
                  <button
                    type="button"
                    onClick={() =>
                      setEditingExam({ ...editingExam, difficultyMode: "CUSTOM_DISTRIBUTION" })
                    }
                    className={`p-3 rounded-xl border text-left transition-all sm:col-span-2 ${
                      editingExam.difficultyMode === "CUSTOM_DISTRIBUTION"
                        ? "bg-white dark:bg-slate-800 border-indigo-600 ring-2 ring-indigo-500/20 shadow-sm"
                        : "bg-white/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-700 dark:text-indigo-300">
                        🎯 Distribusi Proporsional Khusus (Custom %)
                      </span>
                      {editingExam.difficultyMode === "CUSTOM_DISTRIBUTION" && (
                        <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Kustomisasi rasio persentase Mudah : Sedang : Sulit (Standar Kurikulum: 30% : 50% : 20%)
                    </p>
                  </button>
                </div>

                {/* Custom Distribution Slider & Input Breakdown */}
                {editingExam.difficultyMode === "CUSTOM_DISTRIBUTION" && (
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Atur Persentase Tiap Tingkat Kesukaran:
                      </span>
                      <span
                        className={`text-xs font-black px-2 py-0.5 rounded ${
                          distributionSum === 100
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                        }`}
                      >
                        Total: {distributionSum}% {distributionSum === 100 ? "✓ Pas" : "⚠️ Harus 100%"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Mudah % */}
                      <div className="p-2.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 space-y-1">
                        <div className="flex justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300">
                          <span>🟢 Soal Mudah</span>
                          <span>{customDistribution.mudahPercent}%</span>
                        </div>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={customDistribution.mudahPercent}
                          onChange={(e) =>
                            setEditingExam({
                              ...editingExam,
                              difficultyDistribution: {
                                ...customDistribution,
                                mudahPercent: parseInt(e.target.value, 10) || 0,
                              },
                            })
                          }
                          className="w-full p-1.5 text-xs rounded border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 font-bold"
                        />
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                          ~{approxMudah} Butir Soal
                        </p>
                      </div>

                      {/* Sedang % */}
                      <div className="p-2.5 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 space-y-1">
                        <div className="flex justify-between text-xs font-bold text-amber-800 dark:text-amber-300">
                          <span>🟡 Soal Sedang</span>
                          <span>{customDistribution.sedangPercent}%</span>
                        </div>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={customDistribution.sedangPercent}
                          onChange={(e) =>
                            setEditingExam({
                              ...editingExam,
                              difficultyDistribution: {
                                ...customDistribution,
                                sedangPercent: parseInt(e.target.value, 10) || 0,
                              },
                            })
                          }
                          className="w-full p-1.5 text-xs rounded border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 font-bold"
                        />
                        <p className="text-[10px] text-amber-600 dark:text-amber-400">
                          ~{approxSedang} Butir Soal
                        </p>
                      </div>

                      {/* Sulit % */}
                      <div className="p-2.5 rounded-lg bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 space-y-1">
                        <div className="flex justify-between text-xs font-bold text-rose-800 dark:text-rose-300">
                          <span>🔴 Soal Sulit (HOTS)</span>
                          <span>{customDistribution.sulitPercent}%</span>
                        </div>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={customDistribution.sulitPercent}
                          onChange={(e) =>
                            setEditingExam({
                              ...editingExam,
                              difficultyDistribution: {
                                ...customDistribution,
                                sulitPercent: parseInt(e.target.value, 10) || 0,
                              },
                            })
                          }
                          className="w-full p-1.5 text-xs rounded border border-rose-300 dark:border-rose-700 bg-white dark:bg-slate-900 font-bold"
                        />
                        <p className="text-[10px] text-rose-600 dark:text-rose-400">
                          ~{approxSulit} Butir Soal
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Date, Time, Duration, KKM */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    value={editingExam.tanggal}
                    onChange={(e) => setEditingExam({ ...editingExam, tanggal: e.target.value })}
                    className="w-full p-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                    Durasi (Menit)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="180"
                    value={editingExam.durasiMenit || 60}
                    onChange={(e) =>
                      setEditingExam({
                        ...editingExam,
                        durasiMenit: parseInt(e.target.value, 10) || 60,
                      })
                    }
                    className="w-full p-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                    KKM
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={editingExam.kkm || 75}
                    onChange={(e) =>
                      setEditingExam({
                        ...editingExam,
                        kkm: parseInt(e.target.value, 10) || 75,
                      })
                    }
                    className="w-full p-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                    Status Ujian
                  </label>
                  <select
                    value={editingExam.status}
                    onChange={(e) => setEditingExam({ ...editingExam, status: e.target.value as any })}
                    className="w-full p-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                  >
                    <option value="AKTIF">AKTIF</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="SELESAI">SELESAI</option>
                  </select>
                </div>
              </div>

              {/* Toggles: Random & Show Results */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <span className="text-xs font-bold uppercase text-slate-500">
                  Parameter Pengacakan & Transparansi
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingExam.randomSoal}
                      onChange={(e) => setEditingExam({ ...editingExam, randomSoal: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Acak Urutan Butir Soal</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingExam.randomJawaban}
                      onChange={(e) =>
                        setEditingExam({ ...editingExam, randomJawaban: e.target.checked })
                      }
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Acak Urutan Opsi Jawaban</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingExam.tampilkanNilai}
                      onChange={(e) =>
                        setEditingExam({ ...editingExam, tampilkanNilai: e.target.checked })
                      }
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Tampilkan Nilai Akhir ke Siswa</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingExam.tampilkanPembahasan}
                      onChange={(e) =>
                        setEditingExam({ ...editingExam, tampilkanPembahasan: e.target.checked })
                      }
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Tampilkan Pembahasan Pasca Submit</span>
                  </label>
                </div>
              </div>

              {/* Sessions Management */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase text-slate-500">
                    Konfigurasi Sesi Ujian (Max 30 Peserta / Sesi)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const cur = editingExam.sessions || [];
                      const nextNum = cur.length + 1;
                      setEditingExam({
                        ...editingExam,
                        sessions: [
                          ...cur,
                          {
                            id: `SES-2026-${Date.now().toString().slice(-4)}-${nextNum}`,
                            nomorSesi: nextNum,
                            nama: `Sesi ${nextNum} (Lab 1)`,
                            kapasitas: 30,
                            waktuMulai: "13:00",
                            waktuSelesai: "14:30",
                            token: generateNewToken(),
                            status: "BELUM_MULAI",
                          },
                        ],
                      });
                    }}
                    className="text-xs font-bold text-indigo-600"
                  >
                    + Tambah Sesi
                  </button>
                </div>

                {(editingExam.sessions || []).map((ses, sIdx) => (
                  <div
                    key={ses.id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-2 items-center text-xs"
                  >
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold">Nama Sesi</label>
                      <input
                        type="text"
                        value={ses.nama}
                        onChange={(e) => {
                          const nextSes = [...(editingExam.sessions || [])];
                          nextSes[sIdx] = { ...ses, nama: e.target.value };
                          setEditingExam({ ...editingExam, sessions: nextSes });
                        }}
                        className="w-full p-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold">Waktu Mulai - Selesai</label>
                      <div className="flex items-center space-x-1">
                        <input
                          type="time"
                          value={ses.waktuMulai}
                          onChange={(e) => {
                            const nextSes = [...(editingExam.sessions || [])];
                            nextSes[sIdx] = { ...ses, waktuMulai: e.target.value };
                            setEditingExam({ ...editingExam, sessions: nextSes });
                          }}
                          className="w-full p-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                        />
                        <span>-</span>
                        <input
                          type="time"
                          value={ses.waktuSelesai}
                          onChange={(e) => {
                            const nextSes = [...(editingExam.sessions || [])];
                            nextSes[sIdx] = { ...ses, waktuSelesai: e.target.value };
                            setEditingExam({ ...editingExam, sessions: nextSes });
                          }}
                          className="w-full p-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold">Token Sesi</label>
                      <div className="flex items-center space-x-1">
                        <input
                          type="text"
                          value={ses.token}
                          onChange={(e) => {
                            const nextSes = [...(editingExam.sessions || [])];
                            nextSes[sIdx] = { ...ses, token: e.target.value };
                            setEditingExam({ ...editingExam, sessions: nextSes });
                          }}
                          className="w-full p-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono font-bold text-indigo-600"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const nextSes = [...(editingExam.sessions || [])];
                            nextSes[sIdx] = { ...ses, token: generateNewToken() };
                            setEditingExam({ ...editingExam, sessions: nextSes });
                          }}
                          title="Generate Token Baru"
                          className="p-1.5 rounded bg-slate-100 dark:bg-slate-700"
                        >
                          <RotateCcw className="w-3 h-3 text-slate-600 dark:text-slate-300" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end space-x-2 pt-2 sm:pt-0">
                      <span className="text-[10px] font-bold text-slate-500">Max 30 Siswa</span>
                      <button
                        type="button"
                        onClick={() => {
                          const nextSes = (editingExam.sessions || []).filter((_, idx) => idx !== sIdx);
                          setEditingExam({ ...editingExam, sessions: nextSes });
                        }}
                        className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-4 border-t dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border text-xs font-bold text-slate-600 dark:text-slate-300"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-md"
              >
                Simpan Jadwal Ujian
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ExamManager;
