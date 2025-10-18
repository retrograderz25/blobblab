import { _decorator, Component, Node, director, sys } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MenuManager')
export class MenuManager extends Component {

    @property(Node)
    easyButton: Node = null;

    @property(Node)
    mediumButton: Node = null;

    @property(Node)
    hardButton: Node = null;

    onLoad() {
        // Gán sự kiện click cho từng nút
        this.easyButton.on(Node.EventType.TOUCH_END, () => this.onModeSelected(8), this);
        this.mediumButton.on(Node.EventType.TOUCH_END, () => this.onModeSelected(12), this);
        this.hardButton.on(Node.EventType.TOUCH_END, () => this.onModeSelected(16), this);
    }

    /**
     * Hàm được gọi khi người chơi chọn một chế độ
     * @param boardSize Kích thước bàn cờ tương ứng với chế độ
     */
    onModeSelected(boardSize: number) {
        console.log(`Board size selected: ${boardSize}`);

        // Lưu kích thước bàn cờ vào một biến toàn cục hoặc localStorage
        // localStorage là cách đơn giản và hiệu quả nhất để truyền dữ liệu giữa các scene
        sys.localStorage.setItem('selectedBoardSize', boardSize.toString());

        // Chuyển sang scene game chính. Tên scene phải khớp với tên file scene của bạn.
        // Mặc định, tên file scene chính là "scene"
        director.loadScene('scene');
    }
}