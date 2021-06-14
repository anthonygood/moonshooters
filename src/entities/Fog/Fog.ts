import {
  FogConfig,
  morning,
  day,
  sunset,
  night,
  smog,
  dusk,
  endLevel,
} from './fogConfigs';

type FogParams = FogConfig & {
  scene: Phaser.Scene,
  mapHeight?: number,
};

type AddFog = (config: FogParams) => Phaser.GameObjects.Image;

export const addFog: AddFog = ({
  scene,
  mapHeight = 0,
  fill,
  opacity,
  blendMode,
  depth = 0,
  key = `fog${depth}`,
}) => {
  const { displayHeight, displayWidth: width  } = scene.cameras.main;
  const height = mapHeight ||
    displayHeight;

  const texture: Phaser.Textures.CanvasTexture = scene.textures.exists(key) ?
    scene.textures.get(key) as Phaser.Textures.CanvasTexture :
    scene.textures.createCanvas(key, width, height);

  const fillStyle = typeof fill === 'string' ? fill : fill(texture.context, height, width);
  texture.context.fillStyle = fillStyle;
  texture.context.fillRect(0, 0, width, height);
  texture.refresh();

  const scrollFactorX = 0;
  const scrollFactorY = mapHeight ? 1 : 0;

  return scene.add.image(width / 2, height / 2, key)
    .setAlpha(opacity)
    .setScrollFactor(scrollFactorX, scrollFactorY)
    .setBlendMode(blendMode)
    .setDepth(depth);
};

const applyFog = (fogs: FogConfig[]) =>
  (scene: Phaser.Scene, mapHeight?: number) =>
    fogs.map(config =>
      addFog({
        ...config,
        scene,
        mapHeight,
      })
    );

const ATMOSPHERE = {
  morning: applyFog(morning),
  day: applyFog(day),
  sunset: applyFog(sunset),
  dusk: applyFog(dusk),
  night: applyFog(night),
  endLevel: applyFog(endLevel),
  smog: applyFog(smog),
};

export default ATMOSPHERE;
