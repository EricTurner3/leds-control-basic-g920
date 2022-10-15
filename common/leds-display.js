"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ledsDisplay = void 0;
var led_patterns_1 = require("./constants/led-patterns");
var ledsDisplay = function (val, ledsArray) {
    val = Math.round(val * 100);
    if (val > 84) {
        return ledsArray[0];
    }
    else if (val > 69) {
        return ledsArray[1];
    }
    else if (val > 39) {
        return ledsArray[2];
    }
    else if (val > 19) {
        return ledsArray[3];
    }
    else if (val > 4) {
        return ledsArray[4];
    }
    else {
        return led_patterns_1.DEFAULT_LEDS_STATE;
    }
};
exports.ledsDisplay = ledsDisplay;
//# sourceMappingURL=leds-display.js.map