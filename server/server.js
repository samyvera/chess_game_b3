const express = require('express');
const app = express();
const http = require('http').Server(app);
var io = require('socket.io')(http);

var Player = require('./lib/player');
var Room = require('./lib/room');

app.use(express.static(__dirname + '/../client'));

var sockets = new Map();
var players = new Map();
var rooms = new Map();

io.on('connection', socket => {
    var player = new Player(socket.id);
    console.log('Connection : ' + socket.id);

    socket.on('join', name => {
        if (players.has(player.id)) socket.disconnect();
        else {
            sockets.set(player.id, socket);
            players.set(player.id, player);
            player.name = name;
            socket.emit('welcome', name, [...rooms.keys()]);
            console.log('Player "' + socket.id + '" joined as "' + name + '"');
        }
    });

    socket.on('createRoom', name => {
        if (rooms.has(name) || player.room) socket.emit('errorMessage', "Error : Can't create room");
        else {
            player.room = new Room(name);
            rooms.set(name, player.room);
            socket.emit('redirectJoinRoom', name);
            players.forEach(player => sockets.get(player.id).emit('roomList', [...rooms.keys()]));
            console.log('Player "' + player.name + '" created room "' + name + '"');
        }
    });

    socket.on('joinRoom', name => {
        if (!rooms.has(name)) socket.disconnect();
        else {
            rooms.get(name).players.set(player.id, player);
            console.log('Player "' + player.name + '" joined room "' + name + '"');
        }
    });

    socket.on('leaveRoom', name => {
        if (!rooms.has(name) || !rooms.get(name).players.has(player.id)) socket.disconnect();
        else {
            rooms.get(name).players.delete(player.id);
            if (player.role === 'player1' || player.role === 'player2') rooms.get(name).roles.delete(player.role);
            else if (player.role === 'spectator') rooms.get(name).roles.set(player.role, rooms.get(name).roles.get(player.role).filter(p => p.id !== player.id));
            player.role = null;
            var spectators = [];
            rooms.get(name).roles.get('spectator').forEach(spectator => spectators.push(spectator.name));
            rooms.get(name).players.forEach(player => sockets.get(player.id).emit('roomInfos', {
                player1: rooms.get(name).roles.get('player1'),
                player2: rooms.get(name).roles.get('player2'),
                spectators: spectators
            }));

            if (player.room && player.room.name === rooms.get(name).name) {
                player.room.players.forEach(player => {
                    if (player.role === 'player1' || player.role === 'player2') rooms.get(name).roles.delete(player.role);
                    else if (player.role === 'spectator') rooms.get(name).roles.set(player.role, rooms.get(name).roles.get(player.role).filter(p => p.id !== player.id));
                    player.role = null;
                    sockets.get(player.id).emit('redirectLeaveRoom');
                });
                player.room = null;
                rooms.delete(name);
                players.forEach(player => sockets.get(player.id).emit('roomList', [...rooms.keys()]));
                console.log('Player "' + player.name + '" leaved and deleted room "' + name + '"');
            }
            else console.log('Player "' + player.name + '" leaved room "' + name + '"');
        }
    });

    socket.on('changeRole', p => {
        if (!rooms.has(p.roomName) || (p.newRole !== 'spectator' && p.newRole !== 'player1' && p.newRole !== 'player2') ||
            (p.newRole === 'player1' && rooms.get(p.roomName).roles.has('player1')) || (p.newRole === 'player2' && rooms.get(p.roomName).roles.has('player2'))) socket.disconnect();
        else {
            var room = rooms.get(p.roomName);
            if (player.role === 'player1') room.roles.delete('player1');
            if (player.role === 'player2') room.roles.delete('player2');
            if (player.role === 'spectator') room.roles.set('spectator', room.roles.get('spectator').filter(p => p.id !== player.id));

            player.role = p.newRole;
            if (p.newRole === 'player1') room.roles.set('player1', player);
            else if (p.newRole === 'player2') room.roles.set('player2', player);
            else if (p.newRole === 'spectator') room.roles.get('spectator').push(player);
            var spectators = [];
            room.roles.get('spectator').forEach(spectator => spectators.push(spectator.name));
            room.players.forEach(player => sockets.get(player.id).emit('roomInfos', {
                player1:room.roles.get('player1'),
                player2:room.roles.get('player2'),
                spectators:spectators
            }));
        }
    });

    socket.on('disconnect', () => {
        var room = null;
        rooms.forEach(r => r.players.forEach(p => {
            if (p.id === player.id) room = r;
        }));

        if (room) {
            room.players.delete(player.id);
            if (player.role === 'player1' || player.role === 'player2') room.roles.delete(player.role);
            else if (player.role === 'spectator') room.roles.set(player.role, room.roles.get(player.role).filter(p => p.id !== player.id));
            player.role = null;
            var spectators = [];
            room.roles.get('spectator').forEach(spectator => spectators.push(spectator.name));
            room.players.forEach(player => sockets.get(player.id).emit('roomInfos', {
                player1: room.roles.get('player1'),
                player2: room.roles.get('player2'),
                spectators: spectators
            }));
        }
        
        if (players.has(player.id)) {
            if (player.room) {
                player.room.players.forEach(player => {
                    player.role = null;
                    sockets.get(player.id).emit('redirectLeaveRoom');
                });
                rooms.delete(player.room.name);
                players.forEach(player => sockets.get(player.id).emit('roomList', [...rooms.keys()]));
                console.log('Player "' + player.name + '" leaved and deleted room "' + player.room.name + '"');
            }
            players.delete(player.id);
        }
        console.log('Disconnect : ' + socket.id);
    });
});

http.listen(process.env.PORT || 3000);