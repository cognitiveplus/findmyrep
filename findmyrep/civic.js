var https = require ('https');
var Utils = require ('./utils.js');


var url = 'https://www.googleapis.com/civicinfo/v2/representatives?key=@key&address=@address&levels=@levels&roles=@roles';
var key = 'AIzaSyDgMISCaOd_lmkVzoKSDRy5EaoPQozARvQ';
var levels = 'country';
var roles = 'legislatorLowerBody';


function getRepresentativesByAddress (address, callback)
{
    var endpoint = Utils.format (url, {key: key, address: address, levels: levels, roles: roles});
    
    https.get (endpoint, function (res)
    {
        var data = '';
        
        res.on ('data', function (chunk)
        {
            data += chunk;
        });
        
        res.on ('end', function ()
        {
            var result = JSON.parse (data);
            
            if (!!result.officials)
                callback (result.officials);
            else
                callback (null);
        });
    });
}


module.exports =
{
    getRepresentativesByAddress: getRepresentativesByAddress
};