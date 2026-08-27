import React, { useState, useEffect, useRef } from "react";
import { User, SchoolConfig } from "../types/cbt";
import {
  GraduationCap,
  ShieldCheck,
  Moon,
  Sun,
  LogOut,
  Clock,
  Download,
  Users,
  ChevronDown,
  UserCheck,
  Sparkles
} from "lucide-react";

interface NavbarProps {
  currentUser: User | null;
  activeRole?: "GURU" | "SISWA" | "DEPLOYMENT";
  currentRole?: "GURU" | "SISWA" | "DEPLOYMENT";
  schoolConfig: SchoolConfig;
  allStudents?: User[];
  allUsers?: User[];
  onRoleChange: (role: "GURU" | "SISWA" | "DEPLOYMENT") => void;
  onLogout: () => void;
  darkMode?: boolean;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
  onToggleDarkMode?: () => void;
  onSelectStudent?: (student: User) => void;
  onSelectUser?: (user: User) => void;
  onOpenDeploymentHub?: () => void;
  onResetDatabase?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeRole,
  currentRole,
  schoolConfig,
  allStudents = [],
  allUsers = [],
  onRoleChange,
  onLogout,
  darkMode,
  isDarkMode,
  onToggleTheme,
  onToggleDarkMode,
  onSelectStudent,
  onSelectUser,
  onOpenDeploymentHub,
}) => {
  const [timeStr, setTimeStr] = useState<string>("");
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const effectiveRole = activeRole || currentRole || "GURU";
  const effectiveDarkMode = darkMode !== undefined ? darkMode : (isDarkMode || false);
  const handleToggle = onToggleTheme || onToggleDarkMode || (() => {});

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZoneName: "short",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const availableStudents = allStudents.length > 0 ? allStudents : allUsers.filter((u) => u.role === "SISWA");
  const availableTeachers = allUsers.filter((u) => u.role === "GURU");

  const handleSelectAccount = (user: User) => {
    setIsUserDropdownOpen(false);
    if (onSelectUser) {
      onSelectUser(user);
    } else if (onSelectStudent && user.role === "SISWA") {
      onSelectStudent(user);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & School Name */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center font-black text-base shadow-md shadow-indigo-500/20">
              CBT
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-slate-900 dark:text-white tracking-tight text-base">
                  CBT SMK
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  v2.5 PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[180px] sm:max-w-xs">
                {schoolConfig.namaSekolah}
              </p>
            </div>
          </div>

          {/* Role Switcher Pills & Status */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Live Clock */}
            <div className="hidden xl:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono font-semibold">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              <span>{timeStr}</span>
            </div>

            {/* Quick Role Switcher */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                id="nav-btn-guru"
                onClick={() => onRoleChange("GURU")}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  effectiveRole === "GURU"
                    ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
                title="Panel Guru & Pengawas"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Panel Guru</span>
              </button>

              <button
                id="nav-btn-siswa"
                onClick={() => onRoleChange("SISWA")}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  effectiveRole === "SISWA"
                    ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
                title="Ruang Ujian Siswa"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ruang Siswa</span>
              </button>

              {onOpenDeploymentHub && (
                <button
                  id="nav-btn-deploy"
                  onClick={onOpenDeploymentHub}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    effectiveRole === "DEPLOYMENT"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-700/50"
                  }`}
                  title="Paket 14 .gs + 16 .html & Custom Domain"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Deploy & Source</span>
                </button>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={handleToggle}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-800 transition-colors"
              title="Ganti Tema Gelap / Terang"
              aria-label="Toggle Theme"
            >
              {effectiveDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* User Profile & Logout / Switch Account */}
            {currentUser ? (
              <div className="relative flex items-center space-x-2 pl-2 border-l border-slate-200 dark:border-slate-800" ref={dropdownRef}>
                {/* User Info Button (Click to toggle Switch Account menu) */}
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-left"
                  title="Klik untuk melihat info akun atau berganti profil"
                >
                  <div className="hidden sm:block text-right">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[130px]">
                      {currentUser.name}
                    </p>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      {currentUser.role} {currentUser.nisn ? `• ${currentUser.nisn}` : ""}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu for Switch Account */}
                {isUserDropdownOpen && (
                  <div className="absolute right-0 top-12 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-2.5 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                        {currentUser.name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {currentUser.role === "SISWA" ? `NISN: ${currentUser.nisn}` : `NIP: ${currentUser.nip || currentUser.username}`}
                      </p>
                    </div>

                    {/* Quick Switch Profiles */}
                    <div className="py-2 space-y-1">
                      <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        Ganti Profil Pengguna Cepat:
                      </span>

                      {/* Teachers list */}
                      {availableTeachers.map((tch) => (
                        <button
                          key={tch.id}
                          onClick={() => handleSelectAccount(tch)}
                          className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                            currentUser.id === tch.id
                              ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold"
                              : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          <span className="truncate">🧑‍🏫 {tch.name}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900 font-bold">Guru</span>
                        </button>
                      ))}

                      {/* Students list sample */}
                      {availableStudents.slice(0, 3).map((std) => (
                        <button
                          key={std.id}
                          onClick={() => handleSelectAccount(std)}
                          className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                            currentUser.id === std.id
                              ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold"
                              : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          <span className="truncate">👨‍🎓 {std.name}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 font-bold">Siswa</span>
                        </button>
                      ))}
                    </div>

                    {/* Logout Button inside dropdown */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => {
                          setIsUserDropdownOpen(false);
                          onLogout();
                        }}
                        className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 dark:text-rose-300 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Keluar / Logout</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Direct Logout Button */}
                <button
                  onClick={onLogout}
                  className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Keluar / Logout Akun"
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onLogout}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm"
              >
                Masuk / Login
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
