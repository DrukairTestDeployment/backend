const Agents = require('./../models/Agency')

exports.getAllAgents = async (req, res) => {
    try {
        const agents = await Agents.find()
        res.status(200).json({ data: agents, status: 'success' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.createAgent = async (req, res) => {
    try {
        const agent = await Agents.create(req.body);
        res.json({ data: agent, status: 'success' });
    } catch (err) {
        if (err.code === 11000) {
            res.status(400).json({
              status: 'fail',
              message: 'The agent code already exists. Please use a unique code.',
            });
        } else {
            res.status(500).json({
              message: err.message,
            });
        }
    }
}

exports.getAgent = async (req, res) => {
    try {
        const agent = await Agents.findById(req.params.id);
        res.json({ data: agent, status: 'success' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.updateAgent = async (req, res) => {
    try {
        const agent = await Agents.findByIdAndUpdate(req.params.id, req.body);
        if (!agent) {
            return res.status(404).json({ status: "error", message: "Agent not found" });
        }
        res.json({ data: agent, status: "success" });
    } catch (err) {
        if (err.code === 11000) {
            res.status(400).json({
              status: 'fail',
              message: 'The agent code already exists. Please use a unique code.',
            });
        } else {
            res.status(500).json({
              message: err.message,
            });
        }
    }
};

exports.deleteAgent = async (req, res) => {
    try {
        const agent = await Agents.findByIdAndDelete(req.params.id);
        res.json({ data: agent, status: 'success' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
