var global = new App();

var setupSocket = socket => {
    socket.on("welcome", (playerName, roomList) => {
        global.connected = true;
        global.playerName = playerName;
        global.roomList = roomList;
        joinLobby('startMenu');
    });

    socket.on("redirectJoinRoom", roomName => joinRoom('createMenu', roomName));

    socket.on("redirectLeaveRoom", () => { 
        global.roomName = null;
        global.player1 = null;
        global.player2 = null;
        global.spectators = null;
        joinLobby('roomMenu');
    });

    socket.on("roomList", roomList => {
        global.roomList = roomList;
        unselectRoom();
        refreshRooms();
    });

    socket.on("roomInfos", info => {
        global.player1 = info.player1;
        global.player2 = info.player2;
        global.spectators = info.spectators;
        refreshRoom();
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

var refreshRooms = () => {
    var tableBody = document.getElementById('roomsTableBody');
    tableBody.innerHTML = "";
    global.roomList.forEach(room => {
        var tr = document.createElement("tr");
        tr.id = room;
        tr.onclick = () => selectRoom(room);
        var td = document.createElement("td");
        td.innerHTML = room;
        tr.appendChild(td);
        tableBody.appendChild(tr);
    });
}

var refreshRoom = () => {
    var spectatorsBody = document.getElementById('spectatorsBody');
    spectatorsBody.innerHTML = "";
    global.spectators.forEach(spectator => {
        var tr = document.createElement("tr");
        tr.innerHTML = spectator;
        spectatorsBody.appendChild(tr);
    });

    var player1Body = document.getElementById('player1Body');
    player1Body.innerHTML = "";
    if (global.player1) {
        var tr = document.createElement("tr");
        tr.innerHTML = global.player1.name;
        player1Body.appendChild(tr);
    }

    var player2Body = document.getElementById('player2Body');
    player2Body.innerHTML = "";
    if (global.player2) {
        var tr = document.createElement("tr");
        tr.innerHTML = global.player2.name;
        player2Body.appendChild(tr);
    }
    
    console.log(global.player1);
    console.log(global.player2);
    console.table(global.spectators);
}

var joinLobby = lastRoom => {
    unselectRoom();
    swap(lastRoom, 'roomsMenu');
    refreshRooms();
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

var changeRole = role => {
    if ((role === 'player1' && !global.player1) || (role === 'player2' && !global.player2) ||
        (role === 'spectator' && !global.spectators.includes(global.playerName))) {
        global.socket.emit('changeRole', {roomName:global.roomName, newRole:role});
    }
}

var joinRoom = (lastMenu, roomName) => {
    unselectRoom();
    if (roomName) {
        document.getElementById('roomTitle').innerHTML = roomName;
        swap(lastMenu, 'roomMenu');
        global.roomName = roomName;
        global.socket.emit('joinRoom', roomName);
        changeRole('spectator');
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