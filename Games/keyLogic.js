//key ditionary. provided by chatGPT
keyLogic = {
    keys: {
    // Letters
    a: [false, false], b: [false, false], c: [false, false], d: [false, false], e: [false, false],
    f: [false, false], g: [false, false], h: [false, false], i: [false, false], j: [false, false],
    k: [false, false], l: [false, false], m: [false, false], n: [false, false], o: [false, false],
    p: [false, false], q: [false, false], r: [false, false], s: [false, false], t: [false, false],
    u: [false, false], v: [false, false], w: [false, false], x: [false, false], y: [false, false], z: [false, false],

    // Numbers
    0: [false, false], 1: [false, false], 2: [false, false], 3: [false, false], 4: [false, false],
    5: [false, false], 6: [false, false], 7: [false, false], 8: [false, false], 9: [false, false],

    // Function keys
    f1: [false, false], f2: [false, false], f3: [false, false], f4: [false, false], f5: [false, false],
    f6: [false, false], f7: [false, false], f8: [false, false], f9: [false, false], f10: [false, false],
    f11: [false, false], f12: [false, false],

    // Arrow keys
    arrowup: [false, false], arrowdown: [false, false], arrowleft: [false, false], arrowright: [false, false],

    // Modifier and control keys
    shift: [false, false], control: [false, false], alt: [false, false], meta: [false, false],
    capslock: [false, false], tab: [false, false], enter: [false, false], escape: [false, false],
    backspace: [false, false], delete: [false, false],

    // Punctuation and symbols
    '`': [false, false], '-': [false, false], '=': [false, false], '[': [false, false], ']': [false, false],
    '\\': [false, false], ';': [false, false], "'": [false, false], ',': [false, false], '.': [false, false],
    '/': [false, false],

    // Spacebar
    ' ': [false, false],

    // Numpad keys
    numlock: [false, false], numpad0: [false, false], numpad1: [false, false], numpad2: [false, false],
    numpad3: [false, false], numpad4: [false, false], numpad5: [false, false], numpad6: [false, false],
    numpad7: [false, false], numpad8: [false, false], numpad9: [false, false],
    numpadadd: [false, false], numpadsubtract: [false, false], numpadmultiply: [false, false],
    numpaddivide: [false, false], numpaddecimal: [false, false], numpadenter: [false, false],
    },


    keyDown: (key) => {
        if(keyLogic.keys[key.toLowerCase()][0]){
            return true;
        }
        return false;
    },

    keyWentDown: (key) => {
        if(keyLogic.keys[key.toLowerCase()][1]){
            return false;
        }
        if(keyLogic.keys[key.toLowerCase()][0]){
            keyLogic.keys[key.toLowerCase()][1] = true;
            return true;
        }
        return false;
    }
}


document.onkeydown = (e) => {
    keyLogic.keys[e.key.toLowerCase()][0] = true;
};

document.onkeyup = (e) => {
    keyLogic.keys[e.key.toLowerCase()][0] = false;
    keyLogic.keys[e.key.toLowerCase()][1] = false;
};