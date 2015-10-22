var express = require('express');
var app = express();
var session = require('express-session')
var basicAuth = require('basic-auth-connect');
var bodyParser = require('body-parser');

var db = require('./server/db');
var store = require('./server/util/store');
var permission = require('./server/permission');
var passphraseStore = require('./server/passphrase');
var token_generator = require('./server/token');
var ApiKeyService = require('./server/auth/apikey');
var config = require('./config');

var providers = {
	facebook : require('./server/auth/facebook')
}

var apikey = new ApiKeyService();

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json())
app.use(session({secret: 'authapisecret'}));
app.use(function(req, res, next) {
	var accept = req.headers['accept'] || "application/json";
	var accept2 = accept.split(';').reduce(function(acc, a) {
		return a.split(',').concat(acc);
	}, []);
	req.accept = accept2;
	next(null);
})
/*
管理画面
login
*/
app.get('/auth/apikey/token/:key/:secret', function (req, res) {
	var key = req.param('key');
	var secret = req.param('secret');
	apikey.auth(key, secret, function(err, data) {
		get_token(req, res, err, data.name)
	});
});

function get_token(req, res, err, sub) {
	if(err) {
		response(err);
		return;
	}
	token_generator.generate(sub, response);
	function response(err, token) {
		if(req.accept.indexOf('application/json') >= 0) {
			if(err) {
				res.json({err:err});
				return;
			}
			res.json({err:null, content : {
				token:token
			}});
		}else{
			if(err) {
				res.status(500).send(err);
				return;
			}
			res.send(token);
		}
	}
}

app.get('/auth/:provider/dialog', function (req, res) {
	var provider = req.param('provider');
	providers[provider].dialog(req, res);
});

app.get('/auth/:provider/callback', function (req, res) {
	var provider = req.param('provider');
	providers[provider].callback(req, function(err, sub) {
		if(err) {
			send({
				err : err.message || err
			});
			return;
		}
		token_generator.generate(sub, function(err, token) {
			if(err) {
				send({
					err : err.message || err
				});
				return;
			}
			send({
				err : null,
				content : token
			});
		});
	});
	function send(data) {
		var html = '<script>window.opener.postMessage('+JSON.stringify(data)+', "'+config.origin+'");window.close();</script>';
		res.send(html);
	}
});

app.get('/', function (req, res) {
	res.redirect('/dev');
});

app.all('/dev/*', basicAuth('username', 'password'));

app.get('/dev/passphrase', function (req, res) {
	passphraseStore.get(result(res));
});
app.post('/dev/passphrase', function (req, res) {
	var passphrase = req.param('passphrase');
	passphraseStore.set(passphrase, result(res));
});


app.post('/dev/apikey', function (req, res) {
	var name = req.body.name;
	apikey.add(name, result(res));
});

app.delete('/dev/apikey/:key', function (req, res) {
	var key = req.param('key');
	apikey.remove(key, result(res));
});

app.get('/dev/apikey', function (req, res) {
	var skip = req.body.skip || 0;
	var limit = req.body.limit || 20;
	apikey.list(skip, limit, result(res));
});

app.use('/dev', express.static('public'));

function result(res) {
	return function(err, content) {
		if(err) {
			res.json({err:err.message || err});
			return;
		}
		res.json({err:null, content:content});
	}
}

db.open(process.env.MONGO_URI || process.env.MONGOLAB_URI || 'mongodb://localhost:27017/mlkccaauth', function(err, _db) {
	if(err) throw err;
	store.setDb(db);
	apikey.setDb(db);
	token_generator.setPassphrase(config.passphrase);
	app.listen(process.env.PORT || 3000);
});


module.exports = app;