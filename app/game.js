"use strict";

import assets from "./assets";

(function () {
    let canvas = assets.canvas;
    window.addEventListener("load", () => {
        let ctx;
        if (canvas.getContext === "undefined") {
            console.error("Browser doesn't support HTML5 Canvas");
        }
        ctx = canvas.getContext("2d");
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

        function update(oldState) {
            console.log("gameState is", oldState.y, canvas.height - oldState.radius,  oldState.vy);
            const dt = 0.02;
            const newX = oldState.x + (dt * oldState.vx);
            const newY = oldState.y + (dt * oldState.vy);
            const doReflectX = newX < oldState.radius || newX > canvas.width - oldState.radius;
            const doReflectY = newY <  oldState.radius || newY > canvas.height - oldState.radius;
            const newState = {
                x: newX,
                y: newY,
                vx: doReflectX ? (oldState.vx * -1) : oldState.vx,
                vy: doReflectY ? (oldState.vy * -1) : oldState.vy,
                color: oldState.color,
                radius: oldState.radius
            };
            return newState;
        }
        function draw(gameState) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.beginPath();
            ctx.arc(gameState.x, gameState.y, gameState.radius, 0, Math.PI*2, false);
            ctx.fillStyle = gameState.color;
            ctx.fill();
            ctx.closePath();
        }
        function runGameRenderingCycle(gameState) {
            draw(gameState);
            requestAnimationFrame(function(){runGameRenderingCycle(update(gameState));});
        }
        runGameRenderingCycle(initialGameState);
    });
}());
