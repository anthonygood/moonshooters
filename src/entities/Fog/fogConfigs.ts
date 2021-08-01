import { COLOUR_STRINGS } from '../../util/Colours';
import { GRADIENTS, GRADIENT_COLOUR_PAIRS, GradientFn } from './gradients';

export type FogConfig = {
  fill: string | GradientFn,
  colours: string[],
  opacity: number,
  blendMode?: 0 | 1 | 2,
  depth?: number,
  key?: string,
  name?: string,
};

// TODO: remove fill in favour of colours attribute.
export const morning: FogConfig[] = [
  {
    fill: GRADIENTS.morning,
    colours: GRADIENT_COLOUR_PAIRS.morning,
    opacity: 0.7,
    depth: 2,
    blendMode: 0,
  },
  {
    fill: COLOUR_STRINGS.basic.white,
    colours: [COLOUR_STRINGS.light.day, COLOUR_STRINGS.light.pink],
    opacity: 0.3,
    depth: 4,
    blendMode: 0,
  },
  {
    fill: COLOUR_STRINGS.light.palepink,
    colours: [COLOUR_STRINGS.light.day, COLOUR_STRINGS.light.pink],
    opacity: 0.4,
    depth: 6,
    blendMode: 0,
  }
];

export const day: FogConfig[] = [
  {
    fill: GRADIENTS.day,
    colours: GRADIENT_COLOUR_PAIRS.day,
    opacity: 0.1,
    depth: 2,
    blendMode: 0,
    name: 'day',
  },
  {
    fill: GRADIENTS.day,
    colours: GRADIENT_COLOUR_PAIRS.day,
    opacity: 0.6,
    depth: 4,
    blendMode: 0,
  },
  {
    fill: GRADIENTS.day,
    colours: GRADIENT_COLOUR_PAIRS.day,
    opacity: 0.3,
    depth: 6,
    blendMode: 0,
  },
];

export const sunset: FogConfig[] = [
  {
    fill: GRADIENTS.sunset,
    colours: GRADIENT_COLOUR_PAIRS.sunset,
    opacity: 0.7,
    depth: 2,
    blendMode: 0,
  },
  {
    fill: GRADIENTS.sunset,
    colours: GRADIENT_COLOUR_PAIRS.sunset,
    opacity: 0.5,
    depth: 4,
    blendMode: 0,
  },
  {
    fill: COLOUR_STRINGS.light.warm,
    colours: [COLOUR_STRINGS.light.warm],
    opacity: 0.3,
    depth: 5,
    blendMode: 0,
  },
];

export const dusk: FogConfig[] = [
  {
    fill: GRADIENTS.dusk,
    colours: GRADIENT_COLOUR_PAIRS.dusk,
    opacity: 1,
    depth: 0,
    blendMode: 0,
  },
  {
    fill: GRADIENTS.dusk,
    colours: GRADIENT_COLOUR_PAIRS.dusk,
    opacity: 0.7,
    depth: 2,
    blendMode: 2,
  },
  {
    fill: GRADIENTS.dusk,
    colours: GRADIENT_COLOUR_PAIRS.dusk,
    opacity: 0.6,
    depth: 4,
    blendMode: 2,
  },
];


export const night: FogConfig[] = [
  {
    fill: GRADIENTS.night,
    colours: GRADIENT_COLOUR_PAIRS.night,
    opacity: 1,
    depth: 0,
    blendMode: 0,
    name: 'night',
  },
  {
    fill: GRADIENTS.night,
    colours: GRADIENT_COLOUR_PAIRS.night,
    opacity: 0.7,
    depth: 2,
    blendMode: 2,
  },
  {
    fill: GRADIENTS.night,
    colours: GRADIENT_COLOUR_PAIRS.night,
    opacity: 0.6,
    depth: 4,
    blendMode: 0,
  },
  {
    fill: GRADIENTS.dusk,
    colours: GRADIENT_COLOUR_PAIRS.dusk,
    opacity: 0.3,
    depth: 6,
    blendMode: 2,
  },
];

export const smog: FogConfig[] = [
  {
    fill: GRADIENTS.yellowish,
    colours: GRADIENT_COLOUR_PAIRS.yellowish,
    opacity: 1,
    depth: 0,
    blendMode: 0,
  },
  {
    fill: GRADIENTS.smog,
    colours: GRADIENT_COLOUR_PAIRS.smog,
    opacity: 0.6,
    depth: 3,
    blendMode: 0,
  },
  {
    fill: GRADIENTS.smog,
    colours: GRADIENT_COLOUR_PAIRS.smog,
    opacity: 0.6,
    depth: 5,
    blendMode: 0,
  },
];

export const pastel: FogConfig[] = [
  {
    fill: GRADIENTS.morning,
    colours: GRADIENT_COLOUR_PAIRS.morning,
    opacity: 0.7,
    depth: 2,
    blendMode: 0,
    name: 'pastel',
  },
  {
    fill: COLOUR_STRINGS.basic.white,
    colours: [COLOUR_STRINGS.light.day, COLOUR_STRINGS.light.pink],
    opacity: 0.3,
    depth: 4,
    blendMode: 0,
  },
  {
    fill: COLOUR_STRINGS.light.palepink,
    colours:  [COLOUR_STRINGS.pastel.turquoise, COLOUR_STRINGS.pastel.turqouiseGreen],
    opacity: 0.4,
    depth: 6,
    blendMode: 0,
  }
];

const BLACK = COLOUR_STRINGS.basic.black;
export const endLevel: FogConfig[] = [
  {
    fill: BLACK,
    colours: [BLACK],
    opacity: 1,
    depth: 3,
    blendMode: 2,
    key: 'endLevel1',
  },
  {
    fill: BLACK,
    colours: [BLACK],
    opacity: 0.6,
    depth: 4,
    blendMode: 2,
    key: 'endLevel2',
  },
  {
    fill: BLACK,
    colours: [BLACK],
    opacity: 0.6,
    depth: 5,
    blendMode: 2,
    key: 'endLevel3',
  },
];
