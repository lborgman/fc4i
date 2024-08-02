console.log("Here is module jsmind-edit-spec-jsmindedit.js");
if (document.currentScript) throw Error("import .currentScript"); // is module
if (!import.meta.url) throw Error("!import.meta.url"); // is module

// const modDb = await import("db-fc4i");
// const modDb = await import("db-mindmaps");
const modDb = await import("db-mindmaps");

const modJsEditCommon = await import("jsmind-edit-common");

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