// @ts-check
const INIT_ERROR_VER = "0.1.5";
console.log(`here is init-error.js ${INIT_ERROR_VER}`);

{
    let numErrors = 0;

    /**
     * 
     * @param {Event} evt 
     */
    const doDisplay = (evt) => {
        if (numErrors++ > 0) return; // Only display one error
        console.log("in doDisplay", evt);
        if (evt instanceof ErrorEvent) {
            console.log("ErrorEvent", evt);
        } else if (evt instanceof PromiseRejectionEvent) {
            console.log("PromisRejectionEvent", evt);
        } else {
            console.log("Unknown event class", evt);
        }
        // @ts-ignore
        const ourError = evt.reason ? evt.reason : evt;
        // @ts-ignore
        const { type, message, reason, filename, lineno } = ourError;
        // @ts-ignore
        const stack = ourError.stack;

        if (window["NOalertError"]) {
            window["alertError"](type, evt);
            return;
        }
        // const msg = `${type}: ${message || reason}, ${filename || ""}:${lineno || ""} `;
        const msg = `${message || reason}`;

        const dlg = document.createElement("dialog");
        const h2 = document.createElement("h2");
        dlg.appendChild(h2);
        const p1 = document.createElement("p");
        dlg.appendChild(p1);
        const pre = document.createElement("pre");
        // @ts-ignore
        pre.style = `
            background: orange;
            padding: 4px;
            text-wrap: wrap;
            overflow-wrap: anywhere;
        `;
        dlg.appendChild(pre);
        let txtPre = location.href;
        txtPre += "\n\n";
        if (stack) {
            txtPre += stack;
        } else {
            txtPre += `${filename || "No filename"}:${lineno || "No line number"} `;
        }
        pre.textContent = txtPre;
        const btn = document.createElement("button");
        const pBtn = document.createElement("p");
        pBtn.appendChild(btn);
        dlg.appendChild(pBtn);

        h2.textContent = "Error";
        p1.textContent = msg;
        btn.textContent = "Close";

        // @ts-ignore
        dlg.style = `
            background: red;
            color: black;
            font-size: 1rem;
            max-width: 90vw;
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

    if (!document.currentScript) throw Error("init-error.js must not be loaded as a module");
}

/**
 * 
 * @param {string} type 
 * @param {Object} attrib 
 * @param {any} inner 
 * @returns {HTMLElement}
 */
function mkElt(type, attrib, inner) {
    const elt = document.createElement(type);

    /**
     * 
     * @param {HTMLElement | string} inr 
     */
    function addInner(inr) {
        if (inr instanceof Element) {
            elt.appendChild(inr);
        } else {
            const txt = document.createTextNode(inr.toString());
            elt.appendChild(txt);
        }
    }
    if (inner) {
        if (inner.length && typeof inner != "string") {
            for (var i = 0; i < inner.length; i++)
                if (inner[i])
                    addInner(inner[i]);
        } else
            addInner(inner);
    }
    for (var x in attrib) {
        elt.setAttribute(x, attrib[x]);
    }
    return elt;
}

// throw "Test error";