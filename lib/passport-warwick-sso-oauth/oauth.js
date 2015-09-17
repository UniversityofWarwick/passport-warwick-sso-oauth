/**
 * Module dependencies.
 */
var util = require('util')
  , OAuthStrategy = require('passport-oauth').OAuthStrategy
  , InternalOAuthError = require('passport-oauth').InternalOAuthError;

/**
 * `Strategy` constructor.
 *
 * The Warwick SSO authentication strategy authenticates requests by delegating to
 * web sign-on using the OAuth protocol.
 *
 * Applications must supply a `verify` callback which accepts a `token`,
 * `tokenSecret` and service-specific `profile`, and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `consumerKey`     identifies client to web sign-on
 *   - `consumerSecret`  secret used to establish ownership of the consumer key
 *   - `callbackURL`     URL to which web sign-on will redirect the user after obtaining authorization
 *
 * Examples:
 *
 *     passport.use(new WarwickSSOStrategy({
 *         consumerKey: '123-456-789',
 *         consumerSecret: 'shhh-its-a-secret'
 *         callbackURL: 'https://www.example.net/auth/warwick/callback'
 *       },
 *       function(token, tokenSecret, profile, done) {
 *         User.findOrCreate(..., function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
  options = options || {};
  options.requestTokenURL = options.requestTokenURL || 'https://websignon.warwick.ac.uk/oauth/requestToken';
  options.accessTokenURL = options.accessTokenURL || 'https://websignon.warwick.ac.uk/oauth/accessToken';
  options.userAuthorizationURL = options.userAuthorizationURL || 'https://websignon.warwick.ac.uk/oauth/authenticate';
  options.sessionKey = options.sessionKey || 'oauth:warwick-sso';

  OAuthStrategy.call(this, options, verify);
  this.name = 'warwick-sso';
}

/**
 * Inherit from `OAuthStrategy`.
 */
util.inherits(Strategy, OAuthStrategy);

/**
 * Retrieve user profile from web sign-on.
 *
 * This function constructs a normalized profile, with the following properties:
 *
 *   - `id`
 *   - `displayName`
 *
 * @param {String} token
 * @param {String} tokenSecret
 * @param {Object} params
 * @param {Function} done
 * @api protected
 */
Strategy.prototype.userProfile = function(token, tokenSecret, params, done) {
  this._oauth.post('https://websignon.warwick.ac.uk/oauth/authenticate/attributes', token, tokenSecret, null, null, function (err, body, res) {
    if (err) { return done(new InternalOAuthError('failed to fetch user profile', err)); }
    
    try {
      var profile = { provider: 'warwick-sso' };

			body.split('\n').forEach(function(line) {
				line = line.trim();
				if (line.length && line.indexOf('=') != -1) {
					var key = line.substring(0, line.indexOf('='));
					var value = line.substring(line.indexOf('=')+1);

					profile[key] = value;
				}
			});

      profile._json = JSON.stringify(profile);
			profile._raw = body;

      done(null, profile);
    } catch(e) {
      done(e);
    }
  });
}

/**
 * Return extra Warwick-specific parameters to be included in the request token
 * request.
 *
 * @param {Object} options
 * @return {Object}
 * @api protected
 */
Strategy.prototype.requestTokenParams = function(options) {
  var params = options || {};
 
	// Ensure we have the SSO scope for getting user information 
  var scope = options.scope;
  if (scope) {
		if (!Array.isArray(scope)) scope = [scope];

		if (scope.indexOf('urn:websignon.warwick.ac.uk:sso:service') == -1) {
			scope.push('urn:websignon.warwick.ac.uk:sso:service');
		}

		scope = scope.join(' '); 

    params['scope'] = scope;
  } else {
		params['scope'] = 'urn:websignon.warwick.ac.uk:sso:service';
	}
  return params;
}

/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
