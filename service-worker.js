// throw Error("Test worker error");
// console.log("service-worker.js is here");

importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');
workbox.routing.registerRoute(
  /\.(?:js|css|webp|png|svg|html)$/,
  new workbox.strategies.StaleWhileRevalidate()
  // new workbox.strategies.NetworkFirst()
);
// https://web.dev/workbox-share-targets/
workbox.routing.registerRoute(
    "/share",
    shareTargetHandler,
    "GET"
);

async function shareTargetHandler(evt) {
    console.warn({evt});
}

importScripts("src/js/umd/idb.js");
importScripts("src/js/db-fc4i.js");
console.log("service-worker.js after import workbox-sw.js, idb.js and db-fc4i.js");


// https://stackoverflow.com/questions/38168276/navigator-serviceworker-controller-is-null-until-page-refresh
self.addEventListener("install", (evt) => {
    // console.warn("service-worker install event");
    evt.waitUntil(self.skipWaiting()); // Activate worker immediately
});
self.addEventListener("activate", (evt) => {
    console.warn("service-worker activate event");
    evt.waitUntil(self.clients.claim()); // Become available to all pages
});


async function checkToNotify() {
    const db = await getDb();
    console.log("service-worker", { idb, db });
    const toNotify = await getToNotifyNow();
    console.log("service-worker", { toNotify });
    const toNot0 = toNotify[0];
    if (toNot0) { displayRememberNotification(toNot0); }
}
setTimeout(checkToNotify, 1000);

// Notification seems to be not available here???
// const greeting = new Notification('Hi, I am web worker');

function displayNotification(title, body, url) {
    // https://stackoverflow.com/questions/29774836/failed-to-construct-notification-illegal-constructor
    const action = "display-url";
    const data = { url, action }
    const tag = "rem10m1h";
    const options = {
        body, data, tag,
        // silent: true,
    }
    if (Notification.permission !== "granted") return false;
    console.log("displayNotification", { title, options });
    self.registration.showNotification(title, options);
    return true;
}
async function displayRememberNotification(objRem) {
    console.log("displayRememberNotification", { objRem });
    const title = `Remember ${objRem.title}`;
    const body = objRem.desc;
    const url = objRem.url;
    const displayed = displayNotification(title, body, url);
    console.log({displayed});
}
self.addEventListener('notificationclick', (evt) => {
    console.log("notificationclick", { evt });
    if (!evt.notification.data.action) {
        // Was a normal notification click
        console.log('Notification Click.');
        return;
    }
    switch (evt.notification.data.action) {
        case 'display-url':
            const url = evt.notification.data.url;
            console.log(`Display url ${url}`);
            clients.openWindow(url);
            break;
        default:
            console.log(`Unknown action clicked: '${evt.action}'`);
            break;
    }
});

setTimeout(() => {
    // console.log("service-worker test");
    // displayNotification("from sw");
    // debugger;
}, 6000);

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

let tmrCheck;
self.addEventListener("message", (evt) => {
    console.log("service-worker", evt);
    if (evt.data) {
        switch (evt.data.type) {
            case "CHECK_NOTIFY":
                const msDelay = evt.data.msDelay;
                // const msDelay = 2000;
                clearTimeout(tmrCheck);
                tmrCheck = setTimeout(checkToNotify, msDelay)
                break;
            default:
                console.error("Unknown message data.type", { evt });
        }
    }
})