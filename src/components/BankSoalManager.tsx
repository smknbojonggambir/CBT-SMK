import React, { useState } from "react";
import {
  BankSoal,
  Question,
  QuestionType,
  DifficultyLevel,
  QuestionOption,
  MatchPair,
  Mapel,
} from "../types/cbt";
import {
  Plus,
  FileSpreadsheet,
  Sparkles,
  Trash2,
  Edit,
  Eye,
  CheckCircle2,
  HelpCircle,
  Image as ImageIcon,
  Youtube,
  Search,
  Filter,
  Download,
  AlertCircle,
  Layers,
  ArrowRight
} from "lucide-react";
import { AiService, AiGenerationParams } from "../services/aiService";
import { CSV_IMPORT_SOAL_TEMPLATE } from "../gas_package/sheetTemplates";

interface BankSoalManagerProps {
  bankSoalList: BankSoal[];
  subjects: Mapel[];
  onSaveBankSoal: (bank: BankSoal) => void;
  onOpenAiGeneratorModal: () => void;
}

export const BankSoalManager: React.FC<BankSoalManagerProps> = ({
  bankSoalList,
  subjects,
  onSaveBankSoal,
}) => {
  const [selectedBankId, setSelectedBankId] = useState<string>(bankSoalList[0]?.id || "");
  const [activeQuestionFilter, setActiveQuestionFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [isNewBankModalOpen, setIsNewBankModalOpen] = useState<boolean>(false);

  // Active Editing Question
  const [editingQuestion, setEditingQuestion] = useState<Partial<Question> | null>(null);

  // AI Generator Form State
  const [aiParams, setAiParams] = useState<AiGenerationParams>({
    subject: "Informatika & Pemrograman Dasar",
    gradeClass: "X SMK",
    topic: "Pemrograman Web & Basis Data",
    learningObjective: "Memahami struktur logika dasar dan sintaksis kode",
    count: 5,
    questionType: "CAMPURAN",
    difficulty: "Sedang",
  });
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [aiDraftResults, setAiDraftResults] = useState<Question[]>([]);

  // Import State
  const [importCsvText, setImportCsvText] = useState<string>("");
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // New Bank Form State
  const [newBankName, setNewBankName] = useState<string>("");
  const [newBankSubjectId, setNewBankSubjectId] = useState<string>(subjects[0]?.id || "");
  const [newBankGrade, setNewBankGrade] = useState<"X" | "XI" | "XII">("X");
  const [newBankJurusan, setNewBankJurusan] = useState<string>("Rekayasa Perangkat Lunak");

  const selectedBank = bankSoalList.find((b) => b.id === selectedBankId) || bankSoalList[0];

  const handleSelectBank = (id: string) => {
    setSelectedBankId(id);
  };

  // Filtered Questions
  const filteredQuestions = (selectedBank?.soalList || []).filter((q) => {
    const matchesFilter = activeQuestionFilter === "ALL" || q.type === activeQuestionFilter;
    const matchesSearch =
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.topic.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Open Form for New Question
  const handleOpenNewQuestion = () => {
    setEditingQuestion({
      id: `SOAL-2026-${Date.now().toString().slice(-4)}`,
      bankId: selectedBank?.id || "BNK-2026-0001",
      type: "PG",
      question: "",
      mediaType: "none",
      mediaUrl: "",
      options: [
        { key: "A", text: "" },
        { key: "B", text: "" },
        { key: "C", text: "" },
        { key: "D", text: "" },
        { key: "E", text: "" },
      ],
      correctAnswer: "A",
      score: 10,
      difficulty: "Sedang",
      topic: selectedBank?.nama || "Dasar Kejuruan",
      tags: ["SMK"],
      explanation: "",
    });
    setIsEditorOpen(true);
  };

  // Open Form for Edit Question
  const handleEditQuestion = (q: Question) => {
    setEditingQuestion({ ...q });
    setIsEditorOpen(true);
  };

  // Save Question in Bank
  const handleSaveQuestion = () => {
    if (!editingQuestion || !editingQuestion.question || !selectedBank) return;

    const currentQuestions = [...(selectedBank.soalList || [])];
    const existingIndex = currentQuestions.findIndex((q) => q.id === editingQuestion.id);

    const fullQuestion: Question = {
      id: editingQuestion.id || `SOAL-2026-${Date.now()}`,
      bankId: selectedBank.id,
      type: editingQuestion.type || "PG",
      question: editingQuestion.question,
      mediaType: editingQuestion.mediaType || "none",
      mediaUrl: editingQuestion.mediaUrl || "",
      options: editingQuestion.options || [],
      correctAnswer: editingQuestion.correctAnswer,
      pairs: editingQuestion.pairs || [],
      score: editingQuestion.score || 10,
      difficulty: editingQuestion.difficulty || "Sedang",
      topic: editingQuestion.topic || "Materi Kejuruan",
      learningObjective: editingQuestion.learningObjective || "",
      explanation: editingQuestion.explanation || "",
      tags: editingQuestion.tags || ["SMK"],
      createdAt: editingQuestion.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      currentQuestions[existingIndex] = fullQuestion;
    } else {
      currentQuestions.push(fullQuestion);
    }

    const updatedBank: BankSoal = {
      ...selectedBank,
      soalList: currentQuestions,
      totalSoal: currentQuestions.length,
      totalBobot: currentQuestions.reduce((acc, q) => acc + q.score, 0),
    };

    onSaveBankSoal(updatedBank);
    setIsEditorOpen(false);
    setEditingQuestion(null);
  };

  // Delete Question
  const handleDeleteQuestion = (qId: string) => {
    if (!selectedBank || !window.confirm("Apakah Anda yakin ingin menghapus butir soal ini?")) return;
    const currentQuestions = (selectedBank.soalList || []).filter((q) => q.id !== qId);
    const updatedBank: BankSoal = {
      ...selectedBank,
      soalList: currentQuestions,
      totalSoal: currentQuestions.length,
      totalBobot: currentQuestions.reduce((acc, q) => acc + q.score, 0),
    };
    onSaveBankSoal(updatedBank);
  };

  // Create New Bank Soal
  const handleCreateNewBank = () => {
    if (!newBankName.trim()) return;
    const subj = subjects.find((s) => s.id === newBankSubjectId) || subjects[0];
    const newBank: BankSoal = {
      id: `BNK-2026-${Date.now().toString().slice(-4)}`,
      kode: `BNK-${subj.kode}-${newBankGrade}-${Date.now().toString().slice(-3)}`,
      nama: newBankName,
      mapelId: subj.id,
      mapelNama: subj.nama,
      tingkat: newBankGrade,
      jurusan: newBankJurusan,
      guruId: "USR-2026-0001",
      guruNama: "Budi Santoso, S.Kom",
      totalSoal: 0,
      totalBobot: 0,
      soalList: [],
      createdAt: new Date().toISOString(),
    };
    onSaveBankSoal(newBank);
    setSelectedBankId(newBank.id);
    setIsNewBankModalOpen(false);
    setNewBankName("");
  };

  // Generate Questions via AI
  const handleRunAiGeneration = async () => {
    setIsAiGenerating(true);
    setAiDraftResults([]);
    try {
      const response = await AiService.generateQuestions(aiParams);
      if (response && response.questions) {
        setAiDraftResults(response.questions);
      }
    } catch (e: any) {
      alert("Gagal memanggil AI generator: " + e.message);
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Accept and Save AI Draft Questions into Current Bank
  const handleSaveAiDraftsToBank = () => {
    if (!selectedBank || (aiDraftResults || []).length === 0) return;
    const currentQuestions = [...(selectedBank.soalList || [])];

    aiDraftResults.forEach((draft, idx) => {
      currentQuestions.push({
        ...draft,
        id: `SOAL-2026-${Date.now().toString().slice(-4)}-${idx + 1}`,
        bankId: selectedBank.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });

    const updatedBank: BankSoal = {
      ...selectedBank,
      soalList: currentQuestions,
      totalSoal: currentQuestions.length,
      totalBobot: currentQuestions.reduce((acc, q) => acc + q.score, 0),
    };

    onSaveBankSoal(updatedBank);
    setIsAiModalOpen(false);
    setAiDraftResults([]);
    alert(`Berhasil menambahkan ${aiDraftResults.length} butir soal hasil AI ke ${selectedBank.nama}!`);
  };

  // Handle CSV Import
  const handleImportCsv = () => {
    if (!importCsvText.trim() || !selectedBank) return;
    try {
      const lines = importCsvText.trim().split("\n");
      if (lines.length <= 1) {
        setImportStatus("Data CSV kosong atau hanya berisi header.");
        return;
      }

      const newQuestions: Question[] = [];
      // Skip header line
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Simple CSV splitter handling quotes
        const cols: string[] = [];
        let current = "";
        let inQuotes = false;
        for (let c = 0; c < line.length; c++) {
          const char = line[c];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === "," && !inQuotes) {
            cols.push(current.trim());
            current = "";
          } else {
            current += char;
          }
        }
        cols.push(current.trim());

        const type = (cols[0]?.replace(/"/g, "") || "PG") as QuestionType;
        const questionText = cols[1]?.replace(/"/g, "") || `Soal ${i}`;
        const optA = cols[2]?.replace(/"/g, "") || "";
        const optB = cols[3]?.replace(/"/g, "") || "";
        const optC = cols[4]?.replace(/"/g, "") || "";
        const optD = cols[5]?.replace(/"/g, "") || "";
        const optE = cols[6]?.replace(/"/g, "") || "";
        const rawKey = cols[7]?.replace(/"/g, "") || "A";
        const score = parseInt(cols[8]?.replace(/"/g, "") || "10", 10);
        const difficulty = (cols[9]?.replace(/"/g, "") || "Sedang") as DifficultyLevel;
        const topic = cols[10]?.replace(/"/g, "") || "Materi";
        const explanation = cols[11]?.replace(/"/g, "") || "";

        let correctAnswer: any = rawKey;
        let options: QuestionOption[] = [];
        let pairs: MatchPair[] = [];

        if (type === "PG") {
          options = [
            { key: "A", text: optA },
            { key: "B", text: optB },
            { key: "C", text: optC },
            { key: "D", text: optD },
            { key: "E", text: optE },
          ].filter((o) => o.text);
          correctAnswer = rawKey.trim().toUpperCase();
        } else if (type === "PGK") {
          options = [
            { key: "A", text: optA },
            { key: "B", text: optB },
            { key: "C", text: optC },
            { key: "D", text: optD },
            { key: "E", text: optE },
          ].filter((o) => o.text);
          correctAnswer = rawKey.split(";").map((k) => k.trim().toUpperCase());
        } else if (type === "BENAR_SALAH") {
          correctAnswer = rawKey.toUpperCase().includes("BENAR") ? "BENAR" : "SALAH";
        } else if (type === "PENJODOHAN") {
          // Parse format: premise1:match1;premise2:match2
          const rawPairs = rawKey.split(";");
          pairs = rawPairs.map((p) => {
            const [pr, m] = p.split(":");
            return { premise: pr?.trim() || "", match: m?.trim() || "" };
          });
          correctAnswer = pairs;
        }

        newQuestions.push({
          id: `SOAL-2026-${Date.now().toString().slice(-4)}-${i}`,
          bankId: selectedBank.id,
          type,
          question: questionText,
          options,
          correctAnswer,
          pairs,
          score: isNaN(score) ? 10 : score,
          difficulty,
          topic,
          explanation,
          tags: ["Import-CSV"],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      const currentBankSoalList = selectedBank.soalList || [];
      const updatedBank: BankSoal = {
        ...selectedBank,
        soalList: [...currentBankSoalList, ...newQuestions],
        totalSoal: currentBankSoalList.length + newQuestions.length,
        totalBobot: currentBankSoalList.reduce((acc, q) => acc + q.score, 0) + newQuestions.reduce((acc, q) => acc + q.score, 0),
      };

      onSaveBankSoal(updatedBank);
      setIsImportModalOpen(false);
      setImportCsvText("");
      setImportStatus(null);
      alert(`Berhasil mengimpor ${newQuestions.length} butir soal ke ${selectedBank.nama}!`);
    } catch (e: any) {
      setImportStatus("Gagal memproses CSV: " + e.message);
    }
  };

  const downloadCsvTemplate = () => {
    const blob = new Blob([CSV_IMPORT_SOAL_TEMPLATE], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Template-Import-Soal-CBT-SMK.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & Bank Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Bank Soal Asesmen SMK
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-black bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              5 Model Soal Wajib
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Pilihan Ganda (PG), PG Kompleks (PGK), Benar-Salah, Penjodohan, dan Isian Singkat.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsNewBankModalOpen(true)}
            className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-600" />
            <span>+ Buat Bank Baru</span>
          </button>
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Import CSV/Excel</span>
          </button>
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI Question Generator</span>
          </button>
        </div>
      </div>

      {/* Bank Selection Pill Carousel */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 scrollbar-none">
        {bankSoalList.map((bank) => (
          <button
            key={bank.id}
            onClick={() => handleSelectBank(bank.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-2 border ${
              selectedBankId === bank.id
                ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <span>{bank.nama}</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-black ${
                selectedBankId === bank.id
                  ? "bg-indigo-700 text-indigo-100"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500"
              }`}
            >
              {bank.soalList?.length || 0} Soal
            </span>
          </button>
        ))}
      </div>

      {/* Active Bank Info & Search Bar */}
      {selectedBank && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {selectedBank.nama}
                </h3>
                <span className="font-mono text-xs text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded font-bold">
                  {selectedBank.kode}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Mata Pelajaran: <strong>{selectedBank.mapelNama}</strong> • Tingkat: <strong>{selectedBank.tingkat}</strong> • Jurusan: <strong>{selectedBank.jurusan}</strong> • Total Bobot: <strong>{selectedBank.totalBobot || 0} Poin</strong>
              </p>
            </div>

            <button
              onClick={handleOpenNewQuestion}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow transition-all self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Butir Soal</span>
            </button>
          </div>

          {/* Filter & Search Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            {/* Type filter buttons */}
            <div className="flex items-center space-x-1 overflow-x-auto text-xs font-semibold">
              {[
                { key: "ALL", label: "Semua Tipe" },
                { key: "PG", label: "PG (Pilihan Ganda)" },
                { key: "PGK", label: "PGK (Kompleks)" },
                { key: "BENAR_SALAH", label: "Benar/Salah" },
                { key: "PENJODOHAN", label: "Penjodohan" },
                { key: "ISIAN", label: "Isian" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveQuestionFilter(tab.key)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                    activeQuestionFilter === tab.key
                      ? "bg-slate-900 text-white dark:bg-indigo-600"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari butir soal / topik..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Question Cards List */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-3">
            <HelpCircle className="w-12 h-12 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Belum ada soal pada filter ini
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Silakan tambahkan butir soal secara manual, import dari file spreadsheet/CSV, atau gunakan AI Generator untuk membuat draft otomatis.
            </p>
            <button
              onClick={handleOpenNewQuestion}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow hover:bg-indigo-700"
            >
              + Tambah Soal Pertama
            </button>
          </div>
        ) : (
          filteredQuestions.map((q, idx) => (
            <div
              key={q.id}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
            >
              {/* Question Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-black flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-black bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200/50">
                    {q.type}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    Bobot: {q.score} Poin
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      q.difficulty === "Mudah"
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                        : q.difficulty === "Sulit"
                        ? "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                        : "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                    }`}
                  >
                    {q.difficulty}
                  </span>
                  {q.topic && (
                    <span className="text-[11px] text-slate-500 font-medium truncate max-w-xs">
                      • {q.topic}
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleEditQuestion(q)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Edit Soal"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Hapus Soal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Question Text */}
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-relaxed">
                {q.question}
              </p>

              {/* Media Preview if any */}
              {q.mediaType && q.mediaType !== "none" && q.mediaUrl && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  {q.mediaType === "image" && (
                    <img
                      src={q.mediaUrl}
                      alt="Lampiran Soal"
                      referrerPolicy="no-referrer"
                      className="max-h-52 rounded-lg object-contain"
                    />
                  )}
                  {q.mediaType === "youtube" && (
                    <div className="text-xs text-indigo-600 flex items-center space-x-1.5">
                      <Youtube className="w-4 h-4 text-red-600" />
                      <span>YouTube Embed Link: {q.mediaUrl}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Option Rendering according to Type */}
              <div className="pt-2">
                {q.type === "PG" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {q.options?.map((opt) => {
                      const isCorrect = String(opt.key).toUpperCase() === String(q.correctAnswer).toUpperCase();
                      return (
                        <div
                          key={opt.key}
                          className={`p-2.5 rounded-xl border flex items-center space-x-2 ${
                            isCorrect
                              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 font-bold"
                              : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded-md flex items-center justify-center font-black text-[10px] ${
                              isCorrect ? "bg-emerald-600 text-white" : "bg-slate-200 dark:bg-slate-700"
                            }`}
                          >
                            {opt.key}
                          </span>
                          <span className="flex-1">{opt.text}</span>
                          {isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                        </div>
                      );
                    })}
                  </div>
                )}

                {q.type === "PGK" && (
                  <div className="space-y-1.5 text-xs">
                    <p className="text-[11px] font-bold text-slate-400 uppercase">Pilihan Ganda Kompleks (Kunci: {Array.isArray(q.correctAnswer) ? q.correctAnswer.join(", ") : q.correctAnswer}):</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options?.map((opt) => {
                        const isCorrect = Array.isArray(q.correctAnswer)
                          ? q.correctAnswer.includes(opt.key)
                          : q.correctAnswer === opt.key;
                        return (
                          <div
                            key={opt.key}
                            className={`p-2.5 rounded-xl border flex items-center space-x-2 ${
                              isCorrect
                                ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 font-bold"
                                : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            <span
                              className={`w-5 h-5 rounded-md flex items-center justify-center font-black text-[10px] ${
                                isCorrect ? "bg-emerald-600 text-white" : "bg-slate-200 dark:bg-slate-700"
                              }`}
                            >
                              {opt.key}
                            </span>
                            <span className="flex-1">{opt.text}</span>
                            {isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {q.type === "BENAR_SALAH" && (
                  <div className="inline-flex items-center space-x-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                    <span className="text-slate-500 font-semibold">Kunci Jawaban Pernyataan:</span>
                    <span
                      className={`px-2.5 py-1 rounded-lg font-black text-xs ${
                        q.correctAnswer === "BENAR"
                          ? "bg-emerald-600 text-white"
                          : "bg-rose-600 text-white"
                      }`}
                    >
                      {q.correctAnswer}
                    </span>
                  </div>
                )}

                {q.type === "PENJODOHAN" && (
                  <div className="space-y-1.5 text-xs">
                    <p className="text-[11px] font-bold text-slate-400 uppercase">Pasangan Penjodohan (Premis & Jawaban):</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {q.pairs?.map((pair, pIdx) => (
                        <div
                          key={pIdx}
                          className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                        >
                          <span className="font-semibold text-indigo-600 dark:text-indigo-400">{pair.premise}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 mx-2 flex-shrink-0" />
                          <span className="font-medium text-slate-900 dark:text-slate-100">{pair.match}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {q.type === "ISIAN" && (
                  <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 text-xs space-y-1">
                    <span className="text-slate-500 font-bold">Kunci Jawaban Isian:</span>
                    <p className="font-bold text-indigo-700 dark:text-indigo-300 font-mono text-sm">
                      {q.correctAnswer}
                    </p>
                  </div>
                )}
              </div>

              {/* Explanation note if available */}
              {q.explanation && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-bold text-slate-700 dark:text-slate-300">💡 Pembahasan: </span>
                  {q.explanation}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* ================= MODAL: EDIT / NEW QUESTION ================= */}
      {isEditorOpen && editingQuestion && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-5 my-8">
            <div className="flex items-center justify-between border-b pb-4 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Editor Butir Soal CBT
                </h3>
                <p className="text-xs text-slate-500">
                  Mendukung 5 model asesmen standar kejuruan
                </p>
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              {/* Question Type & Difficulty & Score Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                    Model Soal
                  </label>
                  <select
                    value={editingQuestion.type}
                    onChange={(e) => {
                      const newType = e.target.value as QuestionType;
                      setEditingQuestion({
                        ...editingQuestion,
                        type: newType,
                        correctAnswer:
                          newType === "PG"
                            ? "A"
                            : newType === "PGK"
                            ? ["A"]
                            : newType === "BENAR_SALAH"
                            ? "BENAR"
                            : newType === "PENJODOHAN"
                            ? [
                                { premise: "Premis 1", match: "Respon 1" },
                                { premise: "Premis 2", match: "Respon 2" },
                              ]
                            : "Kunci Isian",
                        pairs:
                          newType === "PENJODOHAN"
                            ? [
                                { premise: "Premis 1", match: "Respon 1" },
                                { premise: "Premis 2", match: "Respon 2" },
                              ]
                            : [],
                      });
                    }}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                  >
                    <option value="PG">Pilihan Ganda (PG)</option>
                    <option value="PGK">Pilihan Ganda Kompleks (PGK)</option>
                    <option value="BENAR_SALAH">Benar / Salah</option>
                    <option value="PENJODOHAN">Penjodohan (Matching)</option>
                    <option value="ISIAN">Isian Singkat</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                    Tingkat Kesulitan
                  </label>
                  <select
                    value={editingQuestion.difficulty}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        difficulty: e.target.value as DifficultyLevel,
                      })
                    }
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                  >
                    <option value="Mudah">Mudah</option>
                    <option value="Sedang">Sedang</option>
                    <option value="Sulit">Sulit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                    Bobot Nilai
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={editingQuestion.score || 10}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        score: parseInt(e.target.value, 10) || 10,
                      })
                    }
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                  />
                </div>
              </div>

              {/* Topic & Learning Objective */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                    Materi / Topik
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Konfigurasi Routing Dinamis"
                    value={editingQuestion.topic || ""}
                    onChange={(e) =>
                      setEditingQuestion({ ...editingQuestion, topic: e.target.value })
                    }
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                    Capaian / Tujuan Pembelajaran
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Mampu menguji tabel routing"
                    value={editingQuestion.learningObjective || ""}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        learningObjective: e.target.value,
                      })
                    }
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              {/* Question Text */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Teks Pertanyaan / Soal <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tuliskan pertanyaan secara jelas dan kontekstual..."
                  value={editingQuestion.question || ""}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, question: e.target.value })
                  }
                  className="w-full p-3 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                />
              </div>

              {/* Media Attachment */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <label className="block text-xs font-bold uppercase text-slate-500">
                  Lampiran Media (Opsional)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <select
                    value={editingQuestion.mediaType || "none"}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        mediaType: e.target.value as any,
                      })
                    }
                    className="p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="none">Tanpa Media</option>
                    <option value="image">Gambar (URL)</option>
                    <option value="youtube">YouTube Embed Link</option>
                    <option value="video">Video MP4 (URL)</option>
                  </select>
                  {editingQuestion.mediaType && editingQuestion.mediaType !== "none" && (
                    <input
                      type="url"
                      placeholder="https://..."
                      value={editingQuestion.mediaUrl || ""}
                      onChange={(e) =>
                        setEditingQuestion({
                          ...editingQuestion,
                          mediaUrl: e.target.value,
                        })
                      }
                      className="sm:col-span-2 p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  )}
                </div>
              </div>

              {/* Dynamic Answer Editor based on Type */}
              {editingQuestion.type === "PG" && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase text-slate-500">
                    Opsi Pilihan Ganda (Tandai Kunci Jawaban)
                  </label>
                  {(editingQuestion.options || []).map((opt, i) => (
                    <div key={opt.key} className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() =>
                          setEditingQuestion({
                            ...editingQuestion,
                            correctAnswer: opt.key,
                          })
                        }
                        className={`w-8 h-8 rounded-lg font-black text-xs flex items-center justify-center transition-all ${
                          editingQuestion.correctAnswer === opt.key
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                        }`}
                        title="Klik untuk jadikan kunci jawaban"
                      >
                        {opt.key}
                      </button>
                      <input
                        type="text"
                        placeholder={`Teks pilihan ${opt.key}...`}
                        value={opt.text}
                        onChange={(e) => {
                          const newOpts = [...(editingQuestion.options || [])];
                          newOpts[i] = { ...opt, text: e.target.value };
                          setEditingQuestion({ ...editingQuestion, options: newOpts });
                        }}
                        className="flex-1 p-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                      />
                    </div>
                  ))}
                </div>
              )}

              {editingQuestion.type === "PGK" && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase text-slate-500">
                    Opsi Pilihan Ganda Kompleks (Bisa lebih dari 1 Kunci Benar)
                  </label>
                  {(editingQuestion.options || []).map((opt, i) => {
                    const isChecked = Array.isArray(editingQuestion.correctAnswer)
                      ? editingQuestion.correctAnswer.includes(opt.key)
                      : false;
                    return (
                      <div key={opt.key} className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            let currentKeys = Array.isArray(editingQuestion.correctAnswer)
                              ? [...editingQuestion.correctAnswer]
                              : [];
                            if (currentKeys.includes(opt.key)) {
                              currentKeys = currentKeys.filter((k) => k !== opt.key);
                            } else {
                              currentKeys.push(opt.key);
                            }
                            setEditingQuestion({
                              ...editingQuestion,
                              correctAnswer: currentKeys,
                            });
                          }}
                          className={`w-8 h-8 rounded-lg font-black text-xs flex items-center justify-center transition-all ${
                            isChecked
                              ? "bg-emerald-600 text-white shadow-sm"
                              : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                          }`}
                          title="Klik untuk toggle kunci jawaban benar"
                        >
                          {opt.key}
                        </button>
                        <input
                          type="text"
                          placeholder={`Teks opsi ${opt.key}...`}
                          value={opt.text}
                          onChange={(e) => {
                            const newOpts = [...(editingQuestion.options || [])];
                            newOpts[i] = { ...opt, text: e.target.value };
                            setEditingQuestion({ ...editingQuestion, options: newOpts });
                          }}
                          className="flex-1 p-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              {editingQuestion.type === "BENAR_SALAH" && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase text-slate-500">
                    Kunci Jawaban Benar / Salah
                  </label>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() =>
                        setEditingQuestion({
                          ...editingQuestion,
                          correctAnswer: "BENAR",
                        })
                      }
                      className={`flex-1 py-3 rounded-xl font-black text-xs border ${
                        editingQuestion.correctAnswer === "BENAR"
                          ? "bg-emerald-600 text-white border-emerald-600 shadow"
                          : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700"
                      }`}
                    >
                      ✓ BENAR
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingQuestion({
                          ...editingQuestion,
                          correctAnswer: "SALAH",
                        })
                      }
                      className={`flex-1 py-3 rounded-xl font-black text-xs border ${
                        editingQuestion.correctAnswer === "SALAH"
                          ? "bg-rose-600 text-white border-rose-600 shadow"
                          : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700"
                      }`}
                    >
                      ✕ SALAH
                    </button>
                  </div>
                </div>
              )}

              {editingQuestion.type === "PENJODOHAN" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase text-slate-500">
                      Pasangan Penjodohan (Kolom Kiri - Kolom Kanan)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const currentPairs = editingQuestion.pairs || [];
                        const nextPairs = [
                          ...currentPairs,
                          { premise: `Premis ${currentPairs.length + 1}`, match: `Respon ${currentPairs.length + 1}` },
                        ];
                        setEditingQuestion({
                          ...editingQuestion,
                          pairs: nextPairs,
                          correctAnswer: nextPairs,
                        });
                      }}
                      className="text-xs font-bold text-indigo-600"
                    >
                      + Tambah Pasangan
                    </button>
                  </div>
                  {(editingQuestion.pairs || []).map((pair, pIdx) => (
                    <div key={pIdx} className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="Premis / Istilah Kiri"
                        value={pair.premise}
                        onChange={(e) => {
                          const nextPairs = [...(editingQuestion.pairs || [])];
                          nextPairs[pIdx] = { ...pair, premise: e.target.value };
                          setEditingQuestion({
                            ...editingQuestion,
                            pairs: nextPairs,
                            correctAnswer: nextPairs,
                          });
                        }}
                        className="flex-1 p-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                      />
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Respon / Pasangan Kanan"
                        value={pair.match}
                        onChange={(e) => {
                          const nextPairs = [...(editingQuestion.pairs || [])];
                          nextPairs[pIdx] = { ...pair, match: e.target.value };
                          setEditingQuestion({
                            ...editingQuestion,
                            pairs: nextPairs,
                            correctAnswer: nextPairs,
                          });
                        }}
                        className="flex-1 p-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const nextPairs = (editingQuestion.pairs || []).filter((_, idx) => idx !== pIdx);
                          setEditingQuestion({
                            ...editingQuestion,
                            pairs: nextPairs,
                            correctAnswer: nextPairs,
                          });
                        }}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {editingQuestion.type === "ISIAN" && (
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase text-slate-500">
                    Kunci Jawaban Singkat
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Git atau K3LH"
                    value={typeof editingQuestion.correctAnswer === "string" ? editingQuestion.correctAnswer : ""}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        correctAnswer: e.target.value,
                      })
                    }
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-indigo-600 dark:text-indigo-400"
                  />
                  <p className="text-[11px] text-slate-400">
                    Sistem dapat mencocokkan teks jawaban siswa secara otomatis atau melalui koreksi manual guru.
                  </p>
                </div>
              )}

              {/* Explanation Note */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Pembahasan Soal (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Catatan pembahasan mengapa jawaban tersebut benar..."
                  value={editingQuestion.explanation || ""}
                  onChange={(e) =>
                    setEditingQuestion({
                      ...editingQuestion,
                      explanation: e.target.value,
                    })
                  }
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-4 border-t dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="px-4 py-2.5 rounded-xl border text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveQuestion}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-md transition-all"
              >
                Simpan Butir Soal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: AI QUESTION GENERATOR ================= */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-5 my-8">
            <div className="flex items-center justify-between border-b pb-4 dark:border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    AI Question Generator (Google Gemini Ready)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Hasilkan draft soal asesmen SMK kontekstual siap periksa
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            {/* AI Generator Parameters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Mata Pelajaran
                </label>
                <input
                  type="text"
                  value={aiParams.subject}
                  onChange={(e) => setAiParams({ ...aiParams, subject: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Kelas / Tingkat
                </label>
                <select
                  value={aiParams.gradeClass}
                  onChange={(e) => setAiParams({ ...aiParams, gradeClass: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                >
                  <option value="X SMK">X SMK</option>
                  <option value="XI SMK">XI SMK</option>
                  <option value="XII SMK">XII SMK</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Topik / Materi Pokok
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Pemrograman Berorientasi Objek & MVC"
                  value={aiParams.topic}
                  onChange={(e) => setAiParams({ ...aiParams, topic: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Capaian / Tujuan Pembelajaran
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Peserta didik mampu menganalisis alur data form"
                  value={aiParams.learningObjective || ""}
                  onChange={(e) => setAiParams({ ...aiParams, learningObjective: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Model Soal yang Dihasilkan
                </label>
                <select
                  value={aiParams.questionType}
                  onChange={(e) => setAiParams({ ...aiParams, questionType: e.target.value as any })}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                >
                  <option value="CAMPURAN">Campuran 5 Model Soal</option>
                  <option value="PG">Pilihan Ganda (PG)</option>
                  <option value="PGK">PG Kompleks (PGK)</option>
                  <option value="BENAR_SALAH">Benar / Salah</option>
                  <option value="PENJODOHAN">Penjodohan</option>
                  <option value="ISIAN">Isian Singkat</option>
                </select>
              </div>

              <div className="flex space-x-2">
                <div className="flex-1">
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                    Jumlah Soal
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={aiParams.count}
                    onChange={(e) => setAiParams({ ...aiParams, count: parseInt(e.target.value, 10) || 5 })}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                    Kesulitan
                  </label>
                  <select
                    value={aiParams.difficulty}
                    onChange={(e) => setAiParams({ ...aiParams, difficulty: e.target.value as any })}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                  >
                    <option value="Campuran">Campuran</option>
                    <option value="Mudah">Mudah</option>
                    <option value="Sedang">Sedang</option>
                    <option value="Sulit">Sulit</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                disabled={isAiGenerating}
                onClick={handleRunAiGeneration}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-black shadow-md hover:from-indigo-700 hover:to-violet-700 flex items-center space-x-2 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{isAiGenerating ? "Sedang Menghasilkan Soal AI..." : "Generate Draft Soal Sekarang"}</span>
              </button>
            </div>

            {/* Generated AI Results Draft Preview */}
            {aiDraftResults.length > 0 && (
              <div className="space-y-3 pt-4 border-t dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Draft Soal Hasil AI ({aiDraftResults.length} Butir)
                  </h4>
                  <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold">
                    ⚠️ Status: Draft (Dapat diedit sebelum disimpan)
                  </span>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                  {aiDraftResults.map((q, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                          {q.type}
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          Soal #{idx + 1}
                        </span>
                        <span className="text-[10px] text-slate-500">• {q.difficulty}</span>
                      </div>
                      <p className="font-medium text-slate-700 dark:text-slate-300">{q.question}</p>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleSaveAiDraftsToBank}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md flex items-center space-x-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Masukkan Semua Draft ke Bank Soal</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= MODAL: CSV / EXCEL IMPORT ================= */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between border-b pb-4 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Import Butir Soal dari CSV / Spreadsheet
                </h3>
                <p className="text-xs text-slate-500">
                  Target Bank: <strong>{selectedBank?.nama}</strong>
                </p>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
              <div className="text-xs text-emerald-900 dark:text-emerald-200">
                <p className="font-bold">Unduh Format Resmi Spreadsheet:</p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400">Template berisi contoh 5 tipe soal lengkap.</p>
              </div>
              <button
                onClick={downloadCsvTemplate}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center space-x-1 shadow"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Template CSV</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Tempelkan Isi CSV atau Teks Di Sini
              </label>
              <textarea
                rows={8}
                placeholder="Tipe,Pertanyaan,OpsiA,OpsiB,OpsiC,OpsiD,OpsiE,KunciJawaban,Bobot,TingkatKesulitan,Materi,Pembahasan..."
                value={importCsvText}
                onChange={(e) => setImportCsvText(e.target.value)}
                className="w-full p-3 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            {importStatus && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">
                {importStatus}
              </div>
            )}

            <div className="flex items-center justify-end space-x-2 pt-3 border-t dark:border-slate-800">
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border text-xs font-bold text-slate-600 dark:text-slate-300"
              >
                Batal
              </button>
              <button
                onClick={handleImportCsv}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-md"
              >
                Proses Import Soal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE NEW BANK SOAL ================= */}
      {isNewBankModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Buat Bank Soal Baru
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Nama Bank Soal
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Bank Soal TKJ X Genap 2026"
                  value={newBankName}
                  onChange={(e) => setNewBankName(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Mata Pelajaran
                </label>
                <select
                  value={newBankSubjectId}
                  onChange={(e) => setNewBankSubjectId(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nama} ({s.kode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                    Tingkat
                  </label>
                  <select
                    value={newBankGrade}
                    onChange={(e) => setNewBankGrade(e.target.value as any)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                  >
                    <option value="X">X (Sepuluh)</option>
                    <option value="XI">XI (Sebelas)</option>
                    <option value="XII">XII (Dua Belas)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                    Jurusan / Program
                  </label>
                  <select
                    value={newBankJurusan}
                    onChange={(e) => setNewBankJurusan(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                  >
                    <option value="Rekayasa Perangkat Lunak">RPL</option>
                    <option value="Teknik Komputer dan Jaringan">TKJ</option>
                    <option value="Desain Komunikasi Visual">DKV</option>
                    <option value="Teknik Kendaraan Ringan">TKRO</option>
                    <option value="Semua Jurusan">Semua Jurusan</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t dark:border-slate-800">
              <button
                onClick={() => setIsNewBankModalOpen(false)}
                className="px-4 py-2 rounded-xl border text-xs font-bold text-slate-600 dark:text-slate-300"
              >
                Batal
              </button>
              <button
                onClick={handleCreateNewBank}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md"
              >
                Simpan Bank Soal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
