const pipeDefinitions = {
  '|': { 0: ['top', 'bottom'], 90: ['left', 'right'] },
  '-': { 0: ['left', 'right'], 90: ['top', 'bottom'] },
  '┌': { 0: ['right', 'bottom'], 90: ['bottom', 'left'], 180: ['left', 'top'], 270: ['top', 'right'] },
  '┐': { 0: ['left', 'bottom'], 90: ['bottom', 'right'], 180: ['right', 'top'], 270: ['top', 'left'] },
  '└': { 0: ['top', 'right'], 90: ['right', 'bottom'], 180: ['bottom', 'left'], 270: ['left', 'top'] },
  '┘': { 0: ['top', 'left'], 90: ['left', 'bottom'], 180: ['bottom', 'right'], 270: ['right', 'top'] },
  '+': { 0: ['top', 'right', 'bottom', 'left'] }
};

// Solvable level preset
const presetPuzzle = [
  ['┌', '-', '-', '┐'],
  ['|', '+', '+', '|'],
  ['|', '+', '+', '|'],
  ['└', '-', '-', '┘']
];

const grid = document.getElementById('grid');

let timerInterval = null;
let seconds = 0;
let currentLevel = 1;

// Example: You can add more puzzles to this array for more levels
const puzzles = [
  // Level 1 (easy)
  [
    ['┌', '-', '-', '┐'],
    ['|', '+', '+', '|'],
    ['|', '+', '+', '|'],
    ['└', '-', '-', '┘']
  ],
  // Level 2 (easy-medium)
  [
    ['┌', '-', '┐', '|'],
    ['|', '+', '|', '|'],
    ['|', '+', '+', '|'],
    ['└', '-', '-', '┘']
  ],
  // Level 3 (medium)
  [
    ['┌', '-', '-', '┐'],
    ['|', '+', '-', '┘'],
    ['|', '|', '+', '|'],
    ['└', '-', '+', '┘']
  ],
  // Level 4 (medium-hard)
  [
    ['┌', '-', '+', '┐'],
    ['|', '+', '|', '|'],
    ['|', '-', '+', '|'],
    ['└', '+', '-', '┘']
  ],
  // Level 5 (hard)
  [
    ['┌', '-', '+', '┐'],
    ['|', '+', '|', '┘'],
    ['+', '-', '+', '|'],
    ['└', '+', '-', '┘']
  ],
  // Level 6 (hard, with dead ends)
  [
    ['┌', '-', '-', '┐'],
    ['|', '+', '┘', '|'],
    ['|', '┌', '+', '|'],
    ['└', '-', '+', '┘']
  ],
  // Level 7 (hard, more intersections)
  [
    ['┌', '+', '-', '┐'],
    ['|', '+', '+', '|'],
    ['+', '-', '+', '|'],
    ['└', '+', '-', '┘']
  ],
  // Level 8 (very hard, multiple branches)
  [
    ['┌', '-', '+', '┐'],
    ['|', '+', '|', '+'],
    ['+', '-', '+', '|'],
    ['└', '+', '-', '┘']
  ]
];

function createGrid() {
  grid.innerHTML = '';
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const tile = document.createElement('div');
      tile.classList.add('tile');
      tile.dataset.row = row;
      tile.dataset.col = col;
      tile.dataset.rotation = '0';
      const type = presetPuzzle[row][col];
      tile.dataset.type = type;
      tile.textContent = type;

      tile.addEventListener('click', () => {
        let currentRotation = parseInt(tile.dataset.rotation);
        let newRotation = (currentRotation + 90) % 360;
        tile.style.transform = `rotate(${newRotation}deg)`;
        tile.dataset.rotation = newRotation;
        checkPath();
      });

      grid.appendChild(tile);
    }
  }
}

function startTimer() {
  clearInterval(timerInterval);
  seconds = 0;
  const timerDisplay = document.getElementById('timer');
  timerDisplay.textContent = "00:00";
  timerInterval = setInterval(() => {
    seconds++;
    const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    timerDisplay.textContent = `${mins}:${secs}`;
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function loadPuzzle(level) {
  // Use modulo to loop puzzles if out of bounds
  const puzzle = puzzles[(level - 1) % puzzles.length];
  grid.innerHTML = '';
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const tile = document.createElement('div');
      tile.classList.add('tile');
      tile.dataset.row = row;
      tile.dataset.col = col;
      tile.dataset.rotation = '0';
      const type = puzzle[row][col];
      tile.dataset.type = type;
      tile.textContent = type;

      tile.addEventListener('click', () => {
        let currentRotation = parseInt(tile.dataset.rotation);
        let newRotation = (currentRotation + 90) % 360;
        tile.style.transform = `rotate(${newRotation}deg)`;
        tile.dataset.rotation = newRotation;
        checkPath();
      });

      grid.appendChild(tile);
    }
  }
  // Update level display if present
  const levelBtn = document.querySelector('.level-btn');
  if (levelBtn) levelBtn.textContent = `Level ${level}`;
}

function checkPath() {
  const visited = {};
  const stack = [{ row: 0, col: 0, from: null }];

  while (stack.length) {
    const { row, col, from } = stack.pop();
    const key = `${row},${col}`;
    if (visited[key]) continue;
    visited[key] = true;

    const tile = document.querySelector(`[data-row='${row}'][data-col='${col}']`);
    if (!tile) continue;

    const type = tile.dataset.type;
    const rotation = parseInt(tile.dataset.rotation);
    const directions = pipeDefinitions[type]?.[rotation] || pipeDefinitions[type]?.[0] || [];

    if (from && !directions.includes(from)) continue;

    if (row === 3 && col === 3) {
      stopTimer();
      setTimeout(() => {
        alert('💧 Water received!');
        currentLevel++;
        loadPuzzle(currentLevel);
        startTimer();
      }, 100);
      return;
    }

    directions.forEach(dir => {
      let nextRow = row;
      let nextCol = col;
      let backDir;

      if (dir === 'top') { nextRow--; backDir = 'bottom'; }
      if (dir === 'bottom') { nextRow++; backDir = 'top'; }
      if (dir === 'left') { nextCol--; backDir = 'right'; }
      if (dir === 'right') { nextCol++; backDir = 'left'; }

      if (nextRow >= 0 && nextRow < 4 && nextCol >= 0 && nextCol < 4) {
        stack.push({ row: nextRow, col: nextCol, from: backDir });
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.querySelector('.menu-btn');
  const menuDropdown = document.querySelector('.menu-dropdown');

  if (menuBtn && menuDropdown) {
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      menuDropdown.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
      if (!menuDropdown.contains(e.target) && !menuBtn.contains(e.target)) {
        menuDropdown.classList.remove('show');
      }
    });
  }

  setTimeout(() => {
    alert('Start game!');
    currentLevel = 1;
    loadPuzzle(currentLevel);
    startTimer();
  }, 100);
});
