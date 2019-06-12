class Display {
    constructor(app) {

        //UTILS

        this.swapMenu = (oldMenu, newMenu) => {
            document.getElementById(oldMenu).style.display = 'none';
            document.getElementById(newMenu).style.display = 'flex';
        }

        //"Start"
        
        this.getNickname = () => document.getElementById('nicknameInput').value;

        //"Rooms"

        this.unselectRoom = () => {
            document.getElementById('joinRoom').className = 'unselectable';
            Array.from(document.getElementsByClassName("selected")).forEach(item => item.classList.remove("selected"));
        }

        this.changeSelectedRoom = name => {
            document.getElementById('joinRoom').classList.remove("unselectable");
            document.getElementById(name).className = 'selected';
        }

        this.refreshRooms = () => {
            var tableBody = document.getElementById('roomsTableBody');
            tableBody.innerHTML = "";
            app.player.rooms.forEach(room => {
                var tr = document.createElement("tr");
                tr.id = room;
                tr.onclick = () => app.selectRoom(room);
                var td = document.createElement("td");
                td.innerHTML = room;
                tr.appendChild(td);
                tableBody.appendChild(tr);
            });
        }
        
        //"Create room"

        this.setAutoRoomName = name => {
            document.getElementById('roomNameInput').value = name + "'s room";
            document.getElementById('roomNameInput').focus();
        }

        this.getRoomNameInput = () => document.getElementById('roomNameInput').value;

        this.showStartGameButton = () => {
            var button = document.createElement("button");
            button.id = "startGameButton";
            button.innerHTML = "Start game";
            document.getElementById('startGameButtonContainer').appendChild(button);
        }

        //"Room"

        this.setRoomName = name => document.getElementById('roomTitle').innerHTML = name;

        this.resetStartGameButton = () => document.getElementById('startGameButtonContainer').innerHTML = "";

        this.refreshRoom = () => {
            var spectatorsBody = document.getElementById('spectatorsBody');
            spectatorsBody.innerHTML = "";
            app.player.room.spectators.forEach(spectator => {
                var tr = document.createElement("tr");
                tr.innerHTML = spectator;
                spectatorsBody.appendChild(tr);
            });
            var player1Body = document.getElementById('player1Body');
            player1Body.innerHTML = "";
            if (app.player.room.player1) {
                var tr = document.createElement("tr");
                tr.innerHTML = app.player.room.player1.name;
                player1Body.appendChild(tr);
            }
            var player2Body = document.getElementById('player2Body');
            player2Body.innerHTML = "";
            if (app.player.room.player2) {
                var tr = document.createElement("tr");
                tr.innerHTML = app.player.room.player2.name;
                player2Body.appendChild(tr);
            }
        }
        
        //INIT

        //"Start"

        var startMenu = document.createElement("div");
        startMenu.id = "startMenu";

        var startTitle = document.createElement("p");
        startTitle.id = "startTitle";
        startTitle.innerHTML = "CGB3";

        var nicknameInput = document.createElement("input");
        nicknameInput.id = "nicknameInput";
        nicknameInput.type = "text";
        nicknameInput.placeholder = "Enter nickname";
        nicknameInput.maxLength = 15;
        nicknameInput.autofocus = true;

        var startButton = document.createElement("button");
        startButton.id = "startButton";
        startButton.innerHTML = "Play";
        startButton.onclick = () => app.submitNickname();

        startMenu.appendChild(startTitle);
        startMenu.appendChild(nicknameInput);
        startMenu.appendChild(startButton);
        document.body.appendChild(startMenu);

        //"Rooms"
        
        var roomsMenu = document.createElement("div");
        roomsMenu.id = "roomsMenu";

        var roomsTable = document.createElement("table");
        roomsTable.id = "roomsTable";

        var roomsTableCaption = document.createElement("caption");
        roomsTableCaption.innerHTML = "Room List";

        var roomsTableThead = document.createElement("thead");
        var roomsTableTheadTr = document.createElement("tr");
        var roomsTableTheadTrTh = document.createElement("th");
        roomsTableTheadTrTh.innerHTML = "Name";

        var roomsTableTbody = document.createElement("tbody");
        roomsTableTbody.id = "roomsTableBody";

        var roomsOptions = document.createElement("div");
        roomsOptions.id = "roomsOptions";

        var joinRoom = document.createElement("button");
        joinRoom.id = "joinRoom";
        joinRoom.className = 'unselectable';
        joinRoom.innerHTML = "Join Room";
        joinRoom.onclick = () => app.joinRoom('roomsMenu', app.selectedRoom);
        
        var createRoomMenu = document.createElement("button");
        createRoomMenu.innerHTML = "Create Room";
        createRoomMenu.onclick = () => app.createRoomMenu();

        roomsTableTheadTr.appendChild(roomsTableTheadTrTh);
        roomsTableThead.appendChild(roomsTableTheadTr);
        roomsTable.appendChild(roomsTableCaption);
        roomsTable.appendChild(roomsTableThead);
        roomsTable.appendChild(roomsTableTbody);
        roomsOptions.appendChild(joinRoom);
        roomsOptions.appendChild(createRoomMenu);
        roomsMenu.appendChild(roomsTable);
        roomsMenu.appendChild(roomsOptions);
        document.body.appendChild(roomsMenu);

        //"Create room"

        var createMenu = document.createElement("div");
        createMenu.id = "createMenu";

        var createTitle = document.createElement("div");
        createTitle.id = "createTitle";
        createTitle.innerHTML = "Create Room";

        var roomNameInput = document.createElement("input");
        roomNameInput.id = "roomNameInput";
        roomNameInput.type = "text";
        roomNameInput.placeholder = "Enter room name";
        roomNameInput.maxLength = 35;
        
        var createButton = document.createElement("button");
        createButton.id = "createButton";
        createButton.innerHTML = "Create";
        createButton.onclick = () => app.createRoom();
        
        var cancelButton = document.createElement("button");
        cancelButton.id = "cancelButton";
        cancelButton.innerHTML = "Cancel";
        cancelButton.onclick = () => app.joinLobby('createMenu');

        createMenu.appendChild(createTitle);
        createMenu.appendChild(roomNameInput);
        createMenu.appendChild(createButton);
        createMenu.appendChild(cancelButton);
        document.body.appendChild(createMenu);

        //"Room"

        var roomMenu = document.createElement("div");
        roomMenu.id = "roomMenu";
        
        var roomTitle = document.createElement("p");
        roomTitle.id = "roomTitle";

        var startGameButtonContainer = document.createElement("div");
        startGameButtonContainer.id = "startGameButtonContainer";

        var tableContainer = document.createElement("div");
        tableContainer.id = "tableContainer";

        var player1 = document.createElement("table");
        player1.id = "player1";
        var player1Caption = document.createElement("caption");
        player1Caption.innerHTML = "Player 1";
        var player1Body = document.createElement("tbody");
        player1Body.id = "player1Body";
        player1Body.onclick = () => app.changeRole('player1');

        var spectators = document.createElement("table");
        spectators.id = "spectators";
        var spectatorsCaption = document.createElement("caption");
        spectatorsCaption.innerHTML = "Spectators";
        var spectatorsBody = document.createElement("tbody");
        spectatorsBody.id = "spectatorsBody";
        spectatorsBody.onclick = () => app.changeRole('spectator');

        var player2 = document.createElement("table");
        player2.id = "player2";
        var player2Caption = document.createElement("caption");
        player2Caption.innerHTML = "Player 2";
        var player2Body = document.createElement("tbody");
        player2Body.id = "player2Body";
        player2Body.onclick = () => app.changeRole('player2');

        var leaveButton = document.createElement("button");
        leaveButton.id = "leaveButton";
        leaveButton.innerHTML = "Leave";
        leaveButton.onclick = () => app.leaveRoom();

        player1.appendChild(player1Caption);
        player1.appendChild(player1Body);
        spectators.appendChild(spectatorsCaption);
        spectators.appendChild(spectatorsBody);
        player2.appendChild(player2Caption);
        player2.appendChild(player2Body);
        tableContainer.appendChild(player1);
        tableContainer.appendChild(spectators);
        tableContainer.appendChild(player2);
        roomMenu.appendChild(roomTitle);
        roomMenu.appendChild(startGameButtonContainer);
        roomMenu.appendChild(tableContainer);
        roomMenu.appendChild(leaveButton);
        document.body.appendChild(roomMenu);
    }
}