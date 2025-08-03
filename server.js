const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// In-memory storage (in production, use Redis or database)
const rooms = new Map();
const users = new Map();
const messageHistory = new Map();

// Serve static files from the 'public' folder
app.use(express.static('public'));

// Test route
app.get('/test', (req, res) => {
  res.sendFile(__dirname + '/public/test.html');
});

// Middleware for logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// API endpoints
app.get('/api/rooms', (req, res) => {
  const roomList = Array.from(rooms.keys()).map(roomName => ({
    name: roomName,
    userCount: rooms.get(roomName).size,
    isPrivate: roomName.startsWith('private-')
  }));
  res.json(roomList);
});

app.get('/api/room/:roomName/messages', (req, res) => {
  const { roomName } = req.params;
  const messages = messageHistory.get(roomName) || [];
  res.json(messages.slice(-50)); // Return last 50 messages
});

// Handle socket connections
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  let currentUser = null;
  let currentRoom = null;

  // Join room handler
  socket.on('join-room', (roomName, username) => {
    console.log('Join room request:', { roomName, username, socketId: socket.id });
    
    try {
      // Validate input
      if (!roomName || !username) {
        console.log('Validation failed: missing room or username');
        socket.emit('error', 'Room name and username are required');
        return;
      }

      if (username.length < 2 || username.length > 20) {
        console.log('Validation failed: username length');
        socket.emit('error', 'Username must be between 2 and 20 characters');
        return;
      }

      if (roomName.length < 1 || roomName.length > 30) {
        console.log('Validation failed: room name length');
        socket.emit('error', 'Room name must be between 1 and 30 characters');
        return;
      }

      // Check if username is already taken in this room
      const roomUsers = rooms.get(roomName) || new Set();
      if (roomUsers.has(username)) {
        console.log('Validation failed: username already taken');
        socket.emit('error', 'Username is already taken in this room');
        return;
      }

      // Leave previous room if any
      if (currentRoom) {
        socket.leave(currentRoom);
        const prevRoomUsers = rooms.get(currentRoom);
        if (prevRoomUsers) {
          prevRoomUsers.delete(currentUser);
          if (prevRoomUsers.size === 0) {
            rooms.delete(currentRoom);
          } else {
            io.to(currentRoom).emit('user-left', currentUser);
            io.to(currentRoom).emit('user-count-update', prevRoomUsers.size);
          }
        }
      }

      // Join new room
      socket.join(roomName);
      currentUser = username;
      currentRoom = roomName;

      // Initialize room if it doesn't exist
      if (!rooms.has(roomName)) {
        rooms.set(roomName, new Set());
        messageHistory.set(roomName, []);
      }

      // Add user to room
      rooms.get(roomName).add(username);
      users.set(socket.id, { username, room: roomName });

      console.log('Room joined successfully:', { roomName, username, userCount: rooms.get(roomName).size });

      // Send room joined confirmation
      socket.emit('room-joined', {
        roomName,
        userCount: rooms.get(roomName).size,
        messages: messageHistory.get(roomName).slice(-20) // Send last 20 messages
      });

      // Notify other users
      socket.to(roomName).emit('user-joined', username);
      io.to(roomName).emit('user-count-update', rooms.get(roomName).size);

      console.log(`${username} joined room: ${roomName}`);

    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('error', 'Failed to join room');
    }
  });

  // Send message handler
  socket.on('send-message', (message) => {
    try {
      if (!currentUser || !currentRoom) {
        socket.emit('error', 'You must join a room first');
        return;
      }

      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return;
      }

      if (message.length > 1000) {
        socket.emit('error', 'Message too long (max 1000 characters)');
        return;
      }

      const messageData = {
        id: Date.now() + Math.random(),
        message: message.trim(),
        username: currentUser,
        timestamp: new Date(),
        room: currentRoom
      };

      // Store message in history
      if (!messageHistory.has(currentRoom)) {
        messageHistory.set(currentRoom, []);
      }
      messageHistory.get(currentRoom).push(messageData);

      // Keep only last 100 messages per room
      if (messageHistory.get(currentRoom).length > 100) {
        messageHistory.set(currentRoom, messageHistory.get(currentRoom).slice(-100));
      }

      // Broadcast to room
      io.to(currentRoom).emit('message', messageData);

    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', 'Failed to send message');
    }
  });

  // Typing indicators
  socket.on('typing', () => {
    if (currentUser && currentRoom) {
      socket.to(currentRoom).emit('typing', currentUser);
    }
  });

  socket.on('stop-typing', () => {
    if (currentUser && currentRoom) {
      socket.to(currentRoom).emit('stop-typing', currentUser);
    }
  });

  // Leave room handler
  socket.on('leave-room', () => {
    if (currentRoom && currentUser) {
      socket.leave(currentRoom);
      const roomUsers = rooms.get(currentRoom);
      if (roomUsers) {
        roomUsers.delete(currentUser);
        if (roomUsers.size === 0) {
          rooms.delete(currentRoom);
          messageHistory.delete(currentRoom);
        } else {
          io.to(currentRoom).emit('user-left', currentUser);
          io.to(currentRoom).emit('user-count-update', roomUsers.size);
        }
      }
      users.delete(socket.id);
      currentUser = null;
      currentRoom = null;
    }
  });

  // Disconnect handler
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    if (currentRoom && currentUser) {
      const roomUsers = rooms.get(currentRoom);
      if (roomUsers) {
        roomUsers.delete(currentUser);
        if (roomUsers.size === 0) {
          rooms.delete(currentRoom);
          messageHistory.delete(currentRoom);
        } else {
          io.to(currentRoom).emit('user-left', currentUser);
          io.to(currentRoom).emit('user-count-update', roomUsers.size);
        }
      }
    }
    
    users.delete(socket.id);
  });

  // Get user info
  socket.on('get-user-info', () => {
    socket.emit('user-info', {
      username: currentUser,
      room: currentRoom,
      totalUsers: users.size,
      totalRooms: rooms.size
    });
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start the server
http.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📊 Total rooms: ${rooms.size}`);
  console.log(`👥 Total users: ${users.size}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  http.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
