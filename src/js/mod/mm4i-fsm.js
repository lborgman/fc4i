// @ts-check
const MM4I_FSM_VER = "0.0.3";
console.log(`here is mm4i-fsm.js, module,${MM4I_FSM_VER}`);
if (document.currentScript) throw Error("import .currentScript"); // is module

const modJssm = await importFc4i("jssm");
console.log({ modJssm });

export const fsmDeclaration = `
machine_name     : "mm4i <user@example.com>";
machine_license  : MIT;
machine_comment  : "mm4i pointer events";

start_states     : [Idle];
end_states       : [Idle];

flow: down;

// arrange [Green, Yellow];

Idle 'n_down' => n_Down;
n_Down 'up' => n_Click;
n_Click after 200 ms => Idle;
n_Click 'n_down' => n_Dblclick;
n_Dblclick after 1 ms => Idle;

n_Down after 200 ms => n_Move;
// n_Down 'move' => n_Move;
n_Move 'up' => Idle;


Idle 'c_down' => c_Down;
c_Down 'up' => c_Click;
c_Click after 200 ms => Idle;
c_Click 'c_down' => c_Dblclick;
c_Dblclick after 1 ms => Idle;
// c_Dblclick after 0 ms => Idle; // does not work
// c_Dblclick => Idle; // does not work
// c_Dblclick 'up' => Idle; // does not work because of popup

c_Down after 200 ms => c_Move;
c_Move 'up' => Idle;
c_Down 'c_down' => c_Zoom;
c_Zoom 'up' => Idle;


// [Red Yellow Green] ~> Off;



// visual styling

state Idle    : { shape: octagon; background-color: lightgray; };

state n_Down     : { corners: rounded; background-color: wheat; };
state n_Move     : { corners: rounded; background-color: wheat; };
state n_Click    : { corners: rounded; background-color: wheat; };
state n_Dblclick : { corners: rounded; background-color: wheat; };

state c_Down     : { background-color: lightgray; };
state c_Move     : { background-color: lightgray; };
state c_Click    : { background-color: lightgray; };
state c_Dblclick : { background-color: lightgray; };
state c_Zoom       : { background-color: lightgray; };
`;


// https://github.com/oxc-project/oxc/issues/6476 (This is not oxc, but typescript)
// oxc, Property 'map' does not exist on type 'RegexpStringIterator<RegExpExecArray>'. ts(2339)
// fsmDeclaration.matchAll(/'([^']*?)'/g).map(m => m[1]);

const arrEvents = [... new Set(fsmDeclaration.matchAll(/'([^']*?)'/g).map(m => m[1]))].sort();
export function isEvent(str) { return arrEvents.includes(str); }
export function checkIsEvent(str) { if (!isEvent(str)) throw Error(`Unknown fsm event: ${str}`); }

// const arrStates = [... new Set( fsmDeclaration.matchAll(/(?:=>|ms)\s+([^']*?);/g).map(m => m[1]) ) ].sort();
const arrStates = [... new Set(fsmDeclaration.matchAll(/=>\s+(\S+?)\s*;/g))].map(m => m[1]).sort();

export function isState(str) { return arrStates.includes(str); }
export function checkIsState(str) { if (!isState(str)) throw Error(`Unknown fsm state: ${str}`); }

export const fsm = modJssm.sm(fsmDeclaration.split("\\n"));

// export const hook_action = fsm.hook_action;
// export const hook_entry = fsm.hook_entry;
// let eventDownHandler;
// let eventUpHandler;
// export function setActionDownHandler(fun) { eventDownHandler = fun; }
// export function setActionUpHandler(fun) { eventUpHandler = fun; }

export function getPointerType(evt) {
    const pointerType = evt.pointerType;
    if (["mouse", "touch", "pen"].indexOf(pointerType) == -1) {
        const msg = `ERROR: Unknown pointerType: "${pointerType}"`;
        alert(msg);
        debugger;
    }
    return pointerType;
}

export function setupFsmListeners(eltFsm) {
    eltFsm.addEventListener("pointerdown", evt => {
        console.log("eltFsm, pointerdown", evt);
        const target = evt.target;
        if (!eltFsm.contains(target)) return;
        let actionWhere = "c";
        const eltJmnode = target.closest("jmnode");
        if (eltJmnode) { actionWhere = "n"; }
        // FIX-ME: mouse/pen or touch??
        const pointerType = getPointerType(evt);
        const action = `${actionWhere}_down`;
        actionWithErrorCheck(action, { eltJmnode, pointerType });
    });
    eltFsm.addEventListener("pointerup", evt => {
        console.log("eltFsm, pointerup", evt);
        const target = evt.target;
        if (!eltFsm.contains(target)) return;
        const action = "up";
        actionWithErrorCheck(action);
    });
    function actionWithErrorCheck(action, data) {
        checkIsEvent(action);
        const state = fsm.state();
        const res = fsm.action(action, data);
        if (!res) {
            const msg = `State: ${state}, fsm.action(${action}) returned ${res}`
            console.error(msg);
            // throw Error(msg);
        }
    }
}