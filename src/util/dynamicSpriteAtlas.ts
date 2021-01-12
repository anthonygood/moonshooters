import 'phaser';

export const COMBINED_TEXTURE_KEY = '@@combined';
const COMBINED_TEXTURE_PREFIX = COMBINED_TEXTURE_KEY + ':';
export const getCombinedKey = key => `${COMBINED_TEXTURE_PREFIX}${key}`;
export const extractKey = combinedKey => combinedKey.substring(COMBINED_TEXTURE_PREFIX.length);

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
  origin: { x: number, y: number },
  rect: { w?: number, width?: number }
) => {
  return {
    x: origin.x + rect.width || rect.w,
    y: 0,
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
  key: string,
  scene: Phaser.Scene,
  textures: Phaser.Textures.Texture[]
) => {
  const { h , w } = textures.map(texture => texture.frames.__BASE).reduce(boundaryRect, { h: 0, w: 0 });
  const renderTexture = scene.make.renderTexture({ width: w, height: h });
  const add = addFrames(renderTexture);

  textures.forEach(add);
  renderTexture.saveTexture(key);

  return renderTexture;
};

// Should accept an array of atlases and combine into one texture + atlas json
export const combineAtlases = (
  scene: Phaser.Scene,
) => {
  // Textures without `size` customData are (probably) not from sprite atlases...
  const textures = Object.values(scene.textures.list).filter(_ => _.customData.size);
  return combineTextures(COMBINED_TEXTURE_KEY, scene, textures);
};
