import { spriteJson } from '../../animations';
import COLOURS from './Colours';

const keyJson = (key: string) => ({
  key,
  json: spriteJson(key),
});

const Layers = [
  // Trousers
  [
    { ...keyJson('trousers:dark'),  tints: [COLOURS.grey, COLOURS.white, COLOURS.green, COLOURS.blue] },
    { ...keyJson('trousers:light'), tints: [COLOURS.grey, COLOURS.white, COLOURS.green, COLOURS.blue] }
  ],
  // Tops
  [
    { key: 'top',   json: spriteJson('top:blank'),  tints: [COLOURS.white, ...Object.values(COLOURS.shirt), COLOURS.hair.ginger] },
    { key: 'shirt', json: spriteJson('shirt:full'), tints: [COLOURS.white, ...Object.values(COLOURS.shirt), COLOURS.hair.ginger] }
  ],
  // Ties
  // TODO: define as sub-layer with shirt?
  [
    { ...keyJson('tie'),        optional: true,  tints: [COLOURS.grey, COLOURS.green, ...Object.values(COLOURS.tie)] },
    { ...keyJson('tie:skinny'), optional: true,  tints: [COLOURS.grey, COLOURS.green, ...Object.values(COLOURS.tie)] }

  ],
  [{ ...keyJson('jacket'), optional: true, tints: [COLOURS.grey, COLOURS.white, COLOURS.green, COLOURS.blue] }],
  [{ ...keyJson('headhands'), tints: Object.values(COLOURS.skin) }],
  // Mouth
  [
    { ...keyJson('mouth:plain'), alpha: .2 /* MULTIPLY */, tints: [COLOURS.red] }, // https://stackoverflow.com/questions/22434240/how-to-use-blending-in-phaserjs
  ],
  // Eyes
  [
    keyJson( 'eyes:big'),
    keyJson( 'eyes:small'),
    keyJson( 'eyes:shifty'),
  ],
  // Hair
  [
    { ...keyJson('hair:helmet'),  optional: true, tints: Object.values(COLOURS.hair) },
    { ...keyJson('hair:balding'), optional: true, tints: Object.values(COLOURS.hair) },
  ],
  [{ ...keyJson('mask'), tints: [COLOURS.white, COLOURS.green, ...Object.values(COLOURS.mask)] } ],
];

export default Layers;
