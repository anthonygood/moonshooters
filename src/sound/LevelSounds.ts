import { sample } from '../scenes/TheCity';
import { sound } from './util';

export const getStingKey = ((lastSting = 0) => () => {
	const filteredIndices = [1,2,3].filter(i => i !== lastSting);
	const index = sample(filteredIndices);
	lastSting = index;
	return `pickup${index}`;
})();

const STING_VOL = .0075;

class LevelSounds {
  private scene: Phaser.Scene;
  private key: string;
  public playing: boolean;
  private musicVolume: number;
  constructor(
    scene: Phaser.Scene,
    key: string,
    musicVolume: number = 1
  ) {
    this.scene = scene;
    this.key = key;
    this.musicVolume = musicVolume;
    this.playing = false;
  }

  preload() {
    const { scene, key } = this;

		scene.load.audio(key, sound(key));
		scene.load.audio('pickup1', sound('pickup1'));
		scene.load.audio('pickup2', sound('pickup2'));
    scene.load.audio('pickup3', sound('pickup3'));
    scene.load.audio('tension', sound('sting anticipate'));
    scene.load.audio('release', sound('sting'));
  }

  playMusic = () => {
    const {
      key,
      scene,
      playing,
      musicVolume
    } = this;

    if (playing) return;

    scene.sound.play(key, { loop: true, volume: musicVolume });
    this.playing = true;
  }

  stopMusic() {
    const { key, scene } = this;
		scene.sound.stopByKey(key);
  }

  playSting() {
    const key = getStingKey();
    const config = { volume: STING_VOL, seek: 0.1 };
    this.scene.sound.play(key, config);
  }

  tension() {
    this.scene.sound.play('tension', { volume: STING_VOL });
  }

  release() {
    this.scene.sound.play('release', { volume: STING_VOL * 1.5 });
  }

  crisis() {
    // TODO
    return;
  }
};

export default LevelSounds;
