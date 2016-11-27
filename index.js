var WSServer = require('websocket').server;
var http = require('http');
var url = require('url');
var fs = require('fs');
var readline = require('readline');
var path = require('path');
var os = require("os");
var util = require('util');

function getIP() {
    var interfaces = os.networkInterfaces();
    var ips = [];
    for (var key in interfaces) {
        interfaces[key].map(function(item) {
            if (item.family.toLowerCase() == "ipv4") {
                ips.push(item.address);
            }
        })
    }
    return ips;
}

function w2c(config) {
    if (util.isObject(config) || (config = {})) {
        config.port = config.port || 8102;
    }
    var connection = {};
    //创建readline接口实例
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    var deal_input = function(text) {
        connection.sendUTF(text);
    };

    // question方法
    var waiting_input = function(showdetail) {
        rl.question(showdetail ? "console remote input is ready:\n>" : ">", function(answer) {
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
    rl.on("close", function() {
        // 结束程序
        process.exit(0);
    });

    var server = http.createServer(function(request, response) {
        var urlInfo = url.parse(request.url);
        if (urlInfo.pathname == "/console.js") {
            fs.readFile(__dirname + "/console.js", function(err, data) {
                if (err) {
                    // HTTP 状态码: 404 : NOT FOUND
                    // Content Type: text/plain
                    response.writeHead(404, {
                        'Content-Type': 'text/html'
                    });
                    response.write(err.toString());
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
            response.writeHead(404);
            response.end();
        }
    }).listen(config.port, function() {
        console.log("websocket server is ready");
        console.log("you may use the following link"+"\n");
        getIP().map(function(ip, index) {
            console.log("    " + (index + 1) + ". http://" + ip + ":" + config.port + "/console.js");
        });
    }).on("error", function(e) {
        if (e.code.toLowerCase() == "eaddrinuse") {
            config.port++;
            w2c(config);
        } else {
            console.log("serve start failed");
            process.exit(1);
        };
    })

    wsServer = new WSServer({
        httpServer: server,
        autoAcceptConnections: false
    });

    function originIsAllowed(origin) {
        return true;
    }

    wsServer.on('request', function(request) {
        if (!originIsAllowed(request.origin)) {
            request.reject();
            console.log("connect to your client failed");
            return;
        }

        connection = request.accept('echo-protocol', request.origin);
        console.log("connect to your client success");
        waiting_input(1);
        connection.on('message', function(message) {
            if (message.type === 'utf8') {
                var msg = JSON.parse(message.utf8Data);
                if (msg.args && msg.args.length) {
                    msg.args.map(function(item, index) {
                        console.log((index ? "\t" : ("\n" + msg.method)) + "\t" + JSON.stringify(item));
                    })
                } else {
                    console.log("\n" + msg.method + "\t" + JSON.stringify(msg.args));
                }
            }
        });
        connection.on('close', function(reasonCode, description) {
            console.log("connect to your client closed");
        });
    });
}

module.exports = {
    w2c: w2c
}