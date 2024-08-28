const VERSION = "0.1.0";
console.log(`Here is jsmind-edit-spec-jsmindedit.js, module, ${VERSION}`);
if (document.currentScript) throw Error("import .currentScript"); // is module
if (!import.meta.url) throw Error("!import.meta.url"); // is module

const modDb = await importFc4i("db-mindmaps");

// const modJsEditCommon = await importFc4i("jsmind-edit-common");

modDb.setDBprefix("jsmindedit-");

export function OLDdialogMindMapsJsmindEdit(info, arrMindmapsHits) {
    // dialogMindMaps(mkEltLinkMindmapJsmindEdit, info, arrMindmapsHits);
    dialogMindMaps("/jsmind-edit.html", info, arrMindmapsHits);
}
export function OLDourDialogMindmaps(info, arrMindmapsHits) {
    dialogMindMapsJsmindEdit(info, arrMindmapsHits);
}

const u = new URL(location);
const p = u.searchParams;
if (!p.get("mindmap")) dialogMindMapsJsmindEdit();