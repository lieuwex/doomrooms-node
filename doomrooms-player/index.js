const EventEmitter = require('eventemitter3');
const {
	Connection,
	PipeConnection,
	Room,
	Player: CommonPlayer,
} = require('@doomrooms/common');

class Player extends EventEmitter {
	constructor(options) {
		super();

		this.conn = new Connection(options);
		this.options = options;

		this.nickname = null;
		this.tags = {};
		this.currentGameId = null;
		this.currentRoomId = null;
		this._connected = false;
	}

	async connect() {
		if (this._connected) {
			return;
		}

		await this.conn.connect();

		this.conn.on('message', msg => {
			if (msg.method === 'emit') {
				const [ event, ...args ] = msg.args;
				this.emit(event, ...args);
				return;
			}

			this.emit('message', msg);
		});

		this._connected = true;
	}

	async login(username, password) {
		const player = await this.conn.send('login', username, password);
		this.nickname = username;
		return CommonPlayer.fromObject(player);
	}
	async makePlayer(username, password) {
		const player = await this.conn.send('make-player', username, password);
		this.nickname = username;
		return CommonPlayer.fromObject(player);
	}

	async setGame(id) {
		await this.conn.send('set-game', id);
		this.currentGameId = id;
	}

	async sendPrivateChat(nick, message) {
		await this.conn.send('send-private-chat', nick, message);
	}

	async tags(tags) {
		if (tags == null) {
			return await this.conn.send('get-tags');
		}

		return await this.conn.send('set-tags', tags);
	}

	async openPipe() {
		const privateId = await this.conn.send('open-pipe');
		const pipeConn = new PipeConnection({
			host: this.options.host,
			port: this.options.pipePort,
			protocol: this.options.protocol,
			id: privateId,
		});
		return pipeConn;
	}

	async currentRoom() {
		return await this.conn.send('get-current-room');
	}

	async makeRoom(name, hidden = false, options = {}) {
		const room = await this.conn.send('make-room', name, hidden, options);
		this.currentRoomId = room.id;
		return room;
	}
	async joinRoom(id, password) {
		const room = password != null ?
			await this.conn.send('join-room', id, password) :
			await this.conn.send('join-room', id);
		this.currentRoomId = id;
		return room;
	}
	async getRoom(id) {
		const room = await this.conn.send('get-room', id);
		return Room.fromObject(room);
	}
	async searchRooms(query) {
		const room = await this.conn.send('search-rooms', query);
		return Room.fromObject(room);
	}

	async sendRoomChat(message, filter) {
		if (filter == null) {
			await this.conn.send('send-room-chat', message);
			return;
		}

		await this.conn.send('send-filtered-room-chat', message, filter);
	}
}

module.exports = Player;
