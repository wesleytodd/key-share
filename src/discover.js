var bonjour = require('bonjour')();

export function discover(name, done) {
	if (typeof name === 'function' && !done) {
		done = name;
		name = 'KeyShareServer';
	}

	var browser = bonjour.find({
		type: 'http'
	}, found);

	function found(service) {
		if (name && service.name !== name) {
			return;
		}
		browser.removeListener('up', found);
		done && done(service);
	}

	return browser;
}
