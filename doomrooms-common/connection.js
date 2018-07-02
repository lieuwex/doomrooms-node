const EventEmitter = require('eventemitter3');

class Connection extends EventEmitter {
	constructor(options) {
		super();

		this.host = options.host;
		this.port = options.port;

		this.conn = new options.protocol(this.host, this.port);
		this.currentId = 0;

		this.replyHandlers = {};
	}

	async connect() {
		await this.conn.connect();
		this.emit('connected');

		this.conn.on('message', msg => {
			this.currentId = Math.max(this.currentId, msg.id);

			console.log(msg);

			if (msg.method != null) {
				this.emit('message', msg);
			} else if (typeof this.replyHandlers[msg.id] === 'function') {
				const fn = this.replyHandlers[msg.id];
				if (msg.err != null) {
					fn(msg.err, null);
				} else {
					fn(null, msg.res);
				}

				this.replyHandlers[msg.id] = null;
			}
		});
	}

	close() {
		this.conn.close();
	}

	async _write(msg) {
		return await this.conn.send(msg);
	}

	async send(method, ...args) {
		const msg = {
			id: ++this.currentId,
			method,
			args,
		};

		await this._write(msg);
		return new Promise((resolve, reject) => {
			this.replyHandlers[msg.id] = (e, r) => {
				if (e != null) {
					reject(e);
				} else {
					resolve(r);
				}
			};
		});
	}

	async reply(id, res, err) {
		return await this._write({
			id,
			res,
			err,
		});
	}
}

module.exports = Connection;
