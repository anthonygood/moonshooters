import Player from '../entities/NPC';
import Fog from '../entities/Fog';

const asset = (path: string) => `/assets/${path}`;

const MAP_SCALE = 1.5;
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
		this.load.image(LEVEL_KEY, asset('tilemaps/platforms_extruded.png'));
		this.load.image(BKG_KEY, asset('tilemaps/skyscraper_tiles_extruded.grey.png'));
		this.load.image(SKY_KEY, 'assets/sky.png');
		this.player.preload();
	}

	create() {
		// const sky = this.add.image(0, 0, SKY_KEY).setOrigin(0, 0);
		const map = this.map = this.make.tilemap({ key: MAP_KEY });
		const tileset = map.addTilesetImage('Platforms', LEVEL_KEY);
		const scrapers = map.addTilesetImage('Skyscrapers', BKG_KEY);
		const distantBackground = map.createStaticLayer('Back scrapers', scrapers, 0, 0);
		// new Fog(this).add('fog1');
		const midBackground = map.createStaticLayer('Scrapers', scrapers, 0, 0);
		new Fog(this).add('fog2');

		midBackground.scrollFactorX = 0.3;
		midBackground.scrollFactorY = 0.9;
		distantBackground.scrollFactorX = 0.2;
		distantBackground.scrollFactorY = 0.8;

		const layer = map.createStaticLayer('World', tileset);
		layer.setCollisionByProperty({ collides: true });
		midBackground.scale = layer.scale = distantBackground.scale = MAP_SCALE;

		this.cursors = this.input.keyboard.createCursorKeys();

		this.player.create();
		this.physics.add.collider(this.player.container, layer);

		this.cameras.main.setBounds(0, 0, map.widthInPixels * MAP_SCALE, map.heightInPixels * MAP_SCALE);
		this.cameras.main.startFollow(this.player.container, false);

		// debug
		window.game = this;
		window.game.layer = layer;
		const ladderIndices = layer.filterTiles(_ => _.properties.climbable).map(_ => _.index);
		layer.setTileIndexCallback(ladderIndices, this.player.nearClimbable, this.player)
		const debugGraphics = this.add.graphics().setAlpha(.75);
		layer.renderDebug(debugGraphics, {
			tileColor: null, // Colour of non-colliding tiles
			collidingTileColor: new Phaser.Display.Color(255, 255, 255, 255), // Color of colliding tiles
			faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
		});
	}

	update(time: number, delta: number) {
		if (this.player.container.body.top > this.map.heightInPixels * MAP_SCALE) {
		// respawn
			this.player.container.setPosition(this.player.spawn[0], 0);
		}
		this.player.update(time, delta, this.cursors);
	}
}

export default TestScene;
