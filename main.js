let http = require('http');
let fs = require('fs');
let url = require('url');

let app = http.createServer(function (request, response) {
    let _url = request.url;
    let queryData = url.parse(_url, true).query;
    let pathName = url.parse(_url, true).pathname;


    if (pathName === '/') {
        if (queryData.id === undefined) {

            fs.readdir('./data', function (error, fileList) {
                console.log(fileList);
                const title = 'welcome';
                const description = 'Hello, Node.js';

                var list = '<ul>';

                for (let i = 0; i < fileList.length; i++) {
                    list = list + `<li><a href="/?id=${fileList[i]}">${fileList[i]}</a></li>`
                }

                list = list + '</ul>'

                const template = `
                    <!doctype html>
                        <html>
                            <head>
                                <title>WEB1 - ${title}</title>
                                <meta charset="utf-8">
                            </head>
                            <body>
                                <h1><a href="/">WEB</a></h1>
                                ${list}
                                <h2>${title}</h2>
                                <p>${description}</p>
                            </body>
                        </html>
                `;
                response.writeHead(200);
                response.end(template);
            })
        } else {
            fs.readdir('./data', function (error, fileList) {
                var list = '<ul>';

                for (let i = 0; i < fileList.length; i++) {
                    list = list + `<li><a href="/?id=${fileList[i]}">${fileList[i]}</a></li>`
                }

                list = list + '</ul>'


                fs.readFile(`data/${queryData.id}`, 'utf8', function (err, description) {
                    let title = queryData.id;
                    let template = `
                        <!doctype html>
                            <html>
                                <head>
                                    <title>WEB1 - ${title}</title>
                                    <meta charset="utf-8">
                                </head>
                                <body>
                                    <h1><a href="/">WEB</a></h1>
                                    ${list}
                                    <h2>${title}</h2>
                                    <p>${description}</p>
                                </body>
                            </html>
                        `;
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