// const { decoder, encoder } = require('tetris-fumen')

function lockFumen(){
	var fumenCodes = [];
	results = [];

	input = document.getElementById('input').value;
	for (let rawInput of input.split("\t")) {
		fumenCodes.push(...rawInput.split(/\s/));
	}

	for (let code of fumenCodes) {
		try {
			let inputPages = decoder.decode(code);
			inputPages.push({flags:{lock:true}})
			results.push(encoder.encode(inputPages))
		} catch (error) { console.log(code, error); }
	}
	console.log(results.join(' '));
	document.getElementById("output").value = results.join(delimiter)
}
