const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('public'));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/chat', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'chat.html'));
});

// Store active users
const users = {};
const rooms = {};

// Socket.io connection
io.on('connection', (socket) => {
  console.log(`New user connected: ${socket.id}`);

  // User joins
  socket.on('join', (data) => {
    const { username, room } = data;
    users[socket.id] = { username, room, socketId: socket.id };
    socket.join(room);

    if (!rooms[room]) {
      rooms[room] = [];
    }
    rooms[room].push(socket.id);

    // Notify others
    socket.broadcast.to(room).emit('userJoined', {
      username,
      message: `${username}がチャットに参加しました`,
      timestamp: new Date().toLocaleTimeString('ja-JP')
    });

    // Send online users count
    io.to(room).emit('onlineCount', rooms[room].length);
  });

  // Send message
  socket.on('sendMessage', (data) => {
    const user = users[socket.id];
    if (user) {
      io.to(user.room).emit('receiveMessage', {
        username: user.username,
        message: data.message,
        timestamp: new Date().toLocaleTimeString('ja-JP'),
        isOwn: false,
        socketId: socket.id
      });
    }
  });

  // User is typing
  socket.on('typing', () => {
    const user = users[socket.id];
    if (user) {
      socket.broadcast.to(user.room).emit('userTyping', {
        username: user.username
      });
    }
  });

  // Stop typing
  socket.on('stopTyping', () => {
    const user = users[socket.id];
    if (user) {
      socket.broadcast.to(user.room).emit('userStopTyping', {
        username: user.username
      });
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    const user = users[socket.id];
    if (user) {
      socket.broadcast.to(user.room).emit('userLeft', {
        username: user.username,
        message: `${user.username}がチャットから退出しました`,
        timestamp: new Date().toLocaleTimeString('ja-JP')
      });

      if (rooms[user.room]) {
        rooms[user.room] = rooms[user.room].filter(id => id !== socket.id);
        io.to(user.room).emit('onlineCount', rooms[user.room].length);
      }
    }
    delete users[socket.id];
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
