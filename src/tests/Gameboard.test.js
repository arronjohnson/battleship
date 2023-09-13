import Gameboard from '../modules/Gameboard';

let gameboard;
let grid;

const blankGrid = [
  [null, null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null, null],
];

beforeEach(() => {
  gameboard = new Gameboard();
  grid = gameboard.grid;
});

test('initialise gameboard grid', () => {
  expect(grid).toEqual(blankGrid);
});

describe('placing ships', () => {
  test('horizontally', () => {
    expect(gameboard.placeShip(2, [0, 0], false)).toBe(true);
    expect(grid[0][0]).not.toBe(null);
    expect(grid[0][1]).not.toBe(null);
  });

  test('vertically', () => {
    expect(gameboard.placeShip(2, [3, 3], true)).toBe(true);
    expect(grid[3][3]).not.toBe(null);
    expect(grid[4][3]).not.toBe(null);
  });

  test('bottom-right corner', () => {
    expect(gameboard.placeShip(3, [7, 9], false)).toBe(true);
    expect(grid[9][9]).not.toBe(null);
  });

  test('out of bounds', () => {
    expect(gameboard.placeShip(5, [11, 11], false)).toBe(false);
    expect(grid).toEqual(blankGrid);
  });

  test('extending beyond x axis', () => {
    expect(gameboard.placeShip(3, [8, 0], false)).toBe(false);
    expect(grid).toEqual(blankGrid);
  });

  test('extending beyond y axis', () => {
    expect(gameboard.placeShip(3, [0, 8], true)).toBe(false);
    expect(grid).toEqual(blankGrid);
  });

  test('randomly place 5 ships', () => {
    gameboard.placeShipsRandomly();
    expect(gameboard.placedShips.length).toBe(5);
  });

  describe('too close to another', () => {
    beforeEach(() => gameboard.placeShip(5, [0, 0], false));

    test('overlapping', () => {
      expect(gameboard.placeShip(5, [3, 0], false)).toBe(false);
      expect(grid[0][4]).not.toBe(null);
      expect(grid[0][5]).toBe(null);
    });

    test('adjacent', () => {
      expect(gameboard.placeShip(5, [0, 1], false)).toBe(false);
      expect(grid[0][0]).not.toBe(null);
      expect(grid[1][0]).toBe(null);
    });
  });
});

describe('attacks', () => {
  beforeEach(() => gameboard.placeShip(5, [3, 3], false));

  test('miss', () => {
    expect(gameboard.receiveAttack([0, 0])).toBe(true);
    expect(grid[0][0]).toBe('miss');
  });

  test('hit', () => {
    expect(gameboard.receiveAttack([3, 3])).toBe(true);
    expect(grid[3][3]).toBe('hit');
  });

  test('identical location', () => {
    expect(gameboard.receiveAttack([0, 0])).toBe(true);
    expect(gameboard.receiveAttack([0, 0])).toBe(false);
  });
});

describe('check for sunk ships', () => {
  test('all', () => expect(gameboard.allShipsSunk()).toBe(true));

  test('some', () => {
    gameboard.placeShip(1, [0, 0], false);
    gameboard.placeShip(1, [0, 2], false);
    gameboard.receiveAttack([0, 2]);
    expect(gameboard.allShipsSunk()).toBe(false);
  });

  test('none', () => {
    gameboard.placeShip(1, [0, 0], false);
    expect(gameboard.placedShips.every((ship) => !ship.isSunk())).toBe(true);
  });
});
