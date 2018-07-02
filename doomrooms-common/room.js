const Player = require('./player.js');

class Room {
	static fromObject(obj) {
		const res = new Room();

		res.id = obj.id;
		res.name = obj.name;
		res.hidden = obj.hidden;
		res.options = obj.options;
		res.started = obj.started;
		res.gameId = obj.gameID;

		res.players = obj.players.map(Player.fromObject);
		res.admin = obj.admin && Player.fromObject(obj.admin);

		return res;
	}
}

module.exports = Room;
