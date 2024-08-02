"use strict";

/* @license Copyright 2017 Lennart Borgman (lennart.borgman@gmail.com) All rights reserved. */

const modFirebase = await import("/src/js/mod/start-firebase.js");

var theUser = {};

// https://firebase.google.com/docs/auth/web/google-signin
// https://firebase.google.com/docs/auth/web/facebook-login

export function afterSignIn(result) {
    console.log("afterSignIn result", result);
    addTrace("afterSignIn result", result);
    // FIXME: I don't understand this. credential seems only to be
    // available after new sign in.  What if the user is already
    // signed in? In that case there is no result, just a user after
    // onAuthStateChange.

    // FIXME: never used.
    // if (result.credential) { theUser.token = result.credential.accessToken; }
}

export function checkHasEmail(user) {
    if (!user.email) {
        let providerId = user.providerData[0].providerId;
        signOut();
        const popMap = new Map();
        popMap.set("OK", undefined);
        const pop = new Popup("Sorry, no email. Signed out again. 👵",
            "Your email address is used to identify you in Flashcards 4 Internet,"
            + " but your email address was not provided by " + providerId, popMap);
        pop.show();
    }
}
export async function signIn(provider, redirect) {
    // New way (2023)
    // https://firebase.google.com/docs/web/alt-setup

    const f = await import('https://www.gstatic.com/firebasejs/8.10.1/firebase.js');
    debugger;
    // import { getAuth } from 'https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js'
    const modFirebase = await import('https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js');
    debugger;

    // https://firebase.google.com/docs/auth/web/firebaseui
    // Initialize the FirebaseUI Widget using Firebase.
    const ui = new firebaseui.auth.AuthUI(firebase.auth());
    /*
    ui.start('#firebaseui-auth-container', {
        signInOptions: [
            // List of OAuth providers supported.
            firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            // firebase.auth.FacebookAuthProvider.PROVIDER_ID,
            // firebase.auth.TwitterAuthProvider.PROVIDER_ID,
            // firebase.auth.GithubAuthProvider.PROVIDER_ID
        ],
        // Other config options...
    });
    */
    // <!-- The surrounding HTML is left untouched by FirebaseUI.
    // Your app may use that space for branding, controls and other customizations.-->
    // <h1>Welcome to My Awesome App</h1>
    const h1Welcome = "Welcome";
    // <div id="firebaseui-auth-container"></div>
    const divContainer = mkElt("div", { id: "firebaseui-auth-container" });
    // <div id="loader">Loading...</div>
    const divLoader = mkElt("div", { id: "loader" }, "Loading...");
    const divLogin = mkElt("div", undefined, [
        h1Welcome,
        divContainer,
        divLogin,
    ]);
    document.body.appendChild(divLogin);

    const uiConfig = {
        callbacks: {
            signInSuccessWithAuthResult: function (authResult, redirectUrl) {
                // User successfully signed in.
                // Return type determines whether we continue the redirect automatically
                // or whether we leave that to developer to handle.
                return true;
            },
            uiShown: function () {
                // The widget is rendered.
                // Hide the loader.
                document.getElementById('loader').style.display = 'none';
            }
        },
        // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
        signInFlow: 'popup',
        // signInSuccessUrl: '<url-to-redirect-to-on-success>',
        signInOptions: [
            // Leave the lines as is for the providers you want to offer your users.
            firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            // firebase.auth.FacebookAuthProvider.PROVIDER_ID,
            // firebase.auth.TwitterAuthProvider.PROVIDER_ID,
            // firebase.auth.GithubAuthProvider.PROVIDER_ID,
            // firebase.auth.EmailAuthProvider.PROVIDER_ID,
            // firebase.auth.PhoneAuthProvider.PROVIDER_ID
        ],
        // Terms of service url.
        // tosUrl: '<your-tos-url>',
        // Privacy policy url.
        // privacyPolicyUrl: '<your-privacy-policy-url>'
    };
    // The start method will wait until the DOM is loaded.
    ui.start('#firebaseui-auth-container', uiConfig);
    return;

    if (redirect) {
        firebase.auth().getRedirectResult().then(function (result) {
            afterSignIn(result);
        }).catch(function (error) {
            signInError(error);
        });
        firebase.auth().signInWithRedirect(provider);
    } else {
        firebase.auth().signInWithPopup(provider).then(function (result) {
            afterSignIn(result);
        }).catch(function (error) {
            signInError(error);
        });
    }
}

export function signInGoogle(redirect) {
    const provider = new firebase.auth.GoogleAuthProvider();
    signIn(provider, redirect);
}
function signInFacebook(redirect) {
    const provider = new firebase.auth.FacebookAuthProvider();
    signIn(provider, redirect);
}
function signInTwitter(redirect) {
    const provider = new firebase.auth.TwitterAuthProvider();
    signIn(provider, redirect);
}

function signInError(error) {
    console.log("sign in error", error);
    addTraceError("sign in error", error);

    const popMap = new Map();
    popMap.set("OK", undefined);
    const body = document.createElement("div");
    if (error.code === "auth/account-exists-with-different-credential") {
        const p1 = document.createElement("p")
        body.appendChild(p1);
        p1.innerHTML = "You have already created an account here by signing in with this mail address:";
        const p2 = document.createElement("p");
        body.appendChild(p2);
        p2.innerHTML = "<b>" + error.email + "</b>";
    }
    const p1 = document.createElement("p")
    body.appendChild(p1);
    p1.innerHTML = error.message;

    const pop = new Popup("You can't sign in this way now  👵", body, popMap, true);
    pop.show();
}

export function fixUserIcon() {
    const iconElt = document.getElementById("user-icon");
    const user = theFirebaseCurrentUser;
    if (user) {
        iconElt.innerHTML = "";
        const img = mkElt("img", {
            src: user.photoURL,
            alt: "Image of user",
        });
        iconElt.appendChild(img);
        document.body.classList.add("signed-in");
        document.body.classList.remove("signed-out");
    } else {
        iconElt.innerHTML = "Sign In" + '\xa0';
        document.body.classList.remove("signed-in");
        document.body.classList.add("signed-out");
    }
}

var thePromiseDOMuserIcon = new Promise(function (resolve) {
    const uiElt = document.getElementById("user-icon");
    if (uiElt) {
        return resolve();
    }
    thePromiseDOMready.then(function () {
        return; // FIX-ME
        const header = document.getElementById("caped-header");
        const uiElt = document.getElementById("user-icon");
        if (uiElt) return resolve();
        const mo = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                console.log(mutation);
            });
            var uiElt = document.getElementById("user-icon");
            if (uiElt) {
                mo.disconnect();
                resolve();
            }
        });
        mo.observe(header, {
            childList: true,
            subtree: true,
        });
    });
});

export function signOut() {
    firebase.auth().signOut().then(function () {
        // FIXME: 
        // location.href = "caped.html";
    });
}



export function setupUserIconClick() {
    thePromiseDOMuserIcon.then(function () {
        const iconElt = document.getElementById("user-icon");
        iconElt.addEventListener("click", function () {
            const user = theFirebaseCurrentUser;
            if (user) {
                const email = user.email; // || theUser.email; // FIXME: last part for twitter
                const msg = "You are currently signed in to EasyCapEd as:<br><br>"
                    + "&nbsp;&nbsp;" + user.displayName + "<br>\n"
                    + "&nbsp;&nbsp;" + email + "<br>\n"
                    + "<br>\nDo you want to sign out?"
                if (typeof Popup !== "undefined" && Popup) {
                    const popMap = new Map();
                    popMap.set("Yes", () => signOut());
                    popMap.set("No", undefined);
                    new Popup("Sign Out? 👵", msg, popMap, true).show();
                } else {
                    if (confirm(msg)) signOut();
                }
            } else {
                askSignIn(false);
            }
        });
    });
}
setupUserIconClick();

function askSignIn(force, title) {
    const imgT = "https://www.gstatic.com/mobilesdk/160409_mobilesdk/images/auth_service_twitter.svg";
    const imgF = "https://www.gstatic.com/mobilesdk/160409_mobilesdk/images/auth_service_facebook.svg";
    const imgG = "https://www.gstatic.com/mobilesdk/160512_mobilesdk/auth_service_google.svg";

    const ways = document.createElement("div");
    ways.classList.add("popup-buttons");


    function addBtn(providerFun, title, imgSrc) {
        let btn = document.createElement("div");
        ways.appendChild(btn);
        btn.classList.add("popup-button");
        btn.classList.add("popup-close");
        let img = document.createElement("img");
        img.setAttribute("src", imgSrc);
        btn.appendChild(img);
        let span = document.createElement("span");
        span.innerHTML = "&nbsp;" + title;
        btn.appendChild(span);
        btn.addEventListener("click", (ev) => {
            // Using redirect will erase error messages popups from EasyCapEd
            providerFun(false);
        });
    }
    addBtn(signInGoogle, "Google", imgG);
    // addBtn(signInFacebook, "Facebook", imgF);
    // addBtn(signInTwitter, "Twitter", imgT);

    title = title || "Sign In? 👵";
    const pop = new Popup(title,
        "Choose account:",
        ways, !force);
    pop.show();
}

let theFirstAuthStateChangedDone = false;
const promiseFirstAuthStateChangedDone = new Promise(function (resolve) {
    if (theFirstAuthStateChangedDone) { resolve(); return; }
    (async () => {
        // await promFirebase;
        await modFirebase.promFirebaseAuth;
        firebase.auth().onAuthStateChanged(function (user) {
            theFirstAuthStateChangedDone = true;
            resolve();
        });
    })();
});

// FIXME: sure of the order??? Don't we need firebase-auth.js???
(async () => {
    // await promFirebase;
    await modFirebase.promFirebaseAuth;
    firebase.auth().onAuthStateChanged(function (user) {
        theFirstAuthStateChangedDone = true;
        theFirebaseCurrentUser = user;
        if (user) {
            theFirebaseCurrentUserEmail = user.email;
            checkHasEmail(user);
        } else {
            console.log("firebase.auth().onAuStateChange no user");
        }
        thePromiseDOMuserIcon.then(fixUserIcon);
    });
})();

