const fs = require('fs');
const { resolve } = require('path');
const { reject } = require('q');
const { Console } = require('console');
const gm = require('gm').subClass({imageMagick: true});
const PNG = require("pngjs").PNG;
let pathToFolder = '/home/eugen/Pictures/wallpapers1';
let pathToImage = '';
let fileNames = new Array();
let files; // save files from given directory in global variable
           // so that promises can execute after `readdir` method

function promiseImageScore() {
  return new Promise((resolve, reject) => {
    getImageScore(resolve, reject);
  }); 
}

function prmoiseSavingFileNames() {
  return new Promise((resolve, reject) => {
    addFileNames(resolve, reject);
  });
}

function promiseReadingDir() {
  return new Promise((resolve, reject) => {
    readDir(resolve, reject);
  });
}

function getImageScore(resolve, reject) {
  let img = gm(pathToImage);
  // Get the PNG buffer
  img.toBuffer("PNG", (err, buff) => {
    if (err) return reject(err);
    // Get the image size
    img.size((err, size) => {
      if (err) {
        console.log(err);
        return reject(err);
      }
      // Parse the PNG buffer
      let str = new PNG();
      str.end(buff);
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
          return resolve(score / (size.height * size.width));
      });
      str.on("error", e => {
        return reject(e);
      });
    });
  });
}

function logAllTheScores() {
    for(let i = 0; i < fileNames.length; i++) {
        pathToImage = fileNames[i];
        let localPathToImage = pathToImage;
        promiseImageScore()
        .then(imageScore => {
          console.log(localPathToImage + ' has a score of ' + imageScore);
        })
        .catch(e => {
          throw e;
        });
    }
}

function addFileNames(resolve, reject) {
  files.forEach(file => {
    pathToImage = pathToFolder + '/' + file;
    fileNames.push(pathToImage);
    if(files.length == fileNames.length) {
      resolve();
      return;
    }
  });
}

function readDir(resolve, reject) {
  // see which images are to be found in the specificd directory
  fs.readdir(pathToFolder, (err, Files) => {
      if (err) return reject('Unable to scan directory: ' + err);
      files = Files;
      if(files) resolve();
      else reject(new Error('could not load files from the given directory path...'));
  });
}

promiseReadingDir()
.then(() => {
  console.log('finished reading dir files...');
  prmoiseSavingFileNames()
  .then(() => {
    console.log('saved all the file names!');
    logAllTheScores();
  })
  .catch(err => {
    throw err;
  });
})
.catch(err => {
  throw err;
});