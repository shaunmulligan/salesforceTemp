var rp = require('request-promise');

//salesforce configurations
var config = require('./config.json');

//global variables
var session = {};

//gets access_token to authorise SF requests
exports.auth = function(name, pass, securityToken) {
	console.log(name+" "+pass);
	var options = {
	    uri : 'https://login.salesforce.com/services/oauth2/token',
	    method : 'POST',
	    json: {
		    grant_type: 'password',
		    client_id: config.CLIENT_ID,
		    client_secret: config.CLIENT_SECRET,
		    username: name,
		    password: pass + securityToken
		  },
		resolveWithFullResponse: true
	}; 

	rp(options)
    .then(function(res) {
    	if (res.statusCode == 200) {
    		var json = JSON.parse(res.body);
    		session.token = json.access_token;
			session.instanceUrl = json.instance_url;
			console.log("successfully logged in user");
			return session;
    	}
    })
    .catch(console.error);
}

//logs a new case to Salesforce.com
exports.createCase = function(subject, description) {
	console.log("creating case")
	var options = {
	    uri : session.instanceUrl+'/services/data/v31.0/sobjects/Case',
	    method : 'POST',
		auth: {
		    bearer: session.token
		  },
		json: {
		  	Subject: subject,
		  	Description: description
		  },
		resolveWithFullResponse: true
	}; 

	rp(options)
    .then(function(res) {
    	if (res.statusCode == 200) {
			console.log("successfully logged a case");
			console.log(res.body);
    	}
    })
    .catch(console.error);
}