var http = require('http'),
    https = require('https'),
    config = require('../../config'),
	Seq = require('seq');

var common_key = "c0ca1xl0";

var facebook = {
    app_id : config.facebook.clientID,
    secret_key : config.facebook.clientSecret
}

module.exports.dialog = function(req, res) {
	var redirect_uri = config.url + '/auth/facebook/callback';
	var dialog_url = "http://www.facebook.com/dialog/oauth?client_id="+facebook.app_id+"&redirect_uri="+redirect_uri+"&scope=email";
	res.send("<script> top.location.href='"+dialog_url+"'</script>");
}


module.exports.callback = function(req, cb){
	var code = req.param("code");
	var redirect_uri = config.url + '/auth/facebook/callback';
	base_facebook(code, redirect_uri, function(err, info){
		if(err) {
			cb(err);
			return;
		}
		cb(null, 'facebook|'+info.profile.id)
	});
}


function base_facebook(code, my_url, cb) {
    var token_url = "/oauth/access_token?client_id="
    	+facebook.app_id+"&redirect_uri="+my_url+"&client_secret="+facebook.secret_key+"&code="+code;
    console.log(token_url);
    https.get({
    	  host: 'graph.facebook.com',
    	  port: 443,
    	  path: token_url
    }, function(res2) {
    	var access_token = "";
    	res2.on('data', function(chunk){
    		access_token += chunk;
    	});
    	res2.on('end', function(){
    		console.log();
    		if(access_token.indexOf("error") < 0) {
                var graph_url = "/me?"+access_token;
            	console.log("graph_url", graph_url);
                https.get({
              	  host: 'graph.facebook.com',
              	  port: 443,
              	  path: graph_url
                }, function(res2) {
                	var userinfo = "";
                	res2.on('data', function(chunk){
                		userinfo += chunk;
                	});
                	res2.on('end', function(chunk){
                		cb(null, {
                			profile : JSON.parse(userinfo),
                			access_token : access_token
                		});
                	});
              });
    		}else{

    			cb(new Error( JSON.parse(access_token).error.message ));
    		}
    	});
    });
}
