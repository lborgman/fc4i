const modMdc = await import("/src/js/mod/util-mdc.js");

const controller = new AbortController();
const { signal } = controller;

const ourOnFcChange = (() => {
    const ourPromise = new Promise(resolve => {
        signal.addEventListener("abort", evt => {
            // console.log(evt);
            resolve(signal.reason);
        });
    });
    return async () => {
        const onChange = await ourPromise;
        onChange();
    }
})();

export function mkBtnAddFlashcard(container, onFlashcardChange) {
    // mkMDCfab(eltIcon, title, mini, extendTitle)
    const iconAdd = modMdc.mkMDCicon("add");
    // const iconTurn = modMdc.mkMDCicon("question_answer")
    const btnFab = modMdc.mkMDCfab(iconAdd, "Add flashcard", true);
    btnFab.classList.add("fab-add-flashcard");
    controller.abort(onFlashcardChange);
    btnFab.addEventListener("click", errorHandlerAsyncEvent(async evt => {
        const eltFlashcard = await mkEltFlashcard();
        eltFlashcard.mySet("Is this ready???", "No. You need to edit this flashcard.");
        container.insertBefore(eltFlashcard, btnFab)
        ourOnFcChange();
    }));
    return btnFab;
}
class Flashcard {
    constructor() {
    }
}

// https://3dtransforms.desandro.com/card-flip
export async function mkEltFlashcard() {
    const btnEdit = modMdc.mkMDCiconButton("edit");
    btnEdit.classList.add("edit-flashcard");
    const btnDelete = modMdc.mkMDCiconButton("delete_forever");
    btnDelete.classList.add("delete-flashcard");
    btnDelete.addEventListener("click", errorHandlerAsyncEvent(async evt => {
        evt.preventDefault();
        evt.stopPropagation();
        eltCard.style.outline = "4px dotted yellowgreen";
        const dlg = modMdc.mkMDCdialogConfirm("Delete this flashcard?", "Yes", "No");
        const answer = await dlg;
        console.log({ answer });
        eltCard.style.outline = null;
        if (!answer) return;
        console.log("DELETING");
        // transition
        eltCard.style.transitionDuration = "1s";
        setTimeout(() => {
            console.log("%cAdding .removed", "color: red;");
            eltCard.classList.add("removed");
        }, 200);
        setTimeout(() => {
            const eltWrapper = eltCard.closest(".flashcard-scale-wrapper");
            eltWrapper.remove();
            ourOnFcChange();
        }, 1200);
    }));

    btnEdit.addEventListener("click", errorHandlerAsyncEvent(async evt => {
        function currentDialogValue() {
            const taQval = taQ.value.trim();
            const taAval = taA.value.trim();
            return { taQval, taAval };
        }
        function isChanged() {
            const valNow = currentDialogValue();
            if (valNow.taQval != initialDialogValue.taQval) return true;
            if (valNow.taAval != initialDialogValue.taAval) return true;
            return false;
        }
        evt.preventDefault();
        evt.stopPropagation();
        const val = await eltFlashard.myGet();
        const taQ = mkElt("textarea", { rows: 2 });
        taQ.value = val.question;
        const taA = mkElt("textarea", { rows: 5 });
        taA.value = val.answer;
        taQ.style.width = "100%";
        taA.style.width = "100%";
        const initialDialogValue = currentDialogValue();
        const body = mkElt("div", undefined, [
            mkElt("h4", undefined, "Edit flashcard"),
            mkElt("div", undefined, "Question:"),
            taQ,
            mkElt("div", undefined, "Answer:"),
            taA,
        ]);
        taQ.addEventListener("input", evt => { saveFromDialogNow(); });
        taA.addEventListener("input", evt => { saveFromDialogNow(); });
        const titleSave = "Save";
        const titleCancel = "Close";
        const btnSave = modMdc.mkMDCdialogButton(titleSave, "save", true);
        const btnCancel = modMdc.mkMDCdialogButton(titleCancel, "close", true);
        // const eltActions = modMdc.mkMDCdialogActions([btnSave, btnCancel]);
        const eltActions = modMdc.mkMDCdialogActions([btnCancel]);

        const dlg = await modMdc.mkMDCdialog(body, eltActions);

        const actionClose = async () => {
            console.log("actionClose()");
            // if (isChanged()) { if (!await modMdc.mkMDCdialogConfirm("Discard changes?")) return; }
            dlg.mdc.close();
        }
        async function saveFromDialogNow() {
            eltFlashard.mySet(taQ.value, taA.value);
            // console.log("Saving........");
            ourOnFcChange();
            // New card?
            if (eltFront.style.borderStyle == "") {
                setFrontConfStyle(1);
            }
        }

        const actionSave = async () => {
            console.log("actionSave()");
            saveFromDialogNow();
            dlg.mdc.close();
        }
        const actions = {
            save: actionSave,
            close: actionClose
        }
        ///////////////////////////////////////
        /////// Something to save??
        // https://stackoverflow.com/questions/45464164/prevent-mdc-dialog-from-closing
        dlg.mdc.escapeKeyAction = "";
        dlg.mdc.scrimClickAction = "";
        const scrim = dlg.dom.querySelector(".mdc-dialog__scrim");
        scrim.addEventListener("click", evt => actionClose());

        // https://github.com/material-components/material-components-web/issues/1323
        // dlg.mdc.
        // temp1.querySelectorAll("[data-mdc-dialog-action]").forEach(elt => console.log(elt.dataset.mdcDialogAction))
        const btns = [...dlg.dom.querySelectorAll("[data-mdc-dialog-action]")];
        btns.forEach(btn => {
            const action = btn.dataset.mdcDialogAction;
            delete btn.dataset.mdcDialogAction;
            btn.addEventListener("click", errorHandlerAsyncEvent(async evt => actions[action]()));
        });
        ///////////////////////////////////////

        dlg.dom.addEventListener("MDCDialog:closing", errorHandlerAsyncEvent(async evt => {
            const action = evt.detail.action;
            console.log("MDCDialog:closing", { action });
        }));
        dlg.dom.addEventListener("MDCDialog:closed", errorHandlerAsyncEvent(async evt => {
            const action = evt.detail.action;
            console.log("MDCDialog:closed", { action });
            return;
            switch (action) {
                case "save":
                    eltFlashard.mySet(taQ.value, taA.value);
                    console.log("Saving........");
                    // onFlashcardChange();
                    eltFlashard.parentElement.myOnFlashcardChange();
                    break;
                case "close":
                    break;
                default:
                    throw Error(`error in mkMDCdialogConfirm, action is ${action}`)
            }
        }));

    }));

    const divConf = mkElt("div", { class: "flashcard-conf" });
    function setFrontConfStyle(valConf) {
        const style = eltFront.style;
        switch (valConf) {
            case 1:
                style.borderStyle = "dotted";
                style.borderColor = "red";
                style.backgroundColor = "darkred";
                style.color = "yellow";
                break;
            case 2:
                style.borderStyle = "dashed";
                style.borderColor = "yellow";
                style.borderColor = "greenyellow";
                style.backgroundColor = "darkolivegreen";
                style.backgroundColor = "yellow";
                style.color = "white";
                style.color = "black";
                style.color = "green";
                break;
            case 3:
                style.borderStyle = "solid";
                style.borderColor = "green";
                style.backgroundColor = "darkolivegreen";
                style.color = "white";
                break;
            default:
                throw Error(`Flash conf slider val=${valConf}`);
        }
    }

    async function addSlider() {
        function onChangeSlider(evt) {
            ourOnFcChange();
            const valSlider = sliConfidence.myMdc.getValue();
            console.log("onChangeSlidesliConfidencer", { val: valSlider, evt });
            setFrontConfStyle(valSlider);
            // indStatus.mySet(val);
        }
        function onInputSlider(evt) { console.log("onInput", evt); }
        // return;
        if (divConf.childElementCount > 0) return;
        // export async function mkMDCslider(min, max, now, step, label, onChange, onInput, disable) 
        const sliConfidence = await modMdc.mkMDCslider(1, 3, 1, 1, "Flashcard confidence", onChangeSlider, onInputSlider);
        sliConfidence.classList.add("fc-confidence-slider");
        sliConfidence.classList.add("mdc-my-slider-colors-fix");
        // const indStatus = mkStatusIndicator(3, "height");
        divConf.appendChild(sliConfidence);
        const sliVal = divConf.dataset.conf;
        if (sliVal) {
            const val = +sliVal;
            const mdc = sliConfidence.myMdc || await sliConfidence.myPromMdc;
            mdc.setValue(val);
            setFrontConfStyle(val);
        }
        // divConf.appendChild(mkElt("div", undefined, "Will you remember this?"));
    }


    const eltQ = mkElt("div", { class: "flashcard-answer" },)
    const eltFront = mkElt("div", { class: "mdc-card flipable-card__face flipable-card__face--front" }, eltQ);
    const eltA = mkElt("div", { class: "flashcard-answer" },)
    // const divScrollA = mkElt("div", { class: "flashcard-a-scroll" }, [ eltA ]);
    const eltBack = mkElt("div", { class: "mdc-card flipable-card__face flipable-card__face--back" }, [
        // divScrollA,
        eltA,
        btnEdit, btnDelete,
        divConf
    ]);
    const eltCard = mkElt("div", { class: "flipable-card removable" }, [
        eltFront,
        eltBack
    ]);
    eltCard.addEventListener("click", evt => {
        console.log({ evt }, "flip");
        const eltWrapper = eltCard.closest(".flashcard-scale-wrapper");
        if (!eltWrapper.classList.contains("flashcard-normal")) {
            eltWrapper.classList.add("flashcard-normal");
            return;
        }
        eltCard.classList.toggle("is-flipped");
        // FIX-ME: addSlider must be called earlier! Hm. No.
        if (eltCard.classList.contains("is-flipped")) { addSlider(); }
    });
    const eltFlashard =
        mkElt("div", { class: "flashcard-scale-wrapper" },
            mkElt("div", { class: "flashcard-scene" }, eltCard));
    eltFlashard.myGet = async () => {
        const eltQ = eltFront.firstElementChild;
        const eltA = eltBack.firstElementChild;
        const eltSlider = eltBack.querySelector(".mdc-slider");
        const mdc = eltSlider?.myMdc || await eltSlider?.myPromMdc;
        const conf = mdc?.getValue();
        const flashcardValue = {
            question: eltQ.textContent,
            answer: eltA.textContent,
            conf,
        }
        console.log({ flashcardValue });
        return flashcardValue;
    }
    eltFlashard.mySet = (q, a, conf) => {
        const eltQ = mkElt("div", undefined, q);
        // const eltA = mkElt("div", undefined, a);
        eltFront.textContent = "";
        eltFront.appendChild(eltQ);
        const eltA = eltBack.querySelector(".flashcard-answer")
        // eltBack.firstElementChild.textContent = "";
        eltA.textContent = a;
        // eltBack.firstElementChild.appendChild(eltA);
        if (conf != undefined) {
            const eltSlider = eltBack.querySelector(".mdc-slider");
            if (eltSlider) {
                // console.error("There is an eltSlider", { eltSlider });
                // throw Error("There is an eltSlider");
                eltSlider.myMdc.setValue()
            } else {
                console.log("saving conf on div", { conf });
                const divConf = eltBack.querySelector(".flashcard-conf");
                divConf.dataset.conf = conf;
                setFrontConfStyle(conf);
            }
        } else {
            console.warn("conf is undefined");
        }

    }
    eltFlashard.myAddSlider = addSlider;
    return eltFlashard;
}
