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

(() => {
    return;
    if (!jsMind) {
        throw new Error('jsMind is not defined');
    }

    const clsJm = jsMind;
    const $ = clsJm.$;

    const clear_selection =
        'getSelection' in $.w
            ? function () {
                $.w.getSelection().removeAllRanges();
            }
            : function () {
                $.d.selection.empty();
            };

    const options = {
        line_width: 5,
        lookup_delay: 500,
        // lookup_delay: 2000,
        // lookup_interval: 80,
        // lookup_interval: 1000,
        lookup_interval: 100,
    };

    class DraggableNode {
        constructor(jm) {
            this.jm = jm;
            this.e_canvas = null;
            this.canvas_ctx = null;
            this.shadow = null;
            this.shadow_w = 0;
            this.shadow_h = 0;
            this.active_node = null;
            this.target_node = null;
            this.target_direct = null;
            this.hlookup_delay = 0;
            this.hlookup_timer = 0;
            this.capture = false;
            this.moved = false;
            this.canvas_draggable = this.jm.get_view_draggable();
        }
        #getNodeFromDOMelt(elt) {
            const id = getNodeIdFromDOMelt(elt);
            const node = this.jm.get_node(id);
            // const node = jm.get_node(id);
            if (!!!node) throw Error(`Could not get node "${id}"`);
            return node;
        }
        #getScrollDiffXY() {
            const dragInfo = this.dragInfo;
            const oldBcrJmnodes = dragInfo.bcrEltJmnodes;
            const bcrJmnodes = dragInfo.eltJmnodes.getBoundingClientRect();
            const diffX = oldBcrJmnodes.left - bcrJmnodes.left;
            const diffY = oldBcrJmnodes.top - bcrJmnodes.top;
            return { diffX, diffY }
        }
        restartDragLine(fromBcr) {
            const x = (fromBcr.left + fromBcr.right) / 2;
            const y = (fromBcr.top + fromBcr.bottom) / 2;
            let oldFreeX, oldFreeY;
            const scrollDiff = this.#getScrollDiffXY();
            const scrolledX = x - scrollDiff.diffX;
            const dragInfo = this.dragInfo;
            const newLine = new DrawSvgLine(scrolledX, y, this.lineAttr, dragInfo.eltJmnodes);
            const oldLine = dragInfo.dragLine;
            dragInfo.dragLine = newLine;
            if (oldLine) {
                oldFreeX = oldLine.getFreeX();
                oldFreeY = oldLine.getFreeY();
                oldLine?.removeLine();
            }
            const dragPos = dragInfo.dragPos;
            const freeX = oldFreeX || dragPos.clientX;
            const freeY = oldFreeY || dragPos.clientY;
            newLine.moveFreeEnd(freeX, freeY);
        }


        init() {
            // https://github.com/fabricjs/fabric.js/issues/6704
            // FIX-ME: is the canvas needed for drag-and-drop on mobiles???
            // this._create_canvas();
            // this._create_shadow();
            this._event_bind();
        }
        resize() {
            // this.jm.view.e_nodes.appendChild(this.shadow);
            // this.e_canvas.width = this.jm.view.size.w;
            // this.e_canvas.height = this.jm.view.size.h;
        }
        _create_canvas() {
            var c = $.c('canvas');
            this.jm.view.e_panel.appendChild(c);
            var ctx = c.getContext('2d');
            this.e_canvas = c;
            this.canvas_ctx = ctx;
        }
        _clear_lines() {
            return;
            this.canvas_ctx.clearRect(0, 0, this.jm.view.size.w, this.jm.view.size.h);
        }
        _canvas_lineto(x1, y1, x2, y2) {
            return;
            this.canvas_ctx.beginPath();
            this.canvas_ctx.moveTo(x1, y1);
            this.canvas_ctx.lineTo(x2, y2);
            this.canvas_ctx.stroke();
        }
        _lookup_close_node() {
            const doItWithElts = () => {
                let eltClosest;
                let nApClosest;
                const scrollDiff = this.#getScrollDiffXY();
                const dragInfo = this.dragInfo;
                const sx = dragInfo.dragPos.clientX + scrollDiff.diffX;
                const sy = dragInfo.dragPos.clientY;
                // FIX-ME: y
                if (dragInfo.lastLookupX === sx) return;
                dragInfo.lastLookupX = sx;
                let minDist2 = Number.MAX_VALUE;
                const ourJm = this.jm;
                dragInfo.arrNodesAndPos.forEach(nAp => {
                    const bcr = nAp.bcr;
                    const xMiddle = (bcr.left + bcr.right) / 2;
                    const yMiddle = (bcr.top + bcr.bottom) / 2;
                    const dist2 = (sx - xMiddle) ** 2 + (sy - yMiddle) ** 2;
                    if (dist2 < minDist2) {
                        // Is this a child of the dragged node?
                        let isChild = nAp.isChildOfDragged;
                        const dragInfo = this.dragInfo;
                        if (typeof isChild !== "boolean") {
                            const idNap = getNodeIdFromDOMelt(nAp.eltJmnode);
                            // if (idNap === dragInfo.idDraggedParent) return;
                            const node_nap = ourJm.get_node(idNap);

                            let parent = node_nap.parent;
                            let n = 0
                            isChild = false;
                            while (n++ < 100 && parent) {
                                const idParent = parent.id;
                                if (dragInfo.idDragged == idParent) isChild = true;
                                parent = parent.parent;
                            }
                            if (isChild) return;
                        }
                        if (isChild) debugger;
                        minDist2 = dist2;
                        // if (eltClosest) markAsTarget(eltClosest, false);
                        nApClosest = nAp;
                        eltClosest = nApClosest.eltJmnode;
                        // markAsTarget(eltClosest, true);
                        this.restartDragLine(nAp.bcr);
                        const idClosest = nAp.id;
                        const nodeClosest = this.jm.get_node(idClosest);
                        // console.log({ nodeClosest });
                        const closestChildren = nodeClosest.children
                            .map(child => {
                                const childId = child.id;
                                const idxChild = dragInfo.objNodeId2idx[childId];
                                const nApChild = dragInfo.arrNodesAndPos[idxChild];
                                // console.log({childId, idx, nAp});
                                if (!!!nApChild) return;
                                nApChild.dist = dist2BcrPoint(nApChild.bcr, sx, sy);
                                nApChild.direction = child.direction;
                                nApChild.parent = child.parent;
                                return nApChild;
                            });
                        // console.log({ closestChildren });
                        const closestFiltered = closestChildren
                            .filter((nAp) => !!nAp);
                        let closest2;
                        if (closestFiltered.length > 0) {
                            const closestSorted = closestFiltered
                                .sort((nApLeft, nApRight) => {
                                    const distLeft = nApLeft.dist;
                                    const distRight = nApRight.dist;
                                    return distLeft - distRight;
                                });
                            const direction0 = closestSorted[0].direction;
                            const closest0 = closestSorted.filter(nAp => nAp.direction === direction0);
                            closest2 = closest0.slice(0, 2);
                        } else {
                            closest2 = [];
                        }
                        closest2.forEach(nAp => {
                            const bcr1 = nApClosest.bcr;
                            const bcr2 = nAp.bcr;
                            const above = thirdAbove(bcr1, bcr2, dragInfo.dragPos);
                            nAp.above = above;
                        });

                        if (closest2.length === 2) {
                            const above0 = closest2[0].above.above;
                            const above1 = closest2[1].above.above;
                            if (above0 === above1) closest2 = closest2.slice(0, 1);
                        }
                        const closest2id = closest2.map(nAp => nAp.id);
                        const oldClosest2 = dragInfo.closest2 || [];
                        const oldClosest2id = oldClosest2.map(nAp => nAp.id);
                        dragInfo.closest2 = closest2;
                        oldClosest2id.forEach(id => {
                            if (!closest2id.includes[id]) {
                                const idx = dragInfo.objNodeId2idx[id]
                                const nAp = dragInfo.arrNodesAndPos[idx];
                                markAsNearChild(nAp.eltJmnode, false);
                            }
                        })
                        for (let i = 0, len = closest2.length; i < len; i++) {
                            const nAp = closest2[i];
                            const nApId = nAp.id;
                            if (!oldClosest2id.includes[nApId]) markAsNearChild(nAp.eltJmnode, true);
                        }
                    }
                })
                if (eltClosest) {
                    if (nApClosest.parent) {
                        const node_parent = ourJm.get_node(nApClosest.parent);
                        const idParent = node_parent.id;
                        const idxParent = dragInfo.objNodeId2idx[idParent];
                        const nApParent = dragInfo.arrNodesAndPos[idxParent];

                        ///////////////////////
                        // If we are between parent and eltClosest then switch eltClosest to parent 
                        const dist2ParentClosest = dist2BcrBcr(nApParent.bcr, nApClosest.bcr);
                        const dragPos = dragInfo.dragPos;
                        const dist2ParentPoint = dist2BcrPoint(nApParent.bcr, dragPos.clientX, dragPos.clientY);
                        // console.log({ dist2ParentClosest, dist2ParentPoint, minDist2, nApClosest, node_parent, nApParent });
                        // FIX-ME: minDist2
                        const isBetween =
                            (dist2ParentPoint < 0.9 * dist2ParentClosest)
                            // && (dist2ParentPoint < minDist2)
                            && (minDist2 < dist2ParentClosest)
                            ;
                        /*
                        dist2ParentPoint : 9281
                        dist2ParentClosest : 124228
                        minDist2 : 6845
                        isBetween : false
                        parent     parentClosest     closest
                            parentPoint      minDist
                                    point
                        */
                        // false 'parCl:' '302' 'parPt:' '297' 'minD:' '0'
                        // true 'parCl:' '302' 'parPt:' '270' 'minD:' '1'
                        console.log(isBetween,
                            "parCl:", (dist2ParentClosest / 100).toFixed(0),
                            "parPt:", (dist2ParentPoint / 100).toFixed(0),
                            "minD:", (minDist2 / 100).toFixed(0)
                        );
                        if (isBetween) {
                            nApClosest = nApParent;
                            eltClosest = nApParent.eltJmnode;
                        }
                    }

                    const eltPrevClosest = this.dragInfo.eltClosest;
                    if (eltPrevClosest && eltPrevClosest !== eltClosest) {
                        markAsTarget(eltPrevClosest, false);
                        markAsTarget(eltClosest, true);
                    }
                    this.dragInfo.eltClosest = eltClosest;
                    // const idClosest = eltClosest.getAttribute("nodeid");
                    // closest_node = this.jm.get_node(idClosest);
                }
            }
            doItWithElts();
        }
        lookup_close_node() {
            var node_data = this._lookup_close_node();
            if (!!node_data) {
                this._magnet_shadow(node_data);
                this.target_node = node_data.node;
                this.target_direct = node_data.direction;
            }
        }
        _event_bind() {
            // https://javascript.info/mouse-drag-and-drop
            var jd = this;
            var container = this.jm.view.container;
            // $.on(container, 'mousedown', function (e) {
            $.on(container, 'dragstart', function (e) {
                var evt = e || event;
                jd.dragstart.call(jd, evt);
            });
            // $.on(container, 'mousemove', function (e) {
            $.on(container, 'dragover', function (e) {
                var evt = e || event;
                jd.drag.call(jd, evt);
            });
            $.on(container, 'NOmouseup', function (e) {
                var evt = e || event;
                jd.dragend.call(jd, evt);
            });

            $.on(container, 'dragend', function (e) {
                var evt = e || event;
                jd.dragend.call(jd, evt);
            });

            // https://stackoverflow.com/questions/52554613/html-5-drag-and-drop-not-working-on-mobile-screen
            $.on(container, 'NOtouchstart', function (e) {
                var evt = e || event;
                jd.dragstart.call(jd, evt);
            });
            $.on(container, 'NOtouchmove', function (e) {
                var evt = e || event;
                jd.drag.call(jd, evt);
            });
            $.on(container, 'NOtouchend', function (e) {
                var evt = e || event;
                jd.dragend.call(jd, evt);
            });
        }
        dragstart(e) {
            return;
            if (!this.jm.get_editable()) {
                return;
            }
            if (this.capture) {
                // FIX-ME: what is .capture???
                // return;
            }

            maybeAddDebugLog(`dragstart maybe, EVENT:${e.type}, ${e.target?.tagName}`);
            // const myThis = this; console.log({ myThis })

            const eltDragged = e.target;
            // FIX-ME: For mobiles, touch events:
            if (eltDragged.tagName !== "JMNODE") {
                e.preventDefault();
                if (eltDragged.tagName === "JMNODE") return;
                const eltJm = eltDragged.closest("jmnode");
                if (!!!eltJm) throw Error("Could not find enclosing jmnode for eltJm");
                const idJm = getNodeIdFromDOMelt(eltJm);
                this.jm.end_edit(idJm);
                return;
            }
            maybeAddDebugLog(`dragstart, EVENT:${e.type}`);



            markAsDragged(eltDragged, true);
            const eltJmnodes = eltDragged.closest("jmnodes");
            const idDragged = getNodeIdFromDOMelt(eltDragged);
            const node_dragged = this.jm.get_node(idDragged);
            this.jm.end_edit(node_dragged); // For mobiles and touch
            const idDraggedParent = node_dragged.parent.id;
            this.lineAttr = {};
            const arrNodesAndPos = getArrNodesAndPos(eltJmnodes, eltDragged);
            const objNodeId2idx = {}
            for (let i = 0, len = arrNodesAndPos.length; i < len; i++) {
                const nAp = arrNodesAndPos[i];
                objNodeId2idx[nAp.id] = i;
            }
            // objNodeId2idx[getNodeIdFromDOMelt(eltDragged)]
            const dragInfo = {
                eltDragged,
                idDragged,
                idDraggedParent,
                eltJmnodes,
                bcrEltDragged: eltDragged.getBoundingClientRect(),
                bcrEltJmnodes: eltJmnodes.getBoundingClientRect(),
                startPos: { clientX: e.clientX, clientY: e.clientY },
                dragPos: { clientX: e.clientX, clientY: e.clientY },
                arrNodesAndPos,
                objNodeId2idx,
            };
            this.dragInfo = dragInfo;
            // const fromBcr = getDOMeltFromNode(this.#getNodeFromDOMelt(eltDragged, this.jm).parent).getBoundingClientRect();
            // this.restartDragLine(fromBcr);

            this.active_node = null;
            this.view_draggable = this.jm.get_view_draggable();

            var jview = this.jm.view;
            if (this.view_draggable) {
                this.jm.disable_view_draggable();
            }
            var nodeid = jview.get_binded_nodeid(eltDragged);
            if (!!nodeid) {
                var node = this.jm.get_node(nodeid);
                if (!node.isroot) {
                    if (this.hlookup_delay != 0) {
                        $.w.clearTimeout(this.hlookup_delay);
                    }
                    if (this.hlookup_timer != 0) {
                        $.w.clearInterval(this.hlookup_timer);
                    }
                    var jd = this;
                    this.hlookup_delay = $.w.setTimeout(function () {
                        jd.hlookup_delay = 0;
                        jd.hlookup_timer = $.w.setInterval(function () {
                            jd.lookup_close_node.call(jd);
                        }, options.lookup_interval);
                    }, options.lookup_delay);
                    this.capture = true;
                }
            }
        }
        drag(e) {
            return;
            if (!this.jm.get_editable()) {
                return;
            }
            if (this.capture) {
                maybeAddDebugLog(`dragmove, EVENT:${e.type}, ${e.target?.tagName}`);
                this.moved = true;
                clear_selection();
                const dragInfo = this.dragInfo;
                dragInfo.dragPos.clientX = e.clientX;
                dragInfo.dragPos.clientY = e.clientY;
                dragInfo.dragLine?.moveFreeEnd(e.clientX, e.clientY);
                // clear_selection();
            }
        }
        dragend(e) {
            if (this.hlookup_delay != 0) {
                $.w.clearTimeout(this.hlookup_delay);
                this.hlookup_delay = 0;
                this._clear_lines();
            }
            if (this.hlookup_timer != 0) {
                $.w.clearInterval(this.hlookup_timer);
                this.hlookup_timer = 0;
                this._clear_lines();
            }

            if (!this.jm.get_editable()) {
                return;
            }
            if (this.view_draggable) {
                this.jm.enable_view_draggable();
            }
            if (this.capture) {
                const dragInfo = this.dragInfo;
                dragInfo.dragLine?.removeLine();
                dragInfo.closest2id?.forEach(id => {
                    const idx = dragInfo.objNodeId2idx[id]
                    const nAp = dragInfo.arrNodesAndPos[idx];
                    markAsNearChild(nAp.eltJmnode, false);
                });


                const eltDragged = dragInfo.eltDragged;
                markAsDragged(eltDragged, false);
                const idDragged = getNodeIdFromDOMelt(eltDragged);
                const node_dragged = this.jm.get_node(idDragged);

                const eltClosest = dragInfo.eltClosest;
                if (!!!eltClosest) return;
                console.log({ dragInfo });
                console.log(dragInfo.closest2);
                const idClosest = getNodeIdFromDOMelt(eltClosest);
                const node_closest = this.jm.get_node(idClosest);

                markAsTarget(eltClosest, false);

                // "nodeid"
                const parent_node = node_dragged.parent;
                // markAsTarget(getDOMeltFromNode(parent_node), false);

                const idParent = parent_node.id;
                // if (idClosest === idParent) return;

                const closestIsRoot = node_closest.isroot;
                let direction;
                let before_id;
                if (closestIsRoot) {
                    const root = this.jm.get_root();
                    const eltRoot = getDOMeltFromNode(root);
                    const bcrRoot = eltRoot.getBoundingClientRect();
                    const rootMiddleX = (bcrRoot.left + bcrRoot.right) / 2;
                    const dragPosX = dragInfo.dragPos.clientX;
                    direction = rootMiddleX < dragPosX ? jsMind.direction.right : jsMind.direction.left;
                } else {
                    // set before_id
                    before_id = "_first_";
                }
                console.log("move_node", {
                    idDragged,
                    node_dragged,
                    idClosest,
                    node_closest,
                    direction,
                    before_id,
                    closestIsRoot,
                    idParent,
                });
                // this.jm.move_node(node_dragged, before_id, node_closest, direction);
                this.jm.move_node(idDragged, before_id, idClosest, direction);
                return;


                if (this.moved) {
                    var src_node = this.active_node;
                    var target_node = this.target_node;
                    const src_node_parent = src_node.parent;
                    if (target_node) {
                        // FIX-ME: should always be set...
                        var target_direct = this.target_direct;
                        this.move_node(src_node, target_node, target_direct);
                        markAsTarget(getDOMeltFromNode(target_node), false);
                    }
                }
                // this.hide_shadow();
            }
            this.moved = false;
            this.capture = false;
        }
        move_node(src_node, target_node, target_direct) {
            var shadow_h = this.shadow.offsetTop;
            if (!!target_node && !!src_node && !jsMind.node.inherited(src_node, target_node)) {
                // lookup before_node
                var sibling_nodes = target_node.children;
                var sc = sibling_nodes.length;
                var node = null;
                var delta_y = Number.MAX_VALUE;
                var node_before = null;
                var beforeid = '_last_';
                while (sc--) {
                    node = sibling_nodes[sc];
                    if (node.direction == target_direct && node.id != src_node.id) {
                        var dy = node.get_location().y - shadow_h;
                        if (dy > 0 && dy < delta_y) {
                            delta_y = dy;
                            node_before = node;
                            beforeid = '_first_';
                        }
                    }
                }
                if (!!node_before) {
                    beforeid = node_before.id;
                }
                this.jm.move_node(src_node.id, beforeid, target_node.id, target_direct);
            }
            this.active_node = null;
            this.target_node = null;
            this.target_direct = null;
        }
        jm_event_handle(type, data) {
            if (type === jsMind.event_type.resize) {
                this.resize();
            }
        }
    }

    console.log("typeof jm.add_node", typeof clsJm.add_node, clsJm);
    var draggable_plugin = new clsJm.plugin('draggable_node', function (ourJm) {
        console.log("C typeof ourJm.add_node", typeof ourJm.add_node, ourJm);
        var jd = new DraggableNode(ourJm);
        console.log("D typeof ourJm.add_node", typeof ourJm.add_node, ourJm);
        jd.init();
        ourJm.add_event_listener(function (type, data) {
            jd.jm_event_handle.call(jd, type, data);
        });
    });

    console.log("A typeof clsJm.add_node", typeof clsJm.add_node, clsJm);
    jsMind.register_plugin(draggable_plugin);
    console.log("B typeof clsJm.add_node", typeof clsJm.add_node, clsJm);

    function maybeAddDebugLog(msg) {
        if (typeof addDebugLog !== "function") return;
        addDebugLog("M: " + msg);
    }

})();


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

function testSvgLine() {

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

class TimeoutTimer {
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

    let eltDragged;
    let eltTarget;
    let eltTParent;
    let childDragLine;
    let prevJmnode;
    const toTParent = new TimeoutTimer(2000, () => {
        eltTParent = eltTarget;
        markAsTParent(eltTParent, true);
        informDragStatus("Select child placement");
    });
    eltJmnodes.addEventListener("dragstart", evt => {
        eltDragged = evt.target;
        // FIX-ME: What is happening here???
        if (!eltDragged) return;
        markAsDragged(eltDragged, true);
        eltTarget = undefined;
        eltTParent = undefined;
        childDragLine = undefined;
        // console.log("eltTarget=u dragstart")
    });
    eltJmnodes.addEventListener("dragend", evt => {
        console.log("dragend", { eltDragged }, eltDragged.getAttribute("nodeid"), { eltTarget }, eltTarget?.getAttribute("nodeid"));
        toTParent.stop();
        childDragLine?.removeLine();
        childDragLine = undefined;
        informDragStatus();

        const idDragged = getNodeIdFromDOMelt(eltDragged);
        const root_node = ourJm.get_root();
        const eltRoot = getDOMeltFromNode(root_node);
        const bcrRoot = eltRoot.getBoundingClientRect();
        const rootMiddleX = (bcrRoot.left + bcrRoot.right) / 2;
        const dragPosX = evt.clientX;
        const direction = rootMiddleX < dragPosX ? jsMind.direction.right : jsMind.direction.left;
        console.log({ direction });

        let eltAbove, eltBelow;
        if (!eltTarget) {
            // FIX-ME: between
            if (!eltTParent) return;
            const id_tparent = getNodeIdFromDOMelt(eltTParent);
            const node_tparent = ourJm.get_node(id_tparent);
            console.log({ id_tparent, node_tparent, eltTParent });
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
        function clearMarking() {
            markAsDragged(eltDragged, false);
            markAsDroppedAt(eltDragged, false);
            if (eltTarget) markAsTarget(eltTarget, false);
            if (eltTParent) markAsTParent(eltTParent, false);
            if (eltAbove) markAsUpperChild(eltAbove, false);
            if (eltBelow) markAsLowerChild(eltBelow, false);
        }
        function finishMarking() {
            const idDragged = getNodeIdFromDOMelt(eltDragged);
            ourJm.select_node(idDragged);
            markAsDroppedAt(eltDragged, true);
            setTimeout(clearMarking, 2000);
        }
    });

    // https://stackoverflow.com/questions/43275189/html-5-drag-events-dragleave-fired-after-dragenter
    // dragenter fires before dragleave!!
    // So... we only have to listen to dragenter, or??
    eltJmnodes.addEventListener("dragenter", evt => {
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
            if (!eltTParent) toTParent.restart();
        }
        function leaveJmnode() {
            toTParent.stop();
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
        toTParent.stop();
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
        childDragLine?.moveFreeEnd(evt.clientX, evt.clientY);

        if (!eltTParent) return;
        // if (eltAbove) markAsUpperChild(eltAbove, false);
        // if (eltBelow) markAsLowerChild(eltBelow, false);
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
        // if (eltAbove) markAsUpperChild(eltAbove, false);
        // if (eltBelow) markAsLowerChild(eltBelow, false);
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
function markAsTParent(jmnode, on) { markDragNode(jmnode, "tparent", on); }
// function markAsNearChild(jmnode, on) { markDragNode(jmnode, "near-child", on); }
function markAsUpperChild(jmnode, on) { markDragNode(jmnode, "upper-child", on); }
function markAsLowerChild(jmnode, on) { markDragNode(jmnode, "lower-child", on); }
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
        })
        this.elt2move.addEventListener("drag", evt => { this.checkPoint(evt.clientX, evt.clientY); })
        this.elt2move.addEventListener("dragend", evt => {
            this.hideVisuals();
            this.stopScrolling();
        })
    }
}
/*
let instScrollAtDragBorder;
setTimeout(() => {
    // debugger;
    const eltJmnodes = document.querySelector("jmnodes");
    instScrollAtDragBorder = new ScrollAtDragBorder(eltJmnodes, 40);
    // eltJmnodes.addEventListener("mousemove", evt => { sdb.checkPoint(evt.clientX, evt.clientY); })
    instScrollAtDragBorder.startScroller();
}, 2000);
*/

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

/*
setTimeout(() => {
    const jmnodes = document.getElementsByTagName("jmnodes");
    jmnodes[0].addEventListener("NOclick", evt => {
        const target = evt.target;
        if (target.tagName !== "JMNODE") return;
        const bcr = target.getBoundingClientRect();
        if (bcr.right > evt.clientX) return;
        const node_id = getNodeIdFromDOMelt(target);
        jm.toggle_node(node_id);
    })
}, 2000);
*/
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
function getNodesInColumn(arrBcr, clientX) {
    // const clientX = 300;
    const arrInCol = arrBcr.filter(e => {
        if (e.bcr.left > clientX) return false;
        if (e.bcr.right < clientX) return false;
        return true;
    });
    return arrInCol.sort((a, b) => a.bcr.top - b.bcr.top);
}



let colClientX, colClientY;
let nodeAbove, nodeBelow;
let currentElementAtPoint;
const dragpausTimer = new TimeoutTimer(2000, whenDragPauses);
function whenDragPauses() {
    let entryAbove, entryBelow;
    const arrNodesBcr = getAllNodesAndBcr();
    const arrCol = getNodesInColumn(arrNodesBcr, colClientX);
    const getY = (entry) => (entry.bcr.top + entry.bcr.bottom) / 2;
    nodeAbove = undefined; nodeBelow = undefined;
    arrCol.forEach(entry => {
        const entryY = getY(entry);
        if (entryY <= colClientY) {
            if (!entryAbove || entryY > getY(entryAbove)) entryAbove = entry;
        }
        if (entryY >= colClientY) {
            if (!entryBelow || entryY < getY(entryBelow)) entryBelow = entry;
        }
    });
    console.log(arrCol, { entryAbove, entryBelow });

    nodeAbove = entryAbove?.eltNode;
    nodeBelow = entryBelow?.eltNode;
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
            let our_parent, id_above, id_below;
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
            debugger;
            let children = our_parent.children.filter(child => node_sibling.direction == child.direction);
            if (id_below) children = children.reverse();
            console.log({ children });

            let getNext = false;
            let new_sibling;
            for (let child of children) {
                if (getNext) { new_sibling = child; break; }
                if (child.id == id_sibling) getNext = true;
            }
            debugger;
            let newSibling;
            if (new_sibling) {
                newSibling = getDOMeltFromNode(new_sibling);
            }
            console.log({ newSibling })
            nodeAbove = nodeAbove || newSibling;
            nodeBelow = nodeBelow || newSibling;
        }
    }
    if (nodeAbove) markAsUpperChild(nodeAbove, true);
    if (nodeBelow) markAsLowerChild(nodeBelow, true);
}
const trackPointerFun = evt => {
    colClientX = evt.clientX;
    colClientY = evt.clientY;
    if (nodeAbove) markAsUpperChild(nodeAbove, false);
    if (nodeBelow) markAsLowerChild(nodeBelow, false);
    nodeBelow = undefined; nodeAbove = undefined;
    dragpausTimer.restart();
}
export function startTrackingPointer() {
    const jmns = document.querySelector("jmnodes");
    jmns.addEventListener("pointermove", trackPointerFun);
}
export function stopTrackingPointer() {
    dragpausTimer.stop();
    const jmns = document.querySelector("jmnodes");
    jmns.removeEventListener("pointermove", trackPointerFun);
}