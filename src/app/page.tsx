"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SendHorizontal } from "lucide-react";
import { VoiceDialog } from "@/components/ui/voice-dialog";

export default function Home() {
  const [messages, setMessages] = useState<{ text: string; sender: "user" | "bot" }[]>([]);
  const [inputMessage, setInputMessage] = useState("");

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    setMessages([...messages, { text: inputMessage, sender: "user" }]);
    setInputMessage("");

    // Simulate bot response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        sender: "bot"
      }]);
    }, 1000);
  };

  // Handle voice input from the VoiceDialog component
  const handleVoiceInput = (_duration: number, transcript?: string) => {
    if (transcript && transcript.trim()) {
      setInputMessage(transcript);
    }
  };

  const examplePrompts = [
    { text: "Me dê um resumo sobre a lei Maria da Penha" },
    { text: "Quais os artigos da lei Carolina Dieckmann?" }
  ];

  const handlePromptClick = (prompt) => {
    setMessages([...messages, { text: prompt, sender: "user" }]);
    // Simulate bot response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        text: "Isto é uma resposta simulada de um prompt de exemplo: " + prompt,
        sender: "bot"
      }]);
    }, 1000);
  };

  return (
    <div className=" pt-8">
      <div className="relative max-w-4xl mx-auto">
        <div className="absolute inset-0 bg-black/10 translate-x-2 translate-y-2 "></div>
        <div className="relative bg-white shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-black flex flex-col">
          <div className="border-b p-2">
            <div className="font-(family-name:--font-playfair) text-3xl antialiased leading-normal text-[2.5rem] max-w-200">CrimeCheck</div>
          </div>
          <div className="h-[600px] overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="flex w-full h-full items-center justify-center">
                <div className="flex gap-8 p-4 items-center justify-center">
                  {examplePrompts.map((prompt, index) => (
                    <div key={index} className="relative w-[25%] cursor-pointer p-4 border bg-white border-amber-500 hover:bg-gray-100 text-center z-10" onClick={() => handlePromptClick(prompt.text)}>
                      <div className="absolute inset-0 bg-amber-700/10 translate-x-2 translate-y-2 z-0"></div>
                      {prompt.text}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex  ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex max-w-[80%] rounded-lg p-3 font-sans ${message.sender === "user" ? "bg-amber-800 text-white " : "bg-gray-100 text-gray-800"}`}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t p-4">
            <div className="flex items-center gap-2 text-amber-400">
              <VoiceDialog onVoiceStop={handleVoiceInput} />

              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Digite sua mensagem..."
                className="flex-1 px-4 py-2 border focus:outline-none focus:ring focus:ring-gray-400 text-black"
              />
              <Button className="font-serif rounded-sm bg-transparent text-amber-400 hover:bg-transparent" onClick={handleSendMessage}><SendHorizontal className="cursor-pointer" /></Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
