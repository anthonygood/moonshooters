import ATMOSPHERE from '../Fog';

const failText = ({ heading, score }) => `
${heading}
------------

			MASKED:  ${score.current} / ${score.outOf}

			PRESS SPACE
`;

const passText = ({ heading, score, total, timeTaken, timeBonus, penalty }) =>
`   ${heading}
	  ------------

         MASKED:  ${score.current} / ${score.outOf}
                 +${total}

           TIME:  ${timeTaken}
                 +${timeBonus}

SOCIAL DISTANCE: ${penalty || ' ' + penalty}

          TOTAL:  ${total}

         PRESS SPACE
`;

export const EndOfLevelReport = (scene: Phaser.Scene, score: Score) => {
	const { pass, start, end } = score;
	const timeTakenSec = Math.floor((end - start) / 1000);
	const timeTakenMin = Math.floor(timeTakenSec / 60)
	const timeTaken = `${timeTakenMin ? timeTakenMin + 'm ' : ''}${timeTakenSec % 60}s`;
  // const pass = score.current && (score.current / score.outOf) > .5;
	const heading = `LEVEL ${pass ? 'CLEARED' : 'FAILED'}`;
	const currentVal = score.current * 100;
	const penalty = score.penalty;
	const timeBonus = 500 - timeTakenSec;
	const total = timeBonus + currentVal - penalty;
  const body = !pass ? failText({ heading, score }) : passText({ heading, score, total, timeTaken, timeBonus, penalty });

	const screenCenterX = scene.cameras.main.width / 2;
	const text = scene.add.text(screenCenterX, 300, body, {
		color: 'white',
		fontSize: 36,
	});
	text.setOrigin(0.5)
		.setScrollFactor(0)
		.setDepth(6);
	const fog = ATMOSPHERE.endLevel(scene);

	// Returns disposer function
	return () => {
		fog.forEach(image => image.destroy());
		text.destroy();
	};
};

class Score {
	public scene: Phaser.Scene;
	public current: number;
	public penalty: number;
	public outOf: number;
	public start: Date;
	public end: Date;
	public pass: boolean;
	public total: number;
	// public time: number;
	public time: {
		total: number;
		sec: number;
		bonus: number;
	};
	// public timeBonus: number;
	private container: Phaser.GameObjects.Text;
	constructor(scene: Phaser.Scene, total = 0) {
		this.scene = scene;
		this.outOf = total;
	}

	setTotal(total: number) {
		this.outOf = total;
	}

	create() {
		this.start = new Date();
		this.end = null;
		this.current = 0;
		this.penalty = 0;
		this.container = this.scene.add.text(10, 10, this.text(), this.style())
			.setScrollFactor(0, 0)
			.setDepth(6); // TODO: de-couple from scene layering or parameterise
	}

	finish() {
		const { current, outOf, penalty, start } = this;
		this.pass = current && (current / outOf) > .5;

		const end = this.end = new Date();
		const time = start - end;
		const timeTakenSec = Math.floor(time / 1000);
		const timeBonus = 500 - timeTakenSec;

		this.time = {
			total: time,
			sec: timeTakenSec,
			bonus: timeBonus,
		};

		this.total = timeBonus + current - penalty;
	}

	update() {
		this.container.setText(this.text());
	}

	increment() {
    this.current++;
	}

	penalise() {
    this.penalty--;
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
