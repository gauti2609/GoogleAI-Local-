import { Injectable } from '@nestjs/common';
import { GoogleGenAI, Type } from '@google/genai';
import { Masters, MappingSuggestion } from '../types';

@Injectable()
export class AiService {
  private readonly ai: GoogleGenAI;

  constructor() {
    if (!process.env.API_KEY) {
      throw new Error("API_KEY environment variable not set.");
    }
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async getMappingSuggestion(
    ledgerName: string,
    closingBalance: number,
    masters: Masters,
  ): Promise<MappingSuggestion | null> {
    const mappingSuggestionSchema = {
        type: Type.OBJECT,
        properties: {
          majorHeadCode: { 
            type: Type.STRING,
            description: 'The suggested code for the Major Head.',
          },
          minorHeadCode: { 
            type: Type.STRING,
            description: 'The suggested code for the Minor Head.',
          },
          groupingCode: { 
            type: Type.STRING,
            description: 'The suggested code for the Grouping.',
          },
          lineItemCode: {
            type: Type.STRING,
            description: 'The suggested code for the Line Item (optional, can be empty string if no specific line item applies).',
          },
          confidence: { 
            type: Type.NUMBER,
            description: 'A confidence score from 0.0 to 1.0 for the entire mapping suggestion.',
           },
          reasoning: { 
            type: Type.STRING,
            description: 'A brief explanation for why this mapping was suggested.',
          },
        },
        required: ['majorHeadCode', 'minorHeadCode', 'groupingCode', 'lineItemCode', 'confidence', 'reasoning'],
      };

    const masterDataString = `
      Major Heads: ${JSON.stringify(masters.majorHeads)}
      Minor Heads: ${JSON.stringify(masters.minorHeads)}
      Groupings: ${JSON.stringify(masters.groupings)}
      Line Items: ${JSON.stringify(masters.lineItems)}
    `;

    // Determine balance nature (Dr/Cr)
    const balanceNature = closingBalance >= 0 ? 'Debit' : 'Credit';
    const balanceAmount = Math.abs(closingBalance);

    const prompt = `
      You are an expert accountant specializing in Indian Accounting Standards (AS) and Schedule III financial statements.
      Your task is to map a trial balance ledger item to the correct financial statement grouping.
      
      Ledger Item to Map: "${ledgerName}"
      Closing Balance: ${balanceAmount.toFixed(2)} (${balanceNature} balance)
      
      IMPORTANT BALANCE VALIDATION:
      - Debit balances (positive numbers) typically represent: Assets, Expenses, Drawings, Losses
      - Credit balances (negative numbers) typically represent: Liabilities, Equity, Income/Revenue, Gains
      - If a ledger name suggests it's revenue/income but has a Debit balance, it's likely an expense or should be re-classified
      - If a ledger name suggests it's an expense but has a Credit balance, it's likely income or should be re-classified
      - Commission Expenses should have Debit balance and be mapped under "Other expenses" grouping
      - Commission Income/Revenue should have Credit balance and be mapped under "Revenue from operations" or "Other income"
      
      Use the following master data for the Chart of Accounts. The mapping MUST use the codes provided in this data.
      ${masterDataString}
      
      Analyze the ledger name AND closing balance nature to suggest the most appropriate mapping for Major Head, Minor Head, Grouping, and optionally a Line Item.
      
      For Line Items:
      - Use line items to group similar ledgers within a schedule (e.g., multiple rent ledgers under "Rent" line item in "Other expenses")
      - If multiple similar ledgers exist (like Rent-Property1, Rent-Property2), they should map to the same line item
      - If no specific line item applies, return an empty string for lineItemCode
      
      Provide a confidence score and a brief reasoning for your choice that explains why the balance nature supports this classification.
      The final output must be a single JSON object that conforms to the provided schema.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: mappingSuggestionSchema,
        },
      });

      const jsonString = response.text;
      if (jsonString) {
        const suggestion = JSON.parse(jsonString);
        if (suggestion.majorHeadCode && suggestion.minorHeadCode && suggestion.groupingCode) {
          return {
            ...suggestion,
            lineItemCode: suggestion.lineItemCode || '',
          } as MappingSuggestion;
        }
      }
      return null;
    } catch (error) {
      console.error('Error fetching mapping suggestion from Gemini API:', error);
      return null;
    }
  }
}
