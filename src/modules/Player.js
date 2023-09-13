import Gameboard from './Gameboard';

export default class Player {
  constructor(name) {
    this.name = name;
    this.gameboard = new Gameboard();
  }

  static attack(player, [x, y]) {
    return player.gameboard.receiveAttack([x, y]);
  }

  static attackRandom(player) {
    return player.gameboard.receiveRandomAttack();
  }
}
