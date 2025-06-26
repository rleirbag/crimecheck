"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { AIVoiceInput } from "@/components/ui/ai-voice-input";
import { Mic } from "lucide-react";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useVoiceRecognition } from "@/hooks/use-voice-recognition";

interface VoiceDialogProps {
  onVoiceStart?: () => void;
  onVoiceStop?: (duration: number, audioBlob?: Blob) => void;
}

export function VoiceDialog({ onVoiceStart, onVoiceStop }: VoiceDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [duration, setDuration] = React.useState(0);
  const {
    audioBlob,
    error,
    isRecording,
    startRecording,
    stopRecording,
    resetState
  } = useVoiceRecognition();

  // Timer for recording duration
  React.useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (isRecording) {
      intervalId = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } else {
      setDuration(0);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRecording]);

  const handleVoiceStart = async () => {
    await startRecording();
    onVoiceStart?.();
  };

  const handleVoiceStop = () => {
    stopRecording();
    // Note: onVoiceStop will be called automatically when audioBlob is ready
  };

  // Clear state when dialog is closed
  React.useEffect(() => {
    if (!open) {
      stopRecording();
      resetState();
      setDuration(0);
    }
  }, [open, stopRecording, resetState]);

  // Show error if any
  React.useEffect(() => {
    if (error) {
      console.error('Erro na gravação de áudio:', error);
    }
  }, [error]);

  // Show success when audio is captured and call the callback
  React.useEffect(() => {
    if (audioBlob && duration > 0) {
      console.log('Áudio capturado:', audioBlob);
      // Call the callback when audio is ready
      onVoiceStop?.(duration, audioBlob);
      // Close the dialog after processing
      setTimeout(() => {
        setOpen(false);
      }, 1000);
    }
  }, [audioBlob, duration, onVoiceStop]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) {
        stopRecording();
      }
      setOpen(newOpen);
    }}>
      <DialogTrigger asChild>
        <Mic className="cursor-pointer" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md border-1 border-black">
        <VisuallyHidden>
          <DialogTitle>Gravação de Voz</DialogTitle>
          <DialogDescription>
            Clique no botão do microfone para iniciar a gravação. Clique novamente para parar a gravação.
          </DialogDescription>
        </VisuallyHidden>
        <div className="flex flex-col items-center justify-center gap-4 p-6">
          <AIVoiceInput
            onStart={handleVoiceStart}
            onStop={handleVoiceStop}
            visualizerBars={48}
            isRecording={isRecording}
          />

          {/* Audio captured status */}
          {audioBlob && !isRecording && (
            <div className="w-full p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="text-sm text-green-700 text-center">
                ✓ Áudio gravado ({formatDuration(duration)})
              </div>
              <div className="text-xs text-green-600 text-center mt-1">
                Tamanho: {(audioBlob.size / 1024).toFixed(1)} KB
              </div>
            </div>
          )}

          {/* Error display */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
