import Player from './Player';

export default class Game {
  constructor() {
    this.p1 = new Player('player');
    this.p2 = new Player('computer');
    this.p2.gameboard.placeShipsRandomly();
  }

  placePlayerShip(length, x, y, isVertical) {
    return this.p1.gameboard.placeShip(length, [x, y], isVertical);
  }

  placePlayerShipsRandomly() {
    this.p1.resetBoard();
    this.p1.gameboard.placeShipsRandomly();
  }

  areShipsPlaced() {
    return this.p1.gameboard.placedShips.length === 5;
  }

  isGameOver() {
    return this.p1.gameboard.allShipsSunk() || this.p2.gameboard.allShipsSunk();
  }

  getWinner() {
    return this.p2.gameboard.allShipsSunk() ? 'player' : 'computer';
  }

  playerTurn(x, y) {
    return this.p2.gameboard.receiveAttack([x, y]);
  }

  computerTurn() {
    return this.p1.gameboard.receiveComputerAttack();
  }

  reset() {
    this.p1.resetBoard();
    this.p2.resetBoard();
    this.p2.gameboard.placeShipsRandomly();
  }
}
