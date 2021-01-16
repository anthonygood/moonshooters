
const COLOURS = {
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
};

// Seems that when drawing to render texture, red and blue channels are swapped...
export const invertRB = (colour: number) => {
  const [r,g,b] = colour.toString(16).padStart(6, '0').match(/[\w]{2}/g);
  return parseInt([b,g,r].join(''), 16);
}

export default COLOURS;
