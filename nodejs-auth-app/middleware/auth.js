const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis');

const auth = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

    try {
        const isBlacklisted = await redisClient.get(token);
        if (isBlacklisted) return res.status(401).json({ msg: 'Token is blacklisted' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        req.token = token; // Store token for logout
        next();
    } catch (error) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

module.exports = auth;