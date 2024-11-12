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


///// https://apex.oracle.com/pls/apex/vmorneau/r/pinch-and-zoom/pinch-and-zoom-js
///// https://stackoverflow.com/questions/74010960/how-to-implement-pinch-zoom-in-zoom-out-using-javascript

// Calculate distance between two fingers
const distance = (event) => {
    return Math.hypot(event.touches[0].pageX - event.touches[1].pageX, event.touches[0].pageY - event.touches[1].pageY);
};

export function getCssTransforms(elt) {
    const style = getComputedStyle(elt);
    const transform = style.transform;
    if (transform === "none") return;
    const matrix = new DOMMatrixReadOnly(transform);
    console.log({ matrix });
    if (matrix.m22 != 1) throw Error(`matrix.m22 == ${matrix.m22}`);
    if (matrix.m33 != 1) throw Error(`matrix.m33 == ${matrix.m33}`);
    if (matrix.m44 != 1) throw Error(`matrix.m44 == ${matrix.m44}`);
    const scale = matrix.m11;
    const x = matrix.m41;
    const y = matrix.m42;
    return { scale, x, y}
}

export function pinchZoom(element) {
    const transforms = getCssTransforms(element);
    const scaleI = transforms?.scale || 1;
    const xI = transforms?.x || 0;
    const yI = transforms?.y || 0;


    let start = {};


    element.addEventListener('touchstart', (event) => {
        // console.log('touchstart', event);
        if (event.touches.length === 2) {
            event.preventDefault(); // Prevent page scroll

            // Calculate where the fingers have started on the X and Y axis
            start.x = (event.touches[0].pageX + event.touches[1].pageX) / 2;
            start.y = (event.touches[0].pageY + event.touches[1].pageY) / 2;
            start.distance = distance(event);
        }
    });

    element.addEventListener('touchmove', (event) => {
        // console.log('touchmove', event);
        if (event.touches.length === 2) {
            event.preventDefault(); // Prevent page scroll

            const deltaDistance = distance(event);
            const scaleD = deltaDistance / start.distance;
            const minScale = 0.5;
            const maxScale = 4;
            const scaleB = Math.min(Math.max(minScale, scaleD * scaleI), maxScale);

            // Calculate how much the fingers have moved on the X and Y axis
            const xD = (((event.touches[0].pageX + event.touches[1].pageX) / 2) - start.x) * 2; // x2 for accelarated movement
            const yD = (((event.touches[0].pageY + event.touches[1].pageY) / 2) - start.y) * 2; // x2 for accelarated movement

            const xB = xD + xI;
            const yB = yD + yI;
            // FIX-ME: keep element inside some boundaries

            // Transform the image to make it grow and move with fingers
            const transform = `translate3d(${xB}px, ${yB}px, 0) scale(${scaleB})`;
            element.style.transform = transform;
            element.style.zIndex = "9999";
        }
    });

    /*
    element.addEventListener('touchend', (event) => {
        // console.log('touchend', event);
        // Reset image to it's original format
        element.style.transform = "";
        element.style.zIndex = "";
    });
    */
}

