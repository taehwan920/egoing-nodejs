module.exports = {
    html: (title, list, body, control) => {
        return (
            `<!doctype html>
                <html>
                    <head>
                        <title>WEB2 - ${title}</title>
                        <meta charset="utf-8">
                    </head>
                    <body>
                        <h1><a href="/">WEB</a></h1>
                        ${list}
                        ${control}
                        ${body}
                    </body>
                </html>
            `
        );
    },
    list: (fileList) => {
        var list = '<ul>';
        for (let i = 0; i < fileList.length; i++) {
            list = list + `<li><a href="/?id=${fileList[i]}">${fileList[i]}</a></li>`
        }
        list = list + '</ul>';
        return list;
    }
};