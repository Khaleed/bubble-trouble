import { Map } from "immutable";

// createBubble :: (Canvas, Number, Number, String, Number, Number) => Map
const createBubble = (x, y, vx, vy, color, radius=45, size=2) => {
    return Map({
        x: x,
        y: y,
        vx: vx,
        vy: vy,
        color: color,
        radius: radius,
        size: size
    });
};

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

// dist :: (Number, Number) -> Number
const dist = (x, y) => Math.hypot(x, y);

// curry :: (fn) -> fn
const curry = (fn) => {
    const arity = fn.length;
    const curried = (f, init) =>
              (...args) => { // eslint-disable-line fp/no-rest-parameters
                  const acc = [...init, ...args];
                  return acc.length > arity ? f(...acc) : curried(f, acc);
              };
    return curried(fn, []);
};

// partial :: (fn, [...xs]) -> fn
const partial = (fn, ...init) => (...args) => fn(...init, ...args); // eslint-disable-line fp/no-rest-parameters

// compose :: ([...fs]) -> fn
const compose = (...fs) => fs.reduce((f, g) => (...args) => f(g(...args))); // eslint-disable-line fp/no-rest-parameters

// flatten :: [[xs], [ys]] -> [x, y]
const flatten = list => list.reduce((acc, x) => acc.concat(x), []);

export { createBubble, isRectStrikingBubble, dist, partial, curry, compose, flatten };
