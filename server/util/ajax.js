var https = require('https');
var qs = require('querystring');

module.exports = ajax;

function ajax(url, path, method, params, cb) {
	var qstr = qs.stringify(params);
	var options = {
		hostname: url,
		port: 443,
		method: method,
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	};

	if(method == 'GET') options.path = path + '?' + qstr;
	else options.path = path;

	var req = https.request(options, function(res) {
		//console.log("statusCode: ", res.statusCode);
		//console.log("headers: ", res.headers);

		var content = '';

		res.on('data', function(d) {
			content += d;
		});
		res.on('end', function(d) {
			cb(null, JSON.parse(content));
		});
	});
	if(method == 'POST') req.write(querystring(params));
	req.end();

	req.on('error', function(err) {
		cb(err);
	});
}

function querystring(params) {
	var strs = [];
	for(var key in params) {
		strs.push(key + '=' + params[key]);
	}
	return strs.join('&');
}