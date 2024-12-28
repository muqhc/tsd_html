const { decoder, encoder } = require('tetris-fumen');

var fumenCodes = []
for(let rawInput of process.argv.slice(2)){
    fumenCodes.push(...rawInput.split(" "));
}

combined = []

for (let code of fumenCodes) {
    let inputPages = decoder.decode(code);
    for (let i = 0; i < inputPages.length; i++) {
        combined.push(inputPages[i]);
    }
}

console.log(encoder.encode(combined));
