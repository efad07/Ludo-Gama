
import React, { useState, useEffect, useRef } from 'react';
import Board from './components/Board';
import Settings from './components/Settings';
import Rules from './components/Rules';
import { useGameLogic } from './hooks/useGameLogic';
import type { GameSettings, PlayerColor } from './types';
import PlayerInfo from './components/PlayerInfo';
import { PLAYER_CONFIG, SOUNDS } from './constants';
import GameMenu from './components/GameMenu';
import { AudioProvider } from './components/AudioChat';

const App: React.FC = () => {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isRulesOpen, setIsRulesOpen] = useState(false);
    const [isAssistantVisible, setIsAssistantVisible] = useState(true);
    const [gameSettings, setGameSettings] = useState<GameSettings>({
        playerNames: {
            red: 'Red',
            green: 'Green',
            yellow: 'Yellow',
            blue: 'Blue',
        },
    });

    const { gameState, handleRollDice, handlePieceMove, handleResetGame, initializeHost, toggleVoiceChat, toggleMute, remoteAudioRef } = useGameLogic(gameSettings.playerNames);

    const handleSaveSettings = (newSettings: GameSettings) => {
        setGameSettings(newSettings);
        setIsSettingsOpen(false);
    };

    // --- Sound Effects System (Preloaded) ---
    const audioCache = useRef<Record<string, HTMLAudioElement>>({});

    // Preload sounds on mount
    useEffect(() => {
        const preloadSounds = () => {
            const cache: Record<string, HTMLAudioElement> = {};
            
            // Map trigger types to sound URLs
            const soundMap: Record<string, string> = {
                'roll': SOUNDS.DICE,
                'move': SOUNDS.MOVE,
                'capture': SOUNDS.CAPTURE,
                'home': SOUNDS.HOME,
                'win': SOUNDS.WIN
            };

            Object.entries(soundMap).forEach(([key, url]) => {
                const audio = new Audio(url);
                audio.volume = 0.6; // Set default volume
                audio.preload = 'auto'; // Force preload
                cache[key] = audio;
            });

            audioCache.current = cache;
        };

        preloadSounds();
    }, []);

    // Play sounds based on trigger
    useEffect(() => {
        if (!gameState.audioTrigger) return;

        const { type } = gameState.audioTrigger;
        const audio = audioCache.current[type];

        if (audio) {
            // Reset time to 0 to allow rapid re-playing (e.g. fast clicks)
            audio.currentTime = 0;
            
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.warn("Audio playback failed (likely autoplay policy):", error);
                });
            }
        }
    }, [gameState.audioTrigger]);

    return (
        <AudioProvider gameState={gameState} isAssistantVisible={isAssistantVisible}>
            <main className="w-screen h-screen flex flex-col justify-center items-center p-2 sm:p-4 overflow-hidden relative text-slate-200">
                {/* Remote Audio Element for WebRTC Voice Chat */}
                <audio ref={remoteAudioRef} autoPlay style={{ display: 'none' }} />

                 <GameMenu
                    onOpenRules={() => setIsRulesOpen(true)}
                    onOpenSettings={() => setIsSettingsOpen(true)}
                    onResetGame={handleResetGame}
                    isAssistantVisible={isAssistantVisible}
                    onToggleAssistant={() => setIsAssistantVisible(v => !v)}
                    isOnline={gameState.isOnline}
                    roomId={gameState.roomId}
                    onlineStatus={gameState.onlineStatus}
                    // Voice Chat Props
                    voiceChatStatus={gameState.voiceChatStatus}
                    isMicMuted={gameState.isMicMuted}
                    onToggleVoiceChat={toggleVoiceChat}
                    onToggleMute={toggleMute}
                />
                
                <div className="flex flex-col justify-center items-center w-full max-w-[600px] mx-auto gap-2 z-10">
                    {/* Top Players */}
                    <div className="flex justify-between items-center w-full gap-2">
                        {(['red', 'green'] as PlayerColor[]).map((color) => (
                            <PlayerInfo
                                key={color}
                                color={color}
                                name={gameState.players[color].name}
                                isCurrent={gameState.currentPlayer === color}
                                diceValue={gameState.diceValue}
                                lastDiceValue={gameState.lastDiceValue}
                                lastPlayerRolled={gameState.lastPlayerRolled}
                                isRolling={gameState.isRolling}
                                status={gameState.status}
                                onRollDice={handleRollDice}
                                layout={color === 'red' ? 'default' : 'reversed'}
                            />
                        ))}
                    </div>

                    {/* Board */}
                    <div className="w-full max-w-[500px] aspect-square">
                        <Board 
                            pieces={Object.values(gameState.pieces)}
                            onPieceClick={handlePieceMove}
                            movablePieces={gameState.movablePieces}
                        />
                    </div>

                    {/* Bottom Players */}
                    <div className="flex justify-between items-center w-full gap-2">
                         {(['blue', 'yellow'] as PlayerColor[]).map((color) => (
                            <PlayerInfo
                                key={color}
                                color={color}
                                name={gameState.players[color].name}
                                isCurrent={gameState.currentPlayer === color}
                                diceValue={gameState.diceValue}
                                lastDiceValue={gameState.lastDiceValue}
                                lastPlayerRolled={gameState.lastPlayerRolled}
                                isRolling={gameState.isRolling}
                                status={gameState.status}
                                onRollDice={handleRollDice}
                                layout={color === 'blue' ? 'default' : 'reversed'}
                            />
                        ))}
                    </div>
                </div>
                
                {/* Footer / Message Bar */}
                <footer className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none z-20">
                     <div className="bg-slate-900/90 px-6 py-2 rounded-full shadow-lg border border-white/10 flex items-center gap-2 backdrop-blur-sm">
                        <div className={`w-2 h-2 rounded-full animate-pulse ${gameState.isOnline ? 'bg-blue-400' : 'bg-green-400'}`}></div>
                        <p className="text-white/90 font-medium text-sm">
                            {gameState.isOnline && gameState.myColor ? `(You are ${gameState.myColor}) ` : ''}
                            {gameState.message}
                        </p>
                    </div>
                </footer>

                {/* Winner Overlay */}
                {gameState.winner && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col justify-center items-center z-50 animate-scale-in">
                        <div className="text-center space-y-6 p-8 border border-white/10 rounded-3xl bg-slate-800 shadow-2xl">
                            <h2 className="text-5xl font-black mb-4" style={{ color: PLAYER_CONFIG[gameState.winner].primary }}>
                                {gameState.players[gameState.winner].name} Wins!
                            </h2>
                            <button
                                onClick={() => handleResetGame({ disconnect: false })}
                                className="px-8 py-3 bg-blue-600 text-white font-bold text-lg rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                            >
                                Play Again
                            </button>
                        </div>
                    </div>
                )}
                
                <Settings 
                    isOpen={isSettingsOpen} 
                    onClose={() => setIsSettingsOpen(false)} 
                    onSave={handleSaveSettings}
                    currentSettings={gameSettings}
                    onInitializeHost={initializeHost}
                />

                <Rules 
                    isOpen={isRulesOpen}
                    onClose={() => setIsRulesOpen(false)}
                />
            </main>
        </AudioProvider>
    );
};

export default App;
