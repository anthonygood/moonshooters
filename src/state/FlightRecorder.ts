import { TStateMachine } from './StateMachine';

type Recording = {
  count: number;
  time: number;
  current?: number;
  longest?: number;
};

const Recording = () => ({
  time: 0,
  count: 0,
  current: 0,
  longest: 0,
});

const FlightRecorder = (machine: TStateMachine<any>) => {
  const records: { [key: string]: Recording } = {};
  const states = Object.keys(machine.states);

  let currentStateName = '';
  let currentDuration = 0;

  states.forEach(state => {
    records[state] = Recording();

    machine.on(state, () => {
      const prev = records[currentStateName];
      if (prev && prev.longest < currentDuration) {
        prev.longest = currentDuration;
      }

      const next = records[state];
      next.count++;
      currentStateName = state;
      currentDuration = 0;
    });
  });

  machine.on('tick', ({ delta }) => {
    const record = records[currentStateName];
    if (record) {
      record.time += delta;
      currentDuration += delta;
    }
  });

  return records;
};

export default FlightRecorder;
