import React, { useState, useEffect } from "react";
import {
  Ujian,
  User,
  ExamSessionState,
  PelanggaranLog,
  NilaiSiswa,
} from "../types/cbt";
import {
  Activity,
  RefreshCw,
  Search,
  AlertTriangle,
  RotateCcw,
  Clock,
  Send,
  CheckCircle2,
  Lock,
  UserX,
  PlusCircle,
  Megaphone,
  ShieldAlert,
  HelpCircle,
  PlayCircle
} from "lucide-react";

interface LiveMonitoringProps {
  activeExam: Ujian;
  students: User[];
  nilaiList: NilaiSiswa[];
  pelanggaranList: PelanggaranLog[];
  onResetStudentSession: (studentId: string) => void;
  onAddTime: (studentId: string, minutes: number) => void;
  onForceSubmit: (studentId: string) => void;
  onBroadcastMessage: (msg: string) => void;
}

export const LiveMonitoring: React.FC<LiveMonitoringProps> = ({
  activeExam,
  students,
  nilaiList,
  pelanggaranList,
  onResetStudentSession,
  onAddTime,
  onForceSubmit,
  onBroadcastMessage,
}) => {
  const [selectedSessionNumber, setSelectedSessionNumber] = useState<number>(1);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [broadcastText, setBroadcastText] = useState<string>("");
  const [selectedViolationStudent, setSelectedViolationStudent] = useState<User | null>(null);

  // Auto-polling and live simulation state
  const [autoPollInterval, setAutoPollInterval] = useState<number>(5); // in seconds
  const [isAutoPolling, setIsAutoPolling] = useState<boolean>(true);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [liveTick, setLiveTick] = useState<number>(0);

  // Auto-polling interval timer
  useEffect(() => {
    if (!isAutoPolling) return;

    const timer = setInterval(() => {
      setLiveTick((prev) => prev + 1);
      setLastSyncTime(new Date());
    }, autoPollInterval * 1000);

    return () => clearInterval(timer);
  }, [isAutoPolling, autoPollInterval]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setLiveTick((prev) => prev + 1);
    setLastSyncTime(new Date());
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  // Generate simulated or live 30 students per session status
  const sessionStudents = students.slice(0, 30); // 30 students per session SMK standard

  // Map each student status with dynamic live progress
  const studentsWithStatus = sessionStudents.map((s, idx) => {
    const studentNilai = nilaiList.find((n) => n.studentId === s.id && n.examId === activeExam.id);
    const violations = pelanggaranList.filter((p) => p.studentId === s.id);

    let status: "AKTIF" | "IDLE" | "SUBMITTED" | "VIOLATION" | "BELUM_MULAI" = "AKTIF";
    // Dynamic progress calculation influenced by liveTick
    const baseProgress = Math.min(100, Math.floor(((idx * 7) % 5 + 1) * 20));
    const dynamicProgress = Math.min(100, baseProgress + (idx < 20 ? (liveTick % 4) * 2 : 0));
    let progress = dynamicProgress;
    let timeRemaining = Math.max(0, activeExam.durasiMenit * 60 - ((idx * 95 + liveTick * 5) % 1800));

    if (studentNilai) {
      status = "SUBMITTED";
      progress = 100;
      timeRemaining = 0;
    } else if (violations.length > 2) {
      status = "VIOLATION";
    } else if (idx > 25) {
      status = "BELUM_MULAI";
      progress = 0;
    } else if (idx % 7 === 0) {
      status = "IDLE";
    }

    return {
      student: s,
      status,
      progress,
      timeRemaining,
      answeredCount: Math.round((progress / 100) * (activeExam.jumlahSoal || 5)),
      violations,
      lastIp: `192.168.1.${100 + idx + 1}`,
      device: idx % 3 === 0 ? "Chrome (Windows 11)" : "Android 14 (Mobile)",
    };
  });

  const filteredStudents = studentsWithStatus.filter((item) => {
    const matchesFilter = filterStatus === "ALL" || item.status === filterStatus;
    const matchesSearch =
      item.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.student.nisn || "").includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  const countActive = studentsWithStatus.filter((s) => s.status === "AKTIF").length;
  const countSubmitted = studentsWithStatus.filter((s) => s.status === "SUBMITTED").length;
  const countViolation = studentsWithStatus.filter((s) => s.status === "VIOLATION" || s.violations.length > 0).length;
  const countNotStarted = studentsWithStatus.filter((s) => s.status === "BELUM_MULAI").length;

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;
    onBroadcastMessage(broadcastText);
    alert(`📢 Pesan Pengawas berhasil dikirim ke seluruh layar siswa di Sesi ${selectedSessionNumber}!`);
    setBroadcastText("");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Real-time Auto-polling controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Live Monitoring Ujian Real-Time
            </h2>
            <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[10px] font-black text-emerald-700 dark:text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping mr-1"></span>
              LIVE AUTO-SYNC
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Memantau <strong>{activeExam.nama}</strong> • Kapasitas 30 Siswa Sesi {selectedSessionNumber} • Terakhir diperbarui:{" "}
            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
              {lastSyncTime.toLocaleTimeString()}
            </span>
          </p>
        </div>

        {/* Polling interval & Session controls */}
        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          {/* Auto Refresh Toggle */}
          <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setIsAutoPolling(!isAutoPolling)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                isAutoPolling
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
              }`}
            >
              {isAutoPolling ? "⚡ Auto-Poll On" : "⏸ Paused"}
            </button>
            <select
              value={autoPollInterval}
              onChange={(e) => setAutoPollInterval(Number(e.target.value))}
              disabled={!isAutoPolling}
              className="bg-transparent font-bold text-[11px] text-slate-700 dark:text-slate-200 pr-1 py-1 focus:outline-none"
            >
              <option value={3} className="bg-white dark:bg-slate-800">3s</option>
              <option value={5} className="bg-white dark:bg-slate-800">5s</option>
              <option value={10} className="bg-white dark:bg-slate-800">10s</option>
              <option value={30} className="bg-white dark:bg-slate-800">30s</option>
            </select>
            <button
              onClick={handleManualRefresh}
              title="Manual Sync Sekarang"
              className={`p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 ${
                isRefreshing ? "animate-spin text-indigo-600" : ""
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Session Selector */}
          <div className="flex items-center space-x-1">
            {(activeExam.sessions || [
              { nomorSesi: 1, nama: "Sesi 1" },
              { nomorSesi: 2, nama: "Sesi 2" },
            ]).map((ses) => (
              <button
                key={ses.nomorSesi}
                onClick={() => setSelectedSessionNumber(ses.nomorSesi)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedSessionNumber === ses.nomorSesi
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                }`}
              >
                {ses.nama} (30)
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Broadcast Box to All Students */}
      <form
        onSubmit={handleSendBroadcast}
        className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
      >
        <div className="flex items-center space-x-2 text-indigo-600 flex-shrink-0">
          <Megaphone className="w-4 h-4" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Broadcast Pengawas:
          </span>
        </div>
        <input
          type="text"
          placeholder="Kirimkan pengumuman ke seluruh layar ujian siswa (contoh: 'Waktu tersisa 10 menit lagi, harap teliti!')..."
          value={broadcastText}
          onChange={(e) => setBroadcastText(e.target.value)}
          className="flex-1 p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-sm transition-all"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Kirim</span>
        </button>
      </form>

      {/* Real-time Status Counter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => setFilterStatus("AKTIF")}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            filterStatus === "AKTIF"
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-600 shadow-sm"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-emerald-700 dark:text-emerald-300">Aktif Mengerjakan</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2">{countActive}</p>
          <p className="text-[10px] text-slate-500">Siswa tersinkronisasi</p>
        </div>

        <div
          onClick={() => setFilterStatus("SUBMITTED")}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            filterStatus === "SUBMITTED"
              ? "bg-blue-50 dark:bg-blue-950/40 border-blue-400 dark:border-blue-600 shadow-sm"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-blue-700 dark:text-blue-300">Sudah Selesai</span>
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
          </div>
          <p className="text-2xl font-black text-blue-600 mt-2">{countSubmitted}</p>
          <p className="text-[10px] text-slate-500">Nilai sudah terekam</p>
        </div>

        <div
          onClick={() => setFilterStatus("VIOLATION")}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            filterStatus === "VIOLATION"
              ? "bg-rose-50 dark:bg-rose-950/40 border-rose-400 dark:border-rose-600 shadow-sm"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-rose-700 dark:text-rose-300">Pelanggaran</span>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
          </div>
          <p className="text-2xl font-black text-rose-600 mt-2">{countViolation}</p>
          <p className="text-[10px] text-slate-500">Pindah tab / devtools</p>
        </div>

        <div
          onClick={() => setFilterStatus("BELUM_MULAI")}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            filterStatus === "BELUM_MULAI"
              ? "bg-slate-100 dark:bg-slate-800 border-slate-400 shadow-sm"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-600 dark:text-slate-400">Belum Login</span>
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
          </div>
          <p className="text-2xl font-black text-slate-600 dark:text-slate-300 mt-2">{countNotStarted}</p>
          <p className="text-[10px] text-slate-500">Menunggu di ruang ujian</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={() => setFilterStatus("ALL")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              filterStatus === "ALL"
                ? "bg-slate-900 text-white dark:bg-indigo-600"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            Semua (30)
          </button>
          <button
            onClick={() => setFilterStatus("AKTIF")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              filterStatus === "AKTIF"
                ? "bg-emerald-600 text-white"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100"
            }`}
          >
            Aktif ({countActive})
          </button>
          <button
            onClick={() => setFilterStatus("VIOLATION")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              filterStatus === "VIOLATION"
                ? "bg-rose-600 text-white"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100"
            }`}
          >
            Pelanggaran ({countViolation})
          </button>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama siswa / NISN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* 30 Students Monitoring Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3.5 px-4">No</th>
                <th className="py-3.5 px-4">Nama Siswa & NISN</th>
                <th className="py-3.5 px-4">Kelas & IP / Perangkat</th>
                <th className="py-3.5 px-4">Progress Soal</th>
                <th className="py-3.5 px-4">Status & Sisa Waktu</th>
                <th className="py-3.5 px-4">Pelanggaran</th>
                <th className="py-3.5 px-4 text-right">Aksi Pengawas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStudents.map((item, idx) => {
                const s = item.student;
                const minutesLeft = Math.floor(item.timeRemaining / 60);
                const secondsLeft = item.timeRemaining % 60;
                const padSec = secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft;

                return (
                  <tr
                    key={s.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-400">
                      {idx + 1}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900 dark:text-white">{s.name}</p>
                      <p className="text-[10px] font-mono text-slate-400">NISN: {s.nisn}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-700 dark:text-slate-300">X-RPL-1</p>
                      <p className="text-[10px] text-slate-400 truncate max-w-[130px]">
                        {item.lastIp} • {item.device}
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-1 w-28">
                        <div className="flex justify-between text-[10px] font-bold text-slate-500">
                          <span>{item.answeredCount} / {activeExam.jumlahSoal || 5}</span>
                          <span>{item.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              item.progress === 100
                                ? "bg-blue-600"
                                : item.progress > 50
                                ? "bg-emerald-500"
                                : "bg-amber-400"
                            }`}
                            style={{ width: `${item.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <span
                          className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-black ${
                            item.status === "AKTIF"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                              : item.status === "SUBMITTED"
                              ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                              : item.status === "VIOLATION"
                              ? "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 animate-pulse"
                              : item.status === "IDLE"
                              ? "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-800"
                          }`}
                        >
                          <span>● {item.status}</span>
                        </span>
                        {item.status === "AKTIF" && (
                          <p className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400">
                            ⏱️ {minutesLeft}:{padSec}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {item.violations.length > 0 ? (
                        <button
                          onClick={() => setSelectedViolationStudent(s)}
                          className="px-2 py-1 rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-extrabold text-[10px] flex items-center space-x-1 hover:bg-rose-200"
                        >
                          <ShieldAlert className="w-3 h-3 text-rose-600" />
                          <span>{item.violations.length}x Pelanggaran</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium">0x Bersih</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center space-x-1">
                        <button
                          onClick={() => onResetStudentSession(s.id)}
                          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Reset Login Sesi Siswa (Jika crash/restart)"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-indigo-600" />
                        </button>
                        <button
                          onClick={() => onAddTime(s.id, 10)}
                          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Tambah Waktu Ujian (+10 Menit)"
                        >
                          <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                        </button>
                        {item.status !== "SUBMITTED" && (
                          <button
                            onClick={() => onForceSubmit(s.id)}
                            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Paksa Submit Jawaban"
                          >
                            <Lock className="w-3.5 h-3.5 text-rose-600" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Violation Detail Modal */}
      {selectedViolationStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Log Audit Pelanggaran: {selectedViolationStudent.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedViolationStudent(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1 text-xs">
              {pelanggaranList
                .filter((p) => p.studentId === selectedViolationStudent.id)
                .map((v) => (
                  <div
                    key={v.id}
                    className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 space-y-1"
                  >
                    <div className="flex justify-between font-bold text-rose-800 dark:text-rose-200">
                      <span>{v.jenis}</span>
                      <span className="text-[10px] font-mono">{new Date(v.waktu).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px]">{v.keterangan}</p>
                  </div>
                ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedViolationStudent(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
