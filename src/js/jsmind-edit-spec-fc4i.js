console.log("Here is module jsmind-edit-spec-fc4i.js");
if (document.currentScript) throw Error("import .currentScript"); // is module
if (!import.meta.url) throw Error("!import.meta.url"); // is module


function getLink2KeyInFc4i(keyFc4i) {
    const objUrl = new URL("/", location);
    objUrl.searchParams.set("showkey", keyFc4i)
    // location = objUrl;
    return objUrl.href;
}

export async function addProviderFc4i() {
    const dbFc4i = await importFc4i("db-fc4i");
    const modCustRend = await importFc4i("jsmind-cust-rend");
    const linkRendImg = "./img/fc4i.svg";
    modCustRend.ourCustomRendererAddProvider({
        name: "fc4i",
        longName: "Flashcard 4 Internet",
        img: linkRendImg,
        getRec: dbFc4i.get1Reminder,
        getRecLink: getLink2KeyInFc4i,
    });
}
addProviderFc4i();

