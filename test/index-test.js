var vows = require('vows');
var assert = require('assert');
var util = require('util');
var warwick = require('passport-warwick-sso-oauth');


vows.describe('passport-warwick-sso-oauth').addBatch({
  
  'module': {
    'should report a version': function (x) {
      assert.isString(warwick.version);
    },
    'should export OAuth strategy': function (x) {
      assert.isFunction(warwick.Strategy);
      assert.isFunction(warwick.OAuthStrategy);
      assert.equal(warwick.Strategy, warwick.OAuthStrategy);
    },
  },
  
}).export(module);
