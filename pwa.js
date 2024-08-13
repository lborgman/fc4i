const version = "1.6.6";

/*
    This is a boilerplate for handling a simple PWA.
    The current version of this file should always be available at

        https://github.com/lborgman/hour

    This pwa handler consists of 3 parts:
    
        1) This file, pwa.js which can be cached.
        2) pwa-not-cached.js which is not cached. 
        3) sw-input.js - which I use myself here.

    The web browser client should do

      import("pwa.js");

    This in turn imports "pwa-not-cached.js".
    Any changes to your PWA handling should be done to this later file
    which is not cached.

    The user will be automatically prompted to update.
    The styling of that dialog is done by adding a style sheet
    before all other style sheets. So you can easily override this.

    A typical setup could look like this:

        <script type="module">
          const modPWA = await import("./pwa.js");
          modPWA.startSW("./MY-sw-workbox.js");  // optional, default is "./sw-workbox.js"
          modPWA.setUpdateTitle("My title");     // optional, default is document.title
        </script>



    *** THE SERVICE WORKER FILE ***

    You can handle it whichever way you want.
    (I prefer to use Google Workbox, loaded from the internet.
    This works together with pwa-not-cached.js which also
    loads Workbord from the internet.)

    The only important thing is that it answers a request for version:

        self.addEventListener("message", async evt => {
            let msgType;
            if (evt.data) { msgType = evt.data.type; }
            if (evt.data) {
                switch (msgType) {
                    case 'GET_VERSION':
                        evt.ports[0].postMessage(SW_VERSION);
                        break;
                }
            }
        });

    I handle it the way below.
    Before every commit:
    
        1) Change the SW_VERSION at the top of sw-input.js
        2) run "nxp workbox-cli injectManifest"

    In the call to workbox-cli above the file workbox-config.js is used.
    I have created this once with

        npx workbox-cli wizard



    My code (including this file) have been tested with
    Google Chrome web browser using GitHub Pages as the server.


    I plan to use these files in different small projects.
    If I need to change anything I will first try it out in
    the (toy) project "Get hour number":

        https://github.com/lborgman/hour
*/

const logStyle = "background:yellowgreen; color:black; padding:2px; border-radius:2px;";
const logStrongStyle = logStyle + " font-size:18px;";
function logConsole(...msg) { console.log(`%cpwa.js`, logStyle, ...msg); }
function logStrongConsole(...msg) { console.log(`%cpwa.js`, logStrongStyle, ...msg); }

logStrongConsole(`Here is module pwa.js, ${version}`, import.meta.url);


const idDebugSection = "pwa-debug-output";
const secDebug = document.getElementById(idDebugSection);
const keyLogToScreen = `${import.meta.url}-default-log-to-screen`;
let mayLogToScreen = localStorage.getItem(keyLogToScreen) != null;
if (mayLogToScreen && secDebug) { secDebug.style.display = "unset"; }



const secDlgUpdateTransition = 1;
const msDlgUpdateTransition = 1000 * secDlgUpdateTransition;
addCSS();


const urlPWA = new URL(import.meta.url);
const params = [...urlPWA.searchParams.keys()];
if (params.length > 0) throw Error("pwa.js should have no parameters");
if (urlPWA.hash.length > 0) throw Error("pwa.js should have no hash");

const keyVersion = `PWA-version ${import.meta.url}`;
function saveAppVersion(version) { localStorage.setItem(keyVersion, version); }
function getSavedAppVersion() { return localStorage.getItem(keyVersion); }





let secPleaseWaitUpdating = 2000;
let msPleaseWaitUpdating = 1000 * secPleaseWaitUpdating;



const versions = {
    "pwa.js": version,
    "pwa-not-cached.js": "not available"
}


export function getVersions() {
    return versions;
}


function addScreenDebugRow(...txt) {
    if (!mayLogToScreen) return;
    if (secDebug == undefined) return;
    if (secDebug.parentElement == null) return;
    if (secDebug.textContent.trim() == "") {
        const btnClose = mkElt("button", undefined, "Close debug output");
        btnClose.addEventListener("click", evt => secDebug.remove());
        const rowClose = mkElt("div", undefined, btnClose);
        secDebug.appendChild(rowClose);
    }
    logConsole(`SCREEN DEBUG`, [...txt].slice(1));
    const pRow = mkElt("p", undefined, [...txt]);
    secDebug.appendChild(pRow);
}




let modNotCached;


let theEltVersion;
const theFunVersionDefault = (ver) => {
    const eltVer = document.getElementById("PWA-version");
    if (!eltVer) {
        logConsole("could not find element #PWA-version");
        return;
    }
    eltVer.textContent = ver;
    return eltVer;
}
let theFunVersion;
setVersionSWfun(theFunVersionDefault)



let theUpdateTitle = document.title;
let theSWurl = "./sw-workbox.js";



// Override defaults (call before sw started):
export function setUpdateTitle(strTitle) { theUpdateTitle = strTitle; }
export function setSWurl(urlSw) { theSWurl = urlSw; }




class WaitUntil {
    #evtName; #target; #prom; #ready = false;
    constructor(evtName, target) {
        this.#evtName = evtName;
        this.#target = target || window;
        this.#prom = simpleBlockUntilEvent(this.#target, this.#evtName);
    }
    promReady() { return this.#prom; }
    isReady() { return this.#ready; }
    tellReady() {
        this.#ready = true;
        this.#target.dispatchEvent(new Event(this.#evtName));
    }
}
const waitUntilNotCachedLoaded = new WaitUntil("pwa-loaded-not-cached");

if (await PWAonline()) {
    loadNotCached();
} else {
    window.addEventListener("online", async evt => {
        if (!await PWAonline()) return;
        loadNotCached();
    });
}




async function loadNotCached() {
    logConsole("loadNotCached");
    if (modNotCached) return;
    const isOnLine = true;
    if (isOnLine) {
        urlPWA.pathname = urlPWA.pathname.replace("pwa.js", "pwa-not-cached.js");
        urlPWA.searchParams.set("PWAnocacheRand", getRandomString());
        let hrefNotCached = urlPWA.href;

        // Browsers return TypeError when module is not found. Strange, but...
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import
        //   If moduleName refers to a module that doesn't exist, rejects with TypeError (all browsers).
        let errCls;
        let ourErr;
        const errMsgs = [];
        try {
            modNotCached = await import(hrefNotCached);
        } catch (err) {
            errCls = err.constructor.name
            ourErr = err;
            console.error(err);
        }
        if (!modNotCached) {
            const dlgErr = startDlgErr("Error loading pwa-not-cached.js", ourErr);

            let isFetchError = false;
            if (errCls == "TypeError") {
                const f = await fetch(hrefNotCached);
                console.log(f);
                if (!f.ok) {
                    isFetchError = true;
                    errMsgs.push(`HTTP status: ${f.status}`);
                    errMsgs.push(mkElt("a", { href: hrefNotCached, target: "_blank" }, hrefNotCached));
                }
            }
            errMsgs.forEach(m => {
                dlgErr.appendChild(mkElt("div", undefined, m));
            });
            dlgErr.appendChild

            finishAndShowDlgErr(dlgErr, !isFetchError);
            waitUntilNotCachedLoaded.tellReady();
            return;
        }
    } else {
        logStrongConsole("offline, can't load pwa-not-cached.js");
    }
    waitUntilNotCachedLoaded.tellReady();

    if (modNotCached?.getSecPleaseWaitUpdating) {
        secPleaseWaitUpdating = modNotCached.getSecPleaseWaitUpdating();
        msPleaseWaitUpdating = 1000 * secPleaseWaitUpdating;
    }

    versions["pwa-not-cached.js"] = modNotCached.getVersion();
    const myFuns = {
        "addScreenDebugRow": addScreenDebugRow,
        "getDisplayMode": getDisplayMode,
        "mkElt": mkElt,
        "promptForUpdate": promptForUpdate,
    }
    if (!modNotCached.setPWAfuns) {
        const dlgErr = startDlgErr("Can't find setPWAfuns");
        dlgErr.appendChild(mkElt("p", undefined,
            `pwa-not-cached.js must export a function with this name.
            It will be called with an object of named utility functions from pwa.js.
            `
        ));
        finishAndShowDlgErr(dlgErr, false);
    } else {
        modNotCached.setPWAfuns(myFuns);
    }
    // logConsole("loadNotCached", { modNotCached });
    addScreenDebugRow("loadNotCached");
}

export function tellMeVersionAgain() {
    const storedVersion = getSavedAppVersion() || "No ver";
    const theEltVersion = theFunVersion(storedVersion);
    addVersionDialog(theEltVersion);
}
function addVersionDialog(theEltVersion) {
    if (!theEltVersion) return;
    if (theEltVersion.classList.contains("PWA-version-dialog")) return;
    theEltVersion.classList.add("PWA-version-dialog");
    theEltVersion.title = "Show versions details";
    theEltVersion.addEventListener("click", evt => {
        evt.stopPropagation();
        const aPwsJs = mkElt("a", { href: import.meta.url, target: "_blank" }, "pwa.js");

        const dlg = mkElt("dialog", { id: "pwa-dialog-versions" }, [
            mkElt("h2", undefined, "PWA info and debug"),
            mkElt("p", undefined, [
                mkElt("i", undefined, [
                    "This info is for developer debugging.",
                    " How to set up this is described in the beginning of the file ",
                ]),
                aPwsJs,
            ]),
        ]);
        dlg.appendChild(mkElt("div", undefined, `App version: ${getSavedAppVersion()}`));

        dlg.appendChild(mkElt("div", undefined, "Service Worker:"));
        const appendIndentedRow = (txt) => {
            const row = mkElt("div", undefined, txt);
            row.style.marginLeft = "10px";
            dlg.appendChild(row);
        }
        const swController = navigator.serviceWorker.controller;
        if (swController == null) {
            appendIndentedRow("null");
        } else {
            const u = swController.scriptURL;
            const aSW = mkElt("a", { href: u, target: "_blank" }, u);
            appendIndentedRow(mkElt("div", undefined, [
                "scriptURL: ",
                aSW
            ]));
            appendIndentedRow(mkElt("div", undefined, [
                "state: ",
                swController.state
            ]));
        }

        for (const k in versions) {
            const v = versions[k];
            dlg.appendChild(mkElt("div", undefined, `${k}: ${v}`));
        }

        const chkLogToScreen = mkElt("input", { type: "checkbox" });
        chkLogToScreen.checked = mayLogToScreen;
        chkLogToScreen.addEventListener("input", evt => {
            mayLogToScreen = !mayLogToScreen;
            if (mayLogToScreen) {
                localStorage.setItem(keyLogToScreen, "may log to screen");
            } else {
                localStorage.removeItem(keyLogToScreen);
            }
            if (secDebug) {
                if (mayLogToScreen) {
                    secDebug.style.display = "unset";
                } else {
                    secDebug.style.display = "none";
                }
            }
        });
        dlg.appendChild(
            mkElt("p", undefined, [
                mkElt("span", undefined, [
                    mkElt("b", undefined, "Log to screen at start: "),
                    chkLogToScreen
                ])
            ]));


        const btnClose = mkElt("button", undefined, "Close");
        const divClose = mkElt("p", undefined, btnClose);
        dlg.appendChild(divClose);
        document.body.appendChild(dlg);
        btnClose.addEventListener("click", evt => {
            dlg.close();
            dlg.remove();
        });
        showDialogModal(dlg);
        setTimeout(() => btnClose.focus(), 100);
    });

}

export function setVersionSWfun(funVersion) {
    if (theFunVersion && theFunVersion !== theFunVersionDefault) {
        if (theFunVersion === funVersion) {
            throw Error("setVersionSWfun called 2 times with same argument");
        }
        throw Error("setVersionSWfun called 2 times with different argument");
    }
    theFunVersion = funVersion;
    const storedVersion = getSavedAppVersion() || "No ver";
    theEltVersion = theFunVersion(storedVersion);
    addVersionDialog(theEltVersion);
    function onGotVersion(version) {
        saveAppVersion(version);
        if (theFunVersion) { theFunVersion(version); }
    }
    const messageChannelVersion = new MessageChannel();
    messageChannelVersion.port1.onmessage = (event) => { onGotVersion(event.data); };
    const swController = navigator.serviceWorker.controller;
    swController?.postMessage({ type: "GET_VERSION" }, [messageChannelVersion.port2]);
}



// Delay startSW so we can override defaults:
setTimeout(startSW, 500);

async function startSW() {
    await waitUntilNotCachedLoaded.promReady();
    if (!modNotCached) return;
    if (typeof modNotCached.startSW != "function") {
        const dlgErr = startDlgErr("Can't find startSW");
        const aGithub = mkElt("a", { href: "https://github.com/lborgman/hour" },
            "https://github.com/lborgman/hour");
        dlgErr.appendChild(mkElt("p", undefined, [
            `pwa-not-cached.js must export a function with this name.
            For more info about this function see the example at
            `,
            aGithub
        ]));
        finishAndShowDlgErr(dlgErr, false);
        return;
    }
    try {
        await modNotCached.startSW(theSWurl);
    } catch (err) {
        console.log({ err });
        const dlgErr = startDlgErr("Can't start service worker", err);
        finishAndShowDlgErr(dlgErr, true);
    }
}



// https://dev.to/somedood/promises-and-events-some-pitfalls-and-workarounds-elp
function simpleBlockUntilEvent(targ, evtName) {
    return new Promise(resolve => targ.addEventListener(evtName, resolve, { passive: true, once: true }));
}

function addCSS() {
    const idCSS = "css-pwa.js";
    const eltOld = document.getElementById(idCSS);
    if (eltOld) {
        return;
    }
    const eltCSS = document.createElement("style");
    eltCSS.id = idCSS;
    eltCSS.textContent =
        `
        dialog {
            max-width: 300px;
            border-radius: 4px;
            font-size: 16px;
            padding: 20px;
            box-shadow: black 8px 8px 8px;
        }

        dialog::backdrop {
            background-color: black;
            opacity: 0.5;
        }

        dialog a {
            color: darkblue;
        }

        dialog button {
            font-size: 1rem;
        }

        dialog>h2 {
            font-size: 20px;
            font-style: italic;
        }



        dialog#pwa-dialog-versions {
            background: wheat;
            background: linear-gradient(240deg, #00819c 0%, #545b98 100%);
            color: black;
        }



        dialog#pwa-dialog-update {
            background: linear-gradient(200deg, #4b6cb7 0%, #182848 100%);
            background: linear-gradient(240deg, #00819c 0%, #3a47d5 100%);
            background: linear-gradient(240deg, #00819c 0%, #2b35a3 100%);
            font-size: 18px;
            color: white;
            border: 2px solid white;
            opacity: 1;
            transition: opacity ${secDlgUpdateTransition}s;
        }

        dialog#pwa-dialog-update>p:last-child {
            display: flex;
            gap: 10px;
        }

        dialog#pwa-dialog-update::backdrop {
            /* not inherited by default */
            transition: inherit;
        }

        dialog#pwa-dialog-update.transparent {
            opacity: 0;
        }

        dialog#pwa-dialog-update.transparent::backdrop {
            opacity: 0;
        }

        dialog#pwa-dialog-update.updating {
            box-shadow: 3px 5px 5px 12px rgba(255,255,127,0.75);
        }


        dialog#dialog-err-pwa {
            background-color: darkred;
            color: yellow;
            max-width: 90vw;
        }
        dialog#dialog-err-pwa a {
            display: block;
            color: lightskyblue;
            padding: 10px;
            margin-top: 5px;
        }



        #pwa-debug-output {
            position: fixed;
            top: 0;
            left: 0;
            font-size: 14px;
            background-color: wheat;
            color: black;
            padding: 8px;
            box-shadow: aquamarine 8px 8px 8px;
        }

        #pwa-debug-output>p {
            margin-block-start: 0.5em;
            margin-block-end: 0.5em;
        }


        .PWA-version-dialog {
            cursor: pointer;
        }
        .PWA-version-dialog:hover {
            color: darkred;
        }
    `;
    const style1 = document.querySelector("style");
    document.head.insertBefore(eltCSS, style1);
}




function mkElt(type, attrib, inner) {
    const elt = document.createElement(type);

    function addInner(inr) {
        if (inr instanceof Element) {
            elt.appendChild(inr);
        } else {
            const txt = document.createTextNode(inr.toString());
            elt.appendChild(txt);
        }
    }
    if (inner) {
        if (inner.length && typeof inner != "string") {
            for (let i = 0; i < inner.length; i++)
                if (inner[i])
                    addInner(inner[i]);
        } else
            addInner(inner);
    }
    for (const x in attrib) {
        elt.setAttribute(x, attrib[x]);
    }
    return elt;
}

async function promptForUpdate(waitingVersion) {
    const btnSkip = mkElt("button", undefined, "Skip");
    const btnUpdate = mkElt("button", undefined, "Update");
    const divPromptButtons = mkElt("p", undefined, [btnUpdate, btnSkip]);
    const dlgPromptUpdate = mkElt("dialog", { id: "pwa-dialog-update", class: "pwa2-dialog" }, [
        mkElt("h2", undefined, theUpdateTitle),
        mkElt("p", undefined, [
            "Update available:",
            mkElt("div", undefined, `version ${waitingVersion}`)
        ]),
        divPromptButtons
    ]);
    document.body.appendChild(dlgPromptUpdate);
    dlgPromptUpdate.showModal();

    return new Promise((resolve, reject) => {
        btnSkip.addEventListener("click", evt => {
            resolve(false);
            dlgPromptUpdate.classList.add("transparent");
            setTimeout(() => { dlgPromptUpdate.remove(); }, msDlgUpdateTransition);
        });
        btnUpdate.addEventListener("click", evt => {
            dlgPromptUpdate.textContent = "Updating, please wait ...";
            dlgPromptUpdate.classList.add("updating");
            window.onbeforeunload = null;
            resolve(true);
            theFunVersion("Updating");
            setTimeout(() => {
                dlgPromptUpdate.classList.add("transparent");
            }, msPleaseWaitUpdating);
        });
    });
}


function getRandomString() { return Math.random().toString(36).substring(2, 15) }

// https://dev.to/maxmonteil/is-your-app-online-here-s-how-to-reliably-know-in-just-10-lines-of-js-guide-3in7
// Saving this, looks useful...
export async function PWAonline() {
    if (!window.navigator.onLine) return false

    // avoid CORS errors with a request to your own origin
    const url = new URL(window.location.origin)

    // random value to prevent cached responses
    url.searchParams.set('PWAonlineRand', getRandomString())
    let urlHref = url.href;
    // console.trace("PWAonline: try to fetch", urlHref);

    try {
        const response = await fetch(urlHref, { method: 'HEAD' },)
        console.log(`PWAonline is online, (any response is actually ok here) response.ok: ${response.ok}`)
        return true;
    } catch {
        console.log("PWAonline not online: didn't get response");
        return false
    }
}

export function getDisplayMode() {
    let displayMode = 'browser';
    const mqStandAlone = '(display-mode: standalone)';
    if (navigator.standalone || window.matchMedia(mqStandAlone).matches) {
        displayMode = 'standalone';
    }
    return displayMode;
}


// Close when click on scrim
export function showDialogModal(dlg) {
    const tn = dlg.tagName;
    if (tn != "DIALOG") {
        throw Error(`Expeced DIALOG, got ${tn}`);
    }
    function isInside(bcr, cX, cY) {
        if (cX < bcr.left) return false;
        if (cX > bcr.right) return false;
        if (cY < bcr.top) return false;
        if (cY > bcr.bottom) return false;
        return true;
    }
    dlg.addEventListener("click", evt => {
        const bcr = dlg.getBoundingClientRect();
        const cX = evt.clientX;
        const cY = evt.clientY;
        const inside = isInside(bcr, cX, cY);
        // console.log("click", { inside, cX, cY, bcr });
        if (!inside) { dlg.close(); }
    });
    dlg.showModal();
}



function startDlgErr(title, err) {
    const dlgErr = document.createElement("dialog");
    dlgErr.id = "dialog-err-pwa";
    dlgErr.appendChild(mkElt("h2", undefined, title));
    if (err) {
        const errCls = err.constructor.name;
        const errMsg = err.message;
        dlgErr.appendChild(
            mkElt("p", undefined, [
                mkElt("i", undefined, mkElt("b", undefined, `${errCls}: `)),
                mkElt("span", undefined, errMsg),
            ]));
    }
    return dlgErr;
}
function finishAndShowDlgErr(dlgErr, moreInConsole) {
    if (moreInConsole) {
        dlgErr.appendChild(mkElt("div", undefined, "----"));
        dlgErr.appendChild(mkElt("div", undefined, "(More info in console)"));
    }

    const btnClose = document.createElement("button");
    btnClose.textContent = "Close";
    btnClose.addEventListener("click", evt => { dlgErr.remove(); })
    const pClose = document.createElement("p");
    pClose.appendChild(btnClose);
    dlgErr.appendChild(pClose);

    document.body.appendChild(dlgErr);
    showDialogModal(dlgErr);
}

/*
// Add a global error handler
window.addEventListener("error", evt => {
    // console.error("unhandled error:", evt.error, evt);
    const dlgErr = startDlgErr("Unhandled error", evt.error);
    finishAndShowDlgErr(dlgErr, true);
});
*/