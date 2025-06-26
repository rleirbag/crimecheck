"use client";

import * as React from "react";

interface VoiceRecognitionState {
  isRecording: boolean;
  audioBlob: Blob | null;
  error: string | null;
}

interface VoiceRecognitionHook {
  isRecording: boolean;
  audioBlob: Blob | null;
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  resetState: () => void;
}

export function useVoiceRecognition(): VoiceRecognitionHook {
  const [state, setState] = React.useState<VoiceRecognitionState>({
    isRecording: false,
    audioBlob: null,
    error: null,
  });

  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);

  const startRecording = React.useCallback(async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000, // Common sample rate for speech recognition
          channelCount: 1,   // Mono audio
          echoCancellation: true,
          noiseSuppression: true
        } 
      });

      // Clear previous audio chunks
      audioChunksRef.current = [];

      // Create MediaRecorder instance with fallback support
      let mediaRecorderOptions: MediaRecorderOptions = {};
      
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mediaRecorderOptions.mimeType = 'audio/webm;codecs=opus';
        console.log('Using audio/webm;codecs=opus');
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        mediaRecorderOptions.mimeType = 'audio/webm';
        console.log('Using audio/webm');
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mediaRecorderOptions.mimeType = 'audio/mp4';
        console.log('Using audio/mp4');
      } else {
        console.log('Using default MediaRecorder format');
      }
      
      const mediaRecorder = new MediaRecorder(stream, mediaRecorderOptions);

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        console.log('Data available:', event.data.size, 'bytes');
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        console.log('MediaRecorder stopped - onstop called');
        // Create final audio blob with the same mimeType used for recording
        const blobType = mediaRecorderOptions.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: blobType });
        console.log('Audio blob created:', { size: audioBlob.size, type: audioBlob.type, chunks: audioChunksRef.current.length });
        setState(prev => ({ 
          ...prev, 
          isRecording: false, 
          audioBlob 
        }));

        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setState(prev => ({
          ...prev,
          isRecording: false,
          error: `Erro na gravação: ${event.error}`
        }));
      };

      // Start recording
      console.log('Starting MediaRecorder...');
      mediaRecorder.start(100); // Collect data every 100ms
      setState(prev => ({ ...prev, isRecording: true, error: null }));
      console.log('MediaRecorder started, state:', mediaRecorder.state);

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: `Erro ao acessar microfone: ${error instanceof Error ? error.message : String(error)}`
      }));
    }
  }, []);

  const stopRecording = React.useCallback(() => {
    console.log('stopRecording called, current state:', mediaRecorderRef.current?.state);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      console.log('Stopping MediaRecorder...');
      mediaRecorderRef.current.stop();
    }
  }, []);

  const resetState = React.useCallback(() => {
    setState({
      isRecording: false,
      audioBlob: null,
      error: null
    });
    audioChunksRef.current = [];
  }, []);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  return {
    isRecording: state.isRecording,
    audioBlob: state.audioBlob,
    error: state.error,
    startRecording,
    stopRecording,
    resetState
  };
}