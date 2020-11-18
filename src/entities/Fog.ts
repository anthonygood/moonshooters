export const WHITE = '#FFFFFF';
export const DAY = '#74F0FB';
export const WARM = '#FF7300';
export const PINK = '#FF007b';

const DEFAULT_COLOUR = DAY;
const DEFAULT_OPACITY = 0.2;

class Fog {
  private scene: Phaser.Scene;
  private colour: string;
  private opacity: number;

  constructor(scene, opacity = DEFAULT_OPACITY, colour = DEFAULT_COLOUR) {
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
