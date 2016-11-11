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
            bubbleArray: List.of(Map({
                x: canvas.width/2,
                y: canvas.height/2,
                vx: 100,
                vy: 200,
                color: "red",
                radius: 25
            }), Map({
                x: canvas.width/2,
                y: canvas.height/2,
                vx: -100,
                vy: 200,
                color: "green",
                radius: 25
            })),
            player: Map({
                x: canvas.width/2,
                w: 20,
                h: 40,
                color: "blue"
            })
        });

        function getNewVY(oldBubble, dt, g) {
            return oldBubble.get("vy") + (g * dt); // newVY = oldVY + acceleration * delta time
        }

        function getNewX(oldBubble, dt) {
            return oldBubble.get("x") + (dt * oldBubble.get("vx"));
        }

        function getNewY(oldBubble, dt, newVY) {
            return oldBubble.get("y") + (dt * newVY);
        }

        function doReflectX(newX, oldBubble, canvasWidth) {
            return newX < oldBubble.get("radius") || newX > canvas.width - oldBubble.get("radius"); // detect collision with left and right canvas border
        }

        function doReflectY(newY, oldBubble, canvasHeight) {
            return newY < oldBubble.get("radius") || newY > canvas.height - oldBubble.get("radius"); // detect collision with top and bottom canvas border
        }

        function updateBubble(oldBubble) {
            const newVY = getNewVY(oldBubble, 0.02, 200);
            const newX = getNewX(oldBubble, 0.02);
            const newY = getNewY(oldBubble, 0.02, newVY);
            const newBubble = oldBubble.merge(Map({
                x: newX,
                y: newY,
                vx: doReflectX(newX, oldBubble, canvas.width) ? (oldBubble.get("vx") * -1) : oldBubble.get("vx"),
                vy: doReflectY(newY, oldBubble, canvas.height) ? -500 : newVY
            }));
            return newBubble;
        };

        function updateGame(oldState) {
            const player = oldState.get("player");
            const leftMovement = keys.leftPressedKey && player.get("x") > 0;
            const rightMovement = keys.rightPressedKey && player.get("x") < (canvas.width - player.get("w"));
            const playerNewX = oldState.get("player").get("x") + (leftMovement ? -10: 0 + rightMovement ? 10: 0);
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
