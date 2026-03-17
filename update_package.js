// Add a start script to package.json
const fs = require('fs');
const packageJsonParams = require('./server/package.json');
packageJsonParams.scripts.start = "node server.js";
packageJsonParams.scripts.dev = "nodemon server.js";
fs.writeFileSync('./server/package.json', JSON.stringify(packageJsonParams, null, 2));
