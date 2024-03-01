const Players = {
    Border: 'border',
    Red : 'red',
    Yellow : 'yellow'
};

const Directions = {
    Up: [0, 1],
    Right: [1, 0],
    UpRight: [1, 1],
    DownRight: [1, -1]
};

class Game {
    constructor(width, height, winSize) {
        this.width = width;
        this.height = height;
        this.winSize = winSize;

        this.history = [];
        this.focus = -1;
        this.curPlayer = Players.Red;
        this.prevPlayer = Players.Yellow;

        // For convenience, we add a border around the game board. The border
        // will be filled with Players.Border. This way, we don't need to check
        // for the boundaries when checking for winning sequences.
        // Available cells are from (1, 1) to (width, height), and filled with
        // null by default.
        this.data = new Array(this.width + 2);
        for (let col = 0; col < this.width + 2; col ++) {
            this.data[col] = new Array(this.height + 2);
            if (col == 0 || col == this.width + 1) {
                this.data[col].fill(Players.Border);
            } else {
                this.data[col][0] = Players.Border;
                this.data[col].fill(null, 1, this.height + 1);
                this.data[col][this.height + 1] = Players.Border;
            }
        }

        // this.stats always contains the latest game state. It's updated after
        // each move. It contains the following fields:
        // - Red: {score, segments}
        // - Yellow: {score, segments}
        // - winner: undefined or Players.Red or Players.Yellow
        // - winSeq: undefined or {end: {row, col}, dir, length}
        this.stats = this.#check();
    }

    // Check for winning sequences in the given direction. The stats object is
    // updated with the new scores and segments. It also updates the winner
    // field if a winning sequence is found.
    #checkDir(stats, col, row, dir) {
        let p = this.data[col][row];
        let length = 1;
        let ends = 0;

        while (p != Players.Border) {
            col += dir[0];
            row += dir[1];
            if (this.data[col][row] == p) {
                length ++;
                continue;
            }

            let pp = p;
            p = this.data[col][row];
            if (!pp) {
                length = 1;
                ends = 1;
                continue;
            }

            if (!p) {
                ends ++;
            }

            if (length >= this.winSize) {
                // We found a winning sequence. We update the stats object and
                // give a really high score to the winner.
                stats[pp].score = Infinity;
                stats.winner = pp;
                stats.winSeq = {
                    start: {
                        row: row - dir[1] * (length + 1),
                        col: col - dir[0] * (length + 1),
                    },
                    dir: dir,
                    length: length,
                }
            } else {
                // We found a sequence but it's not long enough to win. We give
                // the sequence a score based on its length and the number of
                // available ends.
                let score = Math.pow(10, length) * ends;
                stats[pp].score += score;
                if (score > 0) {
                    // We only add the segment to the stats if it's not a dead
                    // sequence (i.e. score == 0).
                    stats[pp].segments.push({
                        start: {
                            row: row - dir[1] * (length + 1),
                            col: col - dir[0] * (length + 1),
                        },
                        dir: dir,
                        length: length,
                        ends: ends,
                        score: score
                    });
                }
            }

            length = 1;
            ends = 0;
        }
    }

    // Check for winning sequences in all directions. The stats object is
    // updated with the new scores and segments. It also updates the winner
    // field if a winning sequence is found.
    #check() {
        let stats = {
            [Players.Red]: {
                score: 0,
                segments: []
            },
            [Players.Yellow]: {
                score: 0,
                segments: []
            },
            winner: undefined,
            winSeq: undefined,
        }

        for (let col = 1; col <= this.width; col ++) {
            this.#checkDir(stats, col, 1, Directions.Up);
            this.#checkDir(stats, col, 1, Directions.UpRight);
            this.#checkDir(stats, col, this.height, Directions.DownRight);
        }

        for (let row = 1; row <= this.height; row ++) {
            this.#checkDir(stats, 1, row, Directions.Right);
            if (row > 1) {
                this.#checkDir(stats, 1, row, Directions.UpRight);
            }
            if (row < this.height) {
                this.#checkDir(stats, 1, row, Directions.DownRight);
            }
        }

        return stats;
    }

    score() {
        return this.stats[Players.Yellow].score - this.stats[Players.Red].score;
    }

    winner() {
        return this.stats.winner;
    }

    // Set the focus to the given column. The focus is used to highlight the
    // possible move for the current player.
    setFocus(col) {
        this.focus = col;
    }

    // Get the list of possible moves for the current player.
    possibleMoves() {
        const moves = Array.from({length: this.width}, (_, i) => i + 1)
            .filter(col => !this.data[col][this.height]);
        return moves;
    }

    // Make a move at the given column. If the move is valid, the game state is
    // updated and the method returns true. Otherwise, it returns false.
    move(col) {
        const row = this.data[col].indexOf(null);
        if (row == -1) {
            return false;
        }

        this.data[col][row] = this.curPlayer;
        this.history.push([col, row]);
        this.stats = this.#check();
        [this.curPlayer, this.prevPlayer] = [this.prevPlayer, this.curPlayer];
        return true;
    }

    // Undo the last move. If the game state is updated, the method returns
    // true. Otherwise, it returns false.
    undo() {
        if (this.history.length == 0) {
            return false;
        }

        const [col, row] = this.history.pop();
        console.assert(
            this.data[col][row] == this.prevPlayer,
            `Invalid undo at column ${col}`);

        this.data[col][row] = null;
        this.stats = this.#check();

        [this.curPlayer, this.prevPlayer] = [this.prevPlayer, this.curPlayer];
        return true;
    }

    // Get the column at the given position. If the position is outside the
    // game board, the method returns -1.
    hitTest(x, y, gridSize) {
        let col = Math.floor(x / gridSize) + 1;
        if (col < 1 || col > this.width) {
            return -1;
        }
        return col;
    }

    // Draw the game board. The method draws the grid, the pieces, the focus and
    // the winner.
    draw(gridSize) {
        rectMode(CENTER);
        ellipseMode(CENTER);
        stroke(0);

        // Draw the grid and the pieces.
        for (let col = 1; col <= this.width; col ++) {
            for (let row = 1; row <= this.height; row ++) {
                const x = (col - 1) * gridSize + gridSize / 2;
                const y = (this.height - row) * gridSize + gridSize / 2;

                noFill();
                rect(x, y, gridSize);

                if (this.data[col][row]) {
                    fill(this.data[col][row]);
                }
                ellipse(x, y, gridSize);
            }
        }

        // Draw the winner and the focus.
        if (this.stats.winner) {
            // Draw the winning sequence.
            let {start: {col, row}, dir, length} =
                this.stats.winSeq;

            fill(0);
            for (let i = 0; i < length; i ++) {
                col += dir[0];
                row += dir[1];
                const x = (col - 1) * gridSize + gridSize / 2;
                const y = (this.height - row) * gridSize + gridSize / 2;
                ellipse(x, y, gridSize / 4);
            }

            // Draw the winner message.
            const x = this.width * gridSize / 2;
            const y = this.height * gridSize + gridSize / 2;
            textAlign(CENTER, CENTER);
            stroke(this.stats.winner);
            fill(this.stats.winner);
            textSize(32);
            text('Winner', x, y);
            return;
        }

        if (this.history.length > 0) {
            // Draw the last move.
            const [col, row] = this.history.slice(-1)[0];
            const x = (col - 1) * gridSize + gridSize / 2;
            const y = (this.height - row) * gridSize + gridSize / 2;
            fill(0);
            ellipse(x, y, gridSize / 4);
        }

        if (this.focus == -1 ||
            this.data[this.focus][this.height]) {
            return;
        }

        // Draw the focus.
        const row = this.data[this.focus].indexOf(null);
        const x = (this.focus - 1) * gridSize + gridSize / 2;
        const y = (this.height - row) * gridSize + gridSize / 2;
        fill(this.curPlayer);
        ellipse(x, y, gridSize / 2);
    }
}
