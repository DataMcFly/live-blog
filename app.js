var express = require('express');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var path = require('path');
var config = require('./config');

var app = express();
app.set('views', path.join(process.cwd(), 'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({	extended: true	}));
app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for users
 
var port = process.env.PORT || 8080; // set our port

var twilio = require('twilio');
var client = twilio(config.twilio.sid, config.twilio.token );

var datamcfly = require('datamcfly');
var messagesRef = datamcfly.init(config.datamcfly.app_name, "messages", config.datamcfly.api_key);

/*
	message:
		-	_id
		-	sid
		-	type
		-	tstamp
		-	fromNumber
		-	textMessage
		-	fromCity	
		-	fromState
		-	fromCountry
*/

// backend routes =========================================================

//	listen for incoming sms messages
app.post('/message', function (request, response) {
	var d = new Date();
	var date = d.toLocaleString();

	messagesRef.push({
		sid: request.param('MessageSid'),
		type:'text',
		tstamp: date,
		fromNumber:request.param('From'),
		textMessage:request.param('Body'),
		fromCity:request.param('FromCity'),
		fromState:request.param('FromState'),
		fromCountry:request.param('FromCountry')
	});

	var resp = new twilio.TwimlResponse();
	resp.message('Thanks for the message, an agent will get back to you shortly.');
	response.writeHead(200, {
		'Content-Type':'text/xml'
	});
	response.end(resp.toString());
});


// frontend routes =========================================================

// route to handle all frontend requests, with a password to protect unauthorized access....
app.get('*', function(req, res) {
	res.render('index', {
		apikey:config.datamcfly.api_key,
		appname:config.datamcfly.app_name,
	});
}); 

var server = app.listen(port, function() {
	console.log('Listening on port %d', server.address().port);
});