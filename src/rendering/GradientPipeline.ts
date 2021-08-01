import Phaser from 'phaser';

// workaround for using glsl tagged templates
const glsl = strings => strings[0];

const vertShader = glsl`
  precision mediump float;

  uniform mat4 uProjectionMatrix;
  uniform vec2 resolution;
  uniform vec3 colourOne;
  uniform vec3 colourTwo;

  attribute vec2 inPosition;
  attribute vec2 inTexCoord;
  attribute float inTexId;
  attribute float inTintEffect;
  attribute vec4 inTint;

  varying vec2 outTexCoord;
  varying float outTintEffect;
  varying vec4 outTint;
  varying vec4 gradient;

  vec4 get_gradient(vec4 coord) {
    vec2 st = inPosition.xy / resolution;
    vec3 pct = vec3(st.y);

    vec3 gradient = mix(
      colourOne,
      colourTwo,
      pct
    );

    return vec4(gradient.x, gradient.y, gradient.z, 1);
  }

  void main () {
    gl_Position = uProjectionMatrix * vec4(inPosition, 1.0, 1.0);

    outTexCoord = inTexCoord;
    outTint = inTint;
    outTintEffect = inTintEffect;
    gradient = get_gradient(gl_Position);
  }
`;

const fragShader = glsl`
  precision mediump float;
  uniform sampler2D uMainSampler;
  varying vec2 outTexCoord;
  varying vec4 gradient;

  uniform vec3 colourOne;
  uniform vec3 colourTwo;
  uniform float blendFactor;

  void main() {
    vec4 colour = texture2D(uMainSampler, outTexCoord);
    if (colour.a > 0.9) {
      vec4 mixControl = vec4(blendFactor, blendFactor, blendFactor, colour.a);
      gl_FragColor = mix(colour, gradient, mixControl);
    } else {
      gl_FragColor = colour;
    }
  }
`;
export class GradientPipeline extends Phaser.Renderer.WebGL.Pipelines.SinglePipeline {
  static KEY = 'Gradient';
  static count = 0;

  key: string;

  constructor(game) {
    super({
      game,
      renderer: game.renderer, // Don't listen to typescript
      uniforms: [
        'resolution',
        'uMainSampler',
        'outTexCoord',
        'colourOne',
        'colourTwo',
        'blendFactor',
      ],
      vertShader,
      fragShader,
    });
    this.key = `${GradientPipeline.KEY}${GradientPipeline.count++}`;
  }
}
