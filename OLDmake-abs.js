// @ts-check
const MAKE_ABS_VER = "1.0.2";
console.log(`here is make-abs.js ${MAKE_ABS_VER}`);
{



    /*
        Helper functions for developing locally and serving from GitHub.
        Should somehow be included early on every .html page.
    
        I suggest putting it in the same folder as the script adding
        your dynamig import map. Just include this script right before.
    */

    let logAbs = false;
    let ourMap = {}

    /**
     * 
     * @param {string} relLink 
     * @returns {string}
     */
    const makeAbsLink = (relLink) => {
        if (relLink.startsWith("/")) { throw Error(`relLink starts with "/", ${relLink}`); }
        if (relLink.startsWith("https://")) { return relLink; }
        const urlLink = new URL(relLink, location.href);
        const absLink = urlLink.href;
        if (logAbs) console.log("makeAbsScriptLink:", absLink);
        return absLink;
    }

    /**
     * 
     * @param {string} relSrc 
     * @returns {Promise}
     */
    const importModule = (relSrc) => {
        const absSrc = makeAbsLink(relSrc);
        return import(absSrc);
    }

    const getOurMap = () => { return ourMap };

    /**
     * 
     * @param {object} objRelMap 
     */
    const insertHereImportmap = (objRelMap) => {
        if (JSON.stringify(ourMap) != "{}") {
            console.error("ourMap is already set", { ourMap });
            throw Error("ourMap is already set");
        }
        ourMap = { ...objRelMap };
        const objAbsMap = {
            imports:
                Object.fromEntries(
                    Object.entries(ourMap).map(entry => [entry[0], makeAbsLink(entry[1])])
                )
        }
        const jsonAbsMap = JSON.stringify(objAbsMap, null, 2);
        console.log(jsonAbsMap);
        const eltMap = /** @type {HTMLScriptElement} */ (insertHereElement("script", { type: "importmap" }));
        // eltMap.type = "importmap";
        eltMap.textContent = jsonAbsMap;
    }

    /**
     * 
     * @param {string} tagName 
     * @param {Object=} attrib 
     * @returns {HTMLElement}
     */
    const insertHereElement = (tagName, attrib) => {
        if (!document.currentScript) throw Error("document.currentScript is null");
        const elt = document.createElement(tagName.toLowerCase());
        for (var x in attrib) { elt.setAttribute(x, attrib[x]); }
        document.currentScript.insertAdjacentElement("afterend", elt);
        return elt;
    }

    /**
     * 
     * @param {string} relUrl 
     * @param {Object=} attrib 
     * @returns 
     */
    const insertHereLink = (relUrl, attrib) => {
        // FIX-ME: not tested yet
        const eltLink = /** @type {HTMLAnchorElement} */ (insertHereElement("link", attrib));
        // eltLink.rel = rel;
        eltLink.href = makeAbsLink(relUrl);
        return eltLink;
    }

    /**
     * 
     * @param {string} relSrc 
     * @param {string} eventName 
     * @returns 
     */
    const insertHereScript = (relSrc, eventName) => {
        const eltScript = /** @type {HTMLScriptElement} */ (insertHereElement("script"));
        let prom;
        const absSrc = makeAbsLink(relSrc);
        if (eventName) {
            console.log(eventName, { absSrc });
            prom = simpleBlockUntilEvent(window, eventName);
            eltScript.onload = () => {
                console.log(eventName, "loaded ", relSrc);
                window.dispatchEvent(new CustomEvent(eventName))
            }
        }
        eltScript.src = absSrc;
        // FIX-ME: add timeout here:
        return prom;
    }

    /**
     * 
     * @param {string} relUrl 
     * @param {string} linkText 
     * @returns  {HTMLAnchorElement}
     */
    const insertHereA = (relUrl, linkText) => {
        const eltA = /** @type {HTMLAnchorElement} */ (insertHereElement("A", { href: relUrl }));
        eltA.textContent = linkText;
        // eltA.href = makeAbsLink(relUrl);
        return eltA;
    }


    // https://dev.to/somedood/promises-and-events-some-pitfalls-and-workarounds-elp
    /**
     * 
     * @param {EventTarget} targ 
     * @param {string} evt 
     * @returns {Promise}
     */
    const simpleBlockUntilEvent = (targ, evt) => {
        return new Promise(resolve => targ.addEventListener(evt, resolve, { passive: true, once: true }));
    }

    const ourObj = {
        MAKE_ABS_VER,
        getOurMap,
        makeAbsLink,
        importModule,
        insertHereImportmap,
        insertHereElement,
        insertHereScript,
        insertHereLink,
        simpleBlockUntilEvent,
    }
    Object.freeze(ourObj)
    window["MakeAbs"] = ourObj;
}