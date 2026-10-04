const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');
const authRoutes = require('./api/routes/auth');
const uploadRoutes = require('./routes/upload');
const dashboardRoutes = require('./api/routes/dashboard');
const socialRoutes = require('./api/routes/social');
const tournamentRoutes = require('./api/routes/tournaments');
const videoRoutes = require('./api/routes/videos');
const trialRoutes = require('./api/routes/trials');
const errorHandler = require('./middleware/errorHandler');

const path = require('path');

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Mission 2K38 API is running',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/trials', trialRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/api', (req, res) => {
  res.json({ message: 'Mission 2K38 API server is active' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use(errorHandler);

const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  }
});

app.set('io', io);

const { Chat, Message, Notification, Profile } = require('./api/models');

io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    if (userId) socket.join(`user_${userId}`);
  });

  socket.on('join_user', (userId) => {
    if (userId) socket.join(`user_${userId}`);
  });

  socket.on('join_chat', (chatId) => {
    if (chatId) socket.join(`chat_${chatId}`);
  });

  socket.on('send_message', async (data) => {
    const { chatId, senderId, text, mediaUrl, mediaType } = data || {};
    if (!chatId || !senderId) return;

    try {
      const message = new Message({
        chat: chatId,
        sender: senderId,
        text: text || '',
        mediaUrl: mediaUrl || '',
        mediaType: mediaType || undefined
      });
      await message.save();

      const chat = await Chat.findById(chatId);
      if (chat) {
        let snippet = text || (mediaType === 'video' ? '📹 Video Attachment' : '📷 Image Attachment');
        chat.lastMessage = snippet;
        chat.lastMessageAt = new Date();
        await chat.save();

        const receiverId = chat.participants.find(p => p.toString() !== senderId.toString());
        if (receiverId) {
          const senderProfile = await Profile.findOne({ user: senderId });
          const notif = new Notification({
            user: receiverId,
            type: 'message',
            title: `💬 New message from ${senderProfile?.name || 'Someone'}`,
            message: snippet,
            data: { chatId: chat._id }
          });
          await notif.save();

          io.to(`user_${receiverId.toString()}`).emit('notification:new', notif);
          io.to(`user_${receiverId.toString()}`).emit('chat_list_update', { chatId: chat._id });
        }
      }

      io.to(`chat_${chatId}`).emit('receive_message', message);
    } catch (err) {
      console.error('[Socket.io send_message Error]:', err.message);
    }
  });

  socket.on('typing', (data) => {
    if (data && data.chatId) {
      socket.to(`chat_${data.chatId}`).emit('typing_status', data);
    }
  });

  socket.on('mark_seen', async (data) => {
    if (data && data.chatId) {
      await Message.updateMany({ chat: data.chatId, sender: { $ne: data.userId } }, { seen: true });
      io.to(`chat_${data.chatId}`).emit('marked_seen_status', { chatId: data.chatId });
    }
  });
});

const PORT = process.env.PORT || 5000;

connectDB()
  .then((connected) => {
    if (!connected) {
      console.warn('[!] MongoDB connection failed. Server running in degraded mode.');
    }

    server.listen(PORT, () => {
      console.log(`[✓] Express backend + Socket.io running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('[✗] Unexpected error while connecting to MongoDB:', error);
    server.listen(PORT, () => {
      console.log(`[✓] Express backend running on port ${PORT} (DB disconnected)`);
    });
  });
