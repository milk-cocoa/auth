var genkey = require('../util/genkey');
var hat = require('hat');


module.exports = ApiKey;

function ApiKey() {
	this.db = null;
}

ApiKey.prototype.setDb = function(db) {
	this.db = db;
}

function generateKey() {
	var key = hat(128, 36);
	return key;
}

function generateSecret() {
	return genkey(40);
}

ApiKey.prototype.add = function(name, cb) {
	var key = generateKey();
	var secret = generateSecret();
	this.db.collection('apikey').insert({
		_id : key,
		secret : secret,
		name : name
	}, function(err) {
		cb(err);
	});
}

ApiKey.prototype.remove = function(key, cb) {
	this.db.collection('apikey').remove({
		_id : key
	}, function(err) {
		cb(err);
	});
}

ApiKey.prototype.list = function(skip, limit, cb) {
	this.db.collection('apikey').find({}, {}, {skip:skip, limit:limit}).toArray(function(err, docs) {
		var docs2 = docs.map(function(d) {
			return {
				key : d._id,
				secret : d.secret,
				name : d.name
			}
		})
		cb(err, docs2);
	});
}

ApiKey.prototype.auth = function(key, secret, cb) {
	this.db.collection('apikey').findOne({
		_id : key
	}, function(err, doc) {
		console.log(doc);
		if(err) {
			cb(err);
			return;
		}
		if(!doc) {
			cb('failed to loggedin');
			return;
		}
		if(doc.secret == secret) {
			cb(null, doc);
		}else{
			cb('failed to loggedin');
		}
	});

}

