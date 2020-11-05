import 'phaser';

import TestScene from './scenes/PlayScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'content',
  width: 640,
  height: 480,
  resolution: 1,
  backgroundColor: '#EDEEC9',
  scene: [
    TestScene
  ],
  render: {
    antialias: false
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false
    }
  }
};

new Phaser.Game(config);
