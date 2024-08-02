export async function viewer(divPanorama, config) {
    // const eltCont = document.getElementById("container");
    const srcPanorama = config.src;
    const eltCont = divPanorama;
    eltCont.style.overflow = "hidden";
    eltCont.style.position = "relative";
    // const eltImg = document.getElementById("img");
    const eltImg = new Image();
    eltImg.setAttribute("draggable", false)
    eltImg.style.position = "absolute";
    eltImg.id = config.imageId;
    eltCont.appendChild(eltImg);
    const imgSizes = config.imgSizes;
    const natW = imgSizes.naturalWidth;
    const natH = imgSizes.naturalHeight;
    let w = natW;
    let h = natH;
    let zoom = config.zoom || 1;
    eltImg.style.width = `${w}px`;
    eltImg.style.height = `${h}px`;
    // eltImg.src = "http://localhost:5004/img/loci.svg";
    eltImg.src = srcPanorama;
    let moving = false;
    let bcrImg;
    let bcrC;
    const mouse2img = {}
    let imgBiggerW;
    let imgBiggerH;

    function saveMouse2img(evt) {
        // bcrImg = eltImg.getBoundingClientRect();
        // mouse2img.X = bcrImg.left - evt.clientX;
        // mouse2img.Y = bcrImg.top - evt.clientY;
        // if (mouse2img.X == -evt.offsetX) { console.log("eq"); } else { console.log("not eq"); }

        mouse2img.X = - evt.offsetX;
        mouse2img.Y = - evt.offsetY;
    }

    eltCont.addEventListener("mousedown", evt => {
        evt.stopPropagation();
        moving = true;
        eltImg.style.cursor = "grabbing";

        saveMouse2img(evt);

        bcrImg = eltImg.getBoundingClientRect();
        bcrC = eltCont.getBoundingClientRect();
        imgBiggerW = bcrImg.width > bcrC.width;
        imgBiggerH = bcrImg.height > bcrC.height;
        // console.log({ evt, mouse2img, bcrImg, bcrC });
    });
    eltCont.addEventListener("mouseup", evt => {
        evt.stopPropagation();
        moving = false;
        eltImg.style.cursor = null;
    });
    eltCont.addEventListener("mouseleave", evt => {
        moving = false;
        eltImg.style.cursor = null;
    });
    const debounceMoveImg = debounce(moveImg, 0);
    const throttleMoveImg = throttleRA(moveImg);
    eltCont.addEventListener("mousemove", evt => {
        evt.stopPropagation();
        if (!moving) return;
        // debounceMoveImg(evt);
        throttleMoveImg(evt);
    });
    function moveImg(evt) {
        let left = evt.clientX + mouse2img.X;
        let top = evt.clientY + mouse2img.Y;
        let finalLeft, finalTop;
        let needMouse2img = false;

        if (!imgBiggerW) {
            left = Math.max(left, 0);
            finalLeft = Math.min(left, bcrC.right - bcrImg.width - bcrC.left);
        } else {
            left = Math.min(left, 0);
            finalLeft = Math.max(left, bcrC.right - bcrImg.width - bcrC.left);
        }
        if (finalLeft != left) { needMouse2img = true; }
        left = finalLeft;

        if (!imgBiggerH) {
            top = Math.max(top, 0);
            finalTop = Math.min(top, bcrC.bottom - bcrImg.height - bcrC.top);
        } else {
            top = Math.min(top, 0);
            finalTop = Math.max(top, bcrC.bottom - bcrImg.height - bcrC.top);
        }
        if (finalTop != top) { needMouse2img = true; }
        top = finalTop;

        eltImg.style.left = `${left}px`;
        eltImg.style.top = `${top}px`;

        if (needMouse2img) { saveMouse2img(evt); }
    }
}