import React, { useState, useRef, useEffect } from 'react';
import type { Expense } from '../types';
import { getChatbotResponse } from '../services/geminiService';
import { SparkIcon } from './SparkIcon';
import Loader from './Loader';

interface ChatbotProps {
  expenses: Expense[];
  onClose: () => void;
}

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

function Chatbot({ expenses, onClose }: ChatbotProps): React.ReactNode {
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'ai', text: "Hello! I'm BudgetBot. Ask me anything about your spending." }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const prompt = inputValue.trim();
    if (!prompt || isLoading) return;

    setMessages(prev => [...prev, { sender: 'user', text: prompt }]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await getChatbotResponse(expenses, prompt);
      setMessages(prev => [...prev, { sender: 'ai', text: response }]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Sorry, I couldn't get a response.";
      setMessages(prev => [...prev, { sender: 'ai', text: `Error: ${errorMessage}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="chatbot-title"
    >
      <div 
        className="bg-slate-800 w-full max-w-2xl h-full max-h-[80vh] rounded-2xl shadow-2xl border border-slate-700 flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <SparkIcon className="h-6 w-6 text-indigo-400" />
            <h2 id="chatbot-title" className="text-xl font-bold text-indigo-400">BudgetBot</h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500 rounded-full p-1"
            aria-label="Close chat"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        {/* Messages */}
        <div className="flex-grow p-4 overflow-y-auto space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex items-start gap-3 ${message.sender === 'user' ? 'justify-end' : ''}`}>
              {message.sender === 'ai' && <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-500/50 flex items-center justify-center"><SparkIcon className="h-5 w-5 text-indigo-300" /></div>}
              <div className={`max-w-[80%] p-3 rounded-2xl text-white ${message.sender === 'user' ? 'bg-indigo-600 rounded-br-none' : 'bg-slate-700 rounded-bl-none'}`}>
                 <p className="text-sm leading-relaxed">{message.text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-500/50 flex items-center justify-center"><SparkIcon className="h-5 w-5 text-indigo-300" /></div>
              <div className="max-w-[80%] p-3 rounded-2xl bg-slate-700 rounded-bl-none flex items-center">
                <Loader />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-slate-700 flex-shrink-0">
          <div className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Ask away..."
              className="w-full bg-slate-700 border border-slate-600 rounded-full py-3 pl-4 pr-14 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isLoading}
              aria-label="Your message"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 text-white rounded-full h-9 w-9 flex items-center justify-center hover:bg-indigo-500 disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors"
              disabled={isLoading || !inputValue.trim()}
              aria-label="Send message"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Chatbot;
