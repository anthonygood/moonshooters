import 'phaser';
import { sample } from './';
import * as TextureKeys from './TextureKeys';
import Layers from '../entities/NPC/Layers';
import { SpriteLayer } from '../entities/Player';
import { invertRB } from '../entities/NPC/Colours';

const VARIATION_COUNT = 40;

// reducer
type Size = { h: number, w: number };

// This function should return a height/width big enough to fit all the textures inside.
// The algorithm is just to sum the width of all textures, and use the largest height.
// No 'packing' happens, so lots of empty space...
const boundaryRect = (acc: Size, texture: Phaser.Textures.Frame) => {
  const { height, width } = texture;
  // const { size } = texture.customData as { size: Size };
  return {
    h: acc.h >= height ? acc.h : height,
    w: acc.w + width,
  };
};

// Single place for determining how to move origin
const nextOrigin = (
  origin: { x: number, y: number } = { x: 0, y: 0 },
  rect: { w?: number, width?: number } = { w: 0 },
) => {
  return {
    x: origin.x + rect.width || rect.w,
    y: origin.y,
  };
};

const addFrames = (renderTexture: Phaser.GameObjects.RenderTexture) => {
  let origin = { x: 0, y: 0 };

  return (texture: Phaser.Textures.Texture) => {
    const { key } = texture;
    const baseFrame = texture.frames.__BASE as Phaser.Textures.Frame;
    renderTexture.draw(baseFrame, origin.x, origin.y);

    const frames: Phaser.Textures.Frame[] = Object.values(texture.frames);

    frames.forEach(frame => {
      if (frame.name === '__BASE') return;

      renderTexture.texture.add(
        `${key}:${frame.name}`,
        frame.sourceIndex,
        origin.x + frame.cutX,
        // May need offset to support different sized base frames, or ensure always justify bottom
        (baseFrame.height - frame.cutY) - frame.cutHeight,
        frame.cutWidth,
        frame.cutHeight
      );
    });

    origin = nextOrigin(origin, { width: baseFrame.width });
  };
}

const combineTextures = (
  scene: Phaser.Scene,
  textures: Phaser.Textures.Texture[]
) => {
  const { h , w } = textures
    .map(texture => texture.frames.__BASE)
    .reduce(boundaryRect, { h: 0, w: 0 });
  const renderTexture = scene.make.renderTexture({ width: w, height: h }, false);
  textures.forEach(addFrames(renderTexture));

  return renderTexture;
};

// Should accept an array of atlases and combine into one texture + atlas json
export const combineAtlases = (
  scene: Phaser.Scene,
  textures = scene.textures.list,
) => {
  // Textures without `size` customData are (probably) not from sprite atlases...
  const filteredTextures = Object.values(textures).filter(_ => _.customData.size);
  const texture = combineTextures(scene, filteredTextures);
  texture.saveTexture(TextureKeys.COMBINED_TEXTURE_KEY);
  return texture;
};

// Select a random combination of layers with tint values
const sampleLayers = (): SpriteLayer[] =>
  Layers.flatMap(layer => {
    if (layer[0].key === 'mask') return;

    const { tints, optional, ...selected } = sample(layer);
    const shouldAdd = sample([true, !optional]);
    const tint = sample(tints);

    const layerData = {
      ...selected,
      tints: [tint],
    };

    return shouldAdd && layerData;
  }).filter(Boolean);

const max = (key: string) => (acc: number, item: any) => Math.max(acc, item[key]);
const sum = (key: string) => (acc: number, item: any) => acc + item[key];

const maxWidth = max('width');
const maxHeight = max('height');
const sumWidth = sum('width');
const sumHeight = sum('height');

interface IReducer {
  (sum: number, item: any): number;
}

const stack = (widthReducer: IReducer, heightReducer: IReducer) => (collection: any[]) => {
  const width: number = collection.reduce(widthReducer, 0);
  const height: number = collection.reduce(heightReducer, 0);
  return { height, width };
};

const stackHorizontal = stack(sumWidth, maxHeight);
const stackVertical = stack(maxWidth, sumHeight);
const fit = stack(maxWidth, maxHeight);
const sumDimension = stack(sumWidth, sumHeight);

const addFrame = (
  scene: Phaser.Scene,
  renderTexture: Phaser.GameObjects.RenderTexture,
  origin: { x: number, y: number } = nextOrigin(),
  layers: SpriteLayer[],
  index: number | string,
  textureHeight: number,
) => (frameName: string) => {
  let frame;
  // For each layer...
  layers.forEach(({ key, tints, blendMode }, i) => {
    frame = scene.textures.getFrame(key, frameName);

    // Always uses first tint in array
    const [tint] = tints || [];
    const channelSwappedTint = tint && invertRB(tint);

    renderTexture.draw(frame, origin.x, origin.y, 1, channelSwappedTint);
  });
  const frameKey = TextureKeys.getCharSpriteKey(index, frameName);
  const frameOriginY = textureHeight - origin.y - frame.height;

  // // May need offset to support different sized base frames, or ensure always justify bottom
  renderTexture.texture.add(frameKey, 0, origin.x, frameOriginY, frame.width, frame.height);
  origin = nextOrigin(origin, { width: frame.width });
};

export const renderToTexture = (
  scene: Phaser.Scene,
  count = VARIATION_COUNT,
  debug = false
) => {
  // Get dimensions of target frames: assume all same size!
  const [[specimen]] = Layers;
  const specimenFrames = Object
    .values(scene.textures.list[specimen.key].frames)
    .filter((frame: Phaser.Textures.Frame) => frame.name !== '__BASE');

  const { height, width } = stackHorizontal(specimenFrames);
  const textureHeight = height * (count + 1);

  const renderTexture = debug ?
    scene.add.renderTexture(50, 50, width, textureHeight).setScale(2).setDepth(9) :
    scene.make.renderTexture({ width, height: textureHeight }, false);

  const frameNames = specimenFrames
    .map((frame: Phaser.Textures.Frame) => frame.name)
    .filter(name => !name.includes('jump'))
    .sort();

  let origin;

  // NPC variations
  for (let i = 0; i < count; i++) {
    const layers = sampleLayers();
    origin = { x: 0, y: height * i };
    const add = addFrame(scene, renderTexture, origin, layers, i, textureHeight);
    frameNames.forEach(add);
  }

  // Mask
  const [mask] = Layers.find(([{ key }]) => key === 'mask');
  const maskOrigin = { x: 0, y: height * count };
  const addMask = addFrame(scene, renderTexture, maskOrigin, [mask], 'mask', textureHeight);
  frameNames.forEach(addMask);

  renderTexture.saveTexture(TextureKeys.CHAR_ATLAS_KEY);

  if (debug) {
    // renderTexture.fill(COLOURS.green, 0.25, 0, 0, width, textureHeight);
    scene.add.image(500, 500, TextureKeys.CHAR_ATLAS_KEY);

    [0,1,2,3,4].forEach(i => {
      scene[`sprite_${i}`] = scene.add.sprite(600, 200 + i * 70, TextureKeys.CHAR_ATLAS_KEY, TextureKeys.getCharSpriteKey(i, 'idle_1')).setScale(3.5).setDepth(7);
    });
  }
};
