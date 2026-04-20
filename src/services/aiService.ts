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
      contents: `Translate the following text exactly into ${targetLang}. Only return the translation, no extra commentary:\n\n${text}`,
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

  async tts(_text: string): Promise<TTSResult> {
    // Mocking TTS isn't easily done with just base64 without an engine
    // We'll return an empty result and the App will handle native fallback
    throw new Error("MOCK_ENGINE_TTS_FALLBACK");
  }
}

export const getAiEngine = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'YOUR_API_KEY' || apiKey.length < 10) {
    console.warn("VOX: No valid Gemini API key found. Entering Demo Sandbox Mode.");
    return new MockEngine();
  }
  return new GeminiEngine(apiKey);
};

export const isRealAiActive = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  return !!(apiKey && apiKey !== 'YOUR_API_KEY' && apiKey.length >= 10);
};
