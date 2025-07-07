const User = require('./../models/User')
const validator = require('validator');

const {promisify} = require('util');
const jwt = require('jsonwebtoken')

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

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().populate('role');
        res.status(200).json({ data: users, status: 'success' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.createUser = async (req, res) => {
    try {
        const user = await User.create(req.body);
        res.json({ data: user, status: 'success' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.getUser = async (req, res) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];

        } else if (req.cookies.jwt) {
            token = req.cookies.jwt;
        }

        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

        const freshUser = await User.findById(decoded.id);
        if(!token){
            const user = await User.findById(req.params.id).populate('role');
            res.json({ data: user, status: 'success' });
        }else if(freshUser._id==req.params.id){
            const user = await User.findById(req.params.id).populate('role');
            res.json({ data: user, status: 'success' });
        }else{
            return res.status(404).json({
                status: 'fail',
                message: 'No user with this id',
            });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.getUserByEmail = async (req, res) => {
    try {
        const { email } = req.params;
        const user = await User.findOne({email: email}).select('-password -otp -contactNo -otpVerified -email -status -address');
        res.json({ data: user, status: 'success' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.updateUser = async (req, res) => {
    try {
        if(req.body.name){
            let name = req.body.name;
            if (!validator.isLength(name, { max: 30 })) {
                return res.status(400).json({ status: "error", message: "Name is too long" });
            }
        }

        if(req.body.otpVerified === true || req.body.email){
            req.body.otp = await getUniqueOTP();
        }
        
        const user = await User.findByIdAndUpdate(req.params.id, req.body);
        if (!user) {
            return res.status(404).json({ status: "error", message: "Passenger not found" });
        }

        res.json({ data: user, status: "success" });
    } catch (err) {
        if (err.code === 11000) {
            res.status(400).json({
              status: 'fail',
              message: 'The Email or Contact Number you entered is already in use. Please use a different one.',
            });
        } else {
            res.status(500).json({
              message: err.message,
            });
        }
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        res.json({ data: user, status: 'success' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
