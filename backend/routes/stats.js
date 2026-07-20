const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const STATS_FILE = path.join(__dirname, '../stats.json');

// Read stats
router.get('/', (req, res) => {
    try {
        if (!fs.existsSync(STATS_FILE)) {
            return res.json({ totalConversions: 0, byFormat: {} });
        }
        const data = fs.readFileSync(STATS_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        res.status(500).json({ error: 'Failed to read stats' });
    }
});

module.exports = router;
