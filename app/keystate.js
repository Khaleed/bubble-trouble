/*eslint fp/no-unused-expression: 0, fp/no-nil: 0 */
const KeyState = {
    rightPressedKey: false,
    leftPressedKey: false,
    spacePressedKey: false,
    rPressedKey: false,
    addListeners: function() {
        document.addEventListener("keyup", e => {
            if (e.keyCode === 37) {
                KeyState.leftPressedKey = false;
            } else if (e.keyCode === 39) {
                KeyState.rightPressedKey = false;
            } else if (e.keyCode === 32) {
                KeyState.spacePressedKey = false;
            } else if (e.keyCode === 82) {
                KeyState.rPressedKey = false;
            }
        });
        document.addEventListener('keydown', e => {
            if (e.keyCode === 37) {
                KeyState.leftPressedKey = true;
            } else if (e.keyCode === 39) {
                KeyState.rightPressedKey = true;
            } else if (e.keyCode === 32) {
                KeyState.spacePressedKey = true;
            } else if (e.keyCode === 82) {
                KeyState.rPressedKey = true;
            }
        });
    }
};

export default KeyState;
