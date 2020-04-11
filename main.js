const http = require('http');
const fs = require('fs');
const url = require('url');
const qs = require('querystring');
const template = require('./lib/template');
const path = require('path');
const sanitizeHtml = require('sanitize-html');
const mysql = require('mysql');
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'tae9205',
    database: 'opentutorials'
});
db.connect();

const templateList = template.list;
const templateHTML = template.html;

const app = http.createServer(function (request, response) {
    const _url = request.url;
    const queryData = url.parse(_url, true).query;
    const pathName = url.parse(_url, true).pathname;
    if (pathName === '/') {
        if (queryData.id === undefined) {
            db.query(`SELECT * FROM topic`, function (error, topics) {
                const title = 'Welcome';
                const description = 'Hello, Node.js';
                const list = templateList(topics);
                const html = templateHTML(title, list,
                    `<h2>${title}</h2>
                            <p>${description}</p>`,
                    `<a href="/create">Create</a>`
                );
                response.writeHead(200);
                response.end(html);
            });
        } else {
            db.query(`SELECT * FROM topic`, function (error, topics) {
                if (error) {
                    throw error;
                }
                db.query(`SELECT * FROM topic WHERE id=?`, [queryData.id], function (error2, topic) {
                    if (error2) {
                        throw error2;
                    }
                    const title = topic[0].title;
                    const description = topic[0].description;
                    const list = templateList(topics);
                    const html = templateHTML(title, list,
                        `<h2>${title}</h2>
                        <p>${description}</p>`,
                        `<a href="/create">Create</a> 
                        <a href="/update?id=${queryData.id}">update</a>
                        <form action="delete_process" method="post">
                            <input type="hidden" name="id" value="${queryData.id}">
                            <input type="submit" value="delete">
                        </form>`
                    );
                    response.writeHead(200);
                    response.end(html);
                });
            });
        }
    } else if (pathName === '/create') {
        db.query(`SELECT * FROM topic`, function (error, topics) {
            const title = 'Create';
            const list = templateList(topics);
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
                </form>`
                , '');
            response.writeHead(200);
            response.end(html);
        });
    } else if (pathName === '/create_process') {
        let body = '';
        request.on('data', function (data) {
            body += data;
        });
        request.on('end', function () {
            const post = qs.parse(body);
            const title = post.title;
            const description = post.description;
            db.query(`
                INSERT INTO topic (title, description, created, author_id) 
                VALUES (?, ?, NOW(), ?)`,
                [title, description, 1],
                function (error, result) {
                    if (error) {
                        throw error;
                    }
                    response.writeHead(302, { Location: `/?id=${result.insertId}` });
                    response.end();
                });
        });
    } else if (pathName === '/update') {
        db.query(`SELECT * FROM topic`, function (error, topics) {
            if (error) {
                throw error;
            }
            db.query(`SELECT * FROM topic WHERE id=?`, [queryData.id], function (error2, topic) {
                if (error2) {
                    throw error2;
                }
                const title = topic[0].title;
                const _id = topic[0].id;
                const description = topic[0].description;
                const list = templateList(topics);
                const html = templateHTML(title, list, `
                <form action="/update_process" method="post">
                    <input type="hidden" name="id" value="${_id}">
                    <p>
                        <input type="text" name="title" placeholder="title" value="${title}">
                    </p>
                    <p>
                        <textarea name="description" placeholder="description">${description}</textarea>
                    </p>
                    <p>
                        <input type="submit">
                    </p>
                </form>`
                    , '');
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
            const _id = post.id;
            const title = post.title;
            const description = post.description;
            console.log(post)
            db.query(
                `UPDATE topic SET title=?, description=? WHERE id=?`,
                [title, description, _id],
                function (error, result) {
                    if (error) { throw error; }
                    response.writeHead(302, { Location: `/?id=${_id}` });
                    response.end('success');
                });
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