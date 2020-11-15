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
    [
      { key: 'trousers:dark',  json: spriteJson('trousers:dark'), tints: [COLOURS.grey, COLOURS.white, COLOURS.green, COLOURS.blue] },
      { key: 'trousers:light', json: spriteJson('trousers:light'), tints: [COLOURS.grey, COLOURS.white, COLOURS.green, COLOURS.blue] }
    ],
    [{ key: 'shirt', json: spriteJson('shirt:full'), tints: [COLOURS.white, ...Object.values(COLOURS.shirt), COLOURS.hair.ginger] }],
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
      { key: 'eyes:big',    json: spriteJson('eyes:big') },
      { key: 'eyes:small',  json: spriteJson('eyes:small') },
      { key: 'eyes:shifty', json: spriteJson('eyes:shifty') },
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
    this.loopSprites();
  }

  tintSprites() {
    this.container.iterate(sprite => {
      const { blendMode, tints } = this.findSprite(sprite);
      const tint = sample(tints);
      tint && sprite.setTint(tint);
      blendMode && (sprite.blendMode = blendMode);
    });
  }

  loopSprites() {
    setTimeout(() => {
      this.container.removeAll()
      this.addSprites();
      const anim = sample(['idle', 'walk']);
      this.container.iterate(sprite => {
        sprite.play(`${sprite.name}/${anim}`, true);
      });
      this.tintSprites();
      this.loopSprites();
    }, 3000);
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
