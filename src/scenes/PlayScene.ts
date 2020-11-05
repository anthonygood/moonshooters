import Player from './Player';

const asset = (path: string) => `/assets/${path}`;

const MAP_KEY = 'map';
const LEVEL_KEY = 'level';
const PLAYER_KEY = 'player';

class TestScene extends Phaser.Scene {
	player: Player;
	cursors: Phaser.Types.Input.Keyboard.CursorKeys;

	constructor() {
    super({
			key: 'TestScene'
		});
		this.player = new Player(this);
	}

	preload() {
		// For some reason JSON tileset didn't work?
		this.load.tilemapCSV(MAP_KEY, asset('tilemaps/Test Map.csv'));
		this.load.image(LEVEL_KEY, asset('tilemaps/Block.png'));
		// this.load.multiatlas(PLAYER_KEY, asset('sprites/bojo_sprites.json'), asset('sprites'));

		this.player.preload();
	}

	create() {
		this.player.create();

		const map: Phaser.Tilemaps.Tilemap = this.make.tilemap({ key: MAP_KEY });
		const tileset: Phaser.Tilemaps.Tileset = map.addTilesetImage('Block', LEVEL_KEY);
		const layer: Phaser.Tilemaps.StaticTilemapLayer = map.createStaticLayer(0, tileset, 0, 0);
		layer.setCollisionByProperty({ collides: true });

		this.cursors = this.input.keyboard.createCursorKeys();

		this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this.player.sprite, false);
	}

	update(time: number, delta: number) {
		this.player.update(time, delta, this.cursors);
	}
}

export default TestScene;