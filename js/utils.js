'use strict';

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

function getRandomRGBColor(min = 0, max = 255) {
    var r = getRandomInt(min, max);
    var g = getRandomInt(min, max);
    var b = getRandomInt(min, max);
    return `rgb(${r},${g},${b});`;
}
