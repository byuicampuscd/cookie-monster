#! /usr/bin/env node

var CookieMonster = require("./cookiemonster");
const fs = require('fs');
var cookie = new CookieMonster();
var args = process.argv.splice(2, process.argv.length - 2);
var DEVMODE = false;
if (args[args.length - 1] === "--dev") {
    DEVMODE = true;
    args.splice(args.length - 1, 1);
    console.log(args);
}

if (args[0] === "--save" || args[0] === "-s") {
    args.shift();
    var filename = args.shift();
    cookie.saveFrameworkTemplate(filename);
}
if (args[0] === "--extract" || args[0] === "-e") {
    args.shift();
    if (args[0] === "--file" || args[0] === "-f") {
        args.shift();
        var filename = args.shift();
        cookie.promptMissingFromFile(filename, function (err, authData) {
            if (err) {
                if (err.length)
                    err.forEach(function (item) {
                        console.log(`ERR: JSON data is missing the parameter "${item}"`);
                    });
                else
                    console.log(err);
                return;
            }
            cookie.getAuthenticationCookie(authdata.userData, authdata.links, function (err, authCookie) {
                if (err) {
                    console.log(err);
                    return;
                }
                if(args[0] === "--save" || args[0] === "-s"){
                    args.shift();
                    fs.writeFile(args.shift(),authCookie, function(err){
                       if(err) throw err;
                        console.log("Cookie saved to file ", filename);
                    });
                }else
                    console.log(authCookie);
            }, DEVMODE);
        });
    }
}