// Trong file Block.ts
import { _decorator, Component, Node, UITransform } from 'cc'; // Thêm UITransform
import { Shape } from './Shape';
const { ccclass, property } = _decorator;

@ccclass('Block')
export class Block extends Component {
    @property(Node) topBorder: Node = null;
    @property(Node) bottomBorder: Node = null;
    @property(Node) leftBorder: Node = null;
    @property(Node) rightBorder: Node = null;

    public row: number = 0;
    public col: number = 0;
    public parentShape: Shape = null;

    private _uiTransform: UITransform = null;

    onLoad() {
        // Lấy và cache component UITransform để dùng nhiều lần
        this._uiTransform = this.getComponent(UITransform);
    }

    public setShape(shape: Shape | null) {
        this.parentShape = shape;
    }

    public updateBorders(top: boolean, bottom: boolean, left: boolean, right: boolean) {
        if (this.topBorder) this.topBorder.active = top;
        if (this.bottomBorder) this.bottomBorder.active = bottom;
        if (this.leftBorder) this.leftBorder.active = left;
        if (this.rightBorder) this.rightBorder.active = right;
    }

    /**
     * HÀM MỚI: Tự động thay đổi kích thước và vị trí các viền con
     * @param spacing Độ dày của viền (chính là khoảng trống giữa các ô)
     */
    public resizeBorders(spacing: number) {
        if (!this._uiTransform) this._uiTransform = this.getComponent(UITransform);

        const width = this._uiTransform.width;
        const height = this._uiTransform.height;

        // Tính toán kích thước và vị trí mới dựa trên kích thước của block cha
        const halfWidth = width / 2;
        const halfHeight = height / 2;
        const borderWidth = width + spacing;
        const borderHeight = height + spacing;

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