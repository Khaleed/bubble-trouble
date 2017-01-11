import { List, Map } from "immutable";
import { createBubble } from "./helpers";

const newModel = canvas => {
    const midX = canvas.width/2;
    const midY = canvas.height/2;

    return Map({
        bubbles: List.of(createBubble(midX, midY, 100, 200, "red"), createBubble(midX, midY, -100, 200, "green")),
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
        )});
};

export { newModel };
