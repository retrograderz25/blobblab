import { _decorator, Component } from 'cc';
import { Block } from './Block';
const { ccclass } = _decorator;

let SHAPE_ID_COUNTER = 0;

@ccclass('Shape')
export class Shape {
    public id: number;
    public childBlocks: Block[] = [];

    constructor() {
        this.id = SHAPE_ID_COUNTER++;
    }

    public addBlock(block: Block) {
        if (!this.childBlocks.includes(block)) {
            this.childBlocks.push(block);
            block.setShape(this);
        }
    }

    public removeBlock(block: Block) {
        const index = this.childBlocks.indexOf(block);
        if (index > -1) {
            this.childBlocks.splice(index, 1);
            block.setShape(null); // Block này không còn thuộc shape nào
        }
    }
}