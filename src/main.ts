import 'phaser';

import TheCity from './scenes/TheCity';
import TheCityII from './scenes/TheCityII';
import TheCityIII from './scenes/TheCityIII';
import TheCityIV from './scenes/TheCityIV';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'content',
  width: window.innerWidth,
  height: window.innerHeight,
  resolution: 1,
  backgroundColor: '#FFFFFF',
  scene: [
    TheCity,
    TheCityII,
    TheCityIII,
    TheCityIV,
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
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
};

new Phaser.Game(config);
