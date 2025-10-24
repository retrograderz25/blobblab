import { _decorator, Component, Node, Prefab, Label, UITransform, v3, instantiate, sys, tween, Vec3, director, Graphics } from 'cc';
import { Block } from './Block';
import { SwipeDirection } from './InputManager';
import { BlockPool } from './BlockPool';
import { GameOverUI } from './GameOverUI';
import { EffectPool } from './EffectPool';
import { Shape } from './Shape';
import { SHAPES, SHAPE_KEYS } from './ShapeData';
import { NextBlockPreview } from './NextBlockPreview';

const { ccclass, property } = _decorator;

/**
 * GameManager Component
 * Core game logic controller managing the game board, shapes, scoring, and game flow.
 * Handles shape spawning, movement, line clearing, and game state transitions.
 */
@ccclass('GameManager')
export class GameManager extends Component {
    /** UI button to pause the game */
    @property(Node)
    pauseButton: Node = null;
    
    /** Panel displayed when game is paused */
    @property(Node)
    pausePanel: Node = null;
    
    /** Button to resume from pause */
    @property(Node)
    resumeButton: Node = null;
    
    /** Button to return to menu from pause screen */
    @property(Node)
    menuButtonInPause: Node = null;
    
    /** Container node for the game board */
    @property(Node) 
    boardNode: Node = null;
    
    /** Node managing input detection */
    @property(Node) 
    inputManagerNode: Node = null;
    
    /** Pool managing block creation and recycling */
    @property(BlockPool) 
    blockPool: BlockPool = null;
    
    /** Prefab for board cell backgrounds */
    @property(Prefab) 
    cellPrefab: Prefab = null;
    
    /** Label displaying current score */
    @property(Label) 
    scoreLabel: Label = null;
    
    /** Game over UI panel */
    @property(GameOverUI) 
    gameOverPanel: GameOverUI = null;
    
    /** Pool managing particle effects */
    @property(EffectPool) 
    effectPool: EffectPool = null;
    
    /** Component showing preview of upcoming shapes */
    @property(NextBlockPreview) 
    nextBlockPreview: NextBlockPreview = null;
    
    /** Size of the board grid (8, 12, or 16) */
    @property 
    boardSize: number = 8;
    
    /** Visual border around the board */
    @property(Node)
    boardBorder: Node = null;

    /** Size of each cell in pixels */
    private cellSize: number = 0;
    
    /** Gap between cells in pixels */
    private spacing: number = 0;
    
    /** Current game score */
    private score: number = 0;
    
    /** Best score for current board size */
    private highScore: number = 0;
    
    /** Whether the game has ended */
    private isGameOver: boolean = false;
    
    /** Whether shapes are currently moving (prevents multiple simultaneous moves) */
    private isMoving: boolean = false;

    /** 2D array representing the game board state */
    private blocks: (Block | null)[][] = [];
    
    /** Array of all shape groups currently on the board */
    private shapesOnBoard: Shape[] = [];

    /** Whether the game is paused */
    private isPaused: boolean = false;

    onLoad() {
        this.inputManagerNode.on('swipe-detected', this.handleSwipe, this);
        this.pauseButton.on(Node.EventType.TOUCH_END, this.pauseGame, this);
        this.resumeButton.on(Node.EventType.TOUCH_END, this.resumeGame, this);
        this.menuButtonInPause.on(Node.EventType.TOUCH_END, this.backToMenu, this);
        
        const selectedSize = parseInt(sys.localStorage.getItem('selectedBoardSize') || '8');
        this.boardSize = selectedSize;
        this.highScore = parseInt(sys.localStorage.getItem(`blobblab_highscore_${this.boardSize}`) || '0');
        
        if (this.gameOverPanel) {
            this.gameOverPanel.node.active = false;
        }
        if (this.pausePanel) {
            this.pausePanel.active = false;
        }
        this.initBoard();
    }

    /**
     * Returns to the main menu scene
     */
    backToMenu() {
        if (this.isPaused) {
            director.resume();
        }
        director.loadScene('Menu');
    }

    /**
     * Pauses the game and displays pause panel
     */
    pauseGame() {
        if (this.isGameOver) return;

        this.isPaused = true;
        this.pausePanel.active = true;
        director.pause();
    }

    /**
     * Resumes the game from pause state
     */
    resumeGame() {
        this.isPaused = false;
        this.pausePanel.active = false;
        director.resume();
    }

    start() {
        this.startGame();
    }

    /**
     * Initializes the game board with responsive sizing
     * Creates cell backgrounds and sets up the board grid based on screen size
     */
    initBoard() {
        const canvasSize = this.boardNode.parent.getComponent(UITransform).contentSize;
        
        const availableWidth = canvasSize.width * 0.90;
        const availableHeight = canvasSize.height * 0.65;
        const boardSizeLimit = Math.min(availableWidth, availableHeight);
        
        const totalCellSize = boardSizeLimit / this.boardSize;
        this.cellSize = totalCellSize * 0.88;
        this.spacing = totalCellSize * 0.12;

        console.log(`Responsive Board: Canvas=${canvasSize.width}x${canvasSize.height}, BoardSize=${this.boardSize}, CellSize=${this.cellSize}, Spacing=${this.spacing}`);

        this.boardNode.removeAllChildren();
        this.blocks = [];
        const boardActualWidth = this.boardSize * (this.cellSize + this.spacing) - this.spacing;
        this.boardNode.getComponent(UITransform).setContentSize(boardActualWidth, boardActualWidth);
        const startX = -boardActualWidth / 2 + this.cellSize / 2;
        const startY = boardActualWidth / 2 - this.cellSize / 2;

        for (let row = 0; row < this.boardSize; row++) {
            this.blocks[row] = [];
            for (let col = 0; col < this.boardSize; col++) {
                const cell = instantiate(this.cellPrefab);
                this.boardNode.addChild(cell);
                const cellTransform = cell.getComponent(UITransform);
                cellTransform.setContentSize(this.cellSize, this.cellSize);
                const x = startX + col * (this.cellSize + this.spacing);
                const y = startY - row * (this.cellSize + this.spacing);
                cell.setPosition(v3(x, y));
                this.blocks[row][col] = null;
            }
        }
        
        // Draw board border
        if (this.boardBorder) {
            let graphics = this.boardBorder.getComponent(Graphics);
            if (!graphics) {
                graphics = this.boardBorder.addComponent(Graphics);
            }

            graphics.clear();
            graphics.strokeColor.set(150, 150, 150, 255);
            graphics.lineWidth = this.spacing;

            const width = this.boardNode.getComponent(UITransform).width;
            const height = this.boardNode.getComponent(UITransform).height;
            graphics.rect(-width / 2, -height / 2, width, height);
            graphics.stroke();
        }
    }

    /**
     * Starts a new game by resetting all game state
     */
    startGame() {
        this.isGameOver = false;
        this.isMoving = false;
        if (this.gameOverPanel) this.gameOverPanel.node.active = false;
        if (this.blockPool) this.blockPool.despawnAll();

        this.blocks = [];
        for (let r = 0; r < this.boardSize; r++) {
            this.blocks[r] = [];
            for (let c = 0; c < this.boardSize; c++) this.blocks[r][c] = null;
        }
        this.shapesOnBoard = [];

        if (this.nextBlockPreview) {
            this.nextBlockPreview.reset();
        }

        this.updateScore(0);
        this.spawnNewShape();

        this.scheduleOnce(() => this.updateAllBorders(), 0.3);
    }

    /**
     * Spawns a new shape on the board
     * Uses next block preview if available, otherwise generates randomly
     */
    spawnNewShape() {
        if (!this.blockPool || this.blockPool.blockSprites.length === 0) {
            console.error("BlockPool is not ready or has no sprites!");
            return;
        }

        let randomShapeKey: string;
        let randomColorSprite: any;

        if (this.nextBlockPreview) {
            const nextBlock = this.nextBlockPreview.getNextBlock();
            randomShapeKey = nextBlock.shapeKey;
            randomColorSprite = nextBlock.sprite;
        } else {
            randomShapeKey = SHAPE_KEYS[Math.floor(Math.random() * SHAPE_KEYS.length)];
            const blockSprites = this.blockPool.blockSprites;
            randomColorSprite = blockSprites[Math.floor(Math.random() * blockSprites.length)];
        }

        const shapeMatrix = SHAPES[randomShapeKey];
        const emptySpot = this.findEmptySpotForShape(shapeMatrix);

        if (emptySpot) {
            const newShape = new Shape();

            for (let r = 0; r < shapeMatrix.length; r++) {
                for (let c = 0; c < shapeMatrix[r].length; c++) {
                    if (shapeMatrix[r][c] === 1) {
                        const boardRow = emptySpot.row + r;
                        const boardCol = emptySpot.col + c;
                        const blockComp = this.blockPool.spawn(this.boardNode, this.cellSize, this.cellSize, randomColorSprite, this.spacing);
                        blockComp.row = boardRow;
                        blockComp.col = boardCol;
                        newShape.addBlock(blockComp);
                        this.blocks[boardRow][boardCol] = blockComp;
                        this.updateBlockPosition(blockComp, false);

                        const blockNode = blockComp.node;
                        blockNode.setScale(Vec3.ZERO);
                        tween(blockNode).to(0.2, { scale: Vec3.ONE }, { easing: 'backOut' }).start();
                    }
                }
            }
            this.shapesOnBoard.push(newShape);
        } else {
            this.endGame();
        }
    }

    /**
     * Finds a random empty position where the shape can be placed
     * @param shapeMatrix 2D array representing the shape
     * @returns Position {row, col} or null if no space available
     */
    findEmptySpotForShape(shapeMatrix: number[][]): { row: number, col: number } | null {
        const shapeHeight = shapeMatrix.length;
        const shapeWidth = shapeMatrix[0].length;
        const possiblePositions: { row: number, col: number }[] = [];

        for (let r = 0; r <= this.boardSize - shapeHeight; r++) {
            for (let c = 0; c <= this.boardSize - shapeWidth; c++) {
                if (this.canPlaceShapeAt(shapeMatrix, r, c)) {
                    possiblePositions.push({ row: r, col: c });
                }
            }
        }

        if (possiblePositions.length > 0) {
            return possiblePositions[Math.floor(Math.random() * possiblePositions.length)];
        }
        return null;
    }

    /**
     * Checks if a shape can be placed at the specified position
     * @param shapeMatrix Shape to check
     * @param startRow Starting row position
     * @param startCol Starting column position
     * @returns True if the shape fits without collision
     */
    canPlaceShapeAt(shapeMatrix: number[][], startRow: number, startCol: number): boolean {
        for (let r = 0; r < shapeMatrix.length; r++) {
            for (let c = 0; c < shapeMatrix[r].length; c++) {
                if (shapeMatrix[r][c] === 1) {
                    if (this.blocks[startRow + r][startCol + c]) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    /**
     * Handles swipe input and triggers shape movement
     * @param direction Direction of the swipe
     */
    handleSwipe(direction: SwipeDirection) {
        if (this.isMoving || this.isGameOver || this.isPaused) return;
        if (this.moveShapes(direction)) {
            this.isMoving = true;
            this.scheduleOnce(() => {
                this.updateAllBorders();
                this.checkAndClearLines();

                this.scheduleOnce(() => {
                    this.spawnNewShape();
                    this.updateAllBorders();
                    if (!this.isGameOver) this.checkGameOver();
                    this.isMoving = false;
                }, 0.3);
            }, 0.15);
        }
    }

    /**
     * Moves all shapes in the specified direction
     * Implements gravity-like behavior where shapes slide as far as possible
     * @param direction Direction to move shapes
     * @returns True if any shape moved
     */
    moveShapes(direction: SwipeDirection): boolean {
        let hasMovedOverall = false;
        let dr = 0, dc = 0;

        if (direction === SwipeDirection.UP) dr = -1;
        if (direction === SwipeDirection.DOWN) dr = 1;
        if (direction === SwipeDirection.LEFT) dc = -1;
        if (direction === SwipeDirection.RIGHT) dc = 1;

        // Continuously move shapes until no more movement is possible
        while (true) {
            let movedInThisStep = false;
            const shapesToMove: Shape[] = [];

            // Identify all shapes that can move one step
            for (const shape of this.shapesOnBoard) {
                let canMove = true;
                if (shape.childBlocks.length === 0) continue;

                for (const block of shape.childBlocks) {
                    const nextRow = block.row + dr;
                    const nextCol = block.col + dc;

                    // Check wall collision
                    if (nextRow < 0 || nextRow >= this.boardSize || nextCol < 0 || nextCol >= this.boardSize) {
                        canMove = false;
                        break;
                    }

                    // Check collision with other shapes
                    const obstacle = this.blocks[nextRow][nextCol];
                    if (obstacle && obstacle.parentShape.id !== shape.id) {
                        canMove = false;
                        break;
                    }
                }

                if (canMove) {
                    shapesToMove.push(shape);
                }
            }

            // Move all movable shapes one step
            if (shapesToMove.length > 0) {
                movedInThisStep = true;
                hasMovedOverall = true;

                for (const shape of shapesToMove) {
                    // Sort blocks to update grid correctly based on direction
                    const sortedChildBlocks = [...shape.childBlocks].sort((a, b) => {
                        if (dr === 1) return b.row - a.row;
                        if (dr === -1) return a.row - b.row;
                        if (dc === 1) return b.col - a.col;
                        if (dc === -1) return a.col - b.col;
                        return 0;
                    });

                    for (const block of sortedChildBlocks) {
                        const oldRow = block.row;
                        const oldCol = block.col;
                        this.blocks[oldRow][oldCol] = null;
                    }
                    for (const block of sortedChildBlocks) {
                        const newRow = block.row + dr;
                        const newCol = block.col + dc;
                        block.row = newRow;
                        block.col = newCol;
                        this.blocks[newRow][newCol] = block;
                    }
                }
            }

            if (!movedInThisStep) {
                break;
            }
        }

        // Update visual positions after all movement calculations
        if (hasMovedOverall) {
            for (const shape of this.shapesOnBoard) {
                for (const block of shape.childBlocks) {
                    this.updateBlockPosition(block, true);
                }
            }
        }

        return hasMovedOverall;
    }
    /**
     * Checks for complete rows/columns and clears them
     * Cleared blocks are removed with particle effects and scoring is updated
     */
    checkAndClearLines() {
        const rowsToClear: number[] = [], colsToClear: number[] = [];
        for (let r = 0; r < this.boardSize; r++) { if (this.blocks[r] && this.blocks[r].every(b => !!b)) rowsToClear.push(r); }
        for (let c = 0; c < this.boardSize; c++) { let isFull = true; for (let r = 0; r < this.boardSize; r++) if (!this.blocks[r][c]) { isFull = false; break; } if (isFull) colsToClear.push(c); }

        const blocksToClear: Set<Block> = new Set();
        for (const r of rowsToClear) for (let c = 0; c < this.boardSize; c++) if (this.blocks[r][c]) blocksToClear.add(this.blocks[r][c]);
        for (const c of colsToClear) for (let r = 0; r < this.boardSize; r++) if (this.blocks[r][c]) blocksToClear.add(this.blocks[r][c]);

        if (blocksToClear.size > 0) {
            let linesCleared = rowsToClear.length + colsToClear.length;
            this.updateScore(this.score + (10 * linesCleared * linesCleared));

            blocksToClear.forEach(block => {
                this.blocks[block.row][block.col] = null;
                if (block.parentShape) {
                    block.parentShape.removeBlock(block);
                }
                if (this.effectPool) this.effectPool.spawn(this.boardNode, block.node.position);
                tween(block.node).to(0.2, { scale: Vec3.ZERO }).call(() => {
                    this.blockPool.despawn(block.node);
                    block.node.setScale(Vec3.ONE);
                }).start();
            });
            this.restructureShapes();
        }
    }

    /**
     * Restructures shapes after blocks are removed
     * Splits shapes that have become disconnected into separate shape groups
     * Uses flood fill algorithm to identify connected components
     */
    restructureShapes() {
        const newShapes: Shape[] = [];
        const visited: Set<Block> = new Set();

        for (const oldShape of this.shapesOnBoard) {
            for (const block of oldShape.childBlocks) {
                if (visited.has(block)) continue;
                const newShape = new Shape();
                const queue: Block[] = [block];
                visited.add(block);
                while (queue.length > 0) {
                    const current = queue.shift();
                    newShape.addBlock(current);
                    const neighbors = [{ r: current.row + 1, c: current.col }, { r: current.row - 1, c: current.col }, { r: current.row, c: current.col + 1 }, { r: current.row, c: current.col - 1 }];
                    for (const n of neighbors) {
                        if (n.r >= 0 && n.r < this.boardSize && n.c >= 0 && n.c < this.boardSize) {
                            const neighborBlock = this.blocks[n.r][n.c];
                            if (neighborBlock && !visited.has(neighborBlock) && neighborBlock.parentShape.id === oldShape.id) {
                                visited.add(neighborBlock);
                                queue.push(neighborBlock);
                            }
                        }
                    }
                }
                if (newShape.childBlocks.length > 0) {
                    newShapes.push(newShape);
                }
            }
        }
        this.shapesOnBoard = newShapes;
    }

    /**
     * Updates border visibility for all blocks on the board
     * Borders are shown between blocks of the same shape to create visual cohesion
     */
    updateAllBorders() {
        for (let r = 0; r < this.boardSize; r++) {
            for (let c = 0; c < this.boardSize; c++) {
                const block = this.blocks[r][c];
                if (!block) continue;

                const topBlock = (r > 0) ? this.blocks[r - 1][c] : null;
                const bottomBlock = (r < this.boardSize - 1) ? this.blocks[r + 1][c] : null;
                const leftBlock = (c > 0) ? this.blocks[r][c - 1] : null;
                const rightBlock = (c < this.boardSize - 1) ? this.blocks[r][c + 1] : null;

                // Show borders only between blocks of the same shape
                let showTop = false;
                let showBottom = false;
                let showLeft = false;
                let showRight = false;

                if (topBlock && topBlock.parentShape.id === block.parentShape.id) {
                    showTop = true;
                }
                if (bottomBlock && bottomBlock.parentShape.id === block.parentShape.id) {
                    showBottom = true;
                }
                if (leftBlock && leftBlock.parentShape.id === block.parentShape.id) {
                    showLeft = true;
                }
                if (rightBlock && rightBlock.parentShape.id === block.parentShape.id) {
                    showRight = true;
                }

                block.updateBorders(showTop, showBottom, showLeft, showRight);
            }
        }
    }

    /**
     * Checks if the game is over (no space for new shapes)
     * @returns True if game is over
     */
    checkGameOver(): boolean {
        if (this.isGameOver) return true;

        const hasEmptySpot = this.findEmptySpotForShape([[1]]);
        if (!hasEmptySpot) {
            this.endGame();
            return true;
        }
        return false;
    }

    /**
     * Ends the game and displays game over screen
     */
    endGame() {
        if (this.isGameOver) return;
        this.isGameOver = true;
        this.isMoving = true;
        console.log("GAME OVER!");

        if (this.score > this.highScore) {
            this.highScore = this.score;
            sys.localStorage.setItem(`blobblab_highscore_${this.boardSize}`, this.highScore.toString());
        }
        if (this.gameOverPanel) {
            this.gameOverPanel.show(this.score, this.highScore);
        }
    }

    /**
     * Forces game over (called externally if needed)
     */
    public forceGameOver() {
        if (this.isPaused) {
            this.resumeGame();
        }
        this.endGame();
    }

    /**
     * Updates the visual position of a block on the board
     * @param blockComp Block component to update
     * @param isAnimated Whether to animate the position change
     */
    updateBlockPosition(blockComp: Block, isAnimated: boolean = true) {
        const boardActualWidth = this.boardSize * (this.cellSize + this.spacing) - this.spacing;
        const startX = -boardActualWidth / 2 + this.cellSize / 2;
        const startY = boardActualWidth / 2 - this.cellSize / 2;
        const targetX = startX + blockComp.col * (this.cellSize + this.spacing);
        const targetY = startY - blockComp.row * (this.cellSize + this.spacing);
        const targetPosition = new Vec3(targetX, targetY, 0);
        if (isAnimated) {
            tween(blockComp.node).to(0.1, { position: targetPosition }, { easing: 'cubicOut' }).start();
        } else {
            blockComp.node.setPosition(targetPosition);
        }
    }

    /**
     * Updates the displayed score
     * @param newScore New score value
     */
    updateScore(newScore: number) {
        this.score = newScore;
        this.scoreLabel.string = `${this.score}`;
    }
}