const fs = require("fs");
const fsExtra = require("fs-extra");
const glob = require("glob");
const path = require("path");

fsExtra.emptyDirSync("../assets/js/");
// if we have other static js in the future we're going to need to selectively delete here
fsExtra.emptyDirSync("../static/js/");

// moves generated js files to the assets directory in hugo
glob("build/static/js/*.js", {}, function (er, files) {
  files.forEach((file) => {
    let basename = path.basename(file);
    fs.rename(file, `../assets/js/${basename}`, (err) => {
      if (err) {
        console.log("move err:", err);
      }
    });
  });
});

// move js.map files to static so they get published, but not processed
glob("build/static/js/*.js.map", {}, function (er, files) {
  files.forEach((file) => {
    let basename = path.basename(file);
    fs.rename(file, `../static/js/${basename}`, (err) => {
      if (err) {
        console.log("map move err:", err);
      }
    });
  });
});
