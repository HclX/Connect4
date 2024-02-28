const Players = {
    Border: 'border',
    None: 'none',
    Red : 'red',
    Yellow : 'yellow'
};

class Game {
    constructor(width, height) {
        this.width = width;
        this.height = height;

        this.data = new Array(this.width + 2);
        for (let col = 0; col < this.width + 2; col ++) {
            this.data[col] = Array.from({length: this.height + 2}, () => Players.Border);
            if (col >= 1 && col <= this.width) {
                for (let row = 1; row <= this.height; row ++) {
                    this.data[col][row] = Players.None;
                }
            }
        }

        this.scores = {};
        this.scores[Players.Red] = {
            score : 0,
            segments: []
        };
        this.scores[Players.Yellow] = {
            score : 0,
            segments: []
        };

        this.focus = -1;
        this.player = Players.Red;
    }

    setFocus(col) {
        this.focus = col;
    }

    place(col) {
        for (let row = 1; row <= this.height; row ++) {
            if (this.data[col][row] === Players.None) {
                this.data[col][row] = this.player;

                if (this.player == Players.Red) {
                    this.player = Players.Yellow;
                } else {
                    this.player = Players.Red;
                }

                return true;
            }
        }
        return false;
    }

    undo(col) {
        for (let row = this.height; row >= 1; row --) {
            if (this.data[col][row] != Players.None) {
                this.data[col][row] = Players.None;

                if (this.player == Players.Red) {
                    this.player = Players.Yellow;
                } else {
                    this.player = Players.Red;
                }
            }

            return true;
        }

        return false;
    }

    evalDir(col, row, dir) {
        let p = this.data[col][row];
        let length = 0;
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
            if (p != Players.None) {
                length = 1;
                ends = 1;
                continue;
            }

            if (p == Players.None) {
                ends ++;
            }

            // calc sequence score
            let score = Math.pow(10, length) * ends;
            this.scores[pp].score += score;
            this.scores[pp].segments.append({
                row: row,
                col: col,
                length: length,
                ends: ends,
                score: score
            });

            length = 0;
            ends = 0;
        }
    }

    eval() {
        const dirs = [
            [0, 1],
            [1, 1],
            [1, 0],
            [1, -1]
        ];

        this.scores[Players.Red] = {
            score : 0,
            segments: []
        };
        this.scores[Players.Yellow] = {
            score : 0,
            segments: []
        };

        for (let dir = 0; dir < 4; dir ++) {
            for (let row = 1; row <= this.height; row ++) {
                this.evalDir(1, row, dirs[dir]);
            }
        }
    }

    draw(gridSize) {
        rectMode(CENTER);
        ellipseMode(CENTER);
        for (let col = 1; col <= this.width; col ++) {
            for (let row = 1; row <= this.height; row ++) {
                let x = (col - 1) * gridSize + gridSize / 2;
                let y = (this.height - row) * gridSize + gridSize / 2;

                noFill();
                rect(x, y, gridSize);

                if (this.data[col][row] != Players.None) {
                    fill(this.data[col][row]);
                }
                ellipse(x, y, gridSize);
            }
        }

        if (this.focus != -1) {
            for (let row = 1; row <= this.height; row ++) {
                if (this.data[this.focus][row] == Players.None) {
                    let x = (this.focus - 1) * gridSize + gridSize / 2;
                    let y = (this.height - row) * gridSize + gridSize / 2;
                    fill(this.player);
                    ellipse(x, y, gridSize / 2);
                    break;
                }
            }
        }
    }

    hittest(x, y, gridSize) {
        let col = Math.floor(x / gridSize) + 1;
        if (col < 1 || col > this.width) {
            return -1;
        }
        return col;
    }
}
/*
class Solver {
    constructor() {

    }

    solve(game, depth) {
        if (depth == 0) {
            let scores = [];
            for (let col = 1; col <= game.width; col ++) {
                game.place(col);
                scores.push([col, game.eval()]);
                game.undo(col);

            }

            return Math.max(scores);
        }
    }

    solve(game, depth) {
        scores = [];
        for (let col = 1; col <= game.width; col ++) {
            scores.append([col, solve(game, depth - 1)]);
        }

    }



    solve(game, depth, nodeIndex, isMax, scores) {
        if (depth == 0) {
            return scores[nodeIndex];
        }

        if (isMax) {
            return Math.max(
                solve(game, depth - 1, nodeIndex * 2, false, scores)
            )
        }
    }

    int minimax(int depth, int nodeIndex, bool isMax,
        int scores[], int h)
{
// Terminating condition. i.e
// leaf node is reached
if (depth == h)
    return scores[nodeIndex];

//  If current move is maximizer,
// find the maximum attainable
// value
if (isMax)
   return max(minimax(depth+1, nodeIndex*2, false, scores, h),
        minimax(depth+1, nodeIndex*2 + 1, false, scores, h));

// Else (If current move is Minimizer), find the minimum
// attainable value
else
    return min(minimax(depth+1, nodeIndex*2, true, scores, h),
        minimax(depth+1, nodeIndex*2 + 1, true, scores, h));
}
*/