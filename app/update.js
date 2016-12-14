import { List, Map } from "immutable";
import { dist, partial, compose } from "./helpers";

// getNewVY :: (Number, Number, Number) -> Number
const getNewVY = (vy, dt, g) => vy + (g * dt);

// getNewX :: (Number, Number, Number) -> Number
const getNewX = (x, dt, vx) => x + (dt * vx);

//getNewY :: (Number, Number, Number) -> Number
const getNewY = (y, dt, newVY) => y + (dt * newVY);

// doReflectX :: (Number, Number, Number) -> Bool
const doReflectX = (newX, radius, canvasWidth) => newX < radius || newX > (canvasWidth - radius);

// doReflectY :: (Number, Number, Number) -> Bool
const doReflectY = (newY, radius, canvasHeight) => newY < radius || newY > (canvasHeight - radius);

// updateBubble :: Map -> Map
const updateBubble = bubble => {
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

// updateArrow :: Map -> MayBe
const updateArrow = arrow => {
    const step = 10;
    if (arrow === null) {
        return null; // use a mayBe
    }
    const newY = arrow.get("y") - step;
    const newArrow = arrow.merge({ y: newY});
    return newY > 0 ? newArrow : null;
};

// updatePlayerMovement :: ({String: Map}, Map, Number) -> Number
const updatePlayerMovement = (keys, player, canvasWidth) => {
    const step = 10;
    const playerX = player.get("x");
    const isMovingleft = keys.state.get("isLeftKeyPressed") && playerX > 0;
    const isMovingRight = keys.state.get("isRightKeyPressed") && playerX < (canvasWidth - player.get("w"));
    const deltaInMovement = (isMovingleft ? -step: 0) + (isMovingRight ? step: 0);
    return playerX + deltaInMovement;
};

// isPlayerShooting :: (Obj, List) -> Boolean
const isPlayerShooting = (keys, arrows) => keys.state.get("isSpaceKeyPressed") && arrows.size === 0;

// createArrow :: (Obj, List, Map) -> List
const createArrow = (keys, arrows, newArrow) => isPlayerShooting(keys, arrows) ? arrows.push(newArrow) : arrows; // eslint-disable-line fp/no-mutating-methods

// getNewArrows :: (Obj, Map, List, Number) -> List
const getNewArrows = (keys, player, arrows, canvasHeight) => {
    const YOrigin = canvasHeight - player.get("h"); // modify to ensure arrows are shot from the floor
    const newArrow = Map({
        x: player.get("x") + (player.get("w") / 2) - 1,
        y: YOrigin,
        yOrigin: YOrigin,
        w: 3});
    const arrowList = createArrow(keys, arrows, newArrow);
    return arrowList;
};

// filterArrows :: List -> List
const filterArrows = ary => ary.filter(x => x !== null);

// updateArrows :: List -> List
const updateArrows = ary => ary.map(updateArrow);

// getUpdatedArrows :: List -> List
const getUpdatedArrows = compose(updateArrows, filterArrows);

// isArrowStrikingBubble :: (Map, Map) -> bool
const isArrowStrikingBubble = (bubble, arrow) => {
    const bubbleXPos = bubble.get("x");
    const bubble_r = bubble.get("radius");
    const arrowXPos = bubble.get("x");
    const arrowYPos = arrow.get("y");
    const B_r = bubbleXPos + bubble_r;
    const B_l = bubbleXPos - bubble_r;
    const A_r = arrowXPos + arrow.get("w");
    const A_l = arrowXPos;
    const A_y = arrow.get("y");
    const B_y = bubble.get("y");
    // detect if arrow tip is beneath bubble center
    if (A_y > B_y) {
        const B_x = bubbleXPos;
        const r = bubbleRad;
        const dist1 = dist(B_x - A_r, B_y - A_y);
        const dist2 = dist(B_x - A_l, B_y - A_y);
        return (dist1 < r) || (dist2 < r);
    } else { // detect if arrow tip is above bubble center
        return (B_r > A_l) && (B_l < A_r);
    }
};

// const getArrowsAndBubbles = (arrowList, bubbleList) => {
//     arrowList.reduce((blist, arrow) => {
//         // see if the arrow collides with any bubbles in bubble list
//         blist.reduce((newBlist, bubble) => {
//             if (isArrowStrikingBubble(bubble, arrow)) {
//                 // add 2 new bubbles to new bubble list
//             } else {
//                 // add original bubble into new bubble list
//                 newBlist.push(bubble);
//             }
//         }, List.of());
//     }, bubbleList);
// };

// updateGame :: (Model, Obj, Number, Number, Number ) -> Model
export const updateGame = (state, keys, canvasWidth, canvasHeight, dt) => { // export canvas height and canvas width
    const player = state.get("player");
    const bubble = state.get("bubbleArray");
    const arrows = state.get("arrows");
    const playerNewX = updatePlayerMovement(keys, player, canvasWidth);
    const newArrows = getNewArrows(keys, player, arrows, canvasHeight);
    const newGameState = Map({
        bubbleArray: bubble.map(updateBubble),
        player: player.merge({ x: playerNewX }),
        arrows: getUpdatedArrows(newArrows)
    });
    return newGameState;
};
