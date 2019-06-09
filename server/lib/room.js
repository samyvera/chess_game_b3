class Room {
    constructor(name) {
        this.name = name;
        this.player1 = null;
        this.player2 = null;
        this.spectators = [];
    }
}
module.exports = Room;