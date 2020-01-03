var bots = require('./bots');
const geoip = require('geoip-lite');
var regex = new RegExp('\\b' + bots.join('\\b|\\b') + '\\b', 'i');
var isApi = true; // by default set isApi as true.

const Sequelize = require('sequelize');
var tableName = "NA";
var isDBPassed = false;
var trackLocation = false;

var sequelize;

module.exports = exports = function (options) {
    if (!options) {
        return blockBots;
    } else {
        if(typeof options.isApi != 'undefined' && options.isApi == false) {
            isApi = false;
        }

        if(typeof options.dbHost != 'undefined' && options.dbHost != "" 
            && typeof options.dbName != 'undefined' && options.dbName != ""
            && typeof options.dbUser != 'undefined' && options.dbUser != ""
            && typeof options.dbPass != 'undefined' && options.dbPass != ""
            && typeof options.dbDialect != 'undefined' && options.dbDialect != "") {
             sequelize = new Sequelize(options.dbName, options.dbUser, options.dbPass, {
              host: options.dbHost,
              dialect: options.dbDialect,
              logging: false,
              define: {
                timestamps: false
              }
            });
            isDBPassed = true;
        }
        if(typeof options.tableName != 'undefined' && options.tableName != "") {
            tableName = options.tableName;
        }

        if(typeof options.trackLocation != 'undefined' && options.trackLocation != "") {
            trackLocation = options.trackLocation;
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

    if(!isApi && (ua!== undefined && typeof ua !== 'undefined' && ua!=null && ua!="null")) {
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
    
    if(ua!="" && ua!== undefined && typeof ua !== 'undefined' && ua!=null && ua!="null") {
        if (regex.test(ua.toLowerCase())) {
            // If DB Settings are passed and valid, then log the attack in DB
            if(isDBPassed && tableName!="NA") {
                var replacements = {ip: req.headers.host, query: req.url, type:"Bad Bot!", ua: ua, created_at : new Date()};
                var params = "ip_address, query, type, user_agent, created_at";
                var bindings = ":ip, :query, :type, :ua, :created_at";

                if(trackLocation) {
                    const geoinfo = geoip.lookup(req.ip);
                    if(typeof geoinfo != "undefined" && geoinfo!=null) {
                        replacements.city = geoinfo.city;
                        replacements.country = geoinfo.country;
                        replacements.latitude = geoinfo.ll[0];
                        replacements.longitude = geoinfo.ll[1];
                        replacements.timezone = geoinfo.timezone;
                        params = params+", city, country, latitude, longitude, timezone";
                        bindings = bindings+", :city, :country, :latitude, :longitude, :timezone";
                    }
                } 

                sequelize.query(
                    "INSERT INTO "+tableName+" ("+params+") values ("+bindings+")",
                    { 
                        replacements: replacements,
                        type: sequelize.QueryTypes.INSERT 
                    }
                ).then(function (clientInsertId) {
                    //Do Something if you need to do in callback!
                });
            }
            return res.status(401).send(blockMsg);
        }
        else return next();
    } else return next();
    
};

var tagBots = function (req, res, next) {
    var ua = req.get('User-Agent');
    if (regex.test(ua.toLowerCase())) req.isBot = true;
    else req.isBot = false;
    return next();
};