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

const Avatar: React.FC<{ color: PlayerColor }> = ({ color }) => (
    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex-shrink-0 p-1 bg-black/20 border-2 border-white/30">
        <div 
            className="w-full h-full bg-[#f3d9b5] rounded-full flex items-center justify-center shadow-inner"
        >
             <span className="font-bold text-xl sm:text-2xl" style={{color: PLAYER_CONFIG[color].primary}}>
                {color.charAt(0).toUpperCase()}
             </span>
        </div>
    </div>
);

const MicIconSvg = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-white drop-shadow-md" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8h-1a6 6 0 11-12 0H3a7.001 7.001 0 006 6.93V17H7a1 1 0 100 2h6a1 1 0 100-2h-2v-2.07z" clipRule="evenodd" />
    </svg>
);

const MicController: React.FC = () => {
    const audioContext = useContext(AudioContext);
    if (!audioContext) return null;
    const { isListening, toggleListen, status } = audioContext;

    const isDisabled = status === 'connecting';
    const baseClasses = 'w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none flex-shrink-0 shadow-lg';
    
    let stateClasses = '';
    
    if (isDisabled) {
        stateClasses = 'bg-gray-500/50 border-2 border-white/10 cursor-wait';
    } else if (isListening) {
        stateClasses = 'bg-gradient-to-br from-red-500 to-red-700 border-2 border-white/50 animate-ripple scale-110 shadow-red-500/50';
    } else {
        stateClasses = 'bg-gradient-to-br from-gray-700/80 to-black/80 border-2 border-white/20 hover:scale-105 hover:border-white/40 hover:bg-gray-600/80';
    }

    return (
        <button
            onClick={toggleListen}
            disabled={isDisabled}
            className={`${baseClasses} ${stateClasses}`}
            aria-label={isListening ? "Stop listening" : "Start listening"}
            title={isListening ? "Listening..." : "Talk to Assistant"}
        >
             {status === 'connecting' ? (
                 <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
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

    return (
        <div
            className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-3xl transition-all duration-500 w-[48%] backdrop-blur-md border
            ${isReversed ? 'flex-row-reverse text-right' : 'flex-row text-left'}
            ${isCurrent ? 'opacity-100 scale-100 shadow-xl z-20' : 'opacity-60 scale-95 z-10'}`}
            style={{
                backgroundColor: isCurrent ? 'rgba(60, 40, 40, 0.85)' : 'rgba(30, 30, 30, 0.4)',
                borderColor: isCurrent ? config.primary : 'rgba(255, 255, 255, 0.1)',
                boxShadow: isCurrent ? `0 8px 20px -5px ${config.primary}40` : 'none',
            }}
        >
            <Avatar color={color} />

            <div className={`flex flex-col flex-grow min-w-0 ${isReversed ? 'items-end' : 'items-start'}`}>
                <span className="font-bold text-sm sm:text-base text-amber-50 truncate w-full">
                    {name}
                </span>
                {isCurrent && <span className="text-[10px] sm:text-xs text-amber-200/70 font-medium uppercase tracking-wider animate-pulse">
                    Your Turn
                </span>}
            </div>
            
            {isCurrent && <MicController />}

            <div
                className={`relative group transition-all duration-300 rounded-xl
                ${canRoll ? 'cursor-pointer hover:scale-105 active:scale-95' : ''}
                ${canRoll ? `shadow-[0_0_15px_rgba(250,204,21,0.4)]` : ''}
                `}
                onClick={canRoll ? onRollDice : undefined}
            >
                <Dice 
                    value={displayValue} 
                    isRolling={isCurrent ? isRolling : false}
                    size={42}
                />
            </div>
        </div>
    );
};

export default PlayerInfo;