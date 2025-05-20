//key ditionary. provided by chatGPT
document.keyLogic = {
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
    F1: [false, false], F2: [false, false], F3: [false, false], F4: [false, false], F5: [false, false],
    F6: [false, false], F7: [false, false], F8: [false, false], F9: [false, false], F10: [false, false],
    F11: [false, false], F12: [false, false],

    // Arrow keys
    ArrowUp: [false, false], ArrowDown: [false, false], ArrowLeft: [false, false], ArrowRight: [false, false],

    // Modifier and control keys
    Shift: [false, false], Control: [false, false], Alt: [false, false], Meta: [false, false],
    CapsLock: [false, false], Tab: [false, false], Enter: [false, false], Escape: [false, false],
    Backspace: [false, false], Delete: [false, false],

    // Punctuation and symbols
    '`': [false, false], '-': [false, false], '=': [false, false], '[': [false, false], ']': [false, false],
    '\\': [false, false], ';': [false, false], "'": [false, false], ',': [false, false], '.': [false, false],
    '/': [false, false],

    // Spacebar
    ' ': [false, false],

    // Numpad keys (if needed)
    NumLock: [false, false], Numpad0: [false, false], Numpad1: [false, false], Numpad2: [false, false],
    Numpad3: [false, false], Numpad4: [false, false], Numpad5: [false, false], Numpad6: [false, false],
    Numpad7: [false, false], Numpad8: [false, false], Numpad9: [false, false],
    NumpadAdd: [false, false], NumpadSubtract: [false, false], NumpadMultiply: [false, false],
    NumpadDivide: [false, false], NumpadDecimal: [false, false], NumpadEnter: [false, false],
    },

    keyDown: (key) => {
        if(document.keyLogic.keys[key][0]){
            return true;
        }
        return false;
    },

    keyWentDown: (key) => {
        if(document.keyLogic.keys[key][1]){
            return false;
        }
        if(document.keyLogic.keys[key][0]){
            document.keyLogic.keys[key][1] = true;
            return true;
        }
        return false;
    }
}


document.onkeydown = (e) => {
    document.keyLogic.keys[e.key][0] = true;
};

document.onkeyup = (e) => {
    document.keyLogic.keys[e.key][0] = false;
    document.keyLogic.keys[e.key][1] = false;
};