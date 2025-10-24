import { _decorator, Component, Node, UITransform, instantiate, Prefab, SpriteFrame, Sprite, v3, Vec3, Label } from 'cc';
import { SHAPES, SHAPE_KEYS } from './ShapeData';
import { Block } from './Block';
const { ccclass, property } = _decorator;

/**
 * NextBlockPreview Component
 * Displays a preview of the next 1-3 blocks that will spawn
 */
@ccclass('NextBlockPreview')
export class NextBlockPreview extends Component {
    @property(Node)
    previewContainer: Node = null;

    @property(Prefab)
    blockPrefab: Prefab = null;

    @property({ type: [SpriteFrame] })
    blockSprites: SpriteFrame[] = [];

    @property
    previewCellSize: number = 30;

    @property
    previewSpacing: number = 5;

    @property
    numberOfPreviews: number = 3; // Show next 3 blocks

    @property(Label)
    nextLabel: Label = null;

    private nextBlocks: { shapeKey: string, sprite: SpriteFrame }[] = [];
    private previewNodes: Node[] = [];

    onLoad() {
        if (this.nextLabel) {
            this.nextLabel.string = "";
        }
        this.generateNextBlocks();
        this.renderPreviews();
    }

    /**
     * Generate queue of next blocks
     */
    public generateNextBlocks() {
        this.nextBlocks = [];
        for (let i = 0; i < this.numberOfPreviews; i++) {
            const randomShapeKey = SHAPE_KEYS[Math.floor(Math.random() * SHAPE_KEYS.length)];
            const randomSprite = this.blockSprites[Math.floor(Math.random() * this.blockSprites.length)];
            this.nextBlocks.push({ shapeKey: randomShapeKey, sprite: randomSprite });
        }
    }

    /**
     * Get the next block from queue and generate a new one
     */
    public getNextBlock(): { shapeKey: string, sprite: SpriteFrame } {
        const nextBlock = this.nextBlocks.shift();

        // Generate a new block to replace it
        const randomShapeKey = SHAPE_KEYS[Math.floor(Math.random() * SHAPE_KEYS.length)];
        const randomSprite = this.blockSprites[Math.floor(Math.random() * this.blockSprites.length)];
        this.nextBlocks.push({ shapeKey: randomShapeKey, sprite: randomSprite });

        this.renderPreviews();
        return nextBlock;
    }

    /**
     * Peek at next block without removing it
     */
    public peekNextBlock(): { shapeKey: string, sprite: SpriteFrame } {
        return this.nextBlocks[0];
    }

    /**
     * Render all preview blocks
     */
    private renderPreviews() {
        // Clear existing previews
        this.clearPreviews();

        if (!this.previewContainer) {
            console.warn("Preview container not set!");
            return;
        }

        let currentY = 0;

        for (let i = 0; i < this.nextBlocks.length; i++) {
            const blockData = this.nextBlocks[i];
            const shapeMatrix = SHAPES[blockData.shapeKey];

            // Create container for this preview
            const previewNode = new Node(`Preview_${i}`);
            this.previewContainer.addChild(previewNode);
            this.previewNodes.push(previewNode);

            const shapeHeight = shapeMatrix.length;
            const shapeWidth = shapeMatrix[0].length;

            // Calculate preview size
            const previewWidth = shapeWidth * (this.previewCellSize + this.previewSpacing) - this.previewSpacing;
            const previewHeight = shapeHeight * (this.previewCellSize + this.previewSpacing) - this.previewSpacing;

            // Set position (stack vertically)
            previewNode.setPosition(v3(0, currentY - previewHeight / 2, 0));

            // Create blocks for this shape
            const startX = -previewWidth / 2 + this.previewCellSize / 2;
            const startY = previewHeight / 2 - this.previewCellSize / 2;

            for (let r = 0; r < shapeMatrix.length; r++) {
                for (let c = 0; c < shapeMatrix[r].length; c++) {
                    if (shapeMatrix[r][c] === 1) {
                        const cell = this.createPreviewCell(blockData.sprite);
                        previewNode.addChild(cell);

                        const x = startX + c * (this.previewCellSize + this.previewSpacing);
                        const y = startY - r * (this.previewCellSize + this.previewSpacing);
                        cell.setPosition(v3(x, y, 0));
                    }
                }
            }

            // Update Y position for next preview
            currentY -= (previewHeight + 40); // 40 is spacing between previews
        }
    }

    /**
     * Create a single preview cell
     */
    private createPreviewCell(sprite: SpriteFrame): Node {
        let cell: Node;

        if (this.blockPrefab) {
            cell = instantiate(this.blockPrefab);

            // Hide all borders in preview
            const blockComp = cell.getComponent(Block);
            if (blockComp) {
                blockComp.updateBorders(false, false, false, false);
            }
        } else {
            cell = new Node('PreviewCell');
            cell.addComponent(UITransform);
            cell.addComponent(Sprite);
        }

        const transform = cell.getComponent(UITransform);
        transform.setContentSize(this.previewCellSize, this.previewCellSize);

        const spriteComp = cell.getComponent(Sprite);
        if (spriteComp && sprite) {
            spriteComp.spriteFrame = sprite;
        }

        // Make preview slightly transparent
        cell.setScale(Vec3.ONE.clone().multiplyScalar(0.8));

        return cell;
    }

    /**
     * Clear all preview nodes
     */
    private clearPreviews() {
        for (const node of this.previewNodes) {
            node.destroy();
        }
        this.previewNodes = [];
    }

    /**
     * Reset preview system
     */
    public reset() {
        this.generateNextBlocks();
        this.renderPreviews();
    }
}
