
var table = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

module.exports = function(l) {
	var length = l || 16;
	var key = '';

	for(var i=0;i < length;i++) {
		var r = Math.floor(Math.random() * table.length) % table.length;
		key += table[r];
	}

	return key;
}