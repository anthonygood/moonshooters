import Player from '../entities/Player';
import NPC from '../entities/NPC';
import Background from '../entities/Background';
import * as json from '../../assets/tilemaps/The City.json';

const asset = (path: string) => `/assets/${path}`;

const MAP_SCALE = 1.5;
const MAP_KEY = 'map';
const LEVEL_KEY = 'level';
const SPAWN_RATE = 250;

class TestScene extends Phaser.Scene {
	readonly NPCLimit = 30;
	private NPCCount = 0;
	public player: Player;
	public cursors: Phaser.Types.Input.Keyboard.CursorKeys;
	public map: Phaser.Tilemaps.Tilemap;
	public NPCs: NPC[];
	public background: Background;

	constructor() {
    super({
			key: 'The City'
		});
		this.player = new Player(this);
		this.NPCs = Array(this.NPCLimit).fill(0).map(() => new NPC(this));
		this.background = new Background(this);
	}

	preload() {
		this.background.preload(json);
		this.load.tilemapTiledJSON(MAP_KEY, json);
		this.load.image(LEVEL_KEY, asset('tilemaps/platforms_extruded.png'));

		this.player.preload();
		this.NPCs.forEach(npc => npc.preload())
	}

	create() {
		const map = this.map = this.make.tilemap({ key: MAP_KEY });
		const tileset = map.addTilesetImage('Platforms', LEVEL_KEY);
		this.background.create(map, MAP_SCALE);

		const layer = map.createStaticLayer('World', tileset).setDepth(5);
		layer.setCollisionByProperty({ collides: true });

		layer.scale = MAP_SCALE;

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
