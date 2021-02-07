import { spriteJson } from '../../animations';
import { COLOURS } from '../../util/Colours';

const keyJson = (key: string) => ({
  key,
  json: spriteJson(key),
});

const Layers = [
  // Trousers
  [
    { ...keyJson('trousers:dark'),  tints: [COLOURS.basic.grey, COLOURS.basic.white, COLOURS.basic.green, COLOURS.basic.blue] },
    { ...keyJson('trousers:light'), tints: [COLOURS.basic.grey, COLOURS.basic.white, COLOURS.basic.green, COLOURS.basic.blue] }
  ],
  // Tops
  [
    { key: 'top',   json: spriteJson('top:blank'),  tints: [COLOURS.basic.white, ...Object.values(COLOURS.shirt), COLOURS.hair.ginger] },
    { key: 'shirt', json: spriteJson('shirt:full'), tints: [COLOURS.basic.white, ...Object.values(COLOURS.shirt), COLOURS.hair.ginger] }
  ],
  // Ties
  // TODO: define as sub-layer with shirt?
  [
    { ...keyJson('tie'),        optional: true,  tints: [COLOURS.basic.grey, COLOURS.basic.green, ...Object.values(COLOURS.tie)] },
    { ...keyJson('tie:skinny'), optional: true,  tints: [COLOURS.basic.grey, COLOURS.basic.green, ...Object.values(COLOURS.tie)] }

  ],
  [{ ...keyJson('jacket'), optional: true, tints: [COLOURS.basic.grey, COLOURS.basic.white, COLOURS.basic.green, COLOURS.basic.blue] }],
  [
    { ...keyJson('headhands'), tints: Object.values(COLOURS.skin) },
    { ...keyJson('headhands:nose'), tints: Object.values(COLOURS.skin), requires: ['mouth:low', 'mask:nose'] },
  ],
  // Mouth
  [
    { ...keyJson('mouth:plain'), alpha: .2, tints: [COLOURS.basic.red] },
    { ...keyJson('mouth:low'), alpha: .2, tints: [COLOURS.basic.red] },
  ],
  // Eyes
  [
    keyJson('eyes:big'),
    keyJson('eyes:small'),
    keyJson('eyes:shifty'),
  ],
  // Hair
  [
    { ...keyJson('hair:helmet'),  optional: true, tints: Object.values(COLOURS.hair) },
    { ...keyJson('hair:balding'), optional: true, tints: Object.values(COLOURS.hair) },
    { ...keyJson('hair:mussed'), optional: true, tints: Object.values(COLOURS.hair) },
  ],
  [
    { ...keyJson('mask'), tints: [COLOURS.mask.blue, COLOURS.basic.white, COLOURS.basic.green, ...Object.values(COLOURS.mask)] },
    { ...keyJson('mask:nose'), tints: [COLOURS.mask.blue, COLOURS.basic.white, COLOURS.basic.green, ...Object.values(COLOURS.mask)] },
  ],
];

export default Layers;
