
export type PlayerColor = 'red' | 'green' | 'yellow' | 'blue';

export type PieceStatus = 'base' | 'active' | 'home';

export interface Piece {
    id: string;
    color: PlayerColor;
    status: PieceStatus;
    position: number; // -1 for base, 0-51 for main track, 52-57 for home stretch, 58 for finished
}

export interface Player {
    color: PlayerColor;
    name: string;
}

export type GameStatus = 'waiting-for-roll' | 'waiting-for-move' | 'game-over';

export interface GameState {
    players: Record<PlayerColor, Player>;
    pieces: Record<string, Piece>;
    currentPlayer: PlayerColor;
    diceValue: number | null;
    status: GameStatus;
    winner: PlayerColor | null;
    message: string;
    sixStreak: number;
    movablePieces: string[];
    isRolling: boolean;
    lastDiceValue: number | null;
    lastPlayerRolled: PlayerColor | null;
    
    // Online Multiplayer Fields
    isOnline: boolean;
    myColor: PlayerColor | null; // The color this client controls (null if local/offline)
    roomId: string | null;
    onlineStatus: 'connecting' | 'connected' | 'offline' | 'error';
}

export interface GameSettings {
    playerNames: Record<PlayerColor, string>;
}
