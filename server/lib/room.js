class Room {
    constructor(name) {
        this.name = name;
        this.players = new Map();
        this.roles = new Map()
        .set('player1', null)
        .set('player2', null)
        .set('spectator', []);
    }
}
module.exports = Room;