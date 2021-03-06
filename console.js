var ws_link = "ws://THIS_IS_YOUR_HOST";

var ws = {};
//将浏览器console发送至服务器 
var send_log = function (method, args) {
	ws.send(JSON.stringify({
		method: method,
		args: args
	}));
};
//处理服务器需求
var deal_server_code = function (string) {
	if (URL && Blob) {
		var script = document.createElement("script");
		script.src = URL.createObjectURL(new Blob([string], {
			type: "application/x-javascript"
		}));
		document.body.appendChild(script);
	} else {
		eval(string);
	}
};

var createWS = function () {
	ws = new WebSocket(ws_link, "echo-protocol");
	ws.onopen = function () {
		console.log("WebSocket已经就绪!");
	}
	ws.onmessage = function (msg) {
		deal_server_code(msg.data);
	}
	ws.onclose = function () {
		if (confirm("WebSocket已经关闭,是否重新建立链接?")) {
			createWS();
		}
	}
}

if (WebSocket) {
	createWS();
} else {
	alert("您的浏览器不支持websocket");
}

// Injected Ionic CLI Console Logger
// the code bellow is copied from ionic2 code, thx ionic team!
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