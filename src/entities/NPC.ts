import Player from './Player';
import { spriteJson, createFramesForKey } from '../animations';

const sample = (vals = []) =>
  vals[Math.floor(Math.random() * vals.length)]

const COLOURS = {
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

class NPC extends Player {
  static readonly layers = [
    // TODO: nest sprite JSON according to its layer?
    [{ key: 'trousers',  optional: false, json: spriteJson('trousers:dark'), tints: [COLOURS.grey, COLOURS.white, COLOURS.green, COLOURS.blue] }],
    [{ key: 'shirt',     optional: false, json: spriteJson('shirt'),         tints: [COLOURS.white, ...Object.values(COLOURS.shirt), COLOURS.hair.ginger] }],
    [{ key: 'tie',       optional: true, json: spriteJson('tie'),            tints: [COLOURS.grey, COLOURS.green, ...Object.values(COLOURS.tie)] }],
    [{ key: 'jacket',    optional: false, json: spriteJson('jacket'),        tints: [COLOURS.grey, COLOURS.white, COLOURS.green, COLOURS.blue] }],
    [{ key: 'headhands', optional: false, json: spriteJson('headhands'),     tints: Object.values(COLOURS.skin) }],
    // Mouth
    [
      { key: 'mouth:plain', optional: false, json: spriteJson('mouth:plain') },
    ],
    // Eyes
    [
      { key: 'eyes:big',    optional: false, json: spriteJson('eyes:big') },
      { key: 'eyes:big',    optional: false, json: spriteJson('eyes:small') },
      { key: 'eyes:shifty', optional: false, json: spriteJson('eyes:shifty') },
    ],
    // Hair
    [
      { key: 'hair:helmet',  optional: true, json: spriteJson('hair:helmet'),  tints: Object.values(COLOURS.hair) },
      { key: 'hair:balding', optional: true, json: spriteJson('hair:balding'), tints: Object.values(COLOURS.hair) },
    ],
    [{ key: 'mask', optional: true, json: spriteJson('mask'), tints: [COLOURS.white, COLOURS.green, ...Object.values(COLOURS.mask)] } ],
  ];

  create() {
    super.create();
    this.tintSprites();
    this.loopTint();
    this.loopSprites();
  }

  tintSprites() {
    this.container.iterate(sprite => {
      const { tints } = this.findSprite(sprite);
      const tint = sample(tints);
      tint && sprite.setTint(tint);
    });
  }

  loopTint() {
    setTimeout(() => {
      this.tintSprites();
      this.loopTint();
    }, 500)
  }

  loopSprites() {
    setTimeout(() => {
      this.container.removeAll()
      this.addSprites();
      const anim = sample(['idle', 'walk']);
      this.container.iterate(sprite => {
        sprite.play(`${sprite.name}/${anim}`, true);
      });
      this.loopSprites();
    }, 1000);
  }

  findSprite({ name }) {
    // TODO yuk
    try {
      this.forEachSprite(sprite => {
        if (sprite.key === name) throw sprite;
      });
    } catch (sprite) {
      return sprite;
    }
    return null;
  }

  addSprites() {
    this.forEachLayer(layer => {
      const sampleSprite = sample(layer);
      const shouldAdd = sample([true, !sampleSprite.optional]);
      shouldAdd && this.addSprite(sampleSprite);
    });
  }

  createSprites() {
    const createFrames = createFramesForKey(this.scene);
    this.forEachSprite(({ key }) => {
      createFrames(key);
    });
  }
}

export default NPC;
