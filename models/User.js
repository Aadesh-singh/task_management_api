const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    role: { // not required in requirements
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
    isEmailVerified: {
        type: Boolean,
        default: true // keeping true, because we do not have email verification facility here.
    },
    refreshTokens: [{
        type: String
    }],
    team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    registrationType: {
        type: String,
        enum: ['individual', 'team'],
        default: 'individual'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

userSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);