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
