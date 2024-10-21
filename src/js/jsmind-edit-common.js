// @ts-check

const version = "0.1.001";
console.log(`here is jsmind-edit-common.js, module, ${version}`);
if (document.currentScript) throw Error("import .currentScript"); // is module

// @ts-ignore
const importFc4i = window.importFc4i;
// @ts-ignore
const mkElt = window.mkElt;
// @ts-ignore
const jsMind = window.jsMind;
if (!jsMind) { throw Error("jsMind is not setup"); }

// Circular import
// const modCustRend = await importFc4i("jsmind-cust-rend");

// FIX-ME: comment out temporary!
const modMMhelpers = await importFc4i("mindmap-helpers");
const modMdc = await importFc4i("util-mdc");
const modTools = await importFc4i("toolsJs");
const modFsm = await importFc4i("mm4i-fsm");
window["fsm"] = modFsm.fsm;

class PointHandle {
    static sizePointHandle = 20;
    // static diffPointHandle = 60;

    static myStates = ["idle", "init", "dist", "move"];
    #myState;
    // #pointerType;
    #diffPointHandle = 1;

    /** @type {HTMLElement} */ #eltPointHandle;
    /** @type {HTMLElement} */ #jmnodesPointHandle;

    /**
     * 
     * @param {string} state 
     * @returns {number}
     */
    static idxState(state) { return PointHandle.myStates.indexOf(state); }
    /**
     * 
     * @param {string} state 
     * @returns {boolean}
     */
    static knownState(state) { return PointHandle.idxState(state) > -1; }

    get #state() { return this.#myState; }
    set #state(state) {
        const idxOld = PointHandle.idxState(this.#myState);
        const idxNew = PointHandle.idxState(state);
        if (idxNew == -1) throw Error(`Unknown state: ${state}`);
        if (idxNew != 0) {
            if (idxNew - 1 != idxOld) throw Error(`${state} can't follow ${this.#myState}`);
        }
        this.#myState = state;

        // const elt = this.#eltPointHandle;

        // const par = elt.parentElement;
        // console.log(">>>> set state", state, { elt, par });
        showDebugState(state);

        PointHandle.myStates.forEach(st => {
            this.#jmnodesPointHandle.classList.remove(`pointhandle-state-${st}`);
        })
        this.#jmnodesPointHandle.classList.add(`pointhandle-state-${state}`);
    }
    /**
     * 
     * @param {string} state 
     * @returns {boolean}
     */
    isState(state) {
        if (!PointHandle.knownState(state)) throw Error(`Unrecognized state "${state}"`);
        return this.#state == state;
    }
    /**
     * 
     * @param {string} state 
     * @returns {boolean}
     */
    isBeforeState(state) {
        if (!PointHandle.knownState(state)) throw Error(`Unrecognized state "${state}"`);
        const idxCurr = PointHandle.myStates.indexOf(this.#state);
        const idx = PointHandle.myStates.indexOf(state);
        return idx < idxCurr;
    }
    /**
     * 
     * @returns {boolean}
     */
    stateMoving() {
        // FIX-ME:
        return this.#myState != "idle";
        if (this.#myState == "move") return true;
        if (this.#myState == "dist") return true;
        return false;
    }


    constructor() {
        this.#myState = "idle";
        this.#eltPointHandle = mkElt("div", { id: "jsmindtest-point-handle" });
        this.#eltPointHandle.style.pointerEvents = "none"; // FIX-ME: why???
    }
    get element() { return this.#eltPointHandle; }
    OLDsavePosBounded = (evt) => {
        evt.preventDefault();
        evt.stopPropagation();
        evt.stopImmediatePropagation();
        savePointerPos.bind(this)(evt);
    }
    initializePointHandle = (eltJmnode, pointerType) => {
        const jmnodeDragged = eltJmnode;
        if (!jmnodeDragged) return;
        if (jmnodeDragged.getAttribute("nodeid") == "root") return;

        // if (isTouch) { this.#diffPointHandle = 60; } else { this.#diffPointHandle = 0; }
        switch (pointerType) {
            case "mouse":
                this.#diffPointHandle = 0;
                this.#diffPointHandle = 80; // FIX-ME:
                break;
            default:
                this.#diffPointHandle = 60;
        }

        if (!pointHandle.isState("idle")) throw Error(`Expected state "idle" but it was ${this.#state}`);
        this.#state = "init";
        // this.#eltPointHandle.style.left = `${evtPointerLast.clientX - PointHandle.sizePointHandle / 2}px`;
        // this.#eltPointHandle.style.top = `${evtPointerLast.clientY - PointHandle.sizePointHandle / 2}px`;

        const clientX = evtPointerLast.clientX;
        const clientY = evtPointerLast.clientY;
        posPointHandle = {
            start: {
                clientX,
                clientY,
                jmnodeDragged,
            },
            current: {}
        };
        eltJmnodeFrom = jmnodeDragged;

        this.#jmnodesPointHandle.appendChild(this.#eltPointHandle);

        this.#eltPointHandle.style.left = `${clientX - PointHandle.sizePointHandle / 2}px`;
        this.#eltPointHandle.style.top = `${clientY - PointHandle.sizePointHandle / 2}px`;

        requestCheckPointerHandleMove();
    }
    teardownPointHandleAndAct() {
        if (!this.#eltPointHandle.parentElement) return;
        // console.log("teardownPointHandle");
        // this.#jmnodesPointHandle.removeEventListener("pointermove", this.savePosBounded);
        this.#eltPointHandle?.remove();
        this.#state = "idle";
        if (eltJmnodeFrom) {
            eltJmnodeFrom = undefined;
        }
        if (eltOverJmnode) {

        }
        // console.log("teardwon...", { eltJmnodeFrom });
        modJsmindDraggable.stopNow();
        // evtPointerLast = undefined; // FIX-ME
    }
    setupPointHandle() {
        console.log("setupPointHandle");
        /** @type {HTMLElement | null} */
        const elt = document.body.querySelector("jmnodes");
        if (!elt) throw Error("Could not find <jmnodes>");
        this.#jmnodesPointHandle = elt;
        // const THIS = this;
        // this.#jmnodesPointHandle.addEventListener("pointerdown", this.initializePointHandle.bind(THIS));
        // this.#jmnodesPointHandle.addEventListener("pointerup", this.teardownPointHandleAndAct.bind(THIS));
    }
    teardownPointHandle() {
        // const THIS = this;
        // this.#jmnodesPointHandle?.removeEventListener("pointerdown", this.initializePointHandle.bind(THIS));
        // this.#jmnodesPointHandle?.removeEventListener("pointerup", this.teardownPointHandleAndAct.bind(THIS));
        this.teardownPointHandleAndAct();
        // modJsmindDraggable.setPointerDiff(0, 0);
    }
    checkPointHandleDistance() {
        // if (!evtPointerLast) return; // FIX-ME
        if (this.isState("init")) {
            this.#state = "dist";

            this.#eltPointHandle.style.left = `${evtPointerLast.clientX - PointHandle.sizePointHandle / 2}px`;
            this.#eltPointHandle.style.top = `${evtPointerLast.clientY - PointHandle.sizePointHandle / 2}px`;
            // console.log("checkPointHandleDistance start", { posPointHandle });
        }
        const diffX = posPointHandle.start.clientX - evtPointerLast.clientX;
        const diffY = posPointHandle.start.clientY - evtPointerLast.clientY;
        if (isNaN(diffX) || isNaN(diffY)) throw Error("diffX or diffY isNaN");
        if (this.isState("dist")) {
            const diff2 = diffX * diffX + diffY * diffY;
            // const diffPH = PointHandle.diffPointHandle;
            const diffPH = this.#diffPointHandle;
            const diffPH2 = diffPH * diffPH;
            const diffOk = diff2 >= diffPH2;
            if (!diffOk) {
                return;
            }
            posPointHandle.diffX = diffX;
            posPointHandle.diffY = diffY;
            // modJsmindDraggable.setPointerDiff(diffX, diffY);
            modJsmindDraggable.nextHereIamMeansStart(eltJmnodeFrom);
            this.#state = "move";
            return;
        }
        movePointHandle();
    }

}
const pointHandle = new PointHandle();
console.log({ pointHandle })
console.log(pointHandle.element);
window["ourPointHandle"] = pointHandle; // FIX-ME:
// debugger;



const divJsmindSearch = mkElt("div", { id: "jsmind-search-div" });

async function getDraggableNodes() {
    return await importFc4i("mm4i-jsmind.draggable-nodes");
}

let theCustomRenderer;
/*
async function setCustomRenderer() {
    if (theCustomRenderer) return;
    const modCustRend = await importFc4i("jsmind-cust-rend");
    theCustomRenderer = await modCustRend.getOurCustomRenderer();
}
*/

async function getCustomRenderer() {
    if (!theCustomRenderer) {
        const modCustRend = await importFc4i("jsmind-cust-rend");
        theCustomRenderer = await modCustRend.getOurCustomRenderer();
    }
    return theCustomRenderer;
}

const theMirrorWays = [
    "none",
    // "useCanvas",
    // "jsmind",
    "pointHandle",
    // "cloneNode",
];
Object.freeze(theMirrorWays);
/*
const ifMirrorWay = (ourWay) => {
    if (!theMirrorWays.includes(ourWay)) throw Error(`Unknown mirror way: ${ourWay}`);
    return ourWay == theDragTouchAccWay;
}
*/

const checkTheDragTouchAccWay = () => {
    if (!theMirrorWays.includes(theDragTouchAccWay)) throw Error(`Unknown mirror way: ${theDragTouchAccWay}`);
}
function switchDragTouchAccWay(newWay) {
    theDragTouchAccWay = newWay;
    checkTheDragTouchAccWay();
    switch (theDragTouchAccWay) {
        // case "cloneNode": setupMirror(); break;
        case "none":
            pointHandle.teardownPointHandle();
            break;
        case "pointHandle":
            // setTimeout(setupPointHandle, 1000);
            pointHandle.setupPointHandle();
            break;
        default:
            throw Error(`Not handled theMirrorWay=${theDragTouchAccWay}`);
    }
}


// https://www.labnol.org/embed/google/photos/?ref=hackernoon.com
// https://hackernoon.com/how-to-embed-single-photos-from-google-photos-on-your-website-and-notion-page
// https://jumpshare.com/blog/how-to-embed-google-drive-video/
async function dialogMirrorWay() {
    const notWorking = ["useCanvas", "jsmind",];
    const altWays = theMirrorWays.filter(alt => !notWorking.includes(alt));
    console.log({ altWays });
    const altsDesc = {}
    altsDesc.none = mkElt("div", undefined, [
        "Default when the only screen input is a mouse or similar."
    ]);

    // const srcVideoMirror = "https://drive.google.com/file/d/17gmHG7X14szrG04nIskIAAP4mNnr9Tm8/preview";
    // const srcVideoMirror = "/img/vid/screen-20230513-mirror.mp4";
    // const posterVideoMirror = "/img/vid/screen-20230513-mirror.jpg";
    // const aspectratioVideoMirror = "1048 / 1248";
    // const eltVidMirror = mkVidElt(srcVideoMirror, posterVideoMirror);
    // altsDesc.cloneNode = mkElt("div", undefined, [ eltVidMirror ]);
    /*
    function mkVidElt(src, poster, aspectRatio) {
        aspectRatio = aspectRatio || "1 / 1";
        // https://stackoverflow.com/questions/24157940/iframe-height-auto-css
        const styleVideo = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                aspect-ratio: ${aspectRatio};
                `;
        const eltIframe = mkElt("iframe", { style: styleVideo });
        eltIframe.allowfullscreen = true;

        const styleContainer = `
                position: relative;
                 width: 100%;
                 aspect-ratio: 1048 / 1248;
                `;

        const eltVideo = mkElt("video", { style: styleContainer });
        eltVideo.src = src;
        if (poster) eltVideo.poster = poster;
        eltVideo.controls = true;
        // eltVideo.autoplay = true;
        // eltVideo.load();

        // const divIframeContainer = mkElt("div", { style: styleContainer }, eltIframe);
        // return divIframeContainer;

        // const divBoth = mkElt("div", undefined, [divIframeContainer, eltVideo]);
        // return divBoth;
        return eltVideo;
    }
    */

    altsDesc.pointHandle = mkElt("div", undefined, [
        "Default when screen supports touch.",
        "(no description yet)",
        // vidPointHandle,
        // iframePointHandle
        // divIframePointHandle
    ]);
    function mkAltWay(way) {
        const radio = mkElt("input", { type: "radio", name: "mirrorway", value: way });
        if (theDragTouchAccWay == way) radio.checked = true;
        return mkElt("label", undefined, [
            way, radio,
            altsDesc[way]
        ]);
    }

    const style = [
        "display: flex",
        "flex-direction: column",
        "gap: 20px"
    ].join("; ");
    const divChoices = mkElt("div", { style });
    altWays.forEach(way => divChoices.appendChild(mkAltWay(way)));
    const body = mkElt("div", undefined, [divChoices]);
    function getValue() {
        // return "hej";
        return divChoices.querySelector('input[name="mirrorway"]:checked')?.value;
    }
    return modMdc.mkMDCdialogGetValue(body, getValue, "Ok");
}

let theDragTouchAccWay = "none";
if (hasTouchEvents()) theDragTouchAccWay = "pointHandle";
theDragTouchAccWay = "pointHandle"; // FIX-ME:

// switchDragTouchAccWay(theDragTouchAccWay);
// checkTheDragTouchAccWay();


/////////////////////////////////////////////////////

/**
 * @typedef {Object}
 * @property {number} dTop - target top
 * @property {number} dBottom
 * @property {number} dLeft
 * @property {number} dRight
 * @property {number} startX
 * @property {number} startY
 * */
let posPointHandle;

const evtPointerLast = {};
/**
 * 
 * @param {PointerEvent} evt 
 */
function savePointerPos(evt) {
    if (!(evt instanceof PointerEvent)) throw Error("Expeced PointerEvent");
    // evt.preventDefault();
    // evt.stopPropagation();
    // evt.stopImmediatePropagation();

    evtPointerLast.clientX = evt.clientX;
    evtPointerLast.clientY = evt.clientY;
    evtPointerLast.target = evt.target;

}
window.addEventListener("pointermove", savePointerPos);
window.addEventListener("pointerdown", savePointerPos);



// https://javascript.info/pointer-events

/*
 * 
 * @param {PointerEvent} evt 
 * 
 * @return {EventListenerOrEventListenerObject}
 */

function requestCheckPointerHandleMove() {
    try {
        if (!pointHandle.stateMoving()) return;
        pointHandle.checkPointHandleDistance();
    } catch (err) {
        console.log("ERROR requestCheckPointerHandleMove", err);
        eltReqFrame.textContent = err;
        debugger; // eslint-disable-line no-debugger
    }
    requestAnimationFrame(requestCheckPointerHandleMove);
}
let eltJmnodeFrom;
/*
function jmnodeFromPoint(cX, cY) {
    // console.log({ cX, cY });
    const eltsHere = document.elementsFromPoint(cX, cY);
    const eltJmnode = eltsHere.filter(e => { return e.tagName == "JMNODE"; })[0];
    return eltJmnode
}
*/
let eltOverJmnode;
let movePointHandleProblem = false;
function movePointHandle() {
    if (movePointHandleProblem) return;
    // if (!posPointHandle.diffX) return;
    const clientX = evtPointerLast.clientX;
    const clientY = evtPointerLast.clientY;
    if (!clientX) return;
    try {
        // const sp = eltPointHandle.style;
        const sp = pointHandle.element.style;
        const left = clientX + posPointHandle.diffX - PointHandle.sizePointHandle / 2;
        sp.left = `${left}px`;
        const top = clientY + posPointHandle.diffY - PointHandle.sizePointHandle / 2;
        sp.top = `${top}px`;
        modJsmindDraggable.hiHereIam(left, top);
    } catch (err) {
        console.error("movePointHandle", err);
        movePointHandleProblem = true;
    }
    return;
    /*
    const eltsOver = document.elementsFromPoint(left, top);
    const eltFromOverJmnode = (eltsOver.filter(elt => { return elt.tagName == "JMNODE" }))[0];
    // console.log("from over jmnode", eltFromOverJmnode);
    if (eltFromOverJmnode) {
        if (eltOverJmnode) {
            if (eltOverJmnode != eltFromOverJmnode) { unmarkOver(); }
        }
        if (!eltOverJmnode) {
            markOver(eltFromOverJmnode);
        }
    } else {
        unmarkOver();
    }
    function markOver(elt) {
        eltOverJmnode = elt;
        // eltOverJmnode.classList.add(cssClsDragTarget);
        // modJsmindDraggable.markAsTarget(eltOverJmnode, true);
    }
    function unmarkOver() {
        if (eltOverJmnode) {
            // eltOverJmnode.classList.remove(cssClsDragTarget);
            // modJsmindDraggable.markAsTarget(eltOverJmnode, false);
            eltOverJmnode = undefined;
        }
    }
    */
}
/*
function getposPointHandle() {
    const sp = eltPointHandle.style;
    const screenX = sp.left;
    const screenY = sp.top;
    return { screenX, screenY };
}
*/
/////////////////////////////////////////////////////

export const arrShapeClasses = getMatchesInCssRules(/\.(jsmind-shape-[^.:#\s]*)/);
export function clearShapes(eltShape) {
    if (!jsMind.mm4iSupported) return;
    eltShape.parentElement.classList.remove("bg-transparent");
    if (eltShape.tagName != "DIV" || !eltShape.classList.contains("jmnode-bg")) {
        throw Error('Not <jmnode><div class="jmnode-bg"');
    }
    arrShapeClasses.forEach(oldShape => { eltShape.classList.remove(oldShape) });
}

export function shapeCanHaveBorder(shapeName) {
    return !shapeName?.startsWith("jsmind-shape-clip-");
}

export function applyNodeShapeEtc(node, eltJmnode) {
    const shapeEtc = node.data.shapeEtc;
    if (!shapeEtc) return;
    applyShapeEtc(shapeEtc, eltJmnode);
}
export async function applyShapeEtc(shapeEtc, eltJmnode) {
    const eltShape = eltJmnode.querySelector(".jmnode-bg");
    if (!eltShape) {
        throw Error("eltShape is null, no .jmnode-bg found");
        /*
        if (eltJmnode.childElementCount > 1) {
            // FIX-ME: just delete this???
            console.error("old custom format 2");
            let htmlRendererImg = mkElt("div", { class: "jsmind-render-img" });
            const OLDhtmlRendererImg = eltJmnode.lastElementChild;
            OLDhtmlRendererImg.remove();
            const customData = htmlTopic.dataset.jsmindCustom;
            delete htmlTopic.dataset.jsmindCustom;
            htmlRendererImg.dataset.jsmindCustom = customData;
        }
        */
    }

    clearShapes(eltShape);
    const shape = shapeEtc.shape;
    eltJmnode.classList.remove("bg-transparent");
    if (shape) {
        if (shapeEtc?.shapeBoxBg != undefined) {
            if (shapeEtc.shapeBoxBg) {
                eltJmnode.classList.add("bg-transparent");
            }
        } else {
            eltJmnode.classList.add("bg-transparent");
        }
        if (arrShapeClasses.includes(shape)) {
            eltShape.classList.add(shape);
        } else {
            if (shape != "default") console.error(`Unknown shape: ${shape}`);
        }

    }
    if (shapeCanHaveBorder(shape)) {
        const border = shapeEtc.border;
        if (border) {
            const w = border.width || 0;
            const c = border.color || "black";
            const s = border.style || "solid";
            if (w == 0) {
                eltShape.style.border = null;
            } else {
                eltShape.style.border = `${w}px ${s} ${c}`;
            }
        }
    } else {
        eltShape.style.border = null;
    }
    const shadow = shapeEtc.shadow;
    if (shadow && shadow.blur > 0) {
        const x = shadow.offX || 0;
        const y = shadow.offY || 0;
        const b = shadow.blur;
        const c = shadow.color || "red";
        eltShape.style.filter = `drop-shadow(${x}px ${y}px ${b}px ${c})`;
        // FIX-ME: spread is currently not used, or???
        // const s = shadow.spread;
        // eltJmnode.style.filter = `drop-shadow(${x}px ${y}px ${b}px ${s}px ${c})`;
    }
    const bgCssText = shapeEtc.background?.CSS;
    if (bgCssText) {
        const modCustRend = await importFc4i("jsmind-cust-rend");
        modCustRend.applyJmnodeBgCssText(eltJmnode, bgCssText);
    }

    // const clsIconButton = "icon-button-40";
    const clsIconButton = "icon-button-30";
    // const oldBtn = eltJmnode.querySelector("a.jsmind-plain-link");
    const oldAimg = eltJmnode.querySelector(`.jsmind-renderer-img`);
    oldAimg?.remove();
    const oldBtn = eltJmnode.querySelector(`.${clsIconButton}`);
    if (oldBtn && oldAimg) {
        console.warn({ oldBtn, oldAimg });
    }
    oldBtn?.remove();

    const nodeLink = shapeEtc.nodeLink;
    const nodeCustom = shapeEtc.nodeCustom;
    let foundCustom = false;
    if (nodeCustom) {
        let key = nodeCustom.key;
        const provider = nodeCustom.provider;
        // select custom
        // FIX-ME: is theCustomRenderer available here???
        // const renderer = await getOurCustomRenderer();
        const renderer = await getCustomRenderer();
        const rec = await renderer.getCustomRec(key, provider);
        if (rec) {
            foundCustom = true;
            const blob = rec.images ? rec.images[0] : undefined;
            if (blob) {
                const urlBlob = URL.createObjectURL(blob);
                const urlBg = `url(${urlBlob})`;
                const backgroundImage = urlBg;
                const divBg = eltJmnode.querySelector(".jmnode-bg");
                divBg.style.backgroundImage = backgroundImage;
            }
            // FIX-ME: long name
            // FIX-ME: looks like a race condition?
            //    Try to get around it by a simple check...
            const oldAimg = eltJmnode.querySelector(`.jsmind-renderer-img`);
            if (!oldAimg) {
                const iconBtn = modMdc.mkMDCiconButton("", `Go to this item in ${provider} (3)`);
                const bgImg = renderer.getLinkRendererImage(provider);
                iconBtn.style.backgroundImage = `url(${bgImg})`;
                iconBtn.classList.add(clsIconButton);
                const recLink = renderer.getRecLink(key, provider);
                const eltA3 = mkElt("a", { href: recLink }, iconBtn);
                eltA3.classList.add("jsmind-renderer-img");
                eltJmnode.appendChild(eltA3);
            }
        }
    }
    if (!foundCustom) {
        if (nodeLink && nodeLink.length > 0) {
            const iconBtn = modMdc.mkMDCiconButton("link", "Visit web page");
            iconBtn.classList.add(clsIconButton);
            const eltA3 = mkElt("a", { href: nodeLink }, iconBtn);
            eltA3.classList.add("jsmind-plain-link");
            eltJmnode.appendChild(eltA3);
        }
    }

}



let modJsmindDraggable;
// basicInit4jsmind();
export function basicInit4jsmind() {
    console.log("jsMind", typeof jsMind);
    jsMind.my_get_DOM_element_from_node = (node) => { return node._data.view.element; }
    jsMind.my_get_nodeID_from_DOM_element = (elt) => {
        const tn = elt.tagName;
        if (tn !== "JMNODE") throw Error(`Not jmnode: <${tn}>`);
        const id = elt.getAttribute("nodeid");
        if (!id) throw Error("Could not find jmnode id");
        return id;
    }


    // await thePromiseDOMready;
    /*
    async function startDraggable() {
        modJsmindDraggable = await getDraggableNodes();
        // console.log({ modJsmindDraggable });
    }
    errorHandlerAsyncEvent(startDraggable());
    */

    /*
    async function addDragDropTouch() {
        if (!confirm("Load DragDropTouch.js?")) return;
        // const elt = mkElt("script", { src: "/ext/DragDropTouch.js" });
        // document.head.appendChild(elt);
        const ddtLink = "https://drag-drop-touch-js.github.io/dragdroptouch/dist/drag-drop-touch.esm.min.js";
        const modDDT = await import(ddtLink);
        modDDT.enableDragDropTouch();
        debugger;
    }
    if (hasTouchEvents()) {
        addDragDropTouch();
    }
    // } else { addDragDropTouch();
    */

}

let funMindmapsDialog;
export function setMindmapDialog(fun) {
    const funType = typeof fun;
    if (funType != "function") throw Error(`setMindmapDialog, expected "function" paramenter, got "${funType}"`);
    funMindmapsDialog = fun;
}

// pageSetup();

// testDouble(); async function testDouble() { console.warn("testDouble"); }

checkTheDragTouchAccWay();


function mkMenuItemA(lbl, url) {
    const eltA = mkElt("a", { href: url }, lbl);
    const li = modMdc.mkMDCmenuItem(eltA);
    li.addEventListener("click", evt => {
        // evt.preventDefault();
        evt.stopPropagation();
        hideContextMenu();
    });
    return li;
}
function mkMenuItem(lbl, fun) {
    const li = modMdc.mkMDCmenuItem(lbl);
    li.addEventListener("click", evt => {
        evt.preventDefault();
        evt.stopPropagation();
        fun();
        hideContextMenu();
    });
    return li;
}
const idContextMenu = "jsmind-context-menu";
let divContextMenu;
let jmDisplayed;

function hideContextMenu() {
    if (!divContextMenu) return;
    divContextMenu.style.display = "none";
    setTimeout(focusSelectedNode, 2000);
}
// FIX-ME: The node does not get DOM focus???
function focusSelectedNode() {
    // FIX-ME: What is wrong with jmDisplayed here???
    try {
        const selectedNode = jmDisplayed?.get_selected_node();
        if (selectedNode) {
            const selectedElt = getDOMeltFromNode(selectedNode);
            selectedElt.focus();
        }
    } catch (err) {
        console.log("*** focusSelectedNode", { err });
    }
}


const extraPageMenuItems = [];
export async function addToPageMenu(lbl, what) {
    if (document.getElementById("jsmind-context-menu")) throw Error("Must be called before menu first display")
    let liMenuItem;
    if ("function" == typeof what) {
        liMenuItem = mkMenuItem(lbl, what)
    } else {
        liMenuItem = mkMenuItemA(lbl, what);
    }
    console.warn(liMenuItem);
    extraPageMenuItems.push(liMenuItem);
}

export async function pageSetup() {
    const nodeHits = new URLSearchParams(location.search).get("nodehits");
    const nodeProvider = new URLSearchParams(location.search).get("provider");
    // let inpSearch;
    // let useCanvas = true;
    // setCustomRenderer();
    // let useCanvas = false;
    // useCanvas = confirm("Use canvas?");


    const idDivJmnodesMain = "jsmind_container";
    // const idDivJmnodesMirror = "jsmind-draggable-container4mirror";
    // let mirrorContainer;

    // const idDivScreenMirror = "jsmindtest-div-mirror";
    // const idMirroredWrapper = "jsmindtest-div-mirrored-wrapper";
    // let divMirroredWrapper;

    const jsMindContainer = document.getElementById(idDivJmnodesMain);
    if (!jsMindContainer) throw Error(`Could not find ${idDivJmnodesMain}`);

    function clearSearchHits() {
        if (!jsMindContainer) throw Error(`Could not find ${idDivJmnodesMain}`);
        const nodeEltArray = [...jsMindContainer.querySelectorAll("jmnode[nodeid]")];
        nodeEltArray.forEach(n => n.classList.remove("jsmind-hit"));
    }


    const idDivHits = "jsmind-div-hits";

    /*
    let h2cCanvas;
    let promH2cCanvas;
    // const heightDivH2c = 300;
    // const widthDivH2c = 200;
    const mirrorVals = {
        // clientXthrottle4mirror;
        // clientYthrottle4mirror;
        heightDivH2c: 300,
        widthDivH2c: 200,
    }
    */

    const defaultOptJmDisplay = {
        // container: 'jsmind_container',
        container: idDivJmnodesMain,
        // theme: 'orange',
        editable: true,
        view: {
            // draggable: true,
            draggable: false,
            hide_scrollbars_when_draggable: false,
            engine: "svg",
            line_width: 10,
            line_color: "green",
        },
        layout: {
            pspace: 32,
        },
        shortcut: {
            enable: true, 		// whether to enable shortcut
            handles: {}, 			// Named shortcut key event processor
            mapping: { 			// shortcut key mapping
                addchild: [45, 4096 + 13], 	// <Insert>, <Ctrl> + <Enter>
                addbrother: 13, // <Enter>
                editnode: 113, 	// <F2>
                delnode: 46, 	// <Delete>
                toggle: 32, 	// <Space>
                left: 37, 		// <Left>
                up: 38, 		// <Up>
                right: 39, 		// <Right>
                down: 40, 		// <Down>
            }
        },
    };
    /*
    const strOptionsJmDisplay = JSON.stringify(defaultOptJmDisplay);
    const optionsJmMirror = JSON.parse(strOptionsJmDisplay);
    // FIX-ME: We can't use mirror.
    // optionsJmMirror.container = idDivJmnodesMirror;
    optionsJmMirror.container = "this-id-does-not-exist";
    delete optionsJmMirror.shortcut;
    */


    // Use this??? copy canvas https://jsfiddle.net/lborgman/5L1bfhow/3/




    const btnDebugLogClear = mkElt("button", undefined, "Clear");
    btnDebugLogClear.addEventListener("click", () => {
        divDebugLogLog.textContent = "";
    });
    const divDebugLogHeader = mkElt("div", { id: "jsmind-test-debug-header" }, [
        "JSMIND DEBUG LOG",
        btnDebugLogClear
    ]);
    const divDebugLogLog = mkElt("div", { id: "jsmind-test-div-debug-log-log" });
    const divDebugLog = mkElt("div", { id: "jsmind-test-div-debug-log" }, [
        divDebugLogHeader,
        divDebugLogLog
    ]);
    let btnJsmindDebug;
    const idBtnJsmindDebug = "jsmind-ednode-debug-button";

    async function mkNetGraphFAB4mindmap() {
        // eltJmnode
        function mkNetwGraphURL() {
            // alert("not ready");
            const url = new URL("/nwg/netwgraph.html", location.href);
            const sp = new URLSearchParams(location.search);
            const mm = sp.get("mindmap");
            if (mm) { url.searchParams.set("mindmap", mm); }
            return url.href;
        }
        async function mkFabNetwG() {
            const modMdc = await importFc4i("util-mdc");
            const iconHub = modMdc.mkMDCicon("hub");

            const aIconHub = mkElt("a", { href: "/nwg/netwgraph.html" }, iconHub);
            aIconHub.addEventListener("click", () => {
                // aIconHub.href = mkTestNetwGraphURL();
                aIconHub.href = mkNetwGraphURL();
            });
            aIconHub.addEventListener("contextmenu", () => {
                aIconHub.href = mkNetwGraphURL();
            });

            aIconHub.style.lineHeight = "1rem";
            const titleNetwg = "Investigate as a graphical network";
            const fabNetwG = modMdc.mkMDCfab(aIconHub, titleNetwg, true)
            fabNetwG.style = `
                background-color: goldenrod;
                position: absolute;
                top: 2px;
                right: 20px;
                z-index: 10;
            `;
            return fabNetwG;
        }
        const fabNetwG = await mkFabNetwG();
        // document.body.appendChild(fabNetwG);
        // jsMindContainer.appendChild(fabNetwG);
        // fabNetwG.style.marginLeft = "30px";
        return fabNetwG;
    }


    let btnJsmindMenu;
    const idBtnJsmindMenu = "jsmind-menu-button";
    let btnJsmindSearch;
    const idBtnJsmindSearch = "jsmind-search-button";
    // let divSearchInputs;
    const idSearchInputs = "jsmind-search-inputs";

    const inpSearch = mkElt("input", { type: "search", placeholder: "Search nodes", id: "jsmind-inp-node-search" });
    // const inpSearch = modMdc.mkMDCtextFieldInput( "jsmind-inp-node-search", "search");
    // const tfSearch = modMdc.mkMDCtextFieldOutlined("Search nodes", inpSearch);
    // const tfSearch = modMdc.mkMDCtextField("Search nodes", inpSearch);
    const tfSearch = inpSearch;

    const eltProvHits = mkElt("div", { id: "provider-hits" });
    const divSearchInputs = mkElt("div", { id: idSearchInputs }, [tfSearch, eltProvHits]);
    // const divSearchInputs = mkElt("div", { id: idSearchInputs });

    divSearchInputs.classList.add("jsmind-actions");
    const divHits = mkElt("div", { id: idDivHits, class: "mdc-card" });
    divHits.classList.add("display-none");
    divSearchInputs.appendChild(divHits);

    addJsmindButtons();

    async function addJsmindButtons() {
        if (!jsMindContainer) { throw Error(`jsMindContainer is null`) };
        btnJsmindDebug = modMdc.mkMDCiconButton("adb", "Debug log", 40);
        btnJsmindDebug.id = idBtnJsmindDebug;
        btnJsmindDebug.classList.add("test-item");
        btnJsmindDebug.classList.add("jsmind-actions");
        jsMindContainer.appendChild(btnJsmindDebug);
        btnJsmindDebug.addEventListener("click", evt => {
            console.log("btnJsmindMenu");
            evt.stopPropagation();
            jsMindContainer.classList.toggle("show-jsmind-debug");
        });

        const nwgFAB = await mkNetGraphFAB4mindmap();
        jsMindContainer.appendChild(nwgFAB);


        btnJsmindMenu = modMdc.mkMDCiconButton("menu", "Open menu", 40);
        btnJsmindMenu.id = idBtnJsmindMenu;
        btnJsmindMenu.classList.add("jsmind-actions");
        jsMindContainer.appendChild(btnJsmindMenu);
        btnJsmindMenu.addEventListener("click", evt => {
            // console.log("btnJsmindMenu");
            evt.stopPropagation();
            displayContextMenu(btnJsmindMenu);
        });
        btnJsmindSearch = modMdc.mkMDCiconButton("search", "Search", 40);
        btnJsmindSearch.id = idBtnJsmindSearch;
        btnJsmindSearch.classList.add("jsmind-actions");
        // jsMindContainer.appendChild(btnJsmindSearch);
        jsMindContainer.appendChild(divJsmindSearch);
        divJsmindSearch.appendChild(btnJsmindSearch);
        btnJsmindSearch.addEventListener("click", evt => {
            // console.log("btnJsmindSearch");
            evt.stopPropagation();
            toggleSearchInputs();
            const eltJmnodes = getJmnodesFromJm(jmDisplayed);
            eltJmnodes.classList.remove("showing-hits");
            clearSearchHits();
            if (visibleSearchInputs()) {
                const divInputs = document.getElementById("jsmind-search-inputs");
                if (!divInputs) { throw Error(`Could not find jsmind-search-inputs`); }
                if (divInputs.classList.contains("showing-provider-hits")) {
                    setProviderNodeHits();
                } else {
                    inpSearch.focus();
                    const strSearch = inpSearch.value.trim();
                    if (strSearch.length > 0) {
                        restartJsmindSearch();
                    }
                }
            } else {
                const divHits = document.getElementById(idDivHits);
                divHits?.classList.add("display-none");
            }
        });

        const btnCloseProvHits = modMdc.mkMDCiconButton("clear", "Clear search hits");
        btnCloseProvHits.classList.add("icon-button-sized");
        btnCloseProvHits.addEventListener("click", () => {
            const divInputs = document.getElementById("jsmind-search-inputs");
            if (!divInputs) { throw Error(`Could not find jsmind-search-inputs`); }
            divInputs.classList.remove("showing-provider-hits");
            clearSearchHits();
            const divHits = document.getElementById(idDivHits);
            divHits?.classList.add("display-none");
            const eltJmnodes = getJmnodesFromJm(jmDisplayed);
            eltJmnodes.classList.remove("showing-hits");
            inpSearch.focus();
        });
        const eltTellProvider = mkElt("span");
        if (nodeProvider) {
            const render = await modCustRend.getOurCustomRenderer();
            const src = render.getLinkRendererImage(nodeProvider);
            const eltImg = mkElt("img", { src });
            eltImg.style.height = "30px";
            const span = mkElt("span", undefined, [eltImg, " link"]);
            eltTellProvider.appendChild(span);
            // Links to Links to 
        } else {
            eltTellProvider.appendChild(mkElt("span", undefined, "dummy (no provider)"));
        }
        // const eltProvHits = mkElt("div", { id: "provider-hits" }, [
        eltProvHits.textContent = "";
        eltProvHits.appendChild(eltTellProvider);
        eltProvHits.appendChild(btnCloseProvHits);
        // ]);

        inpSearch.addEventListener("input", () => {
            restartJsmindSearch();
        })
        divJsmindSearch.appendChild(divSearchInputs);
    }
    // @ts-ignore
    function toggleSearchInputs() { jsMindContainer.classList.toggle("display-jsmind-search"); }
    // @ts-ignore
    function visibleSearchInputs() { return jsMindContainer.classList.contains("display-jsmind-search"); }
    const restartJsmindSearch = (() => {
        let tmr;
        return () => {
            clearTimeout(tmr);
            tmr = setTimeout(() => doJsmindSearch(), 1000);
        }
    })();
    function doJsmindSearch() {
        const strSearch = inpSearch.value.trim();
        if (strSearch == "") {
            const eltJmnodes = getJmnodesFromJm(jmDisplayed);
            eltJmnodes.classList.remove("showing-hits");
            clearSearchHits();
            const divHits = document.getElementById(idDivHits);
            divHits?.classList.add("display-none");
            return;
        }
        jsmindSearchNodes(strSearch);
    }

    // https://github.com/hizzgdev/jsmind/blob/master/docs/en/1.usage.md#12-data-format
    function checkParams() {
        const sp = new URLSearchParams(location.search);
        if (sp.size == 0) return true;
        const arrParNames = [...sp.keys()].sort();
        const strParNames = JSON.stringify(arrParNames);
        console.log({ strParNames });
        if (strParNames == '["mindmap"]') return true;
        // if (strParNames == '["maxConf","requiredTags","searchFor"]') return true;
        if (strParNames == '["mindmap","nodehits","provider"]') return true;
        debugger; // eslint-disable-line no-debugger
        alert("invalid params: " + strParNames);
        return false;
    }
    checkParams();

    const mindmapKey = new URLSearchParams(location.search).get("mindmap");
    if (typeof mindmapKey === "string" && mindmapKey.length === 0) {
        throw Error("Parameter mindmapname should have a value (key/name of a mindmap)");
    }
    /*
    const createMindmap = new URLSearchParams(location.search).get("createmindmap");
    if (typeof createMindmap === "string" && createMindmap.length > 0) {
        throw Error("Parameter createmindmap does not take a value");
    }
    const create = ((createMindmap != null) || (mindmapKey == null));
    */
    let mind;
    if (mindmapKey) {
        mind = await modMMhelpers.getMindmap(mindmapKey);
    }
    if (!mind) {
        if (funMindmapsDialog) {
            funMindmapsDialog();
        } else {
            dialogMindMaps(location.pathname);
        }
        return;
    }
    console.log({ mind });

    // const modJmDrag = await getDraggableNodes();
    modJsmindDraggable = await getDraggableNodes();
    modJsmindDraggable.setupNewDragging();

    function getMindmapGlobals0(mind) {
        const format = mind.format;
        let root_node;
        switch (format) {
            case "node_array":
                for (const idx in mind.data) {
                    const n = mind.data[idx];
                    if (n.id == "root") {
                        root_node = n;
                        break;
                    }
                }
                break;
            default:
                throw Error(`Can't get mindmapGlobals when mind format is ${format}`);
        }
        const globals = root_node.mindmapGlobals;
        console.log({ root_node, globals });
        return globals;
    }
    const usedOptJmDisplay = JSON.parse(JSON.stringify(defaultOptJmDisplay));
    const savedGlobals = getMindmapGlobals0(mind);
    // Merge in savedGlobals:
    if (savedGlobals) {
        if (savedGlobals.line_width) {
            usedOptJmDisplay.view.line_width = savedGlobals.line_width;
        }
        if (savedGlobals.line_color) {
            usedOptJmDisplay.view.line_color = savedGlobals.line_color;
        }
    }


    const nowBefore = Date.now();
    jmDisplayed = await displayMindMap(mind, usedOptJmDisplay);



    ////// modFsm
    // const modFsm = await importFc4i("mm4i-fsm");
    // window["fsm"] = modFsm.fsm;
    modFsm.fsm.hook_any_action(fsmEvent);
    modFsm.fsm.hook_any_transition(() => {
        logJssmState(modFsm.fsm.state())
    });
    const eltJsMindContainer = document.getElementById("jsmind_container");
    if (!eltJsMindContainer) throw Error("Could not find #jsmind_container");
    const eltFsm = eltJsMindContainer.querySelector(".jsmind-inner");
    if (!eltFsm) throw Error("Could not find .jsmind-inner");


    ////// FSL hooks
    function hookStartMovePointHandle(hookData) {
        // setTimeout(() => {
        // pointHandle.setupPointHandle();
        const { eltJmnode, pointerType } = hookData.data;
        // debugger;
        modJsmindDraggable.setJmnodeDragged(eltJmnode);
        pointHandle.initializePointHandle(eltJmnode, pointerType);
        // });
    }
    modFsm.fsm.post_hook_entry("n_Move", (hookData) => {
        hookStartMovePointHandle(hookData);
    });
    modFsm.fsm.hook_exit("n_Move", () => pointHandle.teardownPointHandle());

    let funStopScroll;
    modFsm.fsm.post_hook_entry("c_Move", (hookData) => {
        const { eltJmnode, pointerType } = hookData.data;
        if (eltJmnode) throw Error("eltJmnode in c_Move");
        funStopScroll = undefined;
        // return; // FIX-ME:
        if (pointerType != "mouse") return;
        const jmnodes = getJmnodesFromJm(jmDisplayed);
        const jsmindInner = jmnodes.closest(".jsmind-inner");
        funStopScroll = startGrabScroll(jsmindInner);
    });
    modFsm.fsm.hook_exit("c_Move", () => { if (funStopScroll) funStopScroll(); });

    modFsm.fsm.post_hook_entry("c_Dblclick", () => { dialogEditMindmap(); });
    modFsm.fsm.post_hook_entry("n_Dblclick", async (hookData) => {
        // const eltJmnode = hookData.data;
        const { eltJmnode } = hookData.data;
        const renderer = await modCustRend.getOurCustomRenderer();
        renderer.editNodeDialog(eltJmnode);
    });

    modFsm.setupFsmListeners(eltFsm);




    const modCustRend = await importFc4i("jsmind-cust-rend");
    modCustRend.setOurCustomRendererJm(jmDisplayed);
    modCustRend.setOurCustomRendererJmOptions(defaultOptJmDisplay);
    const render = await modCustRend.getOurCustomRenderer();


    // Double click on Windows and Android
    jmDisplayed.disable_event_handle("dblclick");
    const eltJmnodes = getJmnodesFromJm(jmDisplayed);
    // Windows
    eltJmnodes.addEventListener("dblclick", evt => {
        // FIX-ME: there is no .eventType - is this a bug?
        // if ((evt.eventType != "mouse") && (evt.eventType != "pen")) return;
        if ((evt.type != "mouse") && (evt.type != "pen")) return;
        if (!(evt instanceof MouseEvent)) return;
        evt.preventDefault();
        evt.stopPropagation();
        evt.stopImmediatePropagation();
        render.mindmapDblclick(evt);
    });
    // Android
    const jmnodesLastTouchend = {
        ms: 0,
        clientX: -1,
        clientY: -1,
    }
    eltJmnodes.addEventListener("NOtouchend", (evt) => {
        // if (evt.eventType != "touch") throw Error(`"touchend", but eventType:${evt.eventType}`);
        if (evt.type != "touchend") throw Error(`"touchend", but event.type:${evt.type}`);
        const currentTime = Date.now();
        const msTouchLength = currentTime - jmnodesLastTouchend.ms;

        let touchDistance = 0;
        let clientX = evt.clientX;
        let clientY = evt.clientY;
        if (clientX == undefined) {
            const touches = evt.touches || evt.changedTouches;
            if (!touches) throw Error(`touches is undefined`);
            // if (!Array.isArray(touches)) throw Error(`touches is not array`);
            if (touches.length == 0) throw Error(`touches.length == 0`);
            const touch = touches[0] || touches.item(0);
            if (!touch) throw Error(`touch is undefined`);
            clientX = touch.clientX;
            clientY = touch.clientY;
            const dX = jmnodesLastTouchend.clientX - clientX;
            const dY = jmnodesLastTouchend.clientY - clientY;
            touchDistance = Math.sqrt(dX * dX + dY * dY);
            if (isNaN(touchDistance)) {
                const msg = `
            touchDistance isNaN, dX:${dX}, dY:${dY}
            evt.type:${evt.type}
            evt.clientX:${evt.clientX}
            evt.clientY:${evt.clientY}
            jmnodesLastTouchend.clientX:${jmnodesLastTouchend.clientX}
            `;

                throw Error(msg);
            }
        }
        if (msTouchLength < 500 && msTouchLength > 0 && touchDistance < 10) {
            render.mindmapDblclick(evt);
            jmnodesLastTouchend.ms = 0;
            jmnodesLastTouchend.clientX = -1;
            jmnodesLastTouchend.clientY = -1;
        }
        jmnodesLastTouchend.ms = currentTime;
        jmnodesLastTouchend.clientX = evt.clientX;
        jmnodesLastTouchend.clientY = evt.clientY;
    });


    render.applyThisMindmapGlobals();

    switchDragTouchAccWay(theDragTouchAccWay);

    const nowAfter = Date.now();
    console.log(`*** displayMindMap, custom rendering: ${nowAfter - nowBefore} ms`);


    // let jmMirrored;
    // let ourCustomRenderer4mirror;

    // FIX-ME: remove when this is fixed in jsmind.
    fixProblemsAndUpdateCustomAndShapes(jmDisplayed);

    async function setNodeHitsFromArray(arrIdHits, hitType) {
        const eltJmnodes = getJmnodesFromJm(jmDisplayed);
        eltJmnodes.classList.add("showing-hits");
        if (hitType == "provider") {
            // @ts-ignore
            jsMindContainer.classList.add("display-jsmind-search");
            const divInputs = document.getElementById("jsmind-search-inputs");
            // @ts-ignore
            divInputs.classList.add("showing-provider-hits");
        }
        console.log({ arrHits: arrIdHits });
        arrIdHits.forEach(id => {
            const node = jmDisplayed.get_node(id);
            const eltNode = jsMind.my_get_DOM_element_from_node(node);
            eltNode.classList.add("jsmind-hit");
        });

        if (arrIdHits.length == 0) {
            if (hitType == "provider") {
                divHits.textContent = "No link to provider item";
            } else {
                divHits.textContent = "No search hits";
            }
            return;
        }
        const btnCurr = await modMdc.mkMDCbutton("wait");
        btnCurr.addEventListener("click", () => {
            const num = getBtnCurrNum();
            selectHit(num);
        })
        setHitTo(1);
        function selectHit(num) {
            setTimeout(() => jmDisplayed.select_node(arrIdHits[num - 1]), 200);
        }
        function setHitTo(num) {
            setBtnCurrNum(num);
            selectHit(num);
        }

        function getBtnCurrNum() {
            const txt = btnCurr.textContent;
            const num = parseInt(txt);
            return num;
        }
        function setBtnCurrNum(num) {
            const eltTxt = btnCurr.querySelector(".mdc-button__label");
            eltTxt.textContent = `${num} (${arrIdHits.length})`;
        }
        const btnPrev = await modMdc.mkMDCbutton("<");
        btnPrev.addEventListener("click", () => {
            let nextNum = getBtnCurrNum() - 1;
            if (nextNum < 1) nextNum = arrIdHits.length;
            setHitTo(nextNum);
        });
        const btnNext = await modMdc.mkMDCbutton(">");
        btnNext.addEventListener("click", () => {
            let nextNum = getBtnCurrNum() + 1;
            if (nextNum > arrIdHits.length) nextNum = 1;
            setHitTo(nextNum);
        });
        const eltInfo = mkElt("span", undefined, [
            "Hits: ", btnCurr,
        ])
        const divHitsInner = mkElt("div", undefined, [
            eltInfo, btnPrev, btnNext
        ]);
        divHits.textContent = "";
        divHits.appendChild(divHitsInner);
        // divSearchInputs.appendChild(divHits);
        divHits.classList.remove("display-none");
    }

    // if (nodeHits) { setProviderNodeHits(); }
    setProviderNodeHits();
    async function setProviderNodeHits() {
        if (!nodeHits) return;
        const arrIdHits = nodeHits.split(",");
        setNodeHitsFromArray(arrIdHits, "provider");
    }

    jmDisplayed.add_event_listener((type, data) => {
        if (type !== 3) return;
        addDebugLog(`jmDisplayed, event_listener, ${type}`)
        const evt_type = data.evt;
        const datadata = data.data;
        const node_id = data.node;
        // console.log({ evt_type, type, datadata, data });
        finnishAndMirrorOperationOnNode(evt_type, node_id, datadata);
        modMMhelpers.DBrequestSaveThisMindmap(jmDisplayed); // FIX-ME: delay
        // updateTheMirror();
    });
    async function finnishAndMirrorOperationOnNode(operation_type, operation_node_id, datadata) {
        console.log("finAndMirr", { operation_type, operation_node_id, jm_operation: jmDisplayed, datadata });
        // if (!jmMirrored) return;
        switch (operation_type) {
            case "add_node":
                const id_added = operation_node_id;
                const added_node = jmDisplayed.get_node(id_added);
                console.log({ operation_type, id_added, added_node });
                // const id_parent = datadata[0];
                if (id_added != datadata[1]) throw Error(`id_added (${id_added}) != datadata[1] (${datadata[1]})`);
                // const topic_added = datadata[2];
                // jmMirrored?.add_node(id_parent, id_added, topic_added);
                break;
            case "update_node":
                {
                    const id_updated = operation_node_id;
                    const updated_node = jmDisplayed.get_node(id_updated);
                    console.log({ operation_type, id_updated, updated_node });
                    // const [id, topic] = datadata
                    const eltJmnode = jsMind.my_get_DOM_element_from_node(updated_node);
                    // const eltTxt = eltJmnode.lastElementChild;
                    const eltTxt = eltJmnode.querySelector(".jmnode-text");
                    if (!eltTxt.classList.contains("jmnode-text")) throw Error("Not .jmnode-text");
                    const isPlainNode = eltTxt.childElementCount == 0;
                    // modCustRend.addJmnodeBgAndText(eltJmnode);
                    // const isCustomNode = topic.search(" data-jsmind-custom=") > 0;
                    if (!isPlainNode) {
                        (await getCustomRenderer()).updateJmnodeFromCustom(eltJmnode);
                    }
                }
                break;
            case "move_node":
                {
                    console.warn("move_node event");
                    /*
                    function walkMoved(id_moved) {
                        // FIX-ME: class left, etc
                        console.log({ id_moved });
                        const moved_node = jmDisplayed.get_node(id_moved);
                        moved_node.children.forEach(child => {
                            walkMoved(child.id);
                        });
                    }
                    */
                    const id_moved = operation_node_id;
                    const moved_node = jmDisplayed.get_node(id_moved);
                    const eltJmnode = jsMind.my_get_DOM_element_from_node(moved_node);
                    const isPlainNode = eltJmnode.childElementCount == 0;
                    // modCustRend.addJmnodeBgAndText(eltJmnode);
                    if (!isPlainNode) {
                        (await getCustomRenderer()).updateJmnodeFromCustom(eltJmnode);
                    }
                    // const before_id = datadata[1];
                    // const parent_id = datadata[2];
                    // jmMirrored?.move_node(id_moved, before_id, parent_id);
                    break;
                }
            case "remove_node":
                // const id_removed = operation_node_id;
                const id_removed = datadata[0];
                console.log({ operation_type, id_removed, operation_node_id });
                // jmMirrored?.remove_node(id_removed);
                break;
            default:
                console.warn(`unknown operation_type: ${operation_type}`);
        }
    }



    /*
    setTimeout(() => {
        // [...document.getElementsByTagName("jmnode")].forEach(eltJmnode => { });
        const jmData = jmDisplayed.get_data("node_array");
        jmData.data.forEach(entry => {
            const node = jmDisplayed.get_node(entry.id);
            const eltJmnode = jsMind.my_get_DOM_element_from_node(node);
            // applyNodeShapeEtc(node, eltJmnode);
        });
    }, 500);
    */

    jsMindContainer.appendChild(divDebugLog);

    async function getDivContextMenu() {
        if (!divContextMenu) {
            divContextMenu = modMdc.mkMDCmenuDiv();
            divContextMenu.classList.add("is-menu-div");
            document.body.appendChild(divContextMenu);
            divContextMenu.id = idContextMenu;
        }
        return divContextMenu;
    }
    let highestNodeId = 0;
    jmDisplayed.enable_edit();
    const jmData = jmDisplayed.get_data("node_array");
    jmData.data.forEach(entry => {
        // if (entry.id === "root") return;
        if (!Number.isInteger(entry.id)) return;
        highestNodeId = Math.max(+entry.id, highestNodeId);
    });
    function getNextNodeId() { return ++highestNodeId; }

    function hideContextMenuOnEvent(evt) {
        if (!divContextMenu) return;
        if (!targetIsJmnode(evt) && !divContextMenu.contains(evt.target)) hideContextMenu();
    }

    if (!jsMindContainer) throw Error("jsMindContainer is null");
    // These bubbles up:
    jsMindContainer.addEventListener("pointerdown", evt => hideContextMenuOnEvent(evt));
    jsMindContainer.addEventListener("click", evt => {
        // evt.stopPropagation();
        // evt.preventDefault();
        const target = evt.target;
        if (!(target instanceof HTMLElement)) throw Error("target is not HTMLElement");
        if (!target) return;
        const eltJmnode = target.closest("jmnode");
        if (!eltJmnode) return;
        const node_id = getNodeIdFromDOMelt(eltJmnode);
        jmDisplayed.select_node(node_id);
        const bcr = eltJmnode.getBoundingClientRect();
        // const bcrLeft = bcr.left;
        // const bcrRight = bcr.right;
        const bcrWidth = bcr.width;
        // const evtSX = evt.screenX;
        // const evtCX = evt.clientX;
        const evtOX = evt.offsetX;
        // const isOutsideS = (evtSX < bcrLeft) || (evtSX > bcrRight);
        // const isOutsideC = (evtCX < bcrLeft) || (evtCX > bcrRight);
        const isOutsideO = (evtOX < 0) || (evtOX > bcrWidth);
        // console.log({ isOutsideS, isOutsideO, isOutsideC, evtSX, evtOX, evtCX, bcrLeft, bcrRight, bcrWidth, target, eltJmnode });
        if (isOutsideO) {
            const node_id = jsMind.my_get_nodeID_from_DOM_element(eltJmnode);
            jmDisplayed.toggle_node(node_id);
            // eltJmnode.classList.toggle("is-expanded");
            (async () => {
                // modMMhelpers.DBrequestSaveThisMindmap((await getCustomRenderer()).THEjmDisplayed);
                const renderer = await getCustomRenderer();
                modMMhelpers.DBrequestSaveThisMindmap(renderer.THEjmDisplayed);
            })();
        }
        if (target.dataset.jsmindCustom) {
            setTimeout(async () => {
                // const eltCustom = eltJmnode.querySelector(".jsmind-custom");
                // const eltCustom = eltJmnode.querySelector(".jsmind-custom-image");
                const eltCustom = target;
                const strCustom = eltCustom.dataset.jsmindCustom;
                if (!strCustom) { throw Error("Not custom"); }
                const objCustom = JSON.parse(strCustom);
                const prov = objCustom.provider;
                const go = await modMdc.mkMDCdialogConfirm(`Show entry in ${prov}?`);
                console.log({ go });
                if (!go) return;
                // showKeyInFc4i(objCustom.key);
                debugger; // eslint-disable-line no-debugger
                const render = await modCustRend.getOurCustomRenderer();
                // if (!render instanceof CustomRenderer4jsMind) throw Error(`Not a custom renderer`);
                render.showCustomRec(objCustom.key, objCustom.provider);
            }, 100);
        };
    });

    /*
    function displayContextMenuOnContainer(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        displayContextMenu(jsMindContainer, evt.clientX, evt.clientY);
    }
    */

    let msDelayContextMenu = 0;
    jsMindContainer.addEventListener("NOtouchmove", evt => {
        // evt.preventDefault();
        evt.stopPropagation();
        stopContextMenu();
    });
    jsMindContainer.addEventListener("NOtouchstart", evt => {
        const jmnode = targetIsJmnode(evt);
        if (jmnode) {
            evt.stopPropagation();
            msDelayContextMenu = 1000;
            jmDisplayed.select_node(jmnode);
        }
    });
    jsMindContainer.addEventListener("NOcontextmenu", evt => {
        if (targetIsJmnode(evt)) {
            evt.preventDefault();
            if (!(evt instanceof PointerEvent)) { throw Error("not PointerEvent"); }
            // if (!(evt.clientX && evt.clientY)) { throw Error("evt does not have position"); }
            const x = `${evt.clientX}`;
            const y = `${evt.clientY}`;
            restartDisplayContextMenu(evt.target, x, y);
        }
    });

    function targetIsJmnode(evt) {
        const targ = evt.target;
        const jmnode = targ.closest("jmnode");
        return jmnode;
    }
    function stopContextMenu() { restartDisplayContextMenu(); }
    const restartDisplayContextMenu = (() => {
        let tmr;
        return (forElt, x, y) => {
            clearTimeout(tmr);
            if (forElt === undefined) return;
            const doDisplay = () => displayContextMenu(forElt, x, y);
            tmr = setTimeout(doDisplay, msDelayContextMenu);
        }
    })();


    async function displayContextMenu(forElt, left, top) {
        const divMenu = await getDivContextMenu();
        await mkPageMenu();
        divMenu.forElt = forElt;
        // Set values in integer, read them as ..px
        if (left) divMenu.style.left = left;
        if (top) divMenu.style.top = top;
        divMenu.style.opacity = 0;
        divMenu.style.display = "block";
        const compStyle = getComputedStyle(divMenu);

        const right = parseInt(compStyle.right);
        // console.log({ right });
        // FIX-ME: This is fragile. Chrome tries to wrap the menu.
        if (right <= 0) divMenu.style.left = parseInt(divMenu.style.left) + right - 30;

        const bottom = parseInt(compStyle.bottom);
        // console.log({ bottom });
        if (bottom < 0) divMenu.style.top = parseInt(divMenu.style.top) + bottom;

        divMenu.style.opacity = 1;
    }

    async function dialogEditMindmap() {
        const rend = await modCustRend.getOurCustomRenderer();
        await rend.editMindmapDialog();
    }

    async function mkPageMenu() {
        let toJmDisplayed;
        try {
            toJmDisplayed = typeof jmDisplayed;
        } catch (err) {
            console.log({ err });
        }
        console.log({ toJmDisplayed });
        const selected_node = toJmDisplayed && jmDisplayed?.get_selected_node();

        function getSelected_node() {
            if (!selected_node) {
                modMdc.mkMDCdialogAlert("No selected node");
                return false;
            }
            return selected_node;
        }
        function markIfNoSelected(li) {
            if (selected_node) return;
            li.classList.add("jsmind-menu-no-selected-node");
        }
        function markIfNoMother(li) {
            if (selected_node?.parent) return;
            li.classList.add("jsmind-menu-no-selected-node");
        }


        async function pasteCustom2node() {
            // const liDelete = mkMenuItem("Delete node", deleteNode);
            const selected_node = getSelected_node();
            // if (!selected_node) Error("No selected node");
            if (!selected_node) return;
            const eltJmnode = jsMind.my_get_DOM_element_from_node(selected_node);
            const objCustom = await modMMhelpers.pasteCustomClipDialog();
            console.log({ objCustom });
            if (!objCustom) return;
            convertPlainJmnode2ProviderLink(eltJmnode, jmDisplayed, objCustom);
        }

        const liTestConvertToCustom = mkMenuItem("Link node to custom content", pasteCustom2node);
        markIfNoSelected(liTestConvertToCustom);

        // const liTestPointHandle = mkMenuItem("test pointHandle", setupPointHandle);
        // liTestPointHandle.classList.add("test-item");

        // https://html2canvas.hertzen.com/getting-started.html
        // const liTestMirror = mkMenuItem("test mirror", testStartMirror);
        const liDragAccessibility = mkMenuItem("Drag accessiblity", dialogDragAccessibility);

        // const mm4iAbsLink = makeAbsLink("./mm4i/mm4i.html");
        // const liMindmapsA = mkMenuItemA("List Mindmaps", mm4iAbsLink);
        const liMindmapsA = mkMenuItemA("List Mindmaps", "./mm4i/mm4i.html");
        console.log({ liMindmapsA });

        const liEditMindmap = mkMenuItem("Edit Mindmap", dialogEditMindmap);
        // const idScreenMirrorPoint = "jsmindtest-screen-mirror-point";
        // const idScreenMirrorColor = "jsmindtest-screen-mirror-color";


        async function dialogDragAccessibility() {
            const oldWay = theDragTouchAccWay;
            const newWay = await dialogMirrorWay();
            if (newWay == oldWay || !newWay) return;
            // teardownPointHandle();
            // teardownMirror();
            switchDragTouchAccWay(newWay);
        }

        // https://www.npmjs.com/package/pinch-zoom-js
        const liTestPinchZoom = mkMenuItem("test pinch-zoom a",
            async () => {
                const src = "https://unpkg.com/pinch-zoom-js@2.3.5/dist/pinch-zoom.min.js";
                // const eltScript = mkElt("script", { src });
                // document.body.appendChild(eltScript);
                const modPZ = await import(src);
                const addZoom = () => {
                    console.log("***** addZoom");
                    const jmnodes = document.querySelector("jmnodes");
                    if (!jmnodes) throw Error("Could not find <jmnodes>");
                    // const options = { }
                    // const pz = new PinchZoom(jmnodes, options);
                    const pz = new modPZ.default(jmnodes.parentElement);
                    console.log({ pz });
                }
                // setTimeout(addZoom, 1000);
                addZoom();
            });
        liTestPinchZoom.classList.add("test-item");

        const liTestDragBetween = mkMenuItem("draggable-nodes.js - test move between",
            async () => {
                const m = await getDraggableNodes();
                m.startTrackingPointer()
            });
        liTestDragBetween.classList.add("test-item");

        const liTestTabindex = mkMenuItem("Test tabindex=1",
            () => {
                document.querySelectorAll("jmnode").forEach(jmn => {
                    jmn.setAttribute("tabindex", "1");
                })
            }
        );
        liTestTabindex.classList.add("test-item");

        const liTestSvgDrawLine = mkMenuItem("Test svg draw line",
            async () => {
                const modJsmindDraggable = await getDraggableNodes();
                modJsmindDraggable.testSvgLine();
            }
        );
        liTestSvgDrawLine.classList.add("test-item");

        const liAddChild = mkMenuItem("Add child node", () => addNode("child"));
        markIfNoSelected(liAddChild);

        const liAddSibling = mkMenuItem("Add sibling node", () => addNode("brother"));
        markIfNoSelected(liAddSibling);
        markIfNoMother(liAddSibling);

        async function addNode(rel) {
            const selected_node = getSelected_node();
            if (selected_node) {
                // const jm = jsMind.current;
                const jm = jmDisplayed;
                const new_node_id = getNextNodeId();
                let fromClipBoard;
                try {
                    fromClipBoard = await navigator.clipboard.readText();
                    if (fromClipBoard?.length > 0) {
                        fromClipBoard = fromClipBoard
                            .trim()
                            // @ts-ignore
                            .replaceAll(/\s/g, "x")
                            .slice(0, 100);
                    }
                } catch (err) {
                    console.warn(err);
                }
                const new_node_topic = fromClipBoard || `Node ${new_node_id}`;
                let new_node;
                switch (rel) {
                    case "child":
                        new_node = await jm.add_node(selected_node, new_node_id, new_node_topic);
                        console.log(`child .add_node(${selected_node.id}, ${new_node_id}, ${new_node_topic})`);
                        break;
                    case "brother":
                        const mother_node = selected_node.parent;
                        if (!mother_node) {
                            modMdc.mkMDCdialogAlert("This node can't have siblings");
                        } else {
                            new_node = await jm.add_node(mother_node, new_node_id, new_node_topic);
                            console.log(`brother .add_node(${mother_node.id}, ${new_node_id}, ${new_node_topic})`);
                        }
                        break;
                }
                jm.select_node(new_node);
                // setTimeout(() => { newNode._data.view.element.draggable = true; }, 1000);
                setTimeout(() => {
                    // jsMind.my_get_DOM_element_from_node(new_node).draggable = true;
                    const eltJmnode = jsMind.my_get_DOM_element_from_node(new_node);
                    fixJmnodeProblem(eltJmnode);
                }, 1000);
            }
        }

        const liDelete = mkMenuItem("Delete node", deleteNode);
        markIfNoSelected(liDelete);
        markIfNoMother(liDelete);

        function deleteNode() {
            const selected_node = getSelected_node();
            if (selected_node) {
                const mother = selected_node.parent;
                if (!mother) {
                    modMdc.mkMDCdialogAlert("This node can't be deleted");
                } else {
                    const jm = jmDisplayed;
                    jm.remove_node(selected_node);
                    jm.select_node(mother);
                }
            }
            hideContextMenu();
        }

        const arrMenuEntries = [
            liAddChild,
            liAddSibling,
            liDelete,
            liTestConvertToCustom,
            liDragAccessibility,
            liEditMindmap,
            liMindmapsA,
        ];
        const arrMenuTestEntries = [
            // liTestSvgDrawLine,
            // liTestTabindex,
            // liTestDragBetween,
            liTestPinchZoom,
            // liTestPointHandle,
        ];
        const arrMenuAll = [...arrMenuEntries, ...extraPageMenuItems, ...arrMenuTestEntries];

        const ulMenu = modMdc.mkMDCmenuUl(arrMenuAll);
        const divMenu = await getDivContextMenu();
        divMenu.textContent = "";
        divMenu.appendChild(ulMenu);
        return divMenu;
    }

    async function displayMindMap(mind, options) {
        const jm = new jsMind(options);
        await jm.show_async(mind);
        return jm;
    }

    // addScrollIntoViewOnSelect(jmDisplayed);
    addScrollIntoViewOnSelect();
    function jsmindSearchNodes(strSearch) {
        // @ts-ignore
        const nodeEltArray = [...jsMindContainer.querySelectorAll("jmnode[nodeid]")];
        nodeEltArray.forEach(n => n.classList.remove("jsmind-hit"));
        if (strSearch.length === 0) return;
        const searchLower = strSearch.toLocaleLowerCase();
        // FIX-ME: words
        const matchingNodes = nodeEltArray.filter(node => {
            const topic = node.textContent;
            // @ts-ignore
            const topicLower = topic.toLocaleLowerCase();
            return topicLower.indexOf(searchLower) >= 0;
        });
        const arrIdHits = matchingNodes.map(n => jsMind.my_get_nodeID_from_DOM_element(n));
        setNodeHitsFromArray(arrIdHits, "search");
        console.log({ matchingNodes });
    }


    /*
    function onMousemoveJmnode(evt) {
        if (evt.target.nodeName !== "JMNODE") return;
        console.log("ddrag", { evt });
    }
    */

    jmDisplayed.select_node(jmDisplayed.get_root());

    /*
    function rectDist(br1, br2) {
        const brLeft = br1.left < br2.left ? br1 : br2;
        const brRight = br1.right > br2.right ? br1 : br2;
        const overLapHor = brLeft.right > brRight.left;
        const brTop = br1.top < br2.top ? br1 : br2;
        const brBottom = br1.bottom > br2.bottom ? br1 : br2;
        const overLapVer = brTop.bottom > brBottom.top;
        if (overLapHor && overLapVer) return 0;
        if (overLapHor) { return brTop.bottom - brBottom.top; }
        if (overLapVer) { return brRight.left - brLeft.right; }
        const w = brLeft.right - brRight.left;
        const h = brTop.bottom - brBottom.top;
        return Math.sqrt(h * h + w * w);
    }
    */




    function startGrabScroll(ele) {
        let isScrolling = true;
        const ourElement = ele;

        ele.style.cursor = "grabbing";
        const posScrollData = {
            left: ele.scrollLeft,
            top: ele.scrollTop,
            clientX: evtPointerLast.clientX,
            clientY: evtPointerLast.clientY,
        }
        function requestScroll() {
            if (!isScrolling) return;
            // window.addE
            // evtPointerLast.clientY = evt.clientY;
            const dx = evtPointerLast.clientX - posScrollData.clientX;
            const dy = evtPointerLast.clientY - posScrollData.clientY;
            if (isNaN(dx)) { isScrolling = false; return; }
            if (isNaN(dy)) { isScrolling = false; return; }

            // Scroll the element
            ele.scrollTop = posScrollData.top - dy;
            ele.scrollLeft = posScrollData.left - dx;

            requestAnimationFrame(requestScroll);
        }
        requestScroll();
        return () => {
            ourElement.style.cursor = "";
            isScrolling = false;
        }
    }
    /*
    function OLDaddGrabAndScroll(ele, mousedownTargets) {
        // https://htmldom.dev/drag-to-scroll/ <- spam now
        // https://phuoc.ng/collection/html-dom/drag-to-scroll/
        // .container { cursor: grab; overflow: auto; } 
        const posScrollData = {};
        const posPointerData = {};
        let isGrabMoving = false;

        const isMousedownTarget = (targ) => {
            if (Array.isArray(mousedownTargets)) {
                return mousedownTargets.includes(targ);
            } else {
                return targ === mousedownTargets;
            }
            return false;
        }
        const mouseDownHandler = (evt) => {
            return;
            // console.log("ele mousedown");
            if (!isMousedownTarget(evt.target)) {
                // console.log("not mousedown target");
                return;
            }
            evt.preventDefault();
            // evt.stopPropagation();
            console.log("grabDownHandler", { grabUpHandler, grabMoveHandler });
            posScrollData = {
                // The current scroll
                left: ele.scrollLeft,
                top: ele.scrollTop,
                // Get the current mouse position
                x: evt.clientX,
                y: evt.clientY,
            };
            posScrollData.left = ele.scrollLeft;
            posScrollData.top = ele.scrollTop;
            posScrollData.clientX = evt.clientX;
            posScrollData.clientY = evt.clientY;

            posPointerData.clientX = evt.clientX;
            posPointerData.clientY = evt.clientY;
            // Change the cursor and prevent user from selecting the text
            ele.style.cursor = "grabbing";

            ele.addEventListener('mousemove', grabMoveHandler);
            ele.addEventListener('mouseup', grabUpHandler);
            // ele.addEventListener('pointerup', mouseUpHandler);
            ele.addEventListener("mouseleave", grabUpHandler);

            isGrabMoving = true;
            requestGrabMove();
        };
        const grabMoveHandler = (evt) => {
            console.log("grabMoveHandler");
            posPointerData.clientX = evt.clientX;
            posPointerData.clientY = evt.clientY;
        }
        const requestGrabMove = () => {
            if (!isGrabMoving) return;
            // console.log("requestGrabMove");
            const dx = posPointerData.clientX - posScrollData.clientX;
            const dy = posPointerData.clientY - posScrollData.clientY;
            if (isNaN(dx)) debugger;
            if (isNaN(dy)) debugger;

            // Scroll the element
            ele.scrollTop = posScrollData.top - dy;
            ele.scrollLeft = posScrollData.left - dx;

            requestAnimationFrame(requestGrabMove);
        };
        const grabUpHandler = (evt) => {
            evt.preventDefault();
            evt.stopPropagation();
            console.log("grabUpHandler");
            isGrabMoving = false;

            ele.removeEventListener('mousemove', grabMoveHandler);
            ele.removeEventListener('mouseup', grabUpHandler);

            // ele.style.cursor = 'grab';
            ele.style.removeProperty('cursor');
            // console.log("mouseUpHandler", ele.style.cursor);
            ele.style.removeProperty('user-select');
        };

        const showDraggable = () => {
            // Change the cursor and prevent user from selecting the text
            ele.style.cursor = 'grab';
            // console.log("showDraggable", ele.style.cursor);
            ele.style.userSelect = 'none';
        };
        // ele.addEventListener("mousedown", mouseDownHandler);
        ele.addEventListener("pointerdown", mouseDownHandler);
        // ele.addEventListener("dragstart", mouseUpHandler);
        showDraggable();

    }
    */

    // if (!hasTouchEvents()) addGrabAndScroll2jsmind();



    /*
    // https://javascript.info/bezier-curve
        For 4 control points:
        P = (1−t)3P1 + 3(1−t)2tP2 +3(1−t)t2P3 + t3P4
    function makePoint(x, y) { return { x, y } }
    function isPoint(xy) {
        return !isNaN(xy.x) && !isNaN(xy.y);
    }
    function bezier(t, p1, p2, p3, p4) {
        check01(t);
        function check01(what, v) {
            if (v < 0) throw Error(`${what} < 0 (${v})`);
            if (v > 1) throw Error(`${what} > 1 (${v})`);
        }

    }
    */


    async function convertPlainJmnode2ProviderLink(eltJmnode, jmOwner, objCustomCopied) {
        // console.log("convertDOMnodeTo...", eltJmnode, objCustomCopied);
        if (eltJmnode.tagName != "JMNODE") throw Error("Not <jmnode>");
        /*
        const lastElementChild = eltJmnode.lastElementChild;
        if (lastElementChild) {
            if (lastElementChild.classList.contains("jsmind-custom")) {
                alert("Already provider link, not handled yet");
                return;
            }
        }
        function isCustomJmnode(eltJmnode) {
            if (eltJmnode.tagName != "JMNODE") throw Error("Not <jmnode>");
            const eltLast = eltJmnode.lastElementChild;
            if (eltLast?.classList.contains("jsmind-custom")) return true;
            return false;
        }

        if (isCustomJmnode(eltJmnode)) {
            alert("Already provider link, not handled yet");
            return;
        }
        if (eltJmnode.childElementCount == 3) { debugger;}
        */

        const provider = objCustomCopied.provider;
        if (!(await getCustomRenderer()).getProviderNames().includes(provider)) throw Error(`Provider ${provider} is unknown`);
        const providerKey = objCustomCopied.key;

        const strJsmindTopic = (await getCustomRenderer()).customData2jsmindTopic(providerKey, provider);

        console.log("eltJmnode", eltJmnode, strJsmindTopic);
        if (jmOwner) {
            const node_id = jsMind.my_get_nodeID_from_DOM_element(eltJmnode);
            jmOwner.update_node(node_id, strJsmindTopic);
            jmOwner.set_node_background_image(node_id, undefined, 150, 100);
        } else {
            const s = eltJmnode.style;
            s.height = s.height || "140px";
            s.width = s.width || "140px";
            const eltCustom = (await getCustomRenderer()).jsmindTopic2customElt(strJsmindTopic);
            eltJmnode.appendChild(eltCustom);
            (await getCustomRenderer()).updateJmnodeFromCustom(eltJmnode, jmOwner);
        }
    }
}

function hasTouchEvents() {
    let hasTouch = false;
    try {
        document.createEvent("TouchEvent");
        hasTouch = true;
    } catch { }
    return hasTouch;

}

///////////////////////////////////////////////
// Utility functions.

// FIX-ME: Should be in jsmind core
function getDOMeltFromNode(node) { return jsMind.my_get_DOM_element_from_node(node); }
function getNodeIdFromDOMelt(elt) { return jsMind.my_get_nodeID_from_DOM_element(elt); }
// basicInit4jsmind();



function getJmnodesFromJm(jmDisplayed) {
    const root_node = jmDisplayed.get_root();
    const eltRoot = jsMind.my_get_DOM_element_from_node(root_node);
    const eltJmnodes = eltRoot.closest("jmnodes");
    return eltJmnodes;
}


/*
export async function fixJmnodeProblem(eltJmnode) {
    console.warn("fixJmnodeProblem", eltJmnode);
    return;
    const customRenderer = await modCustRend.getOurCustomRenderer();
    // customRenderer.fixLeftRightChildren(eltJmnode);
    return;

    const isPlainNode = eltJmnode.childElementCount == 0;
    const isNewCustomFormat = eltJmnode.childElementCount == 1;
    const eltRendererImg = eltJmnode.lastElementChild;
    const eltTopic = eltJmnode.firstElementChild;

    const { eltTxt, eltBg } = modCustRend.addJmnodeBgAndText(eltJmnode);

    if (isPlainNode) {
        const txt = eltJmnode.textContent;
        const f1 = eltJmnode.firstChild;
        if (f1.nodeName != "#text") throw Error(`First child not #text: ${f1.nodeName}`);
        f1.remove();
        eltTxt.textContent = txt;
    } else {
        // Custom node
        if (!isNewCustomFormat) {
            console.log("old custom format 3");
            eltTopic.remove();
            const customData = eltTopic.dataset.jsmindCustom;
            // delete htmlTopic.dataset.jsmindCustom;
            eltRendererImg.dataset.jsmindCustom = customData;
        }
    }
}
*/

function isVeryOldCustomFormat(eltJmnode) {
    const child1 = eltJmnode.firstElementChild;
    if (!child1) return false;
    if (child1.classList.contains("fc4i")) {
        console.log("Old custom format", { eltJmnode });
        // https://www.encodedna.com/javascript/override-important-style-property-in-javascript.htm
        // eltJmnode.style.border = "10px double red !important";
        setTimeout(() => {
            eltJmnode.style.setProperty("border", "10px double red", "important");
            eltJmnode.style.setProperty("background-color", "black", "important");
            eltJmnode.style.setProperty("color", "white", "important");
            clearShapes(eltJmnode);
            const eltDelete = mkElt("div", undefined, "Delete!");
            eltDelete.style.position = "absolute";
            eltDelete.style.bottom = 0;
            eltDelete.style.right = 0;
            eltDelete.style.setProperty("background-color", "red", "important");
            eltDelete.style.zIndex = 1000;
            eltJmnode.appendChild(eltDelete);
        }, 1000);
        return true;
    }
}
/* function fixOldCustomAndUpdate(eltJmnode) { } */

function fixProblemsAndUpdateCustomAndShapes(jmDisplayed) {
    setTimeout(() => {
        console.log("fixJmnodesProblem (in setTimeout fun)");
        addDebugLog("fixJmnodesProblem (in setTimeout fun)");
        const eltJmnodes = getJmnodesFromJm(jmDisplayed);
        // [...document.getElementsByTagName("jmnode")].forEach(eltJmnode => 
        [...eltJmnodes.getElementsByTagName("jmnode")].forEach(async eltJmnode => {
            if (isVeryOldCustomFormat(eltJmnode)) return;
            // await fixJmnodeProblem(eltJmnode); // FIX-ME: Remove when this is fixed in jsmind
            // fixOldCustomAndUpdate(eltJmnode);
            const node_id = jsMind.my_get_nodeID_from_DOM_element(eltJmnode);
            if (node_id == 21) console.warn("node_id 21");
            const node = jmDisplayed.get_node(node_id);
            applyNodeShapeEtc(node, eltJmnode);
        });
    }, 500);
}

// https://css-tricks.com/converting-color-spaces-in-javascript/
// function RGBToHex(rgb) { return standardizeColorTo6Hex(rgb); }

// https://stackoverflow.com/questions/1573053/javascript-function-to-convert-color-names-to-hex-codes/47355187#47355187
export function standardizeColorTo6Hex(strColor) {
    const ctx = document.createElement('canvas').getContext('2d');
    if (!ctx) { throw Error("Could not get canvas 2d"); }
    ctx.fillStyle = strColor;
    return ctx.fillStyle;
}
export function to6HexColor(color) {
    return standardizeColorTo6Hex(color);
}







///////////////////////////////////////////////
// Custom rendering



export function getMatchesInCssRules(re) {
    const selectors = new Set();
    // const re = new RegExp('\\.' + pattern.replace(/([^\s])\*/, '$1[^ ]+'), 'g')
    for (let i = 0, len = document.styleSheets.length; i < len; i++) {
        const sheet = document.styleSheets[i];
        // console.log("sheet", sheet.href);
        let cssRules;
        try {
            cssRules = sheet.cssRules;
        } catch { }
        if (!cssRules) continue;
        for (let cssRule of cssRules) {
            if (!(cssRule instanceof CSSStyleRule)) { continue; }
            const selectorText = cssRule.selectorText;
            if (!selectorText) {
                // console.log("*** cssRule", cssRule);
            } else {
                // console.log("selectorText", selectorText);
                const m = cssRule.selectorText.match(re);
                if (m) {
                    // selectors.add(cssRule.selectorText);
                    selectors.add(m[1]);
                }
            }
        }
    }
    console.log({ selectors, }, re);
    return [...selectors];
}

// chatGPT
/*
function getRectangleInEllipse(w, h) {
    const a = w / 2;
    const b = h / 2;
    const r_ellipse = a / b;

    const r = r_ellipse;

    const x = (r * a * b) / Math.sqrt((r * r * a * a) + (b * b));
    const y = x / r;

    return {
        width: x,
        height: y
    };
}
*/

//////////////////////
// Accesibility color contrast

// https://codepen.io/davidhalford/pen/AbKBNr
function getCorrectTextColor(color) {
    // @ts-ignore
    const hex = to6HexColor(color).substring(1);

    /*
    From this W3C document: http://www.webmasterworld.com/r.cgi?f=88&d=9769&url=http://www.w3.org/TR/AERT#color-contrast
    
    Color brightness is determined by the following formula: 
    ((Red value X 299) + (Green value X 587) + (Blue value X 114)) / 1000
 
I know this could be more compact, but I think this is easier to read/explain.
    
    */

    const threshold = 130; /* about half of 256. Lower threshold equals more dark text on dark background  */

    const hRed = hexToR(hex);
    const hGreen = hexToG(hex);
    const hBlue = hexToB(hex);


    function hexToR(h) { return parseInt((cutHex(h)).substring(0, 2), 16) }
    function hexToG(h) { return parseInt((cutHex(h)).substring(2, 4), 16) }
    function hexToB(h) { return parseInt((cutHex(h)).substring(4, 6), 16) }
    function cutHex(h) { return (h.charAt(0) == "#") ? h.substring(1, 7) : h }

    const cBrightness = ((hRed * 299) + (hGreen * 587) + (hBlue * 114)) / 1000;
    if (cBrightness > threshold) { return "#000000"; } else { return "#ffffff"; }
}




/*
function getJmnodesIn(idContainer) {
    const eltContainer = document.getElementById(idContainer)
    const j = eltContainer?.querySelector("jmnodes");
    return j;
}
*/
// function getJmnodesMain() { return getJmnodesIn(idContainer); }








function addDebugLog(msg) {
    // const divDebugLogLog = mkElt("div", { id: "jsmind-test-div-debug-log-log" });
    const divDebugLogLog = document.getElementById("jsmind-test-div-debug-log-log");
    if (!divDebugLogLog) { return; }
    const prevRow = divDebugLogLog.lastElementChild;
    const prevMsg = prevRow?.firstElementChild?.textContent;
    if (prevRow && msg === prevMsg) {
        const eltCounter = prevRow.lastElementChild;
        if (!eltCounter) throw Error("Could not find eltCounter");
        // @ts-ignore
        const txtCounter = eltCounter.textContent.trim();
        let counter = (txtCounter == null || txtCounter === "") ? 1 : parseInt(txtCounter);
        eltCounter.textContent = `${++counter}`;
    } else {
        const entry = mkElt("span", { class: "debug-entry" }, msg);
        const counter = mkElt("span", { class: "debug-counter" }, " ");
        const row = mkElt("div", { class: "debug-row" }, [entry, counter])
        divDebugLogLog.appendChild(row);
    }
}

export function addScrollIntoViewOnSelect() {
    const jmDisp = jmDisplayed;
    jmDisp.add_event_listener(function (t) {
        if (t !== jsMind.event_type.select) return;
        scrollSelectedNodeIntoView();
    });
}
function scrollSelectedNodeIntoView() {
    if (!jmDisplayed) return;
    const n = jmDisplayed.get_selected_node();
    if (!n) return;
    scrollNodeIntoView(n);
}
const debounceScrollSelectedNodeIntoView = modTools.debounce(scrollSelectedNodeIntoView, 1000);
window.addEventListener("resize", () => debounceScrollSelectedNodeIntoView());


function scrollNodeIntoView(node) {
    const elt = jsMind.my_get_DOM_element_from_node(node);
    // FIX-ME: test .scrollIntoView - problem with vertical
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
    const scrollOpt = {
        behavior: "smooth",
        block: "nearest"
    };
    // console.log({scrollOpt})
    elt.scrollIntoView(scrollOpt);


}

/*
function mkEltLinkMindmapA(urlPath, topic, mkey, mhits, provider) {
    const url = new URL(urlPath, location);
    url.searchParams.set("mindmap", mkey);
    if (mhits) {
        url.searchParams.set("provider", provider);
        const hits = mhits.map(h => h.id);
        console.log({ hits })
        url.searchParams.set("nodehits", hits);
    }
    const eltA = mkElt("a", undefined, topic);
    eltA.href = url;
    return eltA;
}
*/

export async function dialogMindMaps(linkMindmapsPage, info, arrMindmapsHits, provider) {
    const toLink = typeof linkMindmapsPage;
    if (toLink !== "string") throw Error(`urlHtml typeof should be string, got ${toLink}`);
    // const eltA = funMkEltLinkMindmap(topic, m.key, m.hits);
    const funMkEltLinkMindmap =
        // (topic, mKey, mHits, provider) => modMMhelpers.mkEltLinkMindmapA(linkMindmapsPage, topic, mKey, mHits, provider);
        (topic, mKey, mHits, provider) => modMMhelpers.mkEltLinkMindmapA(topic, mKey, mHits, provider);
    const dbMindmaps = await importFc4i("db-mindmaps");

    const showNew = !arrMindmapsHits;

    const eltTitle = mkElt("h2", undefined, "Mindmaps");
    info = info || "";

    arrMindmapsHits = arrMindmapsHits || await dbMindmaps.DBgetAllMindmaps();
    const arrToShow = arrMindmapsHits.map(mh => {
        const key = mh.key;
        const j = mh.jsmindmap;
        const hits = mh.hits;
        let topic;
        switch (j.format) {
            case "node_tree":
                topic = j.data.topic;
                break;
            case "node_array":
                topic = j.data[0].topic;
                break;
            case "freemind":
                const s = j.data;
                topic = s.match(/<node .*?TEXT="([^"]*)"/)[1];
                break;
            default:
                throw Error(`Unknown mindmap format: ${j.format}`);
        }
        // console.log({ m, key, j, name });
        // let name = topic;
        if (topic.startsWith("<")) {
            // FIX-ME: use DOMParser? It may be synchronous.
            // https://stackoverflow.com/questions/63869394/parse-html-as-a-plain-text-via-javascript
            const elt = document.createElement("div");
            elt.innerHTML = topic;
            // const txt = elt.textContent;
            // name = txt;
            const child1 = elt.firstElementChild;
            // @ts-ignore
            const strCustom = child1.dataset.jsmindCustom;
            if (strCustom) {
                // console.log({ txt, strCustom })
                // ourCustomRenderer
                const objCustom = JSON.parse(strCustom);
                topic = (async () => {
                    const key = objCustom.key;
                    const provider = objCustom.provider;
                    const keyRec = await (await modCustRend.getOurCustomRenderer()).getCustomRec(key, provider);
                    return keyRec.title;
                })();
            }
        }
        return { key, topic, hits };
    });
    const arrPromLiMenu = arrToShow.map(async m => {
        // https://stackoverflow.com/questions/43033988/es6-decide-if-object-or-promise
        const topic = await Promise.resolve(m.topic);
        const btnDelete = await modMdc.mkMDCiconButton("delete_forever", "Delete mindmap");
        btnDelete.addEventListener("click", errorHandlerAsyncEvent(async evt => {
            evt.stopPropagation();
            const eltQdelete = mkElt("span", undefined, ["Delete ", mkElt("b", undefined, topic)]);
            const answerIsDelete = await modMdc.mkMDCdialogConfirm(eltQdelete);
            if (answerIsDelete) {
                console.log("*** del mm");
                const eltLi = btnDelete.closest("li");
                eltLi.style.backgroundColor = "red";
                eltLi.style.opacity = 1;
                eltLi.style.transition = "opacity 1s, height 1s, scale 1s";
                eltLi.style.opacity = 0;
                eltLi.style.height = 0;
                eltLi.style.scale = 0;
                const dbMindmaps = await importFc4i("db-mindmaps");
                dbMindmaps.DBremoveMindmap(m.key);
                setTimeout(() => eltLi.remove(), 1000);
            }
        }));

        const eltA = funMkEltLinkMindmap(topic, m.key, m.hits, provider);

        const eltMm = mkElt("div", undefined, [eltA, btnDelete]);
        const li = modMdc.mkMDCmenuItem(eltMm);
        li.addEventListener("click", () => {
            closeDialog();
        });
        return li;
    });
    const arrLiMenu = await Promise.all(arrPromLiMenu);
    if (showNew) {
        const liNew = modMdc.mkMDCmenuItem("New mindmap");
        liNew.addEventListener("click", errorHandlerAsyncEvent(async () => {
            await modMMhelpers.createAndShowNewMindmap(linkMindmapsPage);
        }));
        // arrLiMenu.push(liNew);

        // function mkMDCfab(eltIcon, title, mini, extendTitle)
        const eltIcon = modMdc.mkMDCicon("add");
        const btnFab = modMdc.mkMDCfab(eltIcon, "Create new mindmap", true);
        btnFab.addEventListener("click", errorHandlerAsyncEvent(async () => {
            // await createAndShowNewMindmapFc4i();
            await modMMhelpers.createAndShowNewMindmap(linkMindmapsPage);
        }));
        btnFab.style.marginLeft = "40px";
        eltTitle.appendChild(btnFab);
    }
    const ul = modMdc.mkMDCmenuUl(arrLiMenu);
    ul.classList.add("mindmap-list");
    const body = mkElt("div", { id: "div-dialog-mindmaps" }, [
        eltTitle,
        info,
        ul,
    ]);

    const btnClose = modMdc.mkMDCdialogButton("Close", "close", true);
    const eltActions = modMdc.mkMDCdialogActions([btnClose]);
    const dlg = await modMdc.mkMDCdialog(body, eltActions);
    function closeDialog() { dlg.mdc.close(); }
}

export async function dialogFindInMindMaps(key, provider) {
    const arrMindmapsHits = await modMMhelpers.getMindmapsHits(key);
    console.log({ arrMindmapsHits });
    if (arrMindmapsHits.length == 0) {
        modMdc.mkMDCdialogAlert("Not found in any mindmap");
        return;
    }
    const info = mkElt("p", undefined, "Found in these mindmaps:");
    // Fix-me: path??
    dialogMindMaps("/mm4i/mm4i.html", info, arrMindmapsHits, provider);
}


///////////////////////////////////////
/***************** Test cm on screen */
///////////////////////////////////////

// testCmOnScreen();
function testCmOnScreen() {

    ////////// In Google Chrome on Windows:

    // Known by Google Chrome dev tools
    // Width from https://GSMArena.com/
    const knownDevices = {

        //// Works for Pixel 7, devicePixelRatio==2.625, 1/r=0.381
        a: {
            name: "Pixel 7",
            screenMmWidth: 73.2 - 2.54 * 0.17,
            devUA: "(Linux; Android 13; Pixel 7)",
            devicePixelRatio: 2.625,
            corr: 0.670,
            measuredPixelRatio: 2.875,
            measuredCorr: 0.741
        },

        //// Works for Samsung Galaxy S8 Plus, 7.1cm, devicePixelRatio==4, 1/r=0.250
        b: {
            name: "Samsung Galaxy S8+",
            screenMmWidth: 73.4 - 2.54 * 0.08,
            devicePixelRatio: 4,
            devUA: "(Linux; Android 13; SM-G981B)",
            corr: 0.777
        },

        //// Works for Samsung Galaxy S20 Ultra, devicePixelRatio==3.5, 1/r=0.286
        c: {
            name: "Samsung Galaxy S20 Ultra",
            screenMmWidth: 76 - 2.54 * 0.33,
            devicePixelRatio: 3.5,
            devUA: "(Linux; Android 13; SM-G981B)",
            corr: 0.693
        }

    }


    let dev = "none";
    let corr = 1;

    function promptDev(parDev) {
        let txtPrompt = ``;
        for (const [k, v] of Object.entries(knownDevices)) {
            txtPrompt += `  ${k}: ${v.name}\n`;
        }
        return prompt(txtPrompt, parDev);
    }
    while (!Object.keys(knownDevices).includes(dev)) {
        const tmp = promptDev(dev)?.trim();
        if (!tmp) return;
        dev = tmp;
        console.log({ dev });
    }
    const devRec = knownDevices[dev];
    console.log(devRec);

    if (location.protocol == "http:") {
        // Emulating mobile device?
        const re = new RegExp("\\(.*?\\)");
        // @ts-ignore
        const devUA = re.exec(navigator.userAgent)[0];
        console.log({ devUA });
        if (!devRec.devUA) throw Error(`devRec.devUA is not set, should be "${devUA}"`);
        if (devRec.devUA && devRec.devUA != devUA) {
            throw Error(`devUA did not match: w"${devUA}"!=d"${devRec.devUA}"A`);
        }
    }
    if (devRec.devicePixelRatio) {
        const devRatio = devRec.devicePixelRatio;
        const winRatio = window.devicePixelRatio;
        if (devRatio != winRatio) {
            // throw Error(`devicePixelRatio, d${devRatio} != w${winRatio}`);
            alert(`devicePixelRatio, d${devRatio} != w${winRatio}`);
        }
    }


    corr = devRec.corr || corr;
    const devName = devRec.name;
    const devCmW = devRec.screenMmWidth / 10;
    const txtPromptCorr = `
        ${devName}
        Real Width: ${devCmW.toFixed(1)}cm
        devicePixelRatio==${window.devicePixelRatio},

        Correction:
    `;
    const corrTxt = prompt(txtPromptCorr, corr.toFixed(3));
    if (!corrTxt) return;
    corr = corrTxt ? parseFloat(corrTxt) : 0;

    function cm2screenPixels(cm) {
        const dpcm1 = estimateDpcm();
        console.log({ dpcm1 });
        const px = cm * dpcm1 / (window.devicePixelRatio * corr);
        console.log({ cm, px });
        return px;
    }
    function estimateDpcm() {
        let x = 10;
        while (x < 2000) {
            x *= 1.01;
            if (!window.matchMedia(`(min-resolution: ${x}dpcm)`).matches) break;
        }
        const dpcm = x;
        console.log({ dpcm });
        return dpcm;
    }

    function showCmTestGrid(cmGrid, comparePx, compareWhat) {
        const cmPx = cm2screenPixels(cmGrid);
        compareWhat = compareWhat || "Compare: ";
        const eltBg = document.createElement("div");
        // @ts-ignore
        eltBg.style = `
            position: fixed;
            top: 0;
            left: 0;
            bottom: 0;
            right: 0;
            opacity: 0.5;
            background-color: red;
            background-image:
                linear-gradient(to right, black 1px, transparent 1px),
                linear-gradient(to bottom, black 1px, transparent 1px);
            background-size: ${cmPx}px ${cmPx}px;
            z-index: 9999;
        `;
        document.body.appendChild(eltBg);

        const dpcm2 = estimateDpcm();
        console.log({ dpcm2 });
        const screenPx = screen.width;
        const screenCm = screenPx / cm2screenPixels(1);
        const bestCorr = corr * devCmW / screenCm;
        let info = `
            ${devName}, Spec screen:${screenPx}px/${devCmW.toFixed(2)}cm
            - corr:${corr}(${bestCorr.toFixed(3)})/${screenCm.toFixed(2)}cm
            --- cm:${cmPx.toFixed(0)}px
            - dpcm:${dpcm2.toFixed(1)}`;
        if (comparePx) info += ` - ${compareWhat}: ${comparePx.toFixed(0)}px`;
        const eltInfo = document.createElement("span");
        eltInfo.textContent = info;
        // @ts-ignore
        eltInfo.style = `
        position: fixed;
        top: 0;
        left: 0;
        display: inline-block;
        padding: 4px;
        background: yellow;
        color: black;
        z-index: 9999;
    `;
        const btn = document.createElement("button");
        btn.textContent = "Close";
        btn.addEventListener("click", () => { eltBg.remove(); eltInfo.remove(); });
        btn.style.marginLeft = "20px";
        eltInfo.appendChild(btn);
        document.body.appendChild(eltInfo);
    }

    if (corr) {
        // showCmTestGrid(2);
        setTimeout(() => {
            showCmTestGrid(2);
            console.log({ knownDevices });
        }, 1000);
    }
}



let eltBottomDebug;
let eltDebugState;
// let eltDebugCapture;
let eltDebugJssmAction;
let eltDebugJssmState;
let eltReqFrame;
function getBottomDebug() {
    if (eltBottomDebug) return eltBottomDebug;
    eltDebugState = mkElt("div"); eltDebugState.style.color = "gray";
    // eltDebugCapture = mkElt("div"); eltDebugCapture.style.color = "wheat";
    eltReqFrame = mkElt("div"); eltReqFrame.style.color = "light skyblue";
    eltDebugJssmAction = mkElt("div"); eltDebugJssmAction.style.color = "red";
    eltDebugJssmState = mkElt("div"); eltDebugJssmState.style.color = "orange";
    eltBottomDebug = mkElt("div", undefined, [
        eltDebugState,
        // eltDebugCapture,
        eltReqFrame,
        eltDebugJssmAction,
        eltDebugJssmState,
    ]);
    // @ts-ignore
    eltBottomDebug.style = `
                position: fixed;
                z-index: 100;
                width: 100vw;
                left: 0px;
                height: 30px;
                padding: 4px;
                background: black;
                bottom: 0;
                display: grid;
                grid-template-columns: 50px 1fr 1fr 1fr;
                cursor: default;
                pointer-events: all;
            `;
    document.body.appendChild(eltBottomDebug);

}
/*
function getEltDebugCapture() {
    if (eltDebugCapture) return eltDebugCapture;
    getBottomDebug();
    return eltDebugCapture;
}
*/
function getEltDebugState() {
    if (eltDebugState) return eltDebugState;
    getBottomDebug();
    return eltDebugState;
}

function getEltDebugJssmState() {
    if (eltDebugJssmState) return eltDebugJssmState;
    getBottomDebug();
    return eltDebugJssmState;
}
function getEltDebugJssmAction() {
    if (eltDebugJssmAction) return eltDebugJssmAction;
    getBottomDebug();
    return eltDebugJssmAction;
}


/*
function showDebugCapture(msg) {
    (getEltDebugCapture()).textContent = msg;
}
*/
function showDebugState(msg) {
    (getEltDebugState()).textContent = msg;
}

const rainbow = ["red", "orange", "yellow", "greenyellow", "aqua", "indigo", "violet"];
let eltSmallGraph;
let markedDecl;
async function markLatestStates() {
    // const modFsm = await importFc4i("mm4i-fsm");
    const decl = modFsm.fsmDeclaration;
    markedDecl = decl;
    markedDecl = markedDecl.replaceAll(/after 200 ms/g, "'200ms'");
    // console.log("markLatestStates", stackLogFsm);
    let iState = 0;
    const marked = new Set();
    for (let i = 0, len = stackLogFsm.length; i < len; i++) {
        const entry = stackLogFsm[i];
        if (modFsm.isState(entry)) {
            const state = entry;
            if (marked.has(state)) continue;
            const color = rainbow[iState];
            markState(state, color);
            // console.log("call markstate", i, state, color);
            iState++;
            marked.add(state);
        }
    }
    /**
     * 
     * @param {string} state 
     * @param {string} color 
     */
    function markState(state, color) {
        const strMarkState = `state ${state} : { background-color: ${color}; border-color: cyan; text-color: black; shape: ellipse; };`;
        const strReState = `state ${state}.*?\\};`;
        const reState = new RegExp(strReState, "ms");
        if (!reState.test(decl)) {
            markedDecl = `${markedDecl}\n\n${strMarkState}`;
        } else {
            markedDecl = markedDecl.replace(reState, strMarkState);
        }
    }
}


async function updateSmallGraph() {
    if (!eltSmallGraph) return;
    if (!eltSmallGraph.parentElement) return;
    await markLatestStates();
    const modJssmViz = await importFc4i("jssm-viz");
    const modViz = await importFc4i("viz-js");
    const dots = modJssmViz.fsl_to_dot(markedDecl);
    const dotsBetterEdge = dots.replace(/edge.*\]/, 'edge [fontsize=14; fontname="Open Sans"; fontcolor="red"]');
    const viz = await modViz.instance();
    const svg = viz.renderSVGElement(dotsBetterEdge);
    eltSmallGraph.textContent = "";
    const eltSvg = mkElt("div");
    eltSvg.style = `
        width: 100%;
        height: 100%;
    `;
    const cw = eltSmallGraph.clientWidth;
    const ch = eltSmallGraph.clientHeight;
    const svgW = parseInt(svg.getAttribute("width"));
    const svgH = parseInt(svg.getAttribute("height"));
    // console.log({ svgW }, { svgH });
    const maxSvgHW = Math.max(svgH, svgW);
    const ratW = svgW / maxSvgHW;
    const ratH = svgH / maxSvgHW;
    const newH = Math.floor(ch * ratH);
    const newW = Math.floor(cw * ratW);
    svg.setAttribute("width", newW);
    svg.setAttribute("height", newH);
    eltSmallGraph.appendChild(svg);
    // svg.title = "Toggle small/big graph"; // FIX-ME: This does not work
}



const stackLogFsm = [];
window["showStackLogFsm"] = () => { console.log("showStackLogFsm", stackLogFsm); }
/**
 * 
 * @param {string} eventOrState 
 */
function addStackLogFsm(eventOrState) {
    stackLogFsm.unshift(eventOrState);
    stackLogFsm.length = Math.min(8, stackLogFsm.length);
    console.warn("addStackLogFsm", eventOrState, stackLogFsm);
}

/**
 * 
 * @param {string} state 
 */
async function logJssmState(state) {
    // const modFsm = await importFc4i("mm4i-fsm");
    addStackLogFsm(state);
    modFsm.checkIsState(state)
    showDebugJssmState();
}

/**
 * 
 * @param {string} eventMsg 
 */
async function logJssmEvent(eventMsg) {
    // const modFsm = await importFc4i("mm4i-fsm");
    // const eventName = typeof event == "string" ? event : event.textContent;
    const re = new RegExp(/,(.*)=>/);
    addStackLogFsm(eventMsg);
    const res = re.exec(eventMsg);
    if (!res) throw Error(`Could not parse ${eventMsg}`);
    const eventName = res[1];
    modFsm.checkIsEvent(eventName);
    showDebugJssmAction(eventName);
}
async function showDebugJssmState() {
    // const modFsm = await importFc4i("mm4i-fsm");
    const currState = modFsm.fsm.state();

    updateSmallGraph();

    const elt = getEltDebugJssmState();
    elt.textContent = currState;
    elt.style.cursor = "pointer";
    elt.style.pointerEvents = "all";
    elt.title = "Click to show fsm jssm";
    elt.addEventListener("click", async evt => {
        evt.preventDefault();
        evt.stopPropagation();
        evt.stopImmediatePropagation();

        // markLatestStates();

        eltSmallGraph = eltSmallGraph || mkEltSmallGraph();

        if (eltSmallGraph.parentElement) {
            eltSmallGraph.remove();
        } else {
            document.body.appendChild(eltSmallGraph);
            updateSmallGraph();
        }
        return;


        function mkEltSmallGraph() {
            const elt = mkElt("div")
            elt.style = `
                aspect-ratio: 1 / 1;
                width: 50vw;

                border: 1px solid red;

                position: fixed;
                right: 5px;
                bottom: 35px;
                z-index: 100;

                display: flex;
                align-content: flex-end;
                justify-content: flex-end;
                flex-wrap: wrap;

                pointer-events: all;
                cursor: pointer;
            `;
            let isSmall = true;
            const widthSmall = "50vw";
            elt.style.width = widthSmall;
            elt.addEventListener("click", evt => {
                evt.stopImmediatePropagation();
                isSmall = !isSmall;
                if (isSmall) {
                    elt.style.width = widthSmall;
                } else {
                    const maxW = window.innerWidth - 10;
                    const maxH = window.innerHeight - 35 - 5;
                    const maxWH = Math.min(maxW, maxH);
                    elt.style.width = `${maxWH}px`;
                }
                updateSmallGraph();
                console.log("toggle smallGraph", isSmall);
            })
            return elt;
        }



        openExternalViz();

        function openExternalViz() {
            const urlDotsViz = "http://localhost:8080/viz-dots-fsl.html";
            const url = new URL(urlDotsViz);

            // url.searchParams.set("fsl", decl);
            url.searchParams.set("fsl", markedDecl);

            winProxyDotsViz?.close();
            winProxyDotsViz = window.open(undefined, "fsm-graph");
            if (winProxyDotsViz) {
                winProxyDotsViz.location = url.href;
            } else {
                window.open(url.href, "fsm-graph");
            }
        }
    });
}
let winProxyDotsViz;

export function showDebugJssmAction(msg) {
    // (getEltDebugJssmAction()).textContent = msg;
    const elt = getEltDebugJssmAction();
    // elt.textContent = "";
    // elt.appendChild(msg);
    elt.textContent = msg;
    updateSmallGraph();
}

/*
const modFsm = await importFc4i("mm4i-fsm");
window.fsm = modFsm.fsm;
modFsm.fsm.hook_any_action(fsmEvent);
const eltJsMindContainer = document.getElementById("jsmind_container");
if (!eltJsMindContainer) throw Error("Could not find #jsmind_container");
const eltFsm = eltJsMindContainer.querySelector(".jsmind_inner");
if (!eltFsm) throw Error("Could not find .jsmind_inner");
modFsm.setupFsmListeners(eltFsm);
// jsmind
*/

/**
 * 
 * @param {object} event 
 */
function fsmEvent(event) {
    console.log("fsmEvent event", event);
    const eventName = event.action || event;
    const eventFrom = event.from;
    const eventTo = event.to;
    // console.log("fsmEvent", eventName, event);
    const eltAction = mkElt("span", undefined, eventName);
    if (!eventTo) {
        eltAction.style.backgroundColor = "red";
        eltAction.style.color = "black";
        eltAction.style.padding = "4px";
        eltAction.title = `Event ${eventName} had no event.to`;
    } else {
        eltAction.style.color = "green";
    }
    const msg = `${eventFrom},${eventName}=>${eventTo}`;
    logJssmEvent(msg);
    // if (eventTo) { logJssmState(eventTo); }
}
// window["fsmEvent"] = fsmEvent;

setTimeout(async () => {
    // const modFsm = await importFc4i("mm4i-fsm");
    // window.fsm = modFsm.fsm;
    // const modJsEditCommon = await importFc4i("jsmind-edit-common");
    // const eltAction = mkElt("span", undefined, "(action)");
    // eltAction.style.color = "gray";
    // logJssmEvent(eltAction);
    logJssmState(modFsm.fsm.state());
}, 1000);

