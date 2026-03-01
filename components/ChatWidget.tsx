
import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, User, Sparkles, Loader2, MinusCircle } from 'lucide-react';
import { chatWithAgent } from '../services/gemini';
import { ChatMessage } from '../types';

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hi! I am your EduPath Agent. Need help navigating your career domain or matching your resume?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const stream = await chatWithAgent(history, userMessage);

      let assistantText = "";
      setMessages(prev => [...prev, { role: 'model', text: '' }]);

      for await (const chunk of stream) {
        const text = typeof chunk.text === 'function' ? chunk.text() : chunk.text;
        assistantText += text || "";
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1].text = assistantText;
          return updated;
        });
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to format text with basic markdown-like behavior
  const formatText = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Handle Bold
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedLine = parts.map((part, pi) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pi} className="font-black text-blue-900">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      // Handle Bullet Points
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
        // Strip the indicator from the first segment of the formatted line
        const content = [...formattedLine];
        if (typeof content[0] === 'string') {
          content[0] = content[0].replace(/^(\*|-)\s+/, '');
        }

        // Skip rendering if the bullet point content is effectively empty
        const isActuallyEmpty = content.every(part => {
          if (typeof part === 'string') return part.trim() === '';
          return false;
        });

        if (isActuallyEmpty) return null;

        return (
          <div key={i} className="flex gap-2 ml-2 my-1">
            <span className="text-blue-500 font-bold">•</span>
            <span className="flex-1">{content}</span>
          </div>
        );
      }

      // Hide empty paragraphs unless it's for spacing
      if (trimmedLine === '') return <div key={i} className="h-2" />;

      return <p key={i} className="mb-2 last:mb-0">{formattedLine}</p>;
    });
  };

  return (
    <div className="fixed bottom-24 right-6 md:bottom-8 md:right-8 z-[100]">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all group animate-bounce hover:animate-none"
        >
          <Bot className="w-8 h-8 group-hover:rotate-12 transition-transform" />
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
        </button>
      ) : (
        <div className="w-[90vw] md:w-[420px] h-[600px] bg-white rounded-[2.5rem] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.4)] border border-slate-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white flex justify-between items-center shrink-0 shadow-lg relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner border border-white/10">
                <Bot className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-black tracking-tight text-lg">EduPath Agent</h3>
                <div className="flex items-center gap-2 text-[10px] font-black text-blue-100 uppercase tracking-widest">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]"></span>
                  Professional Support
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-2 rounded-xl transition-all active:scale-90">
              <MinusCircle className="w-6 h-6" />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/80 custom-scrollbar">
            {messages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                <div className={`flex items-center gap-2 mb-1 px-2 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {m.role === 'model' ? (
                    <>
                      <div className="w-5 h-5 bg-blue-100 rounded-md flex items-center justify-center text-blue-600">
                        <Bot className="w-3 h-3" />
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">AI AGENT</span>
                    </>
                  ) : (
                    <>
                      <div className="w-5 h-5 bg-slate-200 rounded-md flex items-center justify-center text-slate-500">
                        <User className="w-3 h-3" />
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">YOU</span>
                    </>
                  )}
                </div>
                <div className={`max-w-[90%] p-5 rounded-3xl text-[14px] leading-[1.6] shadow-sm ${m.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none shadow-blue-100'
                    : 'bg-white text-slate-700 border border-slate-200/50 rounded-tl-none shadow-slate-200'
                  }`}>
                  {formatText(m.text)}
                </div>
              </div>
            ))}
            {isLoading && messages[messages.length - 1].role !== 'model' && (
              <div className="flex flex-col items-start animate-pulse">
                <div className="flex items-center gap-2 mb-1 px-2">
                  <div className="w-5 h-5 bg-blue-50 rounded-md"></div>
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">THINKING</span>
                </div>
                <div className="bg-white p-5 rounded-3xl rounded-tl-none border border-slate-100 shadow-sm flex gap-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-5 bg-white border-t border-slate-100 shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.02)]">
            <form onSubmit={handleSend} className="flex gap-3 bg-slate-50 border border-slate-200 p-2 rounded-2xl focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message your Career Agent..."
                className="flex-1 bg-transparent px-3 py-2 focus:outline-none text-sm font-medium text-slate-700 placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-all disabled:opacity-40 disabled:grayscale active:scale-95 shadow-md shadow-blue-200"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
            <div className="mt-3 text-center">
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Powered by Gemini AI Specialist</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
