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

export { createBubble, dist, partial, curry, compose, flatten };
