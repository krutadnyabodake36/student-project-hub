const express = require('express');
const router = express.Router();
const {
  getTeamRequests,
  getTeamRequest,
  createTeamRequest,
  applyToTeam,
  deleteTeamRequest
} = require('../controllers/teamController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(getTeamRequests)
  .post(protect, createTeamRequest);

router.route('/:id')
  .get(getTeamRequest)
  .delete(protect, deleteTeamRequest);

router.post('/:id/apply', protect, applyToTeam);

module.exports = router;
