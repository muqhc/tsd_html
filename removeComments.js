const { decoder, encoder } = require('tetris-fumen');

var fumenCodes = []
for(let rawInput of process.argv.slice(2)){
    fumenCodes.push(...rawInput.split(/\s/));
}

for (let code of fumenCodes) {
    let pages = decoder.decode(code);
    for (let i = 0; i < pages.length; i++) {
        pages[i].comment = '';
        pages[i].quiz = false;
    }
    console.log(encoder.encode(pages));
}
