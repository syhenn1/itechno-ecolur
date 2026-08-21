import { InvertedIndex, type DocumentChunk, type SearchScoreResult } from "../dsa/inverted-index";
import { Trie } from "../dsa/trie";
import { ECOLUR_KNOWLEDGE_BASE } from "./knowledge-base";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Inverted Index & Trie singletons in memory
const invertedIndex = new InvertedIndex();
const queryTrie = new Trie();

// Populate index and trie
invertedIndex.addDocuments(ECOLUR_KNOWLEDGE_BASE);

for (const doc of ECOLUR_KNOWLEDGE_BASE) {
  for (const kw of doc.keywords ?? []) {
    queryTrie.insert(kw, { docId: doc.id, category: doc.category });
  }
}

// Popular sample queries for quick auto-suggest
const POPULAR_QUERIES = [
  "Berapa tarif listrik 900 VA dan 1300 VA?",
  "Bagaimana cara pasang solar panel di rumah?",
  "Cara hemat listrik AC ruangan",
  "SOP perbaikan jalan berlubang di Bojong Kulur",
  "Jadwal pengangkutan sampah lingkungan",
  "Penanganan banjir sungai Cileungsi dan drainase",
  "Cara mendapatkan XP dan klaim hadiah EcoLur",
  "Syarat pengajuan subsidi listrik PLN",
];

for (const query of POPULAR_QUERIES) {
  queryTrie.insert(query, { isPopular: true });
}

export interface RagResponse {
  answer: string;
  sources: {
    title: string;
    source: string;
    category: string;
    relevanceScore: number;
  }[];
  matchedTerms: string[];
}

function sanitizeInput(input: string, maxLen = 600): string {
  return input
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .slice(0, maxLen)
    .trim();
}

/**
 * Retrieve top-K relevant knowledge chunks using Inverted Index & Priority Queue.
 */
export function retrieveKnowledge(query: string, topK = 3): SearchScoreResult[] {
  return invertedIndex.search(query, topK);
}

/**
 * Prefix autocomplete suggestions using Trie.
 */
export function getQuerySuggestions(prefix: string, maxResults = 5): string[] {
  return queryTrie.findWordsWithPrefix(prefix, maxResults).map((r) => r.word);
}

/**
 * Core RAG pipeline:
 * 1. Query Preprocessing
 * 2. Top-K Knowledge Retrieval via Inverted Index + Priority Queue (Max-Heap)
 * 3. Context Injection + Grounded AI Generation with Source Citations
 */
export async function askEcoBot(query: string): Promise<RagResponse> {
  const sanitizedQuery = sanitizeInput(query);
  if (!sanitizedQuery) {
    return {
      answer: "Silakan masukkan pertanyaan Anda seputar energi, regulasi, atau layanan publik.",
      sources: [],
      matchedTerms: [],
    };
  }

  // 1. Retrieve Knowledge Chunks (RAG)
  const searchResults = retrieveKnowledge(sanitizedQuery, 3);

  const matchedTerms = Array.from(
    new Set(searchResults.flatMap((r) => r.matchedTerms)),
  );

  const sources = searchResults.map((r) => ({
    title: r.chunk.title,
    source: r.chunk.source,
    category: r.chunk.category,
    relevanceScore: Math.round(r.score * 100) / 100,
  }));

  // If no chunks matched closely, fallback to top energy & general knowledge
  const contextChunks: DocumentChunk[] =
    searchResults.length > 0
      ? searchResults.map((r) => r.chunk)
      : ECOLUR_KNOWLEDGE_BASE.slice(0, 2);

  const contextText = contextChunks
    .map(
      (c, i) =>
        `[Dokumen ${i + 1}: ${c.title} (Sumber: ${c.source})]\n${c.content}`,
    )
    .join("\n\n");

  // 2. Synthesize answer with Gemini API
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const modelName = process.env.GEMINI_MODEL ?? "gemini-flash-latest";
      const model = genAI.getGenerativeModel({ model: modelName });

      const prompt = [
        "Kamu adalah 'EcoBot', asisten pintar ramah lingkungan untuk warga Desa Bojong Kulur dan masyarakat umum di platform EcoLur (SDG 7 & SDG 11).",
        "Jawab pertanyaan warga secara ringkas, jelas, solutif, dan ramah dalam bahasa Indonesia yang natural.",
        "Gunakan HANYA informasi resmi dari DATA KONTEKS di bawah ini. Jika pertanyaan di luar konteks, jawab dengan sopan berdasarkan pengetahuan umum energi/layanan publik dan sarankan menghubungi aparat desa/PLN.",
        "Sertakan nama sumber resmi (misal: 'Berdasarkan Permen ESDM No. 2/2024...' atau 'Menurut SOP Bojong Kulur...') jika relevan.",
        "",
        "--- DATA KONTEKS DARI KNOWLEDGE BASE (RAG) ---",
        contextText,
        "--- AKHIR DATA KONTEKS ---",
        "",
        `Pertanyaan Warga: "${sanitizedQuery}"`,
      ].join("\n");

      const result = await model.generateContent(prompt);
      const answer = result.response.text().trim();

      if (answer) {
        return {
          answer,
          sources,
          matchedTerms,
        };
      }
    } catch (err) {
      console.error("[rag.engine] Gemini API error, falling back to local synthesis:", err);
    }
  }

  // Fallback if Gemini key is not configured or failed: Local Rule-Based Synthesis
  const fallbackAnswer = generateLocalSynthesis(sanitizedQuery, contextChunks);
  return {
    answer: fallbackAnswer,
    sources,
    matchedTerms,
  };
}

function generateLocalSynthesis(query: string, chunks: DocumentChunk[]): string {
  if (chunks.length === 0) {
    return "Maaf, saat ini sistem belum menemukan informasi yang spesifik untuk pertanyaan Anda. Silakan coba kata kunci lain seperti 'tarif listrik', 'solar panel', 'sampah', atau 'jalan rusak'.";
  }

  const primary = chunks[0];
  return `Berdasarkan dokumen resmi **"${primary.title}"** (${primary.source}):\n\n${primary.content}\n\n*Catatan: Anda dapat menghubungi layanan pelanggan resmi PLN di 123 atau Posko Desa Bojong Kulur untuk info operasional terkini.*`;
}
