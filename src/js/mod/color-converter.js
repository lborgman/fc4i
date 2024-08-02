// https://stackoverflow.com/questions/1573053/javascript-function-to-convert-color-names-to-hex-codes/47355187#47355187
const color_convert = function () {
    var pub = {}, canvas, context;
    canvas = document.createElement('canvas');
    canvas.height = 1;
    canvas.width = 1;
    context = canvas.getContext('2d');

    function byte_to_hex(byte) {
        // Turns a number (0-255) into a 2-character hex number (00-ff)
        return ('0' + byte.toString(16)).slice(-2);
    }

    pub.to_rgba_array = function (color) {
        /**
         * Turns any valid canvas fillStyle into a 4-element Uint8ClampedArray with bytes
         * for R, G, B, and A. Invalid styles will return [0, 0, 0, 0]. Examples:
         * color_convert.to_rgb_array('red')  # [255, 0, 0, 255]
         * color_convert.to_rgb_array('#ff0000')  # [255, 0, 0, 255]
         * color_convert.to_rgb_array('garbagey')  # [0, 0, 0, 0]
         */
        // Setting an invalid fillStyle leaves this unchanged
        context.fillStyle = 'rgba(-1,-1,-1,-1)';
        // We're reusing the canvas, so fill it with something predictable
        context.clearRect(0, 0, 1, 1);
        context.fillStyle = color;
        context.fillRect(0, 0, 1, 1);
        return context.getImageData(0, 0, 1, 1).data;
    }

    pub.to_rgba = function (color) {
        /**
         * Turns any valid canvas fill style into an rgba() string. Returns
         * 'rgba(0,0,0,0)' for invalid colors. Examples:
         * color_convert.to_rgba('red')  # 'rgba(255,0,0,1)'
         * color_convert.to_rgba('#f00')  # 'rgba(255,0,0,1)'
         * color_convert.to_rgba('garbagey')  # 'rgba(0,0,0,0)'
         * color_convert.to_rgba(some_pattern)  # Depends on the pattern
         *
         * @param color  A string, pattern, or gradient
         * @return  A valid rgba CSS color string
         */
        var a = pub.to_rgba_array(color);
        return 'rgba(' + a[0] + ',' + a[1] + ',' + a[2] + ',' + (a[3] / 255) + ')';
    }

    pub.to_hex = function (color) {
        /**
         * Turns any valid canvas fill style into a hex triple. Returns
         * '#000000' for invalid colors. Examples:
         * color_convert.to_hex('red')  # '#ff0000'
         * color_convert.to_hex('rgba(255,0,0,1)')  # '#ff0000'
         * color_convert.to_hex('garbagey')  # '#000000'
         * color_convert.to_hex(some_pattern)  # Depends on the pattern
         *
         * @param color  A string, pattern, or gradient
         * @return  A valid rgba CSS color string
         */
        var a = pub.to_rgba_array(color);
        // Sigh, you can't map() typed arrays
        var hex = [0, 1, 2].map(function (i) { return byte_to_hex(a[i]) }).join('');
        return '#' + hex;
    }

    return pub;
}();

export function toRgba(color) {
    const res = color_convert.to_rgba(color);
    if (res == "rgba(-1,-1,-1,-1)") throw Error(`Invalid color ${color}`);
    return res;
}
export function toRgbaArr(color) {
    const res = color_convert.to_rgba_array(color);
    if (res.join(",") == "-1,-1,-1,-1") throw Error(`Invalid color ${color}`);
    return res;
}
export function arrToRgba(arrColor) {
    const a = arrColor;
    return `rgba(${a[0]},${a[1]},${a[2]},${a[3]/255})`;
}
export function toHex6(color) {
    const res = color_convert.to_hex(color);
    return res;
}

// https://stackoverflow.com/questions/47022484/in-js-find-the-color-as-if-it-had-0-5-opacity-on-a-white-background
export function computeMixed(fgColor, bgColor) {
    const arrBg = color_convert.to_rgba_array(bgColor);
    if (arrBg[3] != 255) {
        throw Error(`Background must be opaque: ${bgColor}`);
    }
    const arrFg = color_convert.to_rgba_array(fgColor);
    if (!arrFg[3] == 255) { return toRgba(fgColor); }

    const alpha = arrFg[3] / 255;
    // newComponent = floor(oldComponent x alpha + backgroundComponent x (1 - alpha)) 
    const newComponent = (fgComp, bgComp) => Math.floor(fgComp * alpha + bgComp * (1 - alpha));
    const arrRes = [];
    [0, 1, 2].forEach(i => { arrRes[i] = newComponent(arrFg[i], arrBg[i])});
    return `rgb(${arrRes.join(",")})`;
}