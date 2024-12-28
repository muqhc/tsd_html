const { decoder, encoder, Field } = require('tetris-fumen');
const Hashmap = require('hashmap');
const { createCanvas } = require('canvas');
const fs = require('fs');

// canvas stuff

const colors = {
	I: { normal: '#41afde', highlight1: '#3dc0fb', highlight2: '#3dc0fb', lighter: '#3dc0fb', light: '#43d3ff' },
	T: { normal: '#b451ac', highlight1: '#d161c9', highlight2: '#d161c9', lighter: '#d161c9', light: '#e56add' },
	S: { normal: '#66c65c', highlight1: '#75d96a', highlight2: '#7cd97a', lighter: '#7cd97a', light: '#88ee86' },
	Z: { normal: '#ef624d', highlight1: '#ff7866', highlight2: '#ff8778', lighter: '#fd7660', light: '#ff9484' },
	L: { normal: '#ef9535', highlight1: '#ffa94d', highlight2: '#ffae58', lighter: '#fea440', light: '#ffbf60' },
	J: { normal: '#1983bf', highlight1: '#1997e3', highlight2: '#1997e3', lighter: '#1997e3', light: '#1ba6f9' },
	O: { normal: '#f7d33e', highlight1: '#ffe34b', highlight2: '#ffe34b', lighter: '#ffe34b', light: '#fff952' },
	X: { normal: '#686868', highlight1: '#686868', highlight2: '#686868', lighter: '#686868', light: '#949494' },
	Empty: { normal: '#f3f3ed' },
};

function draw(fumenPage, tilesize, numrows, transparent) {
	const field = fumenPage.field;
	const operation = fumenPage.operation;

	function operationFilter(e) {
		return i == e.x && j == e.y;
	}

	if (numrows == undefined) {
		numrows = 0;
		for (i = 0; i < 10; i++) {
			for (j = 0; j < 23; j++) {
				if (field.at(i, j) != '_') {
					numrows = Math.max(numrows, j);
				}
				if (operation != undefined && operation.positions().filter(operationFilter).length > 0) {
					numrows = Math.max(numrows, j);
				}
			}
		}
		numrows += 2;
	}
	const width = tilesize * 10;
	const height = numrows * tilesize;

	const canvas = createCanvas(width, height);
	const context = canvas.getContext('2d');

	if (!transparent) {
		context.fillStyle = colors['Empty'].normal;
	} else {
		context.fillStyle = 'rgba(0, 0, 0, 0)';
	}
	context.fillRect(0, 0, width, height);

	for (i = 0; i < 10; i++) {
		for (j = 0; j < numrows; j++) {
			if (field.at(i, j) != '_') {
				context.fillStyle = colors[field.at(i, j)].light;
				context.fillRect(
					i * tilesize,
					height - (j + 1) * tilesize - tilesize / 5,
					tilesize,
					tilesize + tilesize / 5
				);
			}
			if (operation != undefined && operation.positions().filter(operationFilter).length > 0) {
				context.fillStyle = colors[operation.type].light;
				context.fillRect(
					i * tilesize,
					height - (j + 1) * tilesize - tilesize / 5,
					tilesize,
					tilesize + tilesize / 5
				);
			}
		}
	}
	for (i = 0; i < 10; i++) {
		for (j = 0; j < numrows; j++) {
			if (field.at(i, j) != '_') {
				context.fillStyle = colors[field.at(i, j)].normal;
				context.fillRect(i * tilesize, height - (j + 1) * tilesize, tilesize, tilesize);
			}
			if (operation != undefined && operation.positions().filter(operationFilter).length > 0) {
				context.fillStyle = colors[operation.type].normal;
				context.fillRect(i * tilesize, height - (j + 1) * tilesize, tilesize, tilesize);
			}
		}
	}
	return canvas;
}

const GIFEncoder = require('gifencoder');

function drawFumens(fumenPages, tilesize, numrows, start, end, transparent) {
	if (end == undefined) {
		end = fumenPages.length;
	}
	if (numrows == undefined) {
		numrows = 0;
		function operationFilter(e) {
			return i == e.x && j == e.y;
		}
		for (x = start; x < end; x++) {
			field = fumenPages[x].field;
			operation = fumenPages[x].operation;
			for (i = 0; i < 10; i++) {
				for (j = 0; j < 23; j++) {
					if (field.at(i, j) != '_') {
						numrows = Math.max(numrows, j);
					}
					if (operation != undefined && operation.positions().filter(operationFilter).length > 0) {
						numrows = Math.max(numrows, j);
					}
				}
			}
		}
		numrows += 2;
	}
	numrows = Math.min(23, numrows);
	const width = tilesize * 10;
	const height = numrows * tilesize;
	const canvas = createCanvas(width, height);
	const ctx = canvas.getContext('2d');
	const encoder = new GIFEncoder(width, height);
	encoder.start();
	encoder.setRepeat(0); // 0 for repeat, -1 for no-repeat
	encoder.setDelay(500); // frame delay in ms
	encoder.setQuality(1); // image quality. 10 is default.
	if (transparent) {
		encoder.setTransparent('rgba(0, 0, 0, 0)');
	}
	for (x = start; x < end; x++) {
		encoder.addFrame(draw(fumenPages[x], tilesize, numrows, transparent).getContext('2d'));
	}
	return encoder;
}

// glue stuff

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

function checkRotation(x, y, field, piecesArr) {
	const piece = field.at(x, y);

	const rotationStates = pieceMappings.get(piece);

	let found = false;

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

			newField = removeLineClears(newField);

            const height = newField.str().split('\n').length - 1;
            
            let oldLen = allPiecesArr.length;

			let possPiecesArr = scanField(0, height, newField, newPiecesArr);

			// if the field doesn't have any more pieces it's good
			if (checkFieldEmpty(newField)) {
                allPiecesArr.push(possPiecesArr);
            } else if(oldLen == allPiecesArr.length){
                // the piece didn't result into a correct glued fumen
                found = false;
			}
		}
	}
	return found;
}

function scanField(x, y, field, piecesArr) {
	var newX = x;
	for (let newY = y; newY >= 0; newY--) {
		for (; newX < rowLen; newX++) {
			// if it is a piece
			if (field.at(newX, newY) != 'X' && field.at(newX, newY) != '_') {
				if (checkRotation(newX, newY, field, piecesArr)) {
					// a rotation works for the piece so just end the function as the scan finished
					return null;
				}
				// skips this one that meets no rotation as it might be a cut piece
			}
		}
		newX = 0;
	}
	return piecesArr;
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

function checkFieldEmpty(field) {
	let lines = field.str().split('\n').slice(0, -1);
	for (let line of lines) {
		if (line.match(/.*[TILJSZO].*/)) {
			return false;
		}
	}
	return true;
}

// unglue stuff

pieces = {
	T: [
		[
			[0, 0],
			[0, -1],
			[0, 1],
			[1, 0],
		],
		[
			[0, 0],
			[0, 1],
			[1, 0],
			[-1, 0],
		],
		[
			[0, 0],
			[0, -1],
			[0, 1],
			[-1, 0],
		],
		[
			[0, 0],
			[0, -1],
			[1, 0],
			[-1, 0],
		],
	],
	I: [
		[
			[0, 0],
			[0, -1],
			[0, 1],
			[0, 2],
		],
		[
			[0, 0],
			[1, 0],
			[-1, 0],
			[-2, 0],
		],
		[
			[0, 0],
			[0, -1],
			[0, -2],
			[0, 1],
		],
		[
			[0, 0],
			[1, 0],
			[2, 0],
			[-1, 0],
		],
	],
	L: [
		[
			[0, 0],
			[0, -1],
			[0, 1],
			[1, 1],
		],
		[
			[0, 0],
			[1, 0],
			[-1, 0],
			[-1, 1],
		],
		[
			[0, 0],
			[0, -1],
			[0, 1],
			[-1, -1],
		],
		[
			[0, 0],
			[1, -1],
			[1, 0],
			[-1, 0],
		],
	],
	J: [
		[
			[0, 0],
			[0, -1],
			[0, 1],
			[1, -1],
		],
		[
			[0, 0],
			[1, 0],
			[-1, 0],
			[1, 1],
		],
		[
			[0, 0],
			[0, -1],
			[0, 1],
			[-1, 1],
		],
		[
			[0, 0],
			[-1, -1],
			[1, 0],
			[-1, 0],
		],
	],
	S: [
		[
			[0, 0],
			[0, -1],
			[1, 0],
			[1, 1],
		],
		[
			[0, 0],
			[1, 0],
			[0, 1],
			[-1, 1],
		],
		[
			[0, 0],
			[0, 1],
			[-1, 0],
			[-1, -1],
		],
		[
			[0, 0],
			[-1, 0],
			[0, -1],
			[1, -1],
		],
	],
	Z: [
		[
			[0, 0],
			[0, 1],
			[1, 0],
			[1, -1],
		],
		[
			[0, 0],
			[-1, 0],
			[0, 1],
			[1, 1],
		],
		[
			[0, 0],
			[0, -1],
			[-1, 0],
			[-1, 1],
		],
		[
			[0, 0],
			[1, 0],
			[0, -1],
			[-1, -1],
		],
	],
	O: [
		[
			[0, 0],
			[1, 0],
			[0, 1],
			[1, 1],
		],
		[
			[0, 0],
			[0, 1],
			[-1, 0],
			[-1, 1],
		],
		[
			[0, 0],
			[-1, 0],
			[0, -1],
			[-1, -1],
		],
		[
			[0, 0],
			[0, -1],
			[1, -1],
			[1, 0],
		],
	],
};

rotationMapping = {
	spawn: 0,
	right: 1,
	reverse: 2,
	left: 3,
};

colorMapping = {
	S: 7,
	J: 6,
	T: 5,
	Z: 4,
	O: 3,
	L: 2,
	I: 1,
};

function clearedOffset(rowsCleared, yIndex) {
	for (let row of rowsCleared) {
		if (yIndex >= row) yIndex++;
	}
	return yIndex;
}

// main code below

args = process.argv.slice(2);
if (args.length == 0 || args[0].includes('help')) {
	console.log('Fumen Utils. Commands currently supported:\ncanvas, split, combine, glue, unglue');
} else {
	// I'm less comfortable with switch cases so individual ifs it issssss
	if (args[0] == 'canvas') {
		if (args.length == 1 || args[1].includes('help')) {
			console.log(`fumen-canvas.js <command>

            Commands:
              fumen-canvas.js image <fumen> <output     Renders page of fumen into a png.
              file>
              fumen-canvas.js gif <fumen> <output       Renders fumen into a gif.
              file>`);
		} else {
			if (args[1] != 'image' && args[1] != 'gif') {
                var pages = decoder.decode(args[1]);
                
                if (pages.length == 1) args.splice(1, 0, "image");
                else args.splice(1, 0, "gif");
			}
			if (args[1] == 'image') {
				if (args.length > 2) {
					var pages = decoder.decode(args[2]);
					var canvas = draw(pages[0], 22, undefined, true);
					var buffer = canvas.toBuffer('image/png');
					fs.writeFileSync('output.png', buffer);
				}
			}
			if (args[1] == 'gif') {
				if (args.length > 2) {
					var pages = decoder.decode(args[2]);
					gif = drawFumens(pages, 22, undefined, 0, undefined, true);
					gif.createReadStream().pipe(fs.createWriteStream('output.gif'));
					gif.finish();
				}
			}
		}
	} else if (args[0] == 'split') {
		if (args.length == 1 || args[1].includes('help')) {
			console.log('Splits multi-page fumens into individual single-page fumens');
		} else {
			var fumenCodes = args.slice(1);

			for (let code of fumenCodes) {
				let inputPages = decoder.decode(code);
				for (let i = 0; i < inputPages.length; i++) {
					console.log(encoder.encode([inputPages[i]]));
				}
			}
		}
	} else if (args[0] == 'combine') {
		if (args.length == 1 || args[1].includes('help')) {
			console.log('Combines multiple fumens into a single multi-page fumens');
		} else {
			var fumenCodes = args.slice(1);
			combined = [];

			for (let code of fumenCodes) {
				let inputPages = decoder.decode(code);
				for (let i = 0; i < inputPages.length; i++) {
					combined.push(inputPages[i]);
				}
			}

			console.log(encoder.encode(combined));
		}
	} else if (args[0] == 'unglue') {
		if (args.length == 1 || args[1].includes('help')) {
			console.log('Turning multi-page fumens into single-paged fumens with color coded pieces');
		} else {
			var fumenCodes = args.slice(1);
			for (let code of fumenCodes) {
				let inputPages = decoder.decode(code);
				board = inputPages[0]['_field']['field']['pieces'];
				rowsCleared = [];

				for (let pageNum = 0; pageNum < inputPages.length; pageNum++) {
					op = inputPages[pageNum]['operation'];
					if (op) {
						piece = pieces[op['type']][rotationMapping[op['rotation']]];

						for (let mino of piece) {
							yIndex = op.y + mino[0];
							yIndex = clearedOffset(rowsCleared, yIndex);
							xIndex = op.x + mino[1];
							index = yIndex * 10 + xIndex;
							if (board[index] != 0) {
								console.log('error');
							} // some intersect with the board
							board[index] = colorMapping[op['type']];
						}

						temp = [];

						for (let y = -2; y < 3; y++) {
							// rows in which the piece might have been
							yIndex = op.y + y;
							yIndex = clearedOffset(rowsCleared, yIndex);
							if (yIndex >= 0) {
								// sanity check
								rowCleared = true;
								for (let x = 0; x < 10; x++) {
									index = yIndex * 10 + x;
									rowCleared = rowCleared && board[index] != 0;
								}
								if (rowCleared) {
									temp.push(yIndex);
								}
							}
						}

						for (let row of temp) {
							if (!rowsCleared.includes(row)) {
								rowsCleared.push(row);
								rowsCleared.sort();
							}
						}
					}
				}

				let outputPages = [inputPages[0]]; // lazily generating output fumen by destructively modifying the input
				outputPages[0]['operation'] = undefined;
				outputPages[0]['_field']['field']['pieces'] = board;

				console.log(encoder.encode(outputPages));
			}
		}
	} else if (args[0] == 'glue') {
		if (args.length == 1 || args[1].includes('help')) {
			console.log(
				'Turning single page fumens with color coded pieces into multipage fumens with a piece on each page'
			);
		} else {
			var fumenCodes = args.slice(1);

			var allPiecesArr = [];
			var allFumens = [];
			var fumenIssues = 0;
			for (let code of fumenCodes) {
				let inputPages = decoder.decode(code);
				for (let pageNum = 0; pageNum < inputPages.length; pageNum++) {
					let field = inputPages[pageNum].field;
					const height = field.str().split('\n').length - 1;
					let emptyField = makeEmptyField(field, height);
					allPiecesArr = [];

					scanField(0, height - 1, field, []);

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
                    
                    if(allPiecesArr.length > 1){
                        // multiple outputs warning
                        console.log(code + " led to " + allPiecesArr.length + " outputs: " + allFumens.join(" "));
                    }
				}
			}
			if (fumenCodes.length > allFumens.length) {
				console.log('Warning: ' + fumenIssues + " fumens couldn't be glued");
			}

			console.log(allFumens.join(' '));
		}
	} else console.log('Unsupported command?');
}
