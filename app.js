//-------------------------------------------------------------------------
//                              ENTRY POINT
//-------------------------------------------------------------------------


var express = require ('express');
var parser = require ('body-parser');
var findmyrep = require ('./findmyrep/main.js');


var server = express ();
server.use (parser.json());
server.post ('/findmyrep', findmyrep.handle);
server.get ('/findmyrep', findmyrep.handle);


server.listen (process.env.PORT || 5000, function ()
{
    console.log ('>> Server listening');
    console.log ('-------------------------------');
});