/* eslint fp/no-unused-expression: 0, fp/no-nil: 0 */
import { isRectStrikingBubble } from "../app/helpers";
import { List, Map } from "immutable";

const bubbles = List.of(
    Map({
        x: 100,
        y: 600,
        radius: 25
    }), Map({
        x: 200,
        y: 260,
        radius: 25
    })
);

const arrows = List.of(
    Map({
        x: 100,
        y: 600,
        w: 3
    })
);

const player = Map({
    x: 200,
    y: 260,
    w: 20,
    h: 40,
    color: "blue"
});

describe("it is a function that tests if arrow and bubble are colliding ", () => {
    it("it returns a bool", () => {
        expect(isRectStrikingBubble(arrows.get(0), bubbles.get(0))).toBe(true);
        expect(isRectStrikingBubble(arrows.get(0), bubbles.get(1))).toBe(false);
    });
});

describe("it is a function that tests if player and bubble are colliding ", () => {
    it("it returns a bool", () => {
        expect(isRectStrikingBubble(player, bubbles.get(1))).toBe(true);
    });
});
