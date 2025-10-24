import { _decorator, Component, Node, tween, Vec3, math } from 'cc';
const { ccclass, property } = _decorator;

/**
 * TitleAnimation Component
 * Creates a continuous wobble and scale animation for title elements.
 * Provides an engaging visual effect for menus and title screens.
 */
@ccclass('TitleAnimation')
export class TitleAnimation extends Component {
    /** Speed of the wobble animation in seconds */
    @property
    wobbleSpeed: number = 1.5;

    /** Maximum rotation angle in degrees */
    @property
    wobbleAngle: number = 5;

    /** Scale variation amount (0.05 = 5% scale change) */
    @property
    scaleAmount: number = 0.05;

    start() {
        this.startWobble();
    }

    /**
     * Initiates the wobble animation with rotation and scale effects
     * Both animations loop indefinitely
     */
    private startWobble() {
        const originalScale = this.node.scale.clone();
        const minScale = originalScale.clone().multiplyScalar(1 - this.scaleAmount);
        const maxScale = originalScale.clone().multiplyScalar(1 + this.scaleAmount);

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

        tween(this.node)
            .to(this.wobbleSpeed, { scale: maxScale }, { easing: 'sineInOut' })
            .to(this.wobbleSpeed, { scale: minScale }, { easing: 'sineInOut' })
            .union()
            .repeatForever()
            .start();
    }
}
