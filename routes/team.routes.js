const express = require("express");
const mongoose = require("mongoose")
const Team = require('../models/Team');
const catchAsync = require('../utils/catchAsync');
const { createTeam, listAllTeams, getUserTeam, listUserOfTeam } = require("../controllers/team.controller");
const authenticate = require("../middlewares/authenticate");
const restrictTo = require("../middlewares/restrictTo");

const router = express.Router();

// Placeholder for team endpoints
router.get('/list-all-teams', listAllTeams);
router.get('/list-user-of-team', authenticate, listUserOfTeam);

router.post('/create-team', authenticate, restrictTo('admin'), createTeam);
router.get('/get-user-team', authenticate, getUserTeam);


module.exports = router;
