import { COLOUR_STRINGS } from '../../util/Colours';
import { GRADIENTS, GradientFn } from './gradients';

export type FogConfig = {
  fill: string | GradientFn,
  opacity: number,
  blendMode?: 0 | 1 | 2,
  depth?: number,
  key?: string,
};

export const morning: FogConfig[] = [
  {
    fill: GRADIENTS.morning,
    opacity: 0.7,
    depth: 2,
    blendMode: 0,
  },
  {
    fill: COLOUR_STRINGS.basic.white,
    opacity: 0.3,
    depth: 4,
    blendMode: 0,
  },
  {
    fill: COLOUR_STRINGS.light.palepink,
    opacity: 0.4,
    depth: 6,
    blendMode: 0,
  }
];

export const day: FogConfig[] = [
  {
    fill: GRADIENTS.day,
    opacity: 0.1,
    depth: 2,
    blendMode: 0,
  },
  {
    fill: GRADIENTS.day,
    opacity: 0.6,
    depth: 4,
    blendMode: 0,
  },
  {
    fill: GRADIENTS.day,
    opacity: 0.3,
    depth: 6,
    blendMode: 0,
  },
];

export const sunset: FogConfig[] = [
  {
    fill: GRADIENTS.sunset,
    opacity: 0.7,
    depth: 2,
    blendMode: 0,
  },
  {
    fill: GRADIENTS.sunset,
    opacity: 0.5,
    depth: 4,
    blendMode: 0,
  },
  {
    fill: COLOUR_STRINGS.light.warm,
    opacity: 0.3,
    depth: 5,
    blendMode: 0,
  },
];

export const dusk: FogConfig[] = [
  {
    fill: GRADIENTS.dusk,
    opacity: 1,
    depth: 0,
    blendMode: 0,
  },
  {
    fill: GRADIENTS.dusk,
    opacity: 0.7,
    depth: 2,
    blendMode: 2,
  },
  {
    fill: GRADIENTS.dusk,
    opacity: 0.6,
    depth: 4,
    blendMode: 2,
  },
];


export const night: FogConfig[] = [
  {
    fill: GRADIENTS.night,
    opacity: 1,
    depth: 0,
    blendMode: 0,
  },
  {
    fill: GRADIENTS.night,
    opacity: 0.7,
    depth: 2,
    blendMode: 2,
  },
  {
    fill: GRADIENTS.night,
    opacity: 0.6,
    depth: 4,
    blendMode: 0,
  },
  {
    fill: GRADIENTS.dusk,
    opacity: 0.3,
    depth: 6,
    blendMode: 2,
  },
];

export const smog: FogConfig[] = [
  {
    fill: GRADIENTS.yellowish,
    opacity: 1,
    depth: 0,
    blendMode: 0,
  },
  {
    fill: GRADIENTS.smog,
    opacity: 0.6,
    depth: 3,
    blendMode: 0,
  },
  {
    fill: GRADIENTS.smog,
    opacity: 0.6,
    depth: 5,
    blendMode: 0,
  },
];

const BLACK = COLOUR_STRINGS.basic.black;
export const endLevel: FogConfig[] = [
  {
    fill: BLACK,
    opacity: 1,
    depth: 3,
    blendMode: 2,
    key: 'endLevel1',
  },
  {
    fill: BLACK,
    opacity: 0.6,
    depth: 4,
    blendMode: 2,
    key: 'endLevel2',
  },
  {
    fill: BLACK,
    opacity: 0.6,
    depth: 5,
    blendMode: 2,
    key: 'endLevel3',
  },
];
