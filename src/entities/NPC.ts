import { Direction } from '../state/Direction';
import Player, { SpriteLayer } from './Player';
import NPCState from '../state/PlayerState';
import { spriteJson, createFramesForKey } from '../animations';

const sample = (vals = []) =>
  vals[Math.floor(Math.random() * vals.length)];

enum NPCDirection {
  Left,
  Right,
  None
};

interface NPCDriver {
  getDirection: () => Direction;
  go: (NPCDirection) => void;
  change: () => void;
};

const Driver: () => NPCDriver = () => {
  let direction = NPCDirection.None;

  const getDirection: () => Direction = () => ({
    up: false,
    down: false,
    left: direction === NPCDirection.Left,
    right: direction === NPCDirection.Right,
    timeDown: () => 0,
  });

  const go = (newDirection: NPCDirection) =>
    direction = newDirection;

  const randomNewDirection = (direction: NPCDirection) => {
    const otherDirections = Object.values(NPCDirection).filter(dir => dir !== direction);
    return sample(otherDirections);
  };

  const change = () => {
    go(randomNewDirection(direction));
  };

  return {
    getDirection,
    go,
    change,
  };
};

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
  public spawned = false;
  readonly State = NPCState;
  readonly driver: NPCDriver;
  static readonly layers = [
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
    [{ key: 'mask', optional: true, json: spriteJson('mask'), tints: [COLOURS.white, COLOURS.green, ...Object.values(COLOURS.mask)] } ],
  ];

  // TODO: Define in map
  public spawn = [350, 1000];

  constructor(scene, spawn = [450, 1000]) {
    super(scene);
    this.spawn = spawn;
    this.driver = Driver();
  }

  create(cursors) {
    super.create(cursors);
    this.tintSprites();
    // this.loopSprites();
    // this.direction = this.driver.getDirection();
    this.move();
    this.spawned = true;
  }

  getDirection() {
    return this.driver.getDirection();
  }

  move() {
    setTimeout(() => {
      this.driver.change();
      this.move();
    }, sample([1000, 1500, 800]));
  }

  update(
    time: number,
    delta: number
  ) {
    // TODO: state machine for NPC driver
    // 'AI' lol
    const direction = this.driver.getDirection();
    this.state.process({ direction, near: this.near, time });
  }

  tintSprites() {
    this.container.iterate(sprite => {
      // TODO: separate lookup object for tints?
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
      this.tintSprites();
      this.loopSprites();
    }, 1000);
  }

  findSprite({ name }): SpriteLayer {
    for (const layer of NPC.layers) {
      for (const sprite of layer) {
        if (sprite.key === name) return sprite;
      }
    }
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
