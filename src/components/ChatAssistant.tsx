
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Smile } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi there 👋\nHow can I help you with CampusPro?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const toggleChat = () => {
    if (isMinimized) {
      setIsOpen(true);
      setIsMinimized(false);
    } else {
      setIsMinimized(true);
    }
  };

  const closeChat = () => {
    setIsOpen(false);
    setIsMinimized(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const sendMessage = async () => {
    if (!inputValue.trim()) return;
    
    const userMessage = inputValue.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: userMessage }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.generatedText || "I'm sorry, I couldn't process that request." }]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, there was an error processing your request. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <>
      {/* Minimized Button */}
      {!isOpen && (
        <button 
          onClick={toggleChat}
          className="fixed bottom-5 right-5 bg-yellow-400 hover:bg-yellow-500 text-black rounded-full p-4 shadow-lg z-50 transition-all duration-300"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-5 right-5 w-[350px] h-[450px] bg-black border border-yellow-500/30 rounded-2xl flex flex-col shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-yellow-400 to-yellow-500 px-4 py-3">
            <div className="flex items-center">
              <div className="bg-black rounded-full w-8 h-8 flex items-center justify-center mr-2">
                <span className="text-yellow-400 font-bold">C</span>
              </div>
              <div>
                <h3 className="font-bold text-black">Campus Pro Assistant</h3>
                <p className="text-xs text-black/70">Online now</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={toggleChat} className="text-black/80 hover:text-black">
                <span className="text-2xl">−</span>
              </button>
              <button onClick={closeChat} className="text-black/80 hover:text-black">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-900 to-black">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`mb-4 ${message.role === 'user' ? 'ml-auto max-w-[80%]' : 'mr-auto max-w-[80%]'}`}
              >
                <div 
                  className={`p-3 rounded-lg ${
                    message.role === 'user' 
                      ? 'bg-yellow-400 text-black rounded-tr-none' 
                      : 'bg-gray-800 text-white rounded-tl-none'
                  }`}
                >
                  {message.content.split('\n').map((text, i) => (
                    <p key={i} className={i > 0 ? 'mt-2' : ''}>{text}</p>
                  ))}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="mr-auto max-w-[80%] mb-4">
                <div className="p-3 rounded-lg bg-gray-800 text-white rounded-tl-none flex items-center">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input */}
          <div className="p-3 border-t border-gray-800 bg-gray-900">
            <div className="flex bg-gray-800 rounded-full overflow-hidden">
              <Input
                type="text"
                placeholder="Type a message..."
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-white"
              />
              <button 
                onClick={sendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="p-2 text-yellow-400 hover:text-yellow-500 disabled:opacity-50"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Minimized Chat Box */}
      {!isOpen && isMinimized && (
        <div className="fixed bottom-20 right-5 w-[250px] bg-black border border-yellow-500/30 rounded-xl p-4 shadow-lg z-40 animate-fade-in">
          <p className="text-white font-medium mb-3">Need help with CampusPro?</p>
          <Button 
            onClick={toggleChat} 
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black"
          >
            Chat with us
          </Button>
        </div>
      )}
    </>
  );
};

export default ChatAssistant;
