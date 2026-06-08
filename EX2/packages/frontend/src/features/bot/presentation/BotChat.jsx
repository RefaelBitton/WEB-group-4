import React, { useRef, useEffect } from "react";
import { useBot } from "../data/botState.js";

// Utility to render Hebrew parts with a distinct highlight
const renderHighlightedText = (text) => {
  if (!text) return null;
  // Split the text by Hebrew word chunks to wrap them.
  const regex = /([\u0590-\u05FF]+(?:[\s.,!?]+[\u0590-\u05FF]+)*)/;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (/[\u0590-\u05FF]/.test(part)) {
      return (
        <span key={index} className="bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-md font-semibold mx-1 shadow-sm inline-block" dir="rtl">
          {part}
        </span>
      );
    }
    return <span key={index}>{part}</span>;
  });
};

export function BotChat() {
  const { 
    messages, input, setInput, sendMessage, 
    starter, loading, error, isRecording, toggleRecording 
  } = useBot();

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <section className="flex flex-col h-[600px] w-full max-w-2xl mx-auto rounded-3xl border border-slate-200 bg-white/70 backdrop-blur-xl shadow-xl overflow-hidden" dir="rtl">
      {/* Header */}
      <div className="bg-indigo-600 px-6 py-4 flex items-center justify-between shadow-md z-10">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">English Bot</h2>
          <p className="text-indigo-200 text-sm mt-0.5">תרגל אנגלית עם תיקונים חכמים</p>
        </div>
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
          <span className="text-xl">🤖</span>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
        {starter && messages.length === 0 && (
          <div className="flex justify-center mb-6">
            <div className="bg-indigo-100/80 backdrop-blur-sm text-indigo-800 text-sm px-4 py-2 rounded-full shadow-sm text-center max-w-[80%]">
              <span className="block font-medium mb-1 text-xs">פתיח לשיחה:</span>
              <span className="italic font-serif text-base" dir="ltr">{starter}</span>
            </div>
          </div>
        )}

        {messages.map((message, index) => {
          const isUser = message.role === "user";
          return (
            <div key={index} className={`flex ${isUser ? "justify-start" : "justify-end"}`}>
              <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${
                isUser 
                  ? "bg-indigo-500 text-white rounded-tr-sm" 
                  : "bg-white border border-slate-200 text-slate-800 rounded-tl-sm"
              }`}>
                <p className={`text-xs mb-1.5 opacity-80 ${isUser ? "text-indigo-100" : "text-slate-400"}`}>
                  {isUser ? "את/ה" : "הבוט"}
                </p>
                <div className="text-base leading-relaxed" dir="ltr">
                  {isUser ? (
                    message.text
                  ) : (
                    renderHighlightedText(message.text)
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {loading && (
          <div className="flex justify-end">
            <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100">
        {error && (
          <div className="mb-3 px-4 py-2 bg-rose-50 text-rose-600 text-sm rounded-xl flex items-center gap-2">
            <span className="font-bold">!</span> {error}
          </div>
        )}
        
        <div className="flex items-end gap-3 relative">
          <button
            onClick={toggleRecording}
            className={`p-3.5 rounded-full shadow-sm transition-all duration-300 flex-shrink-0 ${
              isRecording 
                ? "bg-rose-500 text-white animate-pulse shadow-rose-200" 
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
            title={isRecording ? "עצור הקלטה" : "התחל להקליט"}
          >
            {isRecording ? (
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                 <rect x="6" y="6" width="12" height="12" rx="2" />
               </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
              </svg>
            )}
          </button>
          
          <textarea
            className="flex-1 max-h-32 min-h-[56px] rounded-2xl border-0 bg-slate-100 px-4 py-3.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition-all"
            placeholder={isRecording ? "מקשיב..." : "הקלד הודעה באנגלית או לחץ על המיקרופון..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            dir="ltr"
          />

          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="p-3.5 rounded-full bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-200 transition-all flex-shrink-0"
            title="שלח"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 transform rotate-180 rtl:rotate-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
