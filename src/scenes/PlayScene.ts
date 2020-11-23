import Player from '../entities/Player';
import NPC from '../entities/NPC/NPC';
import { Morning as Background } from '../entities/Background';
import * as json from '../../assets/tilemaps/The City.json';

const asset = (path: string) => `/assets/${path}`;

const MAP_SCALE = 1.5;
const MAP_KEY = 'map';
const LEVEL_KEY = 'level';
const SPAWN_RATE = 250;

class Score {
	public scene: Phaser.Scene;
	public current: number;
	public penalty: number;
	public outOf: number;
	private container: Phaser.GameObjects.Text;
	constructor(scene: Phaser.Scene, total = 0) {
		this.scene = scene;
		this.current = 0;
		this.penalty = 0;
		this.outOf = total;
	}

	setTotal(total: number) {
		this.outOf = total;
	}

	create() {
		this.container = this.scene.add.text(10, 10, this.text(), this.style())
			.setScrollFactor(0, 0)
			.setDepth(6); // TODO: de-couple from scene layering or parameterise
	}

	update() {
		this.container.setText(this.text());
	}

	increment() {
		this.current++;
	}
	penalise() {
		this.penalty++;
	}
	text() {
		let str = `Score: ${this.current}/${this.outOf}`;

		if (this.penalty) {
			str += `\nSocial Distance Penalty: -${this.penalty}`;
		}

		return str;
	}

	style() {
		return { fontSize: '24px', color: 'black' };
	}
}

class TestScene extends Phaser.Scene {
	// TODO: some way to preload NPCs without hardcoding here?
	// OR separate NPC asset preloading from rest of logic.
	readonly NPCLimit = 17;
	private playerSpawn: Phaser.GameObjects.GameObject;
	private score: Score;
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
		this.background = new Background(this);
		this.score = new Score(this);
		this.NPCs = [];
	}

	preload() {
		this.background.preload(json);
		this.load.tilemapTiledJSON(MAP_KEY, json);
		this.load.image(LEVEL_KEY, asset('tilemaps/platforms_extruded.png'));

		this.player.preload();
		NPC.preload(this);
	}

	create() {
		const map = this.map = this.make.tilemap({ key: MAP_KEY });
		const playerSpawn = this.playerSpawn = map.findObject('Objects', obj => obj.name === 'PlayerSpawn');
		const tileset = map.addTilesetImage('Platforms', LEVEL_KEY);
		this.background.create(map, MAP_SCALE);

		const layer = map.createStaticLayer('World', tileset).setDepth(5);
		layer.setCollisionByProperty({ collides: true });

		layer.scale = MAP_SCALE;

		this.cursors = this.input.keyboard.createCursorKeys();

		this.player.create(this.cursors, [playerSpawn.x * MAP_SCALE, playerSpawn.y * MAP_SCALE]);
		this.player.container.setDepth(6);
		this.physics.add.collider(this.player.container, layer);

		this.cameras.main.setBounds(0, 0, map.widthInPixels * MAP_SCALE, map.heightInPixels * MAP_SCALE);
		this.cameras.main.startFollow(this.player.container, false);

		this.spawnNPCs(layer);
		this.score.create();

		this.NPCs.forEach(npc => {
			this.physics.add.overlap(npc.container, this.player.container, (npcContainer, player) => {
				!npcContainer.getData('touchedByPlayer') && this.score.increment();
				npcContainer.setData('touchedByPlayer', true);

				// TODO: 2 metre penalty radius
				// apparently overlap uses fixed update so should be consistent regardless of framerate
				this.score.penalise();
			});
		});

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
			this.player.container.setPosition(this.playerSpawn.x, 0);
		}
		this.player.update(time, delta);

		// TODO: only update NPCs nearby?
		this.NPCs
			.filter(npc => npc.spawned)
			.forEach(npc => npc.update(time, delta));

		this.score.update();
	}

	spawnNPCs(layer: Phaser.Tilemaps.StaticTilemapLayer) {
		const { NPCs, cursors, map, physics, score } = this;

		const spawnPoints = map.filterObjects('Objects', obj => obj.name === 'NPCSpawn');
		const npcCount = spawnPoints.length;

		score.setTotal(npcCount);

		spawnPoints
			.forEach(({ properties = [], x, y }) => {
				const npc = new NPC(this);
				const modifiers = {
					idle: properties.find(({ name, value}) => name === 'modifier' && value === 'idle'),
				};
				npc.create(cursors, [x * MAP_SCALE, y * MAP_SCALE], modifiers);
				npc.container.setDepth((npcCount % 2) + 5);
				physics.add.collider(npc.container, layer);
				NPCs.push(npc);
		});
	}
}

export default TestScene;
