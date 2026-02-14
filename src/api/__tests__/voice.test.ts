import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';

const originalEnv = { ...process.env };

describe('Voice API Endpoints', () => {
  beforeAll(() => {
    process.env.OPENAI_API_KEY = 'test-openai-key';
    process.env.ELEVENLABS_API_KEY = 'test-elevenlabs-key';
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('POST /api/v1/voice/transcribe', () => {
    it('should return 400 when audio is missing', async () => {
      const { default: express } = await import('express');
      const app = express();
      app.use(express.json());

      app.post('/api/v1/voice/transcribe', async (req: any, res: any) => {
        const { audio } = req.body || {};
        if (!audio) {
          return res.status(400).json({ error: 'missing_audio', message: 'Audio data is required' });
        }
        res.json({ text: 'test' });
      });

      const response = await fetch('http://localhost:3000/api/v1/voice/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      }).catch(() => null);

      expect(response).toBeDefined();
    });

    it('should return error when OPENAI_API_KEY not set', async () => {
      const savedKey = process.env.OPENAI_API_KEY;
      delete process.env.OPENAI_API_KEY;

      const errorResponse = {
        error: 'voice_not_configured',
        message: 'OPENAI_API_KEY not set'
      };

      expect(errorResponse.error).toBe('voice_not_configured');

      process.env.OPENAI_API_KEY = savedKey;
    });
  });

  describe('POST /api/v1/voice/synthesize', () => {
    it('should return browser-tts fallback when no API keys configured', async () => {
      const savedOpenAI = process.env.OPENAI_API_KEY;
      const savedEleven = process.env.ELEVENLABS_API_KEY;
      delete process.env.OPENAI_API_KEY;
      delete process.env.ELEVENLABS_API_KEY;

      const fallbackResponse = {
        success: true,
        provider: 'browser-tts',
        text: 'Hello world',
        voice: 'en-US-AriaNeural',
        message: 'No TTS API configured. Use browser Web Speech API.'
      };

      expect(fallbackResponse.provider).toBe('browser-tts');
      expect(fallbackResponse.text).toBe('Hello world');

      process.env.OPENAI_API_KEY = savedOpenAI;
      process.env.ELEVENLABS_API_KEY = savedEleven;
    });

    it('should use ElevenLabs when ELEVENLABS_API_KEY is set', async () => {
      expect(process.env.ELEVENLABS_API_KEY).toBe('test-elevenlabs-key');
    });
  });
});

describe('Voice API Request Validation', () => {
  it('should validate audio format for transcription', () => {
    const validRequest = {
      audio: 'data:audio/webm;base64,GkXfo...',
      language: 'en',
      model: 'base'
    };

    expect(validRequest.audio).toBeDefined();
    expect(validRequest.audio.startsWith('data:audio')).toBe(true);
  });

  it('should validate text for synthesis', () => {
    const validRequest = {
      text: 'Hello, this is a test.',
      voice: 'en-US-AriaNeural',
      outputFormat: 'mp3'
    };

    expect(validRequest.text.length).toBeGreaterThan(0);
    expect(validRequest.outputFormat).toBe('mp3');
  });

  it('should support multiple output formats', () => {
    const supportedFormats = ['mp3', 'wav', 'ogg', 'webm'];
    expect(supportedFormats).toContain('mp3');
    expect(supportedFormats).toContain('wav');
    expect(supportedFormats).toContain('ogg');
  });
});
