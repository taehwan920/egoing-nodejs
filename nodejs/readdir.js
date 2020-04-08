const testFolder = './data';
const fs = require('fs');

fs.readdir(testFolder, (err, fileList) => {
    console.log(fileList)
})