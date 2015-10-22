var jwt = require('jsonwebtoken');

module.exports = {
	passphrase : null,
	setPassphrase : function(passphrase) {
		this.passphrase = passphrase;
	},
	generate : function(app_id, data, cb) {
		this.passphrase.get_passphrase(app_id, function(err, passphrase) {
			if(err) {
				cb(err);
				return;
			}
			var token = jwt.sign(data, passphrase, {expiresInMinutes : 30});
			cb(null, token);
		});
	}
}