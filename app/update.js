import { List, Map, Set, OrderedSet } from "immutable";
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

// updateArrow :: (Map<Arrow>) -> Maybe
const updateArrow = arrow => {
    const step = 10;
    if (arrow === null) {
        return null; // could use a Maybe
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
    return playerX + (isMovingleft ? -step: 0) + (isMovingRight ? step: 0);
};

// isPlayerShooting :: ({ String: (Map<Bool>) }, [Arrows]) -> Bool
const isPlayerShooting = (keys, xs) => keys.state.get("isSpaceKeyPressed") && xs.size === 0;

// createArrow :: ({ String: (Map<Bool>) }, [Arrows], (Map<Arrow>)) -> [NewArrows]
const addArrow = (keys, xs, arrow) => isPlayerShooting(keys, xs) ? xs.push(arrow) : xs; // eslint-disable-line fp/no-mutating-methods

// getNewArrows :: ({ String: (Map<Bool>) }, (Map<Player>), [Arrows], Number) -> [Arrows]
const createArrows = (keys, player, xs, canvasHeight) => addArrow(keys, xs, Map({ x: player.get("x") + (player.get("w") / 2) - 1, y: canvasHeight, w: 3 }));

// cleanArrows :: [Arrows] -> [CleanArrows]
const cleanArrows = xs => xs.filter(x => x !== null);

// updateArrows :: [CleanArrows] -> [CleanArrows]
const updateArrows = xs => xs.map(updateArrow);

// getUpdatedArrows :: (Function, Function) -> Function
const getUpdatedArrows = compose(cleanArrows, updateArrows);

// isPlayerHit :: ([Bubbles], (Map<Player>)) -> Bool
const isPlayerHit = (xs, player) => xs.reduce((acc, x) => acc || isRectStrikingBubble(player, x) ? true: false, false);

// makeSmallerBubble :: (Number, Number, Number, String, Number, [StandardBubbles]) -> Map
const makeSmallerBubble = (x, y, dir_right, color, size, xs) => {
    const step = 100;
    const deltaInMovement = dir_right ? step: - step;
    return createBubble(x, y, deltaInMovement, xs.get(size).get("vy_init"), color, xs.get(size).get("radius"), size);
};

// createSmallerBubbles :: ((Map<Bubble>), [StandardBubbles]) -> [SmallerBubbles]
const createSmallerBubbles = (bubble, xs) => {
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

// splitBubble :: (Map<Bubble>, [StandardBubbles]) -> [SmallerBubbles] || []
const splitBubble = (bubble, standardBubbles) => bubble.get("size") > 0 ? createSmallerBubbles(bubble, standardBubbles) : List.of();

// permutations :: (xs, ys) -> [x, y]
const permutations = (xs, ys) => xs.reduce((acc, x) => acc.concat(ys.map(
    y => [x, y]
)), List());

// collisionBubblesAndArrows :: ([Arrows], [Bubbles], [StandardBubbles], Int, [Scores]) -> Map(<Arrows, Bubbles, Score>)
const collisionBubblesAndArrows1 = (arrows, bubbles, standardBubbles, score, scores) => {
    return permutations(arrows, bubbles).reduce(
        (acc, [arrow, bubble]) => {
            const struck = isRectStrikingBubble(arrow, bubble);
            return Map({
                arrows: struck ? acc.get("arrows").delete(arrow) : acc.get("arrows"),
                bubbles: struck ?
                    acc.get("bubbles").delete(bubble).concat(splitBubble(bubble, standardBubbles)) :
                    acc.get("struckBubbles").has(bubble) ?
                    acc.get("bubbles") :
                    acc.get("bubbles").add(bubble),
                score: struck ? updateScores(acc.get("score"), scores, bubble) : acc.get("score"),
                struckBubbles: struck ? acc.get("struckBubbles").add(bubble) : acc.get("struckBubbles")
            });
        } , Map({
            arrows: arrows.toOrderedSet(),
            bubbles: bubbles.toOrderedSet(),
            score,
            struckBubbles: Set()
        })
    ).update("arrows", set => set.toList())
        .update("bubbles", set => set.toList())
        .delete("struckBubbles");
};

// isGameOver :: ((Map<Model>, Map<NewModel>)) -> MayBe
const isGameOver = (state, newGameState) => {
    if (!state.get("isGameOver")) {
        return newGameState;
    }
    return state;
};

// updateGame :: ((Map<Model>), [StandardBubbles], [Scores], { String: (Map<Bool>) }, HTML, Number)) -> Map<Bubbles, Player, Arrows, IsGameOver, Score>
const updateGame = (state, standardBubbles, scores, keys, Html, dt) => {
    const player = state.get("player");
    const bubbles = state.get("bubbles");
    const arrows = state.get("arrows");
    const score = state.get("score");
    const playerNewXPos = updatePlayerMovement(keys, player, Html.canvas.width);
    const newArrows = getUpdatedArrows(createArrows(keys, player, arrows, Html.canvas.height));
    const newBubbles = bubbles.map(bubble => updateBubble(bubble, standardBubbles, Html.canvas.width, Html.canvas.height));
    const tuple = collisionBubblesAndArrows(
        newArrows, bubbles.map(bubble => updateBubble(bubble, standardBubbles, Html.canvas.width, Html.canvas.height)), standardBubbles, score, scores
    );
    const newPlayer = player.merge({ x: playerNewXPos });
    const newGameState = Map({
        bubbles: tuple.get("bubbles"),
        player: newPlayer,
        arrows: tuple.get("arrows"),
        isGameOver: isPlayerHit(tuple.get("bubbles"), newPlayer) || state.isGameOver,
        score: tuple.get("score")
    });
    return isGameOver(state, newGameState);
};

export { updateGame };
