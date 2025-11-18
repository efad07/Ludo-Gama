import React from 'react';
import type { Piece } from '../types';
import { PLAYER_CONFIG } from '../constants';

interface PieceProps {
    piece: Piece;
    isMovable: boolean;
    onClick: (id: string) => void;
    style: React.CSSProperties;
    scale: number;
}

const PieceComponent: React.FC<PieceProps> = ({ piece, isMovable, onClick, style, scale }) => {
    const config = PLAYER_CONFIG[piece.color];
    const pieceSize = 'w-[6%] h-[6%]';
    
    const handleClick = () => {
        if (isMovable) {
            onClick(piece.id);
        }
    };

    return (
        <div
            className={`absolute ${pieceSize} rounded-full flex items-center justify-center -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-in-out transform ${isMovable ? 'hover:scale-110 hover:z-50' : 'z-10'}`}
            style={{
                ...style,
                cursor: isMovable ? 'pointer' : 'default',
                transform: `translate(-50%, -50%) scale(${scale})`,
                // Ensure movable pieces are always on top if stacked
                zIndex: isMovable ? 30 : 10
            }}
            onClick={handleClick}
        >
             <div 
                className={`relative w-full h-full rounded-full transition-all duration-200 flex items-center justify-center text-white font-bold ${isMovable ? 'piece-movable-animate' : ''}`}
                style={{
                    backgroundColor: config.primary,
                    backgroundImage: `radial-gradient(circle at 30% 25%, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 50%)`,
                    boxShadow: 'inset 0 -3px 4px rgba(0,0,0,0.3), 0 4px 6px rgba(0,0,0,0.2)',
                    border: '1px solid rgba(0,0,0,0.2)'
                }}
            >
            </div>
        </div>
    );
};

export default PieceComponent;