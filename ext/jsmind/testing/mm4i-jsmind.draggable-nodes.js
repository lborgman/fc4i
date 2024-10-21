/**
 * @license BSD
 * @copyright 2014-2023 hizzgdev@163.com
 *
 * Project Home:
 *   https://github.com/hizzgdev/jsmind/
 * 
 */

const version = "0.1.000";
console.log(`here is mm4i-jsmind.draggable-nodes.js, module ${version}`);
if (document.currentScript) throw Error("import .currentScript"); // is module





///////////////////////////////////////////////
// Utility functions. FIX-ME: Should be in jsmind core

// function getDOMeltFromNode(node) { return node._data.view.element; }
function getDOMeltFromNode(node) { return jsMind.my_get_DOM_element_from_node(node); }
function getNodeIdFromDOMelt(elt) {
    const tn = elt.tagName;
    if (tn !== "JMNODE") throw Error(`Not jmnode: <${tn}>`);
    const id = elt.getAttribute("nodeid");
    if (!id) throw Error("Could not find jmnode id");
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
let childDragLine;
// const instScrollAtDragBorder = new ScrollAtDragBorder(eltJmnodes, 60);
let instScrollAtDragBorder;
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

    // const instScrollAtDragBorder = new ScrollAtDragBorder(eltJmnodes, 60);
    // instScrollAtDragBorder.startScroller();
    instScrollAtDragBorder = new ScrollAtDragBorder(eltJmnodes, 60);

    // FIX-ME: make local again
    // let eltDragged;





}

export function setJmnodeDragged(jmnode) {
    eltDragged = jmnode;
    markDragNode(jmnode, "dragged", true);
}
function markAsDragged(jmnode, on) {
    if (on) unmarkDragged();
    markDragNode(jmnode, "dragged", on);
}
function markAsTarget(jmnode, on) {
    if (on) unmarkTarget();
    markDragNode(jmnode, "target", on);
}
function markAsTParent(jmnode, on) {
    if (on) unmarkDragged();
    markDragNode(jmnode, "tparent", on);
}
function markAsUpperChild(jmnode, on) {
    if (on) unmarkUpperChild();
    markDragNode(jmnode, "upper-child", on);
}
function markAsLowerChild(jmnode, on) {
    if (on) unmarkLowerChild();
    markDragNode(jmnode, "lower-child", on);
}
function markAsDroppedAt(jmnode, on) { markDragNode(jmnode, "dropped-at", on); }

const markNames = ["dragged", "target", "tparent", "upper-child", "lower-child", "dropped-at"];
function markDragNode(jmnode, how, on) {
    console.log("////MARK", how, on);
    if (jmnode.tagName !== "JMNODE") throw Error(`${jmnode.tagName} !== "JMNODE`);

    if (markNames.indexOf(how) == -1) throw Error(`Don't know how to mark as ${how}`);
    const cssClass = `jsmind-drag-${how}`;

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
        this.elt2move.addEventListener("OLDdragstart", evt => {
            this.showVisuals();
        });
        this.elt2move.addEventListener("OLDdrag", evt => {
            // console.log("scroller drag");
            this.checkPoint(evt.clientX, evt.clientY);
            // this.checkPoint(useClientX(evt), useClientY(evt));
        });
        this.elt2move.addEventListener("OLDdragend", evt => {
            this.hideVisuals();
            this.stopScrolling();
        });
    }
    showScroller() { this.showVisuals(); }
    hideScroller() { this.hideVisuals(); }
    checkScroll(cX, cY) { this.checkPoint(cX, cY); }
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

/**
 * 
 * @param {HTMLElement} eltFrom 
 */
export function nextHereIamMeansStart(eltFrom) {
    const tn = eltFrom.tagName;
    if (tn != "JMNODE") throw Error(`Expected <jmnode>, got <${tn}>`);
    colClientX = undefined;
    colClientY = undefined;
    dragPauseTimer.stop();
    eltDragged = eltFrom;
    // debugger;
    // markAsDragged(eltDragged, true);
    eltTarget = undefined;
    eltTParent = undefined;
    instScrollAtDragBorder.showScroller();
}
export function hiHereIam(cX, cY) {
    if (colClientX == cX && colClientY == cY) return;
    instScrollAtDragBorder.checkPoint(cX, cY);
    colClientX = cX;
    colClientY = cY;
    dragPauseTimer.restart();
}

function unmarkTParent() { if (nodeParent) markAsTParent(nodeParent, false); }
function unmarkUpperChild() { if (nodeAbove) markAsUpperChild(nodeAbove, false); }
function unmarkLowerChild() { if (nodeBelow) markAsLowerChild(nodeBelow, false); }
function unmarkTarget() { if (eltTarget) markAsTarget(eltTarget, false); }
function unmarkDragged() { if (eltDragged) markAsDragged(eltDragged, false); }

export function stopNow() {
    dragPauseTimer.stop();
    instScrollAtDragBorder.hideScroller();
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
    // const dragPosX = useClientX(evt);
    // const direction = rootMiddleX < dragPosX ? jsMind.direction.right : jsMind.direction.left;
    const direction = rootMiddleX < colClientX ? jsMind.direction.right : jsMind.direction.left;
    // console.log({ direction });

    if (eltTarget) {
        markAsTarget(eltTarget, false);
        const id_target = getNodeIdFromDOMelt(eltTarget);
        ourJm.move_node(idDragged, "_last_", id_target, direction);
        setTimeout(unMarkAll, 2000);
        return;
    }

    const idParent = getNodeIdFromDOMelt(nodeParent)
    if (!nodeBelow) {
        ourJm.move_node(idDragged, "_last_", idParent, direction);
        // const before = "_last_";
        // console.log("ourJm.move_node", { idDragged, before, idParent, direction });
    } else {
        const idBelow = getNodeIdFromDOMelt(nodeBelow);
        ourJm.move_node(idDragged, idBelow, idParent, direction);
        // console.log("ourJm.move_node", { idDragged, idBelow, idParent, direction });
    }
    function unMarkAll() {
        console.warn("----- unMarkAll");
        unmarkTParent();
        unmarkUpperChild();
        unmarkLowerChild();
        unmarkTarget();
        unmarkDragged();
    }
    setTimeout(unMarkAll, 2000);
}


function whenDragPauses() {
    // hiHereIam
    childDragLine?.moveFreeEnd(colClientX, colClientY);
    const newElementAtPoint = document.elementFromPoint(colClientX, colClientY);
    if (!newElementAtPoint) return; // FIX-ME: clear up here, or?
    if (newElementAtPoint != oldElementAtPoint) {
        oldElementAtPoint = newElementAtPoint;
        const newEltTarget = newElementAtPoint.closest("jmnode");
        if (newEltTarget != eltTarget) {
            unmarkTarget();
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
    // let entryOverLower;
    // let entryOverUpper;
    arrCol.forEach(entry => {
        // if (entryOver) return;
        const entryTop = entry.bcr.top;
        const entryBottom = entry.bcr.bottom;


        /*
        const entryMiddle = (entryTop - entryBottom) / 2;
        if (entryTop > colClientY && colClientY > entryMiddle) {
            entryOverUpper = entry;
        }
        if (entryBottom < colClientY && colClientY < entryMiddle) {
            entryOverLower = entry;
        }
        */
        if (entry.id != "root") {
            const entryY = getY(entry);
            if (entryY <= colClientY) {
                if (!entryAbove || entryY > getY(entryAbove)) entryAbove = entry;
            }
            if (entryY >= colClientY) {
                if (!entryBelow || entryY < getY(entryBelow)) entryBelow = entry;
            }
        } else {
            const middleX = (entry.bcr.left + entry.bcr.right) / 2;
            if (colClientX < middleX) {
                entry.eltNode.classList.add("jsmind-drag-root-leftside");
                entry.eltNode.classList.remove("jsmind-drag-root-rightside");
            } else {
                entry.eltNode.classList.remove("jsmind-drag-root-leftside");
                entry.eltNode.classList.add("jsmind-drag-root-rightside");
            }
        }
    });
    // console.log(arrCol, { entryAbove, entryBelow, nodeParent });
    // if (!entryAbove && !entryBelow) return;
    if (entryAbove || entryBelow) {
        if (nodeParent) {
            debugger; // eslint-disable-line no-debugger
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
                let children = our_parent.children.filter(child => node_sibling.direction == child.direction);
                if (id_below) children = children.reverse();
                console.log({ children });

                let getNext = false;
                let new_sibling;
                for (let child of children) {
                    if (getNext) { new_sibling = child; break; }
                    if (child.id == id_sibling) getNext = true;
                }
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
// let diffClientX = 0;
// let diffClientY = 0;
// const useClientX = evt => evt.clientX + diffClientX;
// const useClientY = evt => evt.clientY + diffClientY;
// export function setPointerDiff(newDiffClientX, newDiffClientY) { diffClientX = newDiffClientX; diffClientY = newDiffClientY; }
/*
const trackPointerFun = evt => {
    const samePoint = (colClientX == useClientX(evt) || colClientY == useClientY(evt));
    if (samePoint) return;
    colClientX = useClientX(evt);
    colClientY = useClientY(evt);
    dragPauseTimer.restart();
}
*/