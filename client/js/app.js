window.onload = () => {

    class Player {
        constructor(id) {
            this.id = id;
            this.name = null;
            this.rooms = new Array();
            this.room = {
                name: null,
                player1: null,
                player2: null,
                spectators: new Array()
            }
        }
    }

    class App {
        constructor(socket) {
            this.socket = socket;
            this.player = new Player(this.socket.id);

            this.display = null;
            this.selectedRoom = null;

            this.setupSocket = () => {
                this.socket.on("welcome", (name, rooms) => {
                    this.player.name = name;
                    this.player.rooms = rooms;
                    this.joinLobby('startMenu');
                });
        
                this.socket.on("redirectJoinRoom", name => {
                    this.joinRoom('createMenu', name);
                });
        
                this.socket.on("redirectLeaveRoom", () => {
                    this.player.room.name = null;
                    this.player.room.player1 = null;
                    this.player.room.player2 = null;
                    this.player.room.spectators = new Array();
                    this.joinLobby('roomMenu');
                });
        
                this.socket.on("roomList", rooms => {
                    this.player.rooms = rooms;
                    this.unselectRoom();
                    this.display.refreshRooms();
                });
        
                this.socket.on("roomInfos", info => {
                    this.player.room.player1 = info.player1;
                    this.player.room.player2 = info.player2;
                    this.player.room.spectators = info.spectators;
                    this.display.refreshRoom();
                });
        
                this.socket.on("connect_failed", () => {
                    this.socket.close();
                    alert("Disconnected");
                });
        
                this.socket.on("disconnect", () => {
                    this.socket.close();
                    alert("Disconnected");
                });
        
                this.socket.on("errorMessage", message => {
                    alert(message);
                });
            }

            //UTILS

            this.joinLobby = lastRoom => {
                this.unselectRoom();
                this.display.swapMenu(lastRoom, 'roomsMenu');
                this.display.refreshRooms();
            }

            this.joinRoom = (lastMenu, name) => {
                this.unselectRoom();
                if (name) {
                    this.display.setRoomName(name);
                    this.display.swapMenu(lastMenu, 'roomMenu');
                    this.player.room.name = name;
                    this.socket.emit('joinRoom', name);
                    this.changeRole('spectator');
                }
            }

            //"Start"

            this.submitNickname = () => {
                var name = this.display.getNickname();
                if (name && name.length > 0 && name.length <= 15) this.socket.emit('join', name);
            }

            //"Rooms"

            this.unselectRoom = () => {
                this.display.unselectRoom();
                this.selectedRoom = null;
            }

            this.selectRoom = name => {
                this.unselectRoom();
                this.display.changeSelectedRoom(name);
                this.selectedRoom = name;
            }
            
            this.createRoomMenu = () => {
                this.unselectRoom();
                this.display.swapMenu('roomsMenu', 'createMenu');
                this.display.setAutoRoomName(this.player.name);
            }

            //"Create Room"

            this.createRoom = () => {
                var name = this.display.getRoomNameInput();
                if (name && name.length > 0 && name.length <= 35) {
                    this.display.showStartGameButton();
                    this.socket.emit('createRoom', name);
                }
            }

            //"Room"
            
            this.leaveRoom = () => {
                this.unselectRoom();
                this.display.swapMenu('roomMenu', 'roomsMenu');
                this.display.resetStartGameButton();
                this.socket.emit('leaveRoom', this.player.room.name);
            }

            this.changeRole = role => {
                if ((role === 'player1' && !this.player.room.player1) || (role === 'player2' && !this.player.room.player2) ||
                    (role === 'spectator' && !this.player.room.spectators.includes(this.player.name))) {
                    this.socket.emit('changeRole', {
                        roomName: this.player.room.name,
                        newRole: role
                    });
                }
            }

            //INIT

            this.setupSocket();
        }
    }

    var app = new App(io());
    var display = new Display(app);
    app.display = display;
}