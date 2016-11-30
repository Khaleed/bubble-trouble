/*eslint fp/no-unused-expression: 0, fp/no-nil: 0, fp/no-mutation: 0*/
import { Map } from "immutable";

export const keys = {
    state: Map({
        isRightKeyPressed: false,
        isLeftKeyPressed: false,
        isSpaceKeyPressed: false,
        isRKeyPressed: false
    })
};

export function interrogateKeyState(keys) {
    document.addEventListener("keyup", e => {
        if (e.keyCode === 37) {
            keys.state = keys.state.set("isLeftKeyPressed", false);
        } else if (e.keyCode === 39) {
            keys.state = keys.state.set("isRightKeyPressed", false);
        } else if (e.keyCode === 32) {
            keys.state = keys.state.set("isSpaceKeyPressed", false);
        } else if (e.keyCode === 82) {
            keys.state = keys.state.set("isRKeyPressed", false);
        }
    });

    document.addEventListener("keydown", e => {
        if (e.keyCode === 37) {
            keys.state = keys.state.set("isLeftKeyPressed", true);
        } else if (e.keyCode === 39) {
            keys.state = keys.state.set("isRightKeyPressed", true);
        } else if (e.keyCode === 32) {
            keys.state = keys.state.set("isSpaceKeyPressed", true);
        } else if (e.keyCode === 82) {
            keys.state = keys.state.set("isRKeyPressed", true);
        }
    });
}

