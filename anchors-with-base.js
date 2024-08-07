const VER = "0.1.1";
console.log(`here is anchors-with-base.js ${VER}`);
// if (!import.meta.url) throw Error("Should be imported as a module");
if (document.currentScript) throw Error("Should be imported as a module");

document.body.addEventListener("click", evt => {
    const eltA = evt.target.closest("a");
    if (!eltA) return;
    if (eltA.tagName != "A") return;
    // const href = eltA.href; // This is changed by <base>
    const href = eltA.getAttribute("href").trim();
    if (!href.startsWith("#")) return;
    const id = href.slice(1);
    const eltId = document.getElementById(id);
    if (!eltId) return;
    evt.preventDefault();
    window.scrollTo({
        top: eltId.offsetTop,
        behavior: "smooth"
    });
});