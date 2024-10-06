"use strict";

(() => {
    window.addEventListener("load", () => {
        // *****************************************************************************
        // #region Constants and Variables

        // Canvas references
        const canvas = document.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        // UI references
        const restartButton = document.querySelector("#restart");
        const undoButton = document.querySelector('#undo');
        const currentPlayerText = document.querySelector('#current-player');

        // Constants
        const CELLS_PER_AXIS = 3; // 3x3 grid
        const CELL_WIDTH = canvas.width / CELLS_PER_AXIS;
        const CELL_HEIGHT = canvas.height / CELLS_PER_AXIS;

        // Game variables
        let grid; // 2D array to hold the game state
        let currentPlayer = "X"; // Current player (X or O)
        let history = []; // History of moves for undo functionality
        let needsRender = false; // Flag to check if rendering is needed

        // #endregion

        // *****************************************************************************
        // #region Game Logic

        function startGame() {
            grid = Array.from({ length: CELLS_PER_AXIS }, () => Array(CELLS_PER_AXIS).fill(null));
            currentPlayer = "X"; // Reset to Player 1
            history = []; // Reset history
            needsRender = true; // Set render flag to true
            render(); // Initial render
        }

        function render() {
            // Clear the canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw the grid
            for (let i = 0; i < CELLS_PER_AXIS; i++) {
                for (let j = 0; j < CELLS_PER_AXIS; j++) {
                    ctx.strokeRect(j * CELL_WIDTH, i * CELL_HEIGHT, CELL_WIDTH, CELL_HEIGHT);
                    if (grid[i][j] !== null) {
                        ctx.fillText(grid[i][j], j * CELL_WIDTH + CELL_WIDTH / 2, i * CELL_HEIGHT + CELL_HEIGHT / 2);
                    }
                }
            }
            currentPlayerText.textContent = currentPlayer;
        }

        function updateGridAt(mousePositionX, mousePositionY) {
            const row = Math.floor(mousePositionY / CELL_HEIGHT);
            const column = Math.floor(mousePositionX / CELL_WIDTH);

            if (grid[row][column] === null) { // Only update if cell is empty
                grid[row][column] = currentPlayer;
                history.push({ row, column, player: currentPlayer }); // Save move for undo
                switchPlayer(); // Switch to the next player
                needsRender = true; // Set render flag to true
            }
        }

        function switchPlayer() {
            currentPlayer = currentPlayer === "X" ? "O" : "X"; // Toggle between X and O
        }

        function restart() {
            startGame();
        }
        function undoLastMove() {

            if (history.length > 0) {
                const lastMove = history.pop(); // Get the last move
                grid[lastMove.row][lastMove.column] = null; // Reset the corresponding cell
                switchPlayer(); // Switch back to the previous player
                render();
            }
        }
        // #endregion

        // *****************************************************************************
        // #region Event Listeners

        canvas.addEventListener("mousedown", (event) => {
            const mouseX = event.offsetX;
            const mouseY = event.offsetY;
            updateGridAt(mouseX, mouseY); // Update grid based on mouse position

            // Call render if needed
            if (needsRender) {
                render(); // Call render only once
                needsRender = false; // Reset the flag
            }
        });

        restartButton.addEventListener("mousedown", restart);
        undoButton.addEventListener("mousedown", undoLastMove);

        // #endregion

        // Start game
        startGame();
    });
})();
