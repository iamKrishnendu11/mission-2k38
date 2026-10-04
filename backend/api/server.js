const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { Chat, Message, User, Profile } = require('./models');

// Load env vars
dotenv.config();

const app = express();
const server = http.createServer(app);

// CORS setup
const corsOptions = {
  origin: '*', // For hackathon demo, allow all
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
app.use(express.json());

// Socket.io configuration
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Import route files
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const videoRoutes = require('./routes/videos');
const socialRoutes = require('./routes/social');
const tournamentRoutes = require('./routes/tournaments');

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/tournaments', tournamentRoutes);

// Stripe payments placeholder integration
app.post('/api/checkout/session', async (req, res) => {
  try {
    const { amount, planName } = req.body;
    // Mock Stripe checkout session
    res.json({
      id: `cs_test_${Date.now()}`,
      url: `http://localhost:3000/dashboard?payment_success=true&plan=${planName}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mission2k38';
console.log(`Connecting to MongoDB at: ${MONGODB_URI}`);

mongoose.connect(MONGODB_URI)
  .then(() => console.log('[✓] MongoDB Connected'))
  .catch(err => {
    console.error('[X] MongoDB Connection Error:', err.message);
    console.log('Ensure MongoDB is installed and running locally, or replace MONGODB_URI in .env');
  });

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`New Socket Client Connected: ${socket.id}`);

  // Join user to their personal notification room
  socket.on('join_user', (userId) => {
    socket.join(userId);
    console.log(`User joined personal channel: ${userId}`);
  });

  // Join a specific chat room
  socket.on('join_chat', (chatId) => {
    socket.join(chatId);
    console.log(`User joined chat room: ${chatId}`);
  });

  // Send message event
  socket.on('send_message', async (data) => {
    try {
      const { chatId, senderId, text, mediaUrl, mediaType } = data;

      // Save message in DB
      const message = new Message({
        chat: chatId,
        sender: senderId,
        text,
        mediaUrl,
        mediaType,
        seen: false
      });
      await message.save();

      // Update Chat last message
      await Chat.findByIdAndUpdate(chatId, {
        lastMessage: text || '[Media Shared]',
        lastMessageAt: new Date()
      });

      const senderProfile = await Profile.findOne({ user: senderId });

      // Emit message to everyone in the chat room
      io.to(chatId).emit('receive_message', {
        ...message.toObject(),
        senderName: senderProfile ? senderProfile.name : 'User'
      });

      // Broadcast update notice for chat lists
      const chat = await Chat.findById(chatId);
      chat.participants.forEach(userId => {
        if (userId.toString() !== senderId) {
          io.to(userId.toString()).emit('chat_list_update');
        }
      });

    } catch (err) {
      console.error('Socket message save error:', err);
    }
  });

  // Typing status triggers
  socket.on('typing', (data) => {
    const { chatId, userId, userName, isTyping } = data;
    socket.to(chatId).emit('typing_status', { userId, userName, isTyping });
  });

  // Seen status updates
  socket.on('mark_seen', async (data) => {
    const { chatId, userId } = data;
    await Message.updateMany({ chat: chatId, sender: { $ne: userId } }, { seen: true });
    socket.to(chatId).emit('marked_seen_status', { chatId });
  });

  socket.on('disconnect', () => {
    console.log(`Socket Client Disconnected: ${socket.id}`);
  });
});

// Root API response
app.get('/api', (req, res) => {
  res.json({ message: 'Mission 2K38 Node.js REST API Server is active!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global Error Handler:', err.stack);
  res.status(500).json({ error: 'Internal Server Error: ' + err.message });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`[✓] Express Backend running on port ${PORT}`);
});
