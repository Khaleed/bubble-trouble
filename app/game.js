"use strict";

import assets from "./assets";

(function () {
    let canvas = assets.canvas;
    window.addEventListener("load", () => {
        let ctx;
        if (canvas.getContext === "undefined") {
            console.error("Browser doesn't support HTML5 Canvas");
        }
        ctx = canvas.getContext("2d");
        canvas.width = 600;
        canvas.height = 400;
    });
}());
