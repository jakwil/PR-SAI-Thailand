import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Volume2,
  VolumeX,
  Sparkles,
  Bot,
  User,
  Loader2,
  Minimize2,
  RotateCcw,
  ExternalLink
} from 'lucide-react';
import { ChatMessage } from '../types';

interface AIChatbotWidgetProps {
  isOpen: boolean;
  onToggle: () => void;
  externalPrompt?: string | null;
  onClearExternalPrompt?: () => void;
}

export const AIChatbotWidget: React.FC<AIChatbotWidgetProps> = ({
  isOpen,
  onToggle,
  externalPrompt,
  onClearExternalPrompt,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'สวัสดีครับ/ค่ะ ยินดีต้อนรับสู่ PR - SAI Thailand! ผม/ดิฉันคือผู้ช่วย AI ประชาสัมพันธ์องค์กร พร้อมให้ข้อมูลภารกิจการตรวจเงินแผ่นดิน สื่อประชาสัมพันธ์ และรายงานข้อเท็จจริงสถานการณ์อาคาร สตง. ทรุดตัว สอบถามเรื่องใดได้เลยครับ/ค่ะ',
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const quickPrompts = [
    'รายงานสถานการณ์อาคาร สตง. ทรุดตัว',
    'ขอรับการสนับสนุนสื่อประชาสัมพันธ์อย่างไร?',
    'ภารกิจหลักของ สตง. มีอะไรบ้าง?',
    'ช่องทางแจ้งเบาะแสเงินแผ่นดิน',
  ];

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Handle external prompt passed from other sections
  useEffect(() => {
    if (externalPrompt) {
      if (!isOpen) onToggle();
      handleSendMessage(externalPrompt);
      if (onClearExternalPrompt) onClearExternalPrompt();
    }
  }, [externalPrompt]);

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSendMessage = async (userText: string) => {
    const text = userText.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();
      const botReply =
        data.reply ||
        'ขออภัยครับ/ค่ะ ไม่สามารถเชื่อมต่อระบบประมวลผลข้อมูลได้ในขณะนี้ กรุณาสอบถามข้อมูลทางสายด่วน สตง. 1730 ครับ';

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        text: botReply,
        timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Chat error', err);
      const fallbackMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        text: 'ขออภัยครับ/ค่ะ ระบบ AI กำลังปรับปรุงคลังข้อมูลชั่วคราว ท่านสามารถติดตามข่าวสารได้จากหน้าเว็บไซต์ หรือติดต่อสายด่วน 1730 ครับ/ค่ะ',
        timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Play realistic Thai speech (Gemini TTS with Web Speech API fallback)
  const handlePlayVoice = async (msgId: string, text: string) => {
    // If already playing this message, stop
    if (speakingMessageId === msgId) {
      if (audioRef.current) audioRef.current.pause();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setSpeakingMessageId(null);
      return;
    }

    // Stop existing audio
    if (audioRef.current) audioRef.current.pause();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    setSpeakingMessageId(msgId);

    try {
      // 1. Try Gemini TTS backend
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (res.ok) {
        const { audio } = await res.json();
        if (audio) {
          const audioUrl = `data:audio/wav;base64,${audio}`;
          const sound = new Audio(audioUrl);
          audioRef.current = sound;
          sound.onended = () => setSpeakingMessageId(null);
          sound.onerror = () => fallbackWebSpeech(text, msgId);
          await sound.play();
          return;
        }
      }
      // If TTS endpoint fails, use Web Speech API fallback
      fallbackWebSpeech(text, msgId);
    } catch {
      fallbackWebSpeech(text, msgId);
    }
  };

  const fallbackWebSpeech = (text: string, msgId: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setSpeakingMessageId(null);
      return;
    }

    const clean = text.replace(/[*#_`]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = 'th-TH';
    utterance.rate = 1.0;
    utterance.pitch = 1.05;

    // Pick a natural Thai voice if available
    const voices = window.speechSynthesis.getVoices();
    const thaiVoice = voices.find((v) => v.lang.includes('th') || v.lang.includes('TH'));
    if (thaiVoice) {
      utterance.voice = thaiVoice;
    }

    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <>
      {/* Floating Circular Trigger - Always Fixed at Bottom-Right on ALL devices and pages */}
      {!isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[60] flex items-center gap-2 select-none pointer-events-auto">
          {/* Subtle Label Chip on Desktop / Tablet for Maximum Clarity */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#040e28]/95 border border-cyan-400/50 shadow-lg shadow-cyan-500/20 text-cyan-300 text-xs font-medium backdrop-blur-md animate-fadeIn">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-spin" style={{ animationDuration: '4s' }} />
            <span>AI สตง. พร้อมตอบ</span>
          </div>

          <button
            onClick={onToggle}
            className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-cyan-400 via-sky-400 to-blue-600 text-slate-950 flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.6)] hover:shadow-[0_0_35px_rgba(6,182,212,0.85)] hover:scale-105 active:scale-95 transition-all group focus:outline-none focus:ring-2 focus:ring-cyan-300"
            title="คุยกับผู้ช่วย AI ประชาสัมพันธ์องค์กร (พร้อมตอบทุกคำถาม 24 ชม.)"
            aria-label="เปิดแชทผู้ช่วย AI ประชาสัมพันธ์ สตง."
          >
            {/* Pulsing Cyber Ambient Glow Ring */}
            <span className="absolute -inset-1 rounded-full bg-cyan-400/40 animate-ping opacity-60 pointer-events-none" />
            
            {/* Live Online Dot */}
            <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-950 shadow-sm shadow-emerald-400/80 z-10" />

            {/* Icon */}
            <div className="relative z-10 flex items-center justify-center">
              <Bot className="w-6 h-6 sm:w-7 sm:h-7 text-slate-950 transition-transform group-hover:scale-110" />
            </div>
          </button>
        </div>
      )}

      {/* Floating Chat Window - Anchored firmly at Bottom-Right */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[60] w-[calc(100vw-2rem)] sm:w-96 max-w-[400px] max-h-[82vh] h-[520px] bg-[#061438]/98 backdrop-blur-2xl border-2 border-cyan-400/50 rounded-2xl shadow-[0_16px_50px_rgba(0,0,0,0.85),0_0_35px_rgba(6,182,212,0.35)] flex flex-col overflow-hidden animate-fadeIn">
          {/* Chat Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#040e28] border-b border-cyan-500/30">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 via-sky-400 to-blue-600 flex items-center justify-center text-slate-950 shadow-md">
                <Bot className="w-4.5 h-4.5" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#040e28]" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>ผู้ช่วย AI ประชาสัมพันธ์</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono">LIVE</span>
                </h3>
                <p className="text-[10px] text-cyan-400/80">PR - SAI Thailand AI Chatbot</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  setMessages([
                    {
                      id: 'welcome',
                      role: 'assistant',
                      text: 'สวัสดีครับ/ค่ะ มีข้อมูลส่วนใดของ PR - SAI Thailand หรือสถานการณ์อาคาร สตง. ที่ต้องการสอบถามไหมครับ/ค่ะ?',
                      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
                    },
                  ])
                }
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                title="ล้างการสนทนา"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onToggle}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                title="ย่อหน้าต่าง"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-3 py-2 bg-slate-900/60 border-b border-slate-800/80 overflow-x-auto flex items-center gap-1.5 scrollbar-none">
            {quickPrompts.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                className="px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-700/60 text-[10px] whitespace-nowrap shrink-0 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-left">
            {messages.map((msg) => {
              const isAssistant = msg.role === 'assistant';
              const isSpeaking = speakingMessageId === msg.id;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                      isAssistant
                        ? 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-tl-sm'
                        : 'bg-amber-500 text-slate-950 font-medium rounded-tr-sm shadow-md shadow-amber-500/10'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>

                  {/* Message Meta & Audio Speaker */}
                  <div className="flex items-center gap-2 mt-1 px-1 text-[10px] text-slate-400">
                    <span>{msg.timestamp}</span>
                    {isAssistant && (
                      <button
                        onClick={() => handlePlayVoice(msg.id, msg.text)}
                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-slate-800 transition-colors ${
                          isSpeaking ? 'text-amber-400 font-semibold' : 'text-slate-400'
                        }`}
                        title={isSpeaking ? 'หยุดเสียง' : 'ฟังเสียงบรรยายไทยสมจริง'}
                      >
                        {isSpeaking ? (
                          <>
                            <VolumeX className="w-3 h-3 text-amber-400" />
                            <span className="text-[9px]">กำลังพูด...</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3" />
                            <span className="text-[9px]">ฟังเสียง</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 w-fit">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                <span>ผู้ช่วย AI กำลังค้นหาข้อมูลจากคลังความรู้...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText);
            }}
            className="p-3 bg-[#0a0d18] border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="พิมพ์คำถามถึง PR - SAI Thailand..."
              className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 transition-all shrink-0"
              title="ส่งข้อความ"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
