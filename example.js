var keypair = require('keypair')();
var keyShare = require('./');
var Server = keyShare.Server;
var discover = keyShare.discover;
var getKey = keyShare.getKey;

var server = new Server([{
	name: 'foo',
	pass: 'foo',
	key: keypair.private
}]).listen(null, function() {
	console.log('Server listening', server.port);
});

server.on('error', function(err) {
	console.error(err);
});

var d = discover();
d.on('serviceUp', function(service) {
	getKey(service.host, service.port, 'foo', 'foo', function(err, key) {
		if (err) {
			console.error(err);
			d.stop();
			server.close();
			return;
		}
		console.log(key);
		d.stop();
		server.close();
		process.exit(0);
	});
});
