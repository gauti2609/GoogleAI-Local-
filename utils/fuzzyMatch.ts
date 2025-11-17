/**
 * Fuzzy matching utility for ledger name matching
 * Uses Levenshtein distance algorithm to find similar strings
 */

/**
 * Calculate Levenshtein distance between two strings
 * @param str1 First string
 * @param str2 Second string
 * @returns The edit distance between the two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  // Initialize matrix
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[len1][len2];
}

/**
 * Calculate similarity score between two strings (0-1)
 * @param str1 First string
 * @param str2 Second string
 * @returns Similarity score from 0 (no match) to 1 (perfect match)
 */
export function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return 1.0;
  if (s1.length === 0 || s2.length === 0) return 0;

  const maxLength = Math.max(s1.length, s2.length);
  const distance = levenshteinDistance(s1, s2);
  
  return 1 - distance / maxLength;
}

/**
 * Find best matching string from a list of candidates
 * @param target The string to match
 * @param candidates List of candidate strings to match against
 * @param threshold Minimum similarity threshold (0-1)
 * @returns The best match and its similarity score, or null if no match above threshold
 */
export function findBestMatch(
  target: string,
  candidates: string[],
  threshold: number = 0.6
): { match: string; score: number } | null {
  let bestMatch: string | null = null;
  let bestScore = 0;

  for (const candidate of candidates) {
    const score = calculateSimilarity(target, candidate);
    if (score > bestScore && score >= threshold) {
      bestScore = score;
      bestMatch = candidate;
    }
  }

  return bestMatch ? { match: bestMatch, score: bestScore } : null;
}

/**
 * Check if a ledger name contains keywords indicating its type
 * @param ledgerName The ledger name to analyze
 * @returns An array of detected keywords
 */
export function detectLedgerKeywords(ledgerName: string): string[] {
  const name = ledgerName.toLowerCase();
  const keywords: string[] = [];

  // Asset keywords
  if (/\b(cash|bank|receivable|debtor|inventory|stock|asset|equipment|machinery|building|land|vehicle)\b/.test(name)) {
    keywords.push('asset');
  }

  // Liability keywords
  if (/\b(payable|creditor|loan|liability|borrowing|debt|overdraft)\b/.test(name)) {
    keywords.push('liability');
  }

  // Income keywords
  if (/\b(sales|revenue|income|receipt|earning|profit|gain|commission received)\b/.test(name)) {
    keywords.push('income');
  }

  // Expense keywords
  if (/\b(expense|cost|payment|purchase|salaries|wages|rent|utility|depreciation|commission paid)\b/.test(name)) {
    keywords.push('expense');
  }

  // Equity keywords
  if (/\b(capital|equity|reserve|surplus|retained)\b/.test(name)) {
    keywords.push('equity');
  }

  return keywords;
}

/**
 * Enhanced fuzzy matching that combines string similarity with keyword detection
 * @param ledgerName The ledger name to match
 * @param masterItems List of master items with code and name
 * @param threshold Minimum similarity threshold
 * @returns Best matching master item or null
 */
export function fuzzyMatchLedger<T extends { code: string; name: string }>(
  ledgerName: string,
  masterItems: T[],
  threshold: number = 0.6
): { item: T; score: number; confidence: number } | null {
  const keywords = detectLedgerKeywords(ledgerName);
  let bestMatch: { item: T; score: number } | null = null;
  let bestScore = 0;

  for (const item of masterItems) {
    const similarity = calculateSimilarity(ledgerName, item.name);
    const itemKeywords = detectLedgerKeywords(item.name);
    
    // Boost score if keywords match
    const keywordBonus = keywords.some(k => itemKeywords.includes(k)) ? 0.1 : 0;
    const finalScore = Math.min(1.0, similarity + keywordBonus);

    if (finalScore > bestScore && similarity >= threshold) {
      bestScore = finalScore;
      bestMatch = { item, score: similarity };
    }
  }

  if (!bestMatch) return null;

  // Calculate confidence based on score and keyword match
  const hasKeywordMatch = keywords.some(k => 
    detectLedgerKeywords(bestMatch!.item.name).includes(k)
  );
  const confidence = hasKeywordMatch ? bestScore * 1.1 : bestScore;

  return {
    item: bestMatch.item,
    score: bestMatch.score,
    confidence: Math.min(1.0, confidence)
  };
}
