"use client";

import * as React from "react";

interface VoiceRecognitionState {
  isRecording: boolean;
  transcript: string;
  error: string | null;
}

interface VoiceRecognitionHook {
  isRecording: boolean;
  transcript: string;
  error: string | null;
  startRecording: () => void;
  stopRecording: () => void;
  resetState: () => void;
}

export function useVoiceRecognition(): VoiceRecognitionHook {
  const [state, setState] = React.useState<VoiceRecognitionState>({
    isRecording: false,
    transcript: "",
    error: null,
  });

  const recognitionRef = React.useRef<SpeechRecognition | null>(null);
  // Referência para controlar se devemos continuar gravando
  const continueRecordingRef = React.useRef<boolean>(false);

  const initializeSpeechRecognition = React.useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setState(prev => ({ ...prev, error: "Reconhecimento de voz não suportado neste navegador" }));
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'pt-BR';

    recognition.onstart = () => {
      setState(prev => ({ ...prev, isRecording: true, error: null }));
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join(' ');
      setState(prev => ({ ...prev, transcript }));
    };

    recognition.onerror = (event) => {
      setState(prev => ({
        ...prev,
        isRecording: false,
        error: `Erro no reconhecimento de voz: ${event.error}`
      }));
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      // Se continueRecordingRef for true, reinicie o reconhecimento
      if (continueRecordingRef.current) {
        try {
          recognition.start();
        } catch (error) {
          console.error("Erro ao reiniciar reconhecimento:", error);
          continueRecordingRef.current = false;
          setState(prev => ({ ...prev, isRecording: false }));
          recognitionRef.current = null;
        }
      } else {
        setState(prev => ({ ...prev, isRecording: false }));
        recognitionRef.current = null;
      }
    };

    recognitionRef.current = recognition;
  }, []);

  const startRecording = React.useCallback(() => {
    try {
      if (!state.isRecording) {
        continueRecordingRef.current = true;
        initializeSpeechRecognition();
        recognitionRef.current?.start();
      }
    } catch (error) {
      continueRecordingRef.current = false;
      setState(prev => ({
        ...prev,
        error: `Erro ao iniciar gravação: ${error instanceof Error ? error.message : String(error)}`
      }));
    }
  }, [state.isRecording, initializeSpeechRecognition]);

  const stopRecording = React.useCallback(() => {
    continueRecordingRef.current = false;
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const resetState = React.useCallback(() => {
    continueRecordingRef.current = false;
    setState({
      isRecording: false,
      transcript: "",
      error: null
    });
  }, []);

  React.useEffect(() => {
    return () => {
      continueRecordingRef.current = false;
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, []);

  return {
    isRecording: state.isRecording,
    transcript: state.transcript,
    error: state.error,
    startRecording,
    stopRecording,
    resetState
  };
}