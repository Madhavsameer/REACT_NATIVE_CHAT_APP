const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Server } = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb+srv://madhav:srpan@madhav.maixxih.mongodb.net/chat', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
});
const User = mongoose.model('User', userSchema);

// Message Schema
const messageSchema = new mongoose.Schema({
    username: { type: String, required: true }, // Sender
    message: { type: String, required: true },
    recipient: { type: String, default: 'all' }, // 'all' for public, username for private
    timestamp: { type: Date, default: Date.now },
});
const Message = mongoose.model('Message', messageSchema);

// API to register a user
app.post('/users/register', async (req, res) => {
    const { username } = req.body;
    try {
        const newUser = new User({ username });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(400).json({ error: 'Username already exists' });
    }
});

// API to get all users
app.get('/users', async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// API to get private messages between two users
app.get('/messages/private/:username/:recipient', async (req, res) => {
    const { username, recipient } = req.params;
    try {
        const privateMessages = await Message.find({
            $or: [
                { username, recipient },
                { username: recipient, recipient: username }
            ]
        }).sort({ timestamp: 1 });
        res.json(privateMessages);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch private messages' });
    }
});

// Socket.io for messaging
io.on('connection', (socket) => {
    console.log('A user connected');

    // Join a user to a specific room
    socket.on('join', (username) => {
        socket.username = username;
        socket.join(username);
        console.log(`${username} joined the chat`);
    });

    // Listen for public messages
    socket.on('public message', async (data) => {
        const { username, message } = data;
        if (!username || !message) {
            return console.error('Username and message are required');
        }

        try {
            const newMessage = new Message({ username, message });
            await newMessage.save();
            io.emit('public message', newMessage); // Emit to all clients
        } catch (error) {
            console.error('Failed to send public message', error);
        }
    });

    // Listen for private messages
    socket.on('private message', async (data) => {
        const { username, message, recipient } = data;
        if (!username || !message || !recipient) {
            return console.error('Username, message, and recipient are required');
        }

        try {
            const privateMessage = new Message({ username, message, recipient });
            await privateMessage.save();
            socket.to(recipient).emit('private message', privateMessage); // Emit to specific recipient
        } catch (error) {
            console.error('Failed to send private message', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

server.listen(5000, () => {
    console.log('Server is running on port 5000');
});
