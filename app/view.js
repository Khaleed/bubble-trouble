/*eslint fp/no-unused-expression: 0, fp/no-nil: 0 */

import assets from "./assets";
import keys from "./keystate";
import { List, Map } from "immutable";
import GameState from "./update";
import { Model } from "./model";

(function () {
    const canvas = assets.canvas;

    keys.addListeners(); // interrogate key states

    window.addEventListener("load", () => {
        const screen = canvas.getContext("2d");

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
            // const immutableKeys = Map({keys});
            // const newGameState = gameState.updateGameIfGameRunning(immutableKeys);
            drawPlayer(gameState.get("player"));
            requestAnimationFrame(() => runGameRenderingCycle(gameState);
        };
        runGameRenderingCycle(GameState({inputs}));
    });
}());
