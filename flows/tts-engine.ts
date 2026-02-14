/**
 * TTS Engine - Text to Speech
 * Uses Microsoft Edge TTS for free voice synthesis
 */

export interface TTSOptions {
  text: string;
  voice?: string;
  language?: string;
  outputFormat?: 'mp3' | 'wav' | 'ogg';
  rate?: number;
  volume?: number;
  pitch?: number;
}

export interface TTSResult {
  audioUrl: string;
  audioBuffer?: Buffer;
  duration: number;
  voice: string;
  format: string;
}

export interface Voice {
  id: string;
  name: string;
  language: string;
  gender: string;
  locale: string;
}

export class TTSEngine {
  private apiUrl: string;
  private apiKey: string;
  private outputDir: string;

  constructor() {
    this.apiUrl = process.env.TTS_API_URL || 'http://localhost:5003';
    this.apiKey = process.env.TTS_API_KEY || '';
    this.outputDir = process.env.TTS_OUTPUT_DIR || '/tmp/tts';
  }

  /**
   * Synthesize text to speech
   */
  async synthesize(options: TTSOptions): Promise<TTSResult> {
    const {
      text,
      voice = 'en-US-AriaNeural',
      outputFormat = 'mp3',
      rate = 0,
      volume = 0,
      pitch = 0
    } = options;

    try {
      const response = await fetch(`${this.apiUrl}/v1/audio/speech`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          input: text,
          voice,
          response_format: outputFormat,
          rate,
          volume,
          pitch
        })
      });

      if (!response.ok) {
        throw new Error(`TTS API error: ${response.status}`);
      }

      const audioBuffer = Buffer.from(await response.arrayBuffer());
      const filename = `tts-${Date.now()}.${outputFormat}`;
      
      return {
        audioUrl: `/audio/${filename}`,
        audioBuffer,
        duration: this.estimateDuration(text),
        voice,
        format: outputFormat
      };
    } catch (error) {
      console.error('[TTS] Synthesis failed:', error);
      throw error;
    }
  }

  /**
   * List available voices
   */
  async listVoices(): Promise<Voice[]> {
    try {
      const response = await fetch(`${this.apiUrl}/v1/audio/voices`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        return this.getDefaultVoices();
      }

      const data = await response.json();
      return data.voices || this.getDefaultVoices();
    } catch {
      return this.getDefaultVoices();
    }
  }

  /**
   * Get default voices list
   */
  private getDefaultVoices(): Voice[] {
    return [
      { id: 'en-US-AriaNeural', name: 'Aria', language: 'en-US', gender: 'Female', locale: 'en-US' },
      { id: 'en-US-GuyNeural', name: 'Guy', language: 'en-US', gender: 'Male', locale: 'en-US' },
      { id: 'en-GB-SoniaNeural', name: 'Sonia', language: 'en-GB', gender: 'Female', locale: 'en-GB' },
      { id: 'de-DE-KatjaNeural', name: 'Katja', language: 'de-DE', gender: 'Female', locale: 'de-DE' },
      { id: 'es-ES-ElviraNeural', name: 'Elvira', language: 'es-ES', gender: 'Female', locale: 'es-ES' },
      { id: 'fr-FR-DeniseNeural', name: 'Denise', language: 'fr-FR', gender: 'Female', locale: 'fr-FR' },
      { id: 'it-IT-ElsaNeural', name: 'Elsa', language: 'it-IT', gender: 'Female', locale: 'it-IT' },
      { id: 'ja-JP-NanamiNeural', name: 'Nanami', language: 'ja-JP', gender: 'Female', locale: 'ja-JP' },
      { id: 'ko-KR-SunHiNeural', name: 'SunHi', language: 'ko-KR', gender: 'Female', locale: 'ko-KR' },
      { id: 'pt-BR-FranciscaNeural', name: 'Francisca', language: 'pt-BR', gender: 'Female', locale: 'pt-BR' },
      { id: 'zh-CN-XiaoxiaoNeural', name: 'Xiaoxiao', language: 'zh-CN', gender: 'Female', locale: 'zh-CN' }
    ];
  }

  /**
   * Estimate audio duration from text
   */
  private estimateDuration(text: string): number {
    const wordsPerMinute = 150;
    const wordCount = text.split(/\s+/).length;
    return Math.ceil((wordCount / wordsPerMinute) * 60);
  }
}

export default TTSEngine;
