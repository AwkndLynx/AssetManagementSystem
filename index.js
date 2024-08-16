const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const cors = require('cors');
const app = express();
const rateLimit = require('express-rate-limit');
const randomId = require('random-id');

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minutemax: 14,
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors({}));

let variables = process.env;
let cookie = variables['COOKIE'];
let hasProtection = variables['HAS_PROTECTION'] === 'true';
let verifiedCodes = {};
let userId = '';
let assetIdAndProduct = {};
let queue = [];
let assetQueue = [];

functiongenerateSecureServerCode() {
    let secureId = "";
    while (true) {
        let iddd = randomId(50, 'aA0');
        let idSecure = true;
        for (let attributeName4 in verifiedCodes) {
            if (verifiedCodes[attributeName4] === iddd) {
                idSecure = false;
                break;
            }
        }
        if (idSecure === true) {
            secureId = iddd;
            break;
        }
    }
    return secureId;
}

functionrobloxRequest(url, method, callback, isTokenRequired) {
    if (isTokenRequired === true) {
        request({
            headers: {
                Referer: `https://www.roblox.com`,
                Origin: 'https://www.roblox.com',
                Cookie: `.ROBLOSECURITY=${cookie}; path=/; domain=.roblox.com;`
            },
            url: `https://auth.roblox.com/v2/logout`,
            method: 'POST'
        }, function(err, res) {
            if (res.headers['x-csrf-token']) {
                request({
                    headers: {
                        Referer: `https://www.roblox.com`,
                        Origin: 'https://www.roblox.com',
                        Cookie: `.ROBLOSECURITY=${cookie}; path=/; domain=.roblox.com;`,
                        'Content-Type': 'application/json; charset=utf-8',
                        'X-CSRF-TOKEN': res.headers['x-csrf-token']
                    },
                    url: url,
                    body: JSON.stringify({"expectedCurrency":1,"expectedPrice":0,"expectedSellerId":0}),
                    method: method
                }, callback);
            }
        });
    } else {
        request({
            headers: {
                Referer: `https://www.roblox.com`,
                Origin: 'https://www.roblox.com',
                Cookie: `.ROBLOSECURITY=${cookie}; path=/; domain=.roblox.com;`,
            },
            url: url,
            method: method
        }, callback);
    }
}

functionisJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        returnfalse;
    }
    returntrue;
}

robloxRequest(`https://www.roblox.com/mobileapi/userinfo`, 'GET', function(err, res2, body) {
    if (isJsonString(body) === true) {
        if (res2.statusCode === 200) {
            body = JSON.parse(body);
            userId = body.UserID;
            console.log('WhitelistQueue successfully started up! User Id: ' + userId);
        } else {
            console.error('Your .ROBLOSECURITY cookie is incorrect.');
        }
    } else {
        console.error('Your .ROBLOSECURITY cookie is incorrect.');
    }
});

if (hasProtection === true) {
    app.post('/generatenewcode', function (req, res) {
        if (!req.body.jobid) {
            return res.json({ success: false, msg: 'Value undefined' });
        }
        if (verifiedCodes[req.body.jobid] != undefined) {
            return res.json({ success: false, msg: 'Code already taken' });
        }
        let code = generateSecureServerCode();
        verifiedCodes[req.body.jobid] = code;
        res.json({ success: true, msg: code });
    });
}

app.get('/', function (req, res) {
    if (userId !== '') {
        console.log('Web server is running correctly.');
        res.send('Web server is running correctly.');
    } else {
        console.error('Web server is not running correctly.');
        res.send('Web server is not running correctly.');
    }
});

app.post('/addtoqueue', limiter, function (req, res) {
    if (userId === '') {
        return res.json({ success: false, msg: 'Invalid user ID' });
    }

    if (!req.body.assetid) {
        return res.json({ success: false, msg: 'Value undefined' });
    }

    if (hasProtection === true) {
        if (!req.body.secretcode) {
            return res.json({ success: false, msg: 'Value undefined' });
        }
        let codeExists = Object.values(verifiedCodes).includes(req.body.secretcode);
        if (!codeExists) {
            return res.json({ success: false, msg: 'Secret code invalid' });
        }
    }

    if (queue.length >= 15) {
        return res.json({ success: false, msg: 'Queue is full!' });
    }

    if (assetQueue.includes(req.body.assetid)) {
        return res.json({ success: false, msg: 'Already in queue!' });
    }

    robloxRequest(`https://api.roblox.com/marketplace/productinfo?assetId=${req.body.assetid}`, 'GET', function(err, res2, body) {
        if (isJsonString(body) === true) {
            body = JSON.parse(body);
            if (res2.statusCode === 200) {
                if (body.AssetTypeId === 10) {
                    if (body.IsPublicDomain === true) {
                        robloxRequest(`https://inventory.roblox.com/v1/users/${userId}/items/Asset/${req.body.assetid}`, 'GET', function(err, res10, body10) {
                            if (isJsonString(body10) === true) {
                                body10 = JSON.parse(body10);
                                if (res10.statusCode === 200) {
                                    if (body10.data.length === 0) {
                                        queue.push(body.ProductId);
                                        assetIdAndProduct[body.ProductId] = req.body.assetid;
                                        assetQueue.push(req.body.assetid);
                                        console.log('Added ' + req.body.assetid + ' to queue; Position ' + queue.length + '!');
                                        res.json({ success: true, msg: queue.length });
                                    } else {
                                        res.json({ success: false, msg: 'Item already owned!' });
                                    }
                                } else {
                                    res.json({ success: false, msg: 'Unknown error!' });
                                }
                            } else {
                                res.json({ success: false, msg: 'Unknown error!' });
                            }
                        });
                    } else {
                        res.json({ success: false, msg: 'Not for sale!' });
                    }
                } else {
                    res.json({ success: false, msg: 'Not a model!' });
                }
            } else {
                res.json({ success: false, msg: 'Invalid!' });
            }
        } else {
            res.json({ success: false, msg: 'Unknown error!' });
        }
    });
});

app.get('/getuserid', function (req, res) {
    return res.status(200).send(userId.toString());
});

app.listen(process.env.PORT || 3000, () => {
    console.log('Server is running on port ' + (process.env.PORT || 3000));
});

asyncfunctiontest() {
    while (true) {
        awaitnewPromise(r =>setTimeout(r, variables['QUEUE_TIME']));
        queue.forEach(asyncfunction(item) {
            robloxRequest(`https://economy.roblox.com/v1/purchases/products/` + item, 'POST', function(err, res2, body) {
                if (isJsonString(body) === true) {
                    body = JSON.parse(body);
                    if (res2.statusCode === 200) {
                        if (body.purchased === true) {
                            console.log('Whitelisted: ' + assetIdAndProduct[item] + '!');
                            queue = queue.filter(q => q !== item);
                        }
                    }
                }
            }, true);
            awaitnewPromise(r =>setTimeout(r, 2000));
        });
    }
}

test();
