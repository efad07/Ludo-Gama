
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
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 drop-shadow-md" viewBox="0 0 20 20" fill="currentColor">
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
        buttonStyle = 'bg-red-500 text-white animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.6)] border-red-400';
    } else {
        buttonStyle = 'bg-slate-700/80 border-white/20 hover:bg-slate-600 text-white/90';
    }

    return (
        <button
            onClick={toggleListen}
            disabled={isDisabled}
            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border transition-all duration-300 focus:outline-none backdrop-blur-sm flex-shrink-0 ${buttonStyle}`}
            title="Talk to Assistant"
        >
             {status === 'connecting' ? (
                 <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
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

    // Layout classes for mobile-friendly arrangement
    return (
        <div
            className={`
                relative flex items-center gap-2 p-2 rounded-xl transition-all duration-500 w-[48%] sm:w-[45%]
                ${isReversed ? 'flex-row-reverse text-right' : 'flex-row text-left'}
                ${isCurrent 
                    ? 'bg-slate-800 shadow-xl scale-105 z-30 border-2 ring-1 ring-black/20' 
                    : 'bg-slate-900/60 border border-white/5 opacity-80 scale-95 z-10 grayscale-[0.3]'}
            `}
            style={{ 
                borderColor: isCurrent ? config.primary : 'rgba(255,255,255,0.05)',
            }}
        >
            {/* Avatar Box */}
            <div 
                className={`
                    w-9 h-9 sm:w-12 sm:h-12 rounded-lg shadow-inner flex items-center justify-center 
                    text-white font-bold text-lg sm:text-2xl flex-shrink-0 relative overflow-hidden
                    border border-white/10
                `}
                style={{ backgroundColor: isCurrent ? config.primary : '#1e293b' }}
            >
                {/* Gloss effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-black/10 pointer-events-none"></div>
                <span className="relative z-10 drop-shadow-md">{name.charAt(0).toUpperCase()}</span>
            </div>

            {/* Text Info */}
            <div className={`flex-1 min-w-0 flex flex-col justify-center h-full ${isReversed ? 'items-end' : 'items-start'}`}>
                <span className={`font-bold text-xs sm:text-sm truncate block w-full leading-tight ${isCurrent ? 'text-white' : 'text-slate-400'}`}>
                    {name}
                </span>
                <span 
                    className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest truncate"
                    style={{ color: isCurrent ? config.primary : 'transparent', opacity: isCurrent ? 1 : 0 }}
                >
                    YOUR TURN
                </span>
            </div>
            
            {/* Controls Group */}
            <div className={`flex items-center gap-1 sm:gap-2 ${isReversed ? 'flex-row-reverse' : 'flex-row'}`}>
                 {isCurrent && <MicController />}
                 
                 {/* DICE SECTION */}
                 <div 
                    className={`relative flex items-center justify-center rounded-lg transition-all duration-200 flex-shrink-0
                    ${canRoll ? 'cursor-pointer active:scale-90' : ''}
                    `}
                    style={{ 
                        width: isCurrent ? '44px' : '34px', 
                        height: isCurrent ? '44px' : '34px' 
                    }}
                    onClick={canRoll ? onRollDice : undefined}
                 >
                    {/* TAP Badge for Mobile UX */}
                    {canRoll && !isRolling && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-40 animate-bounce">
                             <span className="bg-white text-slate-900 text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm border border-slate-200 whitespace-nowrap">
                                TAP
                             </span>
                        </div>
                    )}

                    <div className="relative w-full h-full flex items-center justify-center">
                         {/* Halo for active roller */}
                        {canRoll && (
                            <div className="absolute inset-0 bg-white/10 rounded-lg animate-pulse"></div>
                        )}
                        
                        <Dice 
                            value={displayValue} 
                            isRolling={isCurrent ? isRolling : false}
                            size={isCurrent ? 38 : 28}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlayerInfo;
