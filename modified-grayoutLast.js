// const {decoder, encoder} = require("tetris-fumen");

function grayoutLast() {
	var fumenCodes = [];
	results = [];
    input = document.getElementById('input').value;
    for (let rawInput of input.split("\t")) {
        fumenCodes.push(...rawInput.split(/\s/));
    }

	for (let code of fumenCodes) {
		try {
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
			results.push(encoder.encode(inputPages))
		}
		catch (error) {console.log(code, error);}
	}

    console.log(results.join(' '));
    document.getElementById("output").value = results.join(delimiter);
}

