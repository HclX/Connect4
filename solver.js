// This is a solver for the Connect Four game. It uses the minimax algorithm to
// find the best move for the AI player. The search depth is set to customizable
// as a constructor parameter.
class Solver {
    constructor(searchDepth, player) {
        this.searchDepth = searchDepth;
        this.player = player;
    }

    // Find the best move for the current player using the minimax algorithm.
    #bestMove(game, depth, alpha, beta, maximize) {
        // If the search depth is reached or the game is over, return the score
        if (depth == 0 || game.isOver()) {
            const s = game.score(this.player);
            // console.log(`${indent}Leave bestMove, maximize: ${maximize}, score: ${s}`);
            return [s, undefined];
        }
        //const indent = '  '.repeat(this.searchDepth - depth);
        //console.log(`${indent}Entering bestMove, maximize: ${maximize}`);

        // Find the best move for the current player. The best move is the one
        // that maximizes the score for the current player and minimizes the
        // score for the opponent. The alpha-beta pruning is used to reduce the
        // number of nodes to be evaluated. 'isBetter' is a function that
        // returns true if the first argument is better than the second one.
        // The 'bestScore' and 'bestMove' variables are used to keep track of
        // the best move found so far.
        const isBetter = maximize ? (a, b) => a > b : (a, b) => a < b;
        let bestScore = maximize ? -Infinity : Infinity;
        let bestMove = undefined;

        const moves = game.possibleMoves();
        for (const m of moves) {
            //console.log(`${indent}Considering move: ${m}`);
            game.move(m);
            const [s,] = 
                this.#bestMove(game, depth - 1, alpha, beta, !maximize);
            game.undo();

            //console.log(`${indent} move: ${m} returns score: ${s}`);
            if (isBetter(s, bestScore)) {
                [bestScore, bestMove] = [s, m];
            }

            if (isBetter(s, alpha)) {
                alpha = s;
            }

            if (beta <= alpha) {
                break;
            }
        }
        //console.log(`${indent}Leaving bestMove, bestMove: ${bestMove}, bestScore: ${bestScore}`);
        return [bestScore, bestMove];
    }

    // Find the best move for the current player and make the move.
    solve() {
        const [score, move] = this.#bestMove(
            game, this.searchDepth, -Infinity, Infinity, true);
        if (move !== undefined) {
            game.move(move);
        }
    }
}
