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
    return oldBubble.merge(Map({
        x: newX,
        y: newY,
        vx: doReflectX(newX, oldBubble, 1200) ? (oldBubble.get("vx") * -1) : oldBubble.get("vx"),
        vy: doReflectY(newY, oldBubble, 800) ? -500 : newVY
    }));
};

function updateArrow(oldArrow) {
    const step = 10;
    if (oldArrow === null) {
        return null; // use a mayBe
    }
    const newY = oldArrow.get("y") - step;
    const newArrow = oldArrow.merge({ y: newY});
    return newY > 0 ? newArrow : null;
}

function getPlayerNewX(player, keys, canvasWidth) {
    const step = 10;
    const isMovingleft = keys.leftPressedKey && player.get("x") > 0;
    const isMovingRight = keys.rightPressedKey && player.get("x") < (canvasWidth- player.get("w"));
    const deltaInMovement = (isMovingleft ? -step: 0) + (isMovingRight ? step: 0);
    return player.get("x") + deltaInMovement;
}

function isPlayerShooting(oldState, keys) {
    return keys.spacePressedKey && oldState.get("arrows").size === 0;
}

function createArrow(oldState, keys, arrows, newArrow) {
    return isPlayerShooting(oldState, keys) ? arrows.push(newArrow) : arrows; // eslint-disable-line fp/no-mutating-methods
}

function getNewArrowList(oldState, keys, canvasHeight) {
    const player = oldState.get("player");
    const arrows = oldState.get("arrows");
    const YOrigin = canvasHeight - player.get("h");
    const newArrow = Map({
        x: player.get("x") + (player.get("w") / 2) - 1,
        y: YOrigin,
        yOrigin: YOrigin,
        w: 3});
    const arrowList = createArrow(oldState, keys, arrows, newArrow);
    return arrowList.filter(arrow => arrow !== null)
                    .map(updateArrow);
}

export default function updateGame(oldState, keys, canvasWidth, canvasHeight) { // export canvas height and canvas width
    const player = oldState.get("player");
    const playerNewX = getPlayerNewX(player, keys, canvasWidth, canvasHeight);
    const newGameState = Map({
        bubbleArray: oldState.get("bubbleArray").map(updateBubble),
        player: player.merge({ x: playerNewX }),
        arrows: getNewArrowList(oldState, keys, canvasHeight)
    });
    return newGameState;
}
