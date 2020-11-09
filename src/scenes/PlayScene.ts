import Player from '../entities/Player';

const asset = (path: string) => `/assets/${path}`;

const MAP_KEY = 'map';
const LEVEL_KEY = 'level';
const BKG_KEY = 'background';
const SKY_KEY = 'sky';

class TestScene extends Phaser.Scene {
	public player: Player;
	public cursors: Phaser.Types.Input.Keyboard.CursorKeys;
	public map: Phaser.Tilemaps.Tilemap;

	constructor() {
    super({
			key: 'TestScene'
		});
		this.player = new Player(this);
	}

	preload() {
		this.load.tilemapTiledJSON(MAP_KEY, asset('tilemaps/Test Map.json'));
		this.load.image(LEVEL_KEY, asset('tilemaps/Block.png'));
		this.load.image(BKG_KEY, asset('tilemaps/skyscraper_tiles_extruded.png'));
		this.load.image(SKY_KEY, 'assets/sky.png');
		this.player.preload();
	}

	create() {
		const sky = this.add.image(0, 0, SKY_KEY).setOrigin(0, 0);
		const map = this.map = this.make.tilemap({ key: MAP_KEY });
		const tileset = map.addTilesetImage('Test Tiles', LEVEL_KEY);
		const scrapers = map.addTilesetImage('Skyscrapers', BKG_KEY);
		const l = map.createStaticLayer('Back scrapers', scrapers);
		const m = map.createStaticLayer('Scrapers', scrapers);

		m.scrollFactorX = 0.3;
		l.scrollFactorX = 0.2;

		const layer = map.createStaticLayer('World', tileset);
		layer.setCollisionByProperty({ collides: true });

		const skyScale = map.heightInPixels / sky.height;
		sky.setScale(skyScale).setScrollFactor(0);

		this.cursors = this.input.keyboard.createCursorKeys();

		this.player.create();
		this.physics.add.collider(this.player.sprite, layer);

		this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
		this.cameras.main.startFollow(this.player.sprite, false);

		// debug
		const debugGraphics = this.add.graphics().setAlpha(.75);
		// layer.renderDebug(debugGraphics, {
		// 	tileColor: null, // Colour of non-colliding tiles
		// 	collidingTileColor: new Phaser.Display.Color(255, 255, 255, 255), // Color of colliding tiles
		// 	faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
		// });
	}

	update(time: number, delta: number) {
		if (this.player.sprite.body.top > this.map.heightInPixels) {
			// respawn
			this.player.sprite.setPosition(this.player.spawn[0], 0);
		}
		this.player.update(time, delta, this.cursors);

		// this.mountainsBack.tilePosition.x -= 0.05;
		// this.mountainsMid1.tilePosition.x -= 0.3;
		// this.mountainsMid2.tilePosition.x -= 0.75; 
	}
}

export default TestScene;
