import { _decorator, Component, Node, tween, Vec3, math } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TitleAnimation')
export class TitleAnimation extends Component {
    @property
    wobbleSpeed: number = 1.5;

    @property
    wobbleAngle: number = 5;

    @property
    scaleAmount: number = 0.05;

    start() {
        this.startWobble();
    }

    private startWobble() {
        const originalScale = this.node.scale.clone();
        const minScale = originalScale.clone().multiplyScalar(1 - this.scaleAmount);
        const maxScale = originalScale.clone().multiplyScalar(1 + this.scaleAmount);

        // Rotation wobble
        tween(this.node)
            .to(this.wobbleSpeed / 2, {
                angle: this.wobbleAngle
            }, { easing: 'sineInOut' })
            .to(this.wobbleSpeed, {
                angle: -this.wobbleAngle
            }, { easing: 'sineInOut' })
            .to(this.wobbleSpeed / 2, {
                angle: 0
            }, { easing: 'sineInOut' })
            .union()
            .repeatForever()
            .start();

        // Scale pulse
        tween(this.node)
            .to(this.wobbleSpeed, { scale: maxScale }, { easing: 'sineInOut' })
            .to(this.wobbleSpeed, { scale: minScale }, { easing: 'sineInOut' })
            .union()
            .repeatForever()
            .start();
    }
}
