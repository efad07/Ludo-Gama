import { useState, useCallback, useEffect } from 'react';
import type { GameState, PlayerColor, Piece, GameStatus, PieceStatus } from '../types';
import { PLAYER_COLORS, START_POSITIONS, SAFE_SPOTS } from '../constants';

const createInitialState = (playerNames: Record<PlayerColor, string>): GameState => {
    const pieces: Record<string, Piece> = {};
    const players = {} as Record<PlayerColor, { color: PlayerColor; name: string }>;

    PLAYER_COLORS.forEach(color => {
        players[color] = { color, name: playerNames[color] };
        for (let i = 0; i < 4; i++) {
            const id = `${color}-${i}`;
            pieces[id] = {
                id,
                color,
                status: 'base',
                position: -1,
            };
        }
    });

    return {
        players,
        pieces,
        currentPlayer: 'red',
        diceValue: null,
        status: 'waiting-for-roll',
        winner: null,
        message: `${playerNames.red}, roll the dice!`,
        sixStreak: 0,
        movablePieces: [],
        isRolling: false,
        lastDiceValue: null,
        lastPlayerRolled: null,
    };
};

export const useGameLogic = (playerNames: Record<PlayerColor, string>) => {
    const [gameState, setGameState] = useState<GameState>(() => createInitialState(playerNames));
    
    useEffect(() => {
        // Reset game if player names change from settings
        setGameState(createInitialState(playerNames));
    }, [playerNames]);


    const getNextPlayer = useCallback((currentPlayer: PlayerColor): PlayerColor => {
        const currentIndex = PLAYER_COLORS.indexOf(currentPlayer);
        return PLAYER_COLORS[(currentIndex + 1) % PLAYER_COLORS.length];
    }, []);

    const checkForWinner = useCallback((pieces: Record<string, Piece>, color: PlayerColor): boolean => {
        return Object.values(pieces)
            .filter(p => p.color === color)
            .every(p => p.status === 'home');
    }, []);

    const calculateNewPosition = useCallback((piece: Piece, diceValue: number, playerColor: PlayerColor, allPieces: Record<string, Piece>): { position: number, status: PieceStatus } | null => {
        if (piece.color !== playerColor || piece.status === 'home') return null;

        // 1. Moving from base
        if (piece.status === 'base') {
            if (diceValue !== 6) return null;
            const startPos = START_POSITIONS[playerColor];
            
            // Check if the start position is blocked by an opponent's block.
            const piecesAtStart = Object.values(allPieces).filter(p => p.position === startPos && p.color !== playerColor);
            if (piecesAtStart.length >= 2) {
                const colorCounts = piecesAtStart.reduce((acc, p) => {
                    acc[p.color] = (acc[p.color] || 0) + 1;
                    return acc;
                }, {} as Record<PlayerColor, number>);
                if (Object.values(colorCounts).some(count => count >= 2)) {
                    return null; // Start is blocked by an opponent.
                }
            }
            return { position: startPos, status: 'active' };
        }

        // 2. Moving on board: Calculate path
        const path: number[] = [];
        let currentPos = piece.position;

        for (let i = 0; i < diceValue; i++) {
            if (currentPos >= 52 && currentPos < 57) { // In home path
                currentPos++;
            } else { // On main track
                const homePathEntryPredecessor = (START_POSITIONS[playerColor] + 52 - 1) % 52;
                if (currentPos === homePathEntryPredecessor) {
                    currentPos = 52; // Enter home path
                } else {
                    currentPos = (currentPos + 1) % 52;
                }
            }
            path.push(currentPos);
        }

        let finalPosition = path[path.length - 1];
        let newStatus: PieceStatus = 'active';

        if (finalPosition > 57) return null; // Overshot home path

        if (finalPosition === 57) {
            newStatus = 'home';
            finalPosition = 58; // Use 58 to signify 'finished'
        }
        
        // 3. Check for blocks along the calculated path
        for (const pos of path) {
            if (pos >= 58 || pos < 0) continue; 
            if (pos >= 52 && pos <= 57) continue; // No blocks in the home path.
            
            // Check for opponent blocks
            const opponentPiecesOnSquare = Object.values(allPieces).filter(p => p.position === pos && p.color !== playerColor);
            if (opponentPiecesOnSquare.length >= 2) {
                const colorCounts = opponentPiecesOnSquare.reduce((acc, p) => {
                    acc[p.color] = (acc[p.color] || 0) + 1;
                    return acc;
                }, {} as Record<PlayerColor, number>);

                if (Object.values(colorCounts).some(count => count >= 2)) {
                    return null; // Path is blocked by opponent
                }
            }

            // Check for self blocks (cannot pass over or form a block of 3+)
            const selfPiecesOnSquare = Object.values(allPieces).filter(p => p.position === pos && p.color === playerColor);
            if (selfPiecesOnSquare.length >= 2) {
                return null;
            }
        }

        // 4. Check if landing on a safe square occupied by an opponent
        if (newStatus === 'active' && finalPosition < 52 && SAFE_SPOTS.includes(finalPosition)) {
            const piecesAtDest = Object.values(allPieces).filter(p => p.position === finalPosition && p.color !== playerColor);
            if (piecesAtDest.length > 0) {
                return null; // Cannot land on a safe square occupied by an opponent.
            }
        }
        
        return { position: finalPosition, status: newStatus };
    }, []);
    
    const findMovablePieces = useCallback((player: PlayerColor, dice: number, pieces: Record<string, Piece>): string[] => {
        return Object.values(pieces)
            .filter(p => p.color === player && p.status !== 'home')
            .filter(p => calculateNewPosition(p, dice, player, pieces) !== null)
            .map(p => p.id);
    }, [calculateNewPosition]);

    const handlePieceMove = useCallback((pieceId: string) => {
        setGameState(prev => {
            if (prev.status !== 'waiting-for-move' || !prev.movablePieces.includes(pieceId) || !prev.diceValue) {
                return prev;
            }

            const { pieces, currentPlayer, diceValue } = prev;
            const pieceToMove = pieces[pieceId];
            
            const moveResult = calculateNewPosition(pieceToMove, diceValue, currentPlayer, pieces);
            if (!moveResult) return prev;

            const newPieces = { ...pieces };

            const opponentsAtDestination = Object.values(pieces).filter(p => 
                p.position === moveResult.position && p.color !== currentPlayer
            );
            
            const isCapture = moveResult.status === 'active' && 
                              moveResult.position < 52 && 
                              !SAFE_SPOTS.includes(moveResult.position) &&
                              opponentsAtDestination.length > 0;

            newPieces[pieceId] = { ...pieceToMove, ...moveResult };

            if (isCapture) {
                opponentsAtDestination.forEach(p => {
                    newPieces[p.id] = { ...p, status: 'base', position: -1 };
                });
            }
            
            const pieceReachedHome = moveResult.status === 'home';
            const turnContinues = diceValue === 6 || isCapture || pieceReachedHome;
            let message = '';

            if (isCapture) {
                message = `${playerNames[currentPlayer]} captured a piece! Roll again.`;
            } else if (pieceReachedHome) {
                message = `${playerNames[currentPlayer]} got a piece home! Roll again.`;
            }
            
            if (checkForWinner(newPieces, currentPlayer)) {
                return {
                    ...prev,
                    pieces: newPieces,
                    winner: currentPlayer,
                    status: 'game-over',
                    message: `${playerNames[currentPlayer]} wins!`,
                    lastDiceValue: diceValue,
                    lastPlayerRolled: currentPlayer,
                    diceValue: null,
                };
            }

            if (turnContinues) {
                return {
                    ...prev,
                    pieces: newPieces,
                    status: 'waiting-for-roll',
                    diceValue: null, // Player will roll again, clear current value
                    message: message || `${playerNames[currentPlayer]}, roll again!`,
                    movablePieces: []
                };
            } else {
                const nextPlayer = getNextPlayer(currentPlayer);
                return {
                    ...prev,
                    pieces: newPieces,
                    currentPlayer: nextPlayer,
                    diceValue: null,
                    lastDiceValue: diceValue,
                    lastPlayerRolled: currentPlayer,
                    status: 'waiting-for-roll',
                    message: `${playerNames[nextPlayer]}, roll the dice!`,
                    sixStreak: 0,
                    movablePieces: []
                };
            }
        });
    }, [calculateNewPosition, checkForWinner, getNextPlayer, playerNames]);
    
    const handleRollDice = useCallback(() => {
        setGameState(prev => {
            if (prev.status !== 'waiting-for-roll' || prev.winner || prev.isRolling) return prev;
            return { ...prev, isRolling: true, lastDiceValue: null, lastPlayerRolled: null };
        });

        const roll = Math.floor(Math.random() * 6) + 1;

        setTimeout(() => {
            setGameState(currentState => {
                let currentSixStreak = currentState.sixStreak;
                
                if (roll === 6) {
                    currentSixStreak++;
                    if (currentSixStreak === 3) {
                        setTimeout(() => {
                             setGameState(s => {
                                if (s.currentPlayer !== currentState.currentPlayer) return s;
                                const nextPlayer = getNextPlayer(currentState.currentPlayer);
                                return {
                                    ...s,
                                    currentPlayer: nextPlayer,
                                    diceValue: null,
                                    lastDiceValue: roll,
                                    lastPlayerRolled: currentState.currentPlayer,
                                    status: 'waiting-for-roll',
                                    message: `${playerNames[nextPlayer]}, roll the dice!`,
                                    sixStreak: 0,
                                };
                            });
                        }, 1000);
                        return {
                            ...currentState,
                            diceValue: roll,
                            isRolling: false,
                            sixStreak: 0,
                            message: `Oops! Three 6s. ${playerNames[currentState.currentPlayer]}'s turn is skipped.`
                        };
                    }
                } else {
                    currentSixStreak = 0;
                }

                const movable = findMovablePieces(currentState.currentPlayer, roll, currentState.pieces);

                if (movable.length > 0) {
                     const message = movable.length === 1 
                        ? `Only one move. Moving automatically...` 
                        : `${playerNames[currentState.currentPlayer]}, select a piece to move.`;
                    return {
                        ...currentState,
                        diceValue: roll,
                        isRolling: false,
                        status: 'waiting-for-move',
                        message: message,
                        movablePieces: movable,
                        sixStreak: currentSixStreak,
                    };
                } else {
                    if (roll !== 6) {
                         setTimeout(() => {
                            setGameState(s => {
                                if (s.currentPlayer !== currentState.currentPlayer) return s;
                                const nextPlayer = getNextPlayer(currentState.currentPlayer);
                                return {
                                    ...s,
                                    currentPlayer: nextPlayer,
                                    diceValue: null,
                                    lastDiceValue: roll,
                                    lastPlayerRolled: currentState.currentPlayer,
                                    status: 'waiting-for-roll',
                                    message: `${playerNames[nextPlayer]}, roll the dice!`,
                                    sixStreak: 0,
                                };
                            });
                        }, 1000);
                    }
                     
                    return {
                        ...currentState,
                        diceValue: roll,
                        isRolling: false,
                        status: roll === 6 ? 'waiting-for-roll' : currentState.status,
                        message: roll === 6 ? `${playerNames[currentState.currentPlayer]}, you got a 6! Roll again.` : `${playerNames[currentState.currentPlayer]}, no possible moves.`,
                        sixStreak: currentSixStreak,
                    };
                }
            });
        }, 1000);
    }, [playerNames, findMovablePieces, getNextPlayer]);

    useEffect(() => {
        if (gameState.status === 'waiting-for-move' && gameState.movablePieces.length === 1 && !gameState.winner) {
            const timer = setTimeout(() => {
                handlePieceMove(gameState.movablePieces[0]);
            }, 1200);

            return () => clearTimeout(timer);
        }
    }, [gameState.status, gameState.movablePieces, gameState.winner, handlePieceMove]);

    const handleResetGame = useCallback(() => {
        setGameState(createInitialState(playerNames));
    }, [playerNames]);

    return { gameState, handleRollDice, handlePieceMove, handleResetGame };
};