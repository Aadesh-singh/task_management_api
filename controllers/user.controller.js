const User = require('../models/User');
const jwtService = require('../utils/jwt.service');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const req = require('express/lib/request');

const cookieConfig = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'None',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

exports.createUser = catchAsync(async (req, res, next) => {
    const {
        email,
        username,
        firstName,
        lastName,
        password,
        registrationType,
        team
    } = req.body;

    if (
        !email ||
        !username ||
        !firstName ||
        !lastName ||
        !password ||
        !registrationType
    ) {
        return next(new AppError('Please provide all the required fields', 403));
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
        return next(new AppError('User with this email or username already exists', 403));
    }

    let userMeta = {
        firstName: firstName,
        lastName: lastName,
        username: username,
        email: email,
        password: password,
        registrationType: registrationType,
        // team: req?.user?.team,
        // isApproved: req?.user?.role == 'admin' ? true : false
    }

    if (req?.user && req?.user?.role == 'admin') {
        userMeta.isApproved = true;
    } else if (registrationType == 'individual') {
        userMeta.isApproved = true;
    } else {
        userMeta.isApproved = false;
    }

    if (registrationType == 'team') {
        userMeta.team = team;
    }

    const user = await User.create(userMeta);

    const userObj = user.toObject();
    delete userObj.password;

    res.status(201).json({
        message: 'User registered successfully. Please log in to continue.',
        user: userObj
    });
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    console.log('req.body: ', req.body)

    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }

    const user = await User.findOne({ $or: [{ email: email }, { username: email }] });
    if (!user || !(await user.comparePassword(password))) {
        return next(new AppError('Invalid credentials', 401));
    }

    if (user && !user.isApproved) {
        return next(new AppError('Your account is not approved yet. Please contact the admin for approval.', 403));
    }

    const userObj = user.toObject();
    delete userObj.password;

    const accessToken = jwtService.createAccessToken({ _id: user._id, role: user.role });
    const refreshToken = jwtService.createRefreshToken({ _id: user._id, role: user.role });

    user.refreshTokens.push(refreshToken);
    if (user.refreshTokens.length > 5) {
        user.refreshTokens.shift();
    }
    await user.save();

    res.cookie('jwt', refreshToken, cookieConfig);

    res.status(200).json({ status: 'success', user: userObj, accessToken });
});

exports.refreshToken = catchAsync(async (req, res, next) => {
    const token = req.cookies?.jwt;
    if (!token) return next(new AppError('Refresh token is required', 401));

    let decoded;
    try {
        decoded = jwtService.verifyRefreshToken(token);
    } catch (err) {
        return next(new AppError('Invalid or expired refresh token', 401));
    }

    const user = await User.findById(decoded._id);
    if (!user) return next(new AppError('User not found', 401));

    if (!user.refreshTokens.includes(token)) {
        return next(new AppError('Refresh token is unrecognized or revoked', 403));
    }

    const newAccessToken = jwtService.createAccessToken({ _id: user._id, role: user.role });
    res.status(200).json({ accessToken: newAccessToken });
});

exports.logout = catchAsync(async (req, res, next) => {
    const token = req.cookies?.jwt;
    if (!token) return res.status(204).json();

    const user = await User.findOne({ refreshTokens: token });
    if (!user) {
        res.clearCookie('jwt', cookieConfig);
        return res.status(200).json({ status: 'success', message: 'Already logged out' });
    }

    user.refreshTokens = user.refreshTokens.filter(rt => rt !== token);
    await user.save();

    res.clearCookie('jwt', cookieConfig);
    res.status(200).json({ status: 'success', message: 'Logged out successfully' });
});

exports.checkUsername = catchAsync(async (req, res, next) => {
    const { username } = req.body;
    if (!username) {
        return next(new AppError('invalid Username', 403));
    }
    const user = await User.findOne({ username });
    if (user) {
        return next(new AppError('Username already exists', 403));
    }
    return res.status(200).json({ status: 'success', message: 'Username is available' });
});

exports.updateUser = catchAsync(async (req, res, next) => {
    const { firstName, lastName, email } = req.body;

    if (!req.user) {
        return next(new AppError('UnAutorized Access', 401));
    }

    const user = await User.findById(req.user._id);
    if (!user) {
        return next(new AppError('User not found', 404));
    }
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    await user.save();
    res.status(200).json({ status: 'success', user });
})
