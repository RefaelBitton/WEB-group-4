import React, { useRef, useEffect } from "react";
import { useBot } from "../data/botState.js";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Mic, MicOff, Send, Sparkles, Volume2, VolumeX } from "lucide-react";

const renderHighlightedText = (text) => {
  if (!text) return null;
  const regex = /([\u0590-\u05FF]+(?:[\s.,!?]+[\u0590-\u05FF]+)*)/;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (/[\u0590-\u05FF]/.test(part)) {
      return (
        <span key={index} className="bg-gradient-to-r from-rose-100 to-orange-100 text-rose-700 px-2 py-0.5 rounded-lg font-bold mx-1 shadow-sm inline-block" dir="rtl">
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
    starter, loading, error, isRecording, toggleRecording,
    voiceEnabled, setVoiceEnabled, speakText
  } = useBot();

  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="min-h-screen bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-indigo-100 via-slate-50 to-purple-100 dark:from-indigo-950/20 dark:via-slate-950 dark:to-purple-950/20 p-4 md:p-8 pb-24 md:pb-8 flex flex-col items-center justify-center font-sans" dir="rtl">
      
      {/* Back Button */}
      <div className="w-full max-w-4xl mb-6">
        <button 
          onClick={() => navigate('/child')}
          className="flex items-center text-slate-600 dark:text-slate-350 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md px-5 py-2.5 rounded-2xl shadow-sm border border-white/60 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 hover:bg-white dark:hover:bg-slate-900 transition-all group w-max cursor-pointer"
        >
          <ArrowRight className="h-5 w-5 ml-2 group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold text-lg">חזור ללוח הראשי</span>
        </button>
      </div>

      <section className="flex flex-col h-[75vh] w-full max-w-4xl rounded-[2.5rem] border border-white/50 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl shadow-2xl overflow-hidden relative">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none"></div>

        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-5 flex items-center justify-between shadow-lg z-10">
          <div className="flex flex-col">
            <h2 className="text-2xl font-black text-white tracking-wide flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-yellow-300" />
              בוט אנגלית
            </h2>
            <p className="text-indigo-100 text-sm mt-1 font-medium">המורה האישי שלך לאנגלית. תרגל איתי!</p>
          </div>
          <div className="w-14 h-14 bg-white/20 dark:bg-slate-850/40 rounded-full flex items-center justify-center backdrop-blur-md border border-white/30 dark:border-slate-700 shadow-inner">
            <span className="text-3xl filter drop-shadow-md">🤖</span>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 scroll-smooth z-10">
          {starter && messages.length === 0 && (
            <div className="flex justify-center mb-8">
              <div className="bg-indigo-55/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-indigo-800 dark:text-indigo-200 text-sm px-6 py-4 rounded-3xl shadow-sm text-center max-w-[85%]">
                <span className="block font-bold mb-2 text-indigo-400 dark:text-indigo-500 uppercase tracking-wider text-xs">פתיח לשיחה</span>
                <span className="italic font-serif text-lg text-indigo-900 dark:text-indigo-105" dir="ltr">{starter}</span>
              </div>
            </div>
          )}

          {messages.map((message, index) => {
            const isUser = message.role === "user";
            return (
              <div key={index} className={`flex ${isUser ? "justify-start" : "justify-end"} group`}>
                <div className={`max-w-[80%] p-5 rounded-3xl shadow-sm transform transition-all duration-300 hover:shadow-md ${
                  isUser 
                    ? "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-tr-sm" 
                    : "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm"
                }`}>
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <p className={`text-xs font-semibold tracking-wider uppercase opacity-80 ${isUser ? "text-indigo-200" : "text-slate-400 dark:text-slate-500"}`}>
                      {isUser ? "את/ה" : "הבוט"}
                    </p>
                    {!isUser && (
                      <button
                        onClick={() => speakText(message.text)}
                        className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                        title="השמע שוב"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="text-lg leading-relaxed font-medium flex flex-col gap-2" dir="ltr">
                    {isUser ? (
                      message.text
                    ) : message.evaluation ? (
                      <>
                        <div>{message.text}</div>
                        {message.evaluation.hasErrors && (
                          <>
                            {message.evaluation.correction && (
                              <div 
                                dir="rtl" 
                                className="text-rose-600 dark:text-rose-455 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100/50 dark:border-rose-900/30 rounded-2xl p-3 mt-2 text-sm font-semibold shadow-sm w-full block text-right"
                              >
                                {renderHighlightedText(message.evaluation.correction)}
                              </div>
                            )}
                            {message.evaluation.correctedSentence && (
                              <div 
                                dir="ltr" 
                                className="text-slate-600 dark:text-slate-355 bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl p-3 mt-2 text-sm font-semibold shadow-sm w-full block text-left"
                              >
                                <span className="text-indigo-600 dark:text-indigo-400 font-bold block mb-1">Correct sentence:</span>
                                {message.evaluation.correctedSentence}
                              </div>
                            )}
                          </>
                        )}
                      </>
                    ) : (
                      message.text.split('\n').filter(line => line.trim() !== '').map((line, idx) => {
                        const isCorrection = line.includes("(Hebrew Correction:") || /[\u0590-\u05FF]/.test(line);
                        return (
                          <div 
                            key={idx} 
                            dir={isCorrection ? "rtl" : "ltr"} 
                            className={isCorrection ? "text-rose-600 dark:text-rose-455 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100/50 dark:border-rose-900/30 rounded-2xl p-3 mt-2 text-sm font-semibold shadow-sm w-full block" : ""}
                          >
                            {renderHighlightedText(line)}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {loading && (
            <div className="flex justify-end">
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-3xl rounded-tl-sm shadow-sm flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2.5 h-2.5 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-white/50 dark:border-slate-800 z-10 rounded-b-[2.5rem]">
          {error && (
            <div className="mb-4 px-5 py-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-sm rounded-2xl flex items-center gap-3 font-medium">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-rose-200 dark:bg-rose-900 text-rose-700 dark:text-rose-300 font-bold">!</span> 
              {error}
            </div>
          )}
          
          <div className="flex items-end gap-3 relative bg-slate-50 dark:bg-slate-800 p-2 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-inner focus-within:ring-2 focus-within:ring-indigo-300 dark:focus-within:ring-indigo-500 focus-within:border-indigo-400 transition-all">
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`p-4 rounded-full shadow-sm transition-all duration-300 flex-shrink-0 cursor-pointer ${
                voiceEnabled 
                  ? "bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 border border-indigo-200 dark:border-indigo-900" 
                  : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
              }`}
              title={voiceEnabled ? "השבת הקראה קולית" : "הפעל הקראה קולית"}
            >
              {voiceEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
            </button>

            <button
              onClick={toggleRecording}
              className={`p-4 rounded-full shadow-sm transition-all duration-300 flex-shrink-0 cursor-pointer ${
                isRecording 
                  ? "bg-rose-500 text-white animate-pulse shadow-rose-200 scale-110" 
                  : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
              }`}
              title={isRecording ? "עצור הקלטה" : "התחל להקליט"}
            >
              {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
            
            <textarea
              className="flex-1 max-h-40 min-h-[60px] bg-transparent border-0 px-4 py-4 text-slate-800 dark:text-white text-lg placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none resize-none transition-all leading-relaxed"
              placeholder={isRecording ? "מקשיב לקולך..." : "הקלד הודעה באנגלית או לחץ על המיקרופון..."}
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
              className="p-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200/50 dark:shadow-none transition-all flex-shrink-0 hover:scale-105 active:scale-95 cursor-pointer"
              title="שלח"
            >
              <Send className="w-6 h-6 transform rotate-180 rtl:rotate-0" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
