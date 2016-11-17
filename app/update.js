import { Model } from "./model";
import { List, Map } from "immutable";

export default function GameState(args) {
    const { Inputs, Model } = args;

    function getNewVY(oldBubble, dt, g) {
        return oldBubble.get("vy") + (g * dt);// newVY = oldVY + acceleration * delta time
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
    // if there is no change in game state, return the initial Model
    return Model;
}
