var ws_link = "ws://THIS_IS_YOUR_HOST";

//将浏览器console发送至服务器
var send_log = function () { };
//处理服务器需求
var deal_server_code = function (string) {
	eval(JSON.parse(string));
};

var ws;
if (WebSocket) {
	ws = new WebSocket(ws_link, "echo-protocol");
	ws.onopen = function () {
		send_log = function (method, args) {
			ws.send(JSON.stringify({
				method: method,
				args: args
			}))
		}
	}
	ws.onmessage = function (msg) {
		try {
			var result = eval(msg.data);
			send_log("log", [result]);
		} catch (e) {
			send_log("error", [e]);
		}
	}
}

// Injected Ionic CLI Console Logger
(function () {
	var methods = "assert clear count debug dir dirxml error exception group groupCollapsed groupEnd info log markTimeline profile profileEnd table time timeEnd timeStamp trace warn".split(" ");
	var console = (window.console = window.console || {});
	var logCount = 0;
	window.onerror = function (msg, url, line) {
		if (msg && url) console.error(msg, url, (line ? "Line: " + line : ""));
	};
	function sendConsoleLog(method, args) {
		try {
			send_log(method, args)
			// var xhr = new XMLHttpRequest();
			// xhr.open("POST", "/__ionic-cli/console", true);
			// xhr.send(JSON.stringify({ index: logCount, method: method, ts: Date.now(), args: args }));
			// logCount++;
		} catch (e) { }
	}
	for (var x = 0; x < methods.length; x++) {
		(function (m) {
			var orgConsole = console[m];
			console[m] = function () {
				try {
					sendConsoleLog(m, Array.prototype.slice.call(arguments));
					if (orgConsole) orgConsole.apply(console, arguments);
				} catch (e) { }
			};
		})(methods[x]);
	}
} ());