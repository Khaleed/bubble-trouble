import { List, Map, Set } from "immutable";
import { partial, curry, compose, flatten } from "./helpers";
import { createBubble, isRectStrikingBubble, dist } from "./helpers";

// getNewVY :: (Number, Number, Number) -> Number
const getNewVY = (vy, dt, g) => vy + (g * dt);

// getNewX :: (Number, Number, Number) -> Number
const getNewX = (x, dt, vx) => x + (dt * vx);

//getNewY :: (Number, Number, Number) -> Number
const getNewY = (y, dt, newVY) => y + (dt * newVY);

// doReflectX :: (Number, Number, Number) -> Bool
const doReflectX = (newX, radius, canvasWidth) => newX < radius || newX > (canvasWidth - radius);

// doReflectYTop :: (Number, Number, Number) -> Bool
const doReflectYtop = (newY, radius, canvasHeight) => newY < radius;

// doReflectYbottom :: (Number, Number, Number) -> Bool
const doReflectYbottom = (newY, radius, canvasHeight) => newY > (canvasHeight - radius);

// updateBubble :: (Bubble, [StandardBubbles], Number, Number) -> (Map<Bubble>)
const updateBubble = (bubble, xs, canvasWidth, canvasHeight) => {
    const vX = bubble.get("vx");
    const vY = bubble.get("vy");
    const radius = bubble.get("radius");
    const dt = 0.02;
    const g = 200;
    const newVY = getNewVY(vY, dt, g);
    const newX = getNewX(bubble.get("x"), dt, vX);
    const newY = getNewY(bubble.get("y"), dt, newVY);
    const std_vy = xs.get(bubble.get("size")).get("vy_init");
    return bubble.merge(
        Map({
            x: newX,
            y: newY,
            vx: doReflectX(newX, radius, canvasWidth) ? vX * -1 : vX,
            vy: doReflectYtop(newY, radius, canvasHeight) ? -newVY : (doReflectYbottom(newY, radius, canvasHeight) ? std_vy : newVY)// this is not constant due to gravity
        })
    );
};

// updateArrow :: (Map<Arrow>) -> MayBe
const updateArrow = arrow => {
    const step = 10;
    if (arrow === null) {
        return null; // use a mayBe
    }
    const newY = arrow.get("y") - step;
    const newArrow = arrow.merge({ y: newY});
    return newY > 0 ? newArrow : null;
};

// updatePlayerMovement :: ({ String: (Map<Bool>) }, (Map<Player>), Number) -> Number
const updatePlayerMovement = (keys, player, canvasWidth) => {
    const step = 10;
    const playerX = player.get("x");
    const isMovingleft = keys.state.get("isLeftKeyPressed") && playerX > 0;
    const isMovingRight = keys.state.get("isRightKeyPressed") && playerX < (canvasWidth - player.get("w"));
    const deltaInMovement = (isMovingleft ? -step: 0) + (isMovingRight ? step: 0);
    return playerX + deltaInMovement;
};

// isPlayerShooting :: ({ String: (Map<Bool>) }, [Arrows]) -> Bool
const isPlayerShooting = (keys, xs) => keys.state.get("isSpaceKeyPressed") && xs.size === 0;

// createArrow :: ({ String: (Map<Bool>) }, [Arrows], (Map<Arrow>)) -> [NewArrows]
const addArrow = (keys, xs, arrow) => isPlayerShooting(keys, xs) ? xs.push(arrow) : xs; // eslint-disable-line fp/no-mutating-methods

// getNewArrows :: ({ String: (Map<Bool>) }, (Map<Player>), [], Number) -> [Arrows]
const createArrows = (keys, player, xs, canvasHeight) => {
    const newArrow = Map({
        x: player.get("x") + (player.get("w") / 2) - 1,
        y: canvasHeight,
        w: 3
    });
    return addArrow(keys, xs, newArrow);
};

// cleanArrows :: [Arrows] -> [CleanArrows]
const cleanArrows = xs => xs.filter(x => x !== null);

// updateArrows :: [CleanArrows] -> [CleanArrows]
const updateArrows = xs => xs.map(updateArrow);

// getUpdatedArrows :: (Function, Function) -> Function
const getUpdatedArrows = compose(cleanArrows, updateArrows);

// isArrowStrikingBubble :: ((Map<Rect>), (Map<Bubble>)) -> Bool
const isRectStrikingBubble = (rect, bubble) => {
    const bubbleXpos = bubble.get("x");
    const bubble_radius = bubble.get("radius");
    const rectXpos = rect.get("x");
    const rectYpos = rect.get("y");
    const rightBubble = bubbleXpos + bubble_radius;
    const leftBubble = bubbleXpos - bubble_radius;
    const rightRect = rectXpos + rect.get("w");
    const leftRect = rectXpos;
    const rectYPos = rect.get("y");
    const bubbleYPos = bubble.get("y");
    // detect if rect tip is beneath bubble center
    if (rectYPos > bubbleYPos) {
        const dist1 = dist(bubbleXpos - rightRect, bubbleYPos - rectYPos);
        const dist2 = dist(bubbleXpos - leftRect, bubbleYPos - rectYPos);
        return (dist1 < bubble_radius) || (dist2 < bubble_radius);
    }
    // detect if rect tip is above bubble center
    return (rightBubble > leftRect) && (leftBubble < rightRect);
};

// isPlayerHit :: ([Bubbles], (Map<Player>)) -> Bool
// const isPlayerHit = (bubbles, player) => bubbles.reduce((acc, bubble) => acc || isRectStrikingBubble(player, bubble) ? true: false, false);
const isPlayerHit = (bubbles, player) => {
    return bubbles.reduce((acc, x) => {
        return acc || isRectStrikingBubble(player, x) ? true : false;
    }, false);
};

// makeSmallerBubble :: (Number, Number, Bool, String, Number, [StandardBubbles]) -> Map
const makeSmallerBubble = (x, y, dir_right, color, size, xs) => {
    const step = 100;
    return createBubble(
        x, // depends if a right or left-sided bubble
        y,
        dir_right ? step : -step,
        xs.get(size).get("vy_init"),
        color,
        xs.get(size).get("radius"),
        size
    );
};

// createSmallerBubbles :: ((Map<Bubble>), [StandardBubbles]) -> [SmallerBubbles]
const createSmallerBubbles = (bubble, xs) => {
    if (bubble.get("size") === 0) {
        return List.of();
    }
    const x = bubble.get("x");
    const y = bubble.get("y");
    const color = bubble.get("color");
    const size = bubble.get("size");
    return List.of(
        makeSmallerBubble(x, y, false, color, size - 1, xs),
        makeSmallerBubble(x, y, true, color, size - 1, xs)
    );
};

// updateScores :: (Number, [Scores], Map<Bubble>) -> Int
const updateScores = (score, xs, bubble) => {
    if (bubble.get("radius") === 10) {
        return score + xs.get(0);
    }
    if (bubble.get("radius") === 20) {
        return score + xs.get(1);
    }
    if (bubble.get("radius") === 30) {
        return score + xs.get(2);
    }
    if (bubble.get("radius") === 45) {
        return score + xs.get(3);
    }
    return score;
};

// collisionBubblesAndArrows :: ([Arrows], [Bubbles], [StandardBubbles], Int, [Scores])
const collisionBubblesAndArrows = (arrows, bubbles, standardBubbles, score, scores) => {
    for (let i = 0; i < arrows.size; i += 1) {
        for (let j = 0; j < bubbles.size; j += 1) {
            if (isRectStrikingBubble(arrows.get(i), bubbles.get(j))) {
                const newArrows = arrows.delete(i);
                const newBubbles1 = bubbles.delete(j);
                const bubble = bubbles.get(j);
                const newScore = updateScores(score, scores, bubble);
                const newBubbles2 = bubble.get("size") > 0  ? newBubbles1.concat(
                    createSmallerBubbles(bubble, standardBubbles)
                ) : newBubbles1;
                return Map({ arrows: newArrows, bubbles: newBubbles2, score: newScore });
            }
        }
    }
    return Map({ arrows: arrows, bubbles: bubbles, score: score });
};

// // makePair :: ([Arrows], [Bubbles]) -> [(Arrow, Bubble)]
// const makePair = (xs, ys) => {
//     return xs.zip(ys).get(0);
// };

// // noGood :: ([(Arrow, Bubble)]) -> [[NoGoodArrows], [NoGoodBubbles]]
// const noGood = xs => {
//     const ys = xs.filter(x => isRectStrikingBubble(x.get(0), x.get(1)));
//     const zs = ys.reduce((acc, y) => {
//         return acc.update("arrows", arrows => arrows.push(y.get(0))) // eslint-disable-line fp/no-mutating-methods
//                   .update("bubbles", bubbles => bubbles.push(y.get(1))); // eslint-disable-line fp/no-mutating-methods
//     }, Map({ arrows: List.of(), bubbles: List.of()}));
//     return List.of(zs.get("arrows"), zs.get("bubbles"));
// };

// // goodArrows :: ([Arrows], [NoGoodArrows]) -> [GoodArrows]
// const goodArrows = (xs, ys) => {
//     return xs.filter(x => !ys.some(y => y === x));
// };

// // goodBubbles :: ([Bubbles], [NoGoodBubbles], [StandardBubbles])-> [GoodBubbles]
// const goodBubbles = (xs, ys, zs) => {
//     return xs.reduce((acc, x) => {
//         // if x bubble it is in [NoGoodBubbles]
//         if (ys.some(y => y === x)) {
//             // create smaller GoodBubble
//             return acc.concat(createSmallerBubbles(
//                 x, zs
//             ));
//         }
//         return acc;
//     }, List());
// };

// gameOver :: ((Map<Model>, Map<NewModel>)) -> MayBe
const isGameOver = (state, newGameState) => {
    if (!state.get("isGameOver")) {
        return newGameState;
    }
    return state;
};

// updateGame :: ((Map<Model>), [StandardBubbles], [Scores], { String: (Map<Bool>) }, HTML, Number)) -> Map
const updateGame = (state, standardBubbles, scores, keys, Html, dt) => {
    const player = state.get("player");
    const bubbles = state.get("bubbles");
    const arrows = state.get("arrows");
    const score = state.get("score");
    const playerNewXPos = updatePlayerMovement(keys, player, Html.canvas.width);
    const newArrows = getUpdatedArrows(createArrows(keys, player, arrows, Html.canvas.height));
    const tuple = collisionBubblesAndArrows(
        newArrows, bubbles.map(bubble => updateBubble(bubble, standardBubbles, Html.canvas.width, Html.canvas.height)), standardBubbles, score, scores
    );
    const newPlayer = player.merge({ x: playerNewXPos });
    const newGameState = Map({
        bubbles: tuple.get("bubbles"),
        player: newPlayer,
        arrows: tuple.get("arrows"),
        isGameOver: isPlayerHit(tuple.get("bubbles"), newPlayer) || state.get("isGameOver"),
        score: tuple.get("score")
    });
    return isGameOver(state, newGameState);
};

export { updateGame };
