const {decoder, encoder} = require("tetris-fumen");

var fumenCodes = []
for (let rawInput of process.argv.slice(2)) {
	fumenCodes.push(...rawInput.split(" "));
}

for (let code of fumenCodes) {
	let inputPages = decoder.decode(code);
	page = inputPages[inputPages.length - 1]
	if (page["_field"]) {
		field = page["_field"]["field"]["pieces"]
		for (let index = 0; index < 230; index++) {
			if (field[index] !== 0) {
				field[index] = 8
			}
		}
		garbage = page["_field"]["garbage"]["pieces"]
		for (let index = 0; index < 10; index++) {
			if (garbage[index] !== 0) {
				garbage[index] = 8
			}
		}
	}
	console.log(encoder.encode(inputPages))
}

