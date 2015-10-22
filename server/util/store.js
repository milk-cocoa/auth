module.exports = {
	db : null,
	setDb : function(db) {
		this.db = db;
	},
	set : function(key, val, cb) {
		this.db.collection('kvs').update({_id : key}, {$set:{value:val}}, {upsert:true},cb);
	},
	get : function(key, cb) {
		this.db.collection('kvs').findOne({_id : key}, function(err, doc) {
			if(err) return cb(err);
			if(!doc) return cb(null);
			cb(null, doc.value);
		});
	}	
}

