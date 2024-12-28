const { decoder, encoder, Field } = require('tetris-fumen');
const Hashmap = require('hashmap');

let delimiter = '\n';

function glueFumen() {
	const rowLen = 10;

	const pieceMappings = new Hashmap();
	pieceMappings.set('T', [
		[
			[0, -1],
			[0, 0],
			[-1, -1],
			[1, -1],
		],
		[
			[0, -1],
			[0, 0],
			[-1, -1],
			[0, -2],
		],
		[
			[1, 0],
			[0, 0],
			[2, 0],
			[1, -1],
		],
		[
			[0, -1],
			[0, 0],
			[1, -1],
			[0, -2],
		],
	]);
	pieceMappings.set('I', [
		[
			[1, 0],
			[0, 0],
			[2, 0],
			[3, 0],
		],
		[
			[0, -2],
			[0, 0],
			[0, -1],
			[0, -3],
		],
	]);
	pieceMappings.set('L', [
		[
			[-1, -1],
			[0, 0],
			[-2, -1],
			[0, -1],
		],
		[
			[1, -1],
			[0, 0],
			[1, 0],
			[1, -2],
		],
		[
			[1, 0],
			[0, 0],
			[2, 0],
			[0, -1],
		],
		[
			[0, -1],
			[0, 0],
			[0, -2],
			[1, -2],
		],
	]);
	pieceMappings.set('J', [
		[
			[1, -1],
			[0, 0],
			[0, -1],
			[2, -1],
		],
		[
			[0, -1],
			[0, 0],
			[-1, -2],
			[0, -2],
		],
		[
			[1, 0],
			[0, 0],
			[2, 0],
			[2, -1],
		],
		[
			[0, -1],
			[0, 0],
			[1, 0],
			[0, -2],
		],
	]);
	pieceMappings.set('S', [
		[
			[0, -1],
			[0, 0],
			[1, 0],
			[-1, -1],
		],
		[
			[1, -1],
			[0, 0],
			[0, -1],
			[1, -2],
		],
	]);
	pieceMappings.set('Z', [
		[
			[1, -1],
			[0, 0],
			[1, 0],
			[2, -1],
		],
		[
			[0, -1],
			[0, 0],
			[-1, -1],
			[-1, -2],
		],
	]);
	pieceMappings.set('O', [
		[
			[0, -1],
			[0, 0],
			[1, 0],
			[1, -1],
		],
	]);

	const rotationDict = new Hashmap();
	rotationDict.set(0, 'spawn');
	rotationDict.set(1, 'left');
	rotationDict.set(2, 'reverse');
	rotationDict.set(3, 'right');

	function checkRotation(x, y, field, piecesArr, depth) {
		const piece = field.at(x, y);

		const rotationStates = pieceMappings.get(piece);

		let found = false;
		let leftoverPieces = null;

		for (let state = 0; state < rotationStates.length; state++) {
			let minoPositions = [];
			let newPiecesArr = piecesArr.slice();
			for (let pos of rotationStates[state]) {
				let posX = x + pos[0];
				let posY = y + pos[1];

				// checks for position is in bounds
				if (posX < 0 || posX >= rowLen) {
					break;
				}
				if (posY < 0) {
					break;
				}

				if (field.at(posX, posY) == piece) {
					minoPositions.push([posX, posY]);
				} else {
					break;
				}
			}
			// if there's 4 minos
			if (minoPositions.length == 4) {
				// a rotation is found
				let foundBefore = found;

				found = true;

				// a rotation that works
				let operPiece = {
					type: piece,
					rotation: rotationDict.get(state),
					x: minoPositions[0][0],
					y: minoPositions[0][1],
				};
				newPiecesArr.push(operPiece);

				let newField = field.copy();
				for (let pos of minoPositions) {
					let posX = pos[0];
					let posY = pos[1];
					// change the field to be the piece to be replaced by gray
					newField.set(posX, posY, 'X');
				}
				let oldHeight = newField.str().split('\n').length - 1;
				newField = removeLineClears(newField);

				const height = newField.str().split('\n').length - 1;

				// check if a line clear occurred
				let startx = x;
				let starty = y;
				if (oldHeight > height) {
					// start position to 0 otherwise it's where we left off scanning the field
					startx = 0;
					starty = height - 1;
				}

				let oldLen = allPiecesArr.length;

				let data = scanField(startx, starty, newField, newPiecesArr, depth + 1);
				let possPiecesArr = data[0];
				leftoverPieces = data[1];

				if (leftoverPieces == null) {
					leftoverPieces = findRemainingPieces(newField);
				}

				// if the field doesn't have any more pieces it's good
				if (possPiecesArr != null && leftoverPieces.length == 0) {
					allPiecesArr.push(possPiecesArr);
				} else if (oldLen == allPiecesArr.length) {
					// the piece didn't result into a correct glued fumen
					if (!leftoverPieces.includes(piece)) {
						return [found, leftoverPieces];
					} else {
						found = foundBefore;
					}
				}
			}
		}
		return [found, leftoverPieces];
	}

	function scanField(x, y, field, piecesArr, depth) {
		var newX = x;
		for (let newY = y; newY >= 0; newY--) {
			for (; newX < rowLen; newX++) {
				// if it is a piece
				if (field.at(newX, newY) != 'X' && field.at(newX, newY) != '_') {
					let [rotationWorked, leftover] = checkRotation(newX, newY, field, piecesArr, depth);
					if (rotationWorked) {
						// a rotation works for the piece so just end the function as the scan finished
						return [null, leftover];
					}
					// skips this one that meets no rotation as it might be a cut piece
				}
			}
			newX = 0;
		}
		return [piecesArr, null];
	}

	function makeEmptyField(field, height) {
		var emptyField = field.copy();
		for (let y = height - 1; y >= 0; y--) {
			for (let x = 0; x < rowLen; x++) {
				let piece = emptyField.at(x, y);
				if (piece.match(/[TILJSZO]/)) {
					emptyField.set(x, y, '_');
				}
			}
		}
		return emptyField;
	}

	function removeLineClears(field) {
		var lines = field.str().split('\n');
		for (let i = lines.length - 1; i >= 0; i--) {
			if (lines[i].match(/X{10}/)) {
				lines.splice(i, 1);
			}
		}
		const newField = Field.create(lines.slice(0, -1).join(''), lines[-1]);
		return newField;
	}

	function findRemainingPieces(field) {
		let lines = field.str().split('\n').slice(0, -1);
		let piecesFound = [];
		for (let line of lines) {
			let pieces = line.match(/[TILJSZO]/g);
			if (pieces != null) {
				for (let piece of pieces) {
					if (!piecesFound.includes(piece)) {
						piecesFound.push(piece);
					}
				}
			}
		}
		return piecesFound;
	}

	var fumenCodes = [];
	input = document.getElementById('input').value;
	for (let rawInput of input.split('\t')) {
		// tabs
		fumenCodes.push(...rawInput.split(/\s/));
	}
	var allPiecesArr = [];
	var allFumens = [];
	var fumenIssues = 0;
	for (let code of fumenCodes) {
		try {
			let inputPages = decoder.decode(code);
			for (let pageNum = 0; pageNum < inputPages.length; pageNum++) {
				let field = inputPages[pageNum].field;
				field = removeLineClears(field);
				const height = field.str().split('\n').length - 1;
				let emptyField = makeEmptyField(field, height);
				allPiecesArr = [];

				scanField(0, height - 1, field, [], 0);

				if (allPiecesArr.length == 0) {
					console.log(code + " couldn't be glued");
					fumenIssues++;
				}

				for (let piecesArr of allPiecesArr) {
					let pages = [];
					pages.push({
						field: emptyField,
						operation: piecesArr[0],
					});
					for (let i = 1; i < piecesArr.length; i++) {
						pages.push({
							operation: piecesArr[i],
						});
					}
					let pieceFumen = encoder.encode(pages);
					allFumens.push(pieceFumen);
				}

				if (allPiecesArr.length > 1) {
					// multiple outputs warning
					console.log(
						code +
							' led to ' +
							allPiecesArr.length +
							' outputs: ' +
							allFumens.slice(-allPiecesArr.length).join(' ')
					);
				}
			}
		} catch (error) {
			console.log(code, error);
		}
	}
	if (fumenCodes.length > allFumens.length) {
		console.log('Warning: ' + fumenIssues + " fumens couldn't be glued");
	}

	console.log(allFumens.join('\n'));
	document.getElementById('output').value = allFumens.join(delimiter);
}
