/**
 * AI Question Generator Service (Google Gemini Integration)
 */

export interface AiGenerationParams {
  subject: string;
  gradeClass: string;
  topic: string;
  learningObjective?: string;
  count: number;
  questionType: "PG" | "PGK" | "BENAR_SALAH" | "PENJODOHAN" | "ISIAN" | "CAMPURAN";
  difficulty: "Mudah" | "Sedang" | "Sulit" | "Campuran";
}

export const AiService = {
  async generateQuestions(params: AiGenerationParams) {
    try {
      const res = await fetch("/api/ai/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }
      return await res.json();
    } catch (err: any) {
      console.warn("API request failed, using client fallback generator:", err);
      // Fallback local question generator
      return {
        success: true,
        fallback: true,
        message: "Menggunakan generator cerdas lokal (offline fallback).",
        questions: generateLocalDrafts(params),
      };
    }
  },
};

function generateLocalDrafts(params: AiGenerationParams) {
  const { subject, gradeClass, topic, count, questionType, difficulty } = params;
  const result = [];
  const types = questionType === "CAMPURAN" ? ["PG", "PGK", "BENAR_SALAH", "PENJODOHAN", "ISIAN"] : [questionType];

  for (let i = 1; i <= count; i++) {
    const type = types[(i - 1) % types.length];
    const qId = `SOAL-AI-${Date.now()}-${i}`;

    if (type === "PG") {
      result.push({
        id: qId,
        type: "PG",
        question: `[${subject} - ${gradeClass}] Pertanyaan ${i}: Pada materi ${topic}, prosedur manakah yang paling sesuai dengan Standar Operasional Prosedur (SOP) industri kejuruan?`,
        difficulty: difficulty === "Campuran" ? (i % 2 === 0 ? "Sedang" : "Mudah") : difficulty,
        topic: topic,
        score: 10,
        options: [
          { key: "A", text: `Melakukan identifikasi dan pemeriksaan sistem secara runtut dan teliti.` },
          { key: "B", text: `Melewati tahap verifikasi awal untuk menghemat waktu kerja.` },
          { key: "C", text: `Menjalankan proses tanpa menggunakan alat pelindung diri (APD).` },
          { key: "D", text: `Mengubah konfigurasi tanpa panduan lembar kerja teknis.` },
          { key: "E", text: `Menyimpan data tanpa prosedur backup keselamatan.` },
        ],
        correctAnswer: "A",
        explanation: `Pilihan A benar karena dalam standar kejuruan, kepatuhan terhadap SOP dan ketelitian pemeriksaan adalah prinsip utama.`,
        tags: [subject, topic, "Draft-AI"],
      });
    } else if (type === "PGK") {
      result.push({
        id: qId,
        type: "PGK",
        question: `[${subject}] Pertanyaan ${i}: Pilihlah beberapa tindakan penting (lebih dari satu jawaban) yang wajib diterapkan dalam pengujian materi ${topic}!`,
        difficulty: "Sedang",
        topic: topic,
        score: 15,
        options: [
          { key: "A", text: "Penerapan keselamatan dan kesehatan kerja (K3LH)" },
          { key: "B", text: "Kalibrasi peralatan sesuai spesifikasi manufaktur" },
          { key: "C", text: "Mengabaikan dokumentasi log hasil pengujian" },
          { key: "D", text: "Pencatatan riwayat pemeliharaan secara terstruktur" },
        ],
        correctAnswer: ["A", "B", "D"],
        explanation: "Pilihan A, B, dan D wajib dilakukan sesuai kaidah teknis kejuruan SMK.",
        tags: [subject, "PGK", "Draft-AI"],
      });
    } else if (type === "BENAR_SALAH") {
      result.push({
        id: qId,
        type: "BENAR_SALAH",
        question: `[${subject}] Pertanyaan ${i}: "Penerapan pemeliharaan preventif (preventive maintenance) berkala pada materi ${topic} terbukti mampu menekan risiko kegagalan sistem hingga lebih dari 70%."`,
        difficulty: "Mudah",
        topic: topic,
        score: 10,
        options: [
          { key: "BENAR", text: "Benar" },
          { key: "SALAH", text: "Salah" },
        ],
        correctAnswer: "BENAR",
        explanation: "Pernyataan BENAR sesuai dengan kaidah manajemen perawatan fasilitas industri.",
        tags: [subject, "Benar-Salah", "Draft-AI"],
      });
    } else if (type === "PENJODOHAN") {
      result.push({
        id: qId,
        type: "PENJODOHAN",
        question: `[${subject}] Pertanyaan ${i}: Pasangkan istilah pada kolom kiri dengan deskripsinya yang tepat pada kolom kanan mengenai ${topic}!`,
        difficulty: "Sedang",
        topic: topic,
        score: 20,
        pairs: [
          { premise: `Tahap Analisis (${subject})`, match: "Mengidentifikasi kebutuhan sistem dan batasan teknis" },
          { premise: `Tahap Implementasi (${subject})`, match: "Mengeksekusi dan mengonfigurasi rancangan kerja" },
          { premise: `Tahap Evaluasi (${subject})`, match: "Menguji performa terhadap standar kelayakan" },
        ],
        correctAnswer: [
          { premise: `Tahap Analisis (${subject})`, match: "Mengidentifikasi kebutuhan sistem dan batasan teknis" },
          { premise: `Tahap Implementasi (${subject})`, match: "Mengeksekusi dan mengonfigurasi rancangan kerja" },
          { premise: `Tahap Evaluasi (${subject})`, match: "Menguji performa terhadap standar kelayakan" },
        ],
        explanation: "Pasangan tahap kerja sistematis SMK.",
        tags: [subject, "Penjodohan", "Draft-AI"],
      });
    } else {
      result.push({
        id: qId,
        type: "ISIAN",
        question: `[${subject}] Pertanyaan ${i}: Tuliskan singkatan baku dari standar prosedur keselamatan kerja di lingkungan bengkel/lab kejuruan dalam topik ${topic}!`,
        difficulty: "Sedang",
        topic: topic,
        score: 15,
        correctAnswer: "K3LH",
        explanation: "Kunci jawaban: K3LH (Keselamatan dan Kesehatan Kerja serta Lingkungan Hidup) atau SOP.",
        tags: [subject, "Isian", "Draft-AI"],
      });
    }
  }
  return result;
}
