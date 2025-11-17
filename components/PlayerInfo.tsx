import React from 'react';
import Dice from './Dice';
import type { PlayerColor, GameStatus } from '../types';
import { PLAYER_CONFIG } from '../constants';

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
            className="w-full h-full bg-[#f3d9b5] rounded-full flex items-center justify-center"
        >
             <span className="font-bold text-xl sm:text-2xl" style={{color: PLAYER_CONFIG[color].primary}}>
                {color.charAt(0).toUpperCase()}
             </span>
        </div>
    </div>
);


const PlayerInfo: React.FC<PlayerInfoProps> = ({ color, name, isCurrent, diceValue, isRolling, layout, status, onRollDice, lastPlayerRolled, lastDiceValue }) => {
    const config = PLAYER_CONFIG[color];
    const canRoll = isCurrent && status === 'waiting-for-roll';
    
    const isReversed = layout === 'reversed';

    const displayValue = isCurrent ? diceValue : (color === lastPlayerRolled ? lastDiceValue : null);

    return (
        <div
            className={`flex items-center gap-3 p-2 rounded-2xl transition-all duration-300 w-1/2 backdrop-blur-sm border-2
            ${isReversed ? 'flex-row-reverse' : 'flex-row'}
            ${isCurrent ? 'opacity-100 scale-100' : 'opacity-60 scale-95'}`}
            style={{
                backgroundColor: isCurrent ? '#4a3f3f' : 'rgba(0, 0, 0, 0.2)',
                borderColor: isCurrent ? config.primary : 'rgba(255, 255, 255, 0.2)',
                boxShadow: isCurrent ? `0 0 15px 0px ${config.primary}` : 'none',
            }}
        >
            <Avatar color={color} />

            <div className={`flex flex-col flex-grow ${isReversed ? 'items-end' : 'items-start'}`}>
                <span className="font-bold text-sm sm:text-base text-amber-50 truncate">
                    {name}
                </span>
            </div>
            
            <div
                className={`relative group transition-transform duration-200 rounded-full
                ${canRoll ? 'cursor-pointer hover:scale-110 active:scale-100' : ''}
                ${canRoll ? `shadow-lg shadow-yellow-400/50` : ''}
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
    );
};

export default PlayerInfo;