import { List, Map } from "immutable";

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
    return newX < oldBubble.get("radius") || newX > canvasWidth - oldBubble.get("radius"); // detect collision with left and right canvas border
}

function doReflectY(newY, oldBubble, canvasHeight) {
    return newY < oldBubble.get("radius") || newY > canvasHeight - oldBubble.get("radius"); // detect collision with top and bottom canvas border
}

function updateBubble(oldBubble) {
    const newVY = getNewVY(oldBubble, 0.02, 200);
    const newX = getNewX(oldBubble, 0.02);
    const newY = getNewY(oldBubble, 0.02, newVY);
    const newBubble = oldBubble.merge(Map({
        x: newX,
        y: newY,
        vx: doReflectX(newX, oldBubble, 1200) ? (oldBubble.get("vx") * -1) : oldBubble.get("vx"), // pass canvas instead
        vy: doReflectY(newY, oldBubble, 800) ? -500 : newVY
    }));
    return newBubble;
};

function updateArrow(oldArrow) {
    if (oldArrow === null) {
        return null; // use a mayBe
    }
    const newY = oldArrow.get("y") - 10;
    const newArrow = oldArrow.merge({ y: newY });
    return newY > 0 ? newArrow : null; // return null if there are no arrows -> change this to a mayBe structure
}

export default function updateGame(oldState, keys, canvas) {
    const player = oldState.get("player");
    const leftMovement = keys.leftPressedKey && player.get("x") > 0;
    const rightMovement = keys.rightPressedKey && player.get("x") < (canvas.width - player.get("w"));
    const playerNewX = player.get("x") + (leftMovement ? -10: 0 + rightMovement ? 10: 0);
    const newArrowCond = keys.spacePressedKey && oldState.get("arrows").size === 0;
    const newArrowList1 = newArrowCond ? oldState.get("arrows").push(Map({x: player.get("x") + (player.get("w") / 2) - 1, y: canvas.height, w: 3})) : oldState.get("arrows");
    const newArrowList2 = newArrowList1.filter(arrow => arrow !== null);
    const newGameState = Map({
        bubbleArray: oldState.get("bubbleArray").map(updateBubble),
        player: player.merge({x: playerNewX}),
        arrows: newArrowList2.map(updateArrow)
    });
    return newGameState;
}
