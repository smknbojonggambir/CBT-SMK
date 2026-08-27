import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      app: "CBT SMK Profesional",
      version: "2.5.0",
      timestamp: new Date().toISOString(),
    });
  });

  // AI Question Generator endpoint (using Google Gemini SDK)
  app.post("/api/ai/generate-questions", async (req, res) => {
    try {
      const {
        subject,
        gradeClass,
        topic,
        learningObjective,
        count = 5,
        questionType = "PG", // PG, PGK, BENAR_SALAH, PENJODOHAN, ISIAN, CAMPURAN
        difficulty = "Sedang", // Mudah, Sedang, Sulit, Campuran
      } = req.body;

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(200).json({
          success: false,
          fallback: true,
          message: "API Key Gemini belum disetel di server. Menggunakan generator draft lokal bawaan sistem.",
          questions: generateFallbackQuestions(subject, gradeClass, topic, count, questionType, difficulty),
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Anda adalah ahli kurikulum SMK (Sekolah Menengah Kejuruan) Indonesia.
Buatkan ${count} butir soal ujian CBT untuk:
- Mata Pelajaran: ${subject || "Dasar-dasar Kejuruan SMK"}
- Kelas/Tingkat: ${gradeClass || "X SMK"}
- Materi/Topik: ${topic || "Kompetensi Keahlian"}
- Capaian/Tujuan Pembelajaran: ${learningObjective || "Memahami konsep dan aplikasi praktis"}
- Tipe Soal: ${questionType} (bisa PG = Pilihan Ganda 5 opsi A-E, PGK = Pilihan Ganda Kompleks multiple checklist, BENAR_SALAH = pernyataan Benar/Salah, PENJODOHAN = pasangkan premis dan respon, ISIAN = isian singkat)
- Tingkat Kesulitan: ${difficulty}

Output WAJIB berupa JSON murni dengan format array of object seperti ini (tanpa markdown tambahan):
[
  {
    "id": "SOAL-DRAFT-1",
    "type": "PG", // "PG" | "PGK" | "BENAR_SALAH" | "PENJODOHAN" | "ISIAN"
    "question": "Teks pertanyaan lengkap dan kontekstual...",
    "difficulty": "Sedang", // "Mudah" | "Sedang" | "Sulit"
    "topic": "${topic || "Dasar Kejuruan"}",
    "score": 10,
    "options": [ // untuk PG & PGK
      {"key": "A", "text": "Pilihan A"},
      {"key": "B", "text": "Pilihan B"},
      {"key": "C", "text": "Pilihan C"},
      {"key": "D", "text": "Pilihan D"},
      {"key": "E", "text": "Pilihan E"}
    ],
    "correctAnswer": "A", // Untuk PG: "A". Untuk PGK: ["A", "C"]. Untuk BENAR_SALAH: "BENAR" atau "SALAH". Untuk PENJODOHAN: [{"premise": "Kabel UTP", "match": "Konektor RJ45"}, ...]. Untuk ISIAN: "kunci jawaban teks"
    "pairs": [ // HANYA jika type == "PENJODOHAN"
      {"premise": "Premis 1", "match": "Jawaban 1"},
      {"premise": "Premis 2", "match": "Jawaban 2"},
      {"premise": "Premis 3", "match": "Jawaban 3"}
    ],
    "explanation": "Pembahasan singkat mengapa kunci jawaban tersebut benar...",
    "tags": ["SMK", "${subject || "Kejuruan"}"]
  }
]`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.3,
        },
      });

      const responseText = response.text || "[]";
      let parsedQuestions = [];
      try {
        parsedQuestions = JSON.parse(responseText);
      } catch (parseError) {
        // In case markdown block wrapped
        const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        parsedQuestions = JSON.parse(cleanJson);
      }

      return res.json({
        success: true,
        source: "gemini-ai",
        questions: parsedQuestions,
      });
    } catch (error: any) {
      console.error("Gemini AI generation error:", error);
      return res.json({
        success: false,
        fallback: true,
        message: error.message || "Gagal menghasilkan soal dengan AI. Menggunakan generator draft lokal.",
        questions: generateFallbackQuestions(
          req.body.subject,
          req.body.gradeClass,
          req.body.topic,
          req.body.count || 5,
          req.body.questionType || "PG",
          req.body.difficulty || "Sedang"
        ),
      });
    }
  });

  // Local fallback generator for when no API key is set
  function generateFallbackQuestions(
    subject = "Dasar Kejuruan SMK",
    grade = "X SMK",
    topic = "Kompetensi Dasar",
    count = 5,
    qType = "PG",
    diff = "Sedang"
  ) {
    const list = [];
    const types = qType === "CAMPURAN" ? ["PG", "PGK", "BENAR_SALAH", "PENJODOHAN", "ISIAN"] : [qType];

    for (let i = 1; i <= count; i++) {
      const type = types[(i - 1) % types.length];
      const qId = `SOAL-DRAFT-${Date.now()}-${i}`;

      if (type === "PG") {
        list.push({
          id: qId,
          type: "PG",
          question: `[${subject} - ${grade}] Pertanyaan ${i}: Pada materi ${topic}, manakah pernyataan berikut yang paling tepat sesuai dengan standar prosedur operasional (SOP) di industri?`,
          difficulty: diff === "Campuran" ? (i % 3 === 0 ? "Sulit" : i % 2 === 0 ? "Sedang" : "Mudah") : diff,
          topic: topic,
          score: 10,
          options: [
            { key: "A", text: `Mengidentifikasi komponen utama dan melakukan verifikasi fungsi secara berurutan.` },
            { key: "B", text: `Mengabaikan langkah kalibrasi awal demi efisiensi waktu pengerjaan.` },
            { key: "C", text: `Melakukan konfigurasi tanpa membaca lembar spesifikasi teknis.` },
            { key: "D", text: `Mengoperasikan peralatan tanpa alat pelindung diri (APD) standar.` },
            { key: "E", text: `Menyimpan data hasil pengujian hanya di memori sementara tanpa backup.` },
          ],
          correctAnswer: "A",
          explanation: `Pilihan A benar karena dalam standar industri SMK, verifikasi dan SOP wajib dijalankan secara presisi dan terstruktur.`,
          tags: [subject, topic, "SOP-SMK"],
        });
      } else if (type === "PGK") {
        list.push({
          id: qId,
          type: "PGK",
          question: `[${subject}] Pertanyaan ${i}: Pilihlah beberapa parameter kritis (lebih dari satu jawaban) yang wajib diperhatikan saat implementasi ${topic}!`,
          difficulty: "Sedang",
          topic: topic,
          score: 15,
          options: [
            { key: "A", text: "Penerapan Keselamatan dan Kesehatan Kerja (K3)" },
            { key: "B", text: "Kesesuaian spesifikasi teknis dengan standar industri" },
            { key: "C", text: "Penggunaan material yang tidak terstandarisasi" },
            { key: "D", text: "Proses dokumentasi dan pencatatan log hasil kerja" },
          ],
          correctAnswer: ["A", "B", "D"],
          explanation: "Jawaban A, B, dan D adalah pilar utama standar operasional kejuruan, sedangkan C dilarang.",
          tags: [subject, "PGK"],
        });
      } else if (type === "BENAR_SALAH") {
        list.push({
          id: qId,
          type: "BENAR_SALAH",
          question: `[${subject}] Pertanyaan ${i}: "Dalam penerapan ${topic}, proses pengujian berkala dan pencatatan riwayat pemeliharaan dapat memperpanjang usia pakai perangkat dan mencegah downtime kritis."`,
          difficulty: "Mudah",
          topic: topic,
          score: 10,
          options: [
            { key: "BENAR", text: "Benar" },
            { key: "SALAH", text: "Salah" },
          ],
          correctAnswer: "BENAR",
          explanation: "Pernyataan tersebut benar sesuai dengan prinsip preventive maintenance industri.",
          tags: [subject, "Benar-Salah"],
        });
      } else if (type === "PENJODOHAN") {
        list.push({
          id: qId,
          type: "PENJODOHAN",
          question: `[${subject}] Pertanyaan ${i}: Pasangkan istilah pada kolom kiri dengan fungsinya yang tepat pada kolom kanan terkait topik ${topic}!`,
          difficulty: "Sedang",
          topic: topic,
          score: 20,
          pairs: [
            { premise: `Input Data / Masukan (${subject})`, match: "Menerima sinyal informasi dari sensor atau operator" },
            { premise: `Processing Unit / Pengolah (${subject})`, match: "Melakukan komputasi dan instruksi logika program" },
            { premise: `Output Device / Keluaran (${subject})`, match: "Menampilkan atau mengeksekusi hasil kerja sistem" },
          ],
          correctAnswer: [
            { premise: `Input Data / Masukan (${subject})`, match: "Menerima sinyal informasi dari sensor atau operator" },
            { premise: `Processing Unit / Pengolah (${subject})`, match: "Melakukan komputasi dan instruksi logika program" },
            { premise: `Output Device / Keluaran (${subject})`, match: "Menampilkan atau mengeksekusi hasil kerja sistem" },
          ],
          explanation: "Pasangan disesuaikan dengan siklus Input - Proses - Output standar teknologi SMK.",
          tags: [subject, "Penjodohan"],
        });
      } else {
        list.push({
          id: qId,
          type: "ISIAN",
          question: `[${subject}] Pertanyaan ${i}: Sebutkan istilah standar untuk prosedur tindakan pencegahan bahaya kerja dan pemeliharaan alat dalam materi ${topic}!`,
          difficulty: "Sedang",
          topic: topic,
          score: 15,
          correctAnswer: "K3LH",
          explanation: "Kunci jawaban: K3LH (Keselamatan, Kesehatan Kerja dan Lingkungan Hidup) atau SOP.",
          tags: [subject, "Isian"],
        });
      }
    }
    return list;
  }

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CBT SMK Server berjalan pada port ${PORT}`);
  });
}

startServer();
