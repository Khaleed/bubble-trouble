import { List, Map } from "immutable";
import { callFirst } from "./helpers";

// createBubble :: (Canvas, Number, Number, String, Number, Number) => Map
const createBubble = (canvas, vx, vy, color, radius=25, size=2) => {
    return Map({
        x: canvas.width/2,
        y: canvas.height/2,
        vx: vx,
        vy: vy,
        color: color,
        radius: radius,
        size: size
    });
};

const createModel = canvas => {
    // return Model based on canvas
    // use createBubble -> canvas
};

// createBubbleInCanvas :: (Function, Canvas) -> Bubble
const createBubbleInCanvas = callFirst(createBubble, canvas);

const Model = Map({
    bubbles: List.of(createBubbleInCanvas(100, 200, "red"), createBubbleInCanvas(-100, 200, "green")),
    player: Map({
        x: canvas.width/2,
        w: 20,
        h: 40,
        y: canvas.height - 40,
        color: "blue"
    }),
    arrows: List.of(),
    standardBubbles: List.of(
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
    )
});

export { Model };
