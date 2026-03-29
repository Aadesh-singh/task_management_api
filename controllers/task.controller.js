const mongoose = require('mongoose');
const Task = require('../models/Task');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getAllTasks = catchAsync(async (req, res, next) => {
    // 1. Fetch user to check registrationType and team
    const user = await User.findById(req.user._id);
    if (!user) {
        return next(new AppError('User not found', 404));
    }

    // 2. Build match query based on requirements
    let matchQuery = {};

    if (req.user.role === 'admin') {
        matchQuery = {};
    } else if (user.registrationType === 'individual') {
        matchQuery = { assignee: new mongoose.Types.ObjectId(req.user._id) };
    } else if (user.registrationType === 'team') {
        matchQuery = { team: user.team };
    } else {
        return next(new AppError('Account configuration error: No registration type found.', 400));
    }

    // 3. Aggregate with population and sorting (flat array)
    const tasks = await Task.aggregate([
        {
            $match: matchQuery
        },
        {
            $lookup: {
                from: 'users',
                localField: 'assignee',
                foreignField: '_id',
                as: 'assignee'
            }
        },
        {
            $unwind: {
                path: '$assignee',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                'assignee.password': 0,
                'assignee.refreshTokens': 0
            }
        },
        {
            $sort: { createdAt: -1 }
        }
    ]);

    res.status(200).json({
        status: 'success',
        results: tasks.length,
        data: {
            tasks
        }
    });
});

exports.createTask = catchAsync(async (req, res, next) => {
    const { title, description, assigneeId, teamId, dueDate, priority, status } = req.body;

    if (!title || !description || !assigneeId) {
        return next(new AppError('Please provide all the required fields', 400));
    }

    const taskMeta = {
        title,
        description,
        assignee: assigneeId,
        dueDate,
        priority,
        status
    }
    if (teamId) {
        taskMeta.team = teamId
    }


    const task = await Task.create(taskMeta);


    res.status(201).json({
        status: 'success',
        data: {
            task
        }
    });
});

exports.updateTask = catchAsync(async (req, res, next) => {
    const { task } = req.query;
    console.log(task, req.body)

    if (!task) {
        return next(new AppError('Invalid Task provided', 402))
    }

    const { title, description, assigneeId, teamId, dueDate, priority, status } = req.body;

    if (!title || !description || !assigneeId) {
        return next(new AppError('Please provide all the required fields', 400));
    }

    let taskMeta = {
        title,
        description,
        assignee: assigneeId,
        dueDate,
        priority,
        status
    }
    if (teamId) {
        taskMeta.team = teamId
    }

    const updatedTask = await Task.updateOne(
        { _id: task },
        {
            $set: taskMeta
        }
    );

    res.status(201).json({
        status: 'success',
        data: {
            task
        }
    });
});


exports.deleteTask = catchAsync(async (req, res, next) => {
    const { task } = req.query;

    if (!task || !mongoose.Types.ObjectId.isValid(task)) {
        return next(new AppError('Invalid task ID', 400));
    }

    const result = await Task.deleteOne({ _id: task });

    if (result.deletedCount === 0) {
        return next(new AppError('Task not found', 404));
    }

    return res.status(200).json({
        status: 'success',
    });
});