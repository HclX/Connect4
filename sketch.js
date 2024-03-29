const GAME_WIDTH = 9;
const GAME_HEIGHT = 9;
const GRID_SIZE = 50;
const WIN_SIZE = 4;

const BORDER_WIDTH = 50;
const BORDER_HEGITH = 50;

const initMoves = [/*
    [1, 1],
    [2, 1],
    [1, 2],
    [2, 2],
    [3, 1],
    [2, 3],
*/
];

let game = new Game(GAME_WIDTH, GAME_HEIGHT, WIN_SIZE, initMoves);
let solver = new Solver(2, Color.Yellow);

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
    if (game.isOver()) {
        return;
    }

    const x = Math.floor((mouseX - BORDER_WIDTH));
    const y = Math.floor((mouseY - BORDER_HEGITH));
    const col = game.hitTest(x, y, GRID_SIZE);
    game.setFocus(col);
}

function mouseClicked() {
    if (game.isOver()) {
        return;
    }

    let x = Math.floor((mouseX - BORDER_WIDTH));
    let y = Math.floor((mouseY - BORDER_HEGITH));
    let col = game.hitTest(x, y, GRID_SIZE);
    if (col < 0) {
        return;
    }

    game.move(col);
    if (game.isOver()) {
        return;
    }

    setTimeout(() => {
        solver.solve(game);
    }, 100);
}
