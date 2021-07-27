import {
  COLOUR_STRINGS,
  COLOURS,
  toRgb
} from './Colours';

describe('toRgb', () => {
  it('returns floats representing RGB for given hex string', () => {
    const result = toRgb(COLOURS.basic.red);
    const expected = [1.0, 0.0, 0.0];
    expect(result).toEqual(expected);
  });

  it('returns floats representing RGB for given number', () => {
    const result = toRgb(COLOUR_STRINGS.light.day);
    const expected = [0.45, 0.94, 0.98];
    expect(result).toEqual(expected);
  });
});
