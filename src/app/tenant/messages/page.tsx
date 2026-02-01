'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Send, Clock, User, MessageCircle, Mic, AudioLines, StopCircle, Paperclip } from 'lucide-react';
import AudioRecorder from '@/components/messaging/AudioRecorder';
import AudioMessageBubble from '@/components/messaging/AudioMessageBubble';
import FileAttachmentBubble from '@/components/messaging/FileAttachmentBubble';

export default function TenantMessagesPage() {
    const { user } = useAuth();
    const [contacts, setContacts] = useState<any[]>([]);
    const [activeContact, setActiveContact] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [showContacts, setShowContacts] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [showRecorder, setShowRecorder] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch Contacts
    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const res = await fetch('/api/contacts');
                const data = await res.json();
                setContacts(data.contacts || []);
                if (data.contacts && data.contacts.length > 0) {
                    setActiveContact(data.contacts[0]); // Auto-select first contact (Landlord)
                }
                // Initial unread counts
                const unreadRes = await fetch('/api/messages/unread');
                const unreadData = await unreadRes.json();
                setUnreadCounts(unreadData.countsBySender || {});
            } finally {
                setLoading(false);
            }
        };
        fetchContacts();
    }, []);

    // Poll Messages
    useEffect(() => {
        if (!activeContact) return;

        const fetchMessages = async () => {
            const res = await fetch(`/api/messages?chatWith=${activeContact.id}`);
            const data = await res.json();
            setMessages(data.messages || []);

            // Refresh unread counts
            const unreadRes = await fetch('/api/messages/unread');
            const unreadData = await unreadRes.json();
            setUnreadCounts(unreadData.countsBySender || {});
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 3000); // Poll every 3s
        return () => clearInterval(interval);
    }, [activeContact]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newMessage.trim() || !activeContact) return;

        try {
            await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    receiverId: activeContact.id,
                    content: newMessage
                })
            });
            setNewMessage('');
            // Optimistic update or wait for poll? Poll is fast enough, but let's re-fetch immediately
            const res = await fetch(`/api/messages?chatWith=${activeContact.id}`);
            const data = await res.json();
            setMessages(data.messages || []);
        } catch (error) {
            console.error('Failed to send message', error);
        }
    };

    const handleSendAudio = async (audioBlob: Blob) => {
        if (!activeContact) return;

        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');

        try {
            // 1. Upload Audio
            const uploadRes = await fetch('/api/upload/audio', {
                method: 'POST',
                body: formData
            });
            const uploadData = await uploadRes.json();

            if (uploadData.success) {
                // 2. Send Message
                await fetch('/api/messages', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        receiverId: activeContact.id,
                        content: '', // Content is optional for audio now, handled in API or we pass "Voice Message"
                        type: 'audio',
                        audioUrl: uploadData.url,
                        duration: uploadData.duration
                    })
                });
                setShowRecorder(false);
                const res = await fetch(`/api/messages?chatWith=${activeContact.id}`);
                const data = await res.json();
                setMessages(data.messages || []);
            }
        } catch (error) {
            console.error('Failed to send audio', error);
        }
    };

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-zinc-400" /></div>;

    if (contacts.length === 0) {
        return (
            <div className="p-12 text-center text-zinc-500">
                <MessageCircle size={48} className="mx-auto mb-4 opacity-20" />
                <p>No contacts available. You are not connected to any properties yet.</p>
            </div>
        );
    }




    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !activeContact) return;

        // Validation for safety (Max 4MB to fit Vercel Serverless limit)
        if (file.size > 4 * 1024 * 1024) {
            alert('File too large (Max 4MB allowed on free tier)');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            // 1. Upload File
            const uploadRes = await fetch('/api/upload/file', {
                method: 'POST',
                body: formData
            });

            if (!uploadRes.ok) {
                const text = await uploadRes.text();
                try {
                    const errorJson = JSON.parse(text);
                    throw new Error(errorJson.error || 'Upload failed');
                } catch {
                    throw new Error(`Upload failed: ${uploadRes.status} ${uploadRes.statusText} (File might be too large)`);
                }
            }

            const uploadData = await uploadRes.json();

            if (uploadData.success) {
                // 2. Send Message with File Attachment
                await fetch('/api/messages', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        receiverId: activeContact.id,
                        content: '', // Optional
                        type: 'file',
                        fileUrl: uploadData.url,
                        fileName: uploadData.name,
                        fileType: uploadData.type,
                        fileSize: uploadData.size
                    })
                });
                const res = await fetch(`/api/messages?chatWith=${activeContact.id}`);
                const data = await res.json();
                setMessages(data.messages || []);
            } else {
                throw new Error(uploadData.error || 'Unknown upload error');
            }
        } catch (error: any) {
            console.error('Failed to upload file', error);
            alert(`Upload Error: ${error.message}`);
        }
    };

    // ... toggleDictation ...
    const toggleDictation = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('Voice dictation is not supported in this browser.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US'; // Could be dynamic based on user prefs
        recognition.interimResults = true;
        recognition.continuous = true;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);

        recognition.onresult = (event: any) => {
            let userScript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                userScript += event.results[i][0].transcript;
            }
            // Append to existing or replace? Usually append if continuous, but for simple input let's just append result to current cursor? 
            // Simplifying: just replace or append to end.
            // Better: use interim results to show preview, but for now let's just append final.
            // Actually, with continuous:true, we get full transcript.
            // Let's keep it simple: Append logic is tricky without cursor tracking.
            // We will just set NewMessage to (prev + ' ' + script) if final?
            // Actually, interim results are good for "live" feel.

            // Let's use a simpler approach: Append only new final results
            if (event.results[event.results.length - 1].isFinal) {
                setNewMessage(prev => prev + (prev ? ' ' : '') + event.results[event.results.length - 1][0].transcript);
            }
        };

        recognitionRef.current = recognition;
        recognition.start();
    };

    return (
        <div className="h-[calc(100vh-2rem)] flex bg-white rounded-2xl overflow-hidden shadow-sm border border-zinc-100 m-2 sm:m-4">
            {/* Sidebar / Contact List */}
            <div className={`${showContacts ? 'flex' : 'hidden md:flex'} w-full md:w-80 bg-zinc-50 border-r border-zinc-100 flex-col`}>
                <div className="p-4 border-b border-zinc-100 font-bold text-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <User size={20} className="text-zinc-400" />
                        Contacts
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {contacts.map(contact => (
                        <div
                            key={contact.id}
                            onClick={() => {
                                setActiveContact(contact);
                                setShowContacts(false);
                            }}
                            className={`p-4 cursor-pointer hover:bg-zinc-100 transition relative ${activeContact?.id === contact.id ? 'bg-white border-l-4 border-black shadow-sm' : ''}`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="font-bold text-zinc-900">{contact.name}</div>
                                {unreadCounts[contact.id] > 0 && (
                                    <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                        {unreadCounts[contact.id]}
                                    </span>
                                )}
                            </div>
                            <div className="text-xs text-zinc-500">{contact.propertyName}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`${!showContacts ? 'flex' : 'hidden md:flex'} flex-1 flex-col h-full overflow-hidden`}>
                {activeContact ? (
                    <>
                        {/* Header */}
                        <div className="p-3 sm:p-4 border-b border-zinc-100 bg-white flex justify-between items-center shadow-sm z-10">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setShowContacts(true)}
                                    className="md:hidden p-2 -ml-2 hover:bg-zinc-100 rounded-full transition"
                                >
                                    <Clock className="rotate-90 text-zinc-400" size={20} />
                                </button>
                                <div>
                                    <h2 className="font-bold text-base sm:text-lg">{activeContact.name}</h2>
                                    <p className="text-[10px] sm:text-xs text-zinc-500 flex items-center gap-1">
                                        <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Online
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Messages List */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-zinc-50/50 space-y-4">
                            {messages.length === 0 && (
                                <div className="text-center text-zinc-400 text-sm mt-12">
                                    Start a conversation with {activeContact.name}
                                </div>
                            )}
                            {messages.map((msg) => {
                                const isMe = msg.senderId === user?.id;
                                return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div
                                            className={`max-w-[85%] sm:max-w-[70%] p-3 rounded-2xl text-sm shadow-sm relative group ${isMe
                                                ? 'bg-zinc-900 text-white rounded-tr-none'
                                                : 'bg-white border border-zinc-200 text-zinc-800 rounded-tl-none'
                                                }`}
                                        >
                                            {msg.type === 'audio' && msg.audioUrl ? (
                                                <AudioMessageBubble src={msg.audioUrl} duration={msg.duration} />
                                            ) : msg.type === 'file' && msg.fileUrl ? (
                                                <FileAttachmentBubble
                                                    url={msg.fileUrl}
                                                    name={msg.fileName || 'Attachment'}
                                                    type={msg.fileType || ''}
                                                    size={msg.fileSize}
                                                />
                                            ) : (
                                                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                            )}
                                            <div className={`text-[10px] mt-1 flex items-center justify-end gap-1 opacity-70 ${isMe ? 'text-zinc-300' : 'text-zinc-400'}`}>
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                {isMe && <span>{msg.isRead ? '✓✓' : '✓'}</span>}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-1 px-2 sm:p-2 bg-white border-t border-zinc-100">
                            {showRecorder ? (
                                <div className="max-w-4xl mx-auto py-2">
                                    <AudioRecorder
                                        onCancel={() => setShowRecorder(false)}
                                        onSend={handleSendAudio}
                                    />
                                </div>
                            ) : (
                                <form onSubmit={handleSendMessage} className="flex items-end gap-2 max-w-4xl mx-auto pb-2">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        onChange={handleFileUpload}
                                    />

                                    {/* Attach File */}
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="mb-1 p-2 text-zinc-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-full transition"
                                        title="Attach File"
                                    >
                                        <Paperclip size={20} />
                                    </button>

                                    {/* Voice Note Toggle */}
                                    <button
                                        type="button"
                                        onClick={() => setShowRecorder(true)}
                                        className="mb-1 p-2 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition"
                                        title="Record Voice Note"
                                    >
                                        <AudioLines size={20} />
                                    </button>

                                    {/* Text Input */}
                                    <div className="flex-1 relative">
                                        <textarea
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder={isListening ? "Listening..." : "Type a message..."}
                                            className={`w-full p-2 pr-10 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none min-h-[40px] max-h-32 text-xs sm:text-sm outline-none transition-all ${isListening ? 'ring-2 ring-emerald-500 bg-emerald-50' : ''}`}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendMessage();
                                                }
                                            }}
                                        />

                                        {/* Dictation Toggle */}
                                        <button
                                            type="button"
                                            onClick={toggleDictation}
                                            className={`absolute right-2 bottom-2 p-1.5 rounded-full transition-all ${isListening ? 'bg-emerald-500 text-white animate-pulse' : 'text-zinc-400 hover:text-zinc-600'}`}
                                            title="Voice to Text"
                                        >
                                            {isListening ? <Mic size={16} /> : <Mic size={18} />}
                                        </button>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim()}
                                        className="mb-1 w-9 h-9 flex items-center justify-center bg-zinc-900 text-white rounded-lg hover:bg-black transition disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                                    >
                                        <Send size={16} />
                                    </button>
                                </form>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-zinc-400">
                        Select a contact to start chatting
                    </div>
                )}
            </div>
        </div>
    );
}
