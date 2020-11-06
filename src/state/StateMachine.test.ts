import { StateMachine } from './StateMachine';

describe('StateMachine', () => {
  it('returns a state machine that follows set of rules', () => {
    const machine = StateMachine<any>('idle')
      .transitionTo('walk').when(data => data.key === '<walk>');

    expect(machine.currentState()).toBe('idle');
    machine.process({})
    expect(machine.currentState()).toBe('idle');
    machine.process({ key: '<walk>' });
    expect(machine.currentState()).toBe('walk');
  });

  it('throws with invalid transition to same state', () => {
    expect(() => {
      StateMachine('foo').transitionTo('foo')
    }).toThrow('Cannot transition to same state: \'foo\'');
  });

  it('works with more complex example', () => {
    const machine = StateMachine<any>('idle')
      .transitionTo('walk').when(data => data.key === '<walk>').or(data => data.foo);

    expect(machine.currentState()).toBe('idle');
    machine.process({})
    expect(machine.currentState()).toBe('idle');
    machine.process({ foo: true });
    expect(machine.currentState()).toBe('walk');
    machine.process({ key: '<walk>' });
    expect(machine.currentState()).toBe('walk');

    machine.state('walk').transitionTo('idle').when(data => data.action === '<finished>');
    machine.process({ action: '<finished>' });

    expect(machine.currentState()).toBe('idle');
  });

  it('works with yet more complex state graph example', () => {
    const machine = StateMachine<any>('idle')
      .transitionTo('walking').when(data => data.walk || data.key === '<walk>')
      .state('walking')
      .transitionTo('jumping').when(data => data.jump).or(data => data.jump === '<jump>')
      // Can only transition to idle from jumping
      .state('jumping')
      .transitionTo('idle').when(data => data.idle).or(data => data.key === '<idle>');

    expect(machine.currentState()).toBe('idle');

    machine.process({ walk: true });
    expect(machine.currentState()).toBe('walking');

    machine.process({ key: '<idle>' });
    expect(machine.currentState()).toBe('walking');

    machine.process({ jump: true })
    expect(machine.currentState()).toBe('jumping');

    // Can't transition to walking from jumping
    machine.process({ key: '<walk>' })
    expect(machine.currentState()).toBe('jumping');

    machine.process({ key: '<idle>' });
    expect(machine.currentState()).toBe('idle');
  });

  describe('initialising new state', () => {
    it('calls function when transitionining to new state', () => {
      const mock = jest.fn();
      const machine = StateMachine<any>('idle')
        .transitionTo('walk').when(data => data.walk).andThen(mock);

      expect(mock).not.toHaveBeenCalled();

      machine.process({ walk: true })

      expect(mock).toHaveBeenCalled();
    });

    it('also works with the inverse construction', () => {
      const mock = jest.fn();
      const machine = StateMachine<any>('idle')
        .transitionTo('walk').andThen(mock).when(data => data.walk);

      expect(mock).not.toHaveBeenCalled();

      machine.process({ walk: true })

      expect(mock).toHaveBeenCalled();
    });

    it('initialises default state if needed', () => {
      const init1 = jest.fn();
      const init2 = jest.fn();
      const machine = StateMachine<any>('idle').andThen(init1)
        .transitionTo('walk').andThen(init2).when(data => data.walk);

      expect(init1).not.toHaveBeenCalled()

      machine.init();
      expect(init1).toHaveBeenCalled()

      expect(init2).not.toHaveBeenCalled();
      machine.process({ walk: true })
      expect(init2).toHaveBeenCalled();
    });
  });
});
