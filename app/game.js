"use strict";

import assets from "./assets";

(function () {
    let canvas = assets.canvas;
    window.addEventListener("load", () => {
        const screen = canvas.getContext("2d");
        canvas.width = 1200;
        canvas.height = 800;

        const initialGameState = {
            x: canvas.width/2,
            y: canvas.height/2,
            vx: 300,
            vy: 80,
            color: "red",
            radius: 25
        };

        const update = oldState => {
            const dt = 0.02;
            const newX = oldState.x + (dt * oldState.vx);
            const newY = oldState.y + (dt * oldState.vy);
            const doReflescreen = newX < oldState.radius || newX > canvas.width - oldState.radius;
            const doReflectY = newY <  oldState.radius || newY > canvas.height - oldState.radius;
            const newState = {
                x: newX,
                y: newY,
                vx: doReflescreen ? (oldState.vx * -1) : oldState.vx,
                vy: doReflectY ? (oldState.vy * -1) : oldState.vy,
                color: oldState.color,
                radius: oldState.radius
            };
            return newState;
        };
        // impure rendering fn that populates canvas
        const draw = gameState => {
            screen.clearRect(0, 0, canvas.width, canvas.height);
            screen.beginPath();
            screen.arc(gameState.x, gameState.y, gameState.radius, 0, Math.PI*2, false);
            screen.fillStyle = gameState.color;
            screen.fill();
            screen.closePath();
        };
        const runGameRenderingCycle = gameState => {
            draw(gameState);
            requestAnimationFrame(() => runGameRenderingCycle(update(gameState)));
        };
        runGameRenderingCycle(initialGameState);
    });
}());
