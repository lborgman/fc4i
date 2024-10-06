const MM4I_FSM_VER = "0.0.3";
console.log(`here is mm4i-fsm.js, module,${MM4I_FSM_VER}`);
if (document.currentScript) throw Error("import .currentScript"); // is module

const modJssm = await importFc4i("jssm");
console.log({ modJssm });

const fsmDeclaration = `
machine_name     : "mm4i <user@example.com>";
machine_license  : MIT;
machine_comment  : "mm4i pointer events";

start_states     : [Idle];
end_states       : [];

flow: down;

// arrange [Green, Yellow];

// Idle 'up' => Idle;


Idle 'n_down' => n_Down;

n_Down 'up' => n_Click;
n_Click 'timeout' => Idle;
n_Click 'n_down' => n_Dblclick;
n_Dblclick 'up' => Idle;

n_Down 'move' => n_Move;
n_Move 'up' => Idle;



Idle 'c_down' => c_Down;

c_Down 'up' => c_Click;
c_Click 'timeout' => Idle;
c_Click 'n_down' => c_Dblclick;
c_Dblclick 'up' => Idle;

c_Down 'move' => c_Move;
c_Move 'up' => Idle;
c_Down 'c_down' => Zoom;
// Zoom 'move' => Zoom;
Zoom 'up' => Idle;


// [Red Yellow Green] ~> Off;



// visual styling

state Idle    : { background-color: yellow;
    text-color: black;
    shape: octagon;
};
state n_Down  : { background-color: blue; text-color: white; corners: rounded; };
state n_Move  : { background-color: gray; corners: rounded; };

state n_Click : { corners: rounded; };
state n_Dblclick : { corners: rounded; };

state c_Down  : { background-color: lightskyblue; };
state c_Move  : { background-color: lightgray; text-color: black; };
state Zoom    : { background-color: pink; };
`;
export const fsm = modJssm.sm(fsmDeclaration.split("\\n"));

// export const hook_action = fsm.hook_action;
// export const hook_entry = fsm.hook_entry;
export function setUpListeners(eltFsm) {
    eltFsm.addEventListener("pointerdown", evt => {
        const target = evt.target;
        let action = "c_down";
        if (target.tagName == "JMNODE") { action = "n_down"; }
        fsm.action(action);
    });
    eltFsm.addEventListener("pointerup", () => { fsm.action("up"); });
    eltFsm.addEventListener("pointermove", evt => {
        const target = evt.target;
        let action = "c_move";
        if (target.tagName == "JMNODE") { action = "n_move"; }
        fsm.action(action);
    });
}