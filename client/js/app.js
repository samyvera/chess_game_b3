var global = new App();

var setupSocket = socket => {
    socket.on("welcome", (playerName, roomList) => {
        global.connected = true;
        global.playerName = playerName;
        global.roomList = roomList;
        joinLobby('startMenu');
    });

    socket.on("redirectJoinRoom", roomName => joinRoom('createMenu', roomName));

    socket.on("redirectLeaveRoom", () => joinLobby('roomMenu'));

    socket.on("roomList", roomList => {
        global.roomList = roomList;
        refresh();
    });

    socket.on("connect_failed", () => {
        socket.close();
        global.connected = false;
    });

    socket.on("disconnect", () => {
        socket.close();
        global.connected = false;
    });

    socket.on("errorMessage", message => alert(message));
}

var swap = (oldMenu, newMenu) => {
    document.getElementById(oldMenu).style.display = 'none';
    document.getElementById(newMenu).style.display = 'flex';
}

var play = () => {
    var playerName = document.getElementById('playerNameInput').value;
    if (playerName && playerName.length > 0 && playerName.length <= 15) global.socket.emit('join', playerName);
}

var unselectRoom = () => {
    document.getElementById('joinRoom').className = 'unselectable';
    Array.from(document.getElementsByClassName("selected")).forEach(item => item.classList.remove("selected"));
    global.selectedRoom = null;
}

var refresh = () => {
    var tableBody = document.getElementById('roomsTableBody');
    tableBody.innerHTML = "";
    global.roomList.forEach(room => {
        var tr = document.createElement("tr");
        tr.id = room;
        tr.onclick = () => selectRoom(room);
        var td = document.createElement("td");
        td.innerHTML = room;
        tr.appendChild(td);
        document.getElementById('roomsTableBody').appendChild(tr);
    });
}

var joinLobby = lastRoom => {
    unselectRoom();
    swap(lastRoom, 'roomsMenu');
    refresh();
}

var selectRoom = name => {
    unselectRoom();
    document.getElementById('joinRoom').classList.remove("unselectable");
    document.getElementById(name).className = 'selected';
    global.selectedRoom = name;
}

var createRoomMenu = () => {
    unselectRoom();
    swap('roomsMenu', 'createMenu');
    document.getElementById('roomNameInput').value = global.playerName + "'s room";
    document.getElementById('roomNameInput').focus();
}

var createRoom = () => {
    var roomName = document.getElementById('roomNameInput').value;
    if (roomName && roomName.length > 0 && roomName.length <= 35) {
        global.socket.emit('createRoom', roomName);
    }
}

var joinRoom = (lastMenu, roomName) => {
    unselectRoom();
    if (roomName) {
        document.getElementById('roomTitle').innerHTML = roomName;
        swap(lastMenu, 'roomMenu');
        global.roomName = roomName;
        global.socket.emit('joinRoom', roomName);
    }
}

var leaveRoom = () => {
    unselectRoom();
    swap('roomMenu', 'roomsMenu');
    global.socket.emit('leaveRoom', global.roomName);
}

window.onload = () => {
    var socket = io();
    setupSocket(socket);
    global.socket = socket;
}

// var display = new CanvasDisplay();

// var frame = time => {
//     global.update(keys, socket);
//     display.drawFrame();
//     requestAnimationFrame(frame);
// };
// requestAnimationFrame(frame);