import Player from '../entities/Player';
import NPC from '../entities/NPC';
import Fog from '../entities/Fog';

import * as json from '../../assets/tilemaps/The City.json';

const asset = (path: string) => `/assets/${path}`;

const MAP_SCALE = 1.5;
const MAP_KEY = 'map';
const LEVEL_KEY = 'level';
const DEFAULT_BKG_KEY = 'default-background-scrapers';
const GREY_BKG_KEY = 'grey-background-scrapers';
const TURQUOISE_BKG_KEY = 'turqouise-background-scrapers';
const YELLOW_BKG_KEY = 'yellow-background-scrapers';
const PINK_BKG_KEY = 'pink-background-scrapers';
const GREEN_BKG_KEY = 'green-background-scrapers';

const SPAWN_RATE = 250;

// Create additional layers that just alias the background layer.
// Everything is the same (including tile GIDS) except the name.
// The different name allows you to add a different tileset image
// for the same layer data, so you can apply a 'theme' per layer.
const addAlternativeCityTilesets = (
	json,
	altCount = 1
) => {
	const [firstSet] = json.tilesets;

	for (let i = 1; i <= altCount; i++) {
		json.tilesets.push({
			...firstSet,
			name: `Skyscrapers_alt_${i}`,
		});
	}
};

class TestScene extends Phaser.Scene {
	readonly NPCLimit = 30;
	private NPCCount = 0;
	public player: Player;
	public cursors: Phaser.Types.Input.Keyboard.CursorKeys;
	public map: Phaser.Tilemaps.Tilemap;
	public NPCs: NPC[];

	constructor() {
    super({
			key: 'The City'
		});
		this.player = new Player(this);
		this.NPCs = Array(this.NPCLimit).fill(0).map(() => new NPC(this));
	}

	preload() {
		addAlternativeCityTilesets(json, 5);
		this.load.tilemapTiledJSON(MAP_KEY, json);
		this.load.image(LEVEL_KEY, asset('tilemaps/platforms_extruded.png'));

		this.load.image(DEFAULT_BKG_KEY, asset('tilemaps/skyscraper_tiles_extruded.png'));
		this.load.image(TURQUOISE_BKG_KEY, asset('tilemaps/skyscraper_tiles_extruded.turquoise.png'));
		this.load.image(PINK_BKG_KEY, asset('tilemaps/skyscraper_tiles_extruded.pink.png'));
		this.load.image(YELLOW_BKG_KEY, asset('tilemaps/skyscraper_tiles_extruded.yellow.png'));
		this.load.image(GREEN_BKG_KEY, asset('tilemaps/skyscraper_tiles_extruded.green.png'));
		this.load.image(GREY_BKG_KEY, asset('tilemaps/skyscraper_tiles_extruded.grey.png'));

		this.player.preload();
		this.NPCs.forEach(npc => npc.preload())
	}

	create() {
		const map = this.map = this.make.tilemap({ key: MAP_KEY });
		const tileset = map.addTilesetImage('Platforms', LEVEL_KEY);
		const scrapers = map.addTilesetImage('Skyscrapers', DEFAULT_BKG_KEY);

		// Alternate skyscraper colours
		const green = map.addTilesetImage('Skyscrapers_alt_1', GREEN_BKG_KEY);
		const yellow = map.addTilesetImage('Skyscrapers_alt_2', YELLOW_BKG_KEY);
		const turqouise = map.addTilesetImage('Skyscrapers_alt_3', TURQUOISE_BKG_KEY);
		const pink = map.addTilesetImage('Skyscrapers_alt_4', PINK_BKG_KEY);
		const grey = map.addTilesetImage('Skyscrapers_alt_5', GREY_BKG_KEY);

		// Apply alternate skyscraper tiles (or not)
		const wayBackground = map.createStaticLayer('Right back', pink, 0, 0).setDepth(1);
		const distantBackground = map.createStaticLayer('Back scrapers', pink, 0, 0).setDepth(3);
		const midBackground = map.createStaticLayer('Scrapers', turqouise, 0, 0).setDepth(5);
		Fog.sunset(this);

		midBackground.scrollFactorX = 0.3;
		midBackground.scrollFactorY = 0.9;
		distantBackground.scrollFactorX = 0.2;
		distantBackground.scrollFactorY = 0.8;
		wayBackground.scrollFactorX = 0.1;
		wayBackground.scrollFactorY = 0.9;

		const layer = map.createStaticLayer('World', tileset).setDepth(5);
		layer.setCollisionByProperty({ collides: true });

		midBackground.scale =
		layer.scale =
		distantBackground.scale =
		wayBackground.scale =
		MAP_SCALE;

		this.cursors = this.input.keyboard.createCursorKeys();

		this.player.create(this.cursors);
		this.player.container.setDepth(6);
		this.physics.add.collider(this.player.container, layer);

		this.cameras.main.setBounds(0, 0, map.widthInPixels * MAP_SCALE, map.heightInPixels * MAP_SCALE);
		this.cameras.main.startFollow(this.player.container, false);

		setTimeout(() => this.spawnNPCs(layer), 3000);

		// debug
		window.game = this;
		window.game.layer = layer;
		// const ladderIndices = layer.filterTiles(_ => _.properties.climbable).map(_ => _.index);
		// layer.setTileIndexCallback(ladderIndices, this.player.nearClimbable, this.player)
		// const debugGraphics = this.add.graphics().setAlpha(.75);
		// layer.renderDebug(debugGraphics, {
		// 	tileColor: null, // Colour of non-colliding tiles
		// 	collidingTileColor: new Phaser.Display.Color(255, 255, 255, 255), // Color of colliding tiles
		// 	faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
		// });
	}

	update(time: number, delta: number) {
		if (this.player.container.body.top > this.map.heightInPixels * MAP_SCALE) {
		// respawn
			this.player.container.setPosition(this.player.spawn[0], 0);
		}
		this.player.update(time, delta);

		this.NPCs
			.filter(npc => npc.spawned)
			.forEach(npc => npc.update(time, delta));
	}

	spawnNPCs(layer: Phaser.Tilemaps.StaticTilemapLayer) {
		const { NPCCount, NPCLimit } = this;
		const npcToAdd = this.NPCs[NPCCount];
		this.NPCCount++;

		if (npcToAdd) {
			npcToAdd.create(this.cursors);
			npcToAdd.container.setDepth((NPCCount % 2) + 5);
			this.physics.add.collider(npcToAdd.container, layer);

			setTimeout(() => {
				this.spawnNPCs(layer);
			}, SPAWN_RATE)
		}
	}
}

export default TestScene;
