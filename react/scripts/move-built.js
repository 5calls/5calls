const fs = require("fs");
const fsExtra = require("fs-extra");
const { globSync } = require("glob");
const path = require("path");

fsExtra.ensureDir("../static/js/");
fsExtra.ensureDir("../assets/js/");

// remove any existing generated files from this dir, though in prod it should be clean
globSync("build/static/js/*.{js,js.map}", {}, (_, files) => {
  files.forEach((file) => {
    if (file.endsWith('chunk.js') || file.endsWith('chunk.js.map') || file.startsWith('runtime-main')) {
      fsExtra.removeSync(file);
    }
  })
})

// moves js and map files to the assets directory in hugo
globSync("build/static/js/*.{js,js.map}", {}, (_, files) => {
  files.forEach((file) => {
    let basename = path.basename(file);
    fs.rename(file, `../assets/js/${basename}`, (err) => {
      if (err) {
        console.log("js move err:", err);
      }
    });
  });
});
