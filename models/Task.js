const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    assignee: {
        ref: 'User',
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'todo', 'in-progress', 'review', 'completed'],
        default: 'todo'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    team: {
        ref: 'Team',
        type: mongoose.Schema.Types.ObjectId,
        // required: true
    },
    dueDate: {
        type: Date,
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Task', TaskSchema);
