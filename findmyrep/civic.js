var https = require ('https');
var Utils = require ('./utils.js');


var url = 'https://www.googleapis.com/civicinfo/v2/representatives?key=@key&address=@address&levels=@levels';
var key = 'AIzaSyDgMISCaOd_lmkVzoKSDRy5EaoPQozARvQ';
var levels = 'administrativeArea1';


function getRepresentativesByAddress (address, callback)
{
    url = Utils.format (url, {key: key, address: address, levels: levels});
    
    https.request (url, function (res)
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
    })
    .end();
}


module.exports =
{
    getRepresentativesByAddress: getRepresentativesByAddress
};