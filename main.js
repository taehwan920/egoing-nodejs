const http = require('http');
const fs = require('fs');
const url = require('url');

const templateHTML = (title, list, body) => {
    return (
        `<!doctype html>
            <html>
                <head>
                    <title>WEB1 - ${title}</title>
                    <meta charset="utf-8">
                </head>
                <body>
                    <h1><a href="/">WEB</a></h1>
                    ${list}
                    ${body}
                </body>
            </html>
        `
    );
};

const templateList = (fileList) => {
    var list = '<ul>';
    for (let i = 0; i < fileList.length; i++) {
        list = list + `<li><a href="/?id=${fileList[i]}">${fileList[i]}</a></li>`
    }
    list = list + '</ul>';
    return list;
};

const app = http.createServer(function (request, response) {
    const _url = request.url;
    const queryData = url.parse(_url, true).query;
    const pathName = url.parse(_url, true).pathname;

    if (pathName === '/') {
        if (queryData.id === undefined) {

            fs.readdir('./data', function (error, fileList) {
                const title = 'Welcome';
                const description = 'Hello, Node.js';

                const list = templateList(fileList);

                const template = templateHTML(title, list,
                    `<h2>${title}</h2>
                    <p>${description}</p>`);

                response.writeHead(200);
                response.end(template);
            })
        } else {
            fs.readdir('./data', function (error, fileList) {
                fs.readFile(`data/${queryData.id}`, 'utf8', function (err, description) {
                    const title = queryData.id;
                    const list = templateList(fileList);
                    const template = templateHTML(title, list,
                        `<h2>${title}</h2>
                        <p>${description}</p>`);

                    response.writeHead(200);
                    response.end(template);
                });
            });
        }
    } else {
        response.writeHead(404);
        response.end('Not Found');
    }
});
app.listen(3000);