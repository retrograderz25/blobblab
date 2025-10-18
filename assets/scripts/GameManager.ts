import { _decorator, Component, Node, Prefab, Label, UITransform, v3, instantiate, sys, tween, Vec3 } from 'cc';
import { Block } from './Block';
import { SwipeDirection } from './InputManager';
import { BlockPool } from './BlockPool';
import { GameOverUI } from './GameOverUI';

const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    @property(Node)
    boardNode: Node = null;

    @property(Node)
    inputManagerNode: Node = null;

    @property(BlockPool)
    blockPool: BlockPool = null;

    @property(Prefab)
    cellPrefab: Prefab = null;

    @property(Label)
    scoreLabel: Label = null;

    @property(GameOverUI)
    gameOverPanel: GameOverUI = null;

    @property
    boardSize: number = 8;

    @property
    initialBlockCount: number = 3;

    private cellSize: number = 0;
    private spacing: number = 0;
    private blocks: (Block | null)[][] = [];
    private score: number = 0;
    private highScore: number = 0;
    private isGameOver: boolean = false;
    private isMoving: boolean = false;

    start() {
        this.inputManagerNode.on('swipe-detected', this.handleSwipe, this);
        const selectedSize = parseInt(sys.localStorage.getItem('selectedBoardSize') || '8');
        this.boardSize = selectedSize;
        this.highScore = parseInt(sys.localStorage.getItem(`blobblab_highscore_${this.boardSize}`) || '0');

        if (this.gameOverPanel) {
            this.gameOverPanel.node.active = false;
        }

        this.initBoard();
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
    }

    startGame() {
        this.isGameOver = false;
        if (this.gameOverPanel) {
            this.gameOverPanel.node.active = false;
        }
        if (this.blockPool) {
            this.blockPool.despawnAll();
        }
        this.blocks = [];
        for (let row = 0; row < this.boardSize; row++) {
            this.blocks[row] = [];
            for (let col = 0; col < this.boardSize; col++) {
                this.blocks[row][col] = null;
            }
        }
        this.updateScore(0);
        for (let i = 0; i < this.initialBlockCount; i++) {
            this.spawnNewBlock();
        }
    }

    spawnNewBlock() {
        if (!this.blockPool) return;

        const emptyCells: { row: number, col: number }[] = [];
        for (let r = 0; r < this.boardSize; r++) {
            for (let c = 0; c < this.boardSize; c++) {
                if (!this.blocks[r][c]) emptyCells.push({ row: r, col: c });
            }
        }
        if (emptyCells.length === 0) return;

        const pos = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const blockComp = this.blockPool.spawn(this.boardNode, this.cellSize, this.cellSize);
        blockComp.row = pos.row;
        blockComp.col = pos.col;
        this.blocks[pos.row][pos.col] = blockComp;
        this.updateBlockPosition(blockComp, false);
    }

    handleSwipe(direction: SwipeDirection) {
        // Nếu đang di chuyển hoặc đã thua thì không làm gì cả
        if (this.isMoving || this.isGameOver) return;

        if (this.moveBlocks(direction)) {
            // Đánh dấu là đang di chuyển để chặn input
            this.isMoving = true;

            this.scheduleOnce(() => {
                this.checkAndClearLines();
                this.spawnNewBlock();
                this.checkGameOver();

                // Sau khi mọi thứ hoàn tất, cho phép input trở lại
                this.isMoving = false;
            }, 0.2); // Tăng thời gian chờ lên một chút để khớp với animation
        }
    }
    updateBlockPosition(blockComp: Block, isAnimated: boolean = true) {
        const boardActualWidth = this.boardSize * (this.cellSize + this.spacing) - this.spacing;
        const startX = -boardActualWidth / 2 + this.cellSize / 2;
        const startY = boardActualWidth / 2 - this.cellSize / 2;
        const targetX = startX + blockComp.col * (this.cellSize + this.spacing);
        const targetY = startY - blockComp.row * (this.cellSize + this.spacing);

        const targetPosition = new Vec3(targetX, targetY, 0);

        if (isAnimated) {
            // Sử dụng tween để di chuyển mượt mà
            tween(blockComp.node)
                .to(0.1, { position: targetPosition }, { easing: 'cubicOut' }) // Di chuyển trong 0.1 giây
                .start();
        } else {
            // Đặt vị trí ngay lập tức (dùng khi bắt đầu game)
            blockComp.node.setPosition(targetPosition);
        }
    }

    moveBlocks(direction: SwipeDirection): boolean {
        let hasMoved = false;
        const move = (row: number, col: number, dr: number, dc: number) => {
            const block = this.blocks[row][col];
            if (!block) return;
            let lastEmptyRow = row, lastEmptyCol = col;
            let nextRow = row + dr, nextCol = col + dc;
            while (nextRow >= 0 && nextRow < this.boardSize && nextCol >= 0 && nextCol < this.boardSize && !this.blocks[nextRow][nextCol]) {
                lastEmptyRow = nextRow;
                lastEmptyCol = nextCol;
                nextRow += dr;
                nextCol += dc;
            }
            if (lastEmptyRow !== row || lastEmptyCol !== col) {
                this.blocks[lastEmptyRow][lastEmptyCol] = block;
                this.blocks[row][col] = null;
                block.row = lastEmptyRow;
                block.col = lastEmptyCol;
                this.updateBlockPosition(block, true);
                hasMoved = true;
            }
        };
        if (direction === SwipeDirection.UP) for (let r = 0; r < this.boardSize; r++) for (let c = 0; c < this.boardSize; c++) move(r, c, -1, 0);
        else if (direction === SwipeDirection.DOWN) for (let r = this.boardSize - 1; r >= 0; r--) for (let c = 0; c < this.boardSize; c++) move(r, c, 1, 0);
        else if (direction === SwipeDirection.LEFT) for (let c = 0; c < this.boardSize; c++) for (let r = 0; r < this.boardSize; r++) move(r, c, 0, -1);
        else if (direction === SwipeDirection.RIGHT) for (let c = this.boardSize - 1; c >= 0; c--) for (let r = 0; r < this.boardSize; r++) move(r, c, 0, 1);
        return hasMoved;
    }

    checkAndClearLines() {
        const rowsToClear: number[] = [], colsToClear: number[] = [];
        for (let r = 0; r < this.boardSize; r++) { if (this.blocks[r] && this.blocks[r].every(block => !!block)) rowsToClear.push(r); }
        for (let c = 0; c < this.boardSize; c++) { let isFull = true; for (let r = 0; r < this.boardSize; r++) if (!this.blocks[r][c]) { isFull = false; break; } if (isFull) colsToClear.push(c); }
        let linesCleared = rowsToClear.length + colsToClear.length;
        if (linesCleared > 0) this.updateScore(this.score + (10 * linesCleared * linesCleared));

        const nodesToDespawn: Node[] = [];
        for (const r of rowsToClear) for (let c = 0; c < this.boardSize; c++) if (this.blocks[r][c]) { nodesToDespawn.push(this.blocks[r][c].node); this.blocks[r][c] = null; }
        for (const c of colsToClear) for (let r = 0; r < this.boardSize; r++) if (this.blocks[r][c]) { if (!nodesToDespawn.includes(this.blocks[r][c].node)) nodesToDespawn.push(this.blocks[r][c].node); this.blocks[r][c] = null; }
        if (this.blockPool) this.blockPool.despawnMultiple(nodesToDespawn);
    }

    updateScore(newScore: number) {
        this.score = newScore;
        this.scoreLabel.string = `Score: ${this.score}`;
    }

    checkGameOver(): boolean {
        let emptyCells = 0;
        for (let r = 0; r < this.boardSize; r++) for (let c = 0; c < this.boardSize; c++) if (!this.blocks[r][c]) emptyCells++;
        if (emptyCells > 0) return false;

        this.isGameOver = true;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            sys.localStorage.setItem(`blobblab_highscore_${this.boardSize}`, this.highScore.toString());
        }
        if (this.gameOverPanel) {
            this.gameOverPanel.show(this.score, this.highScore);
        }
        return true;
    }

    public forceGameOver() {
        if (this.isGameOver) return;
        this.isGameOver = true;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            sys.localStorage.setItem(`blobblab_highscore_${this.boardSize}`, this.highScore.toString());
        }
        if (this.gameOverPanel) {
            this.gameOverPanel.show(this.score, this.highScore);
        }
    }
}