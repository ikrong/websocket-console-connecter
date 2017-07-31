#!/usr/bin/env node

var program = require('commander');
var package = require("../package.json");
var w2c = require("../index.js");

program
    .version(package.version)
    .option('-v, --version', 'output the version number')

program
    .command('serve')
    .description('start a websocket server')
    .option("-p, --port [port]", "use a custom port")
    .action(function(cmd, options) {
        var config = {};
        config.port = cmd.port || '';
        w2c.w2c(config);
    });

program.parse(process.argv);