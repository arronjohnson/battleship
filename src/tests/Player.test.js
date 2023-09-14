import Gameboard from '../modules/Gameboard';
import Player from '../modules/Player';

jest.mock('../modules/Gameboard');

let p1;

beforeEach(() => (p1 = new Player('player')));

test('create new player', () => {
  expect(p1.name).toBe('player');
  expect(Gameboard).toHaveBeenCalled();
});
