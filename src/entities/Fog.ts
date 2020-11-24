const BLACK = 'black';
export const WHITE = '#FFFFFF';
export const DAY = '#74F0FB';
export const WARM = '#FF7300';
export const PINK = '#FF007b';
const PURPLE = '#c70074';
export const DARKBLUE = '#080185';
const DARKDARKBLUE = '#0a0654';
const MIDNIGHTBLUE = '#05032e';
const MORNINGYELLOW = '#fbfcca';

const DEFAULT_COLOUR = DAY;
const DEFAULT_OPACITY = 0.2;

const getGradient = (a: string, b: string, stops = [0, 1]) => (
  ctx: CanvasRenderingContext2D,
  height: number,
  width: number
) => {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  const [firstStop, secondStop] = stops;
  gradient.addColorStop(firstStop, a);
  gradient.addColorStop(secondStop, b);
  return gradient;
}

export const GRADIENTS = {
  day: getGradient(WHITE, DAY),
  sunset: getGradient(PURPLE, WARM),
  dusk: getGradient(DARKBLUE, DAY),
  night: getGradient(MIDNIGHTBLUE, DARKBLUE, [0.7, 1]),
  nightNeon: getGradient(DARKBLUE, PINK),
};

type GradientFn = (ctx: CanvasRenderingContext2D, height: number, width: number) => CanvasGradient;
type AddFog = (
  config: {
    scene: Phaser.Scene,
    fill: string | GradientFn,
    opacity: number,
    key?: string,
    blendMode?: 0 | 1 | 2,
    depth?: number,
  }
) => Phaser.GameObjects.Image;

export const addFog: AddFog = ({
  scene,
  fill,
  opacity,
  blendMode,
  depth = 0,
  key = `fog${depth}`,
}) => {
  const { displayHeight: height, displayWidth: width  } = scene.cameras.main;

  const texture = scene.textures.createCanvas(key, width, height);
  const fillStyle = typeof fill === 'string' ? fill : fill(texture.context, height, width);
  texture.context.fillStyle = fillStyle;
  texture.context.fillRect(0, 0, width, height);
  texture.refresh();

  return scene.add.image(width / 2, height / 2, key)
    .setAlpha(opacity)
    .setScrollFactor(0)
    .setBlendMode(blendMode)
    .setDepth(depth);
};

const nightFog = (scene: Phaser.Scene): Phaser.GameObjects.Image[] => [
  addFog({
    scene,
    fill: GRADIENTS.night,
    opacity: 1,
    depth: 0,
    blendMode: 0,
  }),
  addFog({
    scene,
    fill: GRADIENTS.night,
    opacity: 0.7,
    depth: 2,
    blendMode: 2,
  }),
  addFog({
    scene,
    fill: GRADIENTS.night,
    opacity: 0.6,
    depth: 4,
    blendMode: 0,
  }),
  addFog({
    scene,
    fill: GRADIENTS.dusk,
    opacity: 0.3,
    depth: 6,
    blendMode: 2,
  }),
];

const duskFog = (scene: Phaser.Scene): Phaser.GameObjects.Image[] => [
  addFog({
    scene,
    fill: GRADIENTS.dusk,
    opacity: 1,
    depth: 0,
    blendMode: 0,
  }),
  addFog({
    scene,
    fill: GRADIENTS.dusk,
    opacity: 0.7,
    depth: 2,
    blendMode: 2,
  }),
  addFog({
    scene,
    fill: GRADIENTS.dusk,
    opacity: 0.6,
    depth: 4,
    blendMode: 2,
  }),
];

const sunsetFog = (scene: Phaser.Scene): Phaser.GameObjects.Image[] => [
  addFog({
    scene,
    fill: GRADIENTS.sunset,
    opacity: 0.7,
    depth: 2,
    blendMode: 0,
  }),
  addFog({
    scene,
    fill: GRADIENTS.sunset,
    opacity: 0.5,
    depth: 4,
    blendMode: 0,
  }),
  addFog({
    scene,
    fill: WARM,
    opacity: 0.3,
    depth: 5,
    blendMode: 0,
  }),
];

const dayFog = (scene: Phaser.Scene): Phaser.GameObjects.Image[] => [
  addFog({
    scene,
    fill: GRADIENTS.day,
    opacity: 0.7,
    depth: 2,
    blendMode: 0,
  }),
  addFog({
    scene,
    fill: GRADIENTS.day,
    opacity: 0.6,
    depth: 4,
    blendMode: 2,
  }),
  addFog({
    scene,
    fill: GRADIENTS.day,
    opacity: 0.3,
    depth: 6,
    blendMode: 2,
  }),
];

const morningFog = (scene: Phaser.Scene): Phaser.GameObjects.Image[] => [
  addFog({
    scene,
    fill: WHITE,
    opacity: 0.7,
    depth: 2,
    blendMode: 0,
  }),
  addFog({
    scene,
    fill: WHITE,
    opacity: 0.6,
    depth: 4,
    blendMode: 0,
  }),
  addFog({
    scene,
    fill: WHITE,
    opacity: 0.3,
    depth: 6,
    blendMode: 2,
  }),
];

const endLevelFog = (scene: Phaser.Scene): Phaser.GameObjects.Image[] => [
  addFog({
    scene,
    fill: BLACK,
    opacity: 1,
    depth: 2,
    blendMode: 0,
    key: 'endLevel1',
  }),
  addFog({
    scene,
    fill: BLACK,
    opacity: 0.6,
    depth: 4,
    blendMode: 2,
    key: 'endLevel2',
  }),
  addFog({
    scene,
    fill: BLACK,
    opacity: 0.6,
    depth: 5,
    blendMode: 2,
    key: 'endLevel3',
  }),
];

const ATMOSPHERE = {
  morning: morningFog,
  day: dayFog,
  sunset: sunsetFog,
  dusk: duskFog,
  night: nightFog,
  // nightNeon: nightNeon
  endLevel: endLevelFog,
};

export default ATMOSPHERE;
