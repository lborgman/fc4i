console.log("here is module db-fc4i.js");
if (document.currentScript) throw Error("import .currentScript"); // is module
if (!import.meta.url) throw Error("!import.meta.url"); // is module

const modIdbCmn = await import("idb-common");
async function getDb() { return modIdbCmn.getDb(); }

const idbStoreFc4i = "toRepeat";

export const getDbKey = async (key) => {
    // const db = await modIdbCmn.getDb();
    // const objVal = await db.get(idbStoreFc4i, key);
    // return objVal;
    return modIdbCmn.getDbKey(idbStoreFc4i, key);
}
export const setDbKey = async (key, objVal) => {
    // const db = await getDb();
    // objVal.key = key;
    // const res = await db.put(idbStoreFc4i, objVal);
    // return res;
    return modIdbCmn.setDbKey(idbStoreFc4i, key, objVal);
}
const countDbKey = async (key) => {
    // const db = await getDb();
    // const count = await db.count(idbStoreFc4i, key);
    // console.log(`count ${key}`, { count });
    // return count;
    return modIdbCmn.countDbKey(idbStoreFc4i, key);
}
export const deleteDbKey = async (key) => {
    // const db = await getDb();
    // const res = await db.delete(idbStoreFc4i, key);
    // return res;
    return modIdbCmn.deleteDbKey(idbStoreFc4i, key);
}



const KEY_SHORT_TIMERS = "KEY_SHORT_TIMERS";
async function OLDsetShortTimers(objVal) { return setDbKey(KEY_SHORT_TIMERS, objVal); }
async function OLDgetShortTimers() { return getDbKey(KEY_SHORT_TIMERS); }
async function OLDcountShortTimers() { return countDbKey(KEY_SHORT_TIMERS); }

const KEY_SW_STATUS = "SW_STATUS";
async function setLastSWstatus(objVal) { return setDbKey(KEY_SW_STATUS, objVal); }
async function getLastSWstatus() { return getDbKey(KEY_SW_STATUS); }

const KEY_TEST_TIMER = "TEST_TIMER_done";
async function setLastTestTimer(objVal) { return setDbKey(KEY_TEST_TIMER, objVal); }
async function getLastTestTimer() { return getDbKey(KEY_TEST_TIMER); }

const KEY_REMINDER_DIALOG = "KEY_REMINDER_DIALOG";
async function setSavedDialogValue(objVal) { return setDbKey(KEY_REMINDER_DIALOG, objVal); }
export async function getSavedDialogValue() { return getDbKey(KEY_REMINDER_DIALOG); }

const KEY_TAGS = "KEY_TAGS";
async function setDbTags(objVal) { return setDbKey(KEY_TAGS, objVal); }
async function getDbTags() { return getDbKey(KEY_TAGS); }
export async function setDbTagsArr(arrVal) {
    if (!Array.isArray(arrVal)) {
        console.log({ arrVal });
        throw Error("arrVal is not an array");
    }
    const objVal = { tags: arrVal }
    return setDbTags(objVal);
}
export async function getDbTagsArr() {
    const allTags = await getDbTags();
    const arrVal = allTags?.tags ? allTags.tags : [];
    if (!Array.isArray(arrVal)) {
        console.log({ arrVal });
        throw Error("arrVal is not an array");
    }
    return arrVal;
}

const SPECIAL_KEYS = [
    KEY_SHORT_TIMERS,
    KEY_SW_STATUS,
    KEY_TEST_TIMER,
    KEY_REMINDER_DIALOG,
    KEY_TAGS
];
function isSpecialKey(key) { return SPECIAL_KEYS.includes(key); }

export async function getViaUrl(url) {
    const db = await getDb();
    // const store = db.objectStore(idbStoreName);
    // const indexUrl = store.index("url");
    // return indexUrl.get(url);
    const tx = db.transaction(idbStoreFc4i, 'readwrite');
    const store = tx.objectStore(idbStoreFc4i);
    // const val = (await store.index("url").get('https:svt.se')) || 0;
    const indexUrl = store.index("url");
    // const val = (await indexUrl.get('https:svt.se')) || 0;
    const val = await indexUrl.get(url);
    await tx.done;
    // console.log({ val })
    return val;
}

export function checkTimersOrder(timers) {
    const len = timers.length;
    for (let i = 1; i < len; i++) {
        const timer = timers[i];
        const prevTimer = timers[i - 1];
        const msDelay = timer.msDelay;
        const prevMsDelay = prevTimer.msDelay;
        if (Math.abs(prevMsDelay) > Math.abs(msDelay)) debugger;
    }
}

export async function get1Reminder(key) {
    const db = await getDb();
    if (isSpecialKey(key)) return;
    return getDbKey(key);
}
export async function countAllReminders() {
    // const db = await getDb();
    // let num = await db.count(idbStoreFc4i);
    let num = await modIdbCmn.count(idbStoreFc4i);
    for (let i = 0, len = SPECIAL_KEYS.length; i < len; i++) {
        const specialKey = SPECIAL_KEYS[i];
        if (await getDbKey(specialKey)) num--;
    }
    // console.log({num, numAll});
    return num;
}
async function getAllReminders() {
    // const db = await getDb();
    // const allRecs = await db.getAll(idbStoreFc4i);
    const allRecs = await modIdbCmn.getAll(idbStoreFc4i);
    const allReminders = allRecs.filter((rec) => {
        if (isSpecialKey(rec.key)) return false;
        return true;
    });
    return allReminders;
}
export async function getToNotifyNow(matchValues) {
    const hasMatchValues = matchValues !== undefined;
    console.log("getToNotifyNow", { matchValues, hasMatchValues });
    // const db = await getDb();
    // getDbMatching(searchFor, minConf, maxConf, requiredTags)
    let allRecs;
    if (!hasMatchValues) {
        allRecs = await getAllReminders();
    } else {
        // allRecs = await getDbMatching(searchFor, minConf, maxConf, requiredTags);
        // const { strSearch, minRange, maxRange, reqTags } = matchValues;
        const { searchFor, minConf, maxConf, requiredTags } = matchValues;
        allRecs = await getDbMatching(searchFor, minConf, maxConf, requiredTags);
        const allLen = allRecs.length;
        console.log({ allLen });
    }

    const msNow = new Date().getTime();
    const toNotify = [];
    // FIX-ME: We are only using 1 record now in next step.
    // Get the oldest here!
    allRecs.forEach(r => {
        const ts = r.timers;
        checkTimersOrder(ts);
        const len = ts.length;
        let expired = false;
        const expiredTimers = [];
        for (let i = 0; i < len; i++) {
            const timer = ts[i];
            const msWhen = timer.msWhen;
            const msDelay = timer.msDelay;
            // expired = expired || msWhen < msNow;
            // if (msDelay > 0)
            const FIVE_MINUTES = 5 * 60 * 1000; 
            if (msDelay > FIVE_MINUTES) {
                if (msWhen < msNow) {
                    expired = true;
                    expiredTimers.push(timer);
                    break;
                }
            }
            // console.log({ timer, msWhen, expired });
        }
        // if (expired) toNotify.push(r);
        // if (expired) toNotify.push(r);
        if (expired) {
            const expiredRecord = r;
            let older = true;
            const thisRecTime = expiredTimers[0].msWhen;
            for (let j = 0; j < toNotify.length; j++) {
                const tnRec = toNotify[j];
                // console.log({ tnRec }, tnRec.timers, tnRec.expiredTimers);
                // const tnTime = tnRec.timers[0].msWhen;
                const tnTime = tnRec.expiredTimers[0].msWhen;
                // console.log({ tnTime });
                if (tnTime < thisRecTime) {
                    older = false;
                    break;
                }
            }
            if (older) toNotify.push({ expiredRecord, expiredTimers });
        }
    });
    console.log({ toNotify });
    return toNotify;
}

export async function getDbMatching(searchFor, minConf, maxConf, requiredTags) {
    // console.log("getDbMatching", searchFor, minConf, maxConf, requiredTags);
    const allRem = [];
    allRem.length = 0;
    const allRemStored = await getAllReminders();
    const keys = ["text", "title", "url"];
    const searchFor2 = searchFor?.toLocaleLowerCase();
    const searchAll = searchFor2?.split(/ +/).filter(r => r != "-") || [];
    const searchPos = searchAll.filter(r => !r.startsWith("-"));
    const searchNeg = searchAll.filter(r => r.startsWith("-")).map(r => r.slice(1));
    allRemStored.forEach(rem => {
        const remConfRem = rem.confRem;
        const remConf = rem.confRem || 1;
        // console.log("allRemStored", { rem, remConfRem, remConf });

        if (remConf < minConf) return;
        if (remConf > maxConf) return;

        if (requiredTags?.length > 0) {
            const tags = rem.tags;
            if (!tags) return;
            if (tags.length == 0) return;
            if (tags) {
                for (let i = 0, len = requiredTags.length; i < len; i++) {
                    const reqTag = requiredTags[i];
                    if (!tags.includes(reqTag)) return;
                }
            }
        }
        // console.log("INRANGE!");
        if (searchFor == undefined) { allRem.push(rem); return; }
        for (let n of searchNeg) {
            for (let k of keys) {
                const v = rem[k];
                const vLC = v.toLocaleLowerCase();
                if (vLC.indexOf(n) > -1) { return; }
            }
        }
        let hitAllP = true;
        for (let p of searchPos) {
            let hitP = false;
            for (let k of keys) {
                const v = rem[k];
                const vLC = v.toLocaleLowerCase();
                if (vLC.indexOf(p) > -1) { hitP = true; break; }
            }
            if (!hitP) { hitAllP = false; break; }
        }
        if (hitAllP) { allRem.push(rem); return; }
    });

    // const msNow = new Date().getTime();
    allRem.sort(sortObjectBy("key", true)); // newest first
    // console.log("getDbMatching", allRem);
    return allRem;
}


export async function getUnusedTags() {
    const arrAll = await getDbMatching();
    const arrTags = await getDbTagsArr();
    // console.log({ arrAll, arrTags });
    const objTags = {}
    arrTags.forEach(tag => objTags[tag] = 0);
    // console.log({ objTags });
    arrAll?.forEach(rec => {
        const tags = rec.tags;
        // console.log({ tags });
        tags?.forEach(name => { objTags[name]++ });
    });
    // console.log("result", { objTags });
    const notUsed = [];
    Object.keys(objTags).forEach(k => {
        const v = objTags[k];
        // console.log({ k, v });
        if (v == 0) notUsed.push(k);
    });
    // console.log({ notUsed });
    return notUsed;
}

// async function setShortTimers(objVal) { return setDbKey(KEY_SHORT_TIMERS, objVal); }
// async function getShortTimers() { return getDbKey(KEY_SHORT_TIMERS); }
/*
async function anyShortTimers() {
    // debugger;
    const count = await countShortTimers();
    console.log({ count });
    return count > 0;
    // const shorts = await getShortTimers();
    // console.log("any", { shorts });
    // return shorts !== undefined;
}
async function addShortTimer(key, atTime, afterMinutes, lbl) {
    if (!afterMinutes) debugger;
    const oldShortsRec = await getShortTimers();
    const newShortsRec = oldShortsRec || {};
    // Take care of old record format:
    if (!newShortsRec.shorts) newShortsRec.shorts = {}
    const shorts = newShortsRec.shorts;
    const date = new Date(atTime);
    const dateIso = date.toISOString();
    shorts[key] = { dateIso, afterMinutes, lbl };
    console.log("new", { shorts, newShortsRec });
    await setShortTimers(newShortsRec);
}
async function getShortTimer(key) {
    const anyShort = await anyShortTimers();
    if (!anyShort) return;
    const shortsRec = await getShortTimers();
    const shorts = shortsRec.shorts;
    return shorts[key];
}
async function deleteShortTimer(key) {
    // const anyShort = await anyShortTimers();
    // if (!anyShort) return;
    const shortsRec = await getShortTimers();
    console.warn({ shortsRec });
    if (!shortsRec) return;
    const shorts = shortsRec.shorts;
    // if (!shorts[key]) debugger;
    delete shorts[key];
    const isEmpty = Object.keys(shorts).length == 0;
    console.log({ isEmpty, shorts });
    if (isEmpty) {
        const res = await deleteDbKey(KEY_SHORT_TIMERS);
        console.log({ res });
    } else {
        const res = await setShortTimers(shorts);
        console.log({ res });
    }
}
export async function getNextShortTimer() {
    const shortsRec = await getShortTimers();
    const shorts = shortsRec?.shorts;
    // console.log({ shorts });
    if (shorts === undefined) return;
    let earliest;
    let earliestKey;
    let earliestAfterMinutes;
    let earliestLbl;
    let earliestDateIso;
    Object.entries(shorts).forEach(entry => {
        const [key, val] = entry;
        console.log({ key, val });
        const { afterMinutes, dateIso, lbl } = val;
        console.log({ afterMinutes, dateIso });
        if (key == "key") return;
        earliest = earliest || dateIso;
        if (dateIso <= earliest) {
            earliestKey = key;
            earliestAfterMinutes = afterMinutes;
            earliestLbl = lbl;
            earliestDateIso = dateIso;
        }
    });
    return {
        earliestKey,
        earliestAfterMinutes,
        earliestLbl,
        earliestDateIso,
    }
}
*/

// https://stackoverflow.com/questions/979256/sorting-an-array-of-objects-by-property-values
function sortObjectBy(field, reverse, primer) {
    const key = primer ?
        function (x) {
            return primer(x[field])
        } :
        function (x) {
            return x[field]
        };
    reverse = !reverse ? 1 : -1;
    return (a, b) => {
        a = key(a); b = key(b); return reverse * ((a > b) - (b > a));
    }
}

// console.log("END db-fc4i.js");