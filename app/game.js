/*eslint fp/no-unused-expression: 0, fp/no-nil: 0 */

import assets from "./assets";
import keys from "./keystate";
import { List, Map } from "immutable";

(function () {
    const canvas = assets.canvas;
    keys.addListeners();
    window.addEventListener("load", () => {
        const screen = canvas.getContext("2d");
        const initialGameState = Map({
            bubbleArray: [Map({
                x: canvas.width/2,
                y: canvas.height/2,
                vx: 100,
                vy: 200,
                color: "red",
                radius: 25
            }),Map({
                x: canvas.width/2,
                y: canvas.height/2,
                vx: -100,
                vy: 200,
                color: "green",
                radius: 25
            })],
            player: Map({
                x: canvas.width/2,
                w: 20,
                h: 40,
                color: "blue"
            })
        });

        function updateBubble(oldBubble) {
            const dt = 0.02;
            const g = 200;
            const newVY = oldBubble.get("vy") + (g * dt);
            const newX = oldBubble.get("x") + (dt * oldBubble.get("vx"));
            const newY = oldBubble.get("y") + (dt * newVY);
            const doReflectX = newX < oldBubble.get("radius") || newX > canvas.width - oldBubble.get("radius");
            const doReflectY = newY < oldBubble.get("radius") || newY > canvas.height - oldBubble.get("radius");
            const newBubble = oldBubble.merge(Map({
                x: newX,
                y: newY,
                vx: doReflectX ? (oldBubble.get("vx") * -1) : oldBubble.get("vx"),
                vy: doReflectY ? newVY * -1 : newVY
            }));
            return newBubble;
        };

        function updateGame(oldState) {
            const playerNewX = oldState.get("player").get("x") + (keys.leftPressedKey ? -10: 0 + keys.rightPressedKey ? 10: 0);
            const newState = Map({
                bubbleArray: oldState.get("bubbleArray").map(updateBubble),
                player: oldState.get("player").merge({x: playerNewX})
            });
            return newState;
        }

        function drawPlayer(player) {
            screen.fillStyle = player.get("color"); // eslint-disable-line fp/no-mutation
            screen.fillRect(player.get("x"), canvas.height - player.get("h"), player.get("w"), player.get("h"));
        }

        // impure rendering fn that populates canvas
        function drawBubble(bubble) {
            screen.beginPath();
            screen.arc(bubble.get("x"), bubble.get("y"), bubble.get("radius"), 0, Math.PI*2, false);
            screen.fillStyle = bubble.get("color"); // eslint-disable-line fp/no-mutation
            screen.fill();
            screen.closePath();
        };
        function runGameRenderingCycle(gameState) {
            screen.clearRect(0, 0, canvas.width, canvas.height); // clear the screen
            gameState.get("bubbleArray").map(drawBubble);
            drawPlayer(gameState.get("player"));
            requestAnimationFrame(() => runGameRenderingCycle(updateGame(gameState)));
        };
        runGameRenderingCycle(initialGameState);
    });
}());
