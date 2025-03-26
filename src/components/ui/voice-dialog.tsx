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
  onVoiceStop?: (duration: number, transcript?: string) => void;
}

export function VoiceDialog({ onVoiceStart, onVoiceStop }: VoiceDialogProps) {
  const [open, setOpen] = React.useState(false);
  const {
    transcript,
    error,
    startRecording,
    stopRecording,
    resetState
  } = useVoiceRecognition();

  const handleVoiceStart = () => {
    startRecording();
    onVoiceStart?.();
  };

  const handleVoiceStop = (duration: number) => {
    if (duration > 0) {
      stopRecording();
      onVoiceStop?.(duration, transcript);
    }
  };

  // Limpa o estado quando o diálogo é fechado
  React.useEffect(() => {
    if (!open) {
      stopRecording();
      resetState();
    }
  }, [open, stopRecording, resetState]);

  // Exibe mensagem de erro se houver
  React.useEffect(() => {
    if (error) {
      console.error('Erro no reconhecimento de voz:', error);
    }
  }, [error]);

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
            Clique no botão do microfone para iniciar a gravação. A gravação será interrompida automaticamente quando você parar de falar.
          </DialogDescription>
        </VisuallyHidden>
        <div className="flex flex-col items-center justify-center gap-4 p-6">
          <AIVoiceInput
            onStart={handleVoiceStart}
            onStop={handleVoiceStop}
            visualizerBars={48}
          />
          {transcript && (
            <div className="w-full max-h-32 overflow-y-auto p-3 bg-slate-50 rounded-md">
              <p className="text-sm text-slate-700">{transcript}</p>
            </div>
          )}
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
