import { _decorator, Component, Node, Label, director } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameOverUI')
export class GameOverUI extends Component {
    @property(Label)
    scoreInfoLabel: Label = null;

    @property(Node)
    restartButton: Node = null;

    @property(Node)
    menuButton: Node = null;

    onLoad() {
        // Đăng ký sự kiện click cho nút
        this.restartButton.on(Node.EventType.TOUCH_END, this.onRestart, this);
        this.menuButton.on(Node.EventType.TOUCH_END, this.onBackToMenu, this);
    }

    onBackToMenu() {
        director.loadScene('Menu');
    }

    /**
     * Hiển thị panel với điểm số
     * @param score Điểm hiện tại
     * @param highScore Điểm cao nhất
     */
    show(score: number, highScore: number) {
        this.node.active = true;
        this.scoreInfoLabel.string = `Score: ${score}\nHigh Score: ${highScore}`;
    }

    /**
     * Ẩn panel
     */
    hide() {
        this.node.active = false;
    }

    /**
     * Hàm được gọi khi nhấn nút Restart
     */
    onRestart() {
        // Tải lại scene hiện tại
        director.loadScene(director.getScene().name);
    }
}