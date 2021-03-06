var Config = require ('./config.js');
var Database = require ('./database.js');
var Civic = require ('./civic.js');
var Utils = require ('./utils.js');

var namespace = 'findmyrep';


//-------------------------------------------------------------------------
//                            REQUEST HANDLER
//-------------------------------------------------------------------------


function handle (request, response)
{
    try
    {
        if (request.body && request.body.result)
        {
            var result = request.body.result;
            
            switch (result.action)
            {
                case 'senators.find':
                    handleFindSenators (result, response);
                    break;
                    
                case 'senators.call':
                    handleCallSenators (result, response);
                    break;
                    
                case 'representatives.find':
                    handleFindRepresentatives (result, response);
                    break;
                    
                case 'input.unknown':
                    handleUnknownInput (result, response);
                    break;
            }
        }
        else
        {
            handleError (response, 'Api.ai request body is missing or incomplete');
        }
    }
    catch (error)
    {
        handleError (response, error);
    }
}


function test (request, response)
{
    var result = {parameters: {firstname: 'Kirsten E.', lastname: 'Gillibrand'}};
    handleCallSenators (result, response);
}


//-------------------------------------------------------------------------
//                            ACTION HANDLERS
//-------------------------------------------------------------------------


function handleFindSenators (result, response)
{
    var state = Utils.getParameterValue (result, 'state');
    state = !!state ? state : Utils.getParameterValue (result, 'state1');
    var firstname = Utils.getParameterValue (result, 'firstname');
    var lastname = Utils.getParameterValue (result, 'lastname');
    
    if (!!state)
    {
        Database.getSenatorsByState (state, function (senators)
        {
            if (!!senators && senators.length > 0)
            {
                var params = senators[0] || {state_name: ''};
                var text = Utils.format (Config.data.template.senators.text, params);
                var message = Utils.createTextMessage (text);
                var cards = createSenatorsReply (senators);
                response.json (Utils.createFulfillment ([message, cards]));
                Utils.log (namespace, result.action, result.resolvedQuery, message.speech);
            }
            else
            {
                var message = Utils.createTextMessage ('Oops, seems like there is no senators in that state!');
                response.json (Utils.createFulfillment (message));
                Utils.log (namespace, result.action, result.resolvedQuery, message.speech);
            }
        });
    }
    else if (!!firstname || !!lastname)
    {
        Database.getSenatorsByName (firstname, lastname, function (senators)
        {
            if (!!senators && senators.length > 0)
            {
                var text = 'Here are senators you were looking for:';
                var message = Utils.createTextMessage (text);
                var cards = createSenatorsReply (senators);
                response.json (Utils.createFulfillment ([message, cards]));
                Utils.log (namespace, result.action, result.resolvedQuery, message.speech);
            }
            else
            {
                var message = Utils.createTextMessage ('Oops, seems like there are no senators with that name!');
                response.json (Utils.createFulfillment (message));
                Utils.log (namespace, result.action, result.resolvedQuery, message.speech);
            }
        });
    }
    else
    {
        var message = Utils.createTextMessage ('Please provide valid state or senator\'s name!');
        response.json (Utils.createFulfillment (message));
        Utils.log (namespace, result.action, result.resolvedQuery, message.speech);
    }
}


function handleCallSenators (result, response)
{
    var firstname = Utils.getParameterValue (result, 'firstname');
    var lastname = Utils.getParameterValue (result, 'lastname');
    
    if (!!firstname || !!lastname)
    {
        Database.getSenatorsByName (firstname, lastname, function (senators)
        {
            if (!!senators && senators.length > 0)
            {
                var senator = senators[0];
                
                if (!!senator.offices)
                {
                    var message = createSenatorOfficesReply (senator);
                    response.json (Utils.createFulfillment (message));
                    Utils.log (namespace, result.action, result.resolvedQuery, message.speech);
                }
                else
                {
                    var message = Utils.createTextMessage ('Oops, can\'t find offices data for this senator!');
                    response.json (Utils.createFulfillment (message));
                    Utils.log (namespace, result.action, result.resolvedQuery, message.speech);
                }
            }
            else
            {
                var message = Utils.createTextMessage ('Error: can\'t find senator with provided name');
                response.json (Utils.createFulfillment (message));
                Utils.log (namespace, result.action, result.resolvedQuery, message.speech);
            }
        });
    }
}


function handleFindRepresentatives (result, response)
{
    var address = Utils.getParameterValue (result, 'address');
    var lat = Utils.getParameterValue (result, 'lat', 'facebook_location');
    var long = Utils.getParameterValue (result, 'long', 'facebook_location');
    
    if (!!address || (!!lat && !!long))
    {
        if (!address)
            address = Utils.format ('@lat, @long', {lat: lat, long: long});
        
        Civic.getRepresentativesByAddress (address, function (representatives)
        {
            if (!!representatives && representatives.length > 0)
            {
                var text = 'Here are representatives in your administrative area:';
                var message = Utils.createTextMessage (text);
                var cards = createRepresentativesReply (representatives);
                response.json (Utils.createFulfillment ([message, cards]));
                Utils.log (namespace, result.action, result.resolvedQuery, message.speech);
            }
            else
            {
                var message = Utils.createTextMessage ('Oops, unfortunately we can\'t find representatives by provided address!');
                response.json (Utils.createFulfillment (message));
                Utils.log (namespace, result.action, result.resolvedQuery, message.speech);
            }
        });
    }
    else
    {
        var message = Utils.createTextMessage ('Please provide valid address!');
        response.json (Utils.createFulfillment (message));
        Utils.log (namespace, result.action, result.resolvedQuery, message.speech);
    }
}


function handleUnknownInput (result, response)
{
    var lat = Utils.getParameterValue (result, 'lat', 'facebook_location');
    var long = Utils.getParameterValue (result, 'long', 'facebook_location');
    
    if (!!lat && !!long)
        handleFindRepresentatives (result, response);
}


function handleError (response, error)
{
    response.status(400).json ({status: {code: 400, errorType: error.message || error}});
    Utils.error (namespace, error.message || error);
}


//-------------------------------------------------------------------------
//                                HELPERS
//-------------------------------------------------------------------------


function createSenatorCard (senator)
{
    var data = JSON.parse (JSON.stringify (senator));
    data.phone = !!data.phone ? '+1' + data.phone.replace(/\D+/g, '') : '+1';
    return Utils.format (Config.data.template.senators.card, data);
};


function createSenatorsReply (senators)
{
    var message =
    {
        payload:
        {
            facebook:
            {
                attachment:
                {
                    type: 'template',
                    payload:
                    {
                        template_type: 'generic',
                        elements: []
                    }
                }
            }
        },
        type: 4
    };
        
    for (var senator of senators)
        message.payload.facebook.attachment.payload.elements.push (createSenatorCard (senator));
            
    return message;
}


function createCallButton (office)
{
    var data = JSON.parse (JSON.stringify (office));
    data.phone = !!data.phone ? '+1' + data.phone.replace(/\D+/g, '') : '+1';
    return Utils.format (Config.data.template.senators.call_button, data);
}


function createSenatorOfficesReply (senator)
{
    var message =
    {
        payload:
        {
            facebook:
            {
                attachment:
                {
                    type: 'template',
                    payload:
                    {
                        template_type: 'button',
                        text: Utils.format (Config.data.template.senators.call_text, senator),
                        buttons: []
                    }
                }
            }
        },
        type: 4
    };
    
    var count = 0;
    for (var office of senator.offices)
    {
        if (count < 3)
        {
            message.payload.facebook.attachment.payload.buttons.push (createCallButton (office));
            count++;
        }
    }
            
    return message;
}


function createRepresentativeCard (representative)
{
    var card = Utils.format
    ({
        title: "@name",
        subtitle: "@party party",
        image_url: "@photo",
        buttons:
        [
            {
                title: "Call representative",
                type: "phone_number",
                payload: "@phone"
            },
            {
                title: "Visit website",
                type: "web_url",
                url: "@website"
            },
            {
                type: "element_share"
            }
        ]
    },
    {
        name:       representative.name,
        party:      representative.party,
        photo:      representative.photoUrl || 'https://call-my-reps.appspot.com/nophoto.png',
        phone:      (!!representative.phones && representative.phones.length > 0) ? '+1' + representative.phones[0].replace(/\D+/g, '') : '+1',
        website:    (!!representative.urls && representative.urls.length > 0) ? representative.urls[0] : 'https://www.whitehouse.gov/'
    });
    
    return card;
}


function createRepresentativesReply (representatives)
{
    var message =
    {
        payload:
        {
            facebook:
            {
                attachment:
                {
                    type: 'template',
                    payload:
                    {
                        template_type: 'generic',
                        elements: []
                    }
                }
            }
        },
        type: 4
    };
        
    for (var representative of representatives)
        message.payload.facebook.attachment.payload.elements.push (createRepresentativeCard (representative));
            
    return message;
}


module.exports = {handle: handle, test: test};