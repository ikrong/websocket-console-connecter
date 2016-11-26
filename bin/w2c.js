#!/usr/bin/env node

var program = require('commander');
var package = require("../package.json");
var w2c = require("../index.js");

program
	.option('-v, --version', '显示版本信息')
	.version(package.version)
	.parse(process.argv)

program
	.command('serve')
	.description('启动websocket服务器')
	.action(function (cmd, options) {
		w2c.w2c();
	})
	.on('--help', function () {
		console.log("启动websocket服务器");
	});

program.parse(process.argv);