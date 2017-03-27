// include modules
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var express = require('express');
var localstrategy = require('passport-local').Strategy;
var passport = require('passport');
var session = require('express-session');

// initialize express app
var app = express();

// tell passport to use a local strategy and tell it how to validate a username and password
passport.use(new localstrategy(function(username, password, done) {
	if (username && password) {
		usr = new User({
			username: username,
			password: password
		});

		return done(null, usr);
	}

	return done(null, false);
}));

// tell passport how to turn a user into serialized data that will be stored with the session
passport.serializeUser(function(user, done) {
	done(null, user.username);
});

// tell passport how to go from the serialized data back to the user
passport.deserializeUser(function(id, done) {
	done(null, {
		username: id
	});
});

// tell the express app what middleware to use
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

app.use(session({
	secret: 'secret key',
	resave: false,
	saveUninitialized: true
}));

app.use(bodyParser.urlencoded({
	extended: true
}));

// home page
app.get('/',
	function(req, res) {
		if (req.user) {
			return res.send(req.user);
		}

		return res.sendStatus(401);
	}
);

// health check
app.get('/health',
	function(req, res) {
		return res.sendStatus(200);
	}
);

app.put('/',
	function(req, res) {
		if (!req.user) {
			return res.sendStatus(401);
		}

		req.user[req.params.key] = req.params.value;

		return res.send(req.user);
	}
);

app.delete('/',
	function(req, res) {
		if (!req.user) {
			return res.sendStatus(401);
		}

		delete req.user[req.params.key];

		return res.send(req.user);
	}
);

// specify the login url
app.post('/login',
	passport.authenticate('local'),
	function(req, res) {
		res.status(200).send(req.user);
	}
);

// log the user out
app.delete('/login',
	function(req, res) {
		req.logout();
		res.send('You have logged out.');
	}
);

// start the server listening
app.listen(3000, function() {
	console.log('Server listening on port 3000.');
});
