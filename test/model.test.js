/*eslint fp/no-unused-expression: 0, fp/no-nil: 0 */
import { isRectStrikingBubble } from "../app/update";
import { List, Map } from "immutable";

const bubbles = List.of(Map({
    x: 100,
    y: 200,
    radius: 25
}), Map({
    x: 100,
    y: 400,
    radius: 25
}));

const arrows = List.of(
    Map({
        x: 100,
        y: 600,
        w: 3
    })
);

describe("it is a function that tests if arrow and bubble are colliding ", () => {
    it("it returns a bool", () => {
        expect(isRectStrikingBubble(bubbles.get(0), arrows.get(0))).toBe(false);
        expect(isRectStrikingBubble(bubbles.get(1), arrows.get(0))).toBe(true);
    });
});
