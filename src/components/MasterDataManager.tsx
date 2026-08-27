import React, { useState } from "react";
import {
  User,
  Kelas,
  Mapel,
  SchoolConfig,
} from "../types/cbt";
import {
  Users,
  School,
  BookOpen,
  GraduationCap,
  Plus,
  Trash2,
  Edit,
  Save,
  CheckCircle2,
  RotateCcw,
  Search,
  Upload,
  Link2
} from "lucide-react";
import { StorageService } from "../services/storageService";

interface MasterDataManagerProps {
  students: User[];
  classes: Kelas[];
  subjects: Mapel[];
  schoolConfig: SchoolConfig;
  onSaveStudents: (list: User[]) => void;
  onSaveClasses: (list: Kelas[]) => void;
  onSaveSubjects: (list: Mapel[]) => void;
  onSaveSchoolConfig: (config: SchoolConfig) => void;
}

export const MasterDataManager: React.FC<MasterDataManagerProps> = ({
  students,
  classes,
  subjects,
  schoolConfig,
  onSaveStudents,
  onSaveClasses,
  onSaveSubjects,
  onSaveSchoolConfig,
}) => {
  const [activeTab, setActiveTab] = useState<"SISWA" | "KELAS" | "MAPEL" | "SEKOLAH">("SISWA");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // School config editable state
  const [cfg, setCfg] = useState<SchoolConfig>({ ...schoolConfig });

  // Student Form Modal
  const [isStudentModalOpen, setIsStudentModalOpen] = useState<boolean>(false);
  const [editingStudent, setEditingStudent] = useState<Partial<User> | null>(null);

  const filteredStudents = students.filter((s) => {
    return (
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.nisn || "").includes(searchQuery)
    );
  });

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSchoolConfig(cfg);
    alert("Identitas dan konfigurasi sekolah berhasil diperbarui!");
  };

  const handleOpenNewStudent = () => {
    setEditingStudent({
      id: `SIS-2026-${Date.now().toString().slice(-4)}`,
      username: `00812345${Date.now().toString().slice(-2)}`,
      name: "",
      nisn: `00812345${Date.now().toString().slice(-2)}`,
      role: "SISWA",
      kelasId: classes[0]?.id || "KLS-2026-0001",
      jurusan: "Rekayasa Perangkat Lunak",
      isActive: true,
    });
    setIsStudentModalOpen(true);
  };

  const handleSaveStudent = () => {
    if (!editingStudent || !editingStudent.name || !editingStudent.nisn) {
      alert("Harap isi nama dan NISN siswa!");
      return;
    }
    const current = [...students];
    const idx = current.findIndex((s) => s.id === editingStudent.id);
    const fullStudent: User = {
      id: editingStudent.id || `SIS-2026-${Date.now()}`,
      username: editingStudent.nisn,
      name: editingStudent.name,
      nisn: editingStudent.nisn,
      role: "SISWA",
      kelasId: editingStudent.kelasId || "KLS-2026-0001",
      jurusan: editingStudent.jurusan || "Rekayasa Perangkat Lunak",
      isActive: true,
    };

    if (idx >= 0) {
      current[idx] = fullStudent;
    } else {
      current.push(fullStudent);
    }

    onSaveStudents(current);
    setIsStudentModalOpen(false);
    setEditingStudent(null);
  };

  const handleDeleteStudent = (id: string) => {
    if (!window.confirm("Hapus siswa ini dari database?")) return;
    onSaveStudents(students.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Master Data & Konfigurasi Sekolah
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-black bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              SMK Database
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola data siswa, rombel kelas kejuruan, mata pelajaran, dan profil institusi.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-x-auto">
          {[
            { key: "SISWA", label: `Siswa (${students.length})`, icon: Users },
            { key: "KELAS", label: `Kelas (${classes.length})`, icon: GraduationCap },
            { key: "MAPEL", label: `Mapel (${subjects.length})`, icon: BookOpen },
            { key: "SEKOLAH", label: "Profil Sekolah & GAS API", icon: School },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: DATA SISWA */}
      {activeTab === "SISWA" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama siswa / NISN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleOpenNewStudent}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tambah Siswa</span>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="py-3 px-4">No</th>
                    <th className="py-3 px-4">NISN / Username</th>
                    <th className="py-3 px-4">Nama Lengkap Siswa</th>
                    <th className="py-3 px-4">Jurusan</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredStudents.map((s, idx) => (
                    <tr key={s.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-bold text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {s.nisn}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {s.name}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {s.jurusan || "Rekayasa Perangkat Lunak"}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          Aktif
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center space-x-1">
                          <button
                            onClick={() => {
                              setEditingStudent({ ...s });
                              setIsStudentModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(s.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DATA KELAS */}
      {activeTab === "KELAS" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {classes.map((k) => (
            <div
              key={k.id}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono font-bold text-xs">
                  {k.kode}
                </span>
                <span className="text-xs font-bold text-slate-500">Tingkat {k.tingkat}</span>
              </div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{k.nama}</h4>
              <div className="text-xs text-slate-500 space-y-1">
                <p>Jurusan: <strong>{k.jurusan}</strong></p>
                <p>Wali Kelas: <strong>{k.waliKelas}</strong></p>
                <p>Kapasitas Siswa: <strong>{k.jumlahSiswa} Orang</strong></p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: DATA MAPEL */}
      {activeTab === "MAPEL" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {subjects.map((m) => (
            <div
              key={m.id}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono font-bold text-xs">
                  {m.kode}
                </span>
                <span className="text-xs font-bold text-slate-500">KKM: {m.kkm}</span>
              </div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{m.nama}</h4>
              <p className="text-xs text-slate-500">Jurusan: <strong>{m.jurusan}</strong></p>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: IDENTITAS SEKOLAH & GAS URL */}
      {activeTab === "SEKOLAH" && (
        <form
          onSubmit={handleSaveConfig}
          className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 max-w-3xl"
        >
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Identitas Resmi Institusi SMK
            </h3>
            <p className="text-xs text-slate-500">
              Data ini otomatis tercetak pada Kartu Peserta, Berita Acara, dan Daftar Hadir Resmi.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold uppercase text-slate-500 mb-1">Nama Sekolah</label>
              <input
                type="text"
                required
                value={cfg.namaSekolah}
                onChange={(e) => setCfg({ ...cfg, namaSekolah: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold uppercase text-slate-500 mb-1">NPSN</label>
              <input
                type="text"
                required
                value={cfg.npsn}
                onChange={(e) => setCfg({ ...cfg, npsn: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold uppercase text-slate-500 mb-1">Alamat Lengkap</label>
              <input
                type="text"
                value={cfg.alamat}
                onChange={(e) => setCfg({ ...cfg, alamat: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold uppercase text-slate-500 mb-1">Nama Kepala Sekolah</label>
              <input
                type="text"
                value={cfg.kepalaSekolah}
                onChange={(e) => setCfg({ ...cfg, kepalaSekolah: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold uppercase text-slate-500 mb-1">NIP Kepala Sekolah</label>
              <input
                type="text"
                value={cfg.nipKepalaSekolah}
                onChange={(e) => setCfg({ ...cfg, nipKepalaSekolah: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold uppercase text-slate-500 mb-1">Tahun Ajaran</label>
              <input
                type="text"
                value={cfg.tahunAjaran}
                onChange={(e) => setCfg({ ...cfg, tahunAjaran: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold uppercase text-slate-500 mb-1">Semester</label>
              <select
                value={cfg.semester}
                onChange={(e) => setCfg({ ...cfg, semester: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
              >
                <option value="Ganjil">Ganjil</option>
                <option value="Genap">Genap</option>
              </select>
            </div>

            <div className="sm:col-span-2 pt-2 border-t dark:border-slate-800 space-y-2">
              <label className="block font-bold uppercase text-indigo-600 dark:text-indigo-400">
                Google Apps Script Web App URL (Live Backend Bridge)
              </label>
              <input
                type="url"
                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                value={cfg.gasWebAppUrl || ""}
                onChange={(e) => setCfg({ ...cfg, gasWebAppUrl: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-indigo-300 dark:border-indigo-800 bg-white dark:bg-slate-800 font-mono text-xs"
              />
              <p className="text-[11px] text-slate-500">
                Tempelkan tautan Web App setelah dideploy dari Google Apps Script Editor untuk sinkronisasi otomatis ke Google Sheets.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md"
            >
              Simpan Profil Sekolah
            </button>
          </div>
        </form>
      )}

      {/* Student Modal */}
      {isStudentModalOpen && editingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Data Peserta Didik
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold uppercase text-slate-500 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Aditya Pratama"
                  value={editingStudent.name || ""}
                  onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-500 mb-1">NISN / Nomor Peserta</label>
                <input
                  type="text"
                  required
                  placeholder="0081234501"
                  value={editingStudent.nisn || ""}
                  onChange={(e) => setEditingStudent({ ...editingStudent, nisn: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-500 mb-1">Jurusan</label>
                <select
                  value={editingStudent.jurusan}
                  onChange={(e) => setEditingStudent({ ...editingStudent, jurusan: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                >
                  <option value="Rekayasa Perangkat Lunak">Rekayasa Perangkat Lunak</option>
                  <option value="Teknik Komputer dan Jaringan">Teknik Komputer dan Jaringan</option>
                  <option value="Desain Komunikasi Visual">Desain Komunikasi Visual</option>
                  <option value="Teknik Kendaraan Ringan">Teknik Kendaraan Ringan</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t dark:border-slate-800">
              <button
                onClick={() => setIsStudentModalOpen(false)}
                className="px-4 py-2 rounded-xl border text-xs font-bold text-slate-600 dark:text-slate-300"
              >
                Batal
              </button>
              <button
                onClick={handleSaveStudent}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md"
              >
                Simpan Siswa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
