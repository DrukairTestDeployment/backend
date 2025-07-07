const Leg = require('./../models/Leg')

exports.getAllLegs = async (req, res) => {
    try {
        const legs = await Leg.find()
        res.status(200).json({ data: legs, status: 'success' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.createLeg = async (req, res) => {
    try {
        const leg = await Leg.create(req.body);
        res.json({ data: leg, status: 'success' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.getLeg = async (req, res) => {
    try {
        const leg = await Leg.findById(req.params.id);
        res.json({ data: leg, status: 'success' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.updateLeg = async (req, res) => {
    try {
        const leg = await Leg.findByIdAndUpdate(req.params.id, req.body);
        if (!leg) {
            return res.status(404).json({ status: "error", message: "Leg not found" });
        }
        res.json({ data: leg, status: "success" });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
};



exports.deleteLeg = async (req, res) => {
    try {
        const leg = await Leg.findByIdAndDelete(req.params.id);
        res.json({ data: leg, status: 'success' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
