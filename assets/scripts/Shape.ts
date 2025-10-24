import { _decorator, Component } from 'cc';
import { Block } from './Block';
const { ccclass } = _decorator;

/** Global counter for assigning unique IDs to shapes */
let SHAPE_ID_COUNTER = 0;

/**
 * Shape Class
 * Represents a group of connected blocks that move together.
 * Shapes can split when blocks are removed (e.g., when clearing lines).
 */
@ccclass('Shape')
export class Shape {
    /** Unique identifier for this shape */
    public id: number;
    
    /** Array of blocks that belong to this shape */
    public childBlocks: Block[] = [];

    constructor() {
        this.id = SHAPE_ID_COUNTER++;
    }

    /**
     * Adds a block to this shape
     * @param block The block to add
     */
    public addBlock(block: Block) {
        if (!this.childBlocks.includes(block)) {
            this.childBlocks.push(block);
            block.setShape(this);
        }
    }

    /**
     * Removes a block from this shape
     * Called when a block is destroyed (e.g., line cleared)
     * @param block The block to remove
     */
    public removeBlock(block: Block) {
        const index = this.childBlocks.indexOf(block);
        if (index > -1) {
            this.childBlocks.splice(index, 1);
            block.setShape(null);
        }
    }
}