
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
    <svg xmlns="http://www.w3.org/2000/svg" className="w-[70%] h-[70%] text-gray-400" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
    </svg>
);

const ArrowIcon = ({ rotation }: { rotation: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-1/2 h-1/2 text-black/20" style={{ transform: `rotate(${rotation}deg)` }} viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M13.28 11.47a.75.75 0 010 1.06l-4.75 4.75a.75.75 0 01-1.06-1.06L9.94 12 7.47 9.53a.75.75 0 011.06-1.06l4.75 4.75z" clipRule="evenodd" />
        <path fillRule="evenodd" d="M19.28 11.47a.75.75 0 010 1.06l-4.75 4.75a.75.75 0 11-1.06-1.06L15.94 12l-2.47-2.47a.75.75 0 011.06-1.06l4.75 4.75z" clipRule="evenodd" />
    </svg>
);

const PlayerBase: React.FC<{color: PlayerColor}> = ({color}) => {
    const config = PLAYER_CONFIG[color];
    const basePositions = [
        { top: '25%', left: '25%' }, { top: '25%', left: '75%' },
        { top: '75%', left: '25%' }, { top: '75%', left: '75%' },
    ];
    
    return (
        <div className="relative w-full h-full p-[15%] border-[0.5px] border-black/10" style={{ backgroundColor: config.primary }}>
            {/* Inner White Box */}
            <div className="w-full h-full bg-white rounded-lg shadow-inner relative">
                {basePositions.map((pos, i) => (
                    <div 
                        key={`${color}-base-${i}`}
                        className="absolute w-[25%] h-[25%] rounded-full -translate-x-1/2 -translate-y-1/2 shadow-sm"
                        style={{
                            ...pos, 
                            backgroundColor: config.primary,
                            border: '1px solid rgba(0,0,0,0.1)'
                        }}
                    ></div>
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
        // Outer Container (Orange Border)
        <div className="relative w-full aspect-square p-2 sm:p-3 rounded-lg bg-[#fdbb74] shadow-2xl">
            {/* Main Board Grid */}
            <div className="relative grid grid-cols-[6fr_3fr_6fr] grid-rows-[6fr_3fr_6fr] w-full h-full bg-white">
                
                {/* Top Left: Red Base */}
                <PlayerBase color="red" />
                
                {/* Top Middle: Grid */}
                <div className="relative border-[0.5px] border-black/5"></div>
                
                {/* Top Right: Green Base */}
                <PlayerBase color="green" />
                
                {/* Middle Left: Grid */}
                <div className="relative border-[0.5px] border-black/5"></div>
                
                {/* Center Home Zone - 4 Triangles */}
                <div className="relative w-full h-full bg-white z-0">
                     <div className="absolute inset-0 w-full h-full">
                        {/* Top: Green Triangle */}
                        <div className="absolute top-0 left-0 w-full h-[50%] bg-[#22c55e]" 
                             style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }}></div>
                        
                        {/* Right: Yellow Triangle */}
                        <div className="absolute top-0 right-0 w-[50%] h-full bg-[#fbbf24]" 
                             style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 50%)' }}></div>

                        {/* Bottom: Blue Triangle */}
                        <div className="absolute bottom-0 left-0 w-full h-[50%] bg-[#0ea5e9]" 
                             style={{ clipPath: 'polygon(0 100%, 100% 100%, 50% 0)' }}></div>

                        {/* Left: Red Triangle */}
                        <div className="absolute top-0 left-0 w-[50%] h-full bg-[#ef4444]" 
                             style={{ clipPath: 'polygon(0 0, 0 100%, 100% 50%)' }}></div>
                    </div>
                </div>
                
                {/* Middle Right: Grid */}
                <div className="relative border-[0.5px] border-black/5"></div>
                
                {/* Bottom Left: Blue Base */}
                <PlayerBase color="blue" />
                
                {/* Bottom Middle: Grid */}
                <div className="relative border-[0.5px] border-black/5"></div>
                
                {/* Bottom Right: Yellow Base */}
                <PlayerBase color="yellow" />
            </div>

            {/* Path Cells Layer */}
             <div className="absolute inset-0 p-2 sm:p-3 pointer-events-none">
                {/* Main Track Grid */}
                {Object.values(PATH_COORDS).map(([row, col], i) => (
                     <div 
                        key={`path-${i}`} 
                        className={`absolute w-[calc(100%/15)] h-[calc(100%/15)] flex justify-center items-center border-[0.5px] border-black/20 bg-white`} 
                        style={{ top: `${row * (100/15)}%`, left: `${col * (100/15)}%`}}
                     >
                        {SAFE_SPOTS.includes(i) && <StarIcon />}
                        {/* Arrow indicators for start spots */}
                        {i === 50 && <div className="absolute"><ArrowIcon rotation={0} /></div>} 
                        {i === 11 && <div className="absolute"><ArrowIcon rotation={90} /></div>}
                        {i === 24 && <div className="absolute"><ArrowIcon rotation={180} /></div>}
                        {i === 37 && <div className="absolute"><ArrowIcon rotation={270} /></div>}
                     </div>
                ))}
                
                {/* Home Paths (Colored Steps) */}
                {Object.entries(HOME_PATH_COORDS).map(([color, coords]) => (
                    Object.values(coords).map(([row, col], i) => (
                        <div 
                            key={`home-${color}-${i}`} 
                            className="absolute w-[calc(100%/15)] h-[calc(100%/15)] border-[0.5px] border-black/20 flex items-center justify-center" 
                            style={{ 
                                top: `${row * (100/15)}%`, 
                                left: `${col * (100/15)}%`, 
                                backgroundColor: PLAYER_CONFIG[color as PlayerColor].primary,
                            }} 
                        >
                             {/* Add arrow on the first home path cell */}
                             {i === 0 && (
                                 <div className="opacity-30">
                                     {color === 'red' && <ArrowIcon rotation={0} />}
                                     {color === 'green' && <ArrowIcon rotation={90} />}
                                     {color === 'yellow' && <ArrowIcon rotation={180} />}
                                     {color === 'blue' && <ArrowIcon rotation={270} />}
                                 </div>
                             )}
                        </div>
                    ))
                ))}

                 {/* Start Positions (Colored) */}
                 {Object.entries(START_POSITIONS).map(([color, pos]) => {
                    const [row, col] = PATH_COORDS[pos];
                    const config = PLAYER_CONFIG[color as PlayerColor];
                    return <div 
                        key={`start-${color}`} 
                        className="absolute w-[calc(100%/15)] h-[calc(100%/15)] border-[0.5px] border-black/20" 
                        style={{ 
                            top: `${row * (100/15)}%`, 
                            left: `${col * (100/15)}%`, 
                            backgroundColor: config.primary,
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
