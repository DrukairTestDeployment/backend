const jwt = require('jsonwebtoken')
const User = require('../models/User')
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const {promisify} = require('util');
require('dotenv').config();

const failedAttempts = new Map();
const validator = require('validator');


// exports.signupLimiter = rateLimit({
//     windowMs: 60 * 60 * 1000, 
//     max: 3,
//     message: "Too many signup attempts, please try again later.",
//     headers: true,
// });

// exports.loginLimiter = rateLimit({
//     windowMs: 30 * 60 * 1000,
//     max: 3,
//     message: "Too many login attempts. Try again later.",
//     headers: true,
// });

// exports.forgotPasswordLimiter = rateLimit({
//     windowMs: 24 * 60 * 60 * 1000,
//     max: 3,
//     message: "Too many password reset requests. Try again later.",
//     headers: true,
// });

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    })
}

const generateOTP = () => {
    return Math.floor(10000 + Math.random() * 90000).toString();
};

const isOtpAssigned = async (otp) => {
    const existingUser = await User.findOne({ otp });
    return existingUser !== null;
};

const getUniqueOTP = async () => {
    let otp;
    let isAssigned = true;

    while (isAssigned) {
        otp = generateOTP();
        isAssigned = await isOtpAssigned(otp);
    }

    return otp;
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id)
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
        ),
        httpOnly: true,
        sameSite: "Strict",
        path: "/",
    }
    res.cookie('jwt', token, cookieOptions)

    res.status(statusCode).json({ status: "success", token, data: { user } })
}
exports.signup = async (req, res, next) => {
  try {
    const otp = await getUniqueOTP();
    const newUser = await User.create({
      ...req.body,
      otp: otp,
      otpVerified: false,
    });

    const user = await newUser.populate('role');
    createSendToken(newUser, 201, res);

    if (user.role.name === "USER") {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: newUser.email,
        subject: 'Signup OTP Verification',
        text: `Your OTP for account verification is: ${otp}`,
      };
      await transporter.sendMail(mailOptions);
    }

  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        status: 'fail',
        message: 'Your Email or Contact Number is already in use. Please use a different one.',
      });
    }

    return res.status(500).json({
      message: 'Something went wrong. Please try again later.',
    });
  }
};


exports.login = async (req, res, next) => {
    try {
       
        const { email, password } = req.body
        if (!email || !password) {
            return res.status(401).send('Please provide an email and password!')
        }

        if (failedAttempts.has(email)) {
            const { attempts, lockTime } = failedAttempts.get(email);
            if (attempts >= 5 && Date.now() - lockTime < 15 * 60 * 1000) {
                return res.status(429).send("Too many failed attempts. Try again later." );
            }
        }

        const user = await User.findOne({ email }).select('+password').populate('role')

        if (!user || !await user.correctPassword(password, user.password)) {
            let attempts = failedAttempts.get(email) || { attempts: 0, lockTime: Date.now() };
            attempts.attempts += 1;
            failedAttempts.set(email, attempts);
            return res.status(401).send("Incorrect Email or Password!")
        }
        failedAttempts.delete(email);
        createSendToken(user, 200, res)
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.logout = (req, res) => {
    res.clearCookie('jwt', { path: "/" })
    res.status(200).json({ status: 'success' })
}


exports.updatePassword = async (req, res) => {
    try {
        if(req.body.currentPassword && req.body.newPassword){
            let cPassword = req.body.currentPassword;
            let nPassword = req.body.newPassword;
            if (!validator.isLength(cPassword, { max: 30 }) || !validator.isLength(nPassword, {max: 30})) {
                            return res.status(400).json({ status: "error", message: "Password is too long" });
                        }
        }
        const user = await User.findById(req.params.id).select('+password');
        if (!user || !(await user.correctPassword(req.body.currentPassword, user.password))) {
            return res.status(401).send('Your current password is incorrect!');
        }

        user.password = req.body.newPassword;
        await user.save();

        res.json({ status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];

        } else if (req.cookies.jwt) {
            token = req.cookies.jwt;
        }

        if (!token || token === "") {
            return res.redirect("http://localhost:3000/login");
        }

        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

        const freshUser = await User.findById(decoded.id);
        if (!freshUser) {
            return res.status(401).send("The user belonging to this token no longer exists");
        }
        req.user = freshUser;
        next();

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.userProtect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];

        } else if (req.cookies.jwt) {
            token = req.cookies.jwt;
        }

        if (!token || token === "") {
            return res.redirect("http://localhost:3000/login");
        }

        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

        const freshUser = await User.findById(decoded.id).populate('role');
        console.log(freshUser);
        if (!freshUser) {
            return res.status(401).send("The user belonging to this token no longer exists");
        }
        if(freshUser.role.name !== "USER"){
            req.user = freshUser;
            next();
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
})

exports.sendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({
                message: `No user found with this email. Please check the email address or register.`
            });
        }


        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Recovery Code',
            text: `Your Password Recovery OTP is: ${existingUser.otp}`,
        };

        await transporter.sendMail(mailOptions);

        return res.json({ status: "OTP sent successfully" });

    } catch (err) {
        // console.error('Error in sendOtp:', err); 
        res.status(500).json({ message: 'Internal server error. Please try again later.' });
    }
};


exports.forgotPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const user = await User.findOne({email });
        console.log(user.otp, otp)
        if (!user) {
            return res.status(404).send('No user found with that email address.');
        }

        if(user.otp !== otp){
            return res.status(404).send('OTP incorrect.');
        }

        if (!newPassword) {
            return res.status(400).send('New password is required.');
        }

        user.password = newPassword;

        const newOTP = generateOTP();
        user.otp = newOTP;

        await user.save();

        res.json({
            status: "success",
            message: "Your password has been reset successfully and a new OTP has been generated.",
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};