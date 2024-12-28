const { decoder, encoder } = require('tetris-fumen');

var fumenCodes = []
for(let rawInput of process.argv.slice(2)){
    fumenCodes.push(...rawInput.split(" "));
}

for (let code of fumenCodes) {
    let inputPages = decoder.decode(code);
    for (let i = 0; i < inputPages.length; i++) {
        if (inputPages[0].flags.colorize) inputPages[i].flags.colorize = true;
        console.log(encoder.encode([inputPages[i]]));
    }
}