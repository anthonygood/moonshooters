import { COLOUR_STRINGS } from '../../util/Colours';

const Colour = COLOUR_STRINGS.light;
const WHITE = COLOUR_STRINGS.basic.white;
const DAY = Colour.day;
const WARM = Colour.warm;
const PINK = Colour.pink;
const PURPLE = Colour.purple;
const DARKBLUE = Colour.darkblue;
const MIDNIGHTBLUE = Colour.midnightblue;

export type GradientFn = (
  ctx: CanvasRenderingContext2D,
  height: number,
  width: number
) => CanvasGradient;

// TODO: DRY
export const GRADIENT_COLOUR_PAIRS = {
  day: [WHITE, DAY],
  morning: [Colour.palepink, Colour.pink],
  sunset: [PURPLE, WARM],
  dusk: [DARKBLUE, DAY],
  night: [MIDNIGHTBLUE, DARKBLUE],
  nightNeon: [DARKBLUE, PINK],
  yellowish: [Colour.morningorange, Colour.morningyellow],
  smog: [Colour.warm, Colour.morningyellow],
};

const getGradient = (a: string, b: string, stops = [0, 1]): GradientFn => (
  ctx: CanvasRenderingContext2D,
  height: number,
  _width: number
) => {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  const [firstStop, secondStop] = stops;
  gradient.addColorStop(firstStop, a);
  gradient.addColorStop(secondStop, b);
  return gradient;
};

export const GRADIENTS = {
  day: getGradient(WHITE, DAY),
  morning: getGradient(Colour.palepink, Colour.pink, [0.6, 0.9]),
  sunset: getGradient(PURPLE, WARM),
  dusk: getGradient(DARKBLUE, DAY),
  night: getGradient(MIDNIGHTBLUE, DARKBLUE, [0.7, 1]),
  nightNeon: getGradient(DARKBLUE, PINK),
  yellowish: getGradient(Colour.morningorange, Colour.morningyellow),
  smog: getGradient(Colour.warm, Colour.morningyellow),
};
