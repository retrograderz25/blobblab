import { _decorator, Component, Node, Prefab, instantiate, NodePool, Sprite, SpriteFrame, UITransform } from 'cc';
import { Block } from './Block';
const { ccclass, property } = _decorator;

/**
 * BlockPool quản lý việc tạo và tái sử dụng blocks
 * Sử dụng object pooling pattern để tối ưu hiệu suất
 */
@ccclass('BlockPool')
export class BlockPool extends Component {
    @property(Prefab)
    blockPrefab: Prefab = null;

    @property([SpriteFrame])
    blockSprites: SpriteFrame[] = [];

    @property
    initialPoolSize: number = 20;

    private pool: NodePool = null;
    private activeBlocks: Node[] = [];

    onLoad() {
        this.initPool();
    }

    /**
     * Khởi tạo pool với số lượng block ban đầu
     */
    private initPool() {
        this.pool = new NodePool();
        for (let i = 0; i < this.initialPoolSize; i++) {
            const block = instantiate(this.blockPrefab);
            this.pool.put(block);
        }
        console.log(`BlockPool initialized with ${this.initialPoolSize} blocks`);
    }

    /**
     * Lấy một block từ pool, đặt kích thước và sprite ngẫu nhiên.
     * @param parent Node cha để gắn block vào
     * @param width Chiều rộng mong muốn của block
     * @param height Chiều cao mong muốn của block
     * @returns Block component của block được lấy ra
     */
    spawn(parent: Node, width: number, height: number): Block {
        let blockNode: Node;

        if (this.pool.size() > 0) {
            blockNode = this.pool.get();
        } else {
            blockNode = instantiate(this.blockPrefab);
            console.warn('Pool empty, created a new block. Consider increasing pool size.');
        }

        // Cập nhật kích thước ngay khi lấy block ra
        const transform = blockNode.getComponent(UITransform);
        if (transform) {
            transform.setContentSize(width, height);
        }

        parent.addChild(blockNode);
        blockNode.active = true;

        if (this.blockSprites.length > 0) {
            const randomIndex = Math.floor(Math.random() * this.blockSprites.length);
            const sprite = blockNode.getComponent(Sprite);
            if (sprite) {
                sprite.spriteFrame = this.blockSprites[randomIndex];
            }
        }

        this.activeBlocks.push(blockNode);
        return blockNode.getComponent(Block);
    }

    /**
     * Trả block về pool để tái sử dụng
     * @param blockNode Node của block cần trả về
     */
    despawn(blockNode: Node) {
        if (!blockNode || !blockNode.isValid) return;

        const index = this.activeBlocks.indexOf(blockNode);
        if (index > -1) {
            this.activeBlocks.splice(index, 1);
        }

        const blockComp = blockNode.getComponent(Block);
        if (blockComp) {
            blockComp.row = 0;
            blockComp.col = 0;
        }

        // Không cần tách khỏi parent nếu dùng NodePool, chỉ cần put là đủ
        // blockNode.removeFromParent();

        blockNode.active = false; // Nên tắt active trước khi trả về pool
        this.pool.put(blockNode);
    }

    /**
     * Trả nhiều blocks về pool cùng lúc
     * @param blockNodes Mảng các Node cần trả về
     */
    despawnMultiple(blockNodes: Node[]) {
        blockNodes.forEach(node => this.despawn(node));
    }

    /**
     * Xóa toàn bộ active blocks và trả về pool
     */
    despawnAll() {
        const blocksToRemove = [...this.activeBlocks];
        blocksToRemove.forEach(node => this.despawn(node));
    }

    /**
     * Lấy số lượng block đang active
     */
    getActiveCount(): number {
        return this.activeBlocks.length;
    }

    /**
     * Lấy số lượng block đang trong pool (sẵn sàng tái sử dụng)
     */
    getPoolSize(): number {
        return this.pool.size();
    }

    /**
     * Clear toàn bộ pool (dùng khi restart game hoặc chuyển scene)
     */
    clearPool() {
        this.despawnAll();
        this.pool.clear();
        this.activeBlocks = [];
        console.log('BlockPool cleared');
    }

    onDestroy() {
        this.clearPool();
    }
}