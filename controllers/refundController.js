const Refund = require('./../models/Refund')

exports.getAllRefunds = async (req, res) => {
    try {
        const refunds = await Refund.find()
        res.status(200).json({ data: refunds, status: 'success' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.createRefund = async (req, res) => {
    try {
        const refund = await Refund.create(req.body);
        res.json({ data: refund, status: 'success' });
    } catch (err) {
        if (err.code === 11000) {
            res.status(400).json({
              status: 'fail',
              message: 'The refund plan already exists. Please use a different plan.',
            });
        } else {
            res.status(500).json({
              message: err.message,
            });
        }
    }
}

exports.getRefund = async (req, res) => {
    try {
        const refund = await Refund.findById(req.params.id);
        res.json({ data: refund, status: 'success' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.updateRefund = async (req, res) => {
    try {
        const refund = await Refund.findByIdAndUpdate(req.params.id, req.body);
        if (!refund) {
            return res.status(404).json({ status: "error", message: "Refund not found" });
        }
        res.json({ data: refund, status: "success" });
    } catch (err) {
        if (err.code === 11000) {
            res.status(400).json({
              status: 'fail',
              message: 'The refund plan already exists. Please use a different plan.',
            });
        } else {
            res.status(500).json({
              message: err.message,
            });
        }
    }
};

exports.deleteRefund = async (req, res) => {
    try {
        const refund = await Refund.findByIdAndDelete(req.params.id);
        res.json({ data: refund, status: 'success' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
