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
					"filename": "jump_2.png",
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
					"filename": "jump_1.png",
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
					"filename": "walk_2.png",
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
					"filename": "idle_1.png",
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
					"filename": "walk_1.png",
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
					"filename": "idle_2.png",
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
					"filename": "walk_3.png",
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
					"filename": "walk_4.png",
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
  return scene.anims.generateFrameNames(
    key,
    {
      prefix,
      suffix: `.png`,
      start: 1,
      end,
    }
  )
};

export const createFramesForKey = (scene: Phaser.Scene) => (key: string) => {
  console.log(`setting some anim for`, key, `${key}/idle`);
  scene.anims.create({
    key: `${key}/walk`,
    frameRate: 4,
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
      { key, frame: 'walk_4.png' },
      { key, frame: 'walk_2.png' },
      { key, frame: 'walk_3.png' },
      { key, frame: 'walk_1.png' },
    ],
  });
};
