const dist = (x, y) => Math.hypot(x, y);

const curry = (fn) => {
    const arity = fn.length;
    const curried = (f, init) =>
              (...args) => { // eslint-disable-line fp/no-rest-parameters
                  const acc = [...init, ...args];
                  return acc.length > arity ? f(...acc) : curried(f, acc);
              };
    return curried(fn, []);
};

const partial = (f, ...init) => (...args) => fn(...init, ...args); // eslint-disable-line fp/no-rest-parameters

const compose = (...fs) => fs.reduce((f, g) => (...args) => f(g(...args))); // eslint-disable-line fp/no-rest-parameters


const callFirst = (fn, larg) =>
          function(...rest) {
              return fn.call(this, larg, ...rest);
          };

export { dist, partial, curry, compose, callFirst };
