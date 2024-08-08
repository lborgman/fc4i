// @ts-check
const INIT_ERROR_VER = "0.1.3";
console.log(`here is init-error.js ${INIT_ERROR_VER}`);

{
    /**
     * 
     * @param {Event} evt 
     */
    const doDisplay = (evt) => {
        if (evt instanceof ErrorEvent) {
            console.log("ErrorEvent", evt);
        } else if (evt instanceof PromiseRejectionEvent) {
            console.log("PromisRejectionEvent", evt);
        } else {
            console.log("Unknown event class", evt);
        }
        // @ts-ignore
        const { type, message, reason, filename, lineno } = evt;
        const msg = `${type}: ${message || reason}, ${filename || ""}:${lineno || ""} `;
        console.log("in displayError timeout", msg, evt);
        const dlg = document.createElement("dialog");
        const h2 = document.createElement("h2");
        dlg.appendChild(h2);
        const div = document.createElement("div");
        dlg.appendChild(div);
        const btn = document.createElement("button");
        dlg.appendChild(btn);

        h2.textContent = "Error";
        div.textContent = msg;
        btn.textContent = "Close";

        // @ts-ignore
        dlg.style = `
        background: red;
        color: black;
        font-size: 1rem;
        `;
        btn.addEventListener("click", evt => dlg.close());
        document.body.appendChild(dlg);
        dlg.showModal();
    };
    const displayError = (evtError) => {
        if (document.readyState != "loading") { doDisplay(evtError); return; }
        document.addEventListener("DOMContentLoaded", () => { doDisplay(evtError); });
    }
    window.addEventListener("error", evt => { displayError(evt); });
    window.addEventListener("unhandledrejection", evt => { displayError(evt); });
}

// throw "Test error";