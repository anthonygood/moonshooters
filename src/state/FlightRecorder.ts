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

  states.forEach(state => {
    records[state] = Recording();

    machine.on(state, () => {
      currentStateName = state;
      const record = records[state];
      record.count++;
    });
  });

  machine.on('tick', (data) => {
    const record = records[currentStateName];
    record && (record.time += data.delta);
  });

  return records;
};

export default FlightRecorder;
