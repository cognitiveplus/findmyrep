//-------------------------------------------------------------------------
//                              ENTRY POINT
//-------------------------------------------------------------------------


var express = require ('express');
var parser = require ('body-parser');
var findmyrep = require ('./findmyrep/main.js');


var server = express ();
server.use (parser.json());
server.post ('/', findmyrep.handle);
//server.get ('/', findmyrep.test);


server.listen (process.env.PORT || 8080, function ()
{
    console.log ('>> Server listening');
    console.log ('-------------------------------');
});