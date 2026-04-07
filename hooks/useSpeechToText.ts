import { useCallback, useEffect, useRef, useState } from "react";

/** Minimal Web Speech API surface (not in all TS `dom` lib versions). */
type SpeechRecognitionResultLike = { isFinal: boolean; 0?: { transcript?: string } };

interface SpeechRecognitionResultListLike {
  length: number;
  [index: number]: SpeechRecognitionResultLike;
}

interface SpeechRecognitionEventLike extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultListLike;
}

interface SpeechRecognitionLike extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  }
}

function normalizeTranscript(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

export function appendTranscriptValue(current: string, transcript: string) {
  const next = normalizeTranscript(transcript);
  if (!next) return current;
  const base = String(current || "");
  if (!base.trim()) return next;
  const needsSpace = !base.endsWith(" ") && !/^[,.!?]/.test(next);
  return `${base}${needsSpace ? " " : ""}${next}`;
}

export function useSpeechToText(onAppend: (transcript: string) => void) {
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCtor = useCallback((): SpeechRecognitionCtor | null => {
    if (typeof window === "undefined") return null;
    const ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    return ctor ?? null;
  }, []);

  useEffect(() => {
    setIsSupported(Boolean(getCtor()));
  }, [getCtor]);

  const start = useCallback(() => {
    const Ctor = getCtor();
    if (!Ctor) {
      setError("Speech recognition not supported on this device.");
      return;
    }
    setError(null);

    if (!recognitionRef.current) {
      const recognition = new Ctor();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: SpeechRecognitionEventLike) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += `${result[0]?.transcript || ""} `;
          }
        }
        const clean = normalizeTranscript(finalTranscript);
        if (clean) onAppend(clean);
      };

      recognition.onerror = () => {
        setError("Could not capture speech. Please try again.");
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch {
      setError("Could not start microphone. Please try again.");
    }
  }, [getCtor, onAppend]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const toggle = useCallback(() => {
    if (isListening) stop();
    else start();
  }, [isListening, start, stop]);

  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.stop();
      } catch {
        // noop
      }
      recognitionRef.current = null;
    };
  }, []);

  return { isSupported, isListening, error, toggle, stop };
}
