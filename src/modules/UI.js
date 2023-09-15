import Game from './Game';
import Gameboard from './Gameboard';
import Ship from './Ship';

const currentGame = new Game();

export default function initialise() {
  addEventListeners();
  createDraggableShipElements();
  drawGameboards();
}

//----------------------------------------
// element selectors
//----------------------------------------
const buttonRandom = document.querySelector('.js-random-button');
const buttonRestart = document.querySelector('.js-restart-button');
const buttonRotate = document.querySelector('.js-rotate-button');
const buttonStart = document.querySelector('.js-start-button');
const containerP1 = document.getElementById('js-gameboard-container-p1');
const containerP2 = document.getElementById('js-gameboard-container-p2');
const dialog = document.querySelector('.js-dialog');
const dialogHeading = dialog.querySelector('.js-dialog__heading');
const shipPlacement = document.querySelector('.js-ship-placement');

//----------------------------------------
// event handling
//----------------------------------------
function addEventListeners() {
  dialog.addEventListener('cancel', reset);
  buttonRandom.addEventListener('click', handleRandomClick);
  buttonRestart.addEventListener('click', handleRestartClick);
  buttonRotate.addEventListener('click', handleRotateClick);
  buttonStart.addEventListener('click', handleStartClick);
}

function reset() {
  currentGame.reset();
  toggleShipPlacementView();
  createDraggableShipElements();
  drawGameboards();
}

function handleRandomClick() {
  const shipContainer = document.getElementById('js-ship-container');
  shipContainer.innerHTML = '';
  currentGame.placePlayerShipsRandomly();
  drawGameboards();
}

function handleRestartClick() {
  dialog.close();
  reset();
}

function handleRotateClick() {
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

function handleStartClick() {
  if (!currentGame.areShipsPlaced()) {
    alert('You must finish placing your ships first.');
    return;
  }
  toggleShipPlacementView();
}

function addGameboardEventListeners() {
  const computerCells = document.querySelectorAll('#js-gameboard-p2 > .js-gameboard__cell');
  const playerCells = document.querySelectorAll('#js-gameboard-p1 > .js-gameboard__cell');

  computerCells.forEach((cell) =>
    cell.addEventListener('click', (event) => handleBoardClick(event.target)),
  );

  playerCells.forEach((cell) => {
    cell.addEventListener('dragover', (event) => event.preventDefault());
    cell.addEventListener('drop', (event) => handleDrop(event));
  });
}

function handleBoardClick(element) {
  if (currentGame.playerTurn(element.dataset.x, element.dataset.y)) {
    // computer always attacks immediately after the player
    currentGame.computerTurn();
    drawGameboards();
    if (currentGame.isGameOver()) {
      announceWinner();
    }
  }
}

function handleDrop(event) {
  const data = event.dataTransfer.getData('text');
  const ship = document.getElementById(data);
  const length = Number(ship.dataset.length);
  const isVertical = ship.dataset.orientation === 'vertical';
  // calculate co-ordinates based on which part of the ship the user is clicking on,
  // to enable accurate placement
  const index = Number(ship.dataset.index);
  const x = Number(event.target.dataset.x) - (isVertical ? 0 : index);
  const y = Number(event.target.dataset.y) - (isVertical ? index : 0);

  if (currentGame.placePlayerShip(length, x, y, isVertical)) {
    ship.parentElement.removeChild(ship);
    drawGameboards();
  }
}

function addDragEventListeners(element) {
  element.addEventListener('mousedown', (event) => handleMouseDown(event.target));
  element.addEventListener('dragstart', (event) => handleDragStart(event));
}

// used to track exactly where on a ship the user clicked, so it can be placed accurately
function handleMouseDown(element) {
  const parent = element.parentNode;
  if (!parent) return;
  parent.dataset.index = element.dataset.index;
}

function handleDragStart(event) {
  event.dataTransfer.setData('text', event.target.id);
}

//----------------------------------------
// dom manipulation
//----------------------------------------
function toggleShipPlacementView() {
  const shipContainer = document.getElementById('js-ship-container');

  shipPlacement.classList.toggle('ship-placement--hidden');
  containerP2.classList.toggle('gameboard-container--hidden');
  shipContainer?.remove();
}

function createDraggableShipElements() {
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
    addDragEventListeners(ship);

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

function announceWinner() {
  if (currentGame.getWinner() === 'player') {
    dialogHeading.classList.add('dialog__heading--win');
    dialogHeading.textContent = 'You won the game!';
  } else {
    dialogHeading.classList.remove('dialog__heading--win');
    dialogHeading.textContent = 'You lost the game...';
  }
  dialog.showModal();
  buttonRestart.blur();
}

//----------------------------------------
// rendering
//----------------------------------------
function drawGameboards() {
  resetGameboardElements();
  containerP1.appendChild(createGameboardElement(currentGame.p1, 1));
  containerP2.appendChild(createGameboardElement(currentGame.p2, 2));
  addGameboardEventListeners();
}

function resetGameboardElements() {
  const p1Gameboard = document.getElementById('js-gameboard-p1');
  const p2Gameboard = document.getElementById('js-gameboard-p2');

  p1Gameboard?.remove();
  p2Gameboard?.remove();
}

function createGameboardElement(player, playerNum) {
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
