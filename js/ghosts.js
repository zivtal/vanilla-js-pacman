'use strict';

function createGhosts(num = gGame.character.ghosts) {
    gDeadGhosts = [];
    var ghosts = [];
    var colors = ['blue', 'red', 'green'];
    for (var i = 0; i < num; i++) {
        var color = (colors.length > 0) ? colors.pop() : getRandomRGBColor(50, 180);
        ghosts[i] = {
            id: i,
            size: gGame.character.size - 5,
            color: color,
            i: Math.floor(gGame.rows / 2),
            j: Math.floor(gGame.cols / 2),
            position: {
                top: null,
                left: null,
            },
            direction: getRandomDirection(),
            interval: null,
            hidden: null,
            speed: gGame.speed * 1.25,
            isAttack: false,
        }
    }
    return ghosts;
}

function renderGhosts(ghosts) {
    var strHTML = '';
    for (var i = 0; i < ghosts.length; i++) {
        var ghost = ghosts[i];
        var position = getPixelPosition(ghost.i, ghost.j)
        strHTML +=
            `<div class="ghost ghost${i}" style="display:initial;height:${ghost.size}px;width:${ghost.size}px;top:${position.i};left:${position.j};opacity:0.8;transition:top ${ghost.speed / 1000}s linear, left ${ghost.speed / 1000}s linear, opacity  ${ghost.speed * 6 / 1000}s ease-in-out;">
                <div class="ghost_head" style="background-color:${ghost.color}">
                    <div class="ghost_eye" style="left:20%"></div>
                    <div class="ghost_eye" style="left:60%"></div>
                </div>
                <div class="ghost_body" style="background-color:${ghost.color}"></div>
            </div>`;
    }
    var elGhosts = document.querySelector('.ghosts');
    elGhosts.innerHTML = strHTML;
}

function randomMoveGhost(ghost) {
    var elGhost = document.querySelector(`.ghost${ghost.id}`);
    clearInterval(ghost.interval);
    ghost.interval = setInterval(function () {
        ghost.direction = (ghost.isAttack || Math.random() > 0.25) ? ghost.direction : getRandomDirection();
        while (!checkMove(ghost)) {
            ghost.direction = getRandomDirection();
        }
        var position = getNewPosition(ghost, ghost.direction);
        ghost.i = position.i;
        ghost.j = position.j;
        ghost.position = getPixelPosition(ghost.i, ghost.j);
        elGhost.style.top = ghost.position.top + 'px';
        elGhost.style.left = ghost.position.left + 'px';
        checkConflict(gPacman, ghost);
        ghostAttack(gPacman, ghost);
    }, ghost.speed)
}

function isWayFree(position1, position2) {
    var elCell;
    if (position1.i === position2.i) {
        for (var j = Math.min(position1.j, position2.j); j < Math.max(position1.j, position2.j); j++) {
            elCell = document.querySelector(`#cell-${position1.i}-${j}`);
            if (elCell && elCell.classList.contains('wall')) return false;
        }
    } else if (position1.j === position2.j) {
        for (var i = Math.min(position1.i, position2.i); i < Math.max(position1.i, position2.i); i++) {
            elCell = document.querySelector(`#cell-${i}-${position1.j}`);
            if (elCell && elCell.classList.contains('wall')) return false;
        }
    } else return false;
    return true;
}

function ghostAttack(pacman, ghost) {
    if (pacman.isAlive && isWayFree(ghost, pacman)) {
        ghost.isAttack = true;
        if (ghost.i === pacman.i) {
            if (ghost.j > pacman.j) {
                ghost.direction = (!pacman.hunter.timeout) ? 'ArrowLeft' : 'ArrowRight';
            } else {
                ghost.direction = (!pacman.hunter.timeout) ? 'ArrowRight' : 'ArrowLeft';
            }
        } else if (ghost.j === pacman.j) {
            if (ghost.i > pacman.i) {
                ghost.direction = (!pacman.hunter.timeout) ? 'ArrowUp' : 'ArrowDown';
            } else {
                ghost.direction = (!pacman.hunter.timeout) ? 'ArrowDown' : 'ArrowUp';
            }
        }
    } else {
        ghost.isAttack = false;
    }
}

function moveGhosts(ghosts) {
    for (var i = 0; i < ghosts.length; i++) {
        var ghost = ghosts[i];
        randomMoveGhost(ghost, gPacman);
    }
}
