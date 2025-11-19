import React, { useState, useEffect, useRef, useCallback, createContext } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { encode, decode, decodeAudioData } from '../utils/audio';
import type { GameState, PlayerColor } from '../types';
import { PLAYER_CONFIG } from '../constants';

// --- Type Guard ---
const isAudioContext = (value: any): value is AudioContext => {
    return value && typeof value.close === 'function' && typeof value.state !== 'undefined';
};

// --- Context Definition ---
type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';
interface AudioContextType {
    status: ConnectionStatus;
    isListening: boolean;
    toggleListen: () => void;
}
export const AudioContext = createContext<AudioContextType | null>(null);

// --- Icons ---
const MinimizeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>;
const AssistantIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-100" viewBox="0 0 20 20" fill="currentColor"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>;
const SparklesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-300" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0V6H3a1 1 0 110-2h1V3a1 1 0 011-1zm5 4a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0V9H9a1 1 0 110-2h1V6a1 1 0 011-1zm5-4a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0V4h-1a1 1 0 110-2h1V2a1 1 0 011-1z" clipRule="evenodd" /></svg>;

type Transcript = { author: PlayerColor | 'model'; text: string };

const createBlob = (data: Float32Array): Blob => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
    }
    return {
        data: encode(new Uint8Array(int16.buffer)),
        mimeType: 'audio/pcm;rate=16000',
    };
};

interface AudioResources {
    stream: MediaStream | null;
    inputCtx: AudioContext | null;
    outputCtx: AudioContext | null;
    processor: ScriptProcessorNode | null;
    source: MediaStreamAudioSourceNode | null;
}

export const AudioProvider: React.FC<{ gameState: GameState; children: React.ReactNode; isAssistantVisible: boolean; }> = ({ gameState, children, isAssistantVisible }) => {
    const [status, setStatus] = useState<ConnectionStatus>('disconnected');
    const [isListening, setIsListening] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false); // Default to open, user can minimize
    const [transcripts, setTranscripts] = useState<Transcript[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    
    const sessionRef = useRef<{ close: () => void; sendRealtimeInput: (input: { media: Blob; }) => void; } | null>(null);
    const resourcesRef = useRef<AudioResources>({ stream: null, inputCtx: null, outputCtx: null, processor: null, source: null });
    
    const nextStartTimeRef = useRef<number>(0);
    const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const currentInputRef = useRef('');
    const currentOutputRef = useRef('');
    const transcriptEndRef = useRef<HTMLDivElement>(null);

    const currentPlayerRef = useRef(gameState.currentPlayer);
    useEffect(() => {
        currentPlayerRef.current = gameState.currentPlayer;
    }, [gameState.currentPlayer]);

    // Auto-scroll
    useEffect(() => {
        if (!isMinimized && isAssistantVisible) {
            transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [transcripts, isMinimized, isAssistantVisible]);

    const cleanupResources = useCallback(() => {
        Object.values(resourcesRef.current).forEach(resource => {
            if (resource instanceof MediaStream) {
                resource.getTracks().forEach(track => track.stop());
            } else if (isAudioContext(resource) && resource.state !== 'closed') {
                resource.close().catch(console.error);
            } else if (resource) {
                (resource as any).disconnect?.();
            }
        });
        resourcesRef.current = { stream: null, inputCtx: null, outputCtx: null, processor: null, source: null };
    }, []);

    const stopListening = useCallback(() => {
        if (sessionRef.current) {
            sessionRef.current.close();
            sessionRef.current = null;
        }
        cleanupResources();
        setIsListening(false);
        if (status !== 'error') {
            setStatus('disconnected');
        }
    }, [cleanupResources, status]);

    const handleConnectionError = (error: any) => {
        console.error("Game Assistant connection failed:", error);
        let message = "Connection error. Try again.";
        if (error?.name === 'NotAllowedError' || error?.name === 'PermissionDeniedError') {
            message = "Microphone access denied. Check browser settings.";
        } else if (error?.message) {
            message = error.message;
        }

        setErrorMessage(message);
        setTranscripts(prev => [...prev, { author: 'model', text: `⚠️ ${message}` }]);
        setStatus('error');
        cleanupResources();
        setIsListening(false);
        if (sessionRef.current) {
            sessionRef.current.close();
            sessionRef.current = null;
        }
    };

    const toggleListen = useCallback(async () => {
        if (isListening || status === 'connecting') {
            stopListening();
            return;
        }
        
        // Ensure we show the chat when starting interaction
        setIsMinimized(false);
        setStatus('connecting');
        setErrorMessage(null);
    
        try {
            let apiKey = '';
            try {
                apiKey = process.env.API_KEY || '';
            } catch (e) {
                console.error("Environment access error:", e);
            }
            
            if (!apiKey) throw new Error("API Key configuration missing.");
            if (!navigator.mediaDevices?.getUserMedia) throw new Error('Microphone not supported in this browser.');
            
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContextClass) throw new Error('Web Audio API not supported.');

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Create contexts after permission granted
            const outputCtx = new AudioContextClass({ sampleRate: 24000 });
            const inputCtx = new AudioContextClass({ sampleRate: 16000 });
            
            await Promise.all([outputCtx.resume(), inputCtx.resume()]);
            
            const ai = new GoogleGenAI({ apiKey });
            const session = await ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        try {
                            const source = inputCtx.createMediaStreamSource(stream);
                            const processor = inputCtx.createScriptProcessor(4096, 1, 1);
                            
                            processor.onaudioprocess = (event) => {
                                const inputData = event.inputBuffer.getChannelData(0);
                                sessionRef.current?.sendRealtimeInput({ media: createBlob(inputData) });
                            };

                            source.connect(processor);
                            processor.connect(inputCtx.destination);
                            
                            resourcesRef.current = { stream, inputCtx, outputCtx, processor, source };
                            setStatus('connected');
                            setIsListening(true);
                            // Add greeting or instructions if empty
                            setTranscripts(prev => prev.length === 0 ? [{author: 'model', text: "Hi! I'm your Game Assistant. Tap your mic to chat!"}] : prev);
                        } catch(e) {
                            handleConnectionError(e);
                        }
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.serverContent?.outputTranscription) currentOutputRef.current += message.serverContent.outputTranscription.text;
                        if (message.serverContent?.inputTranscription) currentInputRef.current += message.serverContent.inputTranscription.text;

                        if (message.serverContent?.turnComplete) {
                            const fullInput = currentInputRef.current.trim();
                            const fullOutput = currentOutputRef.current.trim();
                            if (fullInput || fullOutput) {
                                setTranscripts(prev => {
                                    const newEntries: Transcript[] = [];
                                    if (fullInput) newEntries.push({ author: currentPlayerRef.current, text: fullInput });
                                    if (fullOutput) newEntries.push({ author: 'model', text: fullOutput });
                                    return [...prev, ...newEntries];
                                });
                            }
                            currentInputRef.current = '';
                            currentOutputRef.current = '';
                        }

                        const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                        if (audioData && resourcesRef.current.outputCtx?.state !== 'closed') {
                            try {
                                const audioBuffer = await decodeAudioData(decode(audioData), resourcesRef.current.outputCtx, 24000, 1);
                                if (audioBuffer) {
                                    const outCtx = resourcesRef.current.outputCtx;
                                    nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtx.currentTime);
                                    const sourceNode = outCtx.createBufferSource();
                                    sourceNode.buffer = audioBuffer;
                                    sourceNode.connect(outCtx.destination);
                                    sourceNode.addEventListener('ended', () => audioSourcesRef.current.delete(sourceNode));
                                    sourceNode.start(nextStartTimeRef.current);
                                    nextStartTimeRef.current += audioBuffer.duration;
                                    audioSourcesRef.current.add(sourceNode);
                                }
                            } catch(err) { console.error("Audio play error:", err); }
                        }
                    },
                    onerror: (e) => handleConnectionError(e),
                    onclose: () => stopListening(),
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    outputAudioTranscription: {},
                    inputAudioTranscription: {},
                    systemInstruction: `You are a witty, cheerful, and helpful Ludo game commentator. Keep responses short (under 2 sentences). Cheer for the player '${gameState.players[gameState.currentPlayer].name}'.`,
                },
            });
            sessionRef.current = session;
    
        } catch (err) {
            handleConnectionError(err);
        }
    }, [isListening, status, stopListening, gameState]);
    
    useEffect(() => () => stopListening(), [stopListening]);

    const getStatusColor = () => {
        switch (status) {
            case 'connected': return 'bg-green-500 shadow-[0_0_10px_#22c55e]';
            case 'connecting': return 'bg-yellow-500 animate-pulse shadow-[0_0_10px_#eab308]';
            case 'error': return 'bg-red-500 shadow-[0_0_10px_#ef4444]';
            default: return 'bg-gray-400';
        }
    };

    return (
        <AudioContext.Provider value={{ status, isListening, toggleListen }}>
            {children}
            {isAssistantVisible && (
                 <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-2">
                    
                    {/* Minimized State: Floating Avatar */}
                    {isMinimized ? (
                        <button 
                            onClick={() => setIsMinimized(false)}
                            className="group relative w-14 h-14 rounded-full bg-gradient-to-br from-amber-700 to-gray-900 border-2 border-amber-500/50 shadow-2xl flex items-center justify-center transition-transform hover:scale-110 animate-float"
                        >
                             <div className={`absolute top-0 right-0 w-3 h-3 rounded-full border-2 border-gray-900 ${getStatusColor()}`}></div>
                             <AssistantIcon />
                             <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                Open Chat
                             </div>
                        </button>
                    ) : (
                        /* Expanded State: Glass Panel */
                        <div className="w-[320px] max-w-[90vw] flex flex-col bg-black/60 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-scale-in origin-bottom-left">
                            
                            {/* Header */}
                            <div className="flex justify-between items-center px-4 py-3 bg-gradient-to-r from-amber-900/40 to-transparent border-b border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                         <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor()}`}></div>
                                    </div>
                                    <div className="flex flex-col">
                                        <h3 className="font-bold text-sm text-amber-50 flex items-center gap-1">
                                            Game Assistant <SparklesIcon />
                                        </h3>
                                        <span className="text-[10px] text-amber-200/60 font-medium tracking-wide uppercase">
                                            {status === 'connected' ? 'Online' : status === 'connecting' ? 'Connecting...' : 'Offline'}
                                        </span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setIsMinimized(true)}
                                    className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                                    title="Minimize"
                                >
                                    <MinimizeIcon />
                                </button>
                            </div>
                            
                            {/* Transcript / Content Area */}
                            <div className="h-[250px] overflow-y-auto p-4 space-y-3 custom-scrollbar bg-gradient-to-b from-transparent to-black/20">
                                {transcripts.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center text-white/40 space-y-2 opacity-70">
                                        <AssistantIcon />
                                        <p className="text-xs max-w-[180px]">
                                            Tap the microphone on your player card when it's your turn to start chatting!
                                        </p>
                                    </div>
                                ) : (
                                    transcripts.map((t, i) => {
                                        const isModel = t.author === 'model';
                                        const playerConfig = !isModel ? PLAYER_CONFIG[t.author as PlayerColor] : null;
                                        return (
                                            <div key={i} className={`flex w-full ${isModel ? 'justify-start' : 'justify-end'} animate-scale-in`}>
                                                <div 
                                                    className={`max-w-[85%] px-3.5 py-2 text-xs sm:text-sm shadow-md leading-relaxed
                                                    ${isModel 
                                                        ? 'bg-gray-800/90 text-gray-100 rounded-2xl rounded-tl-none border border-gray-700/50' 
                                                        : 'text-white rounded-2xl rounded-tr-none border border-white/10'}`}
                                                    style={!isModel ? { backgroundColor: playerConfig?.primary } : undefined}
                                                >
                                                    {t.text}
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                                <div ref={transcriptEndRef} />
                            </div>

                             {/* Footer / Error Area */}
                            {status === 'error' && (
                                <div className="bg-red-900/80 backdrop-blur-sm p-2 text-center border-t border-red-700/50">
                                    <p className="text-xs text-red-100 font-medium flex items-center justify-center gap-1">
                                        <span className="text-lg">!</span> {errorMessage || 'Connection failed'}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </AudioContext.Provider>
    );
};