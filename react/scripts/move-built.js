const fs = require("fs");
const fsExtra = require('fs-extra');
const glob = require("glob");
const path = require("path");

fsExtra.emptyDirSync("../assets/js/");

// moves all generated files to the assets directory in hugo

glob("build/static/js/*.js", {}, function (er, files) {
  files.forEach(file => {
    basename = path.basename(file);
    fs.rename(file, `../assets/js/${basename}`, (err) => {
      if (err) { console.log("move err:",err); }
    })
  })
})
