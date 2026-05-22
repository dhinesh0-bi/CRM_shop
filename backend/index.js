const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

// Socket.io Connection
io.on('connection', (socket) => {
  console.log('Admin connected to Dashboard');
});

// Basic Route for Testing
app.get('/', (req, res) => res.send('CRM Backend Running'));

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));