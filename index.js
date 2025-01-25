const express = require('express');
const app = express();

// Define the root route
app.get('/', (req, res) => {
    const phone = req.query.phone;
    const otp = req.query.otp;

    if (!phone || !otp) {
        return res.status(400).json({
            message: 'Phone number and OTP are required',
            status: 'error',
        });
    }

    res.status(200).json({
        message: `OTP ${otp} received for phone ${phone}`,
        status: 'success',
    });
});

// Start the server (for local testing)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

