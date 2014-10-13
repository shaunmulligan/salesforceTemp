'use strict';

var sensor = require('ds18x20'),
    out = console.log;

var isLoaded = sensor.isDriverLoaded();

exports.initSensor = function () {
	if (!isLoaded) {
	    out('The driver is not loaded.');
	    try {
	        sensor.loadDriver();
	    } catch (err) {
	        out('Seems like we are not running this script as a super-user...');
	        out('Bye bye for now =-)');
	        //process.exit(0);
	        return false;
	    }

	    out('Alright. The driver is now loaded. Then let\'s continue. Maybe you have some sensors connected...?');

	} else {
	    out('Alright, the driver was already loaded. Let\'s see if you have some sensors hooked up.');
	    return true;
	}
}

exports.listTemps = function () {
	var listOfDeviceIds = sensor.list();
	if (listOfDeviceIds.length === 0) {

	    out('Too bad. You don\'t seem to have any sensors hooked up to your raspberry...');
	    out('Bye bye for now =-)');
	    //process.exit(0);
	    return false;
	} else {
		return sensor.getAll();
	}
}

exports.getStatus = function (threshold) {
	var listOfTemps = exports.listTemps();
	var statusList = {};
	for(var key in listOfTemps){
	    //console.log(key+": "+listOfTemps[key]);
	    if(listOfTemps[key] > threshold) {
	    	statusList[key] = [listOfTemps[key], true];
	    } else {
	    	statusList[key] = [listOfTemps[key], false];
	    }
	}
	return statusList;
}