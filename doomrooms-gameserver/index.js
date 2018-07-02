const EventEmitter = require('eventemitter3');
const { Connection, PipeConnection, Room } = require('@doomrooms/common');

class Gameserver extends EventEmitter {
	constructor(options) {
		super();

		this.options = options;
		this.conn = new Connection(options);

		this._connected = false;
		this.game = null;
		this.notifOptions = {};
	}

	async connect() {
		if (this._connected) {
			return;
		}

		await this.conn.connect();

		this.conn.on('message', msg => {
			if (msg.method === 'emit') {
				const [ event, ...args ] = msg.args;

				if (event === 'pipe-opened') {
					const [ player, privateId ] = args;
					const pipeConn = new PipeConnection({
						host: this.options.host,
						port: this.options.pipePort,
						protocol: this.options.protocol,
						id: privateId,
					});
					this.emit(event, player, pipeConn);
				} else {
					this.emit(event, ...args);
				}

				return;
			}

			this.emit('message', msg);
		});

		this._connected = true;
	}

	async attachGame(id, force) {
		this.game = await this.conn.send('attach-game', id, force);
		return this.game;
	}
	async makeGame(id, name) {
		this.game = await this.conn.send('make-game', id, name);
		return this.game;
	}

	async setNotifOption(key, val) {
		this.notifOptions = await this.conn.send('set-notif-option', key, val);
		return this.notifOptions;
	}

	async rooms(query = '') {
		let rooms = query.trim().length === 0 ?
			await this.conn.send('list-rooms') :
			await this.conn.send('search-rooms', query);

		rooms = rooms || []; // HACK
		return rooms.map(Room.fromObject);
	}

	async playerTags(nick, tags) {
		if (tags == null) {
			return await this.conn.send('get-private-player-tags', nick);
		}

		return await this.conn.send('set-private-player-tags', nick, tags);
	}

	async startGame(roomId) {
		return await this.conn.send('start-game', roomId);
	}
}

module.exports = Gameserver;
