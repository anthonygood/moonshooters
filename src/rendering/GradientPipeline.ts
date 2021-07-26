import Phaser from 'phaser';

// workaround for using glsl tagged templates
const glsl = strings => strings[0];

const fragShader = glsl`
  precision mediump float;
  uniform vec2 resolution;

  uniform sampler2D uMainSampler;
  varying vec2 outTexCoord;

  uniform vec3 colourOne;
  uniform vec3 colourTwo;

  vec4 get_gradient(vec2 resolution, vec3 colour_a, vec3 colour_b) {
    vec2 st = gl_FragCoord.xy / resolution;
    vec3 pct = vec3(st.y);

    vec3 gradient = mix(
      colour_a,
      colour_b,
      pct
    );

    return vec4(gradient.x, gradient.y, gradient.z, 1);
  }

  void main() {
    // TODO: mix color with gradient according to some uniform value...
    vec4 color = texture2D(uMainSampler, outTexCoord);

    gl_FragColor = get_gradient(resolution, colourOne, colourTwo);
  }
`;

export class GradientPipeline extends Phaser.Renderer.WebGL.Pipelines.SinglePipeline {
  static key = 'Gradient';
  constructor(game) {
    super({
      game,
      renderer: game.renderer, // don't listen to typescript
      fragShader,
    });
  }
}
