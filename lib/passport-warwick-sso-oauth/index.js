/**
 * Module dependencies.
 */
var OAuthStrategy = require('./oauth');


/**
 * Framework version.
 */
require('pkginfo')(module, 'version');

/**
 * Expose constructors.
 */
exports.Strategy =
exports.OAuthStrategy = OAuthStrategy;

// No OAuth 2 support, sorry
