# Eaisly Share Keys Over The Network

This module provides small tools intended to share a private key over a private and secure network.  There are two commands provided, one to start a server and one to get from that server.  There is also a node API for starting your own servers and discovering available servers on the network via ZeroConf/Bonjour.

The idea behind this is that often you need to share public or private keys to other machines.  Maybe you are setting up a new machine for yourself and want to have your same private key on both, or maybe you are giving your public key to a Ops guy to put on servers.  Either way it is a pain to have to email a public key or find a thumb drive to transfer a private key.  This module makes it easy to spin up a server on one machine and connect to it on the other to get the key.

The other intended use of this module is for applications that use keys as an identity to share that identity between machines.  Imagine a private communication app where each user is represented by their key pair and any message would be encrypted between them.  This module could be used to setup a key-sharing mechanism between the two machines.

## Usage

```
$ npm install key-share
```

```javascript
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

discover(function(service) {
	getKey(service.host, service.port, 'foo', 'foo', function(err, key) {
		if (err) {
			console.error(err);
			server.close();
			return;
		}
		console.log(key);
		server.close();
		process.exit(0);
	});
});
```

## CLI Commands

#### `key-share serve`

Args:

- `-k, --keyfile`: Specify a key to serve, loaded from the file path provided.  Default: `~/.ssh/id_rsa`
- `-p, --port`: Specify a port to open the server on.  Default: `null`, an ephemeral kernel assigned port
- `-u, --user`: A username to use for http basic authentication. Default: the current user, `process.env.USER`
- `-P, --pass`: [Required] A password to use for http basic authentication
- `--no-publish`: Do not publish on network via ZeroConf/Bonjour, this disabled auto-discovery
- `-s, --serviceName`: The service name to publish as. Default: `KeyShareServer`

This will open an http server to serve the keyfile.  If no port is specified it opens an ephemeral port.  This will publish a service on the local network via ZeroConf/Bonjour so that clients can find your key server.  Also, the http server is protected by basic auth for a minimal security layer.

#### `key-share get`

Args:

- `-h, --host`: Specify the host machine for the key server
- `-p, --port`: Specify a port to reach the key server on
- `-u, --user`: A username to use for http basic authentication. Default: the current user, `process.env.USER`
- `-P, --pass`: [Required] A password to use for http basic authentication
- `-s, --serviceName`: The service name to publish as. Default: `KeyShareServer`

This will either contact the provided host/port or attempt to discover a keyserver on the network.  Once the connection is established it will print the key to stdout.

## Programmatic API

#### `keyShare.Server(<Array> keys[, <Object> options])`

Constructor for starting the key server.  Keys must specify a `name`, `pass` and `key`.  Options are as follows:

```javascript
{
	port: null,
	publish: fasle,
	serviceName: 'KeyShareServer'
}
```

##### `keyshare.Server.listen([<Number> port[, <Function> done]])`

Open the server for connections.  The port here will fall back to the one provided in the constructor options.  The callback will be called once the server is ready to accept connections.

##### `keyshare.Server.close()`

Closes the server and de-registers the bonjour service.

#### `keyshare.discover([<String> name[, <Function> done]])`

Searches the network for a bonjour service.  Done will be called for the first service found that matches the name.

#### `keyshare.getKey(<String> host, <Number> port, <String> user, <String> Pass, <Function> done)`

Gets a key from a server and calls done with the key or an error.
