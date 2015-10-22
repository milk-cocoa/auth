(function(){
	window.MilkCocoaAuth = {
		url : '',
		authWithFacebook : function(cb) {
			transport_window(this.url + '/auth/facebook/dialog', cb);
		}
	}

	function transport_window(url, cb) {
		var window_features = {
		    'menubar'    : 1,
		    'location'   : 0,
		    'resizable'  : 0,
		    'scrollbars' : 1,
		    'status'     : 0,
		    'dialog'     : 1,
		    'width'      : 700,
		    'height'     : 375
		};

	  	var child = window.open(url, "Login", window_features);

	  	addListener(child, 'unload', function() {
	  	});
			
	  	addListener(window, 'message', function(e) {
	  		//get Json Web Token
	  		cb(e.data.err, e.data.content);
	  	});
	}
	function addListener(w, event, cb) {
		if (w['attachEvent']) w['attachEvent']('on' + event, cb);
		else if (w['addEventListener']) w['addEventListener'](event, cb, false);
	}
}())