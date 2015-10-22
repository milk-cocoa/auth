var mongodb = require('mongodb');

module.exports = {
	open : function(url, cb) {
		var self = this;
		mongodb.MongoClient.connect(url,
                {
                    db:{
                        retryMiliSeconds:1000,
                        numberOfRetries:3
                    },
                    server:{
                        poolSize:1,
                        auto_reconnect:true,
                        socketOptions:{
                            socketTimeoutMS:10000,
                            keepAlive:1
                        }
                    }
                },
                function(err, db) {
                    if (err) {
                    	cb(err);
                    	return;
                    }
                    self.db = db;
					cb(null, self);
                }
            );
	},
	collection : function(name) {
		return this.db.collection(name);
	}
}
