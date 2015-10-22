var store = require('./util/store');

module.exports = {
	set : function(data, cb) {
		store.set("passphrase", data, cb);
	},
	get : function(cb) {
		store.get("passphrase", cb);
	}
}
