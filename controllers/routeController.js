const Route = require('../models/Route')

exports.getAllRoutes = async (req, res) => {
    try {
        const routes = await Route.find()
        res.status(200).json({ data: routes, status: 'success' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.createRoute = async (req, res) => {
    try {
        const route = await Route.create(req.body);
        res.json({ data: route, status: 'success' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.getRoute = async (req, res) => {
    try {
        const route = await Route.findById(req.params.id);
        res.json({ data: route, status: 'success' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.updateRoute = async (req, res) => {
    try {
        const route = await Route.findByIdAndUpdate(req.params.id, req.body);
        if (!route) {
            return res.status(404).json({ status: "error", message: "Route not found" });
        }
        res.json({ data: route, status: "success" });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
};

exports.deleteRoute = async (req, res) => {
    try {
        const route = await Route.findByIdAndDelete(req.params.id);
        res.json({ data: route, status: 'success' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
