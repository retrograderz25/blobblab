import { _decorator, Component, Node, director, sys, Camera, Color } from 'cc';
const { ccclass, property } = _decorator;

/**
 * MenuManager Component
 * Handles main menu interactions and difficulty selection.
 * Allows players to choose board size and navigate to the game scene.
 */
@ccclass('MenuManager')
export class MenuManager extends Component {
    /** Button for easy difficulty (8x8 board) */
    @property(Node)
    easyButton: Node = null;

    /** Button for medium difficulty (12x12 board) */
    @property(Node)
    mediumButton: Node = null;

    /** Button for hard difficulty (16x16 board) */
    @property(Node)
    hardButton: Node = null;

    /** Main camera for setting background color */
    @property(Camera)
    mainCamera: Camera = null;

    /** Background color for the menu scene */
    @property({ type: Color })
    backgroundColor: Color = new Color(40, 44, 52, 255);

    onLoad() {
        if (this.mainCamera) {
            this.mainCamera.backgroundColor = this.backgroundColor;
        }

        this.easyButton.on(Node.EventType.TOUCH_END, () => this.onModeSelected(8), this);
        this.mediumButton.on(Node.EventType.TOUCH_END, () => this.onModeSelected(12), this);
        this.hardButton.on(Node.EventType.TOUCH_END, () => this.onModeSelected(16), this);
    }

    /**
     * Handles difficulty mode selection
     * Saves the selected board size to localStorage and loads the game scene
     * @param boardSize Board size corresponding to selected difficulty (8, 12, or 16)
     */
    onModeSelected(boardSize: number) {
        console.log(`Board size selected: ${boardSize}`);

        sys.localStorage.setItem('selectedBoardSize', boardSize.toString());
        director.loadScene('scene');
    }
}