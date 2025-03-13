const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

const directoryPath = path.join(__dirname, '..', 'src');
const command = 'yarn parcel build --no-optimize && yarn move';

fs.watch(directoryPath, { recursive: true }, (eventType, filename) => {
  if (filename) {
    console.log(`File ${filename} has been changed`);
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${error}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
    });
  }
});

console.log('Watching for changes in the src directory...');
