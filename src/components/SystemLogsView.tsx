import React, { useState } from "react";
import { SystemLog } from "../types/cbt";
import { ScrollText, Search, ShieldCheck, Clock, Download } from "lucide-react";

interface SystemLogsViewProps {
  logs: SystemLog[];
}

export const SystemLogsView: React.FC<SystemLogsViewProps> = ({ logs }) => {
  const [search, setSearch] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");

  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      l.userName.toLowerCase().includes(search.toLowerCase()) ||
      l.aktivitas.toLowerCase().includes(search.toLowerCase()) ||
      l.detail.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "ALL" || l.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const exportLogsCsv = () => {
    const headers = "ID,Timestamp,User,Role,Aktivitas,Modul,Detail,IP\n";
    const rows = filteredLogs
      .map(
        (l) =>
          `"${l.id}","${l.timestamp}","${l.userName}","${l.role}","${l.aktivitas}","${l.modul}","${l.detail}","${l.ipSession}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Log-Audit-CBT-SMK-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Log Audit & Integritas Sistem
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-black bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              Audit Trail
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Pencatatan riwayat aktivitas login, sinkronisasi autosave, submit ujian, dan deteksi kecurangan.
          </p>
        </div>

        <button
          onClick={exportLogsCsv}
          className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-800 text-xs font-bold flex items-center space-x-2 shadow hover:bg-slate-800"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Log (.CSV)</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari user / aksi / detail log..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
        >
          <option value="ALL">Semua Peran (Guru/Siswa/Sistem)</option>
          <option value="GURU">Guru / Pengawas</option>
          <option value="SISWA">Siswa</option>
        </select>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3 px-4">Waktu</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Aktivitas</th>
                <th className="py-3 px-4">Modul</th>
                <th className="py-3 px-4">Rincian Event</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLogs.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {new Date(l.timestamp).toLocaleTimeString("id-ID")}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900 dark:text-white">{l.userName}</p>
                    <span className="text-[10px] text-slate-400 font-mono uppercase">{l.role}</span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {l.aktivitas}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {l.modul}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{l.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
