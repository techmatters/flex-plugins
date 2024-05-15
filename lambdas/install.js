const fs = require('fs');
const path = require('path');
const exec = require('child_process').exec;

const functionsDir = './functions';

fs.readdir(functionsDir, (err, files) => {
  if (err) {
    console.error(`Error reading directory ${functionsDir}: ${err}`);
    process.exit(1);
  }

  files.forEach(file => {
    const fullPath = path.join(functionsDir, file);
    fs.stat(fullPath, (err, stats) => {
      if (err) {
        console.error(`Error reading file ${fullPath}: ${err}`);
        return;
      }

      if (stats.isDirectory()) {
        exec('npm ci', { cwd: fullPath }, (err, stdout, stderr) => {
          if (err) {
            console.error(`Error running npm ci in ${fullPath}: ${err}`);
            return;
          }

          console.log(`npm ci completed in ${fullPath}`);
        });
      }
    });
  });
});
