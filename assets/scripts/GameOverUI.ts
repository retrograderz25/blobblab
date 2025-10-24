import { _decorator, Component, Node, Label, director } from 'cc';
const { ccclass, property } = _decorator;

/**
 * GameOverUI Component
 * Manages the game over screen UI, displaying score and providing restart/menu options
 */
@ccclass('GameOverUI')
export class GameOverUI extends Component {
    /** Label displaying final score and high score */
    @property(Label)
    scoreInfoLabel: Label = null;

    /** Button to restart the current game */
    @property(Node)
    restartButton: Node = null;

    /** Button to return to main menu */
    @property(Node)
    menuButton: Node = null;

    onLoad() {
        this.restartButton.on(Node.EventType.TOUCH_END, this.onRestart, this);
        this.menuButton.on(Node.EventType.TOUCH_END, this.onBackToMenu, this);
    }

    /**
     * Returns to the main menu scene
     */
    onBackToMenu() {
        director.loadScene('Menu');
    }

    /**
     * Displays the game over panel with score information
     * @param score Final score achieved
     * @param highScore Current high score
     */
    show(score: number, highScore: number) {
        this.node.active = true;
        this.scoreInfoLabel.string = `Score: ${score}\nHigh Score: ${highScore}`;
    }

    /**
     * Hides the game over panel
     */
    hide() {
        this.node.active = false;
    }

    /**
     * Restarts the game by reloading the current scene
     */
    onRestart() {
        director.loadScene(director.getScene().name);
    }
}