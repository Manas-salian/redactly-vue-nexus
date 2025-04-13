import { ProcessedDocument } from './documentService';

export interface RedactionResult {
  redactions: Array<{
    id: string;
    text: string;
    type: string;
    confidence: number;
    start: number;
    end: number;
    needsReview: boolean;
  }>;
  redactedText: string;
}

export class AIService {
  private static instance: AIService;
  private ollamaEndpoint: string;

  private constructor() {
    this.ollamaEndpoint = 'http://localhost:11434/api/generate';
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  public async detectSensitiveData(
    document: ProcessedDocument,
    options: {
      sensitivityLevel: number;
      showPII: boolean;
      showFinancial: boolean;
      showDates: boolean;
    }
  ): Promise<RedactionResult> {
    const { text, entities } = document;
    const redactions: RedactionResult['redactions'] = [];

    // First pass: Use spaCy entities
    for (const entity of entities) {
      if (this.shouldRedactEntity(entity, options)) {
        redactions.push({
          id: `entity-${entity.start}-${entity.end}`,
          text: entity.text,
          type: entity.type,
          confidence: entity.confidence,
          start: entity.start,
          end: entity.end,
          needsReview: entity.confidence < 0.8
        });
      }
    }

    // Second pass: Use Ollama for context-aware detection
    const ollamaRedactions = await this.detectWithOllama(text, options);
    redactions.push(...ollamaRedactions);

    // Sort redactions by start position
    redactions.sort((a, b) => a.start - b.start);

    // Generate redacted text
    const redactedText = this.applyRedactions(text, redactions);

    return {
      redactions,
      redactedText
    };
  }

  private shouldRedactEntity(
    entity: ProcessedDocument['entities'][0],
    options: {
      sensitivityLevel: number;
      showPII: boolean;
      showFinancial: boolean;
      showDates: boolean;
    }
  ): boolean {
    const { type } = entity;
    const { sensitivityLevel, showPII, showFinancial, showDates } = options;

    // Adjust confidence based on sensitivity level
    const adjustedConfidence = entity.confidence * (sensitivityLevel / 100);

    if (adjustedConfidence < 0.5) {
      return false;
    }

    if (type === 'PERSON' && showPII) return true;
    if (type === 'MONEY' && showFinancial) return true;
    if (type === 'DATE' && showDates) return true;

    return false;
  }

  private async detectWithOllama(
    text: string,
    options: {
      sensitivityLevel: number;
      showPII: boolean;
      showFinancial: boolean;
      showDates: boolean;
    }
  ): Promise<RedactionResult['redactions']> {
    try {
      const response = await fetch(this.ollamaEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama2',
          prompt: `Analyze the following text for sensitive information. Return a JSON array of objects with the following structure:
          {
            "text": "the sensitive text",
            "type": "PII|FINANCIAL|DATE",
            "confidence": 0.0-1.0,
            "start": character_position,
            "end": character_position
          }
          
          Text to analyze: ${text}
          
          Options:
          - Sensitivity level: ${options.sensitivityLevel}
          - Show PII: ${options.showPII}
          - Show financial: ${options.showFinancial}
          - Show dates: ${options.showDates}`,
        }),
      });

      const result = await response.json();
      return JSON.parse(result.response);
    } catch (error) {
      console.error('Error using Ollama:', error);
      return [];
    }
  }

  private applyRedactions(text: string, redactions: RedactionResult['redactions']): string {
    let result = text;
    let offset = 0;

    for (const redaction of redactions) {
      const start = redaction.start + offset;
      const end = redaction.end + offset;
      const redactedText = '█'.repeat(redaction.end - redaction.start);
      
      result = result.slice(0, start) + redactedText + result.slice(end);
      offset += redactedText.length - (end - start);
    }

    return result;
  }
} 