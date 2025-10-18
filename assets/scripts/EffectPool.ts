import { _decorator, Component, Node, Prefab, instantiate, NodePool, ParticleSystem2D } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('EffectPool')
export class EffectPool extends Component {
    @property(Prefab)
    effectPrefab: Prefab = null;

    @property
    initialPoolSize: number = 10;

    private pool: NodePool = null;

    onLoad() {
        this.pool = new NodePool();
        for (let i = 0; i < this.initialPoolSize; i++) {
            const effect = instantiate(this.effectPrefab);
            this.pool.put(effect);
        }
    }

    spawn(parent: Node, position: Readonly<import("cc").Vec3>): Node {
        let effectNode: Node;
        if (this.pool.size() > 0) {
            effectNode = this.pool.get();
        } else {
            effectNode = instantiate(this.effectPrefab);
        }
        parent.addChild(effectNode);
        effectNode.setPosition(position);

        const particle = effectNode.getComponent(ParticleSystem2D);
        particle.resetSystem(); // Chạy lại hiệu ứng

        // Tự động trả về pool sau khi hiệu ứng kết thúc
        this.scheduleOnce(() => {
            this.pool.put(effectNode);
        }, particle.life);

        return effectNode;
    }
}