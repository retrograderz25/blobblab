import { _decorator, Component, Node, input, Input, EventTouch, Vec2, v2, Enum } from 'cc';
const { ccclass, property } = _decorator;

/**
 * Swipe Direction Enumeration
 * Defines the four possible swipe directions plus NONE
 */
export enum SwipeDirection {
    NONE,
    UP,
    DOWN,
    LEFT,
    RIGHT
}
Enum(SwipeDirection);

/**
 * InputManager Component
 * Detects swipe gestures and emits directional events.
 * Calculates swipe direction based on touch start/end positions.
 */
@ccclass('InputManager')
export class InputManager extends Component {
    /** Minimum distance required to register a swipe */
    @property
    swipeThreshold: number = 50;

    /** Position where the touch started */
    private touchStartPos: Vec2 = v2(0, 0);
    
    /** Flag tracking whether a swipe is in progress */
    private isSwiping: boolean = false;

    onLoad() {
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        input.on(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    onDestroy() {
        input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        input.off(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    /**
     * Records the starting position when touch begins
     */
    private onTouchStart(event: EventTouch) {
        this.touchStartPos = event.getUILocation();
        this.isSwiping = true;
    }

    /**
     * Calculates swipe direction when touch ends
     * Emits 'swipe-detected' event with the determined direction if threshold is met
     */
    private onTouchEnd(event: EventTouch) {
        if (!this.isSwiping) return;
        this.isSwiping = false;

        const touchEndPos = event.getUILocation();
        const diff = touchEndPos.subtract(this.touchStartPos);

        if (diff.length() < this.swipeThreshold) return;

        let direction = SwipeDirection.NONE;
        if (Math.abs(diff.x) > Math.abs(diff.y)) {
            direction = diff.x > 0 ? SwipeDirection.RIGHT : SwipeDirection.LEFT;
        } else {
            direction = diff.y > 0 ? SwipeDirection.UP : SwipeDirection.DOWN;
        }

        if (direction !== SwipeDirection.NONE) {
            this.node.emit('swipe-detected', direction);
        }
    }
}