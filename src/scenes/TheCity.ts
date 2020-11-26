import EndLevelReport from '../entities/Scoring/EndLevelReport';
import Score from '../entities/Scoring/Score';
import Player from '../entities/Player';
import NPC from '../entities/NPC/NPC';
import { Morning as Background } from '../entities/Background';
import * as json from '../../assets/tilemaps/The City.json';

const asset = (path: string) => `/assets/${path}`;

const MAP_SCALE = 1.5;
const MAP_KEY = 'map';
const LEVEL_KEY = 'level';

class TheCity extends Phaser.Scene {
	private score: Score;
	public player: Player;
	public cursors: Phaser.Types.Input.Keyboard.CursorKeys;
	public map: Phaser.Tilemaps.Tilemap;
	public NPCs: NPC[];
	public background: Background;
	private disposeReport: () => void;

	constructor() {
    super({
			key: 'The City'
		});
    this.player = new Player(this);
		this.background = this.getBackground();
		this.score = new Score(this);
		this.NPCs = [];
  }

  getBackground() {
    return new Background(this);
  }

  getLevelJson() {
    return json;
  }

	preload() {
    const json = this.getLevelJson();
		this.background.preload(json);
		this.load.tilemapTiledJSON(MAP_KEY, json);
		this.load.image(LEVEL_KEY, asset('tilemaps/platforms_extruded.png'));

		this.player.preload();
		NPC.preload(this);
	}

	create() {
		console.log('scene::create!!!')
		const map = this.map = this.make.tilemap({ key: MAP_KEY });
		const tileset = map.addTilesetImage('Platforms', LEVEL_KEY);
		this.background.create(map, MAP_SCALE);

		const layer = map.createStaticLayer('World', tileset).setDepth(5);
		layer.setCollisionByProperty({ collides: true });

		layer.scale = MAP_SCALE;

		this.cursors = this.input.keyboard.createCursorKeys();

		const playerSpawn = this.playerSpawn = map.findObject('Objects', obj => obj.name === 'PlayerSpawn');
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
    const fallenBelowBounds = this.player.container.body.top > this.map.heightInPixels * MAP_SCALE;
		if (fallenBelowBounds) {
      if (!this.score.end) {
				this.score.finish();
				this.disposeReport = EndLevelReport(this, this.score);
      } else {
        if (this.cursors.space.isDown) {
					this.player.destroy();
					this.disposeReport();
					this.NPCs.forEach(npc => npc.destroy());
					this.NPCs = [];
					this.scene.restart();
        }
      }
		} else {
			this.player.update(time, delta);
		}

		// TODO: only update NPCs nearby?
		this.NPCs
			.filter(npc => npc.spawned)
			.forEach(npc => npc.update(time, delta));
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

export default TheCity;
