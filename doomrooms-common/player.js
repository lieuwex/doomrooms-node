class Player {
	constructor() {
		this.nick = '';
		this.tags = {};
		this.currentGameId = undefined;
		this.currentRoomId = undefined;

		this.password = '';
		this.privateTags = {};
	}

	static fromObject(obj) {
		const res = new Player();

		res.nick = obj.nick;
		res.tags = obj.tags;

		res.currentGameId = obj.currentGameId;
		res.currentRoomId = obj.currentRoomId;

		return res;
	}
}

module.exports = Player;
