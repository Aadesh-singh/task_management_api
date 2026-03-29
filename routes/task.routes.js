const router = require('express').Router();

const { getAllTasks, createTask, updateTask, deleteTask } = require('../controllers/task.controller');
const restrictTo = require('../middlewares/restrictTo');

router.get('/getAllTasks', getAllTasks);

router.post('/create-task', createTask);

router.patch('/update-task', updateTask);

router.delete('/delete-task', deleteTask)


module.exports = router;