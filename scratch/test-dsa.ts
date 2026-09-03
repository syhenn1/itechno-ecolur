import { PriorityQueue } from "../lib/dsa/priority-queue";
import { QuadTree } from "../lib/dsa/quadtree";
import { Trie } from "../lib/dsa/trie";
import { InvertedIndex } from "../lib/dsa/inverted-index";
import { ECOLUR_KNOWLEDGE_BASE } from "../lib/rag/knowledge-base";
import { retrieveKnowledge, askEcoBot } from "../lib/rag/engine";
import { triageReports, type DispatchReport } from "../lib/spatial/officer-dispatch";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`[FAIL] ASSERTION FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`[PASS] ${message}`);
  }
}

async function runTests() {
  console.log("=== 1. TESTING PRIORITY QUEUE (HEAP) ===");
  const maxHeap = new PriorityQueue<number>((a, b) => a - b);
  [10, 40, 20, 5, 50, 30].forEach((n) => maxHeap.push(n));
  assert(maxHeap.peek() === 50, "Max-Heap peek should be 50");
  assert(maxHeap.pop() === 50, "First pop should be 50");
  assert(maxHeap.pop() === 40, "Second pop should be 40");

  const top3 = PriorityQueue.topK([10, 40, 20, 5, 50, 30], 3, (a, b) => a - b);
  assert(top3.length === 3 && top3[0] === 50 && top3[1] === 40 && top3[2] === 30, "Top-K should return [50, 40, 30]");

  console.log("\n=== 2. TESTING 2D SPATIAL QUADTREE ===");
  const bounds = { minLat: -7.0, maxLat: -6.0, minLng: 106.0, maxLng: 107.0 };
  const qt = new QuadTree<{ id: string; lat: number; lng: number }>(bounds, 2);

  const testPoints = [
    { id: "p1", lat: -6.44, lng: 106.90 },
    { id: "p2", lat: -6.441, lng: 106.901 },
    { id: "p3", lat: -6.442, lng: 106.902 },
    { id: "p4", lat: -6.80, lng: 106.20 }, // Far away
  ];
  qt.insertMany(testPoints);
  assert(qt.getAllPoints().length === 4, "QuadTree should store all 4 points");

  const near = qt.queryRadius(-6.44, 106.90, 2.0); // within 2km
  assert(near.length === 3, "Radius query within 2km should find 3 nearby points");

  const knn = qt.findKNearest(-6.44, 106.90, 2);
  assert(knn.length === 2 && knn[0].item.id === "p1", "KNN closest point should be p1");

  const clusters = qt.getClusters(2);
  assert(clusters.length > 0, "QuadTree should generate spatial clusters");

  console.log("\n=== 3. TESTING PREFIX TRIE ===");
  const trie = new Trie();
  ["solar", "solar panel", "sampah", "sop jalan", "subsidi listrik"].forEach((w) => trie.insert(w));
  assert(trie.search("solar"), "Trie should find exact word 'solar'");
  assert(!trie.search("sol"), "Trie should not match incomplete word 'sol'");
  assert(trie.startsWith("sol"), "Trie startsWith('sol') should be true");

  const suggestions = trie.findWordsWithPrefix("so");
  assert(suggestions.length >= 2, "Trie prefix 'so' should return solar & sop jalan");

  console.log("\n=== 4. TESTING INVERTED INDEX & BM25 SCORING ===");
  const idx = new InvertedIndex();
  idx.addDocuments(ECOLUR_KNOWLEDGE_BASE);
  const searchResults = idx.search("aturan pasang solar panel atap permen esdm", 2);
  assert(searchResults.length > 0, "Inverted index should find relevant solar panel document");
  assert(searchResults[0].chunk.id === "reg-plts-atap-esdm", "Top result should be PLTS Atap ESDM chunk");

  console.log("\n=== 5. TESTING RAG ASSISTANT PIPELINE ===");
  const ragRetrieved = retrieveKnowledge("berapa tarif listrik 900 VA PLN?", 2);
  assert(ragRetrieved.length > 0 && ragRetrieved[0].chunk.id === "reg-pln-tariff-2026", "RAG should retrieve PLN tariff doc");

  const response = await askEcoBot("bagaimana cara hemat listrik ac?");
  assert(response.answer.length > 10, "EcoBot should generate non-empty answer");
  assert(response.sources.length > 0, "EcoBot should return source citations");

  console.log("\n=== 6. TESTING OFFICER SPATIAL DISPATCH & TRIAGE ===");
  const dummyReports: DispatchReport[] = [
    {
      id: "rep-1",
      category: "sampah",
      description: "Sampah menumpuk",
      photoUrl: null,
      status: "REPORTED",
      lat: -6.445,
      lng: 106.905,
      createdAt: new Date(Date.now() - 3600 * 1000 * 2), // 2 hours ago
      user: { name: "User 1", phone: "081" },
      statusLogs: [],
    },
    {
      id: "rep-2",
      category: "jalan_rusak", // High urgency category (85)
      description: "Jalan amblas darurat",
      photoUrl: null,
      status: "REPORTED",
      lat: -6.435,
      lng: 106.895,
      createdAt: new Date(Date.now() - 3600 * 1000 * 5), // 5 hours ago
      user: { name: "User 2", phone: "082" },
      statusLogs: [],
    },
  ];

  const smartTriaged = triageReports(dummyReports, "SMART_PRIORITY");
  assert(smartTriaged[0].id === "rep-2", "Smart triage should prioritize dangerous jalan_rusak over routine sampah");

  console.log("\n[SUCCESS] ALL DSA & RAG TESTS PASSED SUCCESSFULLY!");
}

runTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
