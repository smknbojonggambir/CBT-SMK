import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Ujian,
  User,
  BankSoal,
  Question,
  ExamSessionState,
  NilaiSiswa,
  PelanggaranLog,
  SchoolConfig,
} from "../types/cbt";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  ShieldAlert,
  Send,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Award,
  BookOpen,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  Sun,
  Moon
} from "lucide-react";
import { StorageService } from "../services/storageService";

interface StudentExamViewProps {
  currentStudent: User;
  exams: Ujian[];
  bankSoalList: BankSoal[];
  schoolConfig: SchoolConfig;
  darkMode?: boolean;
  onToggleTheme?: () => void;
  onLogout?: () => void;
  onFinishExam: (result: NilaiSiswa) => void;
  onRecordViolation: (log: PelanggaranLog) => void;
}

export const StudentExamView: React.FC<StudentExamViewProps> = ({
  currentStudent,
  exams,
  bankSoalList,
  schoolConfig,
  darkMode = false,
  onToggleTheme,
  onLogout,
  onFinishExam,
  onRecordViolation,
}) => {
  // State: 'LOBBY' | 'EXAM' | 'COMPLETED'
  const [viewState, setViewState] = useState<"LOBBY" | "EXAM" | "COMPLETED">("LOBBY");
  const [selectedExamId, setSelectedExamId] = useState<string>(exams[0]?.id || "");
  const [tokenInput, setTokenInput] = useState<string>("");
  const [tokenError, setTokenError] = useState<string | null>(null);

  // Active Exam Data
  const [activeExam, setActiveExam] = useState<Ujian | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Answers & Flags State: { [questionId]: answerValue }
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});

  // Timer State (in seconds)
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [autoSaveStatus, setAutoSaveStatus] = useState<"SAVED" | "SAVING">("SAVED");

  // Anti-Cheat & Violations
  const [violationCount, setViolationCount] = useState<number>(0);
  const [violationModalMessage, setViolationModalMessage] = useState<string | null>(null);

  // Completed Exam Result
  const [examResult, setExamResult] = useState<NilaiSiswa | null>(null);

  // Font Size Zoom (1 = normal, 1.15 = large, 1.3 = extra large)
  const [fontScale, setFontScale] = useState<number>(1);

  // Confirm Submit Modal
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);

  // Timer Ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize or resume exam
  const handleStartExam = (e: React.FormEvent) => {
    e.preventDefault();
    setTokenError(null);

    const exam = exams.find((ex) => ex.id === selectedExamId);
    if (!exam) {
      setTokenError("Pilih paket ujian terlebih dahulu.");
      return;
    }

    // Verify token: check either tokenGlobal or any session token
    const validTokens = [
      exam.tokenGlobal,
      ...(exam.sessions || []).map((s) => s.token),
    ].filter(Boolean);

    const isTokenMatch = validTokens.some(
      (t) => t?.trim().toUpperCase() === tokenInput.trim().toUpperCase()
    );

    if (!isTokenMatch) {
      setTokenError("Token ujian tidak valid atau sudah kedaluwarsa!");
      return;
    }

    // Load questions from bank
    const bank = bankSoalList.find((b) => b.id === exam.bankSoalId);
    let questionList = [...(bank?.soalList || [])];

    if (exam.randomSoal) {
      // Deterministic or pseudorandom shuffle based on student id
      questionList = questionList.sort(() => Math.random() - 0.5);
    }

    // Check existing saved state (Anti-Reset Engine)
    const existingState = StorageService.getExamState(exam.id, currentStudent.id);

    if (existingState && existingState.status === "SEDANG_MENGERJAKAN") {
      setAnswers(existingState.answers || {});
      setFlagged(existingState.flagged || {});
      setCurrentIndex(existingState.currentIndex || 0);
      setViolationCount(existingState.violationCount || 0);

      // Recalculate remaining time from serverEndTime
      const now = Date.now();
      const remainingSec = Math.max(0, Math.floor((existingState.serverEndTime - now) / 1000));
      setTimeRemaining(remainingSec);
    } else {
      // New exam session
      const durationSeconds = exam.durasiMenit * 60;
      const now = Date.now();
      const serverEndTime = now + durationSeconds * 1000;

      const newState: ExamSessionState = {
        examId: exam.id,
        studentId: currentStudent.id,
        serverStartTime: now,
        serverEndTime: serverEndTime,
        durationMinutes: exam.durasiMenit,
        currentIndex: 0,
        answers: {},
        flagged: {},
        status: "SEDANG_MENGERJAKAN",
        lastActiveTimestamp: now,
        violationCount: 0,
      };

      StorageService.saveExamState(newState);
      setAnswers({});
      setFlagged({});
      setCurrentIndex(0);
      setTimeRemaining(durationSeconds);
    }

    setActiveExam(exam);
    setQuestions(questionList);
    setViewState("EXAM");

    StorageService.logActivity(
      currentStudent.id,
      currentStudent.name,
      "SISWA",
      "LOGIN_EXAM",
      "EXAM",
      `Siswa memulai ujian: ${exam.nama}`
    );
  };

  // Timer Tick
  useEffect(() => {
    if (viewState !== "EXAM" || timeRemaining <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleAutoSubmitTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [viewState]);

  // Periodic Auto-Save every 15s or on question navigation
  useEffect(() => {
    if (viewState !== "EXAM" || !activeExam) return;

    const saveInterval = setInterval(() => {
      setAutoSaveStatus("SAVING");
      const currentState = StorageService.getExamState(activeExam.id, currentStudent.id);
      if (currentState) {
        StorageService.saveExamState({
          ...currentState,
          answers,
          flagged,
          currentIndex,
          violationCount,
        });
      }
      setTimeout(() => setAutoSaveStatus("SAVED"), 600);
    }, 15000);

    return () => clearInterval(saveInterval);
  }, [viewState, activeExam, answers, flagged, currentIndex, violationCount]);

  // Anti-Cheat: Visibility Change & Blur Watcher
  useEffect(() => {
    if (viewState !== "EXAM" || !activeExam) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleTriggerViolation("PINDAH_TAB", "Terdeteksi meninggalkan layar ujian / berganti tab browser.");
      }
    };

    const handleWindowBlur = () => {
      handleTriggerViolation("BLUR_WINDOW", "Terdeteksi jendela ujian kehilangan fokus.");
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Block dev tools and print keys
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C")) ||
        (e.ctrlKey && e.key === "u")
      ) {
        e.preventDefault();
        handleTriggerViolation("DEVTOOLS_ATTEMPT", "Terdeteksi mencoba membuka Developer Tools / Inspect Element.");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [viewState, activeExam]);

  // Trigger violation handler
  const handleTriggerViolation = (jenis: any, keterangan: string) => {
    if (!activeExam) return;
    const newCount = violationCount + 1;
    setViolationCount(newCount);

    const log: PelanggaranLog = {
      id: `PLG-${Date.now()}`,
      examId: activeExam.id,
      studentId: currentStudent.id,
      studentName: currentStudent.name,
      waktu: new Date().toISOString(),
      jenis,
      keterangan: `${keterangan} (Peringatan ke-${newCount})`,
    };

    StorageService.recordPelanggaran(log);
    onRecordViolation(log);

    setViolationModalMessage(
      `⚠️ PERINGATAN INTEGRITAS (${newCount}x): ${keterangan} Pelanggaran ini telah dicatat dan dilaporkan secara langsung ke Pengawas Ruang!`
    );
  };

  // Submit Logic
  const handlePerformSubmit = (submitType: "MANUAL" | "AUTO_TIMEOUT" | "FORCE_PENGAWAS" = "MANUAL") => {
    if (!activeExam) return;

    // Calculate score for all 5 question types
    let scorePG = 0;
    let scorePGK = 0;
    let scoreBS = 0;
    let scorePenjodohan = 0;
    let scoreIsian = 0;

    questions.forEach((q) => {
      const studentAns = answers[q.id];
      if (studentAns === undefined || studentAns === null) return;

      if (q.type === "PG") {
        if (String(studentAns).toUpperCase() === String(q.correctAnswer).toUpperCase()) {
          scorePG += q.score || 10;
        }
      } else if (q.type === "PGK") {
        const correctKeys = Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer];
        const studentKeys = Array.isArray(studentAns) ? studentAns : [studentAns];
        // Exact match of sets
        const isMatch =
          correctKeys.length === studentKeys.length &&
          correctKeys.every((k: string) => studentKeys.includes(k));
        if (isMatch) {
          scorePGK += q.score || 15;
        }
      } else if (q.type === "BENAR_SALAH") {
        if (String(studentAns).toUpperCase() === String(q.correctAnswer).toUpperCase()) {
          scoreBS += q.score || 10;
        }
      } else if (q.type === "PENJODOHAN") {
        // studentAns is array or map of premise -> match
        const correctPairs = q.pairs || [];
        let pairCorrectCount = 0;
        correctPairs.forEach((cp) => {
          if (studentAns && studentAns[cp.premise] === cp.match) {
            pairCorrectCount++;
          }
        });
        if (correctPairs.length > 0) {
          scorePenjodohan += Math.round((pairCorrectCount / correctPairs.length) * (q.score || 20));
        }
      } else if (q.type === "ISIAN") {
        // Simple case-insensitive matching, can be refined in manual grading
        const correctKey = String(q.correctAnswer || "").trim().toLowerCase();
        const givenKey = String(studentAns || "").trim().toLowerCase();
        if (correctKey && givenKey && givenKey.includes(correctKey)) {
          scoreIsian += q.score || 15;
        }
      }
    });

    const totalCalculated = scorePG + scorePGK + scoreBS + scorePenjodohan + scoreIsian;
    const kkm = activeExam.kkm || 75;

    const result: NilaiSiswa = {
      id: `NIL-${Date.now()}`,
      examId: activeExam.id,
      examName: activeExam.nama,
      studentId: currentStudent.id,
      studentName: currentStudent.name,
      nisn: currentStudent.nisn || currentStudent.username,
      kelas: "X-RPL-1",
      sesi: "Sesi 1",
      nilaiPG: scorePG,
      nilaiPGK: scorePGK,
      nilaiBenarSalah: scoreBS,
      nilaiPenjodohan: scorePenjodohan,
      nilaiIsian: scoreIsian,
      nilaiTotal: totalCalculated,
      kkm,
      isLulus: totalCalculated >= kkm,
      statusKoreksi: "OTOMATIS",
      nilaiAwal: totalCalculated,
      waktuMulai: new Date(Date.now() - activeExam.durasiMenit * 60000).toISOString(),
      waktuSubmit: new Date().toISOString(),
      tipeSubmit: submitType,
      totalPelanggaran: violationCount,
      answersSummary: answers,
    };

    StorageService.addNilai(result);
    StorageService.clearExamState(activeExam.id, currentStudent.id);
    onFinishExam(result);

    setExamResult(result);
    setViewState("COMPLETED");
    setIsSubmitModalOpen(false);
  };

  const handleAutoSubmitTimeUp = () => {
    alert("⏱️ WAKTU UJIAN HABIS! Sistem melakukan auto-submit jawaban Anda secara otomatis.");
    handlePerformSubmit("AUTO_TIMEOUT");
  };

  // Active Question
  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const isCurrentFlagged = flagged[currentQuestion?.id || ""] || false;

  // Format Timer String
  const timerString = useMemo(() => {
    const hours = Math.floor(timeRemaining / 3600);
    const mins = Math.floor((timeRemaining % 3600) / 60);
    const secs = timeRemaining % 60;
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    return hours > 0 ? `${pad(hours)}:${pad(mins)}:${pad(secs)}` : `${pad(mins)}:${pad(secs)}`;
  }, [timeRemaining]);

  // ================= 1. LOBBY VIEW =================
  if (viewState === "LOBBY") {
    return (
      <div className="max-w-xl mx-auto py-8 px-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl mx-auto shadow-md shadow-indigo-500/20">
              CBT
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Ruang Ujian Siswa SMK
            </h2>
            <p className="text-xs text-slate-500">{schoolConfig.namaSekolah}</p>
          </div>

          {/* Student Profile Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-bold uppercase">Nama Peserta:</span>
              <span className="font-extrabold text-slate-900 dark:text-white">{currentStudent.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-bold uppercase">NISN:</span>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{currentStudent.nisn}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-bold uppercase">Jurusan:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {currentStudent.jurusan || "Rekayasa Perangkat Lunak"}
              </span>
            </div>
            {onLogout && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                <button
                  type="button"
                  onClick={onLogout}
                  className="text-[11px] font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center gap-1 hover:underline"
                >
                  <span>Bukan Anda? Ganti Akun / Keluar</span>
                </button>
              </div>
            )}
          </div>

          <form onSubmit={handleStartExam} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold uppercase text-slate-500 mb-1">
                Pilih Jadwal Ujian Aktif
              </label>
              <select
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
              >
                {exams
                  .filter((e) => e.status === "AKTIF")
                  .map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.nama} ({ex.durasiMenit} Menit • KKM {ex.kkm})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block font-bold uppercase text-slate-500 mb-1">
                Token Ujian (Diberikan oleh Pengawas)
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: CBT-XDKV-8261"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-black text-center text-base tracking-widest text-indigo-600 dark:text-indigo-400 focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-[10px] text-slate-400 mt-1 text-center">
                *Token sesi tertera di dashboard guru/pengawas ruang.
              </p>
            </div>

            {tokenError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{tokenError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center space-x-2"
            >
              <span>Mulai Mengerjakan Ujian</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Token Hint for Testing */}
          <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 text-center text-xs">
            <span className="text-slate-500">Token Contoh Aktif: </span>
            <button
              type="button"
              onClick={() => setTokenInput("CBT-XDKV-8261")}
              className="font-mono font-extrabold text-indigo-600 dark:text-indigo-400 underline ml-1"
            >
              CBT-XDKV-8261
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ================= 3. COMPLETED VIEW =================
  if (viewState === "COMPLETED" && examResult && activeExam) {
    return (
      <div className="max-w-xl mx-auto py-8 px-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 sm:p-8 space-y-6 text-center">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Ujian Berhasil Disubmit!
            </h2>
            <p className="text-xs text-slate-500">{activeExam.nama}</p>
          </div>

          {/* Score Card if enabled */}
          {activeExam.tampilkanNilai ? (
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Nilai Akhir Anda
              </span>
              <p className="text-5xl font-black text-indigo-600 dark:text-indigo-400">
                {examResult.nilaiTotal}
              </p>
              <div className="flex justify-center space-x-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black ${
                    examResult.isLulus
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                  }`}
                >
                  {examResult.isLulus ? "✓ TUNTAS (MEMENUHI KKM)" : "✕ REMEDIAL (< KKM)"}
                </span>
              </div>

              <div className="grid grid-cols-5 gap-1 text-[11px] pt-2 border-t border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                <div>PG: <strong>{examResult.nilaiPG}</strong></div>
                <div>PGK: <strong>{examResult.nilaiPGK}</strong></div>
                <div>B-S: <strong>{examResult.nilaiBenarSalah}</strong></div>
                <div>Jodoh: <strong>{examResult.nilaiPenjodohan}</strong></div>
                <div>Isian: <strong>{examResult.nilaiIsian}</strong></div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 text-xs">
              Jawaban Anda telah tersimpan di server. Hasil nilai akan diumumkan oleh guru mata pelajaran.
            </div>
          )}

          <div className="space-y-2 text-xs text-slate-500">
            <p>Waktu Submit: {new Date(examResult.waktuSubmit).toLocaleTimeString("id-ID")}</p>
            <p>Total Pelanggaran: {examResult.totalPelanggaran} kali</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => setViewState("LOBBY")}
              className="flex-1 py-3 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 shadow"
            >
              Kembali ke Jadwal Ujian
            </button>
            {onLogout && (
              <button
                onClick={onLogout}
                className="py-3 px-4 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold text-xs hover:bg-rose-100 transition-colors"
              >
                Keluar Akun Siswa
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ================= 2. ACTIVE EXAM WORKSPACE =================
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 pb-12 transition-colors">
      {/* Sticky Exam Top Bar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Exam Title & Autosave Status */}
          <div className="flex items-center space-x-3 truncate">
            <span className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
              {activeExam?.nama}
            </span>
            <span
              className={`hidden sm:inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                autoSaveStatus === "SAVED"
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                  : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 animate-pulse"
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>{autoSaveStatus === "SAVED" ? "💾 Tersimpan" : "Menyimpan..."}</span>
            </span>
          </div>

          {/* Controls: Zoom & Timer & Finish */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            {/* Font Zoom */}
            <div className="hidden sm:flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setFontScale(1)}
                className={`px-2 py-1 rounded text-[10px] font-bold ${fontScale === 1 ? "bg-white dark:bg-slate-700 text-indigo-600 shadow-sm" : "text-slate-500"}`}
                title="Ukuran Normal"
              >
                A
              </button>
              <button
                onClick={() => setFontScale(1.15)}
                className={`px-2 py-1 rounded text-xs font-bold ${fontScale === 1.15 ? "bg-white dark:bg-slate-700 text-indigo-600 shadow-sm" : "text-slate-500"}`}
                title="Ukuran Sedang"
              >
                A+
              </button>
              <button
                onClick={() => setFontScale(1.3)}
                className={`px-2 py-1 rounded text-sm font-bold ${fontScale === 1.3 ? "bg-white dark:bg-slate-700 text-indigo-600 shadow-sm" : "text-slate-500"}`}
                title="Ukuran Ekstra Besar"
              >
                A++
              </button>
            </div>

            {/* Dark Mode Toggle in Exam */}
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                title={darkMode ? "Ganti ke Mode Terang (Light Mode)" : "Ganti ke Mode Gelap (Dark Mode)"}
                className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
              </button>
            )}

            {/* Timer Badge */}
            <div
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl font-mono font-black text-xs shadow-sm ${
                timeRemaining < 300
                  ? "bg-rose-600 text-white animate-pulse"
                  : "bg-slate-900 text-white dark:bg-indigo-600"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{timerString}</span>
            </div>

            {/* Selesai Button */}
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
            >
              Selesai Ujian
            </button>
          </div>
        </div>
      </header>

      {/* Main Examination Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* ================= LEFT: QUESTION CONTENT ================= */}
          <div className="lg:col-span-3 space-y-6">
            {currentQuestion ? (
              <div
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6"
                style={{ fontSize: `${fontScale}rem` }}
              >
                {/* Question Info Bar */}
                <div className="flex items-center justify-between border-b pb-4 dark:border-slate-800 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 rounded-xl bg-indigo-600 text-white font-black text-xs">
                      Soal No. {currentIndex + 1} dari {questions.length}
                    </span>
                    <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                      {currentQuestion.type}
                    </span>
                  </div>

                  <label className="flex items-center space-x-2 cursor-pointer text-amber-600 dark:text-amber-400 font-bold select-none">
                    <input
                      type="checkbox"
                      checked={isCurrentFlagged}
                      onChange={(e) =>
                        setFlagged({ ...flagged, [currentQuestion.id]: e.target.checked })
                      }
                      className="rounded text-amber-500 focus:ring-amber-400"
                    />
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Ragu-Ragu</span>
                  </label>
                </div>

                {/* Question Text */}
                <div className="text-slate-900 dark:text-slate-100 font-medium leading-relaxed">
                  {currentQuestion.question}
                </div>

                {/* Media Linkage if any */}
                {currentQuestion.mediaType && currentQuestion.mediaType !== "none" && currentQuestion.mediaUrl && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                    {currentQuestion.mediaType === "image" && (
                      <img
                        src={currentQuestion.mediaUrl}
                        alt="Lampiran"
                        referrerPolicy="no-referrer"
                        className="max-h-64 rounded-xl object-contain mx-auto"
                      />
                    )}
                  </div>
                )}

                {/* Question Interactive Options based on 5 Types */}
                <div className="pt-2">
                  {/* 1. PG (Pilihan Ganda A-E) */}
                  {currentQuestion.type === "PG" && (
                    <div className="space-y-2.5">
                      {currentQuestion.options?.map((opt) => {
                        const isSelected = answers[currentQuestion.id] === opt.key;
                        return (
                          <div
                            key={opt.key}
                            onClick={() =>
                              setAnswers({ ...answers, [currentQuestion.id]: opt.key })
                            }
                            className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center space-x-3 ${
                              isSelected
                                ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-600 dark:border-indigo-500 text-indigo-900 dark:text-indigo-200 font-bold shadow-sm"
                                : "bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-slate-400 text-slate-800 dark:text-slate-200"
                            }`}
                          >
                            <span
                              className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${
                                isSelected
                                  ? "bg-indigo-600 text-white"
                                  : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                              }`}
                            >
                              {opt.key}
                            </span>
                            <span className="flex-1">{opt.text}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* 2. PGK (Kompleks Multi-select) */}
                  {currentQuestion.type === "PGK" && (
                    <div className="space-y-2.5">
                      <p className="text-[11px] font-bold uppercase text-slate-400 mb-1">
                        Pilihlah satu atau lebih jawaban yang menurut Anda benar:
                      </p>
                      {currentQuestion.options?.map((opt) => {
                        const currentArr = Array.isArray(answers[currentQuestion.id])
                          ? answers[currentQuestion.id]
                          : [];
                        const isChecked = currentArr.includes(opt.key);
                        return (
                          <div
                            key={opt.key}
                            onClick={() => {
                              let nextArr = [...currentArr];
                              if (isChecked) {
                                nextArr = nextArr.filter((k) => k !== opt.key);
                              } else {
                                nextArr.push(opt.key);
                              }
                              setAnswers({ ...answers, [currentQuestion.id]: nextArr });
                            }}
                            className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center space-x-3 ${
                              isChecked
                                ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-600 dark:border-indigo-500 text-indigo-900 dark:text-indigo-200 font-bold shadow-sm"
                                : "bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-slate-400 text-slate-800 dark:text-slate-200"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              readOnly
                              className="rounded text-indigo-600 w-4 h-4"
                            />
                            <span className="font-bold">{opt.key}.</span>
                            <span className="flex-1">{opt.text}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* 3. BENAR_SALAH */}
                  {currentQuestion.type === "BENAR_SALAH" && (
                    <div className="grid grid-cols-2 gap-4">
                      {["BENAR", "SALAH"].map((choice) => {
                        const isSelected = answers[currentQuestion.id] === choice;
                        return (
                          <div
                            key={choice}
                            onClick={() =>
                              setAnswers({ ...answers, [currentQuestion.id]: choice })
                            }
                            className={`p-4 rounded-2xl border text-center cursor-pointer font-black text-sm transition-all ${
                              isSelected
                                ? choice === "BENAR"
                                  ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
                                  : "bg-rose-600 text-white border-rose-600 shadow-md"
                                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {choice === "BENAR" ? "✓ BENAR" : "✕ SALAH"}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* 4. PENJODOHAN */}
                  {currentQuestion.type === "PENJODOHAN" && (
                    <div className="space-y-3">
                      <p className="text-[11px] font-bold uppercase text-slate-400 mb-1">
                        Pilih pasangan yang sesuai untuk setiap premis:
                      </p>
                      {currentQuestion.pairs?.map((pair, pIdx) => {
                        const currentMap = answers[currentQuestion.id] || {};
                        const currentChoice = currentMap[pair.premise] || "";
                        return (
                          <div
                            key={pIdx}
                            className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                          >
                            <span className="font-bold text-slate-900 dark:text-white flex-1">
                              {pair.premise}
                            </span>
                            <div className="flex items-center space-x-2 flex-1">
                              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                              <select
                                value={currentChoice}
                                onChange={(e) => {
                                  const updatedMap = {
                                    ...currentMap,
                                    [pair.premise]: e.target.value,
                                  };
                                  setAnswers({ ...answers, [currentQuestion.id]: updatedMap });
                                }}
                                className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-semibold"
                              >
                                <option value="">-- Pilih Jawaban --</option>
                                {currentQuestion.pairs?.map((optPair, oIdx) => (
                                  <option key={oIdx} value={optPair.match}>
                                    {optPair.match}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* 5. ISIAN */}
                  {currentQuestion.type === "ISIAN" && (
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase text-slate-400">
                        Tuliskan jawaban singkat Anda:
                      </label>
                      <input
                        type="text"
                        placeholder="Ketik jawaban di sini..."
                        value={answers[currentQuestion.id] || ""}
                        onChange={(e) =>
                          setAnswers({ ...answers, [currentQuestion.id]: e.target.value })
                        }
                        className="w-full p-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  )}
                </div>

                {/* Bottom Navigation Buttons */}
                <div className="flex items-center justify-between pt-6 border-t dark:border-slate-800">
                  <button
                    disabled={currentIndex === 0}
                    onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center space-x-1.5 hover:bg-slate-50 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Sebelumnya</span>
                  </button>

                  <button
                    disabled={currentIndex === questions.length - 1}
                    onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md disabled:opacity-40"
                  >
                    <span>Selanjutnya</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">Memuat butir soal...</div>
            )}
          </div>

          {/* ================= RIGHT: NUMBER PALETTE ================= */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                  Navigasi Soal
                </h3>
                <span className="text-xs font-bold text-indigo-600">
                  {answeredCount} / {questions.length} Dijawab
                </span>
              </div>

              {/* Palette Grid */}
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, idx) => {
                  const isAnswered = answers[q.id] !== undefined && answers[q.id] !== "";
                  const isFlag = flagged[q.id];
                  const isCurrent = currentIndex === idx;

                  let bgClass = "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700";
                  if (isFlag) {
                    bgClass = "bg-amber-500 text-white border-amber-600 shadow-sm";
                  } else if (isAnswered) {
                    bgClass = "bg-emerald-600 text-white border-emerald-700 shadow-sm";
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-10 rounded-xl font-mono font-black text-xs border flex items-center justify-center transition-all ${bgClass} ${
                        isCurrent ? "ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900 scale-105" : ""
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="space-y-1.5 pt-3 border-t dark:border-slate-800 text-[11px] font-semibold text-slate-500">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
                  <span>Sudah Dijawab</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                  <span>Ragu-Ragu</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                  <span>Belum Dijawab</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MODAL: CONFIRM SUBMIT ================= */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-5 text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center mx-auto">
              <Send className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Konfirmasi Selesai Ujian
              </h3>
              <p className="text-xs text-slate-500">
                Anda telah menjawab <strong>{answeredCount}</strong> dari <strong>{questions.length}</strong> butir soal.
              </p>
            </div>

            {answeredCount < questions.length && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-semibold">
                ⚠️ Masih ada {questions.length - answeredCount} butir soal yang belum dijawab!
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50"
              >
                Cek Kembali
              </button>
              <button
                onClick={() => handlePerformSubmit("MANUAL")}
                className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md"
              >
                Ya, Submit Ujian
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: VIOLATION WARNING ================= */}
      {violationModalMessage && (
        <div className="fixed inset-0 z-50 bg-rose-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border-2 border-rose-500 shadow-2xl p-6 sm:p-8 space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto animate-bounce">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-black text-rose-600">
              PERINGATAN INTEGRITAS SISTEM
            </h3>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
              {violationModalMessage}
            </p>

            <button
              onClick={() => setViolationModalMessage(null)}
              className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-lg"
            >
              Saya Mengerti & Lanjut Mengerjakan
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
