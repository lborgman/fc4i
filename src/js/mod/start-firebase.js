/* @license Copyright 2019 Lennart Borgman (lennart.borgman@gmail.com) All rights reserved. */


//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
// Firebase
const arrPromAppendedScriptsLoaded = [];
function appendScriptWait4loaded(src, tell) {
    // addTrace(src);
    const prom = new Promise(resolve => {
        const elt = document.createElement("script");
        elt.setAttribute("async", false);
        if (tell) {
            if (typeof tell === "function") {
                elt.onload = () => {
                    tell();
                    // addTrace("resolve tell", src);
                    resolve();
                }
            } else {
                const onloadFun = () => {
                    // addTrace("resolve onload", src);
                    resolve();
                }
                elt.onload = onloadFun;
                const onerrorFun = (err) => {
                    addTraceError("resolve onerror", src);
                    resolve();
                }
                elt.onerror = onerrorFun;
            }
        }
        document.body.appendChild(elt);
        try {
            elt.setAttribute("src", src);
        } catch (err) {
            addTraceError("error setting src", src, err);
            resolve();
        }
    });
    // arrPromAppendedScriptsLoaded.push(prom); // FIXME:
    return prom;
}

// https://firebase.google.com/docs/web/setup
// https://firebase.google.com/support/release-notes/js
// const firebaseVer = "7.18.0"; // 2020-08-13
// const firebaseVer = "7.19.0";
// const firebaseVer = "7.19.1";
// const firebaseVer = "7.21.1";
// const firebaseVer = "7.22.1";
// const firebaseVer = "7.24.0";
// const firebaseVer = "8.0.0";
// const firebaseVer = "8.0.1";
// const firebaseVer = "8.0.2";
const firebaseVer = "9.17.2";

// FIXME:
const promFirebase = new Promise(async resolve => {
    function afterFirebaseApp() {
        myInitApp();
        resolve();
    }
    // appendScriptWait4loaded("/__/firebase/" + firebaseVer + "/firebase-app.js", afterFirebaseApp);
    const app = await import("/__/firebase/" + firebaseVer + "/firebase-app.js");
});
export const promFirebaseAuth = new Promise(async resolve => {
    function afterFirebaseAuth() { resolve(); }
    await promFirebase;
    appendScriptWait4loaded("/__/firebase/" + firebaseVer + "/firebase-auth.js", afterFirebaseAuth);
});
/*
const promFirebaseSignInLoaded = new Promise(resolve => {
    function afterLoadSignIn() { resolve(); }
    appendScriptWait4loaded("/js/sign-in.js", afterLoadSignIn);
});
*/

(async function () {
    // console.log("start-sw-firebase ---------------- -3")
    try {
        await promFirebase;
        // await promFirebaseAuth;
        // console.log("start-sw-firebase ---------------- -2")
        const firebaseScripts = [
            // "/__/firebase/" + firebaseVer + "/firebase-auth.js",
            // "/__/firebase/" + firebaseVer + "/firebase-firestore.js",
            // "/__/firebase/" + firebaseVer + "/firebase-functions.js",
            // "/__/firebase/" + firebaseVer + "/firebase-storage.js",
            // "/__/firebase/" + firebaseVer + "/firebase-messaging.js",

            // appId still missing under localhost, use myInitApp instead
            // appId is now in init.js
            // But. There may be a problem with locationId...

            // "/__/firebase/init.js",
        ];
        firebaseScripts.map(rec => {
            const prom = appendScriptWait4loaded(rec, true);
            arrPromAppendedScriptsLoaded.push(prom); // FIXME:
        });
        // console.log("start-sw-firebase ---------------- -1")
        await Promise.all(arrPromAppendedScriptsLoaded);
        // console.log("start-sw-firebase ---------------- 0")
        // myInitApp();

        // console.log("start-sw-firebase ---------------- 1")
        // await appendScriptWait4loaded("/js/sign-in.js", true);
        // await promFirebaseSignInLoaded;

        // console.log("start-sw-firebase ---------------- 2")
        // await setupServiceWorker();
        // console.log("start-sw-firebase ---------------- 3")
        // await setupFCM();
        // console.log("start-sw-firebase ---------------- 4")

        // enableFirestoreOffline();
        // console.log("start-sw-firebase ---------------- 5")
        // Load scripts dependent on Firebase
        console.log({ theAfterFireBase });
        if (!theAfterFireBase) { return; }
        // console.log("start-sw-firebase ---------------- 6")
        const promsAfter = [];
        theAfterFireBase.map(rec => {
            const prom = appendScriptWait4loaded(rec);
            promsAfter.push(prom);
        });
        console.log({ promsAfter });
        if (promsAfter.length > 0) await Promise.all(promsAfter);
        console.warn("start-sw-firebase END =========================");
    } catch (err) {
        throw err;
        // FIXME: propagate to main
    }
    // console.log("firebase finally =========================");
})();

function myInitApp() {
    console.log("myInitApp");
    // Your web app's Firebase configuration

    /*
    var firebaseConfig = {
        apiKey: "AIzaSyBO7O0xSI4aa6c9kLeZqS9RXJ6lhZwuJK4",
        authDomain: "easycaped-1.firebaseapp.com",
        databaseURL: "https://easycaped-1.firebaseio.com",
        projectId: "easycaped-1",
        storageBucket: "easycaped-1.appspot.com",
        messagingSenderId: "729240215503",
        // appId: "1:729240215503:web:eff113760e240be7163cba", // easycaped-1
        appId: "1:729240215503:web:a1a7cef60e3c55d1163cba", // EasyCapEd
    };
    firebase.initializeApp(firebaseConfig);
    */

    const firebaseConfigEasyCapEd = {
        apiKey: "AIzaSyBO7O0xSI4aa6c9kLeZqS9RXJ6lhZwuJK4",
        authDomain: "easycaped-1.firebaseapp.com",
        databaseURL: "https://easycaped-1.firebaseio.com",
        projectId: "easycaped-1",
        storageBucket: "easycaped-1.appspot.com",
        messagingSenderId: "729240215503",
        appId: "1:729240215503:web:a1a7cef60e3c55d1163cba"
    };


    const firebaseConfigEasycaped1 = {
        projectId: "easycaped-1",
        appId: "1:729240215503:web:eff113760e240be7163cba",
        databaseURL: "https://easycaped-1.firebaseio.com",
        storageBucket: "easycaped-1.appspot.com",
        // "locationId": "us-central",
        apiKey: "AIzaSyBO7O0xSI4aa6c9kLeZqS9RXJ6lhZwuJK4",
        authDomain: "easycaped-1.firebaseapp.com",
        messagingSenderId: "729240215503",
    };

    // Initialize Firebase

    // firebase.initializeApp(firebaseConfigEasyCapEd);
    // firebase.initializeApp(firebaseConfigEasycaped1);

    // const useConf = "EasyCapEd";
    const useConf = "Easycaped1";

    const uc = Object.entries({ useConf })[0].toString();
    console.log(`%c ${uc}`, "color:red; font-size:2rem;");
    switch (useConf) {
        case "Easycaped1":
            firebase.initializeApp(firebaseConfigEasycaped1);
            break;
        /*
    case "EasyCapEd":
        firebase.initializeApp(firebaseConfigEasyCapEd);
        break;
        */
        default:
            throw Error(`Unknown useConf=${useConf}`);
    }
}
// https://firebase.google.com/docs/firestore/manage-data/enable-offline#configure_offline_persistence
async function enableFirestoreOffline() {
    let errorCode;
    console.warn("Firestore offline enablePersistence starting.");
    try {
        await firebase.firestore().enablePersistence({ synchronizeTabs: true })
        console.warn("Firestore offline enablePersistence done.");
    } catch (err) {
        errorCode = err.code;
        console.warn("222Firestore offline enablePersistence failed:", err.code, err);
        if (err.code == 'failed-precondition') {
            console.error("failed-precondition, enablePersistence")
            // Multiple tabs open, persistence can only be enabled
            // in one tab at a a time.
            // ...
        } else if (err.code == 'unimplemented') {
            console.error("unimplemented, enablePersistence")
            // The current browser does not support all of the
            // features required to enable persistence
            // ...
        }

    }
    if (errorCode === "failed-precondition") {
        console.error("HERE")
        try {
            await firebase.firestore().clearPersistence();
        } catch (err) {
            console.error("Could not clearPersistence", err.code)
        }
    }
}

// Handle incoming messages. Called when:
// - a message is received while the app has focus
// - the user clicks on an app notification created by a service worker
//   `messaging.setBackgroundMessageHandler` handler.
/*
// Totally wrong place...
promFirebase.then(() => {
    const messaging = firebase.messaging();
    messaging.onMessage((payload) => {
        console.log('Message received. ', payload);
        // ...
    });
})
*/
////////////////////////////////////////////////////////////
//// Notifications
var messaging;
var FCMtoken;
async function setupFCM() {
    // console.warn("setupFCM starting");
    if (!messaging) {
        console.warn("setupFCM adding usePublicVapidKey");

        messaging = firebase.messaging();
        // messaging.usePublicVapidKey('<YOUR_PUBLIC_VAPID_KEY_HERE>')
        // usePublicVapdKey may only be called once!

        // messaging.usePublicVapidKey('BH7lgf4GqnV6fONBFa_E78nzXleT0cULBt9Z0cQ8qINrfuyYRyqy_hrWKzgkd19ets9Ks1I4AOQcozkJLuQ6YoQ')
        // New key 2020-07-26
        // messaging.usePublicVapidKey('BMJaLNyFzwu8NEZS5ZpXLW9xy1fHXulflssY8ZukChZbhcbIii1ti2o6KBRM1jsQ_9czs0n8d9W2Mjp16ukCOEU');
        // New key 2020-07-28
        messaging.usePublicVapidKey('BHoPtAy-YfIWQTlU8HjiFDEEgv0oyxQc_l5egE6hDzabS0cxmR9MeQUr1AMYg3hW6Kgm29GuNmBsWkTSrvNU4C0');
        console.log("setupFCM added usePublicVapidKey");

        messaging.onMessage((payload) => {
            console.log('☎️☎️ Message received in window. ', payload);
            const data = payload.data;
            const what = data.what;
            switch (what) {
                case "transcription-ready":
                    const eventName = what + "-" + data.operationName;
                    window.dispatchEvent(new Event(eventName))
                default:
                    console.error("️☎️️☎️️ Unknown message type:", payload);
            }
        });
        console.log("setupFCM added onMessage");

        // Callback fired if Instance ID token is updated.
        messaging.onTokenRefresh(() => {
            messaging.getToken().then((refreshedToken) => {
                console.log('Token refreshed.');
                FCMtoken = refreshedToken;
                // Indicate that the new Instance ID token has not yet been sent to the
                // app server.
                // setTokenSentToServer(false);
                // Send Instance ID token to app server.
                // sendTokenToServer(refreshedToken);
                // [START_EXCLUDE]
                // Display new Instance ID token and clear UI of all previous messages.
                // resetUI();
                // [END_EXCLUDE]
            }).catch((err) => {
                console.log('Unable to retrieve refreshed token ', err);
                // showToken('Unable to retrieve refreshed token ', err);
            });
        });
        console.log("setupFCM added onTokenRefresh");

        // FIXME: errorHandlerAsyncEvent is perhaps not always defined here???
        // window.addEventListener("online", errorHandlerAsyncEvent(async evt => 
        window.addEventListener("online", async evt => {
            FCMtoken = await messaging.getToken();
            console.log({ FCMtoken });
        });
        console.log("setupFCM added online listener");
    }

    const permission = await Notification.requestPermission();
    switch (permission) {
        case "granted":
            FCMtoken = await messaging.getToken(); // What happens if we are offline here?
            console.warn("granted", { FCMtoken });
            // if (FCMtoken === undefined) alert("Could not get FCMtoken");
            break;
        case "default":
            console.warn("The Notification permission request was dismissed")
            break;
        case "denied":
            console.error("The Notification permission request was denied")
            // FIXME: take care of this later!
            break;
        default:
            throw Error(`Unexpected value from .requestPermission(): ${permission}`);
    }
    // console.warn("onLine, FCMtoken", navigator.onLine, typeof FCMtoken)
}
