const GAME_WIDTH = 9;
const GAME_HEIGHT = 9;
const GRID_SIZE = 50;
const WIN_SIZE = 4;

const BORDER_WIDTH = 50;
const BORDER_HEGITH = 50;

let game = new Game(GAME_WIDTH, GAME_HEIGHT, WIN_SIZE);

function setup() {
    createCanvas(GAME_WIDTH * GRID_SIZE + BORDER_WIDTH * 2, GAME_HEIGHT * GRID_SIZE + BORDER_HEGITH * 2);
    frameRate(10);
}

function draw() {
    background(220);
    translate(BORDER_WIDTH, BORDER_HEGITH);
    game.draw(GRID_SIZE);
}

function mouseMoved() {
    let x = Math.floor((mouseX - BORDER_WIDTH));
    let y = Math.floor((mouseY - BORDER_HEGITH));
    let col = game.hittest(x, y, GRID_SIZE);
    game.setFocus(col);
}

function mouseClicked() {
    let x = Math.floor((mouseX - BORDER_WIDTH));
    let y = Math.floor((mouseY - BORDER_HEGITH));
    let col = game.hittest(x, y, GRID_SIZE);
    if (col != -1) {
      game.place(col);
    }
}

/*
let game = Array(GAME_WIDTH).fill('')
let turn = 'R';

function setup() {
  createCanvas(GAME_WIDTH * GRID_SIZE, GAME_HEIGHT * GRID_SIZE);
  ellipseMode(CORNER);
  frameRate(10);
  console.log(game);
}

function draw() {
  background(220);
  stroke(0);
  for (let col = 0; col < game.length; col++) {
    for (let row = 0; row < GAME_HEIGHT; row++) {
      noFill();
      rect(col * GRID_SIZE, (GAME_HEIGHT - row - 1) * GRID_SIZE, GRID_SIZE, GRID_SIZE)

      if (game[col][row] === 'R') {
        fill('red');
      } else if (game[col][row] === 'Y') {
        fill('yellow');
      }
      ellipse(col * GRID_SIZE, (GAME_HEIGHT - row - 1) * GRID_SIZE, GRID_SIZE)
    }
  }

  let col = Math.floor(mouseX / GRID_SIZE);
  if (col < GAME_WIDTH) {
    console.log(`Highlighting ${col}`);
    noFill();
    stroke(turn === 'R' ? 'red' : 'yellow');
    rect(col * GRID_SIZE, 0, GRID_SIZE, GRID_SIZE * GAME_HEIGHT);
  }
}

function mouseClicked() {
  let col = Math.floor(mouseX / GRID_SIZE)
  if (game[col].length < GAME_HEIGHT) {
    game[col] += turn;
    turn = turn === 'R' ? 'Y' : 'R';

    checkWin({col, row: game[col].length - 1});
  } else {
    console.log(`Invalid ${col}`);
  }
}

function checkWinDir(pos, dir) {
  let {col, row} = pos;
  let {col:colDir, row:rowDir} = dir;
  let turn = game[col][row];

  let count = 0;
  while (game[col] && game[col][row] === turn) {
    col += colDir;
    row += rowDir;
    count ++;
  }

  col = pos.col;
  row = pos.row;
  while (game[col][row] === turn) {
    col -= colDir;
    row -= rowDir;
    count ++;
  }

  console.log(`Count: ${count}, pos: ${pos.col}, ${pos.row}, dir: ${dir.col}, ${dir.row}, turn: ${turn}`);

  return count === WIN_SIZE;
}

function checkWin(pos) {
  const dirs = [
    {col: 1, row: 0},
    {col: 0, row: 1},
    {col: 1, row: 1},
    {col: 1, row: -1},
  ];

  return dirs.map(dir => checkWinDir(pos, dir)).reduce((a, b) => a || b, false);
}*/
