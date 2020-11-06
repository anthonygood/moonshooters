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
      debugShowBody: true,
      debugShowVelocity: true,
      debugBodyColor: 10,
      tileBias: 64,
      gravity: { y: 2500 },
      debug: true,
    }
  }
};

new Phaser.Game(config);
