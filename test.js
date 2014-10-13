var request = require('request');

var session = {};

var foo = function(callback) {
	var options = {
	    uri : 'https://login.salesforce.com/services/oauth2/token',
	    method : 'POST',
	    form: {
		grant_type: 'password',
		client_id: '3MVG9A_f29uWoVQsKTBff66qh17JXoxa18rfZoiIv0.eNvAAKSgEh9gQrn3zDwASRsonzaXdF2H5HnSOFdS5Z',
		client_secret: '60535820786208582',
		username: 'shaun.r.mulligan@gmail.com',
		password: 'resinDF143A8BA3qFs6RYwrXLbWDBo8ty'
		},
		resolveWithFullResponse: true
	}; 

	request(options, function (error, res, body) {
		if (error) {
			return console.error(error);
		}
		if (res.statusCode == 200) {
			console.log('success')
			var json = JSON.parse(body);
			session.token = json.access_token;
			session.instanceUrl = json.instance_url;
			console.log("successfully logged in user");
			callback();
			return session;
		}
	})
}

createCase = function(subject, description) {
	console.log("creating case")
	console.log(session);
	var test = {
	    uri : session.instanceUrl+'/services/data/v31.0/sobjects/Case',
		headers: {
		    Authorization: 'Bearer ' + session.token,
		 'Content-Type': 'application/json'
		  },
		json: {
		  	Subject: subject,
		  	Description: description
		  }
	}; 
	request(test, function (error, res, body) {
		if (error) { return console.error(error) }
		if (res.statusCode == 200) {
				console.log("successfully logged a case");
				console.log(res.body);
		}
	});
}
foo(function () { createCase("fo", "Bar"); } );

