const express = require('express');
const router = express.Router();
const { fetchMatchIds } = require('../scrapers/match/match_history');

router.get('/api/team/matches/:teamId', async (req, res) => {
    try {
        const teamId = req.params.teamId;
        const matchIds = await fetchMatchIds(teamId);
        res.json({ matchIds });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
