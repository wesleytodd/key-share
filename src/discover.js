var mdns = require('mdns');
var EventEmitter = require('events').EventEmitter;

export function discover(name = 'KeyShareServer') {
	var emitter = new EventEmitter();
	var browser = mdns.createBrowser(mdns.tcp('http'));

	browser.on('serviceUp', function(service) {
		if (service.name === name) {
			emitter.emit('serviceUp', service);
		}
	});
	browser.on('serviceDown', function(service) {
		if (service.name === name) {
			emitter.emit('serviceDown', service);
		}
	});
	browser.start();

	// Add stop method to emitter
	emitter.stop = function() {
		browser.stop();
	};

	return emitter;
}
