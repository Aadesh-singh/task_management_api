const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Initialize MongoDB Connection
require('./config/mongoose.config');
const AppError = require('./utils/AppError');
const globalErrorHandler = require('./middlewares/error');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    origin: ['http://localhost:4200'], // enter the allowed origins
    credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const router = require('./routes/routes');
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Task Management API!' });
});

app.use('/api/v1', router);

// Handling Unresolved Routes
app.use((req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// The Centralized Global Error Handler
app.use(globalErrorHandler);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
