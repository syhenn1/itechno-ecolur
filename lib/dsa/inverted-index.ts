import { PriorityQueue } from "./priority-queue";

export interface DocumentChunk {
  id: string;
  title: string;
  category: "energy" | "public_service" | "regulation" | "gamification";
  content: string;
  source: string;
  keywords?: string[];
}

export interface SearchScoreResult {
  chunk: DocumentChunk;
  score: number;
  matchedTerms: string[];
}

// Common Indonesian stop words to filter out for cleaner indexing
const INDONESIAN_STOP_WORDS = new Set([
  "yang", "di", "dan", "dari", "ini", "untuk", "pada", "adalah", "ke", "itu",
  "dengan", "atau", "juga", "oleh", "dalam", "akan", "dapat", "sudah", "ada",
  "karena", "sebagai", "bagi", "sampai", "setiap", "kami", "kita", "bisa", "hal",
  "saya", "anda", "dia", "mereka", "jika", "maka", "tetapi", "namun", "agar",
  "supaya", "tentang", "serta", "saat", "ketika", "lebih", "sangat",
]);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 2 && !INDONESIAN_STOP_WORDS.has(w));
}

/**
 * Inverted Index with BM25-like TF-IDF scoring for document retrieval.
 */
export class InvertedIndex {
  private documents: Map<string, DocumentChunk> = new Map();
  private index: Map<string, Map<string, number>> = new Map(); // term -> (docId -> termFrequency)
  private docLengths: Map<string, number> = new Map(); // docId -> total tokens
  private avgDocLength = 0;

  addDocument(doc: DocumentChunk): void {
    this.documents.set(doc.id, doc);
    const tokens = tokenize(`${doc.title} ${doc.content} ${(doc.keywords ?? []).join(" ")}`);
    this.docLengths.set(doc.id, tokens.length);

    const termFreq = new Map<string, number>();
    for (const token of tokens) {
      termFreq.set(token, (termFreq.get(token) ?? 0) + 1);
    }

    for (const [term, freq] of termFreq.entries()) {
      if (!this.index.has(term)) {
        this.index.set(term, new Map());
      }
      this.index.get(term)!.set(doc.id, freq);
    }

    this.recomputeAvgDocLength();
  }

  addDocuments(docs: DocumentChunk[]): void {
    for (const doc of docs) {
      this.addDocument(doc);
    }
  }

  private recomputeAvgDocLength(): void {
    let total = 0;
    for (const len of this.docLengths.values()) {
      total += len;
    }
    this.avgDocLength = this.docLengths.size > 0 ? total / this.docLengths.size : 0;
  }

  /**
   * Search and score documents using BM25 ranking formula:
   * Score = sum( IDF(q) * (f(q, D) * (k1 + 1)) / (f(q, D) + k1 * (1 - b + b * (|D| / avgdl))) )
   */
  search(query: string, topK = 3): SearchScoreResult[] {
    const queryTokens = tokenize(query);
    if (queryTokens.length === 0 || this.documents.size === 0) return [];

    const scores = new Map<string, { score: number; matchedTerms: Set<string> }>();
    const totalDocs = this.documents.size;
    const k1 = 1.2;
    const b = 0.75;

    for (const token of queryTokens) {
      const posting = this.index.get(token);
      if (!posting) continue;

      const docFreq = posting.size;
      // Inverse Document Frequency (IDF)
      const idf = Math.log((totalDocs - docFreq + 0.5) / (docFreq + 0.5) + 1);

      for (const [docId, tf] of posting.entries()) {
        const docLen = this.docLengths.get(docId) ?? this.avgDocLength;
        const numerator = tf * (k1 + 1);
        const denominator = tf + k1 * (1 - b + b * (docLen / (this.avgDocLength || 1)));
        const termScore = idf * (numerator / denominator);

        if (!scores.has(docId)) {
          scores.set(docId, { score: 0, matchedTerms: new Set() });
        }
        const entry = scores.get(docId)!;
        entry.score += termScore;
        entry.matchedTerms.add(token);
      }
    }

    const scoredResults: SearchScoreResult[] = [];
    for (const [docId, { score, matchedTerms }] of scores.entries()) {
      const doc = this.documents.get(docId);
      if (doc && score > 0) {
        scoredResults.push({
          chunk: doc,
          score,
          matchedTerms: Array.from(matchedTerms),
        });
      }
    }

    // Top-K extraction using PriorityQueue (Max-Heap)
    return PriorityQueue.topK(
      scoredResults,
      topK,
      (a, b) => a.score - b.score, // higher score = higher priority
    );
  }

  getDocument(id: string): DocumentChunk | undefined {
    return this.documents.get(id);
  }

  getAllDocuments(): DocumentChunk[] {
    return Array.from(this.documents.values());
  }
}
