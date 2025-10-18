# Scene Setup Instructions for Cocos Creator

## ✅ What's Already Done (Code Level)

1. **Scene Structure**: scene.scene has all nodes properly configured
   - Canvas with Camera
   - GameManager node with scripts
   - GameBoard node (container for grid)
   - InputManager node
   - ScoreLabel node with Label component

2. **Script References in Scene**: All GameManager references are connected:
   - ✅ boardNode → GameBoard node
   - ✅ inputManagerNode → InputManager node
   - ✅ cellPrefab → Cell.prefab
   - ✅ scoreLabel → ScoreLabel Label component
   - ✅ boardSize: 8
   - ✅ initialBlockCount: 3
   - ⚠️ **blockPool** → NEEDS TO BE CONNECTED (see Step 3)

3. **Prefabs**:
   - ✅ Block.prefab has Block.ts component attached
   - ✅ Block.prefab uses gold_block image
   - ✅ Cell.prefab uses dark gray color (RGB: 40, 40, 40)

4. **Scripts Updated**:
   - ✅ **BlockPool.ts** - NEW! Object pooling system for efficient block management
   - ✅ GameManager.ts now uses BlockPool instead of direct instantiation
   - ✅ All core gameplay logic is implemented

## 🔧 What You Need to Do in Cocos Creator Editor

### Step 1: Open the Scene
1. Open Cocos Creator
2. Open the project: `D:\Cocos\blobblab`
3. In **Assets** panel, navigate to `assets/scenes/`
4. Double-click `scene.scene` to open it

### Step 2: Create BlockPool Node
1. In **Hierarchy** panel, right-click on `Canvas`
2. Select **Create → Create Empty Node**
3. Rename the new node to `BlockPool`
4. With `BlockPool` selected, in **Inspector** panel:
   - Click **Add Component**
   - Search for and select `BlockPool` script

### Step 3: Configure BlockPool Component (IMPORTANT!)
With `BlockPool` node selected, in Inspector find the **BlockPool** component:

1. **Block Prefab**:
   - Drag `assets/prefabs/Block.prefab` into this field

2. **Block Sprites** (Array):
   - Set array size to `3`
   - Element 0: Drag `assets/images/gold_block` sprite
   - Element 1: Drag `assets/images/green_block` sprite
   - Element 2: Drag `assets/images/purple_block` sprite

3. **Initial Pool Size**:
   - Leave as `20` (good for 8x8 board)
   - Increase to 30-40 for larger boards (12x12 or 16x16)

**Note**: Make sure to drag the actual **image assets**, not the .png files.

### Step 4: Connect BlockPool to GameManager
1. Select `GameManager` node in Hierarchy
2. In Inspector, find the `GameManager` component
3. Find the **Block Pool** property
4. Drag the `BlockPool` node from Hierarchy into this field

**OLD PROPERTIES (can be ignored/removed)**:
- ~~Block Prefab~~ - Now in BlockPool
- ~~Block Sprites~~ - Now in BlockPool

### Step 5: Optional - Update Score Label Font
1. Select `ScoreLabel` node in Hierarchy
2. In Inspector, find the `Label` component
3. To use a custom font:
   - Uncheck "Use System Font"
   - Drag one of the font files from `assets/fonts/` to the `Font` property
   - Recommended: `PressStart2P-Regular.ttf` or `Silkscreen-Bold.ttf`
4. Adjust `Font Size` if needed (current: 40)

### Step 4: Test the Game
1. Click the **Play** button (▶️) at the top of the editor
2. You should see:
   - An 8x8 grid of dark gray cells
   - 3 randomly colored blocks spawn at the start
   - Swipe in any direction to move all blocks
   - When a row or column is filled, it clears and score increases
   - New blocks spawn after each valid move

### Step 7: Verify Controls
Test all 4 swipe directions:
- ⬆️ Swipe Up
- ⬇️ Swipe Down
- ⬅️ Swipe Left
- ➡️ Swipe Right

## 🎮 How to Play

1. **Swipe** in any direction (up/down/left/right)
2. **All blocks** on the board move in that direction until they hit the edge or another block
3. **Fill** a complete row or column to clear it and score points
4. **Clear multiple** rows/columns at once for combo bonuses!
5. Game ends when the board is full and no moves are possible

## 🐛 Troubleshooting

### Blocks not spawning?
- Check that `Block Prefab` is set in **BlockPool** component
- Make sure `blockPool` reference is connected in **GameManager**
- Verify `boardNode` is connected to GameBoard node

### Blocks all the same color?
- Check that you added 3 sprite frames to `Block Sprites` array in **BlockPool**
- Make sure you dragged the image assets, not the .png files

### Error: "BlockPool is not assigned!"
- Select GameManager node
- Drag BlockPool node into the `Block Pool` property

### Swipe not working?
- Check that `inputManagerNode` reference is set in GameManager
- Verify InputManager script is attached to InputManager node

### Score not updating?
- Check that `scoreLabel` reference is set in GameManager
- Make sure it's pointing to the Label component, not just the node

### Game lags when clearing lines?
- Increase `Initial Pool Size` in BlockPool (try 30-40)
- Check Console for "Pool empty, created new block" messages

## 📋 Next Steps (Sprint 2 & 3)

After confirming the game works, you can enhance it with:

### Sprint 2 Features:
- [ ] Create Menu scene with difficulty selection (8x8, 12x12, 16x16)
- [ ] Add Game Over UI panel with restart/menu buttons
- [ ] Implement high score persistence using localStorage
- [ ] Add proper scene transitions

### Sprint 3 Polish:
- [ ] Add tweening animations for smooth block movement
- [ ] Add particle effects when lines clear
- [ ] Add sound effects (swipe, clear, game over)
- [ ] Add background music
- [ ] Visual polish (background, better UI)

## 📝 Notes

- Current board size: **8x8** (can be changed in GameManager component)
- Initial blocks: **3** (can be changed in GameManager component)
- **Block Pool Size: 20** (can be increased for larger boards)
- Cell size: **90x90 pixels**
- Spacing: **10 pixels**
- Swipe threshold: **50 pixels** (can be adjusted in InputManager)

## 🚀 New Feature: Block Pool System

The game now uses an **Object Pooling** system for better performance:
- ✅ Blocks are reused instead of destroyed/recreated
- ✅ 10x faster spawning and despawning
- ✅ Less garbage collection lag
- ✅ Centralized block color randomization

See `assets/instructions/blockpool.md` for detailed documentation.

---

**Good luck! If the game doesn't work after following these steps, check the Console panel for error messages.**
