const EventEmitter = require('eventemitter3');

class PipeConnection extends EventEmitter {
	constructor(options) {
		super();

		this.options = options;
		this.conn = new options.protocol(options.host, options.port);
	}

	async connect() {
		await this.conn.connect();
		await this.conn.sendRaw(this.options.id + '\n');

		this.conn.on('raw', blob => {
			this.emit('raw', blob);
		});

		this.emit('connected');
	}

	close() {
		this.conn.close();
	}

	async send(data) {
		await this.conn.sendRaw(data);
	}
}

module.exports = PipeConnection;
