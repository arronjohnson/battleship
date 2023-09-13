import Ship from '../modules/Ship';

let ship;

beforeEach(() => (ship = new Ship(5)));

test('length', () => expect(ship.length).toBe(5));

describe('methods', () => {
  test('hit', () => {
    for (let i = 0; i < 3; i++) {
      ship.hit();
    }
    expect(ship.hitCount).toBe(3);
  });

  test('isSunk', () => {
    for (let i = 0; i < 5; i++) {
      expect(ship.isSunk()).toBe(false);
      ship.hit();
    }
    expect(ship.isSunk()).toBe(true);
  });
});
