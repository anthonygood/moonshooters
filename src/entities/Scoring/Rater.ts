import Score from './Score';
import { Records } from '../../state/FlightRecorder';

const T10s = 10000;
const T20s = 20000;
const T30s = 30000;
const T60s = 60000;
const T3m = 180000;

// Order by priority: best first
const TIME_TAKEN = {
  '🖥 hax':  (score: Score) => score.pass && score.time.total < T10s,
  '⚡️ greased lightning': (score: Score) => score.pass && score.time.total < T30s,
  '👟 speedy': (score: Score) => score.pass && score.time.total < T60s,
  '🤔 ponderous': (score: Score) => score.pass && score.time.total > T3m,
  '💀 defeatist': (score: Score) => !score.pass && score.time.total < T10s,
};

const SCORE = {
  '   completionist': (score: Score) => score.current === score.outOf,
  '   bang average': (score: Score) => score.outOf / score.current === 2,
  '0️⃣ nil pointer': (score: Score) => score.current === 0,
};

const LIVES_LOST = {
  '🎁 gifted': (score: Score) => score.pass && !score.deaths,
  '🧟‍♂️ deathwish': (score: Score) => score.pass && score.deaths >= 10,
  '   persistent': (score: Score) => score.pass && score.deaths >= 5,
  '🐕 dogged': (score: Score) => !score.pass && score.deaths >= 5,
};

const JUMPS = {
  '   grounded': (_: Score, records: Records) => !records.jump.count,
  '   white men can\'t jump': (_: Score, records: Records) => records.jump.longest <= 500,
  '🏀 hangtime': (_: Score, records: Records) => records.jump.longest >= 2000,
  '✈️ airmiles': (_: Score, records: Records) => records.jump.time >= T30s,
};

const IDLE = {
  '💤 AFK': (_: Score, records: Records) => records.idle.longest >= T30s,
  '🦴 bone idle': (_: Score, records: Records) => records.idle.time >= T20s,
  '🍔 unfit': (_: Score, records: Records) => records.idle.longest >= T10s,
  '🛑 stopper': (_: Score, records: Records) => records.idle.count >= 50,
  '   hesitant': (_: Score, records: Records) => records.idle.count >= 30,
  '🐸 hot-footed': (_: Score, records: Records) => records.idle.count <= 5,
  '🚇 never idle': (_: Score, records: Records) => records.idle.count === 0,
};

const CATEGORIES = [TIME_TAKEN, LIVES_LOST, JUMPS, IDLE, SCORE];

export const rate = (score: Score, records: Records) => {
  const ratings = [];

  CATEGORIES.forEach(category => {
    Object.entries(category).find(([key, predicate]) => {
      if (predicate(score, records)) {
        ratings.push(key);
        return true;
      }
    });
  });

  return ratings;
};
