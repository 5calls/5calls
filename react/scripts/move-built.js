const fs = require("fs");
const fsExtra = require("fs-extra");
const { globSync } = require("glob");
const path = require("path");

fsExtra.ensureDir("../static/js/");
fsExtra.ensureDir("../assets/js/");

// remove any existing generated files from this HUGO dir, though in prod it should be clean
var files = globSync("../assets/js/*.{js,js.map}");
files.forEach((file) => {
  console.log(`removing ${file}`)
  fsExtra.removeSync(file);
});

const compiledFilesDir = path.resolve(__dirname, "../dist");
const newFilesDir = path.resolve(__dirname, "../../assets/js");

// moves js files from compiledFilesDir to the assets directory in hugo, they're linked in html on build
files = globSync(`${compiledFilesDir}/*.js`);
console.log('found files:', files)
files.forEach((file, i) => {
  let basename = path.basename(file);
  console.log(`moving ${basename}`)

  // For development only, we rename the files using indices to create a static file name
  // this prevents having to restart the hugo server to pick up the new changes
  const newFileName = process.env.NODE_ENV === 'development' ?  `${newFilesDir}/dev-${i+1}.js` : `${newFilesDir}/${basename}`;

  fs.rename(file, newFileName, (err) => {
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
  fs.rename(file, `${newFilesDir}/${basename}`, (err) => {
    if (err) {
      console.log("js move err:", err);
    }
  });
});

