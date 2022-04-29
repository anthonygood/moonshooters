import 'phaser';

import TheCity from './scenes/TheCity';
import TheCityII from './scenes/TheCityII';
import TheCityIII from './scenes/TheCityIII';
import TheCityIV from './scenes/TheCityIV';
import FogScene from './scenes/FogScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'content',
  width: 1280,
  height: 800,
  backgroundColor: '#FFFFFF',
  scene: [
    TheCity,
    TheCityII,
    TheCityIII,
    TheCityIV,
    FogScene,
  ],
  render: {
    antialias: false,
  },
  physics: {
    default: 'arcade',
    arcade: {
      // debugShowBody: true,
      // debugShowVelocity: true,
      // debugBodyColor: 10,
      tileBias: 32,
      gravity: { y: 2500 },
      // debug: true,
    }
  },
  input: {
    activePointers: 3,
  },
  scale: {
    // mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
};

new Phaser.Game(config);
