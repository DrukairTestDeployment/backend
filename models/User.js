const mongoose = require ('mongoose')
const validator = require ('validator')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema ({
    name:{
        type:String,
        required:[true,'Please enter your username']
    },
    email: {
        type:String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email'],
    },
    contactNo:{
        type:String,
        required: [true, 'Please provide your contact number'],
        unique: true
    },
    password:{
        type: String,
        required: [true, 'please provide a password'],
        minlength: 8,
    },
    address:{
        type: String,
        required: [true, 'Please provide your address']
    },
    status:{
        type: String,
        default: 'Active'
    },
    otp:{
        type: String,
        default: 'None'
    },
    otpVerified:{
        type: Boolean,
        default:false
    },
    rDate:{
        type: String,
        required: [true, 'Please provide recruitment date']
    },
    role:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role',
        required: true
    }
})
userSchema.pre('save', async function (next){
    if (!this.isModified('password')) return next()
    this.password = await bcrypt.hash(this.password, 12)
    next()
})

userSchema.methods.correctPassword = async function(
    candidatePassword,
    userPassword,
){
    return await bcrypt.compare(candidatePassword, userPassword)
}
const User = mongoose.model('User', userSchema)
module.exports = User