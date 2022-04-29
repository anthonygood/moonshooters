import Phaser from 'phaser';

export const SCENE_KEY = 'fog-scene';
export const SPRITE_KEY = 'fog-sprite';

const asset = (path: string) => `./assets/${path}`;

export default class FogScene extends Phaser.Scene {

  constructor() {
    super(SCENE_KEY);
  }

  preload() {
    // Fog
    this.load.image(SPRITE_KEY, asset('sprites/light fog@0.5x.webp'))
  }

  create() {
    const fogg = (x, y) =>
    this.add.image(x, y, SPRITE_KEY)
      .setDepth(7)
      .setScale(3)
      .setScrollFactor(0);

    const foggg = x => fogg(x * 100, x * 100);

    const emitter = this.add.particles(SPRITE_KEY, null, {
      x: 350,
      y: 650,
      angle: { min: 180, max: 360 },
      speedX: 200,
      speedY: 10,
      delay: 500,
      lifespan: 1000,
      frequency: 1000,
      // radial: true,
      gravityY: -100,
      quantity: 1,
      scale: { min: 1, max: 3 },
    });

    emitter.setDepth(7);
    window.e = emitter;

  // this.scene.add.

  // this.scene.add.image(300, 300, FOG_KEY).setDepth(8).setScrollFactor(0);
  // this.scene.add.image(400, 400, FOG_KEY);
  // this.scene.add.image(500, 500, FOG_KEY);
  // this.scene.add.image(600, 600, FOG_KEY);

  // [3,
    // 4, 4, 4.1, 5, 7
  // ].forEach(foggg);

  }
}
