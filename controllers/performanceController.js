const Performance = require('./../models/Performance')

exports.getAllPerfomances = async (req, res) => {
    try {
        const performances = await Performance.find()
        res.status(200).json({ data: performances, status: 'success' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.createPerformance = async (req, res) => {
    try {
        const performance = await Performance.create(req.body);
        res.json({ data: performance, status: 'success' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.getPerformance = async (req, res) => {
    try {
        const performance = await Performance.findById(req.params.id);
        res.json({ data: performance, status: 'success' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
exports.updatePerformance = async (req, res) => {
    try {
        const performance = await Performance.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!performance) {
            return res.status(404).json({ status: "error", message: "Data not found" });
        }

        res.json({ data: performance, status: "success" });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
};


exports.deletePerformance = async (req, res) => {
    try {
        const performance = await Performance.findByIdAndDelete(req.params.id);
        res.json({ data: performance, status: 'success' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
