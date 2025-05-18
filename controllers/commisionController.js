const Commision = require('./../models/Commision')

exports.getAllCommisions = async (req, res) => {
    try {
        const commision = await Commision.find()
        res.status(200).json({ data: commision, status: 'success' });
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

exports.createCommision = async (req, res) => {
    try {
        const commision = await Commision.create(req.body);
        res.json({ data: commision, status: 'success' });
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

exports.getCommision = async (req, res) => {
    try {
        const commision = await Commision.findById(req.params.id);
        res.json({ data: commision, status: 'success' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}


exports.updateCommision = async (req, res) => {
    try {
        const commision = await Commision.findByIdAndUpdate(req.params.id, req.body);
        if (!commision) {
            return res.status(404).json({ status: "error", message: "Commision not found" });
        }
        res.json({ data: commision, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteCommision = async (req, res) => {
    try {
        const commision = await Commision.findByIdAndDelete(req.params.id);
        res.json({ data: commision, status: 'success' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
