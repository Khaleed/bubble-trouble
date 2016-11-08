/*eslint fp/no-unused-expression: 0, fp/no-nil: 0 */
export default {
    rightPressedKey: false,
    leftPressedKey: false,
    spacePressedKey: false,
    rPressedKey: false,
    addListeners: function() {
        document.addEventListener("keyup", e => {
            if (e.keyCode === 37) {
                this.leftPressedKey = false;
            } else if (e.keyCode === 39) {
                this.rightPressedKey = false;
            } else if (e.keyCode === 32) {
                this.spacePressedKey = false;
            } else if (e.keyCode === 82) {
                this.rPressedKey = false;
            }
        });
        document.addEventListener('keydown', e => {
            if (e.keyCode === 37) {
                this.leftPressedKey = true;
            } else if (e.keyCode === 39) {
                this.rightPressedKey = true;
            } else if (e.keyCode === 32) {
                this.spacePressedKey = true;
            } else if (e.keyCode === 82) {
                this.rPressedKey = true;
            }
        });
    }
};
