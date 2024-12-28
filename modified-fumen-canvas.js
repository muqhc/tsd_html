// const { decoder } = require('tetris-fumen');

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

	var canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;

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
	var canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext('2d');
	const encoder = new GIFEncoder();
	encoder.start();
	encoder.setRepeat(0); // 0 for repeat, -1 for no-repeat
	encoder.setDelay(delay); // frame delay in ms
	encoder.setQuality(1); // image quality. 10 is default.
	if (transparent) {
		encoder.setTransparent('rgba(0, 0, 0, 0)');
	}
	for (x = start; x < end; x++) {
		frame = draw(fumenPages[x], tilesize, numrows, transparent).getContext('2d');
		encoder.addFrame(frame);
	}
	encoder.finish();
	// encoder.download('download.gif');
	return encoder;
}

cellSize = 4;
height = undefined;
transparency_four = true;
delay = 500;
max_col = 10;

start = 0;
end = undefined;

function fumencanvas() {
	var container = document.getElementById('container');
	while (container.firstChild) {
		container.removeChild(container.firstChild);
	}

	var fumenCodes = [];
	results = [];
	input = document.getElementById('input').value;
	for (let rawInput of input.split('\t')) {
		fumenCodes.push(...rawInput.split(/\s/));
	}

    for (let code of fumenCodes) {
        try {
            var pages = decoder.decode(code);
            if (pages.length == 1) {
                canvas = draw(pages[0], cellSize, height, transparency_four);

                // documentCanvas = document.createElement('canvas');
                // documentCanvas.style.padding = '18px';
                // container.appendChild(documentCanvas);

                // var ctx = documentCanvas.getContext('2d');
                // documentCanvas.height = canvas.height;
                // documentCanvas.width = canvas.width;

                // results.push(canvas);

                // ctx.drawImage(canvas, 0, 0);

                // documentCanvas.style.border = '5px solid #555';

                var data_url = canvas.toDataURL();
                var img = document.createElement('img');
                img.style.padding = '8px';
                img.src = data_url;
                
                img.style.margin = '1px';
                img.style.outline = '2px solid #555';

                container.appendChild(img);
                results.push(canvas);


            }
            if (pages.length > 1) {
                gif = drawFumens(pages, cellSize, height, start, end, transparency_four);

                var binary_gif = gif.stream().getData(); //notice this is different from the as3gif package!
                var data_url = 'data:image/gif;base64,' + encode64(binary_gif);
                var img = document.createElement('img');
                img.style.padding = '8px';
                img.src = data_url;

                img.style.margin = '1px'
                img.style.outline = '2px solid #555';

                container.appendChild(img);
                results.push(gif);
            }
        } catch (error) { console.log(code, error); }
	}
}

function fumencanvas_single(input,cellSize=12) {

	var fumenCodes = input;
	results = [];

    for (let code of fumenCodes) {
        try {
            var pages = decoder.decode(code);
            if (pages.length == 1) {
                canvas = draw(pages[0], cellSize, height, transparency_four);

                // documentCanvas = document.createElement('canvas');
                // documentCanvas.style.padding = '18px';
                // container.appendChild(documentCanvas);

                // var ctx = documentCanvas.getContext('2d');
                // documentCanvas.height = canvas.height;
                // documentCanvas.width = canvas.width;

                // results.push(canvas);

                // ctx.drawImage(canvas, 0, 0);

                // documentCanvas.style.border = '5px solid #555';

                var data_url = canvas.toDataURL();
                var img = document.createElement('img');
                // img.style.padding = '8px';
                img.src = data_url;
                
                img.style.margin = '1px';
                // img.style.outline = '2px solid #555';

                results.push(img);


            }
            if (pages.length > 1) {
                gif = drawFumens(pages, cellSize, height, start, end, transparency_four);

                var binary_gif = gif.stream().getData(); //notice this is different from the as3gif package!
                var data_url = 'data:image/gif;base64,' + encode64(binary_gif);
                var img = document.createElement('img');
                // img.style.padding = '8px';
                img.src = data_url;

                img.style.margin = '1px'
                // img.style.outline = '2px solid #555';

                results.push(img);
            }
        } catch (error) { console.log(code, error); }
	}

	return results
}
