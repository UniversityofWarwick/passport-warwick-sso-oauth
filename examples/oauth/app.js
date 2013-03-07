var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
	, passport = require('passport')
	, WarwickSSOStrategy = require('passport-warwick-sso-oauth').Strategy;

// Register a Warwick SSO consumer key and secret here: http://warwick.ac.uk/oauth/apis/registration
var WARWICK_SSO_CONSUMER_KEY = "--insert-oauth-consumer-key-here--";
var WARWICK_SSO_CONSUMER_SECRET = "--insert-oauth-consumer-secret-here--";

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());

	// Initialise express session storage. Not suitable for production without a proper store. We need the cookie parser too
	app.use(express.cookieParser());
	app.use(express.session({ secret: 'squirrel!' }));

	// Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  app.use(passport.initialize());
  app.use(passport.session());

  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Warwick profile is serialized
//   and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// Use the WarwickSSOStrategy within Passport.
//   Strategies in passport require a `validate` function, which accept
//   credentials (in this case, token, tokenSecret and profile), and invoke a
//   callback with a user object.
var authCallback = function(token, tokenSecret, profile, done) {
  // asynchronous verification, for effect...
  process.nextTick(function () {
    // To keep the example simple, the user's Warwick profile is returned to
    // represent the logged-in user.  In a typical application, you would want
    // to associate the Warwick account with a user record in your database,
    // and return that user instead.
    return done(null, profile);
  });
};

// Tell Passport to use the WarwickSSOStrategy and to return as necessary
passport.use(new WarwickSSOStrategy({
		consumerKey: WARWICK_SSO_CONSUMER_KEY,
		consumerSecret: WARWICK_SSO_CONSUMER_SECRET,
		callbackURL: 'http://localhost:3000/auth/warwick-sso/callback'
  },
  authCallback
));

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/auth/warwick-sso')
}

// GET /auth/warwick-sso
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Warwick authentication will involve redirecting
//   the user to websignon.warwick.ac.uk.  After authenticating, Web sign-on will redirect the
//   user back to this application at /auth/
app.get('/auth/warwick-sso',
  passport.authenticate('warwick-sso', { failureRedirect: '/logout' }),
  function(req, res) {
		// This request will be redirected to web sign-on, so this function won't be called
    res.redirect('/');
  });

// GET /auth/warwick-sso/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/warwick-sso/callback',
  passport.authenticate('warwick-sso', { failureRedirect: '/logout' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.get('/', ensureAuthenticated, routes.index);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
