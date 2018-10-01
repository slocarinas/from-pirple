/*
 * Primary file for API
 * 
 */

// Dependencies
var http = require("http");
var https = require("https");
var url = require("url");
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');
var fs = require("fs");

// Instantiate the HTTP server
var httpServer = http.createServer(function(req, res){
    unifiedServer(req, res);

});

httpServer.listen(config.httpPort, function(){
    console.log("The server is listening to port: " + config.httpPort + " in " + config.envName );
});

// Instantiate the HTTPS server
var httpsServerOptions = {
    'key' : fs.readFileSync('./https/key.pem'),
    'cert' : fs.readFileSync('./https/cert.pem')
};

var httpsServer = https.createServer(httpsServerOptions, function(req, res){
    unifiedServer(req, res);

});

httpsServer.listen(config.httpaPort, function(){
    console.log("The server is listening to port: " + config.httpsPort + " in " + config.envName );
});

// All the server logic for both http and https server
var unifiedServer = function(req, res) {

    // Get the url and parse it
    var parsedURL = url.parse(req.url, true);

    // Get the path
    var path = parsedURL.path;
    var trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // Get querystring as an object
    var queryStringObject = parsedURL.query;

    // Get the HTTP Method
    var method = req.method.toLowerCase();

    // Get the headers as an object
    var headers = req.headers; 

    // Get the payload, if any
    var decoder = new StringDecoder('utf-8');
    var buffer = '';

    req.on('data', function(data){
        buffer += decoder.write(data);
    });

    req.on('end', function(){
        buffer += decoder.end();

        // Choose the handler that this request should go to. 
        var chosenRouter = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

        // Construct the data object to send to the handler
        var data = {
            'trimmedPath' : trimmedPath,
            'queryStringObject' : queryStringObject,
            'method' : method,
            'headers' : headers,
            'payload' : buffer

        };

        // Route the request to the handler specified in the router
        chosenRouter(data, function(statusCode, payload){
            // use the status code called back by the handler or default to 200
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
            
            //  user the payload called back by the handler or defaul to empty object
            payload = typeof(payload) == 'object' ? payload : {};

            // Convert the payload to string
            var payloadString = JSON.stringify(payload); 

            // Return the reposnse
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);

            console.log('Returning this response: ', statusCode, payloadString);
            
         });


        // Send the response
        //res.end("Hello World!");

        // Log the request path
        //console.log('Request received on path: ' + trimmedPath + ' using HTTP method ' + method + ' with querystrings ', queryStringObject);
        //console.log('Request received with these headers ', headers);
        //console.log('Request received with this payload: ', buffer);
 
    });

};


// Define the handlers
var handlers = {};

// Sample handler
handlers.sample = function(data, callback){
    // callback an http status code and payload object
    callback(406, {'name':'sample handler'});
};

// Not found handler 
handlers.notFound = function(data, callback){
    callback(404);

};

// Define request  router
var router = {
    'sample' : handlers.sample
}