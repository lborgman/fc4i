console.log("here is module idb-common.js");
if (document.currentScript) throw Error("import .currentScript"); // is module
if (!import.meta.url) throw Error("!import.meta.url"); // is module

// https://github.com/jakearchibald/idb
const dbName = "rem10m1h";

const idbStoreFc4i = "toRepeat";
const idbStoreMm = "mindmaps";

let ourDb;
export async function getDb() {
    if (ourDb) return ourDb;
    console.log(`====== before idb.js upgrade, 11`);
    ourDb = await idb.openDB(dbName, 11, {
        // upgrade(db, oldVersion, undefined, transaction, event) {
        upgrade(db) {
            console.log(`======== idb.js upgrade, 11`);
            /*
            try {
                db.deleteObjectStore(idbStoreName);
            } catch (err) {
                const errCode = err.code;
                const errName = err.name;
                const codeOk = errCode == 8;
                const nameOk = errName == "NotFoundError";
                // https://webplatform.github.io/docs/apis/indexeddb/IDBDatabase/deleteObjectStore/
                console.error("db.deleteObjectStore", { err, errCode, codeOk, errName, nameOk });
                if (!(codeOk && nameOk)) throw Error(`Unknown error in .deleObjectStore, ${errCode}, ${errName}`);
            }
            const store = db.createObjectStore(idbStoreName, {
                keyPath: "key"
            });
            store.createIndex("url", "url");
            */
            if (!db.objectStoreNames.contains(idbStoreFc4i)) {
                console.warn(`Creating idb store ${idbStoreFc4i}`);
                const store = db.createObjectStore(idbStoreFc4i, {
                    keyPath: "key"
                });
                store.createIndex("url", "url");
            }
            if (!db.objectStoreNames.contains(idbStoreMm)) {
                console.warn(`Creating idb store ${idbStoreMm}`);
                const store = db.createObjectStore(idbStoreMm, {
                    keyPath: "key"
                });
            }
        },
        terminated() {
            console.warn("idb.js terminated");
        },
    });
    return ourDb;
}

export const getDbKey = async (idbStoreName, key) => {
    const db = await getDb();
    const objVal = await db.get(idbStoreName, key);
    // console.log(`get ${key}`, { objVal });
    return objVal;
}
export const setDbKey = async (idbStoreName, key, objVal) => {
    const db = await getDb();
    objVal.key = key;
    const res = await db.put(idbStoreName, objVal);
    // console.log(`set ${key}`, { res });
    return res;
}
export const count = async (idbStoreName) => {
    return countDbKey(idbStoreName, undefined);
}
export const countDbKey = async (idbStoreName, key) => {
    const db = await getDb();
    const count = await db.count(idbStoreName, key);
    console.log(`count ${key}`, { count });
    return count;
}
export const deleteDbKey = async (idbStoreName, key) => {
    const db = await getDb();
    const res = await db.delete(idbStoreName, key);
    return res;
}
export const getAll = async (idbStoreName) => {
    const db = await getDb();
    const allRecs = await db.getAll(idbStoreName);
    return allRecs;
}