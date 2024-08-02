// @ts-check
console.log("here is make-abs.js");

/*
    Helper functions for developing locally and serving from GitHub.
    Should somehow be included early on every .html page.

    I suggest putting it in the same folder as the script adding
    your dynamig import map. Just include this script right before.
*/

function makeAbsLink(relLink) {
    const urlLink = new URL(relLink, location.href);
    const absLink = urlLink.href;
    console.log("makeAbsScriptLink:", absLink);
    return absLink;
}

function importModule(relSrc) {
    const absSrc = makeAbsLink(relSrc);
    return import(absSrc);
}
function insertHereImportmap(objRelMap) {
    const objAbsMap = {
        imports:
            Object.fromEntries(
                Object.entries(objRelMap).map(entry => [entry[0], makeAbsLink(entry[1])])
            )
    }
    const jsonAbsMap = JSON.stringify(objAbsMap, null, 2);
    console.log(jsonAbsMap);
    const eltMap = insertHereElement("script");
    eltMap.type = "importmap";
    eltMap.textContent = jsonAbsMap;
}

function insertHereElement(tagName) {
    const elt = document.createElement(tagName.toLowerCase());
    if (!document.currentScript) throw Error("document.currentScript is null");
    document.currentScript.insertAdjacentElement("afterend", elt);
    return elt;
}
function insertHereLink(relHref, rel) {
    // FIX-ME: not tested yet
    const eltLink = insertHereElement("link");
    eltLink.rel = rel;
    eltLink.href = makeAbsLink(relHref);
    return eltLink;
}
function insertHereScript(relSrc, eventName) {
    const eltScript = insertHereElement("script");
    let prom;
    const absSrc = makeAbsLink(relSrc);
    if (eventName) {
        prom = simpleBlockUntilEvent(window, eventName);
        eltScript.onload = () => {
            console.log("loaded ", relSrc, eventName);
            window.dispatchEvent(new CustomEvent(eventName))
        }
    }
    eltScript.src = absSrc;
    // FIX-ME: add timeout here:
    return prom;
}
function insertHereA(relLink, linkText) {
    const eltA = insertHereElement("A");
    eltA.textContent = linkText;
    eltA.href = makeAbsLink(relLink);
    return eltA;
}
// https://dev.to/somedood/promises-and-events-some-pitfalls-and-workarounds-elp
function simpleBlockUntilEvent(targ, evt) {
    return new Promise(resolve => targ.addEventListener(evt, resolve, { passive: true, once: true }));
}
