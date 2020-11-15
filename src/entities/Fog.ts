const WHITE = '#FFFFFF';
const DAY = '#74F0FB';
const WARM = '#FF7300'
const DEFAULT_COLOUR = DAY;
const DEFAULT_OPACITY = 0.4;

class Fog {
  private scene: Phaser.Scene;
  private colour: string;
  private opacity: number;

  constructor(scene, colour = DEFAULT_COLOUR, opacity = DEFAULT_OPACITY) {
    this.scene = scene;
    this.colour = colour;
    this.opacity = opacity;
  }

  add(key = 'fog') {
    const { colour, opacity, scene } = this;
    const { displayHeight: height, displayWidth: width  } = scene.cameras.main;

    const texture = scene.textures.createCanvas(key, width, height);

    texture.context.fillStyle = colour;
    texture.context.fillRect(0, 0, Number(width), Number(height));
    texture.refresh();

    scene.add.image(width / 2, height / 2, key)
      .setAlpha(opacity)
      .setScrollFactor(0);
  }

  remove() {}
}

export default Fog;
