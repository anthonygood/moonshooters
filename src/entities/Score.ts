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
    this.update();
	}
	penalise() {
    this.penalty--;
    this.update();
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

export default Score;
