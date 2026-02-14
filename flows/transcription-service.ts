/**
 * Transcription Service - Audio to Text
 * Supports Whisper models for speech recognition
 */

export interface TranscriptionOptions {
  language?: string;
  model?: 'base' | 'small' | 'medium' | 'large';
  temperature?: number;
}

export interface TranscriptionResult {
  text: string;
  confidence: number;
  duration: number;
  language: string;
  words?: Array<{
    word: string;
    start: number;
    end: number;
    confidence: number;
  }>;
}

export class TranscriptionService {
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    this.apiUrl = process.env.TRANSCRIPTION_API_URL || 'http://localhost:5000';
    this.apiKey = process.env.TRANSCRIPTION_API_KEY || '';
  }

  /**
   * Transcribe audio buffer to text
   */
  async transcribe(audioBuffer: Buffer, options: TranscriptionOptions = {}): Promise<TranscriptionResult> {
    const { language = 'en', model = 'base', temperature = 0 } = options;

    try {
      const formData = new FormData();
      const uint8Array = new Uint8Array(audioBuffer);
      const blob = new Blob([uint8Array], { type: 'audio/webm' });
      formData.append('file', blob, 'audio.webm');
      formData.append('model', model);
      formData.append('language', language);
      formData.append('temperature', String(temperature));

      const response = await fetch(`${this.apiUrl}/v1/audio/transcriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Transcription API error: ${response.status}`);
      }

      const data = await response.json();

      return {
        text: data.text || '',
        confidence: data.confidence || 0.9,
        duration: data.duration || 0,
        language: data.language || language,
        words: data.words
      };
    } catch (error) {
      console.error('[Transcription] Failed:', error);
      throw error;
    }
  }

  /**
   * Transcribe from URL
   */
  async transcribeFromUrl(audioUrl: string, options: TranscriptionOptions = {}): Promise<TranscriptionResult> {
    const { language = 'en', model = 'base' } = options;

    try {
      const response = await fetch(`${this.apiUrl}/v1/audio/transcriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          url: audioUrl,
          model,
          language
        })
      });

      if (!response.ok) {
        throw new Error(`Transcription API error: ${response.status}`);
      }

      const data = await response.json();

      return {
        text: data.text || '',
        confidence: data.confidence || 0.9,
        duration: data.duration || 0,
        language: data.language || language
      };
    } catch (error) {
      console.error('[Transcription] Failed:', error);
      throw error;
    }
  }
}

export default TranscriptionService;
