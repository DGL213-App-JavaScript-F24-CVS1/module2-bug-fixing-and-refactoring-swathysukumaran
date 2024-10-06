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
        const rotateButton = document.querySelector('#rotate');
        const colorSelectButtons = document.querySelectorAll(".color-select");
        const playerScoreText = document.querySelector('#score-text');

        // Constants
        const CELL_COLORS = {
            white: [255, 255, 255],
            black: [0, 0, 0],
            red: [255, 0, 0],
            green: [0, 255, 0],
            blue: [0, 0, 255]
        }
        const CELLS_PER_AXIS = 9;
        const CELL_WIDTH = canvas.width / CELLS_PER_AXIS;
        const CELL_HEIGHT = canvas.height / CELLS_PER_AXIS;
        const MAXIMUM_SCORE = CELLS_PER_AXIS * CELLS_PER_AXIS;;

        // Game objects
        let replacementColor = CELL_COLORS.white;
        let grids;
        let playerScore = MAXIMUM_SCORE;
        let needsRender = false; // Flag to check if rendering is needed

        // #endregion


        // *****************************************************************************
        // #region Game Logic

        function startGame(startingGrid = []) {
            if (startingGrid.length === 0) {
                startingGrid = initializeGrid();
            }
            initializeHistory(startingGrid);
            render(grids[0]);
        }

        function initializeGrid() {
            const newGrid = [];
            for (let i = 0; i < CELLS_PER_AXIS * CELLS_PER_AXIS; i++) {
                newGrid.push(chooseRandomPropertyFrom(CELL_COLORS));
            }
            return newGrid;
        }

        function initializeHistory(startingGrid) {
            grids = [];
            grids.push(startingGrid);
        }

        function rollBackHistory() {
            if (grids.length > 0) {
                grids = grids.slice(0, grids.length - 1);
                render(grids[grids.length - 1]);
            }
        }

        function transposeGrid() {
            for (let i = 0; i < grids.length; i++) {
                const currentGrid = grids[i];
                for (let j = 0; j < currentGrid.length; j++) {
                    const currentGridRow = Math.floor(j / CELLS_PER_AXIS);
                    const currentGridColumn = j % CELLS_PER_AXIS;
                    if (currentGridColumn >= currentGridRow) {
                        const tempCellStorage = currentGrid[j];
                        currentGrid[j] = currentGrid[currentGridColumn * CELLS_PER_AXIS + currentGridRow];
                        currentGrid[currentGridColumn * CELLS_PER_AXIS + currentGridRow] = tempCellStorage;
                    }
                }
                grids[i] = currentGrid;
            }
            render(grids[grids.length - 1]);
        }

        function render(grid) {
            for (let i = 0; i < grid.length; i++) {
                ctx.fillStyle = `rgb(${grid[i][0]}, ${grid[i][1]}, ${grid[i][2]})`;
                ctx.fillRect((i % CELLS_PER_AXIS) * CELL_WIDTH, Math.floor(i / CELLS_PER_AXIS) * CELL_HEIGHT, CELL_WIDTH, CELL_HEIGHT);
            }
            playerScoreText.textContent = playerScore;
        }

        function updateGridAt(mousePositionX, mousePositionY) {
            const gridCoordinates = convertCartesiansToGrid(mousePositionX, mousePositionY);
            const newGrid = grids[grids.length - 1].slice();
            const originalColor = newGrid[gridCoordinates.row * CELLS_PER_AXIS + gridCoordinates.column];
            floodFill(newGrid, gridCoordinates, originalColor);
            if (!arraysAreEqual(originalColor, replacementColor)) { // Only render if the color is different
                grids.push(newGrid);
                needsRender = true; // Set render flag to true
            }
        }



        function floodFill(grid, gridCoordinate, colorToChange) {
            console.log("colorToChange:", colorToChange);
            console.log("replacementColor:", replacementColor);
            if (arraysAreEqual(colorToChange, replacementColor)) { return } //The current cell is already the selected color
            else if (!arraysAreEqual(grid[gridCoordinate.row * CELLS_PER_AXIS + gridCoordinate.column], colorToChange)) { return }  //The current cell is a different color than the initially clicked-on cell
            else {
                grid[gridCoordinate.row * CELLS_PER_AXIS + gridCoordinate.column] = replacementColor;
                playerScore = playerScore > 0 ? playerScore - 1 : 0;
                playerScoreText.textContent = playerScore;
                floodFill(grid, { column: Math.max(gridCoordinate.column - 1, 0), row: gridCoordinate.row }, colorToChange);
                floodFill(grid, { column: Math.min(gridCoordinate.column + 1, CELLS_PER_AXIS - 1), row: gridCoordinate.row }, colorToChange);
                floodFill(grid, { column: gridCoordinate.column, row: Math.max(gridCoordinate.row - 1, 0) }, colorToChange);
                floodFill(grid, { column: gridCoordinate.column, row: Math.min(gridCoordinate.row + 1, CELLS_PER_AXIS - 1) }, colorToChange);
            }
            return
        }

        function restart() {
            startGame(grids[0]);
        }

        // #endregion


        // *****************************************************************************
        // #region Event Listeners


        canvas.addEventListener("mousedown", gridClickHandler);
        function gridClickHandler(event) {
            updateGridAt(event.offsetX, event.offsetY); // This triggers floodFill, where the score is now updated
        }


        restartButton.addEventListener("mousedown", restartClickHandler);
        function restartClickHandler() {
            restart();
        }

        undoButton.addEventListener("mousedown", undoLastMove);
        function undoLastMove() {
            rollBackHistory();
        }

        rotateButton.addEventListener("mousedown", rotateGrid);
        function rotateGrid() {
            transposeGrid();
        }

        colorSelectButtons.forEach(button => {
            button.addEventListener("mousedown", () => replacementColor = CELL_COLORS[button.name])
        });

        // #endregion


        // *****************************************************************************
        // #region Helper Functions

        // To convert canvas coordinates to grid coordinates
        function convertCartesiansToGrid(xPos, yPos) {
            return {
                column: Math.floor(xPos / CELL_WIDTH),
                row: Math.floor(yPos / CELL_HEIGHT)
            };
        }

        // To choose a random property from a given object
        function chooseRandomPropertyFrom(object) {
            const keys = Object.keys(object);
            return object[keys[Math.floor(keys.length * Math.random())]]; //Truncates to integer
        };

        // To compare two arrays
        function arraysAreEqual(arr1, arr2) {
            if (arr1.length != arr2.length) { return false }
            else {
                for (let i = 0; i < arr1.length; i++) {
                    if (arr1[i] != arr2[i]) {
                        return false;
                    }
                }
                return true;
            }
        }

        // #endregion

        //Start game
        startGame();

    });
})();