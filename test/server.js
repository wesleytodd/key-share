var Server = require('../lib/server').KeyShareServer;
var assert = require('assert');
var http = require('http');
var getKey = require('../lib/get-key').getKey;
var discover = require('../lib/discover').discover;

describe('KeyShareServer', function() {

	it('should setup the server properties', function() {
		var s = new Server([{
			name: 'foo',
			pass: 'foo',
			key: 'foo'
		}], {
			port: 123,
			publish: false,
			serviceName: 'Foo'
		});

		assert.equal(s.port, 123, 'Did not set port correctly');
		assert.equal(s.publish, false, 'Did not set publish correctly');
		assert.equal(s.serviceName, 'Foo', 'Did not set serviceName correctly');

		assert.equal(s.keys.foo.name, 'foo', 'Did not add key name correctly');
		assert.equal(s.keys.foo.pass, 'foo', 'Did not add key pass correctly');
		assert.equal(s.keys.foo.key, 'foo', 'Did not add key correctly');
	});

	it('should start an http server', function(done) {
		var s = new Server([{
			name: 'foo',
			pass: 'foo',
			key: 'foo'
		}], {
			publish: false
		}).listen(5000, function() {
			getKey('localhost', 5000, 'foo', 'foo', function(err, key) {
				assert.equal(err, null, 'Getting key errored');
				assert.equal(key, 'foo', 'Did not get correct key');
				s.close();
				done();
			});
		});
	});
	
	it('should 401 when a request doesnt provide the right user', function(done) {
		var s = new Server([{
			name: 'foo',
			pass: 'foo',
			key: 'foo'
		}], {
			publish: false
		}).listen(5000, function() {
			getKey('localhost', 5000, 'bar', 'foo', function(err, key) {
				assert.notEqual(err, null, 'Should have errored');
				assert.equal(err.message, 'Invalid credentials bar:foo', 'Should have errored');
				s.close();
				done();
			});
		});
	});

	it('should 401 when a request doesnt provide the right password', function(done) {
		var s = new Server([{
			name: 'foo',
			pass: 'foo',
			key: 'foo'
		}], {
			publish: false
		}).listen(5000, function() {
			getKey('localhost', 5000, 'foo', 'bar', function(err, key) {
				assert.notEqual(err, null, 'Should have errored');
				assert.equal(err.message, 'Invalid credentials foo:bar', 'Should have errored');
				s.close();
				done();
			});
		});
	});

	it('should publish the bonjour service', function(done) {
		var s = new Server([{
			name: 'foo',
			pass: 'foo',
			key: 'foo'
		}]).listen(5000, function() {
			var d = discover();
			d.on('serviceUp', function(service) {
				assert.equal(service.port, 5000, 'Did not publish the right port');
				done();
			});
		});
	});

});
