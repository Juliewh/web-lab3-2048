"use strict";

const BOARD_SIZE = 4;
const TOTAL_CELLS = BOARD_SIZE * BOARD_SIZE;

const gameBoardElement = document.querySelector("#game-board");
const scoreElement = document.querySelector("#score");
const undoButton = document.querySelector("#undo-button");
const mobileControlsElement = document.querySelector("#mobile-controls");
const gameOverModal = document.querySelector("#game-over-modal");
const gameOverMessage = document.querySelector("#game-over-message");
const recordNameInput = document.querySelector("#record-name");
const board = Array(TOTAL_CELLS).fill(0);
const cells = [];

let score = 0;
let previousState = null;
let isGameOver = false;

const keyDirections = {
  ArrowUp: "up",
  ArrowRight: "right",
  ArrowDown: "down",
  ArrowLeft: "left",
};

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

function renderScore() {
  scoreElement.textContent = String(score);
}

function updateUndoButton() {
  undoButton.disabled = isGameOver || previousState === null;
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
    return false;
  }

  const randomIndex = getRandomInteger(0, emptyCellIndexes.length - 1);
  const cellIndex = emptyCellIndexes[randomIndex];

  board[cellIndex] = Math.random() < 0.9 ? 2 : 4;
  return true;
}

function addRandomTilesAfterMove() {
  const tileCount = getRandomInteger(1, 2);

  for (let index = 0; index < tileCount; index += 1) {
    if (!addRandomTile()) {
      break;
    }
  }
}

function startNewGame() {
  board.fill(0);
  score = 0;
  previousState = null;
  isGameOver = false;

  gameOverModal.hidden = true;
  mobileControlsElement.hidden = false;
  recordNameInput.value = "";
  gameOverMessage.textContent = "Введите имя, чтобы сохранить результат.";

  const initialTileCount = getRandomInteger(1, 3);

  for (let index = 0; index < initialTileCount; index += 1) {
    addRandomTile();
  }

  renderBoard();
  renderScore();
  updateUndoButton();
}

function getLineIndexes(direction, lineIndex) {
  const indexes = [];

  for (let offset = 0; offset < BOARD_SIZE; offset += 1) {
    let row;
    let column;

    if (direction === "left") {
      row = lineIndex;
      column = offset;
    } else if (direction === "right") {
      row = lineIndex;
      column = BOARD_SIZE - 1 - offset;
    } else if (direction === "up") {
      row = offset;
      column = lineIndex;
    } else if (direction === "down") {
      row = BOARD_SIZE - 1 - offset;
      column = lineIndex;
    } else {
      return [];
    }

    indexes.push(row * BOARD_SIZE + column);
  }

  return indexes;
}

function mergeLine(values) {
  const mergedValues = [];
  let scoreGained = 0;

  for (const value of values) {
    if (value === 0) {
      continue;
    }

    const lastIndex = mergedValues.length - 1;

    if (lastIndex < 0 || mergedValues[lastIndex] !== value) {
      mergedValues.push(value);
      continue;
    }

    const mergedValue = value * 2;
    mergedValues[lastIndex] = mergedValue;
    scoreGained += mergedValue;

    while (mergedValues.length > 1) {
      const rightIndex = mergedValues.length - 1;
      const leftIndex = rightIndex - 1;

      if (mergedValues[leftIndex] !== mergedValues[rightIndex]) {
        break;
      }

      const chainedValue = mergedValues[rightIndex] * 2;
      mergedValues[leftIndex] = chainedValue;
      mergedValues.pop();
      scoreGained += chainedValue;
    }
  }

  while (mergedValues.length < BOARD_SIZE) {
    mergedValues.push(0);
  }

  return {
    values: mergedValues,
    scoreGained,
  };
}

function hasAvailableMoves() {
  if (board.includes(0)) {
    return true;
  }

  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let column = 0; column < BOARD_SIZE; column += 1) {
      const index = row * BOARD_SIZE + column;
      const value = board[index];

      if (
        column + 1 < BOARD_SIZE &&
        value === board[index + 1]
      ) {
        return true;
      }

      if (
        row + 1 < BOARD_SIZE &&
        value === board[index + BOARD_SIZE]
      ) {
        return true;
      }
    }
  }

  return false;
}

function finishGame() {
  isGameOver = true;
  previousState = null;
  gameOverMessage.textContent =
    "Ходов больше нет. Введите имя, чтобы сохранить результат.";
  gameOverModal.hidden = false;
  mobileControlsElement.hidden = true;
  updateUndoButton();
}

function move(direction) {
  if (isGameOver) {
    return;
  }

  const nextBoard = board.slice();
  let scoreGained = 0;

  for (let lineIndex = 0; lineIndex < BOARD_SIZE; lineIndex += 1) {
    const indexes = getLineIndexes(direction, lineIndex);
    const line = indexes.map((index) => board[index]);
    const result = mergeLine(line);

    result.values.forEach((value, position) => {
      nextBoard[indexes[position]] = value;
    });

    scoreGained += result.scoreGained;
  }

  const boardChanged = nextBoard.some(
    (value, index) => value !== board[index]
  );

  if (!boardChanged) {
    return;
  }

  const stateBeforeMove = {
    board: board.slice(),
    score,
  };

  nextBoard.forEach((value, index) => {
    board[index] = value;
  });

  score += scoreGained;
  addRandomTilesAfterMove();

  if (hasAvailableMoves()) {
    previousState = stateBeforeMove;
    updateUndoButton();
  } else {
    finishGame();
  }

  renderBoard();
  renderScore();
}

function undoMove() {
  if (isGameOver || previousState === null) {
    return;
  }

  previousState.board.forEach((value, index) => {
    board[index] = value;
  });

  score = previousState.score;
  previousState = null;

  renderBoard();
  renderScore();
  updateUndoButton();
}

document.addEventListener("keydown", (event) => {
  if (isGameOver || event.target instanceof HTMLInputElement) {
    return;
  }

  const direction = keyDirections[event.key];

  if (!direction) {
    return;
  }

  event.preventDefault();
  move(direction);
});

mobileControlsElement.querySelectorAll("[data-direction]").forEach((button) => {
  button.addEventListener("click", () => {
    move(button.dataset.direction);
  });
});

undoButton.addEventListener("click", undoMove);

document
  .querySelector("#restart-button")
  .addEventListener("click", startNewGame);

document
  .querySelector("#game-over-restart-button")
  .addEventListener("click", startNewGame);

mobileControlsElement.hidden = false;

createBoard();
startNewGame();