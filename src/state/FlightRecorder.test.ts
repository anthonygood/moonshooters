import { StateMachine, TStateMachine } from './StateMachine';

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

const machine = StateMachine<any>('idle')
  .transitionTo('walking').when(data => data.walk)
  .transitionTo('jumping').when(data => data.jump)
  .state('walking')
  .transitionTo('jumping').when(data => data.jump)
  // Can only transition to idle from jumping
  .state('jumping')
  .transitionTo('idle').when(data => data.idle);

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

describe('FlightRecorder', () => {
  const recorder = FlightRecorder(machine);

  const ticks = [
/*| state  |  change  |
  |===================| */
    'none', // idle   |
    'none', //        |
    'walk', // walk   |
    'walk', //        |
    'walk', //        |
    'jump', // jump   |
    'walk', //   (invalid transition, shouldn't count)
    'idle', // idle   |
    'idle', //        |
    'jump', // jump   |
    'jump', //        |
    'idle', // idle   |
    'walk', // walk   |
  ];

  machine.init();
  ticks.forEach(key => {
    machine.process({ [key]: true, delta: 1 })
  });

  it('records state counts', () => {
    expect(recorder.idle.count).toBe(3);
    expect(recorder.walking.count).toBe(2);
    expect(recorder.jumping.count).toBe(2);
  });
});
