var global = new App();

var setupSocket = socket => {
    socket.on("welcome", (playerName, roomList) => {
        global.connected = true;
        joinLobby(playerName, roomList);
    });

    socket.on("redirectJoinRoom", roomName => {
        socket.emit('joinRoom', roomName);
        joinRoom('createMenu', roomName);
    });

    socket.on("connect_failed", () => {
        socket.close();
        global.connected = false;
    });

    socket.on("disconnect", () => {
        socket.close();
        global.connected = false;
    });
}

var play = () => {
    var playerName = document.getElementById('playerNameInput').value;
    if (playerName && playerName.length > 0 && playerName.length <= 15) global.socket.emit('join', playerName);
}

var joinLobby = (playerName, roomList) => {
    global.playerName = playerName;
    global.roomList = roomList;
    //updateRoomlist(roomlist);
    document.getElementById('startMenu').style.display = 'none';
    document.getElementById('roomsMenu').style.display = 'flex';
}

var selectRoom = id => {
    unselectRoom();
    document.getElementById('joinRoom').classList.remove("unselectable");
    document.getElementById('room-' + id).className = 'selected';
    global.selectedRoom = id;
}

var unselectRoom = () => {
    document.getElementById('joinRoom').className = 'unselectable';
    Array.from(document.getElementsByClassName("selected")).forEach(item => item.classList.remove("selected"));
    global.selectedRoom = null;
}

var refresh = () => {
    unselectRoom();
}

var createRoomMenu = () => {
    unselectRoom();
    document.getElementById('createMenu').style.display = 'flex';
    document.getElementById('roomsMenu').style.display = 'none';
    document.getElementById('roomNameInput').value = global.playerName + "'s room";
    document.getElementById('roomNameInput').focus();
}

var cancelMenu = menu => {
    document.getElementById('roomsMenu').style.display = 'flex';
    document.getElementById(menu).style.display = 'none';
}

var createRoom = () => {
    var roomName = document.getElementById('roomNameInput').value;
    if (roomName && roomName.length > 0 && roomName.length <= 35) {
        global.socket.emit('createRoom', roomName);
    }
}

var joinRoom = (lastMenu, roomName) => {
    if (roomName) {
        document.getElementById(lastMenu).style.display = 'none';
        document.getElementById('roomMenu').style.display = 'flex';
        document.getElementById('roomTitle').innerHTML = roomName;
    }
}

window.onload = () => {
    var socket = io();
    setupSocket(socket);
    global.socket = socket;
}

// window.onload = () => {
    // var display = new CanvasDisplay();
    // setupSocket(socket);

    // var frame = time => {
    //     global.update(keys, socket);
    //     display.drawFrame();
    //     requestAnimationFrame(frame);
    // };
    // requestAnimationFrame(frame);
// };