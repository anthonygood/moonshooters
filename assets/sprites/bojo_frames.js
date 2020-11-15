const animationFrames = (imageName = 'bojo_frames') => ({
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
	"meta": {
		"app": "https://www.codeandweb.com/texturepacker",
		"version": "3.0",
		"smartupdate": "$TexturePacker:SmartUpdate:5263d16d37ce3288e44b7f16278af5ea:7334d15aac6342574776a93252d3cd9c:a31c184cd566247cdb9c1e99bb78a9c4$"
	}
})

export default animationFrames;
