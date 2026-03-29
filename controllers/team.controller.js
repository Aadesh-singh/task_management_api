const express = require('express');
const Team = require('../models/Team');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.createTeam = catchAsync(async (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'Team name is required' });
    }
    const team = new Team({ name });
    await team.save();
    return res.status(201).json({ message: 'Team created successfully', team });
});

exports.listAllTeams = catchAsync(async (req, res, next) => {
    const teams = await Team.find().select('name').lean();
    return res.status(200).json({ status: 'success', teams });
});

exports.getUserTeam = catchAsync(async (req, res, next) => {
    if (!req.user) {
        return next(new AppError('UnAutorized Access', 401));
    }
    const user = await User.findById(req.user._id).populate({ path: 'team', select: 'name' });
    if (!user) {
        return next(new AppError('User not found', 404));
    }
    return res.status(200).json({ status: 'success', team: user.team });
});

exports.listUserOfTeam = catchAsync(async (req, res, next) => {
    if (!req.user) {
        return next(new AppError('UnAutorized Access', 401));
    }

    const user = await User.findById(req.user._id);
    if (!user) {
        return next(new AppError('User not found', 404));
    }
    if (user.role == 'individual') {
        return next(new AppError('You are not authorized to perform this action', 403));
    }

    const users = await User.find({ team: user.team });
    res.status(200).json({ status: 'success', users });
});