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

@ccclass('GameManager')
export class GameManager extends Component {
    @property(Node)
    pauseButton: Node = null;
    @property(Node)
    pausePanel: Node = null;
    @property(Node)
    resumeButton: Node = null;
    @property(Node)
    menuButtonInPause: Node = null;
    @property(Node) boardNode: Node = null;
    @property(Node) inputManagerNode: Node = null;
    @property(BlockPool) blockPool: BlockPool = null;
    @property(Prefab) cellPrefab: Prefab = null;
    @property(Label) scoreLabel: Label = null;
    @property(GameOverUI) gameOverPanel: GameOverUI = null;
    @property(EffectPool) effectPool: EffectPool = null;
    @property(NextBlockPreview) nextBlockPreview: NextBlockPreview = null;
    @property boardSize: number = 8;
    @property(Node)
    boardBorder: Node = null;

    private cellSize: number = 0;
    private spacing: number = 0;
    private score: number = 0;
    private highScore: number = 0;
    private isGameOver: boolean = false;
    private isMoving: boolean = false;

    private blocks: (Block | null)[][] = [];
    private shapesOnBoard: Shape[] = [];

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

    backToMenu() {
        // Resume game trước khi chuyển scene để tránh lỗi pause
        if (this.isPaused) {
            director.resume();
        }
        director.loadScene('Menu');
    }

    pauseGame() {
        if (this.isGameOver) return;

        this.isPaused = true;
        this.pausePanel.active = true;
        // director.pause() sẽ dừng toàn bộ game, bao gồm cả animation và schedule
        director.pause();
    }

    resumeGame() {
        this.isPaused = false;
        this.pausePanel.active = false;
        // director.resume() sẽ cho game chạy lại
        director.resume();
    }

    start() {
        this.startGame();
    }

    initBoard() {
        const canvasSize = this.boardNode.parent.getComponent(UITransform).contentSize;
        const boardWidthTarget = canvasSize.width * 0.95;
        const totalCellSize = boardWidthTarget / this.boardSize;
        this.cellSize = totalCellSize * 0.9;
        this.spacing = totalCellSize * 0.1;

        console.log(`Responsive Board: Size=${this.boardSize}, CellSize=${this.cellSize}, Spacing=${this.spacing}`);

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
        if (this.boardBorder) {
            let graphics = this.boardBorder.getComponent(Graphics);
            if (!graphics) {
                graphics = this.boardBorder.addComponent(Graphics);
            }

            // Dọn dẹp hình vẽ cũ (nếu có)
            graphics.clear();

            // Thiết lập màu và độ dày của viền
            graphics.strokeColor.set(150, 150, 150, 255); // Màu xám nhạt, bạn có thể đổi
            graphics.lineWidth = this.spacing; // Độ dày bằng với khoảng trống giữa các ô

            // Vẽ hình chữ nhật
            const width = this.boardNode.getComponent(UITransform).width;
            const height = this.boardNode.getComponent(UITransform).height;
            graphics.rect(-width / 2, -height / 2, width, height);

            // Thực hiện vẽ
            graphics.stroke();
        }
    }

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

        // Reset next block preview
        if (this.nextBlockPreview) {
            this.nextBlockPreview.reset();
        }

        this.updateScore(0);
        this.spawnNewShape();

        this.scheduleOnce(() => this.updateAllBorders(), 0.3);
    }

    spawnNewShape() {
        if (!this.blockPool || this.blockPool.blockSprites.length === 0) {
            console.error("BlockPool is not ready or has no sprites!");
            return;
        }

        // Get next block from preview (or random if preview not available)
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

    moveShapes(direction: SwipeDirection): boolean {
        let hasMovedOverall = false;
        let dr = 0, dc = 0;

        if (direction === SwipeDirection.UP) dr = -1;
        if (direction === SwipeDirection.DOWN) dr = 1;
        if (direction === SwipeDirection.LEFT) dc = -1;
        if (direction === SwipeDirection.RIGHT) dc = 1;

        // Lặp lại việc di chuyển từng bước cho đến khi không còn khối nào có thể di chuyển
        while (true) {
            let movedInThisStep = false;
            const shapesToMove: Shape[] = [];

            // 1. Xác định tất cả các shape CÓ THỂ di chuyển một bước trong vòng lặp này
            for (const shape of this.shapesOnBoard) {
                let canMove = true;
                if (shape.childBlocks.length === 0) continue;

                for (const block of shape.childBlocks) {
                    const nextRow = block.row + dr;
                    const nextCol = block.col + dc;

                    // Kiểm tra va chạm với tường
                    if (nextRow < 0 || nextRow >= this.boardSize || nextCol < 0 || nextCol >= this.boardSize) {
                        canMove = false;
                        break;
                    }

                    // Kiểm tra va chạm với các block khác
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

            // 2. Nếu có shape để di chuyển, hãy thực hiện
            if (shapesToMove.length > 0) {
                movedInThisStep = true;
                hasMovedOverall = true;

                for (const shape of shapesToMove) {
                    // Sắp xếp các block con để cập nhật lưới logic chính xác
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
                        this.blocks[oldRow][oldCol] = null; // Dọn ô cũ
                    }
                    for (const block of sortedChildBlocks) {
                        const newRow = block.row + dr;
                        const newCol = block.col + dc;
                        block.row = newRow;
                        block.col = newCol;
                        this.blocks[newRow][newCol] = block; // Đặt vào ô mới
                    }
                }
            }

            // 3. Nếu trong vòng lặp này không có khối nào di chuyển, dừng lại
            if (!movedInThisStep) {
                break;
            }
        }

        // 4. Sau khi đã xác định vị trí cuối cùng, cập nhật vị trí trực quan cho tất cả
        if (hasMovedOverall) {
            for (const shape of this.shapesOnBoard) {
                for (const block of shape.childBlocks) {
                    this.updateBlockPosition(block, true);
                }
            }
        }

        return hasMovedOverall;
    }
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

    updateAllBorders() {
        for (let r = 0; r < this.boardSize; r++) {
            for (let c = 0; c < this.boardSize; c++) {
                const block = this.blocks[r][c];
                if (!block) continue;

                // Kiểm tra 4 ô xung quanh
                const topBlock = (r > 0) ? this.blocks[r - 1][c] : null;
                const bottomBlock = (r < this.boardSize - 1) ? this.blocks[r + 1][c] : null;
                const leftBlock = (c > 0) ? this.blocks[r][c - 1] : null;
                const rightBlock = (c < this.boardSize - 1) ? this.blocks[r][c + 1] : null;

                // LOGIC ĐẢO NGƯỢC
                // Mặc định, tất cả các viền đều TẮT (không hiển thị khoảng trống)
                let showTop = false;
                let showBottom = false;
                let showLeft = false;
                let showRight = false;

                // Chỉ BẬT viền nếu ô bên cạnh tồn tại VÀ thuộc cùng một Shape
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

    // updateAllBorders() {
    //     for (let r = 0; r < this.boardSize; r++) {
    //         for (let c = 0; c < this.boardSize; c++) {
    //             const block = this.blocks[r][c];
    //             if (!block) continue;

    //             const topBlock = (r > 0) ? this.blocks[r - 1][c] : null;
    //             const bottomBlock = (r < this.boardSize - 1) ? this.blocks[r + 1][c] : null;
    //             const leftBlock = (c > 0) ? this.blocks[r][c - 1] : null;
    //             const rightBlock = (c < this.boardSize - 1) ? this.blocks[r][c + 1] : null;

    //             let showTop = !topBlock || topBlock.parentShape.id !== block.parentShape.id;
    //             let showBottom = !bottomBlock || bottomBlock.parentShape.id !== block.parentShape.id;
    //             let showLeft = !leftBlock || leftBlock.parentShape.id !== block.parentShape.id;
    //             let showRight = !rightBlock || rightBlock.parentShape.id !== block.parentShape.id;

    //             block.updateBorders(showTop, showBottom, showLeft, showRight);
    //         }
    //     }
    // }

    checkGameOver(): boolean {
        if (this.isGameOver) return true;

        const hasEmptySpot = this.findEmptySpotForShape([[1]]);
        if (!hasEmptySpot) {
            this.endGame();
            return true;
        }
        return false;
    }

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

    public forceGameOver() {
        if (this.isPaused) {
            this.resumeGame();
        }
        this.endGame();
    }

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

    updateScore(newScore: number) {
        this.score = newScore;
        this.scoreLabel.string = `${this.score}`;
    }
}