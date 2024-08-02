// https://blog.cristiana.tech/calculating-color-contrast-in-typescript-using-web-content-accessibility-guidelines-wcag

type RGB = [number, number, number];

function luminance(rgb: RGB) {
    const [r, g, b] = rgb.map((v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return r * 0.2126 + g * 0.7152 + b * 0.0722;
};

export function colorContrast(foregroundColor: RGB, backgroundColor: RGB) {
    const foregroundLumiance = luminance(foregroundColor);
    const backgroundLuminance = luminance(backgroundColor);
    return backgroundLuminance < foregroundLumiance
        ? ((backgroundLuminance + 0.05) / (foregroundLumiance + 0.05))
        : ((foregroundLumiance + 0.05) / (backgroundLuminance + 0.05));
};

export function getRgbColorFromHex(hex: string) {
    hex = hex.slice(1);
    const value = parseInt(hex, 16);
    const r = (value >> 16) & 255;
    const g = (value >> 8) & 255;
    const b = value & 255;

    return [r, g, b] as RGB;
};
