import 'phaser';

import TestScene from './scenes/PlayScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'content',
  width: 800,
  height: 800,
  resolution: 1,
  backgroundColor: '#EDEEC9',
  scene: [
    TestScene
  ],
  render: {
    antialias: false,
  },
  physics: {
    default: 'arcade',
    arcade: {
      tileBias: 64,
      gravity: { y: 2500 },
      debug: false
    }
  }
};

new Phaser.Game(config);
