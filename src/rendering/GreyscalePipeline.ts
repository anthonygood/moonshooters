import Phaser from 'phaser';

// workaround for using glsl tagged templates
const glsl = strings => strings[0];

const fragShader = glsl`
  precision mediump float;
  uniform sampler2D uMainSampler;
  varying vec2 outTexCoord;
  void main(void) {
    vec4 color = texture2D(uMainSampler, outTexCoord);
    float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    gl_FragColor = vec4(vec3(gray), color.a);
  }
`;

// Copied from https://www.stephengarside.co.uk/blog/phaser-3-black-and-white-or-greyscale-sprites/
const GreyscalePipeline = new Phaser.Class({
  Extends: Phaser.Renderer.WebGL.Pipelines.SinglePipeline,
  initialize: function GrayscalePipeline(game) {
    Phaser.Renderer.WebGL.Pipelines.SinglePipeline.call(this, {
      game: game,
      renderer: game.renderer,
      fragShader,
    });
  },
});


export const GREYSCALE_PIPELINE_KEY = 'Greyscale';

let added = false;
const addGreyscalePipeline = game => {
  if (added) return;
  game.renderer.pipelines.add(GREYSCALE_PIPELINE_KEY, new GreyscalePipeline(game));
  added = true;
};

export default addGreyscalePipeline;
