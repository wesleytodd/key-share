// This is mostly for support of the es6 module export
// syntax with the babel compiler, it looks like it doesnt support
// function exports like we are used to in node/commonjs
module.exports.Server = require('./lib/server').KeyShareServer;
module.exports.discover = require('./lib/discover').discover;
module.exports.getKey = require('./lib/get-key').getKey;
