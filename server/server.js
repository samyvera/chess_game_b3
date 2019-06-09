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
        if (player.role || !rooms.has(name)) socket.disconnect();
        else {
            player.role = 'spectator';
            rooms.get(name).players.set(player.id, player);
            console.log('Player "' + player.name + '" joined room "' + name + '"');
        }
    });

    socket.on('leaveRoom', name => {
        if (!rooms.has(name) || !rooms.get(name).players.has(player.id)) socket.disconnect();
        else {
            rooms.get(name).players.delete(player.id);
            player.role = null;
            if (player.room && player.room.name === rooms.get(name).name) {
                player.room.players.forEach(player => {
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

    socket.on('disconnect', () => {
        if (players.has(player.id)) players.delete(player.id);
        console.log('Disconnect : ' + socket.id);
    });
});

http.listen(3000);