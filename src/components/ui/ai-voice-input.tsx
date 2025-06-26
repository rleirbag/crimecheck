"use client";

import { Mic } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface AIVoiceInputProps {
  onStart?: () => void;
  onStop?: (duration: number) => void;
  visualizerBars?: number;
  demoMode?: boolean;
  demoInterval?: number;
  className?: string;
  isRecording?: boolean;
}

export function AIVoiceInput({
  onStart,
  onStop,
  visualizerBars = 48,
  demoMode = false,
  demoInterval = 3000,
  className,
  isRecording = false
}: AIVoiceInputProps) {
  const [submitted, setSubmitted] = useState(false);
  const [time, setTime] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [isDemo, setIsDemo] = useState(demoMode);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Use external isRecording state if provided, otherwise use internal submitted state
  const isCurrentlyRecording = isRecording !== undefined ? isRecording : submitted;

  // Timer effect - responds to both internal and external recording states
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isCurrentlyRecording) {
      intervalId = setInterval(() => {
        setTime(t => t + 1);
      }, 1000);
    } else {
      setTime(0); // Reset timer when not recording
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isCurrentlyRecording]);

  // Handle start/stop callbacks - Only when using internal state (no external isRecording)
  useEffect(() => {
    if (isRecording !== undefined) return; // Skip if external isRecording is provided
    
    if (submitted) {
      onStart?.();
    } else if (time > 0) {
      // Only call onStop when transitioning from submitted to not submitted
      onStop?.(time);
      setTime(0);
    }
  }, [submitted, time, onStart, onStop, isRecording]);

  useEffect(() => {
    if (!isDemo) return;

    let timeoutId: NodeJS.Timeout;
    const runAnimation = () => {
      setSubmitted(true);
      timeoutId = setTimeout(() => {
        setSubmitted(false);
        timeoutId = setTimeout(runAnimation, 1000);
      }, demoInterval);
    };

    const initialTimeout = setTimeout(runAnimation, 100);
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(initialTimeout);
    };
  }, [isDemo, demoInterval]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleClick = () => {
    if (isDemo) {
      setIsDemo(false);
      setSubmitted(false);
    } else if (isRecording === undefined) {
      // Only control internal state if no external isRecording prop
      setSubmitted((prev) => !prev);
    } else {
      // If external isRecording is provided, call the appropriate callback
      if (isRecording) {
        onStop?.(time);
      } else {
        onStart?.();
      }
    }
  };

  return (
    <div className={cn("w-full py-4", className)}>
      <div className="relative max-w-xl w-full mx-auto flex items-center flex-col gap-2">
        <button
          className={cn(
            "group w-16 h-16 rounded-xl flex items-center justify-center transition-colors",
            isCurrentlyRecording
              ? "bg-none hover:bg-neutral-50"
              : "bg-none hover:bg-neutral-50 dark:hover:bg-white/10"
          )}
          type="button"
          onClick={handleClick}
        >
          {isCurrentlyRecording ? (
            <div
              className="w-6 h-6 rounded-sm animate-spin bg-amber-400 dark:bg-white cursor-pointer pointer-events-auto"
              style={{ animationDuration: "3s" }}
            />
          ) : (
            <Mic className="w-6 h-6 text-amber-400/70 cursor-pointer" />
          )}
        </button>

        <span
          className={cn(
            "font-mono text-sm transition-opacity duration-300",
            isCurrentlyRecording
              ? "text-black/70 dark:text-white/70"
              : "text-black/30 dark:text-white/30"
          )}
        >
          {formatTime(time)}
        </span>

        <div className="h-4 w-64 flex items-center justify-center gap-0.5">
          {[...Array(visualizerBars)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-0.5 rounded-full transition-all duration-300",
                isCurrentlyRecording
                  ? "bg-black/50 dark:bg-white/50 animate-pulse"
                  : "bg-black/10 dark:bg-white/10 h-1"
              )}
              style={
                isCurrentlyRecording && isClient
                  ? {
                    height: `${20 + Math.random() * 80}%`,
                    animationDelay: `${i * 0.05}s`,
                  }
                  : undefined
              }
            />
          ))}
        </div>

        <p className="h-4 text-xs text-black/70 dark:text-white/70">
          {isCurrentlyRecording ? "Gravando..." : "Clique no microfone para gravar"}
        </p>
      </div>
    </div>
  );
}
