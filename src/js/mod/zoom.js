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

export function pinchZoom(element) {
    let elementScale = 1;

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

            // Safari provides event.scale as two fingers move on the screen
            // For other browsers just calculate the scale manually
            let scale;
            if (event.scale) {
                scale = event.scale;
            } else {
                const deltaDistance = distance(event);
                scale = deltaDistance / start.distance;
            }
            elementScale = Math.min(Math.max(1, scale), 4);

            // Calculate how much the fingers have moved on the X and Y axis
            const deltaX = (((event.touches[0].pageX + event.touches[1].pageX) / 2) - start.x) * 2; // x2 for accelarated movement
            const deltaY = (((event.touches[0].pageY + event.touches[1].pageY) / 2) - start.y) * 2; // x2 for accelarated movement

            // Transform the image to make it grow and move with fingers
            const transform = `translate3d(${deltaX}px, ${deltaY}px, 0) scale(${elementScale})`;
            element.style.transform = transform;
            element.style.WebkitTransform = transform;
            element.style.zIndex = "9999";
        }
    });

    element.addEventListener('touchend', (event) => {
        // console.log('touchend', event);
        // Reset image to it's original format
        element.style.transform = "";
        element.style.WebkitTransform = "";
        element.style.zIndex = "";
    });
}

