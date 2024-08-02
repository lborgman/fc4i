"use strict";
console.log("here is share.js");

// https://developer.chrome.com/articles/web-share-target/
// NOTE: This will currently only work in Chrome on Android!

const secMs = 1000;
const minMs = secMs * 60;
const hourMs = minMs * 60;
const dayMs = hourMs * 24;
const weekMs = dayMs * 7;
const monthMs = dayMs * 30;
const yearMs = dayMs * 365;

const tzMin = new Date().getTimezoneOffset();
const tzMs = tzMin * 60 * 1000;
function toLocalISOString(date) { return new Date(date.getTime() - tzMs).toISOString(); }
function toOurTime(date) { return toLocalISOString(date).slice(0, -8).replace("T", " "); }
const today = toOurTime(new Date()).slice(0, 10);
function isToday(ourTime) { return ourTime.slice(0, 10) == today; }
const tomorrow = toOurTime(new Date(new Date().getTime() + dayMs)).slice(0, 10);
function isTomorrow(ourTime) { return ourTime.slice(0, 10) == tomorrow; }
const yesterday = toOurTime(new Date(new Date().getTime() - dayMs)).slice(0, 10);
function isYesterday(ourTime) { return ourTime.slice(0, 10) == tomorrow; }
function isOlderThan(dateOrString, ms) {
    const thatDate = new Date(dateOrString);
    const now = new Date();
    const msDiff = now - thatDate;
    return msDiff > ms;
}
export function isMoreThanAnHourAgo(dateOrString) { return isOlderThan(dateOrString, hourMs); }
export function isMoreThanADayAgo(dateOrString) { return isOlderThan(dateOrString, dayMs); }
export function isMoreThanAWeekAgo(dateOrString) { return isOlderThan(dateOrString, weekMs); }
export function isMoreThanAMonthAgo(dateOrString) { return isOlderThan(dateOrString, monthMs); }

function getTodayBorder() {
    const d = new Date();
    // 6 in the morning, local time. setHours is local time aware!
    d.setHours(6);
    d.setMinutes(0);
    d.setSeconds(0);
    return d.toISOString();
}
function getYesterdayBorder() {
    const d = new Date(new Date().getTime() - dayMs);
    // 6 in the morning, local time. setHours is local time aware!
    d.setHours(6);
    d.setMinutes(0);
    d.setSeconds(0);
    return d.toISOString();
}
function getWeekBorder() {
    const d = new Date(new Date().getTime() - weekMs);
    return d.toISOString();
}
function getMonthBorder() {
    // const d = new Date(new Date().getTime() - monthMs);
    const d = new Date(- monthMs);
    return d.toISOString();
}
function get3MonthBorder() {
    // const d = new Date(new Date().getTime() - 3 * monthMs);
    const d = new Date(- 3 * monthMs);
    return d.toISOString();
}
function getYearBorder() {
    // const d = new Date(new Date().getTime() - yearMs);
    const d = new Date(- yearMs);
    return d.toISOString();
}
function getNoBorder() {
    const d = new Date(- 1000 * yearMs);
    return d.toISOString();
}

export const keyAndTimes = {}
export const keyAndTimesOrder = [];
const addKeyTime = (label, timeBorder) => {
    keyAndTimes[label] = {
        timeBorder,
        items: [],
        divContainer: mkElt("div", { class: "older-rem-container" }),
    }
    keyAndTimesOrder.push(label);
}
addKeyTime("Today", getTodayBorder());
addKeyTime("Yesterday", getYesterdayBorder());
addKeyTime("Last Week", getWeekBorder());
addKeyTime("Last Month", getMonthBorder());
addKeyTime("Last 3 Months", get3MonthBorder());
addKeyTime("Last Year", getYearBorder());
addKeyTime("Older", getNoBorder());
// console.log({ keyAndTimesOrder });
// console.log({ keyAndTimes });

/*
function dateMidnight() {
    const mn = new Date();
    mn.setHours(24);
    mn.setMinutes(59 + tzMin);
    mn.setUTCSeconds(59);
    return mn;
}
*/
function formatNiceTime(dateWhenTo) {
    const whenOurTime = toOurTime(dateWhenTo);
    let showWhen = whenOurTime;
    if (isToday(whenOurTime)) {
        showWhen = "Today " + whenOurTime.slice(-5);
    } else if (isTomorrow(whenOurTime)) {
        showWhen = "Tomorrow " + whenOurTime.slice(-5);
    } else if (isYesterday(whenOurTime)) {
        showWhen = "Yesterday " + whenOurTime.slice(-5);
    }
    return showWhen;
}


const defaultTimers = {
    "20 seconds": 1000 * 20,
    "10 minutes": -minMs * 10,
    "1 hour": -hourMs,
    "1 day": dayMs,
    "1 week": weekMs,
    "2 months": monthMs * 2,
    "1 year": yearMs,
};

function seconds2ymdhms(sec) {
    const d = new Date(sec * 1000);
    console.log(d.toISOString());
    const yy = d.getUTCFullYear() - 1970;
    const mo = d.getUTCMonth();
    const dd = d.getUTCDate();
    const hh = d.getUTCHours();
    const mi = d.getUTCMinutes();
    const ss = d.getUTCSeconds();
    return { yy, mo, dd, hh, mi, ss }
}
async function OLDaskForReminders(onlyMatched) {
    const modPWA = await import("pwa");
    const wb = await modPWA.getWorkbox();
    const matchValues = onlyMatched ? getHomeSearchValues() : undefined;
    wb.messageSW({ type: "CHECK_NOTIFY", msDelay: 2000, matchValues });
}
async function askForNotifySpecific(key, msDelay, afterMinutes, lbl, isShort) {
    // const msDelay = 10 * 1000;
    // const idEntry = "dummy";
    const modPWA = await import("pwa");
    const wb = await modPWA.getWorkbox();
    wb.messageSW({ type: "NOTIFY_SPECIFIC", msDelay, key, afterMinutes, lbl, isShort });
}

function dataRecordFieldsUnsaved() {
    return ["text", "title", "url"];
}
function dataRecordFieldsSaved() {
    return ["confRem", "flashcards", "images", "key", "text", "timers", "title", "url"];
}
function dataRecordAbitOldFields() {
    return ["confRem", "images", "key", "text", "timers", "title", "url"];
}
function dataRecordOldFields() {
    return ["images", "key", "text", "timers", "title", "url"];
}
function dataRecordVeryOldFields() {
    return ["key", "text", "timers", "title", "url"];
}
function checkRecordFields(record) {
    const keys = Object.keys(record).sort();
    const isUnsaved = !keys.includes("key");
    const comparewith = isUnsaved ? dataRecordFieldsUnsaved() : dataRecordFieldsSaved();
    const jk = JSON.stringify(keys);
    if (jk === JSON.stringify(comparewith)) return;
    if (jk === JSON.stringify(["confRem", "flashcards", "images", "key", "tags", "text", "timers", "title", "url"])) return;
    if (jk === JSON.stringify(["confRem", "flashcards", "images", "key", "text", "timers", "title", "url"])) return;
    // if (jk === JSON.stringify(["confRem", "images", "key", "tags", "text", "timers", "title", "url"])) return;
    // if (JSON.stringify(keys) === JSON.stringify(dataRecordAbitOldFields())) return;
    if (jk === JSON.stringify(["confRem", "images", "key", "text", "timers", "title", "url"])) return;
    // if (JSON.stringify(keys) === JSON.stringify(dataRecordOldFields())) return;
    if (jk === JSON.stringify(["images", "key", "text", "timers", "title", "url"])) return;
    // if (JSON.stringify(keys) === JSON.stringify(dataRecordVeryOldFields())) return;
    if (jk === JSON.stringify(["key", "text", "timers", "title", "url"])) return;
    throw Error(`Some bad key in record: ${keys}`);
}


export async function mkEltInputRemember(record, headerTitle, saveNewNow) {
    const modMdc = await import("util-mdc");
    const modIsDisplayed = await import("is-displayed");
    const modClipboardImages = await import("images");
    const modMMhelpers = await import("mindmap-helpers");
    const divPasteImage = mkElt("div", { class: "div-paste-image" });

    if (record) checkRecordFields(record);

    // const eltRemember = mkElt("div", { class: "container-remember mdc-card" });
    const eltRemember = mkElt("div", { class: "container-remember" });
    if (headerTitle !== undefined) {
        const header = mkElt("h2", { class: "unsaved-marker" }, headerTitle);
        eltRemember.classList.add("unsaved-marker-container");
        eltRemember.classList.add("mdc-card");
        eltRemember.appendChild(header);
    }

    const divBannerTitle = mkElt("div", { class: "unsaved-marker has-title" }, "(title)");
    const btnBannerDelete = modMdc.mkMDCiconButton("delete_forever", "Delete");
    btnBannerDelete.classList.add("mdc-theme--secondary-bg");
    btnBannerDelete.addEventListener("click", errorHandlerAsyncEvent(async evt => {
        handleEvtDeleteRem(evt);
    }));
    const btnBannerCopy = modMdc.mkMDCiconButton("content_copy", "Copy to custom clipboard");
    btnBannerCopy.classList.add("mdc-theme--secondary-bg");
    btnBannerCopy.addEventListener("click", errorHandlerAsyncEvent(async evt => {
        add2CustomClipboard(btnBannerCopy);
    }));
    const divBannerBtns = mkElt("div", undefined, [btnBannerCopy, btnBannerDelete]);
    divBannerBtns.style = `
        display: flex;
        flex-direction: column;
    `;
    const firstImageBlob = record?.images ? record.images[0] : null;
    const eltImg = firstImageBlob ? mkImageThumb(firstImageBlob) : "";
    const divBanner = mkElt("h3", { class: "rem-banner-title" }, [
        eltImg,
        divBannerTitle,
        // btnBannerDelete,
        divBannerBtns
    ]);
    if (firstImageBlob) divBanner.classList.add("has-image");
    eltRemember.appendChild(divBanner);

    async function handleEvtDeleteRem(evt) {
        const btn = evt.target;
        const keySaved = getCreatedEltTime();
        const keyCard = btn.closest(".container-remember");
        const subjectCard = btn.closest(".subject-card");
        const didDelete = await deleteEntry(keySaved, keyCard);
        if (!didDelete) return;
        subjectCard?.remove();
    }

    // const divSliConfidence = mkElt("div");

    const sliConfidence = await modMdc.mkMDCslider(1, 5, 1, 1, "Confidence", onChangeSlider, onInputSlider, false);
    // const sliConfidence = await mkSliderInContainer(divSliConfidence, 1, 5, 1, 1, "Confidence", onChangeSlider, onInputSlider, false);

    sliConfidence.classList.add("confidence-slider");
    sliConfidence.classList.add("mdc-my-slider-colors-fix");
    const indStatus = mkStatusIndicator(5, "height");
    modIsDisplayed.waitUntilDisplayed(sliConfidence).then(async () => {
        const mdc = await sliConfidence.myPromMdc;
        mdc.setDisabled(true);
    });

    function onChangeSlider(evt) {
        console.log("onChange", evt);
        const val = sliConfidence.myMdc.getValue();
        indStatus.mySet(val);
        restartButtonStateTimer();
    }

    function onInputSlider(evt) { console.log("onInput", evt); }

    const btnEditConfidence = modMdc.mkMDCiconButton("edit", "Edit");
    btnEditConfidence.classList.add("btn-edit-item-confidence");
    btnEditConfidence.addEventListener("click", evt => {
        modIsDisplayed.waitUntilDisplayed(sliConfidence).then(async () => {
            const mdc = await sliConfidence.myPromMdc;
            const val = mdc.getValue();
            const q =
                val == 1 ? "Are you now more confident you will remember this?"
                    :
                    (val == 5 ? "Are you now less confident you will remember this?"
                        :
                        "Have your confidence about remembering this changed?"
                    );
            const dlg = modMdc.mkMDCdialogConfirm(q, "yes", "no");
            const yn = await dlg;
            console.log({ yn });
            if (!yn) return;
            function addBtnAgain() {
                btnEditConfidence.style.display = "block"
                mdc.setDisabled(true);
            }
            mdc.setDisabled(false);
            btnEditConfidence.style.display = "none";
            setTimeout(() => { addBtnAgain(); }, 10 * 1000);
        });
    });
    const divStatus = mkElt("div", { class: "div-confidence-status" },
        [indStatus, btnEditConfidence, sliConfidence]
        // [indStatus, btnEditConfidence, divSliConfidence]
    );
    const divSlider = mkElt("div", { class: "mdc-card card-confidence-slider" }, [
        divStatus,
        "Will you remember this next week?",
    ]);
    eltRemember.appendChild(divSlider);
    // We can't wait here because slider is not yet in DOM
    (async () => {
        const mdcSlider = sliConfidence.myMdc || await sliConfidence.myPromMdc;
        let confVal = record?.confRem || 1;
        // FIX-ME:
        confVal = Math.min(confVal, 5);
        confVal = Math.max(confVal, 1);
        mdcSlider.setValue(confVal);
        indStatus.mySet(confVal);
    })();

    const msNow = Date.now();
    function getRecordCreated() {
        if (!record?.key) return;
        const strIsoTime = record.key;
        const date = new Date(strIsoTime);
        return date.getTime();
    }
    const createdMs = getRecordCreated() || msNow;

    const thCreated = mkElt("th", { colspan: 3 });

    const divHowReminders = mkElt("div", undefined, [
        // divOldManualReminders,
        mkElt("p", undefined, "At the top right there is a button for reminders:"),
        mkElt("p", undefined, mkElt("img", { src: "/img/btn-check-reminders.png", width: "130" })),
    ]);

    const divTimers = mkElt("div", { class: "timers-container" }, [divHowReminders]);
    const icoCallToAction = modMdc.mkMDCicon("call_to_action");
    icoCallToAction.classList.add("mdc-theme--primary");
    const detTimers = mkElt("details", { class: "det-timers mdc-card" }, [
        mkElt("summary", { class: "no-closed-marker" }, [
            icoCallToAction,
            " Reminders"
        ]),
        divTimers
    ]);

    //// Images
    // Iframes can't be used because of CORS
    // Google Photos app can't be used because there is no easy way to get a direct link to an image.
    // However the web version at https://photos.google.com/ can be used.
    // Images on web pages can be long pressed and copied.
    //
    // And here is how to take care of paste (but you can't use Gboard on this):
    // https://htmldom.dev/paste-an-image-from-the-clipboard/
    // Handle the `paste` event
    const divPasteDebug = mkElt("div", { class: "div-paste-debug" }, mkElt("h3", undefined, "paste debug"));
    let debugPasteLineOn = true;
    function debugPasteLine(txt) {
        if (!debugPasteLineOn) return;
        divPasteDebug.appendChild(mkElt("div", undefined, txt));
    }

    function mkDivPasteButton() {
        // const btn = modMdc.mkMDCbutton("Add image", "raised");
        // export function mkMDCfab(eltIcon, title, mini, extendTitle) 
        const iconAdd = modMdc.mkMDCicon("add");
        const btn = modMdc.mkMDCfab(iconAdd, "Add Image", true);
        // btn.classList.add("mdc-theme-secondary");
        btn.classList.add("btn-add-image");
        btn.addEventListener("click", errorHandlerAsyncEvent(async evt => {
            const modImages = await import("images");
            debugPasteLine(`addPasteButton event 0`);
            const clipboardAccessOk = await modImages.isClipboardPermissionStateOk();
            if (clipboardAccessOk == false) {
                debugPasteLine(`addPasteButton event 1`);
                modImages.alertHowToUnblockPermissions();
                return;
            }
            debugPasteLine(`addPasteButton event 2`);
            const resultImageBlobs = await modImages.getImagesFromClipboard();
            if (Array.isArray(resultImageBlobs)) {
                if (resultImageBlobs.length == 0) {
                    modImages.alertNoImagesFound();
                } else {
                    const toDiv = divPasteImage;
                    const maxBlobOutSize = 40 * 1000;
                    for (const blob of resultImageBlobs) {
                        // const eltImgCard = await modImages.mkImageCardFromBigImage(blob, toDiv, maxBlobOutSize);
                        const eltImgCard = await modImages.mkImageCardFromBigImage(blob, maxBlobOutSize);
                        modImages.addFunOnRemoveImageCard(eltImgCard, restartButtonStateTimer);
                        toDiv.appendChild(eltImgCard);
                    }
                    restartButtonStateTimer();
                }
            } else {
                // Should be an error object
                const err = resultImageBlobs;
                console.log({ err });
                if (!err instanceof Error) {
                    debugger;
                    throw Error(`resultImages is not instanceof Error`);
                }
                switch (err.name) {
                    case "NotAllowedError":
                        handleClipboardReadNotAllowed();
                        break;
                    case "DataError":
                        modImages.alertNoImagesFound();
                        break;
                    default:
                        debugger;
                        throw Error(`Unknown error name: ${err.name}, ${err.message}`);
                }
            }



            function handleClipboardReadNotAllowed() {
                modMdc.mkMDCdialogAlert("Please allow reading clipboard");
            }


        }));
        const divImages = mkElt("div", { class: "div-images" });
        divImages.appendChild(btn);
        divImages.appendChild(divPasteImage);
        const icoArtTrack = modMdc.mkMDCicon("art_track");
        icoArtTrack.classList.add("mdc-theme--primary");
        const icoPhotoLibrary = modMdc.mkMDCicon("photo_library");
        icoPhotoLibrary.classList.add("mdc-theme--primary");
        const icoHasIndicator = mkHasItemsIndicator();
        const sumImages = mkElt("summary", { class: "no-closed-marker" }, [
            // icoArtTrack,
            icoPhotoLibrary,
            " Images ",
            icoHasIndicator
        ]);
        function addImages() {
            if (record) {
                const images = record.images;
                if (images) {
                    images.forEach(async imageBlob => {
                        // mkImageCard(divImages, imageBlob, "blob-to-store", undefined, restartButtonStateTimer);
                        const eltImageCard = await modClipboardImages.mkImageCard(
                            imageBlob, "blob-to-store",
                            undefined,
                            // restartButtonStateTimer
                        );
                        modClipboardImages.addFunOnRemoveImageCard(eltImageCard, restartButtonStateTimer)
                        divImages.appendChild(eltImageCard);
                    });
                    // restartButtonStateTimer();
                }
            }
        }
        addImages(); // FIX-ME: delay until opening <details>!

        const detImages = mkElt("details", { class: "images-card mdc-card" }, [
            sumImages,
            divImages
        ])
        return detImages;
    }
    function mkHasItemsIndicator() {
        const icoF1 = modMdc.mkMDCicon("filter_1");
        icoF1.classList.add("has-indicator");
        return icoF1;
    }

    async function mkEltTags() {
        const iconTag = modMdc.mkMDCicon("tag");
        iconTag.classList.add("mdc-theme--primary");
        const icoHasIndicator = mkHasItemsIndicator();
        const eltSummary = mkElt("summary", { class: "no-closed-marker" }, [
            iconTag,
            " Tags ",
            icoHasIndicator
        ]);
        const eltOurTags = mkElt("div", { class: "tags-items" });
        const eltTags = mkElt("div", { class: "elt-tags" }, eltOurTags);
        const detTags = mkElt("details", { class: "mdc-card flashcards-card" }, [
            eltSummary, eltTags
        ]);
        function addToOurTags(tag) {
            // FIX-ME
            const eltTag = mkElt("span", { class: "tag-in-our-tags" }, `#${tag}`);
            eltOurTags.appendChild(eltTag);
        }
        function addOurTags() {
            if (record?.tags) {
                record.tags.forEach(async tag => { addToOurTags(tag) });
            }
        }
        addOurTags();
        const btnAdd = mkBtnAddTag();
        function mkBtnAddTag() {
            const iconAdd = modMdc.mkMDCicon("tag");
            const btnFab = modMdc.mkMDCfab(iconAdd, "Add tag", true);
            btnFab.classList.add("fab-add-flashcard");
            btnFab.addEventListener("click", errorHandlerAsyncEvent(async evt => {
                // const eltTag = mkElt("span", undefined, "#tag");
                // eltTags.insertBefore(eltTag, btnFab)
                const ourOldTags = [];
                updateOurOldTags();
                function updateOurOldTags() {
                    console.log("updateOurOldTags");
                    ourOldTags.length = 0;
                    evt.target.closest(".elt-tags")
                        .querySelector(".tags-items")
                        .querySelectorAll(".tag-in-our-tags")
                        .forEach(span => {
                            const tag = span.textContent.substr(1);
                            ourOldTags.push(tag);
                        });
                }
                const divAllTags = mkElt("div", { class: "tags-list" });

                // const dbFc4i = await getDbFc4i();
                const dbFc4i = await import("db-fc4i");
                let arrAllTags = await dbFc4i.getDbTagsArr();
                const arrUnusedTags = await dbFc4i.getUnusedTags();

                const outlineUnused = "4px dotted yellow";
                const btnDeleteUnused =
                    arrUnusedTags.length == 0 ? "" : modMdc.mkMDCbutton("Delete Unused", "outlined");
                if (arrUnusedTags.length != 0)
                    btnDeleteUnused.addEventListener("click", errorHandlerAsyncEvent(async evt => {
                        alert("not ready");
                        async function deleteTag(evt) {
                            console.log("deleteTag", { evt });
                            const btnTag = evt.target;
                            btnTag.style.outline = "2px dotted red";
                            btnTag.style.transition = "opacity 1s, transform 1s";
                            const doDelete = await modMdc.mkMDCdialogConfirm(
                                mkElt("span", undefined, [
                                    ` Delete the unused tag `,
                                    mkElt("b", undefined, `#${btnTag.dataset.tagname}`),
                                    "?"
                                ])
                            );
                            console.log({ doDelete });
                            if (doDelete) {
                                btnTag.style.opacity = 0.5;
                                btnTag.style.scale = 0.1;
                                btnTag.addEventListener("transitionend", errorHandlerAsyncEvent(async evt => {
                                    const tag = btnTag.dataset.tagname;
                                    btnTag.remove();
                                    console.log("transitionend", tag);

                                    // const tags = await getDbTagsArr();
                                    // const dbFc4i = await getDbFc4i();
                                    const dbFc4i = await import("db-fc4i");
                                    const tags = await dbFc4i.getDbTagsArr();

                                    console.log({ tags });
                                    const newTags = tags.filter(t => t != tag);
                                    console.log({ newTags });
                                    await dbFc4i.setDbTagsArr(newTags);
                                    // nUnused--;
                                    // spanUnused.textContent = `${nUnused}`;
                                    // checkUnusedTags();
                                }));
                            } else {
                                btnTag.style.outline = "unset";
                            }
                        }
                        const divUnused = mkElt("div");
                        arrUnusedTags.forEach(tag => {
                            const icon = modMdc.mkMDCicon("delete_forever");
                            const eltTag = mkElt("button", { class: "tag-in-our-tags tag-button" }, [`#${tag}`, icon]);
                            eltTag.dataset.tagname = tag;
                            eltTag.addEventListener("click", evt => deleteTag(evt));
                            divUnused.appendChild(eltTag);
                        });
                        const pUnused = mkElt("p", undefined, [
                            "Unused tags: ",
                            mkElt("div", undefined, "Click on a tag to delete it.")
                        ]);

                        const body = mkElt("div", undefined, [
                            mkElt("h2", undefined, "Delete unused tags"),
                            pUnused,
                            divUnused,
                        ]);
                        modMdc.mkMDCdialogAlert(body, "close");

                    }));
                const divTheUnusedTags = mkElt("div");
                const sumUnused = mkElt("summary", undefined, "Show unused tags");
                const btnCheckUnused = mkElt("button", undefined, "Check");
                btnCheckUnused.addEventListener("click", evt => refreshUnusedTags());
                const detUnused = mkElt("details", undefined,
                    [sumUnused, divTheUnusedTags, "not ready", btnCheckUnused]);
                // detUnused.style.display = "none";

                const divUnused = mkElt("div", undefined, detUnused);
                async function refreshUnusedTags() {
                    const arrUnusedTags = await dbFc4i.getUnusedTags();
                    console.log("refreshUnusedTags", arrUnusedTags);
                    if (arrUnusedTags.length == 0) {
                        // detUnused.style.display = "none";
                    } else {
                        // delete detUnused.style.display;
                        detUnused.style.display = null;
                    }
                }

                async function refreshArrAllTags() {
                    // const dbFc4i = await getDbFc4i();
                    const dbFc4i = await import("db-fc4i");
                    const arrAllTags = await dbFc4i.getDbTagsArr();
                    return arrAllTags;
                }
                arrAllTags.forEach(tag => {
                    const checked = ourOldTags.includes(tag) ? true : false;
                    const unused = arrUnusedTags.includes(tag) ? true : false;
                    // const eltTag = mkEltTagChkbox(tag, checked);
                    const eltTag = mkEltTagSelector(tag, checked);
                    if (unused) eltTag.style.outline = outlineUnused;
                    divAllTags.appendChild(eltTag);
                });
                const inpNewTag = mkElt("input", { type: "text", id: "inp-new-tag" });
                const btnNewTag = modMdc.mkMDCbutton("Add", "raised");
                btnNewTag.addEventListener("click", errorHandlerAsyncEvent(async evt => {
                    const newTag = inpNewTag.value.trim();
                    if (newTag.length == 0) {
                        inpNewTag.focus();
                        return;
                    }
                    const reName = /^[a-z0-9_-]*$/i;
                    if (!reName.test(newTag)) {
                        await modMdc.mkMDCdialogAlert("Invalid characters (letters, digits, -, _)");
                        inpNewTag.focus();
                        return;
                    };
                    arrAllTags = await refreshArrAllTags();
                    refreshUnusedTags();
                    if (arrAllTags.includes(newTag)) {
                        await modMdc.mkMDCdialogAlert("This tag name already exists");
                        inpNewTag.focus();
                        return;
                    }
                    // const eltNewTag = mkEltTagChkbox(newTag, true);
                    const eltNewTag = mkEltTagSelector(newTag, true);
                    divAllTags.appendChild(eltNewTag);
                    arrAllTags.push(newTag);
                    arrAllTags.sort();
                    // const dbFc4i = await getDbFc4i();
                    dbFc4i.setDbTagsArr(arrAllTags);
                    saveAnyTagChanges();
                }));

                divAllTags.addEventListener("change", evt => {
                    console.log("divAllTags", evt);
                    saveAnyTagChanges();
                    setTimeout(refreshUnusedTags, 3000);
                });
                const divNewTag = mkElt("div", { id: "div-new-tag" }, [
                    "New:", inpNewTag, btnNewTag
                ]);
                const body = mkElt("div", { id: "div-change-tags" }, [
                    mkElt("h3", undefined, "Change Tags"),
                    btnDeleteUnused,
                    divAllTags,
                    divNewTag,
                    divUnused,
                ]);
                // const done = await modMdc.mkMDCdialogConfirm(body, "Done", "Cancel");
                await modMdc.mkMDCdialogAlert(body, "Close");
                // if (done) { saveAnyTagChanges(); }
                function saveAnyTagChanges() {
                    const ourNewTags = [];
                    const arrTagChkBox = [...divAllTags.querySelectorAll(".tag-in-our-tags")];
                    for (let i = 0, len = arrTagChkBox.length; i < len; i++) {
                        const span = arrTagChkBox[i];
                        const chk = span.firstElementChild;
                        const checked = chk.checked;
                        const tag = span.textContent.substr(1);
                        // console.log({ span, chk, checked, tag });
                        if (checked) { ourNewTags.push(tag); }
                    };
                    const tagsChanged = JSON.stringify(ourOldTags.toSorted()) != JSON.stringify(ourNewTags.toSorted());
                    updateOurOldTags();
                    console.log("saveAnyTagChanges", tagsChanged);
                    if (tagsChanged || true) {
                        eltOurTags.textContent = "";
                        ourNewTags.forEach(tag => addToOurTags(tag));
                        restartButtonStateTimer();
                    }
                }
            }));
            return btnFab;
        }

        eltTags.appendChild(btnAdd);
        return detTags;
    }
    async function mkEltFlashcards() {
        const modFlashcards = await import("flashcards");
        // const icoQA = modMdc.mkMDCicon("question_answer");
        const icoQA = modMdc.mkMDCicon("quiz");
        icoQA.classList.add("mdc-theme--primary");
        const icoHasIndicator = mkHasItemsIndicator();
        const eltSummary = mkElt("summary", { class: "no-closed-marker" }, [
            icoQA,
            " Flashcards ",
            icoHasIndicator
        ]);
        const eltCards = mkElt("div", { class: "flashcards-items flashcard-small" });
        const detFlashcards = mkElt("details", { class: "mdc-card flashcards-card" }, [
            eltSummary, eltCards
        ]);
        // FIX-ME "open"
        function addOurFlashcards() {
            if (record?.flashcards) {
                record.flashcards.forEach(async fc => {
                    const eltFC = await modFlashcards.mkEltFlashcard();
                    eltFC.mySet(fc.question, fc.answer, fc.conf);
                    eltCards.appendChild(eltFC);
                    // eltFC.myAddSlider();
                });
            }
        }
        addOurFlashcards();
        /*
        detFlashcards.addEventListener("toggle", errorHandlerAsyncEvent(async evt => {
            if (eltCards.childElementCount > 1) return;
            if (detFlashcards.open) { addOurFlashcards(); }
        }));
        */
        const btnAdd = modFlashcards.mkBtnAddFlashcard(eltCards, restartButtonStateTimer);
        eltCards.appendChild(btnAdd);
        // eltRemember.appendChild(eltFlashcards);
        return detFlashcards;
    }

    function mkDetYourNotes() {
        const icoEditNote = modMdc.mkMDCicon("edit_note");
        icoEditNote.classList.add("mdc-theme--primary");
        const sumYN = mkElt("summary", { class: "no-closed-marker" }, [
            icoEditNote,
            " Your notes"
        ]);
        const taDesc = modMdc.mkMDCtextFieldTextarea(undefined, 8, 50);
        taDesc.classList.add("remember-text");
        taDesc.style.resize = "vertical";
        // taDesc.addEventListener("input", evt => { checkForUrl(); });
        convertTaDesc();
        async function convertTaDesc() {
            const idUpdatedGrowWrap = "updated-grow-wrap";
            const eltStyle = document.getElementById(idUpdatedGrowWrap);
            if (!eltStyle) await updateGrowWrap();
            async function updateGrowWrap() {
                await new Promise((resolve, reject) => {
                    const nMax = 300;
                    const msDelay = 10;
                    let n = 0;
                    const tmr = setInterval(() => {
                        if (n++ > nMax) {
                            clearInterval(tmr);
                            console.error("timeout when trying to convert taDesc");
                            reject("timeout when trying to convert taDesc");
                        }
                        if (taDesc.isConnected) {
                            clearInterval(tmr);
                            console.log(`n=${n}, ${nMax}`);
                            resolve();
                        }
                    }, msDelay);
                });
                const cssTaDesc = getComputedStyle(taDesc);
                const strPropAfter = `
                Xcursor: text;
                font-family: Roboto, sans-serif;
                font-style: normal;
                font-weight: 400;
                letter-spacing: 0.15px;
                line-height: 1.5rem;
                margin-bottom: 9px;
                margin-left: 0;
                margin-right: 0;
                margin-top: 23px;
                min-height: 24px;
                min-width: 0;
                padding-bottom: 0;
                padding-left: 16px;
                padding-right: 16px;
                padding-top: 0px;
                text-align: start;
                text-decoration-line: none;
                text-decoration-style: solid;
                text-decoration-thickness: auto;
                text-indent: 0;
                text-rendering: auto;
                text-shadow: none;
                text-transform: none;
                white-space: pre-wrap;
                width: 100%;
                word-spacing: 0;
                `;
                const ma = strPropAfter.matchAll(/^\s*(.*):/gm)
                const arr = [...ma];
                const arrProp = arr.map(m => m[1]);
                let strCss = ".grow-wrap::after {\n";
                arrProp.forEach(nm => {
                    const val = cssTaDesc.getPropertyValue(nm);
                    strCss += `${nm}: ${val};\n`;
                });
                // For MDC:
                strCss += "padding-top: 2rem;\n";
                // strCss += "margin-top: 1rem;\n";
                strCss += "}\n";
                // strCss += ".grow-wrap>textarea { background-color: darkgoldenrod; }\n";
                // console.log({ strCss });
                // console.log(strCss);
                const eltStyle = mkElt("style", { id: idUpdatedGrowWrap }, strCss);
                document.head.appendChild(eltStyle);
            }
        }


        const icon = modMdc.mkMDCicon("link");
        const btnUrl = modMdc.mkMDCbutton("Show links", "raised", icon);
        btnUrl.title = "Show links found in Your notes";
        // btnUrl.classList.add("icon-button-40");
        btnUrl.classList.add(...themePrimary);
        const s = [
            "display: flex",
            "gap: 20px"
        ];
        const divURL = mkElt("div", { style: s.join(";") }, btnUrl);
        divURL.style.marginTop = "10px";

        const btnTest = mkElt("button", undefined, "Test");
        // divURL.appendChild(btnTest);
        const aTest = mkElt("a", {
            href: "https://css-tricks.com/the-cleanest-trick-for-autogrowing-textareas/",
            target: "_blank"
        }, "Test");
        // divURL.appendChild(aTest);

        const ourUrls = [];
        btnUrl.addEventListener("click", evt => {
            checkForUrl();
            const body = mkElt("div");
            const eltYN = mkElt("span", { style: "font-style:italic" }, "Your Notes");
            if (ourUrls.length == 0) {
                body.appendChild(mkElt("h4", undefined, [
                    "Found no links in ", eltYN, "."
                ]));
            } else {
                body.appendChild(mkElt("h4", undefined, [
                    "Found these links in ", eltYN, ":"
                ]));
                ourUrls.forEach(url => {
                    const a = mkElt("a", { href: url }, url);
                    const diva = mkElt("div", { class: "div-a-url" }, a);
                    body.appendChild(mkElt("div", undefined, diva));
                });
            }
            modMdc.mkMDCdialogAlert(body, "Close");
        })
        function checkForUrl() {
            const reHttps = /(?:^|\s)(https:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()\[\]@:%_\+.~#?&\/=]*))(?:$|\s)/g;
            const m = [...taDesc.value.matchAll(reHttps)];
            // btnUrl.disabled = m.length == 0;
            ourUrls.length = 0;
            m.forEach(m2 => { ourUrls.push(m2[1]) });
            console.log("%cHTTPS", "color:red", { m, ourUrls });
        }
        const strDescription = record ? record.text : "";
        const tafDesc = modMdc.mkMDCtextareaField("Your Notes", taDesc, strDescription);

        // const tafDesc = modMdc.mkMDCtextareaField("Your Notes", taDesc);
        // modMdc.mkMDCtextareaGrow(tafDesc);
        // taDesc.value = strDescription;
        btnTest.addEventListener("click", evt => {
            btnTest.disabled = true;
            modMdc.mkMDCtextareaGrow(tafDesc);
        });
        btnTest.disabled = true;
        modMdc.mkMDCtextareaGrow(tafDesc);

        // checkForUrl();

        const detYN = mkElt("details", { class: "mdc-card" }, [sumYN, tafDesc, divURL]);
        return detYN;
    }

    const restartButtonStateTimer = (() => {
        // console.log("%cCreating restartButtonStateTimer function", "background: orange");
        let tmr;
        const timeout = 1000;
        return () => {
            // console.log("%crestarting restartButtonStateTimer", "background: orange");
            clearTimeout(tmr);
            tmr = setTimeout(setButtonStates, timeout);
        }
    })();

    // mkdetyour
    // "toggle"
    function mkDetMindmaps() {
        const icoMM = modMdc.mkMDCicon("account_tree");
        icoMM.classList.add("mdc-theme--primary");
        const sumMM = mkElt("summary", { class: "no-closed-marker" }, [
            icoMM,
            " Mindmaps"
        ]);
        /*
        const divMM = mkDivCustomCopy4Mindmaps();
        const eltIcon = modMdc.mkMDCicon("list_alt_add");
        const btnFab = modMdc.mkMDCfab(eltIcon, "List mindmaps or create new", true);
        btnFab.classList.add("fab-add-mindmap-1");
        btnFab.addEventListener("click", errorHandlerAsyncEvent(async evt => {
            await modMMhelpers.createAndShowNewMindmap("/fc4i-mindmaps.html");
        }));
        divMM.appendChild(btnFab);
        */
        const divOurMM = mkElt("div");

        const btnAdd2mmClipB = modMdc.mkMDCiconButton("content_copy", "Copy this item to mindmap clipboard");
        btnAdd2mmClipB.addEventListener("click", errorHandlerAsyncEvent(async evt => {
            const key = btnAdd2mmClipB.closest(".container-remember").dataset.key;
            console.log("clicked add", key);
            const modEditFc4iMM = await import("jsmind-edit-spec-fc4i");
            modEditFc4iMM.addProviderFc4i();
            const objAdded = modMMhelpers.addJsmindCopied4Mindmap(key, "fc4i");
            modMMhelpers.dialogAdded2CustomClipboard(objAdded);
        }));

        // FIX-ME: make this an <a>-button:
        const btnNewMMfromRec = modMdc.mkMDCiconButton("library_add", "New mindmap from this item");
        btnNewMMfromRec.addEventListener("click", errorHandlerAsyncEvent(async evt => {
            const ans = await modMdc.mkMDCdialogConfirm("Create new mindmap with this item as root?");
            if (ans != true) return;
            const keyRec = btnAdd2mmClipB.closest(".container-remember").dataset.key;
            const dbFc4i = await import("db-fc4i");
            const rec = await dbFc4i.getDbKey(keyRec);
            debugger;
            const rootTopic = rec.title;
            const jsMindMap = modMMhelpers.getNewMindmap(rootTopic);
            const d0 = jsMindMap.data[0];
            d0.shapeEtc = {};
            d0.shapeEtc.nodeCustom = { key: keyRec, provider: "fc4i" };
            const keyMM = jsMindMap.meta.name;
            const dbMindmaps = await import("db-mindmaps");
            await dbMindmaps.DBsetMindmap(keyMM, jsMindMap);
            modMMhelpers.showMindmap(keyMM);
        }));
        const divBtnMM = mkElt("div", undefined, [btnAdd2mmClipB, btnNewMMfromRec]);
        divBtnMM.style = `
            display: flex;
            flex-direction: row;
            gap: 10px;
            width: fit-content;
            padding: 0;
        `;
        divBtnMM.classList.add("mdc-card");

        const detMM = mkElt("details", { class: "mdc-card" }, [sumMM, divOurMM, divBtnMM]);
        detMM.addEventListener("toggle", errorHandlerAsyncEvent(async evt => {
            if (detMM.open) {
                const key = detMM.closest(".container-remember").dataset.key;
                const provider = "fc4i";
                const arrMindmaps = await modMMhelpers.getMindmapsHits(key);
                const len = arrMindmaps.length;
                if (len == 0) {
                    divOurMM.textContent = "Not found in any mindmaps.";
                } else {
                    const wrd = len == 1 ? "mindmap" : "mindmaps";
                    divOurMM.textContent = `Found in ${len} ${wrd}:`;
                    const divListMM = mkElt("div");
                    divListMM.style = `
                        display: flex;
                        flex-direction: column;
                        gap: 10px;
                        margin-top: 10px;
                        margin-left: 10px;
                        margin-bottom: 20px;
                    `;
                    divOurMM.appendChild(divListMM);
                    arrMindmaps.forEach(mmRec => {
                        const mm = mmRec.jsmindmap;
                        const mkey = mm.key;
                        const d0 = mm.data[0];
                        const topic = d0.topic;
                        console.log({ mm, mkey, d0 });
                        if (d0.id != "root") throw Error(`data[0] is not "root"`);
                        // const eltA = funMkEltLinkMindmap(topic, key, hits, provider);
                        const hits = mmRec.hits;
                        const eltA = modMMhelpers.mkEltLinkMindmapA(topic, mkey, hits, provider);
                        const divA = mkElt("div", undefined, eltA);
                        divA.style = `
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            width: 60%;
                        `;
                        divListMM.appendChild(divA);
                    });
                }
            }
        }));
        return detMM;
    }

    async function add2CustomClipboard(btnAdd) {
        const key = btnAdd.closest(".container-remember").dataset.key;
        console.log("clicked add", key);
        const modEditFc4iMM = await import("jsmind-edit-spec-fc4i");
        modEditFc4iMM.addProviderFc4i();
        const objAdded = modMMhelpers.addJsmindCopied4Mindmap(key, "fc4i");
        modMMhelpers.dialogAdded2CustomClipboard(objAdded);
    }

    function mkDivCustomCopy4Mindmaps() {
        // const btnAdd = modMdc.mkMDCbutton("Copy to", "raised");
        const btnAdd = modMdc.mkMDCiconButton("content_copy", "Copy to");
        // const aURLorig = modMdc.mkMDCiconButton("link", "Go to this item source page (aURLorig)");
        btnAdd.addEventListener("click", errorHandlerAsyncEvent(async evt => {
            add2CustomClipboard(btnAdd);
        }));
        // const btnFind = modMdc.mkMDCbutton("Find in", "raised");
        const btnFind = modMdc.mkMDCiconButton("search", "Find in mindmaps");
        btnFind.addEventListener("click", errorHandlerAsyncEvent(async evt => {
            const key = btnFind.closest(".container-remember").dataset.key;
            console.log("clicked find", key);
            // searchMindmaps(key);
            const modJsEditCommon = await import("jsmind-edit-common");
            const modEditFc4iMM = await import("jsmind-edit-spec-fc4i");
            modEditFc4iMM.addProviderFc4i();
            modJsEditCommon.dialogFindInMindMaps(key, "fc4i");
        }));
        const div = mkElt("div", undefined, [
            btnAdd,
            btnFind
        ]);
        div.style.display = "flex";
        div.style.flexDirection = "column";
        div.style.gap = "10px";
        div.style.position = "relative";
        return div;
    }

    const divTools = mkElt("div", { id: "div-tools" });
    const icoHandyman = modMdc.mkMDCicon("handyman");
    icoHandyman.classList.add("mdc-theme--secondary");
    icoHandyman.style.fontSize = "unset";
    const detTools = mkElt("details", { class: "mdc-card mdc-theme--primary-bg" }, [
        mkElt("summary", undefined, [
            icoHandyman,
            " Tools to help you remember"
        ]),
        divTools
    ]);
    divTools.appendChild(mkDetYourNotes());
    divTools.appendChild(mkDivPasteButton());
    divTools.appendChild(await mkEltTags());
    divTools.appendChild(mkDetMindmaps());
    divTools.appendChild(await mkEltFlashcards());
    divTools.appendChild(detTimers);
    // divTools.appendChild(mkDivCustomCopy4Mindmaps());

    eltRemember.appendChild(mkEltSource());
    eltRemember.appendChild(detTools);
    // eltRemember.appendChild(addImageInput()); // Old, not used
    await addTimers();
    eltRemember.appendChild(mkDivButtons());

    const myRemember = new ScreenRemember(eltRemember, saveNow);
    if (saveNewNow) {
        // FIX-ME: MutationObserver?
        await new Promise((resolve, reject) => {
            let tmr;
            let n = 0;
            function ready() {
                resolve();
                observer.disconnect();
            }
            function restartTimer() {
                // console.log(`observer callBack restartTimer, ${n}`);
                if (n++ > 100) { ready(); return; }
                clearTimeout(tmr);
                tmr = setTimeout(ready, 100);
            }
            restartTimer();
            function callBack(mutList, observer) {
                restartTimer();
            }
            const observer = new MutationObserver(callBack);
            const config = { childList: true, characterData: true, subtree: true, attributes: true, };
            observer.observe(eltRemember, config);
        });
        saveNow();
    } else {
        myRemember.setSaveButtonState(false);
    }
    eltRemember.addEventListener("input", evt => {
        // console.log("%c eltRemember input event", "color: red;");
        restartButtonStateTimer();
    });
    async function setButtonStates() {
        const currentValue = await myRemember.getPromCurrentValue();
        if (currentValue == undefined) {
            console.log("%csetButtonState, undefined", "color: green",);
            myRemember.setSaveButtonState(false);
            return;
        }
        const initialValue = await myRemember.getPromInitialValue();
        const strCurrent = JSON.stringify(currentValue);
        const strInitial = JSON.stringify(initialValue);
        const somethingToSave = strCurrent != strInitial;
        console.log("%csetButtonState", "color: green", { somethingToSave });
        myRemember.setSaveButtonState(somethingToSave);
    }

    return eltRemember;

    async function saveNow() {
        // restartRefreshSearchTimer();
        // const eltSearchBanner = document.getElementById("h3-search-banner")
        // eltSearchBanner?.checkSearchNeedsRefresh();

        const keySaved = getCreatedEltTime();
        const key = keySaved || new Date().toISOString();
        const val = await myRemember.getPromCurrentValue();
        val.key = key;
        // https://stackoverflow.com/questions/11876175/how-to-get-a-file-or-blob-from-an-object-url
        const imageUrls = val.images;
        const imageBlobs = [];
        for (let i = 0; i < imageUrls.length; i++) {
            const url = imageUrls[i];
            const blob = await fetch(url).then(r => r.blob());
            console.log({ blob });
            imageBlobs.push(blob);
        }
        val.images = imageBlobs;

        // const db = await getDb();
        // We now use val.key as db key
        // const res = await db.put(idbStoreName, val);
        const dbFc4i = await import("db-fc4i");
        const res = await dbFc4i.setDbKey(key, val);
        console.warn("saveNow", { res });
        myRemember.setSaveButtonState(false);
        // FIX-ME: initialval
        myRemember.resetPromInitialValue();
        if (!keySaved) setCreatedEltTime(key);
    }
    function mkDivButtons() {
        const btnSave = modMdc.mkMDCbutton("Save", "raised");
        btnSave.classList.add("save-button");
        const btnDelete = modMdc.mkMDCbutton("Delete", "raised");
        btnDelete.classList.add("mdc-theme--secondary-bg");
        // const btnCancel = modMdc.mkMDCbutton("Cancel", "raised");
        // btnCancel.classList.add("mdc-theme--secondary-bg");


        btnSave.addEventListener("click", async () => {
            console.log("clicked", { myRemember });
            saveNow();
        });
        btnDelete.addEventListener("click", errorHandlerAsyncEvent(async evt => {
            handleEvtDeleteRem(evt);
        }));
        // btnCancel.addEventListener("click", evt => { goHome(); });
        const divButtons = mkElt("div", { class: "input-save-div" }, [btnSave, btnDelete]);
        return divButtons;
    }
    function mkEltSource() {
        const divInputs = mkElt("div", { class: "mdc-card div-source-web-page" }, [
            // divH
        ]);
        const inpURL = modMdc.mkMDCtextFieldInput(undefined, "url");
        inpURL.classList.add("remember-url");
        inpURL.addEventListener("input", evt => {
            divURLlockedValue.textContent = inpURL.value;
        });
        const strUrl = record ? record.url : "";
        const tfURL = modMdc.mkMDCtextField("Link", inpURL, strUrl);

        const aURLorig = modMdc.mkMDCiconButton("link", "Go to this item source page (aURLorig)");
        // aURLorig.title = "Go to this item source page (aURLorig)";
        aURLorig.classList.add("icon-button-40");
        aURLorig.classList.add(...themePrimary);

        const btnURL2 = modMdc.mkMDCiconButton("link", "Go to this item source page (btnURL2)");
        // btnURL2.title = "Go to this item source page (btnURL2)";
        btnURL2.classList.add("icon-button-40");
        btnURL2.classList.add(...themePrimary);
        const aURL2 = mkElt("a", { href: "#" }, btnURL2);
        aURL2.addEventListener("click", evt => { console.log("click aURL2"); });
        btnURL2.addEventListener("click", evt => {
            console.log("click btnURL2");
            aURL2.href = inpURL.value;
        });
        aURL2.addEventListener("contextmenu", evt => { console.log("contextmenu aURL2"); });
        btnURL2.addEventListener("contextmenu", evt => {
            console.log("contextmenu btnURL2");
            aURL2.href = inpURL.value;
        });

        const icon = modMdc.mkMDCicon("link");
        const aURL = modMdc.mkMDCbuttonA("#", undefined, "raised", icon);
        aURL.title = "Go to this item source page (aURL)";
        aURL.classList.add("icon-button-40");
        aURL.classList.add(...themePrimary);
        aURL.addEventListener("click", evt => { aURL.href = inpURL.value; });
        // aURL.addEventListener("contextmenu", evt => { aURL.href = inpURL.value; });


        const btnViewURL = modMdc.mkMDCiconButton("visibility_off", "View/hide source link");
        // btnViewURL.title = "View/hide source link";
        btnViewURL.classList.add("icon-button-40");
        btnViewURL.addEventListener("click", evt => {
            const isDisplayed = !divURLlocked.classList.contains("display-none");
            setURLvisible(!isDisplayed);
        });

        function setURLvisible(on) {
            if (on) {
                divURLlocked.classList.remove("display-none");
            } else {
                divURLlocked.classList.add("display-none");
                setURLeditable(false);
            }
            const newIcon = on ? "visibility" : "visibility_off";
            modMdc.setMDCiconButton(btnViewURL, newIcon);
        }
        function setURLeditable(on) {
            if (!on) {
                divURLlockedValue.removeAttribute("contenteditable")
                modMdc.setMDCiconButton(btnEditURL, "edit");
            } else {
                // divURLlockedValue.setAttribute("contenteditable", true)
                divURLlockedValue.setAttribute("contenteditable", "plaintext-only")
                modMdc.setMDCiconButton(btnEditURL, "edit_off");
            }
        }
        const btnEditURL = modMdc.mkMDCiconButton("edit", "Edit source link");
        // btnEditURL.title = "Edit source link";
        btnEditURL.classList.add("icon-button-40");
        btnEditURL.addEventListener("click", evt => {
            console.log("clicked btnEditURL");

            // Not sure this is really supported:
            // divURLlockedValue.contentEditable = true;

            // Seems better to use Attribute, works well!
            const isEditable = divURLlockedValue.hasAttribute("contenteditable")
            setURLeditable(!isEditable);
            setURLvisible(true);
        });
        // const divURLright = mkElt("div", { class: "div-url-right-buttons" }, [aURL, btnEditURL]);
        const divURLbtns = mkElt("div", { class: "div-url-top-buttons" }, [
            // aURL,
            // aURLorig,
            aURL2,
            btnViewURL, btnEditURL]);

        const divURLlockedValue = mkElt("div", { class: "div-url-locked-value" }, inpURL.value);
        const divURLlocked = mkElt("div", { class: "div-url-locked display-none" }, [
            divURLlockedValue
        ]);
        // const divURLedit = mkElt("div", {class:"div-url-edit"}, tfURL);
        tfURL.classList.add("tf-url-edit");
        const divURLprotect = mkElt("div", { class: "div-url-protect" }, [divURLlocked, tfURL]);

        // const divURL = mkElt("div", { class: "div-input-url" }, [divURLprotect, divURLright]);
        const eltH = mkElt("h2", undefined, "Item link");
        eltH.style.marginRight = "20px";
        const divURLtop = mkElt("div", { class: "div-url-top" }, [eltH, divURLbtns]);
        // const divURL = mkElt("div", { class: "div-input-url-new" }, [divURLbtns, divURLprotect]);
        const divURL = mkElt("div", { class: "div-input-url-new" }, [divURLprotect]);
        divInputs.appendChild(divURLtop);
        divInputs.appendChild(divURL);


        const inpTitle = modMdc.mkMDCtextFieldInput(undefined, "text");
        inpTitle.classList.add("remember-title");
        const strTitle = record ? record.title : "";

        // const tfTitle = modMdc.mkMDCtextField("Title here", inpTitle, strTitle);
        inpTitle.value = strTitle;
        const tfTitle = modMdc.mkMDCtextFieldOutlined("Title here", inpTitle);
        tfTitle.style.marginTop = "5px";

        divInputs.appendChild(tfTitle);
        if (strTitle.length > 0) divBannerTitle.textContent = strTitle;
        if (record) {
            const key = record.key;
            if (key) {
                if (key.length != 24) throw Error(`Not ISO time-date: ${key}`);
                divBannerTitle.dataset.keyRecord = key;
            }
        }
        inpTitle.addEventListener("input", evt => {
            divBannerTitle.textContent = inpTitle.value;
            const detContainer = divBanner.closest("details.unsaved-marker-container");
            if (!detContainer) return;
            const eltAnotherTitle = detContainer.querySelector(".has-title");
            if (!eltAnotherTitle) return;
            eltAnotherTitle.textContent = inpTitle.value;
        });

        const taDesc = modMdc.mkMDCtextFieldTextarea(undefined, 4, 50);
        taDesc.classList.add("remember-text");
        const strDescription = record ? record.text : "";
        const tafDesc = modMdc.mkMDCtextareaField("Your Description", taDesc, strDescription);
        // divInputs.appendChild(tafDesc);

        return divInputs;
    }

    function getCreatedEltTime() {
        return thCreated.dataset.createdIso;
    }
    function setCreatedEltTime(keyCreated) {
        if (keyCreated) {
            eltRemember.dataset.key = keyCreated;
            thCreated.innerText = "";
            // divCreated.appendChild(mkElt("div", undefined, keyCreated));
            thCreated.dataset.createdIso = keyCreated;
            const dateCreated = new Date(keyCreated);
            thCreated.appendChild(mkElt("div", undefined, `Created: ${formatNiceTime(dateCreated)}`));
        } else {
            thCreated.appendChild(mkElt("span", undefined, "Not saved yet."));
        }
    }

    async function addTimers() {
        setCreatedEltTime(record?.key);

        function fetchSavedTimers() {
            if (!record?.timers) return;
            const saved = {};
            record.timers.forEach(savedTimer => {
                const msDelay = savedTimer.msDelay;
                const txtLength = savedTimer.txtLength;
                saved[txtLength] = msDelay;
            });
            return saved;
        }
        const getDefaultTimersForNew = () => {
            const forNew = {}
            Object.entries(defaultTimers).forEach(ent => {
                if (ent[1] > 0) forNew[ent[0]] = ent[1];
            });
            return forNew;
        }
        const savedTimers = fetchSavedTimers();
        // const ourTimers = savedTimers || defaultTimers;
        const ourTimers = savedTimers || getDefaultTimersForNew();

        thCreated.colspan = 3;
        const tableHeader = mkElt("thead", undefined, [
            mkElt("tr", undefined, [thCreated]),
            mkElt("tr", undefined, [
                mkElt("th", { class: "timer-length" }, "Reminder after"),
                mkElt("th", { class: "timer-when" }, "Will be at"),
                mkElt("th", undefined, "Done?"),
            ])
        ]);

        const tableBody = mkElt("tbody");
        const tableTimers = mkElt("table", { class: "timers-table" }, [tableHeader, tableBody]);

        // tableTimers.appendChild(tableBody);
        const msNow = new Date().getTime();
        for (const [strKey, msDelay] of Object.entries(ourTimers)) {
            const dateWhenTo = new Date(createdMs + Math.abs(msDelay));
            const isExpired = msNow > dateWhenTo.getTime();
            const isNotified = msDelay < 0;
            const showWhen = formatNiceTime(dateWhenTo);

            // const iconBasket = "🗑";
            const iconBasket = modMdc.mkMDCicon("delete_forever");
            // const iconBasket = mkElt("span", {class:"material-icons"}, "delete_outline");
            const btnDelete = modMdc.mkMDCbutton(iconBasket);
            btnDelete.classList.add("wastebasket-button");
            btnDelete.addEventListener("click", async evt => {
                const tr = btnDelete.closest("tr");
                deleteTimerDialog(tr);
            })
            async function deleteTimerDialog(tr) {
                tr.style.outline = "4px dotted yellowgreen";
                const dlg = modMdc.mkMDCdialogConfirm("Delete this timer?", "Yes", "No");
                const answer = await dlg;
                console.log({ answer });
                tr.style.outline = "";
                if (answer) {
                    tr.remove();
                    // setButtonStates();
                    saveNow();
                }
            }
            const inpDone = modMdc.mkMDCcheckboxInput();
            const chkDone = await modMdc.mkMDCcheckboxElt(inpDone);
            if (isNotified) inpDone.checked = true;
            const tableRow = mkElt("tr", { class: "remember-timer" }, [
                mkElt("td", { class: "remember-timer-length" }, strKey),
                mkElt("td", { class: "remember-timer-when" }, showWhen),
                mkElt("td", undefined, chkDone),
                // mkElt("td", undefined, btnDelete),
            ]);
            tableBody.appendChild(tableRow);
            if (isExpired) { tableRow.classList.add("timer_expired"); }
            if (isNotified) { tableRow.classList.add("timer_notified"); }
            tableRow.dataset.msDelay = msDelay;
            tableRow.dataset.msWhen = dateWhenTo.getTime();
        }
        const sumTable = mkElt("summary", undefined, "Advanced");
        const detTable = mkElt("details", undefined, [
            sumTable,
            tableTimers,
        ])
        divTimers.appendChild(detTable);
    }

}

const rememberSelectors = {
    title: "input.remember-title",
    url: "input.remember-url",
    text: "textarea.remember-text",
    timers: "tr.remember-timer",
    // flashcards: ".flashcard-scene",
    flashcards: ".flashcard-scale-wrapper",
};

class ScreenRemember {
    constructor(eltRem, saveNow) {
        this.elt = eltRem;
        this.promInitialValue = this.getPromCurrentValue();
        this.btnSave = eltRem.querySelector("button.save-button");
        this.saveNow = saveNow;
        this.restartSaveNowTimer = (() => {
            let tmr;
            const doSaveNow = () => { this.saveNow(); }
            return () => {
                clearTimeout(tmr);
                console.log("cleared timer doSaveNow");
                tmr = setTimeout(doSaveNow, 1500);
            }
        })();
    }
    getElt() { return this.elt; }
    async getPromInitialValue() { return this.promInitialValue; }
    async resetPromInitialValue() { this.promInitialValue = this.getPromCurrentValue(); }
    async getPromCurrentValue() {
        const values = {};
        const tags = [];
        values.tags = tags;
        this.elt.querySelector(".tags-items")
            .querySelectorAll(".tag-in-our-tags")
            .forEach(eltTag => {
                // console.log({ eltTag });
                tags.push(eltTag.textContent.substr(1));
            });
        // console.log({ tags });
        const eltConfSlider = this.elt.querySelector(".confidence-slider")
        // console.log({ eltConfSlider });
        // await eltConfSlider.myPromMdc;
        // const slider = eltConfSlider.myMdc;
        const slider = eltConfSlider.myMdc || await eltConfSlider.myPromMdc;
        // console.log({ slider });
        values.confRem = slider.getValue();
        // const timers = {};
        const timers = [];
        values.timers = timers;
        const flashcards = [];
        values.flashcards = flashcards;
        for (const [key, val] of Object.entries(rememberSelectors)) {
            const elts = this.elt.querySelectorAll(val);
            if (key == "flashcards") {
                /*
                elts.forEach(fc => {
                    const valCurrentFc = fc.myGet();
                    console.log({ valCurrentFc });
                    flashcards.push(valCurrentFc);
                });
                */
                // To collect values we must wait 
                const arrElts = [...elts];
                for (let i = 0, len = arrElts.length; i < len; i++) {
                    const fc = arrElts[i];
                    const valCurrentFc = await fc.myGet();
                    console.log({ valCurrentFc });
                    flashcards.push(valCurrentFc);
                }
            } else if (key == "timers") {
                // console.log("timers", { elts });
                elts.forEach(tr => {
                    const msDelay = +tr.dataset.msDelay;
                    const msWhen = +tr.dataset.msWhen;
                    // FIX-ME: .innerText does not work when the <details> is not open here
                    // File an issue?
                    // const txtLength = tr.querySelector("td.remember-timer-length").innerText;
                    const txtLength = tr.querySelector("td.remember-timer-length").textContent;
                    if (txtLength == 0) debugger;
                    // const txtWhen = tr.querySelector("td.remember-timer-when").innerText;
                    // console.log({ msDelay, msWhen, txtLength, txtWhen });
                    // timers[ms] = { ms, txtLength, txtWhen, }
                    timers.push({ msDelay, msWhen, txtLength });
                });
            } else {
                values[key] = elts[0].value;
            }
        }
        const textValue = values.text + values.title + values.url;
        if (textValue == "") return;
        const imageElts = this.elt.querySelectorAll(".blob-to-store");
        const imgValue = [...imageElts].map(elt => elt.dataset.urlBlob);
        // console.log(imgValue);
        values.images = imgValue;
        // FIX-ME: replace the imgValue urls with blobs before storing. Or?
        // console.log({ values });
        return values;
    }
    setSaveButtonState(canSave) {
        const container = this.btnSave.closest(".unsaved-marker-container");
        if (canSave) {
            // FIX-ME: btnSave
            this.btnSave.disabled = false;
            this.btnSave.style.opacity = null;
            container.classList.add("not-saved");
            this.restartSaveNowTimer();
        } else {
            this.btnSave.disabled = true;
            this.btnSave.style.opacity = 0.5;
            // No container yet if not on screen
            container?.classList.remove("not-saved");
        }

    }
}