import assets from "./assets";
import { List, Map } from "immutable";

const canvas = assets.canvas;

export const Model = Map({
    bubbleArray: List.of(Map({
        x: canvas.width/2,
        y: canvas.height/2,
        vx: 100,
        vy: 200,
        color: "red",
        radius: 25
    }), Map({
        x: canvas.width/2,
        y: canvas.height/2,
        vx: -100,
        vy: 200,
        color: "green",
        radius: 25
    })),
    player: Map({
        x: canvas.width/2,
        w: 20,
        h: 40,
        color: "blue"
    }),
    arrows: List.of()
});
