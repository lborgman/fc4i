/**
 * @license BSD
 * @copyright 2014-2023 hizzgdev@163.com
 *
 * Project Home:
 *   https://github.com/hizzgdev/jsmind/
 */
/*
 This is initially a copy from Chrome dev tools source 230406. 
 Just surrounded by (() => {...})()
*/

console.log("here is module new-jsmind.draggable-nodes.js");
if (document.currentScript) throw Error("import .currentScript"); // is module
if (!import.meta.url) throw Error("!import.meta.url"); // is module

// ChatGPT: Not bad, but it checks for below...
function isPointAboveLine1(pointA, pointB, pointC) {
    const [xA, yA] = pointA;
    const [xB, yB] = pointB;
    const [xC, yC] = pointC;
    const slope = (yB - yA) / (xB - xA);
    const yIntercept = yA - slope * xA;
    const yOnLine = slope * xC + yIntercept;
    return yC < yOnLine;
}

function isAboveLine2(x1, y1, x2, y2, x3, y3) {
    // Calculate the slope of the line
    let slope = (y2 - y1) / (x2 - x1);

    // Calculate the y-intercept of the line
    let yIntercept = y1 - slope * x1;

    // Calculate the y-coordinate of the third point on the line
    let yOnLine = slope * x3 + yIntercept;

    // Compare the y-coordinate of the third point with the y-coordinate on the line
    if (y3 < yOnLine) {
        return true; // The third point is above the line
    } else {
        return false; // The third point is below or on the line
    }
}

function isAboveLine3(x1, y1, x2, y2, x3, y3) {
    // Calculate the slope of the line
    const slope = (y2 - y1) / (x2 - x1);

    // Calculate the y-intercept of the line
    const yIntercept = y1 - slope * x1;

    // Calculate the y-coordinate of the point on the line
    const yOnLine = slope * x3 + yIntercept;

    // Compare the y-coordinate of the point with the y-coordinate of the point on the line
    return y3 < yOnLine;
}

// My own:
function dist2BcrBcr(bcr1, bcr2) {
    // This is not the distance of course, but it compares in the same way as the distance.
    const x1 = (bcr1.left + bcr1.right) / 2;
    const y1 = (bcr1.bottom + bcr1.top) / 2;
    const x2 = (bcr2.left + bcr2.right) / 2;
    const y2 = (bcr2.bottom + bcr2.top) / 2;
    return (x1 - x2) ** 2 + (y1 - y2) ** 2;
}
function dist2BcrPoint(bcr1, x2, y2) {
    // This is not the distance of course, but it compares in the same way as the distance.
    const x1 = (bcr1.left + bcr1.right) / 2;
    const y1 = (bcr1.bottom + bcr1.top) / 2;
    return (x1 - x2) ** 2 + (y1 - y2) ** 2;
}

function getArrNodesAndPos(eltJmnodes, eltDragged) {
    const arrNodesAndPos = [...eltJmnodes.querySelectorAll("jmnode")]
        .filter(n => {
            if (!!n.style.zIndex) return false; // Filter shadow node
            if (eltDragged === n) return false;
            return true;
        })
        .map(n => {
            return {
                eltJmnode: n,
                id: getNodeIdFromDOMelt(n),
                bcr: n.getBoundingClientRect()
            }
        });
    return arrNodesAndPos;
}

class DrawSvgLine {
    // https://stackoverflow.com/a/62475281/324691
    constructor(clientX, clientY, lineAttributes, onContainer, onTopOfChilds) {
        if (!!lineAttributes) {
            if ("object" !== typeof lineAttributes) throw Error("typeof lineAttributes is not object");
            if (Array.isArray(lineAttributes)) throw Error("lineAttributes is array");
        }
        const colorStroke = lineAttributes?.color || "red";
        const widthStroke = lineAttributes?.width || 10;
        onContainer = onContainer || document.documentElement;
        this.bcrContainer = onContainer.getBoundingClientRect();
        const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svgElement.setAttribute("style", "position: absolute;");
        svgElement.setAttribute("height", "1000");
        svgElement.setAttribute("width", "1000");
        if (onTopOfChilds) {
            onContainer.appendChild(svgElement);
        } else {
            onContainer.insertBefore(svgElement, onContainer.firstElementChild);
        }
        this.svgElement = svgElement;
        this.drawing = false;
        const newLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
        newLine.setAttribute("stroke", colorStroke);
        newLine.setAttribute("stroke-width", widthStroke);
        newLine.setAttribute("stroke-linecap", "round");

        const bcrContainer = onContainer.getBoundingClientRect();
        const absX = clientX - bcrContainer.left;
        const absY = clientY - bcrContainer.top;
        newLine.setAttribute("x1", absX);
        newLine.setAttribute("y1", absY);
        newLine.setAttribute("x2", absX);
        newLine.setAttribute("y2", absY);

        this.svgElement.appendChild(newLine);
        this.newLine = newLine;
        this.drawing = true;
    }
    moveFreeEnd(cX, cY) {
        if (this.drawing) {
            this.freeX = cX;
            this.freeY = cY;
            const scrolledX = cX - this.bcrContainer.left;
            const scrolledY = cY - this.bcrContainer.top;
            this.newLine.setAttribute("x2", scrolledX);
            this.newLine.setAttribute("y2", scrolledY);
        }
    }
    getFreeX() { return this.freeX; }
    getFreeY() { return this.freeY; }
    removeLine() {
        this.drawing = false;
        // this.newLine.remove();
        this.svgElement.remove();
    }

}

export function testSvgLine() {

    let ourDrawLine;

    function onMouseDown(evt) {
        const eltJmnodes = document.querySelector("jmnodes");
        const lineAttr = { color: "rgba(255, 0, 0, 0.5" };
        ourDrawLine = new DrawSvgLine(evt.clientX, evt.clientY, lineAttr, eltJmnodes);
    }

    function onMouseMove(evt) {
        ourDrawLine?.moveFreeEnd(evt.clientX, evt.clientY);
    }

    function onMouseUp(event) {
        ourDrawLine.removeLine();
        ourDrawLine = undefined;
    }

    function setup() {
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mousedown", onMouseDown);
        document.addEventListener("mouseup", onMouseUp);
    }

    // window.onload = () => setup();
    setup();
}


///////////////////////////////////////////////
// Utility functions. FIX-ME: Should be in jsmind core

// function getDOMeltFromNode(node) { return node._data.view.element; }
function getDOMeltFromNode(node) { return jsMind.my_get_DOM_element_from_node(node); }
function getNodeIdFromDOMelt(elt) {
    const tn = elt.tagName;
    if (tn !== "JMNODE") throw Error(`Not jmnode: <${tn}>`);
    const id = elt.getAttribute("nodeid");
    if (!!!id) throw Error("Could not find jmnode id");
    return id;
}

////// Triangle area (chatGPT)

function triangleAreaSigned(x1, y1, x2, y2, x3, y3, log) {
    const area1 = (x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2));
    return area1;
}
function thirdAbove(bcr1, bcr2, dragPos) {
    function xyBcr(bcr) {
        const x = (bcr.left + bcr.right) / 2;
        const y = (bcr.top + bcr.bottom) / 2;
        return [x, y];
    }
    function moveToCenter(x, y) {
        const X = x - x1;
        const Y = y - y1;
        return [X, Y];
    }
    const [x1, y1] = xyBcr(bcr1);
    const [x2, y2] = xyBcr(bcr2);
    // const [x3, y3] = xyBcr(bcr3);
    const [x3, y3] = [dragPos.clientX, dragPos.clientY];
    const [X2, Y2] = moveToCenter(x2, y2);
    const [X3, Y3] = moveToCenter(x3, y3);

    // const area1 = triangleAreaSigned(x1, y1, x2, y2, x3, y3, log);
    const area0 = triangleAreaSigned(0, 0, X2, Y2, X3, Y3);
    const right = x2 > x1;
    const neg = area0 < 0;
    const above = (right === neg) ? 1 : -1;
    return { above, right, neg, area0, bcr1, bcr2, dragPos };
}

function triangleArea(x1, y1, x2, y2, x3, y3, log) {
    const above = thirdAbove(x1, y1, x2, y2, x3, y3, log);
    const area1 = triangleAreaSigned(x1, y1, x2, y2, x3, y3, log);
    console.log({ area1, above }, log);
    const area = 0.5 * Math.abs(area1);
    return area;
}
/*
triangleArea(0, 0, 1, 0, 1, 1, "right, up"); // 1
triangleArea(0, 0, 1, 0, 0, 1, "right, left+up"); // 1
triangleArea(0, 0, 1, 0, 1, -1, "right, down"); // -1
triangleArea(0, 0, 1, 0, 0, -1, "right, left+down"); // -1

triangleArea(1, 0, 0, 0, 1, -1, "left, right+down"); // 1
triangleArea(1, 0, 0, 0, 0, -1, "left, down"); // 1
triangleArea(1, 0, 0, 0, 1, 1, "left, right+up"); // -1
triangleArea(1, 0, 0, 0, 0, 1, "left, up"); // -1
*/

// Example usage:
// const area = calculateTriangleArea(0,0, 3,0, 0,4); // Triangle with vertices at (0,0), (3,0), and (0,4)
// console.log(area); // Output: 6

// let badSorted;

export class TimeoutTimer {
    #debugging;
    constructor(msTimeout, funTimeout, debug) {
        this.msTimeout = msTimeout;
        this.funTimeout = funTimeout;
        this.tmr = undefined;
        this.#debugging = !!debug;
    }
    stop() {
        if (this.#debugging) console.log("to stop");
        clearTimeout(this.tmr);
        this.tmr = undefined;
    }
    restart() {
        this.stop();
        if (this.#debugging) console.log("to restart", this.funTimeout, this.msTimeout);
        const ourFun = () => {
            this.tmr = undefined;
            this.funTimeout();
        }
        this.tmr = setTimeout(ourFun, this.msTimeout);
    }
    get active() {
        return this.tmr !== undefined;
    }
}

// setupNewDragging();
let ourJm;
let eltDragged;
let eltTarget;
let eltTParent;
export async function setupNewDragging() {
    ourJm = await new Promise((resolve, reject) => {
        const draggablePlugin = new jsMind.plugin('draggable_nodes', function (thisIsOurJm) {
            resolve(thisIsOurJm);
        });
        jsMind.register_plugin(draggablePlugin);
    });

    const root_node = ourJm.get_root();
    const eltRoot = getDOMeltFromNode(root_node);

    const eltJmnodes = eltRoot.closest("jmnodes");

    const instScrollAtDragBorder = new ScrollAtDragBorder(eltJmnodes, 60);
    instScrollAtDragBorder.startScroller();

    // FIX-ME: make local again
    // let eltDragged;

    let childDragLine;
    eltJmnodes.addEventListener("dragstart", evt => {
        eltDragged = evt.target;
        // FIX-ME: What is happening here???
        if (!eltDragged) return;
        markAsDragged(eltDragged, true);
        eltTarget = undefined;
        eltTParent = undefined;
        childDragLine = undefined;
        // console.log("eltTarget=u dragstart")
        // start
        startTrackingDrag();
    });
    eltJmnodes.addEventListener("dragend", evt => {
        // console.log("dragend", { eltDragged }, eltDragged.getAttribute("nodeid"), { eltTarget }, eltTarget?.getAttribute("nodeid"));
        stopTrackingDrag();
        // toTParent.stop();
        childDragLine?.removeLine();
        childDragLine = undefined;
        if (eltDragged) markAsDragged(eltDragged, false);
        informDragStatus();

        if (!nodeParent && !eltTarget) return;

        const idDragged = getNodeIdFromDOMelt(eltDragged);
        const root_node = ourJm.get_root();
        const eltRoot = getDOMeltFromNode(root_node);
        const bcrRoot = eltRoot.getBoundingClientRect();
        const rootMiddleX = (bcrRoot.left + bcrRoot.right) / 2;
        // const dragPosX = evt.clientX;
        const dragPosX = useClientX(evt);
        const direction = rootMiddleX < dragPosX ? jsMind.direction.right : jsMind.direction.left;
        // console.log({ direction });

        if (eltTarget) {
            markAsTarget(eltTarget, false);
            const id_target = getNodeIdFromDOMelt(eltTarget);
            ourJm.move_node(idDragged, "_last_", id_target, direction);
            setTimeout(unMark, 2000);
            return;
        }

        const idParent = getNodeIdFromDOMelt(nodeParent)
        if (!nodeBelow) {
            ourJm.move_node(idDragged, "_last_", idParent, direction);
            const before = "_last_";
            // console.log("ourJm.move_node", { idDragged, before, idParent, direction });
        } else {
            const idBelow = getNodeIdFromDOMelt(nodeBelow);
            ourJm.move_node(idDragged, idBelow, idParent, direction);
            // console.log("ourJm.move_node", { idDragged, idBelow, idParent, direction });
        }
        function unMark() {
            console.warn("unMark", { nodeParent });
            if (nodeParent) markAsTParent(nodeParent, false);
            if (nodeAbove) markAsUpperChild(nodeAbove, false);
            if (nodeBelow) markAsLowerChild(nodeBelow, false);
            if (eltTarget) markAsTarget(eltTarget, false);
        }
        setTimeout(unMark, 2000);
        return;

        /*
        let eltAbove, eltBelow;
        debugger;
        if (!eltTarget) {
            // FIX-ME: between
            if (!eltTParent) return;
            const id_tparent = getNodeIdFromDOMelt(eltTParent);
            const node_tparent = ourJm.get_node(id_tparent);
            console.log({ id_tparent, node_tparent, eltTParent });
            const eltChilds = node_tparent.children.map(child_node => getDOMeltFromNode(child_node));
            const bcrTParent = eltTParent.getBoundingClientRect();
            const midXTP = (bcrTParent.left + bcrTParent.right) / 2;
            // const toTheRight = evt.clientX > midXTP;
            const toTheRight = useClientX(evt) > midXTP;
            eltChilds.forEach(eltC => {
                if (eltC == eltDragged) return;
                // function thirdAbove(bcr1, bcr2, dragPos)
                const bcrC = eltC.getBoundingClientRect();
                const isAbove = thirdAbove(bcrTParent, bcrC, evt);
                if (toTheRight !== isAbove.right) return;
                console.log(eltC.textContent, { isAbove }, isAbove.above, isAbove.right, toTheRight);
                // Child node are ordered:
                if (isAbove.above === -1) {
                    eltAbove = eltC;
                } else {
                    eltBelow = eltBelow || eltC;
                }
            });
            console.log({ eltAbove, eltBelow }, eltAbove?.textContent, eltBelow?.textContent);
            if (eltAbove) markAsUpperChild(eltAbove, true);
            if (eltBelow) markAsLowerChild(eltBelow, true);

            const idTParent = getNodeIdFromDOMelt(eltTParent);
            if (eltBelow) {
                const idBelow = getNodeIdFromDOMelt(eltBelow);
                ourJm.move_node(idDragged, idBelow, idTParent, direction);
            } else {
                ourJm.move_node(idDragged, "_last_", idTParent, direction);
            }
            finishMarking();
            return;
        }
        const idTarget = getNodeIdFromDOMelt(eltTarget);
        if (eltTParent) {
            const idTParent = getNodeIdFromDOMelt(eltTParent);
            ourJm.move_node(idDragged, idTarget, idTParent, direction);
        } else {
            ourJm.move_node(idDragged, "_last_", idTarget, direction);
        }
        finishMarking();
        */
        /*
        function clearMarking() {
            console.warn("clearMarking");
            debugger;
            markAsDragged(eltDragged, false);
            markAsDroppedAt(eltDragged, false);
            if (eltTarget) markAsTarget(eltTarget, false);

            // FIX-ME: eltTParent vs nodeParent???
            console.warn("clearMarking", { nodeParent, eltTParent });
            // if (eltTParent) markAsTParent(eltTParent, false);
            if (nodeParent) markAsTParent(nodeParent, false);

            if (eltAbove) markAsUpperChild(eltAbove, false);
            if (eltBelow) markAsLowerChild(eltBelow, false);
        }
        function finishMarking() {
            const idDragged = getNodeIdFromDOMelt(eltDragged);
            ourJm.select_node(idDragged);
            markAsDroppedAt(eltDragged, true);
            setTimeout(clearMarking, 2000);
        }
        */
    });


    /*
        dragenter/dragleave can not be used when pointHandle method
        for drag accessibility is used.
        Instead check where the pointHandle is!
    */
    function pointHandleEnterOrLeave() {
        // getposPointHandle();
    }

    // https://stackoverflow.com/questions/43275189/html-5-drag-events-dragleave-fired-after-dragenter
    // dragenter fires before dragleave!!
    // So... we only have to listen to dragenter, or??
    eltJmnodes.addEventListener("dragenter", evt => {
        return;
        // if (eltTarget) return;
        const target = evt.target;
        const tn = target.tagName;
        if (target === eltDragged) return;
        if (tn === "JMNODES") { leaveJmnode(); return; }
        informDragStatus(`Over ${tn}, ${target.textContent.substring(0, 100)}`);
        // console.log("dragenter", evt.target?.tagName, !!eltTarget);
        if (tn !== "JMNODE") {
            const closestJmnode = target.closest("jmnode");
            if (!closestJmnode) { leaveJmnode(); return; }
            if (closestJmnode === eltTarget) return;
            eltTarget = closestJmnode;
        } else {
            eltTarget = target;
        }
        enterJmnode();
        function enterJmnode() {
            // console.log("before markAsTarget", eltTarget);
            markAsTarget(eltTarget, true);
            // if (!eltTParent) toTParent.restart();
        }
        function leaveJmnode() {
            // toTParent.stop();
            if (!eltTarget) return;
            markAsTarget(eltTarget, false);
            eltTarget = undefined;
        }
    });
    eltJmnodes.addEventListener("dragleave", evt => {
        return;
        const target = evt.target;
        const tn = target.tagName;
        if (target === eltDragged) return;
        console.log("** dragleave", evt.target?.tagName, !!eltTarget);
        if (!eltTarget) return;
        if (tn !== "JMNODE") {
            const closestJmnode = target.closest("jmnode");
            if (closestJmnode === eltTarget) return;
            // eltTarget = closestJmnode;
        }
        markAsTarget(eltTarget, false);
        markAsTParent(eltTarget, false);
        // toTParent.stop();
        if (childDragLine) return;
        if (eltTParent) {
            // console.log("try draw")
            // childDragLine = new DrawSvgLine()
            const fromBcr = eltTParent.getBoundingClientRect();
            startDragLine(fromBcr);
            function startDragLine(fromBcr) {
                const x = (fromBcr.left + fromBcr.right) / 2;
                const y = (fromBcr.top + fromBcr.bottom) / 2;
                const lineAttr = {};
                childDragLine = new DrawSvgLine(x, y, lineAttr, eltJmnodes);
                const freeX = x;
                const freeY = y;
                childDragLine.moveFreeEnd(freeX, freeY);
            }

        }
        eltTarget = undefined;
    });

    let eltAbove, eltBelow;
    eltJmnodes.addEventListener("drag", evt => {
        return;
        childDragLine?.moveFreeEnd(evt.clientX, evt.clientY);

        if (!eltTParent) return;
        const oldAbove = eltAbove;
        const oldBelow = eltBelow;
        eltAbove = undefined;
        eltBelow = undefined;
        const id_tparent = getNodeIdFromDOMelt(eltTParent);
        const node_tparent = ourJm.get_node(id_tparent);
        // console.log({ id_tparent, node_tparent, eltTParent });
        const eltChilds = node_tparent.children.map(child_node => getDOMeltFromNode(child_node));
        const bcrTParent = eltTParent.getBoundingClientRect();
        const midXTP = (bcrTParent.left + bcrTParent.right) / 2;
        const toTheRight = evt.clientX > midXTP;
        eltChilds.forEach(eltC => {
            if (eltC == eltDragged) return;
            // function thirdAbove(bcr1, bcr2, dragPos)
            const bcrC = eltC.getBoundingClientRect();
            const isAbove = thirdAbove(bcrTParent, bcrC, evt);
            if (toTheRight !== isAbove.right) return;
            // console.log(eltC.textContent, { isAbove }, isAbove.above, isAbove.right, toTheRight);
            // Child node are ordered:
            if (isAbove.above === -1) {
                eltAbove = eltC;
            } else {
                eltBelow = eltBelow || eltC;
            }
        });
        // console.log({ eltAbove, eltBelow }, eltAbove?.textContent, eltBelow?.textContent);
        if (eltAbove != oldAbove) {
            if (oldAbove) markAsUpperChild(oldAbove, false);
            if (eltAbove) markAsUpperChild(eltAbove, true);
        }
        if (eltBelow != oldBelow) {
            if (oldBelow) markAsLowerChild(oldBelow, false);
            if (eltBelow) markAsLowerChild(eltBelow, true);
        }
    });
}

function markAsDragged(jmnode, on) { markDragNode(jmnode, "dragged", on); }
function markAsTarget(jmnode, on) { markDragNode(jmnode, "target", on); }
function markAsTParent(jmnode, on) {
    // console.warn("markAsTParent", jmnode, on);
    markDragNode(jmnode, "tparent", on);
}
// function markAsNearChild(jmnode, on) { markDragNode(jmnode, "near-child", on); }
function markAsUpperChild(jmnode, on) { markDragNode(jmnode, "upper-child", on); }
function markAsLowerChild(jmnode, on) {
    // console.warn("markAsLowerChild", jmnode, on);
    markDragNode(jmnode, "lower-child", on);
}
function markAsDroppedAt(jmnode, on) { markDragNode(jmnode, "dropped-at", on); }
function markDragNode(jmnode, how, on) {
    if (jmnode.tagName !== "JMNODE") throw Error(`${jmnode.tagName} !== "JMNODE`);
    if (jmnode.tagName !== "JMNODE") return;

    let cssClass;
    switch (how) {
        case "dragged":
            cssClass = "jsmind-drag-dragged";
            break;
        case "target":
            cssClass = "jsmind-drag-target";
            break;
        case "tparent":
            cssClass = "jsmind-drag-tparent";
            break;
        case "old-near-child":
            cssClass = "jsmind-drag-near-child";
            break;
        case "upper-child":
            cssClass = "jsmind-drag-upper-child";
            break;
        case "lower-child":
            cssClass = "jsmind-drag-lower-child";
            break;
        case "dropped-at":
            cssClass = "jsmind-drag-dropped-at";
            break;
        default:
            throw Error(`Don't know how to mark as ${how}`);
    }
    if (on) {
        jmnode.classList.add(cssClass);
    } else {
        jmnode.classList.remove(cssClass);
    }
}


class ScrollAtFixedSpeed {
    constructor(elt2move) {
        this.elt2move = elt2move;
    }
    stopX() {
        clearInterval(this.tmiX);
        this.tmiX = undefined;
    }
    // 100 pixel / sec seems good
    startX(pxlPerSec) {
        this.stopX();
        this.prevLeft = undefined;
        const stepX = pxlPerSec < 0 ? -1 : 1;
        const ms = Math.abs(1000 / pxlPerSec);
        const elt2move = this.elt2move
        const elt2scroll = elt2move.parentElement;
        // console.log({ stepX, ms, elt2scroll, elt2move });
        const scrollFun = () => {
            elt2scroll.scrollBy(stepX, 0);
            const bcr = elt2move.getBoundingClientRect();
            // console.log(bcr.left, this.prevLeft);
            if (this.prevLeft == bcr.left) this.stopX();
            this.prevLeft = bcr.left;
        }
        this.tmiX = setInterval(scrollFun, ms);
    }

}
class ScrollAtDragBorder {
    constructor(elt2move, scrollBorderWidth) {
        this.elt2move = elt2move;
        this.bw = scrollBorderWidth;
        this.visuals = [];
        const addVisual = () => {
            const style = [
                "background-color: rgba(255, 0, 0, 0.2)",
                "position: fixed",
                "display: none",
            ].join(";");
            const eltVis = mkElt("div", { style });
            this.visuals.push(eltVis);
            const elt2moveParent = elt2move.parentElement;
            elt2moveParent.appendChild(eltVis);
            return eltVis;
        }
        this.eltVisualLeft = addVisual();
        this.eltVisualRight = addVisual();
        // console.log("right", this.eltVisualRight);
        this.scroller = new ScrollAtFixedSpeed(elt2move);
        const updateLimits = () => this.updateScreenLimits();
        window.addEventListener("resize", () => { updateLimits(); });
        updateLimits();
    }
    showVisuals() { this.visuals.forEach(v => v.style.display = "block"); }
    hideVisuals() { this.visuals.forEach(v => v.style.display = "none"); }
    updateScreenLimits() {
        const elt2moveParent = this.elt2move.parentElement;
        const scrollbarW = elt2moveParent.offsetWidth - elt2moveParent.clientWidth;
        const bcr = elt2moveParent.getBoundingClientRect();
        this.limits = {
            left: bcr.left + this.bw,
            right: bcr.right - this.bw - scrollbarW,
        }
        const styleL = this.eltVisualLeft.style;
        styleL.width = `${this.bw}px`;
        styleL.height = `${bcr.height}px`;
        styleL.top = `${bcr.top}px`
        styleL.left = `${bcr.left}px`
        const styleR = this.eltVisualRight.style;
        styleR.width = `${this.bw}px`;
        styleR.height = `${bcr.height}px`;
        styleR.top = `${bcr.top}px`
        styleR.left = `${bcr.left + bcr.width - this.bw - scrollbarW}px`
        styleR.left = `${this.limits.right}px`
    }
    checkPoint(cx, cy) {
        const oldCx = this.cx;
        const outsideRight = cx > this.limits.right;
        const outsideLeft = cx < this.limits.left;
        if (!(outsideLeft || outsideRight)) this.scroller.stopX();
        this.cx = cx;
        const scrollSpeed = 150;
        if (outsideLeft) {
            // console.log("outside left");
            this.scroller.startX(-scrollSpeed);
            if (oldCx) { if (cx > oldCx) this.scroller.stopX(); }
        }
        if (outsideRight) {
            // console.log("outside right");
            this.scroller.startX(scrollSpeed);
            if (oldCx) { if (cx < oldCx) this.scroller.stopX(); }
        }
    }
    stopScrolling() {
        this.scroller.stopX();
    }
    startScroller() {
        this.elt2move.addEventListener("dragstart", evt => {
            this.showVisuals();
        });
        this.elt2move.addEventListener("drag", evt => {
            // console.log("scroller drag");
            this.checkPoint(evt.clientX, evt.clientY);
            // this.checkPoint(useClientX(evt), useClientY(evt));
        });
        this.elt2move.addEventListener("dragend", evt => {
            this.hideVisuals();
            this.stopScrolling();
        });
    }
}

function informDragStatus(msg) {
    const id = "jsmind-drag-status";
    const eltStatus = document.getElementById(id) || mkElt("div", { id }, mkElt("div"));
    if (!eltStatus.parentElement) document.body.appendChild(eltStatus)
    if (msg === undefined) {
        eltStatus.style.display = null;
    } else {
        eltStatus.style.display = "block";
        eltStatus.firstElementChild.textContent = msg;
    }
}

function getAllNodesAndBcr() {
    // FIX-ME: jmnodes
    const jmns = document.querySelector("jmnodes");
    return [...jmns.querySelectorAll("jmnode")].map(eltNode => {
        const id = getNodeIdFromDOMelt(eltNode);
        const bcr = eltNode.getBoundingClientRect(eltNode);
        // console.log(id, bcr);
        return { id, bcr, eltNode };
    });
}
function getNodesInColumn(arrBcr, clientX, nodeDragged) {
    const arrInCol = arrBcr.filter(e => {
        if (e.eltNode === nodeDragged) return false;
        if (e.bcr.left > clientX) return false;
        if (e.bcr.right < clientX) return false;
        return true;
    });
    return arrInCol.sort((a, b) => a.bcr.top - b.bcr.top);
}



let colClientX, colClientY;
let nodeAbove, nodeBelow, nodeParent;
let oldElementAtPoint;
// let oldJmnodeAtPoint; // this is eltTarget!
const dragPauseTimer = new TimeoutTimer(500, whenDragPauses);
function whenDragPauses() {
    const newElementAtPoint = document.elementFromPoint(colClientX, colClientY);
    if (!newElementAtPoint) return; // FIX-ME: clear up here, or?
    if (newElementAtPoint != oldElementAtPoint) {
        oldElementAtPoint = newElementAtPoint;
        const newEltTarget = newElementAtPoint.closest("jmnode");
        if (newEltTarget != eltTarget) {
            if (eltTarget) {
                // handle leave
                markAsTarget(eltTarget, false);
            }
            eltTarget = newEltTarget;
            if (eltTarget) {
                // handle enter
                markAsTarget(eltTarget, true);
                if (nodeAbove) {
                    markAsUpperChild(nodeAbove, false);
                    nodeAbove = undefined;
                }
                if (nodeBelow) {
                    markAsLowerChild(nodeBelow, false);
                    nodeBelow = undefined;
                }
                if (nodeParent) {
                    markAsTParent(nodeParent, false);
                    nodeParent = undefined;
                }
            }
        }
        if (eltTarget) return;
    }
    // console.log("*** whenDragPauses");
    const oldNodeParent = nodeParent;
    const oldNodeAbove = nodeAbove;
    const oldNodeBelow = nodeBelow;
    nodeParent = undefined;
    nodeAbove = undefined;
    nodeBelow = undefined;

    let entryAbove, entryBelow;
    const arrNodesBcr = getAllNodesAndBcr();
    const arrCol = getNodesInColumn(arrNodesBcr, colClientX, eltDragged);
    // console.log({ arrCol });
    const getY = (entry) => (entry.bcr.top + entry.bcr.bottom) / 2;
    nodeAbove = undefined; nodeBelow = undefined;
    let entryOverLower;
    let entryOverUpper;
    arrCol.forEach(entry => {
        // if (entryOver) return;
        const entryTop = entry.bcr.top;
        const entryBottom = entry.bcr.bottom;
        const entryMiddle = (entryTop - entryBottom) / 2;
        if (entryTop > colClientY && colClientY > entryMiddle) {
            entryOverUpper = entry;
        }
        if (entryBottom < colClientY && colClientY < entryMiddle) {
            entryOverLower = entry;
        }
        const entryY = getY(entry);
        if (entryY <= colClientY) {
            if (!entryAbove || entryY > getY(entryAbove)) entryAbove = entry;
        }
        if (entryY >= colClientY) {
            if (!entryBelow || entryY < getY(entryBelow)) entryBelow = entry;
        }
    });
    // console.log(arrCol, { entryAbove, entryBelow, nodeParent });
    // if (!entryAbove && !entryBelow) return;
    if (entryAbove || entryBelow) {
        if (nodeParent) {
            debugger;
        }
        nodeAbove = entryAbove?.eltNode;
        nodeBelow = entryBelow?.eltNode;
        let our_parent;
        if (entryAbove) our_parent = ourJm.get_node(entryAbove.id).parent;
        if (entryBelow) our_parent = ourJm.get_node(entryBelow.id).parent;
        if (nodeAbove && nodeBelow) {
            const parent_above = ourJm.get_node(entryAbove.id).parent;
            const parent_below = ourJm.get_node(entryBelow.id).parent;
            if (parent_above.id !== parent_below.id) {
                function getDepth(node, depth) {
                    if (depth > 20) throw Error("Depth is too great");
                    if (!node) return depth;
                    return getDepth(node.parent, ++depth)
                }
                const depthAbove = getDepth(parent_above, 0);
                const depthBelow = getDepth(parent_below, 0);
                console.log({ depthAbove, depthBelow });
                let id_above, id_below;
                if (depthAbove > depthBelow) {
                    our_parent = parent_below;
                    id_below = entryBelow.id;
                    nodeAbove = undefined;
                } else {
                    our_parent = parent_above;
                    id_above = entryAbove.id;
                    nodeBelow = undefined;
                }
                const id_sibling = id_above || id_below;
                const node_sibling = ourJm.get_node(id_sibling);
                const ourParent = getDOMeltFromNode(our_parent);
                console.log(our_parent, ourParent);
                // debugger;
                let children = our_parent.children.filter(child => node_sibling.direction == child.direction);
                if (id_below) children = children.reverse();
                console.log({ children });

                let getNext = false;
                let new_sibling;
                for (let child of children) {
                    if (getNext) { new_sibling = child; break; }
                    if (child.id == id_sibling) getNext = true;
                }
                // debugger;
                let newSibling;
                if (new_sibling) {
                    newSibling = getDOMeltFromNode(new_sibling);
                }
                console.log({ newSibling })
                nodeAbove = nodeAbove || newSibling;
                nodeBelow = nodeBelow || newSibling;
            }
        }
        if (our_parent) nodeParent = getDOMeltFromNode(our_parent);
    }

    if (oldNodeParent != nodeParent) {
        if (oldNodeParent) markAsTParent(oldNodeParent, false);
        if (nodeParent) markAsTParent(nodeParent, true);
    }

    if (oldNodeAbove != nodeAbove) {
        if (oldNodeAbove) markAsUpperChild(oldNodeAbove, false);
        if (nodeAbove) markAsUpperChild(nodeAbove, true);
    }

    if (oldNodeBelow != nodeBelow) {
        if (oldNodeBelow) markAsLowerChild(oldNodeBelow, false);
        if (nodeBelow) markAsLowerChild(nodeBelow, true);
    }
}
let diffClientX = 0;
let diffClientY = 0;
const useClientX = evt => evt.clientX + diffClientX;
const useClientY = evt => evt.clientY + diffClientY;
export function setPointerDiff(newDiffClientX, newDiffClientY) {
    diffClientX = newDiffClientX;
    diffClientY = newDiffClientY;
}
const trackPointerFun = evt => {
    const samePoint = (colClientX == useClientX(evt) || colClientY == useClientY(evt));
    if (samePoint) return;
    colClientX = useClientX(evt);
    colClientY = useClientY(evt);
    dragPauseTimer.restart();
}
export function startTrackingPointer() {
    const jmns = document.querySelector("jmnodes");
    jmns.addEventListener("pointermove", trackPointerFun);
}
export function stopTrackingPointer() {
    dragPauseTimer.stop();
    const jmns = document.querySelector("jmnodes");
    jmns.removeEventListener("pointermove", trackPointerFun);
}

// FIX-ME: jmnodes
export function startTrackingDrag() {
    // console.warn("startTrackingDrag");
    const jmns = document.querySelector("jmnodes");
    // jmns.addEventListener("drag", trackPointerFun);
    jmns.addEventListener("drag", trackPointerFun);
}
export function stopTrackingDrag() {
    // console.warn("stopTrackingDrag");
    dragPauseTimer.stop();
    const jmns = document.querySelector("jmnodes");
    // jmns.removeEventListener("drag", trackPointerFun);
    jmns.removeEventListener("drag", trackPointerFun);
}