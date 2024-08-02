console.log("here is local-settings.js");

export class LocalSetting {
    #key; #defaultValue; #cachedValue; #input;
    static ourSettings = undefined;
    constructor(prefix, key, defaultValue) {
        this.#key = prefix + key;
        this.#defaultValue = defaultValue;
        this.#cachedValue = defaultValue;
        LocalSetting.ourSettings = LocalSetting.ourSettings || {};
        LocalSetting.ourSettings[this.#key] = this;
        this.#get_itemValue();
    }
    getCachedValue() {
        return this.#cachedValue;
    }
    reset() {
        this.#removeItemValue();
        if (this.#input) { this.#setInputValue(); }
    }
    #removeItemValue() {
        localStorage.removeItem(this.#key);
        this.#cachedValue = this.#defaultValue;
    }
    get value() {
        console.warn("%cget value", "background:red;");
        return this.getCachedValue();
    }
    set value(val) {
        if (this.#input) {
            throw Error(`set value(val) can not be used when #input is set (${this.#key})`);
        }
        this.#set_itemValue(val);
    }
    #set_itemValue(val) {
        const tofVal = typeof val;
        const tofDef = typeof this.#defaultValue;
        if (tofVal !== tofDef) {
            throw Error(`#set_itemValue, ${this.#key}: typeof val==${tofVal}, expected ${tofDef}`);
        }
        /*
        // FIX-ME:
        if (tofDef == "number") {
            const defIsInt = Number.isInteger(this.#defaultValue);
            const valIsInt = Number.isInteger(val);
            if (defIsInt) {
                if (!valIsInt) {
                    throw Error(`#set_itemValue, ${this.#key}: expected integer, got ${val}`);
                }
            }
        }
        */
        this.#cachedValue = val;
        localStorage.setItem(this.#key, val.toString());
    }
    #get_itemValue() {
        const stored = localStorage.getItem(this.#key);
        if (stored == null) {
            this.#cachedValue = this.#defaultValue;
            return;
        }
        const defValType = typeof this.#defaultValue;
        switch (defValType) {
            case "string":
                this.#cachedValue = stored;
                break;
            case "number":
                this.#cachedValue = +stored;
                break;
            case "boolean":
                switch (stored) {
                    case "true":
                        this.#cachedValue = true;
                        break;
                    case "false":
                        this.#cachedValue = false;
                        break;
                    default:
                        throw Error(`String does not match boolean: ${stored}`);
                }
            default:
                throw Error(`Can't handle default value type: ${defValType}`);
        }
    }
    get defaultValue() {
        return this.#defaultValue;
    }
    #setInputValue() {
        switch (this.#input.type) {
            case "checkbox":
                this.#input.checked = this.#cachedValue;
            default:
                // console.log(inp.type);
                this.#input.value = this.#cachedValue;
        }
    }
    bindToInput(inp) {
        if (this.#input) {
            console.error("bindToInput, already has .#input", this.#key, this.#input);
            throw Error("bindToInput, already has .#input");
        }
        /*
        if (this.#onInputFun) {
            console.error("bindToInput has .#onInputFun", this.#key, this.#onInputFun);
            throw Error("bindToInput, has .#onInputFun");
        }
        */
        this.#input = inp;
        this.#setInputValue();
        const handleInput = (evt) => {
            let val;
            switch (inp.type) {
                case "checkbox":
                    val = inp.checked;
                    break;
                case "number":
                    val = inp.value.trim();
                    val = +val;
                    break;
                case "range":
                    val = +inp.value;
                    break;
                default:
                    console.log(inp.type);
                    val = inp.value;
            }
            console.log({ inp, evt, val });
            this.#set_itemValue(val);
            // if (this.#onInputFun) { this.#onInputFun(val); } else { console.warn("No #onInputFun"); }
        }
        inp.addEventListener("input", evt => {
            handleInput(evt);
        });
    }
    /**
     * @param {{ (val: any): any; (val: any): any; (val: any): void; (val: any): void; (val: any): any; (val: any): any; (val: any): any; (val: any): any; (val: any): any; }} fun
     */
    /*
    set onInputFun(fun) {
        console.error("%conInputFun", "background:red;", this.#key, fun);
        throw Error("conInputFun");
        if ("function" != typeof fun) throw Error(`fun is not function: ${typeof fun}`);
        if (1 != fun.length) throw Error(`fun should take one parameter: ${fun.length}`);
        this.#onInputFun = debounce(fun, 1000);
    }
    */
}
