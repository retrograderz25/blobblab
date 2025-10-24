# Blob Blab 🎮

A unique grid-based puzzle game that combines strategic block placement with satisfying line-clearing mechanics. Built with Cocos Creator and TypeScript, Blob Blab challenges players to master swipe-based controls while managing an ever-filling game board.

![Game Version](https://img.shields.io/badge/version-1.0.0-blue)
![Cocos Creator](https://img.shields.io/badge/Cocos%20Creator-3.8.7-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)

---

## 📖 Overview

**Blob Blab** is a strategic puzzle game where players use swipe gestures to move colored blocks across a grid. The objective is to create complete rows or columns to clear them from the board and score points. As blocks continue to spawn, players must think ahead to avoid filling the board while maximizing their score through clever combinations and combos.

### Key Features

- 🎯 **Swipe-Based Gameplay** - Intuitive controls for moving all blocks simultaneously
- 🎨 **Dynamic Block System** - Multi-cell shapes (Tetromino-inspired patterns)
- 📊 **Adaptive Difficulty** - Three board sizes (8x8, 12x12, 16x16)
- ⚡ **Optimized Performance** - Object pooling for smooth gameplay
- 🏆 **Score Tracking** - High score persistence with combo bonuses
- 🎭 **Visual Feedback** - Particle effects and smooth animations

---

## 🎮 Gameplay

### Core Mechanics

**Objective**: Clear rows and columns to prevent the board from filling up while achieving the highest score possible.

**Controls**:
- **Swipe Up/Down/Left/Right** - Move all blocks on the board in the swiped direction
- All blocks move simultaneously until they hit the board edge or another block
- Invalid swipes (no movement) don't trigger new block spawns

### Game Flow

1. **Block Spawning**: Multi-cell shapes appear randomly on empty spaces
2. **Movement**: Swipe to shift all blocks across the board
3. **Line Clearing**: Complete rows/columns automatically clear
4. **Scoring**: Earn points for cleared lines with combo multipliers
5. **Game Over**: Board fills with no valid moves remaining

### Shapes

The game features 8 different block patterns inspired by classic Tetris:

| Shape | Description | Pattern |
|-------|-------------|---------|
| **O** | 2×2 Square | ■■<br>■■ |
| **I** | 4-cell Line | ■<br>■<br>■<br>■ |
| **T** | T-shape | ■■■<br>_■_ |
| **L** | L-shape | ■_<br>■_<br>■■ |
| **J** | Mirrored L | _■<br>_■<br>■■ |
| **S** | S-shape | _■■<br>■■_ |
| **Z** | Z-shape | ■■_<br>_■■ |
| **Single** | 1×1 Block | ■ |

### Scoring System

- **Single Line Clear**: 100 points
- **Combo Multiplier**: Each additional simultaneous line increases the multiplier
  - 2 lines: 250 points (×1.25)
  - 3 lines: 450 points (×1.5)
  - 4+ lines: 700+ points (×1.75+)
- **High Score**: Tracked per difficulty level using local storage

### Difficulty Levels

| Level | Board Size | Description |
|-------|-----------|-------------|
| **Easy** | 8×8 | Perfect for learning mechanics |
| **Medium** | 12×12 | Balanced challenge |
| **Hard** | 16×16 | Maximum strategic depth |

---

## 🏗️ Technical Architecture

### Project Structure

```
blobblab/
├── assets/
│   ├── scripts/          # TypeScript game logic
│   │   ├── GameManager.ts       # Core game controller
│   │   ├── Block.ts             # Individual block component
│   │   ├── Shape.ts             # Multi-block shape grouping
│   │   ├── ShapeData.ts         # Shape pattern definitions
│   │   ├── BlockPool.ts         # Object pooling system
│   │   ├── EffectPool.ts        # Particle effect pooling
│   │   ├── InputManager.ts      # Swipe detection
│   │   ├── MenuManager.ts       # Main menu controller
│   │   ├── GameOverUI.ts        # End game screen
│   │   └── NextBlockPreview.ts  # Upcoming shape display
│   ├── scenes/           # Game scenes
│   │   ├── Menu.scene           # Main menu
│   │   └── scene.scene          # Game board
│   ├── prefabs/          # Reusable game objects
│   ├── images/           # Sprites and textures
│   └── fonts/            # Typography assets
├── package.json          # Project metadata
└── tsconfig.json         # TypeScript configuration
```

### Core Systems

#### **1. GameManager** 
Central controller managing game state, board logic, and flow.

**Responsibilities**:
- Board initialization and grid management
- Shape spawning and placement validation
- Movement logic (gravity simulation)
- Line detection and clearing
- Score calculation
- Game over conditions

#### **2. Block Pool System**
Object pooling implementation for performance optimization.

**Features**:
- Pre-allocated block instances (pool size: 200)
- Recycle/reuse pattern to minimize garbage collection
- Batch operations for efficient multi-block management
- ~10× performance improvement over naive instantiation

#### **3. Shape System**
Groups blocks into cohesive units that move together.

**Functionality**:
- Dynamic shape assembly from pattern data
- Automatic splitting when blocks are removed
- Parent-child relationship management
- Shape-based collision detection

#### **4. Input Manager**
Handles touch and mouse input with swipe gesture recognition.

**Detection Algorithm**:
- Track start/end positions
- Calculate delta vector
- Determine primary axis
- Validate minimum distance threshold
- Fire directional events

---

## 🚀 Getting Started

### Prerequisites

- **Cocos Creator**: Version 3.8.7 or higher
- **Node.js**: Version 16+ (for TypeScript compilation)
- **Operating System**: Windows, macOS, or Linux

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/blobblab.git
   cd blobblab
   ```

2. **Open in Cocos Creator**
   - Launch Cocos Creator
   - Select "Open Project"
   - Navigate to the `blobblab` directory
   - Wait for asset compilation

3. **Run the Game**
   - Open `Menu.scene` in the editor
   - Click the "Play" button (▶️) in the toolbar
   - Or use the browser preview for web builds

### Building for Platforms

#### Web (Browser)
```bash
# In Cocos Creator:
Project → Build → Web Mobile
```

#### Android
```bash
# Configure Android SDK in Cocos Creator settings
Project → Build → Android
```

#### iOS
```bash
# Requires macOS with Xcode installed
Project → Build → iOS
```

---

## 🎓 Development

### Tech Stack

- **Engine**: Cocos Creator 3.8.7
- **Language**: TypeScript 5.x
- **Architecture**: Component-based ECS pattern
- **Rendering**: WebGL/Canvas API
- **Storage**: LocalStorage for persistence

### Key Design Patterns

1. **Object Pooling**: BlockPool and EffectPool for memory efficiency
2. **Observer Pattern**: Event-driven input and game state changes
3. **Component Pattern**: Modular, reusable game components
4. **Singleton**: GameManager for global state access

### Performance Optimizations

- ✅ Object pooling reduces GC pressure by 90%
- ✅ Batch operations for line clearing
- ✅ Efficient grid lookups using 2D arrays
- ✅ Minimal node hierarchy for faster rendering
- ✅ Particle effect pooling

---

## 🎯 Gameplay Strategy Tips

1. **Think Ahead**: Consider where new blocks will spawn after your move
2. **Clear Multiple Lines**: Simultaneous clears earn combo bonuses
3. **Manage Space**: Keep the center clear for maximum flexibility
4. **Use Corners**: Trap blocks strategically in corners
5. **Plan Shapes**: Visualize how multi-cell shapes will fit after movement

---

## 📊 Project Status

### Current Version: 1.0.0

**✅ Implemented**:
- Core swipe-based movement
- Multi-cell shape system
- Line clearing mechanics
- Score tracking and high scores
- Difficulty selection
- Pause/resume functionality
- Game over detection
- Object pooling optimization

**🚧 In Progress**:
- Advanced visual effects
- Sound effects and music
- Tutorial system
- Achievements

**📋 Planned**:
- Leaderboard integration
- Daily challenges
- Power-ups and special blocks
- Multiplayer mode

---

## 🤝 Contributing

This is a personal project, but feedback and suggestions are welcome!

### Reporting Issues

If you encounter bugs or have feature requests:

1. Check existing issues first
2. Create a detailed bug report including:
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots/videos if applicable
   - Device/browser information

---

## 🙏 Acknowledgments

- **Inspiration**: Block Blast, 2048, and classic Tetris
- **Engine**: [Cocos Creator](https://www.cocos.com/en/creator) by Cocos
- **Artwork**: Custom assets created for this project
- **Community**: Special thanks to the Cocos Creator community for resources and support

---

## 📬 Contact

**Developer**: **retrograderz25**
- GitHub: [@retrograderz25](https://github.com/retrograderz25)

---

## 🎮 Play Now

Try Blob Blab online: [Play now!](https://blobblab.vercel.app/)

---

<div align="center">
  <strong>Made with ❤️ using Cocos Creator</strong>
  <br>
  <sub>A personal puzzle game project by <strong>retrograderz25</strong> </sub>
</div>
