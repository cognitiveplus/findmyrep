var Firebase = require ('firebase');
var Config = require ('./config.js');


Firebase.initializeApp
({
    databaseURL: 'https://call-my-reps.firebaseio.com',
    apiKey: 'cEklHvFUOT6pukLp9KK33eAPAd8GLfhe9yOSB792'
});


var database = Firebase.database();
var data = {};


function init ()
{
    database.ref ('members/').on ('value', function (snapshot)
    {
        var members = snapshot.val();
        data = {};
        
        if (!!members.length)
            for (var member of members)
                process (member);
        else
            for (var i in members)
                process (members[i]);
    });
    
    database.ref ('config/').on ('value', function (snapshot)
    {
        Config.update (snapshot.val());
    });
}


function process (member)
{
    var state = member.state_name;
        
    data[state] = data[state] || [];
    
    if (!!member.title && !!member.subtitle)
        data[state].push (member);
}


function getSenatorsByState (state, callback)
{
    callback (data[state]);
}


module.exports =
{
    getSenatorsByState: getSenatorsByState
};


init ();





