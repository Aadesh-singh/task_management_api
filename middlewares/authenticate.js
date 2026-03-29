const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new AppError('Unauthorized: Please supply a Bearer token', 401));
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return next(new AppError('Forbidden: Token signature invalid or expired', 401));
        }
        req.user = user;
        next();
    });
}

module.exports = authenticate;