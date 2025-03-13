const fs = require("fs");
const fsExtra = require("fs-extra");
const { globSync } = require("glob");
const path = require("path");

fsExtra.ensureDir("../static/js/");
fsExtra.ensureDir("../assets/js/");

// remove any existing generated files from this HUGO dir, though in prod it should be clean
var files = globSync("../assets/js/*.{js,js.map}");
files.forEach((file) => {
  console.log(`file ${file}`)
  if (file.endsWith('chunk.js') || file.endsWith('chunk.js.map') || file.startsWith('../assets/js/runtime-main')) {
    console.log(`removing ${file}`)
    fsExtra.removeSync(file);
  }
});

const compiledFilesDir = path.resolve(__dirname, "../dist");

// moves js files from compiledFilesDirto the assets directory in hugo, they're linked in html on build
files = globSync(`${compiledFilesDir}/*.js`);
console.log('found files:', files)
files.forEach((file) => {
  let basename = path.basename(file);
  console.log(`moving ${basename}`)
  fs.rename(file, `../assets/js/${basename}`, (err) => {
    if (err) {
      console.log("js move err:", err);
    }
  });
});

// moves map files from compiledFilesDir to the assets directory in hugo, they're NOT linked in
files = globSync(`${compiledFilesDir}/*.js.map`);
files.forEach((file) => {
  let basename = path.basename(file);
  console.log(`moving ${basename}`)
  fs.rename(file, `../static/js/${basename}`, (err) => {
    if (err) {
      console.log("js move err:", err);
    }
  });
});

