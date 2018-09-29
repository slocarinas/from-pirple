
// Dependencies
var http = require("http");
var url = require("url");

// The server should reposnd to all requests with a string
var server = http.createServer(function(req, res){

    // Get the url and parse it
    var parsedURL = url.parse(req.url, true);

    // Get the path
    var path = parsedURL.path;
    var trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // Send the response
    res.end("Hello World!");

    // Log the request path
    console.log('Request received on path: ' + trimmedPath);
});

server.listen(3000, function(){
    console.log("The server is listening to port 3000 now.");
});