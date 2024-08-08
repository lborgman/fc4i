// @ts-check
const COMMON_VER = "0.1.3";
console.log(`here is common.js ${COMMON_VER}`);
if (document.currentScript) { throw "common.js is not loaded as module"; }

/**
 * 
 * @param {string} modId 
 * @returns {Promise}
 */
const importFc4i = (modId) => {
    return window["importFc4i"](modId);
}

let theExpanderWay = "setTimeout"; // ok
// theExpanderWay = "await"; // ok
// theExpanderWay = "justAdd"; // no expanding

// https://medium.com/@a7ul/beginners-guide-to-web-push-notifications-using-service-workers-cb3474a17679
// I added a function that can be used to register a service worker.

// https://developer.chrome.com/docs/workbox/handling-service-worker-updates/

let FCMtoken;

const themePrimary = ["mdc-theme--primary-bg", "mdc-theme--on-primary"];

async function checkUnusedTags() {
    if (!document.getElementById("page-home")) return;
    const modMdc = await importFc4i("util-mdc");

    // Non-existant tags?
    // const dbFc4i = await getDbFc4i();
    const dbFc4i = await importFc4i("db-fc4i");
    const allTags = await dbFc4i.getDbTagsArr();
    const divReqTags = document.getElementById("div-search-the-tags");
    if (!divReqTags) return;
    const visibleTags = [...divReqTags.querySelectorAll(".tag-in-our-tags")]
    visibleTags.forEach(elt => {
        const tag = elt.textContent?.slice(1);
        console.log({ tag });
        if (!allTags.includes(tag)) {
            console.log("Non-existant", tag);
            elt.remove();
        }
    });

}

let divSelectTags;
async function updateDivSearchTheTags() {
    const oldTags = [...divSelectTags.querySelectorAll("label.tag-in-our-tags")]
        .filter(lbl => {
            const chk = lbl.firstElementChild.checked;
            // console.log({ lbl, chk });
            return chk;
        })
        .map(lbl => lbl.textContent.substr(1));
    // const dbFc4i = await getDbFc4i();
    const dbFc4i = await importFc4i("db-fc4i");
    const arrAllTags = await dbFc4i.getDbTagsArr();
    const arrUnusedTags = await dbFc4i.getUnusedTags();
    divSelectTags.textContent = "";
    if (arrAllTags.length > arrUnusedTags.length) {
        arrAllTags.forEach(tag => {
            if (arrUnusedTags.includes(tag)) return;
            const checked = oldTags.includes(tag);
            const eltTag = mkEltTagSelector(tag, checked);
            divSelectTags.appendChild(eltTag);
        });
    } else {
        divSelectTags.appendChild(mkElt("div", undefined, "(There are currently no tags in use.)"));
    }
    // checkUnusedTags();
    return arrAllTags.length;
}





const divDebug = mkElt("section", { id: "debug-section" });




async function getNotificationPermissions() {
    const start = Date.now();
    const permissionFromPrompt = await Notification.requestPermission();
    const end = Date.now() - start;
    const endLimitMs = 1000;
    const probablyPrompted = end > endLimitMs;
    console.warn({ permissionFromPrompt, notificationPermission: Notification.permission, end, probablyPrompted });


    switch (Notification.permission) {
        case 'granted':
            if (probablyPrompted) {
                // new Notification does not work on Android???
                const regSW = await navigator.serviceWorker.getRegistration();
                if (regSW) {
                    regSW.showNotification("Thanks for allowing notification");
                } else {
                    new Notification("Thanks for allowing notifications");
                }
            }
            return true;
            break;
        case 'denied':
        case 'default':
            if (probablyPrompted) {
                return false;
            } else {
                return Notification.maxActions;
            }
            break;
        default:
            debugger; // eslint-disable-line no-debugger
    }
}
async function checkNotificationPermissions() {
    const modMdc = await importFc4i("util-mdc");
    const grantedNotification = await getNotificationPermissions();

    // console.log({ grantedNotification });
    if (grantedNotification === true) return true;

    const divNotifProbem = mkElt("div", { id: "notifications-not-allowed" });
    divNotifProbem.appendChild(mkElt("h2", undefined, "Notifications must be allowed"));
    const aUnblock = mkElt("a", {
        target: "blank",
        href: "https://www.getbeamer.com/help/how-to-unblock-notification-permissions-on-any-browser"
    }, "How to fix it");
    if (typeof grantedNotification === "number") {
        // https://www.getbeamer.com/help/how-to-unblock-notification-permissions-on-any-browser
        // https://support.google.com/chrome/answer/3220216
        const pBlocked = mkElt("p", undefined, [
            `You have blocked notifications ${grantedNotification} times (or more) and must reset this.`,
            " (", aUnblock, ")"
        ]);
        divNotifProbem.appendChild(pBlocked);
    } else {
        if (Notification.permission === "default") {
            const pReload = mkElt("p", undefined, "Please reload this page and allow notifications.");
            divNotifProbem.appendChild(pReload);
        } else {
            const pBlocked = mkElt("p", undefined, [
                `You have blocked notifications and must reset this.`,
                " (", aUnblock, ")"
            ]);
            divNotifProbem.appendChild(pBlocked);
        }
    }
    // document.body.appendChild(divNotifProbem);
    const dlg = await modMdc.mkMDCdialogAlert(divNotifProbem);
    return false;
}


function addDebugRow(inner) {
    const pRow = mkElt("p", undefined, inner);
    // const divDebug = document.getElementById("debug-section");
    divDebug.appendChild(pRow);
}
function addDebugLocation(loc) {
    const inner = mkElt("a", { href: loc }, loc);
    addDebugRow(inner);
}

let mainMenu;
async function getMenu() {
    const modMdc = await importFc4i("util-mdc");
    if (mainMenu) return mainMenu;
    const menu = await mkMenu();
    if (!mainMenu) {
        mainMenu = menu;
        // document.body.appendChild(mainMenu);
        const eltContainer = document.getElementById("menu-container");
        const useExpander = false;
        if (!useExpander) {
            eltContainer?.appendChild(mainMenu);
        } else {
            mainMenu.classList.add("expander-content");
            const divExpander = mkElt("div", { id: "main-menu-expander", class: "expander" }, mainMenu);
            eltContainer?.appendChild(divExpander);
        }

        const eltToggle = document.getElementById("menu-toggle");
        eltToggle?.addEventListener("click", evt => {
            // eltContainer.classList.toggle("open");
            toggleMenu();
        });

        const iconChecklist = modMdc.mkMDCicon("today");
        iconChecklist.classList.add("icon-check-beside-search");
        // const iconSearch = modMdc.mkMDCicon("search");
        // iconSearch.classList.add("icon-search-beside-check");
        // const spanIcons = mkElt("span", undefined, [iconChecklist, iconSearch,]);

        let eltFocusedBefore;
        // const btnReminders = modMdc.mkMDCbutton(spanIcons);
        const btnReminders = modMdc.mkMDCiconButton(iconChecklist);
        btnReminders.title = "Reminders";

        const eltSearchCheck = document.getElementById("header-search-check");
        eltSearchCheck?.appendChild(btnReminders);
        btnReminders.addEventListener("click", errorHandlerAsyncEvent(async evt => {
            // console.warn("clicked search check");
            await dialog10min1hour(eltFocusedBefore);
        }));
        btnReminders.addEventListener("focus", errorHandlerAsyncEvent(async evt => {
            // console.log("btnSearchCheck focus", evt, evt.relatedTarget);
            eltFocusedBefore = evt.relatedTarget;
        }));

        const eltBackdrop = document.getElementById("menu-backdrop");
        eltBackdrop?.addEventListener("click", evt => {
            // eltContainer.classList.toggle("open");
            toggleMenu();
        });
    }
    return mainMenu;
}
let eltActiveBeforeMenu;
function toggleMenu() {
    const eltContainer = document.getElementById("menu-container");
    if (!eltContainer?.classList.contains("open")) eltActiveBeforeMenu = document.activeElement;
    eltContainer?.classList.toggle("open");
    const eltExpander = eltContainer?.querySelector(".expander");
    eltExpander?.classList.toggle("expanded");
}

function clearMainSection(newPageId) {
    const secMain = document.getElementById("main-section");
    while (secMain?.firstElementChild) { secMain.firstElementChild.remove(); }
    document.body.id = newPageId;
    return secMain;
}
async function justShowKey(key) {
    const secMain = clearMainSection("page-show-key");
    // const dbFc4i = await getDbFc4i();
    const dbFc4i = await importFc4i("db-fc4i");
    // const db = await dbFc4i.getDb();
    // const keyRec = await db.get(idbStoreName, key);
    const keyRec = await dbFc4i.getDbKey(key);
    if (keyRec) {
        const eltH = mkElt("div", undefined, [
            mkElt("p", undefined, [
                `Entry was added ${key.slice(0, 10)}.`,
                " (This is the item linked in the mindmap.)"
            ])
        ]);
        const modFc4iItems = await importFc4i("fc4i-items");
        const eltRem = await modFc4iItems.mkEltInputRemember(keyRec, eltH);
        secMain?.appendChild(eltRem);
    } else {
        secMain?.appendChild(mkElt("h2", undefined, "Not found"));
        const pNotFound = mkElt("p", undefined, `Could not find item with key=${key}`);
        secMain?.appendChild(mkElt("p", undefined, pNotFound));
    }
}
async function showKeyToRemember(key, timerInfo) {
    const secMain = clearMainSection("page-show-key");
    // const dbFc4i = await getDbFc4i();
    const dbFc4i = await importFc4i("db-fc4i");
    const keyRec = await dbFc4i.getDbKey(key);
    console.log({ keyRec });
    const style = [
        "font-size: 1rem",
        "color: wheat",
        "background-color: purple"
    ].join("; ");
    const eltH = mkElt("div", undefined, [
        mkElt("div", {
            // style, class: "mdc-card"
            class: "notification-header mdc-card"
        }, [
            mkElt("p", undefined, [

                "Please try now to rememeber this. ",
                "(Created more than ", `(${timerInfo})`, " ago.)",
            ]),
            mkElt("details", undefined, [
                mkElt("summary", undefined, "Tips for learning"),
                " You can find some tips to help you learn ",
                mkElt("a", {
                    target: "_blank",
                    href: "https://learningcenter.unc.edu/tips-and-tools/enhancing-your-memory/"
                }, "here"),
                ":",
                mkElt("ul", undefined, [
                    mkElt("li", undefined, "Try to understand the information 🤨"),
                    mkElt("li", undefined, "Link it to what you already know (a mindmap 📎?)"),
                    mkElt("li", undefined, "Maybe sleep on it? 🥱"),
                    mkElt("li", undefined, "Test yourself 🤔 (like you are doing now...)"),
                    mkElt("li", undefined, "Repeat (with some time ⏰ between!)"),
                    mkElt("li", undefined, "Write down what you know 📜🖍"),
                    mkElt("li", undefined, "Add tags 🔖"),
                    mkElt("li", undefined, "Use images and mnemonics 🎼🎪🎭"),
                    mkElt("li", undefined, "Keep your body healthy 🐱‍🏍🥦"),
                    mkElt("li", undefined, "Mix the different tips over time ⏰🛠"),
                ]),
            ]),
        ]),
    ]);
    const modFc4iItems = await importFc4i("fc4i-items");
    const eltRem = await modFc4iItems.mkEltInputRemember(keyRec, eltH);
    secMain?.appendChild(eltRem);
}
function mkImageThumb(blob) {
    const eltImg = mkElt("span", { class: "image-bg-cover image-thumb-size" });
    const urlBlob = URL.createObjectURL(blob);
    const urlBg = `url(${urlBlob})`;
    // console.log({ blob, urlBlob });
    eltImg.style.backgroundImage = urlBg;
    return eltImg;
}

async function appendRem(rem, toDiv) {
    const modMdc = await importFc4i("util-mdc");
    const card = modMdc.mkMDCcard();
    card.classList.add("subject-card");

    // https://fonts.google.com/icons
    const btnDeleteWastebasket = modMdc.mkMDCiconButton("delete_forever", "Delete");
    btnDeleteWastebasket.classList.add("mdc-theme--secondary-bg");
    btnDeleteWastebasket.addEventListener("click", errorHandlerAsyncEvent(async evt => {
        deleteEntry(rem.key, card);
    }));

    // const firstImageBlob = null;
    const firstImageBlob = rem.images ? rem.images[0] : null;
    const indStatus = mkStatusIndicator(5, "height");
    // indStatus.mySet(3); // FIX-ME:
    let indVal = rem.confRem;
    // Take care of old values outside of range:
    indVal = Math.max(indVal, 1);
    indVal = Math.min(indVal, 5);
    indStatus.mySet(indVal); // FIX-ME:
    const eltImg = firstImageBlob ? mkImageThumb(firstImageBlob) : "";

    const eltTitle = mkElt("span", { class: "has-title" }, rem.title);
    eltTitle.dataset.keyRecord = rem.key;
    const sumInternal = mkElt("span", { class: "subject-summary-spanx" }, [
        mkElt("div", { class: "for-details-closed subject-summary-span" }, [
            indStatus,
            eltImg,
            eltTitle,
        ]),
        mkElt("div", { class: "for-details-open" }, "Close")
    ]);

    if (firstImageBlob) sumInternal.classList.add("has-image");
    const sum = mkElt("summary", { class: "unsaved-marker" }, [
        sumInternal
    ]);
    const det = mkElt("details", { class: "unsaved-marker-container" }, [sum]);
    det.addEventListener("toggle", async evt => {
        if (det.open) {
            if (det.childElementCount == 1) {
                const modFc4iItems = await importFc4i("fc4i-items");
                const eltRem = await modFc4iItems.mkEltInputRemember(rem);
                det.appendChild(eltRem);
            }
        }
    });
    card.appendChild(det);
    toDiv.appendChild(card);
}
const detsOutput = {}
// let divActiveNewest;
let divActive;
async function displayMatchingReminders(searchFor, minConf, maxConf, requiredTags, cantRefresh) {
    // const dbFc4i = await getDbFc4i();
    const dbFc4i = await importFc4i("db-fc4i");
    // const x = await dbFc4i.getNextShortTimer();
    const modMdc = await importFc4i("util-mdc");
    if (![false, true, undefined].includes(cantRefresh)) {
        console.error(`cantRefresh: ${cantRefresh}`);
        throw Error(`cantRefresh: ${cantRefresh}`);
    }

    if (!divActive) {
        divActive = mkElt("div", { id: "div-active", class: "subjects-list" });
    }
    if (!divActive.isConnected) {
        // divActive.textContent = "";
        const divHome = document.getElementById("div-home");
        divHome?.appendChild(divActive);
    }

    const arrActive = []
    arrActive.length = 0;
    const arrActiveDay = []
    arrActiveDay.length = 0;
    const arrActiveWeek = []
    arrActiveWeek.length = 0;
    const arrOld = []
    arrOld.length = 0;

    // const dbFc4i = await getDbFc4i();
    const allMatchingItems = await dbFc4i.getDbMatching(searchFor, minConf, maxConf, requiredTags);
    const allMatchingKeys = allMatchingItems.map(item => item.key).sort();
    const strAllMatchingKeys = allMatchingKeys.join(";");
    const r = allMatchingKeys.sort();
    if (r.join(";") != strAllMatchingKeys) throw Error("allMatchingkeys was not sorted");

    const divSearchBanner = document.getElementById("div-search-banner");

    setTimeout(() => {
        const eltHome = document.getElementById("h-your-items");
        eltHome?.classList.remove("is-searching")
    }, 100);

    setLastSearch({ searchFor, minConf, maxConf, requiredTags });
    // if (divSearchBanner.oldKeys == strAllMatchingKeys) return;
    if (window.oldKeys == strAllMatchingKeys) return;


    // if (cantRefresh && (divSearchBanner.oldKeys))
    if (cantRefresh && (window.oldKeys)) {
        // FIX-ME: Can't happen now
        throw Error("bad path");
        const btnRefresh = document.getElementById("cant-refresh");
        if (btnRefresh) return;
        const newBtnRefresh = modMdc.mkMDCbutton("Refresh", "raised");
        newBtnRefresh.addEventListener("click", errorHandlerAsyncEvent(async evt => {
            displayMatchingReminders(searchFor, minConf, maxConf, requiredTags);
        }));
        divSearchBanner?.appendChild(mkElt("span", undefined, " Outdated! "));
        divSearchBanner?.appendChild(newBtnRefresh);
        return;
    }

    async function checkSearchNeedsRefresh() {
        // doSearch(true);
        // const last = divSearchBanner.lastSearch;
        const last = getLastSearch();
        // const dbFc4i = await getDbFc4i();
        const dbFc4i = await importFc4i("db-fc4i");
        const allMatchingItems = await dbFc4i.getDbMatching(last.searchFor, last.minConf, last.maxConf, last.requiredTags);
        const allMatchingKeys = allMatchingItems.map(rec => rec.key);
        const strKeys = allMatchingKeys.join(";");
        console.log({ allMatchingKeys });
        // if (divSearchBanner.oldKeys != strKeys)
        if (window.oldKeys != strKeys) {
            // refresh"
            const modMdc = await importFc4i("util-mdc");
            const btnRefresh = document.getElementById("cant-refresh");
            if (btnRefresh) return;
            const newBtnRefresh = modMdc.mkMDCbutton("Refresh", "raised");
            newBtnRefresh.addEventListener("click", errorHandlerAsyncEvent(async evt => {
                displayMatchingReminders(last.searchFor, last.minConf, last.maxConf, last.requiredTags);
            }));
            // divSearchBanner.appendChild(mkElt("span", undefined, " Outdated! "));
            // divSearchBanner.appendChild(newBtnRefresh);
            eltSearchBanner.textContent = "- ";
            eltSearchBanner.appendChild(mkElt("i", undefined, `Search result outdated `));
            eltSearchBanner.appendChild(newBtnRefresh);
        }
    }
    // FIX-ME: doSave
    const restartRefreshSearchTimer = (() => {
        let tmr;
        return () => {
            clearTimeout(tmr);
            tmr = setTimeout(checkSearchNeedsRefresh, 5 * 1000);
        }
    })();

    // const eltSearchBanner = document.getElementById("h3-search-banner")
    // eltSearchBanner.checkSearchNeedsRefresh = restartRefreshSearchTimer;
    // eltSearchBanner.textContent = "- ";
    const numHits = allMatchingItems.length;
    const numTotal = await dbFc4i.countAllReminders();
    // eltSearchBanner.appendChild(mkElt("i", undefined, `Search result (${numHits} of ${numTotal}):`));
    const eltNumHits = document.getElementById("h-your-num-hits");
    if (eltNumHits) eltNumHits.textContent = `${numHits} `;
    const spanNumTotal = mkElt("span", undefined, `${numTotal}`);
    spanNumTotal.style.opacity = 0.3;
    eltNumHits?.appendChild(spanNumTotal);

    // const btnNetwG = modMdc.mkMDCiconButton("hub");
    // eltSearchBanner.appendChild(btnNetwG);

    const fabNetwG = await mkFabNetwG(mkNetwGraphURL);
    fabNetwG.style.marginLeft = "30px";

    // eltSearchBanner.appendChild(fabNetwG);

    // divSearchBanner.style.display = (searchFor == undefined) ? "none" : "block";

    // divSearchBanner.oldKeys = strAllMatchingKeys;
    window.oldKeys = strAllMatchingKeys;


    const msNow = new Date().getTime();
    let nNew = 0;
    const modFc4iItems = await importFc4i("fc4i-items");
    modFc4iItems.keyAndTimesOrder.forEach(label => {
        const rec = modFc4iItems.keyAndTimes[label];
        rec.items.length = 0;
    });

    allMatchingItems.forEach(r => {
        const ts = r.timers;
        dbFc4i.checkTimersOrder(ts);
        const len = ts.length;
        let active = false;
        for (let i = 0; i < len; i++) {
            const timer = ts[i];
            const msWhen = timer.msWhen;
            const msDelay = timer.msDelay;
            active = active || (msWhen > msNow && msDelay > 0);
            // console.log({ timer, msWhen, expired });
        }
        nNew++;
        // FIX-ME: new version
        for (let i = 0, len = modFc4iItems.keyAndTimesOrder.length; i < len; i++) {
            const partName = modFc4iItems.keyAndTimesOrder[i];
            const part = modFc4iItems.keyAndTimes[partName];
            const timeBorder = part.timeBorder;
            if (r.key > timeBorder) {
                part.items.push(r);
                break;
            }
            // FIX-ME: older
        }

        if (active) {
            const rKey = r.key;
            const olderDay = modFc4iItems.isMoreThanADayAgo(rKey);
            // console.log({ olderDay, rKey });
            if (!olderDay) { arrActive.push(r); return; }
            const olderWeek = modFc4iItems.isMoreThanAWeekAgo(rKey);
            if (!olderWeek) { arrActiveDay.push(r); return; }
            arrActiveWeek.push(r);
        } else {
            arrOld.push(r);
        }
    });
    // console.log({ allMatchingItems, allMatchingKeys });
    // console.log({ nNew, keyAndTimes });
    // Cut tail
    let cut = true;
    for (let len = modFc4iItems.keyAndTimesOrder.length, i = len - 1; i >= 0; i--) {
        const label = modFc4iItems.keyAndTimesOrder[i];
        const rec = modFc4iItems.keyAndTimes[label];
        const num = rec.items.length;
        // console.log(label, num);
        if (num > 0) cut = false;
        // cut = false;  // FIX-ME:
        rec.cut = cut;
    }

    modFc4iItems.keyAndTimesOrder.forEach(label => {
        const rec = modFc4iItems.keyAndTimes[label];
        // console.log({ rec });
        const det = insertOlder(rec.items, label, rec.cut);
        // if (det) det.style.outline = "4px dotted red";
    });

    function insertOlder(arrThatOlder, listTitle, cut) {
        let detThatOlder = detsOutput[listTitle];
        if (cut) {
            if (detThatOlder?.isConnected) { detThatOlder.remove(); }
            return;
        }
        let divThatOlder = detThatOlder?.querySelector(".older-rem-container");
        let itemCounter;
        if (!detThatOlder) {
            divThatOlder = mkElt("div", { class: "xmdc-theme--surface older-rem-container expander-content" });
            const divThatOlderExpander = mkElt("div", { class: "expander" }, divThatOlder);
            itemCounter = mkElt("span", { class: "item-counter" });
            detThatOlder = mkElt("details", { class: "older-rem-list" }, [
                // mkElt("summary", { class: "mdc-theme--primary-bg" }, `${listTitle} (${arrThatOlder.length})`),
                mkElt("summary", { class: "mdc-theme--primary-bg" }, [
                    listTitle,
                    " (",
                    itemCounter,
                    ")"
                ]),
                // divThatOlder
                divThatOlderExpander
            ]);
            detsOutput[listTitle] = detThatOlder;
            // divActive.appendChild(detThatOlder);
        } else {
            itemCounter = detThatOlder.querySelector(".item-counter");
        }
        if (!detThatOlder.isConnected) divActive.appendChild(detThatOlder);
        const strKeys = arrThatOlder.map(obj => obj.key).sort().join(";");
        if (divThatOlder.oldKeys == strKeys) return detThatOlder;
        divThatOlder.oldKeys = strKeys;

        itemCounter.textContent = arrThatOlder.length;
        divThatOlder.textContent = "";
        if (arrThatOlder.length == 0) {
            divThatOlder.appendChild(mkElt("div", { class: "text-on-page-home" }, "No matching items here."));
            return detThatOlder;
        }
        arrThatOlder.forEach(rem => { appendRem(rem, divThatOlder); });
        return detThatOlder;
    }
    // insertOlder(arrActive, "Today");
    // insertOlder(arrActiveDay, "Older than one day");
    // insertOlder(arrActiveWeek, "Older than one week");

}

function getHomeSearchValues() {
    const inpSearch2 = document.getElementById("search-input");
    const divSearchSlider2 = document.getElementById("div-search-slider");
    const sliSearchConfidence2 = divSearchSlider2?.firstElementChild;
    const divTagsRequired2 = document.getElementById("div-required-tags");
    return getHomeSearchValuesFromElts(inpSearch2, sliSearchConfidence2, divTagsRequired2);
}
function getHomeSearchValuesFromElts(inpSearch, sliSearchConfidence, divTagsRequired) {
    const strSearch = inpSearch.value;
    const mdcSlider = sliSearchConfidence.myMdc;
    let minRange = mdcSlider?.getValueStart() || 1;
    let maxRange = mdcSlider?.getValue() || 5;
    if (minRange == 1) minRange = 0;
    if (maxRange == 5) maxRange = 7;
    const reqTags = [...divTagsRequired.querySelectorAll(".tag-in-our-tags")]
        .filter(span => {
            const chk = span.firstElementChild;
            const checked = chk.checked;
            // const tag = span.textContent.substr(1);
            return checked;
        })
        .map(span => span.textContent.substr(1));
    return { strSearch, minRange, maxRange, reqTags };
}

async function goHome() {
    const modMdc = await importFc4i("util-mdc");
    const secMain = clearMainSection("page-home");

    // for (let key in detsOutput) delete detsOutput[key];
    // divActiveNewest = undefined;

    // const divActiveNewest = mkElt("div", { class: "rem-list" });
    // const divActive = mkElt("div", { class: "subjects-list" }, divActiveNewest);
    // const divOld = mkElt("div", { class: "subjects-list" });

    // const arrActive = [];
    // const arrActiveDay = [];
    // const arrActiveWeek = [];
    // const arrOld = [];
    // const allRem = [];

    // const detsOutput = {};

    // const eltSearchBanner = mkElt("h3", { id: "h3-search-banner" });
    // const divSearchBanner = mkElt("div", { id: "div-search-banner", class: "text-on-page-home" }, eltSearchBanner);

    // await displayMatchingReminders();





    // const btnSearch = modMdc.mkMDCiconButton("search", "search your items");
    const svgSearch = modMdc.mkMDCsvgIcon("search");
    const btnSearch = modMdc.mkMDCiconButton(svgSearch, "Search your items");
    btnSearch.classList.add("mdc-theme--secondary-bg");

    const inpSearch = modMdc.mkMDCtextFieldInput("search-input", "search");
    const fieldSearch = modMdc.mkMDCtextFieldOutlined("Search", inpSearch);
    fieldSearch.id = "field-search";
    inpSearch.addEventListener("input", evt => {
        restartSearch();
    });
    function onChangeSearchSlider() {
        restartSearch();
    }
    let sliSearchConfidence;
    const divSearchSlider = mkElt("div", { id: "div-search-slider", class: "mdc-theme--secondary-bg" }, [
        "Match only items with confidence between:",
    ]);

    divSelectTags = mkElt("div", { id: "div-search-the-tags" });
    divSelectTags.addEventListener("change", evt => {
        // console.log({ evt });
        restartSearch();
        updateRequiredTags();
    });

    // const dbFc4i = await getDbFc4i();
    const dbFc4i = await importFc4i("db-fc4i");
    const numItems = await dbFc4i.countAllReminders();
    await updateDivSearchTheTags();
    // await checkUnusedTags();

    const divRequiredTags = mkElt("div", undefined, "(none)");
    divRequiredTags.style.display = "flex";
    divRequiredTags.style.gap = "10px";
    divRequiredTags.style.padding = "10px";

    function updateRequiredTags() {
        const reqTags = [...divSelectTags.querySelectorAll(".tag-in-our-tags")]
            .filter(span => {
                const chk = span.firstElementChild;
                const checked = chk.checked;
                // const tag = span.textContent.substr(1);
                return checked;
            })
            .map(span => span.textContent.substr(1));

        if (reqTags.length == 0) {
            divRequiredTags.textContent = "(none)";
        } else {
            divRequiredTags.textContent = "";
            reqTags.forEach(t => {
                const eltTag = mkElt("span", undefined, t);
                divRequiredTags.appendChild(eltTag);
            });
        }
    }

    const divTagsRequired = mkElt("div", { id: "div-required-tags" }, [
        "Required tags: ",
        divRequiredTags,
        mkElt("details", undefined, [
            mkElt("summary", undefined, "Select tags"),
            divSelectTags
        ])
    ]);

    function doSearch(cantRefresh) {
        if (![true, false].includes(cantRefresh)) {
            console.error(`cantRefresh: ${cantRefresh}`);
            throw Error(`cantRefresh: ${cantRefresh}`);
        }
        const { strSearch, minRange, maxRange, reqTags } =
            getHomeSearchValues();
        // getHomeSearchValuesFromElts(inpSearch, sliSearchConfidence, divTagsRequired);
        // console.log(`doSearch: ${val}, ${minRange}, ${maxRange}, ${reqTags}`);
        displayMatchingReminders(strSearch, minRange, maxRange, reqTags, cantRefresh);
    }
    function restartSearch() {
        const eltHome = document.getElementById("h-your-items");
        eltHome?.classList.add("is-searching")
        restartSearchTimer();
    }
    const restartSearchTimer = (() => {
        let tmr;
        return () => {
            clearTimeout(tmr);
            tmr = setTimeout(() => doSearch(false), 1000);
        }
    })();

    // restartRefreshSearchTimer



    // const homeTitle = mkElt("span", { id: "home-title" }, `Your items (${numItems})`);
    const homeTitle = mkElt("span", { id: "home-title" }, `All items`);
    btnSearch.addEventListener("click", errorHandlerAsyncEvent(async evt => {
        divhHome.classList.toggle("is-search-field");
        if (!divhHome.classList.contains("is-search-field")) {
            displayMatchingReminders();
        } else {
            // div-search-slider
            if (!sliSearchConfidence) {
                sliSearchConfidence = await modMdc.mkMDCslider(1, 5, [1, 5], 1, "Confidence", onChangeSearchSlider, undefined, false);
                divSearchSlider.appendChild(sliSearchConfidence);
                // console.log("adding class search-slider");
                sliSearchConfidence.classList.add("search-slider");
                sliSearchConfidence.classList.add("mdc-my-slider-colors-fix");
                // console.log("adding class search-slider DONE");
            } else {
                // doSearch(false);
            }
            fieldSearch.focus(); // FIX-ME:
            doSearch(false);
        }
    }));
    // is-search-field
    const divShowSearching = mkElt("div", { id: "h-your-show-searching" }, "...");
    const divNumHits = mkElt("div", { id: "h-your-num-hits" });
    divNumHits.style = `
        background: yellow;
        height: 100%;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        align-content: flex-end;
    `;
    const divShowHits = mkElt("div", undefined, [
        divNumHits,
        divShowSearching,
    ]);
    divShowHits.style.height = "100%";
    const hHome = mkElt("div", { id: "h-your-items" }, [
        btnSearch,
        mkElt("div", undefined, [fieldSearch, homeTitle,]),
        divShowHits,
        await mkFabNetwG(mkNetwGraphURL),
    ]);
    const pSearchBroken = mkElt("p", {
        style: "background:green; color:yellow; padding: 10px;",
        class: "mdc-card"
    },
        `Search output is fixed!`
    );
    const divhHome = mkElt("div", { id: "div-h-your-items", class: "mdc-card mdc-theme--secondary-bg" }, [
        hHome, divSearchSlider, divTagsRequired,
        // pSearchBroken
    ]);
    const divHome = mkElt("div", { id: "div-home" }, [
        divhHome,
        // divSearchBanner,
        // FIX-ME
        // divActive,
        // divOld
    ]);
    secMain?.appendChild(divHome);
    await displayMatchingReminders();
}
function showDebug() {
    const secMain = clearMainSection("page-debug");
    secMain?.appendChild(divDebug);
    function checkFontSizes() {
        const pDebug = divDebug.firstElementChild;
        const pDebugFontSize = window.getComputedStyle(pDebug).fontSize;
        const spanTitle = document.getElementById("header-title");
        const titleFontSize = window.getComputedStyle(spanTitle).fontSize;
        addDebugRow(`debug: ${pDebugFontSize}, title: ${titleFontSize}`);
    }
    setTimeout(checkFontSizes, 1000);
}

async function showIntro() {
    const modMdc = await importFc4i("util-mdc");
    const secMain = clearMainSection("page-about");
    secMain?.appendChild(
        mkElt("h1", undefined, [
            `Intro to ${visibleAppTitle} (`,
            mkElt("span", { id: "PWA-version" }),
            ")"
        ])
    );
    setTimeout(async () => { const modPWA = await importFc4i("pwa"); modPWA.tellMeVersionAgain(); }, 0);
    const pAbout = mkElt("p", undefined,
        `
    Are you like me trying to learn from a lot of different things you find on the internet?
    Then this litte web app is made for you and me.
    `);
    const iconShare = modMdc.mkMDCicon("share");
    iconShare.style.fontSize = "1rem";
    // iconShare.style.verticalAlign = "text-bottom";
    iconShare.style.verticalAlign = "middle";
    const imgStyle = [
        "display: inline-block",
        "width: 1.2rem",
        "height: 1.2rem",
        // "vertical-align: text-bottom",
        "vertical-align: middle",
        "background-image: url(/img/192.png)",
    ]
    const style = imgStyle.join("; ");
    const iconThisApp = mkElt("span", { style, class: "image-bg-cover" });
    const pIdea = mkElt("p", undefined, [
        `
        The idea is that you "share" (`,
        iconShare,
        `) from a web page you find interesting to this app ( `,
        iconThisApp,
        ` ). The link is saved in this app.
        And you can use flashcards and your study notes to learn.
        You can also get daily reminders.
        `
    ]);
    const pKeep = mkElt("p", undefined, [
        `
        Please notice that this link and your notes, etc, is only saved on your device.
        If you want more permanent notes I recommend 
        `,
        mkElt("a", {
            href: "https://9to5google.com/2023/01/31/what-you-can-do-google-keep/",
            target: "_blank"
        }, "Google Keep"),
        "."
    ]);
    const stylesFacebook = [
        "background-color: rgb(24, 119, 242)",
        "color: white",
        "padding: 1rem"
    ];
    const urlImgFb = "/img/f_logo_RGB-White_58.png";
    const arrImgFbStyle = [
        "width: 30px",
        "float: left",
        "margin-right: 10px",
    ];
    const imgFbStyle = arrImgFbStyle.join("; ");
    const imgFb = mkElt("img", { src: urlImgFb, style: imgFbStyle });
    const pFacebook = mkElt("p", { class: "mdc-card", style: stylesFacebook.join(";") }, [
        imgFb,
        `I have created a Facebook group, `,
        mkElt("a", {
            href: "https://www.facebook.com/groups/flashcards4internet",
            target: "_blank",
            style: "color: white"
        }, "Flashcards 4 Internet (web app)"),
        `, where you can comment on this app. Suggestions are very welcome!`

    ]);
    const pTips = mkElt("p", undefined, [
        `I am really no expert on learning, but here are some tips:`
    ]);


    const divContent = mkElt("div", undefined, [
        pAbout,
        pIdea,
        pKeep,
        pFacebook,
        pTips,
    ]);
    secMain?.appendChild(divContent);

    // https://www.inc.com/jeff-haden/need-to-learn-faster-neuroscience-says-these-7-memory-retention-skill-acquisition-strategies-work-best.html
    // https://www.hendrix.edu/uploadedFiles/Academics/Faculty_Resources/2016_FFC/Learn%20then%20sleep.pdf

    // https://www.sciencedaily.com/releases/2016/08/160822083446.htm
    const aSleepBetween = mkElt("a", {
        href: "https://www.sciencedaily.com/releases/2016/08/160822083446.htm"
    }, "Sleep makes relearning faster and longer-lasting");
    const aSleepBetweenPdf = mkElt("a", {
        href: "https://www.hendrix.edu/uploadedFiles/Academics/Faculty_Resources/2016_FFC/Learn%20then%20sleep.pdf"
    }, "PDF");
    const divSleepBetween = mkElt("p", undefined, [
        aSleepBetween,
        " (", aSleepBetweenPdf, ")",
    ]);
    // secMain.appendChild(divSleepBetween);

    // https://www.lifehack.org/articles/featured/back-to-basics-reminders.html
    const aLifeHackReminders = mkElt("a", {
        href: "https://www.lifehack.org/articles/featured/back-to-basics-reminders.html"
    }, "The Importance of Reminders (And How to Make a Reminder Work)");
    const divLifeHackReminders = mkElt("p", undefined, [
        aLifeHackReminders,
    ]);
    // secMain.appendChild(divLifeHackReminders);


    // https://www.youtube.com/watch?v=24ecRKfEweU
    const aStuy2hoursAday = mkElt("a", {
        href: "https://www.youtube.com/watch?v=24ecRKfEweU"
    }, "How to Study Only 2 Hours a Day yet STILL Ace your Exams");
    const divStuy2hoursAday = mkElt("p", undefined, [
        aStuy2hoursAday,
    ]);
    // secMain.appendChild(divStuy2hoursAday);

    const ulTips = mkElt("ul", undefined, [
        mkElt("li", undefined, divStuy2hoursAday),
        mkElt("li", undefined, divLifeHackReminders),
        mkElt("li", undefined, divSleepBetween),
    ]);
    secMain?.appendChild(ulTips);

    // The dark side
    const pPWA = mkElt("p", undefined, [
        `This app is actually just a web site with two additions
        (made possible by that it is a PWA):`,
        mkElt("div", { style: "margin-top: 10px;" }, "1) You can view it even if you are not online."),
        mkElt("div", undefined, "2) You can 'share' to it."),
    ]);
    const pSecurity = mkElt("p", undefined, [
        `Because this app is just a web site it is just as secure as a web site.
        It can't harm your mobile or computer (more than a web site can).
        `
    ]);
    const pShare = mkElt("p", undefined, [
        `Unfortunately ´share´ to this app can only work on Android with Google Chrome today.
        It is the only case where the technical capabilities are available now.
        But you can still use this app now on for example both on iPhone and Windows. 
        It is just the possibility to 'share' that does not work there.
        `
    ]);
    const divReminders = mkElt("div", undefined, [
        mkElt("p", undefined, [
            `Unfortunately `,
            mkElt("a", {
                href: "https://github.com/beverloo/notification-triggers/issues/7",
                target: "_blank"
            }, "timers for reminders are not yet supported in PWA:s"),
            "."
        ]),
        mkElt("p", undefined, [
            `So I have added a workaround.
            And actually I think works perhaps even better. 😌
            At the top right there is a button.
            Just click that to check for reminders.`,
        ]),
        mkElt("p", undefined,
            mkElt("img", { src: "/img/btn-check-reminders.png", width: "50%" })),
    ]);
    const divDarkSide = mkElt("div", { id: "div-dark-side", class: "mdc-card" }, [
        mkElt("h2", undefined, "The dark side - Technology"),
        pPWA,
        mkElt("h3", undefined, "Good security"),
        pSecurity,
        mkElt("h3", undefined, "Share currently works only on Android"),
        pShare,
        mkElt("h3", { style: "color:red" }, "Reminders - do they work?"),
        divReminders,
    ]);
    secMain?.appendChild(divDarkSide);

}

async function showAddedNew(sharedParams) {
    const dbFc4i = await importFc4i("db-fc4i");
    const modFc4iItems = await importFc4i("fc4i-items");
    const secMain = clearMainSection("page-added-new");
    const oldRec = sharedParams?.url ? await dbFc4i.getViaUrl(sharedParams.url) : undefined;
    // console.log({ oldRec });
    let eltInpRem;
    if (oldRec) {
        const eltH = mkElt("div", undefined, [
            mkElt("div", { style: "color:darkred; font-style: italic;" }, "Link matched this old entry!"),
        ])
        eltInpRem = await modFc4iItems.mkEltInputRemember(oldRec, eltH);
    } else if (sharedParams) {
        eltInpRem = await modFc4iItems.mkEltInputRemember(sharedParams, mkElt("i", undefined, "Added new from shared link"), true);
    } else {
        eltInpRem = await modFc4iItems.mkEltInputRemember(undefined, mkElt("i", undefined, "Enter the new url to remember"));
    }
    secMain?.appendChild(eltInpRem);
}
async function NOTUSEDNOWtestLogin() {
    const modSignIn = await import("/src/js/mod/sign-in.js");
    console.log({ modSignIn });
    const i = await modSignIn.signIn();
}

/*
async function setupFCM() {
    // This is the setup from the documentation:
    // https://firebase.google.com/docs/cloud-messaging/js/client
    // There is a totally different setup on the GitHub project linked from the doc above???
    // https://github.com/firebase/quickstart-js/blob/master/messaging/index.html

    const modAuth = await import('https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js');
    const modApp = await import('https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js');
    const modMessaging = await import('https://www.gstatic.com/firebasejs/9.17.2/firebase-messaging.js');
    const firebaseConfig = {
        apiKey: "AIzaSyABnDkYRuWelljRnJyuc3ip50JyO9Z5lH4",
        authDomain: "rem10m1h.firebaseapp.com",
        projectId: "rem10m1h",
        storageBucket: "rem10m1h.appspot.com",
        messagingSenderId: "85320812355",
        appId: "1:85320812355:web:190a12a6aa4d528ea791f6"
    };
    const app = modApp.initializeApp(firebaseConfig);
    const messaging = modMessaging.getMessaging(app);
    // FCMtoken = await modMessaging.getToken();
    modMessaging.onMessage(messaging, (payload) => {
        console.log('Message received. ', payload);
        // ...
    });
    // Add the public key generated from the console here.
    const publicWebPushKey =
        "BAT5B8BBwFwIggxMmRubj-BQXif_AvsdCbC-lQO--pypKkaO9EOhGw3I2O0UINKadChTq9JCsdZlwQC_6PDeZN8";
    // const token = await modMessaging.getToken(messaging, { vapidKey: publicWebPushKey });
    FCMtoken = await modMessaging.getToken(messaging, { vapidKey: publicWebPushKey });
    console.log({ FCMtoken });
}
*/
let testShortSwitch = true;
async function testShort() {
    testShortSwitch = true;
}
async function testFCM() {

    const msg = "out test message";

    const paramsObj = {}
    paramsObj.fcmtoken = FCMtoken;
    paramsObj.msg = msg || "no message";
    const paramsName = "testfcm";
    // const url = "/" + paramsName;
    // const result = await fetchParamsJson(url, paramsName, paramsObj)
    const result = await fetchSimpleJson(paramsName, paramsObj)
    console.log("%c Answer testfcm ", "color:yellowgreen; background:black;", result.answer);
    return result.answer.sent;

}
function test4tasks() {
    location.href = "/test-login.html";
}
async function showTestShareLink() {
    location.href = "index.html?text=TEXT&title=TITLE&url=" + encodeURIComponent("https:svt.se");
}
async function add2TestJsMindFc4i() {
    // current get reminders
    // no item sel
    location.href = "fc4i-mindmaps.html";
}
async function showTestJsMindArrayTree() { location.href = "test-jsmind-tree-array.html"; }
async function showTestTarget() {
    location.href = "share?text=TARGETTEXT&title=TARGETTITLE&url=" + encodeURIComponent("https:svt.se");

}
async function showSharedTo() {
    const secMain = clearMainSection("page-shared-to");
}
// const idLastSearch = "div-search-banner";
const idLastSearch = "h-your-items";
function getLastSearch() {
    const eltLastSearch = document.getElementById(idLastSearch);
    if (!eltLastSearch) return;
    return eltLastSearch.lastSearch;
}
function setLastSearch(objLastSearch) {
    const str = JSON.stringify(Object.keys(objLastSearch).sort());
    if (str != '["maxConf","minConf","requiredTags","searchFor"]') {
        console.error("bad param", objLastSearch);
        debugger; // eslint-disable-line no-debugger
    }
    // console.log({ str });
    // divSearchBanner.lastSearch = { searchFor, minConf, maxConf, requiredTags }
    // setLastSearch( { searchFor, minConf, maxConf, requiredTags });
    const eltLastSearch = document.getElementById(idLastSearch);
    eltLastSearch.lastSearch = objLastSearch;
}
function mkNetwGraphURL() {
    const url = new URL("/nwg/netwgraph.html", location.href);
    // const divSearchBanner = document.getElementById("div-search-banner");
    // if (divSearchBanner) {
    // const par = divSearchBanner.lastSearch;
    const par = getLastSearch();
    if (par) {
        const urlPar = new URLSearchParams();
        for (const prop in par) {
            const val = par[prop];
            if (val) {
                urlPar.set(prop, val);
                url.searchParams.set(prop, val);
            }
        }
    }
    // }
    // url.searchParams = urlPar;
    return url.href;
}

async function mkMenu() {
    const modMdc = await importFc4i("util-mdc");

    const liHome = modMdc.mkMDCmenuItem("Home");
    liHome.addEventListener("click", evt => { goHome(); });

    // const liIntro = modMdc.mkMDCmenuItem("About");
    // liIntro.addEventListener("click", evt => { showIntro(); })

    const liAbout = modMdc.mkMDCmenuItem(mkElt("a", { href: "/about.html#fc4i" }, "About"));

    const liNew = modMdc.mkMDCmenuItem("New");
    liNew.addEventListener("click", evt => { showAddedNew(); })

    const liShowDebug = modMdc.mkMDCmenuItem("Show debug info");
    liShowDebug.addEventListener("click", evt => { showDebug(); })
    liShowDebug.classList.add("test-item");

    const liTestFCM = modMdc.mkMDCmenuItem("Test FCM");
    liTestFCM.addEventListener("click", evt => { testFCM(); })
    liTestFCM.classList.add("test-item");

    const liTestShort = modMdc.mkMDCmenuItem("Test short timers");
    liTestShort.addEventListener("click", evt => { testShort(); })
    liTestShort.classList.add("test-item");

    // const liTestLogin = modMdc.mkMDCmenuItem("Test login");
    // liTestLogin.addEventListener("click", evt => { testLogin(); })
    // liTestLogin.classList.add("test-item");

    const liTest4tasks = modMdc.mkMDCmenuItem("Test 4 tasks");
    liTest4tasks.addEventListener("click", evt => { test4tasks(); })
    liTest4tasks.classList.add("test-item");

    // const liTestShareLink = modMdc.mkMDCmenuItem("Test /share.html with args");
    // liTestShareLink.addEventListener("click", evt => { showTestShareLink(); })
    // liTestShareLink.classList.add("test-item");

    const liTestShareWithArgs = modMdc.mkMDCmenuItem("Test /share with args");
    liTestShareWithArgs.addEventListener("click", evt => { showTestTarget(); })
    liTestShareWithArgs.classList.add("test-item");

    const aNetwGraph = mkElt("a", { href: "/nwg/netwgraph.html" }, "Test network graph (not ready)");
    aNetwGraph.addEventListener("click", evt => {
        aNetwGraph.href = mkNetwGraphURL();
    });
    aNetwGraph.addEventListener("contextmenu", evt => {
        aNetwGraph.href = mkNetwGraphURL();
    });
    const liTestNetwGraph = modMdc.mkMDCmenuItem(aNetwGraph);
    liTestNetwGraph.classList.add("test4all-item");

    const aLoci = mkElt("a", { href: "/loci/loci.html" }, "Test loci (not ready)");
    aLoci.addEventListener("click", evt => {
        // aLoci.href = mkNetwGraphURL();
    });
    aLoci.addEventListener("contextmenu", evt => {
        // aLoci.href = mkNetwGraphURL();
    });
    const liTestLoci = modMdc.mkMDCmenuItem(aLoci);
    liTestLoci.classList.add("test4all-item");


    async function fixSizes() {
        import("../src/js/mod/fixBigImg.js").then(m => { const modX = m; modX.fix(); });
    }
    const liFixSizes = modMdc.mkMDCmenuItem("Test fix image blob sizes");
    liFixSizes.addEventListener("click", evt => { fixSizes(); })
    liFixSizes.classList.add("test4all-item");


    // const liAbout = modMdc.mkMDCmenuItem(mkElt("a", { href: "/about.html#fc4i" }, "About"));
    // mm4i.html
    // liTestNetwGraph.classList.add("test-item");

    const liMindmapsA = modMdc.mkMDCmenuItem(mkElt("a", { href: "/mm4i/mm4i.html" }, "Mindmaps"));

    const liJsmindEdit = modMdc.mkMDCmenuItem("Jsmind-edit");
    liJsmindEdit.classList.add("test-item");
    liJsmindEdit.addEventListener("click", errorHandlerAsyncEvent(async evt => {
        location.href = "/jsmind-edit.html"
    }));

    // const liTestAdd2JsMind = modMdc.mkMDCmenuItem("test add to JsMind");
    // liTestAdd2JsMind.addEventListener("click", evt => { add2TestJsMindFc4i(); })
    // liTestAdd2JsMind.classList.add("test-item");

    // const liTestJsMindarrayTree = modMdc.mkMDCmenuItem("test JsMind node_array/tree");
    // liTestJsMindarrayTree.addEventListener("click", evt => { showTestJsMindArrayTree(); })
    // liTestJsMindarrayTree.classList.add("test-item");


    const liGetReminders = modMdc.mkMDCmenuItem("Get reminders");
    liGetReminders.addEventListener("click", evt => { OLDdisplayRemindersDialog(); });
    liGetReminders.classList.add("test-item");

    // const liTestTimer = modMdc.mkMDCmenuItem("Test timer");
    // liTestTimer.addEventListener("click", evt => { testTimer(); })
    // liTestTimer.classList.add("test-item");

    /*
    async function testTimer() {
        const modMdc = await importFc4i("util-mdc");
        const inpInt = mkElt("input", { type: "text" });
        inpInt.value = 10;
        const keySubmitted = "TEST_TIMER-submitted"
        const prevSubmitted = localStorage.getItem(keySubmitted);
        let prevSubmittedShow = "(none)";
        if (prevSubmitted) {
            const obj = JSON.parse(prevSubmitted);
            prevSubmittedShow = mkElt("div", undefined, [
                mkElt("div", undefined, `seconds: ${obj.seconds}`),
                mkElt("div", undefined, `time: ${obj.time}`),
            ]);
        }
        const prevDone = await getLastTestTimer();
        console.log({ prevDone });
        let prevDoneShow = "(none)";
        if (prevDone) {
            prevDoneShow = mkElt("div", undefined, [
                mkElt("div", undefined, `seconds: ${prevDone.seconds}`),
                mkElt("div", undefined, `time: ${prevDone.time}`),
                mkElt("div", undefined, `error: ${prevDone.error}`),
            ]);
        }

        const lastSWstatus = await getLastSWstatus();
        console.log({ lastSWstatus });
        let lastSWstatusShow = "(none known)";
        if (lastSWstatus) {
            lastSWstatusShow = mkElt("div", undefined, [
                `${lastSWstatus.status}: ${lastSWstatus.when}`
            ]);
        }

        const body = mkElt("div", undefined, [
            mkElt("h4", undefined, "TEST_TIMER"),
            "Seconds: ", inpInt,
            mkElt("p", undefined, [
                mkElt("div", { style: "font-style: italic" }, "Last submitted:"),
                prevSubmittedShow,
                mkElt("div", { style: "font-style: italic" }, "Last done:"),
                prevDoneShow,
                mkElt("div", { style: "font-style: italic" }, "Last SW status:"),
                lastSWstatusShow,
            ]),
        ]);
        const answer = await modMdc.mkMDCdialogConfirm(body);
        console.log({ answer });
        if (!answer) return;
        const seconds = inpInt.value;
        const wb = await modPWA.getWorkbox();
        wb.messageSW({ type: "TEST_TIMER", seconds, });
        const time = toOurTime(new Date());
        const valSubmitted = { seconds, time };
        const jsonSubmitted = JSON.stringify(valSubmitted)
        localStorage.setItem(keySubmitted, jsonSubmitted);
    }
    */

    const liStorage = modMdc.mkMDCmenuItem("Check storage");
    liStorage.addEventListener("click", errorHandlerAsyncEvent(async evt => { await checkStorage(); }));
    liStorage.classList.add("test-item");

    const liAskPersistent = modMdc.mkMDCmenuItem("Persistent storage");
    // liAskPersistent.classList.add("test-item");
    liAskPersistent.addEventListener("click", errorHandlerAsyncEvent(async evt => { await askPersistent(); }));
    (async () => {
        const isPersisted = await navigator.storage.persisted();
        if (!isPersisted) { liAskPersistent.style.color = "red"; }
    })();
    async function askPersistent() {
        const isPersisted = await navigator.storage.persisted();
        if (!isPersisted) {
            await doAskPersistent();
        } else {
            await checkStorage();
        }
        async function doAskPersistent() {
            if (isPersisted) {
                checkStorage();
                return;
            }
            let aboutQuota = "";
            if (navigator.storage.estimate) {
                const quota = await navigator.storage.estimate();
                if (quota == undefined) throw "quota is undefined";
                if (quota.usage == undefined) throw "quota.usage is undefined";
                if (quota.quota == undefined) throw "quota.quota is undefined";
                const percentageUsed = (quota.usage / quota.quota) * 100;
                aboutQuota = `(You are currently using ${percentageUsed.toFixed(2)}%
                    of the available space for this site.)`;
            }
            const body = mkElt("div", undefined, [
                mkElt("h2", undefined, "You data in this app may be lost"),
                mkElt("h2", undefined, "NOT READY YET!"),
                mkElt("p", undefined, [
                    `
                    Your data in this app may be lost when your mobile/computer
                    is running out of space.
                    This is very unlikely, but this web browser currently have 
                    your permission to erase data in this app if 
                    available space is becoming very low.
                    `,
                    aboutQuota
                ]),
                mkElt("p", undefined, `
                    You can tell the web browser that it should ask before
                    deleting your data on this site.
                    Do you want to do that?
                `),
            ]);
            const answer = await modMdc.mkMDCdialogConfirm(body, "Yes");
            console.log({ answer });
            if (answer) {
                const pers = await navigator.storage.persist();
                console.log({ pers });
                if (pers) {
                    const isPersisted = await navigator.storage.persisted();
                    if (!isPersisted) return;
                    liAskPersistent.style.color = null;
                    checkStorage();
                }
            }
        }
    }

    async function checkStorage() {
        // https://web.dev/learn/pwa/offline-data/
        /*
            You can also check if persistent storage is already granted
            in the current origin by calling StorageManager.persisted().
            Firefox requests permission from the user to use persistent storage.
            Chromium-based browsers give or deny persistence based on a heuristic
            to determine the importance of the content for the user.
            One criteria for Google Chrome is, for example, PWA installation.
            If the user has installed an icon for the PWA in the operating system,
            the browser may grant persistent storage.
        */

        const body = mkElt("div");

        // Check if site's storage has been marked as persistent
        const isPersisted = await navigator.storage.persisted();
        console.log(`Persisted storage is granted: ${isPersisted}`);
        body.appendChild(mkElt("h2", undefined,
            `Persisted storage is granted: ${isPersisted}`
        ));

        // Request persistent storage for site
        // FIX-ME: Do not do it here. Maybe add a menu entry?

        // eslint-disable-next-line
        if (false && !isPersisted) {
            const isPersisted = await navigator.storage.persist();
            console.log(`Persisted storage was granted now: ${isPersisted}`);
            body.appendChild(mkElt("div", undefined,
                `Persisted storage was granted now: ${isPersisted}`
            ));
        }

        // https://web.dev/learn/pwa/offline-data/
        if (navigator.storage.estimate) {
            const quota = await navigator.storage.estimate();
            // quota.usage -> Number of bytes used.
            // quota.quota -> Maximum number of bytes available.
            if (quota.usage == undefined) throw Error("quota.usage == undefined")
            if (quota.quota == undefined) throw Error("quota.quota == undefined")
            const percentageUsed = (quota.usage / quota.quota) * 100;
            console.log(`You've used ${percentageUsed}% of the available storage.`);
            body.appendChild(mkElt("p", undefined,
                // `You've used ${percentageUsed}% ${percentageUsed.toFixed(4)}% of the available storage.`
                `You've used ${percentageUsed.toFixed(4)}% of the available storage.`
            ));
            const remaining = quota.quota - quota.usage;
            console.log(`You can write up to ${remaining} more bytes.`);
            body.appendChild(mkElt("p", undefined,
                `You can write up to ${(remaining / 1000 / 1000).toFixed(0)} Mbytes more.`
            ));
        }
        modMdc.mkMDCdialogAlert(body);
    }

    const liTestClipboard = modMdc.mkMDCmenuItem("test clipboard images");
    liTestClipboard.classList.add("test-item");
    liTestClipboard.addEventListener("click", evt => {
        getClipboardImages();
    });

    const liExportImport = modMdc.mkMDCmenuItem("Export/Import and Backup");
    liExportImport.addEventListener("click", evt => { dialogExportImport(); })
    // liExport.classList.add("test-item");

    const liImport = modMdc.mkMDCmenuItem("Test Import");
    liImport.addEventListener("click", evt => { importItems(); })
    liImport.classList.add("test-item");


    async function importItems(callBackProgress) {
        const modDbFc4i = await importFc4i("db-fc4i");
        const modClipboardImages = await importFc4i("images");
        const importedItemsKeys = [];
        const notImportedItemsKeys = [];
        const importedMindmapsKeys = [];
        const notImportedMindmapsKeys = [];

        let theFile;
        if ("NOshowOpenFilePicker" in window) {
            let fileHandle;
            try {
                const opts = {
                    types: [
                        {
                            description: "Exported fc4i files",
                            accept: {
                                "application/json": [".json"]
                            }
                        }
                    ]
                };
                console.log({ opts });
                [fileHandle] = await window.showOpenFilePicker(opts);
                theFile = await fileHandle.getFile();
            } catch (err) {
                console.log({ err });
                if (err.name == "AbortError") return;
                throw err;
            }
        } else {
            // https://web.dev/patterns/files/open-one-or-multiple-files/#using-the-lessinput-type=filegreater-element
            theFile = await new Promise((resolve) => {
                // Append a new `<input type="file" multiple? />` and hide it.
                const input = document.createElement('input');
                input.style.display = 'none';
                input.type = 'file';
                input.accept = ".json";
                document.body.append(input);
                const multiple = false;
                if (multiple) {
                    input.multiple = true;
                }
                // The `change` event fires when the user interacts with the dialog.
                input.addEventListener('change', () => {
                    // Remove the `<input type="file" multiple? />` again from the DOM.
                    input.remove();
                    // If no files were selected, return.
                    if (!input.files) {
                        return;
                    }
                    // Return all files or just one file.
                    resolve(multiple ? Array.from(input.files) : input.files[0]);
                });
                // Show the picker.
                if ('showPicker' in HTMLInputElement.prototype) {
                    input.showPicker();
                } else {
                    input.click();
                }
            });
        }
        const contents = await theFile.text();
        console.log({ contents });
        const objJson = JSON.parse(contents);
        // const objJson = await file.json();
        console.log({ objJson });
        if (Array.isArray(objJson)) {
            const arrRecords = [...objJson];
            callBackProgress(arrRecords.length);
            await importRecords(arrRecords);
        } else {
            const arrMindmaps = [...objJson.mindmaps];
            const arrRecords = [...objJson.records];
            callBackProgress(arrRecords.length + arrMindmaps.length);
            await importMindmaps(arrMindmaps);
            await importRecords(arrRecords);
        }
        async function importMindmaps(arrMindmaps) {
            const dbMindmaps = await importFc4i("db-mindmaps");
            console.log({ arrMindmaps });
            const arrProm = [];
            // arrMindmaps.forEach(async mm =>
            for (let j = 0, len = arrMindmaps.length; j < len; j++) {
                callBackProgress();
                const mm = arrMindmaps[j];
                const key = mm.key;
                console.log({ key, mm });
                const oldMM = await dbMindmaps.DBgetMindmap(key);
                if (oldMM) {
                    notImportedMindmapsKeys.push(key);
                    continue;
                } else {
                    importedMindmapsKeys.push(key);
                }
                arrProm.push(dbMindmaps.DBsetMindmap(mm.key, mm.jsmindmap));
            }
            await Promise.all(arrProm);
        }
        async function importRecords(arrRecords) {
            // We have an array
            // callBackProgress(arrRecords.length);
            // const ret = objJson.forEach
            // const ret = arrJson.map
            const ret = [];
            const setTagsImported = new Set();
            for (let j = 0, len = arrRecords.length; j < len; j++) {
                callBackProgress();
                const obj = arrRecords[j];
                const key = obj.key;
                const oldObj = await modDbFc4i.getDbKey(key);
                // FIX-ME: merge?
                if (oldObj) {
                    // FIX-ME: which is newest?
                    notImportedItemsKeys.push(key);
                    // return;
                    continue;
                }
                // convert base64webpToBlob;
                const images = obj.images;
                if (images) {
                    for (let i = 0, len = images.length; i < len; i++) {
                        const b64 = images[i];
                        const blob = await modClipboardImages.base64webpToBlob(b64);
                        images[i] = blob;
                    }
                }
                // Import tags?
                const tags = obj.tags;
                if (tags) { tags.forEach(t => setTagsImported.add(t)); }

                importedItemsKeys.push(key);
                ret.push(modDbFc4i.setDbKey(key, obj));
            }
            console.log({ ret }, ret);

            // debugger; // FIX-ME require tags
            const arrOldTags = await modDbFc4i.getDbTagsArr();
            arrOldTags.forEach(t => setTagsImported.add(t));
            const arrNewTags = [...setTagsImported];
            arrNewTags.sort();
            // const dbFc4i = await getDbFc4i();
            modDbFc4i.setDbTagsArr(arrNewTags);

            const promRes = await Promise.allSettled(ret);
            console.log({ promRes });
            console.log({ importedItemsKeys });
        }
        await showImportResult();
        return importedItemsKeys;

        async function showImportResult() {
            // goHome
            const dbMindmaps = await importFc4i("db-mindmaps");
            // FIX-ME det-sum
            const divImportedItems = mkElt("div", { class: "div-all-imported" });
            const detImportedItems = mkElt("details", undefined, [
                mkElt("summary", undefined, `Imported items (${importedItemsKeys.length})`),
                divImportedItems
            ]);
            const divImportedMindmaps = mkElt("div", { class: "div-imported-mindmaps" });
            const detImportedMindmaps = mkElt("details", undefined, [
                mkElt("summary", undefined, `Imported mindmaps (${importedItemsKeys.length})`),
                divImportedMindmaps
            ]);
            const detImported = mkElt("details", undefined, [
                mkElt("summary", undefined, `Imported`),
                mkElt("div", { style: "margin-left:10px;" }, [
                    detImportedItems,
                    detImportedMindmaps,
                ])
            ]);



            const divNotImportedItems = mkElt("div", { class: "div-not-imported-items" });
            const detNotImportedItems = mkElt("details", undefined, [
                mkElt("summary", undefined, `Not Imported items (${notImportedItemsKeys.length})`),
                divNotImportedItems
            ]);
            const divNotImportedMindmaps = mkElt("div", { class: "div-not-imported-mindmaps" });
            const detNotImportedMindmaps = mkElt("details", undefined, [
                mkElt("summary", undefined, `Not Imported Mindmaps (${notImportedMindmapsKeys.length})`),
                divNotImportedMindmaps
            ]);
            const detNotImported = mkElt("details", undefined, [
                mkElt("summary", undefined, `Not Imported`),
                mkElt("div", { style: "margin-left:10px;" }, [
                    detNotImportedItems,
                    detNotImportedMindmaps
                ])
            ]);


            const sortedImportedItems = importedItemsKeys.sort().reverse();
            for (let j = 0, len = sortedImportedItems.length; j < len; j++) {
                const key = sortedImportedItems[j];
                const rem = await modDbFc4i.getDbKey(key);
                appendRem(rem, divImportedItems);
            }
            const sortedNotImportedItems = notImportedItemsKeys.sort().reverse();
            for (let j = 0, len = sortedNotImportedItems.length; j < len; j++) {
                const key = sortedNotImportedItems[j];
                const rem = await modDbFc4i.getDbKey(key);
                appendRem(rem, divNotImportedItems);
            }

            const sortedImportedMindmaps = importedMindmapsKeys.sort().reverse();
            for (let j = 0, len = sortedImportedMindmaps.length; j < len; j++) {
                const key = sortedImportedMindmaps[j];
                const mm = await dbMindmaps.DBgetMindmap(key);
                console.log("imp", { mm });
                divImportedMindmaps.appendChild(mkEltMindmap(mm));
            }
            const sortedNotImportedMindmaps = notImportedMindmapsKeys.sort().reverse();
            for (let j = 0, len = sortedNotImportedMindmaps.length; j < len; j++) {
                const key = sortedNotImportedMindmaps[j];
                const mm = await dbMindmaps.DBgetMindmap(key);
                console.log("not imp", { mm });
                divNotImportedMindmaps.appendChild(mkEltMindmap(mm));
            }
            function mkEltMindmap(mm) {
                const mkey = mm.key;
                const url = mkLinkMindmap(mkey);
                const format = mm.format;
                if (format != "node_array") throw Error(`Expected "node_array" but format is "${format}"`);
                const topic = mm.data[0].topic;
                console.log({ topic, url });
                return mkElt("a", { href: url }, topic);
            }
            function mkLinkMindmap(mkey) {
                const urlPath = "/mm4i/mm4i.html";
                const url = new URL(urlPath, location);
                url.searchParams.set("mindmap", mkey);
                return url.href;
            }


            const secMain = clearMainSection("page-imported");
            const eltImportBanner = mkElt("h2", undefined, mkElt("i", undefined, "Import Result"));
            const divHome = mkElt("div", { id: "div-home" }, [
                // divhHome,
                eltImportBanner,
                detImported,
                detNotImported
            ]);
            secMain?.appendChild(divHome);

        }
    }

    async function dialogExportImport() {
        const dbMindmaps = await importFc4i("db-mindmaps");
        const arrAllMindmaps = await dbMindmaps.DBgetAllMindmaps();
        const toExportMindmaps = [...arrAllMindmaps];

        const toExportRecords = [];
        const eltsKey = document.querySelectorAll("[data-key-record]");
        // Doubles in elements in listing????
        const arrItemKeys2 = [...eltsKey].map(elt => elt.dataset.keyRecord);
        const setItemKeys = new Set(arrItemKeys2);
        const arrItemKeys = [...setItemKeys];
        const dbFc4i = await importFc4i("db-fc4i");
        let pExport;
        const fnPrefix = "fc4i";
        const numItems = arrItemKeys.length;
        const numAllItems = await dbFc4i.countAllReminders();
        const numAllMindmaps = arrAllMindmaps.length;
        const numMindmaps = toExportMindmaps.length;

        const h2TitleExport = mkElt("h2", undefined, "Export");
        const h2TitleImport = mkElt("h2", undefined, "Import");
        if (document.getElementById("div-home")) {
            if (numItems == 0) {
                pExport =
                    mkElt("p", undefined, `No matching items to export.  `);
                // (To change this use search on top of the page.)
            } else {
                pExport = mkElt("p", undefined, [
                    `Export ${numItems} of ${numAllItems} item(s).`
                ]);
                if (numAllItems > 1) {
                    pExport.appendChild(mkElt("span", undefined,
                        "(To change this use search on top of the page.)"
                    ));
                }
                // numItems = arrItemKeys.length;
            }
            pExport.appendChild(mkElt("div", undefined, `Export ${numMindmaps} mindmaps.`));
        } else if (
            document.getElementById("page-added-new")
            ||
            document.getElementById("page-show-key")
        ) {
            if (numItems != 1) throw Error(`There should be exactly 1 item here`);
            const itemName = document.querySelector(".has-title").textContent;
            pExport = mkElt("p", undefined, `Export item "${itemName}".`);
            // numItems = 1;
        } else {
            if (numItems != 0) throw Error(`There should be no items here`);
            pExport = mkElt("p", undefined, "There are no items to export on this page");
        }
        const divExport = mkElt("div", undefined, [pExport]);
        if (numItems + numMindmaps > 0) {
            const iso = new Date().toISOString().replaceAll(":", "-").replaceAll("-", "").slice(2, -5);
            const strNums = `${numItems}of${numAllItems}-${numMindmaps}of${numAllMindmaps}`;
            // const fileName = `${fnPrefix}-${numItems}-of-${numAllItems}-${iso}.json`;
            const fileName = `${fnPrefix}-${strNums}-${iso}.json`;
            async function mkDownloadButton(addedKey) {
                const fileContent = await getJson4download(addedKey);
                const blob = new Blob([fileContent], { type: 'text/json' });
                const aExportBtn = modMdc.mkMDCbuttonA(
                    URL.createObjectURL(blob),
                    "Export",
                    "raised",
                    modMdc.mkMDCicon("download")
                );
                aExportBtn.setAttribute("download", fileName);
                aExportBtn.addEventListener("NOclick", errorHandlerAsyncEvent(async evt => {
                    // const fileContent = await getJson4download();
                    // const blob = new Blob([fileContent], { type: 'text/json' });
                    // aExportBtn.href = URL.createObjectURL(blob);
                }));
                return aExportBtn;
            }
            // const btnDownload = await mkDownloadButton();
            const pFileName = mkElt("p", undefined, `Download to ${fileName}`);

            divExport.appendChild(pFileName);
            // divExport.appendChild(mkElt("p", undefined, aExportBtn));
            const btnFakeDownload = modMdc.mkMDCbutton("Export", "raised", modMdc.mkMDCicon("download"));

            btnFakeDownload.addEventListener("click", errorHandlerAsyncEvent(async evt => {
                // const btn = evt.target.closest("button");
                const btn = btnFakeDownload;
                const style = getComputedStyle(btn);
                const pb = modMdc.mkMDCprogressBar("Export progress bar", 0, 1, 0)
                const spanExporting = mkElt("span", undefined, "Exporting...");
                const divProgress = mkElt("div", undefined, [
                    spanExporting, pb
                ]);
                divProgress.style.height = style.height;
                // divProgress.style.backgroundColor = "red";
                btn.parentElement.appendChild(divProgress);
                btn.remove();

                let n = 0;
                function addedKey() {
                    pb.mdc.foundation.setProgress(++n / numItems);
                    if (n == numItems) spanExporting.textContent = "Exporting done";
                }
                const btnDownload = await mkDownloadButton(addedKey);
                btnDownload.click();
            }));

            // divExport.appendChild(mkElt("p", undefined, btnDownload));
            divExport.appendChild(mkElt("p", undefined, btnFakeDownload));
        }

        const btnImport = modMdc.mkMDCbutton("Import", "raised", modMdc.mkMDCicon("upload"));
        btnImport.addEventListener("click", errorHandlerAsyncEvent(async evt => {
            const btn = btnImport;
            const style = getComputedStyle(btn);
            const pb = modMdc.mkMDCprogressBar("Import progress bar", 0, 1, 0)
            const spanExporting = mkElt("span", undefined, "Importing...");
            const divProgress = mkElt("div", undefined, [
                spanExporting, pb
            ]);
            divProgress.style.height = style.height;
            // btn.parentElement.appendChild(divProgress);
            // btn.remove();

            let numItems;
            let n = 0;
            function callBackProgress(num) {
                if (num) {
                    numItems = num;
                    btn.parentElement.appendChild(divProgress);
                    btn.remove();
                    return;
                }
                pb.mdc.foundation.setProgress(++n / numItems);
            }
            const imported = await importItems(callBackProgress);
            console.log({ imported });
            dlg.mdc.close();
        }));
        const divImport = mkElt("div", undefined, [
            // test import
            mkElt("p", undefined, "Import exported files."),
            btnImport,
        ]);
        const h2TitleBackup = mkElt("h2", undefined, "Backup");
        const pBackup = mkElt("p", undefined,
            `
            Please use export and import above for backup.
            `
        );
        const body = mkElt("div", undefined, [
            h2TitleExport,
            divExport,
            mkElt("hr"),
            h2TitleImport,
            divImport,
            mkElt("hr"),
            h2TitleBackup,
            pBackup,
        ]);
        const dlg = await modMdc.mkMDCdialogAlert(body, "Close");
        async function getJson4download(funBackKey) {
            const modDbFc4i = await importFc4i("db-fc4i");
            for (let i = 0, len = arrItemKeys.length; i < len; i++) {
                // const t = arrKeys[i];
                // const k = t.dataset.keyRecord;
                const k = arrItemKeys[i];
                // console.log(k);
                const obj = await modDbFc4i.getDbKey(k);
                // console.log({ obj });
                const images = obj.images;
                if (images && images.length > 0) {
                    const modClipboardImages = await importFc4i("images");
                    // console.log({ images });
                    for (let j = 0, leni = images.length; j < leni; j++) {
                        const blob = images[j];
                        // blob 64
                        const base64 = await modClipboardImages.blobToBase64(blob);
                        // console.log({ base64 });
                        images[j] = base64;
                    }
                }
                toExportRecords.push(obj);
                funBackKey();
            }
            // console.log({ toExport });
            // console.log(toExport);
            const json = JSON.stringify({
                "mindmaps": toExportMindmaps,
                "records": toExportRecords
            });
            // console.log({ json });
            // const fromJson = JSON.parse(json);
            // console.log({ fromJson });
            return json;
        }

    }

    let arrEntries = [
        liHome,
        // liIntro,
        liNew,
        liExportImport,
        // liGetReminders,
        // liMindmaps,
        // liMindmapsA,
        liAskPersistent,
        liAbout,
    ];
    const showDebugEntries = true;
    if (showDebugEntries) {
        const liHr = mkElt("hr");
        liHr.classList.add("test-item");
        const liHeaderTests = modMdc.mkMDCmenuItem("Items below are tests");
        liHeaderTests.classList.add("test-item");
        liHeaderTests.style.fontWeight = "bold";
        liHeaderTests.style.fontStyle = "italic";
        arrEntries = arrEntries.concat([
            liHr,
            liHeaderTests,
            liJsmindEdit,
            liTestClipboard,
            // liTestLogin,
            // liTestFCM,
            // liTestShort,
            // liTest4tasks,
            // liTestShareLink,
            // liMindmaps,
            // liTestAdd2JsMind,
            // liTestJsMindarrayTree,
            liTestShareWithArgs,
            liTestNetwGraph,
            liTestLoci,
            liFixSizes,
            // liShowDebug,
            // liTestTimer,
            // liImport,
            // liStorage,
        ]);
    }
    // if (liAskPersistent) { arrEntries.push(liAskPersistent); }
    const ulMenu = modMdc.mkMDCmenuUl(arrEntries);

    const divMenu = modMdc.mkMDCmenuDiv(ulMenu);
    divMenu.id = "main-menu";
    divMenu.classList.add("is-menu-div");
    divMenu.addEventListener("click", evt => {
        toggleMenu();
    });
    return divMenu;
}

const getQueryParams = (query) => {
    let params = {};
    new URLSearchParams(query).forEach((value, key) => {
        params[key] = value;
    });
    return params;
};

async function OLDsetFirstAutoRemindersOnHtml() {
    await promiseDOMready();
    // const dbFc4i = await getDbFc4i();
    const dbFc4i = await importFc4i("db-fc4i");
    const recReminders = await dbFc4i.getSavedDialogValue();
    // console.log({ recReminders });
    if (recReminders) setAutoRemindersOnHtml(recReminders.autoReminders);
}
async function setAutoRemindersOnHtml(on) {
    if (on) {
        document.documentElement.classList.remove("auto-reminders-off");
    } else {
        document.documentElement.classList.add("auto-reminders-off");
    }
}

async function deleteEntry(key, card) {
    const modMdc = await importFc4i("util-mdc");
    card.style.outline = "4px dotted yellowgreen";
    const dlg = modMdc.mkMDCdialogConfirm("Delete this subject?", "Yes", "No");
    const answer = await dlg;
    console.log({ answer });
    card.style.outline = null;
    if (!answer) return false;

    // const key = rem.key;
    // const dbFc4i = await getDbFc4i();
    const dbFc4i = await importFc4i("db-fc4i");
    // const db = await dbFc4i.getDb();
    // const res = await db.delete(idbStoreName, key);
    // const res = await dbFc4i.deleteKey(key);
    const res = await dbFc4i.deleteDbKey(key);
    console.log({ res });
    // transitionend seems to be buggy in Android Chrome 2023-01-01
    // Use timeout instead of transitionend
    const useTransitionend = false;
    if (useTransitionend) {
        card.addEventListener("transitionend", evt => {
            console.log("%ctransitionend event", "color: red;");
            card.remove();
        });
    } else {
        const removeCard = () => {
            console.log("%ctimeout card.remove", "color: red;");
            card.remove();
        }
        setTimeout(removeCard, 1200);
    }
    // Seems like duration is not set before changes sometimes.
    card.style.transitionDuration = "1s";
    setTimeout(() => {
        console.log("%cAdding .removed", "color: red;");
        card.classList.add("removed");
    }, 200);

    // snackbar
    modMdc.mkMDCsnackbar("Deleted entry", 5 * 1000);
    return true;
}

function pageIsSaved() {
    return document.documentElement.querySelector(".not-saved") == null;
}
window.addEventListener("beforeunload", evt => {
    const notSaved = !pageIsSaved();
    console.log("%clistener on beforeunload", "color:red; font-size: 20px;", { notSaved });
    if (notSaved) evt.preventDefault();
});


const visibleAppTitle = "Flashcards 4 Internet";

const mainCommon = async () => {
    // setupFCM();
    // setFirstAutoRemindersOnHtml();

    await promiseDOMready();
    const divHeaderTitle = document.getElementById("header-title");
    if (divHeaderTitle) divHeaderTitle.textContent = visibleAppTitle;
    const divMainHeader = document.getElementById("main-header");
    divMainHeader?.classList.add("mdc-theme--primary-bg");
    divMainHeader?.classList.add("mdc-theme--on-primary");


    // addEventListener('DOMContentLoaded', (event) => {
    // console.log("before getMenu");
    getMenu();
    // addDebugSWinfo();
    // if (!(await checkNotificationPermissions())) return;
    // setupForInstall();
    // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorker/error_event
    // let sw = await setupServiceWorker();
    // setupServiceWorker();
    // https://developer.chrome.com/articles/web-share-target/, GET
    checkUrlParams();
    function checkUrlParams() {
        // const parsedUrl = new URL(window.location);
        // const searchParams = parsedUrl.searchParams;
        const searchParams = getQueryParams(location.search);
        const keysParams = Object.keys(searchParams);
        const got4compare = JSON.stringify(keysParams.sort());
        const nParams = keysParams.length;
        // console.log({ nParams });
        Object.entries(searchParams).forEach(([key, val]) => {
            addDebugRow(`Param ${key}=${val}`);
        });

        let title = searchParams['title'];
        let text = searchParams['text'];
        let url = searchParams['url'];
        const noUrl = !url;
        const textIsUrl = text?.startsWith("https://")
            // https://www.westonlambert.com/glassandstone ??? What is going on at that server?
            || text?.startsWith("http://");
        if (noUrl && textIsUrl) {
            url = text;
            // text = "(missing, contains URL instead)";
            text = "";
        }
        const sharedParams = { text, title, url };
        switch (nParams) {
            case 0:
                addDebugRow(`URL parameters: NONE`);
                (async () => {
                    // const arrAll = [...await getAllReminders()];
                    // const dbFc4i = await getDbFc4i();
                    const dbFc4i = await importFc4i("db-fc4i");
                    const numItems = await dbFc4i.countAllReminders();
                    if (numItems > 0) {
                        goHome();
                    } else {
                        showIntro(numItems);
                    }
                })();
                break;
            case 1:
                const showKey = searchParams["showkey"];
                if (showKey) {
                    justShowKey(showKey);
                    break;
                }
                const key = searchParams['key'];
                const wanted = ["key"];
                if (JSON.stringify(wanted) == got4compare) {
                    showKeyToRemember(key);
                    break;
                }
                // Some Android apps sends only one the text param with the url.
                // 
                if (textIsUrl) {
                    sharedParams.title = "(No title)";
                    showAddedNew(sharedParams);
                    break;
                }
                throw Error(`Bad params (1)`);
                break;
            case 3:
                {
                    addDebugRow(`URL parameters: title: ${title}, text: ${text}, url: ${url}`);
                    const wanted = ["text", "title", "url"];
                    if (JSON.stringify(wanted) != got4compare) throw Error(`Bad params (3)`);
                    showAddedNew(sharedParams);
                }
                break;
            case 2:
                const wanted2 = ["key", "timerInfo"];
                if (JSON.stringify(wanted2) == got4compare) {
                    const key2 = searchParams['key'];
                    const timerInfo = searchParams['timerInfo'];
                    showKeyToRemember(key2, timerInfo);
                    break;
                }

                // This is for handling a bug in the share API:s
                // File an issue here: https://bugs.chromium.org/p/chromium/issues/list?q=share&can=2
                //   Use this as example: https://web-share.glitch.me/
                // Currently we recieve only 2 url parameters. The "url"-parameter is missing
                // and its value is instead given to the "text"-parameter.
                {
                    if (!textIsUrl) {
                        throw Error(`2 params, but "text"-parameter does not start with "https://"`);
                    }
                    showAddedNew(sharedParams);
                }
                break;
            default:
                console.error("Bad number of parameters", { nParams });
        }
    }

    // });

}

function mkStatusIndicator(steps, direction, test) {
    if (!["height", "width"].includes(direction)) throw Error(`Bad direction: ${direction}`);
    const eltAntiIndicator = mkElt("div", { class: "status-progress-anti" });
    eltAntiIndicator.style.backdropFilter = "grayscale(1) brightness(0.1)";
    const eltCont = mkElt("div", { class: "status-progress" }, eltAntiIndicator);
    eltCont.dataset.maxVal = steps;
    eltCont.style.backgroundColor = "rgb(94, 94, 94);";

    if (test) {
        eltCont.style.height = "50px";
        eltCont.style.width = "5px";
        eltCont.style.position = "fixed";
        eltCont.style.top = "10px";
        eltCont.style.left = "10px";
    }
    eltCont.style.border = "1px solid rgba(128, 128, 128, 0.29)";

    eltCont.mySet = (val) => {
        if (val > steps) throw Error(`progress indicator, val (${val}) > max ${steps}`);
        if (val < 1) throw Error(`progress indicator, val (${val}) < 1`);
        // const indSize = 100 * (steps - val ) / (steps + 1);
        const indSize = 100 * (val - 1) / (steps + 0);
        eltAntiIndicator.style[direction] = `${indSize}%`;
        const hue = val / steps * 100;
        eltCont.style.backgroundColor = `hsl(${hue}deg 100% 50%)`;
        eltCont.dataset.val = val;
    };
    eltCont.myGet = () => eltCont.dataset.val;
    return eltCont;
}

function openDetails(eltDetails, eltContainer) {
    if (eltContainer) {
        if (!eltContainer.contains(eltDetails)) throw Error("eltContainer does not contain eltDetails");
    }
    let detContaining = eltDetails;
    let n = 0;
    while (n++ < 10) {
        detContaining.open = true;
        detContaining = detContaining.parentElement.closest("details");
        if (!detContaining) return;
        if (detContaining == eltContainer) continue;
        if (eltContainer && detContaining.contains(eltContainer)) return;
    }
}

function getColorThemeBrowser() {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return "dark";
    if (window.matchMedia('(prefers-color-scheme: light)').matches) return "light";
    return undefined;
}

function mkEltTagSelector(tag, checked) {
    const chkbox = mkElt("input", { type: "checkbox" });
    chkbox.checked = checked;
    return mkElt("label", { class: "tag-in-our-tags" }, [chkbox, `#${tag}`]);
}

mainCommon();

document.addEventListener("click", errorHandlerAsyncEvent(async evt => {
    let eltMaybeSummary = evt.target;
    if (eltMaybeSummary.tagName != "SUMMARY") eltMaybeSummary = eltMaybeSummary.parentElement;
    if (eltMaybeSummary?.tagName != "SUMMARY") eltMaybeSummary = eltMaybeSummary?.parentElement;
    if (eltMaybeSummary?.tagName != "SUMMARY") eltMaybeSummary = eltMaybeSummary?.parentElement;
    if (eltMaybeSummary?.tagName == "SUMMARY") {
        // console.log("summary");
        const d = eltMaybeSummary.parentElement;
        const isOpen = d.open;
        // console.log({ d, isOpen });
        const e = d.querySelector(".expander");
        if (!e) return;
        if (isOpen) {
            e.classList.remove("expanded");
            // setTimeout(() => e.classList.remove("expanded"), 1000);
        } else {
            // Today: 2023-02-28, Google Chrome Version 110.0.5481.178 (Official Build) (64-bit)
            // "await/setTimeout" works ok.
            // "justAdd" shows no expanding.
            // console.log("theExpanderWay", theExpanderWay);
            switch (theExpanderWay) {
                case "justAdd":
                    e.classList.add("expanded");
                    break;
                case "setTimeout":
                    setTimeout(() => { e.classList.add("expanded"); }, 1);
                    break;
                case "await":
                    await new Promise(resolve => { setTimeout(() => { resolve(true); }, 1); });
                    e.classList.add("expanded");
                    break;
                default:
                    throw Error(`Bad expander way: ${theExpanderWay}`);
            }
        }
    }
}));



// Clipboard images
async function getClipboardImages() {
    console.log("getClipboardImages");
    const modMdc = await importFc4i("util-mdc");
    const modClipboardImages = await importFc4i("images");

    if (!await modClipboardImages.isClipboardPermissionStateOk()) {
        return;
    }

    const info = mkElt("div");
    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.gap = "10px";
    container.classList.add("thumb-100");
    try {
        const clipboard = await navigator.clipboard.read();
        console.log({ clipboard });
        info.appendChild(mkElt("p", undefined, `Num items: ${clipboard.length}`));
        for (const item of clipboard) {
            console.log({ item });
            for (const type of item.types) {
                // get blob data for item
                const blob = await item.getType(type);
                let newElement;
                // text item
                if (type === 'text/plain') {
                    newElement = document.createElement('p');
                    newElement.style.padding = "4px";
                    newElement.textContent = await blob.text();
                }
                // image item
                if (type.startsWith('image/')) {
                    const eltImg = mkElt("span", { class: "image-bg-contain image-thumb-size" });
                    const urlBlob = URL.createObjectURL(blob);
                    const urlBg = `url(${urlBlob})`;
                    // console.log({ blob, urlBlob });
                    eltImg.style.backgroundImage = urlBg;
                    eltImg.dataset.urlBlob = urlBlob;
                    newElement = mkElt("div", undefined, eltImg);
                }
                // append text or image to document
                if (newElement) {
                    newElement.classList.add("mdc-card");
                    container.appendChild(newElement);
                }
            }
        }
    } catch (err) {
        console.error('Could not read from clipboard', err);
        const errCode = err.code;
        const errName = err.name;
        // alert(`Could not read clipboard, ${err}`);
        const body = mkElt("div", undefined, [
            mkElt("div", undefined, `error.code: ${err.code}`),
            mkElt("div", undefined, `error.name: ${err.name}`),
            mkElt("div", undefined, `error.message: ${err.message}`),
        ]);
        await modMdc.mkMDCdialogAlert(body);
        return;
    }
    const body = mkElt("div", undefined, [info, container]);
    modMdc.mkMDCdialogAlert(body);
}

async function mkFabNetwG() {
    const modMdc = await importFc4i("util-mdc");
    const iconHub = modMdc.mkMDCicon("hub");

    const aIconHub = mkElt("a", { href: "/nwg/netwgraph.html" }, iconHub);
    aIconHub.addEventListener("click", evt => {
        // aIconHub.href = mkTestNetwGraphURL();
        aIconHub.href = mkNetwGraphURL();
    });
    aIconHub.addEventListener("contextmenu", evt => {
        aIconHub.href = mkNetwGraphURL();
    });

    aIconHub.style.lineHeight = "1rem";
    const titleNetwg = "Investigate as a graphical network";
    const fabNetwG = modMdc.mkMDCfab(aIconHub, titleNetwg, true)
    fabNetwG.style = `
        background-color: goldenrod;
        position: absolute;
        top: 2px;
        right: -7px;
    `;
    return fabNetwG;
}

async function dialog10min1hour(eltPrevFocused) {
    const modMdc = await importFc4i("util-mdc");
    const modLocalSettings = await importFc4i("local-settings");
    let dlg;

    const divOutputNew = mkElt("div");
    divOutputNew.style = `
        display: flex;
        flex-direction: column;
        gap: 10px;
    `;

    const iconInfo = modMdc.mkMDCicon("info");
    iconInfo.style.color = "blue";
    const eltExplainReminders = mkElt("details", undefined, [
        mkElt("summary", undefined, ["Ask for reminders? ", iconInfo]),
        mkElt("p", undefined, "Ehm. You have to ask for reminders."),
        mkElt("p", undefined, `
            Does it sound like a strange idea?
            Ask for reminders...
        `),
        mkElt("p", undefined, [
            `There is an explanation `,
            mkElt("a", { href: "about.html#ask-for-reminders" }, "here"),
            "."
        ]),
    ]);
    const divExplain = mkElt("div", undefined, [eltExplainReminders]);
    divExplain.classList.add("mdc-card");
    divExplain.style = `
        background: lightblue;
        padding: 10px;
        line-height: normal;
    `;

    const clrOrderCompareReminders = {
        "conf": "greenyellow",
        "delay": "yellow",
        "age": "orange",
    }

    const orderCompareReminders = [];
    const defaultOrderCompareReminders = [
        "conf",
        "delay",
        "age",
    ];
    const settingOrderCompareReminders = new modLocalSettings.LocalSetting(
        "fc4i-", "compare-reminders", JSON.stringify(defaultOrderCompareReminders));

    orderCompareReminders.push(...JSON.parse(settingOrderCompareReminders.value));

    // resetOrderCompareReminders();
    function resetOrderCompareReminders() {
        settingOrderCompareReminders.reset();
        orderCompareReminders.length = 0;
        // orderCompareReminders.push(...defaultOrderCompareReminders);
        orderCompareReminders.push(...JSON.parse(settingOrderCompareReminders.value));
    }

    const divDoOrderReminders = mkElt("div");
    divDoOrderReminders.style = `
        display: flex;
        gap: 10px;
        padding: 4px;
        NOborder: 1px solid gray;
        background: gray;
    `;
    const iconResetOrder = modMdc.mkMDCicon("restart_alt");
    const btnResetOrder = modMdc.mkMDCiconButton(iconResetOrder, "Reset order");
    btnResetOrder.addEventListener("click", evt => {
        // alert("resetting order is not implemented yet");
        resetOrderCompareReminders();
        orderSortButtons();
    });
    const divDoOrderRemindersOuter = mkElt("div", undefined, [
        divDoOrderReminders,
        btnResetOrder
    ]);
    divDoOrderRemindersOuter.style = `
        display: flex;
        gap: 10px;
        margin-bottom: 10px;
    `;

    const detOrderReminders = mkElt("details", undefined, [
        mkElt("summary", undefined, "Prioritize reminders"),
        mkElt("div", undefined, "Click sort label to put it first"),
        divDoOrderRemindersOuter
    ]);
    detOrderReminders.addEventListener("toggle", evt => {
        if (detOrderReminders.open) {
            detOrderReminders.classList.add("mdc-card");
            detOrderReminders.style.padding = "10px";
            detOrderReminders.style.marginBottom = "10px";
        } else {
            detOrderReminders.classList.remove("mdc-card");
            detOrderReminders.style.padding = "0px";
            detOrderReminders.style.marginBottom = "0px";
        }
    })
    const divOrderReminders = mkElt("div", undefined, detOrderReminders);

    orderSortButtons();
    function orderSortButtons() {
        divDoOrderReminders.textContent = "";
        orderCompareReminders.forEach(srt => {
            const btnSrt = mkElt("span", undefined, srt);
            btnSrt.style = `
                padding: 5px;
                background: ${clrOrderCompareReminders[srt]};
                display: inline-block;
            `;
            btnSrt.addEventListener("click", evt => {
                const idx = orderCompareReminders.indexOf(srt);
                orderCompareReminders.splice(idx, 1);
                orderCompareReminders.unshift(srt);
                settingOrderCompareReminders.value = JSON.stringify(orderCompareReminders);
                orderSortButtons();
            });
            divDoOrderReminders.appendChild(btnSrt);
            if (divOutputNew.querySelector(".pending-reminder")) { getAndShowReminders(); }
        });
    }

    async function getAndShowReminders() {
        const modDbFc4i = await importFc4i("db-fc4i");
        const arrNot = await modDbFc4i.getToNotifyNow(getLastSearch());
        console.log({ arrNot });
        const arrSrt = arrNot.toSorted(compareReminders);
        // FIX-ME: random
        arrSrt.length = Math.min(arrSrt.length, 5);
        divOutputNew.textContent = "First 5 pending reminders:";
        arrSrt.forEach(r => {
            const rec = r.expiredRecord;
            const tim = r.expiredTimers[0];
            const conf = rec.confRem;
            const msD = tim.msDelay;
            const msW = tim.msWhen;
            const title = rec.title;
            // const url = rec.url;
            const key = rec.key;
            // console.log({ conf, msD, msW, title, url, key });
            const linkRec = getLink2KeyInFc4i(rec.key);
            const aSource = mkElt("a", { href: linkRec }, title);
            aSource.style.textDecorationLine = "none";
            // done?
            function setReminderDone() {
                // set msDelay to negative;
                console.log({ rec, tim });
                let doneIt = false;
                rec.timers.forEach(t => {
                    const w = t.msWhen;
                    if (w == tim.msWhen) {
                        t.msDelay = -t.msDelay;
                        console.log(t);
                        modDbFc4i.setDbKey(key, rec);
                        doneIt = true;
                    }
                });
                console.log({ doneIt });
                if (!doneIt) {
                    debugger; // eslint-disable-line no-debugger
                    throw Error(`Did not find timer to mark done??`)
                }
                // modDbFc4i.setDbKey(key, rec);
            }
            aSource.addEventListener("click", evt => {
                setReminderDone();
                console.log("clicked", aSource);
                debugger; // eslint-disable-line no-debugger
            });
            aSource.addEventListener("contextmenu", evt => {
                setReminderDone();
                console.log("contextmenu", aSource);
            });
            // const displayDelay
            const msAge = Date.now() - msW;
            const objAge = getDayHourMinSec(msAge / 1000);
            const txtAge = `Age: ${dhmsToString(objAge)}`;
            const objDelay = getDayHourMinSec(msD / 1000);
            const txtDelay = `Delay: ${dhmsToString(objDelay)}`;
            const txtConf = `Conf: ${conf}`;

            const objCompared = {
                "conf": txtConf,
                "delay": txtDelay,
                "age": txtAge,
            }
            const txtCompared = orderCompareReminders.map(k => objCompared[k]).join(", ");

            const divBottom = mkElt("div");
            divBottom.style = `
                display: flex;
                gap: 10px;
            `;
            const blob = rec.images[0];
            if (blob) { divBottom.appendChild(mkImageThumb(blob)); }
            divBottom.appendChild(mkElt("span", undefined, [txtCompared,]));
            const eltRem = mkElt("div", undefined, [
                mkElt("div", undefined, aSource),
                divBottom
            ]);
            eltRem.classList.add("pending-reminder");
            eltRem.classList.add("mdc-card");
            eltRem.style = `
                padding: 10px;
                line-height: normal;
                display: flex;
                gap: 10px;
            `;
            divOutputNew.appendChild(eltRem);
        });


        function compareReminders(r1, r2) {
            const rec1 = r1.expiredRecord;
            const rec2 = r2.expiredRecord;
            const tim1 = r1.expiredTimers;
            const tim2 = r2.expiredTimers;
            if (!(rec1 && rec2 && tim1 && tim2)) {
                debugger; // eslint-disable-line no-debugger
            }

            const funs = {
                "conf": compareConf,
                "delay": compareDelay,
                "age": compareAge,
            }
            if (JSON.stringify(Object.keys(funs).sort()) != JSON.stringify(orderCompareReminders.toSorted())) {
                debugger; // eslint-disable-line no-debugger
            }
            // console.log("5", {orderCompareReminders});
            for (let i = 0, len = orderCompareReminders.length; i < len; i++) {
                const funName = orderCompareReminders[i];
                const res = funs[funName];
                if (res != 0) return res;
            }
            return 0;

            function compareConf() {
                const conf1 = rec1.confRem;
                const conf2 = rec2.confRem;
                if (conf1 < conf2) return -1;
                if (conf1 > conf2) return 1;
                return 0;
            }
            function compareDelay() {
                const t1 = tim1[0];
                const t2 = tim2[0];
                const msD1 = t1.msDelay;
                const msD2 = t2.msDelay;
                if (msD1 < msD2) return -1;
                if (msD1 > msD2) return 1;
                return 0;
            }
            function compareAge() {
                const msW1 = t1.msWhen;
                const msW2 = t2.msWhen;
                if (msW1 < msW2) return -1;
                if (msW1 > msW2) return 1;
                return 0;
            }
        }
    }

    const btnNew = modMdc.mkMDCbutton("Please, reminde me", "raised");
    btnNew.addEventListener("click", errorHandlerAsyncEvent(async evt => {
        divExplain.style.display = "none";
        getAndShowReminders();
    }));

    const iconChecklist = modMdc.mkMDCicon("today");
    iconChecklist.classList.add("icon-check-beside-search");
    iconChecklist.style.color = "orange";
    const iconSearch = modMdc.mkMDCicon("search");
    iconSearch.classList.add("icon-search-beside-check");
    const spanIcons = mkElt("span", undefined, [iconChecklist, iconSearch,]);
    spanIcons.style.position = "relative";

    const body = mkElt("div", { class: "body-reminder-dialog" }, [
        mkElt("h2", undefined, [
            "Reminders ",
            spanIcons,
        ]),
        mkElt("p", undefined, btnNew),
        divOrderReminders,
        divOutputNew,
        divExplain,
    ]);
    dlg = await modMdc.mkMDCdialogAlert(body, "Close");
}
async function askForReminders(onlyMatched) {
    const modPWA = await importFc4i("pwa");
    const wb = await modPWA.getWorkbox();
    const matchValues = onlyMatched ? getHomeSearchValues() : undefined;
    wb.messageSW({ type: "CHECK_NOTIFY", msDelay: 2000, matchValues });
}

function getLink2KeyInFc4i(keyFc4i) {
    const objUrl = new URL("/", location);
    objUrl.searchParams.set("showkey", keyFc4i)
    return objUrl.href;
}



function dhmsToString(objDhms) {
    let days = objDhms.days;
    let hours = objDhms.hours;
    let minutes = objDhms.minutes;
    let seconds = objDhms.seconds;

    let str = "";

    if (hours > 18) { days++; hours = 0; }
    if (days > 0) {
        const lblDays = days == 1 ? "day" : "days";
        str = `${days} ${lblDays} `;
    }
    if (days > 2) return str.trim();

    if (minutes > 30) { hours++; minutes = 0; }
    if (days > 0 || hours > 0) {
        if (!(days > 0 && hours == 0)) {
            const lblHours = hours == 1 ? "hour" : "hours";
            str += `${hours} ${lblHours} `;
        }
    }
    if (days > 0 || hours > 3) return str.trim();

    if (seconds > 30) { minutes++; seconds = 0; }
    if (hours > 0 || minutes > 0) {
        if (!(hours > 0 && minutes == 0)) {
            const lblMinutes = minutes == 1 ? "minute" : "minutes";
            str += `${minutes} ${lblMinutes} `;
        }
    }
    if (hours > 0 || minutes > 3) return str.trim()

    const lblSeconds = seconds == 1 ? "second " : "seconds ";
    str += `${seconds} ${lblSeconds}`;
    return str.trim();
}
function getDayHourMinSec(totalSeconds) {
    const SEC_IN_HR = 3600;
    const days = `${Math.floor(totalSeconds / (SEC_IN_HR * 24))}`;
    const hours = `${Math.floor(totalSeconds % (SEC_IN_HR * 24) / SEC_IN_HR)}`;
    const minutes = `${Math.floor(totalSeconds % SEC_IN_HR / 60)}`;
    const seconds = `${Math.floor(totalSeconds % 60)}`;

    // return `${days.padStart(2,'0')}:${hours.padStart(2,'0')}:${minutes.padStart(2,'0')}:${seconds.padStart(2,'0')}`;
    return { days, hours, minutes, seconds };
}
