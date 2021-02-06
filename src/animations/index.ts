import { getCombinedKey } from '../util/TextureKeys';
import * as TextureKeys from '../util/TextureKeys';

export const spriteJson = (imageName = 'bojo_frames') => ({
	"textures": [
		{
			"image": `${imageName}.png`,
			"format": "RGBA8888",
			"size": {
				"w": 64,
				"h": 102
			},
			"scale": 1,
			"frames": [
				{
					"filename": "jump_2", // filename is used in frame references
					"rotated": false,
					"trimmed": true,
					"sourceSize": {
						"w": 32,
						"h": 32
					},
					"spriteSourceSize": {
						"x": 2,
						"y": 0,
						"w": 28,
						"h": 32
					},
					"frame": {
						"x": 1,
						"y": 1,
						"w": 28,
						"h": 32
					}
				},
				{
					"filename": "jump_1",
					"rotated": false,
					"trimmed": true,
					"sourceSize": {
						"w": 32,
						"h": 32
					},
					"spriteSourceSize": {
						"x": 4,
						"y": 0,
						"w": 25,
						"h": 32
					},
					"frame": {
						"x": 31,
						"y": 1,
						"w": 25,
						"h": 32
					}
				},
				{
					"filename": "walk_2",
					"rotated": false,
					"trimmed": true,
					"sourceSize": {
						"w": 32,
						"h": 32
					},
					"spriteSourceSize": {
						"x": 4,
						"y": 0,
						"w": 21,
						"h": 32
					},
					"frame": {
						"x": 1,
						"y": 35,
						"w": 21,
						"h": 32
					}
				},
				{
					"filename": "idle_1",
					"rotated": false,
					"trimmed": true,
					"sourceSize": {
						"w": 32,
						"h": 32
					},
					"spriteSourceSize": {
						"x": 6,
						"y": 0,
						"w": 19,
						"h": 32
					},
					"frame": {
						"x": 24,
						"y": 35,
						"w": 19,
						"h": 32
					}
				},
				{
					"filename": "walk_1",
					"rotated": false,
					"trimmed": true,
					"sourceSize": {
						"w": 32,
						"h": 32
					},
					"spriteSourceSize": {
						"x": 6,
						"y": 0,
						"w": 18,
						"h": 32
					},
					"frame": {
						"x": 45,
						"y": 35,
						"w": 18,
						"h": 32
					}
				},
				{
					"filename": "idle_2",
					"rotated": false,
					"trimmed": true,
					"sourceSize": {
						"w": 32,
						"h": 32
					},
					"spriteSourceSize": {
						"x": 6,
						"y": 0,
						"w": 19,
						"h": 32
					},
					"frame": {
						"x": 1,
						"y": 69,
						"w": 19,
						"h": 32
					}
				},
				{
					"filename": "walk_3",
					"rotated": false,
					"trimmed": true,
					"sourceSize": {
						"w": 32,
						"h": 32
					},
					"spriteSourceSize": {
						"x": 5,
						"y": 0,
						"w": 19,
						"h": 32
					},
					"frame": {
						"x": 22,
						"y": 69,
						"w": 19,
						"h": 32
					}
				},
				{
					"filename": "walk_4",
					"rotated": false,
					"trimmed": true,
					"sourceSize": {
						"w": 32,
						"h": 32
					},
					"spriteSourceSize": {
						"x": 6,
						"y": 0,
						"w": 19,
						"h": 32
					},
					"frame": {
						"x": 43,
						"y": 69,
						"w": 19,
						"h": 32
					}
				}
			]
		}
	],
});

const getFrames = (scene: Phaser.Scene, prefix: string, end: number, key: string) => {
  const frames = scene.anims.generateFrameNames(
    key,
    {
      prefix,
      start: 1,
      end,
    }
	);
	return frames;
};

export const ContainerAnimation = {
	/** @deprecated */
	__playAnimationWithDedicatedAtlas: (container: Phaser.GameObjects.Container, animName: string) =>
		container.iterate((sprite: Phaser.GameObjects.Sprite) => {
			// TODO: validate animation name?
			sprite.play(`${sprite.name}/${animName}`, true);
		}),
	playAnimationWithCharAtlas: (
		container: Phaser.GameObjects.Container,
		animName: string,
		index: number
	) => {
		container.iterate((sprite: Phaser.GameObjects.Sprite) => {
			// What about mask?
			if (sprite.name === 'mask') {
				const maskKey = TextureKeys.getCharSpriteKey('mask', animName);
				sprite.play(maskKey);
				return;
			}
			const key = TextureKeys.getCharSpriteKey(index, animName);
			sprite.play(key, true);
		});
	},
	stop: (container: Phaser.GameObjects.Container) => {
		container.iterate((sprite: Phaser.GameObjects.Sprite) => {
			sprite.stop();
		});
	},
	playAnimationWithCombinedAtlas: (container: Phaser.GameObjects.Container, animName: string) =>
		container.iterate((sprite: Phaser.GameObjects.Sprite) => {
			// TODO: validate animation name?
			const anim = `${sprite.name}/${animName}`;
			const key = sprite.name.includes(TextureKeys.COMBINED_TEXTURE_KEY) ?
				anim :
				getCombinedKey(anim);

			sprite.play(key, true);
		}),
};

const FRAME_DATA = [
	{
		name: 'walk',
		frameRate: 6,
		repeat: -1,
		end: 4,
	},
	{
		name: 'idle',
		frameRate: 2,
		repeat: -1,
		end: 2,
	},
	{
		name: 'jump',
		frameRate: 6,
		repeat: -1,
		end: 2,
	},
];

// Return a whole number between 1 and val, inclusive
export const upto = (val: number) => 1 + Math.floor(Math.random() * val);

// Return a random value between val-bound and val+bound
const plusMinus = (bound: number) => (val: number) => {
	const range = bound * 2;
	const subtract = bound - upto(range);
	return val - subtract;
};

const plusMinusOne = plusMinus(1);

export const getNpcFrameData = () => FRAME_DATA
	.filter(data => data.name !== 'jump')
	.map(({ frameRate, ...rest }) => ({
	...rest,
	frameRate: plusMinusOne(frameRate),
}));

const createFrames = (
	getFrameKey = (textureName: string, animName: string) => `${textureName}/${animName}`,
	getFramePrefix = (_textureName: string, animName: string) => `${animName}_`,
	getTextureKey = (textureName: string) => textureName,
	frameData = FRAME_DATA
) => (scene: Phaser.Scene) => (key: string) => {
	frameData.forEach(({
		name,
		frameRate,
		repeat,
		end,
	}) => {
		const frameKey = getFrameKey(key, name);
		const prefix = getFramePrefix(key, name);
		const textureKey = getTextureKey(key);

		const frames = getFrames(scene, prefix, end, textureKey);

		scene.anims.create({
			key: frameKey,
			frameRate,
			repeat,
			frames,
		});
	});
};

export const createFramesForKey = (scene: Phaser.Scene) => (key: string) => {
	createFrames()(scene)(key);

  scene.anims.create({
    key: `${key}/halfspin`,
    frameRate: 8,
    repeat: 0,
    frames: [
      { key, frame: 'walk_4' },
      { key, frame: 'walk_2' },
      { key, frame: 'walk_3' },
      { key, frame: 'walk_1' },
    ],
  });
};

export const createFramesForCharacterAtlas = (scene: Phaser.Scene) => (index: number | string) => {
	createFrames(
		(_textureName, animName) => TextureKeys.getCharSpriteKey(index, animName),
		(_textureName, animName) => `${TextureKeys.getCharSpriteKey(index, animName)}_`,
		() => TextureKeys.CHAR_ATLAS_KEY,
		// TODO: create mask animations for different frame rates
		FRAME_DATA.filter(data => data.name !== 'jump')
		// getNpcFrameData()
	)(scene)(String(index));
};

export const createFramesForCombinedKey = createFrames(
	(textureName, animName) => `${getCombinedKey(textureName)}/${animName}`,
	(textureName, animName) => `${textureName}:${animName}_`,
	() => TextureKeys.COMBINED_TEXTURE_KEY,
);
