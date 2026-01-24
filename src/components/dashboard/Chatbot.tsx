'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, User, Bot, Sparkles } from 'lucide-react';
import { nanoid } from 'nanoid';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "Hello! I'm your PropAccura Assistant. How can I help you today?",
            sender: 'bot',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    const handleSendAction = (queryText: string) => {
        const userMsg: Message = {
            id: nanoid(),
            text: queryText,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);

        // Mock Bot Logic
        setTimeout(() => {
            let botResponse = "I'm not sure about that. For account specific issues, please contact our support team. I cannot share private details of landlords or other tenants.";
            const text = queryText.toLowerCase();

            // Registration & Process
            if (text.includes('hi') || text.includes('hello')) {
                botResponse = "Hello! I'm the PropAccura Assistant. I can help you with registration, verification status, or navigating your dashboard.";
            } else if (text.includes('register') || text.includes('how to start') || text.includes('apply')) {
                botResponse = "To complete your registration, please follow these steps:\n\n1. **Fill Verification Form**: Enter your legal details and ID proof.\n2. **Pay Fee**: A one-time processing fee of ₹199 is required.\n3. **Landlord Review**: Your landlord will receive your request and can Approve or Reject it.\n4. **Get Access**: Once approved, your full stay history and utility bills will be unlocked.";
            } else if (text.includes('document') || text.includes('id proof') || text.includes('aadhaar')) {
                botResponse = "For the registration process, we accept:\n- **Aadhaar Card** (Recommended)\n- **Passport**\n- **Driving License**\n\nPlease ensure the ID number you enter matches exactly as per your physical document.";
            } else if (text.includes('fee') || (text.includes('pay') && !text.includes('rent')) || text.includes('cost')) {
                botResponse = "The registration & verification fee is **₹199** (one-time). This covers:\n- Lifetime background check history\n- Digital bill management\n- Professional tenant profile\n\nPayments are processed securely via our portal.";
            } else if (text.includes('time') || text.includes('how long')) {
                botResponse = "The process is usually very fast. Once you submit and pay:\n- Landlords are notified instantly.\n- Most landlords respond within 24 hours.\n- You can see the status update in real-time on your dashboard.";
            }

            // Status & Navigation
            else if (text.includes('status') || text.includes('pending') || text.includes('approve')) {
                botResponse = "You can find your status right at the top of your dashboard. \n\n- **Pending**: Waiting for landlord's confirmation.\n- **Approved**: You have full access.\n- **Rejected**: Check the 'Reason' provided and you can Re-apply anytime.";
            } else if (text.includes('bill') || text.includes('light')) {
                botResponse = "Utility bills are listed under 'Utility Bills' section. \n\nNote: This section only populates after your landlord uploads your monthly light bill record.";
            } else if (text.includes('history')) {
                botResponse = "Your 'Stay History' is a digital timeline of your records. It starts the moment you are 'Approved' and continues throughout your stay.";
            }

            // Privacy & Landlord Info (Guards)
            else if (text.includes('landlord') && (text.includes('phone') || text.includes('number') || text.includes('email') || text.includes('contact') || text.includes('address'))) {
                botResponse = "🛡️ **Privacy Notice**: I cannot share the landlord's personal contact details directly in chat. \n\nHowever, once your request is Approved, you can find your landlord's name in your profile summary.";
            } else if (text.includes('where') && text.includes('landlord')) {
                botResponse = "Your landlord is the owner of the property you are applying for. Their office address is not listed for privacy reasons.";
            } else if (text.includes('other tenant')) {
                botResponse = "Data isolation protocol: I only share information strictly related to your own account.";
            } else if (text.includes('rent') && (text.includes('amount') || text.includes('pay'))) {
                botResponse = "Rent payment is currently handled directly with your landlord. You can see your 'Rent Notes' in your profile for any specific instructions they left for you.";
            }

            const botMsg: Message = {
                id: nanoid(),
                text: botResponse,
                sender: 'bot',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botMsg]);
        }, 800);
    };

    const handleSend = () => {
        if (!input.trim()) return;
        handleSendAction(input);
        setInput('');
    };

    return (
        <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-80 sm:w-96 h-[500px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
                    {/* Header */}
                    <div className="p-4 bg-blue-600 text-white flex justify-between items-center shadow-md">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center">
                                <Sparkles size={18} />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">PropAccura Assistant</h3>
                                <p className="text-[10px] opacity-80">AI Support • Online</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-lg transition">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50 dark:bg-zinc-950/30">
                        {messages.map(msg => (
                            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex gap-2 max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`h-8 w-8 rounded-full flex flex-shrink-0 items-center justify-center text-white
                                        ${msg.sender === 'user' ? 'bg-slate-900' : 'bg-blue-600'}`}>
                                        {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
                                    </div>
                                    <div>
                                        <div className={`p-3 rounded-2xl text-sm shadow-sm
                                            ${msg.sender === 'user'
                                                ? 'bg-slate-900 text-white rounded-tr-none'
                                                : 'bg-white text-slate-900 rounded-tl-none border border-slate-100'}`}>
                                            <div className="whitespace-pre-line">{msg.text}</div>
                                        </div>
                                        <p className="text-[10px] text-zinc-500 mt-1 px-1">
                                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Quick Actions for Bot */}
                        {messages[messages.length - 1].sender === 'bot' && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {[
                                    { label: 'Register Steps', query: 'how to register' },
                                    { label: 'Check Status', query: 'check my status' },
                                    { label: 'Fee Info', query: 'how much is the fee' },
                                    { label: 'ID Documents', query: 'which documents' }
                                ].map((btn, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            setInput(btn.query);
                                            // Trigger send automatically
                                            handleSendAction(btn.query);
                                        }}
                                        className="text-[11px] bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 rounded-full hover:border-blue-500 hover:text-blue-600 transition shadow-sm"
                                    >
                                        {btn.label}
                                    </button>
                                ))}
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800">
                        <div className="relative">
                            <input
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSend()}
                                placeholder="Type a message..."
                                className="w-full bg-slate-50 border-none rounded-xl py-3 pl-4 pr-12 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <button
                                onClick={handleSend}
                                className="absolute right-2 top-1.5 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Float Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`h-14 w-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 text-white
                    ${isOpen ? 'bg-slate-900' : 'bg-blue-600'}`}
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={28} />}
            </button>
        </div>
    );
}
