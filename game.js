"use strict";

const BOARD_SIZE = 4;
const TOTAL_CELLS = BOARD_SIZE * BOARD_SIZE;

const gameBoardElement = document.querySelector("#game-board");
const board = Array(TOTAL_CELLS).fill(0);
const cells = [];

function createBoard() {
  const fragment = document.createDocumentFragment();

  for (let index = 0; index < TOTAL_CELLS; index += 1) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.setAttribute("role", "gridcell");
    cells.push(cell);
    fragment.appendChild(cell);
  }

  gameBoardElement.replaceChildren(fragment);
}

function renderBoard() {
  board.forEach((value, index) => {
    const cell = cells[index];

    if (value === 0) {
      cell.className = "cell cell-empty";
      cell.textContent = "";
      cell.setAttribute("aria-label", "Пустая клетка");
      return;
    }

    cell.className = `cell tile tile-${value}`;
    cell.textContent = String(value);
    cell.setAttribute("aria-label", `Плитка ${value}`);
  });
}

function getRandomInteger(minimum, maximum) {
  return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
}

function addRandomTile() {
  const emptyCellIndexes = [];

  board.forEach((value, index) => {
    if (value === 0) {
      emptyCellIndexes.push(index);
    }
  });

  if (emptyCellIndexes.length === 0) {
    return;
  }

  const randomIndex = getRandomInteger(0, emptyCellIndexes.length - 1);
  const cellIndex = emptyCellIndexes[randomIndex];

  board[cellIndex] = Math.random() < 0.9 ? 2 : 4;
}

function startNewGame() {
  board.fill(0);

  const initialTileCount = getRandomInteger(1, 3);

  for (let index = 0; index < initialTileCount; index += 1) {
    addRandomTile();
  }

  renderBoard();
}

createBoard();
startNewGame();