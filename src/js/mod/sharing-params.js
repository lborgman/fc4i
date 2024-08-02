console.log("here is module sharing-params.js");
if (document.currentScript) throw Error("import .currentScript"); // is module
if (!import.meta.url) throw Error("!import.meta.url"); // is module

// https://developer.chrome.com/articles/web-share-target/
// https://web.dev/web-share/
// https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/How_to/Share_data_between_apps
// https://www.raymondcamden.com/2023/04/20/testing-the-web-share-api

// let isMaybeFromShare = false;

const getQueryParams = (query) => {
    let params = {};
    new URLSearchParams(query).forEach((value, key) => {
        params[key] = value;
    });
    return params;
};

const searchParams = getQueryParams(location.search);
const keysParams = Object.keys(searchParams);
const nParams = keysParams.length;

let url = searchParams['url'];
let title = searchParams['title'];
let text = searchParams['text'];

// Sometimes url is missing
const urlIsUrl = url?.startsWith("https://");
const titleIsUrl = title?.startsWith("https://")
    // https://www.westonlambert.com/glassandstone ??? What is going on at that server?
    || title?.startsWith("http://");
const textIsUrl = text?.startsWith("https://")
    // https://www.westonlambert.com/glassandstone ??? What is going on at that server?
    || text?.startsWith("http://");

if (!urlIsUrl) {
    if (textIsUrl) {
        url = text;
        // text = "(missing, contains URL instead)";
        text = undefined;
    } else if (titleIsUrl) {
        url = title;
        title = undefined;
    }
}
if (title == undefined || title == "") { title = text; text = undefined; }
const sharingParams = { text, title, url };
console.log(`URL sharing parameters: title: ${title}, text: ${text}, url: ${url}`);


// Try to figure out the desired shared parameters
export function getOurSharedParams() {
    if (!text && !title && !url) return;
    return sharingParams;
}

export function removeUrlParam(urlIn, param) {
    if (!(urlIn instanceof URL)) { throw Error(`urlIn is not URL`); }
    const urlOut = new URL(urlIn);
    urlOut.searchParams.delete(param);
    return urlOut;
}
