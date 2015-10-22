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

var apikey = new ApiKeyService();

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json())
app.use(session({secret: 'authapisecret'}));

/*
管理画面
login
*/
app.post('/auth/apikey/token', function (req, res) {
	var app_id = req.params.app_id;
	var key = req.params.key;
	var secret = req.params.secret
	apikey.auth(app_id, key, secret, function(err, data) {
		if(err) {
			res.json({err:err});
			return;
		}
		token_generator.generate(app_id, data, function(err, token) {
			if(err) {
				res.json({err:err});
				return;
			}
			res.json({err:null, content : token});
		});
	});
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
			res.json({err:err});
			return;
		}
		res.json({err:null, content:content});
	}
}

db.open(process.env.MONGO_URI || process.env.MONGOLAB_URI || 'mongodb://localhost:27017/mlkccaauth', function(err, _db) {
	if(err) throw err;
	store.setDb(db);
	apikey.setDb(db);
	passphraseStore.get(function(err, passphrase) {
		token_generator.setPassphrase(passphrase);
	});
	app.listen(process.env.PORT || 3000);
});


module.exports = app;