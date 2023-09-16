import Ship from './Ship';

export default class Gameboard {
  static SIZE = 10;

  constructor() {
    this.grid = new Array(Gameboard.SIZE)
      .fill(null)
      .map(() => new Array(Gameboard.SIZE).fill(null));
    this.placedShips = [];
  }

  #getCell(x, y) {
    return this.grid[y][x];
  }

  #setCell(x, y, value) {
    this.grid[y][x] = value;
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
        this.#setCell(x, y + i, ship);
      } else {
        this.#setCell(x + i, y, ship);
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
    const cell = this.#getCell(x, y);

    // these co-ordinates have already been attacked
    if (cell === 'hit' || cell === 'miss') return false;

    if (cell instanceof Ship) {
      cell.hit();
      this.#setCell(x, y, 'hit');
    } else {
      this.#setCell(x, y, 'miss');
    }
    return true;
  }

  receiveComputerAttack() {
    // AI has a 33% chance to directly attack an already damaged ship
    const targetDamaged = Math.floor(Math.random() * 3) === 1;
    if (targetDamaged) {
      const damagedShips = this.#findDamagedShips();
      if (damagedShips.length > 0) {
        return this.receiveAttack(damagedShips.pop());
      }
    }

    // otherwise, keep trying random co-ordinates until a hit / miss is registered
    let success = false;
    while (!success) {
      success = this.receiveAttack(Gameboard.#getRandomCoordinate());
    }
    return true;
  }

  #findDamagedShips() {
    const damagedShips = [];
    for (let i = 0; i < Gameboard.SIZE; i++) {
      for (let j = 0; j < Gameboard.SIZE; j++) {
        const cell = this.#getCell(i, j);
        if (cell instanceof Ship && cell.hitCount > 0) {
          damagedShips.push([i, j]);
        }
      }
    }
    return damagedShips;
  }

  // finds co-ordinates surrounding damaged ships
  #getHuntCoords() {
    const huntCoords = [];

    for (let i = 0; i < Gameboard.SIZE; i++) {
      for (let j = 0; j < Gameboard.SIZE; j++) {
        if (this.#getCell(i, j) === 'hit') {
          const adjacentCoords = [
            { x: i + 1, y: j },
            { x: i, y: j + 1 },
            { x: i - 1, y: j },
            { x: i, y: j - 1 },
          ];

          adjacentCoords.forEach((coord) => {
            const [x, y] = [coord.x, coord.y];
            if (Gameboard.#isValidCoordinate(x, y)) {
              const targetCell = this.#getCell(x, y);
              if (targetCell !== 'hit' && targetCell !== 'miss') {
                huntCoords.push({ x, y });
              }
            }
          });
        }
      }
    }

    // stop hunting the ship if all of the surrounding co-ordinates are empty
    const shipsPresent = huntCoords
      .map((coord) => this.grid[coord.y][coord.x] instanceof Ship)
      .some((isShip) => isShip === true);

    return shipsPresent ? huntCoords : [];
  }

  allShipsSunk() {
    return this.placedShips.every((ship) => ship.isSunk());
  }
}
