
import React, { useState } from 'react';
import Board from './components/Board';
import Settings from './components/Settings';
import Rules from './components/Rules';
import { useGameLogic } from './hooks/useGameLogic';
import type { GameSettings, PlayerColor } from './types';
import PlayerInfo from './components/PlayerInfo';
import { PLAYER_CONFIG } from './constants';
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

    const { gameState, handleRollDice, handlePieceMove, handleResetGame, initializeHost } = useGameLogic(gameSettings.playerNames);

    const handleSaveSettings = (newSettings: GameSettings) => {
        setGameSettings(newSettings);
        setIsSettingsOpen(false);
    };

    return (
        <AudioProvider gameState={gameState} isAssistantVisible={isAssistantVisible}>
            <main className="w-screen h-screen flex flex-col justify-center items-center p-4 text-slate-200 overflow-hidden relative">
                 <GameMenu
                    onOpenRules={() => setIsRulesOpen(true)}
                    onOpenSettings={() => setIsSettingsOpen(true)}
                    onResetGame={handleResetGame}
                    isAssistantVisible={isAssistantVisible}
                    onToggleAssistant={() => setIsAssistantVisible(v => !v)}
                    isOnline={gameState.isOnline}
                    roomId={gameState.roomId}
                    onlineStatus={gameState.onlineStatus}
                />
                
                {/* Decorative background elements - Dark Mode */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                    <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-blue-600/20 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-purple-600/20 rounded-full blur-[120px]"></div>
                </div>

                <div className="flex flex-col justify-center items-center w-full max-w-[800px] mx-auto gap-4 z-10">
                    {/* Top Players */}
                    <div className="flex justify-between items-center w-full gap-4">
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
                    <div className="w-full max-w-[500px] aspect-square animate-float">
                        <Board 
                            pieces={Object.values(gameState.pieces)}
                            onPieceClick={handlePieceMove}
                            movablePieces={gameState.movablePieces}
                        />
                    </div>

                    {/* Bottom Players */}
                    <div className="flex justify-between items-center w-full gap-4">
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
                <footer className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none z-20">
                     <div className="glass-panel bg-slate-900/80 px-8 py-3 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.4)] border border-white/10 flex items-center gap-2 backdrop-blur-xl">
                        <div className={`w-2 h-2 rounded-full animate-pulse ${gameState.isOnline ? 'bg-blue-400 shadow-[0_0_10px_#60a5fa]' : 'bg-green-400'}`}></div>
                        <p className="text-white/90 font-medium tracking-wide text-sm sm:text-base">
                            {gameState.isOnline && gameState.myColor ? `(You are ${gameState.myColor}) ` : ''}
                            {gameState.message}
                        </p>
                    </div>
                </footer>

                {/* Winner Overlay */}
                {gameState.winner && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-xl flex flex-col justify-center items-center z-50 animate-scale-in">
                        <div className="text-center space-y-6 p-8 border border-white/10 rounded-3xl bg-white/5 shadow-2xl">
                            <h2 className="text-6xl sm:text-8xl font-black mb-4 tracking-tighter" style={{ 
                                color: PLAYER_CONFIG[gameState.winner].primary,
                                textShadow: `0 0 30px ${PLAYER_CONFIG[gameState.winner].primary}`
                            }}>
                                {gameState.players[gameState.winner].name}
                            </h2>
                            <p className="text-2xl text-white/80 uppercase tracking-widest">Victory Achieved</p>
                            
                            <button
                                onClick={handleResetGame}
                                className="mt-8 px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-xl rounded-xl hover:scale-105 transition-transform focus:outline-none shadow-[0_0_20px_rgba(59,130,246,0.5)]"
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