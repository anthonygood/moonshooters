class Score {
	public scene: Phaser.Scene;
	public current: number;
	public currentVal: number; // score times multiplier
	public penalty: number;
	public outOf: number;
	public start: Date;
	public end: Date;
	public total: number;
	public penaltyAcrossAllLives: number;
	public time: {
		total: number;
		sec: number;
		bonus: number;
	};
	public deaths: number;
	private container: Phaser.GameObjects.Text;
	constructor(scene: Phaser.Scene, total = 0) {
		this.scene = scene;
		this.outOf = total;
		this.deaths = 0;
	}

	setTotal(total: number) {
		this.outOf = total;
	}

	// Create is called when player restarts level, so consider player death here.
	create() {
		if (this.start) {
			// Increment things
			this.deaths++;
			this.penaltyAcrossAllLives += this.penalty;
		}

		this.start = new Date();
		this.end = null;
		this.current = 0;
		this.penalty = 0;

		this.container = this.scene.add.text(10, this.scene.cameras.main.height - 50, this.text(), this.style())
			.setScrollFactor(0, 0)
			.setDepth(6); // TODO: de-couple from scene layering or parameterise
	}

	get pass() {
		const { current, outOf } = this;
		return current && (current / outOf) > .5;
	}

	finish() {
		const { current, penalty, start } = this;

		const end = this.end = new Date();
		const time = end - start;
		const timeTakenSec = Math.floor(time / 1000);
		const timeBonus = this.pass ? 500 - timeTakenSec : 0;

		this.time = {
			total: time,
			sec: timeTakenSec,
			bonus: timeBonus,
		};

		this.currentVal = current * 100;
		this.total = timeBonus + this.currentVal + penalty; // penalty is negative value, so don't subtract!
		this.hide();
	}

	update() {
		this.container.setText(this.text());
	}

	hide() {
		this.container.setText('');
	}

	increment() {
    this.current++;
	}

	penalise() {
    this.penalty--;
	}

	text() {
		const { pass } = this;
		return `${pass ? '⭐️' : ''}😷${this.current}/${this.outOf}`;
	}

	style() {
		return {
			fontSize: '32px',
			color: 'white',
			stroke: 'black',
			strokeThickness: 5,
		};
	}
}

export default Score;
