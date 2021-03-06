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
        module.exports.members = members;
        
        data = {};
        
        if (!!members.length)
            for (var member of members)
                process (member);
        else
            for (var i in members)
                process (members[i]);
                
        database.ref ('offices/').on ('value', function (snapshot)
        {
            var offices = snapshot.val().features;
            module.exports.offices = offices;
            
            for (var office of offices)
            {
                var rep = office.properties.rep;
                
                if (rep.chamber === 'SENATE')
                {
                    for (var state in data)
                    {
                        for (var senator of data[state])
                        {
                            if (senator.first_name === rep.first_name && senator.last_name === rep.last_name)
                            {
                                office.properties.rep = null;
                                
                                senator.offices = senator.offices || [];
                                senator.offices.push (office.properties);
                            }
                        }
                    }
                }
            }
            
            module.exports.data = data;
        });
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
    {
        member.offices = [];
        data[state].push (member);
    }
}


function getSenatorsByState (state, callback)
{
    callback (data[state]);
}


function getSenatorsByName (firstname, lastname, callback)
{
    var senators = [];
    
    for (var state in data)
    {
        for (var senator of data[state])
        {
            var match1 = -1;
            var match2 = -1;
            
            if (!!firstname)
            {
                if (!!senator.first_name && senator.first_name.toLowerCase().indexOf(firstname.toLowerCase()) !== -1)
                    match1 = 1;
                else
                    match1 = 0;
            }
                
            if (!!lastname)
            {
                if (!!senator.last_name && senator.last_name.toLowerCase().indexOf(lastname.toLowerCase()) !== -1)
                    match2 = 1;
                else
                    match2 = 0;
            }
            
            if (match1 * match2 !== 0 && match1 + match2 !== -2)
                senators.push (senator);
        }
    }
    
    callback (senators);
}


module.exports =
{
    getSenatorsByState: getSenatorsByState,
    getSenatorsByName:  getSenatorsByName
};


init ();





