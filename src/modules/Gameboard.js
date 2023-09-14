import Ship from './Ship';

export default class Gameboard {
  static SIZE = 10;

  constructor() {
    this.grid = new Array(Gameboard.SIZE)
      .fill(null)
      .map(() => new Array(Gameboard.SIZE).fill(null));
    this.placedShips = [];
  }

  static #isValidCoordinate(x, y) {
    return x >= 0 && x < Gameboard.SIZE && y >= 0 && y < Gameboard.SIZE;
  }

  static #isValidShipPlacement(grid, length, x, y, isVertical) {
    // compare co-ordinates to board dimensions
    if (!Gameboard.#isValidCoordinate(x, y)) return false;
    // check ship length is within bounds
    if ((isVertical ? y : x) > Gameboard.SIZE - length) return false;

    // iterate over all surrounding co-ordinates
    for (let i = -1; i <= length; i++) {
      for (let j = -1; j <= 1; j++) {
        const adjX = x + (isVertical ? j : i);
        const adjY = y + (isVertical ? i : j);
        // maintain minimum 1 cell gap between ships
        if (Gameboard.#isValidCoordinate(adjX, adjY) && grid[adjY][adjX] instanceof Ship) {
          return false;
        }
      }
    }
    return true;
  }

  placeShip(length, [x, y], isVertical) {
    // check that the coordinates are valid, taking into consideration ship length,
    // board dimensions, and previously placed ships
    if (!Gameboard.#isValidShipPlacement(this.grid, length, x, y, isVertical)) return false;

    const ship = new Ship(length);
    for (let i = 0; i < length; i++) {
      if (isVertical) {
        // x and y are flipped because we're accessing rows and columns in a
        // nested array, so y = row and x = column
        this.grid[y + i][x] = ship;
      } else {
        this.grid[y][x + i] = ship;
      }
    }
    this.placedShips.push(ship);
    return true;
  }

  static #getRandomCoordinate() {
    const x = Math.floor(Math.random() * Gameboard.SIZE);
    const y = Math.floor(Math.random() * Gameboard.SIZE);
    return [x, y];
  }

  placeShipsRandomly() {
    const ships = Object.values(Ship.SIZES);

    let numPlaced = 0;
    while (numPlaced < ships.length) {
      const isVertical = Math.floor(Math.random() * 2) === 1;

      if (this.placeShip(ships[numPlaced], Gameboard.#getRandomCoordinate(), isVertical)) {
        numPlaced++;
      }
    }
  }

  receiveAttack([x, y]) {
    const cell = this.grid[y][x];

    // these co-ordinates have already been attacked
    if (cell === 'hit' || cell === 'miss') return false;

    if (cell instanceof Ship) {
      cell.hit();
      this.grid[y][x] = 'hit';
    } else {
      this.grid[y][x] = 'miss';
    }
    return true;
  }

  receiveRandomAttack() {
    let success = false;
    while (!success) {
      success = this.receiveAttack(Gameboard.#getRandomCoordinate());
    }
    return true;
  }

  allShipsSunk() {
    return this.placedShips.every((ship) => ship.isSunk());
  }
}
