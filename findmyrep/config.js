var config =
{
    template:
    {
        senators:
        {
            text: "Here are the senators from @state_name:",
            card:
            {
                title: "@title",
                subtitle: "@subtitle",
                image_url: "@photo",
                buttons:
                [
                    {
                        title: "Call this senator",
                        type: "postback",
                        payload: "Call @first_name @last_name"
                    },
                    {
                        title: "Contact via web",
                        type: "web_url",
                        url: "@contact"
                    },
                    {
                        type: "element_share"
                    }
                ]
            },
            call_text: "Please select the office to call @first_name @last_name:",
            call_button:
            {
                title: "@city, @state_code",
                type: "phone_number",
                payload: "@phone"
            }
        }
    }
};


var data = JSON.parse (JSON.stringify (config));


function update (newconfig)
{
    /*if (!!newconfig)
        data = JSON.parse (JSON.stringify (newconfig));
    else
        data = JSON.parse (JSON.stringify (config));
        
    module.exports.data = data;*/
}


module.exports =
{
    data:   data,
    update: update
};