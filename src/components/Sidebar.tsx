import React from "react";
import {
  LayoutDashboard,
  FileQuestion,
  CalendarDays,
  Activity,
  Award,
  BarChart3,
  Printer,
  Users2,
  ScrollText,
  Rocket,
  FolderTree,
} from "lucide-react";

export type ActiveTab =
  | "dashboard"
  | "bank-soal"
  | "ujian"
  | "monitoring"
  | "nilai"
  | "analisis"
  | "cetak"
  | "master-data"
  | "logs"
  | "deployment";

interface SidebarProps {
  activeTab?: ActiveTab | string;
  activeMenu?: ActiveTab | string;
  onSelectTab?: (tab: ActiveTab) => void;
  onSelectMenu?: (tab: string) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  examCount?: number;
  bankCount?: number;
  violationCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  activeMenu,
  onSelectTab,
  onSelectMenu,
  isMobileOpen,
  onCloseMobile,
  examCount,
  bankCount,
  violationCount,
}) => {
  const currentActive = activeTab || activeMenu || "dashboard";
  const menuItems: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "bank-soal", label: "Bank Soal (5 Model)", icon: FileQuestion, badge: bankCount !== undefined ? `${bankCount}` : "AI Ready" },
    { id: "ujian", label: "Jadwal & Sesi Ujian", icon: CalendarDays, badge: examCount !== undefined ? `${examCount}` : "30/Sesi" },
    { id: "monitoring", label: "Live Monitoring", icon: Activity, badge: violationCount && violationCount > 0 ? `⚠️ ${violationCount}` : "Realtime" },
    { id: "nilai", label: "Koreksi & Nilai", icon: Award },
    { id: "analisis", label: "Analisis Butir Soal", icon: BarChart3 },
    { id: "cetak", label: "Cetak & Naskah Offline", icon: Printer },
    { id: "master-data", label: "Master Data SMK", icon: Users2 },
    { id: "logs", label: "Log Audit Sistem", icon: ScrollText },
    { id: "deployment", label: "Deploy & Source (14 .gs)", icon: Rocket, badge: "Cloudflare" },
  ];

  const handleSelect = (tab: ActiveTab) => {
    if (onSelectTab) onSelectTab(tab);
    if (onSelectMenu) onSelectMenu(tab);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside className="w-64 flex-shrink-0 hidden md:block bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 min-h-[calc(100vh-65px)] p-4 transition-colors">
      <div className="space-y-1">
        <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          Menu Manajemen CBT
        </p>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            currentActive === item.id ||
            (item.id === "bank-soal" && currentActive === "bankSoal") ||
            (item.id === "ujian" && currentActive === "exams") ||
            (item.id === "nilai" && (currentActive === "grading" || currentActive === "analisis")) ||
            (item.id === "cetak" && currentActive === "printReports") ||
            (item.id === "master-data" && currentActive === "masterData");
          return (
            <button
              key={item.id}
              id={`sidebar-item-${item.id}`}
              onClick={() => handleSelect(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <div className="flex items-center space-x-3 truncate">
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                    isActive
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Pro Info Box */}
      <div className="mt-8 p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-lg space-y-2">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <p className="text-[11px] font-bold text-slate-200">Session Mode Active</p>
        </div>
        <p className="text-[10px] text-slate-300 leading-relaxed">
          Dirancang untuk <strong>30 siswa serempak</strong> per sesi menggunakan Google Apps Script tanpa quota jebol.
        </p>
      </div>
    </aside>
  );
};
