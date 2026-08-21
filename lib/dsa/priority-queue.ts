/**
 * Generic Binary Heap Priority Queue Implementation.
 * Supports custom comparator for Min-Heap or Max-Heap behaviors.
 */

export type Comparator<T> = (a: T, b: T) => number;

export class PriorityQueue<T> {
  private heap: T[] = [];
  private readonly compare: Comparator<T>;

  /**
   * @param comparator Function returning > 0 if `a` has higher priority than `b`.
   * For Max-Heap on numbers: (a, b) => a - b
   * For Min-Heap on numbers: (a, b) => b - a
   */
  constructor(comparator: Comparator<T>) {
    this.compare = comparator;
  }

  get size(): number {
    return this.heap.length;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  peek(): T | undefined {
    return this.heap[0];
  }

  push(value: T): void {
    this.heap.push(value);
    this.siftUp(this.heap.length - 1);
  }

  pop(): T | undefined {
    if (this.isEmpty()) return undefined;
    const top = this.heap[0];
    const bottom = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = bottom;
      this.siftDown(0);
    }
    return top;
  }

  /**
   * Returns the top K elements sorted in descending priority order.
   * Time complexity: O(N log K) if using an internal heap, or O(K log N) by popping.
   */
  popTopK(k: number): T[] {
    const result: T[] = [];
    const limit = Math.min(k, this.size);
    for (let i = 0; i < limit; i++) {
      const item = this.pop();
      if (item !== undefined) result.push(item);
    }
    return result;
  }

  /**
   * Helper to build a heap from an array of elements in O(N).
   */
  static fromArray<T>(items: T[], comparator: Comparator<T>): PriorityQueue<T> {
    const pq = new PriorityQueue<T>(comparator);
    pq.heap = [...items];
    for (let i = Math.floor(pq.heap.length / 2) - 1; i >= 0; i--) {
      pq.siftDown(i);
    }
    return pq;
  }

  /**
   * Efficiently finds the Top-K elements from an array without mutating the original.
   */
  static topK<T>(items: T[], k: number, comparator: Comparator<T>): T[] {
    if (k <= 0 || items.length === 0) return [];
    const pq = PriorityQueue.fromArray(items, comparator);
    return pq.popTopK(k);
  }

  private siftUp(index: number): void {
    let current = index;
    while (current > 0) {
      const parent = Math.floor((current - 1) / 2);
      if (this.compare(this.heap[current], this.heap[parent]) > 0) {
        this.swap(current, parent);
        current = parent;
      } else {
        break;
      }
    }
  }

  private siftDown(index: number): void {
    let current = index;
    const length = this.heap.length;

    while (true) {
      let highest = current;
      const left = 2 * current + 1;
      const right = 2 * current + 2;

      if (left < length && this.compare(this.heap[left], this.heap[highest]) > 0) {
        highest = left;
      }
      if (right < length && this.compare(this.heap[right], this.heap[highest]) > 0) {
        highest = right;
      }

      if (highest !== current) {
        this.swap(current, highest);
        current = highest;
      } else {
        break;
      }
    }
  }

  private swap(i: number, j: number): void {
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;
  }
}
