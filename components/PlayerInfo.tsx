import React, { useContext } from 'react';
import Dice from './Dice';
import type { PlayerColor, GameStatus } from '../types';
import { PLAYER_CONFIG } from '../constants';
import { AudioContext } from './AudioChat';

interface PlayerInfoProps {
    color: PlayerColor;
    name: string;
    isCurrent: boolean;
    diceValue: number | null;
    isRolling: boolean;
    layout: 'default' | 'reversed';
    status: GameStatus;
    onRollDice: () => void;
    lastPlayerRolled: PlayerColor | null;
    lastDiceValue: number | null;
}

const MicIconSvg = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 drop-shadow-md" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8h-1a6 6 0 11-12 0H3a7.001 7.001 0 006 6.93V17H7a1 1 0 100 2h6a1 1 0 100-2h-2v-2.07z" clipRule="evenodd" />
    </svg>
);

const MicController: React.FC = () => {
    const audioContext = useContext(AudioContext);
    if (!audioContext) return null;
    const { isListening, toggleListen, status } = audioContext;

    const isDisabled = status === 'connecting';
    
    let buttonStyle = '';
    if (isDisabled) {
        buttonStyle = 'bg-white/10 border-white/10 text-white/50 cursor-wait';
    } else if (isListening) {
        buttonStyle = 'bg-red-500/20 border-red-500 text-red-400 animate-ripple shadow-[0_0_15px_rgba(239,68,68,0.4)]';
    } else {
        buttonStyle = 'bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/40 text-white/90';
    }

    return (
        <button
            onClick={toggleListen}
            disabled={isDisabled}
            className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300 focus:outline-none backdrop-blur-sm ${buttonStyle}`}
        >
             {status === 'connecting' ? (
                 <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
             ) : (
                <MicIconSvg />
             )}
        </button>
    );
};


const PlayerInfo: React.FC<PlayerInfoProps> = ({ color, name, isCurrent, diceValue, isRolling, layout, status, onRollDice, lastPlayerRolled, lastDiceValue }) => {
    const config = PLAYER_CONFIG[color];
    const canRoll = isCurrent && status === 'waiting-for-roll';
    const isReversed = layout === 'reversed';
    const displayValue = isCurrent ? diceValue : (color === lastPlayerRolled ? lastDiceValue : null);

    // Dynamic glow style based on turn
    const glowStyle = isCurrent 
        ? { 
            boxShadow: `0 0 20px ${config.primary}30, inset 0 0 0 1px ${config.primary}`,
            borderColor: config.primary 
          }
        : { borderColor: 'rgba(255,255,255,0.1)' };

    return (
        <div
            className={`flex items-center gap-3 p-3 rounded-2xl transition-all duration-500 w-[48%] relative overflow-hidden
            ${isReversed ? 'flex-row-reverse text-right' : 'flex-row text-left'}
            ${isCurrent ? 'bg-[#0f172a]/80 backdrop-blur-xl opacity-100 scale-[1.02] z-20' : 'bg-[#0f172a]/40 backdrop-blur-md opacity-60 scale-95 z-10 border border-white/5'}
            `}
            style={glowStyle}
        >
            {/* Decorative background glow for active player */}
            {isCurrent && (
                <div 
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{ background: `linear-gradient(${isReversed ? 'to left' : 'to right'}, ${config.primary}, transparent)` }}
                />
            )}

            {/* Avatar / Status Indicator */}
            <div className="relative flex-shrink-0">
                <div 
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-bold text-xl sm:text-2xl shadow-lg border-2`}
                    style={{ 
                        backgroundColor: isCurrent ? config.primary : 'transparent',
                        borderColor: config.primary,
                        color: isCurrent ? '#000' : config.primary,
                        textShadow: isCurrent ? 'none' : `0 0 10px ${config.primary}`
                    }}
                >
                    {color.charAt(0).toUpperCase()}
                </div>
            </div>

            <div className={`flex flex-col flex-grow min-w-0 z-10 ${isReversed ? 'items-end' : 'items-start'}`}>
                <span className="font-bold text-sm sm:text-base text-white tracking-wide truncate w-full">
                    {name}
                </span>
                <span 
                    className="text-[10px] sm:text-xs font-medium uppercase tracking-widest"
                    style={{ color: isCurrent ? config.primary : 'rgba(255,255,255,0.4)' }}
                >
                    {isCurrent ? 'Your Turn' : 'Waiting'}
                </span>
            </div>
            
            <div className="z-10 flex items-center gap-2">
                 {isCurrent && <MicController />}
                 
                 <div
                    className={`relative transition-all duration-300
                    ${canRoll ? 'cursor-pointer hover:scale-110 active:scale-95 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]' : ''}
                    `}
                    onClick={canRoll ? onRollDice : undefined}
                >
                    <Dice 
                        value={displayValue} 
                        isRolling={isCurrent ? isRolling : false}
                        size={40}
                    />
                </div>
            </div>
        </div>
    );
};

export default PlayerInfo;