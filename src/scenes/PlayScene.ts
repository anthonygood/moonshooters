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
		this.load.tilemapTiledJSON(MAP_KEY, asset('tilemaps/Test Map.json'));
		this.load.image(LEVEL_KEY, asset('tilemaps/Block.png'));
		// this.load.multiatlas(PLAYER_KEY, asset('sprites/bojo_sprites.json'), asset('sprites'));

		this.player.preload();
	}

	create() {
		const map: Phaser.Tilemaps.Tilemap = this.make.tilemap({ key: MAP_KEY });
		const tileset: Phaser.Tilemaps.Tileset = map.addTilesetImage('Test Tiles', LEVEL_KEY);
		const layer: Phaser.Tilemaps.StaticTilemapLayer = map.createStaticLayer(0, tileset, 0, 0);
		layer.setCollisionByProperty({ collides: true });

		this.cursors = this.input.keyboard.createCursorKeys();

		this.player.create();
		this.physics.add.collider(this.player.sprite, layer);

		this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
		this.cameras.main.startFollow(this.player.sprite, false);


		// debug
		const debugGraphics = this.add.graphics().setAlpha(.75);
		layer.renderDebug(debugGraphics, {
			tileColor: null, // Colour of non-colliding tiles
			collidingTileColor: new Phaser.Display.Color(255, 255, 255, 255), // Color of colliding tiles
			faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
		});
	}

	update(time: number, delta: number) {
		this.player.update(time, delta, this.cursors);
	}
}

export default TestScene;