// @ts-check
const SCROLL_HELP_VER = "0.0.7";
console.log(`here is scroll-help.js, module, ${SCROLL_HELP_VER}`);
if (document.currentScript) { throw "scroll-help.js is not loaded as module"; }

export class ScrollAtFixedSpeed {
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
export class ScrollAtDragBorder {
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
    checkPoint(cx) {
        const oldCx = this.cx;
        const outsideRight = cx > this.limits.right;
        const outsideLeft = cx < this.limits.left;
        if (!(outsideLeft || outsideRight)) this.scroller.stopX();
        this.cx = cx;
        const scrollSpeed = 150;
        if (outsideLeft) {
            this.scroller.startX(-scrollSpeed);
            if (oldCx) { if (cx > oldCx) this.scroller.stopX(); }
        }
        if (outsideRight) {
            this.scroller.startX(scrollSpeed);
            if (oldCx) { if (cx < oldCx) this.scroller.stopX(); }
        }
    }
    stopScrolling() { this.scroller.stopX(); }
    showScroller() { this.showVisuals(); }
    hideScroller() { this.hideVisuals(); }
    checkScroll(cX, cY) { this.checkPoint(cX, cY); }
}
