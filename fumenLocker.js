const { decoder, encoder } = require('tetris-fumen');

var fumenCodes = []
for (let rawInput of process.argv.slice(2)) {
	fumenCodes.push(...rawInput.split(" "));
}

for (let code of fumenCodes) {
	let inputPages = decoder.decode(code);
	inputPages.push({flags:{lock:true}})
	console.log(encoder.encode(inputPages))
}
