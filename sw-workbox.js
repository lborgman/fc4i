//========== Specific ====================================================
const SW_VERSION = "0.4.1650";


// https://www.npmjs.com/package/workbox-sw
importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.1.0/workbox-sw.js');


// throw Error("Test worker error");
const logColors = "color: green; background: yellow;";
// console.log(`%csw-worker-input.js ${SW_VERSION} is here`, logColors + " font-size: 20px;");

const logStyle = "color: green; background: yellow; padding:2px; border-radius:2px;";
const logStrongStyle = logStyle + " font-size:18px;";
function logConsole(...msg) {
    console.log(`%csw-workbox.js`, logStyle, ...msg);
}
function logStrongConsole(...msg) {
    console.log(`%csw-workbox.js`, logStrongStyle, ...msg);
}
logStrongConsole(`${SW_VERSION} is here`);

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
// console.log("%cservice-worker.js after import workbox-sw.js, idb.js and db-fc4i.js", logColors);
logConsole("After import workbox-sw.js, idb.js and db-fc4i.js");

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

workbox.precaching.precacheAndRoute([{"revision":"a4e2271d19eb1f6f93a15e1b7a4e74dd","url":"404-old.html"},{"revision":"267eacf7c68ba9a788e46b1cb1d5d575","url":"about.html"},{"revision":"30f6ef355fbcf03988827db861cd7b05","url":"anchors-with-base.js"},{"revision":"169ad400ab7db646788e059627b5852a","url":"bad2.js"},{"revision":"279baaaced975972bdbe956a7288a263","url":"ext/d3/d3.v7.js"},{"revision":"3debcaf1a98e4445d213fd0089d42f6b","url":"ext/fontawesome/5.13.0/webfonts/fa-brands-400.svg"},{"revision":"89f9806b964f92ad282fd60947eba588","url":"ext/fontawesome/5.13.0/webfonts/fa-regular-400.svg"},{"revision":"ad912fd102f4052d3273dd838e0c671d","url":"ext/fontawesome/5.13.0/webfonts/fa-solid-900.svg"},{"revision":"223e448727cdef669217f1e4828efcc0","url":"ext/html2canvas.esm.js"},{"revision":"fc2dcad49558f9078038642c1fe47e37","url":"ext/jsmind/edited-jsmind-dbg.js"},{"revision":"1d07ce2e792421ce7504d18be5e434aa","url":"ext/jsmind/es6/jsmind.draggable-node.js"},{"revision":"ee84577a5f879b8b7017d8132346e706","url":"ext/jsmind/es6/jsmind.screenshot.js"},{"revision":"a9da10f742c565e1ba54f5ed6438def6","url":"ext/jsmind/jsmind-dbg.js"},{"revision":"a5f0e610686b2c971c528d956d50bbee","url":"ext/jsmind/mm4i-jsmind.draggable-nodes.js"},{"revision":"a1ed409013882346758f3c0f281806f0","url":"ext/jsmind/testing/AI-copilot-1.js"},{"revision":"f2546d42c1ddb567cdd649660b276f57","url":"ext/jsmind/testing/AI-copilot-2.js"},{"revision":"06f93da3be5800010ca1fb03d5153a10","url":"ext/jsmind/testing/jsmind-mm4i.js"},{"revision":"a48e83962fe8aebc3ac72eb8e88adb69","url":"ext/jsmind/testing/mm4i-jsmind.draggable-nodes.js"},{"revision":"8c609bcdb8a5a8fe5b060813a5ef273b","url":"ext/mdc/6.0.0/material-components-web.min.js"},{"revision":"a67515ac50fd1ccd90f00b9723fed2ab","url":"ext/mdc/icon/account_tree_FILL0_wght400_GRAD0_opsz48.svg"},{"revision":"7c13b0c4b4634acb05e29f47ba22fbc9","url":"ext/mdc/icon/add_FILL0_wght400_GRAD0_opsz48.svg"},{"revision":"19079ee44cc28a8f4aa79085df6b43c9","url":"ext/mdc/icon/art_track_FILL0_wght400_GRAD0_opsz48.svg"},{"revision":"f099d1595ee2083dc19c4170187ae59f","url":"ext/mdc/icon/call_to_action_FILL0_wght400_GRAD0_opsz48.svg"},{"revision":"421a64bb862a5dbd29406ee47f86cb89","url":"ext/mdc/icon/close_FILL0_wght400_GRAD0_opsz48.svg"},{"revision":"140de23b3640b1d97df2c86f3fcd85f3","url":"ext/mdc/icon/delete_forever_FILL0_wght400_GRAD0_opsz48.svg"},{"revision":"4b952b76717d2cf421c474da481e998c","url":"ext/mdc/icon/download_FILL0_wght400_GRAD0_opsz48.svg"},{"revision":"adcbc4aa4c6e6cfd0486e67f1e6065c2","url":"ext/mdc/icon/edit_FILL0_wght400_GRAD0_opsz48.svg"},{"revision":"df1bb296e47a20eef454162a5b33aa3b","url":"ext/mdc/icon/edit_note_FILL0_wght400_GRAD0_opsz48.svg"},{"revision":"4fd4464ebc1d35c4e540b6b03bf47b14","url":"ext/mdc/icon/edit_off_FILL0_wght400_GRAD0_opsz48.svg"},{"revision":"600b59d62ba226e75a2768c52c62bc5b","url":"ext/mdc/icon/filter_1_FILL0_wght400_GRAD0_opsz48.svg"},{"revision":"28ab1e25e0cc2a6cafca0b45c29b95bd","url":"ext/mdc/icon/handyman_FILL0_wght400_GRAD0_opsz48.svg"},{"revision":"280142e1238ae86accb6de4eb02329b9","url":"ext/mdc/icon/label_off_FILL0_wght400_GRAD0_opsz48.svg"},{"revision":"1bee0fbd3cc9719ec0417107db7b2a0a","url":"ext/mdc/icon/link_FILL0_wght400_GRAD0_opsz48.svg"},{"revision":"98dafa859f34dc9537d9f239805ef730","url":"ext/mdc/icon/photo_library_FILL0_wght400_GRAD0_opsz48.svg"},{"revision":"6ec9cefd3164d4822bf40faa1b1a7c0f","url":"ext/mdc/icon/quiz_FILL0_wght400_GRAD0_opsz48.svg"},{"revision":"8d5f108d26fd5f2e204e61754b7c5da5","url":"ext/mdc/icon/resize_FILL0_wght400_GRAD0_opsz48.svg"},{"revision":"44f0470be62c967cea394095be39b6df","url":"ext/mdc/icon/search_check_FILL0_wght400_GRAD0_opsz48.svg"},{"revision":"1721f42ba7fa22af4cfdf22acd323f28","url":"ext/mdc/icon/search_FILL0_wght400_GRAD0_opsz48.svg"},{"revision":"04bc137f52b309161670162270d6d154","url":"ext/mdc/icon/search.svg"},{"revision":"57f0909a294bfd1472f478f922e49bb6","url":"ext/mdc/icon/share_FILL0_wght400_GRAD0_opsz48.svg"},{"revision":"389a08a39c0d2abb0adebc98a2ffce82","url":"ext/mdc/icon/tag_FILL0_wght400_GRAD0_opsz48.svg"},{"revision":"5dcb0dedb32e6fa8f3f20bdcb247a358","url":"ext/mdc/icon/today_FILL0_wght400_GRAD0_opsz48.svg"},{"revision":"ef2712a0ffa240aac9e93580e299bedf","url":"ext/mdc/icon/upload_FILL0_wght400_GRAD0_opsz48.svg"},{"revision":"6870b30f4574159a8d37f00a7a3c66a3","url":"ext/mdc/icon/visibility_FILL0_wght400_GRAD0_opsz48.svg"},{"revision":"6189d886275222aef87a5d27c389cbc5","url":"ext/mdc/icon/visibility_off_FILL0_wght400_GRAD0_opsz48.svg"},{"revision":"6e6a7e579d05b6b97b7b832e99f9b989","url":"ext/mdc/material-components-web.js"},{"revision":"a7d3dd10b063b841b6b8e5fdb0b07fc3","url":"ext/pannellum/img/background.svg"},{"revision":"abd6aa83843654ab99cfec9e9d5295b9","url":"ext/pannellum/img/compass.svg"},{"revision":"58badab78c3900e56480f8268e69aefc","url":"ext/pannellum/img/grab.svg"},{"revision":"5b757be6795784c5ce799c855ab156e3","url":"ext/pannellum/img/grabbing.svg"},{"revision":"ac18e8b6cabc3ded421d3bb21b12113d","url":"ext/pannellum/img/sprites.svg"},{"revision":"018faa81a0711886459a4541ac8c887c","url":"ext/pannellum/libpannellum.js"},{"revision":"2a65ccf443d449d5f99e017fe66137c1","url":"ext/pannellum/pannellum.js"},{"revision":"820053f739b8322f2cc9b204691a1c90","url":"ext/pannellum/pannellum2d.js"},{"revision":"971606ccf1f517c5dfb65f9ea598d5e2","url":"ext/pannellum/test2d.html"},{"revision":"67d5ba0eedac3cc3d85082f3c5481110","url":"ext/png-meta/png-metadata.js"},{"revision":"30198537d730a0fc07e024a0b52628f5","url":"fc4i-importmaps.js"},{"revision":"5f40db10428879e209fd487b193b52f8","url":"fc4i/fc4i.html"},{"revision":"482c15175f60c0f04f81eeeba11d6725","url":"fc4i/manifest-fc4i.json"},{"revision":"a87511bf17fd8494d75602af4e1f1792","url":"fc4i/share.html"},{"revision":"49a645b9cb67a6f0556351ac27c0c427","url":"firebase-messaging-sw.js"},{"revision":"18b2007f7076b8f1343403d1eb118b4a","url":"img/fc4i.svg"},{"revision":"119e2feb5fa4b6c4338d9a6b3809f64e","url":"img/loci.svg"},{"revision":"3ffd6c2758f64a3f31041436408b0426","url":"img/mental-capacity-intelligence-remember-intellect-svgrepo-com.svg"},{"revision":"f1391e89c2b3c14058d2dde65fa52452","url":"img/mindmap-icon.svg"},{"revision":"f85968e3538a61176a74d123d77e9c96","url":"img/mm.svg"},{"revision":"83ff468e809677a9261d491824751208","url":"img/mm4i.svg"},{"revision":"7cdd8ea137fd5ac36e3cef16d8ec761a","url":"img/my-ad-6.svg"},{"revision":"03789ace4e2fc18f2f250cd997a87d1a","url":"img/nwg.svg"},{"revision":"3ffd6c2758f64a3f31041436408b0426","url":"img/rem10m1h.svg"},{"revision":"4f94eab34045b6797aba6aeed7807ce8","url":"img/share_FILL0_wght400_GRAD0_opsz24.svg"},{"revision":"a0f71211db2eb640b505398781d21386","url":"img/tl.svg"},{"revision":"a6d58af7eb44881066fbb7c2e34531b4","url":"index.html"},{"revision":"a84a3ec3e11bdf954f482e256fe8a49b","url":"init-error.js"},{"revision":"c2bba3a843721a4bfefda91f432c5607","url":"jsmind-edit.html"},{"revision":"5923c7e657fc65724028baaa57bb0bb5","url":"loci/loci.html"},{"revision":"36feae1a87e35f7845e9eb89d57123b0","url":"manifest.json"},{"revision":"7359fe0db2417f973f7016d9dd0b4bed","url":"mdc-variables.html"},{"revision":"e43693cca519abcc1043cf5efbefb44f","url":"mm4i/manifest-mm4i.json"},{"revision":"e83ce7632eba004de51c09888e781338","url":"mm4i/mm4i.html"},{"revision":"6d8eb83ba578ad11479b09b5d2ed7c1e","url":"nwg/manifest-nwg.json"},{"revision":"791496cdb0818438e5f0b2c7d8ecaf08","url":"nwg/netwgraph.html"},{"revision":"04e94f80bb991abc172ab914cd550953","url":"pwa-not-cached.js"},{"revision":"3d931e927f6c84f623d1bc7b70c7ca25","url":"pwa.js"},{"revision":"0e3cc5a8e50304947e68be4e4788a3a5","url":"service-worker.js"},{"revision":"516853be330d3202216d2975218a6b9b","url":"share.html"},{"revision":"8181d11e3a1285d761911769d748ba7a","url":"src/acc-colors.js"},{"revision":"c0252438c3127eb6de7fe1c015197f56","url":"src/js/common.js"},{"revision":"8dfcda5ed13eccfdfa576fd3b9b9bbf0","url":"src/js/db-fc4i.js"},{"revision":"b3ffb23e47492bf9f3f693a142f28a6e","url":"src/js/db-mindmaps.js"},{"revision":"54c3499a0115e2e99faf067f0a80cc19","url":"src/js/db.js"},{"revision":"351c970d0d0ebb2dc8c5d29df54577ff","url":"src/js/images.js"},{"revision":"5ebb1c94d707da9a83d00b09d4c6f2a8","url":"src/js/is-displayed.js"},{"revision":"59eadb9b90eafe57723111fad4ed1d71","url":"src/js/jsmind-cust-rend.js"},{"revision":"2b21feccd305e4f99563b2757eaecb86","url":"src/js/jsmind-edit-common.js"},{"revision":"cd436866fc679bd7bed646dee95166fe","url":"src/js/jsmind-edit-spec-fc4i.js"},{"revision":"ba4b2d32a1f4ed76cbaed81d5f0fad26","url":"src/js/jsmind-edit-spec-jsmindedit.js"},{"revision":"b9e0b7bfca77f89f3496be03a10bb2b3","url":"src/js/jsmindedit-importmaps.js"},{"revision":"99da8711c154ba2db07369ab4e485dd9","url":"src/js/main-rem10m1h.js"},{"revision":"1a414a84fea103434f0e1cc8942d9d42","url":"src/js/mindmap-helpers.js"},{"revision":"9b846af22b2fcc82ff5b8e1984ae8d5e","url":"src/js/mod/3d-force-graph.js"},{"revision":"cf3581906153fdb4961c892580906575","url":"src/js/mod/3d-force-graph.min.js"},{"revision":"6b6f52dc4ff355e87685853bd7d67e85","url":"src/js/mod/color-converter.js"},{"revision":"267b9adc7b8128eb52968ab927447727","url":"src/js/mod/debounce.js"},{"revision":"e34f80f91fb74a25c7edfaf43fd21aba","url":"src/js/mod/dom-json.js"},{"revision":"9b6c6af9aa236f488e0dfa3fcaec2c3b","url":"src/js/mod/fixBigImg.js"},{"revision":"9f66bcd1e1010ac653317549b2f63f4e","url":"src/js/mod/flashcards.js"},{"revision":"c630881aad9bf733026ab97d9650dc33","url":"src/js/mod/idb-common.js"},{"revision":"3d8f73b3050ceb964eedb06b04262245","url":"src/js/mod/isObject.js"},{"revision":"ada26824abddc667edef67b398610972","url":"src/js/mod/local-settings.js"},{"revision":"c13978626712fedb25b0791a7b86630a","url":"src/js/mod/mindmap-icons.js"},{"revision":"ecb020aebae985854cd892ddb6d23e09","url":"src/js/mod/mm4i-fsm.js"},{"revision":"57db95aa957f39e03dcefffd2a6fbb83","url":"src/js/mod/mod-mindmap-icon.js"},{"revision":"4392a85784fc363e680eb5ed1848570a","url":"src/js/mod/my-svg.js"},{"revision":"16c5345d12407e5d2dbb022e93ef0528","url":"src/js/mod/ngraph.forcelayout.js"},{"revision":"3f26a43d77fb6da2b948356f0a0f7d77","url":"src/js/mod/ngraph.graph.js"},{"revision":"bbebfebfb192afc2d9fbadf369ae59d3","url":"src/js/mod/sharing-params.js"},{"revision":"0e1baebfe0a0ed33ea925c4d09c7fc19","url":"src/js/mod/sign-in.js"},{"revision":"4bdc7fb8d8099f3d793804f4e40c5a1f","url":"src/js/mod/start-firebase.js"},{"revision":"867b1970087b8bac15442ce5e014b531","url":"src/js/mod/tasks.js"},{"revision":"ddca7a8c0efba00d41aeeb1ad95acdfd","url":"src/js/mod/three-spritetext.min.js"},{"revision":"c7ba1e93bfb0fefc5b77d264aeb1c16e","url":"src/js/mod/tinycolor-min.js"},{"revision":"66ae927109715150ac743be7f3eca6a2","url":"src/js/mod/tween.esm.js"},{"revision":"547306b1b83739cd506a52a07c72045e","url":"src/js/mod/util-mdc.js"},{"revision":"bdbdf5d0c94050e266f05a0910fbd03a","url":"src/js/netwgraph.js"},{"revision":"813b0c32b9bc8aa6fd0fc7d665143987","url":"src/js/share.js"},{"revision":"06327aa356993b5f1a59d5ea569468bf","url":"src/js/tools.js"},{"revision":"b455087033c35ea61b3bb65b72a102d6","url":"src/js/tools4server.js"},{"revision":"becc2fb9a5723b96e3e58f2d93390bec","url":"src/js/umd/idb.js"},{"revision":"59ec73093bca5553653b8d35fa921651","url":"temp.html"},{"revision":"ae381dbcb9512a933423f63d29dc6d02","url":"temp2.html"},{"revision":"dcc47da194844c7416c4ca1348e9c1b3","url":"test-login.html"},{"revision":"2d9b3f41d3051476e16ea2b60980b2bb","url":"tl/manifest-tl.json"},{"revision":"7caea938334ad9a385e41e8dbe487ebf","url":"tl/text-and-link.html"},{"revision":"366dda6cfb70a3920feae48c899cee05","url":"tsconfig.json"},{"revision":"0b0dd6dc9d82f1bb30ae4a1e0ff5b6f3","url":"workbox-config.js"}])
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
    logStrongConsole("shareTargetHandler");
    logStrongConsole("shareTargetHandler", { evt }, evt.respondWith);
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
    // console.log("%cdisplayNotificationFromRecord", logColors, { expiredRecord, timerInfo });
    logConsole("displayNotificationFromRecord", { expiredRecord, timerInfo });
    const title = `(${timerInfo}) ${expiredRecord.title}`;
    const body = expiredRecord.desc;
    const encodedKey = decodeURIComponent(expiredRecord.key);
    const encodedTimerInfo = decodeURIComponent(timerInfo);
    const url = `${location.protocol}//${location.host}/share.html?key=${encodedKey}&timerInfo=${encodedTimerInfo}`;
    console.log("%ckey", "color:red; font-size:20px;", { url });

    const displayed = displayNotification(title, body, url);
    // console.log("%cwas displayed", logColors, { displayed });
    logConsole("Was displayed", { displayed });
}

async function displayExpiredLongTimeNotification(objExpired) {
    const { expiredRecord, expiredTimers } = objExpired;
    // console.log("%cdisplayExpiredLongTimeNotification", logColors, { objExpired, expiredRecord, expiredTimers });
    logConsole("displayExpiredLongTimeNotification", { objExpired, expiredRecord, expiredTimers });
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
    // console.log("%cService Worker stored notification done", logColors);
    logConsole("Service Worker stored notification done");
}
self.addEventListener('notificationclick', (evt) => {
    // console.log("%cService Worker notificationclick", logColors, { evt });
    logConsole("notificationclick", { evt });
    if (!evt.notification.data.action) {
        // Was a normal notification click
        // console.log('%cNotification Click.', logColors);
        logConsole('Notification Click.');
        return;
    }
    switch (evt.notification.data.action) {
        case 'display-url':
            const url = evt.notification.data.url;
            // console.log(`%cDisplay url ${url}`, logColors);
            logConsole(`Display url ${url}`);
            clients.openWindow(url);
            break;
        default:
            // console.log(`%cUnknown action clicked: '${evt.action}'`, logColors);
            logStrongConsole(`Unknown action clicked: '${evt.action}'`);
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
        // console.log("%crestartCheckAutoCheck", logColors, { clientPort });
        logConsole("restartCheckAutoCheck", { clientPort });
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
            // console.log("%checkSave() error)", logColors, { error });
            logStrongConsole("checkSave() error)", { error });
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
    // console.log("%cservice-worker message", logColors, { evt, msgType });
    logConsole("message", { evt, msgType });
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
                // console.log("%cservice-worker message", logColors, { matchValues });
                logConsole("message", { matchValues });
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
    // console.warn("service-worker activate event");
    logStrongConsole("service-worker activate event");
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
    // console.log("%cdisplayNotification", logColors, { title, options });
    logConsole("displayNotification", { title, options });
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

