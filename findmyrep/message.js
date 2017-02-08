var config = require ('./config.js');


var Message =
{
    State: function (state)
    {
        var message =
        {
            speech: 'Here are senators from ' + state + ':',
            type: 0
        }
        
        return message;
    },
    
    Senators: function (senators)
    {
        var createSenatorCard = function (data)
        {
            data.phone = !!data.phone ? '+1' + data.phone.replace(/\D+/g, '') : '+1';
            
            var card =
            {
                title: data.title,
                subtitle: data.subtitle,
                image_url: data.photo,
                buttons:
                [
                    {
                        title: 'Call senator',
                        type: 'phone_number',
                        payload: data.phone
                    },
                    {
                        title: 'Contact',
                        type: 'web_url',
                        url: data.contact
                    },
                    {
                        type: 'element_share'
                    }
                ]
            }
            
            return card;
        };
        
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
    },
    
    Fallback:
    {
        speech: 'Sorry, can\'t process this request!',
        type: 0
    }
};


module.exports = Message;