# Bubble Trouble

This is an implementation of the retro game Bubble Trouble. 

## Instructions

- The player must shoot the bubbles before they collide with the player to complete each level. 
- The bubbles randomly bounce around the screen in different velocities. 
- All bubbles split-up into two smaller bubbles when shot except the smallest one in the list of standard bubbles. 
- Each level comes with it's own scene and degree of difficulty. 
- You'll be able to play the game [here](https://khaleed.github.io/bubble-trouble) :video_game:

## Approach

- Drawing on the [HTML5 Canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API), the game loop, and collision detection are all done without any libraries or frameworks. 
- This project is written in a functional style using the [Elm Architecture](https://guide.elm-lang.org/architecture/). 
- It's not purely functional because of the limitations of JavaScript and [I/O](https://en.wikipedia.org/wiki/Input/output) being inheritently impure. 
- Instead of deep cloning objects and arrays for immutability, [Immutable JS](http://facebook.github.io/immutable-js/docs/#/) - a persistent data structures library, is used.

## Installation

### Dependencies

First you need to install `yarn` by following instructions on the Yarn [documentation](https://yarnpkg.com/en/docs/install) or just use npm 

To get dependencies

`yarn install` or `npm install`

Install [Webpack](https://webpack.js.org/) globally 

`yarn global add webpack-devserver webpack` or `npm install webpack-devserver webpack -g`

### Server

To serve at http://localhost:3000/public using [Webpack](https://webpack.js.org/)

`yarn run watch` or `npm run watch`

### Build

To build when NODE_ENV environmental variable is set to production

`yarn run deploy` or `npm run deploy`

### Test

To run tests using [Jest](https://facebook.github.io/jest/)

`yarn run test` or `npm run test`

## Contributing

[Ralph Barton](https://github.com/ralphbarton)

## Tasks

- [x] Finish prototype
- [x] Add scores
- [ ] Complete units tests
- [ ] Add lives and levels 
- [ ] Add sprites and sound

## License

Bubble Trouble is released under the <a href="https://opensource.org/licenses/MIT">The MIT License<a/>.

<a href='http://www.recurse.com' title='Made with love at the Recurse Center'><img src='https://cloud.githubusercontent.com/assets/2883345/11322975/9e575dce-910b-11e5-9f47-1fb1b530a4bd.png' height='75px'/></a> 

