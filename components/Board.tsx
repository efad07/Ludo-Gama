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
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4/5 h-4/5 text-amber-800/70" viewBox="0 0 20 20" fill="currentColor">
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
        <div className="relative w-full h-full rounded-2xl" style={{ backgroundColor: config.primary, boxShadow: 'inset 0 0 10px rgba(0,0,0,0.4)' }}>
             <div className="absolute w-[80%] h-[80%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#fefce8]/50 rounded-full">
                 {basePositions.map((pos, i) => (
                    <div 
                        key={`${color}-base-${i}`}
                        className="absolute w-1/3 h-1/3 bg-[#fefce8]/80 rounded-full -translate-x-1/2 -translate-y-1/2 border-2 border-gray-400/30"
                        style={{...pos}}
                    ></div>
                 ))}
            </div>
        </div>
    )
}

const Board: React.FC<BoardProps> = ({ pieces, onPieceClick, movablePieces }) => {
    
    // Helper to group pieces by position to calculate offsets
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
            // No offsets needed for base, they have fixed unique coords
            return {
                top: `${(coords[0] / 15) * 100 + (1 / 15 * 100 / 2)}%`,
                left: `${(coords[1] / 15) * 100 + (1 / 15 * 100 / 2)}%`,
                scale: 1
            };
        } 
        
        if (piece.position >= 52 && piece.position <= 57) { // In home path
            coords = HOME_PATH_COORDS[piece.color][piece.position];
        } else if (piece.status === 'active') { // On main track
            coords = PATH_COORDS[piece.position];
        } else { // home status
            coords = [7, 7]; // Center of the board
        }

        if(!coords) return {top: '50%', left: '50%', scale: 1}; 

        // Base position (center of the cell)
        // Each cell is approx 6.66% of the board
        let topPercent = (coords[0] / 15) * 100 + (1 / 15 * 100 / 2);
        let leftPercent = (coords[1] / 15) * 100 + (1 / 15 * 100 / 2);
        let scale = 1;

        // Calculate offset if multiple pieces share the cell
        if (stackSize > 1) {
            scale = 0.65; // Shrink pieces to prevent clutter
            const offset = 1.8; // Percentage offset from center (approx 1/4 of a cell)

            // Distribution Logic based on stack size
            if (stackSize === 2) {
                // Diagonal separation
                if (indexInStack === 0) { // Top Left
                    topPercent -= offset;
                    leftPercent -= offset;
                } else { // Bottom Right
                    topPercent += offset;
                    leftPercent += offset;
                }
            } else if (stackSize === 3) {
                // Triangle formation
                if (indexInStack === 0) { // Top Center
                    topPercent -= offset;
                } else if (indexInStack === 1) { // Bottom Left
                    topPercent += offset;
                    leftPercent -= offset;
                } else { // Bottom Right
                    topPercent += offset;
                    leftPercent += offset;
                }
            } else {
                // 4+ pieces: 2x2 Grid
                // 0: Top Left, 1: Top Right, 2: Bottom Left, 3: Bottom Right
                switch (indexInStack % 4) {
                    case 0:
                        topPercent -= offset;
                        leftPercent -= offset;
                        break;
                    case 1:
                        topPercent -= offset;
                        leftPercent += offset;
                        break;
                    case 2:
                        topPercent += offset;
                        leftPercent -= offset;
                        break;
                    case 3:
                        topPercent += offset;
                        leftPercent += offset;
                        break;
                }
            }
        }

        return {
            top: `${topPercent}%`,
            left: `${leftPercent}%`,
            scale
        };
    };

    return (
        <div className="relative w-full aspect-square bg-[#f3d9b5] p-2 rounded-2xl shadow-2xl border-4 border-[#6b4f3a]">
            <div className="relative grid grid-cols-[6fr_3fr_6fr] grid-rows-[6fr_3fr_6fr] w-full h-full gap-[1.5px] bg-[#85624d]">
                <PlayerBase color="red" />
                <div className="bg-[#fefce8]"></div>
                <PlayerBase color="green" />
                <div className="bg-[#fefce8]"></div>
                <div className="bg-[#f3d9b5] relative">
                     <div className="absolute inset-0 w-full h-full">
                        <div className="absolute w-0 h-0 border-x-[50%] border-t-[50%] border-x-transparent" style={{ borderTopColor: PLAYER_CONFIG.red.primary }}></div>
                        <div className="absolute w-0 h-0 border-y-[50%] border-r-[50%] border-y-transparent" style={{ borderRightColor: PLAYER_CONFIG.green.primary, right: 0 }}></div>
                        <div className="absolute w-0 h-0 border-x-[50%] border-b-[50%] border-x-transparent" style={{ borderBottomColor: PLAYER_CONFIG.yellow.primary, bottom: 0 }}></div>
                        <div className="absolute w-0 h-0 border-y-[50%] border-l-[50%] border-y-transparent" style={{ borderLeftColor: PLAYER_CONFIG.blue.primary, left: 0 }}></div>
                    </div>
                </div>
                <div className="bg-[#fefce8]"></div>
                <PlayerBase color="blue" />
                <div className="bg-[#fefce8]"></div>
                <PlayerBase color="yellow" />
            </div>

            {/* Path Cells */}
             <div className="absolute inset-0 p-2 pointer-events-none">
                {Object.values(PATH_COORDS).map(([row, col], i) => (
                     <div key={`path-${i}`} className="absolute w-[calc(100%/15)] h-[calc(100%/15)] bg-[#fefce8] flex justify-center items-center shadow-[inset_0_0_2px_rgba(0,0,0,0.1)]" style={{ top: `${row * (100/15)}%`, left: `${col * (100/15)}%`}}>
                        {SAFE_SPOTS.includes(i) && <StarIcon />}
                     </div>
                ))}
                
                {Object.entries(HOME_PATH_COORDS).map(([color, coords]) => (
                    Object.values(coords).map(([row, col], i) => (
                        <div key={`home-${color}-${i}`} className="absolute w-[calc(100%/15)] h-[calc(100%/15)]" style={{ top: `${row * (100/15)}%`, left: `${col * (100/15)}%`, backgroundColor: PLAYER_CONFIG[color as PlayerColor].primary, boxShadow: 'inset 0 0 4px rgba(0,0,0,0.3)' }}></div>
                    ))
                ))}

                 {/* Start positions color */}
                 {Object.entries(START_POSITIONS).map(([color, pos]) => {
                    const [row, col] = PATH_COORDS[pos];
                    const config = PLAYER_CONFIG[color as PlayerColor];
                    return <div key={`start-${color}`} className="absolute w-[calc(100%/15)] h-[calc(100%/15)]" style={{ top: `${row * (100/15)}%`, left: `${col * (100/15)}%`, backgroundColor: config.primary }}></div>
                 })}
            </div>

            {/* Pieces */}
            {pieces.map(piece => {
                const stack = getPiecesAtPosition(piece);
                // Sort stack by color so they have a consistent order in the grid
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