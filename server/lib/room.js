class Room {
    constructor(name) {
        this.name = name;
        this.players = new Map();
    }
}
module.exports = Room;