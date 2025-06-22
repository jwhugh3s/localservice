const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Route for the root path to serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Route for handling contact form submission
app.post('/send-contact-form', (req, res) => {
    const {
        name,
        phone,
        location, // Added
        "service-type": serviceType,
        message,
        "vehicle-make": vehicleMake, // Added
        "vehicle-model": vehicleModel, // Added
        "vehicle-year": vehicleYear, // Added
        "license-plate": licensePlate // Added
    } = req.body;

    // Basic validation
    if (!name || !phone || !location || !serviceType) {
        return res.status(400).json({ success: false, message: 'Name, phone, location, and service type are required.' });
    }

    // Phone validation (basic regex, similar to client-side but can be more robust)
    if (!/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(phone)) {
        return res.status(400).json({ success: false, message: 'Invalid phone number format.' });
    }

    // Conditional validation for oil change
    if (serviceType === 'oil-change') {
        if (!vehicleMake || !vehicleModel || !vehicleYear || !licensePlate) {
            return res.status(400).json({ success: false, message: 'Vehicle make, model, year, and license plate are required for oil change service.' });
        }
        if (!/^\d{4}$/.test(vehicleYear) || parseInt(vehicleYear) < 1900 || parseInt(vehicleYear) > new Date().getFullYear() + 1) {
            return res.status(400).json({ success: false, message: 'Invalid vehicle year.' });
        }
    }

    // Create a transporter object using SMTP transport
    const transporter = nodemailer.createTransport({
        service: 'gmail', // Or your email provider
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.RECIPIENT_EMAIL,
        subject: `New Service Request from ${name}`,
        html: `
            <p>You have a new service request:</p>
            <ul>
                <li><strong>Name:</strong> ${name}</li>
                <li><strong>Phone:</strong> ${phone}</li>
                <li><strong>Location:</strong> ${location}</li>
                <li><strong>Service Type:</strong> ${serviceType}</li>
                ${serviceType === 'oil-change' ? `
                <li><strong>Vehicle Make:</strong> ${vehicleMake}</li>
                <li><strong>Vehicle Model:</strong> ${vehicleModel}</li>
                <li><strong>Vehicle Year:</strong> ${vehicleYear}</li>
                <li><strong>License Plate:</strong> ${licensePlate}</li>
                ` : ''}
                <li><strong>Message:</strong> ${message || 'N/A'}</li>
            </ul>
        `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            return res.status(500).json({ success: false, message: 'Failed to send message. Please try again later.' });
        }
        console.log('Email sent:', info.response);
        res.status(200).json({ success: true, message: 'Message sent successfully!' });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
