const Passenger = require('./../models/Passenger')

exports.getAllPassengers = async (req, res) => {
    try {
        const passengers = await Passenger.find()
        res.status(200).json({ data: passengers, status: 'success' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.getPassengersByBookingID = async (req, res) => {
    try {
        const { bookingID } = req.params;
        const passengers = await Passenger.find({ booking_id : bookingID });
        if (!passengers || passengers.length === 0) {
            return res.status(404).json({
                status: 'fail',
                message: 'No passengers found for this booking ID',
            });
        }
        res.status(200).json({status: 'success', data: passengers});
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error fetching passengers',
            error: error.message,
        });
    }
};

exports.createPassenger = async (req, res) => {
    try {
        const passenger = await Passenger.create(req.body);
        res.json({ data: passenger, status: 'success' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.getPassenger = async (req, res) => {
    try {
        const passenger = await Passenger.findById(req.params.id);
        res.json({ data: passenger, status: 'success' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.updatePassenger = async (req, res) => {
    try {
        const passenger = await Passenger.findByIdAndUpdate(req.params.id, req.body);
        if (!passenger) {
            return res.status(404).json({ status: "error", message: "Passenger not found" });
        }
        res.json({ data: passenger, status: "success" });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
};

exports.deletePassenger = async (req, res) => {
    try {
        const passenger = await Passenger.findByIdAndDelete(req.params.id);
        res.json({ data: passenger, status: 'success' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
