const FC4I_IMPORTMAPS_VER = "0.2.3";
console.log(`here is fc4i-importmaps ${FC4I_IMPORTMAPS_VER}`);
// https://github.com/WICG/import-maps/issues/92
{
    const relImports = {
        // https://github.com/vasturiano/3d-force-graph
        // Not a module?
        // Anyway ForceGraph3D will be defined in window by import("3d-force-graph")!
        // "three": "https://unpkg.com/three",
        "three": "https://unpkg.com/three/build/three.module.js",
        "three-spritetext": "https://unpkg.com/three-spritetext",
        "mod3d-force-graph": "https://unpkg.com/3d-force-graph",

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
        "jsmind": "./ext/jsmind/jsmind-dbg.js",

        "jsmind-edit-common": "./src/js/jsmind-edit-common.js",
        "jsmind-edit-spec-fc4i": "./src/js/jsmind-edit-spec-fc4i.js",
        "jsmind-cust-rend": "./src/js/jsmind-cust-rend.js",
        "local-settings": "./src/js/mod/local-settings.js",
        "mindmap-helpers": "./src/js/mindmap-helpers.js",
        "my-svg": "./src/js/mod/my-svg.js",
        "new-jsmind.draggable-nodes": "./ext/jsmind/new-jsmind.draggable-nodes.js",
        // "pwa": "./src/js/mod/pwa.js",
        "sharing-params": "./src/js/mod/sharing-params.js",
        "util-mdc": "./src/js/mod/util-mdc.js",

        // Tests:
        "toolsJs": "./src/js/tools.js",

        "pannellum2d": "./ext/pannellum/pannellum2d.js",
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

    /**
     * 
     * @param {string} idOrLink 
     * @returns 
     */
    const importFc4i = async (idOrLink) => {
        if (idOrLink.startsWith("/")) throw Error(`idOrLink should not start with "/" "${idOrLink}`);
        if (idOrLink.startsWith(".")) {
            // FIX-ME: why is this necessary when using <base ...>?
            // const u = new URL(idOrLink, location.href);
            // return await import(u.href);
            return await import(makeAbsLink(idOrLink));
        }
        const relUrl = relImports[idOrLink];
        if (relUrl == undefined) {
            throw Error(`modId "${idOrLink}" is not known by importFc4i`);
        }
        return import(relUrl);
    }
    window.importFc4i = importFc4i;

    /**
     * 
     * @param {string} relLink 
     * @returns {string}
     */
    const makeAbsLink = (relLink) => {
        if (relLink.startsWith("/")) throw Error(`relLink should not start with "/" "${relLink}`);
        const u = new URL(relLink, document.baseURI);
        return u.href;
    }
    window.makeAbsLink = makeAbsLink;
}

// console.log("END fc4i-importmaps");