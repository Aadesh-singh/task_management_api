const router = require('express').Router();
const { createUser, login, refreshToken, logout, updateUser, checkUsername } = require('../controllers/user.controller');



router.post('/register', createUser);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.post('/checkUsername', checkUsername);

router.patch('/updateUser', updateUser);

module.exports = router;