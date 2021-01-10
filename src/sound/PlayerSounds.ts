import { sample } from '../scenes/TheCity';
import { sound } from './util';

const COLLECTED_BARKS = [
  'banned',
  'naked buttock',
  'titties',
  'bug-headed bigglewimp',
  'disrespect',
  'wibbling weasels 2',
  'wiff waff wacket',
  'harmless banter',
  'hey everyone',
  'soggy biscuit',
];

const JUMP_BARKS = [
  'grunt',
  'grunt2',
  'grunt3',
  'ha ha',
  'zoom',
];

const SUCCESS_BARKS = [
  'case closed',
  'blow it up',
  'blow up parliament',
  'gunpowder under parliament',
  `I'm a man of principle (contd)`,
  'breaking news boris annoyed at wibbling weasels',
  'jolly good one',
  `let's all banter hancock`,
  'this lockdown will be different',
  `why it's a bit of fun for the kids really`,
];

const FAIL_BARKS = [
  'I expect certain standard of professional conduct',
  'I fell into my pudding',
  'just not on dom',
  'spoilsport',
  'this is bloody serious',
  `you've jolly well burnt your crumpets this time`,
  'not my fault',
  'oh come on',
  `we've got nothing to worry about`,
];

const BARKS = [
  'banned',
  'blow it up',
  'blow up parliament',
  'breaking news boris annoyed at wibbling weasels',
  'bug-headed bigglewimp',
  'case closed',
  'disrespect',
  'ergo facto',
  'grunt',
  'grunt2',
  'grunt3',
  'gunpowder under parliament',
  'ha ha',
  'harmless banter',
  'hey everyone',
  'I expect certain standard of professional conduct',
  'I fell into my pudding',
  `I'm a man of principle (contd)`,
  `I'm a man of principle`,
  'jolly good one',
  'just not on dom',
  `let's all banter hancock`,
  'naked buttock',
  'not my fault',
  'oh come on',
  'pretty cheesed off',
  'soggy biscuit',
  'spoilsport',
  'there we are',
  'this is bloody serious',
  'this lockdown will be different',
  'titties',
  'vacuum cleaner',
  `we've got nothing to worry about`,
  `why it's a bit of fun for the kids really`,
  'wibbling weasels 2',
  'wiff waff wacket',
  `you've jolly well burnt your crumpets this time`,
  'zoom',
];

enum Bark {
  COLLECTED = 'COLLECTED',
  JUMP = 'JUMP',
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
};

const Barks = {
  [Bark.COLLECTED]: COLLECTED_BARKS,
  [Bark.SUCCESS]: SUCCESS_BARKS,
  [Bark.FAIL]: FAIL_BARKS,
  [Bark.JUMP]: JUMP_BARKS,
};

class PlayerSounds {
  private scene: Phaser.Scene;
  private soundBoard: { [i: string]: Phaser.Sound.BaseSound };
  public playing: boolean;
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.soundBoard = {};
  }

  preload() {
    BARKS.forEach(bark => {
      this.scene.load.audio(bark, sound(`boris/${bark}`, 'm4a'));
    });
  }

  create() {
    BARKS.forEach(bark => {
      const { scene, soundBoard } = this;
      const sound = scene.sound.get(bark);

      soundBoard[bark] = sound || scene.sound.add(bark);
    });
  }

  bark(type: Bark = Bark.COLLECTED) {
    if (this.playing) return;
    this.playing = true;
    const barks = Barks[type];
    const key = sample(barks);

    const sound = this.soundBoard[key];
    sound.play();
    sound.once('complete', () => this.playing = false);
  }

  jump = () => {
    this.bark(Bark.JUMP);
  }

  success() {
    this.bark(Bark.SUCCESS);
  }

  fail() {
    this.bark(Bark.FAIL);
  }
};

export default PlayerSounds;
