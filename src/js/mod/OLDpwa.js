/* eslint no-debugger: 0 */
console.log("here is module pwa.js");

if (document.currentScript) throw Error("import .currentScript"); // is module
if (!import.meta.url) throw Error("!import.meta.url"); // is module

const idDebugSection = "debug-section";
let swVersion;
let instWorkbox;
let canUpdateNow = false;
getWorkbox();
addDebugSWinfo();
checkPWA();
setupForInstall();
setupServiceWorker();

const styleInstallEvents = "background:red; color:blue";

function addDebugRow(txt) {
    console.log("checkPWA DEBUG: ", txt);
    const secDebug = document.getElementById(idDebugSection);
    if (!secDebug) return;
    const pRow = mkElt("p", undefined, inner);
    secDebug.appendChild(pRow);
}
function addDebugLocation(loc) {
    const inner = mkElt("a", { href: loc }, loc);
    addDebugRow(inner);
}

async function addDebugSWinfo() {
    const regs = await navigator.serviceWorker.getRegistrations();
    addDebugRow(`Registered service workers: ${regs.length}`);
    const loc = location.href;
    addDebugLocation(loc);
    const u = new URL(loc);
    u.pathname = "manifest.json";
    addDebugLocation(u.href);
    addDebugRow(`navigator.userAgentData.platform: ${navigator.userAgentData?.platform}`);
}

async function checkPWA() {
    console.log("checkPWA");
    // https://web.dev/learn/pwa/detection/
    window.addEventListener('DOMContentLoaded', () => {
        let displayMode = 'browser tab';
        const modes = ["fullscreen", "standalone", "minimal-ui", "browser"];
        modes.forEach(m => {
            if (window.matchMedia(`(display-mode: ${m})`).matches) {
                displayMode = m;
                addDebugRow(`matched media: ${displayMode}`)
            }
        });
        addDebugRow(`DISPLAY_MODE_LAUNCH: ${displayMode}`);
    });
    // https://web.dev/get-installed-related-apps/
    const relatedApps = navigator.getInstalledRelatedApps ? await navigator.getInstalledRelatedApps() : [];
    // console.log(`Related apps (${relatedApps.length}):`);
    addDebugRow(`Related apps (${relatedApps.length}):`);
    relatedApps.forEach((app) => {
        console.log(app.id, app.platform, app.url);
        addDebugRow(`${app.id}, ${app.platform}, ${app.url}`);
    });
}

async function setupServiceWorker() {
    console.log("setupServiceWorkder");
    // const swRegistration = await navigator.serviceWorker.register('/service-worker.js'); //notice the file name
    const wb = await getWorkbox();

    wb.addEventListener("message", errorHandlerAsyncEvent(async evt => {
        console.log("%cwb got message", "font-size: 18px; color: red", { evt });
        // snackbar, broadcastToClients, keepAliveCounter, messageSW
        const msgType = evt.data.type;
        switch (msgType) {
            case "keepAliveCounter":
                const counterValue = evt.data.counterValue;
                console.log({ counterValue });
                const idKA = "keepalive-counter";
                let eltKA = document.getElementById(idKA);
                if (!eltKA) {
                    const s = [
                        "display: inline-block",
                        "background: greenyellow",
                        "height: 1.5rem",
                        "min-width: 5rem",
                        "position: fixed",
                        "right: 5px",
                        "bottom: 5px",
                        "padding: 0.2rem",
                        "font-size: 1rem",
                        "border: 1px solid green"
                    ];
                    const style = s.join(";");
                    eltKA = mkElt("span", { style }, "eltKA");
                    eltKA.id = idKA;
                    document.body.appendChild(eltKA);
                    eltKA.addEventListener("click", evt => {
                        wb.messageSW({ type: "TEST_TIMER", seconds: 0 });
                        console.log("removing soon");
                        eltKA.style.backgroundColor = "red";
                        setTimeout(() => {
                            console.log("removing");
                            eltKA.remove();
                        }, 4000);
                    });
                }
                eltKA.textContent = `${evt.data.counterValue} (${evt.data.total})`;
                break;
            default:
                const modMdc = await import("util-mdc");
                modMdc.mkMDCsnackbar(evt.data.text, 10 * 1000);
        }
    }));

    const showSkipWaitingPrompt = async (event) => {
        // Assuming the user accepted the update, set up a listener
        // that will reload the page as soon as the previously waiting
        // service worker has taken control.
        wb.addEventListener('controlling', () => {
            // At this point, reloading will ensure that the current
            // tab is loaded under the control of the new service worker.
            // Depending on your web app, you may want to auto-save or
            // persist transient state before triggering the reload.
            console.warn("event controlling, doing reload");
            // debugger;
            window.location.reload();
        });

        // When `event.wasWaitingBeforeRegister` is true, a previously
        // updated service worker is still waiting.
        // You may want to customize the UI prompt accordingly.

        // This code assumes your app has a promptForUpdate() method,
        // which returns true if the user wants to update.
        // Implementing this is app-specific; some examples are:
        // https://open-ui.org/components/alert.research or
        // https://open-ui.org/components/toast.research

        canUpdateNow = true;

        const updateAccepted = await promptForUpdate();

        if (updateAccepted) {
            wb.messageSkipWaiting();
        }
    };

    // Add an event listener to detect when the registered
    // service worker has installed but is waiting to activate.
    wb.addEventListener('waiting', (event) => {
        console.warn("event waiting");
        showSkipWaitingPrompt(event);
    });

    wb.addEventListener('activated', async (event) => {
        console.warn("event activated");
        const regSW = await navigator.serviceWorker.getRegistration();
        const swLoc = regSW.active.scriptURL;
        console.log("%cservice worker activated, adding error event listener", "color yellow; font-size: 24px", { regSW });
        regSW.active.addEventListener("error", evt => {
            console.log("%cservice worker activated, error event", "color yellow; font-size: 24px");
        });
        addDebugLocation(swLoc);
    });

    // FIXME: is this supported???
    wb.addEventListener('error', (event) => {
        console.log("%cError from sw", "color:orange; background:black", { error });
    });
    // console.log("%c before getSW sw", "color:red; background:black", { wb });
    wb.getSW().then(sw => {
        // console.log("%cgetSW then", "color:orange; background:black", { sw });
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
        // const swRegistration = await navigator.serviceWorker.register('/sw-workbox.js'); //notice the file name
        const swRegistration = await wb.register(); //notice the file name
        // https://web.dev/two-way-communication-guide/

        // Can't use wb.messageSW because this goes to the latest registered version, not the active
        // const swVersion = await wb.messageSW({ type: 'GET_VERSION' });
        //
        // But we must check for .controller beeing null
        // (this happens during "hard reload" and when Lighthouse tests).
        // https://www.youtube.com/watch?v=1d3KgacJv1I
        if (navigator.serviceWorker.controller !== null) {
            const messageChannel = new MessageChannel();
            messageChannel.port1.onmessage = (event) => {
                // console.warn("port1.onmessage", event.data);
                saveVersion(event.data);
            };
            navigator.serviceWorker.controller.postMessage({ type: "GET_VERSION" }, [messageChannel.port2]);
        } else {
            addDebugRow(`Service Worker version: controller is null`);
        }

        return swRegistration;
    } catch (err) {
        console.warn("Service worker registration failed", { err });
        throw err;
    }
}

function saveVersion(ver) {
    swVersion = ver;
    // console.log('Service Worker version:', swVersion);
    addDebugRow(`Service Worker version: ${swVersion}`);
    console.warn(`%cService Worker version: ${swVersion}`, "font-size:18px;");
    theSWcacheVersion = swVersion;
}

export function getDisplayMode() {
    let displayMode = 'browser';
    const mqStandAlone = '(display-mode: standalone)';
    if (navigator.standalone || window.matchMedia(mqStandAlone).matches) {
        displayMode = 'standalone';
    }
    return displayMode;
}

async function setupForInstall() {
    console.log("setupForInstall");
    const modMdc = await import("util-mdc");
    // https://web.dev/customize-install/#criteria
    // Initialize deferredPrompt for use later to show browser install prompt.
    let deferredPrompt;

    window.addEventListener('beforeinstallprompt', (evt) => {
        console.warn(`**** beforeinstallprompt' event was fired.`);
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
        // Hide the app-provided install promotion
        hideInstallPromotion();
        // Clear the deferredPrompt so it can be garbage collected
        deferredPrompt = null;
        // Optionally, send analytics event to indicate successful install
        console.log('PWA was installed');
    });

    const divInstallPromotion = mkElt("dialog", { id: "div-please-install" }, [
        mkElt("h2", undefined, "Please install this app"),
        mkElt("p", undefined, [
            `This will add an icon to your home screen (or desktop).
            If relevant it also make it possible to share from other apps to this app.`,
        ]),
        // mkElt("p", undefined, ["navigator.platform: ", navigator.platform]),
        mkElt("p", undefined, ["navigator.userAgentData.platform: ", navigator.userAgentData?.platform]),
    ]);
    divInstallPromotion.style.display = "none";
    // const btnInstall = mkElt("button", undefined, "Install");
    const btnInstall = modMdc.mkMDCbutton("Install", "raised");
    btnInstall.addEventListener("click", async (evt) => {
        // debugger;
        // divInstallPromotion.style.display = "none";
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        // Optionally, send analytics event with outcome of user choice
        console.log(`User response to the install prompt: ${outcome}`);
        // We've used the prompt, and can't use it again, throw it away
        deferredPrompt = null;
    });

    const btnLater = modMdc.mkMDCbutton("Later", "outlined");
    btnLater.addEventListener("click", (evt) => {
        console.log("%c*** divInstallPromotion btnLater event .remove", styleInstallEvents);
        divInstallPromotion.remove();
    });

    divInstallPromotion.appendChild(btnInstall);
    divInstallPromotion.appendChild(btnLater);
    function showInstallPromotion() {
        console.log("%cshowInstallPromotion", styleInstallEvents);
        divInstallPromotion.style.display = "block";
    }
    function hideInstallPromotion() {
        console.log("%chideInstallPromotion", styleInstallEvents);
        divInstallPromotion.style.display = "none";
    }
    async function createEltInstallPromotion() {
        console.log("%c**** createEltInstallPromotion START", styleInstallEvents);
        await promiseDOMready();
        document.body.appendChild(divInstallPromotion);
        divInstallPromotion.style.display = null;
        console.log("%c**** createEltInstallPromotion END, display = null", styleInstallEvents);
        showInstallPromotion();
    }

}

let isPromptingForUpdate = false;

let dlgPrompt;
async function promptForUpdate() {
    const modMdc = await import("util-mdc");
    console.log("promptForUpdate 1");
    function hidePrompt() {
        // divPrompt.parentElement.removeChild(divPrompt);
        dlgPrompt.remove();
    }
    const btnSkip = modMdc.mkMDCbutton("Skip", "raised");
    const btnUpdate = modMdc.mkMDCbutton("Update", "raised");

    console.log("promptForUpdate 2");
    const wb = await getWorkbox();
    console.log("promptForUpdate 3");
    const waitingVersion = await wb.messageSW({ type: 'GET_VERSION' });
    console.log("promptForUpdate 4");
    const divErrLine = mkElt("div");
    dlgPrompt = mkElt("dialog", { id: "prompt4update", class: "mdc-card", open }, [
        mkElt("div", undefined, `Update available: ver ${waitingVersion}`),
        divErrLine,
        mkElt("div", undefined, [btnSkip, btnUpdate])
    ])
    console.log("promptForUpdate 5");
    document.body.appendChild(dlgPrompt);
    console.log("promptForUpdate 6");

    console.log("promptForUpdate 7");

    return new Promise((resolve, reject) => {
        const evtUA = new CustomEvent("pwa-update-available");
        window.dispatchEvent(evtUA);
        isPromptingForUpdate = true;

        btnSkip.addEventListener("click", evt => {
            console.log("promptForUpdate 8");
            hidePrompt();
            resolve(false);
        });
        btnUpdate.addEventListener("click", evt => {
            console.log("promptForUpdate 9");
            // hidePrompt();
            // document.body.textContent = "Updating...";
            dlgPrompt.textContent = "Updating, please wait ...";
            dlgPrompt.style.boxShadow = "3px 5px 5px 12px rgba(255,50,0,0.75)";
            window.onbeforeunload = null;
            setTimeout(() => {
                console.log("promptForUpdate 10, resolve");
                resolve(true);
            }, 500);
        });
    });
}

export async function getWorkbox() {
    if (!instWorkbox) {
        const modWb = await import("https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-window.prod.mjs");
        instWorkbox = new modWb.Workbox("/sw-workbox.js");
    }
    if (instWorkbox) return instWorkbox
}

export async function getSWversion() { return swVersion; }

/*
export async function onUpdateAvailable(fun) {
    const wb = await getWorkbox()
    wb.addEventListener('waiting', evt => {
        console.warn("update available, calling fun", fun);
        fun();
    });
}
*/
export async function updateNow() {
    console.log("pwa.updateNow, calling wb.messageSkipWaiting() 1");
    const wb = await getWorkbox();
    console.log("pwa.updateNow, calling wb.messageSkipWaiting() 2");
    wb.messageSkipWaiting();
}

export function hasUpdate() {
    // This does not work in error.js
    // No idea why. Changing to isShowingUpdatePrompt in error.js
    console.error("hasUpdate is obsolete");
    return canUpdateNow;
}
export function isShowingUpdatePrompt() {
    // return isPromptingForUpdate = true;
    return !!dlgPrompt?.closest(":root");
}

// https://web.dev/customize-install/#detect-launch-type
// https://web.dev/manifest-updates/