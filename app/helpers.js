const dist = (x, y) => Math.hypot(x, y);

const curry = (fn) => {
    const curried = (f, init) =>
              (...args) => { // eslint-disable-line fp/no-rest-parameters
                  const acc = [...init, ...args];
                  const arity = f.length;
                  return acc.length > arity ? f(...acc) : curried(f, acc);
              };
    return curried(fn, []);
};

const compose = (...fs) => fs.reduce((f, g) => (...args) => f(g(...args))); // eslint-disable-line fp/no-rest-parameters

export { dist, curry, compose };
