import React, { useState, useEffect } from "react";
import {
  User,
  Ujian,
  BankSoal,
  NilaiSiswa,
  Kelas,
  Mapel,
  PelanggaranLog,
  SchoolConfig,
  SystemLog,
  ExamSessionState,
} from "./types/cbt";
import { StorageService } from "./services/storageService";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { DashboardGuru } from "./components/DashboardGuru";
import { BankSoalManager } from "./components/BankSoalManager";
import { ExamManager } from "./components/ExamManager";
import { LiveMonitoring } from "./components/LiveMonitoring";
import { GradingAndAnalysis } from "./components/GradingAndAnalysis";
import { PrintAndReports } from "./components/PrintAndReports";
import { MasterDataManager } from "./components/MasterDataManager";
import { SystemLogsView } from "./components/SystemLogsView";
import { DeploymentHub } from "./components/DeploymentHub";
import { StudentExamView } from "./components/StudentExamView";
import { LoginView } from "./components/LoginView";

export function App() {
  // Navigation & Theme
  const [activeRole, setActiveRole] = useState<"GURU" | "SISWA">("GURU");
  const [activeMenu, setActiveMenu] = useState<string>("dashboard");
  const [darkMode, setDarkMode] = useState<boolean>(() => StorageService.getThemePreference());
  const [selectedMonitoringExamId, setSelectedMonitoringExamId] = useState<string>("");

  // App State from Storage
  const [currentUser, setCurrentUser] = useState<User | null>(() => StorageService.getCurrentUser());
  const [schoolConfig, setSchoolConfig] = useState<SchoolConfig>(StorageService.getSchoolConfig());
  const [bankSoalList, setBankSoalList] = useState<BankSoal[]>(StorageService.getBankSoalList());
  const [exams, setExams] = useState<Ujian[]>(StorageService.getExams());
  const [students, setStudents] = useState<User[]>(StorageService.getStudents());
  const [classes, setClasses] = useState<Kelas[]>(StorageService.getClasses());
  const [subjects, setSubjects] = useState<Mapel[]>(StorageService.getSubjects());
  const [nilaiList, setNilaiList] = useState<NilaiSiswa[]>(StorageService.getNilaiList());
  const [violations, setViolations] = useState<PelanggaranLog[]>(StorageService.getPelanggaranList());
  const [logs, setLogs] = useState<SystemLog[]>(StorageService.getLogs());

  // Dark mode effect & persistence
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    StorageService.setThemePreference(darkMode);
  }, [darkMode]);

  const handleToggleTheme = () => {
    setDarkMode((prev) => !prev);
  };

  // Auth Handlers
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    StorageService.setCurrentUser(user);
    if (user.role === "SISWA") {
      setActiveRole("SISWA");
    } else {
      setActiveRole("GURU");
    }
    StorageService.logActivity(user.id, user.name, user.role, "LOGIN", "AUTH", `User ${user.name} berhasil login`);
    setLogs(StorageService.getLogs());
  };

  const handleLogout = () => {
    if (currentUser) {
      StorageService.logActivity(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        "LOGOUT",
        "AUTH",
        `User ${currentUser.name} logout dari sistem`
      );
    }
    setCurrentUser(null);
    StorageService.setCurrentUser(null);
    setLogs(StorageService.getLogs());
  };

  const handleSelectUser = (user: User) => {
    setCurrentUser(user);
    StorageService.setCurrentUser(user);
    if (user.role === "SISWA") {
      setActiveRole("SISWA");
    } else {
      setActiveRole("GURU");
    }
    StorageService.logActivity(user.id, user.name, user.role, "SWITCH_USER", "AUTH", `Beralih ke akun ${user.name}`);
    setLogs(StorageService.getLogs());
  };

  // Sync state helpers
  const handleSaveBankSoal = (list: BankSoal[]) => {
    StorageService.saveBankSoalList(list);
    setBankSoalList(list);
  };

  const handleSaveExams = (list: Ujian[]) => {
    StorageService.saveExams(list);
    setExams(list);
  };

  const handleSaveSingleExam = (exam: Ujian) => {
    StorageService.saveExam(exam);
    setExams(StorageService.getExams());
  };

  const handleUpdateNilai = (updated: NilaiSiswa) => {
    StorageService.addNilai(updated);
    setNilaiList(StorageService.getNilaiList());
  };

  const handleSaveStudents = (list: User[]) => {
    StorageService.saveStudents(list);
    setStudents(list);
  };

  const handleSaveClasses = (list: Kelas[]) => {
    StorageService.saveClasses(list);
    setClasses(list);
  };

  const handleSaveSubjects = (list: Mapel[]) => {
    StorageService.saveSubjects(list);
    setSubjects(list);
  };

  const handleSaveSchoolConfig = (cfg: SchoolConfig) => {
    StorageService.saveSchoolConfig(cfg);
    setSchoolConfig(cfg);
  };

  const handleResetDatabase = () => {
    if (window.confirm("Reset ulang seluruh database ke contoh data awal SMK?")) {
      StorageService.resetDatabase();
      setBankSoalList(StorageService.getBankSoalList());
      setExams(StorageService.getExams());
      setStudents(StorageService.getStudents());
      setClasses(StorageService.getClasses());
      setSubjects(StorageService.getSubjects());
      setNilaiList(StorageService.getNilaiList());
      setViolations(StorageService.getPelanggaranList());
      setLogs(StorageService.getLogs());
      setSchoolConfig(StorageService.getSchoolConfig());
      setCurrentUser(StorageService.getCurrentUser());
      alert("Database CBT SMK berhasil direset ke data inisial!");
    }
  };

  // If user is not logged in, render the Login View
  if (!currentUser) {
    return (
      <LoginView
        schoolConfig={schoolConfig}
        allUsers={StorageService.getUsers()}
        onLoginSuccess={handleLogin}
        darkMode={darkMode}
        onToggleTheme={handleToggleTheme}
      />
    );
  }

  // Active exam for monitoring
  const activeMonitoringExam =
    exams.find((e) => e.id === selectedMonitoringExamId) || exams[0] || null;

  return (
    <div className={`min-h-screen ${darkMode ? "dark bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"} font-sans antialiased transition-colors`}>
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        activeRole={activeRole}
        darkMode={darkMode}
        schoolConfig={schoolConfig}
        allStudents={students}
        allUsers={StorageService.getUsers()}
        onRoleChange={(role) => {
          if (role === "DEPLOYMENT") {
            setActiveMenu("deployment");
            setActiveRole("GURU");
          } else {
            setActiveRole(role);
          }
        }}
        onLogout={handleLogout}
        onToggleTheme={handleToggleTheme}
        onSelectStudent={(student) => handleSelectUser(student)}
        onSelectUser={handleSelectUser}
        onOpenDeploymentHub={() => {
          setActiveRole("GURU");
          setActiveMenu("deployment");
        }}
        onResetDatabase={handleResetDatabase}
      />

      {/* Main Role Routing */}
      {activeRole === "SISWA" ? (
        <main className="w-full">
          <StudentExamView
            currentStudent={currentUser}
            exams={exams}
            bankSoalList={bankSoalList}
            schoolConfig={schoolConfig}
            darkMode={darkMode}
            onToggleTheme={handleToggleTheme}
            onLogout={handleLogout}
            onFinishExam={(result) => {
              setNilaiList(StorageService.getNilaiList());
              setLogs(StorageService.getLogs());
            }}
            onRecordViolation={(log) => {
              setViolations(StorageService.getPelanggaranList());
              setLogs(StorageService.getLogs());
            }}
          />
        </main>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 flex-shrink-0">
            <Sidebar
              activeTab={activeMenu}
              activeMenu={activeMenu}
              onSelectTab={(m) => setActiveMenu(m)}
              onSelectMenu={(m) => setActiveMenu(m)}
              examCount={exams?.length || 0}
              bankCount={bankSoalList?.length || 0}
              violationCount={violations?.length || 0}
            />
          </div>

          {/* Teacher Content Workspace */}
          <div className="flex-1 min-w-0">
            {activeMenu === "dashboard" && (
              <DashboardGuru
                schoolConfig={schoolConfig}
                exams={exams || []}
                bankSoalList={bankSoalList || []}
                students={students || []}
                nilaiList={nilaiList || []}
                violations={violations || []}
                pelanggaranList={violations || []}
                onNavigate={(m) => setActiveMenu(m)}
              />
            )}

            {(activeMenu === "bankSoal" || activeMenu === "bank-soal") && (
              <BankSoalManager
                bankSoalList={bankSoalList || []}
                subjects={subjects || []}
                classes={classes || []}
                onSaveBankSoalList={handleSaveBankSoal}
              />
            )}

            {(activeMenu === "exams" || activeMenu === "ujian") && (
              <ExamManager
                exams={exams || []}
                bankSoalList={bankSoalList || []}
                classes={classes || []}
                subjects={subjects || []}
                onSaveExam={handleSaveSingleExam}
                onNavigateToMonitoring={(examId) => {
                  setSelectedMonitoringExamId(examId);
                  setActiveMenu("monitoring");
                }}
              />
            )}

            {activeMenu === "monitoring" && (
              activeMonitoringExam ? (
                <div className="space-y-4">
                  {/* Exam switcher if multiple exams exist */}
                  <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      Pilih Paket Ujian yang Dimonitor:
                    </span>
                    <select
                      value={activeMonitoringExam.id}
                      onChange={(e) => setSelectedMonitoringExamId(e.target.value)}
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                    >
                      {(exams || []).map((ex) => (
                        <option key={ex.id} value={ex.id}>
                          {ex.nama} ({ex.status})
                        </option>
                      ))}
                    </select>
                  </div>

                  <LiveMonitoring
                    activeExam={activeMonitoringExam}
                    students={students || []}
                    nilaiList={nilaiList || []}
                    pelanggaranList={violations || []}
                    onResetStudentSession={(studentId) => {
                      StorageService.clearExamState(activeMonitoringExam.id, studentId);
                      alert(`Sesi siswa telah direset. Siswa dapat login kembali.`);
                    }}
                    onAddTime={(studentId, minutes) => {
                      alert(`Waktu ujian siswa berhasil ditambahkan +${minutes} menit.`);
                    }}
                    onForceSubmit={(studentId) => {
                      alert(`Ujian siswa berhasil disubmit paksa oleh pengawas.`);
                    }}
                    onBroadcastMessage={(msg) => {
                      StorageService.logActivity(
                        currentUser.id,
                        currentUser.name,
                        "GURU",
                        "BROADCAST",
                        "LIVE_MONITORING",
                        msg
                      );
                      setLogs(StorageService.getLogs());
                    }}
                  />
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
                  <p className="text-slate-600 dark:text-slate-300 font-medium">
                    Belum ada paket ujian aktif untuk dimonitor. Silakan buat paket ujian terlebih dahulu.
                  </p>
                  <button
                    onClick={() => setActiveMenu("ujian")}
                    className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs"
                  >
                    Buka Manajemen Ujian
                  </button>
                </div>
              )
            )}

            {(activeMenu === "grading" || activeMenu === "nilai" || activeMenu === "analisis") && (
              <GradingAndAnalysis
                nilaiList={nilaiList || []}
                exams={exams || []}
                bankSoalList={bankSoalList || []}
                onUpdateNilai={handleUpdateNilai}
              />
            )}

            {(activeMenu === "printReports" || activeMenu === "cetak") && (
              <PrintAndReports
                schoolConfig={schoolConfig}
                exams={exams || []}
                students={students || []}
                nilaiList={nilaiList || []}
                bankSoalList={bankSoalList || []}
              />
            )}

            {(activeMenu === "masterData" || activeMenu === "master-data") && (
              <MasterDataManager
                students={students || []}
                classes={classes || []}
                subjects={subjects || []}
                schoolConfig={schoolConfig}
                onSaveStudents={handleSaveStudents}
                onSaveClasses={handleSaveClasses}
                onSaveSubjects={handleSaveSubjects}
                onSaveSchoolConfig={handleSaveSchoolConfig}
              />
            )}

            {activeMenu === "logs" && <SystemLogsView logs={logs || []} />}

            {activeMenu === "deployment" && <DeploymentHub />}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
