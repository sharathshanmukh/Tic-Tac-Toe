document.addEventListener('DOMContentLoaded', () => {
    // Game elements
    const board = document.getElementById('board');
    const cells = document.querySelectorAll('.cell');
    const status = document.getElementById('status');
    const resetBtn = document.getElementById('reset-btn');
    const vsPlayerBtn = document.getElementById('vs-player');
    const vsComputerBtn = document.getElementById('vs-computer');

    // Game state
    let gameActive = true;
    let currentPlayer = 'x';
    let gameState = ['', '', '', '', '', '', '', '', ''];
    let vsComputer = false;

    // Winning combinations
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    // Messages
    const playerXMessage = "HUMAN X's TURN";
    const playerOMessage = "HUMAN O's TURN";
    const computerMessage = "MACHINE CALCULATING...";
    const winMessage = (player) => `${player === 'x' ? 'HUMAN' : vsComputer ? 'MACHINE' : 'HUMAN'} ${player.toUpperCase()} DOMINATES`;
    const drawMessage = "SIMULATION DEADLOCKED";

    // Mode selection
    vsPlayerBtn.addEventListener('click', () => {
        if (vsComputer) {
            vsComputer = false;
            vsComputerBtn.classList.remove('active');
            vsPlayerBtn.classList.add('active');
            resetGame();
        }
    });

    vsComputerBtn.addEventListener('click', () => {
        if (!vsComputer) {
            vsComputer = true;
            vsPlayerBtn.classList.remove('active');
            vsComputerBtn.classList.add('active');
            resetGame();
        }
    });

    // Cell click handler
    const handleCellClick = (e) => {
        const clickedCell = e.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

        // Ignore if cell is already filled or game is not active
        if (gameState[clickedCellIndex] !== '' || !gameActive) {
            return;
        }

        // Process the move
        handleCellPlayed(clickedCell, clickedCellIndex);
        checkResult();

        // If game is still active and vsComputer mode, let AI make a move
        if (gameActive && vsComputer && currentPlayer === 'o') {
            setTimeout(() => {
                status.textContent = computerMessage;
                setTimeout(() => {
                    makeComputerMove();
                    checkResult();
                }, 800);
            }, 300);
        }
    };

    // Update cell and game state after a move
    const handleCellPlayed = (cell, index) => {
        gameState[index] = currentPlayer;
        cell.classList.add(currentPlayer);
        switchPlayer();
    };

    // Switch player turn
    const switchPlayer = () => {
        currentPlayer = currentPlayer === 'x' ? 'o' : 'x';
        status.textContent = currentPlayer === 'x' ? playerXMessage : 
                            (vsComputer ? computerMessage : playerOMessage);
    };

    // Check if the game has a winner or is a draw
    const checkResult = () => {
        let roundWon = false;
        let winningLine = null;

        // Check if there's a winning combination
        for (let i = 0; i < winningCombinations.length; i++) {
            const [a, b, c] = winningCombinations[i];
            
            if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
                roundWon = true;
                winningLine = [a, b, c];
                break;
            }
        }

        // Handle game end (win or draw)
        if (roundWon) {
            const winner = gameState[winningLine[0]];
            status.textContent = winMessage(winner);
            gameActive = false;
            
            // Highlight the winning cells
            winningLine.forEach(index => {
                cells[index].classList.add('win');
            });
            
            return;
        }

        // Check for draw
        if (!gameState.includes('')) {
            status.textContent = drawMessage;
            gameActive = false;
            return;
        }
    };

    // Reset the game to its initial state
    const resetGame = () => {
        gameActive = true;
        currentPlayer = 'x';
        gameState = ['', '', '', '', '', '', '', '', ''];
        status.textContent = playerXMessage;
        
        // Clear the board
        cells.forEach(cell => {
            cell.classList.remove('x', 'o', 'win');
        });
    };

    // Computer move logic (minimax algorithm with some randomness for easier gameplay)
    const makeComputerMove = () => {
        // Occasionally make a random move (30% chance) to make the AI beatable
        if (Math.random() < 0.3) {
            const emptyCells = gameState.reduce((acc, val, idx) => {
                if (val === '') acc.push(idx);
                return acc;
            }, []);
            
            if (emptyCells.length > 0) {
                const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
                handleCellPlayed(cells[randomIndex], randomIndex);
                return;
            }
        }
        
        // Otherwise, make the best move
        let bestScore = -Infinity;
        let bestMove;
        
        for (let i = 0; i < gameState.length; i++) {
            if (gameState[i] === '') {
                gameState[i] = 'o';
                let score = minimax(gameState, 0, false);
                gameState[i] = '';
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }
        
        handleCellPlayed(cells[bestMove], bestMove);
    };

    // Minimax algorithm for AI decision making
    const minimax = (board, depth, isMaximizing) => {
        // Terminal states
        const result = checkWinner();
        if (result !== null) {
            return result === 'o' ? 1 : result === 'x' ? -1 : 0;
        }
        
        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < board.length; i++) {
                if (board[i] === '') {
                    board[i] = 'o';
                    let score = minimax(board, depth + 1, false);
                    board[i] = '';
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < board.length; i++) {
                if (board[i] === '') {
                    board[i] = 'x';
                    let score = minimax(board, depth + 1, true);
                    board[i] = '';
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    };

    // Helper function for minimax
    const checkWinner = () => {
        for (let i = 0; i < winningCombinations.length; i++) {
            const [a, b, c] = winningCombinations[i];
            if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
                return gameState[a];
            }
        }
        
        if (!gameState.includes('')) return 'draw';
        return null;
    };

    // Event listeners
    cells.forEach(cell => cell.addEventListener('click', handleCellClick));
    resetBtn.addEventListener('click', resetGame);
}); 