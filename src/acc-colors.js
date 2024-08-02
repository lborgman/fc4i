"use strict";
// https://blog.cristiana.tech/calculating-color-contrast-in-typescript-using-web-content-accessibility-guidelines-wcag
function luminance(rgb) {
    const _a = rgb.map(function (v) {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    }), r = _a[0], g = _a[1], b = _a[2];
    return r * 0.2126 + g * 0.7152 + b * 0.0722;
}

export function colorContrast(fgColor, bgColor) {
    const fgColor3 = webBrowserColorToRgb3(fgColor);
    const bgColor3 = webBrowserColorToRgb3(bgColor);
    const foregroundLumiance = luminance(fgColor3);
    const backgroundLuminance = luminance(bgColor3);
    return backgroundLuminance > foregroundLumiance
        ? ((backgroundLuminance + 0.05) / (foregroundLumiance + 0.05))
        : ((foregroundLumiance + 0.05) / (backgroundLuminance + 0.05));
}

///////////////////////////
// The functions below should handle the format you get from the web browser
export function webBrowserColorToRgb3(color) {
    if (color.slice(0,1 ) === "#") {
        return hexToRgb3(color);
    }
    if (color.slice(0,4) === "rgb(" || color.slice(0,5) === "rgba(") {
        return rgbTo3(color);
    }
    return colorNameToRgba(color);
}
export function hexToRgb3(hex) {
    hex = hex.slice(1);
    const value = parseInt(hex, 16);
    const r = (value >> 16) & 255;
    const g = (value >> 8) & 255;
    const b = value & 255;
    return [r, g, b];
}
export function rgbTo3(rgb) {
    // Choose correct separator
    let sep = rgb.indexOf(",") > -1 ? "," : " ";
    // Turn "rgb(r,g,b)" into [r,g,b]
    const rgb3 = rgb.substr(4).split(")")[0].split(sep);
    return rgb3;
}

// https://stackoverflow.com/questions/26414770/getting-the-rgb-values-for-a-css-html-named-color-in-javascript
export function colorNameToRgba(htmlColorName) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.fillStyle = htmlColorName;
    context.fillRect(0,0,1,1);
    const rgba = context.getImageData(0,0,1,1).data;
    // https://stackoverflow.com/questions/29847988/convert-uint8clampedarray-to-regular-array
    const arrRgba = Array.from(rgba);
    if (JSON.stringify(arrRgba) == JSON.stringify([0, 0, 0, 255])) {
        if (htmlColorName != "black") return undefined;
    }
    return arrRgba;
}