var WSServer = require('websocket').server;
var http = require('http');
var url = require('url');
var fs = require('fs');
var readline = require('readline');

//创建readline接口实例
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

var deal_input = function () {};

// question方法
var waiting_input = function (showdetail) {
    rl.question(showdetail ? "请输入调试信息:>>" : ">>", function (answer) {
        if (answer.trim()) {
            switch (answer.trim()) {
                case "quit":
                    rl.close();
                    break;
                case "q":
                    rl.close();
                    break;
                default:
                    deal_input(answer.trim());
                    waiting_input();
            }
        } else {
            waiting_input();
        }
    });
}

// close事件监听
rl.on("close", function () {
    // 结束程序
    process.exit(0);
});

var server = http.createServer(function (request, response) {
    console.log(request);
    console.log(url.parse(request.url));
    var urlInfo = url.parse(request.url);
    if (urlInfo.pathname == "/console.js") {
        fs.readFile("console.js", function (err, data) {
            if (err) {
                console.log(err);
                // HTTP 状态码: 404 : NOT FOUND
                // Content Type: text/plain
                response.writeHead(404, {
                    'Content-Type': 'text/html'
                });
            } else {
                // HTTP 状态码: 200 : OK
                // Content Type: text/plain
                response.writeHead(200, {
                    'Content-Type': 'application/x-javascript'
                });
                var body = data.toString().replace(/THIS_IS_YOUR_HOST/g, request.headers.host);
                // 响应文件内容
                response.write(body);
            }
            //  发送响应数据
            response.end();
        });
    } else {
        console.log((new Date()) + ' Received request for ' + request.url);
        response.writeHead(404);
        response.end();
    }
});
server.listen(8080, function () {
    console.log((new Date()) + ' Server is listening on port 8080');
});

wsServer = new WSServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
    // put logic here to detect whether the specified origin is allowed.
    return true;
}

wsServer.on('request', function (request) {
    if (!originIsAllowed(request.origin)) {
        // Make sure we only accept requests from an allowed origin
        request.reject();
        console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
        return;
    }

    var connection = request.accept('echo-protocol', request.origin);
    console.log((new Date()) + ' Connection accepted.');
    deal_input = function (text) {
        connection.sendUTF(text);
    }
    waiting_input(1);
    connection.on('message', function (message) {
        if (message.type === 'utf8') {
            var msg = JSON.parse(message.utf8Data);
            if (msg.args && msg.args.length) {
                msg.args.map(function (item, key) {
                    console.log("\n" + msg.method + "\t" + JSON.stringify(item));
                })
            } else {
                console.log("\n" + msg.method + "\t" + JSON.stringify(msg.args));
            }
        } else if (message.type === 'binary') {
            console.log("binary file isn't support!");
        }
    });
    connection.on('close', function (reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});