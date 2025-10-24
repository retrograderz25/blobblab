import { _decorator, Component, Node, Prefab, instantiate, NodePool, ParticleSystem2D } from 'cc';
const { ccclass, property } = _decorator;

/**
 * EffectPool Component
 * Manages particle effect instances using object pooling.
 * Automatically spawns and despawns particle effects with proper lifecycle management.
 */
@ccclass('EffectPool')
export class EffectPool extends Component {
    /** Prefab containing the particle system to spawn */
    @property(Prefab)
    effectPrefab: Prefab = null;

    /** Number of effects to pre-instantiate in the pool */
    @property
    initialPoolSize: number = 10;

    /** Object pool storing inactive effect nodes */
    private pool: NodePool = null;

    onLoad() {
        this.pool = new NodePool();
        for (let i = 0; i < this.initialPoolSize; i++) {
            const effect = instantiate(this.effectPrefab);
            this.pool.put(effect);
        }
    }

    /**
     * Spawns a particle effect at the specified position
     * The effect automatically returns to the pool after its lifetime expires
     * @param parent Parent node to attach the effect to
     * @param position World position to play the effect at
     * @returns Effect node that was spawned
     */
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
        particle.resetSystem();

        // Automatically return to pool after particle lifetime
        this.scheduleOnce(() => {
            this.pool.put(effectNode);
        }, particle.life);

        return effectNode;
    }
}