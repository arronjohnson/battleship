import Gameboard from './Gameboard';

export default class Player {
  constructor(name) {
    this.name = name;
    this.gameboard = new Gameboard();
    this.isTurn = false;
  }

  startTurn() {
    this.isTurn = true;
  }

  endTurn() {
    this.isTurn = false;
  }

  attack(player, [x, y]) {
    if (!this.isTurn) return false;
    return player.gameboard.receiveAttack([x, y]);
  }

  attackRandom(player) {
    if (!this.isTurn) return false;
    return player.gameboard.receiveRandomAttack();
  }
}
