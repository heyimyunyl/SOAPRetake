const express = require("express");
const app = express();

const xmlparser = require('express-xml-bodyparser');
 
// .. other middleware ... 
app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(xmlparser());


var parser = require('fast-xml-parser');
var fs = require("fs");
var xml2js = require('xml2js');
const path = require("path");

const xmlParser = require("xml2json");
var json2xml = require("json2xml");

const xmlToJsonParser = require('fast-xml-parser');

// Generate a random token for the user
function generateToken() {
  var randomToken = require('random-token').create('abcdefghijklmnopqrstuvwxzyABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
  var token = randomToken(20);
  return token
}

// Store the user's token
var userToken = generateToken()

// Current time in epoch
function currentEpoch() {
  const now = Date.now()
  return now
}




// Send the URL Catalog to the client
app.post("/*/services/ECommerceSOAP", (req, res) => {

  // CheckDeviceStatus 
  if (req.body["soap-env:envelope"]["soap-env:body"][0]["ecs:checkdevicestatus"][0]) {
     
  // Get user's information for customized XML
  const deviceId = req.body["soap-env:envelope"]["soap-env:body"][0]["ecs:checkdevicestatus"][0]["ecs:deviceid"][0]
  // Get user's information for customized XML
  const messageId = req.body["soap-env:envelope"]["soap-env:body"][0]["ecs:checkdevicestatus"][0]["ecs:messageid"][0]
  
  // Read the XML
  const xmlData = fs.readFileSync("./ecs/ecommercesoap/checkdevicestatus.xml", "utf8");

  // Options for parsing the XML
  const options = {
    ignoreAttributes: false,
    ignoreNameSpace: false,
    parseNodeValue: true,
    parseAttributeValue: true,
    trimValues: true,
  };

    // Convert the XML to JSON
    const tObj = xmlToJsonParser.getTraversalObj(xmlData, options);
    const jsonObj = xmlToJsonParser.convertToJson(tObj, options);

    // Change XML index depending on the user
    jsonObj["soapenv:Envelope"]["soapenv:Body"]["CheckDeviceStatusResponse"]["MessageId"] = messageId
    jsonObj["soapenv:Envelope"]["soapenv:Body"]["CheckDeviceStatusResponse"]["DeviceId"] = deviceId
    jsonObj["soapenv:Envelope"]["soapenv:Body"]["CheckDeviceStatusResponse"]["TimeStamp"] = currentEpoch().toString()
      
    // Convert the JSON back to XML, credits to eol (https://stackoverflow.com/users/3761628/eol) for their help.
    const JsonToXmlParser = require("fast-xml-parser").j2xParser;
    const parser = new JsonToXmlParser({format: true, ignoreAttributes: false});
    const xml = `<?xml version="1.0" encoding="utf-8"?>\n${parser.parse(jsonObj)}`;

    // Set the response's type as application/xml
    res.type('application/xml');
    
    // Sending the completely edited XML back to the user
    res.send(xml)
  }
  
  
   // getEcConfig 
  else if (req.body["soap-env:envelope"]["soap-env:body"][0]["ecs:getecconfig"][0]) {
    
  // Get user's information for customized XML
  const deviceId = req.body["soap-env:envelope"]["soap-env:body"][0]["ecs:getecconfig"][0]["ecs:deviceid"][0]
  // Get user's information for customized XML
  const messageId = req.body["soap-env:envelope"]["soap-env:body"][0]["ecs:getecconfig"][0]["ecs:messageid"][0]
  
  // Read the XML
  const xmlData = fs.readFileSync("./ecs/ecommercesoap/getecconfigresponse.xml", "utf8");

  // Options for parsing the XML
  const options = {
    ignoreAttributes: false,
    ignoreNameSpace: false,
    parseNodeValue: true,
    parseAttributeValue: true,
    trimValues: true,
};

    // Convert the XML to JSON
    const tObj = xmlToJsonParser.getTraversalObj(xmlData, options);
    const jsonObj = xmlToJsonParser.convertToJson(tObj, options);

    // Change XML index depending on the user
    jsonObj["soapenv:Envelope"]["soapenv:Body"]["GetECConfigResponse"]["MessageId"] = messageId
    jsonObj["soapenv:Envelope"]["soapenv:Body"]["GetECConfigResponse"]["DeviceId"] = deviceId
    jsonObj["soapenv:Envelope"]["soapenv:Body"]["GetECConfigResponse"]["TimeStamp"] = currentEpoch().toString()
      
    // Convert the JSON back to XML, credits to eol (https://stackoverflow.com/users/3761628/eol) for their help.
    const JsonToXmlParser = require("fast-xml-parser").j2xParser;
    const parser = new JsonToXmlParser({format: true, ignoreAttributes: false});
    const xml = `<?xml version="1.0" encoding="utf-8"?>\n${parser.parse(jsonObj)}`;

    // Set the response's type as application/xml
    res.type('application/xml');
    
    // Sending the completely edited XML back to the user
    res.send(xml)
  }
  
    

  // If no body is given, send 403
  else {
  res.sendStatus(403)
  }
});






// Send the GetChallenge to the client
app.post("/*/services/IdentityAuthenticationSOAP", (req, res) => {
  // If the user bought something, this is where the stuff happens hehe
  
  // This is where things get a bit weird... Wii sends request to IdentityAuthenticationSOAP twice, once without deviceCert and once with it.
  // If the deviceCert is in, if it's in, it will send a different response.
  const deviceCert = req.body["soap-env:envelope"]["soap-env:body"][0]["ecs:purchasetitle"][0]["ecs:devicecert"][0]
  if (deviceCert) {
    
    
    // Getting the current message's ID
    const messageId = req.body["soap-env:envelope"]["soap-env:body"][0]["ecs:purchasetitle"][0]["ecs:messageid"]
    // Get the device ID
    const deviceId = req.body["soap-env:envelope"]["soap-env:body"][0]["ecs:purchasetitle"][0]["ecs:deviceid"]
    // Get the user's country
    const getCountry = req.body["soap-env:envelope"]["soap-env:body"][0]["ecs:purchasetitle"][0]["ecs:country"]
    // Get the user's country
    const accountId = req.body["soap-env:envelope"]["soap-env:body"][0]["ecs:purchasetitle"][0]["ecs:accountid"]
    // Get devicetoken
    const getDeviceToken = req.body["soap-env:envelope"]["soap-env:body"][0]["ecs:purchasetitle"][0]["ecs:accountid"]
    
    fs.readFile("./ecs/BuyItem.xml", function(err, data) {
    
    // Convert the XML to JSON
    const xmlObj = xmlParser.toJson(data, { object: true })
    
    // Change XML index depending on the user
    xmlObj["soapenv:Envelope"]["soapenv:Body"]["PurchaseTitleResponse"]["DeviceId"] = deviceId
    xmlObj["soapenv:Envelope"]["soapenv:Body"]["PurchaseTitleResponse"]["MessageId"] = messageId
    xmlObj["soapenv:Envelope"]["soapenv:Body"]["PurchaseTitleResponse"]["TimeStamp"] = currentEpoch().toString()
    
    // Convert the JSON to XML and finalize it
    const finalXml = xmlParser.toXml(xmlObj)
    
    // Set the response's type as application/xml
    res.type('application/xml');
    
    // Sending the completely edited XML back to the user
    res.send(finalXml)
  })
  }
  else {

  // This is where normal auth check happens

  // Getting the current message's ID
  const messageId = req.body["soap-env:envelope"]["soap-env:body"][0]["ias:getchallenge"][0]["ias:messageid"][0]
  // Get user's information for customized XML
  const deviceId = req.body["soap-env:envelope"]["soap-env:body"][0]["ias:getchallenge"][0]["ias:deviceid"][0]
  
  // Read the XML
  fs.readFile("./ecs/IdentityAuthenticationSOAP.xml", function(err, data) {
    
    // Convert the XML to JSON
    const xmlObj = xmlParser.toJson(data, { object: true })
    
    // Change XML index depending on the user
    xmlObj["soapenv:Envelope"]["soapenv:Body"]["GetChallengeResponse"]["DeviceId"] = deviceId
    xmlObj["soapenv:Envelope"]["soapenv:Body"]["GetChallengeResponse"]["MessageId"] = messageId
    xmlObj["soapenv:Envelope"]["soapenv:Body"]["GetChallengeResponse"]["TimeStamp"] = currentEpoch().toString()
    
    // Convert the JSON to XML and finalize it
    const finalXml = xmlParser.toXml(xmlObj)
    
    // Set the response's type as application/xml
    res.type('application/xml');
    
    // Sending the completely edited XML back to the user
    res.send(finalXml)
  })
}
});





// Send the SongDB (Catalog) to the client
app.post("/*/services/CatalogingSOAP", (req, res) => {
  
  // Getting the current message's ID
  const messageId = req.body["soap-env:envelope"]["soap-env:body"][0]["ias:getchallenge"][0]["ias:messageId"][0]
  // Getting the game's titleId
  const getTitleId = req.body["soap-env:envelope"]["soap-env:body"][0]["cas:listcontentsetsex"][0]["cas:applicationid"][0]
  
  // if the titleId of the requested game equals ..., send that game's specialized songdb back.
  // Just Dance 2015
  if (getTitleId === "0001000053453345" || "0001000053453350") {

  // Get user's information for customized XML
  const deviceId = req.body["soap-env:envelope"]["soap-env:body"][0]["cas:listcontentsetsex"][0]["cas:deviceid"][0]
  
  // Read the XML
  fs.readFile("./files/jd2015_songdb.xml", function(err, data) {
    
    // Convert the XML to JSON
    const xmlObj = xmlParser.toJson(data, { object: true })
    
    // Change XML index depending on the user
    xmlObj["soapenv:Envelope"]["soapenv:Body"]["ListContentSetsExResponse"]["DeviceId"] = deviceId
    xmlObj["soapenv:Envelope"]["soapenv:Body"]["GetChallengeResponse"]["MessageId"] = messageId
    xmlObj["soapenv:Envelope"]["soapenv:Body"]["ListContentSetsExResponse"]["TimeStamp"] = currentEpoch().toString()
    
    // Convert the JSON to XML and finalize it
    const finalXml = xmlParser.toXml(xmlObj)
    
    // Set the response's type as application/xml
    res.type('application/xml');
    
    // Sending the completely edited XML back to the user
    res.send(finalXml)
  })} 
  // If no body is given, send 502
  else {
  res.sendStatus(403)
}});




app.get("/*", (req, res) => {
  res.sendStatus(403)
});




const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
