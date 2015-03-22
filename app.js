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
var postsRef = datamcfly.init(config.datamcfly.app_name, "posts", config.datamcfly.api_key);

// backend routes =========================================================

//	listen for incoming sms messages
app.post('/message', function (request, response) {
	var d = new Date();
	var date = d.toLocaleString();
	
	var postBody = request.param('Body');
	
	var numMedia = parseInt( request.param('NumMedia') );
	
	if (numMedia > 0) {
		for (i = 0; i < numMedia; i++) {
			var mediaUrl = request.param('MediaUrl' + i);
			postBody += '<br /><img src="' + mediaUrl + '" />';
		}
	}

	postsRef.push({
		sid: request.param('MessageSid'),
		type:'text',
		tstamp: date,
		fromNumber:request.param('From'),
		textMessage:postBody,
		fromCity:request.param('FromCity'),
		fromState:request.param('FromState'),
		fromCountry:request.param('FromCountry')
	});

	var resp = new twilio.TwimlResponse();
	resp.message('Post received');
	response.writeHead(200, {
		'Content-Type':'text/xml'
	});
	response.end(resp.toString());
});

// frontend routes =========================================================

app.get('*', function(req, res) {
	res.render('index', {
		apikey:config.datamcfly.api_key,
		appname:config.datamcfly.app_name,
	});
}); 

var server = app.listen(port, function() {
	console.log('Listening on port %d', server.address().port);
});