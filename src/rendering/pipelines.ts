import { GreyscalePipeline } from './GreyscalePipeline';
import { GradientPipeline } from './GradientPipeline';

const addPipeline = (game: Phaser.Game, Klass, key = Klass.KEY) => {
  const instance = new Klass(game);
  game.renderer.pipelines.add(key, instance);
  return instance;
}

export enum PIPELINE_KEYS {
  GREYSCALE    = 'Greyscale',
  BACKGROUND_1 = 'BackgroundOne',
  BACKGROUND_2 = 'BackgroundTwo',
  BACKGROUND_3 = 'BackgroundThree',
};

type PipelineDict = { [key in PIPELINE_KEYS]?: typeof GreyscalePipeline | GradientPipeline };

const pipelines: PipelineDict = {};
let added = false;

export const addPipelines = game => {
  if (added) return;
  added = true;

  pipelines[PIPELINE_KEYS.GREYSCALE] = addPipeline(game, GreyscalePipeline, PIPELINE_KEYS.GREYSCALE);

  pipelines[PIPELINE_KEYS.BACKGROUND_1] = addPipeline(game, GradientPipeline, PIPELINE_KEYS.BACKGROUND_1);
  pipelines[PIPELINE_KEYS.BACKGROUND_2] = addPipeline(game, GradientPipeline, PIPELINE_KEYS.BACKGROUND_2);
  pipelines[PIPELINE_KEYS.BACKGROUND_3] = addPipeline(game, GradientPipeline, PIPELINE_KEYS.BACKGROUND_3);
};

window.pipelines = pipelines;

export default pipelines;
