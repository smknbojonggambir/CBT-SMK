import React from "react";
import {
  FileQuestion,
  CalendarCheck,
  Users,
  Award,
  AlertTriangle,
  Play,
  Sparkles,
  Printer,
  ShieldCheck,
  ArrowRight,
  BarChart,
  CheckCircle2,
  Clock,
  Layers,
  Activity
} from "lucide-react";
import { BankSoal, Ujian, NilaiSiswa, PelanggaranLog, SchoolConfig, User } from "../types/cbt";
import { ActiveTab } from "./Sidebar";

interface DashboardGuruProps {
  bankSoalList: BankSoal[];
  exams: Ujian[];
  nilaiList: NilaiSiswa[];
  pelanggaranList?: PelanggaranLog[];
  violations?: PelanggaranLog[];
  students?: User[];
  schoolConfig?: SchoolConfig;
  onNavigate: (tab: any) => void;
  onOpenAiGenerator?: () => void;
}

export const DashboardGuru: React.FC<DashboardGuruProps> = ({
  bankSoalList,
  exams,
  nilaiList,
  pelanggaranList,
  violations,
  students,
  schoolConfig,
  onNavigate,
  onOpenAiGenerator,
}) => {
  const rawViolations = violations || pelanggaranList || [];
  const recentViolations = rawViolations.slice(0, 4);
  const activeExams = (exams || []).filter((e) => e.status === "AKTIF");
  const totalQuestions = (bankSoalList || []).reduce((acc, b) => acc + (b.soalList?.length || 0), 0);
  const totalSubmissions = (nilaiList || []).length;
  const needGrading = (nilaiList || []).filter((n) => n.statusKoreksi === "PERLU_KOREKSI_ISIAN").length;

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-indigo-700/50">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>CBT SMK Profesional • Google Apps Script & Sheets Edition</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Dashboard Guru & Manajemen Ujian CBT
          </h1>
          <p className="text-sm text-indigo-100/90 leading-relaxed">
            Sistem asesmen kejuruan SMK yang aman, ringan, dan zero server cost.
            Mendukung 30 siswa serempak per sesi, 5 model soal lengkap, auto-save anti-reset, dan analisis butir soal otomatis.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate("ujian")}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white text-indigo-900 hover:bg-indigo-50 font-extrabold text-xs shadow-md transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-indigo-900" />
              <span>Kelola Jadwal & Sesi</span>
            </button>
            <button
              onClick={onOpenAiGenerator}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 border border-indigo-400/30 text-white font-bold text-xs shadow-md transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Generate Soal AI (Draft)</span>
            </button>
            <button
              onClick={() => onNavigate("monitoring")}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-bold text-xs border border-slate-700 transition-all"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Buka Live Monitoring</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigate("bank-soal")}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-600 cursor-pointer transition-all space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Bank Soal (5 Model)</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <FileQuestion className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{(bankSoalList || []).length}</p>
          <p className="text-xs text-slate-500">{totalQuestions} butir soal tersimpan</p>
        </div>

        <div
          onClick={() => onNavigate("ujian")}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-400 dark:hover:border-emerald-600 cursor-pointer transition-all space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Ujian Aktif</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-600">{activeExams.length}</p>
          <p className="text-xs text-slate-500">Dari total {(exams || []).length} paket ujian</p>
        </div>

        <div
          onClick={() => onNavigate("nilai")}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-400 dark:hover:border-blue-600 cursor-pointer transition-all space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Hasil Submit</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-blue-600">{totalSubmissions}</p>
          <p className="text-xs text-slate-500">{needGrading > 0 ? `${needGrading} perlu koreksi isian` : "Semua terkoreksi otomatis"}</p>
        </div>

        <div
          onClick={() => onNavigate("monitoring")}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-rose-400 dark:hover:border-rose-600 cursor-pointer transition-all space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pelanggaran Terdeteksi</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-rose-600">{rawViolations.length}</p>
          <p className="text-xs text-slate-500">Pindah tab & kecurangan tercatat</p>
        </div>
      </div>

      {/* Active Exams & Session Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Exam Section */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Paket Ujian & Sesi Berlangsung
              </h2>
              <p className="text-xs text-slate-500">
                Pilih ujian untuk memantau pengerjaan siswa secara langsung
              </p>
            </div>
            <button
              onClick={() => onNavigate("ujian")}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
            >
              <span>Lihat Semua</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {exams.slice(0, 3).map((exam) => (
              <div
                key={exam.id}
                className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[11px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                      {exam.kode}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        exam.status === "AKTIF"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                      }`}
                    >
                      ● {exam.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{exam.nama}</h4>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span>📚 {exam.mapelNama}</span>
                    <span>⏱️ {exam.durasiMenit} Menit</span>
                    <span>🎯 KKM: {exam.kkm}</span>
                    <span>👥 {exam.sessions?.length || 1} Sesi (Max 30/Sesi)</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  <button
                    onClick={() => onNavigate("monitoring")}
                    className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm flex items-center space-x-1.5"
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>Monitoring</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Session Guide & Anti-Cheat Feed */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              Optimasi 30 Siswa Serempak
            </h3>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-2">
            <p className="font-semibold text-slate-900 dark:text-white">Tips Anti-Bottleneck Google Apps Script:</p>
            <ul className="space-y-1.5 list-disc list-inside text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              <li>Bagi siswa ke dalam <strong>Sesi 1, 2, 3</strong> (masing-masing 30 peserta).</li>
              <li>Autosave otomatis berjalan di background dengan interval 15 detik.</li>
              <li>Jawaban diamankan di <em>CacheService</em> sebelum sinkronisasi spreadsheet.</li>
              <li>Siswa dapat lanjut ujian seketika jika terjadi gangguan browser.</li>
            </ul>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Pelanggaran Terkini
            </h4>
            {recentViolations.length === 0 ? (
              <p className="text-xs text-emerald-600 font-medium py-2">
                ✓ Belum ada pelanggaran terdeteksi. Lab tertib!
              </p>
            ) : (
              <div className="space-y-2">
                {recentViolations.map((v) => (
                  <div
                    key={v.id}
                    className="p-2.5 rounded-lg bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-xs flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-rose-800 dark:text-rose-300">{v.studentName}</p>
                      <p className="text-[10px] text-rose-600 dark:text-rose-400">{v.keterangan}</p>
                    </div>
                    <span className="text-[10px] font-bold text-rose-500">{v.jenis}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
