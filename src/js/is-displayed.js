"use strict";
console.log("here is module is-displayed.js");
if (document.currentScript) throw Error("import .currentScript"); // is module
if (!import.meta.url) throw Error("!import.meta.url"); // is module

// https://stackoverflow.com/questions/19669786/check-if-element-is-visible-in-dom
// https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetParent
// https://developer.mozilla.org/en-US/docs/Glossary/Truthy
function isDisplayedJq(el) {
    return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
}
function isDisplayedOffsetParent(el) {
    // return (!!el.offsetParent === null)
    return (!!el.offsetParent);
}
function isDisplayedStyle(el) {
    var style = window.getComputedStyle(el);
    return (style.display !== 'none')
}
function isDisplayedRoot(el) {
    return !!el.closest(":root");
}

async function AddBeforeWhenContainerIsDisplayed(eltContainer, eltNew, eltBefore, msMaxWait) {
    msMaxWait = msMaxWait || 1000;
    const elapsed = await waitUntilDisplayed(eltContainer, msMaxWait);
    console.log("AddMdcSliderBefore, elapsed", elapsed, eltContainer, eltNew, eltBefore, msMaxWait);
    if (elapsed < 0) return;
    eltContainer.insertBefore(eltNew, eltBefore);
}


export async function waitUntilDisplayed(elt, msMax) {
    const isDisplayed = () => {
        const dispJq = isDisplayedJq(elt);
        const dispOP = isDisplayedOffsetParent(elt);
        const dispSt = isDisplayedStyle(elt);
        const dispRt = isDisplayedRoot(elt);
        // console.log("wud", { dispJq, dispOP, dispSt, dispRt });
        return dispJq && dispOP && dispSt && dispRt;
    };
    if (isDisplayed()) return 0;
    const startAt = Date.now();
    let n = 0;
    return new Promise((resolve, reject) => {
        function tryAgain() {
            if (++n > 100) reject(`${n} > 100`);
            const finAt = Date.now();
            const elapsed = finAt - startAt;
            const disp = isDisplayed();
            if (disp) {
                console.log("resolve", elapsed,)
                resolve(elapsed);
                return;
            }
            if (elapsed > msMax) {
                console.error(`Time out ${elapsed} (${msMax}) ms waiting for elt displayed`, elt);
                console.warn(`Time out ${elapsed} (${msMax}) ms waiting for elt displayed`);
                resolve(-elapsed);
                return;
            }
            setTimeout(tryAgain, 200);
        }
        tryAgain();
    });
}


export async function mkSliderInContainer(eltCont, min, max, now, step, label, onChange, onInput, disable) {
    let sli = eltCont.querySelector("div.mdc-slider");
    if (!sli) {
        try {
            const modMdc = await import("util-mdc");
            sli = await modMdc.mkMDCslider(min, max, now, step, label, onChange, onInput, disable);
            sli.classList.add("mdc-my-slider-colors-fix");
            await AddBeforeWhenContainerIsDisplayed(eltCont, sli);
            if (!sli.parentElement) return;
            const mdc = sli.myMdc || await sli.myPromMdc;
        } catch (err) {
            console.error("mkSliderInContainer", err);
        }
    }
    return sli;
}
