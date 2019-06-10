class Room {
    constructor(name) {
        this.name = name;
        this.players = new Map();
        this.roles = new Map()
        .set('spectator', []);
    }
}
module.exports = Room;