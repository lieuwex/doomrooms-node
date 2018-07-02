const EventEmitter = require('eventemitter3');
const net = require('net');

class TcpJson extends EventEmitter {
	constructor(host, port) {
		super();

		this.host = host;
		this.port = port;
	}

	async connect() {
		this.conn = net.createConnection({
			port: this.port,
			host: this.host,
		});

		return new Promise((resolve, reject) => {
			this.conn.once('connect', () => {
				let buf = '';

				this.conn.on('data', blob => { // REVIEW
					this.emit('raw', blob);
					buf += blob.toString();

					const splitted = buf.split('\n');
					buf = splitted.pop();

					for (const blob of splitted) {
						try {
							const msg = JSON.parse(blob);
							this.emit('message', msg);
						} catch {}
					}
				});

				resolve();
			});
			this.conn.once('error', err => reject(err));
		});
	}

	close() {
		this.conn.end();
	}

	async send(msg) {
		const payload = JSON.stringify(msg) + '\n';

		return await new Promise((resolve, reject) => {
			this.conn.write(payload, () => resolve());
			this.conn.once('error', err => reject(err));
		});
	}

	async sendRaw(data) {
		return await new Promise((resolve, reject) => {
			this.conn.write(data, () => resolve());
			this.conn.once('error', err => reject(err));
		});
	}
}

module.exports = TcpJson;
