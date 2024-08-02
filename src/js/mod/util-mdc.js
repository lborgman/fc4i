////////////////////////////////////////////////////////////////////
// MDC helpers

// FIXME: useful? https://codepen.io/oneezy/pen/qwRVaq

let materialIconsClass = "material-icons";
export function getMaterialIconClass() { return materialIconsClass; }
export function setMaterialIconClass(className) {
    if (
        !className.startsWith("material-icons")
        &&
        !className.startsWith("material-symbols-")
    ) throw Error(`Must be a Google Material Icons/Symbols class name: ${className}`);
    materialIconsClass = className;
}
// https://m2.material.io/components/cards/web#card
export function mkMDCcard() {
    return mkElt("div", { class: "mdc-card" });
}


// https://github.com/material-components/material-components-web/tree/master/packages/mdc-tab-bar#tab-bar
export function mkMdcTabBar(buttons, onActivate) {
    /*
    <div class="mdc-tab-bar" role="tablist">
        <div class="mdc-tab-scroller">
            <div class="mdc-tab-scroller__scroll-area">
                <div class="mdc-tab-scroller__scroll-content"></div>
    */

    // <div class="mdc-tab-scroller__scroll-content"></div>
    const divCont = mkElt("div", { class: "mdc-tab-scroller__scroll-content" });
    buttons.forEach(btn => divCont.appendChild(btn));

    // <div class="mdc-tab-scroller__scroll-area"></div>
    const divScrollArea = mkElt("div", { class: "mdc-tab-scroller__scroll-area" });
    divScrollArea.appendChild(divCont);

    // <div class="mdc-tab-scroller">
    const divScroller = mkElt("div", { class: "mdc-tab-scroller" });
    divScroller.appendChild(divScrollArea);

    // <div class="mdc-tab-bar" role="tablist"></div>
    const eltTabBar = mkElt("div", { class: "mdc-tab-bar", role: "tablist" });
    eltTabBar.appendChild(divScroller);

    // FIXME: Correct? How to use it?
    const tabBar = new mdc.tabBar.MDCTabBar(eltTabBar);
    // https://stackoverflow.com/questions/52798196/material-design-web-mdctabinteracted-event-not-emitting-after-activatetab
    tabBar.listen("MDCTabBar:activated", evt => {
        // console.log("MDCTabBar:activated, evt", evt, evt.detail.index);
        // if (onActivate) onActivate(evt.detail.index);
        if (onActivate) setTimeout(() => onActivate(evt.detail.index), 30);
    });
    tabBar.activateTab(0);

    // eltTabBar.classList.add("color100"); // FIXME:
    return eltTabBar;
}
export function mkMdcTabsButton(txtLbl, icon) {
    /*
        <button class="mdc-tab mdc-tab--active" role="tab" aria-selected="true" tabindex="0">
          <span class="mdc-tab__content">
            <span class="mdc-tab__icon material-icons" aria-hidden="true">favorite</span>
            <span class="mdc-tab__text-label">Favorites</span>
          </span>
          <span class="mdc-tab-indicator mdc-tab-indicator--active">
            <span class="mdc-tab-indicator__content mdc-tab-indicator__content--underline"></span>
          </span>
          <span class="mdc-tab__ripple"></span>
        </button>
    */
    // <span class="mdc-tab__content"></span>
    const spanCont = mkElt("span", { class: "mdc-tab__content" });
    if (icon) {
        // <span class="mdc-tab__icon material-icons" aria-hidden="true">favorite</span>
        const spanIcon = mkElt("span", { class: "mdc-tab__icon", "aria-hidden": "true" }, icon);
        spanCont.appendChild(spanIcon);
    }
    // <span class="mdc-tab__text-label">Favorites</span>
    spanCont.appendChild(mkElt("span", { class: "mdc-tab__text-label" }, txtLbl));

    // <span class="mdc-tab-indicator mdc-tab-indicator--active">
    const spanIndicator = mkElt("span", { class: "mdc-tab-indicator" },
        // <span class="mdc-tab-indicator__content mdc-tab-indicator__content--underline"></span>
        mkElt("span", { class: "mdc-tab-indicator__content mdc-tab-indicator__content--underline" })
    );

    // <span class="mdc-tab__ripple"></span>
    const spanRipple = mkElt("span", { class: "mdc-tab__ripple" });

    // <button class="mdc-tab mdc-tab--active" role="tab" aria-selected="true" tabindex="0"></button>
    const btn = mkElt("button", { class: "mdc-tab", role: "tab", "aria-selected": "true", tabindex: "0" }, [
        spanCont, spanIndicator, spanRipple,
    ]);
    btn.addEventListener("click", evt => {
        evt.preventDefault();
        evt.stopPropagation();
        // console.log("TabBar btn click, evt", evt);
    });

    return btn;
}

// export function mkMdcTabBarSimple(recs, onActivate)
export function mkMdcTabBarSimple(tabsRecs, contentElts, moreOnActivate) {
    const arrCont = [...contentElts.children];
    if (isNaN(tabsRecs.length) || (tabsRecs.length !== arrCont.length)) {
        debugger;
        throw Error(`tabsRecs.length==${tabsRecs.length}, contentElts.children.length==${arrCont.length}}`);
    }
    arrCont.forEach(elt => elt.style.display = "none");
    arrCont[0].style.display = "block";
    const onActivate = mkOnTabActivate4mdc(contentElts);
    function doOnActivate(idx) {
        onActivate(idx);
        if (moreOnActivate) moreOnActivate(idx);
    }
    const btns = [];
    tabsRecs.forEach(r => {
        let btn;
        if (typeof r === "string") {
            btn = mkMdcTabsButton(r);
        } else {
            const txt = r.text;
            console.error("r.icon is not HTMLElement", r);
            if (typeof txt !== "string") {
                console.error(`r.text is not string: ${typeof txt}`, r);
                throw Error(`r.text is not string: ${typeof txt}`);
            }
            const icon = r.icon;
            if (typeof icon !== "undefined" && !(icon instanceof HTMLElement)) {
                console.error("r.icon is not HTMLElement", r);
                throw Error(`r.icon is not HTMLElement: ${typeof r.icon}`);
            }
            btn = mkMdcTabsButton(txt, icon);
        }
        btns.push(btn);
    });
    return mkMdcTabBar(btns, doOnActivate);
}

export function mkOnTabActivate4mdc(divTabContents) {
    const arrAlts = [...divTabContents.children];
    return async (idx) => {
        let eltCurrent, eltNext;
        for (let i = 0, len = arrAlts.length; i < len; i++) {
            const divAlt = arrAlts[i];
            if (divAlt.style.display === "grid") {
                if (eltCurrent) throw Error(`eltCurrent already set`);
                eltCurrent = divAlt;
            }
            if (i === idx) {
                if (eltNext) throw Error(`eltNext already set`);
                eltNext = divAlt;
            }
        }
        // setSrcType(eltNext.dataset.srctype);

        const animSec = 0.2;
        const anim1 = divTabContents.animate([
            { opacity: "1" },
            { opacity: "0" },
        ], { duration: 1000 * animSec });

        const fin1 = anim1.finished;
        // FIXME: finished not implemented in Chrome yet (2020-06-21)
        if (eltCurrent) {
            if (fin1) { await fin1; } else { await waitSeconds(animSec); }
            eltCurrent.style.display = "none";
        }
        eltNext.style.display = "grid";

        divTabContents.animate([
            { opacity: "0" },
            { opacity: "1" },
        ], { duration: 1000 * animSec });
    }
}

// FIXME: make mdc-util.js

// a as button
// https://github.com/material-components/material-components-web/issues/4459
export function mkMDCbuttonA(href, txtLabel, emphasis, icon) {
    const btn = mkElt("a", { href, class: "mdc-button" });
    addButtonEmphasis(btn, emphasis);
    if (icon) { addButtonIcon(btn, icon); }
    btn.appendChild(mkElt("span", { class: "mdc-button__label" }, txtLabel));
    return btn;
}

// https://material.io/develop/web/components/buttons
// https://material.io/components/buttons#theming
/*
<button class="mdc-button">
  <div class="mdc-button__ripple"></div>
  <i class="material-icons mdc-button__icon" aria-hidden="true">favorite</i>
  <span class="mdc-button__label">Button</span>
</button>
*/
function addButtonEmphasis(btn, emphasis) {
    switch (emphasis) {
        case undefined:
            break;
        case "outlined":
        case "raised":
            btn.classList.add(`mdc-button--${emphasis}`);
            break;
        default:
            throw Error(`Bad mdc-button emphasis: ${emphasis}`);
    }
}
function addButtonIcon(btn, icon) {
    icon.classList.add("mdc-button__icon");
    icon.setAttribute("aria-hidden", true);
    btn.appendChild(icon);
}

export function mkMDCbutton(txtLabel, emphasis, icon) {
    const btn = mkElt("button", { class: "mdc-button" }, mkElt("div", { class: "mdc-button__ripple" }));
    new mdc.ripple.MDCRipple(btn);
    addButtonEmphasis(btn, emphasis);
    // <i class="material-icons mdc-button__icon" aria-hidden="true">favorite</i>
    if (icon) { addButtonIcon(btn, icon); }
    if (txtLabel) btn.appendChild(mkElt("span", { class: "mdc-button__label" }, txtLabel));
    return btn;
}

// https://material.io/develop/web/components/buttons/icon-buttons
// https://m2.material.io/develop/web/components/buttons/icon-buttons
export function mkMDCiconButton(icon, ariaLabel, sizePx) {
    const btn = mkElt("button",
        // { class: `mdc-icon-button material-icons` },
        { class: `mdc-icon-button ${materialIconsClass}` },
        [
            mkElt("div", { class: "mdc-icon-button__ripple" }),
            icon
        ]);
    // if (small) btn.classList.add("icon-button-small");
    if (sizePx) {
        btn.classList.add("icon-button-sized");
        btn.style.setProperty("--icon-button-size", sizePx);
    }
    if (ariaLabel) {
        btn.setAttribute("aria-label", ariaLabel);
        btn.title = ariaLabel;
    } else {
        console.warn("Missing ariaLabel");
    }
    const iconButtonRipple = new mdc.ripple.MDCRipple(btn);
    iconButtonRipple.unbounded = true;
    return btn;
}
export function setMDCiconButton(iconButton, iconName) {
    if (!iconButton.classList.contains("mdc-icon-button")) {
        console.error("classList does not contain mdc-icon-button", iconButton);
    }
    const lastChild = iconButton.lastChild;
    lastChild.textContent = iconName;
}


// https://material.io/develop/web/components/input-controls/text-field/
export function mkMDCtextFieldTextarea(id, rows, cols) {
    const eltTextarea = mkElt("textarea", {
        class: "mdc-text-field__input",
        rows, cols,
    });
    if (id) {
        eltTextarea.id = id;
        const ariaId = `aria-id-${id}`;
        eltTextarea["aria-labelledby"] = ariaId;
    }
    return eltTextarea;
}
export function mkMDCtextFieldInput(id, inputType) {
    // FIXME: What to do with the aria-lablledby?
    // Not sure I can make this app accessible at all. Too complicated interface.
    inputType = inputType || "text";
    const eltInp = mkElt("input", {
        class: "mdc-text-field__input",
        type: inputType
    });
    if (id) {
        eltInp.id = id;
        const ariaId = `aria-id-${id}`;
        eltInp["aria-labelledby"] = ariaId;
    }
    return eltInp;
}
export function mkMDCtextareaField(label, textarea, prefill) {
    const id = textarea.id;
    if (prefill) textarea.value = prefill;
    const ariaId = `aria-id-${id}`;
    /*
    This seems to be for 6.0.0 or earlier!
    But I can see no difference to the latest????
    https://github.com/material-components/material-components-web/issues/7546

<label class="mdc-text-field mdc-text-field--textarea">
  <span class="mdc-notched-outline">
    <span class="mdc-notched-outline__leading"></span>
    <span class="mdc-notched-outline__notch">
      <span class="mdc-floating-label" id="my-label-id">Textarea Label</span>
    </span>
    <span class="mdc-notched-outline__trailing"></span>
  </span>
  <span class="mdc-text-field__resizer">
    <textarea class="mdc-text-field__input" aria-labelledby="my-label-id" rows="8"
      cols="40" maxlength="140"></textarea>
  </span>
</label>
    */
    const flOutlined = mkElt("label", { class: "mdc-text-field mdc-text-field--textarea" }, [
        mkElt("span", { class: "mdc-notched-outline" }, [
            mkElt("span", { class: "mdc-notched-outline__leading" }),
            mkElt("span", { class: "mdc-notched-outline__notch" }, [
                mkElt("span", { class: "mdc-floating-label", id: "my-label-id" }, label),
            ]),
            mkElt("span", { class: "mdc-notched-outline__trailing" }),
        ]),
        mkElt("span", { class: "mdc-text-field__resizer" }, textarea),
    ]);
    const flFilled = mkElt("label", { class: "mdc-text-field mdc-text-field--filled mdc-text-field--textarea" }, [
        mkElt("span", { class: "mdc-text-field__ripple" }),
        mkElt("span", { class: "mdc-floating-label", id: "my-label-id" }, label),
        mkElt("span", { class: "mdc-text-field__resizer" }, textarea),
        mkElt("span", { class: "mdc-line-ripple" }),
    ]
    );
    // const fl = flOutlined;
    const fl = flFilled;
    setTimeout(initTf, 100);
    function initTf() {
        const t = mdc.textField.MDCTextField.attachTo(fl);
        textarea["our-mdc-text-field"] = t; // FIXME: could this be a problem in the future?
        setMdcInputValid(textarea, false);
    }
    return fl;
}
/*
    Multi-line is not implemented in MDC Web 2. Use this instead!
    https://css-tricks.com/the-cleanest-trick-for-autogrowing-textareas/
*/
export function mkMDCtextareaGrow(tf) {
    if (!tf.classList.contains("mdc-text-field")) throw Error(`Not an MDC tf for textarea`);
    if (!tf.tagName == "LABEL") throw Error(`Not a label tag: ${tf.tagName}`);
    const eltResizeContainer = tf.querySelector(".mdc-text-field__resizer");
    eltResizeContainer.classList.remove("mdc-text-field__resizer");
    if (eltResizeContainer.classList.contains("grow-wrap")) return;
    eltResizeContainer.classList.add("grow-wrap");
    const textarea = tf.querySelector("textarea");
    // textarea.style.border = "none";
    // textarea.rows = 1;
    textarea.setAttribute("rows", 1);
    const replicate = () => {
        // console.log("%cReplicating", "color:red");
        textarea.parentNode.dataset.replicatedValue = textarea.value;
    };
    textarea.addEventListener("input", evt => { replicate(); });
    // FIX-ME: This did not work. No change event?
    textarea.addEventListener("change", evt => { errorHandlerAsyncEvent(setTimeout(replicate, 2000)); });
    if (textarea.value.length > 0) replicate();
}
export function mkMDCtextField(label, input, prefill) {
    const id = input.id;
    if (prefill) input.value = prefill;
    const ariaId = `aria-id-${id}`;
    // 6.0.0 .mdc-text-field--filled { height: 56px; }
    const fl = mkElt("label", { class: "mdc-text-field mdc-text-field--filled" }, [
        mkElt("span", { class: "mdc-text-field__ripple" }),
        input,
        mkElt("span", { class: "mdc-floating-label", id: ariaId }, label),
        mkElt("span", { class: "mdc-line-ripple" }),
    ]);
    if (prefill) fl.classList.add("mdc-text-field--label-floating");
    setTimeout(initTf, 10);
    function initTf() {
        // const t = new mdc.textField.MDCTextField(fl);
        // const t = mdc.textField.MDCTextField(fl);
        const t = mdc.textField.MDCTextField.attachTo(fl);
        // FIXME: What is t used for???
        // https://github.com/material-components/material-components-web/blob/d4c230f30fc0a4b0318e8468d6c459fbb2af1cee/demos/text-field.html#L745
        input["our-mdc-text-field"] = t; // FIXME: could this be a problem in the future?
        // t.valid = false;
        setMdcInputValid(input, false);
    }
    return fl;
}

/*
https://m2.material.io/components/text-fields/web#outlined-text
<label class="mdc-text-field mdc-text-field--outlined">
  <span class="mdc-notched-outline">
    <span class="mdc-notched-outline__leading"></span>
    <span class="mdc-notched-outline__notch">
      <span class="mdc-floating-label" id="my-label-id">Your Name</span>
    </span>
    <span class="mdc-notched-outline__trailing"></span>
  </span>
  <input type="text" class="mdc-text-field__input" aria-labelledby="my-label-id">
</label>
*/
export function mkMDCtextFieldOutlined(label, input) {
    // <input type="text" class="mdc-text-field__input" aria-labelledby="my-label-id">
    // FIX-ME: labelId???
    // input.setAttribute("aria-labeled-by", labelId);

    // <label class="mdc-text-field mdc-text-field--outlined">
    const elt = mkElt("label", { class: "mdc-text-field mdc-text-field--outlined" }, [
        // <span class="mdc-notched-outline">
        mkElt("span", { class: "mdc-notched-outline" }, [
            // <span class="mdc-notched-outline__leading"></span>
            mkElt("span", { class: "mdc-notched-outline__leading" }),
            // <span class="mdc-notched-outline__notch">
            mkElt("span", { class: "mdc-notched-outline__notch" }, [
                // <span class="mdc-floating-label" id="my-label-id">Your Name</span>
                mkElt("span", {
                    class: "mdc-floating-label",
                    // id: labelId
                }, label),
                // </span>
            ]),
            // <span class="mdc-notched-outline__trailing"></span>
            mkElt("span", { class: "mdc-notched-outline__trailing" }),
            // </span>
        ]),
        input,
        // <input type="text" class="mdc-text-field__input" aria-labelledby="my-label-id">
        // </input></label>
    ]);
    const textField = new mdc.textField.MDCTextField(elt);
    elt.myMdc = textField
    return elt;
}
export function setMdcInputDisabled(input, disabled) {
    if (typeof disabled !== "boolean") throw Error(`disabled wrong type: ${disabled}`);
    const tf = input.closest(".mdc-text-field");
    const classDisabled = "mdc-text-field--disabled";
    if (disabled) {
        tf.classList.add(classDisabled);
    } else {
        tf.classList.remove(classDisabled);
    }
    input.disabled = disabled;
}
export function getMdcTfObj(input) { return input["our-mdc-text-field"]; }
export function setMdcInputValid(input, valid) {
    const tfObj = getMdcTfObj(input);
    if (tfObj) {
        tfObj.valid = valid;
    } else {
        debugger; // FIXME: reminder, should every input be mdc???
    }
    input.dataset.ourValid = valid;
}
function getMdcInputValid(input) {
    const txtValid = input.dataset.ourValid;
    switch (txtValid) {
        case "true": return true;
        case "false": return false;
        case undefined: return false;
        default: throw Error(`bad input.dataset.ourValid: ${txtValid}`);
    }
}


export function mkMDCtextFieldSimpleInput(id, placeHolder) {
    return mkElt("input", {
        id: id,
        class: "mdc-text-field__input",
        type: "text",
        placeholder: placeHolder,
    });
}
export function mkMDCtextFieldSimple(input) {
    const id = input.id;
    const ariaId = `aria-id-${id}`;
    const fl = mkElt("label", {
        class: "mdc-text-field mdc-text-field--filled mdc-text-field--no-label",
    }, [
        mkElt("span", { class: "mdc-text-field__ripple" }),
        input,
        mkElt("span", { class: "mdc-line-ripple" }),
    ]);
    const t = new mdc.textField.MDCTextField(fl);
    // FIXME: What is t used for???
    fl.myMdc = t;
    return fl;
}



// https://material.io/develop/web/components/input-controls/radio-buttons/
export function mkMDCradioElt(inpRadio) {
    inpRadio.classList.add("mdc-radio__native-control");
    inpRadio.addEventListener("click", () => {
        const name = inpRadio.name;
        fixMDCradioCheckedLabel(name);
    });
    const elt = mkElt("div", { class: "mdc-radio" }, [
        inpRadio,
        mkElt("div", { class: "mdc-radio__background" }, [
            mkElt("div", { class: "mdc-radio__outer-circle" }),
            mkElt("div", { class: "mdc-radio__inner-circle" }),
        ]),
        mkElt("div", { class: "mdc-radio__ripple" }),
    ]);
    new mdc.radio.MDCRadio(elt);
    return elt;
}

// FIXME: move to media-choices-ui.js
export function fixMDCradioCheckedLabel(name) {
    [...document.querySelectorAll(`input[name=${name}]`)].forEach(inp => {
        if (inp.type !== "radio") {
            console.error("Not input radio", inp);
            throw Error(`Not type radio, name=${name}, type=${inp.type}`);
        }
        const mdcRadio = inp.closest(".mdc-radio");

        /*
        const eltLabel = mdcRadio.parentElement;
        const nodeName = eltLabel.nodeName;
        if (nodeName !== "LABEL") throw Error(`.mdc-radio parent !== LABEL: ${nodeName}`)
        */

        const eltLabel = mdcRadio.closest("label");
        if (inp.checked) {
            eltLabel?.classList.add("our-checked");
            const inp = eltLabel?.querySelector("input[type=text]");
            // console.log("inp", inp);
            if (inp) inp.focus();
        } else {
            eltLabel?.classList.remove("our-checked");
        }
    })
}



// https://material.io/develop/web/components/input-controls/checkboxes
/*
<div class="mdc-checkbox mdc-checkbox--touch">
    <input type="checkbox"
           class="mdc-checkbox__native-control"
           id="checkbox-1"/>
    <div class="mdc-checkbox__background">
      <svg class="mdc-checkbox__checkmark"
           viewBox="0 0 24 24">
        <path class="mdc-checkbox__checkmark-path"
              fill="none"
              d="M1.73,12.91 8.1,19.28 22.79,4.59"/>
      </svg>
      <div class="mdc-checkbox__mixedmark"></div>
    </div>
    <div class="mdc-checkbox__ripple"></div>
  </div>
*/
export function mkMDCcheckboxInput(id) {
    const inp = mkElt("input", {
        type: "checkbox",
        class: "mdc-checkbox__native-control",
    });
    if (id) inp.id = id;
    return inp;
}
export async function mkMDCcheckboxElt(inpCheckbox, label) {
    const modMySvg = await import("my-svg");
    const svg = modMySvg.mkEltSvg("svg", {
        class: "mdc-checkbox__checkmark",
        viewBox: "0 0 24 24",
    },
        modMySvg.mkEltSvg("path", {
            class: "mdc-checkbox__checkmark-path",
            fill: "none",
            d: "M1.73,12.91 8.1,19.28 22.79,4.59",
        }));
    const divMixed = mkElt("div", { class: "mdc-checkbox__mixedmark" });
    const divBg = mkElt("div", { class: "mdc-checkbox__background" }, [
        svg,
        divMixed,
    ]);
    const divRipple = mkElt("div", { class: "mdc-checkbox__ripple" });

    const elt = mkElt("div", { class: "mdc-checkbox mdc-checkbox--touch" }, [
        inpCheckbox,
        divBg,
        divRipple,
    ]);
    if (!label) return elt;
    // FIXME: This is perhaps not good with MDC?
    const eltLabelText = mkElt("span", { class: "label-text" }, label);
    const eltLabel = mkElt("label", undefined, [elt, eltLabelText]);

    // FIX-ME: trying to fix label vertical position
    // Something is obviously wrong, but I use this workaround
    // and hope this is fixed in Material Design for Web, version 3.
    eltLabel.classList.add("mdc-chkbox-label-helper");

    const eltWithLabel = mkElt("div", { class: "mdc-form-field" }, [
        // mkElt("label", undefined, [elt, label]),
        // mkElt("label", undefined, [elt, eltLabelText]),
        eltLabel
    ]);
    return eltWithLabel;
}

// https://material.io/develop/web/components/menus/
// https://stackoverflow.com/questions/51211545/prevent-mdc-menu-from-closing-after-clicking-first-menu-item
export function mkMDCmenuDiv(ul) {
    /*
    <div class="mdc-menu mdc-menu-surface">
        <ul class="mdc-list" role="menu" aria-hidden="true" aria-orientation="vertical" tabindex="-1"></ul>
    */
    if (ul && ul.tagName !== "UL") throw Error(`Not UL: ${ul.tagName}`);
    const elt = mkElt("div", { class: "mdc-menu mdc-menu-surface" }, ul);
    const menu = new mdc.menu.MDCMenu(elt);
    elt.myMdc = menu;
    return elt;
}
export function mkMDCmenuUl(arrLiMenu) {
    return mkElt("ul", {
        class: "mdc-list",
        role: "menu",
        "aria-hidden": "true",
        "aria-orientation": "vertical",
        tabindex: -1,
    }, arrLiMenu);
}
export function anchorMenu(anchorElement, mdcMenuDiv) {
    anchorElement.classList.add("mdc-menu-surface--anchor");
    anchorElement.appendChild(mdcMenuDiv);
}
function OLDmkAnchoredMDCmenu(anchorElement, mdcMenuDiv) {
    if (anchorElement.parentElement) throw Error(`anchorElement has parentElement`);
    const tN = mdcMenuDiv.tagName;
    if (tN !== "DIV") throw Error(`mdcMenuDiv tagName is not DIV, ${tN}`);
    if (!mdcMenuDiv.classList.contains("mdc-menu")) throw Error(`mdcMenuDiv has not class "mdc-menu"`);
    return mkElt("div", { class: "mdc-menu-surface--anchor" }, [anchorElement, mdcMenuDiv]);
}

// The click event is on this
export function mkMDCmenuItem(txt) {
    /*
    <li class="mdc-list-item" role="menuitem">
      <span class="mdc-list-item__ripple"></span>
      <span class="mdc-list-item__text">A Menu Item</span>
    </li>
    */
    return mkMDClistItem(txt, "menuitem");
    /*
    return mkElt("li", { class: "mdc-list-item", role: "menuitem" }, [
        mkElt("span", { class: "mdc-list-item__ripple" }),
        mkElt("span", { class: "mdc-list-item__text" }, txt),
    ]);
    */
}

// https://material.io/components/lists/web#single-line-list
export function mkMDCul() {
    // <ul class="mdc-list">
    return mkElt("ul", { class: "mdc-list" });
}
export function mkMDClistItem(txt, role) {
    const eltLi = mkElt("li", { class: "mdc-list-item", role: "menuitem" }, [
        mkElt("span", { class: "mdc-list-item__ripple" }),
        mkElt("span", { class: "mdc-list-item__text" }, txt),
    ]);
    if (role) eltLi.setAttribute("role", role);
    return eltLi;
}


// https://m2.material.io/components/sliders
// https://stackoverflow.com/questions/64892909/how-do-i-use-mdcslider-in-javascript
// If now is an array then it is a range slider
export async function mkMDCslider(min, max, now, step, label, onChange, onInput) {
    /*
    <div class="mdc-slider">
        <div class="mdc-slider__track">
            <div class="mdc-slider__track--inactive"></div>
            <div class="mdc-slider__track--active">
                <div class="mdc-slider__track--active_fill"></div>
            </div>
        </div>
        <div class="mdc-slider__thumb" role="slider" tabindex="0" aria-label="Continuous slider demo" aria-valuemin="0"
            aria-valuemax="100" aria-valuenow="50">
            <div class="mdc-slider__thumb-knob"></div>
        </div>
    </div>
    */
    const discrete = !!step; // not undefined
    let divTickMarks = "";
    if (discrete) {
        // <div class="mdc-slider__tick-marks">
        divTickMarks = mkElt("div", { class: "mdc-slider__tick-marks" });
        const numMarks = (max - min) / step + 1;
        for (let n = 0; n < numMarks; n++) {
            // <div class="mdc-slider__tick-mark--active"></div>
            const divMark = mkElt("div", { class: "mdc-slider__tick-mark--active" });
            divTickMarks.appendChild(divMark);
        }
    }
    const mkThumb = () => {
        return mkElt("div", {
            class: "mdc-slider__thumb",
            role: "slider",
            tabindex: "0",
            "aria-label": label,
            "aria-valuemin": `${min}`,
            "aria-valuemax": `${max}`,
            // "aria-valuenow": `${now}`, // FIX-ME: single or range?
        }, [
            mkElt("div", { class: "mdc-slider__thumb-knob" }),
        ]);
    }
    /*
    <div class="mdc-slider__value-indicator-container">
        <div class="mdc-slider__value-indicator">
            <span class="mdc-slider__value-indicator-text">
                50
            </span>
        </div>
    </div>
    */
    const mkEltIndicator = () =>
        mkElt("div", { class: "mdc-slider__value-indicator-container" }, [
            mkElt("div", { class: "mdc-slider__value-indicator" }, [
                mkElt("span", { class: "mdc-slider__value-indicator-text" }),
            ]
            ),
        ]);

    const eltThumb = mkThumb();

    // NOTE: The input element was missing from the example on m2.material.io that I copied from.
    // Today, 2023-01-18, the <input> have been added to the examples on
    // https://m2.material.io/components/sliders/web#sliders
    //
    // <input class="mdc-slider__input" type="range" min="0" max="100" value="50" name="volume" aria-label="Continuous slider demo">
    // 
    // <input class="mdc-slider__input" type="range" min="0" max="70" value="30" name="rangeStart" aria-label="Continuous range slider demo">
    // <input class="mdc-slider__input" type="range" min="30" max="100" value="70" name="rangeEnd" aria-label="Continuous range slider demo">
    // 
    // <input class="mdc-slider__input" type="range" min="0" max="100" value="50" name="volume" step="10" aria-label="Discrete slider demo">
    const isRange = Array.isArray(now);
    if (isRange && now.length != 2) {
        console.error("now should have 2 values", { now });
        throw Error(`now should have 2 values: ${now.length}`);
    }
    const inpRange = mkElt("input", { class: "mdc-slider__input", type: "range", min, max, value: now, name: label });
    const inpRangeStart = mkElt("input", { class: "mdc-slider__input", type: "range", name: "rangeStart", min, max, value: now[0] });
    const inpRangeEnd = mkElt("input", { class: "mdc-slider__input", type: "range", name: "rangeEnd", min, max, value: now[1] });

    const eltSlider = mkElt("div", { class: "mdc-slider" }, [
        // inpRange,
        mkElt("div", { class: "mdc-slider__track" }, [
            mkElt("div", { class: "mdc-slider__track--inactive" }),
            mkElt("div", { class: "mdc-slider__track--active" }, [
                mkElt("div", { class: "mdc-slider__track--active_fill" }),
            ])
        ]),
        divTickMarks,
        eltThumb,
    ]);
    if (isRange) {
        eltSlider.classList.add("mdc-slider--range");
        const eltThumbEnd = mkThumb();
        if (discrete) eltThumbEnd.appendChild(mkEltIndicator());
        eltSlider.appendChild(eltThumbEnd);
        eltSlider.insertBefore(inpRangeEnd, eltSlider.firstElementChild);
        eltSlider.insertBefore(inpRangeStart, eltSlider.firstElementChild);
    } else {
        eltSlider.insertBefore(inpRange, eltSlider.firstElementChild);
    }
    if (step) {
        eltSlider.classList.add("mdc-slider--discrete");
        eltSlider.dataset.step = step;
        if (discrete) eltThumb.appendChild(mkEltIndicator());
    }
    eltSlider.addEventListener("MDCSlider:change", onChange);
    if (onInput) eltSlider.addEventListener("MDCSlider:input", onInput);

    // Looks like we have to wait until the eltSlider is on the page until we attach the slider object.
    attachMdcWhenOnDocument(eltSlider, mdc.slider.MDCSlider);
    return eltSlider;
}
async function attachMdcWhenOnDocument(eltMdc, clsMdc) {
    eltMdc.myPromMdc =
        new Promise((resolve, reject) => {
            // FIX-ME: shadow dom? What to do?
            // https://stackoverflow.com/a/63225241/324691
            // function isInShadow(node) { return node.getRootNode() instanceof ShadowRoot; }

            let n = 0;
            const nMax = 50, msDelay = 30; // 10->4, 20->3, 30->? (On my slow PC!)
            let done;
            const doAttach = () => {
                const isConnected = eltMdc.isConnected;
                const closestHtml = eltMdc.closest("html");
                console.log("%cattaching mdc obj", "color:green; font-size:20px;", { n, isConnected, closestHtml });
                const mdcObj = new clsMdc(eltMdc);
                // console.log({ n, mdcObj });
                eltMdc.myMdc = mdcObj;
                done = true;
                eltMdc.style.outline = null;
                eltMdc.tryAttach = undefined;
                resolve(mdcObj);
            }
            if (eltMdc.isConnected) { doAttach(); return; }
            let tmr = setInterval(() => {
                try {
                    if (++n > nMax) {
                        clearInterval(tmr);
                        done = false;
                        console.error(`n(${n}) > nMax(${nMax})`);
                        // reject("n> nMax");
                        eltMdc.style.outline = "1px dotted red";
                        eltMdc.tryAttach = () => { attachMdcWhenOnDocument(eltMdc, clsMdc); }
                        resolve();
                    }
                    // const eltHtml = eltMdc.closest("html");
                    if (eltMdc.isConnected) {
                        done = true;
                        clearInterval(tmr);
                        doAttach();
                    }
                    if (done !== undefined) {
                        // console.log({ done });
                        clearInterval(tmr);
                    }
                } catch (err) {
                    clearInterval(tmr);
                    console.error({ err });
                    reject(err.message);
                }
            }, msDelay);
        });
    await eltMdc.myPromMdc;
}

export function getMDCslider4elt(elt) {
    // return elt["mdc-slider"];
    return elt["myMdc"];
}
export function setMDCSliderValue(elt, val) {
    const slider = getMDCslider4elt(elt);
    slider.setValue(val);
}
export function getMDCSliderValue(elt) {
    const slider = getMDCslider4elt(elt);
    return slider.getValue();
}
export function setMDCSliderDisabled(elt, disabled) {
    const slider = getMDCslider4elt(elt);
    slider.setDisabled(disabled);
}

// https://material.io/develop/web/components/buttons/floating-action-buttons
export function mkMDCfab(eltIcon, title, mini, extendTitle) {
    /*
    <button class="mdc-fab mdc-fab--mini" aria-label="Favorite">
        <div class="mdc-fab__ripple"></div>
        <span class="mdc-fab__icon material-icons">favorite</span>
    </button>
    */
    const btn = mkElt("button", {
        class: "mdc-fab",
        // "aria-label": title,
        title,
    }, [
        mkElt("div", { class: "mdc-fab__ripple" }),
        mkElt("span", { class: "mdc-fab__icon" }, eltIcon),
    ]);
    if (mini) btn.classList.add("mdc-fab--mini");
    if (extendTitle) {
        btn.classList.add("mdc-fab--extended");
        // <span class="mdc-fab__label">Create</span>
        const eltExt = mkElt("span", { class: "mdc-fab__label" }, extendTitle);
        btn.appendChild(eltExt);
    }
    return btn;
}


// https://material.io/develop/web/components/dialogs#alert-dialog
export function mkMDCdialogButton(title, closedAction, isDefault) {
    const btn = mkElt("button", {
        type: "button",
        class: "mdc-button mdc-dialog__button",
        tabindex: 0,
        // "data-mdc-dialog-action": closedAction,
    }, [
        mkElt("div", { class: "mdc-button__ripple" }),
        mkElt("span", { class: "mdc-button__label" }, title),
    ]);
    // btn.dataset["mdc-dialog-action"] = closedAction;
    btn.dataset.mdcDialogAction = closedAction;
    // if (isDefault) btn.dataset["mdc-dialog-button-default"] = "";
    if (isDefault) btn.dataset.mdcDialogButtonDefault = "";
    return btn;
}
export function mkMDCdialogActions(buttons) {
    return mkElt("div", { class: "mdc-dialog__actions" }, buttons);
}

export async function mkMDCdialogConfirm(body, titleOk, titleCancel, noCancel, funHandleResult, tellMeOkButton) {
    const tofTitle = typeof titleOk;
    accectValueType(tofTitle, "string");
    const tofCancel = typeof titleCancel;
    accectValueType(tofCancel, "string");
    const tofNoCancel = typeof noCancel;
    accectValueType(tofNoCancel, "boolean");
    const tofFun = typeof funHandleResult;
    accectValueType(tofFun, "function");
    function accectValueType(tof, valType) {
        if (tof == "undefined") return;
        if (tof == valType) return;
        throw Error(`Expected type ${valType}, got ${tof}`);
    }
    titleOk = titleOk || "Ok";
    titleCancel = titleCancel || "Cancel";
    const btnOk = mkMDCdialogButton(titleOk, "confirm", true);
    if (tellMeOkButton) { tellMeOkButton(btnOk); }
    const btnCancel = mkMDCdialogButton(titleCancel, "close");
    const funResolve = funHandleResult || (() => true);
    // const handleResult = () => true;
    // const eltActions = mkMDCdialogActions([btnOk, btnCancel]);
    const arrBtns = [btnOk, btnCancel];
    if (noCancel) arrBtns.length = 1;
    const eltActions = mkMDCdialogActions(arrBtns);
    const dlg = await mkMDCdialog(body, eltActions);
    return await new Promise((resolve, reject) => {
        dlg.dom.addEventListener("MDCDialog:closed", errorHandlerAsyncEvent(async evt => {
            const action = evt.detail.action;
            switch (action) {
                case "confirm":
                    // resolve(true);
                    resolve(funResolve());
                    break;
                case "close":
                    resolve(false);
                    break;
                default:
                    throw Error(`error in mkMDCdialogConfirm, action is ${action}`)
            }
        }));
    });
}
export async function mkMDCdialogGetValue(body, funValue, titleOk) {
    const btnOk = mkMDCdialogButton(titleOk, "getvalue", true);
    const eltActions = mkMDCdialogActions([btnOk]);
    const dlg = await mkMDCdialog(body, eltActions);
    return await new Promise((resolve, reject) => {
        dlg.dom.addEventListener("MDCDialog:closed", errorHandlerAsyncEvent(async evt => {
            const action = evt.detail.action;
            console.log("mkMDCdialogGetValue", { action });
            if (action == "getvalue") {
                const value = funValue();
                resolve(value)
            } else { resolve(); }
        }));
    });
}
export function mkMDCdialogAlertWait(body, titleClose) {
    return mkMDCdialogConfirm(body, titleClose, undefined, true);
}
export function mkMDCdialogAlert(body, titleClose) {
    titleClose = titleClose || "Ok";
    const btnClose = mkMDCdialogButton(titleClose, "close", true);
    const eltActions = mkMDCdialogActions([btnClose]);
    return mkMDCdialog(body, eltActions);
}

/*
<div class="mdc-dialog">
    <div class="mdc-dialog__container">
        <div class="mdc-dialog__surface" role="alertdialog" aria-modal="true" aria-labelledby="my-dialog-title"
            aria-describedby="my-dialog-content">
            <div class="mdc-dialog__content" id="my-dialog-content">
                Discard draft?
            </div>
            <div class="mdc-dialog__actions">
                <button type="button" class="mdc-button mdc-dialog__button" data-mdc-dialog-action="cancel">
                    <div class="mdc-button__ripple"></div>
                    <span class="mdc-button__label">Cancel</span>
                </button>
                <button type="button" class="mdc-button mdc-dialog__button" data-mdc-dialog-action="discard">
                    <div class="mdc-button__ripple"></div>
                    <span class="mdc-button__label">Discard</span>
                </button>
            </div>
        </div>
    </div>
    <div class="mdc-dialog__scrim"></div>
</div>
*/

// FIXME: problem on MCT page
// https://github.com/material-components/material-components-web/issues/6698
export async function mkMDCdialog(body, eltActions, fullScreen) {
    const eltSurface = mkElt("div", {
        class: "mdc-dialog__surface",
        role: "alertdialog",
        "aria-modal": true,
        "aria-labelledby": "my-dialog-title",
        "aria-describedby": "my-dialog-content",
    }, [
        mkElt("div", { class: "mdc-dialog__content", id: "my-dialog-content" }, body),
        /*
        mkElt("div", { class: "mdc-dialog__actions" }, [
            mkElt("button", {
                type: "button",
                class: "mdc-button mdc-dialog__button",
                "data-mdc-dialog-action": "cancel",
            }, [
                mkElt("div", { class: "mdc-button__ripple" }),
                mkElt("span", { class: "mdc-button__label" }, "Cancel"),
            ]),
            mkElt("button", {
                type: "button",
                class: "mdc-button mdc-dialog__button",
                "data-mdc-dialog-action": "discard",
            }, [
                mkElt("div", { class: "mdc-button__ripple" }),
                mkElt("span", { class: "mdc-button__label" }, "Discard"),
            ]),
        ]),
        */
    ]);

    const eltContainer = mkElt("div", { class: "mdc-dialog__container" }, [
        eltSurface,
    ]);
    if (eltActions) eltSurface.appendChild(eltActions);
    const dom = mkElt("div", { class: "mdc-dialog" }, [
        eltContainer,
        mkElt("div", { class: "mdc-dialog__scrim" }),
    ]);
    if (fullScreen) dom.classList.add("mdc-dialog--fullscreen");
    document.body.appendChild(dom);
    dom.addEventListener("MDCDialog:closed", evt => { dom.remove(); });
    const ret = { dom };
    function addMDCandOpen() {
        ret.mdc = new mdc.dialog.MDCDialog(ret.dom);
        ret.mdc.open();
    }
    return await new Promise((resolve, reject) => {
        setTimeout(() => {
            addMDCandOpen();
            resolve(ret);
        });
    });

    // setTimeout(addMDCandOpen);
    // return ret;
}

////////////////////////////////////////////////////////////////////
// Input validators

export function validateDownloadFilename(filename) {
    const reWinNames = /^(CON|PRN|AUX|NUL|COM1|COM2|COM3|COM4|COM5|COM6|COM7|COM8|COM9|LPT1|LPT2|LPT3|LPT4|LPT5|LPT6|LPT7|LPT8|LPT9)$/i
    if (reWinNames.test(filename)) {
        return `Filename not permitted: ${filename}`;
    }
    // Windows
    if (/^\./.test(filename)) return `Filename must not begin with "."`;
    if (/\.$/.test(filename)) return `Filename must not end with "."`;
    // Unix
    if (/^-/.test(filename)) return `Filename must not begin with "-"`;
    const reControl = /[\x00-\x1f\x80-\x9f]/g;
    if (reControl.test(filename)) {
        return `Control chars not allowed in filename`;
    }
    const illegalChars = '/\\:*?"<>|#%&{} $!\'@+`=';
    if (new RegExp(`[${illegalChars}]`).test(filename)) {
        const arrIllegalChars = illegalChars.split("");
        for (const c of arrIllegalChars) {
            // console.log(`c=${c}`)
            if (filename.indexOf(c) !== -1) return `Character "${c}" not allowed in filename`;
        }
    }
    return "";
}

///////////////////////////////////////////////////
// Making an object for static import. Is this a good idea? FIXME:

/*
const modUtil = {
    validateDownloadFilename,
    magicNumbers2mime,
    mkMdcTabBar,
    mkMdcTabsButton,
    mkMdcTabBarSimple,
    mkOnTabActivate4mdc,
}
Object.freeze(modUtil);
export default modUtil;
*/





export function setValidityMDC(inp, msg) {
    // console.warn("setValidity", msg)
    inp.setCustomValidity(msg);
    inp.reportValidity();
    const valid = msg === "";
    setMdcInputValid(inp, valid);
    return valid;
}











/*
// https://firebase.google.com/docs/storage/web/list-files
// FIXME: bucket etc
export async function listGcs(root, container, filterWords, funItem, funFolder) {

    const storageRef = firebase.storage().ref();
    const listRef = storageRef.child(root);

    // FIXME: author?
    function filterItem(anyMatchers) {
        if (!filterWords) return true;
        const uMatches = anyMatchers.map(str => str.toLocaleUpperCase());
        let hit = 0;
        const len = filterWords.length;
        HITLOOP: for (let i = 0; i < len; i++) {
            const w = filterWords[i];
            // if (gcsName.indexOf(w) !== -1) { hit++; continue; }
            // if (title.indexOf(w) !== -1) { hit++; continue; }
            for (let j = 0, jlen = uMatches.length; j < jlen; j++) {
                const uMat = uMatches[j];
                if (uMat.indexOf(w) !== -1) { hit++; continue HITLOOP; }
            }
        }
        if (hit === len) return true;
        return false;
    }

    // Find all the prefixes and items.
    try {
        const res = await listRef.listAll()
        res.prefixes.forEach(async (folderRef) => {
            // All the prefixes under listRef.
            // You may call listAll() recursively on them.
            // console.log("folderRef", folderRef);
            const subItemContainer = mkElt("div", { class: "uploaded-previews-subitems" });
            const folderFullPath = folderRef.fullPath;
            await listGcs(folderFullPath, subItemContainer, filterWords, funItem, funFolder);
            if (subItemContainer.firstElementChild) {
                const subContainer = mkElt("div");
                subContainer.style = "margin-top: 2rem;";
                funFolder(folderRef.name, subContainer);
                subContainer.appendChild(subItemContainer);
                container.appendChild(subContainer);
            }
        });
        const promItems = [];
        res.items.forEach((itemRef) => {
            const promItem = (async () => {
                // All the items under listRef.
                const itemRefName = itemRef.name;
                if (itemRefName.indexOf("@") !== -1) throw Error(`itemRef.name (${itemRefName}) contains @`);
                const forFilter = [itemRefName];
                // console.warn("itemRef", itemRef);
                let title;
                const meta = await itemRef.getMetadata();
                // console.log("meta", meta);
                const customMetadata = meta.customMetadata;
                if (customMetadata) {
                    title = customMetadata.title;
                    forFilter.push(title);
                }
                if (!filterItem(forFilter)) {
                    // debugger;
                    return;
                }
                const url = await itemRef.getDownloadURL();
                funItem(container, itemRefName, url, title);
                return true;
            })();
            promItems.push(promItem);
        });
        // console.log("promItems", promItems);
        // debugger;
        await Promise.all(promItems);
    } catch (error) {
        // Uh-oh, an error occurred!
        console.error("listGcs", error);
        if (error.code === "storage/unknown") {
            console.log(error.serverResponse);
        }
    }
}
*/

/*
// https://firebase.google.com/docs/storage/web/upload-files
export async function upload2gcs(params) {
    const allowed = [
        "fileOrBlob",
        "nameInBucket",
        "metaData",
        "bucket",
        "funProg",
        "funState",
        "funErr",
        "funSaveDownloadURL",
    ];
    const required = allowed;
    function funCheckAllowed() {
        for (const p in params) {
            if (!allowed.includes(p)) throw Error(`Property ${p} not allowed in params`);
        }
    }
    funCheckAllowed();
    function funCheckRequired() {
        const keys = Object.keys(params);
        required.map(r => { if (!keys.includes(r)) throw Error(`Property ${r} missing in params`) });
    }
    funCheckRequired();

    // FIXME: Check metaData
    if (!params.metaData.contentType) throw Error(`params.metaData is missing contentType`);

    const storageRef = firebase.storage(params.bucket).ref();
    const fileInGcsRef = storageRef.child(params.nameInBucket);
    const uploadTask = fileInGcsRef.put(params.fileOrBlob, params.metaData);

    uploadTask.on("state_changed",
        (snapshot) => {
            params.funProg(snapshot.bytesTransferred, snapshot.totalBytes);
            params.funState(snapshot.state)
        },
        params.funErr,
        () => {
            uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
                console.log('File available at', downloadURL);
                params.funSaveDownloadURL(downloadURL);
            });
        });
    return uploadTask;
}
*/


/*
export async function testUpload2gcs() {
    const fileOrBlob = new Blob(["This is a test blob."], { type: "text/html" });
    const nameInBucket = "tmptranscripts/lennart.borgman@gmail.com/the-first-test.html";
    const metaData = { contentType: "text/html" };
    const bucket = "temp-public-transcripts";
    const funProg = (sofar, total) => console.log(`funProg(${sofar}, ${total})`);
    const funState = (state) => console.log(`funState(${state})`);
    const funErr = (error) => console.error(`funErr`, error);
    const funSaveDownloadURL = (url) => console.warn(`funSSaveDownloadURL(${url})`);
 
    const params = {
        fileOrBlob,
        nameInBucket,
        metaData,
        bucket: undefined,
        funProg,
        funState,
        funErr,
        funSaveDownloadURL,
    }
    const uploadTask = await upload2gcs(params);
    console.log("uploadTask", uploadTask);
}
*/

// https://cloud.google.com/storage/docs/naming-objects
export function key2gcsName(key) { return key.split("/").join(":"); }
export function gcsName2key(gcsName) { return gcsName.split(":").join("/"); }

export function getPreviewUrl(exportId) {
    const thisURL = new URL("/showpreview", location.href);
    thisURL.searchParams.append("key", exportId);
    const url = thisURL.href;
    return url;
}

export async function findUploadedPreviews(exportId) {
    const db = firebase.firestore();
    let itemsRef = db.collection("uploaded-previews");
    itemsRef = itemsRef.where("exportId", "==", exportId);
    const docs = await itemsRef.get();
    console.log({ docs });
    return docs;
}

/*
export function mkUploadedPreviews() {
    const divOutput = mkElt("div");
 
    const tfStyle = `
        max-width = "300px";
        min-width = "250px";
    `;
 
    // const inputFilterURL = mkMDCtextFieldInput("input-filter-uploaded");
    const inputFilterURL = mkMDCtextFieldInput();
    const tfFilterURL = mkMDCtextField("Web site or source page link (optional)", inputFilterURL);
    tfFilterURL.style = tfStyle;
    setMdcInputValid(inputFilterURL, true);
    inputFilterURL.setAttribute("spellcheck", false);
    inputFilterURL.addEventListener("input", evt => { queueValidateURL(); })
    const queueValidateURL = (function () {
        let timer;
        return () => {
            clearTimeout(timer);
            timer = setTimeout(validateURL, 1000);
        }
    })();
    function validateURL() {
        function validity(msg) {
            console.log({ msg });
            setValidityMDC(inputFilterURL, msg);
            setSearchAble();
        }
 
        const val = inputFilterURL.value.trim();
        if (val === "") return validity("");
 
        const lenVal = val.length;
        const strHttps = "https://";
        const lenHttps = strHttps.length;
        if (lenVal < lenHttps + 1) {
            setMdcInputValid(inputFilterURL, false);
            setSearchAble();
            return;
        }
 
        if (val.substr(0, lenHttps) !== strHttps) return validity(`Link must begin with ${strHttps}`);
        if (val.length < 13) return validity("Please input a full link");
        const strWww = "https://www.";
        const lenWww = strWww.length;
        if (val.substr(0, lenWww) === strWww) return validity(`Please remove "www."`);
        return validity("");
    }
 
    // const inputFilterEmail = mkMDCtextFieldInput("input-filter-uploaded");
    const inputFilterEmail = mkMDCtextFieldInput();
    if (theFirebaseCurrentUserEmail) inputFilterEmail.value = "me";
    const tfFilterEmail = mkMDCtextField("'me' or uploader's email (optional)", inputFilterEmail);
    tfFilterEmail.style = tfStyle;
    setMdcInputValid(inputFilterEmail, true);
    inputFilterEmail.setAttribute("spellcheck", false);
    inputFilterEmail.addEventListener("input", evt => { queueisValidEmail(); })
 
    const queueisValidEmail = (function () {
        let timer;
        return () => {
            clearTimeout(timer);
            timer = setTimeout(validateEmail, 1000);
        }
    })();
 
    function validateEmail() {
        function validity(msg) {
            console.log({ msg });
            setValidityMDC(inputFilterEmail, msg);
            setSearchAble();
        }
 
        const val = inputFilterEmail.value.trim();
        if (val === "") return validity("");
        if (val === "me") {
            if (theFirebaseCurrentUserEmail) return validity("");
            return validity("You are not logged in");
        }
 
        if (!isValidEmail(val)) return validity("Not a valid email address (or 'me')");
 
        return validity("");
    }
 
    function setSearchAble() {
        const canSearch =
            // getMdcTfObj(inputFilterURL).valid
            getMdcInputValid(inputFilterURL)
            &&
            // getMdcTfObj(inputFilterEmail).valid;
            getMdcInputValid(inputFilterEmail);
        btnSearch.disabled = !canSearch;
    }
 
 
    const btnSearch = mkElt("button", { class: "mdc-button color-button-important" }, "Search");
    btnSearch.style.width = "fit-content";
 
    const formFilters = mkElt("form", undefined, [
        tfFilterURL,
        tfFilterEmail,
        btnSearch,
    ]);
    formFilters.style = `
        display: grid;
        gap: 1rem;
        grid-template-columns: repeat(auto-fill, minmax(250px, 300px));
        grid-template-columns: repeat(auto-fit, minmax(250px, 300px));
    `;
    const divFilters = mkElt("div", undefined, [
        mkElt("b", { class: "colorError" }, "not quite ready"),
        formFilters,
    ]);
    divFilters.style = `
        display: grid;
        gap: 1rem;
    `;
 
    const divContainer = mkElt("div", undefined, [divFilters, divOutput]);
    divContainer.style.padding = "1rem";
    const sum = mkElt("summary", undefined, "Uploaded previews");
    const det = mkElt("details", undefined, [sum, divContainer])
    sum.addEventListener("click", evt => {
        if (divOutput.textContent !== "") return;
        setupToGetItems();
    });
 
    function tempBuildUrlFilter(url) {
        const u = new URL(url);
        const uArr = [url];
        uArr.push(`http://${u.host}`);
        const pathname = u.pathname;
        console.log({ pathname });
        const paths = pathname.split("/");
        console.log({ paths })
        let path = "";
        for (let i = 0, len = paths.length - 1; i < len; i++) {
            const p = paths[i];
            if (p === "") continue;
            path += `/${p}`;
            uArr.push(`http://${u.host}${path}`);
            uArr.push(`http://${u.host}${path}/`);
        }
        return uArr;
    }
 
    async function setupToGetItems(filterWords) {
        function mkFunItem(previewId, href, title, byEmail) {
            const justMine = byEmail === theFirebaseCurrentUserEmail;
            const key = gcsName2key(previewId);
            const keyrec = key2rec(key);
            const srctype = keyrec.srctype;
            let sym;
            switch (srctype) {
                case "ytvideo":
                    sym = mkAwesomeYouTube();
                    break;
                case "video":
                    sym = mkAwesomeVideo();
                    break;
                case "audio":
                    sym = mkAwesomeAudio();
                    break;
                default:
                    throw Error(`Bad srctype=${srctype}`);
            }
            const useTitle = title || key;
            const a = mkElt("a", { href, target: "_blank" }, useTitle);
            const elts = [sym, a];
            let delWidth = "";
            const btnDelete = mkElt("button", { class: "mdc-button color-button" }, "✕");
            btnDelete.style = `
                min-width: 30px;
                height: 30px;
            `;
            btnDelete.addEventListener("click", async evt => {
                // deletePreview uploadPreview
                evt.preventDefault();
                const key = previewId;
                const paramsObj = {
                    key,
                }
                const result = await fetchSimpleJson("deletepreview", paramsObj);
                const done = result.answer.done;
                console.warn({ done });
                divA.style.display = "block";
                divA.style.fontStyle = "italic";
                if (done) {
                    divA.innerHTML = `Removed uploaded preview: "${useTitle}"`;
                } else {
                    divA.innerHTML = `Uploaded preview was already removed: "${useTitle}"`;
                }
            });
            if (justMine) {
                elts.unshift(btnDelete);
                delWidth = "fit-content(30px)";
            }
            const divA = mkElt("div", undefined, elts);
            divA.style = `
                display: grid;
                gap: 1rem;
                grid-template-columns: ${delWidth} fit-content(1.5rem) minmax(0, 1fr);
                padding: 0.5rem 0;`;
            return divA;
        }
        function funItem(container, previewId, href, title, byEmail) {
            const divA = mkFunItem(previewId, href, title, byEmail);
            container.appendChild(divA);
        }
        function funItemYour(container, gcsName, href, title) {
            const divA = mkFunItem(gcsName, href, title);
            const btnDelete = mkElt("button", undefined, "x");
            btnDelete.addEventListener("click", evt => {
                const storageRef = firebase.storage().ref();
                const nameInBucket = `tmptranscripts/${theFirebaseCurrentUserEmail}/${gcsName}`;
                const itemRef = storageRef.child(nameInBucket);
                itemRef.delete().then(function () {
                    container.removeChild(divA);
                }).catch(function (error) {
                    console.error("btnDelete", error);
                    throw error;
                });
            })
            divA.insertBefore(btnDelete, divA.firstElementChild);
            divA.style.gridTemplateColumns = "2rem 1.5rem minmax(0, 1fr)";
            container.appendChild(divA);
        }
        function funFolder(name, container) {
            const h3 = mkElt("h3", undefined, `User: ${name}`);
            h3.style.fontWeight = "bold";
            container.appendChild(h3);
        }
 
        divContYour.innerHTML = "";
        divContAll.innerHTML = "";
        await wait4mutations(divOutput, 200);
 
        let outputTitle;
        btnSearch.addEventListener("click", errorHandlerAsyncEvent(async evt => {
            evt.preventDefault();
            if (btnSearch.disabled) return;
            btnSearch.disabled = true;
            const valEmail = inputFilterEmail.value.trim();
            let emailFilter;
            let urlFilter;
            if (valEmail !== "") {
                emailFilter = valEmail
                if (emailFilter === "me") {
                    outputTitle = "Searched your uploads";
                    emailFilter = theFirebaseCurrentUserEmail;
                } else {
                    outputTitle = `Searched uploads by ${emailFilter}`;
                }
            } else {
                outputTitle = "Searched all";
            }
 
            const urlVal = inputFilterURL.value.trim();
            if (urlVal !== "") urlFilter = urlVal;
            const container = divContYour; // FIXME;
 
            container.innerHTML = "";
            const eltTitle = mkElt("h2", undefined, outputTitle);
            eltTitle.style.visibility = "hidden";
            const eltWaiting = mkElt("div", undefined, mkAweSpinner());
 
            container.appendChild(eltWaiting);
            container.appendChild(eltTitle);
 
            await getFirestoreItems(container, funItem, funFolder, emailFilter, urlFilter);
 
            container.removeChild(eltWaiting);
            eltTitle.style.visibility = null;
            btnSearch.disabled = false;
        }));
 
        async function getFirestoreItems(container, funItem, funFolder, only4email, urlFilter) {
 
            function filterItem(anyMatchers) {
                if (!filterWords) return true;
                const uMatches = anyMatchers.map(str => str.toLocaleUpperCase());
                let hit = 0;
                const len = filterWords.length;
                HITLOOP: for (let i = 0; i < len; i++) {
                    const w = filterWords[i];
                    for (let j = 0, jlen = uMatches.length; j < jlen; j++) {
                        const uMat = uMatches[j];
                        if (uMat.indexOf(w) !== -1) { hit++; continue HITLOOP; }
                    }
                }
                if (hit === len) return true;
                return false;
            }
 
            const db = firebase.firestore();
            let itemsRef = db.collection("uploaded-previews");
 
            // https://firebase.google.com/docs/firestore/query-data/queries
            if (urlFilter) { itemsRef = itemsRef.where("urlFilter", "array-contains", urlFilter); }
            if (only4email) { itemsRef = itemsRef.where("userEmail", "==", only4email); }
            if ((!only4email) && !urlFilter) { itemsRef = itemsRef.orderBy("userEmail"); }
 
            // pagination
            // https://firebase.google.com/docs/firestore/query-data/query-cursors
            const limit = 2;
            const firstRefs = itemsRef.limit(limit + 1);
            const firstSnapShot = await firstRefs.get();
            const anyHits = !firstSnapShot.empty;
            if (!anyHits) {
                container.appendChild(mkElt("i", undefined, "(No hits)"));
                return;
            }
 
            let lastVisible = firstSnapShot.docs[firstSnapShot.docs.length - 1];
            let pendingDoc;
            let lastEmail;
 
            addSnapShot(firstSnapShot, limit + 1);
 
            // startAfter, endBefore, startAt, endAt
            checkMore();
            async function checkMore() {
                if (pendingDoc) {
                    const btnNext = mkElt("button", { class: "mdc-button color-button" }, "More");
                    btnNext.addEventListener("click", async evt => {
                        evt.preventDefault();
                        btnNext.disabled = true;
                        divNext.appendChild(mkAweSpinner());
                        const nextRefs = itemsRef.startAfter(lastVisible).limit(limit);
                        const snapShot = await nextRefs.get();
                        lastVisible = snapShot.docs[snapShot.docs.length - 1];
                        addSnapShot(snapShot, limit);
                        container.removeChild(divNext);
                        checkMore();
                    })
                    const divNext = mkElt("p", undefined, btnNext);
                    container.appendChild(divNext);
                }
            }
 
            function addSnapShot(snapShot, thisLimit) {
                const docs = [...snapShot.docs];
                const oldPendingDoc = pendingDoc;
                if (docs.length === (thisLimit)) {
                    pendingDoc = docs.pop();
                } else {
                    pendingDoc = undefined;
                }
                if (oldPendingDoc) docs.unshift(oldPendingDoc);
                docs.forEach((itemRef) => {
                    const id = itemRef.id;
                    const data = itemRef.data();
                    const xdata = { id, ...data }
                    console.log({ xdata });
                    const title = data.title || "Sorry, forgot title";
                    const host = data.host;
                    const sourceUrl = data.sourceUrl;
                    const time = data.time;
                    const userEmail = data.userEmail;
                    const exportId = data.exportId;
 
                    const forFilter = [id];
                    forFilter.push(title);
                    forFilter.push(host);
                    forFilter.push(sourceUrl);
                    forFilter.push(time);
                    forFilter.push(userEmail);
                    forFilter.push(exportId);
                    // if (!filterItem(forFilter)) { return; }
 
                    if (!only4email) {
                        if ((!lastEmail) || (lastEmail !== userEmail)) {
                            lastEmail = userEmail;
                            funFolder(userEmail, container);
                        }
                    }
                    const url = getPreviewUrl(id);
                    funItem(container, id, url, title, only4email);
                });
            }
        }
 
        // const h2 = mkElt("h2", undefined, `Your uploaded previews`);
        // h2.style.fontSize = "1.2rem";
        // divContYour.appendChild(h2);
 
    }
 
 
    const divContYour = mkElt("div", { class: "mdc-card" });
    divContYour.style = `margin-top: 2rem; padding: 1rem;`;
 
    const divContAll = mkElt("div");
    divContAll.style = `margin-top: 4rem;`;
    divOutput.appendChild(divContYour);
    divOutput.appendChild(divContAll);
    const divContOuter = mkElt("div", undefined, det);
    return divContOuter;
}
*/

/*
export function OLDmkUploadedPreviews() {
    const divOutput = mkElt("div");
    const inputFilter = mkMDCtextFieldInput("input-filter-uploaded");
    const tfFilter = mkMDCtextField("Filter (not ready yet)", inputFilter);
    const divContainer = mkElt("div", undefined, [tfFilter, divOutput]);
    divContainer.style.padding = "1rem";
    const sum = mkElt("summary", undefined, "Uploaded previews");
    const det = mkElt("details", undefined, [sum, divContainer])
    sum.addEventListener("click", evt => {
        if (divOutput.textContent !== "") return;
        setupToGetItems();
    });
 
    inputFilter.addEventListener("input", evt => {
        queueFilter();
    });
    const queueFilter = (() => {
        let timer;
        let prevFilterVal;
        return () => {
            clearTimeout(timer);
            timer = setTimeout(async () => {
                const filterVal = inputFilter.value.trim();
                if (filterVal === prevFilterVal) return;
                prevFilterVal = filterVal;
                let filterWords;
                if (filterVal.length > 0)
                    filterWords = filterVal.split(/ +/).map(str => str.toLocaleUpperCase());
                const rdc = divContainer.getBoundingClientRect();
                divContainer.style.minHeight = `${rdc.height}px`;
                await setupToGetItems(filterWords);
                divContainer.style.minHeight = null;
            }, 1000);
        };
    })();
 
 
 
    async function setupToGetItems(filterWords) {
        function mkFunItem(gcsName, href, title) {
            // console.log("mkFunItem", gcsName, href, title);
            const key = gcsName2key(gcsName);
            const keyrec = key2rec(key);
            const srctype = keyrec.srctype;
            let sym;
            switch (srctype) {
                case "ytvideo":
                    sym = mkAwesomeYouTube();
                    break;
                case "video":
                    sym = mkAwesomeVideo();
                    break;
                case "audio":
                    sym = mkAwesomeAudio();
                    break;
                default:
                    throw Error(`Bad srctype=${srctype}`);
            }
            // const a = mkElt("a", { href, target:"_blank" }, key);
            const a = mkElt("a", { href, target: "_blank" }, title || key);
            const divA = mkElt("div", undefined, [sym, a])
            divA.style = `
                display: grid;
                grid-template-columns: 1.5rem minmax(0, 1fr);
                padding: 0.5rem 0;`;
            return divA;
        }
        function funItem(container, gcsName, href, title) {
            const divA = mkFunItem(gcsName, href, title);
            container.appendChild(divA);
        }
        function funItemYour(container, gcsName, href, title) {
            const divA = mkFunItem(gcsName, href, title);
            const btnDelete = mkElt("button", undefined, "x");
            btnDelete.addEventListener("click", evt => {
                const storageRef = firebase.storage().ref();
                const nameInBucket = `tmptranscripts/${theFirebaseCurrentUserEmail}/${gcsName}`;
                const itemRef = storageRef.child(nameInBucket);
                itemRef.delete().then(function () {
                    container.removeChild(divA);
                }).catch(function (error) {
                    console.error("btnDelete", error);
                    throw error;
                });
            })
            divA.insertBefore(btnDelete, divA.firstElementChild);
            divA.style.gridTemplateColumns = "2rem 1.5rem minmax(0, 1fr)";
            container.appendChild(divA);
        }
        function funFolder(name, container) {
            const h3 = mkElt("h3", undefined, `User: ${name}`);
            h3.style.fontWeight = "bold";
            container.appendChild(h3);
        }
 
        divContYour.innerHTML = "";
        divContAll.innerHTML = "";
        await wait4mutations(divOutput, 200);
 
        if (!!theFirebaseCurrentUserEmail) {
            const h2 = mkElt("h2", undefined, `Your uploaded previews`);
            h2.style.fontSize = "1.2rem";
            divContYour.appendChild(h2);
            await listGcs(`tmptranscripts/${theFirebaseCurrentUserEmail}`, divContYour, filterWords, funItemYour, funFolder);
        }
 
        const h2all = mkElt("h2", undefined, `All uploaded previews`);
        h2all.style.fontSize = "1.2rem";
        divContAll.appendChild(h2all);
        await listGcs("tmptranscripts", divContAll, filterWords, funItem, funFolder);
 
    }
 
 
    const divContYour = mkElt("div", { class: "mdc-card" });
    divContYour.style = `margin-top: 2rem; padding: 1rem;`;
 
    const divContAll = mkElt("div");
    divContAll.style = `margin-top: 4rem;`;
    divOutput.appendChild(divContYour);
    divOutput.appendChild(divContAll);
    const divContOuter = mkElt("div", undefined, det);
    return divContOuter;
}
*/

/*
export async function editEntryMeta() {
    const eltInfo = document.getElementById(id000Info);
 
    // const oldTitle = eltInfo.dataset.title;
    const oldTitle = getDatasetValue(eltInfo.dataset.title);
    const inputTitle = mkMDCtextFieldInput("entry-title-input");
    inputTitle.value = oldTitle;
    const tfTitle = mkMDCtextField("Entry title", inputTitle);
    // tfTitle.valid = true;
    setMdcInputValid(inputTitle, true);
    inputTitle.addEventListener("input", evt => {
        // tfTitle.valid = inputTitle.value.trim() !== "";
        const valid = inputTitle.value.trim() !== "";
        setMdcInputValid(inputTitle, valid);
        checkCanSave();
    })
 
    const oldRelSrc = getDatasetValue(eltInfo.dataset.relsrc);
    const inputRelSrc = mkMDCtextFieldInput("entry-relsrc-input");
    inputRelSrc.type = "url";
    inputRelSrc.spellcheck = false;
    if (!!oldRelSrc) inputRelSrc.value = oldRelSrc;
    const tfRelSrc = mkMDCtextField("Link to related source", inputRelSrc);
    setMdcInputValid(inputRelSrc, true);
    inputRelSrc.addEventListener("input", evt => {
        const link = inputRelSrc.value.trim();
        const valid = isValidLink(link);
        setMdcInputValid(inputRelSrc, valid);
        checkCanSave();
    });
 
    let canSave = false;
    function checkCanSave() {
        const newTitle = inputTitle.value.trim();
        const newRelSrc = inputRelSrc.value.trim();
        const hasChanged = (newTitle != oldTitle) || (newRelSrc != oldRelSrc);
        const titleValid = getMdcInputValid(inputTitle);
        const relSrcValid = getMdcInputValid(inputRelSrc);
        // canSave = hasChanged && tfTitle.valid && tfRelSrc.valid;
        canSave = hasChanged && titleValid && relSrcValid;
        btnSave.disabled = !canSave;
    }
 
    // modMediaChoiceBase.add000Key(eltInfo, key);
    // requestUpdateEltToDoc(eltInfo);
    const btnSave = mkElt("button", { class: "mdc-button color-button-important" }, "Save");
    btnSave.disabled = true;
    btnSave.addEventListener("click", evt => {
        if (!canSave) return;
        // eltInfo.dataset.title = inputTitle.value.trim();
        eltInfo.dataset.title = makeDatasetValueUpdated(inputTitle.value.trim());
        // const urlRelSrc = inputRelSrc.value.trim();
        const urlRelSrc = makeDatasetValueUpdated(inputRelSrc.value.trim());
        if (urlRelSrc) {
            eltInfo.dataset.relsrc = urlRelSrc;
        } else {
            delete eltInfo.dataset.relsrc;
        }
        requestUpdateEltToDoc(eltInfo);
        popup.close();
    })
    const divSave = mkElt("div", undefined, btnSave);
    const title = "Change Title, Source, etc";
    const body = mkElt("div", undefined, [
        tfTitle,
        tfRelSrc,
        divSave,
    ]);
    body.style = `
        display: grid;
        gap: 1rem;
        `
    const popup = new Popup(title, body, undefined, true);
    popup.show();
}
*/


/*
// https://stackoverflow.com/questions/18749591/encode-html-entities-in-javascript/39243641#39243641
export function unescapeHTML(str) {
    const htmlEntities = {
        nbsp: ' ',
        cent: '¢',
        pound: '£',
        yen: '¥',
        euro: '€',
        copy: '©',
        reg: '®',
        lt: '<',
        gt: '>',
        quot: '"',
        amp: '&',
        apos: '\''
    };
    return str.replace(/\&([^;]+);/g, function (entity, entityCode) {
        let match;
 
        if (entityCode in htmlEntities) {
            return htmlEntities[entityCode];
            // eslint no-cond-assign: 0
        } else if (match = entityCode.match(/^#x([\da-fA-F]+)$/)) {
            return String.fromCharCode(parseInt(match[1], 16));
            // eslint no-cond-assign: 0
        } else if (match = entityCode.match(/^#(\d+)$/)) {
            return String.fromCharCode(~~match[1]);
        } else {
            return entity;
        }
    });
}
*/

/*
let currenciesJson;
export async function getCurrencies() {
    if (currenciesJson) {
        const prevDate = currenciesJson.date;
        const date = new Date().toISOString().substr(0, 10);
        if (prevDate === date) return;
    }
    const currUrl = "https://api.exchangeratesapi.io/latest";
    currenciesJson = await fetchJson(currUrl);
 
    if (currenciesJson.base !== "EUR") {
        const errMsg = `Unexpected response from ${currUrl}`;
        throw Error(errMsg);
    }
}
function getCurrencyRate(currency) {
    if (currency === "EUR") return 1;
    return currenciesJson.rates[currency];
}
export function convertCurrency(fromAmount, fromCurrency, toCurrency) {
    const toAmount = fromAmount * getCurrencyRate(toCurrency) / getCurrencyRate(fromCurrency);
    // console.log({ fromAmount }, { toAmount }, { fromCurrency }, { toCurrency });
    return toAmount;
}
export function formatCurrency(amount, currency) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency
    }).format(amount);
}
export function convertAndFormatCurrency(fromAmount, fromCurrency, toCurrency) {
    const toAmount = convertCurrency(fromAmount, fromCurrency, toCurrency);
    return formatCurrency(toAmount, toCurrency);
}
*/

/*
export function mkFlagImg(currency) {
    // let flagSrc = `https://europa.eu/european-union/sites/europaeu/files/docs/body/flag_yellow_low.jpg`;
    let flagSrc = "/img/other/flag-eu.svg";
    if (currency !== "EUR") {
        flagSrc = `https://www.ecb.europa.eu/shared/img/flags/${currency}.gif`;
    }
    const img = mkElt("img", { src: flagSrc, width: 16, height: 16 })
    return img;
}
*/



/*
export function mkCurrencyButton(btn, funAfter) {
    function updateCurrencyButton() {
        const childCount = btn.childElementCount;
        if (childCount !== 1) throw Error(`childCount === ${childCount}`);
        const currencyButtonInner = btn.firstElementChild;
        currencyButtonInner.innerHTML = "";
        const imgFlag = mkFlagImg(currencyUI);
        currencyButtonInner.appendChild(imgFlag);
        currencyButtonInner.appendChild(document.createTextNode(currencyUI));
    }
    function funAfterAndUpdateButton(oldCurr, newCurr) {
        funAfter(oldCurr, newCurr);
        updateCurrencyButton();
    }
 
    updateCurrencyButton();
    btn.addEventListener("click",
        evt => {
            evt.preventDefault();
            funPickCurrency(funAfterAndUpdateButton);
        });
    return btn;
}
*/

/*
async function funPickCurrency(funDone) {
    await getCurrencies();
    const oldCurrencyUI = currencyUI;
    let btnFocus;
    function mkMenuInternal() {
        const defCurrency = docCookies.getItem("currency");
        const defaultCurrency = defCurrency || "EUR";
        const rates = currenciesJson.rates;
        const menuInternal = mkElt("div");
        menuInternal.style = `
            xmax-width: min(80vw, 400px);
            height: auto;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
            gap: 0.5rem;
        `;
        const btnStyle = `
            min-width: fit-content;
        `;
        const ratesKeys = Object.keys(rates);
        ratesKeys.push("EUR");
        const sortedRates = ratesKeys.sort();
        for (const i in sortedRates) {
            const k = sortedRates[i];
            const imgFlag = mkFlagImg(k);
            imgFlag.style.marginLeft = "0.2rem";
            const btn = mkElt("button", { class: "mdc-button color-button" }, [k, " ", imgFlag]);
            if (k === defaultCurrency) {
                btn.classList.add("color-button-important");
                btnFocus = btn;
            }
            btn.style = btnStyle;
            menuInternal.appendChild(btn);
            const myK = k;
            btn.addEventListener("click", evt => {
                console.log({ myK });
                docCookies.setItem("currency", myK, Infinity, "/");
                funDone(oldCurrencyUI, myK);
                pop.close();
            })
        }
        return menuInternal;
    }
 
    const menuInt = mkMenuInternal();
    const pInfo = mkElt("p", undefined, [
        "Currencies and exchange rates are from ",
        mkElt("a", {
            href: "https://exchangeratesapi.io/",
            target: "_blank"
        }, "https://exchangeratesapi.io/")
    ])
    const body = mkElt("div", undefined, [pInfo, menuInt]);
    const title = "Switch currency";
    const pop = new Popup(title, body, undefined, true);
    pop.show();
    setTimeout(() => btnFocus.focus(), 600);
}
*/

let perMinuteS2T;
export async function getPerMinutesS2T() {
    if (!perMinuteS2T) {
        const paramsObj = {}
        const paramsName = "getperminutes2t";
        const result = await fetchSimpleJson(paramsName, paramsObj);
        console.log("result", result)
        const answer = result.answer;
        perMinuteS2T = answer.perMinuteS2T;
    }
    return perMinuteS2T;
}


// https://material.io/components/data-tables/web#data-tables
export function mkMDCdataTable(tableName, columnLabels, exampleRow4sort) {
    let numColumns;
    // <table class="mdc-data-table__table" aria-label="Dessert calories">
    const eltTable = mkElt("table", { class: "mdc-data-table__table", "aria-label": tableName });
    // <div class="mdc-data-table__table-container">
    const innerContainer = mkElt("div", { class: "mdc-data-table__table-container" }, eltTable);
    // <div class="mdc-data-table">
    const eltContainer = mkElt("div", { class: "mdc-data-table" }, innerContainer);
    if (columnLabels) {
        numColumns = columnLabels.length;
        // <tr class="mdc-data-table__header-row">
        const trHead = mkElt("tr", { class: "mdc-data-table__header-row" });
        // columnLabels.forEach(lbl => {
        for (let c = 0, len = columnLabels.length; c < len; c++) {
            const lbl = columnLabels[c];
            if (!exampleRow4sort) {
                // <th class="mdc-data-table__header-cell" role="columnheader" scope="col">
                const th = mkElt("th",
                    {
                        class: "mdc-data-table__header-cell",
                        role: "columnheader",
                        scope: "col"
                    },
                    lbl);
                trHead.appendChild(th);
            } else {
                const val = exampleRow4sort[c];
                const numeric = !isNaN(val);
                const idLbl = lbl.replaceAll(" ", "");
                /*
                <th
                    class="mdc-data-table__header-cell mdc-data-table__header-cell--with-sort"
                    role="columnheader"
                    scope="col"
                    aria-sort="none"
                    data-column-id="dessert"
                >
                */
                const thAttribs = {
                    class: "mdc-data-table__header-cell mdc-data-table__header-cell--with-sort",
                    role: "columnheader",
                    scope: "col",
                    "aria-sort": "none",
                    "data-column-id": lbl
                }
                /*
                <div class="mdc-data-table__header-cell-label">
                    Dessert
                </div>
                <button class="mdc-icon-button material-icons mdc-data-table__sort-icon-button"
                    aria-label="Sort by dessert"
                    aria-describedby="dessert-status-label">arrow_upward
                </button>
                <div class="mdc-data-table__sort-status-label" aria-hidden="true" id="dessert-status-label">
                </div>
                */
                const divCellLabel = mkElt("div",
                    {
                        class: "mdc-data-table__header-cell-label"
                    }, lbl);
                const btn = mkElt("button",
                    {
                        class: "mdc-icon-button material-icons mdc-data-table__sort-icon-button",
                        "aria-label": `Sort by ${lbl}`,
                        "aria-describedby": `${idLbl}-status-label`
                    },
                    "arrow_upward"
                );
                const divStatus = mkElt("div",
                    {
                        class: "mdc-data-table__sort-status-label",
                        "aria-hidden": "true",
                        id: `${idLbl}-status-label`
                    });
                // <div class="mdc-data-table__header-cell-wrapper">
                const divThWrapper = mkElt("div", { class: "mdc-data-table__header-cell-wrapper" }, [
                    divCellLabel,
                    btn,
                    divStatus
                ]);
                const th = mkElt("th", thAttribs, divThWrapper);
                trHead.appendChild(th);
            }
        }
        // });
        const eltThead = mkElt("thead", undefined, trHead);
        eltTable.appendChild(eltThead);
    }
    //  <tbody class="mdc-data-table__content">
    const eltBody = mkElt("tbody", { class: "mdc-data-table__content" });
    eltTable.appendChild(eltBody);
    return { eltContainer, eltTable, eltBody, numColumns }
}
export function mkMDCdataTableRow(columns) {
    // <tr class="mdc-data-table__row">
    const tr = mkElt("tr", { class: "mdc-data-table__row" });
    let first = true;
    columns.forEach(cell => {
        let eltColumn;
        const strCell = `${cell}`;
        if (first) {
            // <th class="mdc-data-table__cell" scope="row">Frozen yogurt</th>
            eltColumn = mkElt("td", { class: "mdc-data-table__cell", scope: "row" }, strCell);
        } else {
            // <td class="mdc-data-table__cell mdc-data-table__cell--numeric">24</td>
            eltColumn = mkElt("td", { class: "mdc-data-table__cell" }, strCell);
        }
        tr.appendChild(eltColumn);
        first = false;
    });
    const numColumns = columns.length;
    return { tr, numColumns }
}
export function addMDCrow2Table(row, table) {
    if (!row.tr.classList.contains("mdc-data-table__row")) throw Error(`tr does not contain mdc-data-table__row`);
    if (!row.numColumns) throw Error(`row does not have .numColumns`);
    if (table.numColumns && row.numColumns != table.numColumns) throw Error("Not same number of columns in row and table");
    table.eltBody.appendChild(row.tr);
}

let useSvgIcon = false;
// debugger;
// https://developers.google.com/fonts/docs/material_icons
export function mkMDCicon(iconMaterialName) {
    if (useSvgIcon) {
        const icon = mkMDCsvgIcon(iconMaterialName);
        // icon is always a HTML element because of the fetch.
        // So this does not work to check if the SVG icon is there.
        if (icon) return icon;
    }
    return mkElt("span",
        // { class: "material-icons" },
        { class: materialIconsClass },
        iconMaterialName);
}
// The font icons does not work offline (and does not scale well).
// Here is an alternative.
export function mkMDCsvgIcon(iconMaterialName) {
    const srcRel = `/ext/mdc/icon/${iconMaterialName}_FILL0_wght400_GRAD0_opsz48.svg`;

    const importMetaUrl = import.meta.url;
    const urlIM = new URL(importMetaUrl);

    const onJsdelivr = importMetaUrl.search("jsdelivr") != -1;
    const onStatically = importMetaUrl.search("statically") != -1;
    const onOrig = !(onJsdelivr || onStatically);
    const origModPathname = '/src/js/mod/util-mdc.js';
    const lenOrigPathname = origModPathname.length;

    let src;
    if (onOrig) {
        const pathNameIM = urlIM.pathname;
        if (origModPathname != pathNameIM) {
            throw Error(`origModPathname (${origModPathname}) != pathnameIM (${pathNameIM})`);
        }
        src = srcRel;
    } else {
        src = importMetaUrl.slice(0, - origModPathname.length) + srcRel;
    }
    // const src = new URL(srcRel.slice(1), import.meta.url).href;
    // console.log("mkMDCsvgIcon", import.meta.url, { srcRel, src, importMetaUrl });
    let elt = mkElt("img", {
        class: "sized-mdc-svg-icon",
        src
    });
    elt = mkElt("span", { class: "sized-mdc-svg-icon" });
    (async () => {
        let response = await fetch(src);
        if (response.ok) { // if HTTP-status is 200-299
            // get the response body (the method explained below)
            const text = await response.text();
            const text2 = text.replaceAll(`"48"`, `"100%"`);
            // elt.innerHTML = `<svg height="100%" width="100%"> ${text} </svg>`;
            elt.innerHTML = text2;
        } else {
            // alert(`HTTP-Error: ${response.status} (${src})`);
            console.error(`HTTP-Error: ${response.status} (${src})`);
            return;
        }
    })();
    return elt;
    // add_FILL0_wght400_GRAD0_opsz48
}



// https://m2.material.io/components/snackbars/web#design-amp-api-documentation
/*
<aside class="mdc-snackbar">
    <div class="mdc-snackbar__surface" role="status" aria-relevant="additions">
        <div class="mdc-snackbar__label" aria-atomic="false">
            Can't send photo. Retry in 5 seconds.
        </div>
        <div class="mdc-snackbar__actions" aria-atomic="true">
            <button type="button" class="mdc-button mdc-snackbar__action">
                <div class="mdc-button__ripple"></div>
                <span class="mdc-button__label">Retry</span>
            </button>
        </div>
    </div>
</aside>
*/
export function mkMDCsnackbar(msg, msTimeout, buttons) {
    const btnClose =
        mkElt("button", { type: "button", class: "mdc-button mdc-snackbar__action" }, [
            // <div class="mdc-button__ripple"></div>
            mkElt("div", { class: "mdc-button__ripple" }),
            // <span class="mdc-button__label">Retry</span>
            mkElt("span", { class: "mdc-button__label" },
                // "Dummy test 2"
                mkMDCicon("close")
            )
            // </button>
        ]);
    const btnAction = btnClose;

    const eltActions =
        mkElt("div", { class: "mdc-snackbar__actions", "aria-atomic": "true" }, [
            // <button type="button" class="mdc-button mdc-snackbar__action">
            btnAction,
            // </div>
        ]);

    const eltSurface =
        mkElt("div", { class: "mdc-snackbar__surface", role: "status", "aria-relevant": "additions" }, [
            // <div class="mdc-snackbar__label" aria-atomic="false">
            // Can't send photo. Retry in 5 seconds.
            // </div>
            mkElt("div", { class: "mdc-snackbar__label", "aria-atomic": "false" }, msg),
            // </div><div class="mdc-snackbar__actions" aria-atomic="true">
            eltActions,
            // </aside></div>
        ]);

    // <aside class="mdc-snackbar">
    const eltSnackbar = mkElt("aside", { class: "mdc-snackbar" }, [
        // <div class="mdc-snackbar__surface" role="status" aria-relevant="additions">
        eltSurface
        // </aside>
    ]);
    // new mdc.radio.MDCRadio(elt);
    const snackbar = new mdc.snackbar.MDCSnackbar(eltSnackbar);
    snackbar.timeoutMs = msTimeout || 4000; // min
    document.body.appendChild(eltSnackbar);
    eltSnackbar.addEventListener("MDCSnackbar:closed", (evt) => { eltSnackbar.remove(); });
    snackbar.open();
    return eltSnackbar;
}



// https://m2.material.io/components/switches/web#api
/*
<button id="basic-switch" class="mdc-switch mdc-switch--unselected" type="button" role="switch" aria-checked="false">
  <div class="mdc-switch__track"></div>
  <div class="mdc-switch__handle-track">
    <div class="mdc-switch__handle">
      <div class="mdc-switch__shadow">
        <div class="mdc-elevation-overlay"></div>
      </div>
      <div class="mdc-switch__ripple"></div>
      <div class="mdc-switch__icons">
        <svg class="mdc-switch__icon mdc-switch__icon--on" viewBox="0 0 24 24">
          <path d="M19.69,5.23L8.96,15.96l-4.23-4.23L2.96,13.5l6,6L21.46,7L19.69,5.23z" />
        </svg>
        <svg class="mdc-switch__icon mdc-switch__icon--off" viewBox="0 0 24 24">
          <path d="M20 13H4v-2h16v2z" />
        </svg>
      </div>
    </div>
  </div>
</button>
<label for="basic-switch">off/on</label>
*/
// FIXME: on, disabled
export async function mkMDCswitch(on, disabled) {
    const modMySvg = await import("my-svg");
    // <button id="basic-switch" class="mdc-switch mdc-switch--unselected" type="button" role="switch" aria-checked="false">
    // const eltSwitch = mkElt("button", { id: "basic-switch", class: "mdc-switch mdc-switch--unselected", type: "button", role: "switch", "aria-checked": "false" }, [
    const eltSwitch = mkElt("button", { id: "basic-switch", class: "mdc-switch", type: "button", role: "switch" }, [
        // <div class="mdc-switch__track"></div>
        mkElt("div", { class: "mdc-switch__track" }),
        // <div class="mdc-switch__handle-track">
        mkElt("div", { class: "mdc-switch__handle-track" }, [
            // <div class="mdc-switch__handle">
            mkElt("div", { class: "mdc-switch__handle" }, [
                // <div class="mdc-switch__shadow">
                mkElt("div", { class: "mdc-switch__shadow" }, [
                    // <div class="mdc-elevation-overlay"></div>
                    mkElt("div", { class: "mdc-elevation-overlay" })
                    // </div>
                ]),
                // <div class="mdc-switch__ripple"></div>
                mkElt("div", { class: "mdc-switch__ripple" }),
                // <div class="mdc-switch__icons">
                mkElt("div", { class: "mdc-switch__icons" }, [
                    // <svg class="mdc-switch__icon mdc-switch__icon--on" viewBox="0 0 24 24">
                    modMySvg.mkEltSvg("svg", {
                        class: "mdc-switch__icon mdc-switch__icon--on",
                        viewBox: "0 0 24 24"
                    }, [
                        //   <path d="M19.69,5.23L8.96,15.96l-4.23-4.23L2.96,13.5l6,6L21.46,7L19.69,5.23z" />
                        modMySvg.mkEltSvg("path", {
                            d: "M19.69,5.23L8.96,15.96l-4.23-4.23L2.96,13.5l6,6L21.46,7L19.69,5.23z"
                        })
                        // </svg>
                    ]),
                    // <svg class="mdc-switch__icon mdc-switch__icon--off" viewBox="0 0 24 24">
                    modMySvg.mkEltSvg("svg", {
                        class: "mdc-switch__icon mdc-switch__icon--off",
                        viewBox: "0 0 24 24",
                    }, [
                        //   <path d="M20 13H4v-2h16v2z" />
                        modMySvg.mkEltSvg("path", { d: "M20 13H4v-2h16v2z" }),
                        // </svg>
                    ]),
                    // </div>
                ])
                // </div>
            ]),
            // </div>
        ])
        // </button>
    ]);
    if (on) {
        eltSwitch.classList.add("mdc-switch--selected");
        eltSwitch.setAttribute("aria-checked", "true");
    } else {
        eltSwitch.classList.add("mdc-switch--unselected");
        eltSwitch.setAttribute("aria-checked", "false");
    }
    if (disabled) {
        eltSwitch.setAttribute("disabled", true);
    }
    const mdcSwitch = new mdc.switchControl.MDCSwitch(eltSwitch);
    eltSwitch.myMdc = mdcSwitch;
    // attachMdcWhenOnDocument(eltSwitch, mdcSwitch);
    return eltSwitch;
    // <label for="basic-switch">off/on</label>
}

/*
<div role="progressbar" class="mdc-linear-progress" aria-label="Example Progress Bar" aria-valuemin="0" aria-valuemax="1" aria-valuenow="0">
  <div class="mdc-linear-progress__buffer">
    <div class="mdc-linear-progress__buffer-bar"></div>
    <div class="mdc-linear-progress__buffer-dots"></div>
  </div>
  <div class="mdc-linear-progress__bar mdc-linear-progress__primary-bar">
    <span class="mdc-linear-progress__bar-inner"></span>
  </div>
  <div class="mdc-linear-progress__bar mdc-linear-progress__secondary-bar">
    <span class="mdc-linear-progress__bar-inner"></span>
  </div>
</div>
*/
export function mkMDCprogressBar(label, min, max, now) {
    // <div role="progressbar" class="mdc-linear-progress" aria-label="Example Progress Bar" aria-valuemin="0" aria-valuemax="1" aria-valuenow="0">
    const elt = mkElt("div", {
        role: "progressbar",
        class: "mdc-linear-progress",
        "aria-label": label,
        "aria-valuemin": `${min}`,
        "aria-valuemax": `${max}`,
        "aria-valuenow": `${now}`
    }, [
        // <div class="mdc-linear-progress__buffer">
        mkElt("div", { class: "mdc-linear-progress__buffer" }, [
            // <div class="mdc-linear-progress__buffer-bar"></div>
            mkElt("div", { class: "mdc-linear-progress__buffer-bar" }),

            // <div class="mdc-linear-progress__buffer-dots"></div>
            mkElt("div", { class: "mdc-linear-progress__buffer-dots" }),
            // </div>
        ]),
        // <div class="mdc-linear-progress__bar mdc-linear-progress__primary-bar">
        mkElt("div", { class: "mdc-linear-progress__bar mdc-linear-progress__primary-bar" },
            // <span class="mdc-linear-progress__bar-inner"></span>
            mkElt("span", { class: "mdc-linear-progress__bar-inner" }),
            // </div>
        ),
        // <div class="mdc-linear-progress__bar mdc-linear-progress__secondary-bar">
        mkElt("div", { class: "mdc-linear-progress__bar mdc-linear-progress__secondary-bar" },
            // <span class="mdc-linear-progress__bar-inner"></span>
            mkElt("span", { class: "mdc-linear-progress__bar-inner" })
            // </div>
        ),
        // </div>
    ]);
    elt.mdc = new mdc.linearProgress.MDCLinearProgress(elt);
    return elt;
}