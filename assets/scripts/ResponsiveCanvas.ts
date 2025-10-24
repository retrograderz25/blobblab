import { _decorator, Component, view, ResolutionPolicy, screen, sys } from 'cc';
const { ccclass, property } = _decorator;

/**
 * ResponsiveCanvas Component
 * Dynamically adjusts canvas resolution based on screen dimensions.
 * Ensures optimal display across different screen sizes and orientations.
 */
@ccclass('ResponsiveCanvas')
export class ResponsiveCanvas extends Component {
    /** Design width for the canvas */
    @property
    designWidth: number = 720;
    
    /** Design height for the canvas */
    @property
    designHeight: number = 1280;

    onLoad() {
        this.updateResolution();
        
        if (sys.isBrowser) {
            window.addEventListener('resize', () => {
                this.scheduleOnce(() => {
                    this.updateResolution();
                }, 0.1);
            });
        }
        
        screen.on('orientation-change', this.updateResolution, this);
    }

    /**
     * Updates the canvas resolution policy based on screen aspect ratio
     * Uses FIXED_HEIGHT for wider screens and FIXED_WIDTH for taller screens
     */
    updateResolution() {
        const frameSize = screen.windowSize;
        const screenRatio = frameSize.width / frameSize.height;
        const designRatio = this.designWidth / this.designHeight;

        console.log(`Screen: ${frameSize.width}x${frameSize.height}, Ratio: ${screenRatio.toFixed(2)}, Design Ratio: ${designRatio.toFixed(2)}`);

        if (screenRatio > designRatio) {
            view.setDesignResolutionSize(
                this.designWidth,
                this.designHeight,
                ResolutionPolicy.FIXED_HEIGHT
            );
            console.log('Using FIXED_HEIGHT policy');
        } else {
            view.setDesignResolutionSize(
                this.designWidth,
                this.designHeight,
                ResolutionPolicy.FIXED_WIDTH
            );
            console.log('Using FIXED_WIDTH policy');
        }
    }

    onDestroy() {
        screen.off('orientation-change', this.updateResolution, this);
    }
}
