import React from 'react';
import PieceComponent from './Piece';
import type { Piece, PlayerColor } from '../types';
import { PLAYER_CONFIG, PATH_COORDS, HOME_PATH_COORDS, BASE_COORDS, START_POSITIONS, SAFE_SPOTS } from '../constants';

interface BoardProps {
    pieces: Piece[];
    onPieceClick: (pieceId: string) => void;
    movablePieces: string[];
}

const StarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-3/4 h-3/4 text-white/80 drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]" viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

const PlayerBase: React.FC<{color: PlayerColor}> = ({color}) => {
    const config = PLAYER_CONFIG[color];
    const basePositions = [
        { top: '25%', left: '25%' }, { top: '25%', left: '75%' },
        { top: '75%', left: '25%' }, { top: '75%', left: '75%' },
    ];
    return (
        <div 
            className="relative w-full h-full rounded-3xl border-4 transition-colors duration-300" 
            style={{ 
                borderColor: config.primary, 
                backgroundColor: `${config.primary}15`, // Low opacity fill
                boxShadow: `inset 0 0 20px ${config.primary}20`
            }}
        >
             <div 
                className="absolute w-[75%] h-[75%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl"
                style={{ backgroundColor: `${config.primary}10` }}
             >
                 {basePositions.map((pos, i) => (
                    <div 
                        key={`${color}-base-${i}`}
                        className="absolute w-[35%] h-[35%] rounded-full -translate-x-1/2 -translate-y-1/2 border-2 flex items-center justify-center"
                        style={{
                            ...pos, 
                            borderColor: `${config.primary}60`,
                            backgroundColor: `${config.primary}10`,
                            boxShadow: `0 0 10px ${config.primary}20`
                        }}
                    >
                        <div className="w-2 h-2 rounded-full bg-white/20"></div>
                    </div>
                 ))}
            </div>
        </div>
    )
}

const Board: React.FC<BoardProps> = ({ pieces, onPieceClick, movablePieces }) => {
    
    const getPiecesAtPosition = (targetPiece: Piece) => {
        if (targetPiece.status === 'base') return [targetPiece];
        return pieces.filter(p => 
            p.status === targetPiece.status && 
            p.position === targetPiece.position
        );
    };

    const getPiecePosition = (piece: Piece, indexInStack: number, stackSize: number): { top: string; left: string; scale: number } => {
        let coords: [number, number] | null = null;
        
        if (piece.status === 'base') {
            const pieceIndex = parseInt(piece.id.split('-')[1]);
            coords = BASE_COORDS[piece.color][pieceIndex];
            return {
                top: `${(coords[0] / 15) * 100 + (1 / 15 * 100 / 2)}%`,
                left: `${(coords[1] / 15) * 100 + (1 / 15 * 100 / 2)}%`,
                scale: 1
            };
        } 
        
        if (piece.position >= 52 && piece.position <= 57) { 
            coords = HOME_PATH_COORDS[piece.color][piece.position];
        } else if (piece.status === 'active') { 
            coords = PATH_COORDS[piece.position];
        } else { 
            coords = [7, 7]; 
        }

        if(!coords) return {top: '50%', left: '50%', scale: 1}; 

        let topPercent = (coords[0] / 15) * 100 + (1 / 15 * 100 / 2);
        let leftPercent = (coords[1] / 15) * 100 + (1 / 15 * 100 / 2);
        let scale = 1;

        if (stackSize > 1) {
            scale = 0.65; 
            const offset = 1.8; 

            if (stackSize === 2) {
                if (indexInStack === 0) { topPercent -= offset; leftPercent -= offset; } 
                else { topPercent += offset; leftPercent += offset; }
            } else if (stackSize === 3) {
                if (indexInStack === 0) { topPercent -= offset; } 
                else if (indexInStack === 1) { topPercent += offset; leftPercent -= offset; } 
                else { topPercent += offset; leftPercent += offset; }
            } else {
                switch (indexInStack % 4) {
                    case 0: topPercent -= offset; leftPercent -= offset; break;
                    case 1: topPercent -= offset; leftPercent += offset; break;
                    case 2: topPercent += offset; leftPercent -= offset; break;
                    case 3: topPercent += offset; leftPercent += offset; break;
                }
            }
        }

        return { top: `${topPercent}%`, left: `${leftPercent}%`, scale };
    };

    return (
        <div className="relative w-full aspect-square p-3 rounded-[2.5rem] glass-panel">
            <div className="relative grid grid-cols-[6fr_3fr_6fr] grid-rows-[6fr_3fr_6fr] w-full h-full gap-2 bg-transparent">
                <PlayerBase color="red" />
                <div className="relative bg-[#1e293b]/50 rounded-xl border border-white/5 overflow-hidden"></div>
                <PlayerBase color="green" />
                <div className="relative bg-[#1e293b]/50 rounded-xl border border-white/5 overflow-hidden"></div>
                
                {/* Center Home Zone - Modern Square Design */}
                <div className="relative w-full h-full bg-[#0f172a] rounded-xl border-2 border-white/10 shadow-2xl overflow-hidden z-0">
                     
                     {/* Background Tech Grid */}
                     <div className="absolute inset-0 opacity-30" style={{ 
                         backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
                         backgroundSize: '8px 8px' 
                     }}></div>

                     <div className="absolute inset-0 w-full h-full">
                        {/* Top: Green Zone (Triangle) */}
                        <div className="absolute top-0 left-0 w-full h-[50%] bg-gradient-to-b from-[#00FF9D]/30 to-transparent border-b border-white/5" 
                             style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }}>
                            <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[#00FF9D]/60 font-bold text-[8px] sm:text-[9px] tracking-wider animate-pulse">HOME</div>
                        </div>
                        
                        {/* Right: Yellow Zone (Triangle) */}
                        <div className="absolute top-0 right-0 w-[50%] h-full bg-gradient-to-l from-[#FFEA00]/30 to-transparent border-l border-white/5" 
                             style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 50%)' }}>
                            <div className="absolute right-1 top-1/2 -translate-y-1/2 rotate-90 text-[#FFEA00]/60 font-bold text-[8px] sm:text-[9px] tracking-wider animate-pulse">HOME</div>
                        </div>

                        {/* Bottom: Blue Zone (Triangle) */}
                        <div className="absolute bottom-0 left-0 w-full h-[50%] bg-gradient-to-t from-[#00CCFF]/30 to-transparent border-t border-white/5" 
                             style={{ clipPath: 'polygon(0 100%, 100% 100%, 50% 0)' }}>
                             <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[#00CCFF]/60 font-bold text-[8px] sm:text-[9px] tracking-wider animate-pulse">HOME</div>
                        </div>

                        {/* Left: Red Zone (Triangle) */}
                        <div className="absolute top-0 left-0 w-[50%] h-full bg-gradient-to-r from-[#FF0055]/30 to-transparent border-r border-white/5" 
                             style={{ clipPath: 'polygon(0 0, 0 100%, 100% 50%)' }}>
                            <div className="absolute left-1 top-1/2 -translate-y-1/2 -rotate-90 text-[#FF0055]/60 font-bold text-[8px] sm:text-[9px] tracking-wider animate-pulse">HOME</div>
                        </div>
                        
                        {/* Central Hub - Diamond Square */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[28%] h-[28%] bg-[#1e293b] rotate-45 border border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center justify-center z-10">
                            <div className="w-[75%] h-[75%] bg-white/5 border border-white/10 -rotate-45 flex items-center justify-center rounded-sm shadow-inner">
                                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-[0_0_10px_white]"></div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="relative bg-[#1e293b]/50 rounded-xl border border-white/5 overflow-hidden"></div>
                <PlayerBase color="blue" />
                <div className="relative bg-[#1e293b]/50 rounded-xl border border-white/5 overflow-hidden"></div>
                <PlayerBase color="yellow" />
            </div>

            {/* Path Cells Layer */}
             <div className="absolute inset-0 p-3 pointer-events-none">
                {/* Main Track Grid */}
                {Object.values(PATH_COORDS).map(([row, col], i) => (
                     <div 
                        key={`path-${i}`} 
                        className={`absolute w-[calc(100%/15)] h-[calc(100%/15)] flex justify-center items-center border-[0.5px] border-white/5 ${SAFE_SPOTS.includes(i) ? 'bg-white/10 backdrop-blur-sm' : ''}`} 
                        style={{ top: `${row * (100/15)}%`, left: `${col * (100/15)}%`}}
                     >
                        {SAFE_SPOTS.includes(i) && <StarIcon />}
                     </div>
                ))}
                
                {/* Home Paths (Colored Steps) */}
                {Object.entries(HOME_PATH_COORDS).map(([color, coords]) => (
                    Object.values(coords).map(([row, col], i) => (
                        <div 
                            key={`home-${color}-${i}`} 
                            className="absolute w-[calc(100%/15)] h-[calc(100%/15)] border-[0.5px] border-black/20" 
                            style={{ 
                                top: `${row * (100/15)}%`, 
                                left: `${col * (100/15)}%`, 
                                backgroundColor: PLAYER_CONFIG[color as PlayerColor].primary,
                                opacity: 0.6,
                                boxShadow: `0 0 10px ${PLAYER_CONFIG[color as PlayerColor].primary}`
                            }} 
                        ></div>
                    ))
                ))}

                 {/* Start Positions */}
                 {Object.entries(START_POSITIONS).map(([color, pos]) => {
                    const [row, col] = PATH_COORDS[pos];
                    const config = PLAYER_CONFIG[color as PlayerColor];
                    return <div 
                        key={`start-${color}`} 
                        className="absolute w-[calc(100%/15)] h-[calc(100%/15)] border-[0.5px] border-white/10" 
                        style={{ 
                            top: `${row * (100/15)}%`, 
                            left: `${col * (100/15)}%`, 
                            backgroundColor: config.primary,
                            boxShadow: `0 0 15px ${config.primary}`
                        }}
                    ></div>
                 })}
            </div>

            {/* Pieces Layer */}
            {pieces.map(piece => {
                const stack = getPiecesAtPosition(piece);
                stack.sort((a, b) => a.color.localeCompare(b.color));
                const indexInStack = stack.findIndex(p => p.id === piece.id);
                const styleInfo = getPiecePosition(piece, indexInStack, stack.length);

                return (
                    <PieceComponent
                        key={piece.id}
                        piece={piece}
                        isMovable={movablePieces.includes(piece.id)}
                        onClick={onPieceClick}
                        style={{ top: styleInfo.top, left: styleInfo.left }}
                        scale={styleInfo.scale}
                    />
                );
            })}
        </div>
    );
};

export default Board;