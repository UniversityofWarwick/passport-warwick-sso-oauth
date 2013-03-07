var vows = require('vows');
var assert = require('assert');
var util = require('util');
var WarwickSSOStrategy = require('passport-warwick-sso-oauth/oauth');


vows.describe('WarwickSSOStrategy').addBatch({
  
  'strategy': {
    topic: function() {
      return new WarwickSSOStrategy({
        consumerKey: 'ABC123',
        consumerSecret: 'secret'
      },
      function() {});
    },
    
    'should be named warwick-sso': function (strategy) {
      assert.equal(strategy.name, 'warwick-sso');
    },
  },
  
  'strategy request token params': {
    topic: function() {
      return new WarwickSSOStrategy({
        consumerKey: 'ABC123',
        consumerSecret: 'secret'
      },
      function() {});
    },
    
		'should have default scope': function(strategy) {
			var params = strategy.requestTokenParams({});
			assert.equal(params.scope, 'urn:websignon.warwick.ac.uk:sso:service');
		},
    'should return scope': function (strategy) {
      var params = strategy.requestTokenParams({ scope: 'x' });
      assert.equal(params.scope, 'x urn:websignon.warwick.ac.uk:sso:service');
    },
    'should return concatenated scope from array': function (strategy) {
      var params = strategy.requestTokenParams({ scope: ['x', 'y'] });
      assert.equal(params.scope, 'x y urn:websignon.warwick.ac.uk:sso:service');
    },
		'should return concatenated scope from array already has sso': function(strategy) {
			var params = strategy.requestTokenParams({ scope: ['x', 'y', 'urn:websignon.warwick.ac.uk:sso:service'] });
      assert.equal(params.scope, 'x y urn:websignon.warwick.ac.uk:sso:service');
		},
  },
  
  'strategy when loading user profile': {
    topic: function() {
      var strategy = new WarwickSSOStrategy({
        consumerKey: 'ABC123',
        consumerSecret: 'secret'
      },
      function() {});
      
      // mock
      strategy._oauth.post = function(url, token, tokenSecret, postBody, postBodyType, callback) {
				var body = 'logindisabled=FALSE\nurn:mace:dir:attribute-def:eduPersonTargetedID=gqu2d8w3ha5ofg6i2r8nssco\nwarwickitsclass=Staff\nwarwickyearofstudy=0\nlastname=Mannion\nid=0672089\nstaff=true\nurn:websignon:usertype=Staff\nurn:mace:dir:attribute-def:eduPersonScopedAffiliation=member@warwick.ac.uk\nstudent=false\ndeptcode=IN\nname=Mathew Mannion\nwarwickstatuscode=C\nwarwickukfedgroup=Staff\nwarwickathens=Y\ndept=Information Technology Services\ndn=CN=cuscav,OU=CU,OU=WARWICK,DC=ads,DC=warwick,DC=ac,DC=uk\nwarwickcoursecode=G503\nwarwickenrolementstatus=F\nmember=true\ndeptshort=IT Services\nurn:websignon:usersource=WarwickADS\nwarwickfinalyear=Y\nurn:mace:dir:attribute-def:eduPersonAffiliation=member\nwarwickcategory=U\nfirstname=Mathew\nreturnType=4\nurn:websignon:timestamp=2012-11-28T11:00:08.655Z\nemail=M.Mannion@warwick.ac.uk\nwarwickattendancemode=F\nuser=cuscav\nwarwickukfedmember=Y\n'
        
        callback(null, body, undefined);
      }
      
      return strategy;
    },
    
    'when told to load user profile': {
      topic: function(strategy) {
        var self = this;
        function done(err, profile) {
          self.callback(err, profile);
        }
        
        process.nextTick(function () {
          strategy.userProfile('token', 'token-secret', {}, done);
        });
      },
      
      'should not error' : function(err, req) {
        assert.isNull(err);
      },
      'should load profile' : function(err, profile) {
        assert.equal(profile.provider, 'warwick-sso');
        assert.equal(profile.id, '0672089');
        assert.equal(profile.name, 'Mathew Mannion');
        assert.equal(profile.email, 'M.Mannion@warwick.ac.uk');
      },
      'should set raw property' : function(err, profile) {
        assert.isString(profile._raw);
      },
      'should set json property' : function(err, profile) {
        assert.isString(profile._json);
      },
    },
  },
  
  'strategy when loading user profile and encountering an error': {
    topic: function() {
      var strategy = new WarwickSSOStrategy({
        consumerKey: 'ABC123',
        consumerSecret: 'secret'
      },
      function() {});
      
      // mock
      strategy._oauth.get = function(url, token, tokenSecret, callback) {
        callback(new Error('something went wrong'));
      }
      
      return strategy;
    },
    
    'when told to load user profile': {
      topic: function(strategy) {
        var self = this;
        function done(err, profile) {
          self.callback(err, profile);
        }
        
        process.nextTick(function () {
          strategy.userProfile('token', 'token-secret', {}, done);
        });
      },
      
      'should error' : function(err, req) {
        assert.isNotNull(err);
      },
      'should wrap error in InternalOAuthError' : function(err, req) {
        assert.equal(err.constructor.name, 'InternalOAuthError');
      },
      'should not load profile' : function(err, profile) {
        assert.isUndefined(profile);
      },
    },
  },

}).export(module);
