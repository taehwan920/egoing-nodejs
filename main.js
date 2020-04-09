const http = require('http');
const fs = require('fs');
const url = require('url');
const qs = require('querystring');
const template = require('./lib/template');
const path = require('path');


const templateList = template.list;
const templateHTML = template.html;

const app = http.createServer(function (request, response) {
    const _url = request.url;
    const queryData = url.parse(_url, true).query;
    const pathName = url.parse(_url, true).pathname;
    if (pathName === '/') {
        if (queryData.id === undefined) {

            fs.readdir('./data', function (error, fileList) {
                const title = 'Welcome';
                const list = templateList(fileList);
                const description = 'Hello, Node.js';
                const template = templateHTML(title, list,
                    `<h2>${title}</h2>
                    <p>${description}</p>`,
                    `<a href="/create">Create</a>`
                );

                response.writeHead(200);
                response.end(template);
            })
        } else {
            fs.readdir('./data', function (error, fileList) {
                const filteredId = path.parse(queryData.id).base;
                fs.readFile(`data/${filteredId}`, 'utf8', function (err, description) {
                    const title = queryData.id;
                    const list = templateList(fileList);
                    const html = templateHTML(title, list,
                        `<h2>${title}</h2>
                        <p>${description}</p>`,
                        `<a href="/create">Create</a> 
                         <a href="/update?id=${title}">update</a>
                         <form action="delete_process" method="post">
                            <input type="hidden" name="id" value="${title}">
                            <input type="submit" value="delete">
                         </form>`
                    );

                    response.writeHead(200);
                    response.end(html);
                });
            });
        }
    } else if (pathName === '/create') {
        fs.readdir('./data', function (error, fileList) {
            const title = 'Web - create';
            const list = templateList(fileList);
            const html = templateHTML(title, list, `
                <form action="/create_process" method="post">
                    <p>
                        <input type="text" name="title" placeholder="title">
                    </p>
                    <p>
                        <textarea name="description" placeholder="description"></textarea>
                    </p>
                    <p>
                        <input type="submit">
                    </p>
                </form>
                `, '');
            response.writeHead(200);
            response.end(html);
        })
    } else if (pathName === '/create_process') {
        let body = '';
        request.on('data', function (data) {
            body += data;
        });
        request.on('end', function () {
            const post = qs.parse(body);
            const title = post.title;
            const description = post.description;
            fs.writeFile(`data/${title}`, description, 'utf8', (err) => {
                response.writeHead(302, { Location: `/?id=${title}` });
                response.end('success');
            });
        });
    } else if (pathName === '/update') {
        fs.readdir('./data', function (error, fileList) {
            const filteredId = path.parse(queryData.id).base;
            fs.readFile(`data/${filteredId}`, 'utf8', function (err, description) {
                const title = queryData.id;
                const list = templateList(fileList);
                const html = templateHTML(title, list,
                    `
                    <form action="/update_process" method="post">
                        <input type="hidden" name="id" value="${title}">
                        <p>
                            <input type="text" name="title" placeholder="title" value="${title}">
                        </p>
                        <p>
                            <textarea name="description" placeholder="description">${description}</textarea>
                        </p>
                        <p>
                            <input type="submit">
                        </p>
                    </form>
                    `,
                    `<a href="/create">Create</a> <a href="/update?id=${title}">update</a>`
                );

                response.writeHead(200);
                response.end(html);
            });
        });
    } else if (pathName === '/update_process') {
        let body = '';
        request.on('data', function (data) {
            body += data;
        });
        request.on('end', function () {
            const post = qs.parse(body);
            const id = post.id;
            const title = post.title;
            const description = post.description;
            fs.rename(`data/${id}`, `data/${title}`, function (error) {
                fs.writeFile(`data/${title}`, description, 'utf8', (err) => {
                    response.writeHead(302, { Location: `/?id=${title}` });
                    response.end('success');
                });
            })
        });
    } else if (pathName === '/delete_process') {
        let body = '';
        request.on('data', function (data) {
            body += data;
        });
        request.on('end', function () {
            const post = qs.parse(body);
            const id = post.id;
            const filteredId = path.parse(id).base;
            fs.unlink(`data/${filteredId}`, function (error) {
                response.writeHead(302, { Location: `/` });
                response.end('success');
            })
        });
    } else {
        response.writeHead(404);
        response.end('Not Found');
    }
});
app.listen(3000);