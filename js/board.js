'use strict';

function createBoard(rows, cols) {
    var board = [];
    for (var i = 0; i < rows; i++) {
        board[i] = [];
        for (var j = 0; j < cols; j++) {
            board[i][j] = {};
            if (i === 0 || j === 0 || i === rows - 1 || j === cols - 1) {
                board[i][j].element = null;
                if (i === Math.ceil((rows - 2) / 2) && (j === 0 || j === gGame.cols - 1)) {
                    board[i][j].type = FLOOR;
                } else {
                    board[i][j].type = WALL;
                }
            } else {
                board[i][j].type = FLOOR;
                board[i][j].element = (Math.random() < 0.05) ? CHERRIES : DOT;
            }
        }
    }
    createInsideWalls(board);
    return board;
}

function createInsideWalls(board) {
    areaFill(board, 2, 2, 3, 3, WALL);
    areaFill(board, 6, 0, 1, 2, WALL);
    areaFill(board, 8, 0, 1, 2, WALL);
    areaFill(board, 6, 3, 3, 2, WALL);
    areaFill(board, 10, 2, 3, 3, WALL);
    areaFill(board, 1, 6, 1, 9, WALL);
    areaFill(board, 3, 6, 1, 9, WALL);

    areaFill(board, 5, 6, 5, 8, null);
    areaFill(board, 5, 6, 1, 3, WALL);
    areaFill(board, 5, 12, 1, 3, WALL);
    areaFill(board, 5, 6, 6, 1, WALL);
    areaFill(board, 5, 14, 6, 1, WALL);
    areaFill(board, 10, 6, 1, 9, WALL);

    areaFill(board, 12, 6, 1, 9, WALL);
    areaFill(board, 2, 16, 3, 3, WALL);
    areaFill(board, 6, 16, 3, 2, WALL);
    areaFill(board, 10, 16, 3, 3, WALL);
    areaFill(board, 6, 19, 1, 2, WALL);
    areaFill(board, 8, 19, 1, 2, WALL);
}

function areaFill(board, startRow, startCol, rows, cols, type, element) {
    for (var i = startRow; i < startRow + rows; i++) {
        for (var j = startCol; j < startCol + cols; j++) {
            board[i][j].type = (type) ? type : null;
            board[i][j].element = (element) ? element : null;
        }
    }
}

function countFruit(board) {
    var count = 0;
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            var cell = board[i][j];
            if (cell.element === DOT || cell.element === CHERRIES) count++;
        }
    }
    return count;
}

function renderBoard(board, game) {
    game.height = (game.character.size + game.shift * 2) * game.rows + game.shift;
    game.width = (game.character.size + game.shift * 2) * game.cols + game.shift;
    game.cell.height = (1 / game.rows * game.height);
    game.cell.width = (1 / game.cols * game.width);
    var strHTML = ``;
    for (var i = 0; i < board.length; i++) {
        strHTML += `<tr style="height:${game.cell.height}px">`;
        for (var j = 0; j < board[i].length; j++) {
            var tdId = `cell-${i}-${j}`;
            var cell = board[i][j];
            switch (cell.type) {
                case FLOOR:
                    if (i === gPacman.i && j === gPacman.j) {
                        strHTML += `<td style="width:${game.cell.width}px" id="${tdId}"></td>`;
                    } else {
                        strHTML += `<td style="width:${game.cell.width}px" id="${tdId}">${(cell.element) ? cell.element : ''}</td>`;
                    }
                    break;
                case WALL:
                    strHTML += `<td class="${WALL}" style="width:${game.cell.width}px" id="${tdId}"></td>`;
                    break;
                default:
                    strHTML += `<td style="width:${game.cell.width}px" id="${tdId}"></td>`;
            }
        }
        strHTML += `</tr>`;
    }
    var elGame = document.querySelector('.game');
    elGame.style = `height:${game.height}px;width:${game.width}px`;
    var elBoard = document.querySelector('.board');
    elBoard.style = `height:${game.height}px;width:${game.width}px`;
    elBoard.innerHTML = strHTML;
    var elScore = document.querySelector('.score');
    elScore.style = `height:${game.cell.height / 2 - 2}px;width:${game.cell.height * 4}px;font-size:${game.cell.height / 2 - 4}px`;
}
