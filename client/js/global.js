class App {
    constructor() {
        this.socket = null;
        this.connected = false;

        this.selectedRoom = null;

        this.playerName = null;
        this.roomList = [];
        
        this.roomName = null;
        this.playerList = [];
    }
}