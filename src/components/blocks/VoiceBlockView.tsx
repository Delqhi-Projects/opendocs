import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Square, Play, Pause, Trash2, Copy, RefreshCw, Volume2, FileText } from 'lucide-react';
import type { VoiceBlock } from '@/types/docs';

export interface VoiceBlockViewProps {
  block: VoiceBlock;
  dark: boolean;
  onUpdate: (patch: Partial<VoiceBlock>) => void;
}

// Available voices for TTS
const AVAILABLE_VOICES = [
  { id: 'en-US-AriaNeural', name: 'Aria', language: 'en-US', gender: 'Female' },
  { id: 'en-US-GuyNeural', name: 'Guy', language: 'en-US', gender: 'Male' },
  { id: 'en-GB-SoniaNeural', name: 'Sonia', language: 'en-GB', gender: 'Female' },
  { id: 'de-DE-KatjaNeural', name: 'Katja', language: 'de-DE', gender: 'Female' },
  { id: 'es-ES-ElviraNeural', name: 'Elvira', language: 'es-ES', gender: 'Female' },
  { id: 'fr-FR-DeniseNeural', name: 'Denise', language: 'fr-FR', gender: 'Female' },
];

export function VoiceBlockView({ block, dark, onUpdate }: VoiceBlockViewProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState('en-US-AriaNeural');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const { audioUrl, transcription, duration, language } = block.data;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => { track.stop(); });
      }
    };
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);

        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          onUpdate({
            data: {
              ...block.data,
              audioUrl: url,
              audioData: base64,
              duration: recordingTime,
              createdAt: new Date().toISOString(),
            }
          });
        };
        reader.readAsDataURL(audioBlob);

        stream.getTracks().forEach((track) => { track.stop(); });
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

    } catch (err) {
      setError('Failed to access microphone. Please grant permission.');
      console.error('Recording error:', err);
    }
  }, [block.data, onUpdate, recordingTime]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  // Toggle playback
  const togglePlayback = useCallback(() => {
    if (!audioUrl) return;

    if (!audioElementRef.current) {
      audioElementRef.current = new Audio(audioUrl);
      audioElementRef.current.onended = () => {
        setIsPlaying(false);
        setPlaybackProgress(0);
      };
      audioElementRef.current.ontimeupdate = () => {
        if (audioElementRef.current) {
          const progress = (audioElementRef.current.currentTime / audioElementRef.current.duration) * 100;
          setPlaybackProgress(progress);
        }
      };
    }

    if (isPlaying) {
      audioElementRef.current.pause();
    } else {
      audioElementRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [audioUrl, isPlaying]);

  // Transcribe audio
  const transcribeAudio = useCallback(async () => {
    if (!block.data.audioData) {
      setError('No audio to transcribe');
      return;
    }

    setIsTranscribing(true);
    setError(null);

    try {
      // Extract base64 data from data URL
      const base64Data = block.data.audioData.split(',')[1];

      const response = await fetch('/api/v1/voice/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audio: base64Data,
          language: language || 'en',
          model: 'base'
        })
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const result = await response.json();

      onUpdate({
        data: {
          ...block.data,
          transcription: result.text,
          transcriptionConfidence: result.confidence,
          transcriptionLanguage: result.language,
        }
      });

    } catch (err) {
      setError('Failed to transcribe audio. Please try again.');
      console.error('Transcription error:', err);
    } finally {
      setIsTranscribing(false);
    }
  }, [block.data, language, onUpdate]);

  // Convert transcription to speech
  const synthesizeSpeech = useCallback(async () => {
    if (!transcription) {
      setError('No transcription to convert');
      return;
    }

    setIsSynthesizing(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/voice/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: transcription,
          voice: selectedVoice,
          outputFormat: 'mp3'
        })
      });

      if (!response.ok) {
        throw new Error('Speech synthesis failed');
      }

      const result = await response.json();

      if (result.provider === 'browser-tts' && !result.audioUrl) {
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(result.text);
          const voices = window.speechSynthesis.getVoices();
          const matchingVoice = voices.find(v => v.name.includes(selectedVoice.split('-')[0]));
          if (matchingVoice) {
            utterance.voice = matchingVoice;
          }
          utterance.onend = () => setIsSynthesizing(false);
          utterance.onerror = () => {
            setError('Browser TTS failed');
            setIsSynthesizing(false);
          };
          window.speechSynthesis.speak(utterance);
          onUpdate({
            data: {
              ...block.data,
              synthesizedAudioUrl: 'browser-tts',
              synthesizedDuration: result.duration,
              synthesizedVoice: result.voice,
            }
          });
          return;
        }
        throw new Error('No TTS available');
      }

      onUpdate({
        data: {
          ...block.data,
          synthesizedAudioUrl: result.audioUrl,
          synthesizedDuration: result.duration,
          synthesizedVoice: result.voice,
        }
      });

    } catch (err) {
      setError('Failed to synthesize speech. Please try again.');
      console.error('Synthesis error:', err);
    } finally {
      setIsSynthesizing(false);
    }
  }, [transcription, selectedVoice, onUpdate, block.data]);

  // Copy transcription to clipboard
  const copyTranscription = useCallback(() => {
    if (transcription) {
      navigator.clipboard.writeText(transcription);
    }
  }, [transcription]);

  // Delete recording
  const deleteRecording = useCallback(() => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }
    setIsPlaying(false);
    setPlaybackProgress(0);
    onUpdate({
      data: {
        ...block.data,
        audioUrl: undefined,
        audioData: undefined,
        duration: 0,
        transcription: undefined,
        transcriptionConfidence: undefined,
        transcriptionLanguage: undefined,
        synthesizedAudioUrl: undefined,
        synthesizedDuration: undefined,
        synthesizedVoice: undefined,
      }
    });
  }, [onUpdate, block.data]);

  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`rounded-lg border ${dark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-white'}`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-2 border-b ${dark ? 'border-zinc-700' : 'border-zinc-200'}`}>
        <div className="flex items-center gap-2">
          <Mic className={`h-4 w-4 ${dark ? 'text-indigo-400' : 'text-indigo-600'}`} />
          <span className={`text-sm font-medium ${dark ? 'text-zinc-300' : 'text-zinc-700'}`}>
            Voice Note
          </span>
          {duration && duration > 0 && (
            <span className={`text-xs ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
              {formatTime(duration)}
            </span>
          )}
        </div>
        {audioUrl && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={deleteRecording}
              className={`p-1.5 rounded-md transition-colors ${dark ? 'hover:bg-zinc-800 text-zinc-400 hover:text-red-400' : 'hover:bg-zinc-100 text-zinc-500 hover:text-red-500'}`}
              title="Delete recording"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div className="p-4">
        {!audioUrl ? (
          <div className="flex flex-col items-center gap-4">
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                  : dark
                    ? 'bg-indigo-600 hover:bg-indigo-700'
                    : 'bg-indigo-500 hover:bg-indigo-600'
              }`}
            >
              {isRecording ? (
                <Square className="h-6 w-6 text-white" />
              ) : (
                <Mic className="h-6 w-6 text-white" />
              )}
            </button>
            <span className={`text-sm ${dark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {isRecording ? `Recording... ${formatTime(recordingTime)}` : 'Click to start recording'}
            </span>
          </div>
        ) : (
          // Playback UI
          <div className="space-y-4">
            {/* Audio Player */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={togglePlayback}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  dark ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-500 hover:bg-indigo-600'
                }`}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5 text-white" />
                ) : (
                  <Play className="h-5 w-5 text-white ml-0.5" />
                )}
              </button>
              <div className="flex-1">
                <div className={`h-2 rounded-full overflow-hidden ${dark ? 'bg-zinc-700' : 'bg-zinc-200'}`}>
                  <div
                    className="h-full bg-indigo-500 transition-all duration-100"
                    style={{ width: `${playbackProgress}%` }}
                  />
                </div>
              </div>
              <span className={`text-xs ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                {formatTime(duration ?? 0)}
              </span>
            </div>

            <div className={`rounded-lg p-3 ${dark ? 'bg-zinc-800' : 'bg-zinc-50'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FileText className={`h-4 w-4 ${dark ? 'text-zinc-400' : 'text-zinc-500'}`} />
                  <span className={`text-xs font-medium ${dark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    Transcription
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {!transcription && (
                    <button
                      type="button"
                      onClick={transcribeAudio}
                      disabled={isTranscribing}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                        dark
                          ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300 disabled:opacity-50'
                          : 'bg-zinc-200 hover:bg-zinc-300 text-zinc-600 disabled:opacity-50'
                      }`}
                    >
                      {isTranscribing ? (
                        <>
                          <RefreshCw className="h-3 w-3 animate-spin" />
                          Transcribing...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-3 w-3" />
                          Transcribe
                        </>
                      )}
                    </button>
                  )}
                  {transcription && (
                    <button
                      type="button"
                      onClick={copyTranscription}
                      className={`p-1 rounded transition-colors ${
                        dark ? 'hover:bg-zinc-700 text-zinc-400' : 'hover:bg-zinc-200 text-zinc-500'
                      }`}
                      title="Copy transcription"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {transcription ? (
                <p className={`text-sm ${dark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                  {transcription}
                </p>
              ) : (
                <p className={`text-sm italic ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  {isTranscribing ? 'Processing audio...' : 'No transcription yet. Click "Transcribe" to generate.'}
                </p>
              )}
            </div>

            {/* TTS Section */}
            {transcription && (
              <div className={`rounded-lg p-3 ${dark ? 'bg-zinc-800' : 'bg-zinc-50'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Volume2 className={`h-4 w-4 ${dark ? 'text-zinc-400' : 'text-zinc-500'}`} />
                    <span className={`text-xs font-medium ${dark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      Text to Speech
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    className={`flex-1 px-2 py-1.5 rounded text-sm ${
                      dark
                        ? 'bg-zinc-700 border-zinc-600 text-zinc-300'
                        : 'bg-white border-zinc-300 text-zinc-700'
                    } border`}
                  >
                    {AVAILABLE_VOICES.map((voice) => (
                      <option key={voice.id} value={voice.id}>
                        {voice.name} ({voice.language})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={synthesizeSpeech}
                    disabled={isSynthesizing}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm transition-colors ${
                      dark
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50'
                        : 'bg-indigo-500 hover:bg-indigo-600 text-white disabled:opacity-50'
                    }`}
                  >
                    {isSynthesizing ? (
                      <>
                        <RefreshCw className="h-3 w-3 animate-spin" />
                        Converting...
                      </>
                    ) : (
                      <>
                        <Volume2 className="h-3 w-3" />
                        Convert
                      </>
                    )}
                  </button>
                </div>

                {block.data.synthesizedAudioUrl && block.data.synthesizedAudioUrl !== 'browser-tts' && (
                  <div className="mt-2">
                    <audio
                      controls
                      src={block.data.synthesizedAudioUrl}
                      className="w-full h-8"
                    >
                      <track kind="captions" label="Audio transcription" />
                    </audio>
                  </div>
                )}
                {block.data.synthesizedAudioUrl === 'browser-tts' && (
                  <div className="mt-2">
                    <p className={`text-xs ${dark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      ✅ Playing via browser TTS
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-3 p-2 rounded bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default VoiceBlockView;
