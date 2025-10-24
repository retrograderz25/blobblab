import { _decorator, Component, Node, Prefab, instantiate, NodePool, Sprite, SpriteFrame, UITransform } from 'cc';
import { Block } from './Block';
const { ccclass, property } = _decorator;

/**
 * BlockPool Component
 * Manages creation and reuse of block nodes using object pooling pattern.
 * This optimization reduces memory allocation overhead by recycling nodes instead of creating new ones.
 */
@ccclass('BlockPool')
export class BlockPool extends Component {
    /** Prefab template for creating block instances */
    @property(Prefab)
    blockPrefab: Prefab = null;

    /** Array of available sprite frames for block visual variety */
    @property([SpriteFrame])
    blockSprites: SpriteFrame[] = [];

    /** Number of blocks to pre-instantiate in the pool */
    @property
    initialPoolSize: number = 20;

    /** Object pool for storing inactive block nodes */
    private pool: NodePool = null;
    
    /** Array tracking currently active blocks in the game */
    private activeBlocks: Node[] = [];

    onLoad() {
        this.initPool();
    }

    /**
     * Initializes the pool with pre-instantiated blocks
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
     * Retrieves a block from the pool and configures it
     * @param parent Parent node to attach the block to
     * @param width Desired width of the block
     * @param height Desired height of the block
     * @param spriteFrame Specific sprite frame to apply. If not provided, a random one is selected
     * @param spacing Cell spacing for border sizing
     * @returns Block component of the spawned block
     */
    spawn(parent: Node, width: number, height: number, spriteFrame?: SpriteFrame, spacing?: number): Block {
        let blockNode: Node;

        if (this.pool.size() > 0) {
            blockNode = this.pool.get();
        } else {
            blockNode = instantiate(this.blockPrefab);
            console.warn('Pool empty, created a new block. Consider increasing pool size.');
        }

        const transform = blockNode.getComponent(UITransform);
        if (transform) {
            transform.setContentSize(width, height);
        }

        const blockComp = blockNode.getComponent(Block);
        if (blockComp && spacing !== undefined) {
            blockComp.resizeBorders(spacing);
        }

        parent.addChild(blockNode);
        blockNode.active = true;

        const sprite = blockNode.getComponent(Sprite);
        if (sprite) {
            if (spriteFrame) {
                sprite.spriteFrame = spriteFrame;
            } else if (this.blockSprites.length > 0) {
                const randomIndex = Math.floor(Math.random() * this.blockSprites.length);
                sprite.spriteFrame = this.blockSprites[randomIndex];
            }
        }

        this.activeBlocks.push(blockNode);
        return blockNode.getComponent(Block);
    }

    /**
     * Returns a block to the pool for reuse
     * @param blockNode Block node to despawn
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

        blockNode.active = false;
        this.pool.put(blockNode);
    }

    /**
     * Returns multiple blocks to the pool at once
     * @param blockNodes Array of block nodes to despawn
     */
    despawnMultiple(blockNodes: Node[]) {
        blockNodes.forEach(node => this.despawn(node));
    }

    /**
     * Despawns all active blocks and returns them to the pool
     */
    despawnAll() {
        const blocksToRemove = [...this.activeBlocks];
        blocksToRemove.forEach(node => this.despawn(node));
    }

    /**
     * Gets the number of currently active blocks
     * @returns Active block count
     */
    getActiveCount(): number {
        return this.activeBlocks.length;
    }

    /**
     * Gets the number of blocks available in the pool
     * @returns Pool size
     */
    getPoolSize(): number {
        return this.pool.size();
    }

    /**
     * Clears the entire pool (use when restarting game or changing scenes)
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