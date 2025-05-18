const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema({

    serviceName:{
        type:String,
        required:[true,'Please enter a service']
    },
    
    year: {
        type: Number,
        required: [true, 'Please enter the year']
    },
    january: {
        type: Number,
        default: 0
    },
    february: {
        type: Number,
        default: 0
    },
    march: {
        type: Number,
        default: 0
    },
    april: {
        type: Number,
        default: 0
    },
    may: {
        type: Number,
        default: 0
    },
    june: {
        type: Number,
        default: 0
    },
    july: {
        type: Number,
        default: 0
    },
    august: {
        type: Number,
        default: 0
    },
    september: {
        type: Number,
        default: 0
    },
    october: {
        type: Number,
        default: 0
    },
    november: {
        type: Number,
        default: 0
    },
    december: {
        type: Number,
        default: 0
    },
    performanceType: {
        type: String,
        required: [true, 'Please enter the performance type']
    }
});

const Performance = mongoose.model('Performance', performanceSchema);
module.exports = Performance;
