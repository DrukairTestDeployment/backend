const { type } = require('express/lib/response');
const mongoose = require('mongoose')
const validator = require('validator')

const bookingSchema = new mongoose.Schema({
    bookingID: {
        type: String,
        required: true,
    },
    booking_type: {
        type: String,
        required: true,
    },
    agent_name: {
        type: String,
        required: true,
    },
    agent_email: {
        type: String,
        required: true,
        validate: [validator.isEmail, 'Please provide a valid email'],
    },
    agent_cid: {
        type: String,
        required: true,
    },
    agent_code: {
        type: String,
        default: "None",
    },
    agent_contact: {
        type: String,
        required: true,
    },
    layap:{
        type:String,
        default:"false"
    },
    
    flight_date: {
        type: Date,
        required: true,
    },
    departure_time: {
        type: String,
        required: true,
    },
    ground_time: {
        type: String,
        default: "None",
    },
    pickup_point: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },

    bookingPriceUSD:{
        type: Number,
        default:0,
    },
    
    bookingPriceBTN:{
        type: Number,
        default:0,
    },

    status: {
        type: String,
        required: true,
    },
    payment_status: {
        type: String,
        required: true,
    },
    journal_no: {
        type: String,
        default: "None",
    },
    image: {
        type: [String],
        default: [],
    },
    payment_type: {
        type: String,
        default: "Online",
    },
    permission: {
        type: String,
        required: true,
    },
    destination_other: {
        type: String,
        default: 'None'
    },
    duration: {
        type: String,
        default: '0'
    },
    route_type: {
        type: String,
        default: 'Published'
    },
    cType:{
      type: String,
      default:'None'
    },

    latitude:{
        type:String,
        default:'None'
    },

    Longitude:{
        type:String,
        default:'None'
    },

    payable:{
        type:Boolean,
        default:false
    },
    payEmail:{
        type:Boolean,
        default:false
    },
    destination: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Route'
    },
    service_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: true,
    },
    refund_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Refund',
        default: null
    },
    agentCode: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Agency'
    },
    assigned_pilot: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        default: null
    },
   
});

const Booking = mongoose.model('Booking', bookingSchema)
module.exports = Booking