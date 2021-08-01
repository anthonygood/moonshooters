import Score from './Score';
import ATMOSPHERE from '../Fog/Fog';

const failText = ({ heading, score, ratings }) => `
${heading}
------------

ASSISTED:  ${score.current} / ${score.outOf}

${ratings || ''}

PRESS SPACE
`;

const passText = ({ heading, score, timeFormatted, ratings }) =>
`   ${heading}
	  -------------

ASSISTED:  ${score.current} / ${score.outOf}
+${score.currentVal}

TIME:  ${timeFormatted}
+${score.time.bonus}

SOCIAL DISTANCE: ${score.penalty || ' ' + score.penalty}

TOTAL:  ${score.total}

${ratings || ''}

PRESS SPACE
`;

export const EndLevelReport = (scene: Phaser.Scene, score: Score, ratings: string) => {
	const { pass, time, } = score;
	const timeTakenMin = Math.floor(time.sec / 60);
	const timeFormatted = `${timeTakenMin ? timeTakenMin + 'm ' : ''}${time.sec % 60}s`;
	const heading = `LEVEL ${pass ? 'CLEARED' : 'FAILED'}`;
  const body = !pass ? failText({ heading, score, ratings }) : passText({
    heading,
    score,
    timeFormatted,
    ratings,
  });

	const screenCenterX = scene.cameras.main.width / 2;
	const text = scene.add.text(screenCenterX, 300, body, {
		color: 'white',
		fontSize: 24,
	});
	text.setOrigin(0.5)
		.setScrollFactor(0)
		.setDepth(6);
	const destroyBkg = ATMOSPHERE.endLevel(scene);

	// Returns disposer function
	return () => {
		destroyBkg()
		text.destroy();
	};
};

export default EndLevelReport;
