/*eslint fp/no-unused-expression: 0, fp/no-nil: 0 */
import { default as Html } from "./html";
import { interrogateKeyState, keys } from "./keystate";
import { List, Map } from "immutable";
import { updateGame } from "./update";
import { Model } from "./model";

interrogateKeyState(keys);

window.addEventListener("load", () => {
    const canvas = Html.canvas;
    const screen = canvas.getContext("2d");

    canvas.width = 1200; // eslint-disable-line fp/no-mutation
    canvas.height = 800; // eslint-disable-line fp/no-mutation

    const drawPlayer = player => {
        screen.fillStyle = player.get("color"); // eslint-disable-line fp/no-mutation
        screen.fillRect(player.get("x"), Html.canvas.height - player.get("h"), player.get("w"), player.get("h"));
    };

    const drawBubble = bubble => {
        screen.beginPath();
        screen.arc(bubble.get("x"), bubble.get("y"), bubble.get("radius"), 0, Math.PI * 2, false);
        screen.fillStyle = bubble.get("color"); // eslint-disable-line fp/no-mutation
        screen.fill();
        screen.closePath();
    };

    const drawArrow = arrow => {
        if (arrow === null) {
            return;
        }
        screen.fillStyle = "white"; // eslint-disable-line fp/no-mutation
        screen.fillRect(arrow.get("x"), arrow.get("y"), arrow.get("w"), Html.canvas.height);
    };

    const draw = (gameState, Html) => {
        screen.clearRect(0, 0, Html.canvas.width, Html.canvas.height);
        gameState.get("bubbleArray").map(drawBubble);
        gameState.get("arrows").map(drawArrow);
        drawPlayer(gameState.get("player"));
    };

    const runGameRenderingCycle = (gameState, lastTime, Html) => {
        const time = new Date().getTime();
        const deltaInTime = time - (lastTime || time);
        draw(gameState, Html);
        requestAnimationFrame(
            () => runGameRenderingCycle(
                updateGame(gameState, keys, Html.canvas.width, Html.canvas.height, deltaInTime), time, Html
            )
        );
    };

    runGameRenderingCycle(Model, 0, Html);
});
