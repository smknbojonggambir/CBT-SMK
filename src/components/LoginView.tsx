import React, { useState } from "react";
import { User, SchoolConfig } from "../types/cbt";
import {
  GraduationCap,
  ShieldCheck,
  KeyRound,
  UserCheck,
  ArrowRight,
  Sun,
  Moon,
  School,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  Lock
} from "lucide-react";

interface LoginViewProps {
  schoolConfig: SchoolConfig;
  allUsers: User[];
  onLoginSuccess: (user: User) => void;
  darkMode: boolean;
  onToggleTheme: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  schoolConfig,
  allUsers,
  onLoginSuccess,
  darkMode,
  onToggleTheme,
}) => {
  const [selectedRole, setSelectedRole] = useState<"SISWA" | "GURU">("SISWA");
  const [identifier, setIdentifier] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const students = allUsers.filter((u) => u.role === "SISWA");
  const teachers = allUsers.filter((u) => u.role === "GURU");

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    setTimeout(() => {
      const cleanInput = identifier.trim().toLowerCase();
      let matched: User | undefined;

      if (selectedRole === "SISWA") {
        matched = students.find(
          (s) =>
            s.nisn?.toLowerCase() === cleanInput ||
            s.username.toLowerCase() === cleanInput ||
            s.id.toLowerCase() === cleanInput
        );
      } else {
        matched = teachers.find(
          (g) =>
            g.nip?.replace(/\s+/g, "").toLowerCase() === cleanInput.replace(/\s+/g, "") ||
            g.username.toLowerCase() === cleanInput ||
            g.email?.toLowerCase() === cleanInput
        );
      }

      if (!matched) {
        setErrorMessage(
          selectedRole === "SISWA"
            ? "NISN tidak ditemukan di database peserta ujian. Silakan periksa kembali atau hubungi proktor/pengawas."
            : "NIP / Username Guru tidak ditemukan di database CBT."
        );
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      onLoginSuccess(matched);
    }, 250);
  };

  const handleQuickLogin = (user: User) => {
    onLoginSuccess(user);
  };

  return (
    <div className={`min-h-screen ${darkMode ? "dark bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"} flex flex-col justify-between transition-colors`}>
      {/* Top Header Bar */}
      <header className="px-4 sm:px-8 py-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center font-black text-base shadow-md shadow-indigo-500/20">
            CBT
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold tracking-tight text-base text-slate-900 dark:text-white">
                CBT SMK
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                v2.5 PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {schoolConfig.namaSekolah}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-800 transition-colors"
            title="Ganti Tema Gelap / Terang"
            aria-label="Toggle Theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Login Form Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-6 text-white text-center relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md text-white flex items-center justify-center mx-auto mb-3 shadow-inner">
              <KeyRound className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-black tracking-tight">Portal Masuk CBT SMK</h1>
            <p className="text-xs text-indigo-100 mt-1">
              Sistem Ujian Berbasis Komputer & Google Apps Script
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Role Switcher Tab */}
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => {
                  setSelectedRole("SISWA");
                  setIdentifier("");
                  setErrorMessage(null);
                }}
                className={`py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center space-x-1.5 transition-all ${
                  selectedRole === "SISWA"
                    ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Peserta Siswa</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedRole("GURU");
                  setIdentifier("");
                  setErrorMessage(null);
                }}
                className={`py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center space-x-1.5 transition-all ${
                  selectedRole === "GURU"
                    ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Guru / Proktor</span>
              </button>
            </div>

            {/* Error Notification */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  {selectedRole === "SISWA" ? "Nomor Induk Siswa Nasional (NISN)" : "NIP / Username Guru"}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={
                      selectedRole === "SISWA" ? "Contoh: 0081234501" : "Contoh: guru / 19850115..."
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                  />
                  <div className="absolute right-3 top-3 text-slate-400 pointer-events-none">
                    {selectedRole === "SISWA" ? (
                      <GraduationCap className="w-5 h-5" />
                    ) : (
                      <UserCheck className="w-5 h-5" />
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Kata Sandi (Password)
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi akun Anda"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                  />
                  <div className="absolute right-3 top-3 text-slate-400 pointer-events-none">
                    <Lock className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  *Gunakan kredensial resmi yang tercantum pada Kartu Peserta Ujian / Akun Guru.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-extrabold text-xs shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span>{isSubmitting ? "Memverifikasi..." : "Masuk ke Sistem CBT"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-4 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
        <p className="font-medium">
          {schoolConfig.namaSekolah} • Sistem Ujian Online Berbasis Google Apps Script & Cloud Storage
        </p>
      </footer>
    </div>
  );
};
