import {
  FogConfig,
  morning,
  day,
  sunset,
  night,
  smog,
  dusk,
  endLevel,
  pastel,
} from './fogConfigs';
import pipelines, { PIPELINE_KEYS } from '../../rendering/pipelines';
import { toRgb } from '../../util/Colours';

type FogParams = FogConfig & {
  scene: Phaser.Scene,
  mapHeight?: number,
};

type AddFog = (config: FogParams) => void;

const BLANK_PIXEL_TEXTURE_KEY = 'blankPixelTexture';

const createPixelTexture = (scene: Phaser.Scene) => {
  const gfx = scene.add.graphics({ fillStyle: { color: 0xffffff } });
  gfx.fillRect(0, 0, 1, 1);
  const renderTexture = scene.make.renderTexture({ width: 1, height: 1 }, false);
  renderTexture.draw(gfx, 0, 0);
  renderTexture.saveTexture(BLANK_PIXEL_TEXTURE_KEY);
  gfx.destroy();
};

const addBlankBackground = (scene: Phaser.Scene, pipeline) => {
  if (!scene.textures.exists(BLANK_PIXEL_TEXTURE_KEY)) {
    createPixelTexture(scene);
  }

  return scene.add.image(
    pipeline.width / 2,
    pipeline.height / 2,
    BLANK_PIXEL_TEXTURE_KEY
  )
    .setScrollFactor(0)
    .setScale(pipeline.width, pipeline.height)
    .setPipeline(PIPELINE_KEYS.BACKGROUND_1);
};

export const addFog: AddFog = ({
  scene,
  colours,
  opacity,
  depth = 0,
}, index) => {
  const { BackgroundOne, BackgroundTwo, BackgroundThree } = pipelines;

  const bkgPipelines = [BackgroundOne, BackgroundTwo, BackgroundThree];
  const pipelineIndex = Math.min(index, bkgPipelines.length);
  const pipeline = bkgPipelines[pipelineIndex];

  if (!pipeline) {
    throw new Error(`No background shader pipeline available for depth of '${depth}'`);
  }

  const { currentShader } = pipeline;
  const [colourOne, colourTwo = colourOne] = [].concat(colours).map(toRgb);

  currentShader.set2f('resolution', BackgroundOne.width, BackgroundOne.height);
  currentShader.set3f('colourOne', ...colourOne);
  currentShader.set3f('colourTwo', ...colourTwo);
  currentShader.set1f('blendFactor', opacity);
};

export const addFogWithRects: AddFog = ({
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

  scene.add.image(width / 2, height / 2, key)
    .setAlpha(opacity)
    .setScrollFactor(scrollFactorX, scrollFactorY)
    .setBlendMode(blendMode)
    .setDepth(depth);
};

const applyFog = (fogs: FogConfig[]) =>
  (scene: Phaser.Scene, mapHeight?: number) => {
    const [{ name, key }] = fogs;
    let bkg = addBlankBackground(scene, pipelines.BackgroundOne);
    fogs
      .map(config => ({ ...config, scene, mapHeight }))
      .map(addFog);

    return () => bkg.destroy();
  }

const ATMOSPHERE = {
  morning: applyFog(morning),
  pastel: applyFog(pastel),
  day: applyFog(day),
  sunset: applyFog(sunset),
  dusk: applyFog(dusk),
  night: applyFog(night),
  endLevel: applyFog(endLevel),
  smog: applyFog(smog),
};

export default ATMOSPHERE;
