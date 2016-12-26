import  { default as Html } from "./html";
import { List, Map } from "immutable";

const canvas = Html.canvas;

const Model = Map({
    bubbles: List.of(Map({
        x: canvas.width/2,
        y: canvas.height/2,
        vx: 100,
        vy: 200,
        color: "red",
        radius: 25,
        size: 2
    }), Map({
        x: canvas.width/2,
        y: canvas.height/2,
        vx: -100,
        vy: 200,
        color: "green",
        radius: 25,
        size: 2
    })),
    player: Map({
        x: canvas.width/2,
        w: 20,
        h: 40,
        y: canvas.height - 40,
        color: "blue"
    }),
    arrows: List.of()
});

// default data
const standardBubbles = List.of(
    Map({
        // size === 0
        vy_init: -200,
        radius: 10
    }),
    Map({
        // size === 1
        vy_init: -300,
        radius: 20
    }),
    Map({
        // size === 2
        vy_init: -400,
        radius: 30
    }),
    Map({
        // size === 3
        vy_init: -550,
        radius: 45
    })
);

const standard_vx = 100;

//construct bubble
const constructBubble = (x, y, direction_right, color, size) => Map({
    x: x,
    y: y,
    vx: direction_right ? standard_vx : -standard_vx,
    vy: standardBubbles.get(size).get("vy_init"),
    color: color,
    radius: standardBubbles.get(size).get("radius"),
    size: size
});

export { Model, constructBubble, standardBubbles };
