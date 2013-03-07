# Passport-Warwick-SSO-OAuth

[Passport](http://passportjs.org/) strategies for authenticating with [University of Warwick Web sign-on](http://warwick.ac.uk/sso)
using OAuth 1.0a.

This module lets you authenticate using Warwick SSO in your Node.js applications.
By plugging into Passport, Warwick authentication can be easily and
unobtrusively integrated into any application or framework that supports
[Connect](http://www.senchalabs.org/connect/)-style middleware, including
[Express](http://expressjs.com/).

## Install

    $ npm install passport-warwick-sso-oauth

## Usage of OAuth 1.0

#### Configure Strategy

The Warwick SSO OAuth 1.0 authentication strategy authenticates users using a University of Warwick
account and OAuth tokens.  The strategy requires a `verify` callback, which
accepts these credentials and calls `done` providing a user, as well as `options`
specifying a consumer key, consumer secret, and callback URL.

    passport.use(new WarwickSSOStrategy({
        consumerKey: WARWICK_SSO_CONSUMER_KEY,
        consumerSecret: WARWICK_SSO_CONSUMER_SECRET,
        callbackURL: "http://127.0.0.1:3000/auth/warwick-sso/callback"
      },
      function(token, tokenSecret, profile, done) {
        User.findOrCreate({ warwickUniversityId: profile.id }, function (err, user) {
          return done(err, user);
        });
      }
    ));

#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'warwick-sso'` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

    app.get('/auth/warwick-sso',
      passport.authenticate('warwick-sso', {}));

    app.get('/auth/warwick-sso/callback', 
      passport.authenticate('warwick-sso', { failureRedirect: '/login' }),
      function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
      });

## OAuth 2.0

Warwick web sign-on currently does not support OAuth 2.0.

## Examples

For a complete, working example, refer to the [OAuth 1.0 example](https://github.com/UniversityofWarwick/passport-warwick-sso-oauth/tree/master/examples/oauth).

## Tests

    $ npm install --dev
    $ make test

[![Build Status](https://api.travis-ci.org/UniversityofWarwick/passport-warwick-sso-oauth.png?branch=master)](http://travis-ci.org/UniversityofWarwick/passport-warwick-sso-oauth)

## Credits

  - [Mat Mannion](http://github.com/matmannion)

## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2013 University of Warwick <[http://warwick.ac.uk/webteam](http://warwick.ac.uk/webteam)>
