const fs = require('fs');
let file = 'hoverman-01';
const data = require('./data/' + file + ".js");
let nylonYarn = "6";

doKnit();

function doKnit(){
	let kCode = "";
	let maxWidth = data[0].length - 1;



	kCode += setup();
	kCode += doCastOn("1", 0, maxWidth, maxWidth + 2);//we'll do our set up with carrier one, since it's the first colour used

	let carrierIndices = getFirstAndLastInstances(data);

	let isReversed = false;
	for (var r = 0; r < data.length; r++){

		if (i % Object.keys(carrierIndices).length === 0 && i > 0){
			isReversed = !isReversed;
		}


		for (var i = 0; i < Object.keys(carrierIndices).length; i++){	

			let carIndex = isReversed ? (Object.keys(carrierIndices).length - i - 1) : i;
			let theCarrier = Object.keys(carrierIndices)[carIndex];	

			if (Object.values(carrierIndices)[carIndex][0] == r && theCarrier !== "1"){
				let theCarrier = Object.keys(carrierIndices)[carIndex];
				kCode += ("inhook " + theCarrier + "\n");
				if (r % 2 === 0){
					kCode += ("miss - f" + (maxWidth + 1) + " " + theCarrier + "\n");
				} else {
					kCode += ("miss + f" + (-1) + " " + theCarrier + "\n");
				}
			}

			//every other row, change direction so we knit back and forth
			if (r % 2 == 0) {
				//we end on the right side (i.e., going in + direction), so we start by going towards the left (-))
				for (let n = maxWidth; n >= 0; --n) {
					if (data[r][n] == theCarrier){
						kCode += ("knit - f" + n + " " + data[r][n] + "\n");
					}
				}
			} else {
				for (let n = 0; n <= maxWidth; ++n) {
					if (data[r][n] == theCarrier){
						kCode += ("knit + f" + n + " " + data[r][n] + "\n");
					}
				}
			}

			//if we're using the carrier, and there are more than one carriers used on this line
			//and there's a next line
			if (data[r].includes(parseInt(theCarrier)) && [...new Set(data[r])].length > 1 && 
				data[r+1]){

				//find out where the next row and index of this carrier is
				let nextRowAndIndexOfCarr = findNextUseOfThisCarrier(theCarrier, r, data);
				if (nextRowAndIndexOfCarr !== null){
					let isContinuationOfThisThread = false;
					//check to see if this row and the next row start/end on the given carrier
					if (nextRowAndIndexOfCarr[1] === (r + 1)){
						if (r % 2 === 0){
							if (data[r][0] == theCarrier && nextRowAndIndexOfCarr[0] == 0){
								isContinuationOfThisThread = true;
							}
						} else {
							if (data[r][maxWidth-1] == theCarrier && nextRowAndIndexOfCarr[0] == (maxWidth-1)){
								isContinuationOfThisThread = true;
							}
						}
					}
					if (!isContinuationOfThisThread){
						let lastIndex = data[r].lastIndexOf(parseInt(theCarrier));
						if (lastIndex > maxWidth/2){
							kCode += ("miss + f" + (maxWidth + 1) + " " + theCarrier + "\n");
						} else {
							kCode += ("miss - f" + (-1) + " " + theCarrier + "\n");
						}
					}
				}
			}

			//release hook at the end of the line they're introduced on
			if (carrierIndices[theCarrier][0] === r && theCarrier !== "1"){
				kCode += ("releasehook " + theCarrier + "\n");
			}

			//outhook once threads are no longer used, but we treat the last colour used specially
			if (r !== (data.length - 1)){
				if (carrierIndices[theCarrier][1] == r){
					kCode += doCastOff(theCarrier);
				}
			}



		}

	}
	let lastUsedCarrier = data[data.length-1][data[(data.length-1)].length - 1];
	kCode += bindOff(lastUsedCarrier, data.length % 2 === 0, 0, maxWidth);
	kCode += knitLastTwoStitches(lastUsedCarrier, data.length % 2 === 0, 0, maxWidth);
	kCode += doCastOff(lastUsedCarrier);
	writeFile(kCode);
}

function findNextUseOfThisCarrier(carr, currentRow, data){
	for (var r = currentRow + 1; r < data.length; r++){
		let idx = data[r].findIndex((e) => e === parseInt(carr));
		if (idx !== -1){
			return [idx, r];
			break;
		}
	}
	return null;
}

//knit the last two stitches a bunch so we can unravel and knot them
function knitLastTwoStitches(carrier, direction, min, max){
	let code = "";
	for (let rows = direction; rows < 8; rows++) {
		if (direction) {
			code += ("knit + f" + min + " " + carrier + "\n");
			code += ("knit + f" + (min + 1) + " " + carrier + "\n");
			code += ("knit - f" + (min + 1) + " " + carrier + "\n");
			code += ("knit - f" + (min) + " " + carrier + "\n");
		} else {
			code += ("knit - f" + max + " " + carrier + "\n");
			code += ("knit - f" + (max - 1) + " " + carrier + "\n");
			code += ("knit + f" + (max - 1) + " " + carrier + "\n");
			code += ("knit + f" + max + " " + carrier + "\n");
		}
	}
	return code;
}

function bindOff(carrier, direction, min, max){
	let code = "";
	if (direction){
		for (let n = max; n >= (min + 2); --n) {
			code += ("knit - f" + n + " " + carrier + "\n");
			code += ("xfer f" + n + " b" + n + "\n");
			code += ("rack -1" + "\n");
			code += ("xfer b" + n + " f" + (n - 1) + "\n");
			code += ("rack 0" + "\n");
		}
		code += ("knit - f" + (min + 1) + " " + carrier + "\n");
		code += ("knit - f" + min + " " + carrier + "\n");
	} else {
		for (let n = min; n <= (max - 2); ++n) {
			code += ("knit + f" + n + " " + carrier + "\n");
			code += ("xfer f" + n + " b" + n + "\n");
			code += ("rack 1" + "\n");
			code += ("xfer b" + n + " f" + (n + 1) + "\n");
			code += ("rack 0" + "\n");
		}
		code += ("knit + f" + (max - 1) + " " + carrier + "\n");
		code += ("knit + f" + max + " " + carrier + "\n");
	}

	return code;
}

function getFirstAndLastInstances(data){
	//object to keep track of the first and last row the colour occurs in
	let carriers = {};
	for (var row = 0; row < data.length; row++){
		for (var col = 0; col < data[row].length-1; col++){
			//if the given carrier has already been introduced, update the last row index
			if (carriers[data[row][col]]){
				carriers[data[row][col]][1] = row;
			} else {
				carriers[data[row][col]] = [row, row];
			}
		}
	}
	return carriers;
}


function writeFile(code){
	//write to file
	fs.writeFile("./../knitout-backend-swg/examples/in/colours_" + file + ".knitout", code, function(err) {
	    if(err) {
	        return console.log(err);
	    }

	    console.log("The file was saved!");
	}); 
}

function setup(){
	let code = "";
	code += (";!knitout-2" + "\n");
	code += (";;Carriers: 1 2 3 4 5 6 7 8 9 10" + "\n");
	return code;
}



//alternate tucks cast on with knitting with waste yarn and nylon
function doCastOn(carrier, min, max, overallMax){
	let code = "";
	code += ("inhook " + carrier + "\n");

	//cast-on on the front bed first...
	for (let n = max; n >= min; --n) {
		if ((max-n) % 2 == 0) {
			code += ("tuck - f" + n + " " + carrier + "\n");
		}
	}
	for (let n = min; n <= max; ++n) {
		if ((max-n)%  2 == 1) {
			code += ("tuck + f" + n + " " + carrier + "\n");
		}
	}

	code += ("releasehook " + carrier + "\n");

	//knit waste yarn rows
	code += knitPlainStitches(carrier, 12, min, max, false);
	code += ("outhook " + carrier + "\n");

	//knit with the nylon
	code += ("inhook " + nylonYarn + "\n");
	code += knitPlainStitches(nylonYarn, 4, min, max, true);
	code += ("outhook " + nylonYarn + "\n");

	code += ("inhook " + carrier + "\n");
	code += ("miss - f" + overallMax + " " + carrier + "\n");


	for (let n = max; n >= min; --n) {
		if ((max-n) % 2 == 0) {
			code += ("knit - f" + n + " " + carrier + "\n");
		}
	}
	code += ("releasehook " + carrier + "\n");

	for (let n = min; n <= max; ++n) {
		code += ("knit + f" + n + " " + carrier + "\n");
	}

	return code;
}

function doCastOff(carrier){
	let code = "";
	code += ("outhook " + carrier + "\n");
	return code;
}

function knitPlainStitches(carrier, rows, min, max, doRelease){
	let code = "";
	//knit some rows with wasteYarn;
	for (var i = 0; i < rows; i++){
		if (i % 2 == 0) {
			for (let n = max; n >= min; --n) {
				//remember we're knitting on every other needle
				code += ("knit - f" + n + " " + carrier + "\n");
			}
		} else {
			for (let n = min; n <= max; ++n) {
				code += ("knit + f" + n + " " + carrier + "\n");
			}
		}

		if (doRelease && i === 0){
			code += ("releasehook " + carrier + "\n");
		}
	}
	return code;
}