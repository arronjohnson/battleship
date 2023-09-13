import Player from '../modules/Player';

jest.mock('../modules/Gameboard');

let computer;
let player;

beforeEach(() => {
  computer = new Player('computer');
  player = new Player('player');
});

test('name', () => expect(player.name).toBe('player'));

describe('turns', () => {
  beforeEach(() => player.startTurn());

  test('startTurn', () => expect(player.isTurn).toBe(true));

  test('endTurn', () => {
    player.endTurn();
    expect(player.isTurn).toBe(false);
  });
});

describe('attacking', () => {
  beforeEach(() => player.startTurn());

  test("not player's turn", () => {
    expect(computer.attack(player, [0, 0])).toBe(false);
  });

  test('receiveAttack called', () => {
    player.attack(computer, [0, 0]);
    expect(computer.gameboard.receiveAttack).toHaveBeenCalledWith([0, 0]);
  });

  test('receiveRandomAttack called', () => {
    player.attackRandom(computer);
    expect(computer.gameboard.receiveRandomAttack).toHaveBeenCalled();
  });
});
