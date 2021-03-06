// PreLoading dependences
//var gpio = require("pi-gpio");
var express = require('express');
var app = express();
var server = require('http').createServer(app).listen(80);
var io = require('socket.io').listen(server);
var piblaster = require("pi-blaster.js");
var webRTC = require('webrtc.io').listen(81);
var sys = require('sys');
var exec = require('child_process').exec;

exec("/usr/sbin/pi-blaster --pcm", function (error, stdout, stderr) {
	sys.print("pi-blaster: \n" + stdout);
});

var config = {
	port:{
		aileron: 0,
		elevator: 1,
		throttle: 2,
		rudder: 5,
	},
	default: {
		aileron: 0,
		elevator: 0,
		throttle: 0,
		rudder: 0,
	},
};

var setControl = function(control,percent){
	if(typeof config.port[control] != 'number') return false;
	if(typeof percent == "number" && percent >= 0 && percent <= 100){
		piblaster.setPwm(
			config.port[control],
			percent / 100
		);
	}else{
		piblaster.setPwm(
			config.port[control],
			percent / 100
		);
	}
	return true;
}

// Set default PWM's
for( var x in config.port ){
	setControl( x, config.default[x] );
}

////////////////////////////////////////////////
app.use(express.static(__dirname + '/htdocs'));

////////////////////////////////////////////////
io.sockets.on('connection', function (socket) {
	
	socket.on('controls',function(data){
		console.log("Commands received!!");
		for( var x in data ){
			console.log("Command "+x+" is "+data[x]+"!!");
			setControl( x, data[x] );
		}
	});

	// Disconnect Actions
	socket.on('disconnect', function () {
		// Do something to quadcopter
	});

});