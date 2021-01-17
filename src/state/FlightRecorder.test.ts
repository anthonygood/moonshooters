import { StateMachine } from './StateMachine';
import FlightRecorder from './FlightRecorder';

const machine = StateMachine<any>('idle')
  .transitionTo('walking').when(data => data.walk)
  .transitionTo('jumping').when(data => data.jump)
  .state('walking')
  .transitionTo('jumping').when(data => data.jump)
  // Can only transition to idle from jumping
  .state('jumping')
  .transitionTo('idle').when(data => data.idle);

describe('FlightRecorder', () => {
  const recorder = FlightRecorder(machine);

  const ticks = [
/*|  state  |    change     |
  |=========================| */
    'none', // idle 1       |
    'none', //   idling +10 |
    'walk', // walk 1       |
    'walk', //   walking +10|
    'walk', //   walking +20|
    'walk', //   walking +30|
    'walk', //   walking +40|
    'jump', // jump 1       |
    'walk', //   jumping +10 (invalid transition, shouldn't count)
    'idle', // idle 2       |
    'idle', //   idling +20 |
    'jump', // jump 2       |
    'jump', //   jumping +20|
    'idle', // idle 3       |
    'walk', // walk 2       |
  ];

  machine.init();
  ticks.forEach(key => {
    machine.process({ [key]: true, delta: 10 })
  });

  it('records state counts', () => {
    expect(recorder.idle.count).toBe(3);
    expect(recorder.walking.count).toBe(2);
    expect(recorder.jumping.count).toBe(2);
  });

  it('records state times', () => {
    expect(recorder.idle.time).toBe(30);
    expect(recorder.walking.time).toBe(40);
    expect(recorder.jumping.time).toBe(20);
  });

  it('records longest times', () => {
    expect(recorder.idle.longest).toBe(20);
    expect(recorder.walking.longest).toBe(40);
    expect(recorder.jumping.longest).toBe(10);
  });
});
