const { createCanvas, loadImage } = require('canvas');
const RgbQuant = require('rgbquant');

const fs = require('fs');

 let filename = "38564849301_bc36662ef3_o";
// Draw cat with lime helmet
loadImage('./images/in/' + filename + '.jpg').then((image) => {
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(image, 0, 0);

    q = new RgbQuant({colors: 5, dithSerp: true, boxPxls: 5, dithKern: "FloydSteinberg"});
    q.sample(canvas);
    pal = q.palette(true);
    out = q.reduce(canvas);

    let newCanvas = drawPixels(out, image.width);
    writeFile(newCanvas.toDataURL());

})


function writeFile(in_data){
    var img = in_data;
    // strip off the data: url prefix to get just the base64-encoded bytes
    var data = img.replace(/^data:image\/\w+;base64,/, "");
    var buf = new Buffer(data, 'base64');
    fs.writeFile('./images/out/' + filename + '.png', buf);
}


//https://github.com/leeoniya/RgbQuant.js/blob/master/demo/js/helpers.js
function drawPixels(idxi8, width0, width1) {
    var idxi32 = new Uint32Array(idxi8.buffer);

    width1 = width1 || width0;

    var can = createCanvas(1000, 1000),
        can2 = createCanvas(1000, 1000),
        ctx = can.getContext("2d"),
        ctx2 = can2.getContext("2d");

    can.width = width0;
    can.height = Math.ceil(idxi32.length / width0);
    can2.width = width1;
    can2.height = Math.ceil(can.height * width1 / width0);

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

    ctx2.drawImage(can, 0, 0, can2.width, can2.height);

    return can2;
}