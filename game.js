const Color = {
    Border: 'border',
    Red : 'red',
    Yellow : 'yellow'
};

const Direction = {
    Up: [0, 1],
    Right: [1, 0],
    UpRight: [1, 1],
    DownRight: [1, -1]
};

class Game {
    constructor(width, height, winSize, initMoves = []) {
        this.width = width;
        this.height = height;
        this.winSize = winSize;

        this.history = [];
        this.focus = -1;
        this.curPlayer = Color.Red;
        this.prevPlayer = Color.Yellow;

        // this.stats always contains the latest game state. It's automatically
        // updated after each move or undo.
        this.stats = {
            over: false,
            winner: undefined,
            winSeq: undefined,
            possibleMoves: undefined,
        };

        // For convenience, we add a border around the game board. The border
        // will be filled with Color.Border. This way, we don't need to check
        // for the boundaries when checking for winning sequences.
        // Available cells are from (1, 1) to (width, height), and filled with
        // null by default.
        this.data = new Array(this.width + 2);
        for (let col = 0; col < this.width + 2; col ++) {
            this.data[col] = new Array(this.height + 2);
            if (col == 0 || col == this.width + 1) {
                this.data[col].fill(Color.Border);
            } else {
                this.data[col][0] = Color.Border;
                this.data[col].fill(null, 1, this.height + 1);
                this.data[col][this.height + 1] = Color.Border;
            }
        }

        // Initialize the game with the given moves. This is useful for testing
        // a specific starting position.
        for (let [col, row] of initMoves) {
            this.move(col);
        }
    }

    // Check for winning sequences from a starting point. The method returns the
    // winning sequence if found, otherwise it returns undefined.
    #checkWinningSequence(col, row) {
        let p = this.data[col][row];
        for (let dir of Object.values(Direction)) {
            let length = 0;
            let [delta_col, delta_row] = dir;

            // Count the length of the sequence in the given direction.
            let [c, r] = [col, row];
            while (this.data[c][r] == p) {
                c += delta_col;
                r += delta_row;
                length ++;
            }

            // Count the length of the sequence in the opposite direction.
            [c, r] = [col - delta_col, row - delta_row];
            while (this.data[c][r] == p) {
                c -= delta_col;
                r -= delta_row;
                length ++;
            }

            if (length >= this.winSize) {
                return {
                    // The starting point of the winning sequence is off by one
                    // when the loop ends so we need to adjust it back.
                    start: {
                        col: c + delta_col,
                        row: r + delta_row
                    },
                    dir: dir,
                    length: length,
                }
            }
        }
    }

    // This method returns a list of possible moves based current game status.
    #checkPossibleMoves() {
        const moves = Array.from({length: this.width}, (_, i) => i + 1)
            .filter(col => !this.data[col][this.height]);
        return moves;
    }

    // Check the game state after a move is made. The method returns a stats
    // object cached by the game object. The stats object contains the following
    // fields:
    // - over: true if the game is over
    // - winner: the winning player, undefined if the game is not over or is a
    //   draw
    // - winSeq: the winning sequence, undefined if there is no winner
    // - possibleMoves: the list of possible moves for the current player
    #checkStats(col, row) {
        let stats = {
            over: false,
            winner: undefined,
            winSeq: undefined,
            possibleMoves: undefined,
        };

        if (this.data[col][row]) {
            // When the [col, row] is not empty, this means player just did a
            // move so we need to search for winning sequence and possible moves.
            stats.winSeq = this.#checkWinningSequence(col, row);
            if (stats.winSeq) {
                stats.over = true;
                stats.winner = this.data[col][row];
            }
         }

         if (!this.over) {
            // if the game is not over yet (means we didn't find winning
            // sequence in the above code, we look for possible moves and cache
            // it here.
            stats.possibleMoves = this.#checkPossibleMoves();
            if (stats.possibleMoves.length == 0) {
                // Well if we run into this, we have a draw and the game is
                // considered over.
                stats.over = true;
            }
        }

        return stats;
    }

    // Check for winning sequences in the given direction. The stats object is
    // updated with the new scores and segments. It also updates the winner
    // field if a winning sequence is found.
    #calcScorePerDir(scores, col, row, dir) {
        let p = this.data[col][row];
        let length = 1;
        let ends = 0;

        while (p != Color.Border) {
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

            // A non-wining sequence will get score based on its length and
            // number of available ends; For winning sequence, we give it 10
            // times full score as if both ends are available.
            if (length >= this.winSize) {
                ends = 10;
            }
            const score = Math.pow(10, length) * ends;

            // For debugging purpose, we keep all the sequences found in stats
            if (score > 0) {
                const sequence = {
                    start: {
                        row: row - dir[1] * (length + 1),
                        col: col - dir[0] * (length + 1),
                    },
                    dir: dir,
                    length: length,
                    ends: ends,
                    score: score
                };
                scores[pp].segments.push(sequence);
            }
            scores[pp].score += score;
            length = 1;
            ends = 0;
        }
    }

    // Check for winning sequences in all directions. The stats object is
    // updated with the new scores and segments. It also updates the winner
    // field if a winning sequence is found.
    #calcScore() {
        let scores = {
            [Color.Red]: {
                score: 0,
                segments: []
            },
            [Color.Yellow]: {
                score: 0,
                segments: []
            },
        }

        for (let col = 1; col <= this.width; col ++) {
            this.#calcScorePerDir(scores, col, 1, Direction.Up);
            this.#calcScorePerDir(scores, col, 1, Direction.UpRight);
            this.#calcScorePerDir(scores, col, this.height, Direction.DownRight);
        }

        for (let row = 1; row <= this.height; row ++) {
            this.#calcScorePerDir(scores, 1, row, Direction.Right);
            if (row > 1) {
                this.#calcScorePerDir(scores, 1, row, Direction.UpRight);
            }
            if (row < this.height) {
                this.#calcScorePerDir(scores, 1, row, Direction.DownRight);
            }
        }

        return scores;
    }

    // This method returns the score for the given player. The score is lazily
    // calculated and cached in the stats object for performance reason. This
    // value is used for AI to decide the best move.
    score(player) {
        if (!this.stats.scores) {
            this.stats.scores = this.#calcScore();
        }
        let other = 
            (player == Color.Red) ? Color.Yellow : Color.Red;

        return this.stats.scores[player].score - this.stats.scores[other].score;
    }

    // Get the list of possible moves for the current player.
    possibleMoves() {
        return this.stats.possibleMoves;
    }

    // Check if the game is over.
    isOver() {
        return this.stats.over;
    }

    // Get the winner of the game. If the game is not over or is a draw, the
    // method returns undefined.
    winner() {
        return this.stats.winner;
    }

    // Set the focus to the given column. The focus is used to highlight the
    // possible move for the current player.
    setFocus(col) {
        this.focus = col;
    }

    // Get the list of possible moves for the current player.

    // Make a move at the given column. If the move is valid, the game state is
    // updated and the method returns true. Otherwise, it returns false.
    move(col) {
        const row = this.data[col].indexOf(null);
        console.assert(row != -1, `Invalid move at column ${col}`)
        console.assert(this.data[col][row] == null, `Invalid move at column ${col}`)

        this.data[col][row] = this.curPlayer;
        this.history.push([col, row]);
        this.stats = this.#checkStats(col, row);
        [this.curPlayer, this.prevPlayer] = [this.prevPlayer, this.curPlayer];
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
        this.stats = this.#checkStats(col, row);

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
        if (this.stats.over) {
            let msg;
            if (this.stats.winner) {
                // Draw the winning sequence.
                let {start: {col, row}, dir, length} =
                    this.stats.winSeq;

                fill(0);
                for (let i = 0; i < length; i ++) {
                    const x = (col - 1) * gridSize + gridSize / 2;
                    const y = (this.height - row) * gridSize + gridSize / 2;
                    col += dir[0];
                    row += dir[1];
                    ellipse(x, y, gridSize / 4);
                }

                stroke(this.stats.winner);
                fill(this.stats.winner);
                msg = `Winner: ${this.stats.winner}`;
            } else {
                stroke('black');
                fill('black');
                msg = "It's a tie!";
            }

            // Draw the message message.
            const x = this.width * gridSize / 2;
            const y = this.height * gridSize + gridSize / 2;
            textAlign(CENTER, CENTER);
            textSize(gridSize / 2);
            text(msg, x, y);
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
