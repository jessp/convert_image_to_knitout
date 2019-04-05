const { createCanvas, loadImage } = require('canvas');
const RgbQuant = require('rgbquant');
let maxWidth = 60;

const fs = require('fs');

let filename = "hoverman-01";
let extension = "png";
let reduceColours = false;
let maxColours = 6;

// Draw cat with lime helmet
loadImage('./images/in/' + filename + '.' +  extension).then((image) => {
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(image, 0, 0);
    // q = new RgbQuant({colors: maxColours, dithSerp: true, dithKern: "FloydSteinberg"});
    q = new RgbQuant({colors: maxColours, method: 2});
    q.sample(canvas);
    pal = q.palette(true);
    out = q.reduce(canvas);


    let newCanvas = drawPixels(out, image.width);
    let newCtx = newCanvas.getContext('2d');
    var data = newCtx.getImageData(0, 0, newCanvas.width, newCanvas.height); //get the pixel values
    
    let uniqueColours = {};
    var pixels = data.data;
    var w = data.width; //data is formatted here in a particular way
    var h = data.height;
    var pixArray = [];
    let index = 0;

    for(var i = 0; i < pixels.length; i +=4) { //we increment by 4 since data is stored sequentially as r, g, b, r, g, b etc.
        if ((index % w) === 0){ //if we reach the end of a row, start a new row
            pixArray.push([]);
        }        
        if (uniqueColours[("" + pixels[i] + "/" + pixels[i + 1] + "/" + pixels[i + 2])]){
            pixArray[pixArray.length-1].push(uniqueColours[("" + pixels[i] + "/" + pixels[i + 1] + "/" + pixels[i + 2])]);
        } else {
            uniqueColours[("" + pixels[i] + "/" + pixels[i + 1] + "/" + pixels[i + 2])] = Object.keys(uniqueColours).length;
            pixArray[pixArray.length-1].push(uniqueColours[("" + pixels[i] + "/" + pixels[i + 1] + "/" + pixels[i + 2])]);
        }
        index++; //go to next pixel in the array
    }

    writeDataFile(JSON.stringify(pixArray));
    writeImgFile(newCanvas.toDataURL());

})

function writeDataFile(in_data){
    fs.writeFile('./data/' + filename + '.js', "module.exports = " + in_data + ";");
}


function writeImgFile(in_data){
    var img = in_data;
    // strip off the data: url prefix to get just the base64-encoded bytes
    var data = img.replace(/^data:image\/\w+;base64,/, "");
    var buf = new Buffer(data, 'base64');
    fs.writeFile('./images/out/' + filename + '.png', buf);
}


//adapted from https://github.com/leeoniya/RgbQuant.js/blob/master/demo/js/helpers.js
function drawPixels(idxi8, width0, width1) {
    var idxi32 = new Uint32Array(idxi8.buffer);

    width1 = width1 || width0;

    var can = createCanvas(1000, 1000),
        can2 = createCanvas(1000, 1000),
        ctx = can.getContext("2d"),
        ctx2 = can2.getContext("2d");

    let proportion = width0/maxWidth/2;
    can.width = width0;
    can.height = Math.ceil(idxi32.length / width0);
    can2.width = width1/2/proportion; //our knitted image needs to be squished to half size so it displays properly
    can2.height = Math.ceil(can.height * width1 / width0)/proportion;

    ctx.imageSmoothingEnabled = ctx.mozImageSmoothingEnabled = ctx.webkitImageSmoothingEnabled = ctx.msImageSmoothingEnabled = false;
    ctx2.imageSmoothingEnabled = ctx2.mozImageSmoothingEnabled = ctx2.webkitImageSmoothingEnabled = ctx2.msImageSmoothingEnabled = false;

    var imgd = ctx.createImageData(can.width, can.height);

    if (typeof(imgd.data) == "CanvasPixelArray") {
        var data = imgd.data;
        for (var i = 0, len = data.length; i < len; ++i)
            data[i] = idxi8[i];
    }
    else {
        var buf32 = new Uint32Array(imgd.data.buffer);
        buf32.set(idxi32);
    }

    ctx.putImageData(imgd, 0, 0);

    //our knitted image needs to be squished to half size so it displays properly
    ctx2.drawImage(can, 0, 0, can2.width, can2.height); 

    return can2;
}