"use strict";

console.log("here is module db-mindmaps.js", import.meta);
if (document.currentScript) throw Error("import .currentScript"); // is module
if (!import.meta.url) throw Error("!import.meta.url"); // is module

// const useLocalStorage = true;
const useLocalStorage = false;
const idbStoreMm = "mindmaps";
let strPrefix = "jsmindmap-";
const modIdbCmn = await import("idb-common");

export function setDBprefix(prefix) {
    strPrefix = prefix;
    console.warn("setDBprefix", prefix);
}

export async function DBgetAllMindmaps() {
    if (useLocalStorage) {
        const all = [];
        for (let lsKey in localStorage) {
            if (lsKey.startsWith(strPrefix)) {
                const json = localStorage[lsKey];
                const jsmindmap = JSON.parse(json);
                const key = lsKey.substring(strPrefix.length);
                const rec = { key, jsmindmap }
                all.push(rec);
            }
        }
        return all;
    } else {
        // return modIdbCmn.getAll(idbStoreMm);
        const allRecs = await modIdbCmn.getAll(idbStoreMm);
        return allRecs.map(jsmindmap => {
            const key = jsmindmap.key;
            return { key, jsmindmap };
        });
    }
}
export async function DBsetMindmap(keyName, jsMindMap) {
    if (keyName !== jsMindMap.meta.name) throw Error(`key=${keyName} but objMindmap.meta.name=${jsMindMap.meta.name}`);
    if (useLocalStorage) {
        const lsKey = strPrefix + keyName;
        const json = JSON.stringify(jsMindMap);
        localStorage.setItem(lsKey, json);
    } else {
        return modIdbCmn.setDbKey(idbStoreMm, keyName, jsMindMap);
    }
}
export async function DBgetMindmap(key) {
    if (useLocalStorage) {
        const lsKey = strPrefix + key;
        const json = localStorage.getItem(lsKey);
        const obj = JSON.parse(json);
        if (key !== obj.meta.name) {
            console.error(`key=${key} but obj.meta.key=${obj.meta.key}`);
            alert("Old format, fixing");
            obj.meta.name = key;
            delete obj.meta.key;
        }
        DBsetMindmap(key, obj);
    } else {
        return modIdbCmn.getDbKey(idbStoreMm, key);
    }
    return obj;
}
export async function DBremoveMindmap(key) {
    if (useLocalStorage) {
        const lsKey = strPrefix + key;
        localStorage.removeItem(lsKey);
    } else {
        // throw Error("NIY");
        return modIdbCmn.deleteDbKey(idbStoreMm, key);
    }
}
