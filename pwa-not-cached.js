// See pwa.js for documentation

const version = "1.1.4";
export function getVersion() { return version; }

const doSwReset = false;
let pwaFuns;

const logStyle = "background:yellowgreen; color:black; padding:2px; border-radius:2px;";
const logStrongStyle = logStyle + " font-size:18px;";
const styleInstallEvents = logStrongStyle + "color:red;";
function logConsole(...msg) {
    // console.log(`%cpwa-nc.js`, logStyle, ...msg);
}
function logStrongConsole(...msg) {
    console.log(`%cpwa-nc.js`, logStrongStyle, ...msg);
    addScreenDebugRow(...msg);
}
function warnConsole(...msg) { console.warn(`%cpwa-nc.js`, logStyle, ...msg); }
function logInstallEvent(...msg) { console.log("%cpwa-nc", styleInstallEvents, ...msg); }


logStrongConsole(`here is module pwa-not-cached.js, ${version}, ${import.meta.url}`);



const secPleaseWaitUpdating = 3;
const msPleaseWaitUpdating = secPleaseWaitUpdating * 1000;
export function getSecPleaseWaitUpdating() { return secPleaseWaitUpdating; }



let instWorkbox;
let ourUrlSW;


const urlModule = new URL(import.meta.url);
const params = [...urlModule.searchParams.keys()];
if (params.length != 1 || params[0] != "nocache") { throw Error(`There should be only one parameter, "nocache"`); }

if (document.currentScript) throw Error("import .currentScript"); // is module
if (!import.meta.url) throw Error("!import.meta.url"); // is module



export async function startSW(urlSW) {
    if (doSwReset) {
        await (async function () {
            logStrongConsole("in async doSwReset, please remove");
            if (navigator.serviceWorker.controller !== null) { }
            const regSW = await navigator.serviceWorker.getRegistrations();
            console.log({ regSW });
            regSW.forEach(reg => {
                reg.unregister();
            });
            const regSW2 = await navigator.serviceWorker.getRegistrations();
            console.log({ regSW2 });
            navigator.serviceWorker.register("./sw-reset.js");
        })();
        return;
    }
    ourUrlSW = urlSW;
    logStrongConsole("startSW", ourUrlSW);
    await addDebugSWinfo();
    await checkPWA();
    setupForInstall();
    await setupServiceWorker();
}

function addDebugLocation(loc) {
    const inner = mkElt("a", { href: loc }, loc);
    addScreenDebugRow(inner);
}



async function addDebugSWinfo() {

    // await checkRegistration();
    async function checkRegistration() {
        // I can't find any really good and simple documentation for this.
        // (I avoid specs...)
        // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorker/state
        const regs = await navigator.serviceWorker.getRegistrations();
        addScreenDebugRow(`Registered service workers: ${regs.length}`);
        regs.forEach(reg => {
            const isController = reg.active === navigator.serviceWorker.controller;
            const regActive = reg["active"];
            console.log({ regActive });
            console.log({ isController });

            const eltC = isController ? mkElt("b", undefined, " controller") : "";

            let stateOfReg;
            const statesOfReg = [
                "active",

                "parsed",
                "installing",
                "installed",
                "activating",
                "activated",
                "redundant",
            ];
            statesOfReg.forEach(s => {
                const r = reg[s];
                if (r !== undefined) {
                    if (stateOfReg) console.error(`Already state ${stateOfReg}`);
                    stateOfReg = s;
                    console.log(s, r);
                    if (r) {
                        const state = r.state;
                        const url = r.scriptURL;
                        console.log(r, state, url);
                    }
                }
            });

            const eltA = mkElt("a", { href: urlModule, target: "_blank" }, urlModule);
            eltA.style.marginLeft = "10px";
            const eltRow = mkElt("span", undefined, [
                stateOfReg, eltC,
                mkElt("div", undefined, eltA)
            ]);
            addScreenDebugRow(eltRow);
        });
    }

    const loc = location.href;
    addDebugLocation(loc);
    const u = new URL(loc);
    u.pathname = "manifest.json";
    addDebugLocation(u.href);
    logStrongConsole(`navigator.userAgentData.platform: ${navigator.userAgentData?.platform}`);
}

async function checkPWA() {
    // https://web.dev/learn/pwa/detection/
    window.addEventListener('DOMContentLoaded', () => {
        let displayMode = 'browser tab';
        const modes = ["fullscreen", "standalone", "minimal-ui", "browser"];
        modes.forEach(m => {
            if (window.matchMedia(`(display-mode: ${m})`).matches) {
                displayMode = m;
                addScreenDebugRow(`matched media: ${displayMode}`)
            }
        });
        addScreenDebugRow(`DISPLAY_MODE_LAUNCH: ${displayMode}`);
    });
    // https://web.dev/get-installed-related-apps/
    const relatedApps = navigator.getInstalledRelatedApps ? await navigator.getInstalledRelatedApps() : [];
    addScreenDebugRow(`Related apps (${relatedApps.length}):`);
    relatedApps.forEach((app) => {
        addScreenDebugRow(`${app.id}, ${app.platform}, ${app.url}`);
    });
}

async function setupServiceWorker() {
    logConsole("setupServiceWorkder");
    const wb = await getWorkbox();

    wb.addEventListener("message",
        async evt => {
            logStrongConsole("got message", { evt });
            const msgType = evt.data.type;
            switch (msgType) {
                default:
                    mkSnackbar(evt.data.text);
            }
        });

    const showSkipWaitingPrompt = async (event) => {
        // Assuming the user accepted the update, set up a listener
        // that will reload the page as soon as the previously waiting
        // service worker has taken control.
        wb.addEventListener('controlling', () => {
            // At this point, reloading will ensure that the current
            // tab is loaded under the control of the new service worker.
            // Depending on your web app, you may want to auto-save or
            // persist transient state before triggering the reload.
            logStrongConsole("event controlling, doing reload");
            window.location.reload();
        });

        // When `event.wasWaitingBeforeRegister` is true, a previously
        // updated service worker is still waiting.
        // You may want to customize the UI prompt accordingly.

        const updateAccepted = await promptForUpdate();

        if (updateAccepted) {
            setTimeout(() => wb.messageSkipWaiting(), msPleaseWaitUpdating);
        }
    };

    // Add an event listener to detect when the registered
    // service worker has installed but is waiting to activate.
    wb.addEventListener('waiting', (event) => {
        logStrongConsole("event waiting");
        showSkipWaitingPrompt(event);
    });

    wb.addEventListener('activated', async (event) => {
        logStrongConsole("activated");
        const regSW = await navigator.serviceWorker.getRegistration();
        const swLoc = regSW.active.scriptURL;
        logStrongConsole("activated, add error event listener", { regSW });
        regSW.active.addEventListener("error", evt => {
            logStrongConsole("activated, error event", evt);
        });
        addDebugLocation(swLoc);
    });


    // FIXME: is this supported???
    wb.addEventListener('error', (event) => {
        console.log("%cError from sw", "color:orange; background:black", { error });
    });


    wb.getSW().then(sw => {
        sw.addEventListener("error", evt => {
            console.log("%cError from getSW sw", "color:red; background:black", { error });
        });
        sw.onerror = (swerror) => {
            console.log("%cError from getSW sw", "color:red; background:black", { swerror });
        }
    }).catch(err => {
        console.log("%cError getSW addEventlistener", "color:red; background: yellow", { err });
    });

    try {
        const swRegistration = await wb.register(); //notice the file name
        // https://web.dev/two-way-communication-guide/

        // Can't use wb.messageSW because this goes to the latest registered version, not the active
        // const swVersion = await wb.messageSW({ type: 'GET_VERSION' });
        //
        // But we must check for .controller beeing null
        // (this happens during "hard reload" and when Lighthouse tests).
        // https://www.youtube.com/watch?v=1d3KgacJv1I
        /*
        if (navigator.serviceWorker.controller !== null) {
            navigator.serviceWorker.controller.postMessage({ type: "TELL_SW_NAME", SW_NAME: ourUrlSW });

            // const messageChannelVersion = new MessageChannel();
            // messageChannelVersion.port1.onmessage = (event) => { saveVersion(event.data); };
            // navigator.serviceWorker.controller.postMessage({ type: "GET_VERSION" }, [messageChannelVersion.port2]);

        } else {
            addScreenDebugRow(`Service Worker version: controller is null`);
        }
        */

        // return swRegistration;
    } catch (err) {
        console.error("Service worker registration failed", { err });
        throw err;
    }
}


function setupForInstall() {
    // FIX-ME: leave this here (instead of moving it to pwa.js)
    //    for now because it does not seem to be stable in Chromium.
    // Maybe have a close look on these?
    // https://love2dev.com/pwa/add-to-homescreen-library/
    // https://web.dev/learn/pwa/detection

    logStrongConsole("setupForInstall");
    const getDisplayMode = pwaFuns["getDisplayMode"];
    logConsole({ getDisplayMode });
    const displayMode = getDisplayMode ? getDisplayMode() : undefined;
    logConsole({ displayMode });
    if (displayMode != "standalone") { logConsole("using default install!"); return; }

    // https://web.dev/customize-install/#criteria
    // Initialize deferredPrompt for use later to show browser install prompt.
    let deferredPrompt;

    window.addEventListener('beforeinstallprompt', (evt) => {
        logStrongConsole(`**** beforeinstallprompt' event was fired.`);
        // Prevent the mini-infobar from appearing on mobile
        evt.preventDefault();
        // Stash the event so it can be triggered later.
        deferredPrompt = evt;

        // Update UI notify the user they can install the PWA
        // This is only nessacary if standalone!
        // Otherwise the builtin browser install prompt can be used.
        if (getDisplayMode() != "browser") { createEltInstallPromotion(); }
    });

    window.addEventListener('appinstalled', () => {
        hideInstallPromotion();
        // Clear the deferredPrompt so it can be garbage collected
        deferredPrompt = null;
        logConsole('PWA was installed');
    });

    const dialogInstallPromotion = mkElt("dialog", { id: "pwa2-dialog-install", class: "pwa2-dialog" }, [
        mkElt("h2", undefined, "Please install this app"),
        mkElt("p", undefined, [
            `This will add an icon to your home screen (or desktop).
            If relevant it also make it possible to share from other apps to this app.`,
        ]),
        mkElt("p", undefined, ["navigator.userAgentData.platform: ", navigator.userAgentData?.platform]),
    ]);
    const btnInstall = mkElt("button", undefined, "Install");
    btnInstall.addEventListener("click", async (evt) => {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        logConsole(`User response to the install prompt: ${outcome}`);
        deferredPrompt = null;
    });

    const btnLater = mkElt("button", undefined, "Later");
    btnLater.addEventListener("click", (evt) => {
        logInstallEvent("dialog .remove");
        dialogInstallPromotion.remove();
    });

    dialogInstallPromotion.appendChild(btnInstall);
    dialogInstallPromotion.appendChild(btnLater);
    function showInstallPromotion() {
        logInstallEvent("showInstallPromotion");
        document.body.appendChild(dialogInstallPromotion);
        dialogInstallPromotion.showModal();
    }
    function hideInstallPromotion() {
        logInstallEvent("hideInstallPromotion");
    }
    async function createEltInstallPromotion() {
        logInstallEvent("createEltInstallPromotion START");
        await promiseDOMready();
        logInstallEvent("createEltInstallPromotion END, display = null");
        showInstallPromotion();
    }

}


function mkSnackbar(msg, color, bgColor, left, bottom, msTime) {
    const snackbar = mkElt("aside");
    snackbar.textContent = msg;
    color = color || "red";
    bgColor = bgColor || "black";
    left = left || 20;
    bottom = bottom || 20;
    snackbar.style = `
            display: flex;
            color: ${color};
            background-color: ${bgColor};
            left: ${left}px;
            bottom: ${bottom}px;
            font-size: 16px;
            padding: 4px;
            border-radius: 4px;
        `;
    document.body.appendChild(snackbar);
    setTimeout(() => snackbar.remove(), msTime);
}


async function getWorkbox() {
    if (!instWorkbox) {
        // https://developer.chrome.com/docs/workbox/using-workbox-window
        const urlWorkboxWindow = "https://storage.googleapis.com/workbox-cdn/releases/6.2.0/workbox-window.prod.mjs";
        const modWb = await import(urlWorkboxWindow);
        instWorkbox = new modWb.Workbox(ourUrlSW);
    }
    return instWorkbox;
}


async function NOupdateNow() {
    logConsole("pwa.updateNow, calling wb.messageSkipWaiting() 1");
    const wb = await getWorkbox();
    logConsole("pwa.updateNow, calling wb.messageSkipWaiting() 2");
    wb.messageSkipWaiting();
}

export function setPWAfuns(objFuns) {
    pwaFuns = objFuns;
    // pwaFuns = {}; // FIX-ME: error handling test
}
function mkElt(type, attrib, inner) { return pwaFuns["mkElt"](type, attrib, inner); }

async function promptForUpdate() {
    logConsole("prompt4update 1");
    const wb = await getWorkbox();
    const waitingVersion = await wb.messageSW({ type: 'GET_VERSION' });
    return pwaFuns["promptForUpdate"](waitingVersion);
}

function addScreenDebugRow(...txt) {
    if (!pwaFuns) return;
    const mark = document.createElement("span");
    mark.textContent = "PWA-NC";
    mark.style = logStyle + "margin-right:5px;";
    return pwaFuns["addScreenDebugRow"](mark, ...txt);
}


// test TypeError
// const eltNone= document.getElementById("NONE"); eltNone.remove();

// test SyntaxError
// function testSyntaxError() { await import("dummy"); }


// https://web.dev/customize-install/#detect-launch-type
// https://web.dev/manifest-updates/