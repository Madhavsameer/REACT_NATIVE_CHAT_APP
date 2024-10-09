const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const mongoURI = 'mongodb+srv://madhav:srpan@madhav.maixxih.mongodb.net/chat'; // Replace with your MongoDB URI if using Atlas
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

// Define a message schema
const messageSchema = new mongoose.Schema({
    username: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.model('Message', messageSchema);

// Define a user schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true }, // Username must be unique
});

const User = mongoose.model('User', userSchema);

// API to get messages
app.get('/messages', async (req, res) => {
    try {
        const messages = await Message.find().sort({ timestamp: 1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// API to post messages
app.post('/messages', async (req, res) => {
    const { username, message } = req.body;
    const newMessage = new Message({ username, message });

    try {
        await newMessage.save();
        io.emit('chat message', newMessage); // Broadcast message to all clients
        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// API to get all users
app.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// API to register a new user
app.post('/users', async (req, res) => {
    const { username } = req.body;

    const newUser = new User({ username });

    try {
        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        if (error.code === 11000) { // Handle duplicate username error
            return res.status(400).json({ error: 'Username already exists' });
        }
        res.status(500).json({ error: 'Failed to register user' });
    }
});

io.on('connection', (socket) => {
    console.log('A user connected');

    // Load messages from the database on new connection
    Message.find().sort({ timestamp: 1 }).then((messages) => {
        socket.emit('chat history', messages);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
