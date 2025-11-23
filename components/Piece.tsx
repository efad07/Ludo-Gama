
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

const TokenIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-2/3 h-2/3 text-white">
      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
    </svg>
);

const PieceComponent: React.FC<PieceProps> = ({ piece, isMovable, onClick, style, scale }) => {
    const config = PLAYER_CONFIG[piece.color];
    const pieceSize = 'w-[5.5%] h-[5.5%]'; 
    
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
            {/* Movable Indicator Ring */}
            {isMovable && (
                <div 
                    className="absolute w-full h-full rounded-full animate-ping opacity-50"
                    style={{ border: `2px solid ${config.primary}` }}
                ></div>
            )}
            
            {/* The Piece Token - Flat Design */}
             <div 
                className={`relative w-full h-full rounded-full shadow-md flex items-center justify-center border-2 border-white`}
                style={{
                    backgroundColor: config.primary,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}
            >
                <TokenIcon />
            </div>
        </div>
    );
};

export default PieceComponent;
