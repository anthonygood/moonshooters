import { COMBINED_TEXTURE_KEY, getCombinedKey } from '../util/dynamicSpriteAtlas';

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

export const createFramesForCombinedKey = (scene: Phaser.Scene) => (key: string) => {
	const combinedKey = getCombinedKey(key);
	scene.anims.create({
    key: `${combinedKey}/walk`,
    frameRate: 6,
		repeat: -1,
		// TODO: centralise key names
    frames: getFrames(scene, `${key}:walk_`, 4, COMBINED_TEXTURE_KEY),
  });
  scene.anims.create({
    key: `${combinedKey}/idle`,
    frameRate: 2,
    repeat: -1,
    frames: getFrames(scene, `${key}:idle_`, 2, COMBINED_TEXTURE_KEY),
  });
  scene.anims.create({
    key: `${combinedKey}/jump`,
    frameRate: 6,
    repeat: -1,
    frames: getFrames(scene, `${key}:jump_`, 2, COMBINED_TEXTURE_KEY),
  });

  // scene.anims.create({
  //   key: `${key}/halfspin`,
  //   frameRate: 8,
  //   repeat: 0,
  //   frames: [
  //     { key, frame: 'walk_4' },
  //     { key, frame: 'walk_2' },
  //     { key, frame: 'walk_3' },
  //     { key, frame: 'walk_1' },
  //   ],
  // });
};

export const ContainerAnimation = {
	/** @deprecated */
	__playAnimationWithDedicatedAtlas: (container: Phaser.GameObjects.Container, animName: string) =>
		container.iterate((sprite: Phaser.GameObjects.Sprite) => {
			// TODO: validate animation name?
			sprite.play(`${sprite.name}/${animName}`, true);
		}),
	playerAnimationWithCombinedAtlas: (container: Phaser.GameObjects.Container, animName: string) =>
		container.iterate((sprite: Phaser.GameObjects.Sprite) => {
			// TODO: validate animation name?
			const anim = `${sprite.name}/${animName}`;
			const key = sprite.name.includes(COMBINED_TEXTURE_KEY) ?
				anim :
				getCombinedKey(anim);

			sprite.play(key, true);
		}),
};

export const createFramesForKey = (scene: Phaser.Scene) => (key: string) => {
  scene.anims.create({
    key: `${key}/walk`,
    frameRate: 6,
    repeat: -1,
    frames: getFrames(scene, 'walk_', 4, key),
  });
  scene.anims.create({
    key: `${key}/idle`,
    frameRate: 2,
    repeat: -1,
    frames: getFrames(scene, 'idle_', 2, key),
  });
  scene.anims.create({
    key: `${key}/jump`,
    frameRate: 6,
    repeat: -1,
    frames: getFrames(scene, 'jump_', 2, key),
  });

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
