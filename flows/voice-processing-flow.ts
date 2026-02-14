/**
 * Voice Processing Flow - REST API
 * Handles upload → transcription → TTS
 */

import * as express from 'express';
import * as multer from 'multer';
import { TranscriptionService } from './transcription-service';
import { TTSEngine } from './tts-engine';

const upload = multer({ 
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  storage: multer.memoryStorage()
});

const app = express();
app.use(express.json());

const transcriptionService = new TranscriptionService();
const ttsEngine = new TTSEngine();

/**
 * POST /api/v1/voice/transcribe
 * Upload audio and get transcription
 */
app.post('/api/v1/voice/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const { language, model } = req.body;
    
    const result = await transcriptionService.transcribe(req.file.buffer, {
      language,
      model: model || 'base'
    });

    res.json({
      text: result.text,
      confidence: result.confidence,
      duration: result.duration,
      language: result.language
    });
  } catch (error) {
    console.error('Transcription failed:', error);
    res.status(500).json({ error: 'Transcription failed' });
  }
});

/**
 * POST /api/v1/voice/synthesize
 * Convert text to speech
 */
app.post('/api/v1/voice/synthesize', async (req, res) => {
  try {
    const { text, voice, language, outputFormat } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'No text provided' });
    }

    const result = await ttsEngine.synthesize({
      text,
      voice: voice || 'en-US-AriaNeural',
      language,
      outputFormat: outputFormat || 'mp3'
    });

    res.json({
      audioUrl: result.audioUrl,
      duration: result.duration,
      voice: result.voice
    });
  } catch (error) {
    console.error('Synthesis failed:', error);
    res.status(500).json({ error: 'Synthesis failed' });
  }
});

/**
 * POST /api/v1/voice/process
 * Full pipeline: upload → transcribe → process → synthesize
 */
app.post('/api/v1/voice/process', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const { processText, voice, language } = req.body;

    // Step 1: Transcribe
    const transcription = await transcriptionService.transcribe(req.file.buffer, {
      language,
      model: 'base'
    });

    // Step 2: Process text (optional)
    const processedText = processText ? await processTranscript(transcription.text) : transcription.text;

    // Step 3: Synthesize (optional)
    let audioResult;
    if (voice) {
      audioResult = await ttsEngine.synthesize({
        text: processedText,
        voice,
        language
      });
    }

    res.json({
      originalText: transcription.text,
      processedText,
      transcribedAudio: audioResult ? audioResult.audioUrl : null,
      duration: transcription.duration,
      language: transcription.language
    });
  } catch (error) {
    console.error('Voice processing failed:', error);
    res.status(500).json({ error: 'Voice processing failed' });
  }
});

/**
 * GET /api/v1/voice/voices
 * List available TTS voices
 */
app.get('/api/v1/voice/voices', async (req, res) => {
  try {
    const voices = await ttsEngine.listVoices();
    res.json({ voices });
  } catch (error) {
    res.status(500).json({ error: 'Failed to list voices' });
  }
});

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'voice-processing-flow' });
});

/**
 * Optional text processing function
 */
async function processTranscript(text: string): Promise<string> {
  // Add your NLP processing here
  // e.g., remove filler words, fix grammar, etc.
  return text.trim();
}

const PORT = process.env.VOICE_API_PORT || 8080;

app.listen(PORT, () => {
  console.log(`Voice Processing Flow running on port ${PORT}`);
});

export default app;
