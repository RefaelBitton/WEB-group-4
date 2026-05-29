require('dotenv').config();
const express = require('express');
const cors = require('cors');
const chatRoutes = require('./routes/chat');

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
// Enable CORS for testing since API Gateway is not yet built
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/bot', chatRoutes);

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'Bot/AI Service' });
});

app.listen(PORT, () => {
  console.log(`Bot/AI Service running on port ${PORT}`);
});
