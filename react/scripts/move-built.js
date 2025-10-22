const fsExtra = require("fs-extra");
const path = require("path");

const compiledFilesDir = path.resolve(__dirname, "./dist");
const newFilesDir = path.resolve(__dirname, "../../assets/js");

// Since hugo doesn't seem to like files updating their names, for development only we create stable js filenames.
if (process.env.NODE_ENV === "development") {
  const files = fsExtra.readdirSync(compiledFilesDir);
  files.forEach((file, index) => {
    if (path.extname(file) === ".js") {
      const oldPath = path.join(compiledFilesDir, file);
      const newPath = path.join(compiledFilesDir, `index.${index}.js`);
      fsExtra.renameSync(oldPath, newPath);
    }
  });
}

console.log(`Moving built files from ${compiledFilesDir} to ${newFilesDir}`);
fsExtra.moveSync(compiledFilesDir, newFilesDir, { overwrite: true });
