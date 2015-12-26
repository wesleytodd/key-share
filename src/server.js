var http = require('http');
var EventEmitter = require('events').EventEmitter;
var auth = require('basic-auth');
var bonjour = require('bonjour')();

export class KeyShareServer extends EventEmitter {

	constructor(keys = [], opts = {}) {
		super();
		this.port = opts.port || null;
		this.user = opts.user;
		this.pass = opts.pass;
		this.publish = typeof opts.publish !== 'undefined' ? opts.publish : true;
		this.serviceName = opts.serviceName || 'KeyShareServer';
		this.server = null;
		this.bonjourService = null;

		// Organize keys by name for lookup
		this.keys = {};
		keys.forEach(v => {
			this.keys[v.name] = {
				name: v.name,
				pass: v.pass,
				key: v.key
			};
		});
	}

	listen(port = this.port, done = function() {}) {
		// Dont listen twice
		if (this.server) {
			return;
		}

		// Create the http server and proxy errors
		this.server = http.createServer(this.handler.bind(this));
		this.server.on('error', err => {
			this.emit('error', err);
		});
		this.server.on('close', () => {
			this.emit('close');
		});

		// Start listening
		this.server.listen(port, err => {
			this.port = this.server.address().port;

			if (this.publish) {
				this.publishService();
			}

			this.emit('open');
			done();
		});

		// Chaining
		return this;
	}

	handler(req, res) {
		var a = auth(req);

		// Check auth failure
		if (!a || !this.keys[a.name] || a.pass !== this.keys[a.name].pass) {
			res.statusCode = 401;
			res.end();
			this.emit('authError', new Error('Authentication Error'), a);
			return;
		}

		// Success
		res.statusCode = 200;
		res.end(this.keys[a.name].key);
		this.emit('keySent', this.keys[a.name], req);
	}

	publishService() {
		if (!this.port) {
			this.emit('error', new Error('Cannot publish without a port'));
			return;
		}

		this.bonjourService = bonjour.tcp.publish({
			type: 'http',
			protocol: 'tcp',
			port: this.port,
			name: this.serviceName
		});
	}

	close() {
		if (this.server) {
			this.server.close();
			this.server = null;
		}
		if (this.bonjourService) {
			this.bonjourService.unpublish();
			this.bonjourService = null;
		}
	}
}
