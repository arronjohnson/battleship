import Game from './Game';
import Gameboard from './Gameboard';

export default class UI {
  static initialise() {
    UI.registerEvents();
    UI.drawBoards(new Game());
  }

  static #createBoard(player, playerNum) {
    const div = document.createElement('div');
    div.classList = `gameboard gameboard--p${playerNum}`;
    div.id = `js-gameboard-p${playerNum}`;

    // draw 10x10 grid
    for (let i = 0; i < Gameboard.SIZE; i++) {
      for (let j = 0; j < Gameboard.SIZE; j++) {
        const cell = document.createElement('div');
        cell.classList = 'gameboard__cell js-gameboard__cell';
        cell.dataset.x = j;
        cell.dataset.y = i;

        // add classes to differentiate cell states, i.e. hit, miss
        const gridValue = player.gameboard.grid[i][j];
        if (gridValue) {
          if (gridValue === 'hit' || gridValue === 'miss')
            cell.classList.add(`gameboard__cell--${gridValue}`);
          else if (player.name === 'player') {
            // only reveal the player's ship locations
            cell.classList.add('gameboard__cell--ship');
          }
        }
        div.append(cell);
      }
    }
    return div;
  }

  static #resetBoards() {
    const p1Gameboard = document.getElementById('js-gameboard-p1');
    const p2Gameboard = document.getElementById('js-gameboard-p2');

    p1Gameboard?.remove();
    p2Gameboard?.remove();
  }

  static #handleBoardClick = (element, game) => {
    if (game.playerTurn(element.dataset.x, element.dataset.y)) {
      // computer always attacks immediately after the player
      game.computerTurn();
      UI.drawBoards(game);
      if (game.isGameOver()) {
        UI.#announceWinner(game);
      }
    }
  };

  static #registerBoardEvents(game) {
    const computerBoard = document.getElementById('js-gameboard-p2');
    const computerCells = computerBoard.querySelectorAll('.js-gameboard__cell');

    computerCells.forEach((cell) =>
      cell.addEventListener('click', (event) => UI.#handleBoardClick(event.target, game)),
    );
  }

  static drawBoards(game) {
    const p1Container = document.getElementById('js-gameboard-container-p1');
    const p2Container = document.getElementById('js-gameboard-container-p2');

    UI.#resetBoards();
    p1Container.appendChild(UI.#createBoard(game.p1, 1));
    p2Container.appendChild(UI.#createBoard(game.p2, 2));
    UI.#registerBoardEvents(game);
  }

  static #announceWinner(game) {
    const dialog = document.querySelector('.js-dialog');
    const winMessage = dialog.querySelector('.js-dialog__heading');
    const restartBtn = dialog.querySelector('.js-restart-button');

    if (game.getWinner() === 'player') {
      winMessage.classList.add('dialog__heading--win');
      winMessage.textContent = 'You won the game!';
    } else {
      winMessage.classList.remove('dialog__heading--win');
      winMessage.textContent = 'You lost the game...';
    }
    dialog.showModal();
    restartBtn.blur();
  }

  static #handleRestartClick() {
    const dialog = document.querySelector('.js-dialog');

    dialog.close();
    UI.drawBoards(new Game());
  }

  static registerEvents() {
    const dialog = document.querySelector('.js-dialog');
    const restartBtn = dialog.querySelector('.js-restart-button');

    dialog.addEventListener('cancel', () => UI.drawBoards(new Game()));
    restartBtn.addEventListener('click', UI.#handleRestartClick);
  }
}
