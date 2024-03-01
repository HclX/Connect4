// This is a solver for the Connect Four game. It uses the minimax algorithm to
// find the best move for the AI player. The search depth is set to customizable
// as a constructor parameter.
class Solver {
    constructor(searchDepth) {
        this.searchDepth = searchDepth;
    }

    // Find the best move for the current player using the minimax algorithm.
    #bestMove(game, depth, alpha, beta, doMaxmize) {
        // If the search depth is reached or the game is over, return the score
        if (depth == 0 || game.winner()) {
            return [game.score(), undefined];
        }
        
        // Find the best move for the current player. The best move is the one
        // that maximizes the score for the current player and minimizes the
        // score for the opponent. The alpha-beta pruning is used to reduce the
        // number of nodes to be evaluated. 'isBetter' is a function that
        // returns true if the first argument is better than the second one.
        // The 'bestScore' and 'bestMove' variables are used to keep track of
        // the best move found so far.
        const isBetter = doMaxmize ? (a, b) => a > b : (a, b) => a < b;
        let bestScore = doMaxmize ? -Infinity : Infinity;
        let bestMove = undefined;

        const possibleMoves = game.possibleMoves();
        for (const col of possibleMoves) {
            const valid = game.move(col);
            console.assert(valid, `Invalid move: ${col}`);
            const [score,] = this.bestMove(
                game, depth - 1, alpha, beta, !doMaxmize);
            game.undo();

            if (isBetter(score, bestScore)) {
                [bestScore, bestMove] = [score, col];
            }

            if (isBetter(score, alpha)) {
                alpha = score;
            }

            if (beta <= alpha) {
                break;
            }
        }
        return [bestScore, bestMove];
    }

    // Find the best move for the current player and make the move.
    solve(game) {
        const [, col] = this.#bestMove(
            game, this.searchDepth, -Infinity, Infinity, true);
        if (col !== undefined) {
            game.move(col);
        }
    }
}
