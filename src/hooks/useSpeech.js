import { useState, useCallback, useRef, useEffect } from 'react';

const TTS_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/tts`
  : '/api/tts';

/* ─── In-memory blob cache (survives component remounts) ─── */
const blobCache = new Map();

async function fetchAudio(text, signal) {
  const key = text.trim();
  if (!key) return null;
  if (blobCache.has(key)) return blobCache.get(key);

  const res = await fetch(TTS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: key }),
    signal,
  });
  if (!res.ok) throw new Error(`TTS ${res.status}`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  blobCache.set(key, url);
  return url;
}

/** Split text into sentence-like chunks for streaming playback */
function splitChunks(text) {
  const parts = text.match(/[^.!?]+[.!?]+[\s)»"]*/g);
  if (!parts || parts.length === 0) return [text.trim()];
  const chunks = parts.map(s => s.trim()).filter(Boolean);
  const consumed = parts.join('').length;
  const leftover = text.slice(consumed).trim();
  if (leftover) chunks.push(leftover);
  return chunks.length ? chunks : [text.trim()];
}

/**
 * Pre-fetch phrases into the in-memory blob cache.
 * Fire-and-forget; safe to call on every component mount.
 */
export function preloadPhrases(phrases) {
  for (const p of phrases) {
    if (!p?.trim() || blobCache.has(p.trim())) continue;
    fetchAudio(p).catch(() => {});
  }
}

/* ─── Unlock audio playback on first user gesture ─── */
let audioUnlocked = false;
const unlockCallbacks = [];

export function isAudioUnlocked() { return audioUnlocked; }

function onUnlock() {
  if (audioUnlocked) return;
  audioUnlocked = true;
  // Play a tiny silent WAV to fully unlock the audio pipeline
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const buf = ctx.createBuffer(1, 1, 22050);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    src.start();
    if (ctx.state === 'suspended') ctx.resume();
  } catch {}
  const cbs = unlockCallbacks.splice(0);
  cbs.forEach(cb => cb());
}

if (typeof document !== 'undefined') {
  const events = ['click', 'touchstart', 'touchend', 'keydown'];
  const unlock = () => {
    onUnlock();
    events.forEach(e => document.removeEventListener(e, unlock, true));
  };
  events.forEach(e => document.addEventListener(e, unlock, { once: true, capture: true }));
}

function waitForUnlock() {
  if (audioUnlocked) return Promise.resolve();
  return new Promise(resolve => unlockCallbacks.push(resolve));
}

export function useTextToSpeech() {
  const audioRef = useRef(null);
  const abortRef = useRef(null);
  const activeRef = useRef(false);

  const stop = useCallback(() => {
    activeRef.current = false;
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
  }, []);

  /** Play a blob URL or a pre-built Audio element, resolves on end */
  const playOne = useCallback(async (urlOrAudio, signal) => {
    if (!audioUnlocked) await waitForUnlock();
    if (signal?.aborted) throw new DOMException('', 'AbortError');

    return new Promise((resolve, reject) => {
      const audio = typeof urlOrAudio === 'string' ? new Audio(urlOrAudio) : urlOrAudio;
      audioRef.current = audio;

      const onAbort = () => {
        audio.pause();
        audio.src = '';
        reject(new DOMException('', 'AbortError'));
      };
      if (signal) signal.addEventListener('abort', onAbort, { once: true });

      const cleanup = () => {
        if (signal) signal.removeEventListener('abort', onAbort);
        audioRef.current = null;
      };
      audio.onended = () => { cleanup(); resolve(); };
      audio.onerror = () => { cleanup(); resolve(); };

      const doPlay = () => {
        audio.play().catch(err => {
          if (err.name === 'NotAllowedError') {
            waitForUnlock().then(() => {
              if (signal?.aborted) { cleanup(); reject(new DOMException('', 'AbortError')); return; }
              audio.play().catch(e => { cleanup(); reject(e); });
            });
          } else {
            cleanup(); reject(err);
          }
        });
      };

      // Wait for audio to be fully buffered before playing to prevent stuttering
      if (audio.readyState >= 4) { // HAVE_ENOUGH_DATA
        doPlay();
      } else {
        audio.addEventListener('canplaythrough', () => doPlay(), { once: true });
        // If the audio element doesn't have a src yet or loading hasn't started, trigger it
        if (typeof urlOrAudio === 'string' && !audio.src) audio.src = urlOrAudio;
      }
    });
  }, []);

  /**
   * STATIC PATH — single fetch + play.
   * Instant if phrase is preloaded or server-cached.
   */
  const speak = useCallback(async (text, onEnd) => {
    stop();
    if (!text?.trim()) { onEnd?.(); return; }

    const ctrl = new AbortController();
    abortRef.current = ctrl;
    activeRef.current = true;

    try {
      const url = await fetchAudio(text, ctrl.signal);
      if (!activeRef.current) return;
      await playOne(url, ctrl.signal);
      if (activeRef.current) onEnd?.();
    } catch (err) {
      if (err.name !== 'AbortError' && err.name !== 'NotAllowedError') { console.error('speak:', err); onEnd?.(); }
    }
  }, [stop, playOne]);

  /**
   * DYNAMIC PATH — parallel fetch + pre-buffered sequential playback.
   * As each URL resolves, immediately builds an Audio element and calls .load()
   * so the browser decodes/buffers it DURING playback of the previous phrase.
   * When it is time to play, the element is already ready → zero gap.
   */
  const speakStream = useCallback(async (text, onEnd) => {
    stop();
    if (!text?.trim()) { onEnd?.(); return; }

    const ctrl = new AbortController();
    abortRef.current = ctrl;
    activeRef.current = true;

    const chunks = splitChunks(text);

    if (chunks.length <= 1) {
      try {
        const url = await fetchAudio(chunks[0] ?? text.trim(), ctrl.signal);
        if (!activeRef.current) return;
        await playOne(url, ctrl.signal);
        if (activeRef.current) onEnd?.();
      } catch (err) {
        if (err.name !== 'AbortError') { console.error('speakStream:', err); onEnd?.(); }
      }
      return;
    }

    // Fire all chunk fetches in parallel.
    // As each URL arrives, immediately create + preload an Audio element
    // so it is buffered/decoded BEFORE its turn — eliminating the startup gap.
    const audioPromises = chunks.map(chunk =>
      fetchAudio(chunk, ctrl.signal)
        .then(url => {
          if (!url || !activeRef.current) return null;
          const a = new Audio(url);
          a.preload = 'auto';
          a.load(); // buffer while previous phrase is playing
          return a;
        })
        .catch(() => null)
    );

    for (let i = 0; i < audioPromises.length; i++) {
      try {
        if (!activeRef.current) return;
        const audio = await audioPromises[i];
        if (!audio || !activeRef.current) return;
        await playOne(audio, ctrl.signal);
      } catch (err) {
        if (err.name === 'AbortError' || !activeRef.current) return;
      }
    }
    if (activeRef.current) onEnd?.();
  }, [stop, playOne]);

  const isPlaying = useCallback(() => {
    return audioRef.current instanceof Audio && !audioRef.current.paused;
  }, []);

  useEffect(() => stop, [stop]);

  return { speak, speakStream, stop, isPlaying };
}

export function useSpeechToText() {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const activeRef = useRef(false);       // true while user wants to keep listening
  const accumulatedRef = useRef('');     // text accumulated across restarts (no duplicates)
  const langRef = useRef('kk-KZ');

  const startListening = useCallback((lang = 'kk-KZ') => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Браузер не поддерживает распознавание речи');
      return;
    }
    if (activeRef.current) return; // already running

    langRef.current = lang;
    activeRef.current = true;
    accumulatedRef.current = '';
    setTranscript('');
    setIsListening(true);

    function createAndStart() {
      if (!activeRef.current) return;

      const rec = new SpeechRecognition();
      rec.lang = langRef.current;
      rec.interimResults = true;
      rec.continuous = false;   // single utterance — most reliable across browsers
      rec.maxAlternatives = 1;
      recognitionRef.current = rec;

      rec.onresult = (event) => {
        let interimTranscript = '';
        let newFinal = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            newFinal += result[0].transcript.trim() + ' ';
          } else {
            interimTranscript = result[0].transcript;
          }
        }
        if (newFinal) accumulatedRef.current += newFinal;
        setTranscript((accumulatedRef.current + interimTranscript).trim());
      };

      rec.onerror = (e) => {
        if (e.error === 'no-speech' || e.error === 'aborted') return; // expected — will restart
        activeRef.current = false;
        setIsListening(false);
      };

      rec.onend = () => {
        if (activeRef.current) {
          // Restart immediately for next utterance
          setTimeout(createAndStart, 50);
        } else {
          setIsListening(false);
        }
      };

      try { rec.start(); } catch {
        activeRef.current = false;
        setIsListening(false);
      }
    }

    createAndStart();
  }, []);

  const stopListening = useCallback(() => {
    activeRef.current = false;
    const rec = recognitionRef.current;
    recognitionRef.current = null;
    if (rec) {
      rec.onend = null;
      try { rec.stop(); } catch {}
    }
    setIsListening(false);
  }, []);

  const clearTranscript = useCallback(() => {
    accumulatedRef.current = '';
    setTranscript('');
  }, []);

  return { transcript, isListening, startListening, stopListening, clearTranscript };
}