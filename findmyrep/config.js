var config =
{
    template:
    {
        senators:
        {
            text: "Here are senators from @state_name:",
            card:
            {
                title: "@title",
                subtitle: "@subtitle",
                image_url: "@photo",
                buttons:
                [
                    {
                        title: "Call senator",
                        type: "phone_number",
                        payload: "@phone"
                    },
                    {
                        title: "Contact",
                        type: "web_url",
                        url: "@contact"
                    },
                    {
                        type: "element_share"
                    }
                ]
            }
        }
    }
};


var data = JSON.parse (JSON.stringify (config));


function update (newconfig)
{
    if (!!newconfig)
        data = JSON.parse (JSON.stringify (newconfig));
    else
        data = JSON.parse (JSON.stringify (config));
        
    module.exports.data = data;
}


module.exports =
{
    data:   data,
    update: update
};