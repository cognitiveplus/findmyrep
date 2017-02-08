function createFulfillment (message, newContext, killContext)
{
    var fulfillment =
    {
        messages: !!message.length ? message : [message],
        contextOut: [],
        source: 'webhook'
    };
    
    if (!!fulfillment.messages[0].speech)
        fulfillment.speech = fulfillment.messages[0].speech;
        
    if (!!newContext)
        fulfillment.contextOut.push ({name: newContext, lifespan: 1});
        
    if (!!killContext)
        fulfillment.contextOut.push ({name: killContext, lifespan: 0});
        
    // TODO: check for resetcontext
    
    return fulfillment;
}


function createTextMessage (text)
{
    return {speech: text, type: 0};
}


function getParameterValue (result, param, context)
{
    var value = null;
    
    if (!context)
    {
        if (!!result.parameters && !!result.parameters[param])
            value = result.parameters[param];
    }
    else
    {
        if (!!result.contexts)
            for (var ctx of result.contexts)
                if (ctx.name === context && !!ctx.parameters[param])
                    value = ctx.parameters[param];
    }
        
    return value;
}


function format (input, params)
{
    var output = JSON.parse (JSON.stringify (input))
    
    if (typeof input === 'object')
    {
        if (!!output.length)
        {
            for (var i = 0; i < output.length; i++)
                output[i] = format (output[i], params);
        }
        else
        {
            for (var i in output)
                output[i] = format (output[i], params);
        }
    }
    else if (typeof input === 'string')
    {
        for (var id in params)
            if ((typeof params[id] === 'string' || typeof params[id] === 'number') && output.indexOf ('@' + id) >= 0)
                output  = output.replace ('@' + id, params[id].toString());
    }
        
    return output;
}


function log (namespace, action, query, reply)
{
    console.log (namespace + ' >> ' + action + ': ' + query + ' | ' + reply);
}


function error (namespace, error)
{
    console.error (namespace + ' >> ERROR: ' + error);
}


function checkEmailValid (email)
{
    var result = false;
    
    if (email.indexOf ('@') > 0 && email.indexOf ('.') > 0)
        result = true;
        
    return result;
}


module.exports =
{
    createFulfillment:  createFulfillment,
    createTextMessage:  createTextMessage,
    getParameterValue:  getParameterValue,
    checkEmailValid:    checkEmailValid,
    format:             format,
    log:                log,
    error:              error
};