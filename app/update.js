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
        vx: doReflectX(newX, oldBubble, 1200) ? (oldBubble.get("vx") * -1) : oldBubble.get("vx"), // pass canvas instead
        vy: doReflectY(newY, oldBubble, 800) ? -500 : newVY
    }));
};

function updateArrow(oldArrow) {
    if (oldArrow === null) {
        return null; // use a mayBe
    }
    const newY = oldArrow.get("y") - 10; // variable instead of hard-coding
    if (!(newY > 0)) return null; // return early
    return oldArrow.merge({ y: newY });
}

function getPlayerNewX(player, keys, canvasWidth) {
    const step = 10;
    const isMovingleft = keys.leftPressedKey && player.get("x") > 0;
    const isMovingRight = keys.rightPressedKey && player.get("x") < (canvasWidth- player.get("w"));
    const deltaInMovement = (isMovingleft ? -step: 0) + (isMovingRight ? step: 0);
    return player.get("x") + deltaInMovement;
}

function getNewArrowList(oldState, keys, canvas) {
    const player = oldState.get("player");
    const arrows = oldState.get("arrows");
    const newArrowCond = keys.spacePressedKey && arrows.size === 0;
    const newArrow = Map({x: player.get("x") + (player.get("w") / 2) - 1, y: canvas.height, w: 3});
    const arrowList = newArrowCond ? arrows.push(newArrow) : arrows;
    return arrowList.filter(arrow => arrow !== null)
                    .map(updateArrow);
}

export default function updateGame(oldState, keys, canvas) { // export canvas height and canvas width
    const player = oldState.get("player");
    const playerNewX = getPlayerNewX(player, keys, canvas.width);
    const newGameState = Map({
        bubbleArray: oldState.get("bubbleArray").map(updateBubble),
        player: player.merge({x: playerNewX}),
        arrows: getNewArrowList(oldState, keys, canvas)
    });
    return newGameState;
}
