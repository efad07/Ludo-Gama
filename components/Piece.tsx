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
    const pieceSize = 'w-[5.5%] h-[5.5%]'; // Slightly smaller to allow glow
    
    const handleClick = () => {
        if (isMovable) {
            onClick(piece.id);
        }
    };

    return (
        <div
            className={`absolute ${pieceSize} flex items-center justify-center -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-out transform ${isMovable ? 'hover:scale-110 hover:z-50 cursor-pointer' : 'z-10 cursor-default'}`}
            style={{
                ...style,
                transform: `translate(-50%, -50%) scale(${scale})`,
                zIndex: isMovable ? 30 : 10
            }}
            onClick={handleClick}
        >
            {/* Outer Glow / Halo for Movable Pieces */}
            {isMovable && (
                <div 
                    className="absolute w-full h-full rounded-full animate-ping opacity-75"
                    style={{ backgroundColor: config.primary }}
                ></div>
            )}
            
            {/* The Piece Orb */}
             <div 
                className={`relative w-full h-full rounded-full transition-all duration-200 shadow-lg ${isMovable ? 'piece-movable-animate' : ''}`}
                style={{
                    background: `radial-gradient(circle at 30% 30%, #ffffff 0%, ${config.primary} 60%, #000000 100%)`,
                    boxShadow: `0 0 10px ${config.primary}, inset 0 0 5px rgba(0,0,0,0.5)`
                }}
            >
                {/* Specular highlight */}
                <div className="absolute top-[15%] left-[15%] w-[25%] h-[25%] bg-white rounded-full blur-[1px] opacity-80"></div>
            </div>
        </div>
    );
};

export default PieceComponent;