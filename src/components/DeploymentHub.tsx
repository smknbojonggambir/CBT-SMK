import React, { useState } from "react";
import JSZip from "jszip";
import { GAS_GS_FILES } from "../gas_package/gasSourceCode";
import { GAS_HTML_FILES } from "../gas_package/gasHtmlTemplates";
import { SHEETS_18_DATABASE, CSV_IMPORT_SOAL_TEMPLATE, CSV_IMPORT_SISWA_TEMPLATE } from "../gas_package/sheetTemplates";
import { MANUAL_BOOK_MARKDOWN } from "../gas_package/manualBook";
import { MASTER_ONE_CLICK_CODE_GS, MASTER_INDEX_HTML } from "../gas_package/masterSingleScript";
import {
  Download,
  Copy,
  Check,
  Code2,
  FileCode,
  Globe,
  Database,
  BookOpen,
  Sparkles,
  Layers,
  Zap,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

export const CLOUDFLARE_WORKER_SCRIPT = `/**
 * Cloudflare Worker Reverse Proxy for Google Apps Script Web App
 * Target Domain: https://cbt.smknbojonggambir.web.id
 */
const GAS_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbyihW8KTB0jvirRHYzPtb_eLZj5ltlN96qOJ_PFK7pQdHOST0QKZnZVoU_er8bbdDWHUA/exec";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const targetUrl = new URL(GAS_WEBAPP_URL);
    
    // Forward query parameters
    url.searchParams.forEach((value, key) => {
      targetUrl.searchParams.set(key, value);
    });

    const init = {
      method: request.method,
      headers: {
        "User-Agent": request.headers.get("User-Agent") || "Mozilla/5.0",
        "Accept": request.headers.get("Accept") || "*/*",
      },
    };

    if (request.method !== "GET" && request.method !== "HEAD") {
      init.body = await request.text();
      init.headers["Content-Type"] = request.headers.get("Content-Type") || "application/x-www-form-urlencoded";
    }

    const response = await fetch(targetUrl.toString(), init);
    const newHeaders = new Headers(response.headers);
    newHeaders.set("Access-Control-Allow-Origin", "*");
    newHeaders.set("X-Frame-Options", "SAMEORIGIN");
    newHeaders.set("X-CBT-SMK-Proxy", "Cloudflare-Worker-v2.5");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  }
};`;

export const DATABASE_INIT_SCRIPT = `/**
 * Skrip Inisialisasi Otomatis Database 18 Sheet CBT SMK
 * Jalankan fungsi initCbtDatabase() di Google Apps Script Editor.
 */
function initCbtDatabase() {
  setupDatabase();
  Logger.log("✅ 18 Tabel Sheet CBT SMK berhasil diinisialisasi dengan struktur header standar.");
}`;

export const DeploymentHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"MASTER_COPY" | "DEPLOY_GUIDE" | "PACKAGE" | "GS_VIEWER" | "HTML_VIEWER" | "CLOUDFLARE" | "DATABASE" | "MANUAL">("DEPLOY_GUIDE");
  const [selectedGsIndex, setSelectedGsIndex] = useState<number>(0);
  const [selectedHtmlIndex, setSelectedHtmlIndex] = useState<number>(0);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [masterViewMode, setMasterViewMode] = useState<"CODE_GS" | "INDEX_HTML">("CODE_GS");

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const selectedGsItem = GAS_GS_FILES[selectedGsIndex] || GAS_GS_FILES[0];
  const selectedHtmlItem = GAS_HTML_FILES[selectedHtmlIndex] || GAS_HTML_FILES[0];

  // Generate complete downloadable ZIP
  const handleDownloadCompleteZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();

      // Master 1-Click Files at root
      zip.file("Code.gs", MASTER_ONE_CLICK_CODE_GS);
      zip.file("Index.html", MASTER_INDEX_HTML);

      // Folder 1: AppsScript (.gs files)
      const gasFolder = zip.folder("AppsScript_Modular");
      if (gasFolder) {
        GAS_GS_FILES.forEach((file) => {
          gasFolder.file(file.filename, file.content);
        });
      }

      // Folder 2: HTML (.html files)
      const htmlFolder = zip.folder("HTML_Modular");
      if (htmlFolder) {
        GAS_HTML_FILES.forEach((file) => {
          htmlFolder.file(file.filename, file.content);
        });
      }

      // Folder 3: Database & Templates
      const dbFolder = zip.folder("Database");
      if (dbFolder) {
        dbFolder.file("00_InitDatabaseScript.gs", DATABASE_INIT_SCRIPT);
        dbFolder.file("18_Sheets_Structure.json", JSON.stringify(SHEETS_18_DATABASE, null, 2));
      }

      // Folder 4: Import Templates
      const importFolder = zip.folder("Import_Templates");
      if (importFolder) {
        importFolder.file("Template-Import-Soal.csv", CSV_IMPORT_SOAL_TEMPLATE);
        importFolder.file("Template-Import-Siswa.csv", CSV_IMPORT_SISWA_TEMPLATE);
      }

      // Folder 5: Cloudflare Worker
      const cfFolder = zip.folder("Cloudflare_Custom_Domain");
      if (cfFolder) {
        cfFolder.file("_worker.js", CLOUDFLARE_WORKER_SCRIPT);
        cfFolder.file("wrangler.toml", `name = "cbt-smk-proxy"\nmain = "_worker.js"\ncompatibility_date = "2026-08-26"`);
      }

      // Root files: Manual Book & Readme
      zip.file("MANUAL_INSTALASI_CBT_SMK.md", MANUAL_BOOK_MARKDOWN);
      zip.file(
        "README.md",
        `# CBT SMK Profesional v2.5 PRO
Google Sheets Database + Google Apps Script Backend + Cloudflare Custom Domain.

## Cara Pakai Paling Cepat (1-Click):
1. Buat Spreadsheet baru di https://sheets.new
2. Buka Ekstensi > Apps Script
3. Copy isi file 'Code.gs' dan 'Index.html'
4. Jalankan fungsi 'setupAllSheetsDatabase' -> 18 Sheet langsung jadi otomatis!
5. Klik Deploy > New Deployment > Web App (Access: Anyone)

## Struktur Direktori:
- Code.gs : Master all-in-one Apps Script (Backend + Auto-Setup 18 Sheets)
- Index.html : Master responsive frontend UI
- /AppsScript_Modular : ${GAS_GS_FILES.length} file .gs terpisah
- /HTML_Modular : ${GAS_HTML_FILES.length} template UI terpisah
- /Database : Skrip auto-setup 18 sheets
- /Import_Templates : Template CSV Soal & Siswa
- /Cloudflare_Custom_Domain : Proxy custom domain (cbt.sekolah.sch.id)
- MANUAL_INSTALASI_CBT_SMK.md : Panduan instalasi lengkap Bagian A s.d V.
`
      );

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Paket-CBT-SMK-GoogleAppsScript-v2.5.zip`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert("Gagal membuat file ZIP: " + err.message);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Pusat Deployment & Source Code Google Apps Script
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-black bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              1-Click Setup • 18 Sheets Database
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Tinggal salin kode master ke Google Apps Script editor, 18 tabel sheet database, kode backend (.gs), dan antarmuka web (.html) langsung siap pakai.
          </p>
        </div>

        <button
          onClick={handleDownloadCompleteZip}
          disabled={isZipping}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-extrabold text-xs flex items-center space-x-2 shadow-lg transition-all self-start sm:self-auto disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{isZipping ? "Membuat ZIP..." : "Download Paket Lengkap (ZIP)"}</span>
        </button>
      </div>

      {/* Nav Tabs */}
      <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-x-auto">
        {[
          { key: "MASTER_COPY", label: "⚡ 1-Click Copy Master", icon: Zap, highlight: true },
          { key: "DEPLOY_GUIDE", label: "🚀 Panduan Deploy (GitHub + Sheet + GAS)", icon: Globe, highlight: true },
          { key: "PACKAGE", label: "📦 Ringkasan Arsitektur", icon: Layers },
          { key: "GS_VIEWER", label: `📜 ${GAS_GS_FILES.length} File .GS Modular`, icon: Code2 },
          { key: "HTML_VIEWER", label: `🌐 ${GAS_HTML_FILES.length} File .HTML Modular`, icon: FileCode },
          { key: "DATABASE", label: "📊 18 Tabel Sheets", icon: Database },
          { key: "CLOUDFLARE", label: "☁️ Custom Domain", icon: Globe },
          { key: "MANUAL", label: "📖 Buku Manual", icon: BookOpen },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? tab.highlight
                    ? "bg-indigo-600 text-white shadow-md"
                    : "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm"
                  : tab.highlight
                  ? "text-indigo-600 dark:text-indigo-400 font-extrabold hover:bg-indigo-50 dark:hover:bg-indigo-950"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB: 1-CLICK MASTER COPY (TINGGAL COPY LANGSUNG JADI) */}
      {activeTab === "MASTER_COPY" && (
        <div className="space-y-6">
          {/* Quick Steps Bar */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white shadow-xl border border-indigo-800/40 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <span className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-sm">
                  ⚡
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    Panduan 3 Menit: Copy Script Langsung Jadi 18 Sheet & Web App
                  </h3>
                  <p className="text-xs text-indigo-200">
                    Tidak perlu copy belasan file satu-per-satu. Cukup salin <strong>Code.gs</strong> dan <strong>Index.html</strong> di bawah!
                  </p>
                </div>
              </div>
              <a
                href="https://sheets.new"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-white text-indigo-900 font-extrabold text-xs hover:bg-indigo-50 flex items-center space-x-1.5 shadow self-start sm:self-auto"
              >
                <span>Buka Google Sheet Baru (sheets.new)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1.5 text-xs">
                <div className="flex items-center space-x-2 font-bold text-amber-300">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>1. Tempel Code.gs</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Buka menu <strong>Ekstensi &gt; Apps Script</strong> di Google Sheet, paste kode <strong>Code.gs</strong>.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1.5 text-xs">
                <div className="flex items-center space-x-2 font-bold text-emerald-300">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>2. Jalankan Auto-Setup</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Pilih fungsi <code>setupAllSheetsDatabase</code> & klik <strong>Run / Jalankan</strong> (atau buka menu <em>🎓 CBT SMK PRO</em> di sheet).
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1.5 text-xs">
                <div className="flex items-center space-x-2 font-bold text-sky-300">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>3. Deploy Web App</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Klik <strong>Deploy &gt; New deployment &gt; Web app</strong> (Set: <em>Who has access: Anyone</em>). Web app CBT siap digunakan!
                </p>
              </div>
            </div>
          </div>

          {/* Master Code Selector & Copy Box */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setMasterViewMode("CODE_GS")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                    masterViewMode === "CODE_GS"
                      ? "bg-indigo-600 text-white shadow"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>File 1: Code.gs (Backend & Auto-Setup 18 Sheets)</span>
                </button>

                <button
                  onClick={() => setMasterViewMode("INDEX_HTML")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                    masterViewMode === "INDEX_HTML"
                      ? "bg-emerald-600 text-white shadow"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>File 2: Index.html (Frontend Web App)</span>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    copyToClipboard(
                      masterViewMode === "CODE_GS" ? MASTER_ONE_CLICK_CODE_GS : MASTER_INDEX_HTML,
                      masterViewMode
                    )
                  }
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-extrabold text-xs flex items-center space-x-1.5 shadow transition-all"
                >
                  {copiedKey === masterViewMode ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedKey === masterViewMode ? "Tersalin ke Clipboard!" : `Salin ${masterViewMode === "CODE_GS" ? "Code.gs" : "Index.html"}`}</span>
                </button>
              </div>
            </div>

            {/* Code Display */}
            <div className="bg-slate-950 text-slate-100 rounded-3xl p-5 border border-slate-800 font-mono text-xs shadow-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                  <span className="font-bold text-slate-300 ml-2">
                    {masterViewMode === "CODE_GS" ? "Code.gs (All-In-One Script + Auto 18 Sheets)" : "Index.html (Portal Siswa & Guru)"}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-sans">
                  {masterViewMode === "CODE_GS" ? "Otomatis menghasilkan 18 Sheets, Header berwarna, & Data Demo" : "Responsive UI Tailwind CSS"}
                </span>
              </div>

              <pre className="overflow-x-auto max-h-[550px] text-xs leading-relaxed text-slate-300 scrollbar-thin">
                <code>{masterViewMode === "CODE_GS" ? MASTER_ONE_CLICK_CODE_GS : MASTER_INDEX_HTML}</code>
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB: PANDUAN DEPLOY LENGKAP (GITHUB, GOOGLE SHEET, APPS SCRIPT) */}
      {activeTab === "DEPLOY_GUIDE" && (
        <div className="space-y-6">
          {/* Header Overview */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white border border-indigo-800/40 shadow-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Panduan Resmi Produksi
                </span>
                <h3 className="text-lg font-black text-white mt-1">
                  Panduan Deploy 3 Langkah: Google Sheets, Apps Script, & GitHub
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Ikuti urutan langkah di bawah ini untuk mengaktifkan sistem CBT SMK di Google Cloud dan menyimpan source code di repositori GitHub Anda.
                </p>
              </div>

              <button
                onClick={handleDownloadCompleteZip}
                disabled={isZipping}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs flex items-center space-x-2 shadow-lg self-start sm:self-auto flex-shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>{isZipping ? "Membuat ZIP..." : "Download Source Code (.ZIP)"}</span>
              </button>
            </div>
          </div>

          {/* STEP 1: GOOGLE SHEETS & 18 TABEL DATABASE */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center space-x-3 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center font-black text-base">
                1
              </div>
              <div>
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Langkah 1: Setup Google Sheet & Inisialisasi Otomatis 18 Tabel
                </h4>
                <p className="text-xs text-slate-500">
                  Membuat database Google Sheets di Google Drive Anda
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="font-bold text-slate-900 dark:text-white block">1.1 Buat Sheet Baru</span>
                <p className="text-slate-500 leading-relaxed">
                  Buka tab baru lalu ketik <strong>sheets.new</strong> di browser Anda (atau buka Google Drive &gt; Baru &gt; Google Spreadsheet).
                </p>
                <a
                  href="https://sheets.new"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1 font-bold text-indigo-600 dark:text-indigo-400 hover:underline pt-1"
                >
                  <span>Buka sheets.new sekarang</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="font-bold text-slate-900 dark:text-white block">1.2 Beri Nama Spreadsheet</span>
                <p className="text-slate-500 leading-relaxed">
                  Ubah judul spreadsheet menjadi <strong>DATABASE CBT SMK NEGERI 1</strong>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="font-bold text-slate-900 dark:text-white block">1.3 Buka Apps Script</span>
                <p className="text-slate-500 leading-relaxed">
                  Di Google Sheet, klik menu <strong>Ekstensi (Extensions)</strong> &gt; <strong>Apps Script</strong>. Tab editor skrip akan terbuka.
                </p>
              </div>
            </div>
          </div>

          {/* STEP 2: GOOGLE APPS SCRIPT (CODE.GS & INDEX.HTML) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center space-x-3 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-black text-base">
                2
              </div>
              <div>
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Langkah 2: Tempel Kode & Deploy Web App (Google Apps Script)
                </h4>
                <p className="text-xs text-slate-500">
                  Memasang backend, antarmuka frontend, dan mempublikasikan Web App
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    2.1 Tempel Script Backend (Code.gs)
                  </span>
                  <button
                    onClick={() => copyToClipboard(MASTER_ONE_CLICK_CODE_GS, "GS_STEP")}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow"
                  >
                    {copiedKey === "GS_STEP" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === "GS_STEP" ? "Tersalin!" : "Salin Code.gs"}</span>
                  </button>
                </div>
                <p className="text-slate-500 leading-relaxed">
                  Di Apps Script Editor, hapus semua teks default di file <code>Code.gs</code>, lalu tempelkan kode yang telah disalin. Klik ikon <strong>💾 Simpan (Save)</strong>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    2.2 Buat File Frontend (Index.html)
                  </span>
                  <button
                    onClick={() => copyToClipboard(MASTER_INDEX_HTML, "HTML_STEP")}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow"
                  >
                    {copiedKey === "HTML_STEP" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === "HTML_STEP" ? "Tersalin!" : "Salin Index.html"}</span>
                  </button>
                </div>
                <p className="text-slate-500 leading-relaxed">
                  Di panel kiri Apps Script Editor, klik tombol <strong>+ (Tambah file)</strong> &gt; pilih <strong>HTML</strong> &gt; beri nama <strong>Index</strong> (tanpa ekstensi .html). Tempelkan kode Index.html lalu klik <strong>💾 Simpan</strong>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <span className="font-extrabold text-slate-900 dark:text-white block">
                  2.3 Jalankan Inisialisasi Otomatis Database
                </span>
                <p className="text-slate-500 leading-relaxed">
                  Di dropdown fungsi sebelah tombol "Run", pilih fungsi <code>setupAllSheetsDatabase</code> lalu klik <strong>Jalankan (Run)</strong>. Setujui izin akses akun Google Anda. Seluruh 18 Sheet akan otomatis terbuat di Spreadsheet!
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-3">
                <span className="font-extrabold text-indigo-900 dark:text-indigo-200 block">
                  2.4 Deploy Sebagai Web App
                </span>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-700 dark:text-slate-300 leading-relaxed">
                  <li>Klik tombol <strong>Deploy (Penerapan)</strong> di pojok kanan atas &gt; pilih <strong>New deployment (Penerapan baru)</strong>.</li>
                  <li>Klik ikon gerigi ⚙️ di samping <em>Select type</em> &gt; pilih <strong>Web app</strong>.</li>
                  <li>Isi Deskripsi: <strong>CBT SMK v2.5 Produksi</strong>.</li>
                  <li>Pilih <strong>Execute as: Me (Jalankan sebagai: Saya)</strong>.</li>
                  <li>Pilih <strong>Who has access: Anyone (Siapa yang memiliki akses: Siapa saja)</strong>.</li>
                  <li>Klik <strong>Deploy</strong> &gt; Salin <strong>URL Web App</strong> yang diberikan. Aplikasi CBT Anda kini live dan dapat diakses siswa & guru!</li>
                </ol>
              </div>
            </div>
          </div>

          {/* STEP 3: GITHUB REPOSITORY DEPLOYMENT */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center space-x-3 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 flex items-center justify-center font-black text-base">
                3
              </div>
              <div>
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Langkah 3: Deploy & Simpan Source Code ke GitHub
                </h4>
                <p className="text-xs text-slate-500">
                  Menyimpan kode program ke repositori Git / GitHub untuk backup dan version control
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="font-extrabold text-slate-900 dark:text-white block">
                  3.1 Buat Repositori di GitHub
                </span>
                <p className="text-slate-500 leading-relaxed">
                  Buka <a href="https://github.com/new" target="_blank" rel="noreferrer" className="text-indigo-600 font-bold hover:underline">github.com/new</a>, beri nama repositori misalnya <strong>cbt-smk-gas</strong>, pilih <em>Public</em> atau <em>Private</em>, lalu klik <strong>Create repository</strong>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 text-slate-100 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-amber-400 font-mono">Perintah Git Terminal (Push ke GitHub):</span>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `# Ekstrak file ZIP yang sudah didownload, buka folder di terminal lalu jalankan:\ngit init\ngit add .\ngit commit -m "feat: CBT SMK Professional v2.5 production release"\ngit branch -M main\ngit remote add origin https://github.com/USERNAME_ANDA/cbt-smk-gas.git\ngit push -u origin main`,
                        "GIT_CMD"
                      )
                    }
                    className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-sans font-bold flex items-center space-x-1"
                  >
                    {copiedKey === "GIT_CMD" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === "GIT_CMD" ? "Tersalin!" : "Salin Perintah"}</span>
                  </button>
                </div>
                <pre className="overflow-x-auto text-xs leading-relaxed text-slate-300 font-mono">
{`# 1. Masuk ke folder proyek CBT
cd cbt-smk-package

# 2. Inisialisasi Git dan tambahkan semua file
git init
git add .
git commit -m "feat: CBT SMK Professional v2.5 production release"

# 3. Hubungkan ke GitHub & Push
git branch -M main
git remote add origin https://github.com/USERNAME_ANDA/cbt-smk-gas.git
git push -u origin main`}
                </pre>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="font-extrabold text-slate-900 dark:text-white block">
                  3.2 Cara Alternatif (Tanpa Terminal / Upload Langsung via Web GitHub)
                </span>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-400">
                  <li>Ekstrak file <strong>.ZIP</strong> yang Anda unduh dari tombol di atas.</li>
                  <li>Di halaman repositori GitHub Anda, klik <strong>Add file &gt; Upload files</strong>.</li>
                  <li>Drag & drop folder atau file hasil ekstrak ke halaman GitHub, lalu klik <strong>Commit changes</strong>.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: RINGKASAN PAKET */}
      {activeTab === "PACKAGE" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-bold">
                {GAS_GS_FILES.length}
              </div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">File .gs Backend</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tersusun modular: Main, Config, Database, Auth, ExamEngine, Grading, AntiCheat, SessionManager, Monitoring, Reporting, ItemAnalysis, Utils, InitDatabase, dan CustomDomain.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-bold">
                {GAS_HTML_FILES.length}
              </div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Template .html Frontend</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Responsive mobile-first dengan Tailwind CSS: Index, Login, Dashboard, ExamView, Monitoring, Grading, Analysis, PrintReports, 5 Component Soal, dan Dialogs.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold">
                18
              </div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Tabel Database Sheets</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Auto-setup script otomatis membuat tabel Users, Siswa, Kelas, Mapel, BankSoal, Soal, Ujian, SesiUjian, TokenUjian, JawabanSiswa, NilaiSiswa, PelanggaranLog, dan Audit.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4 shadow-xl">
            <h3 className="text-base font-extrabold flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>Langkah Cepat Memasang ke Google Drive & Cloudflare (3 Menit)</span>
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-xs text-slate-300 leading-relaxed">
              <li>
                Buka <strong>Google Sheets baru</strong> di Google Drive Anda (misal beri nama <em>"DATABASE_CBT_SMK"</em>).
              </li>
              <li>
                Klik menu <strong>Extensions &gt; Apps Script</strong>.
              </li>
              <li>
                Buat {GAS_GS_FILES.length} file <code>.gs</code> dan {GAS_HTML_FILES.length} file <code>.html</code> menggunakan kode yang tersedia pada tab di atas atau ekstrak dari ZIP.
              </li>
              <li>
                Jalankan fungsi <code>setupDatabase()</code> di Apps Script satu kali untuk menginisialisasi 18 sheet otomatis.
              </li>
              <li>
                Klik <strong>Deploy &gt; New deployment &gt; Web app</strong> (Set: <em>Execute as: Me</em>, <em>Who has access: Anyone</em>).
              </li>
              <li>
                Pasang script Cloudflare Worker di <strong>dash.cloudflare.com</strong> untuk menghubungkan ke domain sekolah <code>cbt.sekolah.sch.id</code>.
              </li>
            </ol>
          </div>
        </div>
      )}

      {/* TAB 2: GS VIEWER */}
      {activeTab === "GS_VIEWER" && selectedGsItem && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* File list */}
          <div className="space-y-1 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm max-h-[600px] overflow-y-auto">
            <p className="text-[11px] font-bold uppercase text-slate-400 px-2 mb-2">{GAS_GS_FILES.length} File Backend .gs</p>
            {GAS_GS_FILES.map((file, idx) => (
              <button
                key={file.filename}
                onClick={() => setSelectedGsIndex(idx)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-between ${
                  selectedGsIndex === idx
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <span className="truncate">{file.filename}</span>
              </button>
            ))}
          </div>

          {/* Code Viewer */}
          <div className="lg:col-span-3 bg-slate-950 text-slate-100 rounded-2xl p-4 border border-slate-800 font-mono text-xs shadow-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <span className="font-bold text-indigo-400 text-sm">{selectedGsItem.filename}</span>
                <p className="text-[11px] font-sans text-slate-400 mt-0.5">{selectedGsItem.description}</p>
              </div>
              <button
                onClick={() => copyToClipboard(selectedGsItem.content, selectedGsItem.filename)}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-sans font-bold text-xs flex items-center space-x-1.5 self-start sm:self-auto"
              >
                {copiedKey === selectedGsItem.filename ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === selectedGsItem.filename ? "Tersalin!" : "Salin Kode"}</span>
              </button>
            </div>
            <pre className="overflow-x-auto max-h-[500px] text-xs leading-relaxed text-slate-300 scrollbar-thin">
              <code>{selectedGsItem.content}</code>
            </pre>
          </div>
        </div>
      )}

      {/* TAB 3: HTML VIEWER */}
      {activeTab === "HTML_VIEWER" && selectedHtmlItem && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* File list */}
          <div className="space-y-1 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm max-h-[600px] overflow-y-auto">
            <p className="text-[11px] font-bold uppercase text-slate-400 px-2 mb-2">{GAS_HTML_FILES.length} Template Frontend .html</p>
            {GAS_HTML_FILES.map((file, idx) => (
              <button
                key={file.filename}
                onClick={() => setSelectedHtmlIndex(idx)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-between ${
                  selectedHtmlIndex === idx
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <span className="truncate">{file.filename}</span>
              </button>
            ))}
          </div>

          {/* Code Viewer */}
          <div className="lg:col-span-3 bg-slate-950 text-slate-100 rounded-2xl p-4 border border-slate-800 font-mono text-xs shadow-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <span className="font-bold text-emerald-400 text-sm">{selectedHtmlItem.filename}</span>
                <p className="text-[11px] font-sans text-slate-400 mt-0.5">{selectedHtmlItem.description}</p>
              </div>
              <button
                onClick={() => copyToClipboard(selectedHtmlItem.content, selectedHtmlItem.filename)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-sans font-bold text-xs flex items-center space-x-1.5 self-start sm:self-auto"
              >
                {copiedKey === selectedHtmlItem.filename ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === selectedHtmlItem.filename ? "Tersalin!" : "Salin Kode"}</span>
              </button>
            </div>
            <pre className="overflow-x-auto max-h-[500px] text-xs leading-relaxed text-slate-300 scrollbar-thin">
              <code>{selectedHtmlItem.content}</code>
            </pre>
          </div>
        </div>
      )}

      {/* TAB 4: CLOUDFLARE PROXY */}
      {activeTab === "CLOUDFLARE" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Cloudflare Worker Reverse Proxy Script (Custom Domain Gratis)
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Google Apps Script tidak mendukung custom domain secara native. Skrip Worker ini mem-proxy request dari <code>cbt.sekolah.sch.id</code> ke Google Apps Script Web App tanpa iframe dan tanpa biaya server.
            </p>
          </div>

          <div className="bg-slate-950 text-slate-100 rounded-2xl p-4 border border-slate-800 font-mono text-xs shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="font-bold text-amber-400">_worker.js (Cloudflare Worker)</span>
              <button
                onClick={() => copyToClipboard(CLOUDFLARE_WORKER_SCRIPT, "CF_WORKER")}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-sans font-bold text-xs flex items-center space-x-1.5"
              >
                {copiedKey === "CF_WORKER" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === "CF_WORKER" ? "Tersalin!" : "Salin Worker Script"}</span>
              </button>
            </div>
            <pre className="overflow-x-auto max-h-[400px] text-xs leading-relaxed text-slate-300">
              <code>{CLOUDFLARE_WORKER_SCRIPT}</code>
            </pre>
          </div>
        </div>
      )}

      {/* TAB 5: DATABASE SCHEMA */}
      {activeTab === "DATABASE" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Struktur 18 Tabel Google Sheets Database
            </h3>
            <p className="text-xs text-slate-500">
              Dibuat otomatis oleh skrip <code>setupDatabase()</code> atau <code>setupAllSheetsDatabase()</code> lengkap dengan header kolom standar & data awal.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SHEETS_18_DATABASE.map((sheet, idx) => (
              <div
                key={sheet.name}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 text-xs"
              >
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 font-bold flex items-center justify-center text-[10px]">
                    {idx + 1}
                  </span>
                  <h4 className="font-extrabold text-slate-900 dark:text-white">{sheet.name}</h4>
                </div>
                <p className="text-slate-500 text-[11px]">{sheet.description}</p>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 font-mono text-[10px] text-slate-600 dark:text-slate-400 overflow-x-auto">
                  {sheet.headers.join(" | ")}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: MANUAL BOOK */}
      {activeTab === "MANUAL" && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
          <div className="flex items-center justify-between border-b pb-4 dark:border-slate-800">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Buku Manual Panduan Lengkap Instalasi CBT SMK
              </h3>
              <p className="text-xs text-slate-500">Bagian A sampai V lengkap untuk Guru dan Proktor SMK</p>
            </div>
            <button
              onClick={() => copyToClipboard(MANUAL_BOOK_MARKDOWN, "MANUAL_BOOK")}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow"
            >
              {copiedKey === "MANUAL_BOOK" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === "MANUAL_BOOK" ? "Tersalin!" : "Salin Manual (.md)"}</span>
            </button>
          </div>

          <pre className="overflow-x-auto p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 font-sans text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap max-h-[600px]">
            {MANUAL_BOOK_MARKDOWN}
          </pre>
        </div>
      )}
    </div>
  );
};

