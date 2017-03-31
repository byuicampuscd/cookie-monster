## Cookie Extraction Example
```javascript
var cookieMonster = require('cookiemonster');

//gets authenticatin data
cookieMonster.promptMissingFromFile("./auth.json", function (err, authdata) {
    //checks for missing fields
    if (err) {
        if (err.length)
            err.forEach(function (item) {
                console.log(`ERR: JSON data is missing the parameter "${item}"`);
            });
        else
            console.log(err);
        return;
    }
    //grabs cookie using authentication data 
    cookieMonster.getAuthenticationCookie(authdata.userData, authdata.links, function(err,cookie){
        if(err){
            console.log(err);
            return;
        }
        console.log(cookie);
    }, true);
    // do something with cookie
    console.log(authdata);
});
```
##Authentication Data Framework
```javascript
{
    "userData": {
        "username": {
            "value": "",
            "selector": ""
        },
        "password": {
            "value": "",
            "selector": ""
        },
        "submit": ""
    },
    "links": {
        "login": "",
        "success": "",
        "failure": ""
    }
}
```
## CLI Usage
Saving an autentication framework file.
```
cmonster (--save | -s) filename

``` 
To extract a cookie using the authentication file and save it to another file.
```
cmonster (--extract | -e) (--file | -f) ./auth.json (--save |-s) cookie.json

```

Append the dev flag to the end to enable development mode.
```
--dev
```
## Functions

<dl>
<dt><a href="#getAuthenticationCookie">getAuthenticationCookie(userInfo, links)</a></dt>
<dd><p>Gets an authentication cookie from the specified parameters.</p>
</dd>
<dt><a href="#promptUserInfo">promptUserInfo(callback, existingData)</a></dt>
<dd><p>Prompts for the user data. When an exisitng data object is provided it will not prompt for it.</p>
</dd>
<dt><a href="#promptLinkInfo">promptLinkInfo(callback, existingData)</a></dt>
<dd><p>Prompts for the links data. When exisitng data is provided it will not prompt for it.</p>
</dd>
<dt><a href="#getValueFromKey">getValueFromKey(multiLevelKey, object)</a> ⇒ <code>Object</code></dt>
<dd><p>Parses a multi-level key</p>
</dd>
<dt><a href="#matchProcess">matchProcess(object, framework, missing, parent)</a></dt>
<dd><p>Finds missing keys within  an object</p>
</dd>
<dt><a href="#findInObjet">findInObjet(item, object, found)</a></dt>
<dd><p>Checks if a key is within the layers of an object</p>
</dd>
<dt><a href="#getFramework">getFramework()</a> ⇒ <code>Object</code></dt>
<dd><p>Grabs a copy of the authentication framework</p>
</dd>
<dt><a href="#saveFrameworkTemplate">saveFrameworkTemplate(file)</a></dt>
<dd><p>Saves template json file</p>
</dd>
<dt><a href="#getAuthFromJSONFile">getAuthFromJSONFile(file, callback)</a></dt>
<dd><p>Reads a json file and finds the data needed for authentication. If it finds missing authentication data, it will throw an array of the missing authentication data parameters.</p>
</dd>
<dt><a href="#fillGaps">fillGaps(templateObject, fillerObject)</a> ⇒ <code>Object</code></dt>
<dd><p>Merges two related objects together</p>
</dd>
<dt><a href="#promptMissingFromFile">promptMissingFromFile(file, callback)</a></dt>
<dd><p>Goes through an authentication file and prompts for the missing values.</p>
</dd>
<dt><a href="#endProcess">endProcess()</a></dt>
<dd><p>kills nightmare process</p>
</dd>
</dl>

<a name="getAuthenticationCookie"></a>

## getAuthenticationCookie(userInfo, links)
Gets an authentication cookie from the specified parameters.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| userInfo | <code>Object</code> | The users login credentials:         {             username:{                 value:val,                 selector: sel             }, password:{                 value:val,                 selector: sel             },             submit: sel             } |
| links | <code>Object</code> | = Links for login:         {             success:link,              failure:link,              login: link              } |

<a name="promptUserInfo"></a>

## promptUserInfo(callback, existingData)
Prompts for the user data. When an exisitng data object is provided it will not prompt for it.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>function</code> | Function to run once the user data has been retrieved. It passes the userInfo object as the first parameter; |
| existingData | <code>Object</code> | (optional) - an existing userData object |

<a name="promptLinkInfo"></a>

## promptLinkInfo(callback, existingData)
Prompts for the links data. When exisitng data is provided it will not prompt for it.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>function</code> | Function to run once the links have been retrieved. It passes the links object as the first parameter; |
| existingData | <code>Object</code> | (optional) - an existing links object |

<a name="getValueFromKey"></a>

## getValueFromKey(multiLevelKey, object) ⇒ <code>Object</code>
Parses a multi-level key

**Kind**: global function  
**Returns**: <code>Object</code> - - the value from the deep reference.  

| Param | Type | Description |
| --- | --- | --- |
| multiLevelKey | <code>String</code> | a deep reference of an object. Ex: ("object.sub.item") |
| object | <code>Object</code> | the object to extract the deep refence value. |

<a name="matchProcess"></a>

## matchProcess(object, framework, missing, parent)
Finds missing keys within  an object

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| object | <code>Object</code> | The object to check |
| framework | <code>Object</code> | The reference object, |
| missing | <code>Array.&lt;Object&gt;</code> | array of missing keys |
| parent | <code>String</code> | the higher object level |

<a name="findInObjet"></a>

## findInObjet(item, object, found)
Checks if a key is within the layers of an object

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| item | <code>Object</code> | item to find |
| object | <code>Object</code> | object to find the item in |
| found | <code>boolean</code> | was the item found in the object |

<a name="getFramework"></a>

## getFramework() ⇒ <code>Object</code>
Grabs a copy of the authentication framework

**Kind**: global function  
**Returns**: <code>Object</code> - - the authentication framework.  
<a name="saveFrameworkTemplate"></a>

## saveFrameworkTemplate(file)
Saves template json file

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| file | <code>String</code> | the path to save the framework. |

<a name="getAuthFromJSONFile"></a>

## getAuthFromJSONFile(file, callback)
Reads a json file and finds the data needed for authentication. If it finds missing authentication data, it will throw an array of the missing authentication data parameters.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| file | <code>String</code> | Path to authentication file. |
| callback | <code>function</code> | Function to call once the object has been read. It will pass the keys of missing objects as the first parameter and the authentication object as the second parameter. |

<a name="fillGaps"></a>

## fillGaps(templateObject, fillerObject) ⇒ <code>Object</code>
Merges two related objects together

**Kind**: global function  
**Returns**: <code>Object</code> - - the filled template object  

| Param | Type | Description |
| --- | --- | --- |
| templateObject | <code>Object</code> | the object to modify |
| fillerObject | <code>Object</code> | the object with filler values |

<a name="promptMissingFromFile"></a>

## promptMissingFromFile(file, callback)
Goes through an authentication file and prompts for the missing values.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| file | <code>String</code> | the path to the authentication file. |
| callback | <code>function</code> | the function to run when the data has been filled. IT passes the authentication object as the first parameter. |

<a name="endProcess"></a>

## endProcess()
kills nightmare process

**Kind**: global function  
