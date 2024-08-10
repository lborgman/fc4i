/*
    Tools for sync with server.
    This file is to be included on the client side.

    webjonif.mjs is to be used also on the server side.
*/

var webJsonIf = {};
let importWebJsonIf = async function () {
    if (Object.keys(webJsonIf).length > 0) return; // Why test this?
    const webjsonifURL = "/js/msj/webjsonif.mjs";
    try {
        const module = await import(webjsonifURL);
        webJsonIf = module.webJsonIf;
    } catch (err) {
        if (location.protocol !== "file:") console.log(`Not found: ${webjsonifURL}`);
    }
};
importWebJsonIf();

// https://azimi.me/2015/07/30/non-blocking-async-json-parse.html
function asyncParse(string) {
    return (new Response(string)).json();
}

async function redirectSimple(ifName, paramsObj) {
    await importWebJsonIf();
    const params = paramsObj;
    const postJson = {};
    const paramsRules = webJsonIf[paramsName];
    if (typeof paramsRules === "undefined") throw Error(`paramsRuls undefined for ${paramsName}`);
    const baseUrl = "/" + ifName;
    const urlObj = new URL(baseUrl, location.href);

    const wanted = {}; // JSON.parse(JSON.stringify(paramsRules.wanted));
    const post = paramsRules.post;
    if (post) throw Error(`POST not implemented yet`);
    // FIXME: functions
    for (const ent of Object.entries(params)) {
        const [k, v] = ent;
        const rulesWantedK = paramsRules.wanted[k];
        if (typeof rulesWantedK === "undefined") throw Error(`Unknown parameter: ${k}`);
        if (typeof paramsRules.wanted[k] === "undefined") throw Error(`Unknown parameter: ${k}`);
        if (typeof v === "undefined") {
            if (!rulesWantedK) continue;
            throw Error(`Parameter ${k} is undefined`)
        }
        wanted[k] = v;
    }
    for (const ent of Object.entries(paramsRules.wanted)) {
        const [k, v] = ent;
        const wantedV = wanted[k];
        if (typeof wantedV === "undefined") {
            if (paramsRules.wanted[k] === false) continue;
            throw Error(`Parameter ${k} not given`);
        }
        if (post.includes(k)) {
            postJson[k] = wantedV;
        } else {
            urlObj.append(k, wantedV);
        }
    }
    location.href = urlObj;
}
async function fetchSimpleJson(ifName, paramsObj) {
    const onLine = navigator.onLine;
    if (onLine !== true) throw Error(`Offline is not network trouble (${onLine})`);
    const paramsRules = webJsonIf[ifName];
    if (typeof paramsRules.wanted.idtoken !== "undefined") {
        if (paramsObj.idtoken) throw Error("idtoken is added automatically");
        const idToken = await theFirebaseCurrentUser.getIdToken(true);
        paramsObj.idtoken = idToken;
    }
    const baseUrl = "/" + ifName;
    // FIXME: await here to catch network errors.
    const result = await fetchParamsJson(baseUrl, ifName, paramsObj);
    if (result === undefined) {
        debugger; // eslint-disable-line no-debugger
    }
    return result;
}
async function fetchParamsJson(baseUrl, paramsName, params, nothrow) {
    await importWebJsonIf();
    const urlParts = [];
    const postJson = {};
    const paramsRules = webJsonIf[paramsName];
    if (typeof paramsRules === "undefined") throw Error(`paramsRuls undefined for ${paramsName}`);
    const wanted = {}; // JSON.parse(JSON.stringify(paramsRules.wanted));
    const post = paramsRules.post;
    // FIXME: functions
    for (const ent of Object.entries(params)) {
        const [k, v] = ent;
        const rulesWantedK = paramsRules.wanted[k];
        if (typeof rulesWantedK === "undefined") throw Error(`Unknown parameter: ${k}`);
        if (typeof paramsRules.wanted[k] === "undefined") throw Error(`Unknown parameter: ${k}`);
        if (typeof v === "undefined") {
            if (!rulesWantedK) continue;
            throw Error(`Parameter ${k} is undefined`)
        }
        wanted[k] = v;
    }
    for (let i = 0, len = post.length; i < len; i++) {
        if (typeof paramsRules.wanted[post[i]] === "undefined") {
            throw Error(`${key} found in post but not in wanted`);
        }
    }
    for (const ent of Object.entries(paramsRules.wanted)) {
        const [k, v] = ent;
        const wantedV = wanted[k];
        if (typeof wantedV === "undefined") {
            if (paramsRules.wanted[k] === false) continue;
            throw Error(`Parameter ${k} not given`);
        }
        if (post.includes(k)) {
            postJson[k] = wantedV;
        } else {
            const encodedV = encodeURIComponent(wantedV);
            urlParts.push(`${k}=${encodedV}`);
        }
    }
    let url = baseUrl;
    if (urlParts.length > 0) url += "?" + urlParts.join("&");
    let result;
    postJson["paramsNameCheck"] = paramsName;
    if (JSON.stringify(postJson).length > 2) {
        result = await fetchPostJson(url, postJson, nothrow);
    } else {
        result = await fetchJson(url, undefined, nothrow);
    }
    if (!result) {
        return;
    }
    if (paramsRules.answer) {
        if (!result.answer) throw Error(`fetchParamsJson: server did not send result.answer`);
        const same = deepSameKeys(paramsRules.answer, result.answer);
        if (same !== true) {
            console.error(`answer keys differ, paramsRules, result:`, { paramsRules }, paramsRules.answer, result.answer);
            throw Error(`answer keys differ: ${same.notSame}`);
        }
    }
    return result;
}
async function fetchPostJson(url, postJson, nothrow) {
    const options = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(postJson),
    };
    return await fetchJson(url, options, nothrow);
}
async function fetchJson(url, options, nothrow) {
    if (nothrow) throw Error("nothrow is removed: " + url)
    const result = {};
    const stack = getStack().split("\n").map(val => val.replace(new RegExp("\\(.*/"), "("));
    stack.splice(1, 1);
    result.browserStack = stack;
    let response;
    try {
        result.phase = "fetch";
        response = await fetch(url, options);
    } catch (err) {
        if (err.code === "auth/network-request-failed") {
            // FIXME: how to handle it???
            console.error(`%c Seeing network error`, "color:red; font-size:1.5rem;", err);
            const errObj = Error(`${err.message} (${err.code})`);
            errObj.thisIsNetworkTrouble = true;
            throw errObj;
        }
        err.fetchinfo = result;
        throw err;
    }


    result.phase = "response";
    // console.log("response", response)
    result.status = response.status;
    result.ok = response.ok;

    if (!response.ok) {
        // FIXME: Is this the best way for Gateway timeout, 504?
        // if (response.status === 504) return result;
        await throwFetchError(url, response, result);
        debugger; // eslint-disable-line no-debugger
        return;
    }
    result.phase = "text";
    result.text = await response.text();
    result.phase = "json";
    const resultAsJson = await asyncParse(result.text);
    resultAsJson.is200json = true;
    return resultAsJson;
}

function getResponseMimeType(response) {
    const ct = response.headers.get("Content-Type");
    const ctArr = ct.split(";");
    return ctArr[0];
}
