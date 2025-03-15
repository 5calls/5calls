const fsExtra = require("fs-extra");
const path = require("path");

const compiledFilesDir = path.resolve(__dirname, "../dist");
const newFilesDir = path.resolve(__dirname, "../../assets/js");

fsExtra.moveSync(compiledFilesDir, newFilesDir, { overwrite: true });
