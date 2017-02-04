import { List, Map, Set } from "immutable";
import { partial, curry, compose, flatten } from "./helpers";
import { createBubble, dist } from "./helpers";

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

// updateBubble :: (Bubble, [StandardBubbles]) -> (Map<Bubble>)
const updateBubble = (bubble, standardBubbles) => {
    const vX = bubble.get("vx");
    const vY = bubble.get("vy");
    const radius = bubble.get("radius");
    const dt = 0.02;
    const g = 200;
    const newVY = getNewVY(vY, dt, g);
    const newX = getNewX(bubble.get("x"), dt, vX);
    const newY = getNewY(bubble.get("y"), dt, newVY);
    const std_vy = standardBubbles.get(bubble.get("size")).get("vy_init");
    const isXreflecting = doReflectX(newX, radius, 800);
    const isYtopReflecting = doReflectYtop(newY, radius, 600);
    const isYbottomReflecting = doReflectYbottom(newY, radius, 600);
    return bubble.merge(
        Map({
            x: newX,
            y: newY,
            vx: isXreflecting ? vX * -1 : vX,
            vy: isYtopReflecting ? -newVY : (isYbottomReflecting ? std_vy : newVY)// this is not constant due to gravity
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
const isPlayerShooting = (keys, arrows) => keys.state.get("isSpaceKeyPressed") && arrows.size === 0;

// createArrow :: ({ String: (Map<Bool>) }, [Arrows], (Map<Arrow>)) -> [Arrows]
const createArrows = (keys, arrows, newArrow) => isPlayerShooting(keys, arrows) ? arrows.push(newArrow) : arrows;

// getNewArrows :: ({ String: (Map<Bool>) }, Map, List, Number) -> [Arrows]
const getArrows = (keys, player, arrows, canvasHeight) => {
    const newArrow = Map({
        x: player.get("x") + (player.get("w") / 2) - 1,
        y: canvasHeight,
        w: 3
    });
    return createArrows(keys, arrows, newArrow);
};

// filterArrows :: [Arrows] -> [Arrows]
const filterArrows = xs => xs.filter(x => x !== null);

// updateArrows :: [Arrows] -> [Arrows]
const updateArrows = xs => xs.map(updateArrow);

// getUpdatedArrows :: (Function, Function) -> Function
const getUpdatedArrows = compose(filterArrows, updateArrows);

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
const isPlayerHit = (xs, player) => xs.reduce((acc, x) => acc || isRectStrikingBubble(player, x) ? true: false, false);

// makeSmallerBubble :: (Number, Number, Bool, String, Number, Map<StandardBubble>) -> Map
const makeSmallerBubble = (x, y, dir_right, color, size, standardBubbles) => {
    const step = 100;
    return createBubble(
        x, // depends if a right or left-sided bubble
        y,
        dir_right ? step : -step,
        standardBubbles.get(size).get("vy_init"),
        color,
        standardBubbles.get(size).get("radius"),
        size
    );
};

// getSmallerBubbles :: ((Map<Bubble>), [StandardBubbles]) -> [SmallerBubbles]
const createSmallerBubbles = (bubble, standarBubbles) => {
    if (bubble.get("size") === 0) {
        return List.of();
    }
    const x = bubble.get("x");
    const y = bubble.get("y");
    const color = bubble.get("color");
    const size = bubble.get("size");
    return List.of(
        makeSmallerBubble(x, y, false, color, size - 1, standarBubbles),
        makeSmallerBubble(x, y, true, color, size - 1, standarBubbles)
    );
};

// updateScores :: (Number, [Scores], Map<Bubble>) -> Int
const updateScores = (score, scores, bubble) => {
    if (bubble.get("radius") === 10) {
        return score + scores.get(0);
    }
    if (bubble.get("radius") === 20) {
        return score + scores.get(1);
    }
    if (bubble.get("radius") === 30) {
        return score + scores.get(2);
    }
    if (bubble.get("radius") === 45) {
        return score + scores.get(3);
    }
    return score;
};

// makePair :: ([Arrows], [Bubbles]) -> [(Arrows, Bubbles)]
const makePair = (xs, ys) => {
    return xs.map(x => flatten(ys.map(y => List.of(x, y))));
};

// noGood :: ([(Arrows, Bubbles)], [NoGoodArrows]) -> [(NoGoodArrows, NoGoodBubbles)]
const noGood = xs => {
    const ys = xs.filter(x => isRectStrikingBubble(x.get(0), x.get(1)));
    const zs = ys.reduce((acc, y) => {
        return acc.update("arrows", arrows => arrows.push(y.get(0)))
                  .update("bubbles", bubbles => bubbles.push(y.get(1)));
    }, Map({ arrows: List(), bubbles: List()}));
    return List.of(zs.get("arrows"), zs.get("bubbles"));
};

// goodArrows :: ([Arrows], [NoGoodArrows]) -> [GoodArrows]
const goodArrows = (xs, ys) => {
    return xs.filter(x => !ys.some(y => y === x));
};

// goodBubbles :: ([Bubbles], [NoGoodBubbles], [StandardBubbles])-> [GoodBubbles]
const goodBubbles = (xs, ys, zs) => {
    return xs.reduce((acc, x) => {
        // if x bubble it is in [NoGoodBubbles]
        if (ys.some(y => y === x)) {
            // create smaller GoodBubble
            return acc.concat(createSmallerBubbles(
                x, zs
            ));
        }
        return acc;
    }, List());
};

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
    const makeArrows = getArrows(keys, player, arrows, Html.canvas.height);
    const newArrows = getUpdatedArrows(makeArrows);
    const newBubbles = bubbles.map(bubble => updateBubble(bubble, standardBubbles));
    const collisions = noGood(makePair(newArrows, newBubbles));
    const nonCollisionArrows = goodArrows(newArrows, collisions.get("arrows"));
    const nonCollisionBubbles = goodBubbles(newBubbles, collisions.get("bubbles"), standardBubbles);
    const newPlayer = player.merge({x: playerNewXPos});
    const newGameState = Map({
        bubbles: nonCollisionBubbles,
        player: newPlayer,
        arrows: nonCollisionArrows,
        isGameOver: isPlayerHit(nonCollisionBubbles, newPlayer) || state.get("isGameOver")
    });
    return isGameOver(state, newGameState);
};

export { updateGame };
