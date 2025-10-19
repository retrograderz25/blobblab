import { _decorator, Component } from 'cc';
import { Shape } from './Shape';
const { ccclass, property } = _decorator;

@ccclass('Block')
export class Block extends Component {
    public row: number = 0;
    public col: number = 0;
    public parentShape: Shape = null;

    public setShape(shape: Shape | null) {
        this.parentShape = shape;
    }
}