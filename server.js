const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const PORT = 3000;

// Serve static files from the 'public' folder
app.use(express.static('public'));

// Handle socket connections
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('join-room', (room, username) => {
        socket.join(room);
        socket.to(room).emit('message', `${username} has joined the room`);

        socket.on('send-message', (message) => {
            io.to(room).emit('message', `${username}: ${message}`);
        });

        socket.on('disconnect', () => {
            io.to(room).emit('message', `${username} has left the room`);
        });
    });
});

// Start the server
http.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
