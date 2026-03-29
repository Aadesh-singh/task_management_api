const jwt = require('jsonwebtoken');


// access token
exports.createAccessToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
}

exports.verifyAccessToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
}

exports.decodeAccessToken = (token) => {
    return jwt.decode(token);
}

// refresh token
exports.createRefreshToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
}

exports.verifyRefreshToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
}

exports.decodeRefreshToken = (token) => {
    return jwt.decode(token);
}