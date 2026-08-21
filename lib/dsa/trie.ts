/**
 * Prefix Trie Data Structure for fast keyword lookup, autocomplete, and entity matching.
 */

export class TrieNode {
  children: Map<string, TrieNode> = new Map();
  isEndOfWord = false;
  frequency = 0;
  metadata?: Record<string, unknown>;
}

export interface TrieSearchResult {
  word: string;
  frequency: number;
  metadata?: Record<string, unknown>;
}

export class Trie {
  root: TrieNode = new TrieNode();
  private totalWords = 0;

  get size(): number {
    return this.totalWords;
  }

  insert(word: string, metadata?: Record<string, unknown>, frequency = 1): void {
    if (!word || word.trim() === "") return;
    const normalized = word.toLowerCase().trim();
    let current = this.root;

    for (const char of normalized) {
      if (!current.children.has(char)) {
        current.children.set(char, new TrieNode());
      }
      current = current.children.get(char)!;
    }

    if (!current.isEndOfWord) {
      this.totalWords++;
    }
    current.isEndOfWord = true;
    current.frequency += frequency;
    if (metadata) {
      current.metadata = { ...current.metadata, ...metadata };
    }
  }

  search(word: string): boolean {
    if (!word) return false;
    const node = this.findNode(word.toLowerCase().trim());
    return node !== null && node.isEndOfWord;
  }

  startsWith(prefix: string): boolean {
    if (!prefix) return false;
    return this.findNode(prefix.toLowerCase().trim()) !== null;
  }

  findWordsWithPrefix(prefix: string, maxResults = 5): TrieSearchResult[] {
    const normalized = prefix.toLowerCase().trim();
    const results: TrieSearchResult[] = [];
    if (!normalized) return results;

    const startNode = this.findNode(normalized);
    if (!startNode) return results;

    const collect = (node: TrieNode, currentWord: string) => {
      if (results.length >= maxResults * 3) return; // Prevent excessive deep traversal

      if (node.isEndOfWord) {
        results.push({
          word: currentWord,
          frequency: node.frequency,
          metadata: node.metadata,
        });
      }

      // Traverse children
      for (const [char, childNode] of node.children.entries()) {
        collect(childNode, currentWord + char);
      }
    };

    collect(startNode, normalized);

    // Sort by frequency descending and limit
    return results.sort((a, b) => b.frequency - a.frequency).slice(0, maxResults);
  }

  private findNode(prefix: string): TrieNode | null {
    let current = this.root;
    for (const char of prefix) {
      if (!current.children.has(char)) {
        return null;
      }
      current = current.children.get(char)!;
    }
    return current;
  }
}
