import React from 'react';
import type { Piece } from '../types';
import { PLAYER_CONFIG } from '../constants';

interface PieceProps {
    piece: Piece;
    isMovable: boolean;
    onClick: (id: string) => void;
    style: React.CSSProperties;
}

const PieceComponent: React.FC<PieceProps> = ({ piece, isMovable, onClick, style }) => {
    const config = PLAYER_CONFIG[piece.color];
    const pieceSize = 'w-[6%] h-[6%]';
    
    const handleClick = () => {
        if (isMovable) {
            onClick(piece.id);
        }
    };

    return (
        <div
            className={`absolute ${pieceSize} rounded-full flex items-center justify-center -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 ease-in-out z-10 transform ${isMovable ? 'hover:scale-110' : ''}`}
            style={{
                ...style,
                cursor: isMovable ? 'pointer' : 'default',
            }}
            onClick={handleClick}
        >
             <div 
                className={`w-full h-full rounded-full transition-all duration-200 flex items-center justify-center text-white font-bold ${isMovable ? 'piece-movable-animate' : ''}`}
                style={{
                    backgroundColor: config.primary,
                    backgroundImage: `radial-gradient(circle at 30% 25%, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 50%)`,
                    boxShadow: 'inset 0 -3px 4px rgba(0,0,0,0.3), 0 4px 6px rgba(0,0,0,0.2)',
                    border: '1px solid rgba(0,0,0,0.2)'
                }}
            >
                {/* Number removed for a classic pawn look */}
            </div>
        </div>
    );
};

export default PieceComponent;
