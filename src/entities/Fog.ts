export const WHITE = '#FFFFFF';
export const DAY = '#74F0FB';
export const WARM = '#FF7300';
export const PINK = '#FF007b';
export const DARKBLUE = '#080185';

const DEFAULT_COLOUR = DAY;
const DEFAULT_OPACITY = 0.2;

const getGradient = (a: string, b: string) => (
  ctx: CanvasRenderingContext2D,
  height: number,
  width: number
) => {
  const gradient = ctx.createLinearGradient(0, 0, width / 8, height);
  gradient.addColorStop(0, a);
  gradient.addColorStop(1, b);
  return gradient;
}

export const GRADIENTS = {
  day: getGradient(WHITE, DAY),
  night: getGradient(DARKBLUE, DAY),
  sunset: getGradient(WARM, PINK),
};

class Fog {
  private scene: Phaser.Scene;
  private colour: string | CanvasGradient;
  private opacity: number;
  private depth: number;
  public image: Phaser.GameObjects.Image;

  constructor(scene, opacity = DEFAULT_OPACITY, colour = DEFAULT_COLOUR, depth = 0) {
    this.scene = scene;
    this.colour = colour;
    this.opacity = opacity;
    this.depth = depth;
  }

  add(key = 'fog', gradient = true) {
    const { colour, opacity, scene } = this;
    const { displayHeight: height, displayWidth: width  } = scene.cameras.main;

    const texture = scene.textures.createCanvas(key, width, height);

    texture.context.fillStyle = gradient ? GRADIENTS.night(texture.context, height, width) : colour;
    texture.context.fillRect(0, 0, width, height);
    texture.refresh();

    this.image = scene.add.image(width / 2, height / 2, key)
      .setAlpha(opacity)
      .setScrollFactor(0)
      .setBlendMode(2)
      // .setDepth(this.depth);

    return this;
  }

  remove() {}
}

export default Fog;
