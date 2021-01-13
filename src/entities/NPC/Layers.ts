import { spriteJson } from '../../animations';
import COLOURS from './Colours';

const Layers = [
  // Trousers
  [
    { key: 'trousers:dark',  json: spriteJson('trousers:dark'), tints: [COLOURS.grey, COLOURS.white, COLOURS.green, COLOURS.blue] },
    { key: 'trousers:light', json: spriteJson('trousers:light'), tints: [COLOURS.grey, COLOURS.white, COLOURS.green, COLOURS.blue] }
  ],
  // Tops
  [
    { key: 'top',   json: spriteJson('top:blank'),  tints: [COLOURS.white, ...Object.values(COLOURS.shirt), COLOURS.hair.ginger] },
    { key: 'shirt', json: spriteJson('shirt:full'), tints: [COLOURS.white, ...Object.values(COLOURS.shirt), COLOURS.hair.ginger] }
  ],
  // Ties
  // TODO: define as sub-layer with shirt?
  [
    { key: 'tie',        optional: true, json: spriteJson('tie'),        tints: [COLOURS.grey, COLOURS.green, ...Object.values(COLOURS.tie)] },
    { key: 'tie:skinny', optional: true, json: spriteJson('tie:skinny'), tints: [COLOURS.grey, COLOURS.green, ...Object.values(COLOURS.tie)] }

  ],
  [{ key: 'jacket',    optional: true, json: spriteJson('jacket'),    tints: [COLOURS.grey, COLOURS.white, COLOURS.green, COLOURS.blue] }],
  [{ key: 'headhands', json: spriteJson('headhands'), tints: Object.values(COLOURS.skin) }],
  // Mouth
  [
    { key: 'mouth:plain', json: spriteJson('mouth:plain'), blendMode: 2 /* MULTIPLY */, tints: [COLOURS.skin.pink] }, // https://stackoverflow.com/questions/22434240/how-to-use-blending-in-phaserjs
  ],
  // Eyes
  [
    { key: 'eyes:big',    json: spriteJson('eyes:big')    },
    { key: 'eyes:small',  json: spriteJson('eyes:small')  },
    { key: 'eyes:shifty', json: spriteJson('eyes:shifty') },
  ],
  // Hair
  [
    { key: 'hair:helmet',  optional: true, json: spriteJson('hair:helmet'),  tints: Object.values(COLOURS.hair) },
    { key: 'hair:balding', optional: true, json: spriteJson('hair:balding'), tints: Object.values(COLOURS.hair) },
  ],
  [{ key: 'mask', json: spriteJson('mask'), tints: [COLOURS.white, COLOURS.green, ...Object.values(COLOURS.mask)] } ],
];

export default Layers;
