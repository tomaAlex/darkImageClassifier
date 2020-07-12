const fs = require('fs');
const { resolve } = require('path');
const { reject } = require('q');
const { Console } = require('console');
const gm = require('gm').subClass({imageMagick: true});
const PNG = require("pngjs").PNG;
let pathToFolder = '/wallpapers';
let pathToImage = '';
let fileNames = new Array();

let promiseImageScore = new Promise((resolve, reject) => {
  getImageScore(resolve, reject);
});

function getImageScore(resolve, reject) {
  console.log('entered this promise....');
  let img = gm(pathToImage);
  //console.log(img);
  // Get the PNG buffer
  img.toBuffer("PNG", (err, buff) => {
    if (err) return reject(err);
    console.log('got buffer...');
    // Get the image size
    img.size((err, size) => {
      if (err) {
        console.log(err);
        return reject(err);
      }
      console.log('got image size...');
      // Parse the PNG buffer
      console.log('got to the buffer');
      let str = new PNG();
      str.end(buff);
      console.log('parsed buffer...');
      // After it's parsed...
      str.on("parsed", buffer => {
        // Get the pixels from the image
        let idx, score = 0, rgb = {r: 0, g: 0, b: 0};

        for (let y = 0; y < size.height; y++)
          for (let x = 0; x < size.width; x++) {
            idx = (size.width * y + x) << 2;
            rgb.r = buffer[idx];
            rgb.g = buffer[idx + 1];
            rgb.b = buffer[idx + 2];
            score += (rgb.r + rgb.g + rgb.b) / 765;
          }
          console.log('one promise finished...');
          return resolve(score / (size.height * size.width));
      });
      str.on("error", e => {
        return reject(e);
      });
    });
  });
}

async function logAllTheScores() {
    for(let i = 0; i < fileNames.length; i++) {
        pathToImage = fileNames[i];
        promiseImageScore
        .then(imageScore => {
          console.log(file + ' has a score of ' + imageScore);
        })
        .catch(e => {
          throw e;
        });
    }
}

// see which images are to be found in the specificd directory
fs.readdir(pathToFolder, function (err, files) {
    if (err) return console.log('Unable to scan directory: ' + err);
    console.log('files in directory:\n');
    files.forEach(function (file) {
        pathToImage = pathToFolder + '/' + file;
        fileNames.push(pathToImage);
        //showImageScore();
        /*
        promiseImageScore
        .then(imageScore => {
          console.log(file + ' has a score of ' + imageScore);
        })
        .catch(e => {
          throw e;
        })
        */
    });
    logAllTheScores();
});