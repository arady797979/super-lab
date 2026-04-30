/**
 * AI Service for VOX Premium
 * Handles abstraction between Real Gemini AI and Local Demo Mock
 */

import { GoogleGenAI, Modality } from "@google/genai";

export interface TranslationResult {
  text: string;
  usageMetadata?: any;
}

export interface TTSResult {
  audioBase64: string;
  usageMetadata?: any;
}

class GeminiEngine {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async translate(text: string, targetLang: string): Promise<TranslationResult> {
    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Identify the source language and translate the following text exactly into ${targetLang}. 
      If the source is already ${targetLang}, clean up any grammar or punctuation and return the refined text.
      Only return the translation or refined text, no extra commentary:\n\n${text}`,
    });
    return {
      text: response.text || "",
      usageMetadata: (response as any).usageMetadata
    };
  }

  async extractContent(base64Data: string, mimeType: string, prompt: string): Promise<TranslationResult> {
    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { text: prompt },
          { inlineData: { data: base64Data, mimeType } }
        ]
      }
    });
    return {
      text: response.text || "",
      usageMetadata: (response as any).usageMetadata
    };
  }

  async tts(text: string, voiceName: string = 'Kore'): Promise<TTSResult> {
    const response = await this.ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("TTS failed to generate audio");

    return {
      audioBase64: base64Audio,
      usageMetadata: (response as any).usageMetadata
    };
  }
}

class MockEngine {
  async translate(text: string, targetLang: string): Promise<TranslationResult> {
    // A simple mock that simulates translation for demo purposes
    // In a real static site, this allows the UI to stay functional
    await new Promise(r => setTimeout(r, 1200));
    
    const prefix = `[${targetLang.toUpperCase()} DEMO] `;
    const mockedText = text.split('\n').map(line => prefix + line).join('\n');
    
    return {
      text: mockedText,
      usageMetadata: {
        promptTokenCount: text.length,
        candidatesTokenCount: mockedText.length,
        totalTokenCount: text.length + mockedText.length
      }
    };
  }

  async extractContent(_base64Data: string, _mimeType: string, _prompt: string): Promise<TranslationResult> {
    await new Promise(r => setTimeout(r, 1500));
    return {
      text: "This is a simulated extraction result for your file. In production, VOX Premium uses Gemini Flash to transcribe audio and ingest documents with high precision.",
      usageMetadata: {
        promptTokenCount: 100,
        candidatesTokenCount: 200,
        totalTokenCount: 300
      }
    };
  }

  async tts(_text: string): Promise<TTSResult> {
    // Mocking TTS isn't easily done with just base64 without an engine
    // We'll return an empty result and the App will handle native fallback
    throw new Error("MOCK_ENGINE_TTS_FALLBACK");
  }
}

class UnifiedEngine {
  private gemini: GeminiEngine | null = null;
  private mock: MockEngine = new MockEngine();
  private forceMock: boolean = false;

  constructor(apiKey?: string) {
    if (apiKey && apiKey !== 'YOUR_API_KEY' && apiKey.length >= 10) {
      this.gemini = new GeminiEngine(apiKey);
    }
  }

  setForceMock(value: boolean) {
    this.forceMock = value;
  }

  private get engine() {
    return (this.forceMock || !this.gemini) ? this.mock : this.gemini;
  }

  async translate(text: string, targetLang: string): Promise<TranslationResult> {
    return this.engine.translate(text, targetLang);
  }

  async extractContent(base64Data: string, mimeType: string, prompt: string): Promise<TranslationResult> {
    return this.engine.extractContent(base64Data, mimeType, prompt);
  }

  async tts(text: string, voiceName?: string): Promise<TTSResult> {
    return this.engine.tts(text, voiceName);
  }
}

export const getAiEngine = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  return new UnifiedEngine(apiKey);
};

export const isRealAiActive = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  return !!(apiKey && apiKey !== 'YOUR_API_KEY' && apiKey.length >= 10);
};
