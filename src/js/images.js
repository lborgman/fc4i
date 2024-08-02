// FIX-ME: Something is wrong with the next line if it is on line 1???
console.log("here is module images.js");
if (document.currentScript) throw Error("import .currentScript"); // is module
if (!import.meta.url) throw Error("!import.meta.url"); // is module

let debugPasteLineOn = true;
debugPasteLineOn = false;
function debugPasteLine(txt) {
    if (!debugPasteLineOn) return;
    console.log("DEBUG", txt);
}

function getWebgl_MAX_TEXTURE_SIZE() {
    const canvas = mkElt("canvas");
    const webgl = canvas.getContext("webgl");
    return webgl.getParameter(webgl.MAX_TEXTURE_SIZE);
}
export const webgl_MAX_TEXTURE_SIZE = getWebgl_MAX_TEXTURE_SIZE();

export function getMaxWebglWH(w, h) {
    if (Math.max(w, h) <= webgl_MAX_TEXTURE_SIZE) {
        return { webglW: w, webglH: h, alreadyOK: true }
    }
    const maxWH = Math.max(w, h);
    const minWH = Math.min(w, h);
    const big = webgl_MAX_TEXTURE_SIZE;
    const small = big * minWH / maxWH;
    return (w > h) ? { webglW: big, webglH: small } : { webglW: small, webglH: big };
}

export async function getImgSizes(strUrlImg) {
    const resp = await fetch(strUrlImg);
    const blob = await resp.blob();
    const blobSize = blob.size;
    return new Promise((resolve) => {
        const image = new Image();
        image.onload = async () => {
            const naturalWidth = image.naturalWidth;
            const naturalHeight = image.naturalHeight;
            const width = image.width;
            const height = image.height;
            const equirect = naturalWidth == 2 * naturalHeight;
            const { webglW, webglH, alreadyOK } = getMaxWebglWH(naturalWidth, naturalHeight);
            resolve({ equirect, naturalWidth, naturalHeight, width, height, webglW, webglH, blobSize, alreadyOK });
        }
        // image.onerror = async () => { console.log("ERROR"); }
        image.addEventListener("error", evt => {
            console.log("ERROR", { evt, strUrlImg });
            debugger;
            resolve(false);
        });
        image.src = strUrlImg;
    });
}


export async function shrinkImgBlobToSizes(imageBlobIn, maxBlobSize) {
    // https://stackoverflow.com/questions/42471755/convert-image-into-blob-using-javascrinkpt
    maxBlobSize = maxBlobSize || getMaxImageBlobSize();
    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob
    // Switch to OffscreenCanvas!
    // https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas
    // shrink image:
    // https://stackoverflow.com/questions/70921457/how-can-i-resize-an-image-in-angular-using-the-canvas
    let lastQuality;

    const startDate = new Date();
    const objectUrlBlobIn = URL.createObjectURL(imageBlobIn);
    return new Promise((resolve) => {
        const image = new Image();
        let imageBlobSize;
        image.onload = async () => {
            const natW = image.naturalWidth;
            const natH = image.naturalHeight;
            console.log({ image, natW, natH });
            debugPasteLine(`imageOnload natW: ${natW}, natH: ${natH}`);
            const canvas = document.createElement('canvas');
            canvas.height = natH;
            canvas.width = natW;
            const ctx = canvas.getContext('2d');
            if (ctx != null) {
                // ctx.drawImage(image, 0, 0, 640, 480);  // <-- draw the right image!
                ctx.drawImage(image, 0, 0, natW, natH);  // <-- draw the right image!
            }
            let retImageBlob = imageBlobIn;
            // let blobSize = Number.POSITIVE_INFINITY;
            let blobSize = retImageBlob.size;
            let n = 0;
            const nMax = 10;
            let quality = (() => {
                // in png, 2 000 000 => const maxBlobSize = 40 * 1000;
                // if (imageBlobSize > 2 * 1000 * 1000) return 0.1; // 3s
                // if (imageBlobSize > 2 * 1000 * 1000) return 0.07; // 2.5s
                // if (imageBlobSize > 2 * 1000 * 1000) return 0.05; // 1.5-2s
                if (imageBlobSize > 2 * 1000 * 1000) return 0.04; // < 1s
                // png, 400 000
                if (imageBlobSize > 400 * 1000) return 0.4;
                return 0.5;
            })();
            lastQuality = quality;
            while (++n < nMax && blobSize > maxBlobSize) {
                // https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas/convertToBlob
                retImageBlob = await new Promise((resolveToBlob) => {
                    // Only webp and jpeg allow the quality parameter.
                    // As I remember it webp is the better one today?
                    canvas.toBlob(blob => resolveToBlob(blob), 'image/webp', quality);
                });
                blobSize = retImageBlob.size;
                lastQuality = quality;
                console.log({ retBlob: retImageBlob, blobSize, quality });
                debugPasteLine(`resize-loop  retBlob:${retImageBlob}, blobSize:${blobSize}, quality:${quality}`);
                quality *= 0.7;
            }

            const msElapsed = (new Date()) - startDate;
            const sizeIn = imageBlobIn.size;
            const typeIn = imageBlobIn.type;
            const sizeOut = retImageBlob.size;
            const typeOut = retImageBlob.type;
            const shrinked = sizeOut / sizeIn;
            URL.revokeObjectURL(objectUrlBlobIn);
            resolve({
                blobOut: retImageBlob,
                shrinked,
                msElapsed,
                typeIn,
                typeOut,
                quality
            });
        };
        imageBlobSize = imageBlobIn.size;
        const imageBlobType = imageBlobIn.type;
        console.log({ imageBlobIn, imageBlobSize, imageBlobType });
        // debugPasteLineOn = true;
        debugPasteLine(`imageBlob, imageBlobSize: ${imageBlobSize}, imageBlobType: ${imageBlobType} }`);
        image.src = objectUrlBlobIn
    });
}

const keyMaxImageBlobSize = "fc4i-max-image-blob-size";
export function getMaxImageBlobSize() {
    return localStorage.getItem(keyMaxImageBlobSize) || 30 * 1000;
}
export function setMaxImageBlobSize(size) {
    return localStorage.setItem(keyMaxImageBlobSize, size);
}
export function resetMaxImageBlobSize() {
    return localStorage.removeItem(keyMaxImageBlobSize);
}

// https://web.dev/async-clipboard/
export async function isClipboardPermissionStateOk() {
    // There seems to be no max number of skipping prompt here.
    // The permissions systems seems like a mess!
    const queryOpts = { name: 'clipboard-read', allowWithoutGesture: false };
    const permissionStatus = await navigator.permissions.query(queryOpts);
    console.log({ permissionStatus });

    switch (permissionStatus.state) {
        case 'granted':
        case 'prompt': // Something seems to have changed 2023-06-29
            return true;
        case 'denied':
            // alertHowToUnblockPermissions();
            return false;
        default:
            debugger;
            throw Error(`Unknown permission state: ${permissionStatus.state}`);
    }
}
export async function alertHowToUnblockPermissions() {
    const aUnblock = mkElt("a", {
        target: "blank",
        href: "https://www.getbeamer.com/help/how-to-unblock-notification-permissions-on-any-browser"
    }, "How to fix it");
    const body = mkElt("div", undefined, [
        mkElt("h1", undefined, "Can't read clipboard"),
        mkElt("p", undefined, [
            "This can be fixed the same way as explained here: ",
            aUnblock
        ])
    ]);
    const modMdc = await import("util-mdc");
    modMdc.mkMDCdialogAlert(body);
}

export async function getImagesFromClipboard() {
    try {
        // https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/read
        // https://web.dev/async-clipboard/

        let clipboardContents;
        debugPasteLine(`addPasteButton 3`);
        try {
            clipboardContents = await navigator.clipboard.read();
            debugPasteLine(`addPasteButton 4`);
        } catch (err) {
            debugPasteLine(`addPasteButton 5, ${err.name}, ${err.message}`);
            return err;
        }

        const foundImages = [];
        // debugPasteLineOn = true;
        debugPasteLine(`addPasteButton 7`);
        for (const item of clipboardContents) {
            debugPasteLine(`addPasteButton 7a`);
            const itemTypes = item.types;
            console.log("addPasteButton 7a", { item, itemTypes });
            debugPasteLine(`addPasteButton 7a1`);
            const imageTypes = itemTypes.filter(t => t.startsWith("image/"));
            const isArray = Array.isArray(imageTypes);
            console.log({ imageTypes, isArray });
            const imageTypesLength = imageTypes.length;
            debugPasteLine(`addPasteButton 7a2, ${imageTypes}, ${typeof imageTypes}, ${isArray}, ${imageTypesLength}`);
            if (imageTypes.length == 0) {
                debugPasteLine(`addPasteButton 7b`);
                continue;
            }
            const it0 = imageTypes[0];
            debugPasteLine(`addPasteButton 7c, ${imageTypes.length}, ${it0}, ${JSON.toString(it0)}`);
            const blob = await item.getType(imageTypes[0]);
            debugPasteLine(`addPasteButton 7d, typeof blob=${typeof blob}, ${blob}`);
            if (blob == null) {
                // You do not get here on Windows 10, but on Android, 2023-01-16
                debugPasteLine(`addPasteButton 7d1, blob==null`);
                continue;
            }
            foundImages.push(blob);
        }
        return foundImages;
    } catch (err) {
        debugPasteLine(`addPasteButton err 1, ${err.name}, ${err.message}`);
        return err;
    }
}

export async function alertNoImagesFound() {
    debugPasteLine(`addPasteButton alertNoImages`);
    const bodyAlert = mkElt("div", { id: "alert-no-images" }, [
        mkElt("h2", undefined, "No images found on clipboard."),
        mkElt("details", undefined, [
            mkElt("summary", undefined, "Why?"),
            mkElt("p", undefined, [
                "The clipboard images may have timed out. ",
                "Or you have not put any images there yet. "
            ]),
            mkElt("p", undefined, [
                mkElt("i", undefined, "Notice: "),
                "You must put images there, not image links!"
            ])
        ]),
        mkElt("details", undefined, [
            mkElt("summary", undefined, "How do you get an image to the clipboard? "),
            mkElt("p", undefined, [
                "One simple way is to right click on an image in your web browser. ",
                "(Long press on a mobile.) ",
            ]),
            mkElt("p", undefined, [
                "However if you have an image in for example Google Photos ",
                "on your Android mobile it is unfortunately not that simple. ",
                "There is today (in the beginning of 2023) no direct way to ",
                "put that image on the clipboard. 🤔",
            ]),
            mkElt("p", undefined, [
                "As a reasonably safe alternative I use this app: ",
                mkElt("a", { href: "https://scrapbook-pwa.web.app/#/images" }, "Scapbook PWA"),
                " (That app is, like this app you are using now, a PWA. ",
                "Essentially a web page. ",
                "With the added capability to show app as targets when you share a link or image.)"
            ]),
        ]),
    ]);
    const modMdc = await import("util-mdc");
    modMdc.mkMDCdialogAlert(bodyAlert);
}

export async function mkImageCard(blob, extraClass, debugInfo) {
    const modMdc = await import("util-mdc");
    const eltImg = mkElt("span", { class: "image-bg-contain image-bg-size mdc-card" });
    // const toFun = typeof funCheckSave;
    // if (toFun != "function") throw Error(`funCheckSave is not funtion (${toFun})`);
    const btnDeleteImage = modMdc.mkMDCiconButton("delete_forever", "Delete");
    btnDeleteImage.classList.add("image-delete");
    btnDeleteImage.addEventListener("click", errorHandlerAsyncEvent(async evt => {
        // FIX-ME: ask
        eltImg.remove();
        // if (funCheckSave) funCheckSave();
    }));
    eltImg.appendChild(btnDeleteImage);
    if (debugInfo) {
        eltImg.style.position = "relative"
        const divDebug = mkElt("div", { class: "div-image-bg-debug" }, debugInfo);
        eltImg.appendChild(divDebug);
        setTimeout(() => divDebug.remove(), 20 * 1000);
    }
    const urlBlob = URL.createObjectURL(blob);
    const urlBg = `url(${urlBlob})`;
    // console.log({ blob, urlBlob });
    eltImg.style.backgroundImage = urlBg;
    eltImg.dataset.urlBlob = urlBlob;
    if (extraClass) eltImg.classList.add(extraClass);
    // toDiv.appendChild(eltImg);
    return eltImg;
}

export async function mkImageCardFromBigImage(blobIn, maxBlobOutSize) {
    if (isNaN(maxBlobOutSize)) {
        debugger;
        throw Error("maxBlobOutSize is not a number");
    }
    debugPasteLine(`addPasteButton 8, mkImageCardFromBigImage`);
    console.warn({ blobIn });

    // const maxBlobSize = maxBlobOutSize;
    const {
        blobOut,
        shrinked,
        msElapsed,
        typeIn,
        typeOut,
        quality
    } =
        // await shrinkImgBlobToSizes(blobIn, maxBlobSize);
        await shrinkImgBlobToSizes(blobIn);

    const tS = shrinked.toFixed(3)
    const tQ = quality.toFixed(2);
    const sizeOut = blobOut.size;
    const tIn = typeIn.slice(6);
    const tOut = typeOut.slice(6);
    const msg = `${tIn} *${tS},~${tQ},${msElapsed}ms=> ${tOut},${(sizeOut / 1000).toFixed()}kB`;

    const eltImageCard = await mkImageCard(blobOut, "blob-to-store", msg);
    setTimeout(() => {
        const bcr = eltImageCard.getBoundingClientRect();
        if (bcr.bottom < window.innerHeight) return;
        eltImageCard.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        }, 10);
    });
    return eltImageCard;
}

export function addFunOnRemoveImageCard(eltImageCard, funOnRemove) {
    const btnDeleteImage = eltImageCard.querySelector(".image-delete");
    btnDeleteImage.addEventListener("click", evt => funOnRemove(evt));
}

// Blobs => base64 (for our images)
// https://stackoverflow.com/questions/27232604/json-stringify-or-how-to-serialize-binary-data-as-base64-encoded-json
export const blobToBase64 = (blob) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = function () {
            resolve(reader.result);
        };
    });
};

// https://dev.to/ionic/converting-a-base64-string-to-a-blob-in-javascript-35kl
// FIX-ME: rename
export const base64webpToBlob = async (base64Data) => {
    const base64Response = await fetch(base64Data);
    const blob = await base64Response.blob();
    return blob;
}

