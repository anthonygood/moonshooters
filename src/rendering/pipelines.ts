import { GreyscalePipeline } from './GreyscalePipeline';

const pipelineRegistry = {};

const addPipeline = Klass => (game: Phaser.Game) =>{
  if (pipelineRegistry[Klass.key]) return;

  game.renderer.pipelines.add(Klass.key, new Klass(game));
};

export const addGreyscalePipeline = addPipeline(GreyscalePipeline);
