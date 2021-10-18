'use strict';

function createPacman(i = 1, j = 1) {
    return {
        size: gGame.character.size,
        i: i,
        j: j,
        direction: null,
        position: {
            top: null,
            left: null,
        },
        opacity: 1,
        speed: gGame.speed,
        interval: null,
        score: 0,
        hunter: {
            duration: 5000,
            timeout: null,
        },
        isLocked: false,
        isCanJump: true,
        isAlive: true,
    }
}

function renderPacman(pacman) {
    pacman.position = getPixelPosition(pacman.i, pacman.j);
    var elPacman = document.querySelector('.pacman');
    elPacman.style = `
        top:${pacman.position.top}px;
        left:${pacman.position.left}px;
        height:${pacman.size}px;
        width:${pacman.size}px;
        opacity:${pacman.opacity};
        transition:top ${pacman.speed / 1000}s linear, left ${pacman.speed / 1000}s linear;
        transform:rotate(0deg);
        opacity:1;
        display:initial;
        `;
}

function movePacman(pacman, game) {
    if (!pacman.isAlive) return;
    if (!checkMove(pacman) || !pacman.direction) {
        clearInterval(pacman.interval);
        return;
    }
    var elPacman = document.querySelector('.pacman');
    if (pacman.j > -1 && pacman.j < game.cols && pacman.i > -1 && pacman.i < game.rows) {
        elPacman.style.opacity = pacman.opacity;
        pacman.isLocked = false;
    }
    switch (pacman.direction) {
        case 'ArrowDown':
            pacman.i++;
            elPacman.style.transform = 'rotate(90deg)';
            break;
        case 'ArrowUp':
            pacman.i--;
            elPacman.style.transform = 'rotate(-90deg)';
            break;
        case 'ArrowRight':
            if (pacman.j === game.cols - 1) {
                pacman.isLocked = true;
                elPacman.style.opacity = 0;
                pacman.j = -2;
            } else {
                pacman.j++;
            }
            elPacman.style.transform = 'rotateY(0deg)';
            break;
        case 'ArrowLeft':
            if (pacman.j === 0) {
                pacman.isLocked = true;
                elPacman.style.opacity = 0;
                pacman.j = game.cols + 1;
            } else {
                pacman.j--;
            }
            elPacman.style.transform = 'rotateY(180deg)';
            break;
    }
    if (pacman.next && pacman.i === pacman.next.i && pacman.j === pacman.next.j) {
        pacman.direction = pacman.next.direction;
        pacman.next = null;
    }
    pacman.position = getPixelPosition(pacman.i, pacman.j);
    elPacman.style.top = pacman.position.top + 'px';
    elPacman.style.left = pacman.position.left + 'px';
    checkConflict(pacman);
    eatPiece(pacman);
}

function eatPiece(pacman, board = gBoard, game = gGame) {
    var i = pacman.i;
    var j = pacman.j;
    if (!pacman.isAlive || i < 0 || j < 0 || i >= game.rows || j >= game.cols) return;
    var elCell = document.querySelector(`#cell-${i}-${j}`);
    var cell = board[i][j];
    switch (cell.element) {
        case DOT:
            playAudio('sound/chomp.wav');
            pacman.score += game.score.default;
            game.count--;
            break;
        case CHERRIES:
            playAudio('sound/fruit.wav');
            setAsHunter(pacman);
            pacman.score += game.score.cherries;
            game.count--;
            break;
    }
    if (!game.count) gameComplete();
    if (elCell) {
        var elScore = document.querySelector('.score span');
        elScore.innerText = gPacman.score;
        board[i][j].element = null;
        setTimeout(function () {
            elCell.innerText = '';
        }, pacman.speed);
    }
}

function setAsHunter(pacman) {
    clearTimeout(pacman.hunter.timeout);
    for (var i = 0; i < gGhosts.length; i++) {
        var ghost = gGhosts[i];
        var elGhost = document.querySelector(`.ghost${ghost.id}`);
        elGhost.classList.add('ghost_hunt');
    }
    pacman.hunter.timeout = setTimeout(function () {
        for (var i = 0; i < gGhosts.length; i++) {
            var ghost = gGhosts[i];
            var elGhost = document.querySelector(`.ghost${ghost.id}`);
            elGhost.classList.remove('ghost_hunt');
        }
        pacman.hunter.timeout = null;
    }, pacman.hunter.duration);
}
