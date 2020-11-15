import Player from './Player';
import { spriteJson } from '../animations';

const COLOURS = {
  green: 0x89F94F,
  blue: 0x4FE1FC,
};

class NPC extends Player {
  static readonly sprites = {
    suit: spriteJson('darksuit'),
    mask: spriteJson('mask'),
  };

  create() {
    super.create();

    // TODO semi-random tint to different layers
    this.container.getByName('mask').setTint(COLOURS.green);
  }
}

export default NPC;
