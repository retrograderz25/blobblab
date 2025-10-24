import { _decorator, Component, Node, UITransform } from 'cc';
import { Shape } from './Shape';
const { ccclass, property } = _decorator;

/**
 * Block Component
 * Represents a single block/cell in the game board.
 * Each block has optional border nodes to show connectivity with adjacent blocks.
 */
@ccclass('Block')
export class Block extends Component {
    /** Border nodes for visual connectivity between blocks */
    @property(Node) topBorder: Node = null;
    @property(Node) bottomBorder: Node = null;
    @property(Node) leftBorder: Node = null;
    @property(Node) rightBorder: Node = null;

    /** Grid position of this block */
    public row: number = 0;
    public col: number = 0;
    
    /** Reference to the shape this block belongs to */
    public parentShape: Shape = null;

    /** Cached UITransform component for performance */
    private _uiTransform: UITransform = null;

    onLoad() {
        this._uiTransform = this.getComponent(UITransform);
    }

    /**
     * Associates this block with a shape
     * @param shape The shape this block belongs to, or null to remove association
     */
    public setShape(shape: Shape | null) {
        this.parentShape = shape;
    }

    /**
     * Controls visibility of border nodes
     * Borders are shown to connect blocks that belong to the same shape
     * @param top Show/hide top border
     * @param bottom Show/hide bottom border
     * @param left Show/hide left border
     * @param right Show/hide right border
     */
    public updateBorders(top: boolean, bottom: boolean, left: boolean, right: boolean) {
        if (this.topBorder) this.topBorder.active = top;
        if (this.bottomBorder) this.bottomBorder.active = bottom;
        if (this.leftBorder) this.leftBorder.active = left;
        if (this.rightBorder) this.rightBorder.active = right;
    }

    /**
     * Resizes and repositions border nodes based on block size
     * This is called when the block is spawned to ensure borders match the cell spacing
     * @param spacing Gap between cells on the board (determines border thickness)
     */
    public resizeBorders(spacing: number) {
        if (!this._uiTransform) this._uiTransform = this.getComponent(UITransform);

        const width = this._uiTransform.width;
        const height = this._uiTransform.height;
        const halfWidth = width / 2;
        const halfHeight = height / 2;
        const borderWidth = width + spacing;
        const borderHeight = height + spacing;

        // Position and size each border to fill the gap between this block and adjacent blocks
        if (this.topBorder) {
            this.topBorder.getComponent(UITransform).setContentSize(borderWidth * 0.8, spacing / 2);
            this.topBorder.setPosition(0, halfHeight + spacing / 2);
        }
        if (this.bottomBorder) {
            this.bottomBorder.getComponent(UITransform).setContentSize(borderWidth * 0.8, spacing / 2);
            this.bottomBorder.setPosition(0, -halfHeight - spacing / 2);
        }
        if (this.leftBorder) {
            this.leftBorder.getComponent(UITransform).setContentSize(spacing / 2, borderHeight * 0.8);
            this.leftBorder.setPosition(-halfWidth - spacing / 2, 0);
        }
        if (this.rightBorder) {
            this.rightBorder.getComponent(UITransform).setContentSize(spacing / 2, borderHeight * 0.8);
            this.rightBorder.setPosition(halfWidth + spacing / 2, 0);
        }
    }
}