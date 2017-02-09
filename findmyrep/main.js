var Database = require ('./database.js');
var Utils = require ('./utils.js');
var Config = require ('./config.js');
var namespace = 'findmyrep';


//-------------------------------------------------------------------------
//                            REQUEST HANDLER
//-------------------------------------------------------------------------


function handle (request, response)
{
    try
    {
        if (request.body && request.body.result && request.body.sessionId)
        {
            var result = request.body.result;
            var session = request.body.sessionId;
            
            switch (result.action)
            {
                case 'senators.find':
                    handleFindSenators (result, response);
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
    var result =
    {
        action: 'TEST',
        resolvedQuery: '',
        parameters:
        {
            state: 'Texas'
        }
    };
    
    handleFindSenators (result, response);
}


//-------------------------------------------------------------------------
//                            ACTION HANDLERS
//-------------------------------------------------------------------------


function handleFindSenators (result, response)
{
    var state = Utils.getParameterValue (result, 'state');
                    
    if (!state)
        state = Utils.getParameterValue (result, 'state1');
    
    if (!!state)
    {
        Database.getSenatorsByState (state, function (senators)
        {
            if (!!senators)
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
    else
    {
        var message = Utils.createTextMessage ('Please provide valid state!');
        response.json (Utils.createFulfillment (message));
        Utils.log (namespace, result.action, result.resolvedQuery, message.speech);
    }
}


function handleError (response, error)
{
    response.status(400).json ({status: {code: 400, errorType: error.message || error}});
    Utils.error (namespace, error.message || error);
}


//-------------------------------------------------------------------------
//                                HELPERS
//-------------------------------------------------------------------------


function createSenatorCard (data)
{
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


module.exports = {handle: handle, test: test};