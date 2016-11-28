import { List, Map } from "immutable";

function getNewVY(vx, dt, g) {
    return vx + (g * dt);// newVY = oldVY + acceleration * delta time
}

function getNewX(x, dt, vx) {
    return x + (dt * vx);
}

function getNewY(y, dt, newVY) {
    return y + (dt * newVY);
}
function doReflectX(newX, radius, canvasWidth) {
    return newX < radius || newX > canvasWidth - radius; // collision with left and right canvas border
}

function doReflectY(newY, radius, canvasHeight ) {
    return newY < radius || newY > canvasHeight - radius; // detect collision with top and bottom canvas border
}

function updateBubble(bubble) {
    const vX = bubble.get("vx");
    const radius = bubble.get("radius");
    const newVY = getNewVY(bubble.get("vy"), 0.02, 200);
    const newX = getNewX(bubble.get("x"), 0.02, bubble.get("vx"));
    const newY = getNewY(bubble.get("y"), 0.02, newVY);
    return bubble.merge(Map({
        x: newX,
        y: newY,
        vx: doReflectX(newX, radius, 1200) ? vX * -1 : vX,
        vy: doReflectY(newY, radius, 800) ? -500 : newVY
    }));
};

function updateArrow(arrow) {
    const step = 10;
    if (arrow === null) {
        return null; // use a mayBe
    }
    const newY = arrow.get("y") - step;
    const newArrow = arrow.merge({ y: newY});
    return newY > 0 ? newArrow : null;
}

function updatePlayerMovement(keys, player, canvasWidth) {
    const step = 10;
    const playerX = player.get("x");
    const isMovingleft = keys.leftPressedKey && playerX > 0;
    const isMovingRight = keys.rightPressedKey && playerX < (canvasWidth - player.get("w"));
    const deltaInMovement = (isMovingleft ? -step: 0) + (isMovingRight ? step: 0);
    return playerX + deltaInMovement;
}

function isPlayerShooting(keys, arrows) {
    return keys.spacePressedKey && arrows.size === 0;
}

function createArrow(keys, arrows, newArrow) {
    return isPlayerShooting(keys, arrows) ? arrows.push(newArrow) : arrows; // eslint-disable-line fp/no-mutating-methods
}

function getNewArrowList(keys, player, arrows, canvasHeight) {
    const YOrigin = canvasHeight - player.get("h");
    const newArrow = Map({
        x: player.get("x") + (player.get("w") / 2) - 1,
        y: YOrigin,
        yOrigin: YOrigin,
        w: 3});
    const arrowList = createArrow(keys, arrows, newArrow);
    return arrowList.filter(arrow => arrow !== null)
                    .map(updateArrow);
}

export default function updateGame(state, keys, canvasWidth, canvasHeight) { // export canvas height and canvas width
    const player = state.get("player");
    const bubble = state.get("bubbleArray");
    const arrows = state.get("arrows");
    const playerNewX = updatePlayerMovement(keys, player, canvasWidth);
    const newGameState = Map({
        bubbleArray: bubble.map(updateBubble),
        player: player.merge({ x: playerNewX }),
        arrows: getNewArrowList(keys, player, arrows, canvasHeight)
    });
    return newGameState;
}
