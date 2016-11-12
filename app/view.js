/*eslint fp/no-unused-expression: 0, fp/no-nil: 0 */

import assets from "./assets";
import keys from "./keystate";
import { List, Map } from "immutable";
import { initialGameState } from "./model";

(function () {
    const canvas = assets.canvas;
    keys.addListeners();
    window.addEventListener("load", () => {
        const screen = canvas.getContext("2d");

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

        function updateArrow(oldArrow) {
            if (oldArrow === null) {
                return null;
            }
            const newY = oldArrow.get("y") - 10;
            const newArrow = oldArrow.merge({ y: newY });
            return newY > 0 ? newArrow : null; // return null if there are no arrows
        }

        function updateGame(oldState) {
            const player = oldState.get("player");
            const leftMovement = keys.leftPressedKey && player.get("x") > 0;
            const rightMovement = keys.rightPressedKey && player.get("x") < (canvas.width - player.get("w"));
            const playerNewX = player.get("x") + (leftMovement ? -10: 0 + rightMovement ? 10: 0);
            const newArrowCond = keys.spacePressedKey && oldState.get("arrows").size === 0;
            const newArrowList1 = newArrowCond ? oldState.get("arrows").push(Map({x: player.get("x") + (player.get("w") / 2) - 1, y: canvas.height, w: 3})) : oldState.get("arrows");
            const newArrowList2 = newArrowList1.filter((arrow) => arrow !== null);
            const newState = Map({
                bubbleArray: oldState.get("bubbleArray").map(updateBubble),
                player: player.merge({x: playerNewX}),
                arrows: newArrowList2.map(updateArrow)
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

        function drawArrow(arrow) {
            if (arrow === null) {
                return;
            }
            screen.fillStyle = "white"; // eslint-disable-line fp/no-mutation
            screen.fillRect(arrow.get("x"), arrow.get("y"), arrow.get("w"), canvas.height - arrow.get("y"));
        }

        function runGameRenderingCycle(gameState) {
            screen.clearRect(0, 0, canvas.width, canvas.height);
            gameState.get("bubbleArray").map(drawBubble);
            gameState.get("arrows").map(drawArrow);
            drawPlayer(gameState.get("player"));
            requestAnimationFrame(() => runGameRenderingCycle(updateGame(gameState)));
        };
        runGameRenderingCycle(initialGameState);
    });
}());
