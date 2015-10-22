var jwt = require('jsonwebtoken');

module.exports = {
	passphrase : null,
	setPassphrase : function(passphrase) {
		this.passphrase = passphrase;
	},
	generate : function(data, cb) {
		var token = jwt.sign({
			sub : data,
			iss : process.env.HOST || 'localhost',
			aud : 'mlkcca.com'
		}, this.passphrase, {expiresIn : 30 * 60});
		cb(null, token);
	}
}