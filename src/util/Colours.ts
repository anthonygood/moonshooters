export type ColourDict<T> = {
  [key: string]: T | ColourDict<T>;
};

export const COLOURS: ColourDict<number> = {
  red: 0xff0000,
  white: 0xF7F7F7,
  grey: 0x646464,
  black: 0x000000,
  green: 0x89F94F,
  blue: 0x0376BB,
  shirt: {
    blue: 0x74FBEA,
    yellow: 0xFFFC67,
    pink: 0xFFD7EB,
  },
  skin: {
    pale: 0xFDDCD4,
    pale2: 0xfaefdc,
    pink: 0xFFC0B0,
    tan: 0xFFDA8C,
    brown: 0xCF7408,
  },
  hair: {
    white: 0xD5D5D5,
    ginger: 0xFF9400,
    brown: 0x4A2C02,
    black: 0x2B2A2A,
  },
  mask: {
    blue: 0x4FE1FC,
    black: 0x292727,
  },
  tie: {
    red: 0xB51700,
    blue: 0x02578A,
  },
  light: {
    day: 0x74F0FB,
    warm: 0xFF7300,
    pink: 0xFF007b,
    purple: 0xc70074,
    darkblue: 0x080185,
    darkdarkblue: 0x0a0654,
    midnightblue: 0x05032e,
    morningyellow: 0xfbfcca,
    morningorange: 0xfaea78,
    murkymustard: 0xe3d14d,
  },
};

const toColourString = (num: number) => '#' + (num).toString(16)

const decorate = (
  fn: Function,
  obj: object,
  copy: { [key: string]: string } = {},
) => {
  Object.entries(obj).forEach(([key, val]) => {
    const newVal = typeof val === 'object' ? decorate(fn, val) : fn(val);
    copy[key] = newVal;
  });
  return copy;
};

export const COLOUR_STRINGS: ColourDict<string> = decorate(
  toColourString,
  COLOURS
);

// Seems that when drawing to render texture, red and blue channels are swapped...
export const invertRB = (colour: number) => {
  const [r,g,b] = colour.toString(16).padStart(6, '0').match(/[\w]{2}/g);
  return parseInt([b,g,r].join(''), 16);
}

export default COLOURS;
