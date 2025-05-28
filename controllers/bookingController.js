const Booking = require('../models/Booking');
const Refund = require('../models/Refund');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const multer = require('multer');
const AWS = require('aws-sdk');
const dotenv = require("dotenv");
const Commision = require('../models/Commision');
dotenv.config({ path: "./config.env" });

const {promisify} = require('util');
const jwt = require('jsonwebtoken')

const bucketName = process.env.BUCKET_NAME
const bucketRegion = process.env.BUCKET_REGION
const accessKey = process.env.ACCESS_KEY
const secretAccessKey = process.env.SECRET_ACCESS_KEY

AWS.config.update({
    accessKeyId: accessKey,
    secretAccessKey: secretAccessKey,
    region: bucketRegion
})

const s3 = new AWS.S3()

const privateKeyPem = fs.readFileSync('/home/ubuntu/Backend/backend/BE10000115.key', 'utf-8');
exports.signChecksum = (req, res) => {
    const {
        bfs_benfBankCode,
        bfs_benfId,
        bfs_benfTxnTime,
        bfs_msgType,
        bfs_orderNo,
        bfs_paymentDesc,
        bfs_remitterEmail,
        bfs_txnAmount,
        bfs_txnCurrency,
        bfs_version,
    } = req.body;
    const checksumString = `${bfs_benfBankCode}|${bfs_benfId}|${bfs_benfTxnTime}|${bfs_msgType}|${bfs_orderNo}|${bfs_paymentDesc}|${bfs_remitterEmail}|${bfs_txnAmount}|${bfs_txnCurrency}|${bfs_version}`;
    const sign = crypto.createSign('RSA-SHA1');
    sign.update(checksumString);   
    const privateKey = privateKeyPem;
    const signature = sign.sign(privateKey, 'hex');
    const f_signature = signature.toUpperCase();
    res.json({ f_signature });
}
const terms = [
    "If you wish to change routes, please contact us within 24 hours. After this period, a new reservation will be required.",
    "For booking confi rmation, 100% of the charter fee has to be deposited latest by 72 hours from departure, unless it's a medical evacuation or emergency flight.",
    "All advance deposit will be refunded if the fl ight is cancelled 24 hours before the requested departure by the passenger and also if the fl ight is cancelled by Drukair -Helicopter Service.",
    "If the fl ight cancellation is within 24 hours by the passenger, the amount deposit will be forfeited.",
    "Payment can be made using MasterCard, Visa, and Maestro credit cards, but an additional charge will apply for all payments made through credit cards.",
];

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024, 
    },
  });

exports.uploadPaymentImages = upload.array('image', 10);


exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find().populate('service_id').populate('destination').populate('assigned_pilot').populate('refund_id');
        res.status(200).json({ data: bookings, status: 'success' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.createBooking = async (req, res) => {
    try {
        if (req.body.destination === "Others") {
            req.body.route_type = "Unpublished";
            req.body.destination = null;
        }

        if(req.body.assigned_pilot === "" || req.body.assigned_pilot === "null" || !req.body.assigned_pilot){
            req.body.assigned_pilot =  null;
        }
        const imageUrls = [];

        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                
                const uniqueFileName = `${Date.now()}_${file.originalname}`;
                const params = {
                Bucket: bucketName,
                Key: uniqueFileName,
                Body: file.buffer,
                ContentType: file.mimetype,
                };
                await s3.upload(params).promise();
                imageUrls.push(uniqueFileName); // Store uploaded image key
            }
        }
        
        req.body.image = imageUrls;


        if (!req.body.refund_id) {
            const refund = await Refund.findOne({ plan: 0 })
            if (!refund) {
                req.body.refund_id = null;
            } else {
                req.body.refund_id = refund._id;
            }
        }

        const booking = await Booking.create(req.body);
        if (booking.agent_email) {
            await sendBookingEmail(booking.agent_email, booking.bookingID);
            await sendBookingEmailAdmin();
        }

        res.json({
            data: booking,
            status: 'success',
            message: 'Booking created and confirmation email sent'
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getImage = async (req, res) => {
    try {
      const params = { Bucket: bucketName,
        Key: req.params.filename,
        ResponseContentDisposition: 'inline',
        Expires: 60 * 60 };
      
      const url = s3.getSignedUrl("getObject", params);
    
      res.status(200).json({ data: url, status: 'success' });
    } catch (error) {
    
      console.error('Error generating signed URL:', error);
      res.status(500).json({ error: 'Failed to generate signed URL', status: 'error' });
    }
};

exports.deleteBookingImage = async (req, res) => {
    try {
        const { bookingId, imageName } = req.params;
        if (!bookingId || !imageName) {
            return res.status(400).json({ status: "error", message: "Missing bookingId or imageName" });
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ status: "error", message: "Booking not found" });
        }

        const deleteParams = {
            Bucket: bucketName,
            Key: imageName
        };

        await s3.deleteObject(deleteParams).promise();

        booking.image = booking.image.filter(img => img !== imageName);
        await booking.save();

        res.json({ status: "success", message: "Image deleted successfully", updatedImages: booking.image });

    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};
  
exports.getBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).populate('service_id').populate('destination').populate('assigned_pilot').populate('refund_id');
        res.json({ data: booking, status: 'success' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.getBookingByBookingCid = async (req, res) => {
    const { bookingID, cid } = req.params;
    try {
        const booking = await Booking.findOne({ bookingID: bookingID, agent_cid: cid }).populate('destination').populate('service_id').populate('assigned_pilot').populate('refund_id');
        if (!booking) {
            return res.status(404).json({
                status: "error",
                message: `No booking found with ID: ${bookingID}`,
            });
        }
        res.json({ data: booking, status: 'success' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.getBookingByEmail = async (req, res) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];

        } else if (req.cookies.jwt) {
            token = req.cookies.jwt;
        }

        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

        const freshUser = await User.findById(decoded.id);
        const { email } = req.params;
        if(freshUser.email == email){
            const bookings = await Booking.find({ agent_email: email }).populate('destination').populate('service_id').populate('refund_id').populate('assigned_pilot').populate('service_id');
            if (!bookings || bookings.length === 0) {
                return res.status(404).json({
                    status: 'fail',
                    message: 'No bookings with this email',
                });
            }
            res.status(200).json({ status: 'success', data: bookings });
        }else{
            return res.status(404).json({
                status: 'fail',
                message: 'No bookings available',
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error fetching bookings',
            error: error.message,
        });
    }
};

exports.updateBooking = async (req, res) => {
    try {
        if (req.body.refund_id === "0") {
            req.body.refund_id = null;
        }

        if (req.body.destination === "Others" || req.body.destination === "null") {
            req.body.route_type = "Unpublished";
            req.body.destination = null;
        }

        if (
            req.body.assigned_pilot === "" ||
            req.body.assigned_pilot === "null" ||
            !req.body.assigned_pilot
        ) {
            req.body.assigned_pilot = null;
        }

        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ status: "error", message: "Booking not found" });
        }

        const imageUrls = [...(booking.image || [])]; 

        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const uniqueFileName = `${Date.now()}_${file.originalname}`;
                const params = {
                    Bucket: bucketName,
                    Key: uniqueFileName,
                    Body: file.buffer,
                    ContentType: file.mimetype,
                };
                await s3.upload(params).promise();
                imageUrls.push(uniqueFileName);
            }
        }

        req.body.image = imageUrls;

        Object.assign(booking, req.body);
        await booking.save();

        if (req.body.payable === true && booking.payEmail === false) {
            await sendPaymentEmail(booking.agent_email, booking.bookingID);
            booking.payEmail = true;
            await booking.save();
        }

        res.json({ data: booking, status: "success" });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
};


exports.deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findByIdAndDelete(req.params.id);
        res.json({ data: booking, status: 'success' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendBookingEmailAdmin = async () => {
    try {
        const users = await User.find().populate('role');
        const adminUsers = users.filter(user => user.role?.name === 'ADMIN');

        for (const admin of adminUsers) {
            try {
                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: admin.email,
                    subject: "New Reservation",
                    html: `
                        <!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Reservation Placed</title>
                            <style>
                                body {
                                    font-family: Arial, sans-serif;
                                    margin: 0;
                                    padding: 0;
                                    font-size: 14px;
                                    color: #000000 !important;
                                }
                                .email-header {
                                    margin-bottom: 20px;
                                }
                                .email-content {
                                    line-height: 1.6;
                                    margin-bottom: 20px;
                                }
                                .highlight {
                                    color: #1E306D;
                                    font-weight: bold;
                                }
                                .signature {
                                    font-style: italic;
                                }
                                .email-footer p:nth-child(2) {
                                    margin-top: -10px;
                                }
                            </style>
                        </head>
                        <body>
                            <div>
                                <div class="email-header">
                                    <p>Respected Sir/Madam,</p>
                                </div>
                                <div class="email-content">
                                   We would like to inform you that a new reservation has been successfully placed. Please review the details at your earliest convenience.
                                </div>
                                <div class="email-footer">
                                    <p class="signature">Best regards,</p>
                                    <p>Druk Heli Reservation (Druk Airlines)</p>
                                </div>
                            </div>
                        </body>
                        </html>
                    `,
                });
            } catch (error) {
                console.error(`Failed to send email to ${admin.email}:`, error.message);
            }
        }

    } catch (error) {
        return (error);
    }
};

const sendPaymentEmail = async (userEmail, bookingID) => {
    const info = await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: "Payment Update",
        html: `
        <!DOCTYPE html>
        <html lang="en">

        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Payment Update</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 2%;
                    padding: 0;
                    font-size: 14px;
                }

                .email-container,
                .email-container * {
                    color: #000000 !important;
                    /* Force black for all text */
                }

                .email-header {
                    margin-bottom: 20px;
                }

                .email-content {
                    line-height: 1.6;
                    margin-bottom: 20px;
                }

                .highlight {
                    color: #1E306D;
                    font-weight: bold;
                }

                .signature {
                    font-style: italic;
                }

                .email-footer p:nth-child(2) {
                    margin-top: -10px;
                }

                .container {
                    width: 90%;
                    max-width: 400px;
                    margin: 20px 0;
                    padding: 20px;
                    border: 2px solid #22326e;
                    border-radius: 5px;
                    color: black !important;
                }

                .header {
                    border-bottom: 2px solid #000000;
                    padding: 20px 0;
                    display: table;
                    width: 100%;
                }

                .terms-containerss {
                    width: 100%;
                    max-width: 360px;
                    margin: 0 auto;
                    margin-top: 5%;
                    margin-bottom: 5%;
                    justify-content: center;
                }

                .payment-section-header {
                    background-color: #22326e;
                    color: white;
                    padding: 10px;
                    margin: 20px 0 10px 0;
                    font-size: 16px;
                }
            </style>
        </head>


        <body style="color: #000000 !important;">
            <div class="email-container">
                <div class="email-header">
                    <p style="color: #000000 !important;">Respected Sir/Madam,</p>
                </div>
                <div class="email-content" style="color: #000000 !important;">
                    Thank you for placing your reservation with us. We have approved your booking and hence approved for further payment procedures. To check the status or pay for your booking,
                    please use the following reference ID:<strong>${bookingID}</strong>. We appreciate your trust in our
                    services and look forward to assisting you further.
                </div>
                <div class="email-footer" style="color: #000000 !important;">
                    <p class="signature">Best regards,</p>
                </div>
            </div>
            <div class="container">
                <div class="header">
                    <div class="header-text">
                        PAYMENT POLICIES AND PROCEDURES <span style="color: #22326e;">DRUKAIR HELI-RESERVATION</span>
                    </div>
                </div>
                <div class="payment-section-header">PAYMENT POLICIES AND PROCEDURES</div>
                <div class="terms-containerss">
                    <ul>
                        ${terms.map(term => `<li>${term}</li>`).join('')}
                    </ul>
                </div>
            </div>
        </body>

        </html>
    `
    });
    return info;
};

const sendBookingEmail = async (userEmail, bookingID) => {
    const info = await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: "Reservation Placed",
        html: `
        <!DOCTYPE html>
        <html lang="en">

        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reservation Placed</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 2%;
                    padding: 0;
                    font-size: 14px;
                }

                .email-container,
                .email-container * {
                    color: #000000 !important;
                    /* Force black for all text */
                }

                .email-header {
                    margin-bottom: 20px;
                }

                .email-content {
                    line-height: 1.6;
                    margin-bottom: 20px;
                }

                .highlight {
                    color: #1E306D;
                    font-weight: bold;
                }

                .signature {
                    font-style: italic;
                }

                .email-footer p:nth-child(2) {
                    margin-top: -10px;
                }

                .container {
                    width: 90%;
                    max-width: 400px;
                    margin: 20px 0;
                    padding: 20px;
                    border: 2px solid #22326e;
                    border-radius: 5px;
                    color: black !important;
                }

                .header {
                    border-bottom: 2px solid #000000;
                    padding: 20px 0;
                    display: table;
                    width: 100%;
                }

                .terms-containerss {
                    width: 100%;
                    max-width: 360px;
                    margin: 0 auto;
                    margin-top: 5%;
                    margin-bottom: 5%;
                    justify-content: center;
                }

                .payment-section-header {
                    background-color: #22326e;
                    color: white;
                    padding: 10px;
                    margin: 20px 0 10px 0;
                    font-size: 16px;
                }
            </style>
        </head>


        <body style="color: #000000 !important;">
            <div class="email-container">
                <div class="email-header">
                    <p style="color: #000000 !important;">Respected Sir/Madam,</p>
                </div>
                <div class="email-content" style="color: #000000 !important;">
                    Thank you for placing your reservation with us. We are currently processing your request and will send you a
                    confirmation email once your reservation has been approved. To check the status or track your booking,
                    please use the following reference ID:<strong>${bookingID}</strong>. We appreciate your trust in our
                    services and look forward to assisting you further.
                </div>
                <div class="email-footer" style="color: #000000 !important;">
                    <p class="signature">Best regards,</p>
                </div>
            </div>
            <div class="container">
                <div class="header">
                    <div class="header-text">
                        PAYMENT POLICIES AND PROCEDURES <span style="color: #22326e;">DRUKAIR HELI-RESERVATION</span>
                    </div>
                </div>
                <div class="payment-section-header">PAYMENT POLICIES AND PROCEDURES</div>
                <div class="terms-containerss">
                    <ul>
                        ${terms.map(term => `<li>${term}</li>`).join('')}
                    </ul>
                </div>
            </div>
        </body>

        </html>
    `
    });
    return info;
};

const sendDeclineEmail = async (userEmail) => {
    const information = await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: "Reservation Declined",
        html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reservation Declined</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    font-size: 14px;
                }
                .email-container, .email-container * {
                    color: #000000 !important; /* Force black for all text */
                }
                .email-header {
                    margin-bottom: 20px;
                }
                .email-content {
                    line-height: 1.6;
                    margin-bottom: 20px;
                }
                .highlight {
                    color: #1E306D;
                    font-weight: bold;
                }
                .signature {
                    font-style: italic;
                }
                .email-footer p:nth-child(2) {
                    margin-top: -10px;
                }
            </style>
        </head>

        <body style="color: #000000 !important;">
            <div class="email-container">
                <div class="email-header">
                    <p style="color: #000000 !important;">Respected Sir/Madam,</p>
                </div>
                <div class="email-content" style="color: #000000 !important;">
                    <p>We regret to inform you that your reservation has been <span class="highlight">declined</span>.
                        For further details or assistance, we kindly suggest contacting DrukAir's customer service team.
                        If you have any further questions, please feel free to email us at <a href="mailto:heli@drukair.com.bt" style="color: #1E306D;">heli@drukair.com.bt</a> or
                        contact us at <a href="tel:+97517170964" style="color: #1E306D;">17170964</a>.</p>
                    <p>Thank you for your understanding and cooperation.</p>
                </div>
                <div class="email-footer" style="color: #000000 !important;">
                    <p class="signature">Best regards,</p>
                    <p>Druk Heli Reservation (Druk Airlines)</p>
                </div>
            </div>
        </body>
        </html>
    `
    });
    return information;
};

exports.declineBookingAndSendEmail = async (req, res) => {
    try {
        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status: 'Declined' },
            { new: true }
        );
        email = booking.agent_email
        if (!booking) {
            return res.status(404).json({
                status: 'error',
                message: "Booking not found"
            });
        } else {
            await sendDeclineEmail(email);
            return res.status(200).json({
                status: 'success',
                message: "Booking declined and email sent successfully."
            });
        }
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
}

exports.approveBookingAndSendEmail = async (req, res) => {
    try {
        const commisions = await Commision.find()
        const commision = commisions[0].commisionValue / 100;
        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            {
                status: 'Confirmed',
                agent_code: req.params.agentcode
            },
            { new: true }
        ).populate('destination').populate('service_id').populate('refund_id');

        if (!booking) {
            return res.status(404).json({
                status: 'error',
                message: 'Booking not found'
            });
        }

        const imagePath = path.resolve(__dirname, '../logo-bordered.png');
        // Prepare email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: booking.agent_email,
            subject: 'Booking Approved',
            html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>E-ticket Receipt</title>
                <style type="text/css">
                body, div, p, h1, h2, h3, h4, h5, h6 {
                    margin: 0;
                    padding: 0;
                    color: black !important;
                }

                body {
                    font-family: Arial, Helvetica, sans-serif;
                    -webkit-font-smoothing: antialiased;
                    font-size: 16px;
                    line-height: 1.4;
                    margin: 0;
                    padding: 0;
                    -ms-text-size-adjust: 100%;
                    -webkit-text-size-adjust: 100%;
                }

                .container {
                    width: 100%;
                    max-width: 600px;
                    margin: 20px 0;
                    padding: 20px;
                    border: 2px solid #22326e;
                    border-radius: 5px;
                    color: black !important;
                }

                .header {
                    border-bottom: 2px solid #000000;
                    padding: 20px 0;
                    display: table;
                    width: 100%;
                }

                .header-logo {
                    display: table-cell;
                    vertical-align: middle;
                }

                .header-logo img {
                    max-height: 100px;
                    width: auto;
                }

                .header-text {
                    display: table-cell;
                    vertical-align: middle;
                    text-align: right;
                    font-size: 20px;
                    color: #22326e;
                }

                .section-header, .sub-header {
                    color: white !important;
                }

                .section-header {
                    background-color: #22326e;
                    padding: 10px;
                    margin: 20px 0 10px 0;
                    font-size: 16px;
                }

                .sub-header {
                    background-color: #404040;
                    padding: 10px;
                    margin: 10px 0;
                    font-weight: bold;
                }

                .info-row {
                    display: table;
                    width: 100%;
                    margin: 10px 0;
                    color: black !important;
                }

                .info-label, .info-value {
                    display: table-cell;
                }

                .info-label {
                    width: 50%;
                    padding-right: 10px;
                }

                .info-value {
                    width: 50%;
                    font-weight: bold;
                }

                @media screen and (max-width: 600px) {
                    .container {
                        width: 95% !important;
                        padding: 10px !important;
                    }

                    .header-text {
                        font-size: 16px !important;
                    }

                    .info-row, .info-label, .info-value {
                        display: block !important;
                        width: 100% !important;
                    }

                    .info-value {
                        margin-bottom: 10px !important;
                    }
                }
            </style>
            </head>
            <body style="font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 0;">
                <p style="color: black;">Dear Madam/Sir,</p>
                <p style="color: black;">YOU WILL FIND ATTACHED TO THIS EMAIL YOUR E-TICKET(S).</p>
                <p style="color: black;">Your booking reference is <strong>${booking.bookingID}</strong>. Please refer to it each time you need to contact our services.</p>
                <p style="color: black;">We look forward to welcoming you on board your upcoming Drukair flight.</p>
                <p style="color: black;">You have questions?</p>
                <p style="color: black;">For customer services please send mail to:</p>
                <a href="mailto:heli@drukair.com.bt" style="color: #22326e;">heli@drukair.com.bt</a> >> for general enquiry (During weekdays - Working Hrs. 9AM-5PM BST)<br>

                <div class="container">
                    <div class="header">
                        <div class="header-logo">
                            <img src="cid:companyLogo" alt="Company Logo">
                        </div>
                        <div class="header-text">
                            E-ticket Receipt <span style="color: #22326e;">DRUKAIR HELI</span>
                        </div>
                    </div>

                    <div class="section-header">
                        PASSENGER AND TICKET INFORMATION
                    </div>

                    <div class="info-row">
                        <div class="info-label">Name</div>
                        <div class="info-value">${booking.agent_name}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Agent CID</div>
                        <div class="info-value">${booking.agent_cid}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">BOOKING REFERENCE</div>
                        <div class="info-value">${booking.bookingID}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">ISSUED THROUGH</div>
                        <div class="info-value">${booking.booking_type}</div>
                    </div>

                    <p style="margin: 20px 0;">You are expected to arrive at pickup destination 30mins prior to the flight departure</p>

                    <div class="section-header">
                        TRAVEL INFORMATION
                    </div>

                    <div class="sub-header">
                        DEPARTURE
                    </div>

                    <div class="info-row">
                        <div class="info-label">FLIGHT STATUS</div>
                        <div class="info-value">${booking.status}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">DEPARTURE DATE</div>
                        <div class="info-value">${booking.flight_date}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">DEPARTURE TIME</div>
                        <div class="info-value">${booking.departure_time}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">PICKUP DESTINATION</div>
                        <div class="info-value">${booking.pickup_point}</div>
                    </div>

                    <div class="section-header">
                        FARE INFORMATION
                    </div>

                    <div class="info-row">
                        <div class="info-label">Service</div>
                        <div class="info-value">${booking.service_id.name}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">FLIGHT FARE</div>
                        <div class="info-value">${(() => {
                    // Calculate refund in BTN
                    const refundBTN = booking.refund_id ?
                        (booking.bookingPriceBTN - (booking.bookingPriceBTN * (booking.refund_id.plan / 100))) :
                        booking.bookingPriceBTN;

                    // Calculate refund in USD
                    const refundUSD = booking.refund_id ?
                        Number((booking.bookingPriceUSD) - (booking.bookingPriceUSD * (booking.refund_id.plan / 100)) +
                            (((booking.bookingPriceUSD) - (booking.bookingPriceUSD * (booking.refund_id.plan / 100))) * commision)).toFixed(2) :
                        Number(booking.bookingPriceUSD + (booking.bookingPriceUSD * commision)).toFixed(2);

                    // Check cType and return appropriate value
                    return booking.cType === 'BTN' ?
                        `${Number(refundBTN).toFixed(2)} BTN` :
                        `${Number(refundUSD).toFixed(2)} USD`;
                })()}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">FORM OF PAYMENT</div>
                        <div class="info-value">${booking.payment_type}</div>
                    </div>
                </div>
            </body>
            </html>
            `,
            attachments: [{
                filename: 'logo.png',
                path: imagePath,
                cid: 'companyLogo'
            }]
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({
            status: 'success',
            message: 'Booking approved and email sent successfully!',
            booking: booking
        });

    } catch (err) {
        // console.error('Error:', err); 
        return res.status(500).json({
            status: 'error',
            message: err.message
        });
    }
};

