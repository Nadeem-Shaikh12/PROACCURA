'use client';
import { Play, Pause } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function AudioMessageBubble({ src, duration }: { src: string, duration?: number }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.onended = () => setIsPlaying(false);
        }
    }, [src]);

    return (
        <div className="flex items-center gap-3 min-w-[200px]">
            <button
                onClick={togglePlay}
                className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${isPlaying ? 'bg-zinc-900 text-white' : 'bg-zinc-200 text-zinc-900'}`}
            >
                {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
            </button>
            <div className="flex-1">
                <div className="h-4 w-full flex items-center gap-0.5">
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className={`w-1 rounded-full ${i < 10 ? 'bg-zinc-800' : 'bg-zinc-300'}`}
                            style={{ height: `${20 + ((i * 13) % 60)}%` }}
                        ></div>
                    ))}
                </div>
                {/* Optional: Add timer if real duration is available */}
            </div>
            <audio ref={audioRef} src={src} className="hidden" />
        </div>
    );
}
