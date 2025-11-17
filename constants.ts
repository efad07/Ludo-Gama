import type { PlayerColor } from './types';

export const PLAYER_COLORS: PlayerColor[] = ['red', 'green', 'yellow', 'blue'];

export const START_POSITIONS: Record<PlayerColor, number> = {
    red: 0,
    green: 13,
    yellow: 26,
    blue: 39
};

// Helper function to generate the 52-step main track path for a player
const generatePlayerPath = (startPos: number): number[] => {
    return Array.from({ length: 52 }, (_, i) => (startPos + i) % 52);
};

export const PLAYER_CONFIG: Record<PlayerColor, { name: string; primary: string; path: number[] }> = {
    red: {
        name: 'Red Player',
        primary: '#a12d2d',
        path: generatePlayerPath(START_POSITIONS.red)
    },
    green: {
        name: 'Green Player',
        primary: '#1a7431',
        path: generatePlayerPath(START_POSITIONS.green)
    },
    yellow: {
        name: 'Yellow Player',
        primary: '#b45309',
        path: generatePlayerPath(START_POSITIONS.yellow)
    },
    blue: {
        name: 'Blue Player',
        primary: '#1e40af',
        path: generatePlayerPath(START_POSITIONS.blue)
    },
};

// Map path index to grid coordinates [row, col]
export const PATH_COORDS: { [key: number]: [number, number] } = {
    0: [6, 1], 1: [6, 2], 2: [6, 3], 3: [6, 4], 4: [6, 5],
    5: [5, 6], 6: [4, 6], 7: [3, 6], 8: [2, 6], 9: [1, 6],
    10: [0, 6], 11: [0, 7], 12: [0, 8],
    13: [1, 8], 14: [2, 8], 15: [3, 8], 16: [4, 8], 17: [5, 8],
    18: [6, 9], 19: [6, 10], 20: [6, 11], 21: [6, 12], 22: [6, 13],
    23: [6, 14], 24: [7, 14], 25: [8, 14],
    26: [8, 13], 27: [8, 12], 28: [8, 11], 29: [8, 10], 30: [8, 9],
    31: [9, 8], 32: [10, 8], 33: [11, 8], 34: [12, 8], 35: [13, 8],
    36: [14, 8], 37: [14, 7], 38: [14, 6],
    39: [13, 6], 40: [12, 6], 41: [11, 6], 42: [10, 6], 43: [9, 6],
    44: [8, 5], 45: [8, 4], 46: [8, 3], 47: [8, 2], 48: [8, 1],
    49: [8, 0], 50: [7, 0], 51: [6, 0]
};

export const HOME_PATH_COORDS: Record<PlayerColor, { [key: number]: [number, number] }> = {
    red: {
        52: [7, 1], 53: [7, 2], 54: [7, 3], 55: [7, 4], 56: [7, 5], 57: [7, 6]
    },
    green: {
        52: [1, 7], 53: [2, 7], 54: [3, 7], 55: [4, 7], 56: [5, 7], 57: [6, 7]
    },
    yellow: {
        52: [7, 13], 53: [7, 12], 54: [7, 11], 55: [7, 10], 56: [7, 9], 57: [7, 8]
    },
    blue: {
        52: [13, 7], 53: [12, 7], 54: [11, 7], 55: [10, 7], 56: [9, 7], 57: [8, 7]
    }
};

export const BASE_COORDS: Record<PlayerColor, [number, number][]> = {
    red: [[1.5, 1.5], [1.5, 3.5], [3.5, 1.5], [3.5, 3.5]],
    green: [[1.5, 10.5], [1.5, 12.5], [3.5, 10.5], [3.5, 12.5]],
    yellow: [[10.5, 10.5], [10.5, 12.5], [12.5, 10.5], [12.5, 12.5]],
    blue: [[10.5, 1.5], [10.5, 3.5], [12.5, 1.5], [12.5, 3.5]]
};

export const HOME_COORDS: Record<PlayerColor, [number, number]> = {
    red: [7, 7],
    green: [7, 7],
    yellow: [7, 7],
    blue: [7, 7]
};

export const SAFE_SPOTS = [0, 8, 13, 21, 26, 34, 39, 47];
