import Score from './Score';
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

export const EndLevelReport = (scene: Phaser.Scene, score: Score) => {
	const { pass, time, } = score;
	const timeTakenMin = Math.floor(time.sec / 60);
	const timeTaken = `${timeTakenMin ? timeTakenMin + 'm ' : ''}${time.sec % 60}s`;
	const heading = `LEVEL ${pass ? 'CLEARED' : 'FAILED'}`;
	const penalty = score.penalty;
	const total = score.total;
  const body = !pass ? failText({ heading, score }) : passText({
    heading,
    score,
    total,
    timeTaken,
    timeBonus: time.bonus,
    penalty
  });

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

export default EndLevelReport;
