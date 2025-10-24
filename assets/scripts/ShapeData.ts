/**
 * Shape Data Definitions
 * Contains all available shape patterns for the game.
 * Each shape is defined as a 2D array where:
 * - 1 represents a filled cell (block)
 * - 0 represents an empty cell
 */

export const SHAPES = {
    /** O-shape: 2x2 square */
    O: [
        [1, 1],
        [1, 1]
    ],
    
    /** I-shape: 4-cell vertical line */
    I: [
        [1],
        [1],
        [1],
        [1]
    ],
    
    /** T-shape: T-tetromino */
    T: [
        [1, 1, 1],
        [0, 1, 0]
    ],
    
    /** L-shape: L-tetromino */
    L: [
        [1, 0],
        [1, 0],
        [1, 1]
    ],
    
    /** J-shape: Mirrored L-tetromino */
    J: [
        [0, 1],
        [0, 1],
        [1, 1]
    ],
    
    /** S-shape: S-tetromino */
    S: [
        [0, 1, 1],
        [1, 1, 0]
    ],
    
    /** Z-shape: Z-tetromino */
    Z: [
        [1, 1, 0],
        [0, 1, 1]
    ],
    
    /** Single block: 1x1 */
    SINGLE: [
        [1]
    ]
};

/** Array of shape keys for random selection */
export const SHAPE_KEYS = Object.keys(SHAPES);