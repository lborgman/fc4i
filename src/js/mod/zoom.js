// @ts-check

const version = "0.1.000";
console.log(`here is zoom.js, module, ${version}`);
if (document.currentScript) throw Error("import .currentScript"); // is module

const importFc4i = window["importFc4i"];
const modTools = await importFc4i("toolsJs");
const debounceDisplayZoomed = modTools.debounce(displayZoomed);

// const touchesPositions = undefined;

export function start(evt) {
    const touchLen = evt.touches.length;
    if (touchLen != 2) throw Error(`touchLen == ${touchLen}`);

    // requestAnimationFrame(requestCheckPointerHandleMove);
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
    let x = 0, y = 0, scale = 1;
    if (transform !== "none") {
        const matrix = new DOMMatrixReadOnly(transform);
        console.log({ matrix });
        // if (matrix.m22 != 1) throw Error(`matrix.m22 == ${matrix.m22}`);
        // if (matrix.m33 != 1) throw Error(`matrix.m33 == ${matrix.m33}`);
        // if (matrix.m44 != 1) throw Error(`matrix.m44 == ${matrix.m44}`);
        scale = matrix.m11;
        x = matrix.m41;
        y = matrix.m42;
    }
    return { scale, x, y }
}

export function pinchZoom(element) {
    let scaleI;
    let xI;
    let yI;
    function getTransformsI() {
        const transforms = getCssTransforms(element);
        scaleI = transforms.scale;
        xI = transforms.x;
        yI = transforms.y;
    }

    let start = {};

    element.addEventListener('touchstart', (event) => {
        // console.log('touchstart', event);
        if (event.touches.length === 2) {
            event.preventDefault(); // Prevent page scroll

            // Calculate where the fingers have started on the X and Y axis
            start.x = (event.touches[0].pageX + event.touches[1].pageX) / 2;
            start.y = (event.touches[0].pageY + event.touches[1].pageY) / 2;
            start.distance = distance(event);

            getTransformsI();
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
            // element.style.zIndex = "9999";
            debounceDisplayZoomed(scaleB);
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

/**
 * 
 * @param {HTMLElement} elt 
 * @param {number} amount 
 */
function changeScale(elt, amount) {
    const transforms = getCssTransforms(elt);
    const oldScale = transforms.scale;
    let scale = oldScale * amount;
    if (amount < 1 && oldScale > 1) scale = Math.max(1, scale);
    if (amount > 1 && oldScale < 1) scale = Math.min(1, scale);
    if (0.95 < scale && scale < 1.05) scale = 1;
    // const x = transforms.x;
    // const y = transforms.y;
    // elt.style.transform = `translate(${x}, ${y}) scale(${scale})`;
    elt.style.transform = `scale(${scale})`;
    displayZoomed(scale);
}

/**
 * 
 * @param {HTMLElement} elt 
 * @param {string} inOrOut 
 * @returns 
 */
function mkZoomButton(elt, inOrOut) {
    let dir = inOrOut;
    let amount = 1.2;
    switch (inOrOut) {
        case "-":
            amount = 1 / amount;
            break;
        case "+":
            break;
        default:
            throw Error(`Bad parameter inOrOut: ${inOrOut}`);
    }
    const btn = document.createElement("button");
    btn.textContent = dir;
    btn.title = `Zoom ${dir}`;
    // @ts-ignore
    btn.style = `
        aspect-ratio: 1 / 1;
        width: 32px;
        background-color: transparent;
        font-size: 24px;
        border: none;
    `;
    btn.addEventListener("click", () => {
        console.log("btn ", dir, amount);
        changeScale(elt, amount);
    });
    return btn;
}

const idDisplayZoomed = "display-zoomed";
function mkDisplayZoomed() {
    const div = document.createElement("div");
    div.textContent = "100%";
    div.id = idDisplayZoomed;
    // @ts-ignore
    div.style = `
        display: inline-flex;
        align-items: center;
        NOpadding: 4px;
    `;
    return div;
}
function displayZoomed(scaled) {
    const perc = Math.round(scaled * 100);
    const elt = document.getElementById(idDisplayZoomed);
    // @ts-ignore
    elt.textContent = `${perc}%`;
}


/**
 * 
 * @param {HTMLElement} elt 
 * @param {string} horOrVer 
 * @returns 
 */
export function mkZoomButtons(elt, horOrVer) {
    console.log({ elt, horOrVer });
    if (!(elt instanceof HTMLElement)) throw Error("elt is not HTMLElement");
    const tofHorOrVer = typeof horOrVer;
    if ("string" != tofHorOrVer) throw Error(`Expected string, got ${tofHorOrVer}`);

    const btnPlus = mkZoomButton(elt, "+");
    const btnMinus = mkZoomButton(elt, "-");
    const eltZoomed = mkDisplayZoomed();
    const cont = document.createElement("div");
    cont.appendChild(btnPlus);
    cont.appendChild(eltZoomed);
    cont.appendChild(btnMinus);
    // @ts-ignore
    cont.style = `
        display: flex;
    `;
    return cont;
}