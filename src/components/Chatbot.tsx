'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles, Loader2, Info } from 'lucide-react';

interface Message {
    id: string;
    text: string;
    sender: 'bot' | 'user';
    timestamp: Date;
}

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "Hi there! I'm your Rental Guru. How can I help you today?",
            sender: 'bot',
            timestamp: new Date()
        }
    ]);
    const [isThinking, setIsThinking] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    const getGuruResponse = (query: string): string => {
        const q = query.toLowerCase();

        if (q.includes('trust score') || q.includes('score')) {
            return "Your Trust Score is calculated based on timely rent payments, proper notice periods, and landlord feedback. Keep your score high (above 80) to unlock premium listings and lower deposits!";
        }
        if (q.includes('pay') || q.includes('bill') || q.includes('rent')) {
            return "You can pay your bills directly from the 'My Bills' section on this dashboard. We support card payments and UPI. Once paid, the status updates instantly to PAID.";
        }
        if (q.includes('report') || q.includes('download')) {
            return "You can download your comprehensive 'Rental Identity Report' by clicking the 'Download Report' button. It includes your summary, stay history, and trust score.";
        }
        if (q.includes('verify') || q.includes('aadhaar') || q.includes('id proof')) {
            return "Verification is mandatory for all tenants. It involves uploading your ID and paying a small processing fee. This helps landlords trust you and keeps the community safe.";
        }
        if (q.includes('history') || q.includes('diary')) {
            return "The 'Rental Diary' tracks every major event of your stay, like joining, leaving, and payments. It's the record used to calculate your Trust Score!";
        }
        if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
            return "Hello! I'm here to help you navigate your tenant portal. Ask me anything about payments, scores, or reports.";
        }

        return "That's a great question! I'm specialized in Rental Platform guidance. I can explain Trust Scores, Billing, Verification flows, and Reporting. Could you rephrase or ask about one of those?";
    };

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isThinking) return;

        const userMsg: Message = {
            id: Math.random().toString(36),
            text: input,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsThinking(true);

        // Simulate thinking
        setTimeout(() => {
            const botMsg: Message = {
                id: Math.random().toString(36),
                text: getGuruResponse(userMsg.text),
                sender: 'bot',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botMsg]);
            setIsThinking(false);
        }, 1000);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 chatbot-container print:hidden">
            {/* Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="h-14 w-14 rounded-full bg-blue-600 text-white shadow-2xl shadow-blue-500/40 flex items-center justify-center hover:bg-slate-900 transition-all active:scale-95 group"
                >
                    <MessageSquare className="group-hover:hidden" size={24} />
                    <Sparkles className="hidden group-hover:block animate-pulse" size={24} />
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="w-96 max-h-[600px] h-[600px] bg-white rounded-3xl shadow-2xl border border-zinc-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-500 ease-out">
                    {/* Header */}
                    <div className="p-4 bg-zinc-900 text-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-500 to-emerald-400 flex items-center justify-center">
                                <Bot size={20} />
                            </div>
                            <div>
                                <div className="font-bold text-sm">Rental Guru</div>
                                <div className="text-[10px] text-zinc-400 font-medium uppercase tracking-widest flex items-center gap-1">
                                    <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full"></span> Online
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="h-8 w-8 rounded-full hover:bg-white/10 flex items-center justify-center transition">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50/50 custom-scrollbar">
                        {messages.map(m => (
                            <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-medium shadow-sm ${m.sender === 'user'
                                    ? 'bg-slate-900 text-white rounded-tr-none'
                                    : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none'
                                    }`}>
                                    {m.text}
                                </div>
                            </div>
                        ))}
                        {isThinking && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-zinc-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                                    <Loader2 className="animate-spin text-zinc-400" size={16} />
                                    <span className="text-xs text-zinc-400 font-bold uppercase">Guru is thinking...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Tips */}
                    <div className="px-4 py-2 bg-white border-t border-zinc-50 flex gap-2 overflow-x-auto no-scrollbar">
                        {['Trust Score', 'Bills', 'Identity Report'].map(tip => (
                            <button
                                key={tip}
                                onClick={() => { setInput(tip); handleSend(); }}
                                className="whitespace-nowrap px-3 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 rounded-full text-[10px] font-bold text-slate-500 transition"
                            >
                                {tip}
                            </button>
                        ))}
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSend} className="p-4 bg-white border-t border-zinc-100 flex items-center gap-2">
                        <input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="Ask me anything..."
                            className="flex-1 bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 p-3 rounded-xl text-sm font-medium outline-none transition"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isThinking}
                            className="h-10 w-10 bg-zinc-900 text-white rounded-xl flex items-center justify-center hover:bg-black transition disabled:opacity-50"
                        >
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
