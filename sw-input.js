//========== Specific ====================================================
const SW_VERSION = "0.4.1110";

// https://www.npmjs.com/package/workbox-sw
importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.1.0/workbox-sw.js');


// throw Error("Test worker error");
const logColors = "color: green; background: yellow;";
console.log(`%csw-worker-input.js ${SW_VERSION} is here`, logColors + " font-size: 20px;");


// https://stackoverflow.com/questions/61080783/handling-errors-in-async-event-handlers-in-javascript-in-the-web-browser
// Error handling with Async/Await in JS - ITNEXT
// https://itnext.io/error-handling-with-async-await-in-js-26c3f20bc06a
function errorHandlerAsyncEvent(asyncFun) {
    // console.warn("typeof asyncFun", typeof asyncFun);
    return function (evt) {
        asyncFun(evt).catch(err => {
            console.log("handler", err);
            // debugger; // eslint-disable-line no-debugger
            throw err;
        })
    }
}

const tzMin = new Date().getTimezoneOffset();
const tzMs = tzMin * 60 * 1000;
function toLocalISOString(date) { return new Date(date.getTime() - tzMs).toISOString(); }
function toOurTime(date) { return toLocalISOString(date).slice(0, -8).replace("T", " "); }



workbox.setConfig({
    debug: false
});

importScripts("src/js/umd/idb.js");
// importScripts("src/js/db-fc4i.js");
console.log("%cservice-worker.js after import workbox-sw.js, idb.js and db-fc4i.js", logColors);
// setLastSWstatus({ status: "starting SW", when: toOurTime(new Date()) });

// JavaScript timers do not survive SW shutdown. So check to notify here at SW startup:
(async () => {
    return; // Added a button instead
    /*
    const remindersSettings = await getSavedDialogValue();
    console.log({ remindersSettings });
    const checkReminders = remindersSettings?.autoReminders || true;
    if (checkReminders) {
        setTimeout(checkToNotify, 2000);
    }
    */
})();

// https://web.dev/workbox-share-targets/
// Only for POST!
/*
workbox.routing.registerRoute(
    "/share",
    shareTargetHandler,
    "GET"
);
console.warn("service-worker.js after registerRoute /share");
*/

workbox.precaching.precacheAndRoute(self.__WB_MANIFEST)
/*
workbox.routing.registerRoute(
    /\.(?:js|css|webp|png|svg|html)$/,
    new workbox.strategies.StaleWhileRevalidate()
);
*/

// https://stackoverflow.com/questions/58051656/how-to-send-a-message-from-service-worker-to-a-workbox-class-instances-message
async function broadcastToClients(msg) {
    console.log("broadcaseToClients", { msg });
    const clients = await self.clients.matchAll({ type: 'window' });
    for (const client of clients) {
        client.postMessage(msg);
    }
}

async function shareTargetHandler(evt) {
    console.warn("shareTargetHandler");
    console.warn("shareTargetHandler", { evt }, evt.respondWith);
    // const formData = await evt.request.formData();
    // console.warn({ formData });
    // clients.openWindow("share.html?text=DUMMY-TEXT&title=DUMMY-title&url=DUMMY-url");
    // evt.respondWith(fetch("/share.html&text=dummytext&title=dummytitle&url=dummyurl"));
    // return;
}


async function checkToNotify(matchValues) {
    return;
    const db = await getDb();
    console.log("%cservice-worker", logColors, { idb, db });
    const toNotify = await getToNotifyNow(matchValues);
    console.log("%cservice-worker", logColors, { toNotify });
    const toNot0 = toNotify[0];
    let msg = "No expired reminders found";
    if (toNot0) {
        displayExpiredLongTimeNotification(toNot0);
        msg = "Found expired long time reminder";
    }
    // postMessage
    const data = { text: msg }
    broadcastToClients(data);
}
function displayNotificationFromRecord(expiredRecord, timerInfo) {
    console.log("%cdisplayNotificationFromRecord", logColors, { expiredRecord, timerInfo });
    const title = `(${timerInfo}) ${expiredRecord.title}`;
    const body = expiredRecord.desc;
    const encodedKey = decodeURIComponent(expiredRecord.key);
    const encodedTimerInfo = decodeURIComponent(timerInfo);
    const url = `${location.protocol}//${location.host}/share.html?key=${encodedKey}&timerInfo=${encodedTimerInfo}`;
    console.log("%ckey", "color:red; font-size:20px;", { url });

    const displayed = displayNotification(title, body, url);
    console.log("%cwas displayed", logColors, { displayed });
}

async function displayExpiredLongTimeNotification(objExpired) {
    const { expiredRecord, expiredTimers } = objExpired;
    // const href = location.href;
    console.log("%cdisplayExpiredLongTimeNotification", logColors, { objExpired, expiredRecord, expiredTimers });
    const timerInfo = expiredTimers[0].txtLength;

    displayNotificationFromRecord(expiredRecord, timerInfo);
    // FIX-ME: Move to db-fc4i.js
    // Save that we have notified:
    const recTimers = expiredRecord.timers;
    // {msDelay, msWhen, txtLength}
    // Change sign of msDelay when notification is sent.
    // There should only be one timer in expiredTimers now
    if (expiredTimers.length !== 1) throw Error('expiredTimers.length !== 1');
    const msDelayNotified = expiredTimers[0].msDelay;
    for (let i = 0; i < recTimers.length; i++) {
        recT = recTimers[i];
        if (recT.msDelay == msDelayNotified) {
            recT.msDelay = -recT.msDelay;
        }
    }
    // const db = await getDb();
    // const res = await db.put(idbStoreName, expiredRecord);
    // console.log("%cService Worker stored notification done", logColors, { res });
    console.log("%cService Worker stored notification done", logColors);
}
self.addEventListener('notificationclick', (evt) => {
    console.log("%cService Worker notificationclick", logColors, { evt });
    if (!evt.notification.data.action) {
        // Was a normal notification click
        console.log('%cNotification Click.', logColors);
        return;
    }
    switch (evt.notification.data.action) {
        case 'display-url':
            const url = evt.notification.data.url;
            console.log(`%cDisplay url ${url}`, logColors);
            clients.openWindow(url);
            break;
        default:
            console.log(`%cUnknown action clicked: '${evt.action}'`, logColors);
            break;
    }
});


let tmrCheck;

// process.on('uncaughtException', function (err) { console.log("%cuncaughtException in service worker", logColors, { err }); });

let tmrAutoCheck;
const adjustTmrAutoCheck = async () => {
    return;
    // throw Error("adjustTmrAutoCheck ")
    console.log("%cadjustTmrAutoCheck", logColors);
    // const db = await getDb();
    // const keyRec = await db.get(idbStoreName, key);
    const recAutoReminders = await getSavedDialogValue();
    const time = recAutoReminders.time;
    const hr = time.slice(0, 2);
    const mn = time.slice(3, 5);
    const now = new Date();
    const nowTime = `${now.getHours()}:${now.getMinutes()}`;
    const wdToday = now.getDay();
    let waitDays;
    for (let j = 0; j < 7; j++) {
        const wd = (j + wdToday) % 7;
        const wdActive = recAutoReminders[wd];
        if (wdActive) {
            if (j == 0) { if (nowTime > time) continue; }
            waitDays = j;
            break;
        }
    }
    if (tmrAutoCheck) clearTimeout(tmrAutoCheck.tmr);
    tmrAutoCheck = undefined;
    if (waitDays == undefined) {
        broadcastToClients({ text: `Saved your preferences. Will not check for reminders.` })
        return;
    }
    // https://stackoverflow.com/questions/563406/how-to-add-days-to-date
    const dateCheck = new Date(now);
    dateCheck.setDate(dateCheck.getDate() + waitDays);
    dateCheck.setHours(hr);
    dateCheck.setMinutes(mn);
    console.log(`%cCheck at: ${dateCheck}`, "font-size:20px");

    // const delay = dateCheck.getTime() - now.getTime();
    const msDelay = 10 * 1000;

    tmr = setTimeout(checkToNotify, msDelay)
    const isoTime = dateCheck.toISOString();
    tmrAutoCheck = { tmr, isoTime };
    broadcastToClients({ text: `Saved your preferences. Will check for reminders ${toOurTime(dateCheck)}` })
}
const restartAutoCheck = (() => {
    let tmr;
    const delayMs = 2000; // FIXME:
    return (clientPort) => {
        console.log("%crestartCheckAutoCheck", logColors, { clientPort });
        clearTimeout(tmr);
        const promise = new Promise((resolve, reject) => {
            tmr = setTimeout(function () {
                // throw Error("error test 0.5");
                try {
                    // throw new Error('error!');
                    // checkSave();
                    // throw Error("error test 1");
                    adjustTmrAutoCheck();
                    resolve(); // if the previous line didn't always throw

                } catch (e) {
                    reject(e)
                }
            }, 300)
        })
        promise.catch(error => {
            console.log("%checkSave() error)", logColors, { error });
            throw error;
        });
    }
})();

let tmrKeepalive;
self.addEventListener("message", errorHandlerAsyncEvent(async evt => {
    // FIX-ME: Do something when ping/keyChanged during login???
    // https://github.com/firebase/firebase-js-sdk/issues/1164
    if (evt.data?.eventType == "ping") return;
    if (evt.data?.eventType == "keyChanged") return;

    let msgType = "(NO TYPE)";
    if (evt.data) {
        msgType = evt.data.type;
    }
    console.log("%cservice-worker message", logColors, { evt, msgType });
    if (evt.data) {
        switch (msgType) {
            case "TEST_TIMER":
                const seconds = evt.data.seconds;
                const stop = seconds < 1;
                let msKeepalive = evt.data.interval || 0;
                msKeepalive = Math.max(msKeepalive, 1000);
                const msNowStart = Date.now();
                console.log("%cTEST_TIMER", "color:red", { seconds, msKeepalive });
                const wasRunning = !tmrKeepalive;
                clearInterval(tmrKeepalive);
                tmrKeepalive = undefined;
                const sendKeepalive = (val) => {
                    const msElapsed = Date.now() - msNowStart;
                    const sElapsed = Math.floor(msElapsed / 1000);
                    const data = {
                        type: "keepAliveCounter",
                        counterValue: val,
                        total: seconds,
                        sElapsed
                    }
                    try {
                        broadcastToClients(data);
                    } catch (err) {
                        console.log(err);
                    }
                }
                if (stop) {
                    sendKeepalive("STOP");
                    return;
                }
                let keepaliveValue = 0;
                sendKeepalive("START");
                tmrKeepalive = setInterval(() => {
                    if (!tmrKeepalive) return;
                    keepaliveValue += Math.floor(msKeepalive / 1000);
                    let sendWhat = keepaliveValue;
                    if (keepaliveValue >= seconds) {
                        sendWhat = "DONE Now";
                        clearInterval(tmrKeepalive);
                        tmrKeepalive = undefined;
                    }
                    console.log("keepalive", keepaliveValue, sendWhat);
                    try {
                        sendKeepalive(sendWhat);
                    } catch (err) {
                        const err4send = `in setIntervall (${sendWhat}): ${err}`;
                        sendKeepalive(err4send);
                    }
                }, msKeepalive);
                /*
                const testTimerShow = () => {
                    clearInterval(tmrKeepalive);
                    const title = `TEST_TIMER seconds=${seconds}`;
                    console.log("%cdisplayNotification", logColors, { title });
                    try {
                        sendKeepalive("DONE");
                        const time = toOurTime(new Date());
                        const obj = { seconds, time };
                        setLastTestTimer(obj);
                    } catch (err) {
                        console.log({ err });
                        localStorage.setItem(keyDone, "error");
                        const err4send = `in DONE: ${err}`;
                        sendKeepalive(err4send);
                    }
                }
                // if (seconds > 0) setTimeout(testTimerShow, seconds * 1000);
                */
                break;
            case "RESTART_AUTO_REMINDERS":
                // throw Error("error test -1");
                // evt.ports[0].postMessage(SW_VERSION);
                const thisClientPort = evt.ports[0];
                // thisClientPort.postMessage("before restartAutoCheck");
                restartAutoCheck(thisClientPort);
                break;
            case "CHECK_NOTIFY":
                const msDelay = evt.data.msDelay;
                const matchValues = evt.data.matchValues;
                console.log("%cservice-worker message", logColors, { matchValues });
                clearTimeout(tmrCheck);
                tmrCheck = setTimeout(() => { checkToNotify(matchValues); }, msDelay)
                break;
            case "NOTIFY_SPECIFIC":
                {
                    return;
                }
                break;
            case 'GET_VERSION':
                // https://web.dev/two-way-communication-guide/
                evt.ports[0].postMessage(SW_VERSION);
                break;
            case 'SKIP_WAITING':
                // https://developer.chrome.com/docs/workbox/handling-service-worker-updates/
                self.skipWaiting();
                break;
            default:
                console.error("Unknown message data.type", { evt });
        }
    }
}));


////////////////////////////////////////////////////////////////////////
//========== Common ====================================================



// https://stackoverflow.com/questions/38168276/navigator-serviceworker-controller-is-null-until-page-refresh
// Panic testing!
/*
self.addEventListener("install", (evt) => {
    // console.warn("service-worker install event");
    evt.waitUntil(self.skipWaiting()); // Activate worker immediately
});
*/
// https://stackoverflow.com/questions/70331036/why-service-workers-fetch-event-handler-not-being-called-but-still-worked
self.addEventListener("activate", (evt) => {
    console.warn("service-worker activate event");
    evt.waitUntil(self.clients.claim()); // Become available to all pages
});


// Notification seems to be not available here???
// const greeting = new Notification('Hi, I am web worker');

function displayNotification(title, body, url) {
    // https://stackoverflow.com/questions/29774836/failed-to-construct-notification-illegal-constructor
    const action = "display-url";
    const data = { url, action }
    const tag = "Flashcard 4 Internet";
    // const icon = "/img/192.png";
    const icon = "/img/fc4i.svg";
    const options = {
        body, data, tag, icon
        // silent: true,
    }
    if (Notification.permission !== "granted") {
        console.error("Notification requested but not permitted");
        return false;
    }
    console.log("%cdisplayNotification", logColors, { title, options });
    self.registration.showNotification(title, options);
    return true;
}

/*
addEventListener('fetch', (event) => {
    // console.log("our fetch");
    // Prevent the default, and handle the request ourselves.
    event.respondWith((async () => {
        // Try to get the response from a cache.
        const cachedResponse = await caches.match(event.request);
        // Return it if we found one.
        if (cachedResponse) return cachedResponse;
        // If we didn't find a match in the cache, use the network.
        const er = event.request;
        const u = new URL(er.url);
        if (u.hostname == location.hostname) {
            // console.log({ er, u });
        }
        return fetch(event.request);
    })());
});
*/

