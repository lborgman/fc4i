// @ts-check

const version = "0.1.000";
console.log(`here is zoom.js, module, ${version}`);
if (document.currentScript) throw Error("import .currentScript"); // is module

const touchesPositions = undefined;

export function start(evt) {
    const touchLen = evt.touches.length;
    if (touchLen != 2) throw Error(`touchLen == ${touchLen}`);

    posPointHandle = {
        start: {
            clientX,
            clientY,
            jmnodeDragged,
        },
        current: {}
    };

    requestAnimationFrame(requestCheckPointerHandleMove);
}

// "pointermove"