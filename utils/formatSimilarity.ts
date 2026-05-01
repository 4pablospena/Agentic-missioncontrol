/** Maps cosine similarity ([-1, 1], typical ≥ 0 for embeddings) to a 0–100 display score. */
export function formatSimilarityScore(similarity: number): string {
  const pct = Math.round(Math.max(0, Math.min(1, similarity)) * 1000) / 10
  return `${pct}%`
}
