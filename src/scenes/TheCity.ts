import Score from '../entities/Score';
import Player from '../entities/Player';
import NPC from '../entities/NPC/NPC';
import { Morning as Background } from '../entities/Background';
import * as json from '../../assets/tilemaps/The City.json';
import ATMOSPHERE from '../entities/Fog';

const asset = (path: string) => `/assets/${path}`;

const MAP_SCALE = 1.5;
const MAP_KEY = 'map';
const LEVEL_KEY = 'level';

const EndOfLevelReport = (scene: TheCity, score: Score) => {
	const { start, end, cameras, add } = scene;
	const timeTakenSec = Math.floor((end - start) / 1000);
	const timeTakenMin = Math.floor(timeTakenSec / 60)
	const timeTaken = `${timeTakenMin ? timeTakenMin + 'm ' : ''}${timeTakenSec % 60}s`;
	const pass = Math.floor(score.current / score.outOf * 100) > .5;
	const heading = `LEVEL ${pass ? 'CLEARED' : 'FAILED'}`;
	const currentVal = score.current * 100;
	const penalty = score.penalty;
	const timeBonus = 500 - timeTakenSec;
	const total = timeBonus + currentVal - penalty;
  const body = !pass ? `
   ${heading}
   ------------

         MASKED:  ${score.current} / ${score.outOf}
` :
`   ${heading}
	  ------------

         MASKED:  ${score.current} / ${score.outOf}
                 +${total}

           TIME:  ${timeTaken}
                 +${timeBonus}

SOCIAL DISTANCE: ${penalty || ' ' + penalty}

          TOTAL:  ${total}`;
	const screenCenterX = scene.cameras.main.width / 2;
	const text = scene.add.text(screenCenterX, 300, body, {
		color: 'white',
		fontSize: 36,
	});
	text.setOrigin(0.5)
		.setScrollFactor(0)
		.setDepth(6);
	ATMOSPHERE.endLevel(scene);
};

class TheCity extends Phaser.Scene {
	private score: Score;
	public player: Player;
	public cursors: Phaser.Types.Input.Keyboard.CursorKeys;
	public map: Phaser.Tilemaps.Tilemap;
	public NPCs: NPC[];
	public background: Background;
	public start: Date;
	public end: Date;

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
		const tileset = map.addTilesetImage('Platforms', LEVEL_KEY);
		this.background.create(map, MAP_SCALE);

		const layer = map.createStaticLayer('World', tileset).setDepth(5);
		layer.setCollisionByProperty({ collides: true });

		layer.scale = MAP_SCALE;

		this.cursors = this.input.keyboard.createCursorKeys();

		const playerSpawn = map.findObject('Objects', obj => obj.name === 'PlayerSpawn');
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

			this.start = new Date();
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
		if (!this.end && this.player.container.body.top > this.map.heightInPixels * MAP_SCALE) {
			// respawn
			// this.player.container.setPosition(this.playerSpawn.x, 0);
			this.end = new Date;
			EndOfLevelReport(this, this.score);
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
