import { useState, useEffect, useCallback, useRef } from 'react';

export function useTextToSpeech() {
  const utteranceRef = useRef(null);
  const resumeTimerRef = useRef(null);

  const clearResumeTimer = useCallback(() => {
    if (resumeTimerRef.current) {
      clearInterval(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  }, []);

  const speak = useCallback((text, lang = 'ru-RU') => {
    window.speechSynthesis.cancel();
    clearResumeTimer();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onend = () => clearResumeTimer();
    utterance.onerror = () => clearResumeTimer();
    utteranceRef.current = utterance;

    window.speechSynthesis.speak(utterance);

    // Chrome bug workaround: periodically call resume() to prevent
    // speechSynthesis from silently stopping after ~15 seconds.
    resumeTimerRef.current = setInterval(() => {
      if (!window.speechSynthesis.speaking) {
        clearResumeTimer();
      } else {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 5000);

    return utterance;
  }, [clearResumeTimer]);

  const stop = useCallback(() => {
    clearResumeTimer();
    window.speechSynthesis.cancel();
  }, [clearResumeTimer]);

  useEffect(() => {
    return () => {
      clearResumeTimer();
      window.speechSynthesis.cancel();
    };
  }, [clearResumeTimer]);

  return { speak, stop };
}

export function useSpeechToText() {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const startListening = useCallback((lang = 'ru-RU') => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Браузер не поддерживает распознавание речи');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setTranscript(finalTranscript + interimTranscript);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return { transcript, isListening, startListening, stopListening, clearTranscript };
}