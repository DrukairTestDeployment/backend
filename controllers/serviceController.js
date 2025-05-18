const Service = require('./../models/Service')

exports.getAllServices = async (req, res) => {
    try {
        const services = await Service.find()
        res.status(200).json({ data: services, status: 'success' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.createService = async (req, res) => {
    try {
        const service = await Service.create(req.body);
        res.json({ data: service, status: 'success' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.getService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        res.json({ data: service, status: 'success' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.updateService = async (req, res) => {
    try {
        const service = await Service.findByIdAndUpdate(req.params.id, req.body);
        if (!service) {
            return res.status(404).json({ status: "error", message: "Service not found" });
        }
        res.json({ data: service, status: "success" });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
};

exports.deleteService = async (req, res) => {
    try {
        const service = await Service.findByIdAndDelete(req.params.id);
        res.json({ data: service, status: 'success' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
