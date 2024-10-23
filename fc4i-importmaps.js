// @ts-check
const FC4I_IMPORTMAPS_VER = "0.2.6";
console.log(`here is fc4i-importmaps ${FC4I_IMPORTMAPS_VER}`);
// https://github.com/WICG/import-maps/issues/92
{
    // https://www.npmjs.com/package/three?activeTab=versions, Current Tags
    // const threeVersion = "0.167.1";
    const relImports = {
        // https://github.com/vasturiano/3d-force-graph
        // Not a module?
        // Anyway ForceGraph3D will be defined in window by import("3d-force-graph")!
        // "three": "https://unpkg.com/three",
        // "three": "https://unpkg.com/three/build/three.module.js",
        // "three-spritetext": "https://unpkg.com/three-spritetext",

        // https://threejs.org/docs/index.html#manual/en/introduction/Installation
        // "three": "https://cdn.jsdelivr.net/npm/three@<version>/build/three.module.js",
        // "three/addons/": "https://cdn.jsdelivr.net/npm/three@<version>/examples/jsm/"

        // "three": `https://cdn.jsdelivr.net/npm/three@${threeVersion}/build/three.module.js`,
        // "three/addons/": `https://cdn.jsdelivr.net/npm/three@${threeVersion}/examples/jsm/`,
        // "mod3d-force-graph": "https://unpkg.com/3d-force-graph",

        "acc-colors": "./src/acc-colors.js",
        "color-converter": "./src/js/mod/color-converter.js",
        "d3": "./ext/d3/d3.v7.js",
        "db-mindmaps": "./src/js/db-mindmaps.js",
        "db-fc4i": "./src/js/db-fc4i.js",
        "fc4i-items": "./src/js/share.js",
        "flashcards": "./src/js/mod/flashcards.js",
        "idb-common": "./src/js/mod/idb-common.js",
        "images": "./src/js/images.js",
        "is-displayed": "./src/js/is-displayed.js",

        // The jsmind entry is not used yet:
        /*
        <script
            type="text/javascript"
            src="//cdn.jsdelivr.net/npm/jsmind@0.8.5/es6/jsmind.js"
        ></script>
        */
        // "jsmind": "./ext/jsmind/jsmind-dbg.js",
        // "jsmind": "https://cdn.jsdelivr.net/npm/jsmind@0.8.5/es6/jsmind.js",

        // "jsmind": "./ext/jsmind/es6/jsmind-mm4i.js",
        // "jsmind": "./ext/jsmind/testing/OKjsmind-mm4i.js",
        "jsmind": "./ext/jsmind/testing/jsmind-mm4i.js",

        "jsmind-edit-common": "./src/js/jsmind-edit-common.js",
        "jsmind-edit-spec-fc4i": "./src/js/jsmind-edit-spec-fc4i.js",
        "jsmind-cust-rend": "./src/js/jsmind-cust-rend.js",
        "local-settings": "./src/js/mod/local-settings.js",
        "mindmap-helpers": "./src/js/mindmap-helpers.js",
        "my-svg": "./src/js/mod/my-svg.js",
        "mm4i-jsmind.draggable-nodes": "./ext/jsmind/testing/mm4i-jsmind.draggable-nodes.js",
        "sharing-params": "./src/js/mod/sharing-params.js",
        "toolsJs": "./src/js/tools.js",
        "util-mdc": "./src/js/mod/util-mdc.js",

        // Tests:
        "pannellum2d": "./ext/pannellum/pannellum2d.js",
        "jssm": "https://cdn.jsdelivr.net/npm/jssm@latest/dist/jssm.es6.mjs",
        "jssm-viz": "./ext/jssm/jssm-viz.es6.js",
        "mm4i-fsm": "./src/js/mod/mm4i-fsm.js",
        // "viz-js": "https://cdn.jsdelivr.net/npm/viz-js@latest/dist/jssm.es6.mjs",
        "viz-js": "./ext/viz-js/viz-standalone.mjs",
    };
    /*
        It looks like you can't reliable use importmap this way:

        const elt = document.createElement("script");
        elt.type = "importmap";
        const objMap = {
            imports: relImports
        }
        elt.textContent = JSON.stringify(objMap, null, 2);
        document.currentScript.insertAdjacentElement("afterend", elt);
    */

    const isImporting = {};

    /**
     * 
     * @param {string} idOrLink 
     * @returns 
     */
    const importFc4i = async (idOrLink) => {
        if (idOrLink.startsWith("https://")) {
            return await import(idOrLink);
        }
        if (idOrLink.startsWith("/")) {
            console.error(`idOrLink should not start with "/" "${idOrLink}"`);
            throw Error(`idOrLink should not start with "/" "${idOrLink}"`);
        }
        const getStackTrace = function () {
            var obj = {};
            Error.captureStackTrace(obj, getStackTrace);
            const s = obj.stack;
            return s.split(/\n\s*/);
        };

        if (isImporting[idOrLink]) {
            const prevStack = isImporting[idOrLink];
            const prev = `\n>>>PREV "${idOrLink}" stack: ` + prevStack.join("\n  >>>prev ");
            const currStack = getStackTrace();
            const curr = `\nCURR "${idOrLink}" stack: ` + currStack.join("\n  >>>curr ");
            const getStackPoints = (stack) => {
                // Skip Error and importFc4i
                // FIX-ME: check skip
                const points = stack.slice(2).map(row => {
                    const m = row.match(/\((.*?)\)/);
                    // if (!m) throw Error(`row did not match: ${row}`);
                    if (!m) return row.slice(3); // skip "at "
                    const m1 = m[1];
                    return m1;
                });
                return points;
            }
            const prevPoints = getStackPoints(prevStack);
            const currPoints = getStackPoints(currStack);
            // FIX-ME: how do I see if it is cyclic????

            // const setPrev = new Set(prevPoints);
            // let samePoint;
            // currPoints.forEach(p => { if (setPrev.has(p)) samePoint = p; });
            // console.log("samePoint", samePoint);

            // Is starting point for curr in prev?
            const currStartPoint = currPoints.slice(-1);
            const inPrev = prevPoints.indexOf(currStartPoint) > -1;
            // console.log("inPrev", inPrev);
            if (inPrev) {
                console.warn(`Probably cyclic import for ${idOrLink}`, prev, curr, isImporting);
                debugger; // eslint-disable-line no-debugger
                throw Error(`Cyclic import for ${idOrLink} at ${currStartPoint}`);
            }
        }
        let ourImportLink;
        if (idOrLink.startsWith(".")) {
            // FIX-ME: why is this necessary when using <base ...>? file issue?
            // return await import(makeAbsLink(idOrLink));
            ourImportLink = makeAbsLink(idOrLink);
        }
        if (!ourImportLink) {
            const relUrl = relImports[idOrLink];
            if (relUrl == undefined) {
                console.error(`modId "${idOrLink}" is not known by importFc4i`);
                throw Error(`modId "${idOrLink}" is not known by importFc4i`);
            }
            ourImportLink = relUrl;
        }
        isImporting[idOrLink] = getStackTrace();
        const mod = await import(ourImportLink);
        isImporting[idOrLink] = false;
        return mod;
    }
    window["importFc4i"] = importFc4i;

    /*
    const makeAbsLink = (relLink) => {
        if (relLink.startsWith("/")) throw Error(`relLink should not start with "/" "${relLink}`);
        const u = new URL(relLink, document.baseURI);
        return u.href;
    }
    window.makeAbsLink = makeAbsLink;
     */
}

// console.log("END fc4i-importmaps");