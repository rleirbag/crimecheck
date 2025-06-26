"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SendHorizontal, AudioWaveform } from "lucide-react";
import { VoiceDialog } from "@/components/ui/voice-dialog";

// Types para a API
interface UserQuery {
  question: string;
  method?: "tfidf" | "semantic";
}

interface ApiResponse {
  query: string;
  found_context: string;
  transcribed_text?: string | null;
  exact_answer?: string | null;
  answer_score?: number | null;
  context_score: number;
  method: string;
}

interface Message {
  text: string | React.ReactNode;
  sender: "user" | "bot";
  isLoading?: boolean;
  contextData?: {
    context: string;
    confidence: number;
    method: string;
  };
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessageToAPI = async (question: string): Promise<ApiResponse> => {
    const payload: UserQuery = {
      question,
      method: "semantic" // Default method
    };

    const response = await fetch("http://localhost:8000/check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  };

  const sendAudioToAPI = async (audioBlob: Blob): Promise<ApiResponse> => {
    const formData = new FormData();
    formData.append("audio_file", audioBlob, "recording.webm");

    const response = await fetch("http://localhost:8000/check_audio", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    setIsLoading(true);

    // Add user message immediately
    setMessages(prev => [...prev, { text: userMessage, sender: "user" }]);

    // Add loading message
    setMessages(prev => [...prev, { text: "Analisando sua pergunta...", sender: "bot", isLoading: true }]);

    try {
      const apiResponse = await sendMessageToAPI(userMessage);
      
      // Remove loading message and add real response
      setMessages(prev => {
        const newMessages = prev.slice(0, -1); // Remove loading message
        
        // Use exact answer if available, otherwise use context
        const responseText = apiResponse.exact_answer || apiResponse.found_context;
        
        const botMessage: Message = {
          text: responseText,
          sender: "bot",
          contextData: {
            context: apiResponse.found_context,
            confidence: apiResponse.context_score,
            method: apiResponse.method
          }
        };

        return [...newMessages, botMessage];
      });
    } catch (error) {
      console.error("Erro ao consultar API:", error);
      
      // Remove loading message and add error message
      setMessages(prev => {
        const newMessages = prev.slice(0, -1); // Remove loading message
        let errorMessage = "Desculpe, ocorreu um erro ao processar sua pergunta. ";
        
        if (error instanceof Error) {
          if (error.message.includes("fetch")) {
            errorMessage += "Verifique se o servidor está rodando em localhost:8000.";
          } else {
            errorMessage += `Detalhes: ${error.message}`;
          }
        }
        
        return [...newMessages, { text: errorMessage, sender: "bot" }];
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle voice input from the VoiceDialog component
  const handleVoiceInput = async (_duration: number, audioBlob?: Blob) => {
    console.log('handleVoiceInput called with:', { _duration, audioBlob, isLoading });
    if (!audioBlob || isLoading) return;
    
    setIsLoading(true);
    
    // Add loading message for audio processing
    setMessages(prev => [...prev, { 
      text: (
        <div className="flex items-center gap-2">
          <AudioWaveform className="w-4 h-4 animate-pulse" />
          <span>Processando áudio...</span>
        </div>
      ), 
      sender: "bot", 
      isLoading: true 
    }]);

    try {
      const apiResponse = await sendAudioToAPI(audioBlob);
      
      // Remove loading message and add real response
      setMessages(prev => {
        const newMessages = prev.slice(0, -1); // Remove loading message
        
        // Add transcribed question as user message if available
        if (apiResponse.transcribed_text) {
          newMessages.push({
            text: apiResponse.transcribed_text,
            sender: "user"
          });
        }
        
        // Use exact answer if available, otherwise use context
        const responseText = apiResponse.exact_answer || apiResponse.found_context;
        
        const botMessage: Message = {
          text: responseText,
          sender: "bot",
          contextData: {
            context: apiResponse.found_context,
            confidence: apiResponse.context_score,
            method: apiResponse.method
          }
        };

        return [...newMessages, botMessage];
      });
    } catch (error) {
      console.error("Erro ao processar áudio:", error);
      
      // Remove loading message and add error message
      setMessages(prev => {
        const newMessages = prev.slice(0, -1); // Remove loading message
        let errorMessage = "Desculpe, ocorreu um erro ao processar o áudio. ";
        
        if (error instanceof Error) {
          if (error.message.includes("fetch")) {
            errorMessage += "Verifique se o servidor está rodando em localhost:8000.";
          } else {
            errorMessage += `Detalhes: ${error.message}`;
          }
        }
        
        return [...newMessages, { text: errorMessage, sender: "bot" }];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const examplePrompts = [
    { text: "Me dê um resumo sobre a lei Maria da Penha" },
    { text: "Tive minhas fotos expostas na internet por meu companheiro, isso configura algum crime?" }
  ];

  const handlePromptClick = async (prompt: string) => {
    if (isLoading) return;
    
    setIsLoading(true);
    setMessages(prev => [...prev, { text: prompt, sender: "user" }]);
    
    // Add loading message
    setMessages(prev => [...prev, { text: "Analisando sua pergunta...", sender: "bot", isLoading: true }]);

    try {
      const apiResponse = await sendMessageToAPI(prompt);
      
      // Remove loading message and add real response
      setMessages(prev => {
        const newMessages = prev.slice(0, -1); // Remove loading message
        
        // Use exact answer if available, otherwise use context
        const responseText = apiResponse.exact_answer || apiResponse.found_context;
        
        const botMessage: Message = {
          text: responseText,
          sender: "bot",
          contextData: {
            context: apiResponse.found_context,
            confidence: apiResponse.context_score,
            method: apiResponse.method
          }
        };

        return [...newMessages, botMessage];
      });
    } catch (error) {
      console.error("Erro ao consultar API:", error);
      
      // Remove loading message and add error message
      setMessages(prev => {
        const newMessages = prev.slice(0, -1); // Remove loading message
        let errorMessage = "Desculpe, ocorreu um erro ao processar sua pergunta. ";
        
        if (error instanceof Error) {
          if (error.message.includes("fetch")) {
            errorMessage += "Verifique se o servidor está rodando em localhost:8000.";
          } else {
            errorMessage += `Detalhes: ${error.message}`;
          }
        }
        
        return [...newMessages, { text: errorMessage, sender: "bot" }];
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className=" pt-8">
      <div className="relative max-w-4xl mx-auto">
        <div className="absolute inset-0 bg-black/10 translate-x-2 translate-y-2 "></div>
        <div className="relative bg-white shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-black flex flex-col">
          <div className="border-b p-2">
            <div className="font-(family-name:--font-playfair) text-3xl antialiased leading-normal text-[2.5rem] max-w-200">CrimeCheck</div>
          </div>
          <div className="h-[600px] overflow-y-auto overflow-x-hidden p-4 space-y-4">
            {messages.length === 0 && (
              <div className="font-(family-name:--font-inter) flex w-full h-full items-center justify-center">
                <div className="flex gap-8 p-4 items-center justify-center">
                  {examplePrompts.map((prompt, index) => (
                    <div 
                      key={index} 
                      className={`relative h-48 w-[35%] p-4 border bg-white border-amber-500 text-center z-10 content-center transition-colors ${
                        isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-gray-100'
                      }`} 
                      onClick={() => !isLoading && handlePromptClick(prompt.text)}
                    >
                      <div className="absolute inset-0 bg-amber-700/10 translate-x-2 translate-y-2 z-0"></div>
                      {prompt.text}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {messages.map((message, index) => {
              // Check if this is the last bot message with context data
              const isLastBotMessage = message.sender === "bot" && 
                message.contextData && 
                !message.isLoading &&
                index === messages.findLastIndex(m => m.sender === "bot" && m.contextData && !m.isLoading);

              return (
                <div
                  key={index}
                  className={`flex  ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`group relative max-w-[80%] rounded-lg p-3 font-sans ${
                      message.sender === "user" 
                        ? "bg-amber-800 text-white " 
                        : message.isLoading 
                          ? "bg-gray-100 text-gray-600 animate-pulse" 
                          : isLastBotMessage
                            ? "bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors cursor-help"
                            : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">
                      {typeof message.text === 'string' ? message.text : message.text}
                    </div>
                    
                    {/* Hover tooltip with context and confidence - Only for last bot message */}
                    {isLastBotMessage && (
                      <>
                        {/* Invisible bridge to prevent hover loss */}
                        <div className="absolute left-full top-0 w-4 h-full opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto"></div>
                        
                        <div className="absolute left-full top-0 ml-4 p-3 bg-black text-white text-sm rounded-lg shadow-xl opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity duration-200 w-80 max-h-60 pointer-events-none group-hover:pointer-events-auto">
                          <div className="mb-2">
                            <strong>Contexto relevante:</strong>
                            <div className="mt-1 text-gray-200 text-xs leading-relaxed max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                              {message.contextData?.context}
                            </div>
                          </div>
                          <div className="text-xs text-gray-300 border-t border-gray-600 pt-2 flex justify-between">
                            <div>Confiança: {message.contextData ? (message.contextData.confidence * 100).toFixed(1) : '0'}%</div>
                            <div>Método: {message.contextData?.method}</div>
                          </div>
                          {/* Arrow pointing left */}
                          <div className="absolute right-full top-4 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-black"></div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="border-t p-4">
            <div className="flex items-center gap-2 text-amber-400">
              <VoiceDialog onVoiceStop={handleVoiceInput} />

              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && !isLoading && handleSendMessage()}
                placeholder={isLoading ? "Processando..." : "Digite sua mensagem..."}
                className="flex-1 px-4 py-2 border focus:outline-none focus:ring focus:ring-gray-400 text-black disabled:opacity-50"
                disabled={isLoading}
              />
              <Button 
                className={`font-serif rounded-sm bg-transparent text-amber-400 hover:bg-transparent ${
                  isLoading ? 'cursor-not-allowed opacity-50' : ''
                }`} 
                onClick={handleSendMessage}
                disabled={isLoading}
              >
                <SendHorizontal className="cursor-pointer" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
