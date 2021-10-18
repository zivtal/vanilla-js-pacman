'use strict';

var gGame;
var gBoard;
var gPacman;
var gGhosts;
var gDeadGhosts;

const DOT = '•';
const CHERRIES = '🍒';
const WALL = 'wall';
const FLOOR = 'floor';

const AUTO = null;

function init(ev) {
    gGame = createGame(ev, 15, 21, 24, 3);
    gPacman = createPacman();
    gGhosts = createGhosts();
    gBoard = createBoard(gGame.rows, gGame.cols);
    gGame.count = countFruit(gBoard);
    renderBoard(gBoard, gGame);
    renderPacman(gPacman);
    renderGhosts(gGhosts);
    moveGhosts(gGhosts);
}

function fitScreen(ev, rows, cols, shift) {
    var height = ev.path[0].innerHeight;
    var width = ev.path[0].innerWidth;
    height = (height - shift) / rows;
    width = (width - shift) / cols;
    return Math.min(height, width) - shift * 2;
}

function createGame(ev, rows = 15, cols = 21, size = 30, ghosts = 3, speed = 180) {
    const SHIFT = 6;
    if (!size) size = fitScreen(ev, rows, cols, SHIFT);
    return {
        rows: rows,
        cols: cols,
        shift: SHIFT,
        cell: {
            height: null,
            width: null,
        },
        character: {
            size: size,
            ghosts: ghosts,
        },
        count: null,
        score: {
            default: 10,
            cherries: 50,
            hunt: 200,
        },
        speed: speed,
    }
}

function handleKey(ev) {
    if (ev.key.slice(0, 5) === 'Arrow' &&
        gPacman.isAlive &&
        !gPacman.isLocked) {
        if (checkMove(gPacman, ev.key)) {
            gPacman.direction = ev.key;
            clearInterval(gPacman.interval);
            gPacman.interval = setInterval(function () {
                movePacman(gPacman, gGame);
            }, gPacman.speed);
        } else {
            checkNextMove(gPacman, ev.key);
        }
    }
}

function getPixelPosition(i, j, game = gGame) {
    return {
        top: game.shift + (i / game.rows * game.height),
        left: game.shift + (j / game.cols * game.width)
    }
}

function getRandomDirection() {
    const DIRECTIONS = [['ArrowDown', 'ArrowUp'], ['ArrowRight', 'ArrowLeft']];
    return DIRECTIONS[Math.round(Math.random())][Math.round(Math.random())];
}

function getNewPosition(position = { i: null, j: null }, direction) {
    var position = {
        i: position.i,
        j: position.j,
    }
    switch (direction) {
        case 'ArrowDown':
            position.i++;
            break;
        case 'ArrowUp':
            position.i--;
            break;
        case 'ArrowRight':
            position.j++;
            break;
        case 'ArrowLeft':
            position.j--;
    }
    return position;
}

function checkMove(character, direction) {
    if (!direction) direction = character.direction;
    var position = getNewPosition(character, direction);
    var elCell = document.querySelector(`#cell-${position.i}-${position.j}`);
    if (character.isCanJump && !elCell) return true;
    if (elCell) return !elCell.classList.contains('wall');
}

function checkNextMove(character, direction, steps = 3) {
    for (var i = 0; i < steps; i++) {
        var position = getNewPosition(character, character.direction);
        var elCell = document.querySelector(`#cell-${position.i}-${position.j}`);
        if (elCell && elCell.classList.contains('wall')) {
            character.next = null;
            return;
        } else if (checkMove(position, direction)) {
            character.next = {
                i: position.i,
                j: position.j,
                direction: direction,
            }
            console.log('next step:', character.next);
            return;
        }
    }
    character.next = null;
}

function checkConflict(pacman, ghost) {
    var ghosts = (!ghost) ? gGhosts : [ghost];
    for (var i = 0; i < ghosts.length && pacman.isAlive; i++) {
        if (ghosts[i].i === pacman.i && ghosts[i].j === pacman.j) {
            if (pacman.hunter.timeout) {
                pacman.score += gGame.score.hunt;
                playAudio('sound/eatghost.wav')
                clearInterval(ghosts[i].interval);
                ghosts[i].interval = null;
                var elGhost = document.querySelector(`.ghost${ghosts[i].id}`);
                elGhost.style.opacity = 0.2;
                elGhost.classList.remove('ghost_hunt');
                gDeadGhosts.push(ghosts.splice(i, 1)[0]);
                gDeadGhosts[gDeadGhosts.length - 1].hidden = setTimeout(function () {
                    if (gDeadGhosts.length) {
                        var ghost = gDeadGhosts.shift();
                        ghost.hidden = null;
                        randomMoveGhost(ghost);
                        ghosts.push(ghost);
                        if (pacman.hunter.isOn) elGhost.classList.add('ghost_hunt');
                        elGhost.style.opacity = 0.8;
                    }
                }, 3000)
            } else {
                gameOver();
            }
        }
    }
}

function showModal(message) {
    var elMessage = document.querySelector('.message');
    var elHeader = elMessage.querySelector('h1');
    var height = gGame.height / 4;
    var width = gGame.width / 2;
    var top = gGame.height / 2 - height / 2;
    var left = gGame.width / 2 - width / 2;
    elHeader.innerText = message;
    elMessage.style = `display:block;opacity:1;height:${height}px;width:${width}px;top:${top}px;left:${left}px;`;
}

function gameOver() {
    gPacman.isAlive = false;
    playAudio('sound/death.mp3')
    setTimeout(function () {
        var elPacman = document.querySelector('.pacman');
        elPacman.style.opacity = 0;
        showModal('GAME OVER!');
    }, gGame.speed);
}

function gameComplete() {
    clearInterval(gPacman.interval);
    gPacman.isAlive = false;
    playAudio('sound/win.wav')
    setTimeout(function () {
        var elGhosts = document.querySelector('.ghosts');
        elGhosts.style.opacity = 0;
        showModal('COMPLETE!');
    }, gGame.speed);
}

function restartGame() {
    clearInterval(gPacman.hunter.timeout);
    gPacman.hunter.timeout = null;
    clearInterval(gPacman.interval);
    gPacman.interval = null;
    for (var i = 0; i < gDeadGhosts.length; i++) {
        clearTimeout(gGhosts[i].hidden);
        gDeadGhosts[i].hidden = null;
    }
    gDeadGhosts = [];
    for (var i = 0; i < gGhosts.length; i++) {
        clearInterval(gGhosts[i].interval);
        gGhosts[i].interval = null;
    }
    var elMessage = document.querySelector('.message');
    elMessage.style.display = 'none';
    elMessage.style.opacity = 0;
    var elGhosts = document.querySelector('.ghosts');
    elGhosts.innerHTML = '';
    init();
}

function playAudio(file) {
    var audio = new Audio(file);
    setTimeout(function () {
        audio.play();
    }, gGame.speed / 2);
}
