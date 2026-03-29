const router = require('express').Router();

router.get('/health-check', (req, res) => {
    res.status(200).json({ status: 'healthy', timestamp: new Date() });
});

const authenticate = require('../middlewares/authenticate');
const restrictTo = require('../middlewares/restrictTo');


router.use('/teams', require('./team.routes'));
router.use('/users', require('./user.routes'));
router.use('/tasks', authenticate, require('./task.routes'));



module.exports = router;