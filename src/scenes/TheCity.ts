import EndLevelReport from '../entities/Scoring/EndLevelReport';
import Score from '../entities/Scoring/Score';
import { rate } from '../entities/Scoring/Rater';
import Player from '../entities/Player';
import NPC, { Modifiers } from '../entities/NPC/NPC';
import { Morning as Background } from '../entities/Background';
import * as json from '../../assets/tilemaps/The City.json';
import { NPCDirection } from '../entities/NPC/Driver';
// import COLOURS from '../entities/NPC/Colours';

export const MAP_SCALE = 1.5;
const LEVEL_KEY = 'level';
const VAN_KEY = 'van';

const asset = (path: string) => `./assets/${path}`;

const getModifiersFromProps = (properties) => {
	const modifier = properties.find(({ name }) => name === 'modifier');
	if (!modifier) return {};

	const moveOnTouch = modifier.value.includes('moveLeftOnTouch') ? NPCDirection.Left :
		modifier.value.includes('moveRightOnTouch') ? NPCDirection.Right :
			null;

	return <Modifiers>{
		idle: modifier.value.includes('idle'),
		moveOnTouch
	};
};

export interface SpawnPoint extends Phaser.GameObjects.GameObject {
	properties: any[],
	x: number,
	y: number,
};

class TheCity extends Phaser.Scene {
	private score: Score;
	public player: Player;
	public cursors: Phaser.Types.Input.Keyboard.CursorKeys;
	public map: Phaser.Tilemaps.Tilemap;
	public NPCs: NPC[];
	public background: Background;
	private disposeReport: () => void;

	constructor(key = 'The City') {
		super({ key });
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

	getMapKey() {
		return 'TheCity';
	}

	preload() {
		const json = this.getLevelJson();
		// @ts-ignore
		this.background.preload(json);
		// @ts-ignore
		this.load.tilemapTiledJSON(this.getMapKey(), json);
		this.load.image(LEVEL_KEY, asset('tilemaps/platforms_extruded.png'));

		this.load.image(VAN_KEY, asset('sprites/white van.png'));

		this.player.preload();
		NPC.preload(this);
	}

	create() {
		const map = this.map = this.make.tilemap({ key: this.getMapKey() });
		const tileset = map.addTilesetImage('Platforms', LEVEL_KEY);
		this.background.create(map, MAP_SCALE);

		const layer = map.createStaticLayer('World', tileset).setDepth(6);
		layer.setCollisionByProperty({ collides: true });

		layer.scale = MAP_SCALE;

		this.cursors = this.input.keyboard.createCursorKeys();

		const playerSpawn = map.findObject('Objects', obj => obj.name === 'PlayerSpawn') as SpawnPoint;
		this.player.create(this.cursors, [playerSpawn.x * MAP_SCALE, playerSpawn.y * MAP_SCALE]);
		this.player.container.setDepth(7);
		this.physics.add.collider(this.player.container, layer);

		this.cameras.main.setBounds(0, 0, map.widthInPixels * MAP_SCALE, map.heightInPixels * MAP_SCALE);
		this.cameras.main.startFollow(this.player.container, false);

		this.spawnNPCs(layer);
		this.score.create();

		// TODO: dispose with overlap listeners?
		this.NPCs.forEach(npc => {
			this.physics.add.overlap(npc.container, this.player.container, (npcContainer, _player) => {
				if (!npcContainer.getData('touchedByPlayer')) {
					this.score.increment();
					this.score.update();
					npcContainer.setData('touchedByPlayer', true);
				}

				// TODO: 2 metre penalty radius
				// apparently overlap uses fixed update so should be consistent regardless of framerate
				this.score.penalise();
			});
		});

		// debug
		// @ts-ignore
		window.game = this;
	}

	update(time: number, delta: number) {
		const fallenBelowBounds = (<Phaser.Physics.Arcade.Body>this.player.container.body).top > this.map.heightInPixels * MAP_SCALE;
		const roadkill = this.player.container.getData('roadkill');

		if (this.score.end) {
			if (this.cursors.space.isDown || this.input.activePointer.isDown) this.restart();
		} else {
			if (fallenBelowBounds || roadkill) this.end();
		}

		// Don't keep updating player out of level bounds
		if (!fallenBelowBounds) this.player.update(time, delta);

		// if (this.playerRect) this.playerRect.destroy();
		// if (this.pointerRect) this.pointerRect.destroy();

		// this.playerRect = this.add.rectangle(this.player.container.x, 0, 6, 2000, COLOURS.blue).setDepth(10);
		// this.pointerRect = this.add.rectangle(this.player.direction.positionX(), 0, 6, 2000, COLOURS.green).setDepth(10);


		// TODO: only update NPCs nearby?
		this.NPCs
			.filter(npc => npc.spawned)
			.forEach(npc => npc.update(time, delta));
	}

	end() {
		this.score.finish();
		const ratings = rate(this.score, this.player.state.flightRecorder);
		this.disposeReport = EndLevelReport(this, this.score, ratings.join('\n'));
	}

	restart() {
		this.disposeReport();
		this.NPCs.forEach(npc => npc.destroy());
		this.NPCs = [];
		this.score.pass ? this.nextScene() : this.scene.restart();
	}

	spawnNPCs(layer: Phaser.Tilemaps.StaticTilemapLayer) {
		const { NPCs, cursors, map, physics, score } = this;

		const spawnPoints = map.filterObjects('Objects', obj => obj.name === 'NPCSpawn');
		const npcCount = spawnPoints.length;

		score.setTotal(npcCount);

		spawnPoints
			.forEach(({ properties = [], x, y }: SpawnPoint) => {
				const npc = new NPC(this);
				const modifiers = getModifiersFromProps(properties);
				npc.create(cursors, [x * MAP_SCALE, y * MAP_SCALE], modifiers);
				npc.container.setDepth((npcCount % 2) + 6);
				physics.add.collider(npc.container, layer);
				NPCs.push(npc);
		});
	}

	debug(worldLayer) {
		const ladderIndices = worldLayer.filterTiles(_ => _.properties.climbable).map(_ => _.index);
		worldLayer.setTileIndexCallback(ladderIndices, this.player.nearClimbable, this.player)
		const debugGraphics = this.add.graphics().setAlpha(.75);
		worldLayer.renderDebug(debugGraphics, {
			tileColor: null, // Colour of non-colliding tiles
			collidingTileColor: new Phaser.Display.Color(255, 255, 255, 255), // Color of colliding tiles
			faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
		});
	}

	nextScene() {
		return this.scene.start('The CityII');
	}
}

export default TheCity;
