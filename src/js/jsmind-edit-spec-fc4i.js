console.log("Here is module jsmind-edit-spec-fc4i.js");
if (document.currentScript) throw Error("import .currentScript"); // is module
if (!import.meta.url) throw Error("!import.meta.url"); // is module

// const modDb = await import("db-fc4i");
// const modJsEditCommon = await import("jsmind-edit-common");

function getLink2KeyInFc4i(keyFc4i) {
    const objUrl = new URL("/", location);
    objUrl.searchParams.set("showkey", keyFc4i)
    // location = objUrl;
    return objUrl.href;
}

export async function addProviderFc4i() {
    // const dbFc4i = await getDbFc4i();
    const dbFc4i = await import("db-fc4i");
    // const modMMhelpers = await import("mindmap-helpers");
    const modCustRend = await import("jsmind-cust-rend");
    // const linkRendImg = "/img/192.png";
    const linkRendImg = "/img/fc4i.svg";
    modCustRend.ourCustomRendererAddProvider({
        name: "fc4i",
        longName: "Flashcard 4 Internet",
        img: linkRendImg,
        getRec: dbFc4i.get1Reminder,
        getRecLink: getLink2KeyInFc4i,
    });
}
addProviderFc4i();

