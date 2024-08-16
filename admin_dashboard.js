const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

let assetQueue = [];
let whitelistedAssets = {};

app.get('/assets', (req, res) => {
    res.json({ assets: assetQueue });
});

app.post('/whitelist', (req, res) => {
    const { assetId } = req.body;
    if (assetId) {
        whitelistedAssets[assetId] = true;
        res.json({ success: true, msg: `Asset ${assetId} whitelisted` });
    } else {
        res.json({ success: false, msg: 'Asset ID required' });
    }
});

app.post('/remove', (req, res) => {
    const { assetId } = req.body;
    if (whitelistedAssets[assetId]) {
        delete whitelistedAssets[assetId];
        res.json({ success: true, msg: `Asset ${assetId} removed` });
    } else {
        res.json({ success: false, msg: 'Asset not found' });
    }
});

app.listen(4000, () => {
    console.log('Admin dashboard running on port 4000');
});
