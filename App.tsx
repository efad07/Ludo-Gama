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

    const { gameState, handleRollDice, handlePieceMove, handleResetGame } = useGameLogic(gameSettings.playerNames);

    const handleSaveSettings = (newSettings: GameSettings) => {
        setGameSettings(newSettings);
        setIsSettingsOpen(false);
    };

    return (
        <AudioProvider gameState={gameState} isAssistantVisible={isAssistantVisible}>
            <main className="w-screen h-screen flex flex-col justify-center items-center p-2 sm:p-4 text-white overflow-hidden">
                 <GameMenu
                    onOpenRules={() => setIsRulesOpen(true)}
                    onOpenSettings={() => setIsSettingsOpen(true)}
                    onResetGame={handleResetGame}
                    isAssistantVisible={isAssistantVisible}
                    onToggleAssistant={() => setIsAssistantVisible(v => !v)}
                />
                <div className="flex flex-col justify-center items-center w-full max-w-[800px] mx-auto gap-2">
                    {/* Top Players */}
                    <div className="flex justify-between items-center w-full">
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
                    <div className="w-full max-w-[600px] aspect-square">
                        <Board 
                            pieces={Object.values(gameState.pieces)}
                            onPieceClick={handlePieceMove}
                            movablePieces={gameState.movablePieces}
                        />
                    </div>

                    {/* Bottom Players */}
                    <div className="flex justify-between items-center w-full">
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
                <footer className="absolute bottom-0 left-0 right-0 p-2 text-center">
                     <div className="bg-[#4a3f3f]/80 backdrop-blur-sm text-amber-50 font-semibold rounded-lg px-4 py-2 inline-block shadow-lg border border-amber-800/20">
                        <p>{gameState.message}</p>
                    </div>
                </footer>

                {/* Winner Overlay */}
                {gameState.winner && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-md flex flex-col justify-center items-center z-50">
                        <h2 className="text-5xl sm:text-7xl font-bold mb-4" style={{ color: PLAYER_CONFIG[gameState.winner].primary }}>
                            {gameState.players[gameState.winner].name} Wins!
                        </h2>
                        <button
                            onClick={handleResetGame}
                            className="mt-4 px-8 py-4 bg-amber-600 text-white font-bold text-xl rounded-lg hover:bg-amber-700 transition-colors focus:outline-none focus:ring-4 focus:ring-amber-500/50 border-b-4 border-amber-800 active:scale-95"
                        >
                            Play Again
                        </button>
                    </div>
                )}
                
                <Settings 
                    isOpen={isSettingsOpen} 
                    onClose={() => setIsSettingsOpen(false)} 
                    onSave={handleSaveSettings}
                    currentSettings={gameSettings}
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