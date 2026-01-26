'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Trash2, Send, Play, Pause, Loader2 } from 'lucide-react';

interface AudioRecorderProps {
    onSend: (audioBlob: Blob) => void;
    onCancel: () => void;
}

export default function AudioRecorder({ onSend, onCancel }: AudioRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                if (audioRef.current) {
                    audioRef.current.src = URL.createObjectURL(blob);
                }
                stream.getTracks().forEach(track => track.stop()); // Stop mic access
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);

            // Timer
            setRecordingTime(0);
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (err) {
            console.error('Error accessing microphone:', err);
            alert('Cannot access microphone. Please allow permissions.');
            onCancel();
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const handleSend = () => {
        if (audioBlob) {
            onSend(audioBlob);
        }
    };

    const handlePlayPause = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    useEffect(() => {
        // Cleanup
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Format time MM:SS
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.onended = () => setIsPlaying(false);
        }
    }, [audioBlob]);


    // Initial Auto-Start
    useEffect(() => {
        startRecording();
    }, []);

    return (
        <div className="flex items-center gap-3 w-full bg-zinc-50 p-2 rounded-xl border border-zinc-200 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Visualizer / Status */}
            <div className="flex-1 flex items-center gap-3 pl-2">
                {isRecording ? (
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                        </span>
                        <span className="text-zinc-900 font-mono font-bold text-sm min-w-[40px]">{formatTime(recordingTime)}</span>
                        <div className="flex gap-1 h-4 items-end">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="w-1 bg-rose-500 rounded-full animate-pulse" style={{ height: `${30 + ((i * 17) % 50)}%`, animationDuration: '0.4s' }}></div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 w-full">
                        <button onClick={handlePlayPause} className="h-8 w-8 bg-zinc-200 rounded-full flex items-center justify-center hover:bg-zinc-300">
                            {isPlaying ? <Pause size={14} className="fill-zinc-700" /> : <Play size={14} className="fill-zinc-700 ml-0.5" />}
                        </button>
                        <div className="flex-1 h-1 bg-zinc-200 rounded-full overflow-hidden">
                            <div className="h-full bg-zinc-500 w-1/2"></div> {/* Mock progress */}
                        </div>
                        <audio ref={audioRef} className="hidden" />
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1">
                <button onClick={onCancel} className="p-2 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition">
                    <Trash2 size={18} />
                </button>

                {isRecording ? (
                    <button onClick={stopRecording} className="p-2 bg-rose-50 text-rose-600 rounded-full hover:bg-rose-100 transition">
                        <Square size={18} fill="currentColor" />
                    </button>
                ) : (
                    <button onClick={handleSend} className="p-2 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition shadow-sm">
                        <Send size={18} />
                    </button>
                )}
            </div>
        </div>
    );
}
