import Gameboard from './Gameboard';
import Ship from './Ship';

export default class UI {
  static initialise(game) {
    UI.#registerEvents(game);
    UI.#createDraggableShips();
    UI.#drawBoards(game);
  }

  static #reset(game) {
    game.reset();
    UI.#toggleShipPlacement();
    UI.#createDraggableShips();
    UI.#drawBoards(game);
  }

  static #handleRestartClick(game) {
    const dialog = document.querySelector('.js-dialog');

    dialog.close();
    UI.#reset(game);
  }

  static #handleRotateClick() {
    const shipContainer = document.getElementById('js-ship-container');
    const ships = shipContainer.querySelectorAll('.js-ship');

    shipContainer.classList.toggle('ship-container--horizontal');
    ships.forEach((ship) => {
      ship.classList.toggle('ship--horizontal');
      // orientation data attribute is used during drop events
      const { orientation } = ship.dataset;
      ship.dataset.orientation = orientation === 'vertical' ? 'horizontal' : 'vertical';
    });
  }

  static #handleRandomClick(game) {
    const shipContainer = document.getElementById('js-ship-container');
    shipContainer.innerHTML = '';
    // make sure the board is empty or we'll end up with more than 5 ships
    game.p1.resetBoard();
    game.p1.gameboard.placeShipsRandomly();
    UI.#drawBoards(game);
  }

  static #toggleShipPlacement() {
    const p2Container = document.getElementById('js-gameboard-container-p2');
    const shipPlacement = document.querySelector('.js-ship-placement');
    const shipContainer = document.getElementById('js-ship-container');

    shipPlacement.classList.toggle('ship-placement--hidden');
    p2Container.classList.toggle('gameboard-container--hidden');
    shipContainer?.remove();
  }

  // run once to register initial events when the game loads
  static #registerEvents(game) {
    const dialog = document.querySelector('.js-dialog');
    const randomBtn = document.querySelector('.js-random-button');
    const restartBtn = document.querySelector('.js-restart-button');
    const rotateBtn = document.querySelector('.js-rotate-button');
    const startBtn = document.querySelector('.js-start-button');

    dialog.addEventListener('cancel', () => UI.#reset(game));
    randomBtn.addEventListener('click', () => UI.#handleRandomClick(game));
    restartBtn.addEventListener('click', () => UI.#handleRestartClick(game));
    rotateBtn.addEventListener('click', UI.#handleRotateClick);

    startBtn.addEventListener('click', () => {
      if (!game.areShipsPlaced()) return;
      UI.#toggleShipPlacement();
    });
  }

  // used to track exactly where on the ship the user clicked,
  // so it can be placed on the grid correctly
  static #updateDraggedIndex(element) {
    const parent = element.parentNode;
    if (!parent) return;
    parent.dataset.index = element.dataset.index;
  }

  static #handleDragStart(event) {
    event.dataTransfer.setData('text', event.target.id);
  }

  static #createDraggableShips() {
    const shipPlacement = document.querySelector('.js-ship-placement');
    const shipContainer = document.createElement('div');
    shipContainer.classList = 'ship-container';
    shipContainer.id = 'js-ship-container';

    const ships = Object.entries(Ship.SIZES);
    for (let i = 0; i < ships.length; i++) {
      const [name, length] = ships[i];
      const ship = document.createElement('div');
      ship.classList = `ship ship--${name} js-ship`;
      ship.id = `js-ship-${name}`;
      ship.dataset.index = 0;
      ship.dataset.length = length;
      ship.dataset.orientation = 'vertical';
      ship.setAttribute('draggable', true);
      ship.addEventListener('mousedown', (event) => UI.#updateDraggedIndex(event.target));
      ship.addEventListener('dragstart', (event) => UI.#handleDragStart(event));

      for (let j = 0; j < length; j++) {
        const cell = document.createElement('div');
        cell.classList = 'ship__cell';
        cell.dataset.index = j;
        ship.appendChild(cell);
      }
      shipContainer.appendChild(ship);
    }
    shipPlacement.appendChild(shipContainer);
  }

  static #handleDrop(event, game) {
    const data = event.dataTransfer.getData('text');
    const ship = document.getElementById(data);
    const { length, index, orientation } = ship.dataset;
    const isVertical = orientation === 'vertical';
    const x = Number(event.target.dataset.x) - (isVertical ? 0 : index);
    const y = Number(event.target.dataset.y) - (isVertical ? index : 0);

    if (game.p1.gameboard.placeShip(Number(length), [x, y], isVertical)) {
      ship.parentElement.removeChild(ship);
      UI.#drawBoards(game);
    }
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

  static #handleBoardClick = (element, game) => {
    if (game.playerTurn(element.dataset.x, element.dataset.y)) {
      // computer always attacks immediately after the player
      game.computerTurn();
      UI.#drawBoards(game);
      if (game.isGameOver()) {
        UI.#announceWinner(game);
      }
    }
  };

  static #registerBoardEvents(game) {
    const playerBoard = document.getElementById('js-gameboard-p1');
    const playerCells = playerBoard.querySelectorAll('.js-gameboard__cell');

    playerCells.forEach((cell) => {
      cell.addEventListener('dragover', (event) => event.preventDefault());
      cell.addEventListener('drop', (event) => UI.#handleDrop(event, game));
    });

    const computerBoard = document.getElementById('js-gameboard-p2');
    const computerCells = computerBoard.querySelectorAll('.js-gameboard__cell');

    computerCells.forEach((cell) =>
      cell.addEventListener('click', (event) => UI.#handleBoardClick(event.target, game)),
    );
  }

  static #resetBoards() {
    const p1Gameboard = document.getElementById('js-gameboard-p1');
    const p2Gameboard = document.getElementById('js-gameboard-p2');

    p1Gameboard?.remove();
    p2Gameboard?.remove();
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

  static #drawBoards(game) {
    const p1Container = document.getElementById('js-gameboard-container-p1');
    const p2Container = document.getElementById('js-gameboard-container-p2');

    UI.#resetBoards();
    p1Container.appendChild(UI.#createBoard(game.p1, 1));
    p2Container.appendChild(UI.#createBoard(game.p2, 2));
    UI.#registerBoardEvents(game);
  }
}
