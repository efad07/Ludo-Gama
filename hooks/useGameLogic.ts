
import { useState, useCallback, useEffect, useRef } from 'react';
import type { GameState, PlayerColor, Piece, GameStatus, PieceStatus } from '../types';
import { PLAYER_COLORS, START_POSITIONS, SAFE_SPOTS } from '../constants';
import Peer, { DataConnection } from 'peerjs';

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
        
        // Online Initial State
        isOnline: false,
        myColor: null,
        roomId: null,
        onlineStatus: 'offline'
    };
};

// Simple random ID generator for rooms
const generateRoomId = () => Math.random().toString(36).substring(2, 8).toUpperCase();

export const useGameLogic = (playerNames: Record<PlayerColor, string>) => {
    const [gameState, setGameState] = useState<GameState>(() => createInitialState(playerNames));
    
    // Refs for PeerJS
    const peerRef = useRef<Peer | null>(null);
    const connRef = useRef<DataConnection | null>(null);
    const isHostRef = useRef<boolean>(false);

    // --- Online Multiplayer Logic ---

    // Initialize Online Game (Called by Settings -> Invite)
    const initializeHost = useCallback(async (): Promise<string> => {
        if (peerRef.current) peerRef.current.destroy();

        const roomId = generateRoomId();
        const peer = new Peer(roomId); // We try to use the RoomID as the PeerID for simplicity
        
        return new Promise((resolve, reject) => {
            peer.on('open', (id) => {
                peerRef.current = peer;
                isHostRef.current = true;
                
                setGameState(prev => ({
                    ...prev,
                    isOnline: true,
                    myColor: 'red', // Host is always Red
                    roomId: id,
                    onlineStatus: 'connecting',
                    message: 'Waiting for friend to join...'
                }));

                peer.on('connection', (conn) => {
                    connRef.current = conn;
                    
                    conn.on('open', () => {
                        // Connection established! Send current state to guest
                        setGameState(prev => {
                           const newState = { 
                               ...prev, 
                               onlineStatus: 'connected' as const, 
                               message: 'Friend joined! Game starting.' 
                           };
                           // Send full state immediately
                           conn.send({ type: 'SYNC_STATE', payload: newState });
                           return newState;
                        });
                    });

                    conn.on('data', (data: any) => {
                        handleRemoteData(data);
                    });
                    
                    conn.on('close', () => {
                         setGameState(prev => ({ ...prev, onlineStatus: 'error', message: 'Friend disconnected.' }));
                    });
                });

                resolve(id);
            });

            peer.on('error', (err) => {
                console.error("Peer Error:", err);
                setGameState(prev => ({ ...prev, onlineStatus: 'error', message: 'Connection failed. Try again.' }));
                reject(err);
            });
        });
    }, []);

    // Join Online Game (Called on mount if URL has ?room=)
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const roomIdFromUrl = params.get('room');

        if (roomIdFromUrl && !peerRef.current) {
             // We are the Guest
             const peer = new Peer();
             peerRef.current = peer;
             isHostRef.current = false;

             peer.on('open', () => {
                setGameState(prev => ({
                    ...prev,
                    isOnline: true,
                    myColor: 'green', // Guest is Green (for 2 player default)
                    roomId: roomIdFromUrl,
                    onlineStatus: 'connecting',
                    message: 'Connecting to host...'
                }));

                const conn = peer.connect(roomIdFromUrl);
                connRef.current = conn;

                conn.on('open', () => {
                    setGameState(prev => ({ ...prev, onlineStatus: 'connected', message: 'Connected!' }));
                    // Request state or just wait for Host to send it
                });

                conn.on('data', (data: any) => {
                    handleRemoteData(data);
                });
                
                conn.on('error', () => {
                     setGameState(prev => ({ ...prev, onlineStatus: 'error', message: 'Could not connect to room.' }));
                });
             });
        }
        
        return () => {
            // Cleanup on unmount is tricky with strict mode double-mount, 
            // usually we want to keep connection alive if possible, but for safety:
            // peerRef.current?.destroy(); 
        };
    }, []);

    // Handle incoming data from Peer
    const handleRemoteData = (data: any) => {
        if (data.type === 'SYNC_STATE') {
            setGameState(prev => {
                // Merge remote state but keep our local identity (myColor)
                return {
                    ...data.payload,
                    myColor: prev.myColor, 
                    isOnline: true,
                    onlineStatus: 'connected'
                };
            });
        } else if (data.type === 'ACTION_UPDATE') {
             // Receive specific update (like roll or move)
             setGameState(prev => {
                 const newState = {
                     ...prev,
                     ...data.payload,
                     myColor: prev.myColor // Persist identity
                 };
                 return newState;
             });
        }
    };

    // Broadcast state changes
    const broadcastState = (newState: GameState) => {
        if (connRef.current && connRef.current.open) {
            // We send the whole state for simplicity to ensure sync
            // But we strip out local-only fields if necessary.
            connRef.current.send({ type: 'ACTION_UPDATE', payload: newState });
        }
    };

    // --- Core Logic ---

    useEffect(() => {
        // Reset game if player names change from settings (Only if offline)
        if (!gameState.isOnline) {
            setGameState(createInitialState(playerNames));
        }
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
            
            // Check if the start position is blocked by an opponent's block (2 or more pieces).
            const piecesAtStart = (Object.values(allPieces) as Piece[]).filter(p => p.position === startPos && p.color !== playerColor);
            if (piecesAtStart.length >= 2) {
                const colorCounts = piecesAtStart.reduce((acc, p) => {
                    acc[p.color] = (acc[p.color] || 0) + 1;
                    return acc;
                }, {} as Record<PlayerColor, number>);
                if (Object.values(colorCounts).some(count => count >= 2)) {
                    return null; // Start is blocked by an opponent.
                }
            }
            
            // Check if we already have 4 pieces at start (full stack)
            const myPiecesAtStart = (Object.values(allPieces) as Piece[]).filter(p => p.position === startPos && p.color === playerColor);
            if (myPiecesAtStart.length >= 4) {
                return null; // Cannot add a 5th piece
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
            const isDestination = pos === finalPosition;

            if (pos >= 58 || pos < 0) continue; 
            if (pos >= 52 && pos <= 57) continue; // No blocks in the home path.
            
            // Check for opponent blocks
            const opponentPiecesOnSquare = (Object.values(allPieces) as Piece[]).filter(p => p.position === pos && p.color !== playerColor);
            if (opponentPiecesOnSquare.length >= 2) {
                const colorCounts = opponentPiecesOnSquare.reduce((acc, p) => {
                    acc[p.color] = (acc[p.color] || 0) + 1;
                    return acc;
                }, {} as Record<PlayerColor, number>);

                if (Object.values(colorCounts).some(count => count >= 2)) {
                    return null; // Path is blocked by opponent
                }
            }

            // Check for self blocks (stacking)
            const selfPiecesOnSquare = (Object.values(allPieces) as Piece[]).filter(p => p.position === pos && p.color === playerColor);
            
            if (isDestination) {
                // If it's the destination, we allow stacking up to 4 pieces.
                if (selfPiecesOnSquare.length >= 4) {
                    return null; // Square is full (max 4)
                }
            } else {
                // If passing through, we cannot pass a block (wall) of 2 or more pieces.
                if (selfPiecesOnSquare.length >= 2) {
                    return null;
                }
            }
        }

        // 4. Check if landing on a safe square occupied by an opponent
        if (newStatus === 'active' && finalPosition < 52 && SAFE_SPOTS.includes(finalPosition)) {
            const piecesAtDest = (Object.values(allPieces) as Piece[]).filter(p => p.position === finalPosition && p.color !== playerColor);
            if (piecesAtDest.length > 0) {
                return null; // Cannot land on a safe square occupied by an opponent.
            }
        }
        
        return { position: finalPosition, status: newStatus };
    }, []);
    
    const findMovablePieces = useCallback((player: PlayerColor, dice: number, pieces: Record<string, Piece>): string[] => {
        return (Object.values(pieces) as Piece[])
            .filter(p => p.color === player && p.status !== 'home')
            .filter(p => calculateNewPosition(p, dice, player, pieces) !== null)
            .map(p => p.id);
    }, [calculateNewPosition]);

    const handlePieceMove = useCallback((pieceId: string) => {
        setGameState(prev => {
            // Online Protection: Prevent moving if not your turn or not your color
            if (prev.isOnline && prev.currentPlayer !== prev.myColor) return prev;

            if (prev.status !== 'waiting-for-move' || !prev.movablePieces.includes(pieceId) || !prev.diceValue) {
                return prev;
            }

            const { pieces, currentPlayer, diceValue } = prev;
            const pieceToMove = pieces[pieceId];
            
            const moveResult = calculateNewPosition(pieceToMove, diceValue, currentPlayer, pieces);
            if (!moveResult) return prev;

            const newPieces = { ...pieces };

            const opponentsAtDestination = (Object.values(pieces) as Piece[]).filter((p) => 
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
            
            let newState = { ...prev };

            if (checkForWinner(newPieces, currentPlayer)) {
                newState = {
                    ...prev,
                    pieces: newPieces,
                    winner: currentPlayer,
                    status: 'game-over',
                    message: `${playerNames[currentPlayer]} wins!`,
                    lastDiceValue: diceValue,
                    lastPlayerRolled: currentPlayer,
                    diceValue: null,
                };
            } else if (turnContinues) {
                newState = {
                    ...prev,
                    pieces: newPieces,
                    status: 'waiting-for-roll',
                    diceValue: null,
                    message: message || `${playerNames[currentPlayer]}, roll again!`,
                    movablePieces: []
                };
            } else {
                const nextPlayer = getNextPlayer(currentPlayer);
                newState = {
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
            
            if (newState.isOnline) broadcastState(newState);
            return newState;
        });
    }, [calculateNewPosition, checkForWinner, getNextPlayer, playerNames]);
    
    const handleRollDice = useCallback(() => {
        if (gameState.isOnline && gameState.currentPlayer !== gameState.myColor) {
            console.log("Not your turn!");
            return; // Prevent rolling if it's not your turn online
        }

        setGameState(prev => {
            if (prev.status !== 'waiting-for-roll' || prev.winner || prev.isRolling) return prev;
            const newState = { ...prev, isRolling: true, lastDiceValue: null, lastPlayerRolled: null };
            if (prev.isOnline) broadcastState(newState);
            return newState;
        });

        const roll = Math.floor(Math.random() * 6) + 1;

        setTimeout(() => {
            setGameState(currentState => {
                let currentSixStreak = currentState.sixStreak;
                let newState = { ...currentState };
                
                if (roll === 6) {
                    currentSixStreak++;
                    if (currentSixStreak === 3) {
                        setTimeout(() => {
                             setGameState(s => {
                                if (s.currentPlayer !== currentState.currentPlayer) return s;
                                const nextPlayer = getNextPlayer(currentState.currentPlayer);
                                const skippedState = {
                                    ...s,
                                    currentPlayer: nextPlayer,
                                    diceValue: null,
                                    lastDiceValue: roll,
                                    lastPlayerRolled: currentState.currentPlayer,
                                    status: 'waiting-for-roll',
                                    message: `${playerNames[nextPlayer]}, roll the dice!`,
                                    sixStreak: 0,
                                };
                                if (s.isOnline) broadcastState(skippedState);
                                return skippedState;
                            });
                        }, 1000);
                        
                        newState = {
                            ...currentState,
                            diceValue: roll,
                            isRolling: false,
                            sixStreak: 0,
                            message: `Oops! Three 6s. ${playerNames[currentState.currentPlayer]}'s turn is skipped.`
                        };
                        if (currentState.isOnline) broadcastState(newState);
                        return newState;
                    }
                } else {
                    currentSixStreak = 0;
                }

                const movable = findMovablePieces(currentState.currentPlayer, roll, currentState.pieces);

                if (movable.length > 0) {
                     const message = movable.length === 1 
                        ? `Only one move. Moving automatically...` 
                        : `${playerNames[currentState.currentPlayer]}, select a piece to move.`;
                    newState = {
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
                                const nextTurnState = {
                                    ...s,
                                    currentPlayer: nextPlayer,
                                    diceValue: null,
                                    lastDiceValue: roll,
                                    lastPlayerRolled: currentState.currentPlayer,
                                    status: 'waiting-for-roll',
                                    message: `${playerNames[nextPlayer]}, roll the dice!`,
                                    sixStreak: 0,
                                };
                                if (s.isOnline) broadcastState(nextTurnState);
                                return nextTurnState;
                            });
                        }, 1000);
                    }
                     
                    newState = {
                        ...currentState,
                        diceValue: roll,
                        isRolling: false,
                        status: roll === 6 ? 'waiting-for-roll' : currentState.status,
                        message: roll === 6 ? `${playerNames[currentState.currentPlayer]}, you got a 6! Roll again.` : `${playerNames[currentState.currentPlayer]}, no possible moves.`,
                        sixStreak: currentSixStreak,
                    };
                }
                
                if (currentState.isOnline) broadcastState(newState);
                return newState;
            });
        }, 1000);
    }, [playerNames, findMovablePieces, getNextPlayer, gameState.isOnline, gameState.currentPlayer, gameState.myColor]);

    useEffect(() => {
        // Auto-move logic remains, but checked against `myColor` in `handlePieceMove`
        if (gameState.status === 'waiting-for-move' && gameState.movablePieces.length === 1 && !gameState.winner) {
            // Only the player controlling this color should trigger the auto-move online
            if (!gameState.isOnline || gameState.currentPlayer === gameState.myColor) {
                const timer = setTimeout(() => {
                    handlePieceMove(gameState.movablePieces[0]);
                }, 1200);
                return () => clearTimeout(timer);
            }
        }
    }, [gameState.status, gameState.movablePieces, gameState.winner, handlePieceMove, gameState.isOnline, gameState.currentPlayer, gameState.myColor]);

    const handleResetGame = useCallback(() => {
        const newState = createInitialState(playerNames);
        setGameState(newState);
        if (gameState.isOnline) broadcastState(newState);
    }, [playerNames, gameState.isOnline]);

    return { gameState, handleRollDice, handlePieceMove, handleResetGame, initializeHost };
};
