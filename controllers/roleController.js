const Role = require('./../models/Role')

exports.getAllRoles = async (req, res) => {
    try {
        const roles = await Role.find()
        res.status(200).json({ data: roles, status: 'success' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.createRole = async (req, res) => {
    try {
        const role = await Role.create(req.body);
        res.json({ data: role, status: 'success' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.getRole = async (req, res) => {
    try {
        const role = await Role.findById(req.params.id);
        res.json({ data: role, status: 'success' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.updateRole = async (req, res) => {
    try {
        const role = await Role.findByIdAndUpdate(req.params.id, req.body);
        if (!role) {
            return res.status(404).json({ status: "error", message: "Role not found" });
        }
        res.json({ data: role, status: "success" });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
};



exports.deleteRole = async (req, res) => {
    try {
        const role = await Role.findByIdAndDelete(req.params.id);
        res.json({ data: role, status: 'success' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
