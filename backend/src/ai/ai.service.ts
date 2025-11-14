import { Injectable } from '@nestjs/common';
import { GoogleGenAI, Type } from '@google/genai';
import { Masters, MappingSuggestion } from '../../../../types';

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
          confidence: { 
            type: Type.NUMBER,
            description: 'A confidence score from 0.0 to 1.0 for the entire mapping suggestion.',
           },
          reasoning: { 
            type: Type.STRING,
            description: 'A brief explanation for why this mapping was suggested.',
          },
        },
        required: ['majorHeadCode', 'minorHeadCode', 'groupingCode', 'confidence', 'reasoning'],
      };

    const masterDataString = `
      Major Heads: ${JSON.stringify(masters.majorHeads)}
      Minor Heads: ${JSON.stringify(masters.minorHeads)}
      Groupings: ${JSON.stringify(masters.groupings)}
    `;

    const prompt = `
      You are an expert accountant specializing in Indian Accounting Standards (AS) and Schedule III financial statements.
      Your task is to map a trial balance ledger item to the correct financial statement grouping.
      Ledger Item to Map: "${ledgerName}"
      Use the following master data for the Chart of Accounts. The mapping MUST use the codes provided in this data.
      ${masterDataString}
      Analyze the ledger name and suggest the most appropriate mapping for Major Head, Minor Head, and Grouping.
      Provide a confidence score and a brief reasoning for your choice.
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
          return suggestion as MappingSuggestion;
        }
      }
      return null;
    } catch (error) {
      console.error('Error fetching mapping suggestion from Gemini API:', error);
      return null;
    }
  }
}
