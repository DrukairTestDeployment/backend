const Charter= require('./../models/Charter')

exports.getAllCharters = async (req, res) => {
    try {
        const charters = await Charter.find()
        res.status(200).json({ data: charters, status: 'success' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.createCharter = async (req, res) => {
    try {
        const charter = await Charter.create(req.body);
        res.json({ data: charter, status: 'success' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.getCharter = async (req, res) => {
    try {
        const charter = await Charter.findById(req.params.id);
        res.json({ data: charter, status: 'success' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.updateCharter = async (req, res) => {
    try {
        const charter = await Charter.findByIdAndUpdate(req.params.id, req.body);
        if (!charter) {
            return res.status(404).json({ status: "error", message: "Charter not found" });
        }
        res.json({ data: charter, status: "success" });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
};

exports.deleteCharter = async (req, res) => {
    try {
        const charter = await Charter.findByIdAndDelete(req.params.id);
        res.json({ data: charter, status: 'success' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
