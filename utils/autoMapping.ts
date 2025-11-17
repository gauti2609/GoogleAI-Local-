import { Masters, TrialBalanceItem } from '../types.ts';
import { fuzzyMatchLedger, calculateSimilarity, detectLedgerKeywords } from './fuzzyMatch.ts';

/**
 * Attempt to automatically map a ledger using fuzzy logic
 * @param ledgerName The name of the ledger to map
 * @param closingBalance The closing balance (to determine debit/credit nature)
 * @param masters The master data for Chart of Accounts
 * @returns Suggested mapping or null if no good match found
 */
export function autoMapLedger(
  ledgerName: string,
  closingBalance: number,
  masters: Masters
): {
  majorHeadCode: string;
  minorHeadCode: string;
  groupingCode: string;
  lineItemCode: string;
  confidence: number;
  reasoning: string;
} | null {
  // Determine balance nature
  const isDebit = closingBalance >= 0;
  const keywords = detectLedgerKeywords(ledgerName);

  // First try to match with groupings (most specific level)
  const groupingMatch = fuzzyMatchLedger(ledgerName, masters.groupings, 0.50);
  
  if (groupingMatch && groupingMatch.confidence >= 0.60) {
    const grouping = groupingMatch.item;
    const minorHead = masters.minorHeads.find(mh => mh.code === grouping.minorHeadCode);
    const majorHead = minorHead ? masters.majorHeads.find(mh => mh.code === minorHead.majorHeadCode) : null;

    if (minorHead && majorHead) {
      // Try to find a matching line item
      const lineItems = masters.lineItems.filter(li => li.groupingCode === grouping.code);
      const lineItemMatch = lineItems.length > 0 
        ? fuzzyMatchLedger(ledgerName, lineItems, 0.55)
        : null;

      return {
        majorHeadCode: majorHead.code,
        minorHeadCode: minorHead.code,
        groupingCode: grouping.code,
        lineItemCode: lineItemMatch?.item.code || '',
        confidence: groupingMatch.confidence,
        reasoning: `Fuzzy matched to "${grouping.name}" with ${(groupingMatch.score * 100).toFixed(0)}% similarity` +
          (lineItemMatch ? ` and line item "${lineItemMatch.item.name}"` : '')
      };
    }
  }

  // If grouping match didn't work, try minor head matching
  const minorHeadMatch = fuzzyMatchLedger(ledgerName, masters.minorHeads, 0.50);
  
  if (minorHeadMatch && minorHeadMatch.confidence >= 0.55) {
    const minorHead = minorHeadMatch.item;
    const majorHead = masters.majorHeads.find(mh => mh.code === minorHead.majorHeadCode);
    
    if (majorHead) {
      // Find the first grouping under this minor head
      const groupings = masters.groupings.filter(g => g.minorHeadCode === minorHead.code);
      
      if (groupings.length > 0) {
        // Try to find best grouping match
        const groupingMatch = fuzzyMatchLedger(ledgerName, groupings, 0.50);
        const selectedGrouping = groupingMatch ? groupingMatch.item : groupings[0];

        return {
          majorHeadCode: majorHead.code,
          minorHeadCode: minorHead.code,
          groupingCode: selectedGrouping.code,
          lineItemCode: '',
          confidence: minorHeadMatch.confidence * 0.9, // Slightly lower confidence
          reasoning: `Fuzzy matched to minor head "${minorHead.name}" with ${(minorHeadMatch.score * 100).toFixed(0)}% similarity`
        };
      }
    }
  }

  // Try keyword-based matching as fallback
  if (keywords.length > 0) {
    // Filter groupings by keywords
    const keywordMatchedGroupings = masters.groupings.filter(g => {
      const gKeywords = detectLedgerKeywords(g.name);
      return keywords.some(k => gKeywords.includes(k));
    });

    if (keywordMatchedGroupings.length > 0) {
      // Find the best match among keyword-filtered groupings
      const groupingMatch = fuzzyMatchLedger(ledgerName, keywordMatchedGroupings, 0.40);
      
      if (groupingMatch) {
        const grouping = groupingMatch.item;
        const minorHead = masters.minorHeads.find(mh => mh.code === grouping.minorHeadCode);
        const majorHead = minorHead ? masters.majorHeads.find(mh => mh.code === minorHead.majorHeadCode) : null;

        if (minorHead && majorHead) {
          return {
            majorHeadCode: majorHead.code,
            minorHeadCode: minorHead.code,
            groupingCode: grouping.code,
            lineItemCode: '',
            confidence: groupingMatch.confidence * 0.8, // Lower confidence for keyword matching
            reasoning: `Keyword-based match to "${grouping.name}" (detected: ${keywords.join(', ')})`
          };
        }
      }
    }
  }

  return null;
}

/**
 * Batch auto-map multiple ledgers using fuzzy logic
 * @param ledgers Array of ledgers to auto-map
 * @param masters The master data
 * @param minConfidence Minimum confidence threshold for auto-mapping
 * @returns Array of mappings with confidence scores
 */
export function batchAutoMapLedgers(
  ledgers: Pick<TrialBalanceItem, 'ledger' | 'closingCy'>[],
  masters: Masters,
  minConfidence: number = 0.55
): Array<{
  ledgerName: string;
  mapping: {
    majorHeadCode: string;
    minorHeadCode: string;
    groupingCode: string;
    lineItemCode: string;
  } | null;
  confidence: number;
  reasoning: string;
}> {
  return ledgers.map(ledger => {
    const result = autoMapLedger(ledger.ledger, ledger.closingCy, masters);
    
    if (result && result.confidence >= minConfidence) {
      return {
        ledgerName: ledger.ledger,
        mapping: {
          majorHeadCode: result.majorHeadCode,
          minorHeadCode: result.minorHeadCode,
          groupingCode: result.groupingCode,
          lineItemCode: result.lineItemCode
        },
        confidence: result.confidence,
        reasoning: result.reasoning
      };
    }

    return {
      ledgerName: ledger.ledger,
      mapping: null,
      confidence: result?.confidence || 0,
      reasoning: result?.reasoning || 'No suitable match found with fuzzy logic'
    };
  });
}
