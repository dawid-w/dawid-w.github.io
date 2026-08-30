import React, { useEffect, useRef, useState } from 'react';
import { useT } from '../i18n';
import { getLanguage } from '../i18n/languageStore';
import { useAppStore } from '../services/store';
import { sendMessage, executeToolCall } from '../services/ai';
import { supabase } from '../services/supabaseClient';
import { XIcon } from './Icons';

type VoiceState = 'LISTENING' | 'THINKING' | 'SPEAKING';

interface VoiceOverlayProps {
  onClose: () => void;
}

// Voice mode overlay: reuses the exact same ai-chat flow as the text chat (see
// services/ai.ts) with voiceMode=true (shorter, speakable replies), executes tool calls
// immediately just like mobile's real voice mode — no fake "confirm" buttons (see the
// plan's reconciliation table). Speech-to-text and text-to-speech are the two pieces that
// are inherently platform-specific: mic capture uses the browser's Web Speech API (there
// is no expo-speech-recognition on the web), and the spoken reply plays real OpenAI audio
// from the same ai-tts Edge Function mobile uses, falling back to the browser's built-in
// speechSynthesis if that call fails — mirroring mobile's OpenAI-primary/on-device-fallback
// pattern in ChatScreen.tsx.
export const VoiceOverlay: React.FC<VoiceOverlayProps> = ({ onClose }) => {
  const t = useT();
  const addMessage = useAppStore((s) => s.addMessage);

  const [state, setState] = useState<VoiceState>('LISTENING');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [speechSupported, setSpeechSupported] = useState(true);
  const [replyText, setReplyText] = useState('');

  const activeRef = useRef(true);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopEverything = () => {
    activeRef.current = false;
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    audioRef.current?.pause();
    audioRef.current = null;
    window.speechSynthesis?.cancel();
  };

  const handleClose = () => {
    stopEverything();
    onClose();
  };

  const speak = async (text: string) => {
    setReplyText(text);
    setState('SPEAKING');
    try {
      const { data, error } = await supabase.functions.invoke('ai-tts', { body: { text } });
      if (error || !data?.audioBase64) throw error || new Error('no audio');
      const audio = new Audio(`data:audio/mp3;base64,${data.audioBase64}`);
      audioRef.current = audio;
      await new Promise<void>((resolve) => {
        audio.onended = () => resolve();
        audio.onerror = () => resolve();
        audio.play().catch(() => resolve());
      });
    } catch {
      if (window.speechSynthesis) {
        await new Promise<void>((resolve) => {
          const utter = new SpeechSynthesisUtterance(text);
          utter.lang = document.documentElement.lang || 'en-US';
          utter.onend = () => resolve();
          utter.onerror = () => resolve();
          window.speechSynthesis.speak(utter);
        });
      }
    }
    if (activeRef.current) {
      setState('LISTENING');
      startListening();
    }
  };

  const handleUtterance = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) {
      startListening();
      return;
    }
    setState('THINKING');
    addMessage({ id: `msg-${Date.now()}-u`, role: 'user', content: trimmed });
    const response = await sendMessage(trimmed, true);
    if (!activeRef.current) return;
    if (response.limitReached || response.quotaExceeded) {
      await speak(t('common.error'));
      return;
    }
    if (response.toolCalls) {
      for (const tc of response.toolCalls) executeToolCall(tc);
    }
    addMessage({
      id: `msg-${Date.now()}-a`,
      role: 'assistant',
      content: response.textContent,
      toolCalls: response.toolCalls,
    });
    if (!activeRef.current) return;
    await speak(response.textContent || t('common.error'));
  };

  const startListening = () => {
    if (!activeRef.current) return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }
    setState('LISTENING');
    setLiveTranscript('');
    const recognition = new SpeechRecognition();
    recognition.lang = getLanguage() === 'pl' ? 'pl-PL' : getLanguage() === 'de' ? 'de-DE' : 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onresult = (event: any) => {
      let text = '';
      for (let i = 0; i < event.results.length; i++) text += event.results[i][0].transcript;
      setLiveTranscript(text);
    };
    recognition.onend = () => {
      if (!activeRef.current) return;
      const finalText = liveTranscriptRef.current;
      handleUtterance(finalText);
    };
    recognition.onerror = (e: any) => {
      if (e.error === 'no-speech' || e.error === 'aborted') return;
      console.warn('speech recognition error:', e.error);
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  // onend needs the latest transcript without re-subscribing the whole recognition object.
  const liveTranscriptRef = useRef('');
  useEffect(() => {
    liveTranscriptRef.current = liveTranscript;
  }, [liveTranscript]);

  useEffect(() => {
    activeRef.current = true;
    startListening();
    return () => {
      stopEverything();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statusLabel = state === 'LISTENING' ? t('voice.listening') : state === 'THINKING' ? t('voice.thinking') : t('voice.speaking');

  return (
    <div className="voice-overlay">
      <button className="voice-close" onClick={handleClose} aria-label={t('common.close')}>
        <XIcon size={16} color="#fff" strokeWidth={2} />
      </button>

      <div className="voice-center">
        <div className={`orb${state === 'SPEAKING' ? ' orb-pulse' : ''}`} />

        {state === 'LISTENING' && (
          <div className="voice-bars">
            {[0, 0.1, 0.2, 0.3, 0.4].map((d) => (
              <span key={d} className="bar bar-voice" style={{ height: 22, animationDelay: `${d}s` }} />
            ))}
          </div>
        )}

        <div className="voice-status">{statusLabel}</div>

        {state === 'LISTENING' && liveTranscript && <div className="voice-transcript">{liveTranscript}</div>}
        {state === 'SPEAKING' && replyText && <div className="voice-transcript">{replyText}</div>}

        {!speechSupported && <div className="voice-unsupported">{t('common.error')}</div>}
      </div>

      <div className="voice-controls">
        <button className="voice-mute-btn" onClick={handleClose}>
          {t('voice.end')}
        </button>
        <span className="voice-hint">{t('voice.hint')}</span>
      </div>
    </div>
  );
};
