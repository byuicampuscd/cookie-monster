module.exports = (function () {
    const fs = require("fs");
    var CookieMonster = function () {};
    var proto = CookieMonster.prototype;
    /**
      * Gets an authentication cookie from the specified parameters.
      * @param {Object } userInfo - The users login credentials:
        {
            username:{
                value:val,
                selector: sel
            }, password:{
                value:val,
                selector: sel
            },
            submit: sel
            }
        * @param {Object} links = Links for login:
        {
            success:link, 
            failure:link, 
            login: link
    
        }
        
    */
    proto.getAuthenticationCookie = function (userInfo, links, callback, debug) {
        function extractCookie(nightmare, done) {
            nightmare.cookies.get()
                .then(function (cookie) {

                    done(null, cookie);
                    endProcess(nightmare);
                })
                .catch(function (err) {
                    done("Failed to extract the cookie", null);
                    endProcess(nightmare);
                });
        }
        var Nightmare = require('nightmare'),
            nightmare,
            nightmarePrefs = {
                width: 952,
                height: 545,
                typeInterval: 20,
                alwaysOnTop: false,
                waitTimeout: 20 * 60 * 1000,
            };
        if (debug) {
            nightmarePrefs.show = true;
            nightmarePrefs.openDevTools = {
                mode: 'detach'
            };
        }
        require('nightmare-helpers')(Nightmare);
        nightmare = Nightmare(nightmarePrefs);
        nightmare
            .goto(links.login)
            .wait(100)
            .type(userInfo.username.selector, userInfo.username.value)
            .type(userInfo.password.selector, userInfo.password.value)
            .click(userInfo.submit)
            .wait(1000)
            .wait(function (links) {
                return window.location.href === links.failure || window.location.href === links.success;
            }, links)
            .wait(1000)
            .evaluate(function () {
                var current = (window.location.href);
                return current;
            })
            .then(function (url) {
                if (url === links.failure) {
                    callback("Failed to authenticate user :(", null);
                    endProcess(nightmare);
                    return;
                }
                extractCookie(nightmare, callback);
            })
            .catch(function (error) {
                callback("An error has occured :(", null);
                nightmare.end();
            });
    }
    
    /**
     * Prompts for the user data. When an exisitng data object is provided it will not prompt for it.
     * @param {Function} callback - Function to run once the user data has been retrieved. It passes the userInfo object as the first parameter;
     * @param {Object} existingData (optional) - an existing userData object  
     */
    proto.promptUserInfo = function (callback, existingData) {
        const prompt = require("prompt");
        var schema = {
            properties: {}
        };

        if (!existingData || existingData.indexOf("userData.username.value") >= 0 ){
            schema.properties.name = {
                description: "Enter Username",
                required: true
            }
        }
        if (!existingData || existingData.indexOf("userData.password.value")  >= 0){
            schema.properties.password = {
                description: "Enter Password",
                hidden: true,
                replace: "*",
                required: true
            }
        }

        if (!existingData || existingData.indexOf("userData.username.selector") >= 0) {
            schema.properties.userSelector = {
                description: "Enter Username Selector",
                required: true
            }
        }
        if (!existingData || existingData.indexOf("userData.password.selector") >= 0) {
            schema.properties.passwordSelector = {
                description: "Enter Password Selector",
                required: true
            }
        }
        prompt.start();
        prompt.get(schema, function (err, result) {
            if (err) throw err;
            var usrObj = {
                username: {
                    value: result.name || "",
                    selector: result.userSelector || ""
                },
                password: {
                    value: result.password || "",
                    selector: result.passwordSelector || ""
                }
            }
            callback(null, usrObj);
        });
    }

    /**
     * Prompts for the links data. When exisitng data is provided it will not prompt for it.
     * @param {Function} callback - Function to run once the links have been retrieved. It passes the links object as the first parameter;
     * @param {Object} existingData (optional) - an existing links object 
     */
    proto.promptLinkInfo = function (callback, existingData) {
        const prompt = require("prompt");
        var schema = {
            properties: {}
        };

        if (!existingData || existingData.indexOf("links.login") >= 0)
            schema.properties.login = {
                description: "Enter Login Link",
                required: true
            }
        if (!existingData || existingData.indexOf("links.success") >= 0)
            schema.properties.success = {
                description: "Enter Success Link",
                required: true
            }

        if (!existingData || existingData.indexOf("links.failure") >= 0)
            schema.properties.failure = {
                description: "Enter Failure Link:",
                required: true
            }
        prompt.start();
        prompt.get(schema, function (err, result) {
            if (err){
                callback(err, null);
                return;
            }
            var links = {
                login: result.login || "",
                success: result.success || "",
                failure: result.failure || "",
            }
            callback(null, links);
        });
    }

    /**
      * Parses a multi-level key
      * @param {String} multiLevelKey - a deep reference of an object. Ex: ("object.sub.item")
      * @param {Object} object - the object to extract the deep refence value.
      * @returns {Object} - the value from the deep reference.
      */
    function getValueFromKey(multilevelKey, object){
        var levels = multilevelKey.split(".");
        var newObj = object
        levels.forEach(function(item, index){
            newObj = newObj[item];
        });
        return newObj;
    }
    
    /** 
      * Finds missing keys within  an object
      * @param {Object} object - The object to check
      * @param {Object} framework - The reference object,
      * @param {Object[]} missing - array of missing keys
      * @param {String} parent - the higher object level
      */
    function matchProcess(object, framework, missing = [], parent = "") {
        // console.log("Iterate: ",missing)
        var found = true;
        for (var i in framework) {
            var ofound = findInObjet(i, object);
            if (!ofound) {
                found = false;
                missing.push((parent !== "") ? parent + "." + i : i);
            }
            if (typeof framework[i] === "object") {
                matchProcess(object, framework[i], missing, (parent !== "") ? parent + "." + i : i);
            }
        }
        return missing;
    }
    /**
      * Checks if a key is within the layers of an object
      * @param {Object} item - item to find
      * @param {Object} object - object to find the item in
      * @param {boolean} found - was the item found in the object
      */
    function findInObjet(item, object) {
        var found = false;
        for (var i in object) {
            if (item === i && object[i] !== "") {
                found = true;
                break;
            }
            if (typeof object[i] === "object") {
                found = findInObjet(item, object[i]);
                if (found)
                    break;
            }
        }
        return found;
    }
    /**
     * Grabs a copy of the authentication framework
     * @returns {Object} - the authentication framework.
     */
    proto.getFramework = function () {
        var framework = {
            userData: {
                username: {
                    value: "",
                    selector: ""
                },
                password: {
                    value: "",
                    selector: ""
                },
                submit:""
            },
            links: {
                login: "",
                success: "",
                failure: ""
            }
        };
        return framework;
    }

    /**
     * Saves template json file
     * @param {String} file - the path to save the framework.
     */
    proto.saveFrameworkTemplate = function (file) {
        const fs = require('fs');
        if (file)
            fs.writeFile(file, JSON.stringify(this.getFramework()), function (err) {
                if (err) throw err;
                console.log("Framework Saved!");
            });
        else
            console.log(JSON.stringify(this.getFramework()));
    }

    /**
     * Reads a json file and finds the data needed for authentication. If it finds missing authentication data, it will throw an array of the missing authentication data parameters.
     * @param {String} file - Path to authentication file.
     * @param {Function} callback - Function to call once the object has been read. It will pass the keys of missing objects as the first parameter and the authentication object as the second parameter.
     */
    proto.getAuthFromJSONFile = function (file, callback) {
        var that = this;
        fs.readFile(file, function (err, data) {
            if (err) {
                callback(err, null);
                return;
            };
            var jsonData = JSON.parse(data);
            var errs = [];
            var missing = matchProcess(jsonData, that.getFramework());

            if (missing.length > 0) {
                callback(missing, null);
                return;
            }
            callback(null, jsonData);
        });
    }
    /**
     * Merges two related objects together
     * @param {Object} templateObject - the object to modify 
     * @param {Object} fillerObject - the object with filler values
     * @returns {Object} - the filled template object
     */
    function fillGaps(templateObject, fillerObject){
        if(!templateObject)
            templateObject = {};
        if(!fillerObject)
            return templateObject;
        
        for(var i in fillerObject){
            if(!templateObject[i] || templateObject[i] === ""){
                templateObject[i] = fillerObject[i];
            }
            else if(typeof templateObject[i] === "object")
                templateObject[i] = fillGaps(templateObject[i],fillerObject[i]);
        }
        
        return templateObject;
    }
    /**
     * Goes through an authentication file and prompts for the missing values.
     * @param {String} file - the path to the authentication file. 
     * @param {Function} callback - the function to run when the data has been filled. IT passes the authentication object as the first parameter.
     */
    proto.promptMissingFromFile = function(file, callback){
        var that = this;
        
        //finds missing parameters
        function promptMissing(missing, jsonData){
            console.log("Prompting Data...");
            var links = [],
                userData = [];
            missing.forEach(function(item){
                if(item.match(/userdata/gi))
                    userData.push(item)
                if(item.match(/link/gi))
                    links.push(item);
            });
            //prompts for the missing links 
            function promptLinks(){
                that.promptLinkInfo(function(err, data){
                    if(err){
                        callback(err, null);
                        return;
                    }
                    jsonData.links = fillGaps(jsonData.links, data);
                    console.log("finished processing...");
                    //returns completed json data
                    callback(null, jsonData);
                }, links);
            }
            if(userData.length >= 0){
                // promtps for the missing user info
                that.promptUserInfo(function(err, data){
                    if(err){
                        callback(err, null);
                        return;
                    }
                    jsonData.userData = (fillGaps(jsonData.userData, data));
                    promptLinks();    
                }, userData);  
            }else if(links.length >= 0)
                promptLinks();
            //console.log(userData, links);
        }
        // reads json file |START|
        fs.readFile(file, function(err, data){
            if(err){
                callback(err, null);
                return;
            }
            var jsonData = JSON.parse(data);
            that.getAuthFromJSONFile(file, function(err, data){
               if(err){
                   //if parameters are missing
                   if(err.length)
                       promptMissing(err, jsonData);
                   else{
                       callback(err, null)
                   }
                return;
               }
              //nothing is missing! 
              callback(null, jsonData);
                
            });
        });
    }
    /**
      *kills nightmare process
      */
    function endProcess(nightmare) {
        nightmare.end().then(function () {

        }).catch(function (err) {
            if (err) throw err;
        });
    }
    return CookieMonster;
}());
// LIBRARY TESTS
/*var cookieMonster = new module.exports();
//cookieMonster.saveFrameworkTemplate("./auth.json");
cookieMonster.promptMissingFromFile("./auth.json", function (err, authdata) {
    if (err) {
        if (err.length)
            err.forEach(function (item) {
                console.log(`ERR: JSON data is missing the parameter "${item}"`);
            });
        else
            console.log(err);
        return;
    }
    console.log(authdata);
});*/
