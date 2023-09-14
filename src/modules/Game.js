import Player from './Player';

export default class Game {
  constructor() {
    this.p1 = new Player('player');
    this.p2 = new Player('computer');
    this.p1.gameboard.placeShipsRandomly();
    this.p2.gameboard.placeShipsRandomly();
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
    return this.p1.gameboard.receiveRandomAttack();
  }
}
