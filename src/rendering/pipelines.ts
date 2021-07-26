import { GreyscalePipeline } from './GreyscalePipeline';
import { GradientPipeline } from './GradientPipeline';

const addPipeline = (game: Phaser.Game, Klass) =>
  game.renderer.pipelines.add(Klass.key, new Klass(game));

let added = false;
const pipelines = {};

export const addPipelines = game => {
  if (added) return;

  pipelines[GreyscalePipeline.key] = addPipeline(game, GreyscalePipeline);
  pipelines[GradientPipeline.key] = addPipeline(game, GradientPipeline);
};

export default pipelines;
