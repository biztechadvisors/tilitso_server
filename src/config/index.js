const fs = require('fs');
const path = require('path');

const normalizedPath = __dirname;
const data = {};

fs.readdirSync(normalizedPath).forEach(function(file) {
    if (file !== 'index.js') {
        data[file.split('.')[0]] = require(path.join(__dirname, file)).default;
    }
});

module.exports = data;
