"use strict";
// FIX-ME: Put minmaps in localStorage for now

console.log("here is module mindmap-helpers.js");
if (document.currentScript) throw Error("import .currentScript"); // is module
if (!import.meta.url) throw Error("!import.meta.url"); // is module

const URL_MINDMAPS_PAGE = "/mm4i/mm4i.html";

// async function getDbMindmaps() { return await import("db-mindmaps") }
// async function getDbFc4i() { return await import("db-fc4i"); }
// async function getJsmindCust() { return await import("jsmind-cust-rend"); }
// async function getJsmindEditCommon() { return await import("jsmind-edit-common"); }

// getJsmindCust();
import("jsmind-cust-rend");




const throttleSaveMindmap = throttleTO(DBsaveNowThisMindmap, 300);
export function DBrequestSaveThisMindmap(jmDisplayed) { throttleSaveMindmap(jmDisplayed); }
async function DBsaveNowThisMindmap(jmDisplayed) {
    const objDataMind = jmDisplayed.get_data("node_array");
    const keyName = objDataMind.meta.name;
    if (!keyName) throw Error("Current mindmap has no meta.key");
    // const dbMindmaps = await getDbMindmaps();
    const dbMindmaps = await import("db-mindmaps");
    await dbMindmaps.DBsetMindmap(keyName, objDataMind);
}

function getNextMindmapKey() { return "mm-" + new Date().toISOString(); }

export function showMindmap(key) {
    // const url = new URL(linkMindmapsPage, location);
    const url = new URL( URL_MINDMAPS_PAGE , location);
    url.searchParams.set("mindmap", key);
    // location.href = url; // FIX-ME:
    location.href = url.href; // FIX-ME:
}

export async function createAndShowNewMindmap(linkMindmapsPage) {
    const jsMindMap = await dialogCreateMindMap();
    if (!jsMindMap) return;
    const keyName = jsMindMap.meta.name;
    console.log({ jsMindMap, keyName });
    // const dbMindmaps = await getDbMindmaps();
    const dbMindmaps = await import("db-mindmaps");
    await dbMindmaps.DBsetMindmap(keyName, jsMindMap);
    showMindmap(keyName);
}

export async function getMindmap(key) {
    // const dbMindmaps = await getDbMindmaps();
    const dbMindmaps = await import("db-mindmaps");
    return dbMindmaps.DBgetMindmap(key);
}

async function dialogCreateMindMap() {
    const modMdc = await import("util-mdc");
    // const dbMindmaps = await getDbMindmaps();
    const dbMindmaps = await import("db-mindmaps");

    const title = mkElt("h2", undefined, "Create new mindmap");
    // const nextKey = getNextMindmapKey();
    const pTopicOk = mkElt("p", undefined, "");
    pTopicOk.textContent = "Please input a topic name.";
    const inpRoot = modMdc.mkMDCtextFieldInput(undefined, "text");
    let btnOk;
    const arrAll = await dbMindmaps.DBgetAllMindmaps();
    inpRoot.addEventListener("input", evt => {
        const topic = inpRoot.value.trim();
        // console.log({ topic });
        let valid = true;
        if (topic.length === 0) {
            valid = false;
            pTopicOk.textContent = "Please input a topic name.";
        }
        if (valid) {
            arrAll.forEach(r => {
                if (!valid) return;
                const mm = r.jsmindmap;
                if (mm.format != "node_array") throw Error(`Expected format "node_array": ${mm.format}`);
                const root = mm.data[0];
                if (root.id != "root") throw Error(`Not root: ${root.id}`);
                const oldTopic = root.topic;
                if (valid && (oldTopic === topic)) {
                    valid = false;
                }
            });
            if (!valid) pTopicOk.textContent = "Name exists in another mindmap.";
        }
        btnOk.disabled = !valid;
        if (valid) {
            pTopicOk.textContent = "Name is valid";
        }
    });
    const tfRoot = modMdc.mkMDCtextField("Root node topic name", inpRoot);
    const body = mkElt("div", undefined, [
        title,
        tfRoot,
        pTopicOk,
    ]);
    setTimeout(() => {
        btnOk = title.closest("div.mdc-dialog").querySelector("button");
        console.log({ btnOk });
        btnOk.disabled = true;
    });
    // modMdc.mkMDCdialogConfirm(body, titleOk, titleCancel)
    const res = await modMdc.mkMDCdialogConfirm(body);
    console.log({ res });
    if (res) {
        const rootTopic = inpRoot.value.trim();
        // getNewMindmap(nextKey, rootTopic, author, version, format);
        const emptyJsmind = getNewMindmap(rootTopic);
        // return { jsmindmap: emptyJsmind };
        return emptyJsmind;
    }
}



export async function getMindmapsHits(customKey) {
    // const dbMindmaps = await getDbMindmaps();
    const dbMindmaps = await import("db-mindmaps");
    const provider = "fc4i"; // FIX-ME:
    const modCustRend = await import("jsmind-cust-rend");
    const searchedTopic = (await modCustRend.getOurCustomRenderer()).customData2jsmindTopic(customKey, provider);
    const promArrMindmaps = (await dbMindmaps.DBgetAllMindmaps())
        .map(m => {
            const mindmap = m.jsmindmap;
            if (mindmap.format != "node_array") {
                console.error("Wrong mindmap format", { mindmap, m })
                throw Error(`Wrong mindmap format: ${mindmap.format} (should be "node_array")`);
            }
            const nodeData = mindmap.data;
            const hits = [];
            m.hits = hits;
            nodeData.forEach(nd => {
                // const strCustom = nd.custom;
                // if (!strCustom) return;
                // const objCustom = JSON.parse(strCustom);
                // console.log({ nd, objCustom });
                // if (objCustom.key == customKey) { hits.push(nd); }
                if (nd.shapeEtc?.nodeCustom) {
                    const key = nd.shapeEtc.nodeCustom.key;
                    const topic = nd.topic;
                    // FIX-ME: key, provider, better search
                    // if (topic.search(customKey) > 0) { hits.push(nd); };
                    if (key == customKey) { hits.push(nd); };
                    if (topic == searchedTopic) { hits.push(nd); };
                }
            });
            return m;
        })
        .filter(m => m.hits.length > 0);
    return promArrMindmaps;
}

export function mkEltLinkMindmapA(topic, mkey, mhits, provider) {
    const url = new URL(URL_MINDMAPS_PAGE, location);
    url.searchParams.set("mindmap", mkey);
    if (mhits) {
        url.searchParams.set("provider", provider);
        const hits = mhits.map(h => h.id);
        console.log({ hits })
        url.searchParams.set("nodehits", hits);
    }
    const eltA = mkElt("a", undefined, topic);
    eltA.href = url;
    return eltA;
}





export async function pasteCustomClipDialog() {
    const modMdc = await import("util-mdc");
    const arrClip = fetchJsmindCopied4Mindmap();
    if (!arrClip) debugger;

    let result;
    const info = mkElt("p", undefined, "Link selected node to one of these custom entries:");
    const divPastes = mkElt("div", { id: "jsmind-test-custom-paste" }, info);
    const body = mkElt("div", undefined, [info, divPastes]);
    const arrProm = arrClip.map(async objClip => {
        const div1 = await mkDivOneCustomClip(objClip);
        const thisClip = JSON.parse(JSON.stringify(objClip));
        div1.dataset.clip = JSON.stringify(objClip);
        div1.addEventListener("click", evt => {
            result = thisClip;
            closeDialog();
        });
        return div1;
    });
    const arrElt = await Promise.all(arrProm);
    arrElt.forEach(eltClip => {
        divPastes.appendChild(eltClip);
    });

    const btnCancel = modMdc.mkMDCdialogButton("Cancel", "close");
    const eltActions = modMdc.mkMDCdialogActions([btnCancel]);
    const dlg = await modMdc.mkMDCdialog(body, eltActions);
    function closeDialog() { dlg.mdc.close(); }
    return await new Promise((resolve, reject) => {
        dlg.dom.addEventListener("MDCDialog:closed", errorHandlerAsyncEvent(async evt => {
            const action = evt.detail.action;
            console.log({ action, result });
            resolve(result);
        }));
    });
}

async function mkDivOneCustomClip(objCustomClip) {
    const modMdc = await import("util-mdc");
    const modCustRend = await import("jsmind-cust-rend");
    // const keyRec = await get1Reminder(objCustomClip.key); // FIX-ME: provider
    const key = objCustomClip.key;
    const provider = objCustomClip.provider;
    const keyRec = await (await modCustRend.getOurCustomRenderer()).getCustomRec(key, provider);

    const eltTitle = mkElt("span", undefined, keyRec.title)
    const divClipInner = mkElt("div", { class: "jsmind-test-custom-clip-inner" }, eltTitle);
    const divClip = mkElt("div", { class: "mdc-card jsmind-test-custom-clip" }, divClipInner);
    const blob = keyRec.images[0];
    if (blob) {
        const eltBlob = mkElt("span", { class: "image-bg-contain image-thumb-size" });
        eltBlob.style.backgroundPositionY = "bottom";
        const urlBlob = URL.createObjectURL(blob);
        const urlBg = `url(${urlBlob})`;
        eltBlob.style.backgroundImage = urlBg;
        const divBlob = mkElt("div", { class: "dialog-mindmaps-image" }, eltBlob);
        divClipInner.appendChild(divBlob);
    }
    // const btnRemove = modMdc.mkMDCiconButton("delete_forever");
    const btnRemove = modMdc.mkMDCiconButton("close");
    btnRemove.classList.add("upper-left-remove-button");
    btnRemove.addEventListener("click", evt => {
        evt.stopPropagation();
        removeJsmindCopied4Mindmap(objCustomClip);
        divClip.remove();
    });
    divClip.appendChild(btnRemove);
    return divClip;
}

async function dialogShowCustomClipboard() {
    const modMdc = await import("util-mdc");
    const modCustRend = await import("jsmind-cust-rend");
    const arrClip = fetchJsmindCopied4Mindmap();
    console.log({ arrCopied4Mindmap: arrClip });
    const body = mkElt("div", { id: "jsmind-test-custom-clipboard" });
    const ourRend = await modCustRend.getOurCustomRenderer();
    const arrProviders = ourRend.getProviderNames();
    const arrProm = arrClip
        .filter(objClip => arrProviders.includes(objClip.provider))
        .map(objClip => mkDivOneCustomClip(objClip));
    const arrElt = await Promise.all(arrProm);
    arrElt.forEach(eltClip => {
        body.appendChild(eltClip);
    });
    modMdc.mkMDCdialogAlert(body, "Close");
}

export async function dialogAdded2CustomClipboard(objAdded) {
    const modMdc = await import("util-mdc");
    const divObjAdded = await mkDivOneCustomClip(objAdded);
    divObjAdded.style.width = "100%";
    divObjAdded.style.height = "unset";
    const btnRemove = divObjAdded.lastElementChild;
    if (btnRemove.tagName != "BUTTON") throw Error(`Not button remove: ${btnRemove.tagName}`);
    btnRemove.remove();
    const title = mkElt("h2", undefined, "Copied to custom clipboard");
    const info = mkElt("p", undefined, [
        "To use it open a mindmap and edit a node.",
    ]);
    const btn = modMdc.mkMDCbutton("Show custom clipboard", "raised");
    btn.addEventListener("click", evt => {
        dialogShowCustomClipboard();
        closeDialog();
    });
    const divBtn = mkElt("p", undefined, btn);
    const body = mkElt("div", undefined, [
        title,
        info,
        divObjAdded,
        divBtn
    ])
    const dlg = await modMdc.mkMDCdialogAlert(body, "Close");
    console.log({ dlg });
    function closeDialog() { dlg.mdc.close(); }
}
async function dialogCustomPaste2Mindmap() {
    const arrCopied4Mindmap = fetchJsmindCopied4Mindmap();
    if (!arrCopied4Mindmap) debugger;
    const objCopied4Mindmap = arrCopied4Mindmap[0];
    let info;
    if (objCopied4Mindmap) {
        const warn = mkElt("p", undefined, [
            "This functionality is beeing changed!"
        ]);
        warn.style.background = "red";

        info = mkElt("div");
        info.appendChild(warn);

        const divNewPaste = await mkDivOneCustomClip(objCopied4Mindmap);
        info.appendChild(divNewPaste);
    }
    dialogMindMaps(info);
}








function setJsmindCopied4Mindmap(strJson) {
    localStorage.setItem("jsmind-copied4mindmap", strJson);
}
function getJsmindCopied4Mindmap() {
    return localStorage.getItem("jsmind-copied4mindmap");
}

export function addJsmindCopied4Mindmap(key, provider) {
    const strJson = JSON.stringify({ key, provider });
    const objAdded = JSON.parse(strJson);
    let arrClips = fetchJsmindCopied4Mindmap() || [];
    arrClips = arrClips.filter(obj => {
        const str = JSON.stringify(obj);
        return str != strJson;
    });
    // debugger;
    arrClips.unshift(objAdded);
    const strArr = JSON.stringify(arrClips);
    setJsmindCopied4Mindmap(strArr);
    return objAdded;
}
function removeJsmindCopied4Mindmap(objRemove) {
    const strRemove = JSON.stringify(objRemove);
    const arrOldClips = fetchJsmindCopied4Mindmap() || [];
    const arrNewClips = arrOldClips.filter(obj => {
        const str = JSON.stringify(obj);
        return str != strRemove;
    });
    setJsmindCopied4Mindmap(JSON.stringify(arrNewClips));
}
function fetchJsmindCopied4Mindmap() {
    const strJson = getJsmindCopied4Mindmap();
    if (strJson) {
        const obj = JSON.parse(strJson);
        console.log({ obj });
        if (!Array.isArray(obj)) { return [obj]; }
        return obj;
    }
}
function clearJsmindCopied4Mindmap() {
    // FIX-ME: not used
    console.warn("clearJsmindCopied4Mindmap");
    localStorage.removeItem("jsmind-copied4mindmap");
}



export function getNewMindmap(rootTopic, author, version, format) {
    // if (!keyName) throw Error("No key given for new mindmap");
    const keyName = getNextMindmapKey();
    format = format || "node_array";
    rootTopic = rootTopic || `Jsmind ${format}`;
    version = version || "1.0.0";
    const name = keyName;
    const meta = { name, author, version };
    const mind0 = { meta }
    mind0.format = format;
    switch (format) {
        case "node_array":
            mind0.data = [{ "id": "root", isroot: true, "topic": rootTopic, }];
            break;
        case "node_tree":
            mind0.data = { "id": "root", "topic": rootTopic, };
            break;
        case "freemind":
            mind0.data = `<map version="1.0.1"><node ID="root" TEXT="${rootTopic}"/></map>`;
            break;
        default:
            throw Error(`Bad jsmind map format: ${format}`);
    }
    return mind0;
}
