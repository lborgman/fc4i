var index = p => typeof p === 'function'
    ? p                     // fn
    : typeof p === 'string'
        ? obj => obj[p]     // property name
        : obj => p;         // constant

export { index as default };
