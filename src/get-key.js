var request = require('request');

export function getKey(host, port, user, pass, done) {
	request({
		url: {
			protocol: 'http:',
			hostname: host,
			port: port
		},
		auth: {
			user: user,
			pass: pass
		}
	}, function(err, resp, body) {
		if (err) {
			return done(err);
		}
		if (resp.statusCode === 401) {
			return done(new Error('Invalid credentials ' + user + ':' + pass));
		}
		if (resp.statusCode >= 300) {
			return done(new Error('Unacceptable response code: ' + resp.statusCode));
		}

		done(null, body);
	});
}
