// include modules
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var express = require('express');
var localstrategy = require('passport-local').Strategy;
var passport = require('passport');
var session = require('express-session');

// initialize express app
var app = express();

// keep track of accounts in a horrible fashion
var users = [];

// tell passport to use a local strategy and tell it how to validate a username and password
passport.use(new localstrategy(function(username, password, done) {
	for (var i = 0; i < users.length; i++) {
		if (users[i].username == username) {
			return done(null, users[i]);
		}
	}

	var usr = {username: username, keys: {}};
	users.push(usr);

	return done(null, usr);
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

app.use(session({
	secret: 'poots',
	resave: false,
	saveUninitialized: true
}));

app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(passport.initialize());
app.use(passport.session());

// home page
app.get('/',
	function(req, res) {
		if (req.user) {
			return res.send(req.user.keys);
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

		req.user.keys[req.params.key] = req.params.value;

		return res.send(req.user);
	}
);

app.delete('/',
	function(req, res) {
		if (!req.user) {
			return res.sendStatus(401);
		}

		delete req.user.keys[req.params.key];

		return res.send(req.user);
	}
);

// specify the login url
app.post('/login',
	passport.authenticate('local'),
	function(req, res) {
		res.status(200).send(req.user.keys);
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
