import { _decorator, Component, UITransform, Widget, view, sys, screen } from 'cc';
const { ccclass, property } = _decorator;

/**
 * SafeAreaAdapter Component
 * Adapts UI layout to respect device safe areas (notches, home indicators).
 * Primarily used for mobile devices to prevent content from being obscured.
 */
@ccclass('SafeAreaAdapter')
export class SafeAreaAdapter extends Component {
    /** Whether to adapt the top edge */
    @property
    adaptTop: boolean = true;
    
    /** Whether to adapt the bottom edge */
    @property
    adaptBottom: boolean = true;
    
    /** Whether to adapt the left edge */
    @property
    adaptLeft: boolean = true;
    
    /** Whether to adapt the right edge */
    @property
    adaptRight: boolean = true;

    /** Widget component for managing layout */
    private widget: Widget = null;

    onLoad() {
        this.widget = this.getComponent(Widget);
        if (!this.widget) {
            this.widget = this.addComponent(Widget);
        }
        
        this.updateSafeArea();
        screen.on('orientation-change', this.updateSafeArea, this);
    }

    /**
     * Calculates and applies safe area offsets to the widget
     * Only applies on mobile devices where safe areas are relevant
     */
    updateSafeArea() {
        if (!sys.isMobile) {
            return;
        }

        const safeArea = sys.getSafeAreaRect();
        const screenSize = screen.windowSize;
        const designSize = view.getDesignResolutionSize();
        
        const scaleX = designSize.width / screenSize.width;
        const scaleY = designSize.height / screenSize.height;

        const topOffset = (screenSize.height - (safeArea.y + safeArea.height)) * scaleY;
        const bottomOffset = safeArea.y * scaleY;
        const leftOffset = safeArea.x * scaleX;
        const rightOffset = (screenSize.width - (safeArea.x + safeArea.width)) * scaleX;

        console.log(`Safe Area - Top: ${topOffset}, Bottom: ${bottomOffset}, Left: ${leftOffset}, Right: ${rightOffset}`);

        if (this.widget) {
            this.widget.isAlignTop = this.adaptTop;
            this.widget.isAlignBottom = this.adaptBottom;
            this.widget.isAlignLeft = this.adaptLeft;
            this.widget.isAlignRight = this.adaptRight;

            if (this.adaptTop) this.widget.top = topOffset;
            if (this.adaptBottom) this.widget.bottom = bottomOffset;
            if (this.adaptLeft) this.widget.left = leftOffset;
            if (this.adaptRight) this.widget.right = rightOffset;

            this.widget.updateAlignment();
        }
    }

    onDestroy() {
        screen.off('orientation-change', this.updateSafeArea, this);
    }
}
