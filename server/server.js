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
            socket.emit('welcome', name, getRoomList());
            console.log('Player "' + socket.id + '" joined as "' + name + '"');
        }
    });

    socket.on('createRoom', name => {
        if (getRoomList().includes(name) || player.room) socket.disconnect();
        else {
            player.room = new Room(name);
            rooms.set(name, player.room);
            socket.emit('redirectJoinRoom', name);
            console.log('Player "' + player.name + '" created room "' + name + '"');
        }
    });

    socket.on('joinRoom', name => {
        if (player.role || !getRoomList().includes(name)) socket.disconnect();
        else {
            player.role = 'spectator';
            rooms.get(name).spectators.push(player);
            console.log('Player "' + player.name + '" joined room "' + name + '"');
        }
    });

    socket.on('leaveRoom', name => {
        if (!user.room || !rooms.includes(name)) socket.disconnect();
        else {
            user.room = null;
            console.log('Player "' + user.name + '" leaved room "' + name + '"');
        }
    });

    socket.on('disconnect', () => {
        if (players.has(player.id)) players.delete(player.id);
        console.log('Disconnect : ' + socket.id);
    });
});

var getRoomList = () => {
    var roomList = [];
    rooms.forEach(room => roomList.push(room.name));
    return roomList;
}

http.listen(3000);