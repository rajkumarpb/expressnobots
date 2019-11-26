var bots = require('./bots');
var regex = new RegExp('\\b' + bots.join('\\b|\\b') + '\\b', 'i');
var isApi = true; // by default set isApi as true.

module.exports = exports = function (options) {
    if (!options) {
        return blockBots;
    } else {
        if(typeof options.isApi != 'undefined' && options.isApi == false) {
            isApi = false;
        }
        // To decide which method to call. Block Bots or just Tag 'em!
        if (options.block) {
            return blockBots;
        } else if (!options.block) {
            return tagBots;
        }
    }
};

var blockMsg = "Hi bot! You have reached your friend. Block Bots!";

var blockBots = function (req, res, next) {
    var ua = req.get('User-Agent');

    if(!isApi) {
        var hostname = req.headers.host;
        // For Web Applications, need to allow the below bots in order to access and rank sites!
        if(ua.toLowerCase().indexOf("googlebot")!=-1) {
            if(hostname.indexOf("googlebot.com")!=-1 || hostname.indexOf("google.com")!=-1) {
                // This is valid. So Proceed!
                return next();
            } else {
                return res.status(401).send(blockMsg);
            }

        }
        if(ua.toLowerCase().indexOf("bingbot")!=-1) {
            if(hostname.indexOf("search.msn.com")!=-1) {
                // This is valid. So Proceed!
                return next();
            } else {
                return res.status(401).send(blockMsg);
            }

        }
        if(ua.toLowerCase().indexOf("yahoo! slurp")!=-1) {
            if(hostname.indexOf("yahoo.com")!=-1 || hostname.indexOf("crawl.yahoo.net")!=-1 || hostname.indexOf("yandex.com")!=-1) {
                // This is valid. So Proceed!
                return next();
            } else {
                return res.status(401).send(blockMsg);
            }

        }
    }
    
    if (regex.test(ua.toLowerCase())) return res.status(401).send(blockMsg);
    else return next();
};

var tagBots = function (req, res, next) {
    var ua = req.get('User-Agent');
    if (regex.test(ua.toLowerCase())) req.isBot = true;
    else req.isBot = false;
    return next();
};
