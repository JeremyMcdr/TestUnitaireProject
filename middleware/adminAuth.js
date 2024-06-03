const Client = require('../models/client');

const adminAuth = async (req, res, next) => {
    try {
        const client = await Client.findById(req.user.id);
        if (!client || client.role !== 'admin') {
            return res.status(403).json({ msg: 'Authorization denied' });
        }
        next();
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
};

module.exports = adminAuth;
