'use strict';

//module requires
var sensor = require('./sensorModule.js');
var salesforce = require('./salesforce.js');
// var moment = require('moment');

//Environment variables from resin.io
var intervalTime = process.env.MEASUREMENT_INTERVAL || 6;
var deviceName = process.env.RESIN_DEVICE_UUID;
var warningThreshold = process.env.THRESHOLD || 50;
//Salesforce.com credentials
var username = process.env.SF_USERNAME;
var password = process.env.SF_PASSWORD;
var securityToken = process.env.SF_SEC_TOKEN;

salesforce.auth(username, password, securityToken);
sensor.initSensor();

//main sensor loop
setInterval( function() {
	console.log("checking sensors...")
	var status = sensor.getStatus(warningThreshold);
	for(var key in status){
	    if(status[key][1]) {
	    	console.log("threshold on sensor "+ key +" has been exceeded!");
	    	console.log("logging case to salesforce...");
	    	var description = "sensor "+ key +" is at "+ status[key][0]+" on device "+deviceName;
	    	salesforce.createCase("Threshold Exceeded", description);
	    } else {
	    	console.log("sensor: "+key+" is currently in range at "+status[key][0]+" C");
	    }
	}
	}, intervalTime*1000);
